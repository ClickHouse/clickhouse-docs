---
description: 'Вычисляет коэффициент корреляции рангов.'
sidebar_position: 182
slug: /sql-reference/aggregate-functions/reference/rankCorr
title: 'rankCorr'
doc_type: 'reference'
---

# rankCorr

Вычисляет коэффициент ранговой корреляции.

**Синтаксис**

```sql
rankCorr(x, y)
```

**Аргументы**

* `x` — Произвольное значение. [Float32](/sql-reference/data-types/float) или [Float64](/sql-reference/data-types/float).
* `y` — Произвольное значение. [Float32](/sql-reference/data-types/float) или [Float64](/sql-reference/data-types/float).

**Возвращаемое значение**

* Возвращает коэффициент ранговой корреляции между рангами `x` и `y`. Значение коэффициента корреляции лежит в диапазоне от -1 до +1. Если передано менее двух аргументов, функция сгенерирует исключение. Значение, близкое к +1, означает сильную линейную зависимость, при которой с увеличением одной случайной величины вторая случайная величина также увеличивается. Значение, близкое к -1, означает сильную линейную зависимость, при которой с увеличением одной случайной величины вторая случайная величина уменьшается. Значение, близкое или равное 0, означает отсутствие зависимости между двумя случайными величинами.

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

* [Коэффициент ранговой корреляции Спирмена](https://en.wikipedia.org/wiki/Spearman%27s_rank_correlation_coefficient)
