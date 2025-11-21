---
sidebar_label: 'Azure Postgres 灵活服务器'
description: '将 Azure Postgres 灵活服务器配置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/postgres/source/azure-flexible-server-postgres
title: 'Azure Postgres 灵活服务器数据源配置指南'
keywords: ['azure', 'flexible server', 'postgres', 'clickpipes', 'wal level']
doc_type: 'guide'
---

import server_parameters from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/server_parameters.png';
import wal_level from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/wal_level.png';
import restart from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/restart.png';
import firewall from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/firewall.png';
import Image from '@theme/IdealImage';


# Azure PostgreSQL 灵活服务器源端设置指南

ClickPipes 支持 12 及更高版本的 Postgres。



## 启用逻辑复制 {#enable-logical-replication}

如果 `wal_level` 已设置为 `logical`,则**无需**执行以下步骤。如果您正在从其他数据复制工具迁移,此设置通常已预先配置完成。

1. 点击 **Server parameters**(服务器参数)部分

<Image
  img={server_parameters}
  alt='Azure Flexible Server for Postgres 中的服务器参数'
  size='lg'
  border
/>

2. 将 `wal_level` 编辑为 `logical`

<Image
  img={wal_level}
  alt='在 Azure Flexible Server for Postgres 中将 wal_level 更改为 logical'
  size='lg'
  border
/>

3. 此更改需要重启服务器。请在系统提示时执行重启操作。

<Image
  img={restart}
  alt='更改 wal_level 后重启服务器'
  size='lg'
  border
/>


## 创建 ClickPipes 用户并授予权限 {#creating-clickpipes-user-and-granting-permissions}

通过管理员用户连接到您的 Azure Flexible Server Postgres 并运行以下命令:

1. 创建一个专用于 ClickPipes 的 Postgres 用户。

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 为 `clickpipes_user` 授予对需要复制表所在模式的只读访问权限。以下示例展示了如何为 `public` 模式设置权限。如果需要授予对多个模式的访问权限,可以为每个模式运行这三条命令。

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. 为该用户授予复制访问权限:

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. 创建用于后续创建 MIRROR(复制)的发布。

   ```sql
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
   ```

5. 将 `clickpipes_user` 的 `wal_sender_timeout` 设置为 0

   ```sql
   ALTER ROLE clickpipes_user SET wal_sender_timeout to 0;
   ```


## 将 ClickPipes IP 地址添加到防火墙 {#add-clickpipes-ips-to-firewall}

请按照以下步骤将 [ClickPipes IP 地址](../../index.md#list-of-static-ips)添加到您的网络。

1. 进入**网络**选项卡,将 [ClickPipes IP 地址](../../index.md#list-of-static-ips)添加到 Azure Flexible Server Postgres 的防火墙中;如果您使用 SSH 隧道,则添加到跳板服务器/堡垒主机的防火墙中。

<Image
  img={firewall}
  alt='在 Azure Flexible Server for Postgres 中将 ClickPipes IP 地址添加到防火墙'
  size='lg'
/>


## 下一步 {#whats-next}

您现在可以[创建 ClickPipe](../index.md) 并开始将 Postgres 实例中的数据导入 ClickHouse Cloud。
请务必记录设置 Postgres 实例时使用的连接详细信息,因为在创建 ClickPipe 过程中需要用到这些信息。
