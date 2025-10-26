---
'description': 'ClickHouse における Nullable データ型修飾子の Documentation'
'sidebar_label': 'Nullable(T)'
'sidebar_position': 44
'slug': '/sql-reference/data-types/nullable'
'title': 'Nullable(T)'
'doc_type': 'reference'
---


# Nullable(T)

`T`で許可されている通常の値とともに「欠損値」を示す特別なマーカー（[NULL](../../sql-reference/syntax.md)）を保存できるようにします。例えば、`Nullable(Int8)`型のカラムは`Int8`型の値を保存でき、値を持たない行には`NULL`が保存されます。

`T`は[Array](../../sql-reference/data-types/array.md)、[Map](../../sql-reference/data-types/map.md)、および[Tuple](../../sql-reference/data-types/tuple.md)のいずれかの複合データ型であってはならず、複合データ型は`Nullable`型の値を含むことができます。例えば、`Array(Nullable(Int8))`です。

`Nullable`型のフィールドはテーブルインデックスに含めることはできません。

`NULL`は、ClickHouseサーバー構成で他に指定されていない限り、すべての`Nullable`型のデフォルト値です。

## ストレージ機能 {#storage-features}

ClickHouseは、テーブルカラムに`Nullable`型の値を格納するために、値のある通常のファイルに加えて、`NULL`マスクのある別のファイルを使用します。マスクファイルのエントリは、ClickHouseが各テーブル行の該当するデータ型のデフォルト値と`NULL`を区別するのに役立ちます。追加のファイルがあるため、`Nullable`カラムは類似の通常のカラムと比べて追加のストレージスペースを消費します。

:::note    
`Nullable`を使用することは、ほぼ常にパフォーマンスに悪影響を及ぼすため、データベース設計時にこの点を考慮してください。
:::

## NULLの検索 {#finding-null}

全体のカラムを読み込まずに、`null`サブカラムを使用してカラム内の`NULL`値を見つけることができます。それは、対応する値が`NULL`であれば`1`を、そうでなければ`0`を返します。

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
