---
slug: /cloud/guides/data-masking
sidebar_label: '데이터 마스킹'
title: 'ClickHouse에서의 데이터 마스킹'
description: 'ClickHouse에서의 데이터 마스킹에 대한 가이드'
keywords: ['데이터 마스킹']
doc_type: '가이드'
---

# ClickHouse에서 데이터 마스킹 \{#data-masking-in-clickhouse\}

데이터 마스킹은 데이터 보호를 위한 기법으로, 원본 데이터를 개인 식별 정보(PII)나 민감 정보를 제거하면서 형식과 구조는 유지하는 데이터 버전으로 대체하는 방법입니다.

이 가이드는 ClickHouse에서 다음과 같은 여러 가지 방법으로 데이터를 마스킹하는 방법을 설명합니다:

- **마스킹 정책** (ClickHouse Cloud, 25.12+): 특정 사용자/역할에 대해 쿼리 시점에 적용되는 네이티브 동적 마스킹
- **문자열 치환 함수**: 내장 함수를 사용한 기본적인 마스킹
- **마스킹 뷰**: 변환 로직이 포함된 뷰 생성
- **materialized 컬럼**(materialized columns): 원본 데이터와 함께 마스킹된 버전을 저장
- **쿼리 마스킹 규칙**: 로그에서 민감 데이터를 마스킹 (ClickHouse OSS)

## 마스킹 정책 사용하기 (ClickHouse Cloud) \{#masking-policies\}

:::note
마스킹 정책은 ClickHouse Cloud 25.12 버전부터 사용할 수 있습니다.
:::

[`CREATE MASKING POLICY`](/sql-reference/statements/create/masking-policy) SQL 문은 특정 사용자 또는 역할에 대해 쿼리 시점에 컬럼 값을 동적으로 마스킹하는 네이티브 방식을 제공합니다. 다른 방식과 달리, 마스킹 정책은 별도의 뷰를 생성하거나 마스킹된 데이터를 저장할 필요가 없으며, 사용자가 테이블을 조회할 때 변환이 투명하게 처리됩니다.

### 기본 마스킹 정책 \{#basic-maasking-policy\}

마스킹 정책을 보여 주기 위해 고객 정보를 포함하는 `orders` 테이블을 생성합니다:

```sql
CREATE TABLE orders (
    user_id UInt32,
    name String,
    email String,
    phone String,
    total_amount Decimal(10,2),
    order_date Date,
    shipping_address String
)
ENGINE = MergeTree()
ORDER BY user_id;

INSERT INTO orders VALUES
    (1001, 'John Smith', 'john.smith@gmail.com', '555-123-4567', 299.99, '2024-01-15', '123 Main St, New York, NY 10001'),
    (1002, 'Sarah Johnson', 'sarah.johnson@outlook.com', '555-987-6543', 149.50, '2024-01-16', '456 Oak Ave, Los Angeles, CA 90210'),
    (1003, 'Michael Brown', 'mbrown@company.com', '555-456-7890', 599.00, '2024-01-17', '789 Pine Rd, Chicago, IL 60601'),
    (1004, 'Emily Rogers', 'emily.rogers@yahoo.com', '555-321-0987', 89.99, '2024-01-18', '321 Elm St, Houston, TX 77001'),
    (1005, 'David Wilson', 'dwilson@email.net', '555-654-3210', 449.75, '2024-01-19', '654 Cedar Blvd, Phoenix, AZ 85001');
```

이제 마스킹된 데이터를 조회해야 하는 사용자를 위한 역할을 생성하십시오:

```sql
CREATE ROLE masked_data_viewer;
```

`masked_data_viewer` 역할에 적용할 마스킹 정책을 생성하십시오:

```sql
CREATE MASKING POLICY mask_pii_data ON orders
    UPDATE
        name = replaceRegexpOne(name, '^([A-Za-z]+)\\s+(.*)$', '\\1 ****'),
        email = replaceRegexpOne(email, '^(.{2})[^@]*(@.*)$', '\\1****\\2'),
        phone = replaceRegexpOne(phone, '^(\\d{3})-(\\d{3})-(\\d{4})$', '\\1-***-\\3'),
        shipping_address = replaceRegexpOne(shipping_address, '^[^,]+,\\s*(.*)$', '*** \\1')
    TO masked_data_viewer;
```

