---
description: 'INTERSECT 句に関するドキュメント'
sidebar_label: 'INTERSECT'
slug: /sql-reference/statements/select/intersect
title: 'INTERSECT 句'
doc_type: 'reference'
---



# INTERSECT 句

`INTERSECT` 句は、第 1 のクエリと第 2 のクエリの両方で得られる行だけを返します。クエリ同士は、列数、列の順序、およびデータ型が一致していなければなりません。`INTERSECT` の結果には重複行が含まれる場合があります。

複数の `INTERSECT` ステートメントは、かっこが指定されていない場合、左から右へ順に実行されます。`INTERSECT` 演算子は、`UNION` および `EXCEPT` 句よりも高い優先度を持ちます。

```sql
SELECT column1 [, column2 ]
FROM table1
[WHERE condition]

INTERSECT

SELECT column1 [, column2 ]
FROM table2
[WHERE condition]

```

条件は、要件に応じて任意の式を指定できます。


## 例 {#examples}

以下は、1から10までの数値と3から8までの数値の積集合を求める簡単な例です:

```sql
SELECT number FROM numbers(1,10) INTERSECT SELECT number FROM numbers(3,8);
```

結果:

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

`INTERSECT`は、共通のカラム(または複数のカラム)を持つ2つのテーブルがある場合に便利です。結果に同じカラムが含まれている限り、2つのクエリの結果の積集合を求めることができます。例えば、取引価格と出来高を含む数百万行の過去の暗号通貨データがあるとします:

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

次に、所有している暗号通貨のリストとコインの数量を含む`holdings`という名前のテーブルがあるとします:

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

`INTERSECT`を使用して、**「所有しているコインのうち、100ドルを超える価格で取引されたものはどれか?」**といった質問に答えることができます:

```sql
SELECT crypto_name FROM holdings
INTERSECT
SELECT crypto_name FROM crypto_prices
WHERE price > 100
```

結果:

```response
┌─crypto_name─┐
│ Bitcoin     │
│ Bitcoin     │
│ Ethereum    │
│ Ethereum    │
└─────────────┘
```


これは、ある時点では Bitcoin と Ethereum は 100ドル超で取引されていた一方、DOGEFI と Bitcoin Diamond は（少なくともこの例で用いているデータの範囲では）一度も 100ドルを超えて取引されたことがない、ということを意味します。



## INTERSECT DISTINCT {#intersect-distinct}

前のクエリでは、100ドルを超えて取引されたBitcoinとEthereumの保有が複数ありました。重複する行を削除すると便利かもしれません(既に分かっていることを繰り返しているだけなので)。結果から重複行を除外するには、`INTERSECT`に`DISTINCT`を追加できます:

```sql
SELECT crypto_name FROM holdings
INTERSECT DISTINCT
SELECT crypto_name FROM crypto_prices
WHERE price > 100;
```

結果:

```response
┌─crypto_name─┐
│ Bitcoin     │
│ Ethereum    │
└─────────────┘
```

**関連項目**

- [UNION](/sql-reference/statements/select/union)
- [EXCEPT](/sql-reference/statements/select/except)
