---
'description': 'EXCEPT 句のドキュメント'
'sidebar_label': 'EXCEPT'
'slug': '/sql-reference/statements/select/except'
'title': 'EXCEPT Clause'
---




# EXCEPT句

`EXCEPT`句は、最初のクエリの結果から2番目のクエリを除いた行のみを返します。

- 両方のクエリは同じ数のカラムを同じ順序とデータ型で持つ必要があります。
- `EXCEPT`の結果には重複行が含まれる可能性があります。重複が望ましくない場合は`EXCEPT DISTINCT`を使用してください。
- 括弧が指定されていない場合、複数の`EXCEPT`文は左から右に実行されます。
- `EXCEPT`演算子は、`UNION`句と同じ優先度を持ち、`INTERSECT`句よりも低い優先度です。

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
条件は、要件に基づく任意の式で設定できます。

さらに、`EXCEPT()`を使用して同じテーブルの結果からカラムを除外することができます。これはBigQuery（Google Cloud）で可能な構文です：

```sql
SELECT column1 [, column2 ] EXCEPT (column3 [, column4]) 
FROM table1 
[WHERE condition]
```

## 例 {#examples}

このセクションの例は、`EXCEPT`句の使用法を示しています。

### `EXCEPT`句を使用した数字のフィルタリング {#filtering-numbers-using-the-except-clause}

こちらは、数字3から8の数字が含まれない1から10の数字を返すシンプルな例です：

クエリ：

```sql
SELECT number
FROM numbers(1, 10)
EXCEPT
SELECT number
FROM numbers(3, 8)
```

結果：

```response
┌─number─┐
│      1 │
│      2 │
│      9 │
│     10 │
└────────┘
```

### `EXCEPT()`を使用した特定のカラムの除外 {#excluding-specific-columns-using-except}

`EXCEPT()`を使用して結果からカラムを迅速に除外することができます。たとえば、以下の例のように、いくつかのカラムを除外してテーブルからすべてのカラムを選択したいとします：

クエリ：

```sql
SHOW COLUMNS IN system.settings

SELECT * EXCEPT (default, alias_for, readonly, description)
FROM system.settings
LIMIT 5
```

結果：

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

### 暗号通貨データとともに`EXCEPT`および`INTERSECT`を使用する {#using-except-and-intersect-with-cryptocurrency-data}

`EXCEPT`と`INTERSECT`は、異なるブール論理で相互に使用されることが多く、共通のカラム（またはカラム）のある2つのテーブルがある場合にどちらも役立ちます。
たとえば、取引価格と取引量を含む歴史的な暗号通貨データが数百万行あるとしましょう：

クエリ：

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

結果：

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

次に、私たちが保有している暗号通貨のリストとそれぞれのコイン枚数を含む`holdings`という名前のテーブルがあるとしましょう：

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

`EXCEPT`を使用して「**私たちの所有するコインで$10未満で取引されたことがないのはどれか？**」という質問に答えることができます：

```sql
SELECT crypto_name FROM holdings
EXCEPT
SELECT crypto_name FROM crypto_prices
WHERE price < 10;
```

結果：

```response
┌─crypto_name─┐
│ Bitcoin     │
│ Bitcoin     │
└─────────────┘
```

これは、私たちが所有する4つの暗号通貨のうち、Bitcoinだけが$10を下回ったことがないことを示しています（この例で示される限られたデータに基づいています）。

### `EXCEPT DISTINCT`を使用する {#using-except-distinct}

以前のクエリでは、結果に複数のBitcoinの保有がありました。`EXCEPT`に`DISTINCT`を追加して、結果から重複行を排除することができます：

```sql
SELECT crypto_name FROM holdings
EXCEPT DISTINCT
SELECT crypto_name FROM crypto_prices
WHERE price < 10;
```

結果：

```response
┌─crypto_name─┐
│ Bitcoin     │
└─────────────┘
```

**参照**

- [UNION](/sql-reference/statements/select/union)
- [INTERSECT](/sql-reference/statements/select/intersect)
