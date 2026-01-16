---
sidebar_label: '存储过程与查询参数'
sidebar_position: 19
keywords: ['clickhouse', '存储过程', '预编译语句', '查询参数', 'UDF', '参数化视图']
description: '关于 ClickHouse 中存储过程、预编译语句和查询参数的指南'
slug: /guides/developer/stored-procedures-and-prepared-statements
title: '存储过程与查询参数'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ClickHouse 中的存储过程和查询参数 \\{#stored-procedures-and-query-parameters-in-clickhouse\\}

如果你之前使用的是传统关系型数据库，可能会在 ClickHouse 中寻找存储过程和预处理语句（prepared statements）。
本指南将解释 ClickHouse 对这些概念的处理方式，并提供推荐的替代方案。

## ClickHouse 中存储过程的替代方案 \\{#alternatives-to-stored-procedures\\}

ClickHouse 不支持带有控制流逻辑（`IF`/`ELSE`、循环等）的传统存储过程。
这是基于 ClickHouse 作为分析型数据库的架构而做出的刻意设计选择。
在分析型数据库中不鼓励使用循环，因为处理 O(n) 个简单查询通常比处理少量复杂查询更慢。

ClickHouse 针对以下场景进行了优化：

- **分析型工作负载** - 对大型数据集进行复杂聚合
- **批处理** - 高效处理大规模数据量
- **声明式查询** - 使用 SQL 查询描述要检索哪些数据，而不是如何处理这些数据

带有过程式逻辑的存储过程与这些优化方向相悖。为此，ClickHouse 提供了与其优势相匹配的替代方案。

### 用户定义函数（UDF） \\{#user-defined-functions\\}

用户定义函数无需使用控制流即可封装可复用的逻辑。ClickHouse 支持两种类型：

#### 基于 Lambda 的 UDF \\{#lambda-based-udfs\\}

使用 SQL 表达式和 lambda 语法创建函数：

<details>
  <summary>用于示例的样本数据</summary>

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

**限制：**

* 不支持循环或复杂的控制流
* 不能修改数据（`INSERT`/`UPDATE`/`DELETE`）
* 不允许使用递归函数

完整语法请参阅 [`CREATE FUNCTION`](/sql-reference/statements/create/function)。

#### 可执行 UDF \\{#executable-udfs\\}

对于更复杂的逻辑，可以使用可执行 UDF 函数来调用外部程序：

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

可执行 UDF 可以使用任意语言（Python、Node.js、Go 等）来实现任意逻辑。

有关详细信息，请参阅[可执行 UDF](/sql-reference/functions/udf)。

### 参数化视图 \\{#parameterized-views\\}

参数化视图类似于返回数据集的函数。
它们非常适合带有动态过滤条件的可复用查询：

<details>
  <summary>示例数据</summary>

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

#### 常见用例 \\{#common-use-cases\\}

* 动态日期范围过滤
* 按用户的数据切片
* [多租户数据访问](/cloud/bestpractices/multi-tenancy)
* 报表模板
* [数据脱敏](/cloud/guides/data-masking)

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

有关详细信息，请参阅[参数化视图](/sql-reference/statements/create/view#parameterized-view)部分。

### 物化视图 \\{#materialized-views\\}

物化视图非常适合用于预先计算那些在传统方案中通常由存储过程执行的高开销聚合操作。如果你有使用传统数据库的背景，可以把物化视图理解为一种 **INSERT 触发器（trigger）**，它会在数据插入到源表时自动对其进行转换和聚合：

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

#### 可刷新物化视图 \\{#refreshable-materialized-views\\}

用于计划的批处理任务（例如每晚运行的存储过程）：

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

有关更高级的用法，请参阅 [级联物化视图](/guides/developer/cascading-materialized-views)。

### 外部编排 \\{#external-orchestration\\}

对于复杂的业务逻辑、ETL 工作流或多步骤流程，可以在 ClickHouse 外部使用各类语言客户端来实现这些逻辑。

#### 使用应用代码 \\{#using-application-code\\}

下面是一个对比示例，展示了如何将 MySQL 存储过程改写为 ClickHouse 的应用代码：

<Tabs>
  <TabItem value="mysql" label="MySQL 存储过程" default>
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

  <TabItem value="ClickHouse" label="ClickHouse 应用代码">
    :::note 查询参数
    以下示例使用了 ClickHouse 中的查询参数。
    如果您尚不熟悉 ClickHouse 中的查询参数,请跳转至[&quot;ClickHouse 中预处理语句的替代方案&quot;](/guides/developer/stored-procedures-and-prepared-statements#alternatives-to-prepared-statements-in-clickhouse)。
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

#### 关键区别 \\{#key-differences\\}

1. **控制流** - MySQL 存储过程使用 `IF/ELSE`、`WHILE` 等循环结构。在 ClickHouse 中，应在应用程序代码（Python、Java 等）中实现这类逻辑。
2. **事务** - MySQL 支持 `BEGIN/COMMIT/ROLLBACK` 以实现 ACID 事务。ClickHouse 是为追加写入型工作负载优化的分析型数据库，而不是面向事务性更新。
3. **更新** - MySQL 使用 `UPDATE` 语句。对于可变数据，ClickHouse 更倾向于使用 `INSERT` 配合 [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) 或 [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)。
4. **变量和状态** - MySQL 存储过程可以声明变量（`DECLARE v_discount`）。在 ClickHouse 中，应在应用程序代码中管理状态。
5. **错误处理** - MySQL 支持 `SIGNAL` 和异常处理器。在应用程序代码中，应使用所用语言的原生错误处理机制（try/catch）。

:::tip
**何时采用各方案：**

- **OLTP 工作负载**（订单、支付、用户账户）→ 使用带存储过程的 MySQL/PostgreSQL
- **分析型工作负载**（报表、聚合、时序数据）→ 使用配合应用程序编排的 ClickHouse
- **混合架构** → 两者都用！将 OLTP 中的事务数据流式传输到 ClickHouse 用于分析
:::

#### 使用工作流编排工具 \\{#using-workflow-orchestration-tools\\}

- **Apache Airflow** - 调度和监控由 ClickHouse 查询组成的复杂 DAG
- **dbt** - 使用基于 SQL 的工作流进行数据转换
- **Prefect/Dagster** - 现代的、基于 Python 的编排框架
- **自定义调度器** - Cron 作业、Kubernetes CronJob 等

**使用外部编排的优势：**

- 完整的编程语言特性
- 更完善的错误处理和重试逻辑
- 与外部系统集成（API、其他数据库）
- 版本控制和测试
- 监控与告警
- 更灵活的调度

## ClickHouse 中预处理语句的替代方案 \\{#alternatives-to-prepared-statements-in-clickhouse\\}

虽然 ClickHouse 不支持传统关系型数据库（RDBMS）中的“预处理语句（prepared statements）”，但它提供了具有相同作用的**查询参数**：通过安全的参数化查询来防止 SQL 注入。

### 语法 \\{#query-parameters-syntax\\}

定义查询参数有两种方式：

#### 方法 1：使用 `SET` \\{#method-1-using-set\\}

<details>
  <summary>示例表和数据</summary>

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

#### 方法 2：使用 CLI 参数 \\{#method-2-using-cli-parameters\\}

```bash
clickhouse-client \
    --param_user_id=12345 \
    --param_start_date='2024-01-01' \
    --param_end_date='2024-01-31' \
    --query="SELECT count() FROM user_events
             WHERE user_id = {user_id: UInt64}
             AND event_date BETWEEN {start_date: Date} AND {end_date: Date}"
```

### 参数语法 \\{#parameter-syntax\\}

参数使用以下语法进行引用：`{parameter_name: DataType}`

- `parameter_name` - 参数名称（不包含 `param_` 前缀）
- `DataType` - 参数要转换成的 ClickHouse 数据类型

### 数据类型示例 \\{#data-type-examples\\}

<details>
<summary>示例所用的表和示例数据</summary>

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
<TabItem value="strings" label="字符串与数字" default>

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
<TabItem value="dates" label="日期与时间">

```sql
SET param_date = '2024-01-15';
SET param_timestamp = '2024-01-15 14:30:00';

SELECT * FROM events
WHERE event_date = {date: Date}
   OR event_timestamp > {timestamp: DateTime};
```

</TabItem>
<TabItem value="arrays" label="数组">

```sql
SET param_ids = [1, 2, 3, 4, 5];

SELECT * FROM products WHERE id IN {ids: Array(UInt32)};
```

</TabItem>
<TabItem value="maps" label="映射">

```sql
SET param_filters = {'target_status': 'active'};

SELECT user_id, status, type FROM accounts
WHERE status = arrayElement(
    mapValues({filters: Map(String, String)}),
    indexOf(mapKeys({filters: Map(String, String)}), 'target_status')
);
```

</TabItem>
<TabItem value="identifiers" label="标识符">

```sql
SET param_table = 'sales_2024';

SELECT count() FROM {table: Identifier};
```

</TabItem>
</Tabs>

<br/>

关于在[语言客户端](/integrations/language-clients)中使用查询参数，请参考相应语言客户端的文档。

### 查询参数的限制 \\{#parameter-syntax\\}

查询参数**不是通用的文本替换机制**。它们有特定的限制：

1. 它们**主要面向 SELECT 语句**——对 SELECT 查询的支持最佳
2. 它们**只能作为标识符或字面量使用**——不能替换任意 SQL 片段
3. 它们对 DDL 的支持**有限**——在 `CREATE TABLE` 中受支持，但在 `ALTER TABLE` 中不受支持

**可以正常工作的用法：**

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

**不支持的内容：**

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

### 安全最佳实践 \\{#data-type-examples\\}

**对所有用户输入一律使用查询参数：**

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

**校验输入类型：**

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

### MySQL 协议预处理语句 \\{#mysql-protocol-prepared-statements\\}

ClickHouse 的 [MySQL 接口](/interfaces/mysql) 对预处理语句（`COM_STMT_PREPARE`、`COM_STMT_EXECUTE`、`COM_STMT_CLOSE`）仅提供有限支持，主要用于兼容诸如 Tableau Online 这类会将查询包装为预处理语句的工具，以便建立连接。

**主要限制：**

* **不支持参数绑定** - 不能使用带绑定参数的 `?` 占位符
* 查询在 `PREPARE` 期间会被存储，但不会被解析
* 实现非常精简，仅用于特定 BI 工具的兼容性场景

**以下示例是不可行的用法：**

```sql
-- This MySQL-style prepared statement with parameters does NOT work in ClickHouse
PREPARE stmt FROM 'SELECT * FROM users WHERE id = ?';
EXECUTE stmt USING @user_id;  -- Parameter binding not supported
```

:::tip
**请改用 ClickHouse 的原生查询参数。** 它们在所有 ClickHouse 接口中都提供完善的参数绑定支持、类型安全以及 SQL 注入防护：

```sql
-- ClickHouse native query parameters (recommended)
SET param_user_id = 12345;
SELECT * FROM users WHERE id = {user_id: UInt64};
```

:::

有关更多详情，请参阅 [MySQL 接口文档](/interfaces/mysql) 和 [关于 MySQL 支持的博客文章](https://clickhouse.com/blog/mysql-support-in-clickhouse-the-journey)。

## 总结 \\{#summary\\}

### ClickHouse 中用于替代存储过程的方案 \\{#summary-stored-procedures\\}

| 传统存储过程模式 | ClickHouse 中的替代方案                                                      |
|--------------------------------------|-----------------------------------------------------------------------------|
| 简单计算和转换 | 用户自定义函数（UDF）                                               |
| 可复用的参数化查询 | 参数化视图                                                         |
| 预计算聚合 | 物化视图                                                          |
| 定时批处理 | 可刷新的物化视图                                              |
| 复杂的多步骤 ETL 流程 | 链式物化视图或外部编排（Python、Airflow、dbt） |
| 带有控制流的业务逻辑 | 应用程序代码                                                            |

### 查询参数的使用 \\{#summary-query-parameters\\}

查询参数可用于：

- 防止 SQL 注入
- 类型安全的参数化查询
- 在应用中进行动态过滤
- 可重用的查询模板

## 相关文档 \\{#related-documentation\\}

- [`CREATE FUNCTION`](/sql-reference/statements/create/function) - 用户定义函数
- [`CREATE VIEW`](/sql-reference/statements/create/view) - 视图，包括参数化视图和物化视图
- [SQL Syntax - Query Parameters](/sql-reference/syntax#defining-and-using-query-parameters) - 参数语法的完整说明
- [Cascading Materialized Views](/guides/developer/cascading-materialized-views) - 高级物化视图模式
- [Executable UDFs](/sql-reference/functions/udf) - 可执行 UDF（外部函数执行）