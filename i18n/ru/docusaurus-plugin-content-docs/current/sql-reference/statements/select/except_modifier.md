---
'description': 'Документация, описывающая модификатор EXCEPT, который определяет названия
  одного или нескольких столбцов для исключения из результата. Все совпадающие названия
  столбцов исключаются из вывода.'
'sidebar_label': 'EXCEPT'
'slug': '/sql-reference/statements/select/except-modifier'
'title': 'EXCEPT модификатор'
'keywords':
- 'EXCEPT'
- 'modifier'
'doc_type': 'reference'
---
# Модификатор EXCEPT {#except}

> Указывает названия одной или нескольких колонок, которые необходимо исключить из результата. Все совпадающие названия колонок будут опущены в выходных данных.

## Синтаксис {#syntax}

```sql
SELECT <expr> EXCEPT ( col_name1 [, col_name2, col_name3, ...] ) FROM [db.]table_name
```

## Примеры {#examples}

```sql title="Query"
SELECT * EXCEPT (i) from columns_transformers;
```

```response title="Response"
┌──j─┬───k─┐
│ 10 │ 324 │
│  8 │  23 │
└────┴─────┘
```