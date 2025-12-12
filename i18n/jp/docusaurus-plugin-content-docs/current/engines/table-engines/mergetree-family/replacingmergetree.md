# ReplacingMergeTree テーブルエンジン

このエンジンは[MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree)と異なり、同一の[ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md)値を持つ重複エントリを削除します（`ORDER BY`テーブルセクションのキーであり、`PRIMARY KEY`ではありません）。

データの重複排除はマージ処理中のみ行われます。マージ処理はバックグラウンドで不定期に実行されるため、計画的に実行することはできません。一部のデータは未処理のまま残る可能性があります。`OPTIMIZE`クエリを使用して非定期的なマージを実行することは可能ですが、大量のデータを読み書きするため、この方法に依存すべきではありません。

したがって、`ReplacingMergeTree` はスペース節約のためにバックグラウンドで重複データを消去するのに適していますが、重複の完全な排除を保証するものではありません。

:::note
ReplacingMergeTree の詳細ガイド（ベストプラクティスやパフォーマンス最適化方法を含む）は [こちら](/guides/replacing-merge-tree) で確認できます。
:::

## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...)
 ENGINE = ReplacingMergeTree([ver [, is_deleted]])
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

## ReplacingMergeTree パラメータ {#replacingmergetree-parameters}

### `ver` {#ver}

`ver` — バージョン番号を含む列。型は `UInt*`、`Date`、`DateTime` または `DateTime64`。オプションのパラメータ。

マージ時、同一ソートキーを持つ全行の `ReplacingMergeTree` は以下のいずれか1行のみを残します：

- `ver` が設定されていない場合、選択対象の最後尾の行。選択対象とは、マージに参加する複数のパーツ内の行集合を指します。最新に作成されたパーツ（最終挿入分）が選択対象の最後尾となります。したがって重複排除後、各一意のソートキーに対して最新挿入分の最末尾行が残存します。
- `ver`が指定されている場合、最大バージョンを持つ行。複数の行で`ver`が同一の場合、それらには「`ver`が指定されていない場合」のルールが適用され、つまり最新挿入行が残ります。

例:

```sql
-- verなし - 最新挿入行が優先
CREATE TABLE myFirstReplacingMT
(
    `key` Int64,
    `someCol` String,
    `eventTime` DateTime)

ENGINE = ReplacingMergeTree
ORDER BY key;

INSERT INTO myFirstReplacingMT Values (1, 『first』, 『2020-01-01 01:01:01』);
INSERT INTO myFirstReplacingMT Values (1, 『second』, 『2020-01-01 00:00:00』);

SELECT * FROM myFirstReplacingMT FINAL;

┌─key─┬─someCol─┬───────────eventTime─┐
│   1 │ second  │ 2020-01-01 00:00:00 │
└─────┴─────────┴─────────────────────┘


-- ver による - ver が最大の行が 『勝つ』
CREATE TABLE mySecondReplacingMT
(
    `key` Int64,
    `someCol` String,
    `eventTime` DateTime)

ENGINE = ReplacingMergeTree(eventTime)
ORDER BY key;

INSERT INTO mySecondReplacingMT Values (1, 『first』, 『2020-01-01 01:01:01』);
INSERT INTO mySecondReplacingMT Values (1, 『second』, 『2020-01-01 00:00:00』);

SELECT * FROM mySecondReplacingMT FINAL;

┌─key─┬─someCol─┬───────────eventTime─┐
│   1 │ first   │ 2020-01-01 01:01:01 │
└─────┴─────────┴───────── ────────────┘
```

