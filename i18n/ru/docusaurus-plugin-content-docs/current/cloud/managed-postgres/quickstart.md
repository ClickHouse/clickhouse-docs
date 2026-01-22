---
slug: /cloud/managed-postgres/quickstart
sidebar_label: 'Быстрый старт'
title: 'Быстрый старт'
description: 'Испытайте производительность Postgres на основе NVMe и добавьте аналитику в реальном времени благодаря нативной интеграции с ClickHouse'
keywords: ['managed postgres', 'быстрый старт', 'начало работы', 'создание базы данных', 'nvme', 'производительность']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import createPg from '@site/static/images/managed-postgres/create-service.png';
import pgOverview from '@site/static/images/managed-postgres/overview.png';
import connectModal from '@site/static/images/managed-postgres/connect-modal.png';
import integrationLanding from '@site/static/images/managed-postgres/integration-landing.png';
import postgresAnalyticsForm from '@site/static/images/managed-postgres/postgres-analytics-form.png';
import tablePicker from '@site/static/images/managed-postgres/table-picker.png';
import getClickHouseHost from '@site/static/images/managed-postgres/get-clickhouse-host.png';
import analyticsList from '@site/static/images/managed-postgres/analytics-list.png';
import replicatedTables from '@site/static/images/managed-postgres/replicated-tables.png';


# Быстрый старт с Managed Postgres \{#quickstart-for-managed-postgres\}

