---
'sidebar_label': 'Google Cloud SQL'
'description': 'Set up Google Cloud SQL Postgres instance as a source for ClickPipes'
'slug': '/integrations/clickpipes/postgres/source/google-cloudsql'
'title': 'Google Cloud SQL Postgres Source Setup Guide'
---

import edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/edit.png';
import cloudsql_logical_decoding1 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/cloudsql_logical_decoding1.png';
import cloudsql_logical_decoding2 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/cloudsql_logical_decoding2.png';
import cloudsql_logical_decoding3 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/cloudsql_logical_decoding3.png';
import connections from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/connections.png';
import connections_networking from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/connections_networking.png';
import firewall1 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/firewall1.png';
import firewall2 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/firewall2.png';
import Image from '@theme/IdealImage';


# Google Cloud SQL Postgres 源设置指南

:::info

如果您使用的是支持的提供商（在侧边栏中），请参考该提供商的特定指南。

:::


## 支持的 Postgres 版本 {#supported-postgres-versions}

Postgres 12 及以后的版本

## 启用逻辑复制 {#enable-logical-replication}

**如果设置 `cloudsql.logical_decoding` 为启用且 `wal_sender_timeout` 为 0，您无需** 按照以下步骤操作。如果您是从其他数据复制工具迁移，这些设置通常是预先配置好的。

1. 点击概览页面上的 **编辑** 按钮。

<Image img={edit_button} alt="Cloud SQL Postgres 中的编辑按钮" size="lg" border/>

2. 进入标志并将 `cloudsql.logical_decoding` 更改为启用，将 `wal_sender_timeout` 更改为 0。这些更改需要重新启动您的 Postgres 服务器。

<Image img={cloudsql_logical_decoding1} alt="将 cloudsql.logical_decoding 更改为启用" size="lg" border/>
<Image img={cloudsql_logical_decoding2} alt="更改 cloudsql.logical_decoding 和 wal_sender_timeout" size="lg" border/>
<Image img={cloudsql_logical_decoding3} alt="重启服务器" size="lg" border/>


## 创建 ClickPipes 用户并授予权限 {#creating-clickpipes-user-and-granting-permissions}

通过管理员用户连接到您的 Cloud SQL Postgres 并运行以下命令：

1. 为 ClickPipes 独立创建一个 Postgres 用户。

```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
```

2. 为您正在复制表的模式提供只读访问权限给 `clickpipes_user`。以下示例演示了如何为 `public` 模式设置权限。如果您想授予多个模式的访问权限，可以为每个模式运行这三条命令。

```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
```

3. 授予此用户复制访问权限：

```sql
   ALTER ROLE clickpipes_user REPLICATION;
```

4. 创建将在未来用于创建 MIRROR（复制）的发布。

```sql
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

[//]: # (TODO 添加 SSH 隧道)


## 将 ClickPipes IP 添加到防火墙 {#add-clickpipes-ips-to-firewall}

请按照以下步骤将 ClickPipes IP 添加到您的网络中。

:::note

如果您使用 SSH 隧道，则需要将 [ClickPipes IP](../../index.md#list-of-static-ips) 添加到跳转服务器/堡垒的防火墙规则中。

:::

1. 进入 **连接** 部分

<Image img={connections} alt="Cloud SQL 中的连接部分" size="lg" border/>

2. 进入网络子部分

<Image img={connections_networking} alt="Cloud SQL 中的网络子部分" size="lg" border/>

3. 添加 [ClickPipes 的公共 IP](../../index.md#list-of-static-ips)

<Image img={firewall1} alt="将 ClickPipes 网络添加到防火墙" size="lg" border/>
<Image img={firewall2} alt="ClickPipes 网络已添加到防火墙" size="lg" border/>


## 接下来是什么? {#whats-next}

您现在可以 [创建您的 ClickPipe](../index.md) 并开始将数据从您的 Postgres 实例摄取到 ClickHouse Cloud。
请确保记下您在设置 Postgres 实例时使用的连接详细信息，因为您将在 ClickPipe 创建过程中需要这些信息。
