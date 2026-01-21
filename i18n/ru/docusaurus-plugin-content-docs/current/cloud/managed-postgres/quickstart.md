---
slug: /cloud/managed-postgres/quickstart
sidebar_label: 'Быстрый старт'
title: 'Быстрый старт'
description: 'Создайте свою первую базу данных Managed Postgres и изучите панель управления экземпляром'
keywords: ['managed postgres', 'быстрый старт', 'начало работы', 'создание базы данных']
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

Это краткое руководство поможет вам создать первый сервис Managed Postgres и интегрировать его с ClickHouse. Наличие уже развёрнутого экземпляра ClickHouse позволит вам изучить все возможности Managed Postgres.

<PrivatePreviewBadge/>

## Создайте базу данных \{#create-postgres-database\}

Чтобы создать новый сервис Managed Postgres, нажмите кнопку **New service** в списке сервисов в Cloud Console. После этого вы сможете выбрать Postgres в качестве типа базы данных.

<Image img={createPg} alt="Создание управляемого сервиса Postgres" size="md" border/>

Введите имя экземпляра базы данных и нажмите **Create service**. Вы будете перенаправлены на страницу обзора.

<Image img={pgOverview} alt="Обзор Managed Postgres" size="md" border/>

Ваш экземпляр Managed Postgres будет подготовлен и через несколько минут будет готов к использованию.

## Подключитесь и подготовьте данные \{#connect-and-data\}

В левой боковой панели вы увидите [кнопку **Connect**](/cloud/managed-postgres/connection). Нажмите на неё, чтобы просмотреть параметры подключения и строки подключения в нескольких форматах.

<Image img={connectModal} alt="Модальное окно подключения Managed Postgres" size="md" border />

Вы можете скопировать строку подключения в предпочитаемом формате и использовать её для подключения к базе данных с помощью любого клиента, совместимого с Postgres, например `psql`, DBeaver или любой прикладной библиотеки.

Чтобы быстро начать работу, вы можете использовать следующие SQL-команды для создания двух тестовых таблиц и вставки примеров данных:

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

Вставим данные в таблицу events:

```sql
INSERT INTO events (event_name, event_type, event_timestamp, event_data, user_id, user_ip)
SELECT
   'Event ' || gs::text AS event_name,
   CASE
       WHEN random() < 0.5 THEN 'click'          -- 50% chance
       WHEN random() < 0.75 THEN 'view'          -- 25% chance
       WHEN random() < 0.9 THEN 'purchase'       -- 15% chance
       WHEN random() < 0.98 THEN 'signup'        -- 8% chance
       ELSE 'logout'                             -- 2% chance
   END AS event_type,
   NOW() - INTERVAL '1 day' * (gs % 365) AS event_timestamp,
   jsonb_build_object('key', 'value' || gs::text, 'additional_info', 'info_' || (gs % 100)::text) AS event_data,
   GREATEST(1, LEAST(1000, FLOOR(POWER(random(), 2) * 1000) + 1)) AS user_id,
   ('192.168.1.' || ((gs % 254) + 1))::inet AS user_ip
FROM
   generate_series(1, 1000000) gs;
```

Затем вставьте данные в таблицу users:


```sql
INSERT INTO
    users (
        NAME,
        country,
        platform
    )
SELECT
    first_names [first_idx] || ' ' || last_names [last_idx] AS NAME,
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
    CROSS JOIN lateral (
        SELECT
            array ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hank', 'Ivy', 'Jack',                 'Liam', 'Olivia', 'Noah', 'Emma', 'Sophia', 'Benjamin', 'Isabella', 'Lucas', 'Mia', 'Amelia',                 'Aarav', 'Riya', 'Arjun', 'Ananya', 'Wei', 'Li', 'Huan', 'Mei', 'Hans', 'Klaus', 'Greta', 'Sofia'] AS first_names,
            array ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Martinez', 'Taylor',                 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Moore', 'Lee', 'Perez',                 'Sharma', 'Patel', 'Gupta', 'Reddy', 'Zhang', 'Wang', 'Chen', 'Liu', 'Schmidt', 'Müller', 'Weber', 'Fischer'] AS last_names,
            1 + (seq % 32) AS first_idx,
            1 + ((seq / 32) :: int % 32) AS last_idx
    ) AS names;
```


