---
'description': '指定された位置に配列に値を挿入します。'
'sidebar_position': 140
'slug': '/sql-reference/aggregate-functions/reference/grouparrayinsertat'
'title': 'groupArrayInsertAt'
'doc_type': 'reference'
---


# groupArrayInsertAt

指定された位置に値を配列に挿入します。

**構文**

```sql
groupArrayInsertAt(default_x, size)(x, pos)
```

1回のクエリで同じ位置に複数の値が挿入される場合、関数は以下のように動作します：

- 1つのスレッドでクエリが実行された場合、挿入された値のうち最初のものが使用されます。
- 複数のスレッドでクエリが実行された場合、結果の値は挿入された値のうちの不確定なものになります。

**引数**

- `x` — 挿入する値。 [Expression](/sql-reference/syntax#expressions) で [サポートされているデータ型](../../../sql-reference/data-types/index.md) の1つを返します。
- `pos` — 指定された要素 `x` が挿入される位置。配列内のインデックス番号はゼロから始まります。 [UInt32](/sql-reference/data-types/int-uint#integer-ranges)。
- `default_x` — 空の位置を代替するためのデフォルト値。オプションのパラメータ。 [Expression](/sql-reference/syntax#expressions) で `x` パラメータに設定されたデータ型を返します。 `default_x` が定義されていない場合、[デフォルト値](/sql-reference/statements/create/table)が使用されます。
- `size` — 結果の配列の長さ。オプションのパラメータ。このパラメータを使用する場合、デフォルト値 `default_x` を指定する必要があります。 [UInt32](/sql-reference/data-types/int-uint#integer-ranges)。

**返される値**

- 挿入された値を含む配列。

タイプ: [Array](/sql-reference/data-types/array)。

**例**

クエリ:

```sql
SELECT groupArrayInsertAt(toString(number), number * 2) FROM numbers(5);
```

結果:

```text
┌─groupArrayInsertAt(toString(number), multiply(number, 2))─┐
│ ['0','','1','','2','','3','','4']                         │
└───────────────────────────────────────────────────────────┘
```

クエリ:

```sql
SELECT groupArrayInsertAt('-')(toString(number), number * 2) FROM numbers(5);
```

結果:

```text
┌─groupArrayInsertAt('-')(toString(number), multiply(number, 2))─┐
│ ['0','-','1','-','2','-','3','-','4']                          │
└────────────────────────────────────────────────────────────────┘
```

クエリ:

```sql
SELECT groupArrayInsertAt('-', 5)(toString(number), number * 2) FROM numbers(5);
```

結果:

```text
┌─groupArrayInsertAt('-', 5)(toString(number), multiply(number, 2))─┐
│ ['0','-','1','-','2']                                             │
└───────────────────────────────────────────────────────────────────┘
```

1つの位置へのマルチスレッド挿入。

クエリ:

```sql
SELECT groupArrayInsertAt(number, 0) FROM numbers_mt(10) SETTINGS max_block_size = 1;
```

このクエリの結果として、範囲 `[0,9]` のランダムな整数が得られます。例えば：

```text
┌─groupArrayInsertAt(number, 0)─┐
│ [7]                           │
└───────────────────────────────┘
```
