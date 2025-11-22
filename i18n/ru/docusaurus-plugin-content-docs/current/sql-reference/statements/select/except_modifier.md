---
description: 'Документация о модификаторе EXCEPT, который задаёт имена одного или нескольких столбцов для исключения из результата. Все столбцы с такими именами исключаются из вывода.'
sidebar_label: 'EXCEPT'
slug: /sql-reference/statements/select/except-modifier
title: 'Модификатор EXCEPT'
keywords: ['EXCEPT', 'модификатор']
doc_type: 'reference'
---



# Модификатор EXCEPT {#except}

> Указывает имена одного или нескольких столбцов, которые необходимо исключить из результата. Все совпадающие имена столбцов исключаются из выходных данных.


## Синтаксис {#syntax}

```sql
SELECT <expr> EXCEPT ( col_name1 [, col_name2, col_name3, ...] ) FROM [db.]table_name
```


## Примеры {#examples}

```sql title="Запрос"
SELECT * EXCEPT (i) from columns_transformers;
```

```response title="Результат"
┌──j─┬───k─┐
│ 10 │ 324 │
│  8 │  23 │
└────┴─────┘
```
