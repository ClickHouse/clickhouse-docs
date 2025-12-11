---
description: 'С заданной точностью вычисляет квантиль числовой последовательности данных с учётом веса каждого элемента последовательности.'
sidebar_position: 181
slug: /sql-reference/aggregate-functions/reference/quantiletimingweighted
title: 'quantileTimingWeighted'
doc_type: 'reference'
---

# quantileTimingWeighted {#quantiletimingweighted}

С заданной точностью вычисляет [квантиль](https://en.wikipedia.org/wiki/Quantile) числовой последовательности данных с учётом веса каждого её элемента.

Результат детерминирован (не зависит от порядка обработки запроса). Функция оптимизирована для работы с последовательностями, описывающими распределения, например время загрузки веб‑страниц или время ответа бэкенда.

При использовании нескольких функций `quantile*` с разными уровнями в одном запросе их внутренние состояния не объединяются (то есть запрос работает менее эффективно, чем мог бы). В этом случае используйте функцию [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles).

**Синтаксис**

```sql
quantileTimingWeighted(level)(expr, weight)
```

Псевдоним: `medianTimingWeighted`.

**Аргументы**

* `level` — Уровень квантиля. Необязательный параметр. Константное число с плавающей запятой от 0 до 1. Рекомендуем использовать значение `level` в диапазоне `[0.01, 0.99]`. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://en.wikipedia.org/wiki/Median).

* `expr` — [Выражение](/sql-reference/syntax#expressions) над значениями столбца, возвращающее число типа [Float*](../../../sql-reference/data-types/float.md).

  * Если в функцию передаются отрицательные значения, поведение не определено.
  * Если значение больше 30 000 (время загрузки страницы более 30 секунд), оно приравнивается к 30 000.

* `weight` — Столбец с весами элементов последовательности. Вес — это количество вхождений значения.

**Точность**

Вычисление является точным, если:

* Общее количество значений не превышает 5670.
* Общее количество значений превышает 5670, но время загрузки страницы меньше 1024 мс.

В противном случае результат вычисления округляется до ближайшего числа, кратного 16 мс.

:::note
Для вычисления квантилей времени загрузки страниц эта функция более эффективна и точна, чем [quantile](/sql-reference/aggregate-functions/reference/quantile).
:::

**Возвращаемое значение**

* Квантиль заданного уровня.

Тип: `Float32`.

:::note
Если в функцию не переданы значения (при использовании `quantileTimingIf`), возвращается [NaN](/sql-reference/data-types/float#nan-and-inf). Это сделано для различения таких случаев от случаев, когда результатом является ноль. См. раздел [ORDER BY](/sql-reference/statements/select/order-by) для примечаний по сортировке значений `NaN`.
:::

**Пример**

Входная таблица:

```text
┌─response_time─┬─weight─┐
│            68 │      1 │
│           104 │      2 │
│           112 │      3 │
│           126 │      2 │
│           138 │      1 │
│           162 │      1 │
└───────────────┴────────┘
```

Запрос:

```sql
SELECT quantileTimingWeighted(response_time, weight) FROM t
```

Результат:

```text
┌─quantileTimingWeighted(response_time, weight)─┐
│                                           112 │
└───────────────────────────────────────────────┘
```

# quantilesTimingWeighted {#quantilestimingweighted}

То же, что и `quantileTimingWeighted`, но принимает несколько параметров, задающих уровни квантилей, и возвращает Array, заполненный значениями соответствующих квантилей.

**Пример**

Входная таблица:

```text
┌─response_time─┬─weight─┐
│            68 │      1 │
│           104 │      2 │
│           112 │      3 │
│           126 │      2 │
│           138 │      1 │
│           162 │      1 │
└───────────────┴────────┘
```

Запрос:

```sql
SELECT quantilesTimingWeighted(0,5, 0.99)(response_time, weight) FROM t
```

Результат:

```text
┌─quantilesTimingWeighted(0.5, 0.99)(response_time, weight)─┐
│ [112,162]                                                 │
└───────────────────────────────────────────────────────────┘
```

**См. также**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