## Настройка интеграции с ClickHouse \{#setup-integrate-clickhouse\}

Теперь, когда у нас есть таблицы и данные в Postgres, давайте реплицируем таблицы в ClickHouse для аналитики. Начните с нажатия **ClickHouse integration** в боковой панели. Затем нажмите **Replicate data in ClickHouse**.

<Image img={integrationLanding} alt="Managed Postgres integration empty" size="md" border/>

В появившейся форме вы можете задать имя интеграции и выбрать существующий экземпляр ClickHouse, в который будет выполняться репликация. Если у вас ещё нет экземпляра ClickHouse, вы можете создать его, следуя руководству [Quickstart for ClickHouse Cloud](/cloud/clickhouse-cloud/quickstart).
:::warning Важно
Перед продолжением убедитесь, что выбранный сервис ClickHouse находится в состоянии Running.
:::

<Image img={postgresAnalyticsForm} alt="Managed Postgres integration form" size="md" border/>

Нажмите **Next**, чтобы перейти к выбору таблиц. Здесь вам нужно:

- Выбрать базу данных ClickHouse, в которую будет выполняться репликация.
- Развернуть схему **public** и выбрать таблицы users и events, которые мы создали ранее.
- Нажать **Replicate data to ClickHouse**.

<Image img={tablePicker} alt="Managed Postgres table picker" size="md" border/>

Процесс репликации запустится, и вы попадёте на страницу обзора интеграции. Поскольку это первая интеграция, настройка начальной инфраструктуры может занять 2–3 минуты. А пока давайте рассмотрим новое расширение **pg_clickhouse**.

## Расширение pg_clickhouse \{#pg-clickhouse-extension\}

**pg&#95;clickhouse** — это расширение Postgres, которое мы разработали; оно позволяет выполнять запросы к данным ClickHouse из интерфейса Postgres. Подробное введение можно найти [здесь](integrations/pg_clickhouse#introduction). Чтобы использовать расширение, подключитесь к экземпляру Managed Postgres с помощью любого клиента, совместимого с Postgres, и выполните следующие SQL-команды:

```sql
CREATE EXTENSION pg_clickhouse;
```

Затем мы создаём объект, называемый обёрткой внешних данных (foreign data wrapper, FDW), чтобы подключиться к ClickHouse:

```sql
CREATE SERVER ch FOREIGN DATA WRAPPER clickhouse_fdw
       OPTIONS(driver 'binary', host '<clickhouse_cloud_host>', dbname 'default');
```

Вы можете получить хост, перейдя в свой сервис ClickHouse, нажав Connect в боковой панели и выбрав Native.

<Image img={getClickHouseHost} alt="Получение хоста ClickHouse" size="md" border />

Теперь сопоставим пользователя Postgres с учетными данными сервиса ClickHouse:

```sql
CREATE USER MAPPING FOR CURRENT_USER SERVER ch 
OPTIONS (user 'default', password '<clickhouse_password>');
```

Пора импортировать данные! Добавьте схему `organization` и импортируйте в неё все таблицы из удалённой базы данных ClickHouse в Postgres:

```sql
CREATE SCHEMA organization;
IMPORT FOREIGN SCHEMA "default" FROM SERVER ch INTO organization;
```

Готово! Теперь в своём клиенте Postgres вы можете просматривать все таблицы ClickHouse:

```sql
postgres=# \det+ organization.*
```


## Аналитика после интеграции \{#analytics-after-integration\}

Вернёмся на страницу интеграции. Вы должны увидеть, что начальная репликация завершена. Вы можете нажать на имя интеграции, чтобы просмотреть более подробную информацию о ней.

<Image img={analyticsList} alt="Список аналитики Managed Postgres" size="md" border/>

Если вы нажмёте на имя сервиса, вы перейдёте в консоль ClickHouse, где сможете увидеть две таблицы, которые мы реплицировали.

<Image img={replicatedTables} alt="Реплицированные таблицы Managed Postgres в ClickHouse" size="md" border/>