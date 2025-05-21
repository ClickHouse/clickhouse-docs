---
description: 'ClickHouseにおけるNullableデータ型修飾子のドキュメント'
sidebar_label: 'Nullable(T)'
sidebar_position: 44
slug: /sql-reference/data-types/nullable
title: 'Nullable(T)'
---


# Nullable(T)

`T`が許可する通常の値とともに「欠損値」を示す特別なマーカー（[NULL](../../sql-reference/syntax.md)）を格納することを可能にします。例えば、`Nullable(Int8)`型のカラムは`Int8`型の値を格納でき、値がない行は`NULL`を格納します。

`T`は、[Array](../../sql-reference/data-types/array.md)、[Map](../../sql-reference/data-types/map.md)、[Tuple](../../sql-reference/data-types/tuple.md)のような複合データ型にはできませんが、複合データ型は`Nullable`型の値を含むことができます。例えば、`Array(Nullable(Int8))`のようになります。

`Nullable`型のフィールドはテーブルインデックスに含めることができません。

`NULL`は、他に指定されていない限り、任意の`Nullable`型のデフォルト値です。

## Storage Features {#storage-features}

テーブルカラムに`Nullable`型の値を格納するために、ClickHouseは値の通常のファイルに加えて`NULL`マスクのある別のファイルを使用します。マスクファイルのエントリは、ClickHouseが各テーブル行に対して、`NULL`と対応するデータ型のデフォルト値を区別できるようにします。追加のファイルがあるため、`Nullable`カラムは、同様の通常のカラムに比べて追加のストレージスペースを消費します。

:::note    
`Nullable`を使用することはほぼ常にパフォーマンスに悪影響を及ぼすため、データベース設計時にはこの点を考慮してください。
:::

## Finding NULL {#finding-null}

全体のカラムを読み込まずに、`null`サブカラムを使用してカラム内の`NULL`値を見つけることが可能です。対応する値が`NULL`の場合は`1`を、そうでない場合は`0`を返します。

**Example**

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

## Usage Example {#usage-example}

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
