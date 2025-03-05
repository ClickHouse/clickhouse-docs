---
slug: /sql-reference/data-types/nullable
sidebar_position: 44
sidebar_label: Nullable(T)
---


# Nullable(T)

`T`が許可する通常の値と同時に「欠損値」を示す特別なマーカー（[NULL](../../sql-reference/syntax.md)）を保存できるようにします。例えば、`Nullable(Int8)`型のカラムは`Int8`型の値を保存でき、値が存在しない行は`NULL`を保存します。

`T`は、[Array](../../sql-reference/data-types/array.md)、[Map](../../sql-reference/data-types/map.md)、および[Tuple](../../sql-reference/data-types/tuple.md)のいずれかの複合データ型にはなれませんが、複合データ型は`Nullable`型の値を含むことができます。例えば、`Array(Nullable(Int8))`のようになります。

`Nullable`型のフィールドはテーブルインデックスに含めることができません。

`NULL`は、ClickHouseサーバーの設定で特に指定されていない限り、すべての`Nullable`型のデフォルト値です。

## Storage Features {#storage-features}

テーブルカラムに`Nullable`型の値を保存するために、ClickHouseは通常の値を保存するファイルに加えて`NULL`マスクを持つ別のファイルを使用します。マスクファイル内のエントリにより、ClickHouseは各テーブル行の対応するデータ型のデフォルト値と`NULL`を区別できます。追加のファイルがあるため、`Nullable`カラムは通常のカラムと比較して追加のストレージスペースを消費します。

:::note    
`Nullable`を使用すると、ほとんど常にパフォーマンスに悪影響を及ぼします。データベース設計時にはこれを考慮してください。
:::

## Finding NULL {#finding-null}

カラム内の`NULL`値を見つけるために、列全体を読み込むことなく`null`サブカラムを使用することができます。対応する値が`NULL`の場合は`1`を返し、そうでない場合は`0`を返します。

**例**

クエリ:

``` sql
CREATE TABLE nullable (`n` Nullable(UInt32)) ENGINE = MergeTree ORDER BY tuple();

INSERT INTO nullable VALUES (1), (NULL), (2), (NULL);

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

## 使用例 {#usage-example}

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
