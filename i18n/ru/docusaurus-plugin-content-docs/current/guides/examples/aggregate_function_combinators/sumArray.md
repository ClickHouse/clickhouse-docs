---
slug: '/examples/aggregate-function-combinators/sumArray'
title: 'sumArray'
description: 'Пример использования комбинатора sumArray'
keywords: ['sum', 'array', 'combinator', 'examples', 'sumArray']
sidebar_label: 'sumArray'
---


# sumArray {#sumarray}

## Описание {#description}

Комбинатор [`Array`](/sql-reference/aggregate-functions/combinators#-array) 
может быть применен к функции [`sum`](/sql-reference/aggregate-functions/reference/sum) 
для вычисления суммы всех элементов в массиве с использованием агрегирующей функции `sumArray`.

Функция `sumArray` полезна, когда необходимо вычислить общую сумму всех 
элементов во множественных массивах в наборе данных.

## Пример использования {#example-usage}

В этом примере мы используем выборку данных о ежедневных продажах по 
различным категориям товаров, чтобы продемонстрировать, как работает 
`sumArray`. Мы рассчитаем общие продажи по всем категориям для каждого дня.

```sql title="Запрос"
CREATE TABLE daily_category_sales
(
    date Date,
    category_sales Array(UInt32)
) ENGINE = Memory;

INSERT INTO daily_category_sales VALUES
    ('2024-01-01', [100, 200, 150]),
    ('2024-01-02', [120, 180, 160]),
    ('2024-01-03', [90, 220, 140]);

SELECT 
    date,
    category_sales,
    sumArray(category_sales) as total_sales_sumArray,
    sum(arraySum(category_sales)) as total_sales_arraySum
FROM daily_category_sales
GROUP BY date, category_sales;
```

Функция `sumArray` суммирует все элементы в каждом массиве `category_sales`. 
Например, `2024-01-01` она суммирует `100 + 200 + 150 = 450`. Это дает 
такой же результат, как и `arraySum`.

## Также смотрите {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`arraySum`](/sql-reference/functions/array-functions#arraysum)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`sumMap`](/examples/aggregate-function-combinators/sumMap)
