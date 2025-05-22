---
'description': 'INTERSECT 子句的文档'
'sidebar_label': 'INTERSECT'
'slug': '/sql-reference/statements/select/intersect'
'title': 'INTERSECT 子句'
---


# INTERSECT 子句

`INTERSECT` 子句仅返回来自第一个和第二个查询的结果行。这两个查询必须匹配列数、顺序和类型。`INTERSECT` 的结果可以包含重复行。

多个 `INTERSECT` 语句在没有指定括号的情况下从左到右执行。`INTERSECT` 运算符的优先级高于 `UNION` 和 `EXCEPT` 子句。

```sql
SELECT column1 [, column2 ]
FROM table1
[WHERE condition]

INTERSECT

SELECT column1 [, column2 ]
FROM table2
[WHERE condition]

```
该条件可以根据您的需求是任何表达式。

## 示例 {#examples}

这是一个简单的示例，将数字 1 到 10 与数字 3 到 8 进行交集：

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

当您有两个共享公共列（或列）的表时，`INTERSECT` 非常有用。您可以对两个查询的结果进行交集，只要这些结果包含相同的列。例如，假设我们有几百万行的历史加密货币数据，其中包含交易价格和交易量：

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

现在假设我们有一个名为 `holdings` 的表，包含我们拥有的加密货币的列表，以及对应的币种数量：

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

我们可以使用 `INTERSECT` 来回答类似 **“我们拥有的哪些币在交易价格超过 $100 的情况下？”** 的问题：

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

这意味着在某个时间点，比特币和以太坊的交易价格超过了 $100，而 DOGEFI 和 Bitcoin Diamond 从未交易过 $100（至少根据我们在这个例子中拥有的数据）。

## INTERSECT DISTINCT {#intersect-distinct}

请注意，在之前的查询中，我们有多个比特币和以太坊的持有量，它们的交易价格超过了 $100。去除重复行（因为它们只重复了我们已经知道的信息）可能会很好。您可以在 `INTERSECT` 中添加 `DISTINCT` 以消除结果中的重复行：

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


**另见**

- [UNION](/sql-reference/statements/select/union)
- [EXCEPT](/sql-reference/statements/select/except)
