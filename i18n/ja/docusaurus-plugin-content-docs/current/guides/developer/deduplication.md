---
slug: /guides/developer/deduplication
sidebar_label: 重複排除戦略
sidebar_position: 3
description: 頻繁なアップサート、更新、および削除を行う必要がある場合に重複排除を使用します。
---

# 重複排除戦略

**重複排除**とは、***データセットの重複行を削除するプロセス***を指します。OLTPデータベースでは、各行が一意の主キーを持っているため、簡単に実行できますが、その代償として挿入が遅くなります。挿入された各行はまず検索され、見つかった場合は置き換えられる必要があります。

ClickHouseは、データ挿入の速度を重視して設計されています。ストレージファイルは不変であり、ClickHouseは行を挿入する前に既存の主キーを確認しないため、重複排除にはもう少し手間がかかります。これは、重複排除が即時ではなく**最終的**であることを意味し、いくつかの副作用があります：

- いつでも、テーブルには重複（同じソートキーを持つ行）が存在する可能性があります
- 実際の重複行の削除は、パーツのマージ中に発生します
- クエリは重複の可能性を考慮する必要があります

<div class='transparent-table'>

|||
|------|----|
|<img src={require('./images/Deduplication.png').default} class="image" alt="Cassandra logo" style={{width: '16rem', 'background-color': 'transparent'}}/>|ClickHouseは重複排除やその他のトピックに関する無料トレーニングを提供しています。 [データの削除と更新トレーニングモジュール](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)は、学び始める良い場所です。|

</div>

## 重複排除の選択肢 {#options-for-deduplication}

重複排除は、以下のテーブルエンジンを使用してClickHouseで実装されています：

1. `ReplacingMergeTree` テーブルエンジン：このテーブルエンジンでは、同じソートキーを持つ重複行がマージ中に削除されます。`ReplacingMergeTree`は、アップサートの動作を模倣する良い選択肢です（クエリが最後に挿入された行を返すことを望む場合）。

2. 行の崩壊：`CollapsingMergeTree` と `VersionedCollapsingMergeTree` テーブルエンジンは、既存の行が「キャンセル」され、新しい行が挿入されるというロジックを使用します。これらは `ReplacingMergeTree` よりも実装が複雑ですが、クエリや集計は、データがまだマージされているかどうかを心配せずに書くことができるため、簡潔です。これらの2つのテーブルエンジンは、データを頻繁に更新する必要がある場合に役立ちます。

これらの技術の両方を以下で説明します。詳細については、私たちの無料オンデマンド [データの削除と更新トレーニングモジュール](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)をチェックしてください。

## アップサートのための ReplacingMergeTree の使用 {#using-replacingmergetree-for-upserts}

Hacker Newsのコメントを含むテーブルに、コメントが表示された回数を表す`views`列がある簡単な例を見てみましょう。記事が公開されるときに新しい行が挿入され、値が増えた場合に1日1回総表示回数をアップサートすると仮定します：

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

`views`列を更新するために、同じ主キーを持つ新しい行を挿入します（`views`列の新しい値に注意）：

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

出力の上の別々のボックスは、裏での2つのパーツを示しています。このデータはまだマージされていないため、重複行はまだ削除されていません。`FINAL`キーワードを`SELECT`クエリで使用してみましょう。これは、クエリ結果の論理的なマージをもたらします：

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
`FINAL`を使用するのはデータ量が少ない場合は問題ありません。多量のデータを扱う場合は、`FINAL`を使用することはおそらく最良の選択肢ではありません。列の最新の値を見つけるためのより良い選択肢について話し合いましょう...
:::

### FINALの回避 {#avoiding-final}

両方のユニークな行の`views`列を再度更新してみましょう：

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 150),
   (2, 'ch_fan', 'This is post #2', 250)
```

テーブルは現在6行あります。実際のマージはまだ行われていません（`FINAL`を使用したときのクエリ時のマージのみです）。

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

`FINAL`の代わりにビジネスロジックを使用しましょう。`views`列が常に増加していることがわかっているので、選択した列でグループ化の後に最大値を取得するために`max`関数を使用します：

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

上記のようにグループ化することで、`FINAL`キーワードを使用するよりも効率的（クエリパフォーマンスの観点で）である可能性があります。

私たちの[データの削除と更新トレーニングモジュール](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)では、この例を展開し、`ReplacingMergeTree`との`version`列の使用方法も含まれています。

## 列の頻繁な更新のための CollapsingMergeTree の使用 {#using-collapsingmergetree-for-updating-columns-frequently}

列を更新することは、既存の行を削除し、新しい値で置き換えることを含みます。すでに見たように、ClickHouseでは、この種類の変更は_最終的に_発生します - マージ中に。ただし、更新する行が多い場合、`ALTER TABLE..UPDATE`を回避し、既存のデータと新しいデータを一緒に挿入する方が効率的です。データが古いか新しいかを示す列を追加できます…そして、この動作を非常にうまく実装しているテーブルエンジンがあります。特に、古いデータを自動的に削除することを考慮すると、どのように機能するか見てみましょう。

Hacker Newsのコメントの表示数を外部システムで追跡し、数時間ごとにデータをClickHouseにプッシュすると仮定します。古い行を削除し、新しい行が各Hacker Newsコメントの新しい状態を示すようにしたいと思います。この動作を実装するために`CollapsingMergeTree`を使用します。

表示数を格納するためのテーブルを定義しましょう：

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

`hackernews_views`テーブルには、**sign**列と呼ばれる`Int8`型の列があることに注意してください。sign列の名前は任意ですが、`Int8`データ型は必要です。また、sign列の名前は`CollapsingMergeTree`テーブルのコンストラクタに渡されました。

`CollapsingMergeTree`テーブルのsign列とは何でしょうか？それは行の_状態_を表し、sign列は1または-1のみをとることができます。以下はその動作です：

- 二つの行が同じ主キー（またはそれが主キーと異なる場合は別のソート順）を持っているが、sign列の値が異なる場合、+1の行が最終的な状態の行となり、他の行はお互いをキャンセルします
- お互いをキャンセルする行はマージ中に削除されます
- 対応するペアがない行は保持されます

`hackernews_views`テーブルに行を追加しましょう。この主キーに対する唯一の行であるため、その状態を1に設定します：

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, 1)
```

