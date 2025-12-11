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
-- 字面值 + 列
WHERE price > 100 AND category = 'Electronics'

-- 列 + 子查询
WHERE price > (SELECT AVG(price) FROM products) AND in_stock = true

-- 字面值 + 列 + 子查询
WHERE category = 'Electronics' 
  AND price < 500
  AND id IN (SELECT product_id FROM bestsellers)
```

-- 使用逻辑运算符组合三个条件
WHERE (price &gt; 100 OR category IN (SELECT category FROM featured))
AND in&#95;stock = true
AND name LIKE &#39;%Special%&#39;

````
## 示例             {#examples}

### 测试 `NULL` 值                              {#examples-testing-for-null}

包含 `NULL` 值的查询：

```sql
CREATE TABLE t_null(x Int8, y Nullable(Int8)) ENGINE=MergeTree() ORDER BY x;
INSERT INTO t_null VALUES (1, NULL), (2, 3);

SELECT * FROM t_null WHERE y IS NULL;
SELECT * FROM t_null WHERE y != 0;
````

```response
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
┌─x─┬─y─┐
│ 2 │ 3 │
└───┴───┘
```

### 使用逻辑运算符筛选数据 {#example-filtering-with-logical-operators}

给定下表及其数据：

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
```

**1. `AND` - 两个条件都必须为 true：**

```sql
SELECT * FROM products
WHERE category = 'Electronics' AND price < 500;
```

```response
   ┌─id─┬─name────┬─price─┬─category────┬─in_stock─┐
1. │  2 │ 鼠标    │  25.5 │ 电子产品    │ true     │
2. │  5 │ 显示器  │   350 │ 电子产品    │ true     │
   └────┴─────────┴───────┴─────────────┴──────────┘
```

**2. `OR` - 至少有一个条件为真：**

```sql
SELECT * FROM products
WHERE category = 'Furniture' OR price > 500;
```

```response
   ┌─id─┬─name───┬──price─┬─category────┬─in_stock─┐
1. │  1 │ 笔记本电脑 │ 999.99 │ 电子产品 │ true     │
2. │  3 │ 书桌   │    299 │ 家具   │ false    │
3. │  4 │ 椅子  │    150 │ 家具   │ true     │
4. │  6 │ 灯   │     45 │ 家具   │ false    │
   └────┴────────┴────────┴─────────────┴──────────┘
```

**3. `NOT` - 对条件取反：**

```sql
SELECT * FROM products
WHERE NOT in_stock;
```

```response
   ┌─id─┬─name─┬─price─┬─category──┬─in_stock─┐
1. │  3 │ 桌子 │   299 │ 家具      │ false    │
2. │  6 │ 台灯 │    45 │ 家具      │ false    │
   └────┴──────┴───────┴───────────┴──────────┘
```

**4. `XOR` - 且只能有一个条件为真（不能同时为真）：**

```sql
SELECT *
FROM products
WHERE xor(price > 200, category = 'Electronics')
```

```response
   ┌─id─┬─name──┬─price─┬─category────┬─in_stock─┐
1. │  2 │ 鼠标 │  25.5 │ 电子产品 │ true     │
2. │  3 │ 桌子  │   299 │ 家具   │ false    │
   └────┴───────┴───────┴─────────────┴──────────┘
```

**5. 组合使用多个运算符：**

```sql
SELECT * FROM products
WHERE (category = 'Electronics' OR category = 'Furniture')
  AND in_stock = true
  AND price < 400;
```

```response
   ┌─id─┬─name────┬─price─┬─category────┬─in_stock─┐
1. │  2 │ 鼠标   │  25.5 │ 电子产品 │ true     │
2. │  4 │ 椅子   │   150 │ 家具   │ true     │
3. │  5 │ 显示器 │   350 │ 电子产品 │ true     │
   └────┴─────────┴───────┴─────────────┴──────────┘
```

**6. 使用函数语法：**

```sql
SELECT * FROM products
WHERE and(or(category = 'Electronics', price > 100), in_stock);
```

```response
   ┌─id─┬─name────┬──price─┬─category────┬─in_stock─┐
