---
'description': '与えられた配列の交差を返します (すべての与えられた配列に存在する配列のすべてのアイテムを返します)。'
'sidebar_position': 141
'slug': '/sql-reference/aggregate-functions/reference/grouparrayintersect'
'title': 'groupArrayIntersect'
'doc_type': 'reference'
---


# groupArrayIntersect

指定された配列の交差を返します（すべての指定された配列に存在するアイテムを返します）。

**構文**

```sql
groupArrayIntersect(x)
```

**引数**

- `x` — 引数（カラム名または式）。

**返される値**

- すべての配列に含まれる要素を含む配列。

タイプ: [Array](../../data-types/array.md)。

**例**

テーブル `numbers` を考えます：

```text
┌─a──────────────┐
│ [1,2,4]        │
│ [1,5,2,8,-1,0] │
│ [1,5,7,5,8,2]  │
└────────────────┘
```

カラム名を引数としたクエリ：

```sql
SELECT groupArrayIntersect(a) AS intersection FROM numbers;
```

結果：

```text
┌─intersection──────┐
│ [1, 2]            │
└───────────────────┘
```
