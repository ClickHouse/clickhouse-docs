---
description: 'EXCEPT 句に関するドキュメントです。1つ目のクエリの結果から 2つ目のクエリの結果を除いた行のみを返します。'
sidebar_label: 'EXCEPT'
slug: /sql-reference/statements/select/except
title: 'EXCEPT 句'
keywords: ['EXCEPT', '句']
doc_type: 'reference'
---



# EXCEPT 句

> `EXCEPT` 句は、最初のクエリの結果から 2 つ目のクエリの結果を除外した行だけを返します。 

- 両方のクエリは、同じ順序・データ型で同数の列を持っている必要があります。
- `EXCEPT` の結果には重複行が含まれる場合があります。これを避けたい場合は `EXCEPT DISTINCT` を使用します。
- `EXCEPT` が複数ある場合は、かっこで明示的にグループ化しない限り、左から右の順に評価されます。 
- `EXCEPT` 演算子の優先順位は `UNION` 句と同じで、`INTERSECT` 句よりも低くなります。



## 構文

```sql
SELECT column1 [, column2 ]
FROM table1
[WHERE condition]

EXCEPT

SELECT column1 [, column2 ]
FROM table2
[WHERE condition]
```

条件には、要件に応じて任意の式を使用できます。

さらに、`EXCEPT()` は、BigQuery（Google Cloud）と同様に、同じテーブルに対する結果セットから列を除外するためにも、次の構文で使用できます。

```sql
SELECT column1 [, column2 ] EXCEPT (column3 [, column4]) 
FROM table1 
[WHERE condition]
```


## 例

このセクションの例では、`EXCEPT` 句の使用方法を示します。

### `EXCEPT` 句を使用した数値のフィルタリング

次は、1 から 10 までの数のうち、3 から 8 までの数には *含まれない* ものを返す簡単な例です。

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

### `EXCEPT()` を使用して特定のカラムを除外する

`EXCEPT()` は、結果セットからカラムを素早く除外するために使用できます。例えば、以下の例のように、テーブルから特定のカラムのみを除外し、それ以外のすべてのカラムを選択したい場合に利用できます。

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


┌─name────────────────────┬─value──────┬─changed─┬─min──┬─max──┬─type────┬─is&#95;obsolete─┬─tier───────┐

1. │ dialect                 │ clickhouse │       0 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ Dialect │           0 │ Production │
2. │ min&#95;compress&#95;block&#95;size │ 65536      │       0 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ UInt64  │           0 │ Production │
3. │ max&#95;compress&#95;block&#95;size │ 1048576    │       0 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ UInt64  │           0 │ Production │
4. │ max&#95;block&#95;size          │ 65409      │       0 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ UInt64  │           0 │ Production │
5. │ max&#95;insert&#95;block&#95;size   │ 1048449    │       0 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ UInt64  │           0 │ Production │
   └─────────────────────────┴────────────┴─────────┴──────┴──────┴─────────┴─────────────┴────────────┘

````

### 暗号通貨データでの`EXCEPT`と`INTERSECT`の使用 {#using-except-and-intersect-with-cryptocurrency-data}

`EXCEPT`と`INTERSECT`は、異なるブール論理で相互に置き換えて使用できることが多く、共通の列（または複数の列）を共有する2つのテーブルがある場合に便利です。
例えば、取引価格と出来高を含む数百万行の過去の暗号通貨データがあるとします。

```sql title="クエリ"
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

ここで、`holdings` という名前のテーブルがあり、自分たちが保有する暗号通貨の一覧と、それぞれの保有枚数が含まれているとします。

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

`EXCEPT` を使うと、**「保有しているコインのうち、価格が一度も 10 ドルを下回ったことのないものはどれか？」** のような問いに答えることができます。

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

つまり、私たちが保有している4つの暗号通貨のうち、Bitcoinだけが一度も$10を下回ったことがない（この例で扱っている限定的なデータに基づく）という意味です。

### `EXCEPT DISTINCT` の使用

前のクエリでは、結果に複数のBitcoinの保有行が含まれていたことに注目してください。`EXCEPT` に `DISTINCT` を追加すると、結果から重複する行を取り除くことができます。

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

**関連項目**

* [UNION](/sql-reference/statements/select/union)
* [INTERSECT](/sql-reference/statements/select/intersect)
