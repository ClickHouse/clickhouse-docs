---
'slug': '/cloud/guides/data-masking'
'sidebar_label': '데이터 마스킹'
'title': 'ClickHouse에서 데이터 마스킹'
'description': 'ClickHouse에서 데이터 마스킹에 대한 안내서'
'keywords':
- 'data masking'
'doc_type': 'guide'
---


# ClickHouse에서 데이터 마스킹

데이터 마스킹은 데이터 보호를 위해 사용되는 기법으로, 원래 데이터를 형식과 구조를 유지하면서 개인 식별 정보(PII) 또는 민감한 정보를 제거한 데이터 버전으로 대체하는 것입니다.

이 가이드는 ClickHouse에서 데이터를 마스킹하는 방법을 보여줍니다.

## 문자열 치환 함수 사용 {#using-string-functions}

기본 데이터 마스킹 사용 사례의 경우, `replace` 계열 함수는 데이터를 마스킹하는 편리한 방법을 제공합니다:

| 함수                                                                                     | 설명                                                                                                                                                     |
|------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`replaceOne`](/sql-reference/functions/string-replace-functions#replaceOne)             | 제공된 치환 문자열로 haystack 문자열에서 패턴의 첫 번째 발생을 대체합니다.                                                                                          |
| [`replaceAll`](/sql-reference/functions/string-replace-functions#replaceAll)             | 제공된 치환 문자열로 haystack 문자열에서 패턴의 모든 발생을 대체합니다.                                                                                           |
| [`replaceRegexpOne`](/sql-reference/functions/string-replace-functions#replaceRegexpOne) | haystack에서 정규 표현식 패턴( re2 구문)에 맞는 부분 문자열의 첫 번째 발생을 제공된 치환 문자열로 대체합니다.                                                      |
| [`replaceRegexpAll`](/sql-reference/functions/string-replace-functions#replaceRegexpAll) | haystack에서 정규 표현식 패턴( re2 구문)에 맞는 부분 문자열의 모든 발생을 제공된 치환 문자열로 대체합니다.                                                       |

예를 들어, `replaceOne` 함수를 사용하여 이름 "John Smith"를 자리 표시자 `[CUSTOMER_NAME]`로 바꿀 수 있습니다:

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

보다 일반적으로, 고객 이름을 대체하기 위해 `replaceRegexpOne`을 사용할 수 있습니다:

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

또는 `replaceRegexpAll` 함수를 사용하여 사회 보장 번호를 마스킹하고 마지막 4자리만 남길 수 있습니다.

```sql title="Query"
SELECT replaceRegexpAll(
    'SSN: 123-45-6789',
    '(\d{3})-(\d{2})-(\d{4})',
    'XXX-XX-\3'
) AS masked_ssn;
```

위 쿼리에서 `\3`는 결과 문자열에 세 번째 캡처 그룹을 대체하는 데 사용됩니다. 이는 다음과 같은 결과를 만들어냅니다:

```response title="Response"
┌─masked_ssn───────┐
│ SSN: XXX-XX-6789 │
└──────────────────┘
```

## 마스킹된 `VIEW` 생성 {#masked-views}

[`VIEW`](/sql-reference/statements/create/view)는 사용자에게 제공되기 전에 민감한 데이터를 포함하는 컬럼에 변환을 적용하기 위해 앞서 언급한 문자열 함수를 사용할 수 있습니다. 
이런 방식으로 원래 데이터는 변경되지 않고, 뷰를 쿼리하는 사용자는 마스킹된 데이터만 보게 됩니다.

예를 들어, 고객 주문 기록을 저장하는 테이블을 가정해 보겠습니다.
직원 그룹이 정보를 볼 수 있도록 하되, 고객의 전체 정보를 볼 수는 없게 하려고 합니다.

아래 쿼리를 실행하여 예제 테이블 `orders`를 생성하고 가상의 고객 주문 기록을 삽입합니다:

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

`masked_orders`라는 뷰를 생성합니다:

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

위 뷰 생성 쿼리의 `SELECT` 절에서는 민감한 정보를 부분적으로 마스킹하려는 `name`, `email`, `phone`, `shipping_address` 필드에 대해 `replaceRegexpOne`을 사용하여 변환을 정의합니다.

뷰에서 데이터를 선택합니다:

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

뷰에서 반환된 데이터가 부분적으로 마스킹되어 민감한 정보가 은폐된 것을 확인할 수 있습니다.
또한, 사용자에게 제공되는 정보에 따라 다른 수준의 은폐를 가진 여러 뷰를 생성할 수도 있습니다.

사용자가 마스킹된 데이터만 반환하는 뷰에만 접근할 수 있도록 하고, 원본 데이터가 있는 테이블에는 접근하지 못하게 하려면 [역할 기반 접근 제어](/cloud/security/console-roles)를 사용하여 특정 역할이 뷰에 대한 선택 권한만 갖도록 보장해야 합니다.

먼저 역할을 생성합니다:

```sql
CREATE ROLE masked_orders_viewer;
```

다음으로 해당 역할에 뷰에 대한 `SELECT` 권한을 부여합니다:

```sql
GRANT SELECT ON masked_orders TO masked_orders_viewer;
```

ClickHouse의 역할은 가산적이므로, 마스킹된 뷰만 봐야 하는 사용자는 어떤 역할을 통해서도 기본 테이블에 대한 `SELECT` 권한을 가지지 않도록 해야 합니다.

따라서 이를 안전하게 하기 위해 기본 테이블 접근을 명시적으로 취소해야 합니다:

```sql
REVOKE SELECT ON orders FROM masked_orders_viewer;
```

마지막으로 적절한 사용자에게 역할을 할당합니다:

```sql
GRANT masked_orders_viewer TO your_user;
```

이렇게 하면 `masked_orders_viewer` 역할을 가진 사용자가 테이블의 원본 마스킹되지 않은 데이터가 아니라 뷰의 마스킹된 데이터만 볼 수 있습니다.

## `MATERIALIZED` 컬럼과 컬럼 수준 접근 제한 사용 {#materialized-ephemeral-column-restrictions}

별도의 뷰를 생성하고 싶지 않은 경우, 원본 데이터와 함께 마스킹된 버전을 저장할 수 있습니다.
이를 위해 [물리화된 컬럼](/sql-reference/statements/create/table#materialized)을 사용할 수 있습니다.
이러한 컬럼의 값은 행이 삽입될 때 지정된 물리화된 표현에 따라 자동으로 계산되며, 우리는 이를 사용하여 데이터의 마스킹된 버전으로 새로운 컬럼을 생성할 수 있습니다.

앞의 예를 들면, 마스킹된 데이터를 위한 별도의 `VIEW`를 생성하는 대신 이제 `MATERIALIZED`를 사용하여 마스킹된 컬럼을 생성하겠습니다:

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

이제 다음 선택 쿼리를 실행하면 마스킹된 데이터가 삽입 시 '물리화'되어 원본 마스킹되지 않은 데이터와 함께 저장된 것을 확인할 수 있습니다.
ClickHouse는 기본적으로 `SELECT *` 쿼리에서 물리화된 컬럼을 자동으로 포함하지 않기 때문에 마스킹된 컬럼을 명시적으로 선택해야 합니다.

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

사용자가 마스킹된 데이터가 포함된 컬럼에만 접근할 수 있도록 하려면, 다시 한 번 [역할 기반 접근 제어](/cloud/security/console-roles)를 사용하여 특정 역할이 `orders`에서 마스킹된 컬럼을 선택하는 권한만 갖도록 보장할 수 있습니다.

이전에 만든 역할을 다시 생성합니다:

```sql
DROP ROLE IF EXISTS masked_order_viewer;
CREATE ROLE masked_order_viewer;
```

다음으로 `orders` 테이블에 대한 `SELECT` 권한을 부여합니다:

```sql
GRANT SELECT ON orders TO masked_data_reader;
```

민감한 컬럼에 대한 접근을 취소합니다:

```sql
REVOKE SELECT(name) ON orders FROM masked_data_reader;
REVOKE SELECT(email) ON orders FROM masked_data_reader;
REVOKE SELECT(phone) ON orders FROM masked_data_reader;
REVOKE SELECT(shipping_address) ON orders FROM masked_data_reader;
```

마지막으로 적절한 사용자에게 역할을 할당합니다:

```sql
GRANT masked_orders_viewer TO your_user;
```

`orders` 테이블에 마스킹된 데이터만 저장하고 싶을 경우,
민감한 마스킹되지 않은 컬럼을 [`EPHEMERAL`](/sql-reference/statements/create/table#ephemeral)로 표시하여 이 유형의 컬럼이 테이블에 저장되지 않도록 할 수 있습니다.

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

이전과 동일한 쿼리를 실행하면 이제 테이블에 물리화된 마스킹된 데이터만 삽입된 것을 볼 수 있습니다:

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

## 로그 데이터에 대한 쿼리 마스킹 규칙 사용 {#use-query-masking-rules}

로그 데이터를 특별히 마스킹하려는 ClickHouse OSS 사용자들은 데이터 마스킹을 위해 [쿼리 마스킹 규칙](/operations/server-configuration-parameters/settings#query_masking_rules)을 사용할 수 있습니다.

이를 위해 서버 구성에서 정규 표현식 기반의 마스킹 규칙을 정의할 수 있습니다.
이러한 규칙은 쿼리와 모든 로그 메시지에 저장되기 전에 서버 로그나 시스템 테이블(예: `system.query_log`, `system.text_log`, `system.processes`)에 적용됩니다.

이렇게 하면 민감한 데이터가 **로그**에만 유출되는 것을 방지할 수 있습니다.
쿼리 결과에서 데이터는 마스킹하지 않는다는 점에 유의하십시오.

예를 들어, 사회 보장 번호를 마스킹하려면 다음 규칙을 [서버 구성](/operations/configuration-files)에 추가할 수 있습니다:

```yaml
<query_masking_rules>
    <rule>
        <name>hide SSN</name>
        <regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
        <replace>000-00-0000</replace>
    </rule>
</query_masking_rules>
```
