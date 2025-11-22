---
description: 'クエリの外側のテーブル式が返す各行ごとに任意の関数を呼び出せるようにする APPLY 修飾子について説明するドキュメントです。'
sidebar_label: 'REPLACE'
slug: /sql-reference/statements/select/replace-modifier
title: 'REPLACE 修飾子'
keywords: ['REPLACE', 'modifier']
doc_type: 'reference'
---



# Replace修飾子 {#replace}

> 1つ以上の[式エイリアス](/sql-reference/syntax#expression-aliases)を指定できます。

各エイリアスは`SELECT *`文のカラム名と一致する必要があります。出力カラムリストでは、エイリアスと一致するカラムが`REPLACE`内の式に置き換えられます。

この修飾子はカラムの名前や順序を変更しません。ただし、値と値の型は変更できます。

**構文:**

```sql
SELECT <expr> REPLACE( <expr> AS col_name) from [db.]table_name
```

**例:**

```sql
SELECT * REPLACE(i + 1 AS i) from columns_transformers;
```

```response
┌───i─┬──j─┬───k─┐
│ 101 │ 10 │ 324 │
│ 121 │  8 │  23 │
└─────┴────┴─────┘
```
