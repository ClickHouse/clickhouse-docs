---
description: '結果から除外する1つ以上の列名を指定する EXCEPT 修飾子について説明します。一致するすべての列名は出力から除外されます。'
sidebar_label: 'EXCEPT'
slug: /sql-reference/statements/select/except-modifier
title: 'EXCEPT 修飾子'
keywords: ['EXCEPT', 'modifier']
doc_type: 'reference'
---



# EXCEPT修飾子 {#except}

> 結果から除外する1つ以上のカラム名を指定します。一致するすべてのカラム名は出力から除外されます。


## 構文 {#syntax}

```sql
SELECT <expr> EXCEPT ( col_name1 [, col_name2, col_name3, ...] ) FROM [db.]table_name
```


## 例 {#examples}

```sql title="クエリ"
SELECT * EXCEPT (i) from columns_transformers;
```

```response title="レスポンス"
┌──j─┬───k─┐
│ 10 │ 324 │
│  8 │  23 │
└────┴─────┘
```
