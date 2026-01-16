---
description: 'クエリの外側のテーブル式が返す各行に対して任意の関数を呼び出せるようにする APPLY 修飾子について説明するドキュメント。'
sidebar_label: 'REPLACE'
slug: /sql-reference/statements/select/replace-modifier
title: 'REPLACE 修飾子'
keywords: ['REPLACE', '修飾子']
doc_type: 'reference'
---

# REPLACE 修飾子 \\{#replace\\}

> 1 つ以上の[式エイリアス](/sql-reference/syntax#expression-aliases)を指定できます。

各エイリアスは、`SELECT *` 文の列名のいずれかと一致している必要があります。出力列リストでは、そのエイリアスに一致する列は、その `REPLACE` で指定した式で置き換えられます。

この修飾子は列名や列順を変更しません。ただし、値および値の型を変更する可能性があります。

**構文:**

```sql
SELECT <expr> REPLACE( <expr> AS col_name) from [db.]table_name
```

**例：**

```sql
SELECT * REPLACE(i + 1 AS i) from columns_transformers;
```

```response
┌───i─┬──j─┬───k─┐
│ 101 │ 10 │ 324 │
│ 121 │  8 │  23 │
└─────┴────┴─────┘
```
