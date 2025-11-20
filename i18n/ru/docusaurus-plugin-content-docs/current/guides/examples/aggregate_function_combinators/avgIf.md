---
slug: '/examples/aggregate-function-combinators/avgIf'
title: 'avgIf'
description: 'Пример использования комбинатора агрегатной функции avgIf'
keywords: ['avg', 'if', 'combinator', 'examples', 'avgIf']
sidebar_label: 'avgIf'
doc_type: 'reference'
---



# avgIf {#avgif}


## Описание {#description}

Комбинатор [`If`](/sql-reference/aggregate-functions/combinators#-if) может применяться к функции [`avg`](/sql-reference/aggregate-functions/reference/avg)
для вычисления среднего арифметического значений в строках, где условие истинно,
с помощью агрегатной функции-комбинатора `avgIf`.


## Пример использования {#example-usage}

В этом примере мы создадим таблицу для хранения данных о продажах с флагами успешности
и используем `avgIf` для вычисления средней суммы успешных транзакций.

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
    avgIf(amount, is_successful = 1) AS avg_successful_sale
FROM sales;
```

Функция `avgIf` вычислит среднее значение только для строк, где `is_successful = 1`.
В данном случае будет вычислено среднее значений: 100.50, 200.75, 300.00 и 175.25.

```response title="Результат"
   ┌─avg_successful_sale─┐
1. │              193.88 │
   └─────────────────────┘
```


## См. также {#see-also}

- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [Комбинатор `If`](/sql-reference/aggregate-functions/combinators#-if)
