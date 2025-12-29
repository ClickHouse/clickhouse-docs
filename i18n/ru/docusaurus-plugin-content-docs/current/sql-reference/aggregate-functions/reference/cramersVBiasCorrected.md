---
description: 'Вычисляет V Крамера с коррекцией смещения.'
slug: /sql-reference/aggregate-functions/reference/cramersvbiascorrected
title: 'cramersVBiasCorrected'
doc_type: 'reference'
---

# cramersVBiasCorrected {#cramersvbiascorrected}

V Крамера — это мера взаимосвязи между двумя столбцами в таблице. Результат функции [`cramersV`](./cramersV.md) лежит в диапазоне от 0 (соответствует отсутствию взаимосвязи между переменными) до 1 и может принимать значение 1 только тогда, когда каждое значение полностью определяется другим. Функция может давать существенно смещённую оценку, поэтому эта версия V Крамера использует [коррекцию смещения](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V#Bias_correction).

**Синтаксис**

```sql
cramersVBiasCorrected(column1, column2)
```

**Параметры**

* `column1`: первый столбец для сравнения.
* `column2`: второй столбец для сравнения.

**Возвращаемое значение**

* значение от 0 (соответствует отсутствию связи между значениями столбцов) до 1 (полная зависимость).

Тип: всегда [Float64](../../../sql-reference/data-types/float.md).

**Пример**

Два столбца, сравниваемые ниже, имеют умеренную степень взаимосвязи друг с другом. Обратите внимание, что результат `cramersVBiasCorrected` меньше, чем результат `cramersV`:

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
