---
slug: /engines/table-engines/mergetree-family/replacingmergetree
sidebar_position: 40
sidebar_label:  ReplacingMergeTree
title: "ReplacingMergeTree"
description: "MergeTreeとは異なり、同じソートキー値（`ORDER BY` テーブルセクション、`PRIMARY KEY` ではない）を持つ重複エントリを削除します。"
---


# ReplacingMergeTree

このエンジンは、同じ[ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md)値（`ORDER BY` テーブルセクション、`PRIMARY KEY` ではない）を持つ重複エントリを削除する点で[MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree)と異なります。

データの重複排除は、マージ中のみに発生します。マージは、未知の時点でバックグラウンドで行われるため、それを計画することはできません。一部のデータは処理されないまま残る場合があります。`OPTIMIZE` クエリを使用して、予定外のマージを実行することはできますが、`OPTIMIZE` クエリは大量のデータを読み書きするため、これを頼りにしないでください。

したがって、`ReplacingMergeTree` は、スペースを節約するためにバックグラウンドで重複データをクリアするのに適していますが、重複の不在を保証するものではありません。

:::note
最適化やベストプラクティスに関する詳細なガイドは、[こちら](/guides/replacing-merge-tree)をご覧ください。
:::

## テーブルの作成 {#creating-a-table}

``` sql
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
行のユニーク性は、`ORDER BY` テーブルセクションによって決定され、`PRIMARY KEY` ではありません。
:::

## ReplacingMergeTree パラメータ {#replacingmergetree-parameters}

### ver {#ver}

`ver` — バージョン番号を持つカラム。型は `UInt*`、`Date`、`DateTime` または `DateTime64`。オプションのパラメータです。

マージ時に、`ReplacingMergeTree` は同じソートキーを持つ行の中から一つだけを残します：

   - `ver`が設定されていない場合、選択内の最後の行が残ります。選択は、マージに参加しているパーツの行のセットです。最も最近作成されたパーツ（最後の挿入）が、選択の中で最後のものになります。したがって、重複排除後には、最も最近の挿入からの行がそれぞれのユニークなソートキーに対して残ります。
   - `ver`が指定されている場合は、最大バージョンのものが残ります。同じバージョンの行が複数ある場合、`ver`が指定されていない場合のルールが適用されるため、最も最近の挿入された行が残ります。

例：

```sql
-- verなし - 最後に挿入されたものが「勝つ」
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


-- verあり - 最大のverを持つ行が「勝つ」
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

`is_deleted` — マージ時にこの行のデータが状態を表すか削除されるべきかを判断するために使用されるカラムの名前。`1` は「削除された」行、`0` は「状態」行を表します。

  カラムのデータ型は `UInt8` です。

:::note
`is_deleted` は、`ver` が使用されている場合のみ有効にできます。

行は `OPTIMIZE ... FINAL CLEANUP` の場合にのみ削除されます。この `CLEANUP` 特殊キーワードは、`allow_experimental_replacing_merge_with_cleanup` MergeTree設定が有効になっていない限り、デフォルトでは許可されていません。

データに対する操作にかかわらず、バージョンは増加しなければなりません。同じバージョン番号の挿入された行が2つある場合、最後に挿入された行が保持されます。

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

-- is_deletedを使って行を削除
OPTIMIZE TABLE myThirdReplacingMT FINAL CLEANUP;

INSERT INTO myThirdReplacingMT Values (1, 'first', '2020-01-01 00:00:00', 0);

select * from myThirdReplacingMT final;

┌─key─┬─someCol─┬───────────eventTime─┬─is_deleted─┐
│   1 │ first   │ 2020-01-01 00:00:00 │          0 │
└─────┴─────────┴─────────────────────┴────────────┘
```

## クエリ句 {#query-clauses}

`ReplacingMergeTree` テーブルを作成する際には、`MergeTree` テーブルを作成する際と同様の[句](../../../engines/table-engines/mergetree-family/mergetree.md)が必要です。

<details markdown="1">

<summary>テーブル作成のための廃止された方法</summary>

:::note
新しいプロジェクトではこの方法を使用せず、可能であれば古いプロジェクトを上記の方法に切り替えてください。
:::

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] ReplacingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [ver])
```

`ver`を除くすべてのパラメータは、`MergeTree` と同じ意味を持ちます。

- `ver` - バージョンを持つカラム。オプションのパラメータ。詳細は上記のテキストを参照してください。

</details>

## クエリ時の重複排除 & FINAL {#query-time-de-duplication--final}

マージ時に、`ReplacingMergeTree` は重複行を特定し、テーブル作成に使用された `ORDER BY` カラムの値をユニーク識別子として使用し、最高のバージョンのみを保持します。ただし、これは最終的な正確性のみを提供し、行が確実に重複排除されることは保証されませんので、これを信頼しないでください。したがって、クエリは、更新および削除された行がクエリに考慮されるため、不正確な結果を生成する可能性があります。

正確な結果を得るためには、ユーザーはバックグラウンドマージとクエリ時の重複排除および削除を補完する必要があります。これは、`FINAL` 演算子を使用することで達成できます。以下の例を考えてみてください：

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
`FINAL`なしでクエリをすると、不正確なカウントが得られます（正確な結果はマージに依存して変動します）：

```sql
SELECT count()
FROM rmt_example

┌─count()─┐
│     200 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

`FINAL`を追加すると、正しい結果が得られます：

```sql
SELECT count()
FROM rmt_example
FINAL

┌─count()─┐
│     100 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

`FINAL`の詳細や性能を最適化する方法については、当社の[詳細ガイド](/guides/replacing-merge-tree)をご覧いただくことをお勧めします。
