---
slug: /engines/table-engines/mergetree-family/replacingmergetree
sidebar_position: 40
sidebar_label:  ReplacingMergeTree
title: "ReplacingMergeTree"
description: "MergeTreeとは異なり、同じソートキー値（`ORDER BY`テーブルセクション、`PRIMARY KEY`ではない）の重複エントリを削除します。"
---

# ReplacingMergeTree

このエンジンは、重複エントリを同じ[ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md)値（`ORDER BY`テーブルセクション、`PRIMARY KEY`ではない）で削除する点で[MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md#table_engines-mergetree)とは異なります。

データの重複排除は、マージ中にのみ発生します。マージはバックグラウンドで不明な時点で行われるため、事前に計画することはできません。一部のデータは未処理のまま残る可能性があります。スケジュール外のマージを`OPTIMIZE`クエリを使用して実行することもできますが、`OPTIMIZE`クエリは大量のデータを読み書きするため、それに頼ることはできません。

したがって、`ReplacingMergeTree`は、重複データをバックグラウンドで削除してスペースを節約するのに適していますが、重複が存在しないことを保証するものではありません。

:::note
ReplacingMergeTreeの詳細ガイド、ベストプラクティス、パフォーマンス最適化については[こちら](/guides/replacing-merge-tree)をご覧ください。
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

リクエストパラメータの説明については、[ステートメントの説明](../../../sql-reference/statements/create/table.md)をご覧ください。

:::note
行のユニーク性は`ORDER BY`テーブルセクションによって決定され、`PRIMARY KEY`によっては決定されません。
:::

## ReplacingMergeTreeのパラメータ {#replacingmergetree-parameters}

### ver {#ver}

`ver` — バージョン番号を持つカラム。型は`UInt*`、`Date`、`DateTime`または`DateTime64`。任意のパラメータです。

マージ時に、`ReplacingMergeTree`は同じソートキーを持つすべての行から1つだけを残します：

   - `ver`が設定されていない場合は、選択した中で最後の行です。選択は、マージに参加しているパーツのセット内の行の集合です。最も最近作成されたパート（最後の挿入）が選択の最後になります。したがって、重複排除の後、各ユニークソートキーに対して最も最近の挿入の最後の行が残ります。
   - `ver`が指定された場合は、最大バージョンの行が残ります。`ver`が複数の行で同じ場合は、「`ver`が指定されていない場合」のルールが適用され、すなわち最も最近挿入された行が残ります。

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


-- verあり - 一番大きなverの行が「勝つ」
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

`is_deleted` — マージ中にこの行のデータが状態を表しているか削除されるべきかを判断するために使用されるカラムの名前。`1`は「削除された」行、`0`は「状態」行です。

カラムのデータ型は`UInt8`です。

:::note
`is_deleted`は`ver`が使用されている場合にのみ有効にできます。

行は`OPTIMIZE ... FINAL CLEANUP`の時だけ削除されます。この`CLEANUP`特殊キーワードは、`allow_experimental_replacing_merge_with_cleanup`のMergeTree設定が有効にされていない限り、デフォルトでは使用できません。

データに対する操作に関わらず、バージョンは増加しなければなりません。2つの挿入された行が同じバージョン番号を持つ場合、最後に挿入された行が保持されます。

:::

例：
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

select * from myThirdReplacingMT final;

0 rows in set. Elapsed: 0.003 sec.

-- is_deletedで行を削除
OPTIMIZE TABLE myThirdReplacingMT FINAL CLEANUP;

INSERT INTO myThirdReplacingMT Values (1, 'first', '2020-01-01 00:00:00', 0);

select * from myThirdReplacingMT final;

┌─key─┬─someCol─┬───────────eventTime─┬─is_deleted─┐
│   1 │ first   │ 2020-01-01 00:00:00 │          0 │
└─────┴─────────┴─────────────────────┴────────────┘
```

## クエリ句 {#query-clauses}

`ReplacingMergeTree`テーブルを作成する際には、`MergeTree`テーブルを作成する場合と同様に[句](../../../engines/table-engines/mergetree-family/mergetree.md)が必要です。

<details markdown="1">

<summary>テーブル作成のための非推奨メソッド</summary>

:::note
新しいプロジェクトではこの方法を使用しないでください。可能であれば、古いプロジェクトを上記の方法に切り替えてください。
:::

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] ReplacingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [ver])
```

`ver`を除くすべてのパラメータは、`MergeTree`と同じ意味を持ちます。

- `ver` - バージョンを持つカラム。任意のパラメータです。説明については上記のテキストをご覧ください。

</details>

## クエリ時の重複排除とFINAL {#query-time-de-duplication--final}

マージ時に、ReplacingMergeTreeは重複行を特定し、テーブルを作成するために使用された`ORDER BY`カラムの値をユニークな識別子として使用し、最高のバージョンのみを保持します。しかし、これは最終的な正確さを提供するだけで、重複行が排除されることを保証するものではなく、これに頼らないでください。そのため、クエリは、更新や削除された行がクエリで考慮されるため、正しくない結果を生成する可能性があります。

正しい結果を得るために、ユーザーはバックグラウンドマージにクエリ時の重複排除と削除の除去を補完する必要があります。これは、`FINAL`オペレーターを使用することで達成できます。次の例を考えてみましょう：

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
`FINAL`なしでクエリを実行すると、間違ったカウントが生成されます（正確な結果はマージの状況に応じて異なります）：

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

`FINAL`のパフォーマンスを最適化する方法を含む詳細については、ReplacingMergeTreeに関する[詳細ガイド](/guides/replacing-merge-tree)を読むことをお勧めします。
