---
description: 'ClickHouse에서 사용하는 `WHERE` 절에 대한 문서'
sidebar_label: 'WHERE'
slug: /sql-reference/statements/select/where
title: 'WHERE 절'
doc_type: 'reference'
keywords: ['WHERE']
---



# WHERE 절 \{#where-clause\}

`WHERE` 절은 `SELECT`의 [`FROM`](../../../sql-reference/statements/select/from.md) 절에서 가져온 데이터를 필터링하는 데 사용합니다.

`WHERE` 절이 있는 경우, 그 뒤에는 `UInt8` 타입의 표현식이 와야 합니다.
이 표현식이 `0`으로 평가되는 행은 이후 변환이나 최종 결과에서 제외됩니다.

`WHERE` 절 뒤의 표현식은 종종 [비교 연산자](/sql-reference/operators#comparison-operators)와 [논리 연산자](/sql-reference/operators#operators-for-working-with-data-sets), 또는 다양한 [일반 함수](/sql-reference/functions/regular-functions) 중 하나와 함께 사용됩니다.

`WHERE` 절의 표현식은, 사용하는 테이블 엔진이 이를 지원하는 경우 인덱스 사용 및 파티션 프루닝(partition pruning)에 활용될 수 있는지 평가됩니다.

:::note PREWHERE
[`PREWHERE`](../../../sql-reference/statements/select/prewhere.md)라고 하는 필터링 최적화 기능도 있습니다.
Prewhere는 필터링을 더 효율적으로 적용하기 위한 최적화 기능입니다.
`PREWHERE` 절을 명시적으로 지정하지 않더라도 기본적으로 활성화되어 있습니다.
:::



## `NULL` 테스트 \{#testing-for-null\}

값이 [`NULL`](/sql-reference/syntax#null)인지 확인해야 하는 경우 다음을 사용합니다:
- [`IS NULL`](/sql-reference/operators#is_null) 또는 [`isNull`](../../../sql-reference/functions/functions-for-nulls.md#isNull)
- [`IS NOT NULL`](/sql-reference/operators#is_not_null) 또는 [`isNotNull`](../../../sql-reference/functions/functions-for-nulls.md#isNotNull)

그 밖의 `NULL`이 포함된 표현식은 조건을 통과하지 않습니다.



## 논리 연산자로 데이터 필터링 \{#filtering-data-with-logical-operators\}

다음 [논리 함수](/sql-reference/functions/logical-functions#and)를 `WHERE` 절과 함께 사용하여 여러 조건을 결합할 수 있습니다:

- [`and()`](/sql-reference/functions/logical-functions#and) 또는 `AND`
- [`not()`](/sql-reference/functions/logical-functions#not) 또는 `NOT`
- [`or()`](/sql-reference/functions/logical-functions#or) 또는 `NOT`
- [`xor()`](/sql-reference/functions/logical-functions#xor)



## 조건으로 UInt8 컬럼 사용하기 \{#using-uint8-columns-as-a-condition\}

ClickHouse에서는 `UInt8` 컬럼을 불리언 조건으로 직접 사용할 수 있으며, `0`은 `false`, 0이 아닌 값(일반적으로 `1`)은 `true`로 간주됩니다.
관련 예시는 [아래](#example-uint8-column-as-condition) 섹션에 나와 있습니다.



## 비교 연산자 사용 \{#using-comparison-operators\}

다음 [비교 연산자](/sql-reference/operators#comparison-operators)를 사용할 수 있습니다.

| Operator | Function | Description | Example |
|----------|----------|-------------|---------|
| `a = b` | `equals(a, b)` | 같음 | `price = 100` |
| `a == b` | `equals(a, b)` | 같음 (대체 구문) | `price == 100` |
| `a != b` | `notEquals(a, b)` | 같지 않음 | `category != 'Electronics'` |
| `a <> b` | `notEquals(a, b)` | 같지 않음 (대체 구문) | `category <> 'Electronics'` |
| `a < b` | `less(a, b)` | 보다 작음 | `price < 200` |
| `a <= b` | `lessOrEquals(a, b)` | 작거나 같음 | `price <= 200` |
| `a > b` | `greater(a, b)` | 보다 큼 | `price > 500` |
| `a >= b` | `greaterOrEquals(a, b)` | 크거나 같음 | `price >= 500` |
| `a LIKE s` | `like(a, b)` | 패턴 일치 (대소문자 구분) | `name LIKE '%top%'` |
| `a NOT LIKE s` | `notLike(a, b)` | 패턴 불일치 (대소문자 구분) | `name NOT LIKE '%top%'` |
| `a ILIKE s` | `ilike(a, b)` | 패턴 일치 (대소문자 구분 안 함) | `name ILIKE '%LAPTOP%'` |
| `a BETWEEN b AND c` | `a >= b AND a <= c` | 구간 검사 (경계값 포함) | `price BETWEEN 100 AND 500` |
| `a NOT BETWEEN b AND c` | `a < b OR a > c` | 구간 외 검사 | `price NOT BETWEEN 100 AND 500` |



## 패턴 일치와 조건식 \{#pattern-matching-and-conditional-expressions\}

비교 연산자 외에도 `WHERE` 절에서 패턴 일치와 조건식을 사용할 수 있습니다.

| 기능        | 구문                          | 대소문자 구분 | 성능        | 적합한 용도                      |
| ----------- | ------------------------------ | -------------- | ----------- | ------------------------------ |
| `LIKE`      | `col LIKE '%pattern%'`         | 예             | Fast        | 대소문자를 구분하는 패턴 일치   |
| `ILIKE`     | `col ILIKE '%pattern%'`        | 아니요         | Slower      | 대소문자를 구분하지 않는 검색   |
| `if()`      | `if(cond, a, b)`               | 해당 없음      | Fast        | 단순한 이분 조건                |
| `multiIf()` | `multiIf(c1, r1, c2, r2, def)` | 해당 없음      | Fast        | 다중 조건                       |
| `CASE`      | `CASE WHEN ... THEN ... END`   | 해당 없음      | Fast        | SQL 표준 조건식                 |

See ["Pattern matching and conditional expressions"](#examples-pattern-matching-and-conditional-expressions) for usage examples.



## 리터럴, 컬럼 또는 서브쿼리를 사용하는 표현식 \{#expressions-with-literals-columns-subqueries\}

`WHERE` 절 뒤에 오는 표현식에는 [리터럴](/sql-reference/syntax#literals), 컬럼 또는 서브쿼리를 포함할 수 있습니다. 서브쿼리는 조건식에서 사용되는 값을 반환하는 중첩된 `SELECT` 문입니다.

| Type         | Definition | Evaluation | Performance | Example                    |
| ------------ | ---------- | ---------- | ----------- | -------------------------- |
| **Literal**  | 고정 상수 값    | 쿼리 작성 시점   | 가장 빠름       | `WHERE price > 100`        |
| **Column**   | 테이블 데이터 참조 | 행마다        | 빠름          | `WHERE price > cost`       |
| **Subquery** | 중첩된 SELECT | 쿼리 실행 시점   | 상황에 따라 다름   | `WHERE id IN (SELECT ...)` |

리터럴, 컬럼 및 서브쿼리를 복합 조건에서 함께 사용할 수 있습니다.

```sql
-- Literal + Column
WHERE price > 100 AND category = 'Electronics'

-- Column + Subquery
WHERE price > (SELECT AVG(price) FROM products) AND in_stock = true

-- Literal + Column + Subquery
WHERE category = 'Electronics' 
  AND price < 500
  AND id IN (SELECT product_id FROM bestsellers)
```


-- 세 조건 모두에 논리 연산자 사용
WHERE (price &gt; 100 OR category IN (SELECT category FROM featured))
AND in&#95;stock = true
AND name LIKE &#39;%Special%&#39;

````
## Examples            

### Testing for `NULL`                             

Queries with `NULL` values:

```sql
CREATE TABLE t_null(x Int8, y Nullable(Int8)) ENGINE=MergeTree() ORDER BY x;
INSERT INTO t_null VALUES (1, NULL), (2, 3);

SELECT * FROM t_null WHERE y IS NULL;
SELECT * FROM t_null WHERE y != 0;
````

```response
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
┌─x─┬─y─┐
│ 2 │ 3 │
└───┴───┘
```

### 논리 연산자를 사용한 데이터 필터링

다음 테이블과 데이터가 주어졌다고 가정합니다.

```sql
CREATE TABLE products (
    id UInt32,
    name String,
    price Float32,
    category String,
    in_stock Bool
) ENGINE = MergeTree()
ORDER BY id;

INSERT INTO products VALUES
(1, 'Laptop', 999.99, 'Electronics', true),
(2, 'Mouse', 25.50, 'Electronics', true),
(3, 'Desk', 299.00, 'Furniture', false),
(4, 'Chair', 150.00, 'Furniture', true),
(5, 'Monitor', 350.00, 'Electronics', true),
(6, 'Lamp', 45.00, 'Furniture', false);
```

**1. `AND` - 두 조건이 모두 참이어야 합니다:**

```sql
SELECT * FROM products
WHERE category = 'Electronics' AND price < 500;
```

```response
   ┌─id─┬─name────┬─price─┬─category────┬─in_stock─┐
1. │  2 │ Mouse   │  25.5 │ Electronics │ true     │
2. │  5 │ Monitor │   350 │ Electronics │ true     │
   └────┴─────────┴───────┴─────────────┴──────────┘
```

**2. `OR` - 하나 이상의 조건이 참이면 됩니다:**

```sql
SELECT * FROM products
WHERE category = 'Furniture' OR price > 500;
```

```response
   ┌─id─┬─name───┬──price─┬─category────┬─in_stock─┐
1. │  1 │ Laptop │ 999.99 │ Electronics │ true     │
2. │  3 │ Desk   │    299 │ Furniture   │ false    │
3. │  4 │ Chair  │    150 │ Furniture   │ true     │
4. │  6 │ Lamp   │     45 │ Furniture   │ false    │
   └────┴────────┴────────┴─────────────┴──────────┘
```

**3. `NOT` - 조건을 부정합니다:**

```sql
SELECT * FROM products
WHERE NOT in_stock;
```

```response
   ┌─id─┬─name─┬─price─┬─category──┬─in_stock─┐
1. │  3 │ Desk │   299 │ Furniture │ false    │
2. │  6 │ Lamp │    45 │ Furniture │ false    │
   └────┴──────┴───────┴───────────┴──────────┘
```

**4. `XOR` - 정확히 하나의 조건만 참이어야 함(둘 다 참이어서는 안 됨):**

```sql
SELECT *
FROM products
WHERE xor(price > 200, category = 'Electronics')
```

```response
   ┌─id─┬─name──┬─price─┬─category────┬─in_stock─┐
1. │  2 │ Mouse │  25.5 │ Electronics │ true     │
2. │  3 │ Desk  │   299 │ Furniture   │ false    │
   └────┴───────┴───────┴─────────────┴──────────┘
```

**5. 여러 연산자 조합하기:**

```sql
SELECT * FROM products
WHERE (category = 'Electronics' OR category = 'Furniture')
  AND in_stock = true
  AND price < 400;
```


```response
   ┌─id─┬─name────┬─price─┬─category────┬─in_stock─┐
1. │  2 │ Mouse   │  25.5 │ Electronics │ true     │
2. │  4 │ Chair   │   150 │ Furniture   │ true     │
3. │  5 │ Monitor │   350 │ Electronics │ true     │
   └────┴─────────┴───────┴─────────────┴──────────┘
```

**6. 함수 문법 사용:**

```sql
SELECT * FROM products
WHERE and(or(category = 'Electronics', price > 100), in_stock);
```

```response
   ┌─id─┬─name────┬──price─┬─category────┬─in_stock─┐
1. │  1 │ Laptop  │ 999.99 │ Electronics │ true     │
2. │  2 │ Mouse   │   25.5 │ Electronics │ true     │
3. │  4 │ Chair   │    150 │ Furniture   │ true     │
4. │  5 │ Monitor │    350 │ Electronics │ true     │
   └────┴─────────┴────────┴─────────────┴──────────┘
```

`AND`, `OR`, `NOT`, `XOR`와 같은 SQL 키워드 구문이 일반적으로 더 읽기 쉽지만, 함수 구문은 복잡한 표현식이나 동적 쿼리를 작성할 때 유용할 수 있습니다.

### UInt8 컬럼을 조건으로 사용하기 \{#examples-testing-for-null\}

[이전 예제](#example-filtering-with-logical-operators)의 테이블을 사용하면 컬럼 이름을 조건으로 직접 사용할 수 있습니다.

```sql
SELECT * FROM products
WHERE in_stock
```

```response
   ┌─id─┬─name────┬──price─┬─category────┬─in_stock─┐
1. │  1 │ Laptop  │ 999.99 │ Electronics │ true     │
2. │  2 │ Mouse   │   25.5 │ Electronics │ true     │
3. │  4 │ Chair   │    150 │ Furniture   │ true     │
4. │  5 │ Monitor │    350 │ Electronics │ true     │
   └────┴─────────┴────────┴─────────────┴──────────┘
```

### 비교 연산자 사용하기 \{#example-filtering-with-logical-operators\}

아래 예제에서는 위의 [예제](#example-filtering-with-logical-operators)에 나오는 테이블과 데이터를 사용합니다. 결과는 간결성을 위해 생략합니다.

**1. true와의 명시적 동등 비교 (`= 1` 또는 `= true`):**

```sql
SELECT * FROM products
WHERE in_stock = true;
-- or
WHERE in_stock = 1;
```

**2. false와의 명시적 동등 비교 (`= 0` 또는 `= false`):**

```sql
SELECT * FROM products
WHERE in_stock = false;
-- or
WHERE in_stock = 0;
```

**3. 같지 않음 (`!= 0` 또는 `!= false`):**

```sql
SELECT * FROM products
WHERE in_stock != false;
-- or
WHERE in_stock != 0;
```

**4. 초과(&gt;):**

```sql
SELECT * FROM products
WHERE in_stock > 0;
```

**5. 이하:**

```sql
SELECT * FROM products
WHERE in_stock <= 0;
```

**6. 다른 조건과 함께 사용하기:**

```sql
SELECT * FROM products
WHERE in_stock AND price < 400;
```

**7. `IN` 연산자 사용:**

아래 예제에서 `(1, true)`는 [튜플](/sql-reference/data-types/tuple)입니다.

```sql
SELECT * FROM products
WHERE in_stock IN (1, true);
```

이 작업에는 [array](/sql-reference/data-types/array)를 사용할 수도 있습니다:

```sql
SELECT * FROM products
WHERE in_stock IN [1, true];
```

**8. 비교 스타일 혼용:**

```sql
SELECT * FROM products
WHERE category = 'Electronics' AND in_stock = true;
```

### 패턴 일치와 조건식 \{#example-uint8-column-as-condition\}

아래 예제에서는 위 [예시](#example-filtering-with-logical-operators)의 테이블과 데이터를 사용합니다. 예제 결과는 간단히 하기 위해 생략합니다.

#### LIKE 예시


```sql
-- Find products with 'o' in the name
SELECT * FROM products WHERE name LIKE '%o%';
-- Result: Laptop, Monitor

-- Find products starting with 'L'
SELECT * FROM products WHERE name LIKE 'L%';
-- Result: Laptop, Lamp

-- Find products with exactly 4 characters
SELECT * FROM products WHERE name LIKE '____';
-- Result: Desk, Lamp
```

#### ILIKE 사용 예시

```sql
-- Case-insensitive search for 'LAPTOP'
SELECT * FROM products WHERE name ILIKE '%laptop%';
-- Result: Laptop

-- Case-insensitive prefix match
SELECT * FROM products WHERE name ILIKE 'l%';
-- Result: Laptop, Lamp
```

#### IF 예제 \{#like-examples\}

```sql
-- Different price thresholds by category
SELECT * FROM products
WHERE if(category = 'Electronics', price < 500, price < 200);
-- Result: Mouse, Chair, Monitor
-- (Electronics under $500 OR Furniture under $200)

-- Filter based on stock status
SELECT * FROM products
WHERE if(in_stock, price > 100, true);
-- Result: Laptop, Chair, Monitor, Desk, Lamp
-- (In stock items over $100 OR all out-of-stock items)
```

#### multiIf 예시 \{#ilike-examples\}

```sql
-- Multiple category-based conditions
SELECT * FROM products
WHERE multiIf(
    category = 'Electronics', price < 600,
    category = 'Furniture', in_stock = true,
    false
);
-- Result: Mouse, Monitor, Chair
-- (Electronics < $600 OR in-stock Furniture)

-- Tiered filtering
SELECT * FROM products
WHERE multiIf(
    price > 500, category = 'Electronics',
    price > 100, in_stock = true,
    true
);
-- Result: Laptop, Chair, Monitor, Lamp
```

#### CASE 예제 \{#if-examples\}

**간단한 CASE:**

```sql
-- Different rules per category
SELECT * FROM products
WHERE CASE category
    WHEN 'Electronics' THEN price < 400
    WHEN 'Furniture' THEN in_stock = true
    ELSE false
END;
-- Result: Mouse, Monitor, Chair
```

**검색 CASE 식:**

```sql
-- Price-based tiered logic
SELECT * FROM products
WHERE CASE
    WHEN price > 500 THEN in_stock = true
    WHEN price > 100 THEN category = 'Electronics'
    ELSE true
END;
-- Result: Laptop, Monitor, Mouse, Lamp
```
