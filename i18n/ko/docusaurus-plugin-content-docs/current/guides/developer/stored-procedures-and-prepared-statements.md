---
'sidebar_label': '저장 프로시저 및 쿼리 매개변수'
'sidebar_position': 19
'keywords':
- 'clickhouse'
- 'stored procedures'
- 'prepared statements'
- 'query parameters'
- 'UDF'
- 'parameterized views'
'description': 'ClickHouse에서 저장 프로시저, 준비된 문, 및 쿼리 매개변수에 대한 안내'
'slug': '/guides/developer/stored-procedures-and-prepared-statements'
'title': '저장 프로시저 및 쿼리 매개변수'
'doc_type': 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# ClickHouse의 저장 프로시저 및 쿼리 매개변수

전통적인 관계형 데이터베이스에서 오셨다면 ClickHouse에서 저장 프로시저와 준비된 문장을 찾고 계실 수도 있습니다. 이 가이드는 ClickHouse의 이러한 개념에 대한 접근 방식을 설명하고 권장되는 대안을 제공합니다.

## ClickHouse의 저장 프로시저 대안 {#alternatives-to-stored-procedures}

ClickHouse는 제어 흐름 로직(`IF`/`ELSE`, 루프 등)을 가진 전통적인 저장 프로시저를 지원하지 않습니다. 이는 ClickHouse의 분석 데이터베이스로서의 아키텍처에 기반한 의도적인 설계 결정입니다. 루프는 O(n) 간단한 쿼리를 처리하는 것이 일반적으로 더 복잡한 쿼리보다 느리기 때문에 분석 데이터베이스에서는 권장되지 않습니다.

ClickHouse는 다음에 최적화되어 있습니다:
- **분석 작업 부하** - 대량 데이터 세트에 대한 복잡한 집계
- **배치 처리** - 대량 데이터 볼륨의 효율적인 처리
- **선언형 쿼리** - 데이터를 검색하는 방법이 아니라 어떤 데이터를 검색할지를 설명하는 SQL 쿼리

제어 흐름이 있는 저장 프로시저는 이러한 최적화에 역행합니다. 대신 ClickHouse는 강점에 맞는 대안을 제공합니다.

### 사용자 정의 함수 (UDFs) {#user-defined-functions}

사용자 정의 함수는 제어 흐름 없이 재사용 가능한 논리를 캡슐화할 수 있습니다. ClickHouse는 두 가지 유형을 지원합니다:

#### 람다 기반 UDFs {#lambda-based-udfs}

SQL 표현식과 람다 구문을 사용하여 함수를 생성합니다:

<details>
<summary>예제에 대한 샘플 데이터</summary>

```sql
-- Create the products table
CREATE TABLE products (
    product_id UInt32,
    product_name String,
    price Decimal(10, 2)
)
ENGINE = MergeTree()
ORDER BY product_id;

-- Insert sample data
INSERT INTO products (product_id, product_name, price) VALUES
(1, 'Laptop', 899.99),
(2, 'Wireless Mouse', 24.99),
(3, 'USB-C Cable', 12.50),
(4, 'Monitor', 299.00),
(5, 'Keyboard', 79.99),
(6, 'Webcam', 54.95),
(7, 'Desk Lamp', 34.99),
(8, 'External Hard Drive', 119.99),
(9, 'Headphones', 149.00),
(10, 'Phone Stand', 15.99);
```
</details>

```sql
-- Simple calculation function
CREATE FUNCTION calculate_tax AS (price, rate) -> price * rate;

SELECT
    product_name,
    price,
    calculate_tax(price, 0.08) AS tax
FROM products;
```

```sql
-- Conditional logic using if()
CREATE FUNCTION price_tier AS (price) ->
    if(price < 100, 'Budget',
       if(price < 500, 'Mid-range', 'Premium'));

SELECT
    product_name,
    price,
    price_tier(price) AS tier
FROM products;
```

```sql
-- String manipulation
CREATE FUNCTION format_phone AS (phone) ->
    concat('(', substring(phone, 1, 3), ') ',
           substring(phone, 4, 3), '-',
           substring(phone, 7, 4));

SELECT format_phone('5551234567');
-- Result: (555) 123-4567
```

**제한 사항:**
- 루프 또는 복잡한 제어 흐름 없음
- 데이터 수정 불가(`INSERT`/`UPDATE`/`DELETE`)
- 재귀 함수 사용 불가

전체 구문에 대해서는 [`CREATE FUNCTION`](/sql-reference/statements/create/function)을 참조하세요.

