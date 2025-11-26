---
sidebar_label: 'Хранимые процедуры и параметры запросов'
sidebar_position: 19
keywords: ['clickhouse', 'хранимые процедуры', 'подготовленные операторы', 'параметры запросов', 'UDF', 'параметризованные представления']
description: 'Руководство по хранимым процедурам, подготовленным операторам и параметрам запросов в ClickHouse'
slug: /guides/developer/stored-procedures-and-prepared-statements
title: 'Хранимые процедуры и параметры запросов'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Хранимые процедуры и параметры запросов в ClickHouse

Если вы привыкли работать с традиционными реляционными СУБД, вы можете искать в ClickHouse хранимые процедуры и подготовленные выражения.
Это руководство объясняет, как ClickHouse относится к этим концепциям, и предлагает рекомендуемые альтернативы.



## Альтернативы хранимым процедурам в ClickHouse {#alternatives-to-stored-procedures}

ClickHouse не поддерживает традиционные хранимые процедуры с логикой управления потоком выполнения (`IF`/`ELSE`, циклы и т. д.).
Это намеренное архитектурное решение, обусловленное природой ClickHouse как аналитической базы данных.
Циклы не рекомендуются для аналитических баз данных, поскольку обработка O(n) простых запросов обычно медленнее, чем обработка меньшего количества сложных запросов.

ClickHouse оптимизирован для:

- **Аналитических нагрузок** — сложные агрегации больших наборов данных
- **Пакетной обработки** — эффективная обработка больших объёмов данных
- **Декларативных запросов** — SQL-запросы, описывающие, какие данные получить, а не как их обрабатывать

Хранимые процедуры с процедурной логикой противоречат этим оптимизациям. Вместо этого ClickHouse предоставляет альтернативы, соответствующие его сильным сторонам.

### Пользовательские функции (UDF) {#user-defined-functions}

Пользовательские функции позволяют инкапсулировать повторно используемую логику без управления потоком выполнения. ClickHouse поддерживает два типа:

#### UDF на основе лямбда-выражений {#lambda-based-udfs}

Создавайте функции с использованием SQL-выражений и синтаксиса лямбда-выражений:

<details>
<summary>Примеры данных</summary>

```sql
-- Создание таблицы products
CREATE TABLE products (
    product_id UInt32,
    product_name String,
    price Decimal(10, 2)
)
ENGINE = MergeTree()
ORDER BY product_id;

-- Вставка примеров данных
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
-- Простая функция вычисления
CREATE FUNCTION calculate_tax AS (price, rate) -> price * rate;

SELECT
    product_name,
    price,
    calculate_tax(price, 0.08) AS tax
FROM products;
```

```sql
-- Условная логика с использованием if()
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
-- Манипуляция строками
CREATE FUNCTION format_phone AS (phone) ->
    concat('(', substring(phone, 1, 3), ') ',
           substring(phone, 4, 3), '-',
           substring(phone, 7, 4));

SELECT format_phone('5551234567');
-- Результат: (555) 123-4567
```

**Ограничения:**

- Отсутствие циклов или сложной логики управления потоком
- Невозможность изменения данных (`INSERT`/`UPDATE`/`DELETE`)
- Рекурсивные функции не допускаются

См. [`CREATE FUNCTION`](/sql-reference/statements/create/function) для полного синтаксиса.

#### Исполняемые UDF {#executable-udfs}

Для более сложной логики используйте исполняемые UDF, которые вызывают внешние программы:

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
-- Использование исполняемой UDF
SELECT
    review_text,
    sentiment_score(review_text) AS score
FROM customer_reviews;
```

Исполняемые UDF могут реализовывать произвольную логику на любом языке (Python, Node.js, Go и т. д.).

См. [Исполняемые UDF](/sql-reference/functions/udf) для подробностей.

### Параметризованные представления {#parameterized-views}

Параметризованные представления работают как функции, возвращающие наборы данных.
Они идеально подходят для повторно используемых запросов с динамической фильтрацией:

<details>
<summary>Sample data for example</summary>

```sql
-- Создание таблицы sales
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


