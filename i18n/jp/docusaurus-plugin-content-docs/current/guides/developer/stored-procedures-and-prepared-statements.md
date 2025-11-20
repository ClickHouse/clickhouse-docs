---
sidebar_label: 'ストアドプロシージャとクエリパラメータ'
sidebar_position: 19
keywords: ['clickhouse', 'stored procedures', 'prepared statements', 'query parameters', 'UDF', 'parameterized views']
description: 'ClickHouseにおけるストアドプロシージャ、プリペアドステートメント、およびクエリパラメータのガイド'
slug: /guides/developer/stored-procedures-and-prepared-statements
title: 'ストアドプロシージャとクエリパラメータ'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# ClickHouseにおけるストアドプロシージャとクエリパラメータ

従来のリレーショナルデータベースを使用していた方は、ClickHouseでストアドプロシージャやプリペアドステートメントを探しているかもしれません。
本ガイドでは、これらの概念に対するClickHouseのアプローチを説明し、推奨される代替手段を提供します。



## ClickHouseにおけるストアドプロシージャの代替手段 {#alternatives-to-stored-procedures}

ClickHouseは、制御フロー論理(`IF`/`ELSE`、ループなど)を持つ従来のストアドプロシージャをサポートしていません。
これは、分析データベースとしてのClickHouseのアーキテクチャに基づく意図的な設計上の決定です。
分析データベースではループは推奨されません。なぜなら、O(n)個の単純なクエリを処理することは、通常、より少数の複雑なクエリを処理するよりも遅いためです。

ClickHouseは以下のために最適化されています:

- **分析ワークロード** - 大規模データセットに対する複雑な集計
- **バッチ処理** - 大量のデータを効率的に処理
- **宣言的クエリ** - データの処理方法ではなく、取得するデータを記述するSQLクエリ

手続き型ロジックを持つストアドプロシージャは、これらの最適化に反します。代わりに、ClickHouseはその強みに沿った代替手段を提供しています。

### ユーザー定義関数(UDF) {#user-defined-functions}

ユーザー定義関数を使用すると、制御フローなしで再利用可能なロジックをカプセル化できます。ClickHouseは2つのタイプをサポートしています:

#### ラムダベースのUDF {#lambda-based-udfs}

SQL式とラムダ構文を使用して関数を作成します:

<details>
<summary>例で使用するサンプルデータ</summary>

```sql
-- productsテーブルを作成
CREATE TABLE products (
    product_id UInt32,
    product_name String,
    price Decimal(10, 2)
)
ENGINE = MergeTree()
ORDER BY product_id;

-- サンプルデータを挿入
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
-- 単純な計算関数
CREATE FUNCTION calculate_tax AS (price, rate) -> price * rate;

SELECT
    product_name,
    price,
    calculate_tax(price, 0.08) AS tax
FROM products;
```

```sql
-- if()を使用した条件ロジック
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
-- 文字列操作
CREATE FUNCTION format_phone AS (phone) ->
    concat('(', substring(phone, 1, 3), ') ',
           substring(phone, 4, 3), '-',
           substring(phone, 7, 4));

SELECT format_phone('5551234567');
-- 結果: (555) 123-4567
```

**制限事項:**

- ループや複雑な制御フローは使用不可
- データの変更(`INSERT`/`UPDATE`/`DELETE`)は不可
- 再帰関数は許可されていません

完全な構文については[`CREATE FUNCTION`](/sql-reference/statements/create/function)を参照してください。

#### 実行可能UDF {#executable-udfs}

より複雑なロジックには、外部プログラムを呼び出す実行可能UDFを使用します:

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
-- 実行可能UDFを使用
SELECT
    review_text,
    sentiment_score(review_text) AS score
FROM customer_reviews;
```

実行可能UDFは、任意の言語(Python、Node.js、Goなど)で任意のロジックを実装できます。

詳細については[実行可能UDF](/sql-reference/functions/udf)を参照してください。

### パラメータ化ビュー {#parameterized-views}

パラメータ化ビューは、データセットを返す関数のように動作します。
動的フィルタリングを伴う再利用可能なクエリに最適です:

<details>
<summary>例で使用するサンプルデータ</summary>

```sql
-- salesテーブルを作成
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

