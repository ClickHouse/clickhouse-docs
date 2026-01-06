---
description: 'Документация по LIMIT'
sidebar_label: 'LIMIT'
slug: /sql-reference/statements/select/limit
title: 'LIMIT'
doc_type: 'reference'
---

# Оператор LIMIT {#limit-clause}

Оператор `LIMIT` управляет количеством строк, возвращаемых в результатах запроса.

## Базовый синтаксис {#basic-syntax}

**Выбор первых строк:**

```sql
LIMIT m
```

Возвращает первые `m` строк результата или все строки, если их меньше `m`.

**Альтернативный синтаксис TOP (совместимый с MS SQL Server):**

```sql
-- SELECT TOP number|percent column_name(s) FROM table_name
SELECT TOP 10 * FROM numbers(100);
SELECT TOP 0.1 * FROM numbers(100);
```

Это эквивалент `LIMIT m` и может использоваться для совместимости с запросами Microsoft SQL Server.

**Выборка со смещением:**

```sql
LIMIT m OFFSET n
-- or equivalently:
LIMIT n, m
```

Пропускает первые `n` строк, затем возвращает следующие `m` строк.

В обоих вариантах `n` и `m` должны быть неотрицательными целыми числами.

## Отрицательные ограничения {#negative-limits}

Выбирайте строки с *конца* набора результатов, используя отрицательные значения:

| Синтаксис | Результат |
|-----------|-----------|
| `LIMIT -m` | Последние `m` строк |
| `LIMIT -m OFFSET -n` | Последние `m` строк после пропуска последних `n` строк |
| `LIMIT m OFFSET -n` | Первые `m` строк после пропуска последних `n` строк |
| `LIMIT -m OFFSET n` | Последние `m` строк после пропуска первых `n` строк |

Синтаксис `LIMIT -n, -m` эквивалентен `LIMIT -m OFFSET -n`.

## Дробные значения LIMIT {#fractional-limits}

Используйте десятичные значения между 0 и 1, чтобы выбрать процент строк:

| Syntax | Result |
|--------|--------|
| `LIMIT 0.1` | Первые 10% строк |
| `LIMIT 1 OFFSET 0.5` | Медианная строка |
| `LIMIT 0.25 OFFSET 0.5` | Третий квартиль (25% строк после пропуска первых 50%) |

:::note

- Дробные значения должны иметь тип [Float64](../../data-types/float.md) и быть больше 0 и меньше 1.
- Дробные количества строк округляются до следующего целого числа в большую сторону.
:::

## Комбинирование типов ограничений {#combining-limit-types}

Вы можете комбинировать стандартные целые числа с дробными или отрицательными смещениями:

```sql
LIMIT 10 OFFSET 0.5    -- 10 rows starting from the halfway point
LIMIT 10 OFFSET -20    -- 10 rows after skipping the last 20
```

## LIMIT ... WITH TIES {#limit--with-ties-modifier}

Модификатор `WITH TIES` включает дополнительные строки, имеющие те же значения `ORDER BY`, что и последняя строка в установленном лимите.

```sql
SELECT * FROM (
    SELECT number % 50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0, 5
```

```response
┌─n─┐
│ 0 │
│ 0 │
│ 1 │
│ 1 │
│ 2 │
└───┘
```

С оператором `WITH TIES` в выборку попадают все строки, соответствующие последнему значению:

```sql
SELECT * FROM (
    SELECT number % 50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0, 5 WITH TIES
```

```response
┌─n─┐
│ 0 │
│ 0 │
│ 1 │
│ 1 │
│ 2 │
│ 2 │
└───┘
```

Строка 6 включена, потому что она имеет то же значение (`2`), что и строка 5.

:::note
`WITH TIES` не поддерживается при использовании отрицательных значений `LIMIT`.
:::

Этот модификатор можно комбинировать с модификатором [`ORDER BY ... WITH FILL`](/sql-reference/statements/select/order-by#order-by-expr-with-fill-modifier).

## Особенности {#considerations}

**Недетерминированные результаты:** Без предложения [`ORDER BY`](../../../sql-reference/statements/select/order-by.md) возвращаемые строки могут быть произвольными и отличаться от выполнения к выполнению одного и того же запроса.

**Ограничение на стороне сервера:** На количество возвращаемых строк также может влиять настройка [limit](../../../operations/settings/settings.md#limit).

## См. также {#see-also}

- [LIMIT BY](/sql-reference/statements/select/limit-by) — Ограничивает число строк в каждой группе значений, полезно для получения N лучших результатов в каждой категории.