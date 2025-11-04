---
slug: '/sql-reference/operators/exists'
description: 'Документация для оператора `EXISTS`'
title: EXISTS
doc_type: reference
---
# EXISTS

Оператор `EXISTS` проверяет, сколько записей находится в результате подзапроса. Если он пустой, то оператор возвращает `0`. В противном случае он возвращает `1`.

`EXISTS` также может быть использован в клаузе [WHERE](../../sql-reference/statements/select/where.md).

:::tip    
Ссылки на таблицы и колонки основного запроса не поддерживаются в подзапросе.
:::

**Синтаксис**

```sql
EXISTS(subquery)
```

**Пример**

Запрос для проверки существования значений в подзапросе:

```sql
SELECT EXISTS(SELECT * FROM numbers(10) WHERE number > 8), EXISTS(SELECT * FROM numbers(10) WHERE number > 11)
```

Результат:

```text
┌─in(1, _subquery1)─┬─in(1, _subquery2)─┐
│                 1 │                 0 │
└───────────────────┴───────────────────┘
```

Запрос с подзапросом, возвращающим несколько строк:

```sql
SELECT count() FROM numbers(10) WHERE EXISTS(SELECT number FROM numbers(10) WHERE number > 8);
```

Результат:

```text
┌─count()─┐
│      10 │
└─────────┘
```

Запрос с подзапросом, который возвращает пустой результат:

```sql
SELECT count() FROM numbers(10) WHERE EXISTS(SELECT number FROM numbers(10) WHERE number > 11);
```

Результат:

```text
┌─count()─┐
│       0 │
└─────────┘
```