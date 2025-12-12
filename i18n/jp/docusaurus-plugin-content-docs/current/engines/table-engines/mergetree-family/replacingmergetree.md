---
description: 'MergeTree と異なり、同じソートキーの値（`ORDER BY` テーブルセクションで定義されるものであり、
  `PRIMARY KEY` ではありません）を持つ重複エントリを削除します。'
sidebar_label: 'ReplacingMergeTree'
sidebar_position: 40
slug: /engines/table-engines/mergetree-family/replacingmergetree
title: 'ReplacingMergeTree テーブルエンジン'
doc_type: 'reference'
---

# ReplacingMergeTree テーブルエンジン {#replacingmergetree-table-engine}

このエンジンは、[MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) とは異なり、同じ[ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md)値（テーブル定義の `ORDER BY` セクションで指定されるもので、`PRIMARY KEY` ではありません）を持つ重複エントリを削除します。

データの重複排除はマージ時にのみ行われます。マージはバックグラウンドで不定のタイミングで実行されるため、そのタイミングを前提として計画することはできません。一部のデータは未処理のまま残る可能性があります。`OPTIMIZE` クエリを使用してオンデマンドでマージを実行することもできますが、`OPTIMIZE` クエリは大量のデータを読み書きするため、それに依存しないでください。

したがって、`ReplacingMergeTree` はバックグラウンドで重複データを削除してディスク使用量を削減する用途には適していますが、重複がまったく存在しないことを保証するものではありません。

:::note
ベストプラクティスやパフォーマンス最適化の方法を含む ReplacingMergeTree の詳細なガイドは[こちら](/guides/replacing-merge-tree)にあります。
:::

## テーブルを作成する {#creating-a-table}

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

リクエストパラメータの詳細については、[ステートメントの説明](../../../sql-reference/statements/create/table.md)を参照してください。

:::note
行の一意性は `PRIMARY KEY` ではなく、テーブルの `ORDER BY` 句によって決定されます。
:::

## ReplacingMergeTree のパラメーター {#replacingmergetree-parameters}

### `ver` {#ver}

`ver` — バージョン番号を保持するカラム。型は `UInt*`、`Date`、`DateTime` または `DateTime64`。省略可能なパラメーターです。

マージ時に、`ReplacingMergeTree` は同じソートキーを持つすべての行のうち 1 行だけを残します：

* `ver` が設定されていない場合は、選択集合の中で最後の行。選択集合とは、マージに参加するパーツ集合内の行の集合のことです。もっとも最近作成されたパーツ（最後に挿入されたもの）が選択集合の中で最後になります。したがって、重複排除後は、もっとも新しい挿入からのそれぞれの一意なソートキーについて、いちばん最後の行が残ります。
* `ver` が指定されている場合は、最大のバージョンを持つ行。複数の行で `ver` が同じ場合、それらには「`ver` が指定されていない場合」のルールが適用されます。つまり、もっとも最近に挿入された行が残ります。

Example:

```sql
-- without ver - the last inserted 'wins'
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


-- with ver - the row with the biggest ver 'wins'
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

### `is_deleted` {#is_deleted}

`is_deleted` — マージ処理の際に、この行のデータが「状態」を表すのか、あるいは削除対象なのかを判定するために使用されるカラム名です。`1` は「削除された」行、`0` は「状態」の行を表します。

カラムのデータ型 — `UInt8`。

:::note
`is_deleted` は `ver` が使用されている場合にのみ有効化できます。

どのようなデータ操作であっても、バージョン番号は増加させる必要があります。2 つの挿入行が同じバージョン番号を持つ場合、後から挿入された行が保持されます。

デフォルトでは、ClickHouse はキーに対して最後の行を保持し、その行が削除行であっても保持します。これは、将来より低いバージョンの行が挿入された場合でも、安全に挿入でき、その削除行が引き続き適用されるようにするためです。

このような削除行を恒久的に削除するには、テーブル設定 `allow_experimental_replacing_merge_with_cleanup` を有効にし、次のいずれかを実行します。

1. テーブル設定 `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`、`min_age_to_force_merge_on_partition_only`、`min_age_to_force_merge_seconds` を設定します。パーティション内のすべてのパーツが `min_age_to_force_merge_seconds` より古い場合、ClickHouse はそれらを
   1 つのパーツにマージし、すべての削除行を削除します。

2. 手動で `OPTIMIZE TABLE table [PARTITION partition | PARTITION ID 'partition_id'] FINAL CLEANUP` を実行します。
   :::

Example:

```sql
-- with ver and is_deleted
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

