---
slug: /guides/developer/deduplication
sidebar_label: '重複排除戦略'
sidebar_position: 3
description: '頻繁にアップサート、更新、削除を行う必要がある場合は、重複排除を利用します。'
title: '重複排除戦略'
keywords: ['重複排除戦略', 'データ重複排除', 'アップサート', '更新と削除', '開発者ガイド']
doc_type: 'guide'
---

import deduplication from '@site/static/images/guides/developer/de_duplication.png';
import Image from '@theme/IdealImage';

# 重複排除の戦略 \{#deduplication-strategies\}

**重複排除（Deduplication）** とは、***データセットから重複した行を削除する*** プロセスを指します。OLTP データベースでは、各行に一意のプライマリキーがあるため、これは容易に実現できますが、その代わり挿入処理は遅くなります。挿入される各行について、まず既存行の検索が必要となり、見つかった場合はそれを置き換える必要があるためです。

ClickHouse はデータ挿入における高速性を重視して設計されています。ストレージファイルは不変であり、行の挿入前に ClickHouse が既存のプライマリキーを確認することはありません。そのため、重複排除には多少の追加作業が必要になります。これはまた、重複排除が即時には行われず、**最終的に（eventual）** 実施されることを意味し、次のようないくつかの副作用があります。

- 任意の時点で、テーブルには依然として重複（同じソートキーを持つ行）が存在し得る
- 実際の重複行の削除は、パーツのマージ処理中に行われる
- クエリでは重複が存在する可能性を考慮する必要がある

<div class='transparent-table'>

|||
|------|----|
|<Image img={deduplication}  alt="Deduplication Logo" size="sm"/>|ClickHouse では、重複排除を含む多くのトピックに関する無償トレーニングを提供しています。[Deleting and Updating Data トレーニングモジュール](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)は、学習を始めるうえでの良い出発点です。|

</div>

## 重複排除のオプション \{#options-for-deduplication\}

ClickHouse では、次のテーブルエンジンを用いて重複排除が実装されています。

1. `ReplacingMergeTree` テーブルエンジン: このテーブルエンジンでは、同じソートキーを持つ重複行がマージ処理中に削除されます。`ReplacingMergeTree` は upsert 動作（クエリで最後に挿入された行を返したい場合）をエミュレートするのに適したオプションです。

2. 行の折りたたみ（Collapsing）: `CollapsingMergeTree` および `VersionedCollapsingMergeTree` テーブルエンジンは、既存の行を「キャンセル」して新しい行を挿入するロジックを使用します。これらは `ReplacingMergeTree` よりも実装が複雑ですが、データがすでにマージされているかどうかを意識せずにクエリや集計をよりシンプルに記述できます。これら 2 つのテーブルエンジンは、データを頻繁に更新する必要がある場合に有用です。

以下で、これら 2 つの手法を順に解説します。詳細については、無料オンデマンドの [Deleting and Updating Data トレーニングモジュール](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)を参照してください。

## Upsert に ReplacingMergeTree を使用する \{#using-replacingmergetree-for-upserts\}

テーブルに Hacker News のコメントが格納されており、`views` 列にコメントの閲覧回数が入っているという、シンプルな例を考えます。記事が公開されたときに新しい行を挿入し、その後は値が増加していれば 1 日に 1 回、その時点での合計閲覧数を持つ新しい行をアップサートするものとします。

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

2 行挿入してみましょう：

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 0),
   (2, 'ch_fan', 'This is post #2', 0)
```

`views` 列を更新するには、同じ主キーを持つ新しい行を挿入します（`views` 列の新しい値に注目してください）：

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 100),
   (2, 'ch_fan', 'This is post #2', 200)
```

テーブルには現在 4 行あります。

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

上の出力でボックスが分かれているのは、内部的にデータが 2 つのパートに分かれていることを示しています。このデータはまだマージされていないため、重複した行はまだ削除されていません。`SELECT` クエリで `FINAL` キーワードを使用してみましょう。これにより、クエリ結果が論理的にマージされます。

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

