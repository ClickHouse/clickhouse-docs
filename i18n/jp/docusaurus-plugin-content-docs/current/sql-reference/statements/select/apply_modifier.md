---
description: 'クエリの外側のテーブル式が返す各行に対して関数を呼び出せるようにする APPLY 修飾子について説明します。'
sidebar_label: 'APPLY'
slug: /sql-reference/statements/select/apply-modifier
title: 'APPLY 修飾子'
keywords: ['APPLY', 'modifier']
doc_type: 'reference'
---



# APPLY 修飾子 {#apply}

> クエリの外側のテーブル式によって返される各行に対して、任意の関数を呼び出せるようにします。



## 構文

```sql
SELECT <expr> APPLY( <func> ) FROM [db.]table_name
```


## 例

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
