---
description: 'Применяет критерий Колмогорова–Смирнова к выборкам из двух распределений.'
sidebar_label: 'kolmogorovSmirnovTest'
sidebar_position: 156
slug: /sql-reference/aggregate-functions/reference/kolmogorovsmirnovtest
title: 'kolmogorovSmirnovTest'
doc_type: 'reference'
---

# kolmogorovSmirnovTest {#kolmogorovsmirnovtest}

Применяет критерий Колмогорова–Смирнова к выборкам из двух генеральных совокупностей.

**Синтаксис**

```sql
kolmogorovSmirnovTest([alternative, computation_method])(sample_data, sample_index)
```

Значения обеих выборок находятся в столбце `sample_data`. Если `sample_index` равен 0, то значение в этой строке относится к выборке из первой генеральной совокупности. В противном случае оно относится к выборке из второй генеральной совокупности.
Выборки должны принадлежать непрерывным одномерным распределениям вероятности.

**Аргументы**

* `sample_data` — данные выборки. [Integer](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md) или [Decimal](../../../sql-reference/data-types/decimal.md).
* `sample_index` — индекс выборки. [Integer](../../../sql-reference/data-types/int-uint.md).

**Параметры**

* `alternative` — альтернативная гипотеза. (Необязательный параметр, значение по умолчанию: `'two-sided'`.) [String](../../../sql-reference/data-types/string.md).
  Пусть F(x) и G(x) — функции распределения (CDF) первого и второго распределений соответственно.
  * `'two-sided'`
    Нулевая гипотеза состоит в том, что выборки получены из одного и того же распределения, т.е. `F(x) = G(x)` для всех x,
    а альтернативная гипотеза состоит в том, что распределения различаются.
  * `'greater'`
    Нулевая гипотеза состоит в том, что значения в первой выборке *стохастически меньше*, чем во второй,
    то есть CDF первого распределения лежит выше и, следовательно, левее CDF второго.
    Это означает, что `F(x) >= G(x)` для всех x. Альтернативная гипотеза в этом случае: `F(x) < G(x)` хотя бы для одного x.
  * `'less'`.
    Нулевая гипотеза состоит в том, что значения в первой выборке *стохастически больше*, чем во второй,
    то есть CDF первого распределения лежит ниже и, следовательно, правее CDF второго.
    Это означает, что `F(x) <= G(x)` для всех x. Альтернативная гипотеза в этом случае: `F(x) > G(x)` хотя бы для одного x.
* `computation_method` — метод вычисления p-value. (Необязательный параметр, значение по умолчанию: `'auto'`.) [String](../../../sql-reference/data-types/string.md).
  * `'exact'` — вычисление выполняется с использованием точного распределения вероятностей статистики критерия. Вычислительно затратен и избыточен, за исключением случая малых выборок.
  * `'asymp'` (`'asymptotic'`) — вычисление выполняется с использованием аппроксимации. Для больших выборок точные и асимптотические p-value очень близки.
  * `'auto'`  — метод `'exact'` используется, когда максимальный размер выборки меньше 10&#39;000.

**Возвращаемые значения**

[Tuple](../../../sql-reference/data-types/tuple.md) из двух элементов:

* вычисленное значение статистики. [Float64](../../../sql-reference/data-types/float.md).
* вычисленное p-value. [Float64](../../../sql-reference/data-types/float.md).

**Пример**

Запрос:

```sql
SELECT kolmogorovSmirnovTest('less', 'exact')(value, num)
FROM
(
    SELECT
        randNormal(0, 10) AS value,
        0 AS num
    FROM numbers(10000)
    UNION ALL
    SELECT
        randNormal(0, 10) AS value,
        1 AS num
    FROM numbers(10000)
)
```

Результат:

```text
┌─kolmogorovSmirnovTest('less', 'exact')(value, num)─┐
│ (0.009899999999999996,0.37528595205132287)         │
└────────────────────────────────────────────────────┘
```

Примечание:
p-значение больше 0,05 (при доверительной вероятности 95 %), поэтому нулевая гипотеза не отвергается.

Запрос:

```sql
SELECT kolmogorovSmirnovTest('two-sided', 'exact')(value, num)
FROM
(
    SELECT
        randStudentT(10) AS value,
        0 AS num
    FROM numbers(100)
    UNION ALL
    SELECT
        randNormal(0, 10) AS value,
        1 AS num
    FROM numbers(100)
)
```

Результат:

```text
┌─kolmogorovSmirnovTest('two-sided', 'exact')(value, num)─┐
│ (0.4100000000000002,6.61735760482795e-8)                │
└─────────────────────────────────────────────────────────┘
```

Примечание:
p-value (p-значение) меньше 0,05 (при уровне доверия 95 %), поэтому нулевая гипотеза отвергается.

**См. также**

* [Критерий Колмогорова–Смирнова](https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test)