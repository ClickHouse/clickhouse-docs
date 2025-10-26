---
'slug': '/guides/developer/deduplication'
'sidebar_label': '重複排除戦略'
'sidebar_position': 3
'description': '頻繁な upserts、更新、削除を行う必要がある場合は、重複排除を使用してください.'
'title': '重複排除戦略'
'doc_type': 'guide'
---

import deduplication from '@site/static/images/guides/developer/de_duplication.png';
import Image from '@theme/IdealImage';


# 重複排除戦略

**重複排除**とは、***データセットの重複行を削除するプロセス***を指します。OLTPデータベースでは、各行にユニークな主キーがあるため、これを簡単に実行できますが、それには遅い挿入のコストが伴います。挿入された行は、最初に検索され、見つかった場合は置き換えられる必要があります。

ClickHouseは、データ挿入の速度を重視して設計されています。ストレージファイルは不変であり、ClickHouseは行を挿入する前に既存の主キーを確認しないため、重複排除には少し手間がかかります。これにより、重複排除は即時ではなく、**最終的**であり、いくつかの副作用があります：

- あらゆる時点において、テーブルには重複（同じソートキーを持つ行）が存在する可能性があります。
- 重複行の実際の削除は、パーツのマージ中に発生します。
- クエリは、重複の可能性を考慮する必要があります。

<div class='transparent-table'>

|||
|------|----|
|<Image img={deduplication}  alt="Deduplication Logo" size="sm"/>|ClickHouseは、重複排除やその他の多くのトピックについて無料のトレーニングを提供しています。 [データの削除と更新トレーニングモジュール](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs) は、良い出発点になります。|

</div>

## 重複排除のオプション {#options-for-deduplication}

重複排除は、次のテーブルエンジンを使用してClickHouseで実装されています：

1. `ReplacingMergeTree` テーブルエンジン：このテーブルエンジンを使用すると、同じソートキーを持つ重複行がマージ中に削除されます。`ReplacingMergeTree` は、クエリが最後に挿入された行を返すようにしたい場合に、upsertの動作を模倣するための良いオプションです。

2. 行の崩壊：`CollapsingMergeTree` および `VersionedCollapsingMergeTree` テーブルエンジンは、既存の行が「キャンセルされ」、新しい行が挿入されるロジックを使用します。これらは、`ReplacingMergeTree` よりも実装が複雑ですが、データがまだマージされているかどうかを気にすることなく、クエリや集計を簡単に記述できます。これらの2つのテーブルエンジンは、データを頻繁に更新する必要がある場合に便利です。

以下でこれらの技術の両方を説明します。詳細については、無料のオンデマンド [データの削除と更新トレーニングモジュール](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs) をご覧ください。

## UpsertsのためのReplacingMergeTreeの使用 {#using-replacingmergetree-for-upserts}

Hacker Newsのコメントが含まれ、コメントが表示された回数を示す `views` カラムを持つテーブルの簡単な例を見てみましょう。記事が公開されるときに新しい行を挿入し、値が増加する場合に1日に1回、総表示回数で新しい行をupsertします：

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

2つの行を挿入しましょう：

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 0),
   (2, 'ch_fan', 'This is post #2', 0)
```

`views` カラムを更新するために、同じ主キーで新しい行を挿入します（`views` カラムの新しい値に注意してください）：

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 100),
   (2, 'ch_fan', 'This is post #2', 200)
```

テーブルは現在4行あります：

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

出力の上の別々のボックスは、裏側の2つのパーツを示しています - このデータはまだマージされていないため、重複行はまだ削除されていません。`SELECT` クエリで `FINAL` キーワードを使用しましょう。これにより、クエリ結果の論理的なマージが生じます：

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

結果には2行のみが含まれており、最後に挿入された行が返されます。

:::note
`FINAL` を使用するのは、データが少量の場合は問題ありません。大量のデータを扱う場合、 
`FINAL` を使用するのはおそらく最良の選択肢ではありません。カラムの最新の値を見つけるための 
より良いオプションについて議論しましょう。
:::

### FINALの回避 {#avoiding-final}

両方のユニーク行の `views` カラムを再度更新しましょう：

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 150),
   (2, 'ch_fan', 'This is post #2', 250)
```

テーブルには6行あります。なぜなら、実際のマージはまだ発生していないからです（`FINAL` を使用したときのクエリ時のマージのみです）。

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

`FINAL` の代わりにビジネスロジックを使用しましょう - `views` カラムは常に増加することがわかっているので、 
選択したいカラムでグループ化した後、`max` 関数を使用して最大値を持つ行を選択できます：

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

上記のクエリに示されたようにグループ化することは、実際には `FINAL` キーワードを使用するよりも (クエリ性能という点で) より効率的です。

私たちの [データの削除と更新トレーニングモジュール](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs) では、`ReplacingMergeTree` を使用した `version` カラムについてのこの例を詳しく説明しています。

## カラムを頻繁に更新するためのCollapsingMergeTreeの使用 {#using-collapsingmergetree-for-updating-columns-frequently}

カラムの更新は、既存の行を削除し、新しい値で置き換えることを含みます。すでに見たように、ClickHouseではこの種の変異は _最終的に_ 発生します - マージ中にです。多くの行を更新する必要がある場合、`ALTER TABLE..UPDATE` を避けて、代わりに新しいデータを既存のデータと一緒に挿入する方が実際には効率的である場合があります。データが古いか新しいかを示すカラムを追加することもできます… 実際にこの動作をうまく実装しているテーブルエンジンがあり、古いデータを自動的に削除します。どのように機能するか見てみましょう。

外部システムを使用してHacker Newsコメントの表示回数を追跡しており、数時間ごとにデータをClickHouseにプッシュしたいとします。古い行を削除し、新しい行が各Hacker Newsコメントの新しい状態を表すことを希望します。この動作を実装するために`CollapsingMergeTree`を使用できます。

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

`hackernews_views` テーブルには、**サイン**カラムとして呼ばれる `Int8` カラムがあることに注意してください。サインカラムの名前は任意ですが、`Int8` データ型が必要であり、サインカラム名は `CollapsingMergeTree` テーブルのコンストラクタに渡されます。

`CollapsingMergeTree` テーブルのサインカラムとは何ですか？ 行の _状態_ を表し、サインカラムは1または-1のみを持つことができます。以下のように機能します：

- 2つの行が同じ主キー（またはそれが主キーと異なる場合は同じソート順）を持ち、サインカラムの値が異なる場合、最後に挿入された +1 の行が状態行となり、他の行は互いにキャンセルされます。
- 互いにキャンセルされる行はマージ中に削除されます。
- 対応するペアがない行は保持されます。

`hackernews_views` テーブルに行を追加しましょう。この主キーの唯一の行なので、状態を1に設定します：

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, 1)
```

