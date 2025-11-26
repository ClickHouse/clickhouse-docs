---
description: 'EXCEPT 修飾子について説明するドキュメントです。この修飾子は、結果から除外する 1 つ以上の列名を指定します。一致するすべての列名は出力から除外されます。'
sidebar_label: 'EXCEPT'
slug: /sql-reference/statements/select/except-modifier
title: 'EXCEPT 修飾子'
keywords: ['EXCEPT', 'modifier']
doc_type: 'reference'
---



# EXCEPT 修飾子 {#except}

> 結果から除外する 1 つ以上の列名を指定します。指定した名前に一致するすべての列は出力から除外されます。



## 構文

```sql
SELECT <expr> EXCEPT ( col_name1 [, col_name2, col_name3, ...] ) FROM [db.]table_name
```


## 例

```sql title="Query"
SELECT * EXCEPT (i) from columns_transformers;
```

```response title="Response"
┌──j─┬───k─┐
│ 10 │ 324 │
│  8 │  23 │
└────┴─────┘
```
