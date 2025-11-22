---
description: 'CoalescingMergeTree は MergeTree エンジンを継承します。その主な特長は、パーツのマージ中に各カラムごとに最後の非 NULL 値を自動的に保持できることです。'
sidebar_label: 'CoalescingMergeTree'
sidebar_position: 50
slug: /engines/table-engines/mergetree-family/coalescingmergetree
title: 'CoalescingMergeTree テーブルエンジン'
keywords: ['CoalescingMergeTree']
show_related_blogs: true
doc_type: 'reference'
---



# CoalescingMergeTree テーブルエンジン

:::note Available from version 25.6
このテーブルエンジンは、OSS と Cloud の両方でバージョン 25.6 以降で利用可能です。
:::

このエンジンは [MergeTree](/engines/table-engines/mergetree-family/mergetree) を継承しています。主な違いはデータパートのマージ方法です。`CoalescingMergeTree` テーブルでは、ClickHouse は同じ主キー（より正確には同じ [sorting key](../../../engines/table-engines/mergetree-family/mergetree.md)）を持つすべての行を、各カラムについて最新の NULL ではない値を含む 1 行に置き換えます。

これによりカラム単位でのアップサート（upsert）が可能になり、行全体ではなく特定のカラムだけを更新できます。

`CoalescingMergeTree` は、キー以外のカラムに Nullable 型を使用するケースでの利用を想定しています。カラムが Nullable でない場合、その動作は [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) と同じになります。



## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = CoalescingMergeTree([columns])
[PARTITION BY expr]
[ORDER BY expr]
[SAMPLE BY expr]
[SETTINGS name=value, ...]
```

リクエストパラメータの説明については、[リクエストの説明](../../../sql-reference/statements/create/table.md)を参照してください。

### CoalescingMergeTreeのパラメータ {#parameters-of-coalescingmergetree}

#### カラム {#columns}

`columns` - 値が統合されるカラム名のタプル。オプションパラメータ。
カラムは数値型である必要があり、パーティションキーまたはソートキーに含まれていてはなりません。

`columns`が指定されていない場合、ClickHouseはソートキーに含まれていないすべてのカラムの値を統合します。

### クエリ句 {#query-clauses}

`CoalescingMergeTree`テーブルを作成する際には、`MergeTree`テーブルを作成する場合と同じ[句](../../../engines/table-engines/mergetree-family/mergetree.md)が必要です。

<details markdown="1">

<summary>非推奨のテーブル作成方法</summary>

:::note
新しいプロジェクトではこの方法を使用せず、可能であれば既存のプロジェクトを上記で説明した方法に切り替えてください。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] CoalescingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [columns])
```

`columns`を除くすべてのパラメータは、`MergeTree`と同じ意味を持ちます。

- `columns` — 値が合計されるカラム名のタプル。オプションパラメータ。説明については、上記のテキストを参照してください。

</details>


## 使用例 {#usage-example}

次のテーブルを考えてみます:

```sql
CREATE TABLE test_table
(
    key UInt64,
    value_int Nullable(UInt32),
    value_string Nullable(String),
    value_date Nullable(Date)
)
ENGINE = CoalescingMergeTree()
ORDER BY key
```

データを挿入します:

```sql
INSERT INTO test_table VALUES(1, NULL, NULL, '2025-01-01'), (2, 10, 'test', NULL);
INSERT INTO test_table VALUES(1, 42, 'win', '2025-02-01');
INSERT INTO test_table(key, value_date) VALUES(2, '2025-02-01');
```

結果は次のようになります:

```sql
SELECT * FROM test_table ORDER BY key;
```

```text
┌─key─┬─value_int─┬─value_string─┬─value_date─┐
│   1 │        42 │ win          │ 2025-02-01 │
│   1 │      ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ         │ 2025-01-01 │
│   2 │      ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ         │ 2025-02-01 │
│   2 │        10 │ test         │       ᴺᵁᴸᴸ │
└─────┴───────────┴──────────────┴────────────┘
```

正確な最終結果を得るための推奨クエリ:

```sql
SELECT * FROM test_table FINAL ORDER BY key;
```

```text
┌─key─┬─value_int─┬─value_string─┬─value_date─┐
│   1 │        42 │ win          │ 2025-02-01 │
│   2 │        10 │ test         │ 2025-02-01 │
└─────┴───────────┴──────────────┴────────────┘
```

`FINAL`修飾子を使用すると、ClickHouseはクエリ実行時にマージロジックを適用し、各カラムの正確で統合された「最新」の値を取得できます。これはCoalescingMergeTreeテーブルに対してクエリを実行する際の最も安全で正確な方法です。

:::note

基礎となるパーツが完全にマージされていない場合、`GROUP BY`を使用する方法では誤った結果が返される可能性があります。

```sql
SELECT key, last_value(value_int), last_value(value_string), last_value(value_date)  FROM test_table GROUP BY key; -- 推奨されません。
```

:::
