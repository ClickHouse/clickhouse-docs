---
description: 'Документация по оператору `EXISTS`'
slug: /sql-reference/operators/exists
title: 'EXISTS'
doc_type: 'reference'
---

# EXISTS

Оператор `EXISTS` проверяет, сколько записей содержится в результате подзапроса. Если результат пуст, оператор возвращает `0`. В противном случае возвращается `1`.

`EXISTS` также может использоваться в предложении [WHERE](../../sql-reference/statements/select/where.md).

:::tip\
Ссылки на таблицы и столбцы основного запроса в подзапросе не поддерживаются.
:::

**Синтаксис**

```sql
EXISTS(subquery)
```

**Пример**

Запрос, проверяющий наличие значений в подзапросе:

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

Запрос с подзапросом, возвращающим пустой результат:

```sql
SELECT count() FROM numbers(10) WHERE EXISTS(SELECT number FROM numbers(10) WHERE number > 11);
```

Результат:

```text
┌─count()─┐
│       0 │
└─────────┘
```
