---
slug: /guides/developer/deduplication
sidebar_label: '重複排除戦略'
sidebar_position: 3
description: 'upsert、update、delete を頻繁に実行する必要がある場合に、重複排除を利用します。'
title: '重複排除戦略'
keywords: ['重複排除戦略', 'データ重複排除', 'upsert', 'update と delete', '開発者ガイド']
doc_type: 'guide'
---

import deduplication from '@site/static/images/guides/developer/de_duplication.png';
import Image from '@theme/IdealImage';


# 重複排除の戦略

**重複排除（Deduplication）** とは、***データセットから重複した行を取り除く*** プロセスを指します。OLTP データベースでは、各行が一意のプライマリキーを持つため、これは容易に実現できますが、その代償として挿入処理が遅くなります。挿入される各行について、まずその行が既に存在しないかを検索し、見つかった場合は既存の行を置き換える必要があるためです。

ClickHouse はデータ挿入の高速性を重視して設計されています。ストレージファイルは不変であり、ClickHouse は行を挿入する前に既存のプライマリキーをチェックしないため、重複排除には多少の工夫が必要になります。これはまた、重複排除が即時には行われず、**最終的に** 行われることを意味し、その結果としていくつかの副作用があります：

- 任意の時点で、テーブルには依然として重複行（同じソートキーを持つ行）が存在し得る
- 実際の重複行の削除は、パーツのマージ処理の際に行われる
- クエリは重複が存在する可能性を考慮しておく必要がある

<div class='transparent-table'>

|||
|------|----|
|<Image img={deduplication}  alt="重複排除のロゴ" size="sm"/>|ClickHouse は重複排除やその他多くのトピックに関する無償トレーニングを提供しています。[Deleting and Updating Data トレーニングモジュール](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs) は、学習を始めるのに適したコンテンツです。|

</div>



## 重複排除のオプション {#options-for-deduplication}

ClickHouseでは、以下のテーブルエンジンを使用して重複排除を実装しています:

1. `ReplacingMergeTree`テーブルエンジン: このテーブルエンジンでは、マージ時に同じソートキーを持つ重複行が削除されます。`ReplacingMergeTree`は、upsert動作(クエリで最後に挿入された行を返す場合)をエミュレートするのに適したオプションです。

2. 行の折りたたみ: `CollapsingMergeTree`および`VersionedCollapsingMergeTree`テーブルエンジンは、既存の行を「キャンセル」して新しい行を挿入するロジックを使用します。これらは`ReplacingMergeTree`よりも実装が複雑ですが、データがマージ済みかどうかを気にすることなく、クエリや集計をより簡潔に記述できます。これら2つのテーブルエンジンは、データを頻繁に更新する必要がある場合に有用です。

以下では、これら両方の手法について説明します。詳細については、無料のオンデマンド[データの削除と更新トレーニングモジュール](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)をご覧ください。


## アップサートにReplacingMergeTreeを使用する {#using-replacingmergetree-for-upserts}

Hacker Newsのコメントを含むテーブルに、コメントが閲覧された回数を表すviewsカラムがある簡単な例を見てみましょう。記事が公開されたときに新しい行を挿入し、値が増加した場合は1日に1回、閲覧数の合計で新しい行をアップサートすると仮定します:

```sql
CREATE TABLE hackernews_rmt (
    id UInt32,
    author String,
    comment String,
    views UInt64
)
ENGINE = ReplacingMergeTree
PRIMARY KEY (author, id)
```

2行を挿入してみましょう:

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 0),
   (2, 'ch_fan', 'This is post #2', 0)
```

`views`カラムを更新するには、同じプライマリキーで新しい行を挿入します(`views`カラムの新しい値に注目してください):

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 100),
   (2, 'ch_fan', 'This is post #2', 200)
```

テーブルには現在4行あります:

```sql
SELECT *
FROM hackernews_rmt
```

```response
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │     0 │
│  1 │ ricardo │ This is post #1 │     0 │
└────┴─────────┴─────────────────┴───────┘
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │   200 │
│  1 │ ricardo │ This is post #1 │   100 │
└────┴─────────┴─────────────────┴───────┘
```

出力の上記の別々のボックスは、内部的な2つのパートを示しています - このデータはまだマージされていないため、重複行はまだ削除されていません。`SELECT`クエリで`FINAL`キーワードを使用してみましょう。これにより、クエリ結果の論理的なマージが行われます:

```sql
SELECT *
FROM hackernews_rmt
FINAL
```

```response
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │   200 │
│  1 │ ricardo │ This is post #1 │   100 │
└────┴─────────┴─────────────────┴───────┘
```

結果には2行のみがあり、最後に挿入された行が返されます。

:::note
`FINAL`の使用は、少量のデータがある場合は問題なく機能します。大量のデータを扱っている場合、`FINAL`の使用はおそらく最良の選択肢ではありません。カラムの最新値を見つけるためのより良い選択肢について説明しましょう。
:::

### FINALを避ける {#avoiding-final}

