---
description: 'EXCEPT 子句文档，该子句仅返回出现在第一个查询结果中但未出现在第二个查询结果中的行。'
sidebar_label: 'EXCEPT'
slug: /sql-reference/statements/select/except
title: 'EXCEPT 子句'
keywords: ['EXCEPT', 'clause']
doc_type: 'reference'
---



# EXCEPT 子句

> `EXCEPT` 子句仅返回存在于第一个查询结果中而不存在于第二个查询结果中的行。 

- 两个查询必须具有数量相同的列，且这些列的顺序和数据类型必须一致。
- `EXCEPT` 的结果中可以包含重复行。如果不希望出现重复行，请使用 `EXCEPT DISTINCT`。
- 如果未使用括号，多个 `EXCEPT` 语句按从左到右依次执行。 
- `EXCEPT` 运算符与 `UNION` 子句具有相同的优先级，且优先级低于 `INTERSECT` 子句。



## 语法

```sql
SELECT column1 [, column2 ]
FROM table1
[WHERE condition]

EXCEPT

SELECT column1 [, column2 ]
FROM table2
[WHERE condition]
```

该条件可以根据您的需求使用任意表达式。

此外，`EXCEPT()` 可用于从同一张表的查询结果中排除列，其用法类似于 BigQuery（Google Cloud），语法如下：

```sql
SELECT column1 [, column2 ] EXCEPT (column3 [, column4]) 
FROM table1 
[WHERE condition]
```


## 示例

本节中的示例演示了 `EXCEPT` 子句的用法。

### 使用 `EXCEPT` 子句过滤数字

下面是一个简单的示例，它返回 1 到 10 之间中*不*属于 3 到 8 的数字：

```sql title="Query"
SELECT number
FROM numbers(1, 10)
EXCEPT
SELECT number
FROM numbers(3, 6)
```

```response title="Response"
┌─number─┐
│      1 │
│      2 │
│      9 │
│     10 │
└────────┘
```

### 使用 `EXCEPT()` 排除特定列

`EXCEPT()` 可用于快速从结果集中排除某些列。比如，如果我们想要从一个表中选择所有列，但排除其中的少数几列，可以像下面的示例那样编写查询：

```sql title="Query"
SHOW COLUMNS IN system.settings

SELECT * EXCEPT (default, alias_for, readonly, description)
FROM system.settings
LIMIT 5
```

```response title="Response"
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
```


┌─名称────────────────────┬─值──────────┬─是否修改─┬─最小值─┬─最大值─┬─类型────┬─是否废弃───┬─级别─────────┐

1. │ dialect                 │ clickhouse │         0 │ ᴺᵁᴸᴸ  │ ᴺᵁᴸᴸ  │ Dialect │           0 │ 生产级       │
2. │ min&#95;compress&#95;block&#95;size │ 65536      │         0 │ ᴺᵁᴸᴸ  │ ᴺᵁᴸᴸ  │ UInt64  │           0 │ 生产级       │
3. │ max&#95;compress&#95;block&#95;size │ 1048576    │         0 │ ᴺᵁᴸᴸ  │ ᴺᵁᴸᴸ  │ UInt64  │           0 │ 生产级       │
4. │ max&#95;block&#95;size          │ 65409      │         0 │ ᴺᵁᴸᴸ  │ ᴺᵁᴸᴸ  │ UInt64  │           0 │ 生产级       │
5. │ max&#95;insert&#95;block&#95;size   │ 1048449    │         0 │ ᴺᵁᴸᴸ  │ ᴺᵁᴸᴸ  │ UInt64  │           0 │ 生产级       │
   └─────────────────────────┴────────────┴──────────┴───────┴───────┴─────────┴────────────┴────────────┘

````

### 使用 `EXCEPT` 和 `INTERSECT` 处理加密货币数据 {#using-except-and-intersect-with-cryptocurrency-data}

`EXCEPT` 和 `INTERSECT` 通常可以通过不同的布尔逻辑互换使用，当您有两个共享公共列的表时，这两个操作符都非常有用。
例如，假设我们有几百万行历史加密货币数据，包含交易价格和交易量：

```sql title="查询"
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
````


```response title="Response"
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

现在假设我们有一个名为 `holdings` 的表，其中存储了我们持有的各类加密货币及其对应的数量：

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

我们可以使用 `EXCEPT` 来回答这样的问题：**“我们持有的哪些代币从未跌破 10 美元？”**：

```sql title="Query"
SELECT crypto_name FROM holdings
EXCEPT
SELECT crypto_name FROM crypto_prices
WHERE price < 10;
```

```response title="Response"
┌─crypto_name─┐
│ Bitcoin     │
│ Bitcoin     │
└─────────────┘
```

这意味着在我们持有的四种加密货币中，只有比特币从未跌破 10 美元（基于本示例中我们所拥有的有限数据）。

### 使用 `EXCEPT DISTINCT`

请注意，在前一个查询的结果中，我们看到了多条比特币持仓记录。你可以在 `EXCEPT` 中添加 `DISTINCT`，以从结果中去除重复的行：

```sql title="Query"
SELECT crypto_name FROM holdings
EXCEPT DISTINCT
SELECT crypto_name FROM crypto_prices
WHERE price < 10;
```

```response title="Response"
┌─crypto_name─┐
│ Bitcoin     │
└─────────────┘
```

**另请参阅**

* [UNION](/sql-reference/statements/select/union)
* [INTERSECT](/sql-reference/statements/select/intersect)
