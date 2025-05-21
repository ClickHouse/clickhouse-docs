---
slug: /guides/developer/deduplication
sidebar_label: '重複排除戦略'
sidebar_position: 3
description: '頻繁にアップサート、更新、削除を行う必要がある場合に重複排除を使用します。'
title: '重複排除戦略'
---

import deduplication from '@site/static/images/guides/developer/de_duplication.png';
import Image from '@theme/IdealImage';



# 重複排除戦略

**重複排除**とは、***データセットの重複した行を削除するプロセス***を指します。OLTPデータベースでは、各行がユニークな主キーを持っているため、これは簡単に行えますが、その分挿入が遅くなります。挿入された行はまず検索され、見つかった場合には置き換えられる必要があります。

ClickHouseは、データ挿入の速さに特化して設計されています。ストレージファイルは不変であり、ClickHouseは行を挿入する前に既存の主キーをチェックしないため、重複排除にはもう少し手間がかかります。これにより、重複排除は即時には行われず、**最終的に**行われることになりますが、いくつかの副作用があります。

- いつでも、テーブルにはまだ重複（同じソートキーを持つ行）が存在することがあります。
- 重複行の実際の削除は、パーツのマージ中に行われます。
- クエリには、重複が存在する可能性を考慮する必要があります。

<div class='transparent-table'>

|||
|------|----|
|<Image img={deduplication}  alt="Deduplication Logo" size="sm"/>|ClickHouseは重複排除やその他のトピックについて無料のトレーニングを提供しています。 [データの削除と更新トレーニングモジュール](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)が良い出発点です。|

</div>

## 重複排除のオプション {#options-for-deduplication}

重複排除は、以下のテーブルエンジンを使用してClickHouseで実装されています。

1. `ReplacingMergeTree`テーブルエンジン: このテーブルエンジンを使用すると、同じソートキーを持つ重複行がマージ中に削除されます。 `ReplacingMergeTree`は、アップサート動作をエミュレートするのに適しており（クエリが最後に挿入された行を返すことを望む場合）、適しています。

2. 行の圧縮: `CollapsingMergeTree`および`VersionedCollapsingMergeTree`テーブルエンジンは、既存の行が「キャンセルされ」、新しい行が挿入されるというロジックを使用します。これらのエンジンは`ReplacingMergeTree`よりも実装が複雑ですが、データがまだマージされたかどうかを心配せずに、クエリと集計をシンプルに書くことができます。これらの2つのテーブルエンジンは、データを頻繁に更新する必要がある場合に便利です。

以下でこれらの2つの手法について詳しく説明します。詳細については、無料のオンデマンド [データの削除と更新トレーニングモジュール](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)をチェックしてください。

## UpsertのためのReplacingMergeTreeの使用 {#using-replacingmergetree-for-upserts}

Hacker Newsのコメントを含むテーブルを例として見てみましょう。`views`カラムはコメントが表示された回数を示しています。記事が公開されるときに新しい行を挿入し、値が増加した場合には、1日に1回新しい行で合計表示数をアップサートすると仮定します。

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

2つの行を挿入してみましょう。

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 0),
   (2, 'ch_fan', 'This is post #2', 0)
```

`views`カラムを更新するため、同じ主キーで新しい行を挿入します（`views`カラムの新しい値に注意してください）。

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 100),
   (2, 'ch_fan', 'This is post #2', 200)
```

テーブルには現在4行あります。

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

上記の出力の別々のボックスは、背景での2つのパーツを示しています。このデータはまだマージされていないため、重複行はまだ削除されていません。クエリ結果の論理的なマージを行うために、`SELECT`クエリに`FINAL`キーワードを使用してみましょう。

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

結果は2行のみで、最後に挿入された行が返される行です。

:::note
`FINAL`を使用するのは小さなデータ量の場合には問題ありませんが、大量のデータを扱う場合には、`FINAL`を使用するのが最良の選択肢ではないかもしれません。カラムの最新の値を見つけるためのより良いオプションについて話しましょう...
:::

### FINALの回避 {#avoiding-final}

ユニークな行の両方の`views`カラムを再度更新しましょう。

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 150),
   (2, 'ch_fan', 'This is post #2', 250)
```

テーブルには現在6行あり、実際のマージはまだ行われていません（`FINAL`を使用したときのクエリ時マージのみ）。

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

`FINAL`を使用する代わりに、ビジネスロジックを使用しましょう - `views`カラムは常に増加するため、選択したカラムでグループ化した後に`max`関数を使用して最大値を持つ行を選択できます。

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
│  2 │ ch_fan  │ This is post #2 │        250 │
│  1 │ ricardo │ This is post #1 │        150 │
└────┴─────────┴─────────────────┴────────────┘
```

クエリの上記のようなグループ化は、`FINAL`キーワードを使用するよりも効率的（クエリ性能の観点で）であることが実際にはあります。

私たちの [データの削除と更新トレーニングモジュール](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)は、この例をさらに詳しく解説しており、`ReplacingMergeTree`との`version`カラムの使用方法も含まれています。

## カラムを頻繁に更新するためのCollapsingMergeTreeの使用 {#using-collapsingmergetree-for-updating-columns-frequently}

カラムを更新するには、既存の行を削除し、新しい値で置き換える必要があります。すでに見たように、ClickHouseにおけるこの種の変異は、_最終的に_ - マージ中に発生します。更新する行が多い場合、`ALTER TABLE..UPDATE`を避ける方が実際には効率的であり、代わりに新しいデータを既存のデータとともに挿入するだけで済みます。データが古いか新しいかを示すカラムを追加することが可能で、実際にこの動作を非常にうまく実装したテーブルエンジンがあります。特に、古いデータを自動的に削除することを考慮しています。どのように機能するか見てみましょう。

