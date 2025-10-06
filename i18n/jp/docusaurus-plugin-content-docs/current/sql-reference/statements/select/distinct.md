---
'description': 'DISTINCT 句に関する Documentation'
'sidebar_label': 'DISTINCT'
'slug': '/sql-reference/statements/select/distinct'
'title': 'DISTINCT 句'
'doc_type': 'reference'
---


# DISTINCT句

`SELECT DISTINCT`が指定されている場合、クエリ結果には唯一の行のみが残ります。したがって、結果内の完全に一致する行のセットの中から、1行だけが残ります。

一意の値を持つ必要があるカラムのリストを指定できます：`SELECT DISTINCT ON (column1, column2,...)`。カラムが指定されていない場合、すべてのカラムが考慮されます。

テーブルを考慮してください：

```text
┌─a─┬─b─┬─c─┐
│ 1 │ 1 │ 1 │
│ 1 │ 1 │ 1 │
│ 2 │ 2 │ 2 │
│ 2 │ 2 │ 2 │
│ 1 │ 1 │ 2 │
│ 1 │ 2 │ 2 │
└───┴───┴───┘
```

カラムを指定せずに`DISTINCT`を使用する場合：

```sql
SELECT DISTINCT * FROM t1;
```

```text
┌─a─┬─b─┬─c─┐
│ 1 │ 1 │ 1 │
│ 2 │ 2 │ 2 │
│ 1 │ 1 │ 2 │
│ 1 │ 2 │ 2 │
└───┴───┴───┘
```

指定されたカラムで`DISTINCT`を使用する場合：

```sql
SELECT DISTINCT ON (a,b) * FROM t1;
```

```text
┌─a─┬─b─┬─c─┐
│ 1 │ 1 │ 1 │
│ 2 │ 2 │ 2 │
│ 1 │ 2 │ 2 │
└───┴───┴───┘
```

## DISTINCTとORDER BY {#distinct-and-order-by}

ClickHouseは、1つのクエリ内で異なるカラムに対して`DISTINCT`と`ORDER BY`句を使用することをサポートしています。`DISTINCT`句は、`ORDER BY`句の前に実行されます。

テーブルを考慮してください：

```text
┌─a─┬─b─┐
│ 2 │ 1 │
│ 1 │ 2 │
│ 3 │ 3 │
│ 2 │ 4 │
└───┴───┘
```

データを選択する場合：

```sql
SELECT DISTINCT a FROM t1 ORDER BY b ASC;
```

```text
┌─a─┐
│ 2 │
│ 1 │
│ 3 │
└───┘
```
異なる並び順でデータを選択する場合：

```sql
SELECT DISTINCT a FROM t1 ORDER BY b DESC;
```

```text
┌─a─┐
│ 3 │
│ 1 │
│ 2 │
└───┘
```

行`2, 4`はソート前にカットされました。

クエリをプログラミングする際には、この実装の特性を考慮してください。

## NULL処理 {#null-processing}

`DISTINCT`は、[NULL](/sql-reference/syntax#null)を特定の値のように扱い、`NULL==NULL`とします。言い換えれば、`DISTINCT`の結果では、`NULL`を含む異なる組み合わせは1回だけ発生します。これは、ほとんどの他のコンテキストでの`NULL`処理とは異なります。

## 代替案 {#alternatives}

同じセットの値に対して[GROUP BY](/sql-reference/statements/select/group-by)を適用することで、同じ結果を得ることができます。集約関数を使用することなく、`SELECT`句で指定されたものです。ただし、`GROUP BY`アプローチにはいくつかの違いがあります：

- `DISTINCT`は`GROUP BY`と一緒に適用できます。
- [ORDER BY](../../../sql-reference/statements/select/order-by.md)が省略され、[LIMIT](../../../sql-reference/statements/select/limit.md)が定義されている場合、クエリは必要な異なる行の数が読み取られた直後に停止します。
- データブロックは、クエリ全体が完了するのを待たずに処理されたとおりに出力されます。
