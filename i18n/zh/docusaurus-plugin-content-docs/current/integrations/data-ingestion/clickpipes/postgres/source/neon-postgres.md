---
sidebar_label: Neon Postgres
description: 设置 Neon Postgres 实例作为 ClickPipes 的数据源
slug: /integrations/clickpipes/postgres/source/neon-postgres
---

import neon_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-commands.png'
import neon_enable_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enable-replication.png'
import neon_enabled_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enabled-replication.png'
import neon_ip_allow from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-ip-allow.png'
import neon_conn_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-conn-details.png'


# Neon Postgres 源设置指南

这是关于如何设置 Neon Postgres 的指南，您可以将其用于 ClickPipes 的复制。
请确保您已登录到您的 [Neon 控制台](https://console.neon.tech/app/projects) 进行此设置。

## 创建具有权限的用户 {#creating-a-user-with-permissions}

让我们为 ClickPipes 创建一个新用户，并赋予其适合 CDC 的必要权限，
同时创建一个我们将在复制过程中使用的发布。

为此，您可以前往 **SQL 控制台** 选项卡。
在这里，我们可以运行以下 SQL 命令：

```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- 给用户分配复制权限
  ALTER USER clickpipes_user REPLICATION;

-- 创建一个发布。我们将在创建镜像时使用这个
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

<img src={neon_commands} alt="用户和发布命令"/>

点击 **运行** 以准备好发布和用户。

## 启用逻辑复制 {#enable-logical-replication}
在 Neon 中，您可以通过 UI 启用逻辑复制。这对于 ClickPipes 的 CDC 复制数据是必要的。
前往 **设置** 选项卡，然后进入 **逻辑复制** 部分。

<img src={neon_enable_replication} alt="启用逻辑复制"/>

点击 **启用** 即可完成设置。您启用后应会看到以下成功消息。

<img src={neon_enabled_replication} alt="逻辑复制已启用"/>

让我们验证您在 Neon Postgres 实例中的以下设置：
```sql
SHOW wal_level; -- 应该是 logical
SHOW max_wal_senders; -- 应该是 10
SHOW max_replication_slots; -- 应该是 10
```

## IP 白名单（用于 Neon 企业计划） {#ip-whitelisting-for-neon-enterprise-plan}
如果您拥有 Neon 企业计划，您可以将 [ClickPipes IPs](../../index.md#list-of-static-ips) 列入白名单，以允许 ClickPipes 复制到您的 Neon Postgres 实例。
为此，您可以点击 **设置** 选项卡并进入 **IP 允许** 部分。

<img src={neon_ip_allow} alt="允许 IPs 屏幕"/>

## 复制连接详情 {#copy-connection-details}
现在我们已经准备好了用户、发布和启用了复制，我们可以复制连接详情以创建新的 ClickPipe。
前往 **仪表板**，在显示连接字符串的文本框中，
将视图更改为 **仅参数**。我们将在下一步中需要这些参数。

<img src={neon_conn_details} alt="连接详情"/>

## 接下来做什么？ {#whats-next}

您现在可以 [创建您的 ClickPipe](../index.md) 并开始将数据从您的 Postgres 实例导入 ClickHouse Cloud。
请确保记下您在设置 Postgres 实例时使用的连接详情，因为您将在 ClickPipe 创建过程中需要这些信息。
