---
description: 'Вычисляет коэффициент V Крамера с коррекцией смещения.'
sidebar_position: 128
slug: /sql-reference/aggregate-functions/reference/cramersvbiascorrected
title: 'cramersVBiasCorrected'
doc_type: 'reference'
---

# cramersVBiasCorrected

V Крамера — это мера связи между двумя столбцами в таблице. Результат [`функции cramersV`](./cramersv.md) лежит в диапазоне от 0 (что соответствует отсутствию связи между переменными) до 1 и может принимать значение 1 только тогда, когда каждое значение полностью определяется другим. Функция может давать сильно смещённую оценку, поэтому в этой версии V Крамера используется [коррекция смещения](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V#Bias_correction).

**Синтаксис**

```sql
cramersVBiasCorrected(column1, column2)
```

**Параметры**

* `column1`: первый столбец для сравнения.
* `column2`: второй столбец для сравнения.

**Возвращаемое значение**

* значение от 0 (означает отсутствие связи между значениями столбцов) до 1 (полная связь).

Тип: всегда [Float64](../../../sql-reference/data-types/float.md).

**Пример**

Два столбца, сравниваемые ниже, имеют умеренную связь друг с другом. Обратите внимание, что результат `cramersVBiasCorrected` меньше результата `cramersV`:

Запрос:

```sql
SELECT
    cramersV(a, b),
    cramersVBiasCorrected(a ,b)
FROM
    (
        SELECT
            number % 10 AS a,
            number % 4 AS b
        FROM
            numbers(150)
    );
```

Результат:

```response
┌─────cramersV(a, b)─┬─cramersVBiasCorrected(a, b)─┐
│ 0.5798088336225178 │          0.5305112825189074 │
└────────────────────┴─────────────────────────────┘
```
