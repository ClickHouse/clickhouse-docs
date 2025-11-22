---
description: 'ClickHouse 中 `WHERE` 子句的参考文档'
sidebar_label: 'WHERE'
slug: /sql-reference/statements/select/where
title: 'WHERE 子句'
doc_type: 'reference'
keywords: ['WHERE']
---



# WHERE 子句

`WHERE` 子句用于过滤来自 `SELECT` 的 [`FROM`](../../../sql-reference/statements/select/from.md) 子句的数据。

如果存在 `WHERE` 子句，则其后必须跟一个类型为 `UInt8` 的表达式。
对于该表达式计算结果为 `0` 的行，将不会参与后续转换，也不会出现在结果中。

紧随 `WHERE` 子句的表达式通常与[比较运算符](/sql-reference/operators#comparison-operators)和[逻辑运算符](/sql-reference/operators#operators-for-working-with-data-sets)，或众多[常规函数](/sql-reference/functions/regular-functions)之一一起使用。

在底层表引擎支持的前提下，ClickHouse 会根据 `WHERE` 表达式来判断能否使用索引和分区裁剪（partition pruning）。

:::note PREWHERE
还有一种称为 [`PREWHERE`](../../../sql-reference/statements/select/prewhere.md) 的过滤优化机制。
PREWHERE 是一种更高效地应用过滤的优化手段。
即使没有显式指定 `PREWHERE` 子句，它也会默认启用。
:::



## 测试 `NULL` 值 {#testing-for-null}

如果需要测试某个值是否为 [`NULL`](/sql-reference/syntax#null),请使用:

- [`IS NULL`](/sql-reference/operators#is_null) or [`isNull`](../../../sql-reference/functions/functions-for-nulls.md#isNull)
- [`IS NOT NULL`](/sql-reference/operators#is_not_null) or [`isNotNull`](../../../sql-reference/functions/functions-for-nulls.md#isNotNull)

否则,包含 `NULL` 的表达式将永远无法通过测试。


## 使用逻辑运算符过滤数据 {#filtering-data-with-logical-operators}

您可以将以下[逻辑函数](/sql-reference/functions/logical-functions#and)与 `WHERE` 子句配合使用来组合多个条件:

- [`and()`](/sql-reference/functions/logical-functions#and) 或 `AND`
- [`not()`](/sql-reference/functions/logical-functions#not) 或 `NOT`
- [`or()`](/sql-reference/functions/logical-functions#or) 或 `OR`
- [`xor()`](/sql-reference/functions/logical-functions#xor)


## 将 UInt8 列用作条件 {#using-uint8-columns-as-a-condition}

在 ClickHouse 中,`UInt8` 列可以直接用作布尔条件,其中 `0` 表示 `false`,任何非零值(通常为 `1`)表示 `true`。
相关示例请参见[下方](#example-uint8-column-as-condition)章节。


## 使用比较运算符 {#using-comparison-operators}

可以使用以下[比较运算符](/sql-reference/operators#comparison-operators):

| 运算符                  | 函数                    | 描述                                  | 示例                            |
| ----------------------- | ----------------------- | ------------------------------------- | ------------------------------- |
| `a = b`                 | `equals(a, b)`          | 等于                                  | `price = 100`                   |
| `a == b`                | `equals(a, b)`          | 等于(替代语法)                        | `price == 100`                  |
| `a != b`                | `notEquals(a, b)`       | 不等于                                | `category != 'Electronics'`     |
| `a <> b`                | `notEquals(a, b)`       | 不等于(替代语法)                      | `category <> 'Electronics'`     |
| `a < b`                 | `less(a, b)`            | 小于                                  | `price < 200`                   |
| `a <= b`                | `lessOrEquals(a, b)`    | 小于或等于                            | `price <= 200`                  |
| `a > b`                 | `greater(a, b)`         | 大于                                  | `price > 500`                   |
| `a >= b`                | `greaterOrEquals(a, b)` | 大于或等于                            | `price >= 500`                  |
| `a LIKE s`              | `like(a, b)`            | 模式匹配(区分大小写)                  | `name LIKE '%top%'`             |
| `a NOT LIKE s`          | `notLike(a, b)`         | 模式不匹配(区分大小写)                | `name NOT LIKE '%top%'`         |
| `a ILIKE s`             | `ilike(a, b)`           | 模式匹配(不区分大小写)                | `name ILIKE '%LAPTOP%'`         |
| `a BETWEEN b AND c`     | `a >= b AND a <= c`     | 范围检查(包含边界)                    | `price BETWEEN 100 AND 500`     |
| `a NOT BETWEEN b AND c` | `a < b OR a > c`        | 范围外检查                            | `price NOT BETWEEN 100 AND 500` |


## 模式匹配和条件表达式 {#pattern-matching-and-conditional-expressions}

除了比较运算符,您还可以在 `WHERE` 子句中使用模式匹配和条件表达式。

| 功能        | 语法                           | 区分大小写     | 性能        | 最适用场景                     |
| ----------- | ------------------------------ | -------------- | ----------- | ------------------------------ |
| `LIKE`      | `col LIKE '%pattern%'`         | 是             | 快          | 精确大小写模式匹配             |
| `ILIKE`     | `col ILIKE '%pattern%'`        | 否             | 较慢        | 不区分大小写的搜索             |
| `if()`      | `if(cond, a, b)`               | 不适用         | 快          | 简单二元条件                   |
| `multiIf()` | `multiIf(c1, r1, c2, r2, def)` | 不适用         | 快          | 多重条件                       |
| `CASE`      | `CASE WHEN ... THEN ... END`   | 不适用         | 快          | SQL 标准条件逻辑               |

使用示例请参阅["模式匹配和条件表达式"](#examples-pattern-matching-and-conditional-expressions)。


## 使用字面量、列或子查询的表达式 {#expressions-with-literals-columns-subqueries}

`WHERE` 子句后的表达式还可以包含[字面量](/sql-reference/syntax#literals)、列或子查询,其中子查询是嵌套的 `SELECT` 语句,用于返回条件判断所需的值。

| 类型         | 定义                 | 求值时机             | 性能        | 示例                       |
| ------------ | -------------------- | -------------------- | ----------- | -------------------------- |
| **字面量**   | 固定常量值           | 查询编写时           | 最快        | `WHERE price > 100`        |
| **列**       | 表数据引用           | 逐行求值             | 快          | `WHERE price > cost`       |
| **子查询**   | 嵌套 SELECT          | 查询执行时           | 视情况而定  | `WHERE id IN (SELECT ...)` |

您可以在复杂条件中混合使用字面量、列和子查询:

```sql
-- 字面量 + 列
WHERE price > 100 AND category = 'Electronics'

-- 列 + 子查询
WHERE price > (SELECT AVG(price) FROM products) AND in_stock = true

-- 字面量 + 列 + 子查询
WHERE category = 'Electronics'
  AND price < 500
  AND id IN (SELECT product_id FROM bestsellers)

```


-- 使用逻辑运算符的三个条件
WHERE (price > 100 OR category IN (SELECT category FROM featured))
AND in_stock = true
AND name LIKE '%Special%'

````
## 示例 {#examples}

### 测试 `NULL` 值 {#examples-testing-for-null}

包含 `NULL` 值的查询:

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

### 使用逻辑运算符过滤数据 {#example-filtering-with-logical-operators}

给定以下表和数据:

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

**1. `AND` - 两个条件都必须为真:**

```sql
SELECT * FROM products
WHERE category = 'Electronics' AND price < 500;
```

```response
   ┌─id─┬─name────┬─price─┬─category────┬─in_stock─┐
1. │  2 │ Mouse   │  25.5 │ Electronics │ true     │
2. │  5 │ Monitor │   350 │ Electronics │ true     │
   └────┴─────────┴───────┴─────────────┴──────────┘
```

**2. `OR` - 至少一个条件必须为真:**

```sql
SELECT * FROM products
WHERE category = 'Furniture' OR price > 500;
```

```response
   ┌─id─┬─name───┬──price─┬─category────┬─in_stock─┐
1. │  1 │ Laptop │ 999.99 │ Electronics │ true     │
2. │  3 │ Desk   │    299 │ Furniture   │ false    │
3. │  4 │ Chair  │    150 │ Furniture   │ true     │
4. │  6 │ Lamp   │     45 │ Furniture   │ false    │
   └────┴────────┴────────┴─────────────┴──────────┘
```

**3. `NOT` - 对条件取反:**

```sql
SELECT * FROM products
WHERE NOT in_stock;
```

```response
   ┌─id─┬─name─┬─price─┬─category──┬─in_stock─┐
1. │  3 │ Desk │   299 │ Furniture │ false    │
2. │  6 │ Lamp │    45 │ Furniture │ false    │
   └────┴──────┴───────┴───────────┴──────────┘
```

**4. `XOR` - 恰好一个条件必须为真(不能同时为真):**

```sql
SELECT *
FROM products
WHERE xor(price > 200, category = 'Electronics')
```

```response
   ┌─id─┬─name──┬─price─┬─category────┬─in_stock─┐
1. │  2 │ Mouse │  25.5 │ Electronics │ true     │
2. │  3 │ Desk  │   299 │ Furniture   │ false    │
   └────┴───────┴───────┴─────────────┴──────────┘
```

**5. 组合多个运算符:**

```sql
SELECT * FROM products
WHERE (category = 'Electronics' OR category = 'Furniture')
  AND in_stock = true
  AND price < 400;
```


```response
   ┌─id─┬─name────┬─price─┬─category────┬─in_stock─┐
1. │  2 │ Mouse   │  25.5 │ Electronics │ true     │
2. │  4 │ Chair   │   150 │ Furniture   │ true     │
3. │  5 │ Monitor │   350 │ Electronics │ true     │
   └────┴─────────┴───────┴─────────────┴──────────┘
```

**6. 使用函数语法：**

```sql
SELECT * FROM products
WHERE and(or(category = 'Electronics', price > 100), in_stock);
```

```response
   ┌─id─┬─name────┬──price─┬─category────┬─in_stock─┐
1. │  1 │ Laptop  │ 999.99 │ Electronics │ true     │
2. │  2 │ Mouse   │   25.5 │ Electronics │ true     │
3. │  4 │ Chair   │    150 │ Furniture   │ true     │
4. │  5 │ Monitor │    350 │ Electronics │ true     │
   └────┴─────────┴────────┴─────────────┴──────────┘
```

SQL 关键字语法（`AND`、`OR`、`NOT`、`XOR`）通常更易读，但函数语法在处理复杂表达式或构建动态查询时会更有用。

### 将 UInt8 列用作条件 {#example-uint8-column-as-condition}

使用[前面示例](#example-filtering-with-logical-operators)中的表，可以直接将列名用作条件：

```sql
SELECT * FROM products
WHERE in_stock
```

```response
   ┌─id─┬─name────┬──price─┬─category────┬─in_stock─┐
1. │  1 │ Laptop  │ 999.99 │ Electronics │ true     │
2. │  2 │ Mouse   │   25.5 │ Electronics │ true     │
3. │  4 │ Chair   │    150 │ Furniture   │ true     │
4. │  5 │ Monitor │    350 │ Electronics │ true     │
   └────┴─────────┴────────┴─────────────┴──────────┘
```

### 使用比较运算符 {#example-using-comparison-operators}

以下示例使用上述[示例](#example-filtering-with-logical-operators)中的表和数据。为简洁起见，省略结果。

**1. 与 true 显式相等（`= 1` 或 `= true`）：**

```sql
SELECT * FROM products
WHERE in_stock = true;
-- or
WHERE in_stock = 1;
```

**2. 与 false 显式相等（`= 0` 或 `= false`）：**

```sql
SELECT * FROM products
WHERE in_stock = false;
-- or
WHERE in_stock = 0;
```

**3. 不等于（`!= 0` 或 `!= false`）：**

```sql
SELECT * FROM products
WHERE in_stock != false;
-- or
WHERE in_stock != 0;
```

**4. 大于：**

```sql
SELECT * FROM products
WHERE in_stock > 0;
```

**5. 小于或等于：**

```sql
SELECT * FROM products
WHERE in_stock <= 0;
```

**6. 与其他条件组合：**

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

也可以使用[数组](/sql-reference/data-types/array)来实现：

```sql
SELECT * FROM products
WHERE in_stock IN [1, true];
```

**8. 混合比较方式：**

```sql
SELECT * FROM products
WHERE category = 'Electronics' AND in_stock = true;
```

### 模式匹配和条件表达式 {#examples-pattern-matching-and-conditional-expressions}

以下示例使用上述[示例](#example-filtering-with-logical-operators)中的表和数据。为简洁起见，省略结果。

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
-- 不区分大小写搜索 'LAPTOP'
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
-- (电子产品低于 $500 或家具低于 $200)

-- 基于库存状态进行过滤
SELECT * FROM products
WHERE if(in_stock, price > 100, true);
-- 结果：Laptop, Chair, Monitor, Desk, Lamp
-- (有库存且价格超过 $100 的商品或所有缺货商品)
```

#### multiIf 示例 {#multiif-examples}

```sql
-- 基于多个类别的条件
SELECT * FROM products
WHERE multiIf(
    category = 'Electronics', price < 600,
    category = 'Furniture', in_stock = true,
    false
);
-- 结果：Mouse, Monitor, Chair
-- (电子产品 < $600 或有库存的家具)

-- 分层过滤
SELECT * FROM products
WHERE multiIf(
    price > 500, category = 'Electronics',
    price > 100, in_stock = true,
    true
);
-- 结果：Laptop, Chair, Monitor, Lamp
```

#### CASE 示例 {#case-examples}

**简单 CASE：**

```sql
-- 每个类别使用不同的规则
SELECT * FROM products
WHERE CASE category
    WHEN 'Electronics' THEN price < 400
    WHEN 'Furniture' THEN in_stock = true
    ELSE false
END;
-- 结果：Mouse, Monitor, Chair
```

**搜索式 CASE：**

```sql
-- 基于价格的分层逻辑
SELECT * FROM products
WHERE CASE
    WHEN price > 500 THEN in_stock = true
    WHEN price > 100 THEN category = 'Electronics'
    ELSE true
END;
-- 结果：Laptop, Monitor, Mouse, Lamp
```
