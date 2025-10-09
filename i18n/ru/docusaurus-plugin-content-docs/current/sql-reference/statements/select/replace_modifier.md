---
'description': 'Документация, описывающая модификатор APPLY, который позволяет вам
  вызывать некоторую функцию для каждой строки, возвращаемой внешним табличным выражением
  запроса.'
'sidebar_label': 'REPLACE'
'slug': '/sql-reference/statements/select/replace-modifier'
'title': 'Заменить модификатор'
'keywords':
- 'REPLACE'
- 'modifier'
'doc_type': 'reference'
---
# Заменить модификатор {#replace}

> Позволяет вам указать один или несколько [псевдонимов выражений](/sql-reference/syntax#expression-aliases). 

Каждый псевдоним должен соответствовать имени колонки из оператора `SELECT *`. В списке выходных колонок колонка, которая соответствует псевдониму, заменяется выражением в этом `REPLACE`.

Этот модификатор не меняет имена или порядок колонок. Однако он может изменить значение и тип значения.

**Синтаксис:**

```sql
SELECT <expr> REPLACE( <expr> AS col_name) from [db.]table_name
```

**Пример:**

```sql
SELECT * REPLACE(i + 1 AS i) from columns_transformers;
```

```response
┌───i─┬──j─┬───k─┐
│ 101 │ 10 │ 324 │
│ 121 │  8 │  23 │
└─────┴────┴─────┘
```