```


-- サンプルデータを挿入
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

````

</details>
```sql
-- パラメータ化ビューを作成
CREATE VIEW sales_by_date AS
SELECT
    date,
    product_id,
    sum(quantity) AS total_quantity,
    sum(revenue) AS total_revenue
FROM sales
WHERE date BETWEEN {start_date:Date} AND {end_date:Date}
GROUP BY date, product_id;
````

```sql
-- パラメータを指定してビューをクエリ
SELECT *
FROM sales_by_date(start_date='2024-01-01', end_date='2024-01-31')
WHERE product_id = 12345;
```

#### 一般的なユースケース {#common-use-cases}

- 動的な日付範囲フィルタリング
- ユーザー固有のデータスライシング
- [マルチテナントデータアクセス](/cloud/bestpractices/multi-tenancy)
- レポートテンプレート
- [データマスキング](/cloud/guides/data-masking)

```sql
-- より複雑なパラメータ化ビュー
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

-- 使用例
SELECT * FROM top_products_by_category(
    category='Electronics',
    min_date='2024-01-01',
    top_n=10
);
```

詳細については、[パラメータ化ビュー](/sql-reference/statements/create/view#parameterized-view)のセクションを参照してください。

### マテリアライズドビュー {#materialized-views}

マテリアライズドビューは、従来ストアドプロシージャで行われていた高コストな集計処理を事前計算するのに最適です。従来のデータベースから移行する場合は、マテリアライズドビューをソーステーブルへのデータ挿入時に自動的にデータを変換・集計する**INSERTトリガー**として考えるとよいでしょう。

```sql
-- ソーステーブル
CREATE TABLE page_views (
    user_id UInt64,
    page String,
    timestamp DateTime,
    session_id String
)
ENGINE = MergeTree()
ORDER BY (user_id, timestamp);

-- 集計統計を保持するマテリアライズドビュー
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

```


-- ソーステーブルにサンプルデータを挿入
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

-- 事前集計されたデータをクエリ
SELECT
user_id,
sum(page_views) AS total_views,
sum(sessions) AS total_sessions
FROM daily_user_stats
WHERE date BETWEEN '2024-01-01' AND '2024-01-31'
GROUP BY user_id;

````

#### リフレッシュ可能なマテリアライズドビュー {#refreshable-materialized-views}

スケジュールされたバッチ処理（夜間ストアドプロシージャなど）の場合：

```sql
-- 毎日午前2時に自動的にリフレッシュ
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

-- クエリは常に最新のデータを保持
SELECT * FROM monthly_sales_report
WHERE month = toStartOfMonth(today());
````

高度なパターンについては、[カスケードマテリアライズドビュー](/guides/developer/cascading-materialized-views)を参照してください。

### 外部オーケストレーション {#external-orchestration}

複雑なビジネスロジック、ETLワークフロー、または複数ステップのプロセスの場合、言語クライアントを使用してClickHouse外部でロジックを実装することが可能です。

#### アプリケーションコードの使用 {#using-application-code}

MySQLストアドプロシージャがClickHouseのアプリケーションコードにどのように変換されるかを示す比較例を以下に示します：

<Tabs>
<TabItem value="mysql" label="MySQLストアドプロシージャ" default>

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

    -- トランザクション開始
    START TRANSACTION;

    -- 顧客情報を取得
    SELECT tier, total_orders
    INTO v_customer_tier, v_previous_orders
    FROM customers
    WHERE customer_id = p_customer_id;

    -- ティアに基づいて割引を計算
    IF v_customer_tier = 'gold' THEN
        SET v_discount = p_order_total * 0.15;
    ELSEIF v_customer_tier = 'silver' THEN
        SET v_discount = p_order_total * 0.10;
    ELSE
        SET v_discount = 0;
    END IF;

    -- 注文レコードを挿入
    INSERT INTO orders (order_id, customer_id, order_total, discount, final_amount)
    VALUES (p_order_id, p_customer_id, p_order_total, v_discount,
            p_order_total - v_discount);

    -- 顧客統計を更新
    UPDATE customers
    SET total_orders = total_orders + 1,
        lifetime_value = lifetime_value + (p_order_total - v_discount),
        last_order_date = NOW()
    WHERE customer_id = p_customer_id;

    -- ロイヤルティポイントを計算（1ドルあたり1ポイント）
    SET p_loyalty_points = FLOOR(p_order_total - v_discount);

```


-- ロイヤルティポイントトランザクションを挿入
INSERT INTO loyalty&#95;points (customer&#95;id, points, transaction&#95;date, description)
VALUES (p&#95;customer&#95;id, p&#95;loyalty&#95;points, NOW(),
CONCAT(&#39;Order #&#39;, p&#95;order&#95;id));

-- 顧客のアップグレード条件を確認
IF v&#95;previous&#95;orders + 1 &gt;= 10 AND v&#95;customer&#95;tier = &#39;bronze&#39; THEN
UPDATE customers SET tier = &#39;silver&#39; WHERE customer&#95;id = p&#95;customer&#95;id;
SET p&#95;status = &#39;ORDER&#95;COMPLETE&#95;TIER&#95;UPGRADED&#95;SILVER&#39;;
ELSEIF v&#95;previous&#95;orders + 1 &gt;= 50 AND v&#95;customer&#95;tier = &#39;silver&#39; THEN
UPDATE customers SET tier = &#39;gold&#39; WHERE customer&#95;id = p&#95;customer&#95;id;
SET p&#95;status = &#39;ORDER&#95;COMPLETE&#95;TIER&#95;UPGRADED&#95;GOLD&#39;;
ELSE
SET p&#95;status = &#39;ORDER&#95;COMPLETE&#39;;
END IF;

COMMIT;
END$$

DELIMITER ;

-- ストアドプロシージャを呼び出す
CALL process&#95;order(12345, 5678, 250.00, @status, @points);
SELECT @status, @points;

```

</TabItem>
<TabItem value="clickhouse" label="ClickHouseアプリケーションコード">

:::note クエリパラメータ
以下の例では、ClickHouseのクエリパラメータを使用しています。
ClickHouseのクエリパラメータにまだ慣れていない場合は、["ClickHouseにおけるプリペアドステートメントの代替手段"](/guides/developer/stored-procedures-and-prepared-statements#alternatives-to-prepared-statements-in-clickhouse)を先にご参照ください。
:::
```


```python
# clickhouse-connectを使用したPythonの例
import clickhouse_connect
from datetime import datetime
from decimal import Decimal

client = clickhouse_connect.get_client(host='localhost')

def process_order(order_id: int, customer_id: int, order_total: Decimal) -> tuple[str, int]:
    """
    ストアドプロシージャに相当するビジネスロジックを使用して注文を処理します。
    戻り値: (status_message, loyalty_points)

    注意: ClickHouseは分析処理に最適化されており、OLTPトランザクションには適していません。
    トランザクション処理にはOLTPデータベース(PostgreSQL、MySQL)を使用し、
    分析データをClickHouseに同期してレポート作成を行ってください。
    """

    # ステップ1: 顧客情報を取得
    result = client.query(
        """
        SELECT tier, total_orders
        FROM customers
        WHERE customer_id = {cid: UInt32}
        """,
        parameters={'cid': customer_id}
    )

    if not result.result_rows:
        raise ValueError(f"顧客 {customer_id} が見つかりません")

    customer_tier, previous_orders = result.result_rows[0]

    # ステップ2: ティアに基づいて割引を計算(Pythonのビジネスロジック)
    discount_rates = {'gold': 0.15, 'silver': 0.10, 'bronze': 0.0}
    discount = order_total * Decimal(str(discount_rates.get(customer_tier, 0.0)))
    final_amount = order_total - discount

    # ステップ3: 注文レコードを挿入
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

    # ステップ4: 新しい顧客統計を計算
    new_order_count = previous_orders + 1

    # 分析データベースでは、UPDATEよりもINSERTを優先
    # ReplacingMergeTreeパターンを使用
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

    # ステップ5: ロイヤルティポイントを計算して記録
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

    # ステップ6: ティアのアップグレードを確認(Pythonのビジネスロジック)
    status = 'ORDER_COMPLETE'

    if new_order_count >= 10 and customer_tier == 'bronze':
        # シルバーにアップグレード
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
        # ゴールドにアップグレード
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
```


# 関数の使用

status, points = process&#95;order(
order&#95;id=12345,
customer&#95;id=5678,
order&#95;total=Decimal(&#39;250.00&#39;)
)

print(f&quot;Status: {status}, Loyalty Points: {points}&quot;)

```

</TabItem>
</Tabs>

<br/>

#### 主な違い {#key-differences}

1. **制御フロー** - MySQLストアドプロシージャは`IF/ELSE`、`WHILE`ループを使用します。ClickHouseでは、このロジックをアプリケーションコード（Python、Javaなど）で実装します
2. **トランザクション** - MySQLはACIDトランザクションのために`BEGIN/COMMIT/ROLLBACK`をサポートしています。ClickHouseは追記専用ワークロードに最適化された分析データベースであり、トランザクション更新には対応していません
3. **更新** - MySQLは`UPDATE`文を使用します。ClickHouseでは、可変データに対して[ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)または[CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)と`INSERT`を組み合わせて使用することを推奨します
4. **変数と状態** - MySQLストアドプロシージャは変数を宣言できます（`DECLARE v_discount`）。ClickHouseでは、アプリケーションコードで状態を管理します
5. **エラー処理** - MySQLは`SIGNAL`と例外ハンドラをサポートしています。アプリケーションコードでは、使用する言語のネイティブなエラー処理（try/catch）を使用します

:::tip
**各アプローチの使い分け:**
- **OLTPワークロード**（注文、支払い、ユーザーアカウント）→ ストアドプロシージャを使用したMySQL/PostgreSQLを使用
- **分析ワークロード**（レポート、集計、時系列）→ アプリケーションオーケストレーションを使用したClickHouseを使用
- **ハイブリッドアーキテクチャ** → 両方を使用！OLTPからClickHouseへトランザクションデータをストリーミングして分析を実行
:::

#### ワークフローオーケストレーションツールの使用 {#using-workflow-orchestration-tools}

- **Apache Airflow** - ClickHouseクエリの複雑なDAGをスケジュールおよび監視
- **dbt** - SQLベースのワークフローでデータを変換
- **Prefect/Dagster** - モダンなPythonベースのオーケストレーション
- **カスタムスケジューラ** - Cronジョブ、Kubernetes CronJobsなど

**外部オーケストレーションの利点:**
- 完全なプログラミング言語機能
- より優れたエラー処理とリトライロジック
- 外部システムとの統合（API、他のデータベース）
- バージョン管理とテスト
- 監視とアラート
- より柔軟なスケジューリング
```


## ClickHouseにおけるプリペアドステートメントの代替手段 {#alternatives-to-prepared-statements-in-clickhouse}

ClickHouseはRDBMSの意味での従来の「プリペアドステートメント」を持ちませんが、同じ目的を果たす**クエリパラメータ**を提供しています。これにより、SQLインジェクションを防ぐ安全なパラメータ化されたクエリを実現できます。

### 構文 {#query-parameters-syntax}

クエリパラメータを定義する方法は2つあります:

#### 方法1: `SET`を使用する {#method-1-using-set}

<details>
<summary>サンプルテーブルとデータ</summary>

```sql
-- user_eventsテーブルを作成（ClickHouse構文）
CREATE TABLE user_events (
    event_id UInt32,
    user_id UInt64,
    event_name String,
    event_date Date,
    event_timestamp DateTime
) ENGINE = MergeTree()
ORDER BY (user_id, event_date);

-- 複数のユーザーとイベントのサンプルデータを挿入
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

#### 方法2: CLIパラメータを使用する {#method-2-using-cli-parameters}

```bash
clickhouse-client \
    --param_user_id=12345 \
    --param_start_date='2024-01-01' \
    --param_end_date='2024-01-31' \
    --query="SELECT count() FROM user_events
             WHERE user_id = {user_id: UInt64}
             AND event_date BETWEEN {start_date: Date} AND {end_date: Date}"
```

### パラメータ構文 {#parameter-syntax}

パラメータは次の形式で参照します: `{parameter_name: DataType}`


- `parameter_name` - パラメータ名（`param_` プレフィックスを除く）
- `DataType` - パラメータをキャストするClickHouseのデータ型

### データ型の例 {#data-type-examples}

<details>
<summary>例で使用するテーブルとサンプルデータ</summary>

```sql
-- 1. 文字列と数値のテスト用テーブルを作成
CREATE TABLE IF NOT EXISTS users (
    name String,
    age UInt8,
    salary Float64
) ENGINE = Memory;

INSERT INTO users VALUES
    ('John Doe', 25, 75000.50),
    ('Jane Smith', 30, 85000.75),
    ('Peter Jones', 20, 50000.00);

-- 2. 日付とタイムスタンプのテスト用テーブルを作成
CREATE TABLE IF NOT EXISTS events (
    event_date Date,
    event_timestamp DateTime
) ENGINE = Memory;

INSERT INTO events VALUES
    ('2024-01-15', '2024-01-15 14:30:00'),
    ('2024-01-15', '2024-01-15 15:00:00'),
    ('2024-01-16', '2024-01-16 10:00:00');

-- 3. 配列のテスト用テーブルを作成
CREATE TABLE IF NOT EXISTS products (
    id UInt32,
    name String
) ENGINE = Memory;

INSERT INTO products VALUES (1, 'Laptop'), (2, 'Monitor'), (3, 'Mouse'), (4, 'Keyboard');

-- 4. Map（構造体のような）のテスト用テーブルを作成
CREATE TABLE IF NOT EXISTS accounts (
    user_id UInt32,
    status String,
    type String
) ENGINE = Memory;

INSERT INTO accounts VALUES
    (101, 'active', 'premium'),
    (102, 'inactive', 'basic'),
    (103, 'active', 'basic');

-- 5. 識別子のテスト用テーブルを作成
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
<TabItem value="identifiers" label="識別子">

```sql
SET param_table = 'sales_2024';

SELECT count() FROM {table: Identifier};
```

</TabItem>
</Tabs>

<br />
[言語クライアント](/integrations/language-clients)でクエリパラメータを使用する場合は、使用する言語クライアントのドキュメントを参照してください。

### クエリパラメータの制限事項 {#limitations-of-query-parameters}

クエリパラメータは**一般的なテキスト置換ではありません**。以下の特定の制限があります：

1. **主にSELECT文を対象としています** - SELECTクエリで最も適切にサポートされます
2. **識別子またはリテラルとして機能します** - 任意のSQLフラグメントを置換することはできません
3. **DDLサポートは限定的です** - `CREATE TABLE`ではサポートされますが、`ALTER TABLE`ではサポートされません

**動作するもの：**

```sql
-- ✓ WHERE句内の値
SELECT * FROM users WHERE id = {user_id: UInt64};

-- ✓ テーブル名/データベース名
SELECT * FROM {db: Identifier}.{table: Identifier};

-- ✓ IN句内の値
SELECT * FROM products WHERE id IN {ids: Array(UInt32)};

```


-- ✓ CREATE TABLE
CREATE TABLE {table_name: Identifier} (id UInt64, name String) ENGINE = MergeTree() ORDER BY id;

````

**動作しないもの:**
```sql
-- ✗ SELECT内のカラム名（Identifierは慎重に使用）
SELECT {column: Identifier} FROM users;  -- サポートは限定的

-- ✗ 任意のSQLフラグメント
SELECT * FROM users {where_clause: String};  -- サポート対象外

-- ✗ ALTER TABLE文
ALTER TABLE {table: Identifier} ADD COLUMN new_col String;  -- サポート対象外

-- ✗ 複数のステートメント
{statements: String};  -- サポート対象外
````

### セキュリティのベストプラクティス {#security-best-practices}

**ユーザー入力には必ずクエリパラメータを使用してください:**


```python
# ✓ 安全 - パラメータを使用
user_input = request.get('user_id')
result = client.query(
    "SELECT * FROM orders WHERE user_id = {uid: UInt64}",
    parameters={'uid': user_input}
)
```


# ✗ 危険 - SQLインジェクションのリスク！

user_input = request.get('user_id')
result = client.query(f"SELECT \* FROM orders WHERE user_id = {user_input}")

````

**入力型の検証:**

```python
def get_user_orders(user_id: int, start_date: str):
    # クエリ実行前に型を検証
    if not isinstance(user_id, int) or user_id <= 0:
        raise ValueError("Invalid user_id")

    # パラメータで型安全性を確保
    return client.query(
        """
        SELECT * FROM orders
        WHERE user_id = {uid: UInt64}
            AND order_date >= {start: Date}
        """,
        parameters={'uid': user_id, 'start': start_date}
    )
````

### MySQLプロトコルのプリペアドステートメント {#mysql-protocol-prepared-statements}

ClickHouseの[MySQLインターフェース](/interfaces/mysql)は、プリペアドステートメント（`COM_STMT_PREPARE`、`COM_STMT_EXECUTE`、`COM_STMT_CLOSE`）に対する最小限のサポートを提供しています。これは主に、クエリをプリペアドステートメントでラップするTableau Onlineなどのツールとの接続を可能にするためのものです。

**主な制限事項:**

- **パラメータバインディングには非対応** - バインドパラメータと共に`?`プレースホルダーを使用することはできません
- クエリは保存されますが、`PREPARE`時には解析されません
- 実装は最小限であり、特定のBIツールとの互換性を目的として設計されています

**動作しない例:**

```sql
-- このパラメータ付きMySQLスタイルのプリペアドステートメントはClickHouseでは動作しません
PREPARE stmt FROM 'SELECT * FROM users WHERE id = ?';
EXECUTE stmt USING @user_id;  -- パラメータバインディングには非対応
```

:::tip
**代わりにClickHouseのネイティブクエリパラメータを使用してください。** すべてのClickHouseインターフェースにおいて、完全なパラメータバインディングサポート、型安全性、SQLインジェクション防止を提供します:

```sql
-- ClickHouseネイティブクエリパラメータ（推奨）
SET param_user_id = 12345;
SELECT * FROM users WHERE id = {user_id: UInt64};
```

:::

詳細については、[MySQLインターフェースのドキュメント](/interfaces/mysql)および[MySQLサポートに関するブログ記事](https://clickhouse.com/blog/mysql-support-in-clickhouse-the-journey)を参照してください。


## まとめ {#summary}

### ストアドプロシージャに対するClickHouseの代替手段 {#summary-stored-procedures}

| 従来のストアドプロシージャパターン | ClickHouseの代替手段                                                      |
| --------------------------------------- | --------------------------------------------------------------------------- |
| 単純な計算と変換 | ユーザー定義関数（UDF）                                               |
| 再利用可能なパラメータ化クエリ          | パラメータ化ビュー                                                         |
| 事前計算済み集計               | マテリアライズドビュー                                                          |
| スケジュール実行されるバッチ処理              | リフレッシュ可能なマテリアライズドビュー                                              |
| 複雑な多段階ETL                  | 連鎖マテリアライズドビューまたは外部オーケストレーション（Python、Airflow、dbt） |
| 制御フローを含むビジネスロジック        | アプリケーションコード                                                            |

### クエリパラメータの使用 {#summary-query-parameters}

クエリパラメータは以下の用途に使用できます：

- SQLインジェクションの防止
- 型安全性を持つパラメータ化クエリ
- アプリケーションでの動的フィルタリング
- 再利用可能なクエリテンプレート


## 関連ドキュメント {#related-documentation}

- [`CREATE FUNCTION`](/sql-reference/statements/create/function) - ユーザー定義関数
- [`CREATE VIEW`](/sql-reference/statements/create/view) - ビュー（パラメータ化ビューおよびマテリアライズドビューを含む）
- [SQL構文 - クエリパラメータ](/sql-reference/syntax#defining-and-using-query-parameters) - パラメータ構文の完全なリファレンス
- [カスケードマテリアライズドビュー](/guides/developer/cascading-materialized-views) - マテリアライズドビューの高度なパターン
- [実行可能UDF](/sql-reference/functions/udf) - 外部関数の実行