:::tip Уже доступно
Managed Postgres теперь доступен в ClickHouse Cloud в режиме Private Preview! Начните работу за несколько минут, нажав [сюда](https://clickhouse.com/cloud/postgres).
:::

ClickHouse Managed Postgres — это Postgres корпоративного уровня на базе NVMe-хранилища, обеспечивающий до 10 раз более высокую производительность для нагрузок, зависящих от диска, по сравнению с сетевыми хранилищами, такими как EBS. Это руководство по быстрому старту разделено на две части:

- **Часть 1:** Начало работы с NVMe Postgres и оценка его производительности
- **Часть 2:** Использование аналитики в реальном времени за счёт интеграции с ClickHouse

В настоящее время Managed Postgres доступен на AWS в нескольких регионах и является бесплатным на этапе закрытого предварительного просмотра.

**В этом руководстве по быстрому старту вы:**

- Создадите экземпляр Managed Postgres с производительностью на базе NVMe
- Загрузите 1 миллион примерных событий и увидите скорость NVMe на практике
- Запустите запросы и оцените низкую задержку выполнения
- Реплицируете данные в ClickHouse для аналитики в реальном времени
- Будете выполнять запросы к ClickHouse напрямую из Postgres с помощью `pg_clickhouse`

## Часть 1: Начало работы с NVMe Postgres \{#part-1\}

### Создайте базу данных \{#create-postgres-database\}

Чтобы создать новый сервис Managed Postgres, нажмите кнопку **New service** в списке сервисов в Cloud Console. После этого вы сможете выбрать Postgres в качестве типа базы данных.

<Image img={createPg} alt="Создание управляемого сервиса Postgres" size="md" border/>

Введите имя экземпляра базы данных и нажмите **Create service**. Вы будете перенаправлены на страницу обзора.

<Image img={pgOverview} alt="Обзор Managed Postgres" size="md" border/>

Ваш экземпляр Managed Postgres будет подготовлен и через 3–5 минут будет готов к использованию.

### Подключитесь к базе данных \{#connect\}

В левой боковой панели вы увидите [кнопку **Connect**](/cloud/managed-postgres/connection). Нажмите на неё, чтобы просмотреть параметры подключения и строки подключения в нескольких форматах.

<Image img={connectModal} alt="Модальное окно подключения Managed Postgres" size="md" border />

Скопируйте строку подключения для `psql` и подключитесь к базе данных. Вы также можете использовать любой клиент, совместимый с Postgres, например DBeaver или любую прикладную библиотеку.

### Оцените производительность NVMe \{#nvme-performance\}

Давайте посмотрим на производительность NVMe в реальной работе. Сначала включите вывод времени выполнения в psql, чтобы измерять время выполнения запросов:

```sql
\timing
```

Создайте две тестовые таблицы для событий и пользователей:

```sql
CREATE TABLE events (
   event_id SERIAL PRIMARY KEY,
   event_name VARCHAR(255) NOT NULL,
   event_type VARCHAR(100),
   event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
   event_data JSONB,
   user_id INT,
   user_ip INET,
   is_active BOOLEAN DEFAULT TRUE,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
   user_id SERIAL PRIMARY KEY,
   name VARCHAR(100),
   country VARCHAR(50),
   platform VARCHAR(50)
);
```

Теперь вставьте 1 миллион событий и оцените скорость NVMe:

```sql
INSERT INTO events (event_name, event_type, event_timestamp, event_data, user_id, user_ip)
SELECT
   'Event ' || gs::text AS event_name,
   CASE
       WHEN random() < 0.5 THEN 'click'
       WHEN random() < 0.75 THEN 'view'
       WHEN random() < 0.9 THEN 'purchase'
       WHEN random() < 0.98 THEN 'signup'
       ELSE 'logout'
   END AS event_type,
   NOW() - INTERVAL '1 day' * (gs % 365) AS event_timestamp,
   jsonb_build_object('key', 'value' || gs::text, 'additional_info', 'info_' || (gs % 100)::text) AS event_data,
   GREATEST(1, LEAST(1000, FLOOR(POWER(random(), 2) * 1000) + 1)) AS user_id,
   ('192.168.1.' || ((gs % 254) + 1))::inet AS user_ip
FROM
   generate_series(1, 1000000) gs;
```

```text
INSERT 0 1000000
Time: 3596.542 ms (00:03.597)
```

:::tip NVMe Performance
1 миллион строк с данными JSONB был вставлен менее чем за 4 секунды. В традиционных облачных базах данных, использующих сетевое хранилище, такое как EBS, та же операция обычно занимает в 2–3 раза больше времени из-за сетевой задержки при двустороннем обмене (round-trip latency) и ограничения IOPS. NVMe-хранилище устраняет эти узкие места, так как хранилище физически подключено к вычислительным ресурсам.

Производительность зависит от размера экземпляра, текущей нагрузки и характеристик данных.
:::

Вставьте 1 000 пользователей:


```sql
INSERT INTO users (name, country, platform)
SELECT
    first_names[first_idx] || ' ' || last_names[last_idx] AS name,
    CASE
        WHEN random() < 0.25 THEN 'India'
        WHEN random() < 0.5 THEN 'USA'
        WHEN random() < 0.7 THEN 'Germany'
        WHEN random() < 0.85 THEN 'China'
        ELSE 'Other'
    END AS country,
    CASE
        WHEN random() < 0.2 THEN 'iOS'
        WHEN random() < 0.4 THEN 'Android'
        WHEN random() < 0.6 THEN 'Web'
        WHEN random() < 0.75 THEN 'Windows'
        WHEN random() < 0.9 THEN 'MacOS'
        ELSE 'Linux'
    END AS platform
FROM
    generate_series(1, 1000) AS seq
    CROSS JOIN LATERAL (
        SELECT
            array['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hank', 'Ivy', 'Jack', 'Liam', 'Olivia', 'Noah', 'Emma', 'Sophia', 'Benjamin', 'Isabella', 'Lucas', 'Mia', 'Amelia', 'Aarav', 'Riya', 'Arjun', 'Ananya', 'Wei', 'Li', 'Huan', 'Mei', 'Hans', 'Klaus', 'Greta', 'Sofia'] AS first_names,
            array['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Martinez', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Moore', 'Lee', 'Perez', 'Sharma', 'Patel', 'Gupta', 'Reddy', 'Zhang', 'Wang', 'Chen', 'Liu', 'Schmidt', 'Müller', 'Weber', 'Fischer'] AS last_names,
            1 + (seq % 32) AS first_idx,
            1 + ((seq / 32)::int % 32) AS last_idx
    ) AS names;
```


### Выполнение запросов к данным \{#run-queries\}

Теперь давайте выполним несколько запросов, чтобы увидеть, насколько быстро Postgres отвечает при использовании NVMe‑накопителя.

**Выполните агрегацию 1 миллиона событий по типу:**

```sql
SELECT event_type, COUNT(*) as count 
FROM events 
GROUP BY event_type 
ORDER BY count DESC;
```

```text
 event_type | count  
------------+--------
 click      | 499523
 view       | 375644
 purchase   | 112473
 signup     |  12117
 logout     |    243
(5 rows)

Time: 114.883 ms
```

**Запрос с фильтрацией по JSONB и диапазону дат:**

```sql
SELECT COUNT(*) 
FROM events 
WHERE event_timestamp > NOW() - INTERVAL '30 days'
  AND event_data->>'additional_info' LIKE 'info_5%';
```

```text
 count 
-------
  9042
(1 row)

Time: 109.294 ms
```

**Свяжите события с пользователями:**

```sql
SELECT u.country, COUNT(*) as events, AVG(LENGTH(e.event_data::text))::int as avg_json_size
FROM events e
JOIN users u ON e.user_id = u.user_id
GROUP BY u.country
ORDER BY events DESC;
```

```text
 country | events | avg_json_size 
---------+--------+---------------
 USA     | 383748 |            52
 India   | 255990 |            52
 Germany | 223781 |            52
 China   | 127754 |            52
 Other   |   8727 |            52
(5 rows)

Time: 224.670 ms
```

:::note Ваш Postgres готов
На этом этапе у вас есть полностью работоспособная, высокопроизводительная база данных Postgres, готовая к обслуживанию транзакционных нагрузок.

Перейдите к Части 2, чтобы узнать, как нативная интеграция с ClickHouse может значительно ускорить вашу аналитику.
:::

***


## Часть 2: Добавление аналитики в реальном времени с помощью ClickHouse \{#part-2\}

Хотя Postgres отлично подходит для транзакционных нагрузок (OLTP), ClickHouse специально создан для аналитических запросов (OLAP) по большим наборам данных. Интегрируя эти системы, вы получаете лучшее из обоих миров:

- **Postgres** для транзакционных данных вашего приложения (операции insert, update, точечные выборки)
- **ClickHouse** для аналитики по миллиардам строк с задержкой менее секунды

В этом разделе показано, как реплицировать ваши данные из Postgres в ClickHouse и прозрачно выполнять по ним запросы.

### Настройка интеграции с ClickHouse \{#setup-integrate-clickhouse\}

Теперь, когда у нас есть таблицы и данные в Postgres, давайте реплицируем таблицы в ClickHouse для аналитики. Начните с нажатия **ClickHouse integration** в боковой панели. Затем нажмите **Replicate data in ClickHouse**.

<Image img={integrationLanding} alt="Managed Postgres integration empty" size="md" border/>

В появившейшейся форме вы можете задать имя интеграции и выбрать существующий экземпляр ClickHouse, в который будет выполняться репликация. Если у вас ещё нет экземпляра ClickHouse, вы можете создать его напрямую из этой формы.
:::info Важно
Перед продолжением убедитесь, что выбранный сервис ClickHouse находится в состоянии Running.
:::

<Image img={postgresAnalyticsForm} alt="Managed Postgres integration form" size="md" border/>

Нажмите **Next**, чтобы перейти к выбору таблиц. Здесь вам нужно:

- Выбрать базу данных ClickHouse, в которую будет выполняться репликация.
- Развернуть схему **public** и выбрать таблицы users и events, которые мы создали ранее.
- Нажать **Replicate data to ClickHouse**.

<Image img={tablePicker} alt="Managed Postgres table picker" size="md" border/>

Процесс репликации запустится, и вы попадёте на страницу обзора интеграции. Поскольку это первая интеграция, настройка начальной инфраструктуры может занять 2–3 минуты. А пока давайте рассмотрим новое расширение **pg_clickhouse**.

### Выполнение запросов к ClickHouse из Postgres \{#pg-clickhouse-extension\}

Расширение `pg_clickhouse` позволяет выполнять запросы к данным ClickHouse напрямую из Postgres, используя стандартный SQL. Это означает, что ваше приложение может использовать Postgres как единый слой для выполнения запросов как к транзакционным, так и к аналитическим данным. Подробности см. в [полной документации](/integrations/pg_clickhouse).

Активируйте расширение:

```sql
CREATE EXTENSION pg_clickhouse;
```

Затем создайте подключение к внешнему серверу ClickHouse. Используйте драйвер `http` с портом `8443` для защищённых подключений:

```sql
CREATE SERVER ch FOREIGN DATA WRAPPER clickhouse_fdw
       OPTIONS(driver 'http', host '<clickhouse_cloud_host>', dbname '<database_name>', port '8443');
```

Замените `<clickhouse_cloud_host>` на ваш хост ClickHouse и `<database_name>` на базу данных, которую вы выбрали при настройке репликации. Имя хоста можно найти в вашем сервисе ClickHouse, нажав **Connect** в боковой панели.

<Image img={getClickHouseHost} alt="Получение хоста ClickHouse" size="md" border />

Теперь сопоставим пользователя Postgres с учётными данными сервиса ClickHouse:

```sql
CREATE USER MAPPING FOR CURRENT_USER SERVER ch 
OPTIONS (user 'default', password '<clickhouse_password>');
```

Теперь импортируйте таблицы ClickHouse в схему Postgres:

```sql
CREATE SCHEMA organization;
IMPORT FOREIGN SCHEMA "<database_name>" FROM SERVER ch INTO organization;
```

Замените `<database_name>` тем же именем базы данных, которое вы использовали при создании сервера.

Теперь в клиенте Postgres отображаются все таблицы ClickHouse:

```sql
\det+ organization.*
```


### Посмотрите аналитику в действии \{#analytics-after-integration\}

Вернёмся на страницу интеграции. Вы должны увидеть, что начальная репликация завершена. Нажмите на имя интеграции, чтобы просмотреть подробную информацию.

<Image img={analyticsList} alt="Список аналитики Managed Postgres" size="md" border/>

Нажмите на имя сервиса, чтобы открыть консоль ClickHouse и увидеть свои реплицированные таблицы.

<Image img={replicatedTables} alt="Реплицированные таблицы Managed Postgres в ClickHouse" size="md" border/>

### Сравнение производительности Postgres и ClickHouse \{#performance-comparison\}

Теперь запустим несколько аналитических запросов и сравним производительность Postgres и ClickHouse. Обратите внимание, что реплицированные таблицы используют схему именования `public_<table_name>`.

**Запрос 1: Пользователи с наибольшей активностью**

Этот запрос находит самых активных пользователей с несколькими агрегирующими функциями:

```sql
-- Via ClickHouse
SELECT 
    user_id,
    COUNT(*) as total_events,
    COUNT(DISTINCT event_type) as unique_event_types,
    SUM(CASE WHEN event_type = 'purchase' THEN 1 ELSE 0 END) as purchases,
    MIN(event_timestamp) as first_event,
    MAX(event_timestamp) as last_event
FROM organization.public_events
GROUP BY user_id
ORDER BY total_events DESC
LIMIT 10;
```

```text
 user_id | total_events | unique_event_types | purchases |        first_event         |         last_event         
---------+--------------+--------------------+-----------+----------------------------+----------------------------
       1 |        31439 |                  5 |      3551 | 2025-01-22 22:40:45.612281 | 2026-01-21 22:40:45.612281
       2 |        13235 |                  4 |      1492 | 2025-01-22 22:40:45.612281 | 2026-01-21 22:40:45.612281
...
(10 rows)

Time: 163.898 ms   -- ClickHouse
Time: 554.621 ms   -- Same query on Postgres
```

**Запрос 2: вовлечённость пользователей по странам и платформам**

Этот запрос соединяет события с пользователями и вычисляет метрики вовлечённости:

```sql
-- Via ClickHouse
SELECT 
    u.country,
    u.platform,
    COUNT(DISTINCT e.user_id) as users,
    COUNT(*) as total_events,
    ROUND(COUNT(*)::numeric / COUNT(DISTINCT e.user_id), 2) as events_per_user,
    SUM(CASE WHEN e.event_type = 'purchase' THEN 1 ELSE 0 END) as purchases
FROM organization.public_events e
JOIN organization.public_users u ON e.user_id = u.user_id
GROUP BY u.country, u.platform
ORDER BY total_events DESC
LIMIT 10;
```

```text
 country | platform | users | total_events | events_per_user | purchases 
---------+----------+-------+--------------+-----------------+-----------
 USA     | Android  |   115 |       109977 |             956 |     12388
 USA     | Web      |   108 |       105057 |             972 |     11847
 USA     | iOS      |    83 |        84594 |            1019 |      9565
 Germany | Android  |    85 |        77966 |             917 |      8852
 India   | Android  |    80 |        68095 |             851 |      7724
...
(10 rows)

Time: 170.353 ms   -- ClickHouse
Time: 1245.560 ms  -- Same query on Postgres
```

**Сравнение производительности:**

| Запрос                                         | Postgres (NVMe) | ClickHouse (через pg&#95;clickhouse) | Ускорение |
| ---------------------------------------------- | --------------- | ------------------------------------ | --------- |
| Топ пользователей (5 агрегаций)                | 555 ms          | 164 ms                               | 3.4x      |
| Вовлечённость пользователей (JOIN + агрегации) | 1,246 ms        | 170 ms                               | 7.3x      |

:::tip Когда использовать ClickHouse
Даже на этом наборе данных объёмом 1M строк ClickHouse обеспечивает ускорение в 3–7 раз для сложных аналитических запросов с JOIN и множественными агрегациями. Разница становится ещё более существенной на больших объёмах (100M+ строк), где столбцовое хранение и векторизованное выполнение ClickHouse могут давать ускорение в 10–100 раз.

Время выполнения запросов зависит от размера экземпляра, сетевой задержки между сервисами, характеристик данных и текущей нагрузки.
:::


## Очистка \{#cleanup\}

Чтобы удалить ресурсы, созданные в этом кратком руководстве:

1. Сначала удалите интеграцию ClickPipe в сервисе ClickHouse
2. Затем удалите экземпляр Managed Postgres в Cloud Console