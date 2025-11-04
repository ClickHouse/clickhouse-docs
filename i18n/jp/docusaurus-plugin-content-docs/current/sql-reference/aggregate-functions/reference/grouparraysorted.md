---
'description': '昇順に並べた最初のNアイテムを含む配列を返します。'
'sidebar_position': 146
'slug': '/sql-reference/aggregate-functions/reference/grouparraysorted'
'title': 'groupArraySorted'
'doc_type': 'reference'
---


# groupArraySorted

昇順に並べられた最初の N 件のアイテムを含む配列を返します。

```sql
groupArraySorted(N)(column)
```

**引数**

- `N` – 返す要素の数です。

- `column` – 値（整数、文字列、浮動小数点数などの一般的な型）。

**例**

最初の 10 の数字を取得します：

```sql
SELECT groupArraySorted(10)(number) FROM numbers(100)
```

```text
┌─groupArraySorted(10)(number)─┐
│ [0,1,2,3,4,5,6,7,8,9]        │
└──────────────────────────────┘
```

カラム内のすべての数字の文字列実装を取得します：

```sql
SELECT groupArraySorted(5)(str) FROM (SELECT toString(number) AS str FROM numbers(5));
```

```text
┌─groupArraySorted(5)(str)─┐
│ ['0','1','2','3','4']    │
└──────────────────────────┘
```