#### 실행 가능 UDFs {#executable-udfs}

더 복잡한 논리를 위해 외부 프로그램을 호출하는 실행 가능 UDFs를 사용합니다:

```xml
<!-- /etc/clickhouse-server/sentiment_analysis_function.xml -->
<functions>
    <function>
        <type>executable</type>
        <name>sentiment_score</name>
        <return_type>Float32</return_type>
        <argument>
            <type>String</type>
        </argument>
        <format>TabSeparated</format>
        <command>python3 /opt/scripts/sentiment.py</command>
    </function>
</functions>
```

```sql
-- Use the executable UDF
SELECT
    review_text,
    sentiment_score(review_text) AS score
FROM customer_reviews;
```

실행 가능 UDFs는 모든 언어(Python, Node.js, Go 등)로 임의의 논리를 구현할 수 있습니다.

자세한 내용은 [Executable UDFs](/sql-reference/functions/udf)를 참조하세요.

### 매개변수화된 뷰 {#parameterized-views}

매개변수화된 뷰는 데이터 세트를 반환하는 함수처럼 행동합니다. 동적 필터링이 있는 재사용 가능한 쿼리에 이상적입니다:

<details>
<summary>예제에 대한 샘플 데이터</summary>

```sql
-- Create the sales table
CREATE TABLE sales (
  date Date,
  product_id UInt32,
  product_name String,
  category String,
  quantity UInt32,
  revenue Decimal(10, 2),
  sales_amount Decimal(10, 2)
)
ENGINE = MergeTree()
ORDER BY (date, product_id);

-- Insert sample data
INSERT INTO sales VALUES
('2024-01-05', 12345, 'Laptop Pro', 'Electronics', 2, 1799.98, 1799.98),
('2024-01-06', 12345, 'Laptop Pro', 'Electronics', 1, 899.99, 899.99),
('2024-01-10', 12346, 'Wireless Mouse', 'Electronics', 5, 124.95, 124.95),
('2024-01-15', 12347, 'USB-C Cable', 'Accessories', 10, 125.00, 125.00),
('2024-01-20', 12345, 'Laptop Pro', 'Electronics', 3, 2699.97, 2699.97),
('2024-01-25', 12348, 'Monitor 4K', 'Electronics', 2, 598.00, 598.00),
('2024-02-01', 12345, 'Laptop Pro', 'Electronics', 1, 899.99, 899.99),
('2024-02-05', 12349, 'Keyboard Mechanical', 'Accessories', 4, 319.96, 319.96),
('2024-02-10', 12346, 'Wireless Mouse', 'Electronics', 8, 199.92, 199.92),
('2024-02-15', 12350, 'Webcam HD', 'Electronics', 3, 164.85, 164.85);
```

</details>
```sql
-- Create a parameterized view
CREATE VIEW sales_by_date AS
SELECT
    date,
    product_id,
    sum(quantity) AS total_quantity,
    sum(revenue) AS total_revenue
FROM sales
WHERE date BETWEEN {start_date:Date} AND {end_date:Date}
GROUP BY date, product_id;
```

```sql
-- Query the view with parameters
SELECT *
FROM sales_by_date(start_date='2024-01-01', end_date='2024-01-31')
WHERE product_id = 12345;
```

#### 일반적인 사용 사례 {#common-use-cases}
- 동적 날짜 범위 필터링
- 사용자별 데이터 슬라이스
- [다중 테넌트 데이터 액세스](/cloud/bestpractices/multi-tenancy)
- 보고서 템플릿
- [데이터 마스킹](/cloud/guides/data-masking)

```sql
-- More complex parameterized view
CREATE VIEW top_products_by_category AS
SELECT
    category,
    product_name,
    revenue,
    rank
FROM (
    SELECT
        category,
        product_name,
        revenue,
        rank() OVER (PARTITION BY category ORDER BY revenue DESC) AS rank
    FROM (
        SELECT
            category,
            product_name,
            sum(sales_amount) AS revenue
        FROM sales
        WHERE category = {category:String}
            AND date >= {min_date:Date}
        GROUP BY category, product_name
    )
)
WHERE rank <= {top_n:UInt32};

-- Use it
SELECT * FROM top_products_by_category(
    category='Electronics',
    min_date='2024-01-01',
    top_n=10
);
```