両方のユニークな行について、`views`カラムを再度更新してみましょう:

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 150),
   (2, 'ch_fan', 'This is post #2', 250)
```

テーブルには現在6行あります。これは、実際のマージがまだ発生していないためです(`FINAL`を使用したときのクエリ時のマージのみ)。

```sql
SELECT *
FROM hackernews_rmt
```


```response
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │   200 │
│  1 │ ricardo │ This is post #1 │   100 │
└────┴─────────┴─────────────────┴───────┘
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │     0 │
│  1 │ ricardo │ This is post #1 │     0 │
└────┴─────────┴─────────────────┴───────┘
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │   250 │
│  1 │ ricardo │ This is post #1 │   150 │
└────┴─────────┴─────────────────┴───────┘
```

`FINAL` を使用する代わりにビジネスロジックを使いましょう。`views` 列は常に増加することが分かっているので、目的の列でグループ化した後に `max` 関数を使用して、最大値を持つ行を選択できます。

```sql
SELECT
    id,
    author,
    comment,
    max(views)
FROM hackernews_rmt
GROUP BY (id, author, comment)
```

```response
┌─id─┬─author──┬─comment─────────┬─max(views)─┐
│  2 │ ch_fan  │ 投稿 #2 │        250 │
│  1 │ ricardo │ 投稿 #1 │        150 │
└────┴─────────┴─────────────────┴────────────┘
```

上記のクエリで示したようなグループ化は、`FINAL` キーワードを使用するよりも（クエリのパフォーマンスの観点から）実際に効率的な場合があります。

[Deleting and Updating Data トレーニングモジュール](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse\&utm_medium=docs)では、この例をさらに掘り下げ、`ReplacingMergeTree` で `version` 列を使用する方法も含めて解説しています。


## 頻繁に更新されるカラムに対するCollapsingMergeTreeの使用 {#using-collapsingmergetree-for-updating-columns-frequently}

カラムの更新には、既存の行を削除して新しい値に置き換える処理が含まれます。すでに見てきたように、ClickHouseにおけるこの種の変更は_最終的に_、つまりマージ時に発生します。更新する行が多数ある場合、`ALTER TABLE..UPDATE`を使用せず、既存のデータと並行して新しいデータを挿入する方が実際には効率的です。データが古いか新しいかを示すカラムを追加することもできますが、実はこの動作を非常にうまく実装しているテーブルエンジンが既に存在します。特に、古いデータを自動的に削除してくれる点を考慮すると優れています。その仕組みを見ていきましょう。

外部システムを使用してHacker Newsのコメントの閲覧数を追跡し、数時間ごとにそのデータをClickHouseにプッシュするとします。古い行を削除し、新しい行が各Hacker Newsコメントの新しい状態を表すようにしたい場合、`CollapsingMergeTree`を使用してこの動作を実装できます。

閲覧数を保存するテーブルを定義しましょう:

```sql
CREATE TABLE hackernews_views (
    id UInt32,
    author String,
    views UInt64,
    sign Int8
)
ENGINE = CollapsingMergeTree(sign)
PRIMARY KEY (id, author)
```

`hackernews_views`テーブルには、**signカラム**と呼ばれる`Int8`型のsignという名前のカラムがあることに注目してください。signカラムの名前は任意ですが、`Int8`データ型は必須であり、このカラム名が`CollapsingMergeTree`テーブルのコンストラクタに渡されていることに注意してください。

`CollapsingMergeTree`テーブルのsignカラムとは何でしょうか。これは行の_状態_を表し、signカラムは1または-1のみを取ることができます。その仕組みは次のとおりです:

- 2つの行が同じプライマリキー(またはプライマリキーと異なる場合はソート順)を持ち、signカラムの値が異なる場合、+1で挿入された最後の行が状態行となり、他の行は互いに相殺されます
- 互いに相殺される行はマージ時に削除されます
- 対応するペアがない行は保持されます

`hackernews_views`テーブルに行を追加しましょう。このプライマリキーに対する唯一の行であるため、その状態を1に設定します:

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, 1)
```

次に、viewsカラムを変更したいとします。2つの行を挿入します。1つは既存の行を相殺するもので、もう1つは行の新しい状態を含むものです:

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, -1),
   (123, 'ricardo', 150, 1)
```

テーブルには現在、プライマリキー`(123, 'ricardo')`を持つ3つの行があります:

```sql
SELECT *
FROM hackernews_views
```

```response
┌──id─┬─author──┬─views─┬─sign─┐
│ 123 │ ricardo │     0 │   -1 │
│ 123 │ ricardo │   150 │    1 │
└─────┴─────────┴───────┴──────┘
┌──id─┬─author──┬─views─┬─sign─┐
│ 123 │ ricardo │     0 │    1 │
└─────┴─────────┴───────┴──────┘
```

`FINAL`を追加すると現在の状態行が返されることに注目してください:

```sql
SELECT *
FROM hackernews_views
FINAL
```

```response
┌──id─┬─author──┬─views─┬─sign─┐
│ 123 │ ricardo │   150 │    1 │
└─────┴─────────┴───────┴──────┘
```

ただし、大規模なテーブルでは`FINAL`の使用は推奨されません。

:::note
この例で`views`カラムに渡される値は実際には必要ありませんし、古い行の`views`の現在の値と一致する必要もありません。実際、プライマリキーと-1だけで行を相殺できます:

```sql
INSERT INTO hackernews_views(id, author, sign) VALUES
   (123, 'ricardo', -1)
