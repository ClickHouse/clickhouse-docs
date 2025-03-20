---
slug: /guides/developer/deduplication
sidebar_label: 重複除去戦略
sidebar_position: 3
description: 頻繁なアップサート、更新、削除を行う必要がある場合に重複除去を使用します。
---

import deduplication from '@site/static/images/guides/developer/de_duplication.png';


# 重複除去戦略

**重複除去**とは、***データセットの重複行を削除するプロセス***を指します。OLTPデータベースでは、各行に一意の主キーがあるため、これは簡単に行えますが、その代償として挿入が遅くなります。挿入された各行は、まず検索され、見つかった場合は置き換えられる必要があります。

ClickHouseは、データの挿入に関してスピードを重視して設計されています。ストレージファイルは不変であり、ClickHouseは行を挿入する前に既存の主キーをチェックしないため、重複除去にはもう少し手間がかかります。これにより、重複除去は即時ではなく、**最終的**に行われるため、いくつかの副作用があります。

- いつでもテーブルには重複（同じソートキーを持つ行）が存在する可能性があります
- 重複行の実際の削除は、パーツのマージ中に行われます
- クエリは重複の可能性を許容する必要があります

<div class='transparent-table'>

|||
|------|----|
|<img src={deduplication} class="image" alt="Cassandra logo" style={{width: '16rem', 'background-color': 'transparent'}}/>|ClickHouseは重複除去やその他多くのトピックに関する無料トレーニングを提供しています。 [データの削除と更新トレーニングモジュール](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)は良い出発点です。|

</div>

## 重複除去のオプション {#options-for-deduplication}

重複除去は、ClickHouseで以下のテーブルエンジンを使用して実装されています。

1. `ReplacingMergeTree`テーブルエンジン: このテーブルエンジンを使用すると、同じソートキーを持つ重複行がマージ中に削除されます。`ReplacingMergeTree`は、最後に挿入された行を返すクエリを模倣するのに適しています。

2. 行の崩壊: `CollapsingMergeTree`および`VersionedCollapsingMergeTree`テーブルエンジンは、既存の行が「キャンセルされ」、新しい行が挿入されるというロジックを使用します。これらは`ReplacingMergeTree`よりも実装が複雑ですが、データがマージされているかどうかを気にせずにクエリや集計を簡単に書くことができます。頻繁にデータを更新する必要があるときに、この2つのテーブルエンジンは便利です。

以下でこれらのテクニックの詳細を説明します。詳細については、無料のオンデマンド[データの削除と更新トレーニングモジュール](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)をチェックしてください。

## アップサートのためのReplacingMergeTreeの使用 {#using-replacingmergetree-for-upserts}

Hacker Newsのコメントを保存しているテーブルがあり、`views`カラムがコメントが表示された回数を示しているシンプルな例を見てみましょう。記事が公開されたときに新しい行を挿入し、もし値が増加する場合は毎日1回、合計表示回数で新しい行をアップサートするとします。

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

2行を挿入しましょう：

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 0),
   (2, 'ch_fan', 'This is post #2', 0)
```

`views`カラムを更新するには、同じ主キーで新しい行を挿入します（`views`カラムの新しい値に注意してください）：

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 100),
   (2, 'ch_fan', 'This is post #2', 200)
```

テーブルには現在4行があります：

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

上記の出力の別々のボックスは、内部での2つの部分を示しています - このデータはまだマージされていないため、重複行はまだ削除されていません。次に、`SELECT`クエリで`FINAL`キーワードを使用すると、クエリ結果の論理的なマージが実行されます：

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

結果は2行だけで、最後に挿入された行が返されます。

:::note
`FINAL`を使用するのはデータ量が少ない場合には問題ありませんが、大量のデータを扱う場合は`FINAL`は最適な選択ではないかもしれません。カラムの最新値を見つけるためのより良い選択肢について話しましょう…
:::

### FINALの回避 {#avoiding-final}

両方のユニーク行の`views`カラムを再度更新しましょう：

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 150),
   (2, 'ch_fan', 'This is post #2', 250)
```

テーブルは現在6行あります。なぜなら、実際のマージはまだ発生しておらず（`FINAL`を使った時のクエリ時のマージのみ）、現在の行に対する実体的なマージはまだ行われていないからです。

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

`FINAL`の代わりに、ビジネスロジックを使用します。`views`カラムが常に増加するとわかっているので、`max`関数を使用して最大値を持つ行を選択し、必要なカラムでグループ化します：

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

このようにグループ化することで、クエリパフォーマンスの点で`FINAL`を使用するよりも効率的である場合があります。

私たちの[データの削除と更新トレーニングモジュール](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)は、この例を拡張し、`ReplacingMergeTree`を使用して`version`カラムをどのように利用するかについて説明します。

## カラムを頻繁に更新するためのCollapsingMergeTreeの使用 {#using-collapsingmergetree-for-updating-columns-frequently}

カラムを更新することは、既存の行を削除し、新しい値で置き換えることを含みます。すでに見たように、この種の変更はClickHouseでは_最終的に_行われ、マージ中に発生します。多くの行を更新する必要がある場合、`ALTER TABLE..UPDATE`を避けて、既存のデータと並行して新しいデータを挿入する方が効率的です。データが古いか新しいかを示すカラムを追加できます…実際、これを非常にうまく実装しているテーブルエンジンがあります。特に、古いデータを自動的に削除してくれる点が優れています。どのように機能するのか見てみましょう。

Hacker Newsのコメントの表示回数を外部システムで追跡し、数時間ごとにそのデータをClickHouseにプッシュする場合を考えます。古い行を削除し、新しい行が各Hacker Newsコメントの新しい状態を表すようにしたいとします。この動作を実装するために、`CollapsingMergeTree`を使用します。

表示回数を保存するためのテーブルを定義しましょう：

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

`hackernews_views`テーブルには`sign`という名前の`Int8`カラムがあります。これは**符号**カラムと呼ばれます。この名前は任意ですが、`Int8`データ型は必須です。また、カラム名は`CollapsingMergeTree`テーブルのコンストラクタに渡されます。

`CollapsingMergeTree`テーブルの符号カラムは何ですか？行の_状態_を表し、符号カラムは1または-1のみを取ります。動作は次のようになります：

- 二つの行が同じ主キー（主キーが異なる場合はソート順）を持ち、符号カラムが異なる場合、+1で挿入された最後の行が状態行となり、他の行がキャンセルされます
- キャンセルされた行はマージ中に削除されます
- 対応するペアがない行は残ります

`hackernews_views`テーブルに行を追加しましょう。主キーについて唯一の行であるため、状態を1に設定します：

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, 1)
```