次に、`views`列を変更したいとします。既存の行をキャンセルする行と行の新しい状態を含む行を挿入します：

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, -1),
   (123, 'ricardo', 150, 1)
```

テーブルには現在、主キー`(123, 'ricardo')`を持つ3行があります：

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

`FINAL`を追加すると、現在の状態の行を返します：

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

しかし、もちろん、大きなテーブルに対して`FINAL`を使用することは推奨されません。

:::note
私たちの例で`views`列に渡される値は本当に必要ありませんし、古い行の`views`の現在の値と一致する必要もありません。実際、主キーと-1だけで行をキャンセルすることができます：

```sql
INSERT INTO hackernews_views(id, author, sign) VALUES
   (123, 'ricardo', -1)
```
:::

## 複数スレッドからのリアルタイム更新 {#real-time-updates-from-multiple-threads}

`CollapsingMergeTree`テーブルでは、行はsign列を使用してお互いをキャンセルし、行の状態は最後に挿入された行によって決定されます。しかし、異なるスレッドから行を挿入している場合、行が順不同で挿入される可能性があるため、これは問題となる可能性があります。この状況では、「最後の」行は機能しません。

ここで`VersionedCollapsingMergeTree`が便利です - これは`CollapsingMergeTree`のように行を崩壊させますが、最後に挿入された行ではなく、指定されたバージョン列の最大値を持つ行を保持します。

例を見てみましょう。Hacker Newsのコメントの表示数を追跡し、データが頻繁に更新されると仮定します。最新の値をレポートに使用したいが、マージを強制したり待機したくないとします。`CollapsedMergeTree`に似たテーブルから開始しますが、行の状態を表すためのバージョンを格納する列を追加します：

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

テーブルは`VersionsedCollapsingMergeTree`をエンジンとして使用し、**sign列**と**バージョン列**を渡します。以下は、このテーブルがどのように機能するかです：

- 同じ主キーとバージョンを持ち、異なるsignを持つ各ペアの行を削除します
- 行が挿入された順序は重要ではありません
- バージョン列が主キーの一部でない場合、ClickHouseはそれを最後のフィールドとして暗黙的に主キーに追加します

クエリを書くときも同じタイプのロジックを使用します - 主キーでグループ化し、まだ削除されていないキャンセルされた行を回避するために巧妙なロジックを使用します。`hackernews_views_vcmt`テーブルにいくつかの行を追加しましょう：

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, 1, 1),
   (2, 'ch_fan', 0, 1, 1),
   (3, 'kenny', 0, 1, 1)
```

次に、テーブルの2行を更新し、そのうちの1行を削除します。行をキャンセルするには、以前のバージョン番号を必ず含める必要があります（主キーの一部であるため）：

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, -1, 1),
   (1, 'ricardo', 50, 1, 2),
   (2, 'ch_fan', 0, -1, 1),
   (3, 'kenny', 0, -1, 1),
   (3, 'kenny', 1000, 1, 2)
```

再び、sign列に基づいて巧妙に値を加算および減算する同じクエリを実行します：

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

テーブルのマージを強制してみます：

```sql
OPTIMIZE TABLE hackernews_views_vcmt
```

結果には、2行のみが含まれるはずです：

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

`VersionedCollapsingMergeTree`テーブルは、複数のクライアントやスレッドから行を挿入する際に、重複排除を実装したい場合に非常に便利です。

## 行が重複排除されない理由 {#why-arent-my-rows-being-deduplicated}

挿入された行が重複排除されない理由の一つは、`INSERT`ステートメントに非冪等関数や式を使用している場合です。例えば、`createdAt DateTime64(3) DEFAULT now()`列を持つ行を挿入している場合、各行には`createdAt`列の一意のデフォルト値があるため、ユニークであることが保証されます。MergeTree / ReplicatedMergeTreeテーブルエンジンは、挿入された行が一意のチェックサムを生成するため、行を重複排除することを知りません。

この場合、同じバッチの複数の挿入が同じ行を再挿入しないようにするために、各行バッチの`insert_deduplication_token`を指定できます。この設定の使用方法についての詳細は、[insert_deduplication_tokenに関するドキュメント](/operations/settings/settings#insert_deduplication_token)を参照してください。