`masked_data_viewer` 역할을 가진 사용자가 `orders` 테이블을 조회하면, 데이터가 자동으로 마스킹된 상태로 표시됩니다:

```sql title="Query"
SELECT * FROM orders ORDER BY user_id;
```

```response title="Response (for masked_data_viewer role)"
┌─user_id─┬─name─────────┬─email──────────────┬─phone────────┬─total_amount─┬─order_date─┬─shipping_address──────────┐
│    1001 │ John ****    │ jo****@gmail.com   │ 555-***-4567 │       299.99 │ 2024-01-15 │ *** New York, NY 10001    │
│    1002 │ Sarah ****   │ sa****@outlook.com │ 555-***-6543 │        149.5 │ 2024-01-16 │ *** Los Angeles, CA 90210 │
│    1003 │ Michael **** │ mb****@company.com │ 555-***-7890 │          599 │ 2024-01-17 │ *** Chicago, IL 60601     │
│    1004 │ Emily ****   │ em****@yahoo.com   │ 555-***-0987 │        89.99 │ 2024-01-18 │ *** Houston, TX 77001     │
│    1005 │ David ****   │ dw****@email.net   │ 555-***-3210 │       449.75 │ 2024-01-19 │ *** Phoenix, AZ 85001     │
└─────────┴──────────────┴────────────────────┴──────────────┴──────────────┴────────────┴───────────────────────────┘
```

`masked_data_viewer` 역할이 부여되지 않은 사용자는 마스킹되지 않은 원본 데이터를 볼 수 있습니다.


### 조건부 마스킹 \{#conditional-masking\}

`WHERE` 절을 사용하여 특정 행에만 마스킹을 적용할 수 있습니다. 예를 들어, 고액 주문에만 마스킹을 적용하려면 다음과 같이 할 수 있습니다:

```sql
CREATE MASKING POLICY mask_high_value_orders ON orders
    UPDATE
        name = replaceRegexpOne(name, '^([A-Za-z]+)\\s+(.*)$', '\\1 ****'),
        email = replaceRegexpOne(email, '^(.{2})[^@]*(@.*)$', '\\1****\\2')
    WHERE total_amount > 200
    TO masked_data_viewer;
```


### 우선순위를 가진 다중 정책 \{#multiple-policies-with-priority\}

여러 마스킹 정책이 동일한 컬럼에 적용되는 경우, 어떤 변환이 최종적으로 적용될지 제어하려면 `PRIORITY` 절을 사용합니다. 우선순위 값이 높을수록 마지막에 적용됩니다:

```sql
-- Lower priority: Basic masking for all sensitive data
CREATE MASKING POLICY basic_masking ON orders
    UPDATE
        name = '****',
        email = '****@****.com'
    TO masked_data_viewer
    PRIORITY 0;

-- Higher priority: More refined masking (overrides basic_masking)
CREATE MASKING POLICY refined_masking ON orders
    UPDATE
        name = replaceRegexpOne(name, '^([A-Za-z]+)\\s+(.*)$', '\\1 ****')
    WHERE total_amount > 100
    TO masked_data_viewer
    PRIORITY 10;
```

이 예제에서는 `total_amount > 100`인 주문의 경우 `name` 컬럼에는 `refined_masking` 정책(우선순위 10)이 `basic_masking` 정책(우선순위 0)보다 우선 적용되며, `email`은 계속해서 기본 마스킹을 사용합니다.


### 해시 기반 마스킹 \{#hash-based-masking\}

일관된 마스킹(동일한 입력이 항상 동일한 마스킹 결과를 생성해야 하는 경우)이 필요한 상황에서는 해시 함수를 사용합니다.

```sql
CREATE MASKING POLICY hash_sensitive_data ON orders
    UPDATE
        email = concat(toString(cityHash64(email)), '@masked.com'),
        phone = concat('555-', toString(cityHash64(phone) % 10000000))
    TO masked_data_viewer;
```


### 마스킹 정책 관리 \{#managing-masking-policies\}

모든 마스킹 정책을 조회합니다:

```sql
SHOW MASKING POLICIES;
```

마스킹 정책 삭제:

```sql
DROP MASKING POLICY mask_pii_data ON orders;
```