추가 정보는 [매개변수화된 뷰](/sql-reference/statements/create/view#parameterized-view) 섹션을 참조하세요.

### 물리화된 뷰 {#materialized-views}

물리화된 뷰는 전통적으로 저장 프로시저에서 수행될 비싼 집계를 사전 계산하는 데 이상적입니다. 전통적인 데이터베이스에서 오신 경우, 물리화된 뷰를 **INSERT 트리거**로 생각하십시오. 이는 원본 테이블에 데이터가 삽입될 때 자동으로 변환하고 집계합니다:

```sql
-- Source table
CREATE TABLE page_views (
    user_id UInt64,
    page String,
    timestamp DateTime,
    session_id String
)
ENGINE = MergeTree()
ORDER BY (user_id, timestamp);

-- Materialized view that maintains aggregated statistics
CREATE MATERIALIZED VIEW daily_user_stats
ENGINE = SummingMergeTree()
ORDER BY (date, user_id)
AS SELECT
    toDate(timestamp) AS date,
    user_id,
    count() AS page_views,
    uniq(session_id) AS sessions,
    uniq(page) AS unique_pages
FROM page_views
GROUP BY date, user_id;

-- Insert sample data into source table
INSERT INTO page_views VALUES
(101, '/home', '2024-01-15 10:00:00', 'session_a1'),
(101, '/products', '2024-01-15 10:05:00', 'session_a1'),
(101, '/checkout', '2024-01-15 10:10:00', 'session_a1'),
(102, '/home', '2024-01-15 11:00:00', 'session_b1'),
(102, '/about', '2024-01-15 11:05:00', 'session_b1'),
(101, '/home', '2024-01-16 09:00:00', 'session_a2'),
(101, '/products', '2024-01-16 09:15:00', 'session_a2'),
(103, '/home', '2024-01-16 14:00:00', 'session_c1'),
(103, '/products', '2024-01-16 14:05:00', 'session_c1'),
(103, '/products', '2024-01-16 14:10:00', 'session_c1'),
(102, '/home', '2024-01-17 10:30:00', 'session_b2'),
(102, '/contact', '2024-01-17 10:35:00', 'session_b2');

-- Query pre-aggregated data
SELECT
    user_id,
    sum(page_views) AS total_views,
    sum(sessions) AS total_sessions
FROM daily_user_stats
WHERE date BETWEEN '2024-01-01' AND '2024-01-31'
GROUP BY user_id;
```

#### 새로 고칠 수 있는 물리화된 뷰 {#refreshable-materialized-views}

예정된 배치 처리를 위한 (예: 야간 저장 프로시저):

```sql
-- Automatically refresh every day at 2 AM
CREATE MATERIALIZED VIEW monthly_sales_report
REFRESH EVERY 1 DAY OFFSET 2 HOUR
AS SELECT
    toStartOfMonth(order_date) AS month,
    region,
    product_category,
    count() AS order_count,
    sum(amount) AS total_revenue,
    avg(amount) AS avg_order_value
FROM orders
WHERE order_date >= today() - INTERVAL 13 MONTH
GROUP BY month, region, product_category;

-- Query always has fresh data
SELECT * FROM monthly_sales_report
WHERE month = toStartOfMonth(today());
```

고급 패턴에 대해서는 [계단식 물리화된 뷰](/guides/developer/cascading-materialized-views)를 참조하세요.

### 외부 오케스트레이션 {#external-orchestration}

복잡한 비즈니스 논리, ETL 워크플로 또는 멀티 단계 프로세스의 경우, ClickHouse 외부에서 언어 클라이언트를 사용하여 논리를 구현하는 것이 항상 가능합니다.

#### 애플리케이션 코드 사용 {#using-application-code}

여기 MySQL 저장 프로시저가 ClickHouse 애플리케이션 코드로 변환되는 방식에 대한 나란히 비교가 있습니다:

<Tabs>
<TabItem value="mysql" label="MySQL 저장 프로시저" default>

```sql
DELIMITER $$

CREATE PROCEDURE process_order(
    IN p_order_id INT,
    IN p_customer_id INT,
    IN p_order_total DECIMAL(10,2),
    OUT p_status VARCHAR(50),
    OUT p_loyalty_points INT
)
BEGIN
    DECLARE v_customer_tier VARCHAR(20);
    DECLARE v_previous_orders INT;
    DECLARE v_discount DECIMAL(10,2);

    -- Start transaction
    START TRANSACTION;

    -- Get customer information
    SELECT tier, total_orders
    INTO v_customer_tier, v_previous_orders
    FROM customers
    WHERE customer_id = p_customer_id;

    -- Calculate discount based on tier
    IF v_customer_tier = 'gold' THEN
        SET v_discount = p_order_total * 0.15;
    ELSEIF v_customer_tier = 'silver' THEN
        SET v_discount = p_order_total * 0.10;
    ELSE
        SET v_discount = 0;
    END IF;

    -- Insert order record
    INSERT INTO orders (order_id, customer_id, order_total, discount, final_amount)
    VALUES (p_order_id, p_customer_id, p_order_total, v_discount,
            p_order_total - v_discount);

    -- Update customer statistics
    UPDATE customers
    SET total_orders = total_orders + 1,
        lifetime_value = lifetime_value + (p_order_total - v_discount),
        last_order_date = NOW()
    WHERE customer_id = p_customer_id;

    -- Calculate loyalty points (1 point per dollar)
    SET p_loyalty_points = FLOOR(p_order_total - v_discount);

    -- Insert loyalty points transaction
    INSERT INTO loyalty_points (customer_id, points, transaction_date, description)
    VALUES (p_customer_id, p_loyalty_points, NOW(),
            CONCAT('Order #', p_order_id));

    -- Check if customer should be upgraded
    IF v_previous_orders + 1 >= 10 AND v_customer_tier = 'bronze' THEN
        UPDATE customers SET tier = 'silver' WHERE customer_id = p_customer_id;
        SET p_status = 'ORDER_COMPLETE_TIER_UPGRADED_SILVER';
    ELSEIF v_previous_orders + 1 >= 50 AND v_customer_tier = 'silver' THEN
        UPDATE customers SET tier = 'gold' WHERE customer_id = p_customer_id;
        SET p_status = 'ORDER_COMPLETE_TIER_UPGRADED_GOLD';
    ELSE
        SET p_status = 'ORDER_COMPLETE';
    END IF;

    COMMIT;
END$$

DELIMITER ;

-- Call the stored procedure
CALL process_order(12345, 5678, 250.00, @status, @points);
SELECT @status, @points;
```

</TabItem>
<TabItem value="clickhouse" label="ClickHouse 애플리케이션 코드">

:::note 쿼리 매개변수
아래 예제는 ClickHouse의 쿼리 매개변수를 사용합니다. ClickHouse의 쿼리 매개변수에 익숙하지 않은 경우, ["ClickHouse에서 준비된 문장 대안"](/guides/developer/stored-procedures-and-prepared-statements#alternatives-to-prepared-statements-in-clickhouse)로 건너뛰세요.
:::

```python

# Python example using clickhouse-connect
import clickhouse_connect
from datetime import datetime
from decimal import Decimal

client = clickhouse_connect.get_client(host='localhost')

def process_order(order_id: int, customer_id: int, order_total: Decimal) -> tuple[str, int]:
    """
    Processes an order with business logic that would be in a stored procedure.
    Returns: (status_message, loyalty_points)

    Note: ClickHouse is optimized for analytics, not OLTP transactions.
    For transactional workloads, use an OLTP database (PostgreSQL, MySQL)
    and sync analytics data to ClickHouse for reporting.
    """

    # Step 1: Get customer information
    result = client.query(
        """
        SELECT tier, total_orders
        FROM customers
        WHERE customer_id = {cid: UInt32}
        """,
        parameters={'cid': customer_id}
    )

    if not result.result_rows:
        raise ValueError(f"Customer {customer_id} not found")

    customer_tier, previous_orders = result.result_rows[0]

    # Step 2: Calculate discount based on tier (business logic in Python)
    discount_rates = {'gold': 0.15, 'silver': 0.10, 'bronze': 0.0}
    discount = order_total * Decimal(str(discount_rates.get(customer_tier, 0.0)))
    final_amount = order_total - discount

    # Step 3: Insert order record
    client.command(
        """
        INSERT INTO orders (order_id, customer_id, order_total, discount,
                           final_amount, order_date)
        VALUES ({oid: UInt32}, {cid: UInt32}, {total: Decimal64(2)},
                {disc: Decimal64(2)}, {final: Decimal64(2)}, now())
        """,
        parameters={
            'oid': order_id,
            'cid': customer_id,
            'total': float(order_total),
            'disc': float(discount),
            'final': float(final_amount)
        }
    )

    # Step 4: Calculate new customer statistics
    new_order_count = previous_orders + 1

    # For analytics databases, prefer INSERT over UPDATE
    # This uses a ReplacingMergeTree pattern
    client.command(
        """
        INSERT INTO customers (customer_id, tier, total_orders, last_order_date,
                              update_time)
        SELECT
            customer_id,
            tier,
            {new_count: UInt32} AS total_orders,
            now() AS last_order_date,
            now() AS update_time
        FROM customers
        WHERE customer_id = {cid: UInt32}
        """,
        parameters={'cid': customer_id, 'new_count': new_order_count}
    )

    # Step 5: Calculate and record loyalty points
    loyalty_points = int(final_amount)

    client.command(
        """
        INSERT INTO loyalty_points (customer_id, points, transaction_date, description)
        VALUES ({cid: UInt32}, {pts: Int32}, now(),
                {desc: String})
        """,
        parameters={
            'cid': customer_id,
            'pts': loyalty_points,
            'desc': f'Order #{order_id}'
        }
    )

    # Step 6: Check for tier upgrade (business logic in Python)
    status = 'ORDER_COMPLETE'

    if new_order_count >= 10 and customer_tier == 'bronze':
        # Upgrade to silver
        client.command(
            """
            INSERT INTO customers (customer_id, tier, total_orders, last_order_date,
                                  update_time)
            SELECT
                customer_id, 'silver' AS tier, total_orders, last_order_date,
                now() AS update_time
            FROM customers
            WHERE customer_id = {cid: UInt32}
            """,
            parameters={'cid': customer_id}
        )
        status = 'ORDER_COMPLETE_TIER_UPGRADED_SILVER'

    elif new_order_count >= 50 and customer_tier == 'silver':
        # Upgrade to gold
        client.command(
            """
            INSERT INTO customers (customer_id, tier, total_orders, last_order_date,
                                  update_time)
            SELECT
                customer_id, 'gold' AS tier, total_orders, last_order_date,
                now() AS update_time
            FROM customers
            WHERE customer_id = {cid: UInt32}
            """,
            parameters={'cid': customer_id}
        )
        status = 'ORDER_COMPLETE_TIER_UPGRADED_GOLD'

    return status, loyalty_points


# Use the function
status, points = process_order(
    order_id=12345,
    customer_id=5678,
    order_total=Decimal('250.00')
)

print(f"Status: {status}, Loyalty Points: {points}")
```

</TabItem>
</Tabs>

<br/>

#### 주요 차이점 {#key-differences}

1. **제어 흐름** - MySQL 저장 프로시저는 `IF/ELSE`, `WHILE` 루프를 사용합니다. ClickHouse에서는 애플리케이션 코드(Python, Java 등)에서 이 논리를 구현합니다.
2. **트랜잭션** - MySQL은 ACID 트랜잭션을 위한 `BEGIN/COMMIT/ROLLBACK`을 지원합니다. ClickHouse는 추가 전용 작업에 최적화된 분석 데이터베이스로, 트랜잭션 업데이트에는 최적화되어 있지 않습니다.
3. **업데이트** - MySQL은 `UPDATE` 문을 사용합니다. ClickHouse는 변경 가능한 데이터에 대해 [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) 또는 [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)를 사용하는 `INSERT`를 선호합니다.
4. **변수 및 상태** - MySQL 저장 프로시저는 변수를 선언할 수 있습니다(`DECLARE v_discount`). ClickHouse에서는 애플리케이션 코드에서 상태를 관리합니다.
5. **오류 처리** - MySQL은 `SIGNAL` 및 예외 처리기를 지원합니다. 애플리케이션 코드에서는 사용자의 언어의 기본 오류 처리를 사용합니다(try/catch).

:::tip
**각 접근 방식을 사용할 때:**
- **OLTP 작업 부하** (주문, 결제, 사용자 계정) → 저장 프로시저가 있는 MySQL/PostgreSQL 사용
- **분석 작업 부하** (보고, 집계, 시계열) → 애플리케이션 오케스트레이션이 있는 ClickHouse 사용
- **하이브리드 아키텍처** → 둘 다 사용! OLTP에서 ClickHouse로 분석을 위해 트랜잭션 데이터를 스트리밍합니다.
:::

#### 워크플로 오케스트레이션 도구 사용 {#using-workflow-orchestration-tools}

- **Apache Airflow** - ClickHouse 쿼리의 복잡한 DAG를 예약하고 모니터링합니다.
- **dbt** - SQL 기반 워크플로로 데이터를 변환합니다.
- **Prefect/Dagster** - 최신 Python 기반 오케스트레이션
- **사용자 정의 스케줄러** - Cron 작업, Kubernetes CronJobs 등.

**외부 오케스트레이션의 이점:**
- 전체 프로그래밍 언어 기능
- 더 나은 오류 처리 및 재시도 논리
- 외부 시스템(API, 기타 데이터베이스)과의 통합
- 버전 관리 및 테스트
- 모니터링 및 경고
- 더 유연한 스케줄링

## ClickHouse에서 준비된 문장에 대한 대안 {#alternatives-to-prepared-statements-in-clickhouse}

ClickHouse는 RDBMS 의미에서 전통적인 "준비된 문장"을 갖고 있지 않지만, SQL 주입을 방지하는 안전한 매개변수화 쿼리와 같은 목적을 수행하는 **쿼리 매개변수**를 제공합니다.

### 구문 {#query-parameters-syntax}

쿼리 매개변수를 정의하는 두 가지 방법이 있습니다:

#### 방법 1: `SET` 사용 {#method-1-using-set}

<details>
<summary>예제 테이블 및 데이터</summary>

```sql
-- Create the user_events table (ClickHouse syntax)
CREATE TABLE user_events (
    event_id UInt32,
    user_id UInt64,
    event_name String,
    event_date Date,
    event_timestamp DateTime
) ENGINE = MergeTree()
ORDER BY (user_id, event_date);

-- Insert sample data for multiple users and events
INSERT INTO user_events (event_id, user_id, event_name, event_date, event_timestamp) VALUES
(1, 12345, 'page_view', '2024-01-05', '2024-01-05 10:30:00'),
(2, 12345, 'page_view', '2024-01-05', '2024-01-05 10:35:00'),
(3, 12345, 'add_to_cart', '2024-01-05', '2024-01-05 10:40:00'),
(4, 12345, 'page_view', '2024-01-10', '2024-01-10 14:20:00'),
(5, 12345, 'add_to_cart', '2024-01-10', '2024-01-10 14:25:00'),
(6, 12345, 'purchase', '2024-01-10', '2024-01-10 14:30:00'),
(7, 12345, 'page_view', '2024-01-15', '2024-01-15 09:15:00'),
(8, 12345, 'page_view', '2024-01-15', '2024-01-15 09:20:00'),
(9, 12345, 'page_view', '2024-01-20', '2024-01-20 16:45:00'),
(10, 12345, 'add_to_cart', '2024-01-20', '2024-01-20 16:50:00'),
(11, 12345, 'purchase', '2024-01-25', '2024-01-25 11:10:00'),
(12, 12345, 'page_view', '2024-01-28', '2024-01-28 13:30:00'),
(13, 67890, 'page_view', '2024-01-05', '2024-01-05 11:00:00'),
(14, 67890, 'add_to_cart', '2024-01-05', '2024-01-05 11:05:00'),
(15, 67890, 'purchase', '2024-01-05', '2024-01-05 11:10:00'),
(16, 12345, 'page_view', '2024-02-01', '2024-02-01 10:00:00'),
(17, 12345, 'add_to_cart', '2024-02-01', '2024-02-01 10:05:00');
```

</details>

```sql
SET param_user_id = 12345;
SET param_start_date = '2024-01-01';
SET param_end_date = '2024-01-31';

SELECT
    event_name,
    count() AS event_count
FROM user_events
WHERE user_id = {user_id: UInt64}
    AND event_date BETWEEN {start_date: Date} AND {end_date: Date}
GROUP BY event_name;
```

#### 방법 2: CLI 매개변수 사용 {#method-2-using-cli-parameters}

```bash
clickhouse-client \
    --param_user_id=12345 \
    --param_start_date='2024-01-01' \
    --param_end_date='2024-01-31' \
    --query="SELECT count() FROM user_events
             WHERE user_id = {user_id: UInt64}
             AND event_date BETWEEN {start_date: Date} AND {end_date: Date}"
```

### 매개변수 구문 {#parameter-syntax}

매개변수는 다음과 같이 참조됩니다: `{parameter_name: DataType}`

- `parameter_name` - 매개변수의 이름( `param_` 접두사 제외)
- `DataType` - 매개변수를 캐스팅할 ClickHouse 데이터 유형

### 데이터 유형 예제 {#data-type-examples}

<details>
<summary>예제에 대한 테이블 및 샘플 데이터</summary>

```sql
-- 1. Create a table for string and number tests
CREATE TABLE IF NOT EXISTS users (
    name String,
    age UInt8,
    salary Float64
) ENGINE = Memory;

INSERT INTO users VALUES
    ('John Doe', 25, 75000.50),
    ('Jane Smith', 30, 85000.75),
    ('Peter Jones', 20, 50000.00);

-- 2. Create a table for date and timestamp tests
CREATE TABLE IF NOT EXISTS events (
    event_date Date,
    event_timestamp DateTime
) ENGINE = Memory;

INSERT INTO events VALUES
    ('2024-01-15', '2024-01-15 14:30:00'),
    ('2024-01-15', '2024-01-15 15:00:00'),
    ('2024-01-16', '2024-01-16 10:00:00');

-- 3. Create a table for array tests
CREATE TABLE IF NOT EXISTS products (
    id UInt32,
    name String
) ENGINE = Memory;

INSERT INTO products VALUES (1, 'Laptop'), (2, 'Monitor'), (3, 'Mouse'), (4, 'Keyboard');

-- 4. Create a table for Map (struct-like) tests
CREATE TABLE IF NOT EXISTS accounts (
    user_id UInt32,
    status String,
    type String
) ENGINE = Memory;

INSERT INTO accounts VALUES
    (101, 'active', 'premium'),
    (102, 'inactive', 'basic'),
    (103, 'active', 'basic');

-- 5. Create a table for Identifier tests
CREATE TABLE IF NOT EXISTS sales_2024 (
    value UInt32
) ENGINE = Memory;

INSERT INTO sales_2024 VALUES (100), (200), (300);
```
</details>

<Tabs>
<TabItem value="strings" label="문자열 및 숫자" default>

```sql
SET param_name = 'John Doe';
SET param_age = 25;
SET param_salary = 75000.50;

SELECT name, age, salary FROM users
WHERE name = {name: String}
  AND age >= {age: UInt8}
  AND salary <= {salary: Float64};
```

</TabItem>
<TabItem value="dates" label="날짜 및 시간">

```sql
SET param_date = '2024-01-15';
SET param_timestamp = '2024-01-15 14:30:00';

SELECT * FROM events
WHERE event_date = {date: Date}
   OR event_timestamp > {timestamp: DateTime};
```

</TabItem>
<TabItem value="arrays" label="배열">

```sql
SET param_ids = [1, 2, 3, 4, 5];

SELECT * FROM products WHERE id IN {ids: Array(UInt32)};
```

</TabItem>
<TabItem value="maps" label="맵">

```sql
SET param_filters = {'target_status': 'active'};

SELECT user_id, status, type FROM accounts
WHERE status = arrayElement(
    mapValues({filters: Map(String, String)}),
    indexOf(mapKeys({filters: Map(String, String)}), 'target_status')
);
```

</TabItem>
<TabItem value="identifiers" label="식별자">

```sql
SET param_table = 'sales_2024';

SELECT count() FROM {table: Identifier};
```

</TabItem>
</Tabs>

<br/>
[언어 클라이언트](/integrations/language-clients)에서 쿼리 매개변수를 사용하는 방법은 관심 있는 특정 언어 클라이언트의 문서를 참조하세요.

### 쿼리 매개변수의 제한 사항 {#limitations-of-query-parameters}

쿼리 매개변수는 **일반 텍스트 대체물**이 아닙니다. 특정한 제한 사항이 있습니다:

1. **주로 SELECT 문에 대한 것입니다** - SELECT 쿼리에서 가장 잘 지원됩니다.
2. **식별자 또는 리터럴로 작동합니다** - 임의의 SQL 조각을 대체할 수 없습니다.
3. **제한된 DDL 지원** - `CREATE TABLE`에서 지원되지만 `ALTER TABLE`에서는 지원되지 않습니다.

**작동하는 것:**
```sql
-- ✓ Values in WHERE clause
SELECT * FROM users WHERE id = {user_id: UInt64};

-- ✓ Table/database names
SELECT * FROM {db: Identifier}.{table: Identifier};

-- ✓ Values in IN clause
SELECT * FROM products WHERE id IN {ids: Array(UInt32)};

-- ✓ CREATE TABLE
CREATE TABLE {table_name: Identifier} (id UInt64, name String) ENGINE = MergeTree() ORDER BY id;
```

**작동하지 않는 것:**
```sql
-- ✗ Column names in SELECT (use Identifier carefully)
SELECT {column: Identifier} FROM users;  -- Limited support

-- ✗ Arbitrary SQL fragments
SELECT * FROM users {where_clause: String};  -- NOT SUPPORTED

-- ✗ ALTER TABLE statements
ALTER TABLE {table: Identifier} ADD COLUMN new_col String;  -- NOT SUPPORTED

-- ✗ Multiple statements
{statements: String};  -- NOT SUPPORTED
```

### 보안 모범 사례 {#security-best-practices}

**사용자 입력에 항상 쿼리 매개변수를 사용하세요:**

```python

# ✓ SAFE - Uses parameters
user_input = request.get('user_id')
result = client.query(
    "SELECT * FROM orders WHERE user_id = {uid: UInt64}",
    parameters={'uid': user_input}
)


# ✗ DANGEROUS - SQL injection risk!
user_input = request.get('user_id')
result = client.query(f"SELECT * FROM orders WHERE user_id = {user_input}")
```

**입력 유형을 검증하세요:**

```python
def get_user_orders(user_id: int, start_date: str):
    # Validate types before querying
    if not isinstance(user_id, int) or user_id <= 0:
        raise ValueError("Invalid user_id")

    # Parameters enforce type safety
    return client.query(
        """
        SELECT * FROM orders
        WHERE user_id = {uid: UInt64}
            AND order_date >= {start: Date}
        """,
        parameters={'uid': user_id, 'start': start_date}
    )
```

### MySQL 프로토콜 준비된 문장 {#mysql-protocol-prepared-statements}

ClickHouse의 [MySQL 인터페이스](/interfaces/mysql)에는 준비된 문장(`COM_STMT_PREPARE`, `COM_STMT_EXECUTE`, `COM_STMT_CLOSE`)에 대한 최소 지원이 포함되어 있습니다. 주로 준비된 문장에서 쿼리를 래핑하는 Tableau Online과 같은 도구와의 연결을 가능하게 하기 위해 설계되었습니다.

**주요 제한 사항:**

- **매개변수 바인딩은 지원되지 않음** - 매개변수가 있는 `?` 플레이스홀더를 사용할 수 없습니다.
- 쿼리는 저장되지만 `PREPARE` 중에 파싱되지 않습니다.
- 구현이 최소화되어 있으며 특정 BI 도구 호환성을 위해 설계되었습니다.

**작동하지 않는 예:**

```sql
-- This MySQL-style prepared statement with parameters does NOT work in ClickHouse
PREPARE stmt FROM 'SELECT * FROM users WHERE id = ?';
EXECUTE stmt USING @user_id;  -- Parameter binding not supported
```

:::tip
**ClickHouse의 기본 쿼리 매개변수를 사용하는 것이 좋습니다.** 이는 모든 ClickHouse 인터페이스에서 전체 매개변수 바인딩 지원, 유형 안전 및 SQL 주입 방지를 제공합니다:

```sql
-- ClickHouse native query parameters (recommended)
SET param_user_id = 12345;
SELECT * FROM users WHERE id = {user_id: UInt64};
```
:::

자세한 내용은 [MySQL 인터페이스 문서](/interfaces/mysql) 및 [MySQL 지원에 관한 블로그 게시물](https://clickhouse.com/blog/mysql-support-in-clickhouse-the-journey)을 참조하세요.

## 요약 {#summary}

### 저장 프로시저에 대한 ClickHouse 대안 {#summary-stored-procedures}

| 전통적인 저장 프로시저 패턴                | ClickHouse 대안                                                       |
|------------------------------------|------------------------------------------------------------------|
| 간단한 계산 및 변환                    | 사용자 정의 함수 (UDFs)                                           |
| 재사용 가능한 매개변수화 쿼리                | 매개변수화된 뷰                                                  |
| 사전 계산된 집계                       | 물리화된 뷰                                                    |
| 예정된 배치 처리                      | 새로 고칠 수 있는 물리화된 뷰                                   |
| 복잡한 다단계 ETL                    | 연결된 물리화된 뷰 또는 외부 오케스트레이션 (Python, Airflow, dbt) |
| 제어 흐름이 있는 비즈니스 논리              | 애플리케이션 코드                                                |

### 쿼리 매개변수의 사용 {#summary-query-parameters}

쿼리 매개변수는 다음에 사용할 수 있습니다:
- SQL 주입 방지
- 유형 안전성이 있는 매개변수화된 쿼리
- 애플리케이션에서의 동적 필터링
- 재사용 가능한 쿼리 템플릿

## 관련 문서 {#related-documentation}

- [`CREATE FUNCTION`](/sql-reference/statements/create/function) - 사용자 정의 함수
- [`CREATE VIEW`](/sql-reference/statements/create/view) - 매개변수화된 뷰 및 물리화된 뷰 포함
- [SQL 구문 - 쿼리 매개변수](/sql-reference/syntax#defining-and-using-query-parameters) - 전체 매개변수 구문
- [계단식 물리화된 뷰](/guides/developer/cascading-materialized-views) - 고급 물리화된 뷰 패턴
- [실행 가능 UDFs](/sql-reference/functions/udf) - 외부 함수 실행
