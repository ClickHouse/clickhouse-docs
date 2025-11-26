---
description: 'Вычисляет V Крамера с поправкой на смещение.'
sidebar_position: 128
slug: /sql-reference/aggregate-functions/reference/cramersvbiascorrected
title: 'cramersVBiasCorrected'
doc_type: 'reference'
---

# cramersVBiasCorrected

V Крамера — это мера ассоциации между двумя столбцами в таблице. Результат функции [`cramersV`](./cramersv.md) лежит в диапазоне от 0 (соответствует отсутствию связи между переменными) до 1 и достигает 1 только тогда, когда каждое значение полностью определяется другим. Оценка может иметь значительное смещение, поэтому в этой версии V Крамера используется [коррекция смещения](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V#Bias_correction).

**Синтаксис**

```sql
cramersVBiasCorrected(column1, column2)
```

**Параметры**

* `column1`: первый сравниваемый столбец.
* `column2`: второй сравниваемый столбец.

**Возвращаемое значение**

* значение от 0 (соответствует отсутствию связи между значениями столбцов) до 1 (полная связь).

Тип: всегда [Float64](../../../sql-reference/data-types/float.md).

**Пример**

Следующие два столбца, сравниваемые ниже, имеют умеренную взаимосвязь друг с другом. Обратите внимание, что результат `cramersVBiasCorrected` меньше результата `cramersV`:

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
