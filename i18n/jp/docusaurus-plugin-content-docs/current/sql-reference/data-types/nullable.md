---
description: 'ClickHouse における Nullable データ型修飾子に関するドキュメント'
sidebar_label: 'Nullable(T)'
sidebar_position: 44
slug: /sql-reference/data-types/nullable
title: 'Nullable(T)'
doc_type: 'reference'
---



# Nullable(T)

`T` で許可されている通常の値に加えて、「欠損値」を表す特別なマーカー ([NULL](../../sql-reference/syntax.md)) を格納できるようにします。例えば、`Nullable(Int8)` 型のカラムは `Int8` 型の値を格納でき、値を持たない行には `NULL` を格納します。

`T` には、複合データ型である [Array](../../sql-reference/data-types/array.md)、[Map](../../sql-reference/data-types/map.md)、[Tuple](../../sql-reference/data-types/tuple.md) のいずれも指定できませんが、複合データ型の要素としては `Nullable` 型の値を含めることができます（例: `Array(Nullable(Int8))`）。

`Nullable` 型のフィールドは、テーブルのインデックスに含めることはできません。

ClickHouse サーバーの設定で別途指定されていない限り、任意の `Nullable` 型のデフォルト値は `NULL` です。



## ストレージの特性 {#storage-features}

テーブルカラムに`Nullable`型の値を格納する際、ClickHouseは値を含む通常のファイルに加えて、`NULL`マスクを持つ別個のファイルを使用します。マスクファイル内のエントリにより、ClickHouseは各テーブル行について`NULL`と対応するデータ型のデフォルト値を区別できます。追加ファイルが存在するため、`Nullable`カラムは通常の同等のカラムと比較して追加のストレージ容量を消費します。

:::note  
`Nullable`の使用はほぼ常にパフォーマンスに悪影響を及ぼすため、データベースを設計する際にはこの点を念頭に置いてください。
:::


## NULLの検索 {#finding-null}

`null`サブカラムを使用することで、カラム全体を読み込むことなく、カラム内の`NULL`値を検索できます。対応する値が`NULL`の場合は`1`を返し、それ以外の場合は`0`を返します。

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
