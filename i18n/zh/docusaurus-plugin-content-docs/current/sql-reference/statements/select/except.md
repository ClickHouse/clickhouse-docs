---
'description': 'EXCEPT 子句 的文档'
'sidebar_label': 'EXCEPT'
'slug': '/sql-reference/statements/select/except'
'title': 'EXCEPT 子句'
---


# EXCEPT 子句

`EXCEPT` 子句仅返回第一个查询的结果中不包含第二个查询的行。

- 两个查询必须具有相同数量的列，并且列的顺序和数据类型必须相同。
- `EXCEPT` 的结果可以包含重复的行。如果不希望出现重复行，请使用 `EXCEPT DISTINCT`。
- 如果没有指定括号，多个 `EXCEPT` 语句将从左到右依次执行。
- `EXCEPT` 操作符与 `UNION` 子句的优先级相同，低于 `INTERSECT` 子句的优先级。

## 语法 {#syntax}

```sql
SELECT column1 [, column2 ]
FROM table1
[WHERE condition]

EXCEPT

SELECT column1 [, column2 ]
FROM table2
[WHERE condition]
```
条件可以是根据您的要求的任何表达式。

此外，可以使用 `EXCEPT()` 来排除结果中的某些列，语法与 BigQuery (Google Cloud) 中的用法相同，如下所示：

```sql
SELECT column1 [, column2 ] EXCEPT (column3 [, column4]) 
FROM table1 
[WHERE condition]
```

## 示例 {#examples}

本节的示例演示了 `EXCEPT` 子句的用法。

### 使用 `EXCEPT` 子句过滤数字 {#filtering-numbers-using-the-except-clause}

这是一个简单的示例，它返回数字 1 到 10 中不包括数字 3 到 8 的结果：

查询：

```sql
SELECT number
FROM numbers(1, 10)
EXCEPT
SELECT number
FROM numbers(3, 8)
```

结果：

```response
┌─number─┐
│      1 │
│      2 │
│      9 │
│     10 │
└────────┘
```

### 使用 `EXCEPT()` 排除特定列 {#excluding-specific-columns-using-except}

`EXCEPT()` 可以快速排除结果中的列。例如，如果我们想选择表中的所有列，但排除一些特定的列，如下例所示：

查询：

```sql
SHOW COLUMNS IN system.settings

SELECT * EXCEPT (default, alias_for, readonly, description)
FROM system.settings
LIMIT 5
```

结果：

```response
    ┌─field───────┬─type─────────────────────────────────────────────────────────────────────┬─null─┬─key─┬─default─┬─extra─┐
 1. │ alias_for   │ String                                                                   │ NO   │     │ ᴺᵁᴸᴸ    │       │
 2. │ changed     │ UInt8                                                                    │ NO   │     │ ᴺᵁᴸᴸ    │       │
 3. │ default     │ String                                                                   │ NO   │     │ ᴺᵁᴸᴸ    │       │
 4. │ description │ String                                                                   │ NO   │     │ ᴺᵁᴸᴸ    │       │
 5. │ is_obsolete │ UInt8                                                                    │ NO   │     │ ᴺᵁᴸᴸ    │       │
 6. │ max         │ Nullable(String)                                                         │ YES  │     │ ᴺᵁᴸᴸ    │       │
 7. │ min         │ Nullable(String)                                                         │ YES  │     │ ᴺᵁᴸᴸ    │       │
 8. │ name        │ String                                                                   │ NO   │     │ ᴺᵁᴸᴸ    │       │
 9. │ readonly    │ UInt8                                                                    │ NO   │     │ ᴺᵁᴸᴸ    │       │
10. │ tier        │ Enum8('Production' = 0, 'Obsolete' = 4, 'Experimental' = 8, 'Beta' = 12) │ NO   │     │ ᴺᵁᴸᴸ    │       │
11. │ type        │ String                                                                   │ NO   │     │ ᴺᵁᴸᴸ    │       │
12. │ value       │ String                                                                   │ NO   │     │ ᴺᵁᴸᴸ    │       │
    └─────────────┴──────────────────────────────────────────────────────────────────────────┴──────┴─────┴─────────┴───────┘

   ┌─name────────────────────┬─value──────┬─changed─┬─min──┬─max──┬─type────┬─is_obsolete─┬─tier───────┐
1. │ dialect                 │ clickhouse │       0 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ Dialect │           0 │ Production │
2. │ min_compress_block_size │ 65536      │       0 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ UInt64  │           0 │ Production │
3. │ max_compress_block_size │ 1048576    │       0 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ UInt64  │           0 │ Production │
4. │ max_block_size          │ 65409      │       0 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ UInt64  │           0 │ Production │
5. │ max_insert_block_size   │ 1048449    │       0 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ UInt64  │           0 │ Production │
   └─────────────────────────┴────────────┴─────────┴──────┴──────┴─────────┴─────────────┴────────────┘
```

