---
description: 'ClickHouse 中 `WHERE` 子句相关文档'
sidebar_label: 'WHERE'
slug: /sql-reference/statements/select/where
title: 'WHERE 子句'
doc_type: 'reference'
keywords: ['WHERE']
---

# WHERE 子句 {#where-clause}

`WHERE` 子句允许过滤由 `SELECT` 的 [`FROM`](../../../sql-reference/statements/select/from.md) 子句返回的数据。

如果存在 `WHERE` 子句，其后必须跟一个 `UInt8` 类型的表达式。
对于该表达式计算结果为 `0` 的行，会在后续转换或最终结果中被排除。

紧跟在 `WHERE` 子句之后的表达式通常会与[比较运算符](/sql-reference/operators#comparison-operators)和[逻辑运算符](/sql-reference/operators#operators-for-working-with-data-sets)一起使用，或与众多[常规函数](/sql-reference/functions/regular-functions)之一配合使用。

如果底层表引擎支持，`WHERE` 表达式会被分析以确定是否可以利用索引和分区裁剪。

:::note PREWHERE
还有一种称为 [`PREWHERE`](../../../sql-reference/statements/select/prewhere.md) 的过滤优化。
PREWHERE 是一种用于更高效执行过滤的优化手段。
即使没有显式指定 `PREWHERE` 子句，它默认也是启用的。
:::

## 测试 `NULL` {#testing-for-null}

如需判断某个值是否为 [`NULL`](/sql-reference/syntax#null)，请使用：
- [`IS NULL`](/sql-reference/operators#is_null) 或 [`isNull`](../../../sql-reference/functions/functions-for-nulls.md#isNull)
- [`IS NOT NULL`](/sql-reference/operators#is_not_null) 或 [`isNotNull`](../../../sql-reference/functions/functions-for-nulls.md#isNotNull)

否则，包含 `NULL` 的表达式将永远不会为真。

## 使用逻辑运算符过滤数据 {#filtering-data-with-logical-operators}

可以在 `WHERE` 子句中使用以下[逻辑函数](/sql-reference/functions/logical-functions#and)来组合多个条件：

- [`and()`](/sql-reference/functions/logical-functions#and) 或 `AND`
- [`not()`](/sql-reference/functions/logical-functions#not) 或 `NOT`
- [`or()`](/sql-reference/functions/logical-functions#or) 或 `OR`
- [`xor()`](/sql-reference/functions/logical-functions#xor)

## 将 UInt8 列用作条件 {#using-uint8-columns-as-a-condition}

在 ClickHouse 中，`UInt8` 列可以直接作为布尔条件使用，其中 `0` 表示 `false`，任意非零值（通常为 `1`）表示 `true`。
此用法的示例见[下文](#example-uint8-column-as-condition)。

## 使用比较运算符 {#using-comparison-operators}

可以使用以下[比较运算符](/sql-reference/operators#comparison-operators)：

| 运算符 | 函数 | 说明 | 示例 |
|----------|----------|-------------|---------|
| `a = b` | `equals(a, b)` | 等于 | `price = 100` |
| `a == b` | `equals(a, b)` | 等于（等价语法） | `price == 100` |
| `a != b` | `notEquals(a, b)` | 不等于 | `category != 'Electronics'` |
| `a <> b` | `notEquals(a, b)` | 不等于（等价语法） | `category <> 'Electronics'` |
| `a < b` | `less(a, b)` | 小于 | `price < 200` |
| `a <= b` | `lessOrEquals(a, b)` | 小于或等于 | `price <= 200` |
| `a > b` | `greater(a, b)` | 大于 | `price > 500` |
| `a >= b` | `greaterOrEquals(a, b)` | 大于或等于 | `price >= 500` |
| `a LIKE s` | `like(a, b)` | 模式匹配（区分大小写） | `name LIKE '%top%'` |
| `a NOT LIKE s` | `notLike(a, b)` | 模式不匹配（区分大小写） | `name NOT LIKE '%top%'` |
| `a ILIKE s` | `ilike(a, b)` | 模式匹配（不区分大小写） | `name ILIKE '%LAPTOP%'` |
| `a BETWEEN b AND c` | `a >= b AND a <= c` | 区间检查（包含端点） | `price BETWEEN 100 AND 500` |
| `a NOT BETWEEN b AND c` | `a < b OR a > c` | 区间外检查 | `price NOT BETWEEN 100 AND 500` |

## 模式匹配和条件表达式 {#pattern-matching-and-conditional-expressions}

除了比较运算符之外，还可以在 `WHERE` 子句中使用模式匹配和条件表达式。

| 功能        | 语法                          | 是否区分大小写 | 性能        | 适用场景                         |
| ----------- | ------------------------------ | -------------- | ----------- | -------------------------------- |
| `LIKE`      | `col LIKE '%pattern%'`         | Yes            | Fast        | 区分大小写的精确模式匹配         |
| `ILIKE`     | `col ILIKE '%pattern%'`        | No             | Slower      | 不区分大小写的搜索               |
| `if()`      | `if(cond, a, b)`               | N/A            | Fast        | 简单二元条件判断                 |
| `multiIf()` | `multiIf(c1, r1, c2, r2, def)` | N/A            | Fast        | 多分支条件判断                   |
| `CASE`      | `CASE WHEN ... THEN ... END`   | N/A            | Fast        | 符合 SQL 标准的条件逻辑          |

请参见[“模式匹配和条件表达式”](#examples-pattern-matching-and-conditional-expressions)了解使用示例。

## 包含字面量、列或子查询的表达式 {#expressions-with-literals-columns-subqueries}

`WHERE` 子句后面的表达式也可以包含[字面量](/sql-reference/syntax#literals)、列或子查询。子查询是嵌套的 `SELECT` 语句，用于返回在条件中使用的值。

| Type         | Definition    | Evaluation | Performance | Example                    |
| ------------ | ------------- | ---------- | ----------- | -------------------------- |
| **Literal**  | 固定常量值         | 在编写查询时已确定  | 最快          | `WHERE price > 100`        |
| **Column**   | 表数据引用         | 按行         | 快           | `WHERE price > cost`       |
| **Subquery** | 嵌套的 SELECT 语句 | 查询执行时      | 视情况而定       | `WHERE id IN (SELECT ...)` |

你可以在复杂条件中混合使用字面量、列和子查询：

```sql
-- Literal + Column
WHERE price > 100 AND category = 'Electronics'

-- Column + Subquery
WHERE price > (SELECT AVG(price) FROM products) AND in_stock = true

-- Literal + Column + Subquery
WHERE category = 'Electronics' 
  AND price < 500
  AND id IN (SELECT product_id FROM bestsellers)

-- All three with logical operators
WHERE (price > 100 OR category IN (SELECT category FROM featured))
  AND in_stock = true
  AND name LIKE '%Special%'
```

-- 使用逻辑运算符组合三个条件
WHERE (price &gt; 100 OR category IN (SELECT category FROM featured))
AND in&#95;stock = true
AND name LIKE &#39;%Special%&#39;

````sql
CREATE TABLE t_null(x Int8, y Nullable(Int8)) ENGINE=MergeTree() ORDER BY x;
INSERT INTO t_null VALUES (1, NULL), (2, 3);

SELECT * FROM t_null WHERE y IS NULL;
SELECT * FROM t_null WHERE y != 0;
```sql
CREATE TABLE t_null(x Int8, y Nullable(Int8)) ENGINE=MergeTree() ORDER BY x;
INSERT INTO t_null VALUES (1, NULL), (2, 3);

SELECT * FROM t_null WHERE y IS NULL;
SELECT * FROM t_null WHERE y != 0;
````response
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
┌─x─┬─y─┐
│ 2 │ 3 │
└───┴───┘
```response
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
┌─x─┬─y─┐
│ 2 │ 3 │
└───┴───┘
```sql
CREATE TABLE products (
    id UInt32,
    name String,
    price Float32,
    category String,
    in_stock Bool
) ENGINE = MergeTree()
ORDER BY id;

INSERT INTO products VALUES
(1, 'Laptop', 999.99, 'Electronics', true),
(2, 'Mouse', 25.50, 'Electronics', true),
(3, 'Desk', 299.00, 'Furniture', false),
(4, 'Chair', 150.00, 'Furniture', true),
(5, 'Monitor', 350.00, 'Electronics', true),
(6, 'Lamp', 45.00, 'Furniture', false);
```sql
CREATE TABLE products (
    id UInt32,
    name String,
    price Float32,
    category String,
    in_stock Bool
) ENGINE = MergeTree()
ORDER BY id;

INSERT INTO products VALUES
(1, 'Laptop', 999.99, 'Electronics', true),
(2, 'Mouse', 25.50, 'Electronics', true),
(3, 'Desk', 299.00, 'Furniture', false),
(4, 'Chair', 150.00, 'Furniture', true),
(5, 'Monitor', 350.00, 'Electronics', true),
(6, 'Lamp', 45.00, 'Furniture', false);
```sql
SELECT * FROM products
WHERE category = 'Electronics' AND price < 500;
```sql
SELECT * FROM products
WHERE category = 'Electronics' AND price < 500;
```response
   ┌─id─┬─name────┬─price─┬─category────┬─in_stock─┐
1. │  2 │ Mouse   │  25.5 │ Electronics │ true     │
2. │  5 │ Monitor │   350 │ Electronics │ true     │
   └────┴─────────┴───────┴─────────────┴──────────┘
```response
   ┌─id─┬─name────┬─price─┬─category────┬─in_stock─┐
1. │  2 │ 鼠标    │  25.5 │ 电子产品    │ true     │
2. │  5 │ 显示器  │   350 │ 电子产品    │ true     │
   └────┴─────────┴───────┴─────────────┴──────────┘
```sql
SELECT * FROM products
WHERE category = 'Furniture' OR price > 500;
```sql
SELECT * FROM products
WHERE category = 'Furniture' OR price > 500;
```response
   ┌─id─┬─name───┬──price─┬─category────┬─in_stock─┐
1. │  1 │ Laptop │ 999.99 │ Electronics │ true     │
2. │  3 │ Desk   │    299 │ Furniture   │ false    │
3. │  4 │ Chair  │    150 │ Furniture   │ true     │
4. │  6 │ Lamp   │     45 │ Furniture   │ false    │
   └────┴────────┴────────┴─────────────┴──────────┘
```response
   ┌─id─┬─name───┬──price─┬─category────┬─in_stock─┐
1. │  1 │ 笔记本电脑 │ 999.99 │ 电子产品 │ true     │
2. │  3 │ 书桌   │    299 │ 家具   │ false    │
3. │  4 │ 椅子  │    150 │ 家具   │ true     │
4. │  6 │ 灯   │     45 │ 家具   │ false    │
   └────┴────────┴────────┴─────────────┴──────────┘
```sql
SELECT * FROM products
WHERE NOT in_stock;
```sql
SELECT * FROM products
WHERE NOT in_stock;
```response
   ┌─id─┬─name─┬─price─┬─category──┬─in_stock─┐
1. │  3 │ Desk │   299 │ Furniture │ false    │
2. │  6 │ Lamp │    45 │ Furniture │ false    │
   └────┴──────┴───────┴───────────┴──────────┘
```response
   ┌─id─┬─name─┬─price─┬─category──┬─in_stock─┐
1. │  3 │ 桌子 │   299 │ 家具      │ false    │
2. │  6 │ 台灯 │    45 │ 家具      │ false    │
   └────┴──────┴───────┴───────────┴──────────┘
```sql
SELECT *
FROM products
WHERE xor(price > 200, category = 'Electronics')
```sql
SELECT *
FROM products
WHERE xor(price > 200, category = 'Electronics')
```response
   ┌─id─┬─name──┬─price─┬─category────┬─in_stock─┐
1. │  2 │ Mouse │  25.5 │ Electronics │ true     │
2. │  3 │ Desk  │   299 │ Furniture   │ false    │
   └────┴───────┴───────┴─────────────┴──────────┘
```response
   ┌─id─┬─name──┬─price─┬─category────┬─in_stock─┐
1. │  2 │ 鼠标 │  25.5 │ 电子产品 │ true     │
2. │  3 │ 桌子  │   299 │ 家具   │ false    │
   └────┴───────┴───────┴─────────────┴──────────┘
```sql
SELECT * FROM products
WHERE (category = 'Electronics' OR category = 'Furniture')
  AND in_stock = true
  AND price < 400;
```sql
SELECT * FROM products
WHERE (category = 'Electronics' OR category = 'Furniture')
  AND in_stock = true
  AND price < 400;
```response
   ┌─id─┬─name────┬─price─┬─category────┬─in_stock─┐
1. │  2 │ Mouse   │  25.5 │ Electronics │ true     │
2. │  4 │ Chair   │   150 │ Furniture   │ true     │
3. │  5 │ Monitor │   350 │ Electronics │ true     │
   └────┴─────────┴───────┴─────────────┴──────────┘
```response
   ┌─id─┬─name────┬─price─┬─category────┬─in_stock─┐
1. │  2 │ 鼠标   │  25.5 │ 电子产品 │ true     │
2. │  4 │ 椅子   │   150 │ 家具   │ true     │
3. │  5 │ 显示器 │   350 │ 电子产品 │ true     │
   └────┴─────────┴───────┴─────────────┴──────────┘
```sql
SELECT * FROM products
WHERE and(or(category = 'Electronics', price > 100), in_stock);
```sql
SELECT * FROM products
WHERE and(or(category = 'Electronics', price > 100), in_stock);
```response
   ┌─id─┬─name────┬──price─┬─category────┬─in_stock─┐
1. │  1 │ Laptop  │ 999.99 │ Electronics │ true     │
2. │  2 │ Mouse   │   25.5 │ Electronics │ true     │
3. │  4 │ Chair   │    150 │ Furniture   │ true     │
4. │  5 │ Monitor │    350 │ Electronics │ true     │
   └────┴─────────┴────────┴─────────────┴──────────┘
```response
   ┌─id─┬─name────┬──price─┬─category────┬─in_stock─┐
1. │  1 │ 笔记本电脑  │ 999.99 │ 电子产品 │ true     │
2. │  2 │ 鼠标   │   25.5 │ 电子产品 │ true     │
3. │  4 │ 椅子   │    150 │ 家具   │ true     │
4. │  5 │ 显示器 │    350 │ 电子产品 │ true     │
   └────┴─────────┴────────┴─────────────┴──────────┘
```sql
SELECT * FROM products
WHERE in_stock
```sql
SELECT * FROM products
WHERE in_stock
```response
   ┌─id─┬─name────┬──price─┬─category────┬─in_stock─┐
1. │  1 │ Laptop  │ 999.99 │ Electronics │ true     │
2. │  2 │ Mouse   │   25.5 │ Electronics │ true     │
3. │  4 │ Chair   │    150 │ Furniture   │ true     │
4. │  5 │ Monitor │    350 │ Electronics │ true     │
   └────┴─────────┴────────┴─────────────┴──────────┘
```response
   ┌─id─┬─name────┬──price─┬─category────┬─in_stock─┐
1. │  1 │ 笔记本电脑  │ 999.99 │ 电子产品 │ true     │
2. │  2 │ 鼠标   │   25.5 │ 电子产品 │ true     │
3. │  4 │ 椅子   │    150 │ 家具   │ true     │
4. │  5 │ 显示器 │    350 │ 电子产品 │ true     │
   └────┴─────────┴────────┴─────────────┴──────────┘
```sql
SELECT * FROM products
WHERE in_stock = true;
-- or
WHERE in_stock = 1;
```sql
SELECT * FROM products
WHERE in_stock = true;
-- 或者
WHERE in_stock = 1;
```sql
SELECT * FROM products
WHERE in_stock = false;
-- or
WHERE in_stock = 0;
```sql
SELECT * FROM products
WHERE in_stock = false;
-- 或
WHERE in_stock = 0;
```sql
SELECT * FROM products
WHERE in_stock != false;
-- or
WHERE in_stock != 0;
```sql
SELECT * FROM products
WHERE in_stock != false;
-- 或
WHERE in_stock != 0;
```sql
SELECT * FROM products
WHERE in_stock > 0;
```sql
SELECT * FROM products
WHERE in_stock > 0;
```sql
SELECT * FROM products
WHERE in_stock <= 0;
```sql
SELECT * FROM products
WHERE in_stock <= 0;
```sql
SELECT * FROM products
WHERE in_stock AND price < 400;
```sql
SELECT * FROM products
WHERE in_stock AND price < 400;
```sql
SELECT * FROM products
WHERE in_stock IN (1, true);
```sql
SELECT * FROM products
WHERE in_stock IN (1, true);
```sql
SELECT * FROM products
WHERE in_stock IN [1, true];
```sql
SELECT * FROM products
WHERE in_stock IN [1, true];
```sql
SELECT * FROM products
WHERE category = 'Electronics' AND in_stock = true;
```sql
SELECT * FROM products
WHERE category = 'Electronics' AND in_stock = true;
```sql
-- Find products with 'o' in the name
SELECT * FROM products WHERE name LIKE '%o%';
-- Result: Laptop, Monitor

-- Find products starting with 'L'
SELECT * FROM products WHERE name LIKE 'L%';
-- Result: Laptop, Lamp

-- Find products with exactly 4 characters
SELECT * FROM products WHERE name LIKE '____';
-- Result: Desk, Lamp
```sql
-- 查找名称中包含 'o' 的产品
SELECT * FROM products WHERE name LIKE '%o%';
-- 结果：Laptop, Monitor

-- 查找以 'L' 开头的产品
SELECT * FROM products WHERE name LIKE 'L%';
-- 结果：Laptop, Lamp

-- 查找名称恰好为 4 个字符的产品
SELECT * FROM products WHERE name LIKE '____';
-- 结果：Desk, Lamp
```sql
-- Case-insensitive search for 'LAPTOP'
SELECT * FROM products WHERE name ILIKE '%laptop%';
-- Result: Laptop

-- Case-insensitive prefix match
SELECT * FROM products WHERE name ILIKE 'l%';
-- Result: Laptop, Lamp
```sql
-- 不区分大小写地搜索 'LAPTOP'
SELECT * FROM products WHERE name ILIKE '%laptop%';
-- 结果：Laptop

-- 不区分大小写的前缀匹配
SELECT * FROM products WHERE name ILIKE 'l%';
-- 结果：Laptop, Lamp
```sql
-- Different price thresholds by category
SELECT * FROM products
WHERE if(category = 'Electronics', price < 500, price < 200);
-- Result: Mouse, Chair, Monitor
-- (Electronics under $500 OR Furniture under $200)

-- Filter based on stock status
SELECT * FROM products
WHERE if(in_stock, price > 100, true);
-- Result: Laptop, Chair, Monitor, Desk, Lamp
-- (In stock items over $100 OR all out-of-stock items)
```sql
-- 按类别设置不同的价格阈值
SELECT * FROM products
WHERE if(category = 'Electronics', price < 500, price < 200);
-- 结果：Mouse, Chair, Monitor
-- (电子产品价格低于 $500 或家具价格低于 $200)

-- 根据库存状态进行过滤
SELECT * FROM products
WHERE if(in_stock, price > 100, true);
-- 结果：Laptop, Chair, Monitor, Desk, Lamp
-- (价格超过 $100 的库存商品或所有缺货商品)
```sql
-- Multiple category-based conditions
SELECT * FROM products
WHERE multiIf(
    category = 'Electronics', price < 600,
    category = 'Furniture', in_stock = true,
    false
);
-- Result: Mouse, Monitor, Chair
-- (Electronics < $600 OR in-stock Furniture)

-- Tiered filtering
SELECT * FROM products
WHERE multiIf(
    price > 500, category = 'Electronics',
    price > 100, in_stock = true,
    true
);
-- Result: Laptop, Chair, Monitor, Lamp
```sql
-- 基于多类别的条件
SELECT * FROM products
WHERE multiIf(
    category = 'Electronics', price < 600,
    category = 'Furniture', in_stock = true,
    false
);
-- 结果：Mouse、Monitor、Chair
-- (电子产品价格 < $600 或库存中的家具)

-- 分级过滤
SELECT * FROM products
WHERE multiIf(
    price > 500, category = 'Electronics',
    price > 100, in_stock = true,
    true
);
-- 结果：Laptop、Chair、Monitor、Lamp
```sql
-- Different rules per category
SELECT * FROM products
WHERE CASE category
    WHEN 'Electronics' THEN price < 400
    WHEN 'Furniture' THEN in_stock = true
    ELSE false
END;
-- Result: Mouse, Monitor, Chair
```sql
-- 按类别应用不同规则
SELECT * FROM products
WHERE CASE category
    WHEN 'Electronics' THEN price < 400
    WHEN 'Furniture' THEN in_stock = true
    ELSE false
END;
-- 结果：Mouse、Monitor、Chair
```sql
-- Price-based tiered logic
SELECT * FROM products
WHERE CASE
    WHEN price > 500 THEN in_stock = true
    WHEN price > 100 THEN category = 'Electronics'
    ELSE true
END;
-- Result: Laptop, Monitor, Mouse, Lamp
```sql
-- 基于价格的分层逻辑
SELECT * FROM products
WHERE CASE
    WHEN price > 500 THEN in_stock = true
    WHEN price > 100 THEN category = 'Electronics'
    ELSE true
END;
-- 结果：Laptop、Monitor、Mouse、Lamp
```
