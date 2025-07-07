---
'description': '主キーとは異なり、同じソートキー値（`ORDER BY`テーブルセクションではなく`PRIMARY KEY`）を持つ重複エントリを削除します。'
'sidebar_label': 'ReplacingMergeTree'
'sidebar_position': 40
'slug': '/engines/table-engines/mergetree-family/replacingmergetree'
'title': 'ReplacingMergeTree'
---




# ReplacingMergeTree

このエンジンは、[MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree)と異なり、同じ[ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md)値（`ORDER BY`テーブルセクション、ではなく`PRIMARY KEY`）を持つ重複エントリを削除します。

データの重複削除は、マージ中にのみ発生します。マージは不明な時間にバックグラウンドで行われるため、計画を立てることはできません。一部のデータは未処理のまま残ることがあります。`OPTIMIZE`クエリを使用して非スケジュールのマージを実行することができますが、大量のデータを読み書きするため、これを利用することは期待しないでください。

したがって、`ReplacingMergeTree`は、スペースを節約するためにバックグラウンドで重複データをクリアするのに適していますが、重複が存在しないことを保証するものではありません。

:::note
ReplacingMergeTreeに関する詳細なガイド、ベストプラクティス、パフォーマンスの最適化方法については、[こちら](/guides/replacing-merge-tree)をご覧ください。
:::

## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = ReplacingMergeTree([ver [, is_deleted]])
[PARTITION BY expr]
[ORDER BY expr]
[PRIMARY KEY expr]
[SAMPLE BY expr]
[SETTINGS name=value, ...]
```

リクエストパラメータの説明については、[ステートメントの説明](../../../sql-reference/statements/create/table.md)を参照してください。

:::note
行の一意性は、`PRIMARY KEY`ではなく、`ORDER BY`テーブルセクションによって決まります。
:::

## ReplacingMergeTreeのパラメータ {#replacingmergetree-parameters}

### ver {#ver}

`ver` — バージョン番号を持つカラム。型は`UInt*`、`Date`、`DateTime`または`DateTime64`。オプションのパラメータです。

マージ時に、`ReplacingMergeTree`は同じソートキーを持つすべての行から1つだけを残します：

- `ver`が設定されていない場合は、選択内の最後の行が残ります。選択とは、マージに参加するパーツのセット内の行の集合です。最も最近作成されたパート（最後の挿入）が選択内の最後の行になります。したがって、重複削除後は、各ユニークなソートキーに対して、最新の挿入から最後の行が残ります。
- `ver`が指定されている場合は、最大バージョンの行が残ります。複数の行が同じ`ver`を持つ場合、それに対して「`ver`が指定されていない場合」と同じルールが適用されるため、最も最近挿入された行が残ります。

例：

```sql
-- verなし - 最後に挿入されたものが"勝つ"
CREATE TABLE myFirstReplacingMT
(
    `key` Int64,
    `someCol` String,
    `eventTime` DateTime
)
ENGINE = ReplacingMergeTree
ORDER BY key;

INSERT INTO myFirstReplacingMT Values (1, 'first', '2020-01-01 01:01:01');
INSERT INTO myFirstReplacingMT Values (1, 'second', '2020-01-01 00:00:00');

SELECT * FROM myFirstReplacingMT FINAL;

┌─key─┬─someCol─┬───────────eventTime─┐
│   1 │ second  │ 2020-01-01 00:00:00 │
└─────┴─────────┴─────────────────────┘


-- verあり - 最大のverを持つ行が"勝つ"
CREATE TABLE mySecondReplacingMT
(
    `key` Int64,
    `someCol` String,
    `eventTime` DateTime
)
ENGINE = ReplacingMergeTree(eventTime)
ORDER BY key;

INSERT INTO mySecondReplacingMT Values (1, 'first', '2020-01-01 01:01:01');
INSERT INTO mySecondReplacingMT Values (1, 'second', '2020-01-01 00:00:00');

SELECT * FROM mySecondReplacingMT FINAL;

