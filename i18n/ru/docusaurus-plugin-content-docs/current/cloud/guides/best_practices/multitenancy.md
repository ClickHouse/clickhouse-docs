---
slug: /cloud/bestpractices/multi-tenancy
sidebar_label: 'Многоклиентность'
title: 'Многоклиентность'
description: 'Рекомендации по реализации многоклиентности'
doc_type: 'guide'
keywords: ['multitenancy', 'isolation', 'best practices', 'architecture', 'multi-tenant']
---

На SaaS‑платформе аналитики данных обычно несколько клиентов (тенантов), таких как организации, заказчики или бизнес-подразделения, используют одну и ту же инфраструктуру базы данных, при этом их данные остаются логически изолированными. Это позволяет различным пользователям безопасно получать доступ только к своим данным в рамках одной платформы.

В зависимости от требований существуют различные варианты реализации многоклиентности. Ниже приведено руководство по их реализации в ClickHouse Cloud.

## Общая таблица  {#shared-table}

В этом подходе данные всех арендаторов хранятся в одной общей таблице, при этом поле (или набор полей) используется для идентификации данных каждого арендатора. Для максимальной производительности это поле следует включить в [первичный ключ](/sql-reference/statements/create/table#primary-key). Чтобы гарантировать, что пользователи могут получать доступ только к данным, принадлежащим их арендаторам, мы используем [управление доступом на основе ролей](/operations/access-rights), реализованное через [политики строк](/operations/access-rights#row-policy-management).

> **Мы рекомендуем этот подход, так как его проще всего администрировать, особенно когда все арендаторы используют одну и ту же схему данных, а объёмы данных умеренные (< ТБ)**

Объединение всех данных арендаторов в одной таблице повышает эффективность хранения за счёт оптимизированного сжатия данных и сокращения накладных расходов на метаданные. Кроме того, упрощаются обновления схемы, так как все данные централизованно управляются.

Этот метод особенно эффективен при работе с большим количеством арендаторов (потенциально до миллионов).

Однако альтернативные подходы могут быть предпочтительнее, если арендаторы используют разные схемы данных или ожидается, что со временем они будут расходиться.

В случаях, когда существует значительная разница в объёмах данных между арендаторами, более мелкие арендаторы могут испытывать ненужное влияние на производительность запросов. Обратите внимание, что эта проблема в значительной степени устраняется за счёт включения поля арендатора в первичный ключ.

### Пример {#shared-table-example}

Это пример реализации многотенантной модели с общей таблицей.

Сначала создадим общую таблицу с полем `tenant_id`, включённым в первичный ключ.

```sql
--- Create table events. Using tenant_id as part of the primary key
CREATE TABLE events
(
    tenant_id UInt32,                 -- Tenant identifier
    id UUID,                    -- Unique event ID
    type LowCardinality(String), -- Type of event
    timestamp DateTime,          -- Timestamp of the event
    user_id UInt32,               -- ID of the user who triggered the event
    data String,                 -- Event data
)
ORDER BY (tenant_id, timestamp)
```

Добавим тестовые данные.

```sql
-- Insert some dummy rows
INSERT INTO events (tenant_id, id, type, timestamp, user_id, data)
VALUES
(1, '7b7e0439-99d0-4590-a4f7-1cfea1e192d1', 'user_login', '2025-03-19 08:00:00', 1001, '{"device": "desktop", "location": "LA"}'),
(1, '846aa71f-f631-47b4-8429-ee8af87b4182', 'purchase', '2025-03-19 08:05:00', 1002, '{"item": "phone", "amount": 799}'),
(1, '6b4d12e4-447d-4398-b3fa-1c1e94d71a2f', 'user_logout', '2025-03-19 08:10:00', 1001, '{"device": "desktop", "location": "LA"}'),
(2, '7162f8ea-8bfd-486a-a45e-edfc3398ca93', 'user_login', '2025-03-19 08:12:00', 2001, '{"device": "mobile", "location": "SF"}'),
(2, '6b5f3e55-5add-479e-b89d-762aa017f067', 'purchase', '2025-03-19 08:15:00', 2002, '{"item": "headphones", "amount": 199}'),
(2, '43ad35a1-926c-4543-a133-8672ddd504bf', 'user_logout', '2025-03-19 08:20:00', 2001, '{"device": "mobile", "location": "SF"}'),
(1, '83b5eb72-aba3-4038-bc52-6c08b6423615', 'purchase', '2025-03-19 08:45:00', 1003, '{"item": "monitor", "amount": 450}'),
(1, '975fb0c8-55bd-4df4-843b-34f5cfeed0a9', 'user_login', '2025-03-19 08:50:00', 1004, '{"device": "desktop", "location": "LA"}'),
(2, 'f50aa430-4898-43d0-9d82-41e7397ba9b8', 'purchase', '2025-03-19 08:55:00', 2003, '{"item": "laptop", "amount": 1200}'),
(2, '5c150ceb-b869-4ebb-843d-ab42d3cb5410', 'user_login', '2025-03-19 09:00:00', 2004, '{"device": "mobile", "location": "SF"}'),
```

Теперь создадим двух пользователей `user_1` и `user_2`.

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

Мы [создаём политики строк](/sql-reference/statements/create/row-policy), которые ограничивают доступ пользователей `user_1` и `user_2` только к данным их арендаторов.

```sql
-- Create row policies
CREATE ROW POLICY user_filter_1 ON default.events USING tenant_id=1 TO user_1
CREATE ROW POLICY user_filter_2 ON default.events USING tenant_id=2 TO user_2
```

Затем предоставьте для общей таблицы права [`GRANT SELECT`](/sql-reference/statements/grant#usage), используя общую роль.

```sql
-- Create role
CREATE ROLE user_role

-- Grant read only to events table.
GRANT SELECT ON default.events TO user_role
GRANT user_role TO user_1
GRANT user_role TO user_2
```

Теперь вы можете подключиться под пользователем `user_1` и выполнить простой запрос SELECT. Будут возвращены только строки из первого тенанта.

```sql
-- Logged as user_1
SELECT *
FROM events

   ┌─tenant_id─┬─id───────────────────────────────────┬─type────────┬───────────timestamp─┬─user_id─┬─data────────────────────────────────────┐
1. │         1 │ 7b7e0439-99d0-4590-a4f7-1cfea1e192d1 │ user_login  │ 2025-03-19 08:00:00 │    1001 │ {"device": "desktop", "location": "LA"} │
2. │         1 │ 846aa71f-f631-47b4-8429-ee8af87b4182 │ purchase    │ 2025-03-19 08:05:00 │    1002 │ {"item": "phone", "amount": 799}        │
3. │         1 │ 6b4d12e4-447d-4398-b3fa-1c1e94d71a2f │ user_logout │ 2025-03-19 08:10:00 │    1001 │ {"device": "desktop", "location": "LA"} │
4. │         1 │ 83b5eb72-aba3-4038-bc52-6c08b6423615 │ purchase    │ 2025-03-19 08:45:00 │    1003 │ {"item": "monitor", "amount": 450}      │
5. │         1 │ 975fb0c8-55bd-4df4-843b-34f5cfeed0a9 │ user_login  │ 2025-03-19 08:50:00 │    1004 │ {"device": "desktop", "location": "LA"} │
   └───────────┴──────────────────────────────────────┴─────────────┴─────────────────────┴─────────┴─────────────────────────────────────────┘
```

## Отдельные таблицы {#separate-tables}

В этом подходе данные каждого арендатора хранятся в отдельной таблице в той же базе данных, что устраняет необходимость в специальном поле для идентификации арендаторов. Доступ пользователей ограничивается с помощью [оператора GRANT](/sql-reference/statements/grant), благодаря чему каждый пользователь может получить доступ только к таблицам, содержащим данные соответствующих арендаторов.

> **Использование отдельных таблиц — хороший выбор, когда у арендаторов разные схемы данных.**

В сценариях с небольшим количеством арендаторов, но с очень большими наборами данных, где производительность запросов критична, такой подход может работать быстрее, чем модель общей (совместно используемой) таблицы. Поскольку нет необходимости отфильтровывать данные других арендаторов, запросы могут быть более эффективными. Кроме того, первичные ключи можно дополнительно оптимизировать, так как нет необходимости включать дополнительное поле (например, ID арендатора) в первичный ключ. 

Учтите, что этот подход не масштабируется до тысяч арендаторов. См. [ограничения использования](/cloud/bestpractices/usage-limits).

### Пример {#separate-tables-example}

Это пример реализации модели мультиарендности с отдельными таблицами.

Сначала создадим две таблицы: одну для событий из `tenant_1` и одну для событий из `tenant_2`.

```sql
-- Create table for tenant 1 
CREATE TABLE events_tenant_1
(
    id UUID,                    -- Unique event ID
    type LowCardinality(String), -- Type of event
    timestamp DateTime,          -- Timestamp of the event
    user_id UInt32,               -- ID of the user who triggered the event
    data String,                 -- Event data
)
ORDER BY (timestamp, user_id) -- Primary key can focus on other attributes

-- Create table for tenant 2 
CREATE TABLE events_tenant_2
(
    id UUID,                    -- Unique event ID
    type LowCardinality(String), -- Type of event
    timestamp DateTime,          -- Timestamp of the event
    user_id UInt32,               -- ID of the user who triggered the event
    data String,                 -- Event data
)
ORDER BY (timestamp, user_id) -- Primary key can focus on other attributes
```

Вставим тестовые данные.

```sql
INSERT INTO events_tenant_1 (id, type, timestamp, user_id, data)
VALUES
('7b7e0439-99d0-4590-a4f7-1cfea1e192d1', 'user_login', '2025-03-19 08:00:00', 1001, '{"device": "desktop", "location": "LA"}'),
('846aa71f-f631-47b4-8429-ee8af87b4182', 'purchase', '2025-03-19 08:05:00', 1002, '{"item": "phone", "amount": 799}'),
('6b4d12e4-447d-4398-b3fa-1c1e94d71a2f', 'user_logout', '2025-03-19 08:10:00', 1001, '{"device": "desktop", "location": "LA"}'),
('83b5eb72-aba3-4038-bc52-6c08b6423615', 'purchase', '2025-03-19 08:45:00', 1003, '{"item": "monitor", "amount": 450}'),
('975fb0c8-55bd-4df4-843b-34f5cfeed0a9', 'user_login', '2025-03-19 08:50:00', 1004, '{"device": "desktop", "location": "LA"}')

INSERT INTO events_tenant_2 (id, type, timestamp, user_id, data)
VALUES
('7162f8ea-8bfd-486a-a45e-edfc3398ca93', 'user_login', '2025-03-19 08:12:00', 2001, '{"device": "mobile", "location": "SF"}'),
('6b5f3e55-5add-479e-b89d-762aa017f067', 'purchase', '2025-03-19 08:15:00', 2002, '{"item": "headphones", "amount": 199}'),
('43ad35a1-926c-4543-a133-8672ddd504bf', 'user_logout', '2025-03-19 08:20:00', 2001, '{"device": "mobile", "location": "SF"}'),
('f50aa430-4898-43d0-9d82-41e7397ba9b8', 'purchase', '2025-03-19 08:55:00', 2003, '{"item": "laptop", "amount": 1200}'),
('5c150ceb-b869-4ebb-843d-ab42d3cb5410', 'user_login', '2025-03-19 09:00:00', 2004, '{"device": "mobile", "location": "SF"}')
```

Затем создадим двух пользователей `user_1` и `user_2`.

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

Затем выполните `GRANT SELECT` на соответствующую таблицу.

```sql
-- Grant read only to events table.
GRANT SELECT ON default.events_tenant_1 TO user_1
GRANT SELECT ON default.events_tenant_2 TO user_2
```

Теперь вы можете подключиться как `user_1` и выполнить простой запрос SELECT из таблицы, соответствующей этому пользователю. Будут возвращены только строки первого тенанта. 

```sql
-- Logged as user_1
SELECT *
FROM default.events_tenant_1

   ┌─id───────────────────────────────────┬─type────────┬───────────timestamp─┬─user_id─┬─data────────────────────────────────────┐
1. │ 7b7e0439-99d0-4590-a4f7-1cfea1e192d1 │ user_login  │ 2025-03-19 08:00:00 │    1001 │ {"device": "desktop", "location": "LA"} │
2. │ 846aa71f-f631-47b4-8429-ee8af87b4182 │ purchase    │ 2025-03-19 08:05:00 │    1002 │ {"item": "phone", "amount": 799}        │
3. │ 6b4d12e4-447d-4398-b3fa-1c1e94d71a2f │ user_logout │ 2025-03-19 08:10:00 │    1001 │ {"device": "desktop", "location": "LA"} │
4. │ 83b5eb72-aba3-4038-bc52-6c08b6423615 │ purchase    │ 2025-03-19 08:45:00 │    1003 │ {"item": "monitor", "amount": 450}      │
5. │ 975fb0c8-55bd-4df4-843b-34f5cfeed0a9 │ user_login  │ 2025-03-19 08:50:00 │    1004 │ {"device": "desktop", "location": "LA"} │
   └──────────────────────────────────────┴─────────────┴─────────────────────┴─────────┴─────────────────────────────────────────┘
```

## Раздельные базы данных {#separate-databases}

Данные каждого арендатора хранятся в отдельной базе данных в одном и том же сервисе ClickHouse.

> **Этот подход полезен, если каждому арендатору требуется большое количество таблиц и, возможно, материализованных представлений, а также у них различаются схемы данных. Однако управление ими становится сложным при большом числе арендаторов.**

Реализация аналогична подходу с раздельными таблицами, но вместо выдачи привилегий на уровне таблицы привилегии выдаются на уровне базы данных.

Обратите внимание, что этот подход не масштабируется до тысяч арендаторов. См. [ограничения использования](/cloud/bestpractices/usage-limits).

### Пример {#separate-databases-example}

Пример реализации многопользовательской (multi-tenant) модели с раздельными базами данных.

Сначала создадим две базы данных: одну для `tenant_1` и одну для `tenant_2`.

```sql
-- Create database for tenant_1
CREATE DATABASE tenant_1;

-- Create database for tenant_2
CREATE DATABASE tenant_2;
```

```sql
-- Create table for tenant_1
CREATE TABLE tenant_1.events
(
    id UUID,                    -- Unique event ID
    type LowCardinality(String), -- Type of event
    timestamp DateTime,          -- Timestamp of the event
    user_id UInt32,               -- ID of the user who triggered the event
    data String,                 -- Event data
)
ORDER BY (timestamp, user_id);

-- Create table for tenant_2
CREATE TABLE tenant_2.events
(
    id UUID,                    -- Unique event ID
    type LowCardinality(String), -- Type of event
    timestamp DateTime,          -- Timestamp of the event
    user_id UInt32,               -- ID of the user who triggered the event
    data String,                 -- Event data
)
ORDER BY (timestamp, user_id);
```

Вставим тестовые данные.

```sql
INSERT INTO tenant_1.events (id, type, timestamp, user_id, data)
VALUES
('7b7e0439-99d0-4590-a4f7-1cfea1e192d1', 'user_login', '2025-03-19 08:00:00', 1001, '{"device": "desktop", "location": "LA"}'),
('846aa71f-f631-47b4-8429-ee8af87b4182', 'purchase', '2025-03-19 08:05:00', 1002, '{"item": "phone", "amount": 799}'),
('6b4d12e4-447d-4398-b3fa-1c1e94d71a2f', 'user_logout', '2025-03-19 08:10:00', 1001, '{"device": "desktop", "location": "LA"}'),
('83b5eb72-aba3-4038-bc52-6c08b6423615', 'purchase', '2025-03-19 08:45:00', 1003, '{"item": "monitor", "amount": 450}'),
('975fb0c8-55bd-4df4-843b-34f5cfeed0a9', 'user_login', '2025-03-19 08:50:00', 1004, '{"device": "desktop", "location": "LA"}')

INSERT INTO tenant_2.events (id, type, timestamp, user_id, data)
VALUES
('7162f8ea-8bfd-486a-a45e-edfc3398ca93', 'user_login', '2025-03-19 08:12:00', 2001, '{"device": "mobile", "location": "SF"}'),
('6b5f3e55-5add-479e-b89d-762aa017f067', 'purchase', '2025-03-19 08:15:00', 2002, '{"item": "headphones", "amount": 199}'),
('43ad35a1-926c-4543-a133-8672ddd504bf', 'user_logout', '2025-03-19 08:20:00', 2001, '{"device": "mobile", "location": "SF"}'),
('f50aa430-4898-43d0-9d82-41e7397ba9b8', 'purchase', '2025-03-19 08:55:00', 2003, '{"item": "laptop", "amount": 1200}'),
('5c150ceb-b869-4ebb-843d-ab42d3cb5410', 'user_login', '2025-03-19 09:00:00', 2004, '{"device": "mobile", "location": "SF"}')
```

Теперь давайте создадим двух пользователей `user_1` и `user_2`.

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

Затем предоставьте привилегии `GRANT SELECT` для соответствующей таблицы.

```sql
-- Grant read only to events table.
GRANT SELECT ON tenant_1.events TO user_1
GRANT SELECT ON tenant_2.events TO user_2
```

Теперь вы можете подключиться под пользователем `user_1` и выполнить простой SELECT-запрос к таблице `events` соответствующей базы данных. Будут возвращены только строки первого арендатора.

```sql
-- Logged as user_1
SELECT *
FROM tenant_1.events

   ┌─id───────────────────────────────────┬─type────────┬───────────timestamp─┬─user_id─┬─data────────────────────────────────────┐
1. │ 7b7e0439-99d0-4590-a4f7-1cfea1e192d1 │ user_login  │ 2025-03-19 08:00:00 │    1001 │ {"device": "desktop", "location": "LA"} │
2. │ 846aa71f-f631-47b4-8429-ee8af87b4182 │ purchase    │ 2025-03-19 08:05:00 │    1002 │ {"item": "phone", "amount": 799}        │
3. │ 6b4d12e4-447d-4398-b3fa-1c1e94d71a2f │ user_logout │ 2025-03-19 08:10:00 │    1001 │ {"device": "desktop", "location": "LA"} │
4. │ 83b5eb72-aba3-4038-bc52-6c08b6423615 │ purchase    │ 2025-03-19 08:45:00 │    1003 │ {"item": "monitor", "amount": 450}      │
5. │ 975fb0c8-55bd-4df4-843b-34f5cfeed0a9 │ user_login  │ 2025-03-19 08:50:00 │    1004 │ {"device": "desktop", "location": "LA"} │
   └──────────────────────────────────────┴─────────────┴─────────────────────┴─────────┴─────────────────────────────────────────┘
```

## Разделение вычислительных ресурсов {#compute-compute-separation}

Три описанных выше подхода также можно дополнительно изолировать с помощью [Warehouses](/cloud/reference/warehouses#what-is-a-warehouse). Данные хранятся в общем объектном хранилище, но каждый арендатор может иметь собственный вычислительный сервис благодаря [разделению вычислительных ресурсов](/cloud/reference/warehouses#what-is-compute-compute-separation) с разным соотношением CPU/Memory. 

Управление пользователями аналогично ранее описанным подходам, поскольку все сервисы в Warehouse [используют общие настройки управления доступом](/cloud/reference/warehouses#database-credentials). 

Обратите внимание, что число дочерних сервисов в одном Warehouse ограничено небольшим количеством. См. [ограничения Warehouse](/cloud/reference/warehouses#limitations).

## Отдельный облачный сервис {#separate-service}

Наиболее радикальный подход — использовать отдельный сервис ClickHouse для каждого арендатора. 

> **Этот менее распространённый метод может быть решением, если данные арендаторов требуется хранить в разных регионах — по юридическим причинам, требованиям безопасности или соображениям близости.**

На каждом сервисе должна быть создана учётная запись пользователя, через которую он сможет получить доступ к данным соответствующего арендатора.

Такой подход сложнее в управлении и создаёт накладные расходы для каждого сервиса, так как каждому для работы требуется собственная инфраструктура. Сервисами можно управлять через [ClickHouse Cloud API](/cloud/manage/api/api-overview), а оркестрация также возможна через [официальный провайдер Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs).

### Пример {#separate-service-example}

Ниже приведён пример реализации модели мультиарендности на основе отдельных сервисов. Обратите внимание, что в примере показано создание таблиц и пользователей в одном сервисе ClickHouse; то же самое потребуется выполнить во всех сервисах.

Сначала создадим таблицу `events`

```sql
-- Create table for tenant_1
CREATE TABLE events
(
    id UUID,                    -- Unique event ID
    type LowCardinality(String), -- Type of event
    timestamp DateTime,          -- Timestamp of the event
    user_id UInt32,               -- ID of the user who triggered the event
    data String,                 -- Event data
)
ORDER BY (timestamp, user_id);
```

Добавим тестовые данные.

```sql
INSERT INTO events (id, type, timestamp, user_id, data)
VALUES
('7b7e0439-99d0-4590-a4f7-1cfea1e192d1', 'user_login', '2025-03-19 08:00:00', 1001, '{"device": "desktop", "location": "LA"}'),
('846aa71f-f631-47b4-8429-ee8af87b4182', 'purchase', '2025-03-19 08:05:00', 1002, '{"item": "phone", "amount": 799}'),
('6b4d12e4-447d-4398-b3fa-1c1e94d71a2f', 'user_logout', '2025-03-19 08:10:00', 1001, '{"device": "desktop", "location": "LA"}'),
('83b5eb72-aba3-4038-bc52-6c08b6423615', 'purchase', '2025-03-19 08:45:00', 1003, '{"item": "monitor", "amount": 450}'),
('975fb0c8-55bd-4df4-843b-34f5cfeed0a9', 'user_login', '2025-03-19 08:50:00', 1004, '{"device": "desktop", "location": "LA"}')
```

Теперь давайте создадим двух пользователей `user_1`

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
```

Затем выполните команду `GRANT SELECT` для соответствующей таблицы.

```sql
-- Grant read only to events table.
GRANT SELECT ON events TO user_1
```

Теперь вы можете подключиться под пользователем `user_1` к сервису арендатора 1 и выполнить простой запрос SELECT. Будут возвращены только строки, относящиеся к первому арендатору.

```sql
-- Logged as user_1
SELECT *
FROM events

   ┌─id───────────────────────────────────┬─type────────┬───────────timestamp─┬─user_id─┬─data────────────────────────────────────┐
1. │ 7b7e0439-99d0-4590-a4f7-1cfea1e192d1 │ user_login  │ 2025-03-19 08:00:00 │    1001 │ {"device": "desktop", "location": "LA"} │
2. │ 846aa71f-f631-47b4-8429-ee8af87b4182 │ purchase    │ 2025-03-19 08:05:00 │    1002 │ {"item": "phone", "amount": 799}        │
3. │ 6b4d12e4-447d-4398-b3fa-1c1e94d71a2f │ user_logout │ 2025-03-19 08:10:00 │    1001 │ {"device": "desktop", "location": "LA"} │
4. │ 83b5eb72-aba3-4038-bc52-6c08b6423615 │ purchase    │ 2025-03-19 08:45:00 │    1003 │ {"item": "monitor", "amount": 450}      │
5. │ 975fb0c8-55bd-4df4-843b-34f5cfeed0a9 │ user_login  │ 2025-03-19 08:50:00 │    1004 │ {"device": "desktop", "location": "LA"} │
   └──────────────────────────────────────┴─────────────┴─────────────────────┴─────────┴─────────────────────────────────────────┘
```
