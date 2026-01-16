---
sidebar_label: 'ストアドプロシージャとクエリパラメータ'
sidebar_position: 19
keywords: ['clickhouse', 'ストアドプロシージャ', 'プリペアドステートメント', 'クエリパラメータ', 'UDF', 'パラメータ化されたビュー']
description: 'ClickHouse におけるストアドプロシージャ、プリペアドステートメント、およびクエリパラメータに関するガイド'
slug: /guides/developer/stored-procedures-and-prepared-statements
title: 'ストアドプロシージャとクエリパラメータ'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ClickHouse におけるストアドプロシージャとクエリパラメータ \\{#stored-procedures-and-query-parameters-in-clickhouse\\}

従来のリレーショナルデータベースを使ってきた方は、ClickHouse にもストアドプロシージャやプリペアドステートメントがあるのか気になっているかもしれません。
このガイドでは、これらの概念に対する ClickHouse の考え方を説明し、推奨される代替手段を紹介します。

## ClickHouse におけるストアドプロシージャの代替手段 \\{#alternatives-to-stored-procedures\\}

ClickHouse は、`IF`/`ELSE` やループなどの制御フローを含む、従来型のストアドプロシージャをサポートしていません。
これは、分析データベースとしての ClickHouse のアーキテクチャに基づいた、意図的な設計上の判断です。
分析データベースでは、多数の単純なクエリを O(n) 回処理するよりも、少数の複雑なクエリとして処理する方が一般に高速であるため、ループは推奨されません。

ClickHouse は次の用途向けに最適化されています:

- **分析ワークロード** - 大規模なデータセットに対する複雑な集約処理
- **バッチ処理** - 大量データを効率的に処理
- **宣言的クエリ** - データの処理方法ではなく、どのデータを取得するかを記述する SQL クエリ

手続き型ロジックを伴うストアドプロシージャは、これらの最適化に反します。その代わりに、ClickHouse は自らの強みと整合する代替手段を提供しています。

### ユーザー定義関数 (UDF) \\{#user-defined-functions\\}

ユーザー定義関数を使うと、制御フローを用いずに再利用可能なロジックをカプセル化できます。ClickHouse は 2 種類のユーザー定義関数をサポートしています。

#### ラムダベースの UDF \\{#lambda-based-udfs\\}

SQL 式とラムダ構文を使って関数を作成します。

<details>
  <summary>サンプルデータ（例で使用）</summary>

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

**制限事項:**

* ループや複雑な制御フローは使用できません
* データの変更（`INSERT`/`UPDATE`/`DELETE`）はできません
* 再帰関数は使用できません

完全な構文については [`CREATE FUNCTION`](/sql-reference/statements/create/function) を参照してください。

#### 実行可能 UDF \\{#executable-udfs\\}

より複雑なロジックには、外部プログラムを呼び出す実行可能 UDF を使用します。

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

実行可能な UDF は、任意の言語（Python、Node.js、Go など）で任意の処理ロジックを実装できます。

詳細については、[実行可能 UDF](/sql-reference/functions/udf) を参照してください。

### パラメーター化ビュー \\{#parameterized-views\\}

パラメーター化ビューは、データセットを返す関数のように振る舞います。
動的フィルタリングを行う再利用可能なクエリに最適です。

<details>
  <summary>例で使用するサンプルデータ</summary>

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

#### 一般的なユースケース \\{#common-use-cases\\}

* 動的な日付範囲によるフィルタリング
* ユーザーごとのデータスライス
* [マルチテナント環境でのデータアクセス](/cloud/bestpractices/multi-tenancy)
* レポートテンプレート
* [データマスキング](/cloud/guides/data-masking)

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

詳しくは、[Parameterized Views](/sql-reference/statements/create/view#parameterized-view) セクションを参照してください。

### マテリアライズドビュー \\{#materialized-views\\}

マテリアライズドビューは、従来はストアドプロシージャで行っていたようなコストの高い集計処理を、事前に計算・集約しておくのに最適です。従来型のデータベースに慣れている場合、マテリアライズドビューは、ソーステーブルにデータが挿入されるタイミングで自動的にデータを変換・集計する **INSERT トリガー** と考えることができます。

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

#### リフレッシュ可能なマテリアライズドビュー \\{#refreshable-materialized-views\\}

スケジュールされたバッチ処理（夜間に実行されるストアドプロシージャなど）の場合：

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

高度なパターンについては、[カスケード型マテリアライズドビュー](/guides/developer/cascading-materialized-views)を参照してください。

### 外部オーケストレーション \\{#external-orchestration\\}

複雑なビジネスロジック、ETL ワークフロー、または複数ステップの処理が必要な場合は、ClickHouse の外側で
言語クライアントを使用してロジックを実装することも可能です。

#### アプリケーションコードを使用する \\{#using-application-code\\}

ここでは、MySQL のストアドプロシージャを、ClickHouse を用いたアプリケーションコードに書き換えた場合の対応関係を、左右の比較で示します。

<Tabs>
  <TabItem value="mysql" label="MySQL ストアドプロシージャ" default>
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

  <TabItem value="ClickHouse" label="ClickHouse アプリケーションのコード">
    :::note クエリパラメータ
    以下の例では、ClickHouseのクエリパラメータを使用しています。
    ClickHouseのクエリパラメータにまだ馴染みがない場合は、[&quot;ClickHouseにおけるプリペアドステートメントの代替手段&quot;](/guides/developer/stored-procedures-and-prepared-statements#alternatives-to-prepared-statements-in-clickhouse)を参照してください。
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

#### 主な違い \\{#key-differences\\}

1. **制御フロー** - MySQL のストアドプロシージャは `IF/ELSE` や `WHILE` ループを使用します。ClickHouse では、このロジックはアプリケーションコード（Python、Java など）側で実装します。
2. **トランザクション** - MySQL は ACID トランザクション向けに `BEGIN/COMMIT/ROLLBACK` をサポートします。ClickHouse は追記専用ワークロード向けに最適化された分析用データベースであり、トランザクション的な更新処理には向きません。
3. **更新処理** - MySQL は `UPDATE` 文を使用します。ClickHouse では、可変データには [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) や [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) と組み合わせて `INSERT` を用いることを推奨します。
4. **変数と状態** - MySQL のストアドプロシージャでは（`DECLARE v_discount` のように）変数を宣言できます。ClickHouse では、状態管理はアプリケーションコード側で行います。
5. **エラー処理** - MySQL は `SIGNAL` や例外ハンドラをサポートします。アプリケーションコードでは、使用言語が備えるネイティブなエラー処理（try/catch）を利用します。

:::tip
**それぞれのアプローチを使う場面:**

- **OLTP ワークロード**（注文、決済、ユーザーアカウント） → ストアドプロシージャ付きの MySQL/PostgreSQL を使用
- **分析ワークロード**（レポート、集計、時系列） → ClickHouse とアプリケーション側でのオーケストレーションを使用
- **ハイブリッドアーキテクチャ** → 両方を使用。OLTP から ClickHouse へトランザクションデータをストリーミングし、分析に利用
:::

#### ワークフローオーケストレーションツールの利用 \\{#using-workflow-orchestration-tools\\}

- **Apache Airflow** - 複雑な ClickHouse クエリの DAG のスケジューリングと監視を実行
- **dbt** - SQL ベースのワークフローでデータを変換
- **Prefect/Dagster** - モダンな Python ベースのオーケストレーション
- **Custom schedulers** - カスタムスケジューラ（Cron ジョブ、Kubernetes CronJob など）

**外部オーケストレーションを利用する利点:**

- プログラミング言語の機能をフルに活用できる
- より優れたエラー処理とリトライロジック
- 外部システム（API、他のデータベース）との連携
- バージョン管理とテスト
- モニタリングとアラート
- より柔軟なスケジューリング

## ClickHouse におけるプリペアドステートメントの代替手段 \\{#alternatives-to-prepared-statements-in-clickhouse\\}

ClickHouse には、RDBMS の意味での従来型の「プリペアドステートメント」はありませんが、同じ目的――SQL インジェクションを防ぐための安全なパラメータ化されたクエリ――を実現する **クエリパラメータ** が提供されています。

### 構文 \\{#query-parameters-syntax\\}

クエリパラメータを指定する方法は 2 通りあります。

#### 方法 1：`SET` を使用する \\{#method-1-using-set\\}

<details>
  <summary>テーブルとデータの例</summary>

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

#### 方法 2：CLI パラメーターを使用する \\{#method-2-using-cli-parameters\\}

```bash
clickhouse-client \
    --param_user_id=12345 \
    --param_start_date='2024-01-01' \
    --param_end_date='2024-01-31' \
    --query="SELECT count() FROM user_events
             WHERE user_id = {user_id: UInt64}
             AND event_date BETWEEN {start_date: Date} AND {end_date: Date}"
```

### パラメータ構文 \\{#parameter-syntax\\}

パラメータは次の構文で指定します: `{parameter_name: DataType}`

- `parameter_name` - パラメータ名（`param_` プレフィックスを除いた部分）
- `DataType` - パラメータをキャストする ClickHouse のデータ型

### データ型の例 \\{#data-type-examples\\}

<details>
<summary>例で使用するテーブルとサンプルデータ</summary>

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
<TabItem value="strings" label="文字列と数値" default>

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
<TabItem value="dates" label="日付と時刻">

```sql
SET param_date = '2024-01-15';
SET param_timestamp = '2024-01-15 14:30:00';

SELECT * FROM events
WHERE event_date = {date: Date}
   OR event_timestamp > {timestamp: DateTime};
```

</TabItem>
<TabItem value="arrays" label="配列">

```sql
SET param_ids = [1, 2, 3, 4, 5];

SELECT * FROM products WHERE id IN {ids: Array(UInt32)};
```

</TabItem>
<TabItem value="maps" label="Map">

```sql
SET param_filters = {'target_status': 'active'};

SELECT user_id, status, type FROM accounts
WHERE status = arrayElement(
    mapValues({filters: Map(String, String)}),
    indexOf(mapKeys({filters: Map(String, String)}), 'target_status')
);
```

</TabItem>
<TabItem value="identifiers" label="Identifier">

```sql
SET param_table = 'sales_2024';

SELECT count() FROM {table: Identifier};
```

</TabItem>
</Tabs>

<br/>

[言語クライアント](/integrations/language-clients)でのクエリパラメータの使用方法については、利用したい特定の言語クライアントのドキュメントを参照してください。

### クエリパラメータの制約事項 \\{#parameter-syntax\\}

クエリパラメータは**汎用的なテキスト置換ではありません**。次のような特有の制約があります。

1. **主に SELECT 文向けに設計されています** - 最も手厚くサポートされているのは SELECT クエリです
2. **識別子またはリテラルとして動作します** - 任意の SQL フラグメントを置き換えることはできません
3. **DDL のサポートは限定的です** - `CREATE TABLE` ではサポートされていますが、`ALTER TABLE` ではサポートされていません

**動作するケース:**

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

**動作しないもの:**

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

### セキュリティのベストプラクティス \\{#data-type-examples\\}

**ユーザーからの入力には必ずクエリパラメータを使用すること：**

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

**入力の型を検証する：**

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

### MySQL プロトコルのプリペアドステートメント \\{#mysql-protocol-prepared-statements\\}

ClickHouse の [MySQL インターフェイス](/interfaces/mysql) は、プリペアドステートメント（`COM_STMT_PREPARE`、`COM_STMT_EXECUTE`、`COM_STMT_CLOSE`）に対して最小限のサポートのみを提供します。これは主に、クエリをプリペアドステートメントでラップする Tableau Online のようなツールとの接続性を確保するためのものです。

**主な制限事項:**

* **パラメータのバインドはサポートされません** - バインドパラメータ付きの `?` プレースホルダは使用できません
* クエリは `PREPARE` 実行時に保存されますが、解析は行われません
* 実装は最小限で、特定の BI ツールとの互換性確保のみを目的としています

**動作しない例:**

```sql
-- This MySQL-style prepared statement with parameters does NOT work in ClickHouse
PREPARE stmt FROM 'SELECT * FROM users WHERE id = ?';
EXECUTE stmt USING @user_id;  -- Parameter binding not supported
```

:::tip
**代わりに ClickHouse ネイティブのクエリパラメータを使用してください。** これらは、すべての ClickHouse インターフェースで、完全なパラメータバインディングのサポート、型安全性、SQL インジェクションの防止を提供します。

```sql
-- ClickHouse native query parameters (recommended)
SET param_user_id = 12345;
SELECT * FROM users WHERE id = {user_id: UInt64};
```

:::

詳細については、[MySQL インターフェイスのドキュメント](/interfaces/mysql) と [MySQL サポートに関するブログ記事](https://clickhouse.com/blog/mysql-support-in-clickhouse-the-journey) を参照してください。

## 概要 \\{#summary\\}

### ストアドプロシージャに対する ClickHouse の代替手段 \\{#summary-stored-procedures\\}

| 従来のストアドプロシージャのパターン | ClickHouse の代替手段                                                      |
|--------------------------------------|-----------------------------------------------------------------------------|
| 単純な計算と変換処理 | ユーザー定義関数 (UDF)                                               |
| 再利用可能なパラメータ化クエリ | パラメータ化ビュー                                                         |
| 事前計算された集計 | マテリアライズドビュー                                                          |
| スケジュールされたバッチ処理 | リフレッシュ可能なマテリアライズドビュー                                              |
| 複雑な多段階の ETL | チェーン構成のマテリアライズドビューまたは外部オーケストレーション (Python, Airflow, dbt) |
| 制御フローを伴うビジネスロジック | アプリケーションコード                                                            |

### クエリパラメータの利用 \\{#summary-query-parameters\\}

クエリパラメータは次の用途に利用できます:

- SQLインジェクションの防止
- 型安全なパラメータ化されたクエリ
- アプリケーションでの動的なフィルタリング
- 再利用可能なクエリテンプレート

## 関連ドキュメント \\{#related-documentation\\}

- [`CREATE FUNCTION`](/sql-reference/statements/create/function) - ユーザー定義関数
- [`CREATE VIEW`](/sql-reference/statements/create/view) - パラメータ化ビューおよびマテリアライズドビューを含むビュー
- [SQL 構文 - クエリパラメータ](/sql-reference/syntax#defining-and-using-query-parameters) - パラメータ構文の完全なリファレンス
- [カスケード型マテリアライズドビュー](/guides/developer/cascading-materialized-views) - 高度なマテリアライズドビューのパターン
- [実行可能な UDF](/sql-reference/functions/udf) - 外部関数の実行