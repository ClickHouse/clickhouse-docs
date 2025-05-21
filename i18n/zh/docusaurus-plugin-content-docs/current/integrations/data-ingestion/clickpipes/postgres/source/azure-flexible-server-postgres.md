---
'sidebar_label': 'Azure Flexible Server for Postgres'
'description': 'Set up Azure Flexible Server for Postgres as a source for ClickPipes'
'slug': '/integrations/clickpipes/postgres/source/azure-flexible-server-postgres'
'title': 'Azure Flexible Server for Postgres Source Setup Guide'
---

import server_parameters from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/server_parameters.png';
import wal_level from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/wal_level.png';
import restart from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/restart.png';
import firewall from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/firewall.png';
import Image from '@theme/IdealImage';


# Azure Flexible Server for Postgres 源设置指南

ClickPipes 支持 Postgres 版本 12 及以上。

## 启用逻辑复制 {#enable-logical-replication}

**如果 `wal_level` 已设置为 `logical`，您无需** 按照以下步骤操作。如果您是从其他数据复制工具迁移，则此设置通常应该是预先配置的。

1. 点击 **服务器参数** 部分

<Image img={server_parameters} alt="Azure Flexible Server for Postgres 的服务器参数" size="lg" border/>

2. 将 `wal_level` 编辑为 `logical`

<Image img={wal_level} alt="在 Azure Flexible Server for Postgres 中将 wal_level 更改为 logical" size="lg" border/>

3. 此更改需要重新启动服务器。因此，在请求时请重新启动。

<Image img={restart} alt="更改 wal_level 后重启服务器" size="lg" border/>

## 创建 ClickPipes 用户并授予权限 {#creating-clickpipes-user-and-granting-permissions}

通过管理员用户连接到您的 Azure Flexible Server Postgres，并运行以下命令：

1. 为 ClickPipes 创建一个专用的 Postgres 用户。

```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
```

2. 为 `clickpipes_user` 提供从您复制表的架构到该用户的只读访问权限。以下示例显示了为 `public` 架构设置权限。如果您想为多个架构授予访问权限，您可以为每个架构运行这三条命令。

```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
```

3. 授予此用户复制访问权限：

```sql
   ALTER ROLE clickpipes_user REPLICATION;
```

4. 创建将用于将来的镜像（复制）的发布。

```sql
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

5. 将 `wal_sender_timeout` 设置为 0 对于 `clickpipes_user`

```sql
   ALTER ROLE clickpipes_user SET wal_sender_timeout to 0;
```


## 将 ClickPipes IP 添加到防火墙 {#add-clickpipes-ips-to-firewall}

请按照以下步骤将 [ClickPipes IP](../../index.md#list-of-static-ips) 添加到您的网络。

1. 转到 **网络** 选项卡，并将 [ClickPipes IP](../../index.md#list-of-static-ips) 添加到您的 Azure Flexible Server Postgres 的防火墙，或者如果您使用 SSH 隧道，则添加到跳跃服务器/堡垒主机。

<Image img={firewall} alt="在 Azure Flexible Server for Postgres 中添加 ClickPipes IP 到防火墙" size="lg"/>


## 接下来是什么？ {#whats-next}

您现在可以 [创建您的 ClickPipe](../index.md)，并开始从您的 Postgres 实例向 ClickHouse Cloud 输入数据。
请确保记下在设置 Postgres 实例时使用的连接详细信息，因为您将在 ClickPipe 创建过程中需要它们。
