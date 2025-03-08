---
sidebar_label: 'Azure Flexible Server for Postgres'
description: '将 Azure Flexible Server for Postgres 设置为 ClickPipes 的数据源'
slug: '/integrations/clickpipes/postgres/source/azure-flexible-server-postgres'
---

import server_parameters from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/server_parameters.png';
import wal_level from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/wal_level.png';
import restart from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/restart.png';
import firewall from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/firewall.png';


# Azure Flexible Server for Postgres 数据源设置指南

ClickPipes 支持 Postgres 12 及更高版本。

## 启用逻辑复制 {#enable-logical-replication}

**如果 `wal_level` 设置为 `logical`，您不需要** 按照以下步骤操作。如果您是从其他数据复制工具迁移的，此设置通常应已预配置。

1. 点击 **服务器参数** 部分

<img src={server_parameters} alt="Azure Flexible Server for Postgres 中的服务器参数" />

2. 将 `wal_level` 编辑为 `logical`

<img src={wal_level} alt="在 Azure Flexible Server for Postgres 中将 wal_level 更改为 logical" />

3. 此更改将需要服务器重启。因此，在请求时重启服务器。

<img src={restart} alt="更改 wal_level 后重启服务器" />

## 创建 ClickPipes 用户并授予权限 {#creating-clickpipes-user-and-granting-permissions}

通过管理员用户连接到您的 Azure Flexible Server Postgres，并运行以下命令：

1. 为 ClickPipes 专门创建一个 Postgres 用户。

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 为您正在复制表的模式提供只读访问权限给 `clickpipes_user`。以下示例显示为 `public` 模式设置权限。如果您想要授予多个模式的访问权限，可以为每个模式运行这三条命令。

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. 授予此用户复制访问权限：

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. 创建将来用于创建 MIRROR（复制）的出版物。

   ```sql
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
   ```

5. 将 `wal_sender_timeout` 设置为 0，针对 `clickpipes_user`。

   ```sql
   ALTER ROLE clickpipes_user SET wal_sender_timeout to 0;
   ```

## 将 ClickPipes IP 添加到防火墙 {#add-clickpipes-ips-to-firewall}

请按照以下步骤将 [ClickPipes IPs](../../index.md#list-of-static-ips) 添加到您的网络中。

1. 转到 **网络** 选项卡，并将 [ClickPipes IPs](../../index.md#list-of-static-ips) 添加到您的 Azure Flexible Server Postgres 的防火墙中，或如果您使用 SSH 隧道，则添加到 Jump Server/Bastion。

<img src={firewall} alt="在 Azure Flexible Server for Postgres 中将 ClickPipes IP 添加到防火墙" />

## 接下来做什么？ {#whats-next}

您现在可以 [创建您的 ClickPipe](../index.md)，并开始将数据从 Postgres 实例导入 ClickHouse Cloud。请确保记录下您在设置 Postgres 实例时使用的连接详细信息，因为在创建 ClickPipe 过程中需要这些信息。
