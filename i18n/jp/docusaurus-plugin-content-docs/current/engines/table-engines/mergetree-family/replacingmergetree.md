description: '主キーではなく、同じソートキー値 (`ORDER BY` テーブルセクション) を持つ重複エントリを削除することで MergeTree とは異なります。'
sidebar_label: 'ReplacingMergeTree'
sidebar_position: 40
slug: /engines/table-engines/mergetree-family/replacingmergetree
title: 'ReplacingMergeTree'
```


# ReplacingMergeTree

このエンジンは、[MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) とは異なり、同じ[ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md)値を持つ重複エントリを削除します（`ORDER BY` テーブルセクションであり、`主キー`ではありません）。

データの重複排除は、マージ中にのみ発生します。マージは、予測できない時間にバックグラウンドで行われるため、計画を立てることはできません。一部のデータは処理されないまま残る可能性があります。`OPTIMIZE` クエリを使用してスケジュール外のマージを実行することはできますが、`OPTIMIZE` クエリは大量のデータを読み書きするため、それに依存しないでください。

したがって、`ReplacingMergeTree` は、バックグラウンドで重複データを整理してスペースを節約するのに適していますが、重複がないことは保証しません。

:::note
ReplacingMergeTree に関する詳細なガイド、ベストプラクティス、パフォーマンスの最適化方法については、[こちら](/guides/replacing-merge-tree)をご覧ください。
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

リクエストパラメータの説明については、[文の説明](../../../sql-reference/statements/create/table.md)を参照してください。

:::note
行の一意性は、`ORDER BY` テーブルセクションによって決定され、`主キー`ではありません。
:::

## ReplacingMergeTree パラメータ {#replacingmergetree-parameters}

### ver {#ver}

`ver` — バージョン番号を持つカラム。`UInt*`、`Date`、`DateTime`、または `DateTime64` のタイプ。オプションのパラメータです。

マージ時に、`ReplacingMergeTree` は同じソートキーを持つすべての行から1つだけを残します。

   - `ver` が指定されていない場合、選択の中で最後のもの。選択は、マージに参加しているパーツのセット内の行の集合です。最も最近作成されたパート（最後の挿入）が選択の中で最後となります。したがって、重複排除後には、各ユニークソートキーに対して、最新の挿入からの最後の行のみが残ります。
   - `ver` が指定された場合、最大バージョンのものが残ります。複数の行の `ver` が同じ場合、"`ver` が指定されていない場合" のルールが適用されます。つまり、最も最近挿入された行が残ります。

例：

```sql
-- ver を指定しない場合 - 最後に挿入されたものが「勝ち」
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


-- ver を指定した場合 - 最大の ver を持つ行が「勝ち」
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

`is_deleted` — マージ中に、この行のデータが状態を表しているか、削除されるかを判断するために使用されるカラムの名前; `1` は「削除された」行、`0` は「状態」行を示します。

カラムのデータ型 — `UInt8`。

:::note
`is_deleted` は、`ver` が使用されている場合のみ有効にできます。

データに対する操作にかかわらず、バージョンは増加する必要があります。挿入された行のうち、同じバージョン番号を持つものがある場合、最後に挿入された行が保持されます。

デフォルトでは、ClickHouse はキーの最後の行を保持します。たとえその行が削除行であってもそうです。これは、将来の行が低いバージョンで安全に挿入でき、削除行が適用されるためです。

そのような削除行を永久に削除するには、テーブル設定 `allow_experimental_replacing_merge_with_cleanup` を有効にし、次のいずれかを実行します。

1. テーブル設定 `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`、`min_age_to_force_merge_on_partition_only`、および `min_age_to_force_merge_seconds` を設定します。パーティション内のすべてのパーツが `min_age_to_force_merge_seconds` より古い場合、ClickHouse はそれらすべてを単一のパートにマージし、削除行をすべて削除します。

2. 手動で `OPTIMIZE TABLE table [PARTITION partition | PARTITION ID 'partition_id'] FINAL CLEANUP` を実行します。
:::

例：
```sql
-- ver と is_deleted を使用した場合
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

-- is_deleted を持つ行を削除
OPTIMIZE TABLE myThirdReplacingMT FINAL CLEANUP;

INSERT INTO myThirdReplacingMT Values (1, 'first', '2020-01-01 00:00:00', 0);

select * from myThirdReplacingMT final;

┌─key─┬─someCol─┬───────────eventTime─┬─is_deleted─┐
│   1 │ first   │ 2020-01-01 00:00:00 │          0 │
└─────┴─────────┴─────────────────────┴────────────┘
```

## クエリ句 {#query-clauses}

`ReplacingMergeTree` テーブルを作成する際には、`MergeTree` テーブルを作成する際と同様に、同じ[句](../../../engines/table-engines/mergetree-family/mergetree.md)が必要です。

<details markdown="1">

<summary>テーブルを作成するための非推奨メソッド</summary>

:::note
新しいプロジェクトではこの方法を使用しないでください。可能であれば、古いプロジェクトを上記で説明した方法に切り替えてください。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] ReplacingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [ver])
```

`ver` を除くすべてのパラメータは、`MergeTree` と同じ意味を持ちます。

- `ver` - バージョンを持つカラム。オプションのパラメータ。説明については、上記のテキストを参照してください。

</details>

## クエリ時の重複排除 & FINAL {#query-time-de-duplication--final}

マージの際、ReplacingMergeTree は重複行を識別し、テーブルを作成するために使用される `ORDER BY` カラムの値を一意の識別子として使用し、最も高いバージョンのみを保持します。しかし、これは最終的な正しさを提供するのみであり、行が重複排除されることは保証されず、依存しない方が良いです。したがって、クエリは更新や削除行がクエリで考慮されるため、正しくない回答を生成する可能性があります。

正しい回答を得るには、ユーザーはバックグラウンドのマージをクエリ時の重複排除と削除の除去で補完する必要があります。これは `FINAL` 演算子を使用することで達成できます。例えば、次の例を考えてみましょう：

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
`FINAL` なしでクエリを発行すると不正確なカウントが得られます（正確な結果はマージに依存します）：

```sql
SELECT count()
FROM rmt_example

┌─count()─┐
│     200 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

`FINAL` を追加すると正しい結果が得られます：

```sql
SELECT count()
FROM rmt_example
FINAL

┌─count()─┐
│     100 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

`FINAL` の詳細やパフォーマンス最適化については、弊社の[ReplacingMergeTree に関する詳細なガイド](/guides/replacing-merge-tree)をお勧めします。
