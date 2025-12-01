---
description: 'ClickHouse における Nullable データ型修飾子に関するリファレンス'
sidebar_label: 'Nullable(T)'
sidebar_position: 44
slug: /sql-reference/data-types/nullable
title: 'Nullable(T)'
doc_type: 'reference'
---



# Nullable(T) {#nullablet}

`T` で許可されている通常の値に加えて、「値が存在しない」ことを示す特別なマーカー（[NULL](../../sql-reference/syntax.md)）を保存できます。例えば、`Nullable(Int8)` 型のカラムには `Int8` 型の値を保存でき、値を持たない行には `NULL` が保存されます。

`T` としては、複合データ型である [Array](../../sql-reference/data-types/array.md)、[Map](../../sql-reference/data-types/map.md)、[Tuple](../../sql-reference/data-types/tuple.md) のいずれも指定できませんが、複合データ型の要素として `Nullable` 型の値を含めることはできます（例: `Array(Nullable(Int8))`）。

`Nullable` 型のフィールドはテーブルのインデックスに含めることはできません。

ClickHouse サーバーの設定で別途指定しない限り、任意の `Nullable` 型のデフォルト値は `NULL` です。



## ストレージ機能 {#storage-features}

テーブル列に `Nullable` 型の値を格納するために、ClickHouse は値を格納する通常のファイルとは別に、`NULL` マスクを含むファイルを使用します。マスクファイル内のエントリによって、ClickHouse は各テーブル行について、`NULL` と、そのデータ型に対応するデフォルト値とを区別できます。追加のファイルが必要になるため、`Nullable` 列は、同等の通常列と比較して、より多くのストレージ容量を消費します。

:::note    
`Nullable` の使用は、ほとんど常にパフォーマンスを低下させます。この点を念頭に置いてデータベースを設計してください。
:::



## NULL の検索 {#finding-null}

列全体を読み取ることなく、`null` サブカラムを使って列内の `NULL` 値を特定できます。対応する値が `NULL` の場合は `1` を、それ以外の場合は `0` を返します。

**例**

クエリ:

```sql
CREATE TABLE nullable (`n` Nullable(UInt32)) ENGINE = MergeTree ORDER BY tuple();

INSERT INTO nullable VALUES (1) (NULL) (2) (NULL);

SELECT n.null FROM nullable;
```

結果:

```text
┌─n.null─┐
│      0 │
│      1 │
│      0 │
│      1 │
└────────┘
```


## 使用例 {#usage-example}

```sql
CREATE TABLE t_null(x Int8, y Nullable(Int8)) ENGINE TinyLog
```

```sql
INSERT INTO t_null VALUES (1, NULL), (2, 3)
```

```sql
SELECT x + y FROM t_null
```

```text
┌─plus(x, y)─┐
│       ᴺᵁᴸᴸ │
│          5 │
└────────────┘
```