1. │  1 │ 笔记本电脑  │ 999.99 │ 电子产品 │ true     │
2. │  2 │ 鼠标   │   25.5 │ 电子产品 │ true     │
3. │  4 │ 椅子   │    150 │ 家具   │ true     │
4. │  5 │ 显示器 │    350 │ 电子产品 │ true     │
   └────┴─────────┴────────┴─────────────┴──────────┘
```

SQL 关键字语法（`AND`、`OR`、`NOT`、`XOR`）通常更易读，但在处理复杂表达式或构建动态查询时，函数形式的语法会很有用。

### 将 UInt8 列用作条件 {#example-uint8-column-as-condition}

沿用[前面示例](#example-filtering-with-logical-operators)中的表，你可以直接使用列名作为条件：

```sql
SELECT * FROM products
WHERE in_stock
```

```response
   ┌─id─┬─name────┬──price─┬─category────┬─in_stock─┐
1. │  1 │ 笔记本电脑  │ 999.99 │ 电子产品 │ true     │
2. │  2 │ 鼠标   │   25.5 │ 电子产品 │ true     │
3. │  4 │ 椅子   │    150 │ 家具   │ true     │
4. │  5 │ 显示器 │    350 │ 电子产品 │ true     │
   └────┴─────────┴────────┴─────────────┴──────────┘
```

### 使用比较运算符 {#example-using-comparison-operators}

下面的示例使用前文[示例](#example-filtering-with-logical-operators)中的表和数据。为简洁起见，省略结果。

**1. 使用显式与 true 比较（`= 1` 或 `= true`）：**

```sql
SELECT * FROM products
WHERE in_stock = true;
-- 或者
WHERE in_stock = 1;
```

**2. 显式与 false 比较（`= 0` 或 `= false`）：**

```sql
SELECT * FROM products
WHERE in_stock = false;
-- 或
WHERE in_stock = 0;
```

**3. 不等判断（`!= 0` 或 `!= false`）：**

```sql
SELECT * FROM products
WHERE in_stock != false;
-- 或
WHERE in_stock != 0;
```

**4. 大于 (&gt;):**

```sql
SELECT * FROM products
WHERE in_stock > 0;
```

**5. 小于等于：**

```sql
SELECT * FROM products
WHERE in_stock <= 0;
```

**6. 与其他条件结合：**

```sql
SELECT * FROM products
WHERE in_stock AND price < 400;
```

**7. 使用 `IN` 运算符：**

在下面的示例中，`(1, true)` 是一个[元组](/sql-reference/data-types/tuple)。

```sql
SELECT * FROM products
WHERE in_stock IN (1, true);
```

你也可以使用 [array](/sql-reference/data-types/array) 来完成此操作：

```sql
SELECT * FROM products
WHERE in_stock IN [1, true];
```

**8. 比较风格混用：**

```sql
SELECT * FROM products
WHERE category = 'Electronics' AND in_stock = true;
```

### 模式匹配和条件表达式 {#examples-pattern-matching-and-conditional-expressions}

下面的示例使用上文[示例](#example-filtering-with-logical-operators)中的表和数据。为简洁起见，不展示结果。

#### LIKE 示例 {#like-examples}

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
```

#### ILIKE 示例 {#ilike-examples}

```sql
-- 不区分大小写地搜索 'LAPTOP'
SELECT * FROM products WHERE name ILIKE '%laptop%';
-- 结果：Laptop

-- 不区分大小写的前缀匹配
SELECT * FROM products WHERE name ILIKE 'l%';
-- 结果：Laptop, Lamp
```

#### IF 示例 {#if-examples}

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
```

#### multiIf 示例 {#multiif-examples}

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
```

#### CASE 示例 {#case-examples}

**简单 CASE：**

```sql
-- 按类别应用不同规则
SELECT * FROM products
WHERE CASE category
    WHEN 'Electronics' THEN price < 400
    WHEN 'Furniture' THEN in_stock = true
    ELSE false
END;
-- 结果：Mouse、Monitor、Chair
```

**已搜索的 CASE：**

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