### 使用 `EXCEPT` 和 `INTERSECT` 处理加密货币数据 {#using-except-and-intersect-with-cryptocurrency-data}

`EXCEPT` 和 `INTERSECT` 在不同的布尔逻辑中通常可以互换使用，它们都在两个共享一个或多个公共列的表中非常有用。
例如，假设我们有几百万行的历史加密货币数据，其中包含交易价格和交易量：

查询：

```sql
CREATE TABLE crypto_prices
(
    trade_date Date,
    crypto_name String,
    volume Float32,
    price Float32,
    market_cap Float32,
    change_1_day Float32
)
ENGINE = MergeTree
PRIMARY KEY (crypto_name, trade_date);

INSERT INTO crypto_prices
   SELECT *
   FROM s3(
    'https://learn-clickhouse.s3.us-east-2.amazonaws.com/crypto_prices.csv',
    'CSVWithNames'
);

SELECT * FROM crypto_prices
WHERE crypto_name = 'Bitcoin'
ORDER BY trade_date DESC
LIMIT 10;
```

结果：

```response
┌─trade_date─┬─crypto_name─┬──────volume─┬────price─┬───market_cap─┬──change_1_day─┐
│ 2020-11-02 │ Bitcoin     │ 30771456000 │ 13550.49 │ 251119860000 │  -0.013585099 │
│ 2020-11-01 │ Bitcoin     │ 24453857000 │ 13737.11 │ 254569760000 │ -0.0031840964 │
│ 2020-10-31 │ Bitcoin     │ 30306464000 │ 13780.99 │ 255372070000 │   0.017308505 │
│ 2020-10-30 │ Bitcoin     │ 30581486000 │ 13546.52 │ 251018150000 │   0.008084608 │
│ 2020-10-29 │ Bitcoin     │ 56499500000 │ 13437.88 │ 248995320000 │   0.012552661 │
│ 2020-10-28 │ Bitcoin     │ 35867320000 │ 13271.29 │ 245899820000 │   -0.02804481 │
│ 2020-10-27 │ Bitcoin     │ 33749879000 │ 13654.22 │ 252985950000 │    0.04427984 │
│ 2020-10-26 │ Bitcoin     │ 29461459000 │ 13075.25 │ 242251000000 │  0.0033826586 │
│ 2020-10-25 │ Bitcoin     │ 24406921000 │ 13031.17 │ 241425220000 │ -0.0058658565 │
│ 2020-10-24 │ Bitcoin     │ 24542319000 │ 13108.06 │ 242839880000 │   0.013650347 │
└────────────┴─────────────┴─────────────┴──────────┴──────────────┴───────────────┘
```

现在假设我们有一个名为 `holdings` 的表，包含我们拥有的加密货币列表，以及每种货币的数量：

```sql
CREATE TABLE holdings
(
    crypto_name String,
    quantity UInt64
)
ENGINE = MergeTree
PRIMARY KEY (crypto_name);

INSERT INTO holdings VALUES
   ('Bitcoin', 1000),
   ('Bitcoin', 200),
   ('Ethereum', 250),
   ('Ethereum', 5000),
   ('DOGEFI', 10),
   ('Bitcoin Diamond', 5000);
```

我们可以使用 `EXCEPT` 来回答这样的问题 **“我们拥有的哪些币的交易价格从未低于 $10？”**：

```sql
SELECT crypto_name FROM holdings
EXCEPT
SELECT crypto_name FROM crypto_prices
WHERE price < 10;
```

结果：

```response
┌─crypto_name─┐
│ Bitcoin     │
│ Bitcoin     │
└─────────────┘
```

这意味着在我们拥有的四种加密货币中，只有比特币从未跌破 $10（基于我们在此示例中的有限数据）。

### 使用 `EXCEPT DISTINCT` {#using-except-distinct}

注意在之前的查询中，我们在结果中有多个比特币的持有记录。您可以在 `EXCEPT` 后添加 `DISTINCT` 以消除结果中的重复行：

```sql
SELECT crypto_name FROM holdings
EXCEPT DISTINCT
SELECT crypto_name FROM crypto_prices
WHERE price < 10;
```

结果：

```response
┌─crypto_name─┐
│ Bitcoin     │
└─────────────┘
```

**另请参见**

- [UNION](/sql-reference/statements/select/union)
- [INTERSECT](/sql-reference/statements/select/intersect)
