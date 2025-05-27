---
'slug': '/guides/developer/deduplication'
'sidebar_label': '重複排除戦略'
'sidebar_position': 3
'description': '頻繁なupsert、更新、削除を行う場合に、重複排除を使用します。'
'title': '重複排除戦略'
---

import deduplication from '@site/static/images/guides/developer/de_duplication.png';
import Image from '@theme/IdealImage';



# 重複排除戦略

**重複排除**とは、***データセットの重複行を削除するプロセス***を指します。OLTPデータベースでは、各行に一意の主キーがあるため、これを簡単に行うことができますが、挿入が遅くなるという代償があります。挿入されたすべての行は、まず検索され、もし見つかった場合には置き換えられる必要があります。

ClickHouseはデータ挿入の速度を考慮して構築されています。ストレージファイルは不変であり、ClickHouseは行を挿入する前に既存の主キーをチェックしないため、重複排除には少し余分な労力が必要です。これはまた、重複排除が即時に行われないことを意味します - **最終的**に行われるものであり、いくつかの副作用があります：

- いつでも、テーブルには重複（同じソートキーを持つ行）が存在する可能性があります
- 重複行の実際の削除はパーツのマージ中に発生します
- クエリは重複の可能性を考慮する必要があります

<div class='transparent-table'>

|||
|------|----|
|<Image img={deduplication}  alt="重複排除のロゴ" size="sm"/>|ClickHouseは、重複排除やその他多くのトピックに関する無料トレーニングを提供しています。  [データの削除と更新のトレーニングモジュール](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)は、始めるのに良い場所です。|

</div>

## 重複排除のオプション {#options-for-deduplication}

重複排除は、以下のテーブルエンジンを使用してClickHouseで実装されています。

1. `ReplacingMergeTree`テーブルエンジン：このテーブルエンジンでは、同じソートキーを持つ重複行がマージ中に削除されます。`ReplacingMergeTree`は、クエリが最後に挿入された行を返すようにしたい場合に、upsertの動作を模倣するのに良い選択です。

2. 行の崩壊：`CollapsingMergeTree`および`VersionedCollapsingMergeTree`テーブルエンジンは、既存の行が「キャンセル」され、新しい行が挿入されるというロジックを使用します。これらは`ReplacingMergeTree`よりも実装が複雑ですが、データがまだマージされているかどうかを気にせずに、クエリと集約を簡単に記述できます。これらの2つのテーブルエンジンは、データを頻繁に更新する必要がある場合に便利です。

以下に、これらのテクニックの両方を説明します。詳細については、無料のオンデマンド[データの削除と更新のトレーニングモジュール](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)をチェックしてください。

## ReplacingMergeTreeを使用したUpserts {#using-replacingmergetree-for-upserts}

テーブルがHacker Newsのコメントを含み、viewsカラムがコメントが閲覧された回数を示しているシンプルな例を見てみましょう。記事が公開されたときに新しい行を挿入し、もし値が増加した場合は、毎日合計閲覧数で新しい行をupsertするとします：

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

`views`カラムを更新するためには、同じ主キーで新しい行を挿入します（`views`カラムの新しい値に注意してください）：

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 100),
   (2, 'ch_fan', 'This is post #2', 200)
```

現在、テーブルには4行あります：

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

出力の上部の別々のボックスは、背後での2つのパーツを示しています - このデータはまだマージされていないため、重複行はまだ削除されていません。クエリ結果の論理的なマージを行うために、`SELECT`クエリで`FINAL`キーワードを使用しましょう：

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
`FINAL`を使用することは少量のデータであれば良好ですが、大量のデータを処理する場合、`FINAL`を使用することはお勧めできません。列の最新値を見つけるためのより良い選択肢を議論しましょう...
:::

### FINALの回避 {#avoiding-final}

ユニークな行の両方の`views`カラムを更新しましょう：

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 150),
   (2, 'ch_fan', 'This is post #2', 250)
```

現在、テーブルには6行あり、実際のマージはまだ行われておらず（`FINAL`を使用した際のクエリ時間のマージのみ）、

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

`FINAL`を使用する代わりに、ビジネスロジックを利用しましょう - `views`カラムは常に増加していると知っているので、希望するカラムでグループ化した後、`max`関数を使用して最大値を持つ行を選択します：

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

上記のクエリのようにグループ化することは、実際には`FINAL`キーワードを使用するよりも効率的（クエリ性能の観点から）です。

私たちの[データの削除と更新のトレーニングモジュール](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)では、この例を拡張し、`ReplacingMergeTree`で`version`カラムを使用する方法を含めます。

## columnsを頻繁に更新するためのCollapsingMergeTreeの使用 {#using-collapsingmergetree-for-updating-columns-frequently}

カラムを更新することは、既存の行を削除し、新しい値で置き換えることを含みます。すでに見たように、ClickHouseではこのタイプの変異は _最終的に_ 発生します - マージの際に。更新する行が多い場合、`ALTER TABLE..UPDATE`を避けて、既存のデータとともに新しいデータを挿入する方が実際には効率的であることがあります。データが古いか新しいかを示すカラムを追加することができ... 実際には、この動作を非常にうまく実装しているテーブルエンジンがあり、古いデータは自動的に削除されます。どのように機能するか見てみましょう。

