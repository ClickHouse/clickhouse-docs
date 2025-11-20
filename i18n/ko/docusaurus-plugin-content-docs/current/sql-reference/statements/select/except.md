---
'description': 'EXCEPT 절에 대한 문서로, 두 번째 쿼리 없이 첫 번째 쿼리의 결과로 나오는 행만을 반환합니다.'
'sidebar_label': 'EXCEPT'
'slug': '/sql-reference/statements/select/except'
'title': 'EXCEPT 절'
'keywords':
- 'EXCEPT'
- 'clause'
'doc_type': 'reference'
---


# EXCEPT 절

> `EXCEPT` 절은 두 번째 쿼리를 제외한 첫 번째 쿼리로부터 나온 행만 반환합니다.

- 두 쿼리는 동일한 순서와 데이터 유형의 컬럼 수가 같아야 합니다.
- `EXCEPT`의 결과는 중복된 행을 포함할 수 있습니다. 원하지 않는 경우 `EXCEPT DISTINCT`를 사용하세요.
- 괄호가 지정되지 않은 경우 여러 `EXCEPT` 문은 왼쪽에서 오른쪽으로 실행됩니다.
- `EXCEPT` 연산자는 `UNION` 절과 동일한 우선 순위를 가지며 `INTERSECT` 절보다 낮은 우선 순위를 가집니다.

## 구문 {#syntax}

```sql
SELECT column1 [, column2 ]
FROM table1
[WHERE condition]

EXCEPT

SELECT column1 [, column2 ]
FROM table2
[WHERE condition]
```
조건은 귀하의 요구 사항에 따라 어떤 표현식일 수 있습니다.

추가로, `EXCEPT()`를 사용하여 동일한 테이블의 결과에서 컬럼을 제외할 수 있으며, 이는 BigQuery (Google Cloud)에서 가능한 문법입니다:

```sql
SELECT column1 [, column2 ] EXCEPT (column3 [, column4]) 
FROM table1 
[WHERE condition]
```

## 예제 {#examples}

이 섹션의 예제는 `EXCEPT` 절의 사용법을 보여줍니다.

### `EXCEPT` 절을 사용한 숫자 필터링 {#filtering-numbers-using-the-except-clause}

다음은 3부터 8까지의 숫자에 _포함되지 않는_ 1부터 10까지의 숫자를 반환하는 간단한 예입니다:

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

### `EXCEPT()`를 사용하여 특정 컬럼 제외하기 {#excluding-specific-columns-using-except}

`EXCEPT()`를 사용하여 결과에서 컬럼을 신속하게 제외할 수 있습니다. 예를 들어, 아래의 예와 같이 몇 개의 선택된 컬럼을 제외하고 테이블의 모든 컬럼을 선택하고 싶을 경우:

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

   ┌─name────────────────────┬─value──────┬─changed─┬─min──┬─max──┬─type────┬─is_obsolete─┬─tier───────┐
1. │ dialect                 │ clickhouse │       0 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ Dialect │           0 │ Production │
2. │ min_compress_block_size │ 65536      │       0 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ UInt64  │           0 │ Production │
3. │ max_compress_block_size │ 1048576    │       0 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ UInt64  │           0 │ Production │
4. │ max_block_size          │ 65409      │       0 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ UInt64  │           0 │ Production │
5. │ max_insert_block_size   │ 1048449    │       0 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ UInt64  │           0 │ Production │
   └─────────────────────────┴────────────┴─────────┴──────┴──────┴─────────┴─────────────┴────────────┘
```

### 암호 화폐 데이터와 함께 `EXCEPT` 및 `INTERSECT` 사용하기 {#using-except-and-intersect-with-cryptocurrency-data}

`EXCEPT`와 `INTERSECT`는 종종 서로 다른 부울 논리로 교환 가능하게 사용될 수 있으며, 공통 컬럼(또는 컬럼)을 공유하는 두 개의 테이블이 있을 때 모두 유용합니다.
예를 들어, 거래 가격과 거래량을 포함하는 몇 백만 개의 역사적 암호 화폐 데이터가 있다고 가정해 봅시다:

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
```

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

이제 우리가 소유한 암호 화폐 목록과 보유 coin 수를 포함하는 `holdings`라는 테이블이 있다고 가정해 봅시다:

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

`EXCEPT`를 사용하여 **"우리가 소유한 코인 중 절대 $10 이하로 거래된 적이 없는 코인은 어떤 것인가?"**라는 질문에 답할 수 있습니다:

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

이 의미는 우리가 소유한 네 개의 암호 화폐 중 오직 비트코인만이 $10 이하로 떨어진 적이 없다는 것입니다 (이 예제의 제한된 데이터를 기준으로).

### `EXCEPT DISTINCT` 사용하기 {#using-except-distinct}

이전 쿼리에서는 결과에 여러 개의 비트코인 보유가 있었습니다. 결과에서 중복된 행을 없애기 위해 `EXCEPT`에 `DISTINCT`를 추가할 수 있습니다:

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

**참고**

- [UNION](/sql-reference/statements/select/union)
- [INTERSECT](/sql-reference/statements/select/intersect)
