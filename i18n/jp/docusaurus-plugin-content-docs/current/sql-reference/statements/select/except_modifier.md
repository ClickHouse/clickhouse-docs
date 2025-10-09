---
'description': 'EXCEPT 修飾子を説明するドキュメントで、結果から除外する1つ以上のカラムの名前を指定します。すべての一致するカラム名は出力から省略されます。'
'sidebar_label': 'EXCEPT'
'slug': '/sql-reference/statements/select/except-modifier'
'title': 'EXCEPT 修飾子'
'keywords':
- 'EXCEPT'
- 'modifier'
'doc_type': 'reference'
---


# EXCEPT修飾子 {#except}

> 結果から除外する1つ以上のカラムの名前を指定します。すべての一致するカラム名は、出力から省略されます。

## 構文 {#syntax}

```sql
SELECT <expr> EXCEPT ( col_name1 [, col_name2, col_name3, ...] ) FROM [db.]table_name
```

## 例 {#examples}

```sql title="Query"
SELECT * EXCEPT (i) from columns_transformers;
```

```response title="Response"
┌──j─┬───k─┐
│ 10 │ 324 │
│  8 │  23 │
└────┴─────┘
```