기존 정책을 교체하려면:

```sql
CREATE OR REPLACE MASKING POLICY mask_pii_data ON orders
    UPDATE name = '[REDACTED]'
    TO masked_data_viewer;
```

자세한 내용은 [CREATE MASKING POLICY](/sql-reference/statements/create/masking-policy) 문서를 참조하십시오.


## 문자열 치환 함수 사용 \{#using-string-functions\}

기본적인 데이터 마스킹 사용 사례에서는 `replace` 계열 FUNCTION을 사용하면 데이터를 손쉽게 마스킹할 수 있습니다:

| Function                                                                                 | Description(설명)                                                             |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [`replaceOne`](/sql-reference/functions/string-replace-functions#replaceOne)             | 대상 문자열(haystack)에서 패턴이 처음 나타나는 부분을 제공된 치환 문자열로 바꿉니다.                        |
| [`replaceAll`](/sql-reference/functions/string-replace-functions#replaceAll)             | 대상 문자열(haystack)에서 패턴이 나타나는 모든 부분을 제공된 치환 문자열로 바꿉니다.                        |
| [`replaceRegexpOne`](/sql-reference/functions/string-replace-functions#replaceRegexpOne) | 대상 문자열(haystack)에서 정규식 패턴(re2 문법)에 매칭되는 부분 문자열 중 첫 번째 항목을 제공된 치환 문자열로 바꿉니다. |
| [`replaceRegexpAll`](/sql-reference/functions/string-replace-functions#replaceRegexpAll) | 대상 문자열(haystack)에서 정규식 패턴(re2 문법)에 매칭되는 모든 부분 문자열을 제공된 치환 문자열로 바꿉니다.        |

예를 들어, `replaceOne` FUNCTION을 사용하여 이름 「John Smith」를 `[CUSTOMER_NAME]` 플레이스홀더로 치환할 수 있습니다:

```sql title="Query"
SELECT replaceOne(
    'Customer John Smith called about his account',
    'John Smith',
    '[CUSTOMER_NAME]'
) AS anonymized_text;
```

```response title="Response"
┌─anonymized_text───────────────────────────────────┐
│ Customer [CUSTOMER_NAME] called about his account │
└───────────────────────────────────────────────────┘
```

좀 더 범용적으로는 `replaceRegexpOne` 함수를 사용해 임의의 고객 이름을 치환할 수 있습니다:

```sql title="Query"
SELECT 
    replaceRegexpAll(
        'Customer John Smith called. Later, Mary Johnson and Bob Wilson also called.',
        '\\b[A-Z][a-z]+ [A-Z][a-z]+\\b',
        '[CUSTOMER_NAME]'
    ) AS anonymized_text;
```

```response title="Response"
┌─anonymized_text───────────────────────────────────────────────────────────────────────┐
│ [CUSTOMER_NAME] Smith called. Later, [CUSTOMER_NAME] and [CUSTOMER_NAME] also called. │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

또는 `replaceRegexpAll` FUNCTION을 사용하여 사회보장번호의 앞자리를 마스킹하고 마지막 4자리만 남길 수도 있습니다.

```sql title="Query"
SELECT replaceRegexpAll(
    'SSN: 123-45-6789',
    '(\d{3})-(\d{2})-(\d{4})',
    'XXX-XX-\3'
) AS masked_ssn;
```

위 쿼리에서 `\3`은 결과 문자열에 세 번째 캡처 그룹을 치환하는 데 사용되며, 그 결과는 다음과 같습니다.

```response title="Response"
┌─masked_ssn───────┐
│ SSN: XXX-XX-6789 │
└──────────────────┘
```


## 마스킹된 `VIEW` 생성 \{#masked-views\}

[`VIEW`](/sql-reference/statements/create/view)는 앞에서 언급한 문자열 함수와 함께 사용하여, 민감한 데이터를 포함한 컬럼에 변환을 적용한 뒤 사용자에게 표시되도록 할 수 있습니다.
이 방식으로 원본 데이터는 변경되지 않고, 해당 VIEW에 대해 쿼리하는 사용자는 마스킹된 데이터만 보게 됩니다.

예를 들어, 고객 주문 기록을 저장하는 테이블이 있다고 가정하겠습니다.
일부 직원 그룹이 해당 정보를 볼 수 있게 하되, 고객의 전체 정보는 보지 못하도록 하려고 합니다.

아래 쿼리를 실행하여 예제 테이블 `orders`를 생성하고, 여기에 가상의 고객 주문 기록을 몇 개 삽입하십시오:

```sql
CREATE TABLE orders (
    user_id UInt32,
    name String,
    email String,
    phone String,
    total_amount Decimal(10,2),
    order_date Date,
    shipping_address String
)
ENGINE = MergeTree()
ORDER BY user_id;

INSERT INTO orders VALUES
    (1001, 'John Smith', 'john.smith@gmail.com', '555-123-4567', 299.99, '2024-01-15', '123 Main St, New York, NY 10001'),
    (1002, 'Sarah Johnson', 'sarah.johnson@outlook.com', '555-987-6543', 149.50, '2024-01-16', '456 Oak Ave, Los Angeles, CA 90210'),
    (1003, 'Michael Brown', 'mbrown@company.com', '555-456-7890', 599.00, '2024-01-17', '789 Pine Rd, Chicago, IL 60601'),
    (1004, 'Emily Rogers', 'emily.rogers@yahoo.com', '555-321-0987', 89.99, '2024-01-18', '321 Elm St, Houston, TX 77001'),
    (1005, 'David Wilson', 'dwilson@email.net', '555-654-3210', 449.75, '2024-01-19', '654 Cedar Blvd, Phoenix, AZ 85001');
```

`masked_orders`라는 이름의 VIEW를 생성하십시오:

```sql
CREATE VIEW masked_orders AS
SELECT
    user_id,
    replaceRegexpOne(name, '^([A-Za-z]+)\\s+(.*)$', '\\1 ****') AS name,
    replaceRegexpOne(email, '^(.{0})[^@]*(@.*)$', '\\1****\\2') AS email,
    replaceRegexpOne(phone, '^(\\d{3})-(\\d{3})-(\\d{4})$', '\\1-***-\\3') AS phone,
    total_amount,
    order_date,
    replaceRegexpOne(shipping_address, '^[^,]+,\\s*(.*)$', '*** \\1') AS shipping_address
FROM orders;
```

위의 뷰 생성 쿼리의 `SELECT` 절에서는 `name`, `email`, `phone`, `shipping_address` 필드에 대해 `replaceRegexpOne`을 사용한 변환을 정의합니다. 이 필드들은 부분적으로 마스킹하려는 민감한 정보를 포함하고 있습니다.

뷰에서 데이터를 조회합니다:

```sql title="Query"
SELECT * FROM masked_orders
```

```response title="Response"
┌─user_id─┬─name─────────┬─email──────────────┬─phone────────┬─total_amount─┬─order_date─┬─shipping_address──────────┐
│    1001 │ John ****    │ jo****@gmail.com   │ 555-***-4567 │       299.99 │ 2024-01-15 │ *** New York, NY 10001    │
│    1002 │ Sarah ****   │ sa****@outlook.com │ 555-***-6543 │        149.5 │ 2024-01-16 │ *** Los Angeles, CA 90210 │
│    1003 │ Michael **** │ mb****@company.com │ 555-***-7890 │          599 │ 2024-01-17 │ *** Chicago, IL 60601     │
│    1004 │ Emily ****   │ em****@yahoo.com   │ 555-***-0987 │        89.99 │ 2024-01-18 │ *** Houston, TX 77001     │
│    1005 │ David ****   │ dw****@email.net   │ 555-***-3210 │       449.75 │ 2024-01-19 │ *** Phoenix, AZ 85001     │
└─────────┴──────────────┴────────────────────┴──────────────┴──────────────┴────────────┴───────────────────────────┘
```


뷰에서 반환되는 데이터는 부분적으로 마스킹되어 민감한 정보가 가려집니다.
또한 정보에 대한 권한 수준에 따라 서로 다른 수준의 난독화를 적용한 여러 개의 뷰를 생성할 수도 있습니다.

사용자가 마스킹된 데이터를 반환하는 뷰에만 접근하고 원본 비마스킹 데이터가 있는 테이블에는 접근하지 못하도록 하려면, [Role Based Access Control](/cloud/security/console-roles)을 사용하여 특정 역할에만 해당 뷰에서 데이터를 선택할 수 있는 권한을 부여해야 합니다.

먼저 역할을 생성하십시오:

```sql
CREATE ROLE masked_orders_viewer;
```

다음으로 해당 역할에 VIEW에 대한 `SELECT` 권한을 부여하십시오.

```sql
GRANT SELECT ON masked_orders TO masked_orders_viewer;
```

ClickHouse 역할은 누적(additive) 방식으로 적용되므로, 마스킹된 뷰만 조회해야 하는 사용자에게는 어떤 역할을 통해서도 기본 테이블에 대한 `SELECT` 권한이 부여되지 않도록 해야 합니다.

따라서 안전을 위해 기본 테이블에 대한 접근 권한을 명시적으로 REVOKE하여 회수해야 합니다:

```sql
REVOKE SELECT ON orders FROM masked_orders_viewer;
```

마지막으로 해당 역할을 적절한 사용자에게 할당하십시오:

```sql
GRANT masked_orders_viewer TO your_user;
```

이는 `masked_orders_viewer` 역할을 가진 사용자가 뷰에서 마스킹된 데이터만 조회하고, 테이블의 마스킹되지 않은 원본 데이터는 조회할 수 없도록 보장합니다.


## `MATERIALIZED` 컬럼과 컬럼 수준 접근 제한 사용 \{#materialized-ephemeral-column-restrictions\}

별도의 뷰를 만들고 싶지 않은 경우, 원본 데이터와 함께 마스킹된 버전의 데이터를 저장할 수 있습니다.
이를 위해 [materialized 컬럼](/sql-reference/statements/create/table#materialized)을 사용할 수 있습니다.
이러한 컬럼의 값은 행이 삽입될 때 지정된 materialized 표현식에 따라 자동으로 계산되며,
이를 사용해 데이터의 마스킹된 버전을 가지는 새로운 컬럼을 만들 수 있습니다.

앞서 살펴본 예시에서, 마스킹된 데이터를 위한 별도의 `VIEW`를 생성하는 대신 이제 `MATERIALIZED`를 사용해 마스킹된 컬럼을 생성합니다:

```sql
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
    user_id UInt32,
    name String,
    name_masked String MATERIALIZED replaceRegexpOne(name, '^([A-Za-z]+)\\s+(.*)$', '\\1 ****'),
    email String,
    email_masked String MATERIALIZED replaceRegexpOne(email, '^(.{0})[^@]*(@.*)$', '\\1****\\2'),
    phone String,
    phone_masked String MATERIALIZED replaceRegexpOne(phone, '^(\\d{3})-(\\d{3})-(\\d{4})$', '\\1-***-\\3'),
    total_amount Decimal(10,2),
    order_date Date,
    shipping_address String,
    shipping_address_masked String MATERIALIZED replaceRegexpOne(shipping_address, '^[^,]+,\\s*(.*)$', '*** \\1')
)
ENGINE = MergeTree()
ORDER BY user_id;

INSERT INTO orders VALUES
    (1001, 'John Smith', 'john.smith@gmail.com', '555-123-4567', 299.99, '2024-01-15', '123 Main St, New York, NY 10001'),
    (1002, 'Sarah Johnson', 'sarah.johnson@outlook.com', '555-987-6543', 149.50, '2024-01-16', '456 Oak Ave, Los Angeles, CA 90210'),
    (1003, 'Michael Brown', 'mbrown@company.com', '555-456-7890', 599.00, '2024-01-17', '789 Pine Rd, Chicago, IL 60601'),
    (1004, 'Emily Rogers', 'emily.rogers@yahoo.com', '555-321-0987', 89.99, '2024-01-18', '321 Elm St, Houston, TX 77001'),
    (1005, 'David Wilson', 'dwilson@email.net', '555-654-3210', 449.75, '2024-01-19', '654 Cedar Blvd, Phoenix, AZ 85001');
```

이제 다음 `SELECT` 쿼리를 실행하면, 마스킹된 데이터가 INSERT 시점에 &#39;materialized&#39;되어 원본 비마스킹 데이터와 함께 저장된 것을 확인할 수 있습니다.
ClickHouse는 기본적으로 `SELECT *` 쿼리에 materialized 컬럼을 자동으로 포함하지 않으므로, 마스킹된 컬럼을 명시적으로 선택해야 합니다.

```sql title="Query"
SELECT
    *,
    name_masked,
    email_masked,
    phone_masked,
    shipping_address_masked
FROM orders
ORDER BY user_id ASC
```


```response title="Response"
   ┌─user_id─┬─name──────────┬─email─────────────────────┬─phone────────┬─total_amount─┬─order_date─┬─shipping_address───────────────────┬─name_masked──┬─email_masked───────┬─phone_masked─┬─shipping_address_masked────┐
1. │    1001 │ John Smith    │ john.smith@gmail.com      │ 555-123-4567 │       299.99 │ 2024-01-15 │ 123 Main St, New York, NY 10001    │ John ****    │ jo****@gmail.com   │ 555-***-4567 │ **** New York, NY 10001    │
2. │    1002 │ Sarah Johnson │ sarah.johnson@outlook.com │ 555-987-6543 │        149.5 │ 2024-01-16 │ 456 Oak Ave, Los Angeles, CA 90210 │ Sarah ****   │ sa****@outlook.com │ 555-***-6543 │ **** Los Angeles, CA 90210 │
3. │    1003 │ Michael Brown │ mbrown@company.com        │ 555-456-7890 │          599 │ 2024-01-17 │ 789 Pine Rd, Chicago, IL 60601     │ Michael **** │ mb****@company.com │ 555-***-7890 │ **** Chicago, IL 60601     │
4. │    1004 │ Emily Rogers  │ emily.rogers@yahoo.com    │ 555-321-0987 │        89.99 │ 2024-01-18 │ 321 Elm St, Houston, TX 77001      │ Emily ****   │ em****@yahoo.com   │ 555-***-0987 │ **** Houston, TX 77001     │
5. │    1005 │ David Wilson  │ dwilson@email.net         │ 555-654-3210 │       449.75 │ 2024-01-19 │ 654 Cedar Blvd, Phoenix, AZ 85001  │ David ****   │ dw****@email.net   │ 555-***-3210 │ **** Phoenix, AZ 85001     │
   └─────────┴───────────────┴───────────────────────────┴──────────────┴──────────────┴────────────┴────────────────────────────────────┴──────────────┴────────────────────┴──────────────┴────────────────────────────┘
```

사용자가 마스킹된 데이터가 포함된 컬럼에만 접근하도록 하려면, 다시 한 번 [Role Based Access Control](/cloud/security/console-roles)을 사용하여 특정 역할에 `orders` 테이블의 마스킹된 컬럼에 대해서만 `SELECT` 권한을 부여하면 됩니다.

이전에 생성했던 역할을 다시 생성합니다:

```sql
DROP ROLE IF EXISTS masked_order_viewer;
CREATE ROLE masked_order_viewer;
```

다음으로 `orders` 테이블에 대해 `SELECT` 권한을 부여합니다:

```sql
GRANT SELECT ON orders TO masked_data_reader;
```

민감한 컬럼에 대한 모든 액세스 권한을 철회하십시오:

```sql
REVOKE SELECT(name) ON orders FROM masked_data_reader;
REVOKE SELECT(email) ON orders FROM masked_data_reader;
REVOKE SELECT(phone) ON orders FROM masked_data_reader;
REVOKE SELECT(shipping_address) ON orders FROM masked_data_reader;
```

마지막으로, 해당 역할을 적절한 사용자에게 부여합니다.

```sql
GRANT masked_orders_viewer TO your_user;
```

`orders` 테이블에 마스킹된 데이터만 저장하려는 경우,
마스킹되지 않은 민감한 컬럼을 [`EPHEMERAL`](/sql-reference/statements/create/table#ephemeral)로 표시할 수 있으며,
이렇게 하면 해당 유형의 컬럼은 테이블에 저장되지 않도록 보장됩니다.


```sql
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
    user_id UInt32,
    name String EPHEMERAL,
    name_masked String MATERIALIZED replaceRegexpOne(name, '^([A-Za-z]+)\\s+(.*)$', '\\1 ****'),
    email String EPHEMERAL,
    email_masked String MATERIALIZED replaceRegexpOne(email, '^(.{2})[^@]*(@.*)$', '\\1****\\2'),
    phone String EPHEMERAL,
    phone_masked String MATERIALIZED replaceRegexpOne(phone, '^(\\d{3})-(\\d{3})-(\\d{4})$', '\\1-***-\\3'),
    total_amount Decimal(10,2),
    order_date Date,
    shipping_address String EPHEMERAL,
    shipping_address_masked String MATERIALIZED replaceRegexpOne(shipping_address, '^([^,]+),\\s*(.*)$', '*** \\2')
)
ENGINE = MergeTree()
ORDER BY user_id;

INSERT INTO orders (user_id, name, email, phone, total_amount, order_date, shipping_address) VALUES
    (1001, 'John Smith', 'john.smith@gmail.com', '555-123-4567', 299.99, '2024-01-15', '123 Main St, New York, NY 10001'),
    (1002, 'Sarah Johnson', 'sarah.johnson@outlook.com', '555-987-6543', 149.50, '2024-01-16', '456 Oak Ave, Los Angeles, CA 90210'),
    (1003, 'Michael Brown', 'mbrown@company.com', '555-456-7890', 599.00, '2024-01-17', '789 Pine Rd, Chicago, IL 60601'),
    (1004, 'Emily Rogers', 'emily.rogers@yahoo.com', '555-321-0987', 89.99, '2024-01-18', '321 Elm St, Houston, TX 77001'),
    (1005, 'David Wilson', 'dwilson@email.net', '555-654-3210', 449.75, '2024-01-19', '654 Cedar Blvd, Phoenix, AZ 85001');
```

이전에와 동일한 쿼리를 다시 실행해 보면 이제 마스킹이 적용된 구체화된 데이터만 테이블에 삽입된 것을 확인할 수 있습니다:

```sql title="Query"
SELECT
    *,
    name_masked,
    email_masked,
    phone_masked,
    shipping_address_masked
FROM orders
ORDER BY user_id ASC
```

```response title="Response"
   ┌─user_id─┬─total_amount─┬─order_date─┬─name_masked──┬─email_masked───────┬─phone_masked─┬─shipping_address_masked───┐
1. │    1001 │       299.99 │ 2024-01-15 │ John ****    │ jo****@gmail.com   │ 555-***-4567 │ *** New York, NY 10001    │
2. │    1002 │        149.5 │ 2024-01-16 │ Sarah ****   │ sa****@outlook.com │ 555-***-6543 │ *** Los Angeles, CA 90210 │
3. │    1003 │          599 │ 2024-01-17 │ Michael **** │ mb****@company.com │ 555-***-7890 │ *** Chicago, IL 60601     │
4. │    1004 │        89.99 │ 2024-01-18 │ Emily ****   │ em****@yahoo.com   │ 555-***-0987 │ *** Houston, TX 77001     │
5. │    1005 │       449.75 │ 2024-01-19 │ David ****   │ dw****@email.net   │ 555-***-3210 │ *** Phoenix, AZ 85001     │
   └─────────┴──────────────┴────────────┴──────────────┴────────────────────┴──────────────┴───────────────────────────┘
```


## 로그 데이터에 쿼리 마스킹 규칙 사용 \{#use-query-masking-rules\}

로그 데이터만 별도로 마스킹하려는 ClickHouse OSS 사용자는 [query masking rules](/operations/server-configuration-parameters/settings#query_masking_rules) (로그 마스킹)을 사용하여 데이터를 마스킹할 수 있습니다.

이를 위해 서버 설정에서 정규 표현식 기반 마스킹 규칙을 정의합니다.
이 규칙은 쿼리와 모든 로그 메시지에 적용되며, 서버 로그나 시스템 테이블(`system.query_log`, `system.text_log`, `system.processes` 등)에 저장되기 전에 적용됩니다.

이렇게 하면 민감한 데이터가 **로그**에 유출되는 것을 방지할 수 있습니다.
다만, 쿼리 결과 내 데이터는 마스킹되지 않는다는 점에 유의해야 합니다.

예를 들어, 주민등록번호를 마스킹하려면 다음 규칙을 [server configuration](/operations/configuration-files)에 추가할 수 있습니다:

```yaml
<query_masking_rules>
    <rule>
        <name>hide SSN</name>
        <regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
        <replace>000-00-0000</replace>
    </rule>
</query_masking_rules>
```
