---
description: 'Вычисляет коэффициент ранговой корреляции.'
sidebar_position: 182
slug: /sql-reference/aggregate-functions/reference/rankCorr
title: 'rankCorr'
---


# rankCorr

Вычисляет коэффициент ранговой корреляции.

**Синтаксис**

```sql
rankCorr(x, y)
```

**Аргументы**

- `x` — Произвольное значение. [Float32](/sql-reference/data-types/float) или [Float64](/sql-reference/data-types/float).
- `y` — Произвольное значение. [Float32](/sql-reference/data-types/float) или [Float64](/sql-reference/data-types/float).

**Возвращаемое значение(я)**

- Возвращает коэффициент ранговой корреляции рангов x и y. Значение коэффициента корреляции варьируется от -1 до +1. Если передано менее двух аргументов, функция вернет исключение. Значение, близкое к +1, обозначает высокую линейную зависимость: при увеличении одного случайного переменного, второй случайный переменный также увеличивается. Значение, близкое к -1, обозначает высокую линейную зависимость: при увеличении одного случайного переменного, второй случайный переменный уменьшается. Значение, близкое или равное 0, обозначает отсутствие зависимости между двумя случайными переменными.

Тип: [Float64](/sql-reference/data-types/float).

**Пример**

Запрос:

```sql
SELECT rankCorr(number, number) FROM numbers(100);
```

Результат:

```text
┌─rankCorr(number, number)─┐
│                        1 │
└──────────────────────────┘
```

Запрос:

```sql
SELECT roundBankers(rankCorr(exp(number), sin(number)), 3) FROM numbers(100);
```

Результат:

```text
┌─roundBankers(rankCorr(exp(number), sin(number)), 3)─┐
│                                              -0.037 │
└─────────────────────────────────────────────────────┘
```
**См. также**

- [Коэффициент ранговой корреляции Спирмена](https://en.wikipedia.org/wiki/Spearman%27s_rank_correlation_coefficient)
