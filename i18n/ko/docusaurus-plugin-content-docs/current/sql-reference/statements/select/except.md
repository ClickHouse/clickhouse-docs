---
description: 'EXCEPT 절에 대한 문서로, 첫 번째 쿼리 결과에서 두 번째 쿼리 결과를 제외한 행만 반환합니다.'
sidebar_label: 'EXCEPT'
slug: /sql-reference/statements/select/except
title: 'EXCEPT 절'
keywords: ['EXCEPT', '절']
doc_type: 'reference'
---

# EXCEPT 절 \{#except-clause\}

> `EXCEPT` 절은 첫 번째 쿼리의 결과 중 두 번째 쿼리에는 없는 행만 반환합니다.

* 두 쿼리는 모두 동일한 순서와 데이터 타입으로 동일한 개수의 컬럼을 가져야 합니다.
* `EXCEPT`의 결과에는 중복된 행이 포함될 수 있습니다. 이를 원하지 않으면 `EXCEPT DISTINCT`를 사용합니다.
* 괄호를 사용하지 않으면 여러 개의 `EXCEPT` SQL 문은 왼쪽에서 오른쪽 순서로 실행됩니다.
* `EXCEPT` 연산자는 `UNION` 절과 동일한 우선순위를 가지며 `INTERSECT` 절보다 낮은 우선순위를 가집니다.

## 구문 \{#syntax\}

```sql
SELECT column1 [, column2 ]
FROM table1
[WHERE condition]

EXCEPT

SELECT column1 [, column2 ]
FROM table2
[WHERE condition]
```

조건은 요구 사항에 따라 어떤 식이든 될 수 있습니다.

또한 `EXCEPT()`는 BigQuery(Google Cloud)에서와 같이, 다음 구문을 사용하여 동일한 테이블의 결과에서 컬럼을 제외하는 데 사용할 수 있습니다:

```sql
SELECT column1 [, column2 ] EXCEPT (column3 [, column4]) 
FROM table1 
[WHERE condition]
```

## 예시 \{#examples\}

이 섹션의 예시는 `EXCEPT` 절의 사용 방법을 보여줍니다.

### `EXCEPT` 절을 사용한 숫자 필터링 \{#filtering-numbers-using-the-except-clause\}

다음은 1부터 10까지의 숫자 중에서 3부터 8까지의 숫자에 *포함되지 않는* 숫자를 반환하는 간단한 예시입니다.

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

### `EXCEPT()`를 사용하여 특정 컬럼 제외하기 \{#excluding-specific-columns-using-except\}

`EXCEPT()`는 결과에서 특정 컬럼을 빠르게 제외할 때 사용할 수 있습니다. 예를 들어 아래 예시와 같이, 테이블에서 일부 컬럼만 제외하고 나머지 모든 컬럼을 선택하려는 경우에 사용할 수 있습니다.

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

1. │ dialect                 │ clickhouse │       0 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ Dialect │           0 │ 운영        │
2. │ min&#95;compress&#95;block&#95;size │ 65536      │       0 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ UInt64  │           0 │ 운영        │
3. │ max&#95;compress&#95;block&#95;size │ 1048576    │       0 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ UInt64  │           0 │ 운영        │
4. │ max&#95;block&#95;size          │ 65409      │       0 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ UInt64  │           0 │ 운영        │
5. │ max&#95;insert&#95;block&#95;size   │ 1048449    │       0 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ UInt64  │           0 │ 운영        │
   └─────────────────────────┴────────────┴─────────┴──────┴──────┴─────────┴─────────────┴────────────┘

````

### Using `EXCEPT` and `INTERSECT` with Cryptocurrency Data {#using-except-and-intersect-with-cryptocurrency-data}

`EXCEPT` and `INTERSECT` can often be used interchangeably with different Boolean logic, and they are both useful if you have two tables that share a common column (or columns).
For example, suppose we have a few million rows of historical cryptocurrency data that contains trade prices and volume:

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

이제 `holdings`라는 이름의 테이블이 있고, 이 테이블에는 보유 중인 암호화폐 목록과 각 암호화폐의 코인 수가 저장되어 있다고 가정해 보겠습니다.

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

`EXCEPT`를 사용하면 **&quot;보유한 코인 중 가격이 한 번도 $10 아래로 내려간 적이 없는 코인은 무엇인가?&quot;** 같은 질문에 답할 수 있습니다:

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

이는 보유 중인 4종의 암호화폐 가운데, 이 예제에서 사용한 제한된 데이터를 기준으로 할 때 비트코인만이 단 한 번도 $10 아래로 떨어진 적이 없다는 뜻입니다.

### `EXCEPT DISTINCT` 사용하기 \{#using-except-and-intersect-with-cryptocurrency-data\}

이전 쿼리의 결과에서 비트코인 보유분이 여러 행으로 나타났다는 점에 유의하십시오. 결과에서 중복된 행을 제거하려면 `EXCEPT`에 `DISTINCT`를 추가하면 됩니다:

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

**함께 보기**

* [UNION](/sql-reference/statements/select/union)
* [INTERSECT](/sql-reference/statements/select/intersect)
