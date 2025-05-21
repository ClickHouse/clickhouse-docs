---
'slug': '/examples/aggregate-function-combinators/anyIf'
'title': 'anyIf'
'description': 'Example of using the anyIf combinator'
'keywords':
- 'any'
- 'if'
- 'combinator'
- 'examples'
- 'anyIf'
'sidebar_label': 'anyIf'
---




# anyIf {#avgif}

## 描述 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) 组合器可以应用于 [`any`](/sql-reference/aggregate-functions/reference/any) 聚合函数，以从给定列中选择满足特定条件的第一个遇到的元素。

## 示例用法 {#example-usage}

在这个例子中，我们将创建一个存储销售数据及成功标志的表，并使用 `anyIf` 来选择交易额高于和低于 200 的第一个 `transaction_id`。

我们首先创建一个表并向其中插入数据：

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
    anyIf(transaction_id, amount < 200) as tid_lt_200,
    anyIf(transaction_id, amount > 200) as tid_gt_200
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
