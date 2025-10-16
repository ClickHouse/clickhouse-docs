---
'description': 'Документация, описывающая модификатор APPLY, который позволяет вам
  вызывать какую-либо функцию для каждой строки, возвращаемой внутренним табличным
  выражением запроса.'
'sidebar_label': 'APPLY'
'slug': '/sql-reference/statements/select/apply-modifier'
'title': "APPLY \f\ve\r\v\x0E\v\x0F\v\x0E\v\v"
'keywords':
- 'APPLY'
- 'modifier'
'doc_type': 'reference'
---
# МОДИФИКАТОР APPLY {#apply}

> Позволяет вызывать некоторую функцию для каждой строки, возвращаемой внешним табличным выражением запроса.

## Синтаксис {#syntax}

```sql
SELECT <expr> APPLY( <func> ) FROM [db.]table_name
```

## Пример {#example}

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