---
'description': 'ClickHouse의 `WHERE` 절에 대한 문서'
'sidebar_label': 'WHERE'
'slug': '/sql-reference/statements/select/where'
'title': 'WHERE 절'
'doc_type': 'reference'
'keywords':
- 'WHERE'
---


# WHERE 절

`WHERE` 절은 `SELECT`의 [`FROM`](../../../sql-reference/statements/select/from.md) 절에서 오는 데이터를 필터링할 수 있게 해줍니다.

`WHERE` 절이 있는 경우, 그 다음에는 `UInt8` 타입의 표현식이 와야 합니다. 이 표현식이 `0`으로 평가되는 행은 추가 변환이나 결과에서 제외됩니다.

`WHERE` 절 다음에 오는 표현식은 종종 [비교 연산자](/sql-reference/operators#comparison-operators)와 [논리 연산자](/sql-reference/operators#operators-for-working-with-data-sets) 또는 많은 [정규 함수](/sql-reference/functions/regular-functions) 중 하나와 함께 사용됩니다.

`WHERE` 표현식은 기본 테이블 엔진이 이를 지원하는 경우, 인덱스 사용 가능성과 파티션 프루닝에 따라 평가됩니다.

:::note PREWHERE
`PREWHERE`라는 필터링 최적화도 있습니다. [`PREWHERE`](../../../sql-reference/statements/select/prewhere.md)는 필터링을 보다 효율적으로 적용하기 위한 최적화입니다. `PREWHERE` 절이 명시적으로 지정되지 않더라도 기본적으로 활성화됩니다.
:::

## `NULL` 검사 {#testing-for-null}

값이 [`NULL`](/sql-reference/syntax#null)인지 검사해야 하는 경우, 다음을 사용하세요:
- [`IS NULL`](/sql-reference/operators#is_null) 또는 [`isNull`](../../../sql-reference/functions/functions-for-nulls.md#isNull)
- [`IS NOT NULL`](/sql-reference/operators#is_not_null) 또는 [`isNotNull`](../../../sql-reference/functions/functions-for-nulls.md#isNotNull)

`NULL`이 있는 표현식은 그렇지 않으면 결코 통과되지 않습니다.

## 논리 연산자로 데이터 필터링 {#filtering-data-with-logical-operators}

다음 [논리 함수](/sql-reference/functions/logical-functions#and)를 `WHERE` 절과 함께 사용하여 여러 조건을 결합할 수 있습니다:

- [`and()`](/sql-reference/functions/logical-functions#and) 또는 `AND`
- [`not()`](/sql-reference/functions/logical-functions#not) 또는 `NOT`
- [`or()`](/sql-reference/functions/logical-functions#or) 또는 `OR`
- [`xor()`](/sql-reference/functions/logical-functions#xor)

## UInt8 컬럼을 조건으로 사용 {#using-uint8-columns-as-a-condition}

ClickHouse에서 `UInt8` 컬럼은 부울 조건으로 직접 사용할 수 있으며, 여기서 `0`은 `false`, 비제로 값(일반적으로 `1`)은 `true`입니다. 이와 관련된 예시는 [아래](#example-uint8-column-as-condition) 섹션에 있습니다.

## 비교 연산자 사용 {#using-comparison-operators}

다음 [비교 연산자](/sql-reference/operators#comparison-operators)를 사용할 수 있습니다:

| 연산자 | 기능 | 설명 | 예시 |
|--------|------|------|------|
| `a = b` | `equals(a, b)` | 같음 | `price = 100` |
| `a == b` | `equals(a, b)` | 같음 (대안 구문) | `price == 100` |
| `a != b` | `notEquals(a, b)` | 다름 | `category != 'Electronics'` |
| `a <> b` | `notEquals(a, b)` | 다름 (대안 구문) | `category <> 'Electronics'` |
| `a < b` | `less(a, b)` | 미만 | `price < 200` |
| `a <= b` | `lessOrEquals(a, b)` | 이하 | `price <= 200` |
| `a > b` | `greater(a, b)` | 초과 | `price > 500` |
| `a >= b` | `greaterOrEquals(a, b)` | 이상 | `price >= 500` |
| `a LIKE s` | `like(a, b)` | 패턴 매칭 (대소문자 구분) | `name LIKE '%top%'` |
| `a NOT LIKE s` | `notLike(a, b)` | 패턴 미매칭 (대소문자 구분) | `name NOT LIKE '%top%'` |
| `a ILIKE s` | `ilike(a, b)` | 패턴 매칭 (대소문자 비구분) | `name ILIKE '%LAPTOP%'` |
| `a BETWEEN b AND c` | `a >= b AND a <= c` | 범위 체크 (포함) | `price BETWEEN 100 AND 500` |
| `a NOT BETWEEN b AND c` | `a < b OR a > c` | 범위 외 체크 | `price NOT BETWEEN 100 AND 500` |

## 패턴 매칭 및 조건 표현식 {#pattern-matching-and-conditional-expressions}

비교 연산자 외에도 `WHERE` 절에서 패턴 매칭 및 조건 표현식을 사용할 수 있습니다.

| 기능           | 구문                          | 대소문자 구분 | 성능   | 최적 사용                     |
|----------------|-------------------------------|----------------|--------|-------------------------------|
| `LIKE`         | `col LIKE '%pattern%'`        | 예             | 빠름   | 정확한 대소문자 패턴 매칭     |
| `ILIKE`        | `col ILIKE '%pattern%'`       | 아니오         | 느림   | 대소문자 비구분 검색          |
| `if()`         | `if(cond, a, b)`              | 해당 없음      | 빠름   | 간단한 이진 조건              |
| `multiIf()`    | `multiIf(c1, r1, c2, r2, def)`| 해당 없음      | 빠름   | 여러 조건                    |
| `CASE`         | `CASE WHEN ... THEN ... END`   | 해당 없음      | 빠름   | SQL 표준 조건 논리            |

사용 예시는 ["패턴 매칭 및 조건 표현식"](#examples-pattern-matching-and-conditional-expressions)에서 확인하십시오.

## 리터럴, 컬럼 또는 서브쿼리가 포함된 표현식 {#expressions-with-literals-columns-subqueries}

`WHERE` 절 다음의 표현식은 [리터럴](/sql-reference/syntax#literals), 컬럼 또는 조건에서 사용하는 값을 반환하는 중첩된 `SELECT` 문인 서브쿼리를 포함할 수 있습니다.

| 유형         | 정의                       | 평가           | 성능   | 예시                         |
|--------------|----------------------------|----------------|--------|------------------------------|
| **리터럴**    | 고정 상수 값              | 쿼리 작성 시점 | 가장 빠름 | `WHERE price > 100`         |
| **컬럼**      | 테이블 데이터 참조        | 각 행에 대해    | 빠름   | `WHERE price > cost`        |
| **서브쿼리**  | 중첩된 SELECT              | 쿼리 실행 시점 | 다양함 | `WHERE id IN (SELECT ...)`  |

리터럴, 컬럼, 서브쿼리를 복잡한 조건에서 혼합할 수 있습니다:

```sql
-- Literal + Column
WHERE price > 100 AND category = 'Electronics'

-- Column + Subquery
WHERE price > (SELECT AVG(price) FROM products) AND in_stock = true

-- Literal + Column + Subquery
WHERE category = 'Electronics' 
  AND price < 500
  AND id IN (SELECT product_id FROM bestsellers)

-- All three with logical operators
WHERE (price > 100 OR category IN (SELECT category FROM featured))
  AND in_stock = true
  AND name LIKE '%Special%'
```
## 예시 {#examples}

### `NULL` 체크 {#examples-testing-for-null}

`NULL` 값을 가진 쿼리:

```sql
CREATE TABLE t_null(x Int8, y Nullable(Int8)) ENGINE=MergeTree() ORDER BY x;
INSERT INTO t_null VALUES (1, NULL), (2, 3);

SELECT * FROM t_null WHERE y IS NULL;
SELECT * FROM t_null WHERE y != 0;
```

```response
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
┌─x─┬─y─┐
│ 2 │ 3 │
└───┴───┘
```

### 논리 연산자로 데이터 필터링 {#example-filtering-with-logical-operators}

다음 테이블과 데이터를 기준으로:

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

**1. `AND` - 두 조건 모두 참이어야 합니다:**

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

**2. `OR` - 적어도 하나의 조건은 참이어야 합니다:**

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

**4. `XOR` - 정확히 하나의 조건이 참이어야 합니다 (두 개 모두 아님):**

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

**5. 여러 연산자 조합:**

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

**6. 함수 구문 사용:**

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

SQL 키워드 구문 (`AND`, `OR`, `NOT`, `XOR`)은 일반적으로 더 가독성이 좋지만, 함수 구문은 복잡한 표현식이나 동적 쿼리를 구축할 때 유용할 수 있습니다.

### UInt8 컬럼을 조건으로 사용 {#example-uint8-column-as-condition}

[이전 예시](#example-filtering-with-logical-operators)에서 가져온 테이블을 사용하면, 컬럼 이름을 직접 조건으로 사용할 수 있습니다:

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

### 비교 연산자 사용 {#example-using-comparison-operators}

다음 예시는 위의 [예시](#example-filtering-with-logical-operators)에서 가져온 테이블과 데이터입니다. 결과는 간결함을 위해 생략되었습니다.

**1. 참과의 명시적 동등성 (`= 1` 또는 `= true`):**

```sql
SELECT * FROM products
WHERE in_stock = true;
-- or
WHERE in_stock = 1;
```

**2. 거짓과의 명시적 동등성 (`= 0` 또는 `= false`):**

```sql
SELECT * FROM products
WHERE in_stock = false;
-- or
WHERE in_stock = 0;
```

**3. 불일치 (`!= 0` 또는 `!= false`):**

```sql
SELECT * FROM products
WHERE in_stock != false;
-- or
WHERE in_stock != 0;
```

**4. 초과:**

```sql
SELECT * FROM products
WHERE in_stock > 0;
```

**5. 이하:**

```sql
SELECT * FROM products
WHERE in_stock <= 0;
```

**6. 다른 조건과 조합:**

```sql
SELECT * FROM products
WHERE in_stock AND price < 400;
```

**7. `IN` 연산자 사용:**

아래 예시에서 `(1, true)`는 [튜플](/sql-reference/data-types/tuple)입니다.

```sql
SELECT * FROM products
WHERE in_stock IN (1, true);
```

또한 [배열](/sql-reference/data-types/array)을 사용하여 이를 수행할 수 있습니다:

```sql
SELECT * FROM products
WHERE in_stock IN [1, true];
```

**8. 비교 스타일 혼합:**

```sql
SELECT * FROM products
WHERE category = 'Electronics' AND in_stock = true;
```

### 패턴 매칭 및 조건 표현식 {#examples-pattern-matching-and-conditional-expressions}

다음 예시는 위의 [예시](#example-filtering-with-logical-operators)에서 가져온 테이블과 데이터입니다. 결과는 간결함을 위해 생략되었습니다.

#### LIKE 예시 {#like-examples}

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

#### ILIKE 예시 {#ilike-examples}

```sql
-- Case-insensitive search for 'LAPTOP'
SELECT * FROM products WHERE name ILIKE '%laptop%';
-- Result: Laptop

-- Case-insensitive prefix match
SELECT * FROM products WHERE name ILIKE 'l%';
-- Result: Laptop, Lamp
```

#### IF 예시 {#if-examples}

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

#### multiIf 예시 {#multiif-examples}

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

#### CASE 예시 {#case-examples}

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

**검색 CASE:**

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