-- Вставим пример данных
INSERT INTO sales VALUES
(&#39;2024-01-05&#39;, 12345, &#39;Laptop Pro&#39;, &#39;Electronics&#39;, 2, 1799.98, 1799.98),
(&#39;2024-01-06&#39;, 12345, &#39;Laptop Pro&#39;, &#39;Electronics&#39;, 1, 899.99, 899.99),
(&#39;2024-01-10&#39;, 12346, &#39;Wireless Mouse&#39;, &#39;Electronics&#39;, 5, 124.95, 124.95),
(&#39;2024-01-15&#39;, 12347, &#39;USB-C Cable&#39;, &#39;Accessories&#39;, 10, 125.00, 125.00),
(&#39;2024-01-20&#39;, 12345, &#39;Laptop Pro&#39;, &#39;Electronics&#39;, 3, 2699.97, 2699.97),
(&#39;2024-01-25&#39;, 12348, &#39;Monitor 4K&#39;, &#39;Electronics&#39;, 2, 598.00, 598.00),
(&#39;2024-02-01&#39;, 12345, &#39;Laptop Pro&#39;, &#39;Electronics&#39;, 1, 899.99, 899.99),
(&#39;2024-02-05&#39;, 12349, &#39;Keyboard Mechanical&#39;, &#39;Accessories&#39;, 4, 319.96, 319.96),
(&#39;2024-02-10&#39;, 12346, &#39;Wireless Mouse&#39;, &#39;Electronics&#39;, 8, 199.92, 199.92),
(&#39;2024-02-15&#39;, 12350, &#39;Webcam HD&#39;, &#39;Electronics&#39;, 3, 164.85, 164.85);

````

</details>
```sql
-- Создать параметризованное представление
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
-- Запросить представление с параметрами
SELECT *
FROM sales_by_date(start_date='2024-01-01', end_date='2024-01-31')
WHERE product_id = 12345;
```

#### Распространённые сценарии использования

* Динамическая фильтрация по диапазону дат
* Пользовательские срезы данных
* [Доступ к данным в многоклиентской (multi-tenant) среде](/cloud/bestpractices/multi-tenancy)
* Шаблоны отчётов
* [Маскирование данных](/cloud/guides/data-masking)

```sql
-- Более сложное параметризованное представление
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

-- Использование
SELECT * FROM top_products_by_category(
    category='Electronics',
    min_date='2024-01-01',
    top_n=10
);
```

См. в разделе [Parameterized Views](/sql-reference/statements/create/view#parameterized-view) для получения дополнительной информации.

### Материализованные представления

Материализованные представления идеально подходят для предварительного вычисления ресурсоёмких агрегаций, которые традиционно выполнялись бы в хранимых процедурах. Если вы привыкли к традиционным базам данных, представляйте материализованное представление как **INSERT-триггер**, который автоматически трансформирует и агрегирует данные при их вставке в исходную таблицу:

```sql
-- Исходная таблица
CREATE TABLE page_views (
    user_id UInt64,
    page String,
    timestamp DateTime,
    session_id String
)
ENGINE = MergeTree()
ORDER BY (user_id, timestamp);

-- Материализованное представление, которое хранит агрегированную статистику
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


-- Вставка примеров данных в исходную таблицу
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

-- Запрос предагрегированных данных
SELECT
user_id,
sum(page_views) AS total_views,
sum(sessions) AS total_sessions
FROM daily_user_stats
WHERE date BETWEEN '2024-01-01' AND '2024-01-31'
GROUP BY user_id;

````

#### Обновляемые материализованные представления {#refreshable-materialized-views}

Для запланированной пакетной обработки (например, ночных хранимых процедур):

```sql
-- Автоматическое обновление каждый день в 2:00
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

-- Запрос всегда возвращает актуальные данные
SELECT * FROM monthly_sales_report
WHERE month = toStartOfMonth(today());
````

См. раздел [Каскадные материализованные представления](/guides/developer/cascading-materialized-views) для изучения расширенных паттернов.

### Внешняя оркестрация {#external-orchestration}

Для сложной бизнес-логики, ETL-процессов или многошаговых операций всегда можно реализовать логику вне ClickHouse,
используя клиенты на различных языках программирования.

#### Использование кода приложения {#using-application-code}

Ниже представлено сравнение, показывающее, как хранимая процедура MySQL преобразуется в код приложения с ClickHouse:

<Tabs>
<TabItem value="mysql" label="Хранимая процедура MySQL" default>

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

    -- Начало транзакции
    START TRANSACTION;

    -- Получение информации о клиенте
    SELECT tier, total_orders
    INTO v_customer_tier, v_previous_orders
    FROM customers
    WHERE customer_id = p_customer_id;

    -- Расчет скидки на основе уровня
    IF v_customer_tier = 'gold' THEN
        SET v_discount = p_order_total * 0.15;
    ELSEIF v_customer_tier = 'silver' THEN
        SET v_discount = p_order_total * 0.10;
    ELSE
        SET v_discount = 0;
    END IF;

    -- Вставка записи заказа
    INSERT INTO orders (order_id, customer_id, order_total, discount, final_amount)
    VALUES (p_order_id, p_customer_id, p_order_total, v_discount,
            p_order_total - v_discount);

    -- Обновление статистики клиента
    UPDATE customers
    SET total_orders = total_orders + 1,
        lifetime_value = lifetime_value + (p_order_total - v_discount),
        last_order_date = NOW()
    WHERE customer_id = p_customer_id;

    -- Расчет баллов лояльности (1 балл за доллар)
    SET p_loyalty_points = FLOOR(p_order_total - v_discount);

```


-- Добавление записи о транзакции бонусных баллов
INSERT INTO loyalty&#95;points (customer&#95;id, points, transaction&#95;date, description)
VALUES (p&#95;customer&#95;id, p&#95;loyalty&#95;points, NOW(),
CONCAT(&#39;Order #&#39;, p&#95;order&#95;id));

-- Проверка, нужно ли повысить уровень клиента
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

-- Вызов хранимой процедуры
CALL process&#95;order(12345, 5678, 250.00, @status, @points);
SELECT @status, @points;

```

</TabItem>
<TabItem value="clickhouse" label="Код приложения ClickHouse">

:::note Параметры запроса
В примере ниже используются параметры запроса в ClickHouse.
Перейдите к разделу ["Альтернативы подготовленным выражениям в ClickHouse"](/guides/developer/stored-procedures-and-prepared-statements#alternatives-to-prepared-statements-in-clickhouse),
если вы ещё не знакомы с параметрами запроса в ClickHouse.
:::
```


```python
# Пример на Python с использованием clickhouse-connect
import clickhouse_connect
from datetime import datetime
from decimal import Decimal

client = clickhouse_connect.get_client(host='localhost')

def process_order(order_id: int, customer_id: int, order_total: Decimal) -> tuple[str, int]:
    """
    Обрабатывает заказ с бизнес-логикой, которая обычно реализуется в хранимой процедуре.
    Возвращает: (status_message, loyalty_points)

    Примечание: ClickHouse оптимизирован для аналитики, а не для OLTP-транзакций.
    Для транзакционных нагрузок используйте OLTP-базу данных (PostgreSQL, MySQL)
    и синхронизируйте аналитические данные с ClickHouse для формирования отчётов.
    """

    # Шаг 1: Получение информации о клиенте
    result = client.query(
        """
        SELECT tier, total_orders
        FROM customers
        WHERE customer_id = {cid: UInt32}
        """,
        parameters={'cid': customer_id}
    )

    if not result.result_rows:
        raise ValueError(f"Клиент {customer_id} не найден")

    customer_tier, previous_orders = result.result_rows[0]

    # Шаг 2: Расчёт скидки на основе уровня (бизнес-логика в Python)
    discount_rates = {'gold': 0.15, 'silver': 0.10, 'bronze': 0.0}
    discount = order_total * Decimal(str(discount_rates.get(customer_tier, 0.0)))
    final_amount = order_total - discount

    # Шаг 3: Вставка записи заказа
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

    # Шаг 4: Расчёт новой статистики клиента
    new_order_count = previous_orders + 1

    # Для аналитических баз данных предпочтительнее использовать INSERT вместо UPDATE
    # Здесь используется паттерн ReplacingMergeTree
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

    # Шаг 5: Расчёт и запись баллов лояльности
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

    # Шаг 6: Проверка повышения уровня (бизнес-логика в Python)
    status = 'ORDER_COMPLETE'

    if new_order_count >= 10 and customer_tier == 'bronze':
        # Повышение до уровня silver
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
        # Повышение до уровня gold
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


# Использование функции

status, points = process&#95;order(
order&#95;id=12345,
customer&#95;id=5678,
order&#95;total=Decimal(&#39;250.00&#39;)
)

print(f&quot;Статус: {status}, Баллы лояльности: {points}&quot;)

```

</TabItem>
</Tabs>

<br/>

#### Ключевые различия {#key-differences}

1. **Управление потоком выполнения** — хранимые процедуры MySQL используют конструкции `IF/ELSE` и циклы `WHILE`. В ClickHouse реализуйте эту логику в коде приложения (Python, Java и т. д.)
2. **Транзакции** — MySQL поддерживает `BEGIN/COMMIT/ROLLBACK` для ACID-транзакций. ClickHouse — это аналитическая СУБД, оптимизированная для операций добавления данных, а не для транзакционных обновлений
3. **Обновления** — MySQL использует операторы `UPDATE`. ClickHouse предпочитает `INSERT` с движками [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) или [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) для изменяемых данных
4. **Переменные и состояние** — хранимые процедуры MySQL могут объявлять переменные (`DECLARE v_discount`). В ClickHouse управляйте состоянием в коде приложения
5. **Обработка ошибок** — MySQL поддерживает `SIGNAL` и обработчики исключений. В коде приложения используйте встроенные механизмы обработки ошибок языка программирования (try/catch)

:::tip
**Когда использовать каждый подход:**
- **OLTP-нагрузки** (заказы, платежи, учетные записи пользователей) → используйте MySQL/PostgreSQL с хранимыми процедурами
- **Аналитические нагрузки** (отчетность, агрегации, временные ряды) → используйте ClickHouse с оркестрацией на уровне приложения
- **Гибридная архитектура** → используйте оба подхода! Передавайте транзакционные данные из OLTP в ClickHouse для аналитики
:::

#### Использование инструментов оркестрации рабочих процессов {#using-workflow-orchestration-tools}

- **Apache Airflow** — планирование и мониторинг сложных DAG запросов ClickHouse
- **dbt** — преобразование данных с помощью рабочих процессов на основе SQL
- **Prefect/Dagster** — современная оркестрация на основе Python
- **Пользовательские планировщики** — задания cron, Kubernetes CronJobs и т. д.

**Преимущества внешней оркестрации:**
- Полные возможности языка программирования
- Улучшенная обработка ошибок и логика повторных попыток
- Интеграция с внешними системами (API, другие базы данных)
- Контроль версий и тестирование
- Мониторинг и оповещения
- Более гибкое планирование
```


## Альтернативы подготовленным запросам в ClickHouse

Хотя в ClickHouse нет традиционных «подготовленных запросов» в смысле классических СУБД, он предоставляет **параметры запроса**, которые выполняют ту же роль: безопасные параметризованные запросы, предотвращающие SQL‑инъекции.

### Синтаксис

Есть два способа задать параметры запроса:

#### Метод 1: с использованием `SET`

<details>
  <summary>Пример таблицы и данных</summary>

  ```sql
  -- Создание таблицы user_events (синтаксис ClickHouse)
  CREATE TABLE user_events (
      event_id UInt32,
      user_id UInt64,
      event_name String,
      event_date Date,
      event_timestamp DateTime
  ) ENGINE = MergeTree()
  ORDER BY (user_id, event_date);

  -- Вставка примерных данных для нескольких пользователей и событий
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

#### Метод 2: через параметры CLI

```bash
clickhouse-client \
    --param_user_id=12345 \
    --param_start_date='2024-01-01' \
    --param_end_date='2024-01-31' \
    --query="SELECT count() FROM user_events
             WHERE user_id = {user_id: UInt64}
             AND event_date BETWEEN {start_date: Date} AND {end_date: Date}"
```

### Синтаксис параметров

Параметры задаются в виде: `{parameter_name: DataType}`


* `parameter_name` - Имя параметра (без префикса `param_`)
* `DataType` - Тип данных ClickHouse, к которому приводится параметр

### Примеры типов данных

<details>
  <summary>Таблицы и примеры данных для демонстрации</summary>

  ```sql
  -- 1. Создать таблицу для тестов со строками и числами
  CREATE TABLE IF NOT EXISTS users (
      name String,
      age UInt8,
      salary Float64
  ) ENGINE = Memory;

  INSERT INTO users VALUES
      ('John Doe', 25, 75000.50),
      ('Jane Smith', 30, 85000.75),
      ('Peter Jones', 20, 50000.00);

  -- 2. Создать таблицу для тестов с датами и метками времени
  CREATE TABLE IF NOT EXISTS events (
      event_date Date,
      event_timestamp DateTime
  ) ENGINE = Memory;

  INSERT INTO events VALUES
      ('2024-01-15', '2024-01-15 14:30:00'),
      ('2024-01-15', '2024-01-15 15:00:00'),
      ('2024-01-16', '2024-01-16 10:00:00');

  -- 3. Создать таблицу для тестов с массивами
  CREATE TABLE IF NOT EXISTS products (
      id UInt32,
      name String
  ) ENGINE = Memory;

  INSERT INTO products VALUES (1, 'Laptop'), (2, 'Monitor'), (3, 'Mouse'), (4, 'Keyboard');

  -- 4. Создать таблицу для тестов с Map (структуроподобными данными)
  CREATE TABLE IF NOT EXISTS accounts (
      user_id UInt32,
      status String,
      type String
  ) ENGINE = Memory;

  INSERT INTO accounts VALUES
      (101, 'active', 'premium'),
      (102, 'inactive', 'basic'),
      (103, 'active', 'basic');

  -- 5. Создать таблицу для тестов с Identifier
  CREATE TABLE IF NOT EXISTS sales_2024 (
      value UInt32
  ) ENGINE = Memory;

  INSERT INTO sales_2024 VALUES (100), (200), (300);
  ```
</details>

<Tabs>
  <TabItem value="strings" label="Строки и числа" default>
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

  <TabItem value="dates" label="Даты и время">
    ```sql
    SET param_date = '2024-01-15';
    SET param_timestamp = '2024-01-15 14:30:00';

    SELECT * FROM events
    WHERE event_date = {date: Date}
       OR event_timestamp > {timestamp: DateTime};
    ```
  </TabItem>

  <TabItem value="arrays" label="Массивы">
    ```sql
    SET param_ids = [1, 2, 3, 4, 5];

    SELECT * FROM products WHERE id IN {ids: Array(UInt32)};
    ```
  </TabItem>

  <TabItem value="maps" label="Карты (Map)">
    ```sql
    SET param_filters = {'target_status': 'active'};

    SELECT user_id, status, type FROM accounts
    WHERE status = arrayElement(
        mapValues({filters: Map(String, String)}),
        indexOf(mapKeys({filters: Map(String, String)}), 'target_status')
    );
    ```
  </TabItem>

  <TabItem value="identifiers" label="Идентификаторы">
    ```sql
    SET param_table = 'sales_2024';

    SELECT count() FROM {table: Identifier};
    ```
  </TabItem>
</Tabs>

<br />

Для использования параметров запроса в [языковых клиентах](/integrations/language-clients) обратитесь к документации
по соответствующему языковому клиенту.

### Ограничения параметров запроса

Параметры запроса **не являются универсальным механизмом текстовой подстановки**. У них есть определённые ограничения:

1. Они **в первую очередь предназначены для операторов SELECT** — наилучшая поддержка — в запросах SELECT
2. Они **работают как идентификаторы или литералы** — их нельзя использовать для подстановки произвольных фрагментов SQL
3. У них **ограниченная поддержка в DDL** — они поддерживаются в `CREATE TABLE`, но не в `ALTER TABLE`

**Что РАБОТАЕТ:**

```sql
-- ✓ Значения в предложении WHERE
SELECT * FROM users WHERE id = {user_id: UInt64};

-- ✓ Имена таблиц и баз данных
SELECT * FROM {db: Identifier}.{table: Identifier};

-- ✓ Значения в предложении IN
SELECT * FROM products WHERE id IN {ids: Array(UInt32)};
```


-- ✓ CREATE TABLE
CREATE TABLE {table_name: Identifier} (id UInt64, name String) ENGINE = MergeTree() ORDER BY id;

````

**Что НЕ работает:**
```sql
-- ✗ Имена столбцов в SELECT (используйте Identifier с осторожностью)
SELECT {column: Identifier} FROM users;  -- Ограниченная поддержка

-- ✗ Произвольные SQL-фрагменты
SELECT * FROM users {where_clause: String};  -- НЕ ПОДДЕРЖИВАЕТСЯ

-- ✗ Операторы ALTER TABLE
ALTER TABLE {table: Identifier} ADD COLUMN new_col String;  -- НЕ ПОДДЕРЖИВАЕТСЯ

-- ✗ Несколько операторов
{statements: String};  -- НЕ ПОДДЕРЖИВАЕТСЯ
````

### Рекомендации по обеспечению безопасности {#security-best-practices}

**Всегда используйте параметры запроса для пользовательского ввода:**


```python
# ✓ БЕЗОПАСНО — использует параметры
user_input = request.get('user_id')
result = client.query(
    "SELECT * FROM orders WHERE user_id = {uid: UInt64}",
    parameters={'uid': user_input}
)
```


# ✗ ОПАСНО — риск SQL-инъекции!

user&#95;input = request.get(&#39;user&#95;id&#39;)
result = client.query(f&quot;SELECT * FROM orders WHERE user&#95;id = {user_input}&quot;)

````

**Проверка типов входных данных:**

```python
def get_user_orders(user_id: int, start_date: str):
    # Проверка типов перед выполнением запроса
    if not isinstance(user_id, int) or user_id <= 0:
        raise ValueError("Недопустимый user_id")

    # Параметры обеспечивают безопасность типов
    return client.query(
        """
        SELECT * FROM orders
        WHERE user_id = {uid: UInt64}
            AND order_date >= {start: Date}
        """,
        parameters={'uid': user_id, 'start': start_date}
    )
````

### Подготовленные выражения в протоколе MySQL

[Интерфейс MySQL](/interfaces/mysql) в ClickHouse включает минимальную поддержку подготовленных выражений (`COM_STMT_PREPARE`, `COM_STMT_EXECUTE`, `COM_STMT_CLOSE`), в первую очередь для обеспечения совместимости с такими инструментами, как Tableau Online, которые оборачивают запросы в подготовленные выражения.

**Ключевые ограничения:**

* **Привязка параметров не поддерживается** — вы не можете использовать плейсхолдеры `?` с привязанными параметрами
* Запросы сохраняются, но не анализируются при выполнении `PREPARE`
* Реализация минимальна и предназначена для совместимости с отдельными BI-инструментами

**Пример того, что НЕ работает:**

```sql
-- Этот подготовленный оператор в стиле MySQL с параметрами НЕ работает в ClickHouse
PREPARE stmt FROM 'SELECT * FROM users WHERE id = ?';
EXECUTE stmt USING @user_id;  -- Привязка параметров не поддерживается
```

:::tip
**Вместо этого используйте встроенные параметры запросов ClickHouse.** Они обеспечивают полноценную поддержку привязки параметров, типобезопасность и защиту от SQL‑инъекций во всех интерфейсах ClickHouse:

```sql
-- Нативные параметры запросов ClickHouse (рекомендуется)
SET param_user_id = 12345;
SELECT * FROM users WHERE id = {user_id: UInt64};
```

:::

Дополнительные сведения см. в [документации по интерфейсу MySQL](/interfaces/mysql) и [статье в блоге о поддержке MySQL](https://clickhouse.com/blog/mysql-support-in-clickhouse-the-journey).


## Краткое описание {#summary}

### Альтернативы хранимым процедурам в ClickHouse {#summary-stored-procedures}

| Традиционный шаблон хранимой процедуры | Альтернатива в ClickHouse                                                  |
|----------------------------------------|-----------------------------------------------------------------------------|
| Простые вычисления и преобразования   | Пользовательские функции (UDF)                                             |
| Многократно используемые параметризованные запросы | Параметризованные представления                                   |
| Предварительно вычисленные агрегации  | Материализованные представления                                            |
| Пакетная обработка по расписанию      | Обновляемые материализованные представления                                |
| Сложный многошаговый ETL              | Цепочки материализованных представлений или внешняя оркестрация (Python, Airflow, dbt) |
| Бизнес-логика с управляющими конструкциями | Код приложения                                                         |

### Использование параметров запросов {#summary-query-parameters}

Параметры запросов можно использовать для:
- предотвращения SQL-инъекций
- параметризованных запросов с контролем типов
- динамической фильтрации в приложениях
- многократно используемых шаблонов запросов



## Связанная документация {#related-documentation}

- [`CREATE FUNCTION`](/sql-reference/statements/create/function) - Пользовательские функции (UDF)
- [`CREATE VIEW`](/sql-reference/statements/create/view) - Представления, включая параметризованные и материализованные
- [SQL Syntax - Query Parameters](/sql-reference/syntax#defining-and-using-query-parameters) - Полный синтаксис параметров запросов
- [Cascading Materialized Views](/guides/developer/cascading-materialized-views) - Продвинутые схемы использования материализованных представлений
- [Executable UDFs](/sql-reference/functions/udf) - Выполнение внешних пользовательских функций