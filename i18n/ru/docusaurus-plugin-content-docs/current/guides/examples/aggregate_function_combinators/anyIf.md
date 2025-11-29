---
slug: '/examples/aggregate-function-combinators/anyIf'
title: 'anyIf'
description: 'Пример использования комбинатора anyIf'
keywords: ['any', 'if', 'комбинатор', 'примеры', 'anyIf']
sidebar_label: 'anyIf'
doc_type: 'reference'
---



# anyIf {#avgif}



## Описание {#description}

Комбинатор [`If`](/sql-reference/aggregate-functions/combinators#-if) может быть применён к агрегатной функции [`any`](/sql-reference/aggregate-functions/reference/any)
для выбора первого встретившегося элемента из заданного столбца,
который удовлетворяет указанному условию.



## Пример использования {#example-usage}

В этом примере мы создадим таблицу, которая хранит данные о продажах с флагами успешности,
и используем `anyIf`, чтобы выбрать первые значения `transaction_id`, которые больше и
меньше суммы 200.

Сначала создадим таблицу и вставим в неё данные:

```sql title="Query"
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

```response title="Response"
┌─tid_lt_200─┬─tid_gt_200─┐
│          1 │          4 │
└────────────┴────────────┘
```


## См. также {#see-also}
- [`any`](/sql-reference/aggregate-functions/reference/any)
- [`комбинатор If`](/sql-reference/aggregate-functions/combinators#-if)
