---
slug: /cloud/bestpractices/multi-tenancy
sidebar_label: '多租户'
title: '多租户'
description: '实现多租户的最佳实践'
doc_type: 'guide'
keywords: ['multitenancy', 'isolation', 'best practices', 'architecture', 'multi-tenant']
---

在 SaaS 数据分析平台中，让多个租户（例如组织、客户或业务部门）共享同一套数据库基础设施，同时在逻辑上保持各自数据的隔离是很常见的场景。这样可以让不同用户在同一平台上安全地访问各自的数据。

根据具体需求，可以采用不同方式来实现多租户。下面是使用 ClickHouse Cloud 实现这些方式的指南。



## 共享表 {#shared-table}

在这种方法中,所有租户的数据都存储在单个共享表中,通过一个字段(或一组字段)来标识每个租户的数据。为了最大化性能,该字段应包含在[主键](/sql-reference/statements/create/table#primary-key)中。为了确保用户只能访问属于其各自租户的数据,我们使用通过[行策略](/operations/access-rights#row-policy-management)实现的[基于角色的访问控制](/operations/access-rights)。

> **我们推荐使用这种方法,因为它是最简单的管理方式,特别适用于所有租户共享相同数据模式且数据量适中(< TB)的场景**

通过将所有租户数据整合到单个表中,可以通过优化数据压缩和减少元数据开销来提高存储效率。此外,由于所有数据都集中管理,模式更新也更加简便。

这种方法特别适合处理大量租户(可能达到数百万个)的场景。

但是,如果租户具有不同的数据模式或预期随时间推移而产生差异,则其他方法可能更合适。

在租户之间数据量存在显著差距的情况下,较小的租户可能会受到不必要的查询性能影响。请注意,通过在主键中包含租户字段,这个问题在很大程度上可以得到缓解。

### 示例 {#shared-table-example}

以下是共享表多租户模型实现的示例。

首先,让我们创建一个在主键中包含 `tenant_id` 字段的共享表。

```sql
--- 创建表 events。使用 tenant_id 作为主键的一部分
CREATE TABLE events
(
    tenant_id UInt32,                 -- 租户标识符
    id UUID,                    -- 唯一事件 ID
    type LowCardinality(String), -- 事件类型
    timestamp DateTime,          -- 事件时间戳
    user_id UInt32,               -- 触发事件的用户 ID
    data String,                 -- 事件数据
)
ORDER BY (tenant_id, timestamp)
```

让我们插入一些模拟数据。


```sql
-- 插入一些虚拟数据行
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

接下来我们创建两个用户 `user_1` 和 `user_2`。

```sql
-- 创建用户
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

我们[创建行策略](/sql-reference/statements/create/row-policy)，将 `user_1` 和 `user_2` 的访问权限限制为只能访问各自租户的数据。

```sql
-- 创建行级策略
CREATE ROW POLICY user_filter_1 ON default.events USING tenant_id=1 TO user_1
CREATE ROW POLICY user_filter_2 ON default.events USING tenant_id=2 TO user_2
```

然后使用一个公共角色在共享表上授予 [`GRANT SELECT`](/sql-reference/statements/grant#usage) 权限。

```sql
-- 创建角色
CREATE ROLE user_role

-- 授予 events 表的只读权限
GRANT SELECT ON default.events TO user_role
GRANT user_role TO user_1
GRANT user_role TO user_2
```

现在你可以使用 `user_1` 身份连接，并运行一个简单的 SELECT 查询。只会返回来自第一个租户的行。

```sql
-- 以 user_1 身份登录
SELECT *
FROM events
```


┌─tenant_id─┬─id───────────────────────────────────┬─type────────┬───────────timestamp─┬─user_id─┬─data────────────────────────────────────┐

1. │ 1 │ 7b7e0439-99d0-4590-a4f7-1cfea1e192d1 │ user_login │ 2025-03-19 08:00:00 │ 1001 │ {"device": "desktop", "location": "LA"} │
2. │ 1 │ 846aa71f-f631-47b4-8429-ee8af87b4182 │ purchase │ 2025-03-19 08:05:00 │ 1002 │ {"item": "phone", "amount": 799} │
3. │ 1 │ 6b4d12e4-447d-4398-b3fa-1c1e94d71a2f │ user_logout │ 2025-03-19 08:10:00 │ 1001 │ {"device": "desktop", "location": "LA"} │
4. │ 1 │ 83b5eb72-aba3-4038-bc52-6c08b6423615 │ purchase │ 2025-03-19 08:45:00 │ 1003 │ {"item": "monitor", "amount": 450} │
5. │ 1 │ 975fb0c8-55bd-4df4-843b-34f5cfeed0a9 │ user_login │ 2025-03-19 08:50:00 │ 1004 │ {"device": "desktop", "location": "LA"} │
   └───────────┴──────────────────────────────────────┴─────────────┴─────────────────────┴─────────┴─────────────────────────────────────────┘

```

```


## 独立表 {#separate-tables}

在这种方法中,每个租户的数据存储在同一数据库内的独立表中,无需使用特定字段来标识租户。用户访问通过 [GRANT 语句](/sql-reference/statements/grant)进行控制,确保每个用户只能访问包含其租户数据的表。

> **当租户具有不同的数据模式时,使用独立表是一个不错的选择。**

对于涉及少数租户且拥有超大数据集、查询性能至关重要的场景,这种方法可能优于共享表模型。由于无需过滤其他租户的数据,查询效率更高。此外,主键可以进一步优化,因为无需在主键中包含额外字段(例如租户 ID)。

请注意,这种方法不适用于数千个租户的场景。请参阅[使用限制](/cloud/bestpractices/usage-limits)。

### 示例 {#separate-tables-example}

这是独立表多租户模型实现的示例。

首先,让我们创建两个表,一个用于 `tenant_1` 的事件,另一个用于 `tenant_2` 的事件。

```sql
-- 为租户 1 创建表
CREATE TABLE events_tenant_1
(
    id UUID,                    -- 唯一事件 ID
    type LowCardinality(String), -- 事件类型
    timestamp DateTime,          -- 事件时间戳
    user_id UInt32,               -- 触发事件的用户 ID
    data String,                 -- 事件数据
)
ORDER BY (timestamp, user_id) -- 主键可以专注于其他属性

-- 为租户 2 创建表
CREATE TABLE events_tenant_2
(
    id UUID,                    -- 唯一事件 ID
    type LowCardinality(String), -- 事件类型
    timestamp DateTime,          -- 事件时间戳
    user_id UInt32,               -- 触发事件的用户 ID
    data String,                 -- 事件数据
)
ORDER BY (timestamp, user_id) -- 主键可以专注于其他属性
```

让我们插入模拟数据。

```sql
INSERT INTO events_tenant_1 (id, type, timestamp, user_id, data)
VALUES
('7b7e0439-99d0-4590-a4f7-1cfea1e192d1', 'user_login', '2025-03-19 08:00:00', 1001, '{"device": "desktop", "location": "LA"}'),
('846aa71f-f631-47b4-8429-ee8af87b4182', 'purchase', '2025-03-19 08:05:00', 1002, '{"item": "phone", "amount": 799}'),
('6b4d12e4-447d-4398-b3fa-1c1e94d71a2f', 'user_logout', '2025-03-19 08:10:00', 1001, '{"device": "desktop", "location": "LA"}'),
('83b5eb72-aba3-4038-bc52-6c08b6423615', 'purchase', '2025-03-19 08:45:00', 1003, '{"item": "monitor", "amount": 450}'),
('975fb0c8-55bd-4df4-843b-34f5cfeed0a9', 'user_login', '2025-03-19 08:50:00', 1004, '{"device": "desktop", "location": "LA"}')

```


INSERT INTO events_tenant_2 (id, type, timestamp, user_id, data)
VALUES
('7162f8ea-8bfd-486a-a45e-edfc3398ca93', 'user_login', '2025-03-19 08:12:00', 2001, '{"device": "mobile", "location": "SF"}'),
('6b5f3e55-5add-479e-b89d-762aa017f067', 'purchase', '2025-03-19 08:15:00', 2002, '{"item": "headphones", "amount": 199}'),
('43ad35a1-926c-4543-a133-8672ddd504bf', 'user_logout', '2025-03-19 08:20:00', 2001, '{"device": "mobile", "location": "SF"}'),
('f50aa430-4898-43d0-9d82-41e7397ba9b8', 'purchase', '2025-03-19 08:55:00', 2003, '{"item": "laptop", "amount": 1200}'),
('5c150ceb-b869-4ebb-843d-ab42d3cb5410', 'user_login', '2025-03-19 09:00:00', 2004, '{"device": "mobile", "location": "SF"}')

````

接下来创建两个用户 `user_1` 和 `user_2`。

```sql
-- 创建用户
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
````

然后对相应的表授予 `GRANT SELECT` 权限。

```sql
-- 授予 events 表的只读权限。
GRANT SELECT ON default.events_tenant_1 TO user_1
GRANT SELECT ON default.events_tenant_2 TO user_2
```

现在可以以 `user_1` 身份连接并从该用户对应的表中运行简单的查询。仅返回第一个租户的行。

```sql
-- 以 user_1 身份登录
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

每个租户的数据存储在同一个 ClickHouse 服务中的独立数据库内。

> **当每个租户需要大量表和物化视图,且具有不同的数据模式时,此方法非常有用。但是,当租户数量较多时,管理可能会变得困难。**

该实现方式与独立表方法类似,但权限授予是在数据库级别而非表级别。

请注意,此方法不适用于数千个租户的场景。请参阅[使用限制](/cloud/bestpractices/usage-limits)。

### 示例 {#separate-databases-example}

以下是独立数据库多租户模型实现的示例。

首先,让我们创建两个数据库,一个用于 `tenant_1`,另一个用于 `tenant_2`。

```sql
-- 为 tenant_1 创建数据库
CREATE DATABASE tenant_1;

-- 为 tenant_2 创建数据库
CREATE DATABASE tenant_2;
```

```sql
-- 为 tenant_1 创建表
CREATE TABLE tenant_1.events
(
    id UUID,                    -- 唯一事件 ID
    type LowCardinality(String), -- 事件类型
    timestamp DateTime,          -- 事件时间戳
    user_id UInt32,               -- 触发事件的用户 ID
    data String,                 -- 事件数据
)
ORDER BY (timestamp, user_id);

-- 为 tenant_2 创建表
CREATE TABLE tenant_2.events
(
    id UUID,                    -- 唯一事件 ID
    type LowCardinality(String), -- 事件类型
    timestamp DateTime,          -- 事件时间戳
    user_id UInt32,               -- 触发事件的用户 ID
    data String,                 -- 事件数据
)
ORDER BY (timestamp, user_id);
```

接下来插入示例数据。

```sql
INSERT INTO tenant_1.events (id, type, timestamp, user_id, data)
VALUES
('7b7e0439-99d0-4590-a4f7-1cfea1e192d1', 'user_login', '2025-03-19 08:00:00', 1001, '{"device": "desktop", "location": "LA"}'),
('846aa71f-f631-47b4-8429-ee8af87b4182', 'purchase', '2025-03-19 08:05:00', 1002, '{"item": "phone", "amount": 799}'),
('6b4d12e4-447d-4398-b3fa-1c1e94d71a2f', 'user_logout', '2025-03-19 08:10:00', 1001, '{"device": "desktop", "location": "LA"}'),
('83b5eb72-aba3-4038-bc52-6c08b6423615', 'purchase', '2025-03-19 08:45:00', 1003, '{"item": "monitor", "amount": 450}'),
('975fb0c8-55bd-4df4-843b-34f5cfeed0a9', 'user_login', '2025-03-19 08:50:00', 1004, '{"device": "desktop", "location": "LA"}')

```


INSERT INTO tenant_2.events (id, type, timestamp, user_id, data)
VALUES
('7162f8ea-8bfd-486a-a45e-edfc3398ca93', 'user_login', '2025-03-19 08:12:00', 2001, '{"device": "mobile", "location": "SF"}'),
('6b5f3e55-5add-479e-b89d-762aa017f067', 'purchase', '2025-03-19 08:15:00', 2002, '{"item": "headphones", "amount": 199}'),
('43ad35a1-926c-4543-a133-8672ddd504bf', 'user_logout', '2025-03-19 08:20:00', 2001, '{"device": "mobile", "location": "SF"}'),
('f50aa430-4898-43d0-9d82-41e7397ba9b8', 'purchase', '2025-03-19 08:55:00', 2003, '{"item": "laptop", "amount": 1200}'),
('5c150ceb-b869-4ebb-843d-ab42d3cb5410', 'user_login', '2025-03-19 09:00:00', 2004, '{"device": "mobile", "location": "SF"}')

````

接下来创建两个用户 `user_1` 和 `user_2`。

```sql
-- 创建用户
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
````

然后对相应的表授予 `SELECT` 权限。

```sql
-- 对 events 表授予只读权限。
GRANT SELECT ON tenant_1.events TO user_1
GRANT SELECT ON tenant_2.events TO user_2
```

现在可以以 `user_1` 身份连接,并在相应数据库的 events 表上运行简单的 SELECT 查询。仅返回第一个租户的行。

```sql
-- 以 user_1 身份登录
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

上述三种方法还可以通过使用 [Warehouse](/cloud/reference/warehouses#what-is-a-warehouse) 进一步隔离。数据通过公共对象存储共享,但借助 [计算-计算分离](/cloud/reference/warehouses#what-is-compute-compute-separation),每个租户可以拥有自己的计算服务,并配置不同的 CPU/内存比例。

用户管理与前面描述的方法类似,因为 Warehouse 中的所有服务都 [共享访问控制](/cloud/reference/warehouses#database-credentials)。

请注意,Warehouse 中的子服务数量有限。请参阅 [Warehouse 限制](/cloud/reference/warehouses#limitations)。


## 独立云服务 {#separate-service}

最彻底的方法是为每个租户使用独立的 ClickHouse 服务。

> **如果出于法律、安全或地理位置等原因需要将租户数据存储在不同区域,这种较少使用的方法将是一种解决方案。**

必须在每个服务上创建用户账户,以便用户可以访问其对应租户的数据。

这种方法管理难度较大,并且每个服务都会带来额外开销,因为它们各自需要独立的基础设施来运行。服务可以通过 [ClickHouse Cloud API](/cloud/manage/api/api-overview) 进行管理,也可以通过[官方 Terraform provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) 进行编排。

### 示例 {#separate-service-example}

这是一个独立服务多租户模型实现的示例。请注意,该示例展示了在一个 ClickHouse 服务上创建表和用户的过程,同样的操作需要在所有服务上复制。

首先,让我们创建表 `events`

```sql
-- 为 tenant_1 创建表
CREATE TABLE events
(
    id UUID,                    -- 唯一事件 ID
    type LowCardinality(String), -- 事件类型
    timestamp DateTime,          -- 事件时间戳
    user_id UInt32,               -- 触发事件的用户 ID
    data String,                 -- 事件数据
)
ORDER BY (timestamp, user_id);
```

让我们插入模拟数据。

```sql
INSERT INTO events (id, type, timestamp, user_id, data)
VALUES
('7b7e0439-99d0-4590-a4f7-1cfea1e192d1', 'user_login', '2025-03-19 08:00:00', 1001, '{"device": "desktop", "location": "LA"}'),
('846aa71f-f631-47b4-8429-ee8af87b4182', 'purchase', '2025-03-19 08:05:00', 1002, '{"item": "phone", "amount": 799}'),
('6b4d12e4-447d-4398-b3fa-1c1e94d71a2f', 'user_logout', '2025-03-19 08:10:00', 1001, '{"device": "desktop", "location": "LA"}'),
('83b5eb72-aba3-4038-bc52-6c08b6423615', 'purchase', '2025-03-19 08:45:00', 1003, '{"item": "monitor", "amount": 450}'),
('975fb0c8-55bd-4df4-843b-34f5cfeed0a9', 'user_login', '2025-03-19 08:50:00', 1004, '{"device": "desktop", "location": "LA"}')
```

然后让我们创建用户 `user_1`

```sql
-- 创建用户
CREATE USER user_1 IDENTIFIED BY '<password>'
```

然后在相应的表上授予 `SELECT` 权限。

```sql
-- 授予 events 表的只读权限。
GRANT SELECT ON events TO user_1
```

现在您可以在租户 1 的服务上以 `user_1` 身份连接并运行简单的查询。仅返回第一个租户的数据行。

```sql
-- 以 user_1 身份登录
SELECT *
FROM events

```


┌─id───────────────────────────────────┬─type────────┬───────────timestamp─┬─user_id─┬─data────────────────────────────────────┐

1. │ 7b7e0439-99d0-4590-a4f7-1cfea1e192d1 │ user_login │ 2025-03-19 08:00:00 │ 1001 │ {"device": "desktop", "location": "LA"} │
2. │ 846aa71f-f631-47b4-8429-ee8af87b4182 │ purchase │ 2025-03-19 08:05:00 │ 1002 │ {"item": "phone", "amount": 799} │
3. │ 6b4d12e4-447d-4398-b3fa-1c1e94d71a2f │ user_logout │ 2025-03-19 08:10:00 │ 1001 │ {"device": "desktop", "location": "LA"} │
4. │ 83b5eb72-aba3-4038-bc52-6c08b6423615 │ purchase │ 2025-03-19 08:45:00 │ 1003 │ {"item": "monitor", "amount": 450} │
5. │ 975fb0c8-55bd-4df4-843b-34f5cfeed0a9 │ user_login │ 2025-03-19 08:50:00 │ 1004 │ {"device": "desktop", "location": "LA"} │
   └──────────────────────────────────────┴─────────────┴─────────────────────┴─────────┴─────────────────────────────────────────┘

```

```
