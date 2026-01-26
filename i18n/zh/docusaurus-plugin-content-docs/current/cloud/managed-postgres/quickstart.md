---
slug: /cloud/managed-postgres/quickstart
sidebar_label: '快速入门'
title: '快速入门'
description: '体验基于 NVMe 的 Postgres 高性能，并通过原生 ClickHouse 集成引入实时分析'
keywords: ['托管 Postgres', '快速入门', '入门指南', '创建数据库', 'NVMe', '性能']
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


# 托管 Postgres 快速入门 \{#quickstart-for-managed-postgres\}

:::tip 现已可用
托管 Postgres 现已在 ClickHouse Cloud 中以私有预览形式提供！点击[此处](https://clickhouse.com/cloud/postgres)即可在数分钟内开始使用。
:::

ClickHouse 托管 Postgres 是企业级 Postgres，基于 NVMe 存储构建，与 EBS 等网络附加存储相比，可为磁盘受限的工作负载提供最高 10 倍的性能提升。本快速入门分为两个部分：

- **第 1 部分：** 开始使用 NVMe Postgres 并体验其性能
- **第 2 部分：** 通过与 ClickHouse 集成实现实时分析

托管 Postgres 目前在 AWS 的多个区域可用，并在私有预览期间免费。

**在本快速入门中，您将完成以下内容：**

- 创建一个具备 NVMe 加速性能的托管 Postgres 实例
- 加载 100 万条示例事件，直观体验 NVMe 的速度
- 运行查询并体验低延迟性能
- 将数据复制到 ClickHouse 以实现实时分析
- 使用 `pg_clickhouse` 从 Postgres 直接查询 ClickHouse

## 第一部分：NVMe Postgres 入门 \{#part-1\}

### 创建数据库 \{#create-postgres-database\}

要创建新的 Managed Postgres 服务，请在 Cloud Console 的服务列表中点击 **New service** 按钮。随后，您可以选择 Postgres 作为数据库类型。

<Image img={createPg} alt="创建一个托管 Postgres 服务" size="md" border/>

为数据库实例输入名称，并点击 **Create service**。系统会跳转到概览页面。

<Image img={pgOverview} alt="Managed Postgres 概览" size="md" border/>

您的 Managed Postgres 实例将在 3-5 分钟内完成创建并可投入使用。

### 连接到你的数据库 \{#connect\}

在左侧侧边栏中，你会看到一个 [**Connect** 按钮](/cloud/managed-postgres/connection)。点击它以查看你的连接信息以及多种格式的连接字符串。

<Image img={connectModal} alt="Managed Postgres 连接弹窗" size="md" border/>

复制 `psql` 连接字符串并连接到你的数据库。你也可以使用任何兼容 Postgres 的客户端（例如 DBeaver），或任意应用程序库。

### 体验 NVMe 性能 \{#nvme-performance\}

让我们来实际感受一下基于 NVMe 的性能表现。首先，在 psql 中启用计时，以便测量查询执行时间：

```sql
\timing
```

创建两个示例表 `events` 和 `users`：

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

现在插入 100 万条事件，观察 NVMe 的性能表现：

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

:::tip NVMe 性能
在不到 4 秒内插入 100 万行 JSONB 数据。在使用类似 EBS 这类网络附加存储的传统云数据库中，由于网络往返延迟和 IOPS 限流，相同操作通常需要耗时 2-3 倍。NVMe 存储通过将存储与计算节点物理直连来消除这些瓶颈。

实际性能会根据实例规格、当前负载以及数据特性而有所不同。
:::

插入 1,000 个用户：


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


### 对数据运行查询 \{#run-queries\}

现在我们来运行一些查询，看看在使用 NVMe 存储时 Postgres 的响应速度有多快。

**将 100 万条事件按类型聚合：**

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

**带 JSONB 过滤和日期范围的查询：**

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

**将事件与用户关联：**

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

:::note 您的 Postgres 已就绪
现在，您已经拥有一个功能完备、高性能的 Postgres 数据库，可以用于承载事务型工作负载。

继续阅读第 2 部分，了解 ClickHouse 原生集成如何大幅提升您的分析能力。
:::

***


## 第 2 部分：使用 ClickHouse 添加实时分析 \{#part-2\}

虽然 Postgres 在事务型工作负载（OLTP）方面表现优异，但 ClickHouse 是专门为大型数据集上的分析型查询（OLAP）而构建的。将两者集成使用，即可兼具这两种数据库的优势：

- **Postgres** 用于应用程序的事务型数据（插入、更新、点查询）
- **ClickHouse** 用于在数十亿行数据上实现亚秒级分析

本节将介绍如何将 Postgres 数据复制到 ClickHouse，并无缝地对其进行查询。

### 配置与 ClickHouse 的集成 \{#setup-integrate-clickhouse\}

现在我们已经在 Postgres 中有了表和数据，接下来将这些表复制到 ClickHouse 用于分析。首先在侧边栏中点击 **ClickHouse integration**。然后点击 **Replicate data in ClickHouse**。

<Image img={integrationLanding} alt="Managed Postgres integration empty" size="md" border/>

在接下来的表单中，您可以为集成输入一个名称，并选择一个已有的 ClickHouse 实例作为复制目标。如果您还没有 ClickHouse 实例，可以直接在此表单中创建一个。
:::info Important
在继续之前，确保您选择的 ClickHouse 服务处于 Running 状态。
:::

<Image img={postgresAnalyticsForm} alt="Managed Postgres integration form" size="md" border/>

点击 **Next** 进入表选择器。在这里，您需要：

- 选择要复制到的 ClickHouse 数据库。
- 展开 **public** schema，并选择我们之前创建的 users 和 events 表。
- 点击 **Replicate data to ClickHouse**。

<Image img={tablePicker} alt="Managed Postgres table picker" size="md" border/>

复制过程将开始，页面会跳转到集成概览。由于这是第一个集成，初始化基础设施可能需要 2–3 分钟。同时，我们来看看新的 **pg_clickhouse** 扩展。

### 从 Postgres 查询 ClickHouse \{#pg-clickhouse-extension\}

`pg_clickhouse` 扩展允许你在 Postgres 中使用标准 SQL 直接查询 ClickHouse 中的数据。这意味着你的应用可以将 Postgres 用作覆盖事务型和分析型数据的统一查询层。详见[完整文档](/integrations/pg_clickhouse)。

启用该扩展：

```sql
CREATE EXTENSION pg_clickhouse;
```

然后，创建到 ClickHouse 的外部服务器（foreign server）连接。使用 `http` 驱动并将端口设置为 `8443`，以建立安全连接：

```sql
CREATE SERVER ch FOREIGN DATA WRAPPER clickhouse_fdw
       OPTIONS(driver 'http', host '<clickhouse_cloud_host>', dbname '<database_name>', port '8443');
```

将 `<clickhouse_cloud_host>` 替换为您的 ClickHouse 主机名，将 `<database_name>` 替换为您在复制配置时选择的数据库。您可以在 ClickHouse 服务的侧边栏中点击 **Connect** 来找到该主机名。

<Image img={getClickHouseHost} alt="获取 ClickHouse 主机名" size="md" border />

现在，我们将 Postgres 用户映射到 ClickHouse 服务的凭据：

```sql
CREATE USER MAPPING FOR CURRENT_USER SERVER ch 
OPTIONS (user 'default', password '<clickhouse_password>');
```

现在将 ClickHouse 表导入到 Postgres 的一个 schema 中：

```sql
CREATE SCHEMA organization;
IMPORT FOREIGN SCHEMA "<database_name>" FROM SERVER ch INTO organization;
```

将 `<database_name>` 替换为你在创建服务器时使用的同一数据库名称。

现在你可以在 Postgres 客户端中查看所有 ClickHouse 表：

```sql
\det+ organization.*
```


### 查看分析数据的实际效果 \{#analytics-after-integration\}

现在回到集成页面查看一下。此时你应该会看到初始复制过程已经完成。点击集成名称来查看详细信息。

<Image img={analyticsList} alt="Managed Postgres 分析列表" size="md" border/>

点击服务名称，会打开 ClickHouse 控制台，在那里你可以看到已复制的表。

<Image img={replicatedTables} alt="ClickHouse 中的 Managed Postgres 已复制表" size="md" border/>

### 对比 Postgres 与 ClickHouse 的性能 \{#performance-comparison\}

现在我们来运行一些分析型查询，并比较 Postgres 与 ClickHouse 之间的性能。注意，副本表使用命名约定 `public_<table_name>`。

**查询 1：按活跃度排序的用户**

此查询通过多个聚合找到最活跃的用户：

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

**查询 2：按国家和平台统计用户参与度**

此查询将 events 表与 users 表进行关联，并计算参与度指标：

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

**性能对比：**

| 查询               | Postgres (NVMe) | ClickHouse (通过 pg&#95;clickhouse) | 加速比  |
| ---------------- | --------------- | --------------------------------- | ---- |
| 活跃用户排行（5 个聚合）    | 555 ms          | 164 ms                            | 3.4x |
| 用户参与度（JOIN + 聚合） | 1,246 ms        | 170 ms                            | 7.3x |

:::tip 何时使用 ClickHouse
即使在这个只有 100 万行的数据集上，ClickHouse 在带有 JOIN 和多重聚合的复杂分析查询方面也能提供 3–7 倍的性能提升。随着规模增大（超过 1 亿行），差异会更加显著，此时借助 ClickHouse 的列式存储和向量化执行，可以实现 10–100 倍的加速。

查询时间会因实例规格、服务之间的网络延迟、数据特性以及当前负载而变化。
:::


## 清理 \{#cleanup\}

要删除在本快速入门中创建的资源：

1. 首先，从 ClickHouse 服务中删除 ClickPipe 集成
2. 然后，从 Cloud 控制台中删除 Managed Postgres 实例