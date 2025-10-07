---
slug: '/examples/aggregate-function-combinators/avgIf'
sidebar_label: avgIf
description: 'Пример использования комбиниратора avgIf'
title: avgIf
keywords: ['avg', 'if', 'комбинатор', 'примеры', 'avgIf']
doc_type: reference
---
# avgIf {#avgif}

## Описание {#description}

Комбинатор [`If`](/sql-reference/aggregate-functions/combinators#-if) может быть применен к функции [`avg`](/sql-reference/aggregate-functions/reference/avg) для вычисления арифметического среднего значений по строкам, где условие истинно, используя агрегатную функцию комбинатора `avgIf`.

## Пример использования {#example-usage}

В этом примере мы создадим таблицу, которая хранит данные о продажах с флагами успешности, и мы будем использовать `avgIf` для вычисления средней суммы продажи для успешных транзакций.

```sql title="Query"
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
    avgIf(amount, is_successful = 1) AS avg_successful_sale
FROM sales;
```

Функция `avgIf` будет вычислять среднюю сумму только для строк, где `is_successful = 1`. В этом случае она будет усреднять суммы: 100.50, 200.75, 300.00 и 175.25.

```response title="Response"
   ┌─avg_successful_sale─┐
1. │              193.88 │
   └─────────────────────┘
```

## См. также {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)