┌─key─┬─someCol─┬───────────eventTime─┐
│   1 │ first   │ 2020-01-01 01:01:01 │
└─────┴─────────┴─────────────────────┘
```

### is_deleted {#is_deleted}

`is_deleted` — マージ中に、データがこの行における状態か、削除されるべきかを判定するために使用されるカラムの名前；`1`は「削除された」行、`0`は「状態」行です。

カラムのデータ型は`UInt8`です。

:::note
`is_deleted`は、`ver`が使用されている場合にのみ有効にできます。

データに対する操作に関わらず、バージョンは増加させる必要があります。挿入された2つの行が同じバージョン番号を持つ場合、最後に挿入された行が保持されます。

デフォルトでは、ClickHouseはキーに対して最後の行を保持します。たとえその行が削除行であってもです。今後の低バージョンの行が安全に挿入できるようにし、削除行が適用され続けるからです。

このような削除行を永続的にドロップするには、テーブル設定`allow_experimental_replacing_merge_with_cleanup`を有効にし、次のいずれかを行います：

1. テーブル設定`enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`、`min_age_to_force_merge_on_partition_only`、および`min_age_to_force_merge_seconds`を設定します。パーティション内のすべてのパーツが`min_age_to_force_merge_seconds`よりも古い場合、ClickHouseはそれらをすべて1つのパートにマージし、削除行を取り除きます。

2. 手動で`OPTIMIZE TABLE table [PARTITION partition | PARTITION ID 'partition_id'] FINAL CLEANUP`を実行します。
:::

例：
```sql
-- verとis_deletedを使用
CREATE OR REPLACE TABLE myThirdReplacingMT
(
    `key` Int64,
    `someCol` String,
    `eventTime` DateTime,
    `is_deleted` UInt8
)
ENGINE = ReplacingMergeTree(eventTime, is_deleted)
ORDER BY key
SETTINGS allow_experimental_replacing_merge_with_cleanup = 1;

INSERT INTO myThirdReplacingMT Values (1, 'first', '2020-01-01 01:01:01', 0);
INSERT INTO myThirdReplacingMT Values (1, 'first', '2020-01-01 01:01:01', 1);

select * from myThirdReplacingMT final;

0 rows in set. Elapsed: 0.003 sec.

-- is_deletedを使用して削除行を削除
OPTIMIZE TABLE myThirdReplacingMT FINAL CLEANUP;

INSERT INTO myThirdReplacingMT Values (1, 'first', '2020-01-01 00:00:00', 0);

select * from myThirdReplacingMT final;

┌─key─┬─someCol─┬───────────eventTime─┬─is_deleted─┐
│   1 │ first   │ 2020-01-01 00:00:00 │          0 │
└─────┴─────────┴─────────────────────┴────────────┘
```

## クエリ句 {#query-clauses}

`ReplacingMergeTree`テーブルを作成する際には、`MergeTree`テーブルを作成する際と同じ[句](../../../engines/table-engines/mergetree-family/mergetree.md)が必要です。

<details markdown="1">

<summary>テーブルを作成するための非推奨の方法</summary>

:::note
新しいプロジェクトではこの方法を使用せず、可能であれば古いプロジェクトを上記の方法に切り替えてください。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] ReplacingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [ver])
```

`ver`を除くすべてのパラメータは`MergeTree`と同じ意味を持ちます。

- `ver` - バージョンを持つカラム。オプションのパラメータです。詳細については、上記のテキストを参照してください。

</details>

## クエリ時の重複排除とFINAL {#query-time-de-duplication--final}

マージ時に、`ReplacingMergeTree`は重複した行を識別し、テーブル作成時に使用された`ORDER BY`カラムの値を一意の識別子として利用し、最高バージョンのみを保持します。しかし、これは最終的に正しい結果を提供するものであり、行が重複しないことを保証するものではなく、これを期待すべきではありません。したがって、クエリは更新および削除行がクエリに考慮されるため、不正確な回答を生成することがあります。

正しい回答を得るには、ユーザーはバックグラウンドのマージを補完し、クエリ時の重複排除と削除処理を行う必要があります。これは、`FINAL`演算子を使用することで達成できます。たとえば、次の例を考えます：

```sql
CREATE TABLE rmt_example
(
    `number` UInt16
)
ENGINE = ReplacingMergeTree
ORDER BY number

INSERT INTO rmt_example SELECT floor(randUniform(0, 100)) AS number
FROM numbers(1000000000)

0 rows in set. Elapsed: 19.958 sec. Processed 1.00 billion rows, 8.00 GB (50.11 million rows/s., 400.84 MB/s.)
```
`FINAL`を使わずにクエリを実行すると、不正確なカウントが生成されます（正確な結果はマージに応じて変わることがあります）：

```sql
SELECT count()
FROM rmt_example

┌─count()─┐
│     200 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

`FINAL`を追加すると正しい結果が得られます：

```sql
SELECT count()
FROM rmt_example
FINAL

┌─count()─┐
│     100 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

`FINAL`の詳細、パフォーマンスの最適化については、[ReplacingMergeTreeに関する詳細ガイド](/guides/replacing-merge-tree)をお読みになることをお勧めします。