結果は 2 行のみで、最後に挿入された行が返されています。

:::note
`FINAL` はデータ量が少ない場合には問題なく動作します。しかし、大量のデータを扱う場合には、
`FINAL` を使うのはおそらく最適な選択肢ではありません。特定のカラムの最新値を
取得するための、より良い方法について説明します。
:::

### FINAL の使用を避ける \{#avoiding-final\}

2 つの一意な行それぞれについて、再度 `views` カラムを更新してみましょう。

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 150),
   (2, 'ch_fan', 'This is post #2', 250)
```

実際のマージはまだ行われていないため、現在テーブルには 6 行あります（`FINAL` を使用したクエリ時のマージのみが行われています）。

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

`FINAL` を使う代わりに、ビジネスロジックを活用しましょう。`views` 列は常に増加していくことが分かっているので、必要な列でグルーピングした後に `max` 関数を使って、値が最大の行を選択できます。

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

上記のクエリのようにグループ化することは、クエリパフォーマンスの観点からは、`FINAL` キーワードを使用するよりも実際に効率的になる場合があります。

[Deleting and Updating Data トレーニングモジュール](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse\&utm_medium=docs)では、この例をさらに掘り下げ、`ReplacingMergeTree` で `version` 列を使用する方法などについて解説しています。

## CollapsingMergeTree を使った頻繁に更新されるカラムの処理 \{#using-collapsingmergetree-for-updating-columns-frequently\}

カラムの更新は、既存の行を削除して新しい値を持つ行に置き換える処理です。すでに見てきたとおり、この種のミューテーションは ClickHouse ではマージ処理のタイミングで「最終的に」実行されます。更新すべき行が大量にある場合、`ALTER TABLE..UPDATE` を使うよりも、既存データと並べて新しいデータを挿入してしまう方が、実際には効率的なことがあります。たとえば、データが古いか新しいかを示すカラムを追加できます。そして、実はこの挙動を非常にうまく実装しているテーブルエンジンが存在し、古いデータを自動的に削除してくれます。どのように動作するかを見ていきましょう。

Hacker News のコメントの閲覧数を外部システムで集計し、数時間ごとにそのデータを ClickHouse に投入するとします。古い行は削除し、新しい行が各 Hacker News コメントの新しい状態を表すようにしたいとします。この挙動を実現するために `CollapsingMergeTree` を利用できます。

閲覧数を保存するテーブルを定義してみましょう。

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

`hackernews_views` テーブルには、sign という名前の `Int8` 型カラムがあり、これは **sign** カラムと呼ばれます。sign カラムの名前自体は任意ですが、`Int8` 型であることは必須です。また、sign カラム名が `CollapsingMergeTree` テーブルのコンストラクタに渡されていることに注意してください。

では、`CollapsingMergeTree` テーブルの sign カラムとは何でしょうか？これは行の *状態* を表すカラムで、値としては 1 または -1 のみを取ることができます。動作は次のとおりです。

* 2 つの行が同じ primary key（あるいは primary key と異なる sort order を使用している場合はその sort order）を持ち、かつ sign カラムの値が異なる場合、最後に挿入された +1 の行が状態行となり、他の行同士は互いに打ち消し合います
* 互いに打ち消し合う行は、マージ処理の際に削除されます
* 対応するペアが存在しない行は保持されます

`hackernews_views` テーブルに行を 1 つ追加してみましょう。この primary key に対しては唯一の行なので、その状態を 1 に設定します。

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, 1)
```

ここで、views 列を変更したいとします。既存の行を打ち消す行を 1 行と、新しい状態を表す行を 1 行の、計 2 行を挿入します。

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, -1),
   (123, 'ricardo', 150, 1)
```

これでテーブルには、主キー `(123, 'ricardo')` を持つ行が 3 行あります。

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

`FINAL` を付けると、現在の状態を表す行が返されます。

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

しかしもちろん、大きなテーブルに対して `FINAL` を使用することは推奨されません。

:::note
この例で `views` 列に渡している値は実際には不要であり、古い行の現在の `views` の値と一致している必要もありません。実際には、プライマリキーと -1 だけで行をキャンセルできます。

```sql
INSERT INTO hackernews_views(id, author, sign) VALUES
   (123, 'ricardo', -1)
