---
description: 'HAVING 子句文档'
sidebar_label: 'HAVING'
slug: /sql-reference/statements/select/having
title: 'HAVING 子句'
doc_type: 'reference'
---

# HAVING 子句 {#having-clause}

允许对 [GROUP BY](/sql-reference/statements/select/group-by) 生成的聚合结果进行过滤。它类似于 [WHERE](../../../sql-reference/statements/select/where.md) 子句，但不同之处在于：`WHERE` 在聚合之前执行，而 `HAVING` 在聚合之后执行。

在 `HAVING` 子句中可以通过别名引用 `SELECT` 子句中的聚合结果。或者，`HAVING` 子句也可以基于未在查询结果中返回的额外聚合计算结果进行过滤。

## 示例 {#example}

如果你有一个如下所示的 `sales` 表：

```sql
CREATE TABLE sales
(
    region String,
    salesperson String,
    amount Float64
)
ORDER BY (region, salesperson);
```

您可以按如下方式进行查询：

```sql
SELECT
    region,
    salesperson,
    sum(amount) AS total_sales
FROM sales
GROUP BY
    region,
    salesperson
HAVING total_sales > 10000
ORDER BY total_sales DESC;
```

这将列出在各自区域内总销售额超过 10,000 的销售人员。

## 限制 {#limitations}

如果未执行聚合，则不能使用 `HAVING`，请改用 `WHERE`。
