---
slug: '/sql-reference/aggregate-functions/reference/quantiletimingweighted'
sidebar_position: 181
description: 'С заданной точностью вычисляются кванттили числовой последовательности'
title: quantileTimingWeighted
doc_type: reference
---
# quantileTimingWeighted

При заданной точности вычисляет [квантиль](https://en.wikipedia.org/wiki/Quantile) числовой последовательности данных в зависимости от веса каждого элемента последовательности.

Результат детерминированный (он не зависит от порядка обработки запроса). Функция оптимизирована для работы с последовательностями, которые описывают распределения, такие как время загрузки веб-страниц или время отклика бэкенда.

При использовании нескольких функций `quantile*` с разными уровнями в запросе внутренние состояния не комбинируются (то есть запрос выполняется менее эффективно, чем мог бы). В этом случае используйте функцию [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles).

**Синтаксис**

```sql
quantileTimingWeighted(level)(expr, weight)
```

Псевдоним: `medianTimingWeighted`.

**Аргументы**

- `level` — Уровень квантиля. Необязательный параметр. Константное число с плавающей точкой от 0 до 1. Рекомендуется использовать значение `level` в диапазоне `[0.01, 0.99]`. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://en.wikipedia.org/wiki/Median).

- `expr` — [Выражение](/sql-reference/syntax#expressions) по значениям колонки, возвращающее число типа [Float\*](../../../sql-reference/data-types/float.md).

        - Если функции переданы отрицательные значения, поведение не определено.
        - Если значение больше 30,000 (время загрузки страницы более 30 секунд), оно считается равным 30,000.

- `weight` — Колонка с весами элементов последовательности. Вес — это количество вхождений значения.

**Точность**

Вычисление точное, если:

- Общее количество значений не превышает 5670.
- Общее количество значений превышает 5670, но время загрузки страницы менее 1024ms.

В противном случае результат вычислений округляется до ближайшего кратного 16 мс.

:::note    
Для вычисления квантилей времени загрузки страниц эта функция более эффективна и точна, чем [quantile](/sql-reference/aggregate-functions/reference/quantile).
:::

**Возвращаемое значение**

- Квантиль указанного уровня.

Тип: `Float32`.

:::note    
Если функции не переданы значения (при использовании `quantileTimingIf`), возвращается [NaN](/sql-reference/data-types/float#nan-and-inf). Это сделано для того, чтобы отличать эти случаи от случаев, которые приводят к нулю. См. [ORDER BY clause](/sql-reference/statements/select/order-by) для примечаний по сортировке значений `NaN`.
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


# quantilesTimingWeighted

То же, что и `quantileTimingWeighted`, но принимает несколько параметров с уровнями квантилей и возвращает массив, заполненный значениями этих квантилей.

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

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)