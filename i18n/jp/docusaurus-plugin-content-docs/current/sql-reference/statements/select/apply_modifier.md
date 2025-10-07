---
'description': 'このAPPLY 修飾子に関するドキュメントは、クエリの外部テーブル式によって返される各行に対していくつかの関数を呼び出すことを可能にします。'
'sidebar_label': 'APPLY'
'slug': '/sql-reference/statements/select/apply-modifier'
'title': 'APPLY 修飾子'
'keywords':
- 'APPLY'
- 'modifier'
'doc_type': 'reference'
---


# APPLY 修飾子 {#apply}

> クエリの外部テーブル式で返された各行に対して、いくつかの関数を呼び出すことを許可します。

## 構文 {#syntax}

```sql
SELECT <expr> APPLY( <func> ) FROM [db.]table_name
```

## 例 {#example}

```sql
CREATE TABLE columns_transformers (i Int64, j Int16, k Int64) ENGINE = MergeTree ORDER by (i);
INSERT INTO columns_transformers VALUES (100, 10, 324), (120, 8, 23);
SELECT * APPLY(sum) FROM columns_transformers;
```

```response
┌─sum(i)─┬─sum(j)─┬─sum(k)─┐
│    220 │     18 │    347 │
└────────┴────────┴────────┘
```
