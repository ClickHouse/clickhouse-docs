---
description: 'Точно вычисляет квантиль последовательности числовых данных.'
slug: /sql-reference/aggregate-functions/reference/quantileExactInclusive
title: 'quantileExactInclusive'
doc_type: 'reference'
---

# quantileExactInclusive {#quantileexactinclusive}

Точно вычисляет [квантиль](https://en.wikipedia.org/wiki/Quantile) числовой последовательности данных.

Чтобы получить точное значение, все переданные значения объединяются в массив, который затем частично сортируется. Поэтому функция потребляет память `O(n)`, где `n` — количество переданных значений. Однако для небольшого числа значений функция очень эффективна.

Эта функция эквивалентна функции Excel [PERCENTILE.INC](https://support.microsoft.com/en-us/office/percentile-inc-function-680f9539-45eb-410b-9a5e-c1355e5fe2ed) ([тип R7](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample)).

При использовании нескольких функций `quantileExactInclusive` с разными уровнями в запросе их внутренние состояния не объединяются (то есть запрос работает менее эффективно, чем мог бы). В этом случае используйте функцию [quantilesExactInclusive](../../../sql-reference/aggregate-functions/reference/quantilesExactInclusive).

**Синтаксис**

```sql
quantileExactInclusive(level)(expr)
```

**Аргументы**

* `expr` — выражение над значениями столбца, которое возвращает числовые [типы данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).

**Параметры**

* `level` — уровень квантиля. Необязательный параметр. Допустимые значения: [0, 1] — границы включительно. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://en.wikipedia.org/wiki/Median). Тип: [Float](../../../sql-reference/data-types/float.md).

**Возвращаемое значение**

* Квантиль указанного уровня.

Тип:

* [Float64](../../../sql-reference/data-types/float.md) для числового типа данных на входе.
* [Date](../../../sql-reference/data-types/date.md), если входные значения имеют тип `Date`.
* [DateTime](../../../sql-reference/data-types/datetime.md), если входные значения имеют тип `DateTime`.

**Пример**

Запрос:

```sql
CREATE TABLE num AS numbers(1000);

SELECT quantileExactInclusive(0.6)(x) FROM (SELECT number AS x FROM num);
```

Результат:

```text
┌─quantileExactInclusive(0.6)(x)─┐
│                          599.4 │
└────────────────────────────────┘
```
