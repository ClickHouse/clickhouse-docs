---
slug: /cloud/managed-postgres/quickstart
sidebar_label: '快速入门'
title: '快速入门'
description: '创建您的第一个托管 Postgres 数据库并浏览实例仪表盘'
keywords: ['托管 Postgres', '快速入门', '入门指南', '创建数据库']
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


# Managed Postgres 快速入门 \{#quickstart-for-managed-postgres\}

本快速入门指南将帮助您创建首个 Managed Postgres 服务，并将其与 ClickHouse 集成。已具备现有的 ClickHouse 实例将有助于您全面体验 Managed Postgres 的全部功能。

<PrivatePreviewBadge/>

## 创建数据库 \{#create-postgres-database\}

要创建新的 Managed Postgres 服务，请在 Cloud Console 的服务列表中点击 **New service** 按钮。随后，您可以选择 Postgres 作为数据库类型。

<Image img={createPg} alt="创建一个托管 Postgres 服务" size="md" border/>

为数据库实例输入名称，并点击 **Create service**。系统会跳转到概览页面。

<Image img={pgOverview} alt="Managed Postgres 概览" size="md" border/>

您的 Managed Postgres 实例将在几分钟内完成创建并可投入使用。

## 连接并准备一些数据 \{#connect-and-data\}

在左侧侧边栏中，你会看到一个 [**Connect** 按钮](/cloud/managed-postgres/connection)。点击它以查看你的连接信息以及多种格式的连接字符串。

<Image img={connectModal} alt="Managed Postgres 连接弹窗" size="md" border />

你可以复制自己首选格式的连接字符串，并使用任何兼容 Postgres 的客户端（例如 `psql`、DBeaver，或任意应用程序库）连接到你的数据库。

为了快速上手，你可以使用以下 SQL 命令来创建两个示例表并插入一些数据：

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

现在向 `events` 表插入一些数据：

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

然后向 `users` 表插入数据：


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


## 配置与 ClickHouse 的集成 \{#setup-integrate-clickhouse\}

现在我们已经在 Postgres 中有了表和数据，接下来将这些表复制到 ClickHouse 用于分析。首先在侧边栏中点击 **ClickHouse integration**。然后点击 **Replicate data in ClickHouse**。

<Image img={integrationLanding} alt="Managed Postgres integration empty" size="md" border/>

在接下来的表单中，您可以为集成输入一个名称，并选择一个已有的 ClickHouse 实例作为复制目标。如果您还没有 ClickHouse 实例，可以按照 [Quickstart for ClickHouse Cloud](/cloud/clickhouse-cloud/quickstart) 指南创建一个。
:::warning Important
在继续之前，确保您选择的 ClickHouse 服务处于 Running 状态。
:::

<Image img={postgresAnalyticsForm} alt="Managed Postgres integration form" size="md" border/>

点击 **Next** 进入表选择器。在这里，您需要：

- 选择要复制到的 ClickHouse 数据库。
- 展开 **public** schema，并选择我们之前创建的 users 和 events 表。
- 点击 **Replicate data to ClickHouse**。

<Image img={tablePicker} alt="Managed Postgres table picker" size="md" border/>

复制过程将开始，页面会跳转到集成概览。由于这是第一个集成，初始化基础设施可能需要 2–3 分钟。同时，我们来看看新的 **pg_clickhouse** 扩展。

## pg_clickhouse 扩展 \{#pg-clickhouse-extension\}

**pg&#95;clickhouse** 是我们构建的一个 Postgres 扩展，它使您可以通过 Postgres 接口查询 ClickHouse 数据。完整介绍请参见[此处](integrations/pg_clickhouse#introduction)。要使用该扩展，请使用任何与 Postgres 兼容的客户端连接到您的 Managed Postgres 实例，并运行以下 SQL 命令：

```sql
CREATE EXTENSION pg_clickhouse;
```

然后，我们创建一个名为 foreign data wrapper（FDW，外部数据封装器）的对象，用于连接 ClickHouse：

```sql
CREATE SERVER ch FOREIGN DATA WRAPPER clickhouse_fdw
       OPTIONS(driver 'binary', host '<clickhouse_cloud_host>', dbname 'default');
```

你可以通过进入 ClickHouse 服务页面，在侧边栏点击 Connect，并选择 Native 来获取上述的主机地址。

<Image img={getClickHouseHost} alt="获取 ClickHouse 主机" size="md" border />

现在，我们将 Postgres 用户映射到 ClickHouse 服务的凭据：

```sql
CREATE USER MAPPING FOR CURRENT_USER SERVER ch 
OPTIONS (user 'default', password '<clickhouse_password>');
```

现在是导入数据的时候了！添加 `organization` schema，只需将远程 ClickHouse 数据库中的所有表导入到一个 Postgres schema 中：

```sql
CREATE SCHEMA organization;
IMPORT FOREIGN SCHEMA "default" FROM SERVER ch INTO organization;
```

完成！现在你可以在 Postgres 客户端中查看所有 ClickHouse 表：

```sql
postgres=# \det+ organization.*
```


## 集成完成后的分析 \{#analytics-after-integration\}

现在回到集成页面查看一下。此时你应该会看到初始复制过程已经完成。你可以点击该集成的名称来查看更多详细信息。

<Image img={analyticsList} alt="Managed Postgres 分析列表" size="md" border/>

如果你点击服务名称，会跳转到 ClickHouse 控制台，在那里你可以看到我们复制过来的两张表。

<Image img={replicatedTables} alt="ClickHouse 中的 Managed Postgres 已复制表" size="md" border/>