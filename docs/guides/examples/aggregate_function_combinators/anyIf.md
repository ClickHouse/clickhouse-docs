---
slug: '/examples/aggregate-function-combinators/anyIf'
title: 'anyIf'
description: 'Example of using the anyIf combinator'
keywords: ['any', 'if', 'combinator', 'examples', 'anyIf']
sidebar_label: 'anyIf'
doc_type: how-to
---

# anyIf {#avgif}

## Description {#description}

The [`If`](/sql-reference/aggregate-functions/combinators#-if) combinator can be applied to the [`any`](/sql-reference/aggregate-functions/reference/any)
aggregate function to select the first encountered element from a given column
that matches the given condition.

## Example usage {#example-usage}

In this example, we'll create a table that stores sales data with success flags,
and we'll use `anyIf` to select the first `transaction_id`s which are above and
below an amount of 200.

We first create a table and insert data into it:

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

## See also {#see-also}
- [`any`](/sql-reference/aggregate-functions/reference/any)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