-- delete rows with is_deleted
OPTIMIZE TABLE myThirdReplacingMT FINAL CLEANUP;

INSERT INTO myThirdReplacingMT Values (1, 'first', '2020-01-01 00:00:00', 0);

select * from myThirdReplacingMT final;

┌─key─┬─someCol─┬───────────eventTime─┬─is_deleted─┐
│   1 │ first   │ 2020-01-01 00:00:00 │          0 │
└─────┴─────────┴─────────────────────┴────────────┘
```

select * from myThirdReplacingMT final;

0 rows in set. Elapsed: 0.003 sec.

-- is&#95;deleted が設定されている行を削除
OPTIMIZE TABLE myThirdReplacingMT FINAL CLEANUP;

INSERT INTO myThirdReplacingMT Values (1, &#39;first&#39;, &#39;2020-01-01 00:00:00&#39;, 0);

select * from myThirdReplacingMT final;

┌─key─┬─someCol─┬───────────eventTime─┬─is&#95;deleted─┐
│   1 │ first   │ 2020-01-01 00:00:00 │          0 │
└─────┴─────────┴─────────────────────┴────────────┘

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] ReplacingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [ver])
```

## クエリ句 {#query-clauses}

`ReplacingMergeTree` テーブルを作成する場合は、`MergeTree` テーブルを作成する場合と同様に、同じ [句](../../../engines/table-engines/mergetree-family/mergetree.md) が必要です。

<details markdown="1">

<summary>テーブル作成の非推奨な方法</summary>

:::note
新しいプロジェクトではこの方法を使用しないでください。可能であれば、既存のプロジェクトも上記で説明した方法に切り替えてください。
:::

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

`ver` を除くすべてのパラメータは、`MergeTree` の場合と同じ意味を持ちます。

- `ver` - バージョンを表すカラム。省略可能なパラメータです。詳細については上記の説明を参照してください。

</details>

## クエリ時の重複排除と `FINAL` {#query-time-de-duplication--final}

マージ処理の際に、ReplacingMergeTree は `ORDER BY` 列（テーブル作成時に使用した列）の値を一意の識別子として用いて重複行を識別し、最も新しいバージョンのみを保持します。ただし、これはあくまで最終的な整合性しか提供せず、行が必ず重複排除されることを保証するものではないため、これに依存すべきではありません。その結果、更新行や削除行がクエリで考慮されることにより、クエリが誤った結果を返す可能性があります。

正しい結果を得るためには、バックグラウンドでのマージ処理に加えて、クエリ時の重複排除および削除済み行の除去を行う必要があります。これは `FINAL` 演算子を使用することで実現できます。例えば、次の例を考えてみます。

```sql
SELECT count()
FROM rmt_example

┌─count()─┐
│     200 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

`FINAL` を指定せずにクエリすると、不正確なカウント結果になります（具体的な値はマージ状況によって変動します）。

```sql
SELECT count()
FROM rmt_example
FINAL

┌─count()─┐
│     100 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

`FINAL` を追加すると、正しい結果が得られます。

```sql
SELECT count()
FROM rmt_example
FINAL

┌─count()─┐
│     100 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

`FINAL` の詳細や `FINAL` のパフォーマンス最適化方法については、[ReplacingMergeTree に関する詳細ガイド](/guides/replacing-merge-tree) を参照することを推奨します。`
