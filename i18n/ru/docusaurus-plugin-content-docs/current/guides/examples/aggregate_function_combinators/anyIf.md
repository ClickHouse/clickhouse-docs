---
slug: '/examples/aggregate-function-combinators/anyIf'
title: 'anyIf'
description: 'Пример использования комбинатора anyIf'
keywords: ['any', 'if', 'combinator', 'examples', 'anyIf']
sidebar_label: 'anyIf'
doc_type: 'reference'
---



# anyIf {#avgif}


## Описание {#description}

Комбинатор [`If`](/sql-reference/aggregate-functions/combinators#-if) может применяться к агрегатной функции [`any`](/sql-reference/aggregate-functions/reference/any)
для выбора первого встреченного элемента из указанного столбца,
соответствующего заданному условию.


## Пример использования {#example-usage}

В этом примере мы создадим таблицу для хранения данных о продажах с флагами успешности
и используем `anyIf` для выбора первых `transaction_id`, значения которых больше и
меньше 200.

Сначала создадим таблицу и вставим в неё данные:

```sql title="Запрос"
CREATE TABLE sales(
    transaction_id UInt32,
    amount Decimal(10,2),
    is_successful UInt8
)
ENGINE = MergeTree()
ORDER BY tuple();

INSERT INTO sales VALUES
    (1, 100.00, 1),
    (2, 150.00, 1),
    (3, 155.00, 0),
    (4, 300.00, 1),
    (5, 250.50, 0),
    (6, 175.25, 1);
```

```sql
SELECT
    anyIf(transaction_id, amount < 200) AS tid_lt_200,
    anyIf(transaction_id, amount > 200) AS tid_gt_200
FROM sales;
```

```response title="Результат"
┌─tid_lt_200─┬─tid_gt_200─┐
│          1 │          4 │
└────────────┴────────────┘
```


## См. также {#see-also}

- [`any`](/sql-reference/aggregate-functions/reference/any)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