外部システムを使用してHacker Newsのコメントの閲覧数を追跡し、数時間ごとにデータをClickHouseにプッシュするとしましょう。古い行を削除し、新しい行が各Hacker Newsのコメントの新しい状態を表すようにしたいと考えています。この動作を実装するために`CollapsingMergeTree`を使用できます。

閲覧数を保存するためのテーブルを定義しましょう：

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

`hackernews_views`テーブルには`Int8`型のsignというカラムがあります。これは**sign**カラムと呼ばれます。signカラムの名前は任意ですが、`Int8`データ型が必要であり、signカラムの名前は`CollapsingMergeTree`テーブルのコンストラクタに渡されました。

`CollapsingMergeTree`テーブルのsignカラムとは何でしょうか？それは行の_状態_ を表し、signカラムは1または-1のみ可能です。動作は次のとおりです：

- 二つの行が同じ主キー（または、主キーが異なる場合はソート順）を持ち、signカラムの値が異なる場合、+1で挿入された最後の行が状態行となり、他の行が互いにキャンセルされます。
- 互いにキャンセルされる行はマージの際に削除されます。
- 対になる行を持たない行は保持されます。

では、`hackernews_views`テーブルに行を追加しましょう。それがこの主キーの唯一の行なので、状態を1に設定します：

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, 1)
```

次に、`views`カラムを変更したいとします。既存の行をキャンセルする行と、その行の新しい状態を含む行の2行を挿入します：

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, -1),
   (123, 'ricardo', 150, 1)
```

テーブルには、主キー`(123, 'ricardo')`で3行があります：

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

`FINAL`を加えると、現在の状態行が返されます：

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

しかし、大きなテーブルに対して`FINAL`を使用することは推奨されません。

:::note
私たちの例で挿入した`views`カラムの値は実際には必要ありませんし、古い行の`views`の現在の値と一致する必要もありません。実際には、主キーと-1だけで行をキャンセルできます：

```sql
INSERT INTO hackernews_views(id, author, sign) VALUES
   (123, 'ricardo', -1)
```
:::

## 複数スレッドからのリアルタイム更新 {#real-time-updates-from-multiple-threads}

`CollapsingMergeTree`テーブルでは、行がsignカラムを使って互いにキャンセルされ、行の状態は最後に挿入された行によって決まります。しかし、異なるスレッドから行を挿入している場合、行が順序を無視して挿入される可能性があるため、これは問題になることがあります。「最後の」行を使用することは、この状況では機能しません。

ここで`VersionedCollapsingMergeTree`が便利です - これは`CollapsingMergeTree`のように行を崩しますが、最後に挿入された行ではなく、指定したバージョンカラムの最大値を持つ行を保持します。

例を見てみましょう。Hacker Newsのコメントの閲覧数を追跡したいとし、データが頻繁に更新されるとます。レポートには、強制的にマージを待つことなく最新の値を使用することを望みます。`CollapsedMergeTree`に類似したテーブルから始め、行の状態のバージョンを保存するためのカラムを追加しましょう：

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

テーブルは`VersionedCollapsingMergeTree`をエンジンとして使用し、**signカラム**と**versionカラム**を渡しています。テーブルの動作は次の通りです：

- 同じ主キーとバージョンを持ち、異なるsignを持つ行のペアが削除されます。
- 行が挿入された順序は重要ではありません。
- バージョンカラムが主キーの一部でない場合、ClickHouseはそれを暗黙的に主キーの最後のフィールドとして追加します。

クエリを書くときも同様のロジックを使用します - 主キーでグループ化し、キャンセルされているがまだ削除されていない行を避けるための巧妙なロジックを使用します。`hackernews_views_vcmt`テーブルに行を追加しましょう：

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, 1, 1),
   (2, 'ch_fan', 0, 1, 1),
   (3, 'kenny', 0, 1, 1)
```

次に、2行を更新し、そのうちの1行を削除します。行をキャンセルするためには、以前のバージョン番号を含めることを確認してください（それも主キーの一部であるため）：

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, -1, 1),
   (1, 'ricardo', 50, 1, 2),
   (2, 'ch_fan', 0, -1, 1),
   (3, 'kenny', 0, -1, 1),
   (3, 'kenny', 1000, 1, 2)
```

以前のように、signカラムに基づいて値を増加させたり減少させたりするクエリを実行します：

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

テーブルのマージを強制します：

```sql
OPTIMIZE TABLE hackernews_views_vcmt
```

結果には2行だけが表示されるはずです：

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

`VersionedCollapsingMergeTree`テーブルは、複数のクライアントおよび/またはスレッドから行を挿入しながら重複排除を実装したい場合に非常に便利です。

## なぜ行が重複排除されないのか？ {#why-arent-my-rows-being-deduplicated}

挿入された行が重複排除されない理由の一つは、`INSERT`文に非冪等関数または式を使用している場合です。例えば、`createdAt DateTime64(3) DEFAULT now()`というカラムを持つ行を挿入している場合、各行には`createdAt`カラムの一意のデフォルト値があるため、行は確実に一意です。MergeTree / ReplicatedMergeTreeテーブルエンジンは、挿入された各行が一意のチェックサムを生成するため、行を重複排除することはできません。

この場合、同じバッチの行が複数回挿入されても同じ行が再挿入されないように、各バッチごとに独自の`insert_deduplication_token`を指定できます。この設定の使用方法についての詳細は、[`insert_deduplication_token`に関するドキュメント](/operations/settings/settings#insert_deduplication_token)を参照してください。