`is_deleted` {#is_deleted}

`is_deleted` — マージ時に、この行のデータが状態を表すか削除対象かを判断するために使用される列の名前。`1`は「削除済み」行、`0`は「状態」行を示す。

  列のデータ型 — `UInt8`。

:::note
`is_deleted` は `ver` が使用されている場合にのみ有効化できます。

データに対する操作の種類に関わらず、バージョン番号は増加させる必要があります。挿入された2つの行が同じバージョン番号を持つ場合、最後に挿入された行が保持されます。

デフォルトでは、ClickHouse はキーに対する最後の行を保持します。その行が削除行であっても同様です。これにより、将来的にバージョン番号が低い行を安全に挿入でき、削除行は依然として適用されます。

このような削除行を恒久的に削除するには、テーブル設定 `allow_experimental_replacing_merge_with_cleanup` を有効にし、以下のいずれかを実行します：

1. テーブル設定 `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`、`min_age_to_force_merge_on_partition_only`、`min_age_to_force_merge_seconds` を設定します。パーティション内の全パーティションが `min_age_to_force_merge_seconds` より古い場合、ClickHouse はそれらを単一パーティションにマージし、削除行を削除します。

2. 手動で `OPTIMIZE TABLE table [PARTITION partition | PARTITION ID 『partition_id』] FINAL CLEANUP` を実行します。
:::

例:
```sql
-- ver と is_deleted を使用
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

INSERT INTO myThirdReplacingMT Values (1, 『first』, 『2020-01-01 01:01:01』, 0);
INSERT INTO myThirdReplacingMT Values (1, 『first』, 『2020-01-01 01:01:01』, 1);

select * from myThirdReplacingMT final;

0 rows in set. Elapsed: 0.003 sec.

-- is_deleted のある行を削除
OPTIMIZE TABLE myThirdReplacingMT FINAL CLEANUP;

INSERT INTO myThirdReplacingMT Values (1, 『first』, 『2020-01-01 00:00:00』, 0);

select * from myThirdReplacingMT final;

┌─key─┬─someCol─┬───────────eventTime─┬─is_deleted─┐
│   1 │ first   │ 2020-01-01 00:00:00 │          0 │
└─────┴─────────┴─────────────────────┴────────────┘
```

## クエリ句 {#query-clauses}

`ReplacingMergeTree` テーブルを作成する際には、`MergeTree` テーブルを作成する場合と同様の [句](../../../engines/table-engines/mergetree-family/mergetree.md) が必要です。

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

`ver`を除く全てのパラメータは`MergeTree`と同様の意味を持ちます。

- `ver` - バージョンを保持する列。オプションパラメータ。詳細は上記の説明を参照してください。

</details>


## クエリ実行時の重複排除 & 最終版 {#query-time-de-duplication--final}

マージ処理時、ReplacingMergeTree は重複行を特定します。この際、テーブル作成に使用された `ORDER BY` 列の値を一意の識別子として用い、最高バージョンの行のみを保持します。ただし、これは最終的な正しさのみを提供します。行の重複排除を保証するものではなく、これに依存すべきではありません。したがって、更新や削除された行がクエリで考慮されるため、クエリは誤った結果を生成する可能性があります。

正しい結果を得るには、ユーザーはバックグラウンドマージをクエリ実行時の重複排除と削除行の除去で補完する必要があります。これは`FINAL`演算子を使用して実現できます。例えば、以下の例を考えてみましょう：

```sql
CREATE TABLE rmt_example
(
    `number` UInt16)

ENGINE = ReplacingMergeTree
ORDER BY number

INSERT INTO rmt_example SELECT floor(randUniform(0, 100)) AS number
FROM numbers(1000000000)

0 rows in set. 経過時間: 19.958 秒。処理行数: 10億行、8.00 GB (50.11万行/秒、400.84 MB/秒)
```
`FINAL` なしでクエリを実行すると、不正なカウント結果が生成されます（正確な結果はマージ操作によって変動します）。

```sql
SELECT count()
FROM rmt_example

┌─count()─┐
│     200 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

`FINAL`を追加すると正しい結果が得られます:

```sql
SELECT count()
FROM rmt_example
FINAL

┌─count()─┐
│     100 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

`FINAL`の詳細（`FINAL`のパフォーマンス最適化方法を含む）については、[ReplacingMergeTreeの詳細ガイド](/guides/replacing-merge-tree)の参照をお勧めします。