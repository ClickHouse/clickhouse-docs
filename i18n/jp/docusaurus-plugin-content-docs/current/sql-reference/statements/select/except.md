---
description: '最初のクエリの結果から 2 つ目のクエリの結果を差し引いた行のみを返す EXCEPT 句に関するドキュメント。'
sidebar_label: 'EXCEPT'
slug: /sql-reference/statements/select/except
title: 'EXCEPT 句'
keywords: ['EXCEPT', 'clause']
doc_type: 'reference'
---



# EXCEPT 句

> `EXCEPT` 句は、2 つのクエリのうち、2 番目ではなく 1 番目のクエリの結果にのみ含まれる行を返します。

- 両方のクエリは、列の数・順序・データ型が同じである必要があります。
- `EXCEPT` の結果には重複行が含まれる場合があります。これを避けたい場合は `EXCEPT DISTINCT` を使用します。
- 括弧が指定されていない場合、複数の `EXCEPT` 句は左から右に実行されます。
- `EXCEPT` 演算子の優先順位は `UNION` 句と同じであり、`INTERSECT` 句よりも低くなります。



## 構文 {#syntax}

```sql
SELECT column1 [, column2 ]
FROM table1
[WHERE condition]

EXCEPT

SELECT column1 [, column2 ]
FROM table2
[WHERE condition]
```

条件には、要件に応じて任意の式を指定できます。

また、BigQuery (Google Cloud) と同様に、`EXCEPT()` を使用して同一テーブルの結果から列を除外することができます。以下の構文を使用します:

```sql
SELECT column1 [, column2 ] EXCEPT (column3 [, column4])
FROM table1
[WHERE condition]
```


## 例 {#examples}

このセクションの例では、`EXCEPT`句の使用方法を示します。

### `EXCEPT`句を使用した数値のフィルタリング {#filtering-numbers-using-the-except-clause}

以下は、3から8の数値に含まれ_ない_1から10の数値を返すシンプルな例です:

```sql title="クエリ"
SELECT number
FROM numbers(1, 10)
EXCEPT
SELECT number
FROM numbers(3, 6)
```

```response title="レスポンス"
┌─number─┐
│      1 │
│      2 │
│      9 │
│     10 │
└────────┘
```

### `EXCEPT()`を使用した特定のカラムの除外 {#excluding-specific-columns-using-except}

`EXCEPT()`を使用すると、結果から特定のカラムを素早く除外できます。例えば、以下の例に示すように、テーブルからいくつかの特定のカラムを除いてすべてのカラムを選択したい場合:

```sql title="クエリ"
SHOW COLUMNS IN system.settings

SELECT * EXCEPT (default, alias_for, readonly, description)
FROM system.settings
LIMIT 5
```

```response title="レスポンス"
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

`EXCEPT`と`INTERSECT`は、異なるブール論理で相互に置き換えて使用できることが多く、共通のカラム(または複数のカラム)を共有する2つのテーブルがある場合に便利です。
例えば、取引価格と出来高を含む数百万行の過去の暗号通貨データがあるとします:

```sql title="Query"
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

Now suppose we have a table named `holdings` that contains a list of cryptocurrencies that we own, along with the number of coins:

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

We can use `EXCEPT` to answer a question like **"Which coins do we own have never traded below $10?"**:

```sql title="クエリ"
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

これは、保有している4つの暗号通貨のうち、Bitcoinのみが10ドル未満に下落したことがないことを意味します(この例の限定的なデータに基づく)。

### `EXCEPT DISTINCT`の使用 {#using-except-distinct}

前のクエリでは、結果に複数のBitcoinの保有レコードが含まれていることに注意してください。`EXCEPT`に`DISTINCT`を追加することで、結果から重複行を除外できます:

```sql title="クエリ"
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

- [UNION](/sql-reference/statements/select/union)
- [INTERSECT](/sql-reference/statements/select/intersect)