```

:::


## 複数スレッドからのリアルタイム更新 {#real-time-updates-from-multiple-threads}

`CollapsingMergeTree`テーブルでは、符号列を使用して行が互いに相殺され、行の状態は最後に挿入された行によって決定されます。しかし、異なるスレッドから行を挿入する場合、行が順不同で挿入される可能性があるため、問題が発生することがあります。このような状況では、「最後の」行を使用する方法は機能しません。

ここで`VersionedCollapsingMergeTree`が役立ちます。`CollapsingMergeTree`と同様に行を相殺しますが、最後に挿入された行を保持する代わりに、指定したバージョン列の値が最も高い行を保持します。

例を見てみましょう。Hacker Newsのコメントの閲覧数を追跡し、データが頻繁に更新されるとします。マージを強制したり待機したりすることなく、レポートで最新の値を使用したいと考えています。`CollapsingMergeTree`と同様のテーブルから始めますが、行の状態のバージョンを格納する列を追加します。

```sql
CREATE TABLE hackernews_views_vcmt (
    id UInt32,
    author String,
    views UInt64,
    sign Int8,
    version UInt32
)
ENGINE = VersionedCollapsingMergeTree(sign, version)
PRIMARY KEY (id, author)
```

このテーブルは`VersionedCollapsingMergeTree`をエンジンとして使用し、**符号列**と**バージョン列**を渡していることに注意してください。このテーブルの動作は次のとおりです。

- 同じ主キーとバージョンを持ち、異なる符号を持つ各行のペアを削除します
- 行が挿入された順序は関係ありません
- バージョン列が主キーの一部でない場合、ClickHouseは最後のフィールドとして暗黙的に主キーに追加することに注意してください

クエリを記述する際には同じタイプのロジックを使用します。主キーでグループ化し、相殺されたがまだ削除されていない行を回避するための巧妙なロジックを使用します。`hackernews_views_vcmt`テーブルにいくつかの行を追加してみましょう。

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, 1, 1),
   (2, 'ch_fan', 0, 1, 1),
   (3, 'kenny', 0, 1, 1)
```

次に、2つの行を更新し、1つを削除します。行を相殺するには、以前のバージョン番号を必ず含めてください(主キーの一部であるため)。

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, -1, 1),
   (1, 'ricardo', 50, 1, 2),
   (2, 'ch_fan', 0, -1, 1),
   (3, 'kenny', 0, -1, 1),
   (3, 'kenny', 1000, 1, 2)
```

符号列に基づいて値を巧妙に加算および減算する、以前と同じクエリを実行します。

```sql
SELECT
    id,
    author,
    sum(views * sign)
FROM hackernews_views_vcmt
GROUP BY (id, author)
HAVING sum(sign) > 0
ORDER BY id ASC
```

結果は2行です。

```response
┌─id─┬─author──┬─sum(multiply(views, sign))─┐
│  1 │ ricardo │                         50 │
│  3 │ kenny   │                       1000 │
└────┴─────────┴────────────────────────────┘
```

テーブルのマージを強制してみましょう。

```sql
OPTIMIZE TABLE hackernews_views_vcmt
```

結果には2行のみが含まれるはずです。

```sql
SELECT *
FROM hackernews_views_vcmt
```

```response
┌─id─┬─author──┬─views─┬─sign─┬─version─┐
│  1 │ ricardo │    50 │    1 │       2 │
│  3 │ kenny   │  1000 │    1 │       2 │
└────┴─────────┴───────┴──────┴─────────┘
```

`VersionedCollapsingMergeTree`テーブルは、複数のクライアントやスレッドから行を挿入する際に重複排除を実装したい場合に非常に便利です。


## 行が重複排除されないのはなぜですか？ {#why-arent-my-rows-being-deduplicated}

挿入された行が重複排除されない理由の1つは、`INSERT`文で非冪等な関数または式を使用している場合です。例えば、`createdAt DateTime64(3) DEFAULT now()`というカラムを持つ行を挿入している場合、各行の`createdAt`カラムに一意のデフォルト値が設定されるため、行は必ず一意になります。MergeTree / ReplicatedMergeTreeテーブルエンジンは、挿入された各行が一意のチェックサムを生成するため、行の重複排除を行うことができません。

この場合、各バッチに対して独自の`insert_deduplication_token`を指定することで、同じバッチを複数回挿入しても同じ行が再挿入されないようにすることができます。この設定の使用方法の詳細については、[`insert_deduplication_token`のドキュメント](/operations/settings/settings#insert_deduplication_token)を参照してください。