次に、`views` カラムを変更したいとします。既存の行をキャンセルする行と、新しい状態を含む行の2行を挿入します：

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, -1),
   (123, 'ricardo', 150, 1)
```

テーブルには、主キー `(123, 'ricardo')` を持つ3行があります：

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

`FINAL` を追加すると、現在の状態行が返されることに注意してください：

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

もちろん、大きなテーブルで `FINAL` を使用することは推奨されません。

:::note
例において `views` カラムに渡された値は実際には必要ありませんし、古い行の `views` の現在の値と一致する必要もありません。実際には、主キーと-1だけで行をキャンセルすることが可能です：

```sql
INSERT INTO hackernews_views(id, author, sign) VALUES
   (123, 'ricardo', -1)
```
:::

## 複数のスレッドからのリアルタイム更新 {#real-time-updates-from-multiple-threads}

`CollapsingMergeTree` テーブルでは、行がサインカラムを使用して互いにキャンセルし、行の状態は最後に挿入された行によって決定されます。しかし、行が順番に挿入されない場合、異なるスレッドから行を挿入していると、これは問題になる可能性があります。この状況では、「最後」の行を使用することは機能しません。

ここで `VersionedCollapsingMergeTree` が便利になります - これは、`CollapsingMergeTree` と同様に行をキャンセルしますが、最後に挿入された行を保持する代わりに、指定したバージョンカラムの最大値を持つ行を保持します。

例を見てみましょう。Hacker Newsのコメントの表示回数を追跡したいとし、データが頻繁に更新されるとします。レポートには、強制的にまたはマージを待つことなく最新の値を使用したいです。私たちは、`CollapsedMergeTree` に似たテーブルから始めますが、行の状態のバージョンを保存するカラムを追加します：

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

テーブルは `VersionsedCollapsingMergeTree` をエンジンとして使用し、**サインカラム**と**バージョンカラム**を渡していることに注意してください。以下のように機能します：

- 同じ主キーとバージョンを持つ行の各ペアを削除し、サインが異なる場合。
- 行が挿入された順序は重要ではありません。
- バージョンカラムが主キーの一部でない場合、ClickHouseはそれを暗黙的に主キーとして最後のフィールドに追加します。

クエリを書く際にも同様のロジックを使用します - 主キーでグループ化し、まだ削除されていないキャンセルされた行を回避する賢いロジックを使用します。`hackernews_views_vcmt` テーブルにいくつかの行を追加しましょう：

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, 1, 1),
   (2, 'ch_fan', 0, 1, 1),
   (3, 'kenny', 0, 1, 1)
```

次に、2つの行を更新し、そのうちの1つを削除します。行をキャンセルするには、以前のバージョン番号を含めることを忘れないでください（それが主キーの一部であるため）：

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, -1, 1),
   (1, 'ricardo', 50, 1, 2),
   (2, 'ch_fan', 0, -1, 1),
   (3, 'kenny', 0, -1, 1),
   (3, 'kenny', 1000, 1, 2)
```

以前と同じクエリを実行し、サインカラムに基づいて巧みに値を加算および減算します：

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

結果は2行になります：

```response
┌─id─┬─author──┬─sum(multiply(views, sign))─┐
│  1 │ ricardo │                         50 │
│  3 │ kenny   │                       1000 │
└────┴─────────┴────────────────────────────┘
```

テーブルのマージを強制しましょう：

```sql
OPTIMIZE TABLE hackernews_views_vcmt
```

結果には2行だけが存在するはずです：

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

複数のクライアントやスレッドから行を挿入する際に重複排除を実装したい場合、`VersionedCollapsingMergeTree` テーブルは非常に便利です。

## なぜ行が重複排除されないのか？ {#why-arent-my-rows-being-deduplicated}

挿入された行が重複排除されない理由の一つは、`INSERT` 文で非冪等関数または式を使用している場合です。例えば、`createdAt DateTime64(3) DEFAULT now()` カラムを持つ行を挿入している場合、各行には `createdAt` カラムのユニークなデフォルト値が設定されるため、行がユニークであることが保証されます。MergeTree / ReplicatedMergeTree テーブルエンジンは、各挿入された行がユニークなチェックサムを生成するため、行を重複排除することができません。

この場合、同じバッチの複数の挿入が同じ行の再挿入を引き起こさないように、各バッチの行に対して独自の `insert_deduplication_token` を指定することができます。この設定の使用方法についての詳細は、 [insert_deduplication_tokenに関するドキュメント](/operations/settings/settings#insert_deduplication_token) を参照してください。
