---
slug: '/examples/aggregate-function-combinators/avgIf'
title: 'avgIf'
description: 'Пример использования комбинатора avgIf'
keywords: ['avg', 'if', 'комбинатор', 'примеры', 'avgIf']
sidebar_label: 'avgIf'
---


# avgIf {#avgif}

## Описание {#description}

Комбинатор [`If`](/sql-reference/aggregate-functions/combinators#-if) может быть применён к функции [`avg`](/sql-reference/aggregate-functions/reference/avg) для расчёта арифметического среднего значений для строк, где условие истинно, с использованием агрегатной функции комбинатора `avgIf`.

## Пример использования {#example-usage}

В этом примере мы создадим таблицу, которая хранит данные о продажах с флагами успешности, и будем использовать `avgIf` для расчёта средней суммы продаж для успешных транзакций.

```sql title="Запрос"
CREATE TABLE sales(
    transaction_id UInt32,
    amount Decimal(10,2),
    is_successful UInt8
) ENGINE = Log;

INSERT INTO sales VALUES
    (1, 100.50, 1),
    (2, 200.75, 1),
    (3, 150.25, 0),
    (4, 300.00, 1),
    (5, 250.50, 0),
    (6, 175.25, 1);

SELECT
    avgIf(amount, is_successful = 1) as avg_successful_sale
FROM sales;
```

Функция `avgIf` будет рассчитывать среднюю сумму только для строк, где `is_successful = 1`. В данном случае она усреднит суммы: 100.50, 200.75, 300.00 и 175.25.

```response title="Ответ"
   ┌─avg_successful_sale─┐
1. │              193.88 │
   └─────────────────────┘
```

## См. также {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`If комбинатор`](/sql-reference/aggregate-functions/combinators#-if)
