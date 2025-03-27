---
description: 'Вычисляет V Крамера, но использует коррекцию смещения.'
sidebar_position: 128
slug: /sql-reference/aggregate-functions/reference/cramersvbiascorrected
title: 'cramersVBiasCorrected'
---


# cramersVBiasCorrected

V Крамера — это мера ассоциации между двумя столбцами в таблице. Результат функции [`cramersV`](./cramersv.md) варьируется от 0 (соответствующего отсутствию ассоциации между переменными) до 1 и достигает 1 только в том случае, если каждое значение полностью определяется другим. Функция может быть сильно смещена, поэтому эта версия V Крамера использует [коррекцию смещения](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V#Bias_correction).

**Синтаксис**

```sql
cramersVBiasCorrected(column1, column2)
```

**Параметры**

- `column1`: первый столбец для сравнения.
- `column2`: второй столбец для сравнения.

**Возвращаемое значение**

- значение от 0 (соответствующее отсутствию ассоциации между значениями столбцов) до 1 (полная ассоциация).

Тип: всегда [Float64](../../../sql-reference/data-types/float.md).

**Пример**

В следующих двух столбцах, которые сравниваются ниже, наблюдается небольшая ассоциация друг с другом. Обратите внимание, что результат `cramersVBiasCorrected` меньше результата `cramersV`:

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
┌──────cramersV(a, b)─┬─cramersVBiasCorrected(a, b)─┐
│ 0.41171788506213564 │         0.33369281784141364 │
└─────────────────────┴─────────────────────────────┘
```
