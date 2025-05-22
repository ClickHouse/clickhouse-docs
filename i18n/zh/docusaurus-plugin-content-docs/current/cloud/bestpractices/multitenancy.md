在SaaS数据分析平台上，多个租户（例如组织、客户或业务部门）共享相同的数据库基础设施，同时保持其数据的逻辑分离。这允许不同的用户在同一平台上安全地访问其自身的数据。

根据需求，有不同的方法来实现多租户。以下是如何在ClickHouse Cloud中实现它们的指南。

## 共享表  {#shared-table}

在这种方法中，所有租户的数据存储在一个共享表中，使用一个字段（或一组字段）来标识每个租户的数据。为了最大化性能，这个字段应包含在[主键](/sql-reference/statements/create/table#primary-key)中。为了确保用户只能访问各自租户的数据，我们使用[基于角色的访问控制](/operations/access-rights)，通过[行策略](/operations/access-rights#row-policy-management)实现。

> **我们建议这种方法，因为这是最简单的管理方式，特别是当所有租户共享相同的数据架构且数据量适中（< TBs）时**

通过将所有租户数据合并到一个表中，存储效率得到了提高，数据压缩优化和元数据开销减少。此外，由于所有数据集中管理，架构更新得到了简化。

这种方法在处理大量租户（可能是数百万）时特别有效。

然而，如果租户具有不同的数据架构或预计会随着时间的推移而分歧，替代的方法可能更合适。

在租户之间数据量差异显著的情况下，较小的租户可能会遭受不必要的查询性能影响。请注意，通过在主键中包含租户字段，这个问题在很大程度上得以缓解。

### 示例 {#shared-table-example}

这是一个共享表多租户模型实现的示例。

首先，让我们创建一个共享表，主键中包含字段`tenant_id`。

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

让我们插入假数据。

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

然后创建两个用户 `user_1` 和 `user_2`。

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

我们[创建行策略](/sql-reference/statements/create/row-policy)，限制`user_1`和`user_2`只能访问各自租户的数据。

```sql
-- Create row policies
CREATE ROW POLICY user_filter_1 ON default.events USING tenant_id=1 TO user_1
CREATE ROW POLICY user_filter_2 ON default.events USING tenant_id=2 TO user_2
```

然后[`GRANT SELECT`](/sql-reference/statements/grant#usage)权限于共享表，使用一个公共角色。

```sql
-- Create role
CREATE ROLE user_role

-- Grant read only to events table.
GRANT SELECT ON default.events TO user_role
GRANT user_role TO user_1
GRANT user_role TO user_2
```

现在你可以作为`user_1`连接并运行一个简单的选择。只返回第一个租户的行。

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

## 独立表 {#separate-tables}

在这种方法中，每个租户的数据存储在同一数据库中的单独表中，消除了识别租户的特定字段的需要。通过使用[GRANT语句](/sql-reference/statements/grant)来强制用户访问，确保每个用户只能访问包含其租户数据的表。

> **当租户具有不同的数据架构时，使用独立表是一个不错的选择。**

对于涉及几个租户且数据集非常大的场景，其中查询性能至关重要，这种方法可能优于共享表模型。由于无需过滤其他租户的数据，查询可以更高效。此外，主键的进一步优化也是可能的，因为在主键中无需包含额外字段（如租户ID）。

请注意，通常这种方法无法扩展到数千个租户。请参见[使用限制](/cloud/bestpractices/usage-limits)。

### 示例 {#separate-tables-example}

这是一个独立表多租户模型实现的示例。

首先，让我们创建两个表，一个用于`tenant_1`的事件，另一个用于`tenant_2`的事件。

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

让我们插入假数据。

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

然后创建两个用户 `user_1` 和 `user_2`。

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

然后在相应的表上`GRANT SELECT`权限。

```sql
-- Grant read only to events table.
GRANT SELECT ON default.events_tenant_1 TO user_1
GRANT SELECT ON default.events_tenant_2 TO user_2
```

现在你可以作为`user_1`连接并从该用户相应的表中运行简单选择。只返回第一个租户的行。

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

## 独立数据库 {#separate-databases}

每个租户的数据存储在同一ClickHouse服务中的独立数据库内。

> **如果每个租户需要大量表和可能的物化视图，并且具有不同的数据架构，这种方法很有用。然而，如果租户数量很大，管理可能会变得困难。**

实现方式类似于独立表的方法，但不再是在表级别赋予权限，而是在数据库级别赋予权限。

请注意，这种方法无法扩展到数千个租户。请参见[使用限制](/cloud/bestpractices/usage-limits)。

### 示例 {#separate-databases-example}

这是一个独立数据库多租户模型实现的示例。

首先，让我们创建两个数据库，一个用于`tenant_1`，一个用于`tenant_2`。

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

让我们插入假数据。

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

然后创建两个用户 `user_1` 和 `user_2`。

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

然后在相应的表上`GRANT SELECT`权限。

```sql
-- Grant read only to events table.
GRANT SELECT ON tenant_1.events TO user_1
GRANT SELECT ON tenant_2.events TO user_2
```

现在你可以作为`user_1`连接并在适当数据库的事件表上运行简单选择。只返回第一个租户的行。

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

## 计算-计算分离 {#compute-compute-separation}

以上三种方法也可以通过使用[仓库](/cloud/reference/warehouses#what-is-a-warehouse)进行进一步隔离。数据通过共同的对象存储共享，但每个租户可以拥有自己的计算服务，这得益于具有不同CPU/内存比率的[计算-计算分离](/cloud/reference/warehouses#what-is-compute-compute-separation)。

用户管理与上述描述的方法相似，因为仓库中的所有服务[共享访问控制](/cloud/reference/warehouses#database-credentials)。

请注意，仓库中子服务的数量限于少量。见[仓库限制](/cloud/reference/warehouses#limitations)。

## 独立云服务 {#separate-service}

最激进的方法是为每个租户使用不同的ClickHouse服务。

> **这种不常见的方式是如果租户的数据需要存储在不同区域的解决方案 - 出于法律、安全或接近原因。**

必须在每个服务上创建一个用户帐户，用户可以访问其各自租户的数据。

这种方法更加难以管理，并且每个服务都带来开销，因为它们各自需要自己的基础设施进行运行。可以通过[ClickHouse Cloud API](/cloud/manage/api/api-overview)进行服务管理，并且也可以通过[官方Terraform提供程序](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)进行编排。

### 示例 {#separate-service-example}

这是一个独立服务多租户模型实现的示例。请注意，示例显示的是在一个ClickHouse服务上创建表和用户，必须在所有服务上复制相同的内容。

首先，让我们创建表`events`

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

让我们插入假数据。

```sql
INSERT INTO events (id, type, timestamp, user_id, data)
VALUES
('7b7e0439-99d0-4590-a4f7-1cfea1e192d1', 'user_login', '2025-03-19 08:00:00', 1001, '{"device": "desktop", "location": "LA"}'),
('846aa71f-f631-47b4-8429-ee8af87b4182', 'purchase', '2025-03-19 08:05:00', 1002, '{"item": "phone", "amount": 799}'),
('6b4d12e4-447d-4398-b3fa-1c1e94d71a2f', 'user_logout', '2025-03-19 08:10:00', 1001, '{"device": "desktop", "location": "LA"}'),
('83b5eb72-aba3-4038-bc52-6c08b6423615', 'purchase', '2025-03-19 08:45:00', 1003, '{"item": "monitor", "amount": 450}'),
('975fb0c8-55bd-4df4-843b-34f5cfeed0a9', 'user_login', '2025-03-19 08:50:00', 1004, '{"device": "desktop", "location": "LA"}')
```

然后创建两个用户 `user_1`

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
```

然后在相应的表上`GRANT SELECT`权限。

```sql
-- Grant read only to events table.
GRANT SELECT ON events TO user_1
```

现在你可以作为`user_1`在租户1的服务上连接并运行简单选择。只返回第一个租户的行。

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
