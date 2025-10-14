---
'description': 'CoalescingMergeTree は MergeTree エンジンから派生します。その主な特徴は、パーツのマージ中に各カラムの最後の非
  NULL 値を自動的に保存する機能です。'
'sidebar_label': 'CoalescingMergeTree'
'sidebar_position': 50
'slug': '/engines/table-engines/mergetree-family/coalescingmergetree'
'title': 'CoalescingMergeTree'
'keywords':
- 'CoalescingMergeTree'
'show_related_blogs': true
'doc_type': 'reference'
---


# CoalescingMergeTree

:::note
バージョン 25.6 から利用可能
このテーブルエンジンは、バージョン 25.6 以降の OSS と Cloud の両方で利用可能です。
:::

このエンジンは [MergeTree](/engines/table-engines/mergetree-family/mergetree) を継承しています。主な違いは、データパーツがマージされる方法にあります。`CoalescingMergeTree` テーブルでは、ClickHouse が同じ主キー（より正確には、同じ [ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md)）を持つすべての行を、各カラムの最新の非NULL値を含む単一の行に置き換えます。

これにより、カラムレベルのアップサートが可能になり、全行ではなく特定のカラムのみを更新できます。

`CoalescingMergeTree` は、非キーのカラムにあらかじめ Nullable 型を持つデータの使用を意図しています。カラムが Nullable でない場合、動作は [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) と同じです。

## テーブル作成 {#creating-a-table}

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

### CoalescingMergeTree のパラメータ {#parameters-of-coalescingmergetree}

#### カラム {#columns}

`columns` - 値が結合されるカラムの名前を持つタプル。オプショナルパラメータ。
    カラムは数値型でなければならず、パーティションやソートキーには含まれてはいけません。

 `columns` が指定されていない場合、ClickHouse はソートキーに含まれないすべてのカラムの値を結合します。

### クエリ句 {#query-clauses}

`CoalescingMergeTree` テーブルを作成する際には、`MergeTree` テーブルを作成する場合と同様の [句](../../../engines/table-engines/mergetree-family/mergetree.md) が必要です。

<details markdown="1">

<summary>テーブル作成のための非推奨メソッド</summary>

:::note
新しいプロジェクトではこの方法を使用せず、可能であれば古いプロジェクトを上記で説明した方法に切り替えてください。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] CoalescingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [columns])
```

`columns` を除くすべてのパラメータは、`MergeTree` と同じ意味を持ちます。

- `columns` — 値が合算されるカラムの名前を持つタプル。オプショナルパラメータ。詳細については、上記のテキストを参照してください。

</details>

## 使用例 {#usage-example}

次のテーブルを考えます：

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

データを挿入します：

```sql
INSERT INTO test_table VALUES(1, NULL, NULL, '2025-01-01'), (2, 10, 'test', NULL);
INSERT INTO test_table VALUES(1, 42, 'win', '2025-02-01');
INSERT INTO test_table(key, value_date) VALUES(2, '2025-02-01');
```

結果は次のようになります：

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

正確で最終的な結果のための推奨クエリ：

```sql
SELECT * FROM test_table FINAL ORDER BY key;
```

```text
┌─key─┬─value_int─┬─value_string─┬─value_date─┐
│   1 │        42 │ win          │ 2025-02-01 │
│   2 │        10 │ test         │ 2025-02-01 │
└─────┴───────────┴──────────────┴────────────┘
```

`FINAL` 修飾子を使用すると、クエリ時に ClickHouse がマージロジックを適用するため、各カラムに対して正しい結合された「最新」の値を取得できます。これは、CoalescingMergeTree テーブルからクエリを行う際に最も安全で正確な方法です。

:::note

`GROUP BY` を使用するアプローチは、基になるパーツが完全にマージされていない場合、誤った結果を返す可能性があります。

```sql
SELECT key, last_value(value_int), last_value(value_string), last_value(value_date)  FROM test_table GROUP BY key; -- Not recommended.
```

:::
