---
slug: /sql-reference/statements/select/intersect
sidebar_label: INTERSECT
---


# INTERSECT 子句

`INTERSECT` 子句仅返回来自第一个和第二个查询的结果行。查询必须匹配列的数量、顺序和类型。`INTERSECT` 的结果可以包含重复行。

如果没有指定括号，则多个 `INTERSECT` 语句从左到右执行。`INTERSECT` 运算符的优先级高于 `UNION` 和 `EXCEPT` 子句。

``` sql
SELECT column1 [, column2 ]
FROM table1
[WHERE condition]

INTERSECT

SELECT column1 [, column2 ]
FROM table2
[WHERE condition]

```
条件可以是基于您的要求的任何表达式。

## 示例 {#examples}

这是一个简单的例子，找出数字 1 到 10 与数字 3 到 8 的交集：

```sql
SELECT number FROM numbers(1,10) INTERSECT SELECT number FROM numbers(3,8);
```

结果：

```response
┌─number─┐
│      3 │
│      4 │
│      5 │
│      6 │
│      7 │
│      8 │
└────────┘
```

当您有两个共享公共列（或列）的表时，`INTERSECT` 非常有用。只要结果包含相同的列，您就可以交集两个查询的结果。例如，假设我们有数百万行的历史加密货币数据，其中包含交易价格和交易量：

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

现在假设我们有一个名为 `holdings` 的表，包含我们持有的加密货币列表以及币的数量：

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
   ('DOGEFI', 10);
   ('Bitcoin Diamond', 5000);
```

我们可以使用 `INTERSECT` 来回答诸如 **“我们持有的哪些币的交易价格超过 $100？”** 之类的问题：

```sql
SELECT crypto_name FROM holdings
INTERSECT
SELECT crypto_name FROM crypto_prices
WHERE price > 100
```

结果：

```response
┌─crypto_name─┐
│ Bitcoin     │
│ Bitcoin     │
│ Ethereum    │
│ Ethereum    │
└─────────────┘
```

这意味着在某些时候，比特币和以太坊的交易价格超过了 $100，而 DOGEFI 和比特币钻石的交易价格从未超过 $100（至少在我们这个例子中的数据是这样）。

## INTERSECT DISTINCT {#intersect-distinct}

注意在之前的查询中，我们有多个比特币和以太坊的持有记录交易价格超过 $100。去除重复行可能会很有用（因为它们只重复我们已经知道的内容）。您可以在 `INTERSECT` 后添加 `DISTINCT` 来消除结果中的重复行：

```sql
SELECT crypto_name FROM holdings
INTERSECT DISTINCT
SELECT crypto_name FROM crypto_prices
WHERE price > 100;
```

结果：

```response
┌─crypto_name─┐
│ Bitcoin     │
│ Ethereum    │
└─────────────┘
```


**另请参阅**

- [UNION](/sql-reference/statements/select/union)
- [EXCEPT](/sql-reference/statements/select/except)
