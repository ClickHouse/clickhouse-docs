---
slug: '/examples/aggregate-function-combinators/avgIf'
title: 'avgIf'
description: 'Пример использования комбинатора avgIf'
keywords: ['avg', 'if', 'combinator', 'examples', 'avgIf']
sidebar_label: 'avgIf'
doc_type: 'reference'
---

# avgIf \{#avgif\}

## Описание \{#description\}

Комбинатор [`If`](/sql-reference/aggregate-functions/combinators#-if) может быть применён к функции [`avg`](/sql-reference/aggregate-functions/reference/avg)
для вычисления арифметического среднего значений в строках, для которых выполняется условие,
с помощью агрегатной функции-комбинатора `avgIf`.

## Пример использования \{#example-usage\}

В этом примере мы создадим таблицу, которая хранит данные о продажах и признак успешности,
и используем `avgIf` для вычисления среднего размера продажи по успешным транзакциям.

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

Функция `avgIf` вычислит среднее значение только по строкам, где `is_successful = 1`.
В этом случае она вычислит среднее по значениям: 100.50, 200.75, 300.00 и 175.25.

```response title="Response"
   ┌─avg_successful_sale─┐
1. │              193.88 │
   └─────────────────────┘
```

## См. также \{#see-also\}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
