---
'slug': '/examples/aggregate-function-combinators/anyIf'
'title': 'anyIf'
'description': '使用 anyIf 组合器的示例'
'keywords':
- 'any'
- 'if'
- 'combinator'
- 'examples'
- 'anyIf'
'sidebar_label': 'anyIf'
'doc_type': 'reference'
---


# anyIf {#avgif}

## 描述 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) 组合子可以应用于 [`any`](/sql-reference/aggregate-functions/reference/any) 聚合函数，以选择给定列中第一个遇到的符合给定条件的元素。

## 示例用法 {#example-usage}

在这个例子中，我们将创建一个存储销售数据的表，其中包含成功标志，并且我们将使用 `anyIf` 选择交易金额超过和低于 200 的第一个 `transaction_id`。

我们首先创建一个表并插入数据：

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

## 另请参阅 {#see-also}
- [`any`](/sql-reference/aggregate-functions/reference/any)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