Hacker Newsコメントの表示数を外部システムでトラッキングし、数時間ごとにデータをClickHouseにプッシュすると仮定します。古い行は削除され、新しい行が各Hacker Newsコメントの新しい状態を表します。この動作を実装するために`CollapsingMergeTree`を使用することができます。

表示数を格納するためのテーブルを定義しましょう。

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

`hackernews_views`テーブルには、**sign**カラムと呼ばれる`Int8`カラムが含まれています。このカラムの名前は任意ですが、`Int8`データ型が必要です。注意すべき点は、このカラム名が`CollapsingMergeTree`テーブルのコンストラクタに渡されたことです。

`CollapsingMergeTree`テーブルのsignカラムとは？

それは行の_状態_を示すもので、signカラムは1または-1のいずれかになります。以下のように機能します。

- 同じ主キー（またはソート順序が主キーと異なる場合）は、異なるsignカラムの値があるが、最後に挿入された行が+1の場合、その行が状態行となり、他の行は互いにキャンセルされます。
- 互いにキャンセルする行は、マージ中に削除されます。
- 対になる行を持たない行は保持されます。

`hackernews_views`テーブルに行を追加しましょう。この主キーの唯一の行なので、状態を1に設定します。

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, 1)
```

`views`カラムを変更したい場合を考えます。既存の行をキャンセルする行と、その行の新しい状態を含む行の2つを挿入します。

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, -1),
   (123, 'ricardo', 150, 1)
```

主キー `(123, 'ricardo')`の行は現在3行あります。

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

`FINAL`を追加すると、現在の状態行が返されます。

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

ただし、もちろん、大きなテーブルに対して`FINAL`を使用することはお勧めできません。

:::note
この例で挿入する`views`カラムに渡される値は実際には必要ではなく、古い行の`views`の現在の値と一致させる必要もありません。実際には、主キーと-1だけで行をキャンセルすることができます。

```sql
INSERT INTO hackernews_views(id, author, sign) VALUES
   (123, 'ricardo', -1)
```
:::

## 複数スレッドからのリアルタイム更新 {#real-time-updates-from-multiple-threads}

`CollapsingMergeTree`テーブルでは、行同士がsignカラムを使用してキャンセルされ、行の状態は最後に挿入された行によって決定されます。しかし、これにより、行が順不同で挿入される複数のスレッドから挿入される場合に問題が発生することがあります。この場合、最後の行を使用することは機能しません。

ここで役立つのが`VersionedCollapsingMergeTree`です。これは、`CollapsingMergeTree`と同様に行を圧縮しますが、最後に挿入された行の代わりに、指定したバージョンカラムの最大値を持つ行を保持します。

例を見てみましょう。私たちがHacker Newsコメントの表示数を追跡し、データが頻繁に更新されるとします。レポートには最新の値を使用したいが、マージを強制したり待ったりしたくありません。以下のように`CollapsingMergeTree`に似たテーブルを作成しますが、行の状態のバージョンを格納するカラムを追加します。

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

このテーブルは、**signカラム**と**バージョンカラム**を渡して`VersionedCollapsingMergeTree`をエンジンとして使用します。テーブルの動作は以下の通りです。

- 同じ主キーとバージョンを持ち、異なるサインの行のペアを削除します。
- 行の挿入順序は重要ではありません。
- バージョンカラムが主キーの一部でない場合、ClickHouseはそれを暗黙的に主キーの最後のフィールドとして追加します。

クエリを書く際には、主キーでグループ化し、キャンセルされたがまだ削除されていない行を回避するために巧妙なロジックを使用します。`hackernews_views_vcmt`テーブルに行を追加しましょう。

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, 1, 1),
   (2, 'ch_fan', 0, 1, 1),
   (3, 'kenny', 0, 1, 1)
```

次に、2つの行を更新し、そのうちの1つを削除します。行をキャンセルするには、以前のバージョン番号を含める必要があります（主キーの一部であるため）。

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, -1, 1),
   (1, 'ricardo', 50, 1, 2),
   (2, 'ch_fan', 0, -1, 1),
   (3, 'kenny', 0, -1, 1),
   (3, 'kenny', 1000, 1, 2)
```

前回と同様に、signカラムに基づいて値を賢く加算および減算するクエリを実行します。

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

結果には2行だけが含まれます。

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

## 行が重複排除されない理由は？ {#why-arent-my-rows-being-deduplicated}

挿入された行が重複排除されない理由の一つは、`INSERT`ステートメントに非冪等関数や式を使用している場合です。例えば、`createdAt DateTime64(3) DEFAULT now()`というカラムを持つ行を挿入している場合、各行は`createdAt`カラムに対してユニークなデフォルト値を持つため、重複を排除することが保証されます。MergeTree / ReplicatedMergeTreeテーブルエンジンは、挿入された各行がユニークなチェックサムを生成するため、行を重複排除する方法を知りません。

この場合、各行のバッチについて独自の`insert_deduplication_token`を指定することで、同じバッチの複数の挿入が同じ行の再挿入を引き起こさないことを保証できます。この設定の使用方法についての詳細は、[insert_deduplication_tokenに関するドキュメント](/operations/settings/settings#insert_deduplication_token)を参照してください。
