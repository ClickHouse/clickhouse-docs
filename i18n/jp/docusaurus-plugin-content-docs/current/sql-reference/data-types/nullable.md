---
description: 'ClickHouseのNullableデータ型修飾子のドキュメント'
sidebar_label: 'Nullable(T)'
sidebar_position: 44
slug: '/sql-reference/data-types/nullable'
title: 'Nullable(T)'
---




# Nullable(T)

`T` が許可する通常の値とともに「欠落している値」を示す特別なマーカー ([NULL](../../sql-reference/syntax.md)) を保存することができます。例えば、`Nullable(Int8)` 型のカラムは `Int8` 型の値を保存でき、値がない行は `NULL` を保存します。

`T` は [Array](../../sql-reference/data-types/array.md)、[Map](../../sql-reference/data-types/map.md)、および [Tuple](../../sql-reference/data-types/tuple.md) のいずれかの複合データ型にはできませんが、複合データ型は `Nullable` 型の値を含むことができます。例として、`Array(Nullable(Int8))` があります。

`Nullable` 型のフィールドはテーブルのインデックスには含めることができません。

`NULL` は、ClickHouse サーバーの設定で特に指定がない限り、任意の `Nullable` 型のデフォルト値です。

## Storage Features {#storage-features}

テーブルカラムに `Nullable` 型の値を保存するために、ClickHouse は値が入った通常のファイルに加えて、`NULL` マスクを含む別のファイルを使用します。マスクファイルのエントリにより、ClickHouse は各テーブルの行に対して `NULL` とそのデータ型のデフォルト値を区別できます。追加のファイルがあるため、`Nullable` カラムは類似の通常のカラムと比べて追加のストレージスペースを消費します。

:::note    
`Nullable` を使用すると、ほぼ常にパフォーマンスに悪影響を与えるため、データベース設計時にはこの点を考慮してください。
:::

## Finding NULL {#finding-null}

カラムの `NULL` 値を、カラム全体を読み込むことなく `null` サブカラムを使って見つけることができます。対応する値が `NULL` の場合は `1` を返し、それ以外の場合は `0` を返します。

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