その後、表示回数カラムを変更したいとします。既存の行をキャンセルする行と、新しい状態を含む行を含めて二つの行を挿入します：

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, -1),
   (123, 'ricardo', 150, 1)
```

テーブルには現在、主キー`(123, 'ricardo')`で3行あります：

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

`FINAL`を追加すると、現在の状態行が返されます：

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

もちろん、大きなテーブルに対して`FINAL`を使用するのは推奨されません。

:::note
この例で挿入した`views`カラムの値は実際に必要ではなく、古い行の`views`の現在の値と一致する必要もありません。実際には、主キーと-1だけで行をキャンセルできます：

```sql
INSERT INTO hackernews_views(id, author, sign) VALUES
   (123, 'ricardo', -1)
```
:::

## 複数のスレッドからのリアルタイム更新 {#real-time-updates-from-multiple-threads}

`CollapsingMergeTree`テーブルでは、符号カラムを使って行がキャンセルされ、行の状態は最後に挿入された行によって決定されます。しかし、異なるスレッドから行を挿入している場合、行の挿入順序が入れ替わる可能性があるため、これは問題です。「最後」の行を使用することは、この状況ではうまく機能しません。

ここで役立つのが`VersionedCollapsingMergeTree`です。これは、`CollapsingMergeTree`のように行をキャンセルしますが、最後に挿入された行の代わりに、指定されたバージョンカラムの最大値を持つ行を維持します。

例を見てみましょう。Hacker Newsコメントの表示回数を追跡し、データが頻繁に更新される場合を考えます。最新の値を使用したいが、マージを強制したり待ったりしたくないとします。`CollapsingMergeTree`に似たテーブルから始めますが、行の状態を示すバージョンを保存するカラムを追加します：

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

テーブルは`VersionedCollapsingMergeTree`をエンジンとして使用し、**符号カラム**と**バージョンカラム**を渡します。以下は、このテーブルの動作です：

- 同じ主キーとバージョンおよび異なる符号を持つ各行のペアが削除されます
- 行が挿入された順序は重要ではありません
- バージョンカラムが主キーの一部でない場合、ClickHouseはそれを暗黙的に主キーの最後のフィールドとして追加します

クエリを書く際にも同じタイプのロジックを使用します-主キーでグループ化し、キャンセルされているがまだ削除されていない行を避けるために巧妙なロジックを使用します。`hackernews_views_vcmt`テーブルにいくつかの行を追加しましょう：

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, 1, 1),
   (2, 'ch_fan', 0, 1, 1),
   (3, 'kenny', 0, 1, 1)
```

次に、二つの行を更新し、そのうちの一つを削除します。行をキャンセルするには、前のバージョン番号を含める必要があります（主キーの一部であるため）：

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, -1, 1),
   (1, 'ricardo', 50, 1, 2),
   (2, 'ch_fan', 0, -1, 1),
   (3, 'kenny', 0, -1, 1),
   (3, 'kenny', 1000, 1, 2)
```

符号カラムに基づいて値をうまく加算および減算するクエリを以前と同じように実行します：

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

結果は二行です：

```response
┌─id─┬─author──┬─sum(multiply(views, sign))─┐
│  1 │ ricardo │                         50 │
│  3 │ kenny   │                       1000 │
└────┴─────────┴────────────────────────────┘
```

テーブルをマージすることを強制しましょう：

```sql
OPTIMIZE TABLE hackernews_views_vcmt
```

結果には二行しか存在しないはずです：

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

`VersionedCollapsingMergeTree`テーブルは、複数のクライアントやスレッドから行を挿入しながら重複除去を実装したい場合に非常に便利です。

## なぜ行が重複除去されないのか？ {#why-arent-my-rows-being-deduplicated}

挿入された行が重複除去されない理由の一つは、`INSERT`ステートメントに冪等性のない関数または式を使用している場合です。たとえば、`createdAt DateTime64(3) DEFAULT now()`カラムで行を挿入している場合、各行は`createdAt`カラムに一意のデフォルト値を持つため、重複しないことが保証されます。MergeTree / ReplicatedMergeTreeテーブルエンジンは、各挿入された行が一意のチェックサムを生成するため、行を重複除去する方法を理解できません。

この場合、同じバッチの行が再挿入されないようにしっかりと検証するために、各バッチのために独自の`insert_deduplication_token`を指定できます。この設定の詳細については、[insert_deduplication_tokenに関するドキュメント](/operations/settings/settings#insert_deduplication_token)を参照してください。
