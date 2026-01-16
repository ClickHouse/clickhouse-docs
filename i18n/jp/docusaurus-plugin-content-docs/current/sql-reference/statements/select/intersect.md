---
description: 'INTERSECT 句に関するリファレンス'
sidebar_label: 'INTERSECT'
slug: /sql-reference/statements/select/intersect
title: 'INTERSECT 句'
doc_type: 'reference'
---

# INTERSECT 句 \{#intersect-clause\}

`INTERSECT` 句は、1つ目と2つ目の両方のクエリ結果に共通して含まれる行のみを返します。クエリは列数、順序、および型が一致している必要があります。`INTERSECT` の結果には重複した行が含まれる場合があります。

複数の `INTERSECT` 文は、かっこが指定されていない場合は左から右の順に評価されます。`INTERSECT` 演算子は、`UNION` および `EXCEPT` 句よりも高い優先順位を持ちます。

```sql
SELECT column1 [, column2 ]
FROM table1
[WHERE condition]

INTERSECT

SELECT column1 [, column2 ]
FROM table2
[WHERE condition]

```

条件には、要件に応じた任意の式を指定できます。

## 例 \{#examples\}

ここでは、1 から 10 までの数と 3 から 8 までの数の積集合を求める簡単な例を示します。

```sql
SELECT number FROM numbers(1,10) INTERSECT SELECT number FROM numbers(3,8);
```

結果：

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

`INTERSECT` は、共通のカラム（または複数のカラム）を持つ 2 つのテーブルがある場合に便利です。結果セットが同じカラム構成であれば、2 つのクエリ結果の共通部分を取得できます。たとえば、取引価格と出来高を含む数百万行の暗号通貨の過去データがあるとします。

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

次に、保有している暗号資産の一覧と、それぞれの保有枚数を格納した `holdings` という名前のテーブルがあるとしましょう。

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

`INTERSECT` を使用すると、**「保有しているコインのうち、これまでに 100 ドルを超える価格で取引されたものはどれか？」** といった質問に答えることができます。

```sql
SELECT crypto_name FROM holdings
INTERSECT
SELECT crypto_name FROM crypto_prices
WHERE price > 100
```

結果：

```response
┌─crypto_name─┐
│ Bitcoin     │
│ Bitcoin     │
│ Ethereum    │
│ Ethereum    │
└─────────────┘
```

これは、ある時点で Bitcoin と Ethereum は 100ドルを上回る価格で取引された一方で、DOGEFI と Bitcoin Diamond は（少なくともこの例で用いているデータの範囲では）100ドルを上回って取引されたことが一度もないことを意味します。

## INTERSECT DISTINCT \{#intersect-distinct\}

前のクエリでは、100ドルを超える価格で取引された Bitcoin と Ethereum の保有が複数行含まれていました。同じ内容が繰り返されているだけなので、重複行を取り除けると便利です。結果セットから重複行を排除するには、`INTERSECT` に `DISTINCT` を追加します。

```sql
SELECT crypto_name FROM holdings
INTERSECT DISTINCT
SELECT crypto_name FROM crypto_prices
WHERE price > 100;
```

結果：

```response
┌─crypto_name─┐
│ Bitcoin     │
│ Ethereum    │
└─────────────┘
```

**関連項目**

* [UNION](/sql-reference/statements/select/union)
* [EXCEPT](/sql-reference/statements/select/except)
