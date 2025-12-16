---
slug: /cloud/bestpractices/multi-tenancy
sidebar_label: 'Многотенантность'
title: 'Многотенантность'
description: 'Рекомендации по реализации многотенантности'
doc_type: 'guide'
keywords: ['multitenancy', 'изоляция', 'лучшие практики', 'архитектура', 'multi-tenant']
---

На SaaS‑платформе анализа данных обычно несколько арендаторов (тенантов), например организаций, клиентов или бизнес‑подразделений, совместно используют одну и ту же инфраструктуру базы данных при сохранении логической изоляции их данных. Это позволяет разным пользователям безопасно получать доступ к своим данным в рамках одной платформы.

В зависимости от требований существуют разные варианты реализации многотенантности. Ниже приведено руководство по реализации этих вариантов с помощью ClickHouse Cloud.

## Общая таблица  {#shared-table}

В этом подходе данные всех арендаторов хранятся в одной общей таблице, при этом для идентификации данных каждого арендатора используется поле (или набор полей). Для максимальной производительности это поле должно быть включено в [первичный ключ](/sql-reference/statements/create/table#primary-key). Чтобы гарантировать доступ только к данным соответствующих арендаторов, используется [управление доступом на основе ролей](/operations/access-rights), реализованное с помощью [политик на уровне строк](/operations/access-rights#row-policy-management).

> **Мы рекомендуем этот подход, поскольку им проще всего управлять, особенно когда все арендаторы используют одну и ту же схему данных, а объёмы данных умеренные (< ТБ)**

Объединение всех данных арендаторов в одной таблице повышает эффективность хранения за счёт оптимизированного сжатия данных и снижения накладных расходов на метаданные. Кроме того, упрощаются обновления схемы, так как все данные централизованно управляются.

Этот метод особенно эффективен при работе с большим количеством арендаторов (потенциально до миллионов).

Однако альтернативные подходы могут быть более подходящими, если у арендаторов разные схемы данных или ожидается, что они будут расходиться со временем.

В случаях, когда между арендаторами существует значительная разница в объёмах данных, меньшие арендаторы могут испытывать лишнее влияние на производительность запросов. Отметим, что эта проблема в значительной степени смягчается включением поля арендатора в первичный ключ.

### Пример {#shared-table-example}

Это пример реализации многопользовательской модели с общей таблицей.

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

Вставим тестовые данные.

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

Мы [создаём политики на уровне строк](/sql-reference/statements/create/row-policy), которые ограничивают доступ `user_1` и `user_2` только данными их соответствующих арендаторов.

```sql
-- Create row policies
CREATE ROW POLICY user_filter_1 ON default.events USING tenant_id=1 TO user_1
CREATE ROW POLICY user_filter_2 ON default.events USING tenant_id=2 TO user_2
```

Затем предоставьте права [`GRANT SELECT`](/sql-reference/statements/grant#usage) на общую таблицу с использованием общей роли.

```sql
-- Create role
CREATE ROLE user_role

-- Grant read only to events table.
GRANT SELECT ON default.events TO user_role
GRANT user_role TO user_1
GRANT user_role TO user_2
```


Теперь вы можете подключиться под пользователем `user_1` и выполнить простой запрос SELECT. Будут возвращены только строки первого арендатора.

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

В этом подходе данные каждого арендатора хранятся в отдельной таблице в рамках одной и той же базы данных, что устраняет необходимость в специальном поле для идентификации арендаторов. Доступ пользователей регулируется с помощью [команды GRANT](/sql-reference/statements/grant), что гарантирует, что каждый пользователь может обращаться только к таблицам, содержащим данные соответствующих арендаторов.

> **Использование отдельных таблиц — хороший выбор, когда у арендаторов разные схемы данных.**

В сценариях, когда есть несколько арендаторов с очень большими наборами данных и критичными требованиями к производительности запросов, этот подход может быть эффективнее модели общей таблицы. Поскольку нет необходимости отфильтровывать данные других арендаторов, запросы могут быть более эффективными. Кроме того, первичные ключи можно дополнительно оптимизировать, так как нет необходимости включать дополнительное поле (например, идентификатор арендатора) в первичный ключ. 

Обратите внимание, что этот подход не масштабируется для тысяч арендаторов. См. [ограничения использования](/cloud/bestpractices/usage-limits).

### Пример {#separate-tables-example}

Это пример реализации модели мультитенантности с раздельными таблицами.

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

Вставим фиктивные данные.

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

Затем выполните `GRANT SELECT` для соответствующей таблицы.

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


## Отдельные базы данных {#separate-databases}

Данные каждого арендатора хранятся в отдельной базе данных в пределах одного сервиса ClickHouse.

> **Этот подход полезен, если каждому арендатору требуется большое количество таблиц и, возможно, materialized view, а также используются разные схемы данных. Однако управление такой конфигурацией может стать сложным, если количество арендаторов велико.**

Реализация похожа на подход с отдельными таблицами, но вместо предоставления привилегий на уровне таблиц привилегии выдаются на уровне баз данных.

Имейте в виду, что этот подход не масштабируется для тысяч арендаторов. См. [ограничения использования](/cloud/bestpractices/usage-limits).

### Пример {#separate-databases-example}

Это пример реализации многоклиентской (multi-tenant) модели с отдельными базами данных.

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

Добавим тестовые данные.

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

Затем выдайте права `SELECT` на соответствующую таблицу.

```sql
-- Grant read only to events table.
GRANT SELECT ON tenant_1.events TO user_1
GRANT SELECT ON tenant_2.events TO user_2
```


Теперь вы можете подключиться под пользователем `user_1` и выполнить простой запрос SELECT к таблице events в соответствующей базе данных. В результате будут возвращены только строки первого тенанта.

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

Три описанных выше подхода могут быть дополнительно изолированы с помощью [Warehouses](/cloud/reference/warehouses#what-is-a-warehouse). Данные совместно используются через общее объектное хранилище, но каждый тенант может иметь собственный вычислительный сервис благодаря [разделению вычислительных ресурсов](/cloud/reference/warehouses#what-is-compute-compute-separation) с различным соотношением CPU/Memory. 

Управление пользователями аналогично подходам, описанным ранее, поскольку все сервисы в Warehouse [разделяют одни и те же политики доступа](/cloud/reference/warehouses#database-credentials). 

Обратите внимание, что количество дочерних сервисов в Warehouse ограничено небольшим числом. См. [ограничения Warehouse](/cloud/reference/warehouses#limitations).

## Отдельный облачный сервис {#separate-service}

Наиболее радикальный подход — использовать отдельный сервис ClickHouse для каждого арендатора. 

> **Этот менее распространённый метод может быть решением, если данные арендаторов должны храниться в разных регионах — по юридическим соображениям, требованиям безопасности или из соображений близости.**

Для каждого сервиса должна быть создана учётная запись пользователя, в рамках которой пользователь может получить доступ к данным своего арендатора.

Этот подход сложнее в управлении и создаёт накладные расходы на каждый сервис, так как каждому из них требуется собственная инфраструктура для работы. Сервисами можно управлять через [ClickHouse Cloud API](/cloud/manage/api/api-overview), а оркестрацию также можно реализовать через [официальный Terraform-провайдер](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs).

### Пример {#separate-service-example}

Это пример реализации мультитенантной модели с отдельным сервисом. Обратите внимание, что в примере показано создание таблиц и пользователей на одном сервисе ClickHouse; то же самое потребуется повторить на всех сервисах.

Сначала давайте создадим таблицу `events`.

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

Вставим тестовые данные.

```sql
INSERT INTO events (id, type, timestamp, user_id, data)
VALUES
('7b7e0439-99d0-4590-a4f7-1cfea1e192d1', 'user_login', '2025-03-19 08:00:00', 1001, '{"device": "desktop", "location": "LA"}'),
('846aa71f-f631-47b4-8429-ee8af87b4182', 'purchase', '2025-03-19 08:05:00', 1002, '{"item": "phone", "amount": 799}'),
('6b4d12e4-447d-4398-b3fa-1c1e94d71a2f', 'user_logout', '2025-03-19 08:10:00', 1001, '{"device": "desktop", "location": "LA"}'),
('83b5eb72-aba3-4038-bc52-6c08b6423615', 'purchase', '2025-03-19 08:45:00', 1003, '{"item": "monitor", "amount": 450}'),
('975fb0c8-55bd-4df4-843b-34f5cfeed0a9', 'user_login', '2025-03-19 08:50:00', 1004, '{"device": "desktop", "location": "LA"}')
```

Тогда создадим двух пользователей: `user_1`

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
```

Затем выдайте привилегию `SELECT` на соответствующую таблицу с помощью `GRANT`.

```sql
-- Grant read only to events table.
GRANT SELECT ON events TO user_1
```

Теперь вы можете подключиться как `user_1` к сервису для тенанта 1 и выполнить простой SELECT. Будут возвращены только строки, относящиеся к первому тенанту.

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
