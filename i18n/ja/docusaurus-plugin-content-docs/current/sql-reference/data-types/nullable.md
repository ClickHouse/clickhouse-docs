---
slug: /sql-reference/data-types/nullable
sidebar_position: 44
sidebar_label: Nullable(T)
---

# Nullable(T)

`T`によって許可される通常の値とともに、「欠損値」を示す特別なマーカー（[NULL](../../sql-reference/syntax.md)）を格納することを可能にします。たとえば、`Nullable(Int8)`タイプのカラムは`Int8`タイプの値を格納でき、値を持たない行は`NULL`を格納します。

`T`は、[Array](../../sql-reference/data-types/array.md)、[Map](../../sql-reference/data-types/map.md)、および[Tuple](../../sql-reference/data-types/tuple.md)のような複合データ型にはできませんが、複合データ型は`Nullable`タイプの値を含むことができます。例えば、`Array(Nullable(Int8))`です。

`Nullable`タイプのフィールドは、テーブルのインデックスに含めることができません。

`NULL`は、ClickHouseサーバーの設定で特に指定されていない限り、すべての`Nullable`タイプのデフォルト値です。

## Storage Features {#storage-features}

テーブルカラムに`Nullable`タイプの値を格納するために、ClickHouseは値のある通常のファイルに加えて、`NULL`マスクを持つ別のファイルを使用します。マスクファイルのエントリは、ClickHouseが各テーブル行の対応するデータタイプのデフォルト値と`NULL`を区別できるようにします。追加のファイルのため、`Nullable`カラムは、類似の通常のカラムに比べて追加のストレージスペースを消費します。

:::note    
`Nullable`を使用すると、ほぼ常にパフォーマンスに悪影響を及ぼすため、データベース設計時にはこれを考慮してください。
:::

## Finding NULL {#finding-null}

カラム内の`NULL`値を、カラム全体を読み込まずに`null`サブカラムを使用することで見つけることができます。対応する値が`NULL`の場合は`1`を、それ以外の場合は`0`を返します。

**例**

クエリ:

``` sql
CREATE TABLE nullable (`n` Nullable(UInt32)) ENGINE = MergeTree ORDER BY tuple();

INSERT INTO nullable VALUES (1) (NULL) (2) (NULL);

SELECT n.null FROM nullable;
```

結果:

``` text
┌─n.null─┐
│      0 │
│      1 │
│      0 │
│      1 │
└────────┘
```

## Usage Example {#usage-example}

``` sql
CREATE TABLE t_null(x Int8, y Nullable(Int8)) ENGINE TinyLog
```

``` sql
INSERT INTO t_null VALUES (1, NULL), (2, 3)
```

``` sql
SELECT x + y FROM t_null
```

``` text
┌─plus(x, y)─┐
│       ᴺᵁᴸᴸ │
│          5 │
└────────────┘
```
