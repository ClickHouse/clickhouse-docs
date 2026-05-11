---
description: 'INTERSECT 절 문서'
sidebar_label: 'INTERSECT'
slug: /sql-reference/statements/select/intersect
title: 'INTERSECT 절'
doc_type: 'reference'
---

# INTERSECT 절 \{#intersect-clause\}

`INTERSECT` 절은 첫 번째 쿼리와 두 번째 쿼리 모두의 결과에 포함되는 행만 반환합니다. 두 쿼리는 컬럼의 개수, 순서, 데이터 타입이 일치해야 합니다. `INTERSECT` 결과에는 중복된 행이 포함될 수 있습니다.

괄호를 사용하지 않으면 여러 개의 `INTERSECT` SQL 문은 왼쪽에서 오른쪽 순서로 실행됩니다. `INTERSECT` 연산자는 `UNION` 및 `EXCEPT` 절보다 우선순위가 높습니다.

```sql
SELECT column1 [, column2 ]
FROM table1
[WHERE condition]

INTERSECT

SELECT column1 [, column2 ]
FROM table2
[WHERE condition]

```

조건은 요구 사항에 따라 임의의 식이 될 수 있습니다.

## 예시 \{#examples\}

다음은 1부터 10까지의 숫자와 3부터 8까지의 숫자의 교집합을 구하는 간단한 예시입니다:

```sql
SELECT number FROM numbers(1,10) INTERSECT SELECT number FROM numbers(3,8);
```

결과:

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

`INTERSECT`는 하나 이상의 공통 컬럼을 공유하는 두 테이블이 있을 때 유용합니다. 결과에 동일한 컬럼들이 포함되어 있는 한, 두 쿼리의 결과를 교집합으로 구할 수 있습니다. 예를 들어, 수백만 행에 이르는 과거 암호화폐 데이터가 있고, 이 데이터에 거래 가격과 거래량이 포함되어 있다고 가정해 보겠습니다.

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

이제 `holdings`라는 이름의 테이블에 보유 중인 암호화폐 목록과 각 코인의 개수가 저장되어 있다고 가정합니다.

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

`INTERSECT`를 사용하면 **「우리가 보유한 코인 중 가격이 $100을 초과하여 거래된 것은 무엇인가?」**와 같은 질문에 답할 수 있습니다.

```sql
SELECT crypto_name FROM holdings
INTERSECT
SELECT crypto_name FROM crypto_prices
WHERE price > 100
```

결과:

```response
┌─crypto_name─┐
│ Bitcoin     │
│ Bitcoin     │
│ Ethereum    │
│ Ethereum    │
└─────────────┘
```

이는 어떤 시점에는 Bitcoin과 Ethereum이 $100 이상에서 거래된 적이 있었고, DOGEFI와 Bitcoin Diamond는 이 예제에서 사용한 데이터 기준으로는 한 번도 $100 이상에서 거래된 적이 없음을 의미합니다.

## INTERSECT DISTINCT \{#intersect-distinct\}

이전 쿼리에서는 100달러 이상에 거래된 Bitcoin과 Ethereum 보유분이 여러 개 있었던 것을 확인할 수 있습니다. 이미 알고 있는 내용을 반복할 뿐인 중복 행을 제거하면 결과가 더 깔끔해집니다. 결과에서 중복 행을 제거하려면 `INTERSECT`에 `DISTINCT`를 추가하면 됩니다:

```sql
SELECT crypto_name FROM holdings
INTERSECT DISTINCT
SELECT crypto_name FROM crypto_prices
WHERE price > 100;
```

결과:

```response
┌─crypto_name─┐
│ Bitcoin     │
│ Ethereum    │
└─────────────┘
```

**함께 보기**

* [UNION](/sql-reference/statements/select/union)
* [EXCEPT](/sql-reference/statements/select/except)
