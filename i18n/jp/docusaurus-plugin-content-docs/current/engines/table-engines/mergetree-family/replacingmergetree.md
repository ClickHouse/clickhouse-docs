---
'description': 'は、同じソートキー値 (`ORDER BY` テーブルセクション、`PRIMARY KEY` ではなく) の重複エントリを削除する点で
  MergeTree と異なります。'
'sidebar_label': 'ReplacingMergeTree'
'sidebar_position': 40
'slug': '/engines/table-engines/mergetree-family/replacingmergetree'
'title': 'ReplacingMergeTree'
'doc_type': 'reference'
---


# ReplacingMergeTree

このエンジンは、[MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree)とは異なり、同じ[ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md)値（`ORDER BY`テーブルセクション、`PRIMARY KEY`ではない）を持つ重複エントリを削除します。

データの重複排除は、マージ中にのみ行われます。マージは、未知の時点でバックグラウンドで発生するため、計画することはできません。データの一部は未処理のまま残る場合があります。`OPTIMIZE`クエリを使用して非スケジュールのマージを実行することは可能ですが、`OPTIMIZE`クエリは大量のデータを読み書きするため、それに依存するべきではありません。

したがって、`ReplacingMergeTree`は、スペースを節約するためにバックグラウンドで重複データをクリーンアップするのに適していますが、重複がないことを保証するものではありません。

:::note
ReplacingMergeTreeに関する詳細なガイド、ベストプラクティス、およびパフォーマンスを最適化する方法は、[こちら](/guides/replacing-merge-tree)で利用できます。
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
行の一意性は、`PRIMARY KEY`ではなく`ORDER BY`テーブルセクションによって決定されます。
:::

## ReplacingMergeTreeパラメータ {#replacingmergetree-parameters}

### `ver` {#ver}

`ver` — バージョン番号を持つカラム。タイプは`UInt*`、`Date`、`DateTime`、または`DateTime64`。オプションのパラメータです。

マージ中に、`ReplacingMergeTree` は同じソートキーを持つすべての行から1つだけを残します。

- `ver`が設定されていない場合は、選択内の最後の行。選択は、マージに参加するパーツセット内の行の集合です。最も最近作成されたパート（最後の挿入）が、選択内では最後になります。したがって、重複排除後には、最新の挿入からの最終行が各ユニークソートキーについて残ります。
- `ver`が指定されている場合は、最大バージョンのもの。`ver`が複数の行で同じ場合、それらについては「`ver`が指定されていない場合の規則」が適用され、つまり、最も最近挿入された行が残ります。

例:

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

`is_deleted` — マージ中にデータがこの行の状態を表しているか、削除されるべきかを判断するために使用されるカラムの名前。`1`は「削除された」行、`0`は「状態」行です。

カラムのデータ型は`UInt8`です。

:::note
`is_deleted`は、`ver`が使用されている時のみ有効にできます。

データに対する操作にかかわらず、バージョンは増加するべきです。挿入された2つの行が同じバージョン番号を持つ場合、最後に挿入された行が保持されます。

デフォルトでは、ClickHouseはキーの最後の行を保持しますが、その行が削除行であってもです。これにより、将来的に低いバージョンを持つ行が安全に挿入でき、削除行が適用されたままになります。

そのような削除行を恒久的に削除するには、テーブル設定`allow_experimental_replacing_merge_with_cleanup`を有効にし、以下のいずれかを設定します：

1. テーブルの設定`enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`、`min_age_to_force_merge_on_partition_only`、および`min_age_to_force_merge_seconds`を設定します。もしパーティション内のすべてのパーツが`min_age_to_force_merge_seconds`より古い場合、ClickHouseはそれらすべてを1つのパートにマージし、削除行を削除します。

2. 手動で`OPTIMIZE TABLE table [PARTITION partition | PARTITION ID 'partition_id'] FINAL CLEANUP`を実行します。
:::

例:
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

## クエリ句 {#query-clauses}

`ReplacingMergeTree`テーブルを作成する際には、`MergeTree`テーブルを作成する際と同様の[句](../../../engines/table-engines/mergetree-family/mergetree.md)が必要です。

<details markdown="1">

<summary>テーブル作成のための廃止された方法</summary>

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

`ver`を除くすべてのパラメータは、`MergeTree`と同じ意味を持ちます。

- `ver` - バージョンを持つカラム。オプションのパラメータ。詳細については上記のテキストを参照してください。

</details>

## クエリ時の重複排除とFINAL {#query-time-de-duplication--final}

マージ時に、`ReplacingMergeTree`は重複行を特定し、テーブル作成時に使用された`ORDER BY`カラムの値を一意の識別子として用い、最高のバージョンのみを保持します。しかし、これは最終的な整合性のみを提供します — 行が重複排除されることを保証するものではなく、それに頼るべきではありません。したがって、クエリは、更新及び削除行がクエリで考慮されるため、不正確な結果を生成する可能性があります。

正しい結果を得るためには、ユーザーはバックグラウンドでのマージをクエリ時の重複排除および削除除去で補完する必要があります。これは、`FINAL`演算子を使用することで達成できます。例えば、以下の例を考えてみてください：

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
`FINAL`なしでのクエリでは不正確なカウントが得られます（正確な結果はマージによって変わる）。

```sql
SELECT count()
FROM rmt_example

┌─count()─┐
│     200 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

`FINAL`を追加することで正しい結果が得られます：

```sql
SELECT count()
FROM rmt_example
FINAL

┌─count()─┐
│     100 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

`FINAL`の最適化方法など、`FINAL`に関する詳細は、私たちの[ReplacingMergeTreeに関する詳細なガイド](/guides/replacing-merge-tree)をご覧ください。