```

:::

## 複数スレッドからのリアルタイム更新 \{#real-time-updates-from-multiple-threads\}

`CollapsingMergeTree` テーブルでは、行は sign 列を使って互いに打ち消し合い、行の状態は最後に挿入された行によって決まります。しかし、複数のスレッドから行を挿入していて、行が順不同で挿入される可能性がある場合には問題になります。このような状況では「最後」の行を使う方法は通用しません。

ここで役に立つのが `VersionedCollapsingMergeTree` です。これは `CollapsingMergeTree` と同様に行を折り畳みますが、最後に挿入された行を保持する代わりに、指定したバージョン列の値が最も大きい行を保持します。

例を見てみましょう。Hacker News のコメントの閲覧数を追跡していて、そのデータが頻繁に更新されるとします。マージを強制したり待ったりすることなく、レポーティングでは常に最新の値を使いたいとします。ここでは、`CollapsedMergeTree` に似たテーブルから始めますが、行の状態のバージョンを保存するための列を追加します。

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

このテーブルはエンジンとして `VersionsedCollapsingMergeTree` を使用し、**sign カラム** と **version カラム** を指定しています。テーブルは次のように動作します。

* 同じ主キーと version を持ち、sign が異なる行のペアを削除します
* 行が挿入された順序は関係ありません
* version カラムが主キーの一部でない場合、ClickHouse はそれを最後のフィールドとして暗黙的に主キーに追加します

クエリを書くときも同様のロジックを使用します。主キーで GROUP BY し、キャンセルされているがまだ削除されていない行を除外するようなロジックを用います。`hackernews_views_vcmt` テーブルにいくつか行を追加してみましょう。

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, 1, 1),
   (2, 'ch_fan', 0, 1, 1),
   (3, 'kenny', 0, 1, 1)
```

ここでは 2 行を更新し、1 行を削除します。行を取り消す場合は、主キーの一部であるため、必ず以前のバージョン番号を含めてください。

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, -1, 1),
   (1, 'ricardo', 50, 1, 2),
   (2, 'ch_fan', 0, -1, 1),
   (3, 'kenny', 0, -1, 1),
   (3, 'kenny', 1000, 1, 2)
```

先ほどと同じクエリを実行します。これは、`sign` 列に応じて値を加算・減算するものです。

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

結果は2行です：

```response
┌─id─┬─author──┬─sum(multiply(views, sign))─┐
│  1 │ ricardo │                         50 │
│  3 │ kenny   │                       1000 │
└────┴─────────┴────────────────────────────┘
```

テーブルのマージを強制的に実行してみましょう。

```sql
OPTIMIZE TABLE hackernews_views_vcmt
```

結果には 2 行だけが表示されるはずです。

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

`VersionedCollapsingMergeTree` テーブルは、複数のクライアントやスレッドから行を挿入する際に重複排除を行いたい場合に非常に便利です。

## なぜ行が重複排除されないのですか？ \{#why-arent-my-rows-being-deduplicated\}

挿入された行が重複排除されない理由の 1 つとして、`INSERT` 文の中で非冪等な関数または式を使用している場合が考えられます。たとえば、`createdAt DateTime64(3) DEFAULT now()` というカラムを持つ行を挿入していると、各行では `createdAt` カラムに一意のデフォルト値が設定されるため、行は必ず一意になります。MergeTree / ReplicatedMergeTree テーブルエンジンは、各挿入行で一意のチェックサムが生成されるため、それらの行を重複として認識して重複排除することができません。

このような場合、各バッチの行に対して `insert_deduplication_token` を明示的に指定することで、同じバッチを複数回挿入しても同じ行が再挿入されないようにできます。この設定の使い方についての詳細は、[`insert_deduplication_token` に関するドキュメント](/operations/settings/settings#insert_deduplication_token)を参照してください。
