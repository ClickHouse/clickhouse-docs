---
description: 'ClickHouse 中 `WHERE` 子句的文档'
sidebar_label: 'WHERE'
slug: /sql-reference/statements/select/where
title: 'WHERE 子句'
doc_type: 'reference'
keywords: ['WHERE']
---

# WHERE 子句 {#where-clause}

`WHERE` 子句允许您过滤来自 `SELECT` 的 [`FROM`](../../../sql-reference/statements/select/from.md) 子句的数据。

如果有 `WHERE` 子句,它后面必须跟一个类型为 `UInt8` 的表达式。
此表达式求值为 `0` 的行将从进一步的转换或结果中排除。

`WHERE` 子句后面的表达式通常与[比较运算符](/sql-reference/operators#comparison-operators)和[逻辑运算符](/sql-reference/operators#operators-for-working-with-data-sets),或许多[常规函数](/sql-reference/functions/regular-functions)之一一起使用。

如果底层表引擎支持,`WHERE` 表达式会被评估是否能使用索引和分区修剪。

:::note PREWHERE
还有一个称为 [`PREWHERE`](../../../sql-reference/statements/select/prewhere.md) 的过滤优化。
Prewhere 是一种更有效地应用过滤的优化。
即使未显式指定 `PREWHERE` 子句,它也默认启用。
:::

## 测试 `NULL` {#testing-for-null}

如果您需要测试值是否为 [`NULL`](/sql-reference/syntax#null),请使用:
- [`IS NULL`](/sql-reference/operators#is_null) 或 [`isNull`](../../../sql-reference/functions/functions-for-nulls.md#isNull)
- [`IS NOT NULL`](/sql-reference/operators#is_not_null) 或 [`isNotNull`](../../../sql-reference/functions/functions-for-nulls.md#isNotNull)

否则,带有 `NULL` 的表达式永远不会通过。

## 使用逻辑运算符过滤数据 {#filtering-data-with-logical-operators}

您可以将以下[逻辑函数](/sql-reference/functions/logical-functions#and)与 `WHERE` 子句一起使用来组合多个条件:

- [`and()`](/sql-reference/functions/logical-functions#and) 或 `AND`
- [`not()`](/sql-reference/functions/logical-functions#not) 或 `NOT`
- [`or()`](/sql-reference/functions/logical-functions#or) 或 `OR`
- [`xor()`](/sql-reference/functions/logical-functions#xor)

## 将 UInt8 列用作条件 {#using-uint8-columns-as-a-condition}

在 ClickHouse 中,`UInt8` 列可以直接用作布尔条件,其中 `0` 为 `false`,任何非零值(通常为 `1`)为 `true`。
[下面](#example-uint8-column-as-condition)的部分给出了一个示例。

## 使用比较运算符 {#using-comparison-operators}

可以使用以下[比较运算符](/sql-reference/operators#comparison-operators):

| 运算符 | 函数 | 描述 | 示例 |
|----------|----------|-------------|---------|
| `a = b` | `equals(a, b)` | 等于 | `price = 100` |
| `a == b` | `equals(a, b)` | 等于(替代语法) | `price == 100` |
| `a != b` | `notEquals(a, b)` | 不等于 | `category != 'Electronics'` |
| `a <> b` | `notEquals(a, b)` | 不等于(替代语法) | `category <> 'Electronics'` |
| `a < b` | `less(a, b)` | 小于 | `price < 200` |
| `a <= b` | `lessOrEquals(a, b)` | 小于或等于 | `price <= 200` |
| `a > b` | `greater(a, b)` | 大于 | `price > 500` |
| `a >= b` | `greaterOrEquals(a, b)` | 大于或等于 | `price >= 500` |
| `a LIKE s` | `like(a, b)` | 模式匹配(区分大小写) | `name LIKE '%top%'` |
| `a NOT LIKE s` | `notLike(a, b)` | 模式不匹配(区分大小写) | `name NOT LIKE '%top%'` |
| `a ILIKE s` | `ilike(a, b)` | 模式匹配(不区分大小写) | `name ILIKE '%LAPTOP%'` |
| `a BETWEEN b AND c` | `a >= b AND a <= c` | 范围检查(包含) | `price BETWEEN 100 AND 500` |
| `a NOT BETWEEN b AND c` | `a < b OR a > c` | 范围外检查 | `price NOT BETWEEN 100 AND 500` |

## 模式匹配和条件表达式 {#pattern-matching-and-conditional-expressions}

除了比较运算符外,您还可以在 `WHERE` 子句中使用模式匹配和条件表达式。

| 功能 | 语法 | 区分大小写 | 性能 | 最适合 |
| ----------- | ------------------------------ | -------------- | ----------- | ------------------------------ |
| `LIKE` | `col LIKE '%pattern%'` | 是 | 快速 | 精确大小写模式匹配 |
| `ILIKE` | `col ILIKE '%pattern%'` | 否 | 较慢 | 不区分大小写搜索 |
| `if()` | `if(cond, a, b)` | N/A | 快速 | 简单二元条件 |
| `multiIf()` | `multiIf(c1, r1, c2, r2, def)` | N/A | 快速 | 多个条件 |
| `CASE` | `CASE WHEN ... THEN ... END` | N/A | 快速 | SQL 标准条件逻辑 |

有关使用示例,请参阅["模式匹配和条件表达式"](#examples-pattern-matching-and-conditional-expressions)。

## 包含文字、列或子查询的表达式 {#expressions-with-literals-columns-subqueries}

`WHERE` 子句后面的表达式还可以包括[文字](/sql-reference/syntax#literals)、列或子查询,这些是返回条件中使用的值的嵌套 `SELECT` 语句。

| 类型 | 定义 | 评估 | 性能 | 示例 |
|------|------------|------------|-------------|---------|
| **文字** | 固定常量值 | 查询编写时 | 最快 | `WHERE price > 100` |
| **列** | 表数据引用 | 每行 | 快速 | `WHERE price > cost` |
| **子查询** | 嵌套 SELECT | 查询执行时 | 不定 | `WHERE id IN (SELECT ...)` |

您可以在复杂条件中混合使用文字、列和子查询:

```sql
-- 文字 + 列
WHERE price > 100 AND category = 'Electronics'

-- 列 + 子查询
WHERE price > (SELECT AVG(price) FROM products) AND in_stock = true

-- 文字 + 列 + 子查询
WHERE category = 'Electronics'
  AND price < 500
  AND id IN (SELECT product_id FROM bestsellers)

-- 所有三者与逻辑运算符
WHERE (price > 100 OR category IN (SELECT category FROM featured))
  AND in_stock = true
  AND name LIKE '%Special%'
```
## 示例 {#examples}

### 测试 `NULL` {#examples-testing-for-null}

带有 `NULL` 值的查询:

```sql
CREATE TABLE t_null(x Int8, y Nullable(Int8)) ENGINE=MergeTree() ORDER BY x;
INSERT INTO t_null VALUES (1, NULL), (2, 3);

SELECT * FROM t_null WHERE y IS NULL;
SELECT * FROM t_null WHERE y != 0;
```

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

**4. `XOR` - 恰好一个条件必须为真(不能两者都为真):**

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

**6. 使用函数语法:**

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

SQL 关键字语法(`AND`、`OR`、`NOT`、`XOR`)通常更易读,但函数语法在复杂表达式或构建动态查询时很有用。

### 将 UInt8 列用作条件 {#example-uint8-column-as-condition}

使用[前面示例](#example-filtering-with-logical-operators)中的表,您可以直接使用列名作为条件:

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

以下示例使用上面[示例](#example-filtering-with-logical-operators)中的表和数据。为简洁起见,省略了结果。

**1. 与 true 显式相等(`= 1` 或 `= true`):**

```sql
SELECT * FROM products
WHERE in_stock = true;
-- 或
WHERE in_stock = 1;
```

**2. 与 false 显式相等(`= 0` 或 `= false`):**

```sql
SELECT * FROM products
WHERE in_stock = false;
-- 或
WHERE in_stock = 0;
```

**3. 不等于(`!= 0` 或 `!= false`):**

```sql
SELECT * FROM products
WHERE in_stock != false;
-- 或
WHERE in_stock != 0;
```

**4. 大于:**

```sql
SELECT * FROM products
WHERE in_stock > 0;
```

**5. 小于或等于:**

```sql
SELECT * FROM products
WHERE in_stock <= 0;
```

**6. 与其他条件组合:**

```sql
SELECT * FROM products
WHERE in_stock AND price < 400;
```

**7. 使用 `IN` 运算符:**

在下面的示例中,`(1, true)` 是一个[元组](/sql-reference/data-types/tuple)。

```sql
SELECT * FROM products
WHERE in_stock IN (1, true);
```

您还可以使用[数组](/sql-reference/data-types/array)来执行此操作:

```sql
SELECT * FROM products
WHERE in_stock IN [1, true];
```

**8. 混合比较样式:**

```sql
SELECT * FROM products
WHERE category = 'Electronics' AND in_stock = true;
```

### 模式匹配和条件表达式 {#examples-pattern-matching-and-conditional-expressions}

以下示例使用上面[示例](#example-filtering-with-logical-operators)中的表和数据。为简洁起见,省略了结果。

#### LIKE 示例 {#like-examples}

```sql
-- 查找名称中包含 'o' 的产品
SELECT * FROM products WHERE name LIKE '%o%';
-- 结果: Laptop, Monitor

-- 查找以 'L' 开头的产品
SELECT * FROM products WHERE name LIKE 'L%';
-- 结果: Laptop, Lamp

-- 查找恰好有 4 个字符的产品
SELECT * FROM products WHERE name LIKE '____';
-- 结果: Desk, Lamp
```

#### ILIKE 示例 {#ilike-examples}

```sql
-- 不区分大小写搜索 'LAPTOP'
SELECT * FROM products WHERE name ILIKE '%laptop%';
-- 结果: Laptop

-- 不区分大小写前缀匹配
SELECT * FROM products WHERE name ILIKE 'l%';
-- 结果: Laptop, Lamp
```

#### IF 示例 {#if-examples}

```sql
-- 按类别设置不同的价格阈值
SELECT * FROM products
WHERE if(category = 'Electronics', price < 500, price < 200);
-- 结果: Mouse, Chair, Monitor
-- (电子产品低于 $500 或家具低于 $200)

-- 基于库存状态过滤
SELECT * FROM products
WHERE if(in_stock, price > 100, true);
-- 结果: Laptop, Chair, Monitor, Desk, Lamp
-- (有库存的物品超过 $100 或所有缺货物品)
```

#### multiIf 示例 {#multiif-examples}

```sql
-- 多个基于类别的条件
SELECT * FROM products
WHERE multiIf(
    category = 'Electronics', price < 600,
    category = 'Furniture', in_stock = true,
    false
);
-- 结果: Mouse, Monitor, Chair
-- (电子产品 < $600 或有库存的家具)

-- 分层过滤
SELECT * FROM products
WHERE multiIf(
    price > 500, category = 'Electronics',
    price > 100, in_stock = true,
    true
);
-- 结果: Laptop, Chair, Monitor, Lamp
```

#### CASE 示例 {#case-examples}

**简单 CASE:**

```sql
-- 每个类别的不同规则
SELECT * FROM products
WHERE CASE category
    WHEN 'Electronics' THEN price < 400
    WHEN 'Furniture' THEN in_stock = true
    ELSE false
END;
-- 结果: Mouse, Monitor, Chair
```

**搜索 CASE:**

```sql
-- 基于价格的分层逻辑
SELECT * FROM products
WHERE CASE
    WHEN price > 500 THEN in_stock = true
    WHEN price > 100 THEN category = 'Electronics'
    ELSE true
END;
-- 结果: Laptop, Monitor, Mouse, Lamp
```
