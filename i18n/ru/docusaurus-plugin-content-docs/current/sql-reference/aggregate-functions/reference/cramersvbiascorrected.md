---
slug: /sql-reference/aggregate-functions/reference/cramersvbiascorrected
sidebar_position: 128
title: 'cramersVBiasCorrected'
description: "Вычисляет коэффициент Cramér's V, но использует коррекцию на смещение."
---


# cramersVBiasCorrected

Коэффициент Cramér's V является мерой ассоциации между двумя колонками в таблице. Результат функции [`cramersV`](./cramersv.md) варьируется от 0 (соответствующий отсутствию ассоциации между переменными) до 1 и может достичь 1 только в случае, если каждое значение полностью определяется другим. Функция может быть сильно искаженной, поэтому эта версия коэффициента Cramér's V использует [коррекцию на смещение](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V#Bias_correction).

**Синтаксис**

``` sql
cramersVBiasCorrected(column1, column2)
```

**Параметры**

- `column1`: первая колонка для сравнения.
- `column2`: вторая колонка для сравнения.

**Возвращаемое значение**

- значение от 0 (соответствующее отсутствию ассоциации между значениями колонок) до 1 (полная ассоциация).

Тип: всегда [Float64](../../../sql-reference/data-types/float.md).

**Пример**

Следующие две колонки, которые сравниваются ниже, имеют небольшую ассоциацию друг с другом. Обратите внимание, что результат `cramersVBiasCorrected` меньше результата `cramersV`:

Запрос:

``` sql
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
