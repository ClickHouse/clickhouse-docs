---
sidebar_label: '适用于 Postgres 的 Azure Flexible Server'
description: '将 Azure Flexible Server for Postgres 设置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/postgres/source/azure-flexible-server-postgres
title: 'Azure Flexible Server for Postgres 源设置指南'
keywords: ['azure', 'flexible server', 'postgres', 'clickpipes', 'wal level']
doc_type: 'guide'
---

import server_parameters from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/server_parameters.png';
import wal_level from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/wal_level.png';
import restart from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/restart.png';
import firewall from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/firewall.png';
import Image from '@theme/IdealImage';

# 适用于 Azure Database for PostgreSQL 灵活服务器的源端设置指南 {#azure-flexible-server-for-postgres-source-setup-guide}

ClickPipes 支持 Postgres 12 及更高版本。

## 启用逻辑复制 {#enable-logical-replication}

**如果** `wal_level` 已设置为 `logical`，**则无需**执行以下步骤。若你是从其他数据复制工具迁移过来，该设置通常已经预先配置好。

1. 点击 **Server parameters** 部分

<Image img={server_parameters} alt="Azure Flexible Server for Postgres 中的 Server Parameters" size="lg" border/>

2. 将 `wal_level` 修改为 `logical`

<Image img={wal_level} alt="在 Azure Flexible Server for Postgres 中将 wal_level 更改为 logical" size="lg" border/>

3. 此更改需要重启服务器。根据提示重启服务器。

<Image img={restart} alt="在更改 wal_level 后重启服务器" size="lg" border/>

## 创建 ClickPipes 用户并授予权限 {#creating-clickpipes-user-and-granting-permissions}

通过管理员用户连接到 Azure Flexible Server PostgreSQL，并运行以下命令：

1. 创建一个专用于 ClickPipes 的 PostgreSQL 用户。

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 为 `clickpipes_user` 提供对要进行表复制的模式（schema）的只读访问权限。下面的示例展示了如何为 `public` 模式设置权限。如果您想为多个模式授权，可以针对每个模式分别运行这三条命令。

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. 为该用户授予复制权限：

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. 创建一个 publication，将在后续用于创建 MIRROR（镜像复制）。

   ```sql
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
   ```

5. 将 `clickpipes_user` 的 `wal_sender_timeout` 设置为 0。

   ```sql
   ALTER ROLE clickpipes_user SET wal_sender_timeout to 0;
   ```

## 将 ClickPipes IP 地址添加到防火墙 {#add-clickpipes-ips-to-firewall}

请按照以下步骤将 [ClickPipes IP 地址](../../index.md#list-of-static-ips) 添加到您的网络中。

1. 转到 **Networking** 选项卡，将这些 [ClickPipes IP 地址](../../index.md#list-of-static-ips) 添加到
   Azure Flexible Server Postgres 的防火墙中；如果使用 SSH 隧道，则将其添加到 Jump Server/Bastion 的防火墙中。

<Image img={firewall} alt="在 Azure Flexible Server for Postgres 中将 ClickPipes IP 地址添加到防火墙" size="lg"/>

## 后续步骤 {#whats-next}

现在你可以[创建你的 ClickPipe](../index.md)，并开始将 Postgres 实例中的数据摄取到 ClickHouse Cloud 中。
请务必记录下在配置 Postgres 实例时使用的连接信息，因为在创建 ClickPipe 的过程中你将需要这些信息。
