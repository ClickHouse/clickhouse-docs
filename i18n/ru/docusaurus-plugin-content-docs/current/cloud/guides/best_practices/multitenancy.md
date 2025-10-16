---
'slug': '/cloud/bestpractices/multi-tenancy'
'sidebar_label': 'Многомерность'
'title': 'Многомерность'
'description': 'Лучшие практики для реализации многомерности'
'doc_type': 'guide'
---
На платформе аналитики данных SaaS довольно распространено, что несколько арендаторов, таких как организации, клиенты или бизнес-единицы, используют одну и ту же инфраструктуру базы данных, при этом обеспечивая логическое разделение своих данных. Это позволяет различным пользователям безопасно получать доступ к своим данным в рамках одной платформы.

В зависимости от требований существуют разные способы реализации многосъемности. Ниже представлен гид по их реализации с помощью ClickHouse Cloud.

## Общая таблица  {#shared-table}

В этом подходе данные всех арендаторов хранятся в одной общей таблице, с полем (или набором полей), используемым для идентификации данных каждого арендатора. Для максимизации производительности это поле следует включить в [первичный ключ](/sql-reference/statements/create/table#primary-key). Чтобы гарантировать, что пользователи могут получать доступ лишь к данным, принадлежащим их арендаторам, используется [контроль доступа на основе ролей](/operations/access-rights), реализуемый через [политики строк](/operations/access-rights#row-policy-management).

> **Мы рекомендуем этот подход, так как он является самым простым в управлении, особенно когда все арендаторы используют одну и ту же схему данных и объем данных умеренный (< TBs)**

Консолидируя все данные арендаторов в одну таблицу, улучшается эффективность хранения благодаря оптимизированному сжатию данных и снижению накладных расходов на метаданные. Кроме того, обновления схемы упрощаются, так как все данные централизованно управляются.

Этот метод особенно эффективен для обработки большого числа арендаторов (возможно, миллионов).

Однако альтернативные подходы могут быть более подходящими, если арендаторы имеют различные схемы данных или ожидается, что они будут расходиться со временем.

В случаях, когда существует значительный разрыв в объеме данных между арендаторами, меньшие арендаторы могут столкнуться с ненужными проблемами производительности запросов. Обратите внимание, что эта проблема в значительной степени уменьшается за счет включения поля арендатора в первичный ключ.

### Пример {#shared-table-example}

Это пример реализации модели многосъемности с общей таблицей.

Сначала создадим общую таблицу с полем `tenant_id`, включенным в первичный ключ.

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

Вставим фиктивные данные.

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

Затем создадим двух пользователей `user_1` и `user_2`.

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

Мы [создаем политики строк](/sql-reference/statements/create/row-policy), которые ограничивают `user_1` и `user_2` доступом только к данным их арендаторов.

```sql
-- Create row policies
CREATE ROW POLICY user_filter_1 ON default.events USING tenant_id=1 TO user_1
CREATE ROW POLICY user_filter_2 ON default.events USING tenant_id=2 TO user_2
```

Затем [`GRANT SELECT`](/sql-reference/statements/grant#usage) привилегии на общую таблицу, используя общую роль.

```sql
-- Create role
CREATE ROLE user_role

-- Grant read only to events table.
GRANT SELECT ON default.events TO user_role
GRANT user_role TO user_1
GRANT user_role TO user_2
```

Теперь вы можете подключиться как `user_1` и выполнить простой выбор. Будут возвращены только строки из первого арендатора.

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

В этом подходе данные каждого арендатора хранятся в отдельной таблице в одной и той же базе данных, что исключает необходимость в конкретном поле для идентификации арендаторов. Доступ пользователей обеспечивается с помощью [оператора GRANT](/sql-reference/statements/grant), гарантируя, что каждый пользователь может получать доступ только к таблицам с данными его арендатора.

> **Использование отдельных таблиц является хорошим выбором, когда арендаторы имеют различные схемы данных.**

Для сценариев с несколькими арендаторами и очень большими наборами данных, где производительность запросов критична, этот подход может превзойти модель общей таблицы. Поскольку нет необходимости отфильтровывать данные других арендаторов, запросы могут быть более эффективными. Кроме того, первичные ключи могут быть дополнительно оптимизированы, так как нет необходимости включать дополнительное поле (например, идентификатор арендатора) в первичный ключ.

Обратите внимание, что этот подход не масштабируется для 1000 арендаторов. Смотрите [лимиты использования](/cloud/bestpractices/usage-limits).

### Пример {#separate-tables-example}

Это пример реализации модели многосъемности с отдельными таблицами.

Сначала создадим две таблицы, одну для событий от `tenant_1` и одну для событий от `tenant_2`.

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

Затем `GRANT SELECT` привилегии на соответствующую таблицу.

```sql
-- Grant read only to events table.
GRANT SELECT ON default.events_tenant_1 TO user_1
GRANT SELECT ON default.events_tenant_2 TO user_2
```

Теперь вы можете подключиться как `user_1` и выполнить простой выбор из таблицы, соответствующей этому пользователю. Будут возвращены только строки из первого арендатора.

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

Данные каждого арендатора хранятся в отдельной базе данных в одном и том же сервисе ClickHouse.

> **Этот подход полезен, если каждому арендатору требуется большое количество таблиц и, возможно, материализованных представлений, и имеет разные схемы данных. Однако управление может стать сложным, если арендаторов становится много.**

Реализация аналогична подходу с отдельными таблицами, но вместо предоставления привилегий на уровне таблицы привилегии предоставляются на уровне базы данных.

Обратите внимание, что этот подход не масштабируется для 1000 арендаторов. Смотрите [лимиты использования](/cloud/bestpractices/usage-limits).

### Пример {#separate-databases-example}

Это пример реализации модели многосъемности с отдельными базами данных.

Сначала создадим две базы данных, одну для `tenant_1` и одну для `tenant_2`.

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

Вставим фиктивные данные.

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

Затем создадим двух пользователей `user_1` и `user_2`.

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

Затем `GRANT SELECT` привилегии на соответствующую таблицу.

```sql
-- Grant read only to events table.
GRANT SELECT ON tenant_1.events TO user_1
GRANT SELECT ON tenant_2.events TO user_2
```

Теперь вы можете подключиться как `user_1` и выполнить простой выбор на таблице событий соответствующей базы данных. Будут возвращены только строки из первого арендатора.

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

## Разделение вычислений и вычислений {#compute-compute-separation}

Три описанных выше подхода также могут быть дополнительно изолированы с помощью [Складов](/cloud/reference/warehouses#what-is-a-warehouse). Данные делятся через общее объектное хранилище, но каждый арендатор может иметь свою собственную вычислительную систему благодаря [разделению вычислений и вычислений](/cloud/reference/warehouses#what-is-compute-compute-separation) с различным соотношением CPU/Памяти.

Управление пользователями аналогично описанным ранее подходам, так как все услуги в складе [делят контроль доступа](/cloud/reference/warehouses#database-credentials).

Обратите внимание, что количество дочерних сервисов в складе ограничено небольшим числом. Смотрите [Ограничения складов](/cloud/reference/warehouses#limitations).

## Отдельный облачный сервис {#separate-service}

Самый радикальный подход — использовать отдельный сервис ClickHouse для каждого арендатора.

> **Этот менее распространенный метод будет решением, если данные арендаторов должны храниться в разных регионах — по юридическим, безопасности или близости.**

Необходимо создать учетную запись пользователя на каждом сервисе, где пользователь может получить доступ к данным своего арендатора.

Этот подход сложнее в управлении и несет накладные расходы на каждый сервис, так как каждый из них требует своей инфраструктуры для работы. Услуги могут управляться через [ClickHouse Cloud API](/cloud/manage/api/api-overview), с возможностью оркестрации также через [официальный провайдер Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs).

### Пример {#separate-service-example}

Это пример реализации модели многосъемности с отдельным сервисом. Обратите внимание, что в примере показано создание таблиц и пользователей на одном сервисе ClickHouse, то же самое будет необходимо реплицировать на всех сервисах.

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

Вставим фиктивные данные.

```sql
INSERT INTO events (id, type, timestamp, user_id, data)
VALUES
('7b7e0439-99d0-4590-a4f7-1cfea1e192d1', 'user_login', '2025-03-19 08:00:00', 1001, '{"device": "desktop", "location": "LA"}'),
('846aa71f-f631-47b4-8429-ee8af87b4182', 'purchase', '2025-03-19 08:05:00', 1002, '{"item": "phone", "amount": 799}'),
('6b4d12e4-447d-4398-b3fa-1c1e94d71a2f', 'user_logout', '2025-03-19 08:10:00', 1001, '{"device": "desktop", "location": "LA"}'),
('83b5eb72-aba3-4038-bc52-6c08b6423615', 'purchase', '2025-03-19 08:45:00', 1003, '{"item": "monitor", "amount": 450}'),
('975fb0c8-55bd-4df4-843b-34f5cfeed0a9', 'user_login', '2025-03-19 08:50:00', 1004, '{"device": "desktop", "location": "LA"}')
```

Затем создадим двух пользователей `user_1`

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
```

Затем `GRANT SELECT` привилегии на соответствующую таблицу.

```sql
-- Grant read only to events table.
GRANT SELECT ON events TO user_1
```

Теперь вы можете подключиться как `user_1` на сервис для арендатора 1 и выполнить простой выбор. Будут возвращены только строки из первого арендатора.

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