---
slug: /sql-reference/statements/select/intersect
sidebar_label: INTERSECT
---


# INTERSECT 句

`INTERSECT` 句は、最初のクエリと二番目のクエリの両方から得られる行のみを返します。クエリは、カラムの数、順序、型が一致している必要があります。`INTERSECT` の結果には重複行が含まれる可能性があります。

複数の `INTERSECT` 文は、括弧が指定されていない場合、左から右へ実行されます。`INTERSECT` 演算子は、`UNION` および `EXCEPT` 句よりも優先度が高いです。


```sql
SELECT column1 [, column2 ]
FROM table1
[WHERE condition]

INTERSECT

SELECT column1 [, column2 ]
FROM table2
[WHERE condition]

```
条件は、要件に基づく任意の式である可能性があります。

## 例 {#examples}

こちらは、1から10の数値と3から8の数値を交差させるシンプルな例です：

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

`INTERSECT` は、共通のカラム（またはカラム）がある二つのテーブルがある場合に便利です。同じカラムを含む結果を持つ二つのクエリを交差させることができます。例えば、取引価格とボリュームを含む数百万行の歴史的な暗号通貨データがあるとしましょう：

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

次に、保有している暗号通貨とそのコイン数のリストを含む `holdings` という名前のテーブルがあるとしましょう：

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

`INTERSECT` を使用して **「$100以上で取引されたコインはどれですか？」** という質問に答えることができます：

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

これは、ある時点でBitcoinとEthereumが$100を超える取引を行ったことを意味し、DOGEFIとBitcoin Diamondはこれまで$100を超えて取引されたことはありません（この例で持っているデータを使う限り）。

## INTERSECT DISTINCT {#intersect-distinct}

前のクエリでは、$100を超える取引を行ったBitcoinとEthereumの重複した保有がありました。重複行を削除するのは良い考えかもしれません（既に知っている情報を繰り返すだけですから）。`INTERSECT` に `DISTINCT` を追加して、結果から重複行を排除できます：

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


**関連情報**

- [UNION](union.md#union-clause)
- [EXCEPT](except.md#except-clause)
