---
description: 'DISTINCT 句に関するドキュメント'
sidebar_label: 'DISTINCT'
slug: /sql-reference/statements/select/distinct
title: 'DISTINCT 句'
doc_type: 'reference'
---



# DISTINCT 句

`SELECT DISTINCT` が指定されている場合、クエリ結果には一意の行だけが残ります。つまり、結果内で完全に一致する行の集合ごとに、1 行だけが残ります。

一意でなければならない値を持つ列のリストを指定できます: `SELECT DISTINCT ON (column1, column2,...)`。列が指定されていない場合、すべての列が考慮されます。

次のテーブルを考えます:

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

列を指定せずに `DISTINCT` を使用する：

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

特定の列に対して `DISTINCT` を使用する:

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


## DISTINCT と ORDER BY

ClickHouse では、1 つのクエリ内で `DISTINCT` 句と `ORDER BY` 句に異なる列を指定できます。`DISTINCT` 句は `ORDER BY` 句より先に実行されます。

次のテーブルを例にします。

```text
┌─a─┬─b─┐
│ 2 │ 1 │
│ 1 │ 2 │
│ 3 │ 3 │
│ 2 │ 4 │
└───┴───┘
```

データの選択：

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

ソート順を変えてデータを取得する:

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

行 `2, 4` はソートの前に除外されました。

クエリを記述する際には、このような実装上の特性を考慮してください。


## NULL の処理 {#null-processing}

`DISTINCT` は、[`NULL`](/sql-reference/syntax#null) を特定の値であり、かつ `NULL==NULL` が成り立つかのように扱います。言い換えると、`DISTINCT` の結果においては、`NULL` を含む異なる組み合わせは 1 回しか出現しません。これは、他のほとんどのコンテキストにおける `NULL` の処理とは異なります。



## 代替方法 {#alternatives}

集約関数を一切使用せずに、`SELECT` 句で指定されたものと同じ値の集合に対して [GROUP BY](/sql-reference/statements/select/group-by) を適用することで、同じ結果を得ることも可能です。ただし、この場合は `GROUP BY` を用いる方法とはいくつかの違いがあります。

- `DISTINCT` は `GROUP BY` と一緒に適用できます。
- [ORDER BY](../../../sql-reference/statements/select/order-by.md) が省略され、かつ [LIMIT](../../../sql-reference/statements/select/limit.md) が指定されている場合、クエリは必要な数の異なる行を読み取った時点で直ちに実行を停止します。
- データブロックはクエリ全体の実行完了を待たずに、処理され次第順次出力されます。
