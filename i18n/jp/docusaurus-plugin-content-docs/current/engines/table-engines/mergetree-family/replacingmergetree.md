---
description: 'MergeTree とは異なり、同じソートキー値（`PRIMARY KEY` ではなくテーブルの `ORDER BY` セクション）を持つ重複した行を削除します。'
sidebar_label: 'ReplacingMergeTree'
sidebar_position: 40
slug: /engines/table-engines/mergetree-family/replacingmergetree
title: 'ReplacingMergeTree テーブルエンジン'
doc_type: 'reference'
---



# ReplacingMergeTree テーブルエンジン

このエンジンは、同じ [ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md) の値（`PRIMARY KEY` ではなくテーブル定義の `ORDER BY` 句）を持つ重複行を削除する点で、[MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) と異なります。

データの重複排除はマージ時にのみ行われます。マージはバックグラウンドでいつ実行されるか分からないため、それを前提にした計画は立てられません。一部のデータは未処理のまま残る場合があります。`OPTIMIZE` クエリを使用して任意のタイミングでマージを実行することはできますが、`OPTIMIZE` クエリは大量のデータを読み書きするため、これに依存しないでください。

したがって、`ReplacingMergeTree` はバックグラウンドで重複データを削除して容量を節約する用途には適していますが、重複が一切存在しないことを保証するものではありません。

:::note
ベストプラクティスやパフォーマンス最適化の方法を含む ReplacingMergeTree の詳細なガイドは[こちら](/guides/replacing-merge-tree)にあります。
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

リクエストパラメータの詳細については、[ステートメントの説明](../../../sql-reference/statements/create/table.md)を参照してください。

:::note
行の一意性は`PRIMARY KEY`ではなく、`ORDER BY`句によって決定されます。
:::


## ReplacingMergeTreeのパラメータ {#replacingmergetree-parameters}

### `ver` {#ver}

`ver` — バージョン番号を持つカラム。型は`UInt*`、`Date`、`DateTime`、または`DateTime64`。オプションパラメータ。

マージ時、`ReplacingMergeTree`は同じソートキーを持つすべての行から1つのみを残します:

- `ver`が設定されていない場合、選択内の最後の行。選択とは、マージに参加するパーツのセット内の行のセットです。最も最近作成されたパート(最後の挿入)が選択内の最後になります。したがって、重複排除後、各一意のソートキーに対して最新の挿入からの最後の行が残ります。
- `ver`が指定されている場合、最大バージョンを持つ行。複数の行で`ver`が同じ場合、それらに対して「`ver`が指定されていない場合」のルールが使用されます。つまり、最も最近挿入された行が残ります。

例:

```sql
-- verなし - 最後に挿入された行が「勝つ」
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

### `is_deleted` {#is_deleted}

`is_deleted` — マージ中にこの行のデータが状態を表すか削除されるべきかを判断するために使用されるカラムの名前。`1`は「削除された」行、`0`は「状態」行を表します。

カラムのデータ型 — `UInt8`。

:::note
`is_deleted`は`ver`が使用されている場合にのみ有効にできます。

データに対する操作に関わらず、バージョンは増加させる必要があります。挿入された2つの行が同じバージョン番号を持つ場合、最後に挿入された行が保持されます。

デフォルトでは、ClickHouseはその行が削除行であってもキーに対する最後の行を保持します。これは、より低いバージョンを持つ将来の行を安全に挿入でき、削除行が引き続き適用されるようにするためです。

このような削除行を完全に削除するには、テーブル設定`allow_experimental_replacing_merge_with_cleanup`を有効にし、次のいずれかを実行します:

1. テーブル設定`enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`、`min_age_to_force_merge_on_partition_only`、および`min_age_to_force_merge_seconds`を設定します。パーティション内のすべてのパーツが`min_age_to_force_merge_seconds`より古い場合、ClickHouseはそれらをすべて単一のパーツにマージし、削除行を削除します。

2. 手動で`OPTIMIZE TABLE table [PARTITION partition | PARTITION ID 'partition_id'] FINAL CLEANUP`を実行します。
   :::

例:

```sql
-- verとis_deletedあり
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

```


select * from myThirdReplacingMT final;

0 行が返されました。経過時間: 0.003 秒。

-- is&#95;deleted が 1 の行を削除
OPTIMIZE TABLE myThirdReplacingMT FINAL CLEANUP;

INSERT INTO myThirdReplacingMT Values (1, &#39;first&#39;, &#39;2020-01-01 00:00:00&#39;, 0);

select * from myThirdReplacingMT final;

┌─key─┬─someCol─┬───────────eventTime─┬─is&#95;deleted─┐
│   1 │ first   │ 2020-01-01 00:00:00 │          0 │
└─────┴─────────┴─────────────────────┴────────────┘

```
```


## Query clauses {#query-clauses}

`ReplacingMergeTree`テーブルを作成する際は、`MergeTree`テーブルを作成する場合と同じ[句](../../../engines/table-engines/mergetree-family/mergetree.md)が必要です。

<details markdown="1">

<summary>非推奨のテーブル作成方法</summary>

:::note
新規プロジェクトではこの方法を使用せず、可能であれば既存プロジェクトも上記の方法に切り替えてください。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] ReplacingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [ver])
```

`ver`を除くすべてのパラメータは、`MergeTree`と同じ意味を持ちます。

- `ver` - バージョンを格納するカラム。オプションパラメータ。詳細については上記のテキストを参照してください。

</details>


## クエリ時の重複排除とFINAL {#query-time-de-duplication--final}

マージ時に、ReplacingMergeTreeは`ORDER BY`列(テーブル作成時に使用)の値を一意識別子として使用して重複行を識別し、最も高いバージョンのみを保持します。ただし、これは最終的な整合性のみを提供するものであり、行が重複排除されることを保証するものではないため、これに依存すべきではありません。そのため、更新行や削除行がクエリで考慮されることにより、クエリが不正確な結果を返す可能性があります。

正確な結果を得るには、バックグラウンドマージに加えて、クエリ時の重複排除と削除の除去を行う必要があります。これは`FINAL`演算子を使用することで実現できます。例えば、次の例を考えてみましょう:

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

`FINAL`を使用せずにクエリを実行すると、不正確なカウントが返されます(正確な結果はマージの状況によって異なります):

```sql
SELECT count()
FROM rmt_example

┌─count()─┐
│     200 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

`FINAL`を追加すると正確な結果が得られます:

```sql
SELECT count()
FROM rmt_example
FINAL

┌─count()─┐
│     100 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

`FINAL`のパフォーマンスを最適化する方法を含む詳細については、[ReplacingMergeTreeの詳細ガイド](/guides/replacing-merge-tree)をお読みいただくことをお勧めします。
