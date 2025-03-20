---
sidebar_label: 'Google Cloud SQL'
description: '将 Google Cloud SQL Postgres 实例设置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/postgres/source/google-cloudsql
---

import edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/edit.png';
import cloudsql_logical_decoding1 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/cloudsql_logical_decoding1.png';
import cloudsql_logical_decoding2 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/cloudsql_logical_decoding2.png';
import cloudsql_logical_decoding3 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/cloudsql_logical_decoding3.png';
import connections from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/connections.png';
import connections_networking from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/connections_networking.png';
import firewall1 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/firewall1.png';
import firewall2 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/firewall2.png';


# Google Cloud SQL Postgres 数据源设置指南

:::info

如果您使用支持的提供者（在侧边栏中），请参考该提供者的具体指南。

:::


## 支持的 Postgres 版本 {#supported-postgres-versions}

Postgres 12 及以上版本

## 启用逻辑复制 {#enable-logical-replication}

**如果**设置 `cloudsql.logical_decoding` 已开启且 `wal_sender_timeout` 为 0，则您不需要遵循以下步骤。如果您是从其他数据复制工具迁移，这些设置大多应该已预配置。

1. 单击概述页面上的 **编辑** 按钮。

<img src={edit_button} alt="Cloud SQL Postgres 中的编辑按钮" />

2. 转到 Flags 并将 `cloudsql.logical_decoding` 更改为启用，`wal_sender_timeout` 更改为 0。这些更改需要重启您的 Postgres 服务器。

<img src={cloudsql_logical_decoding1} alt="将 cloudsql.logical_decoding 更改为开启" />
<img src={cloudsql_logical_decoding2} alt="更改 cloudsql.logical_decoding 和 wal_sender_timeout" />
<img src={cloudsql_logical_decoding3} alt="重启服务器" />


## 创建 ClickPipes 用户并授予权限 {#creating-clickpipes-user-and-granting-permissions}

通过管理员用户连接到您的 Cloud SQL Postgres 并运行以下命令：

1. 为 ClickPipes 创建一个专用的 Postgres 用户。

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 为从中复制表的模式提供只读访问权限给 `clickpipes_user`。下面的示例显示了为 `public` 模式设置权限。如果您想要授予多个模式的访问权限，可以针对每个模式运行这三条命令。

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. 授予该用户复制访问权限：

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. 创建您将来用于创建镜像（复制）的发布。

   ```sql
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
   ```

[//]: # (TODO Add SSH Tunneling)


## 将 ClickPipes IP 添加到防火墙 {#add-clickpipes-ips-to-firewall}

请按照以下步骤将 ClickPipes IP 添加到您的网络中。

:::note

如果您使用 SSH 隧道，则需要将 [ClickPipes IPs](../../index.md#list-of-static-ips) 添加到跳转服务器/堡垒的防火墙规则中。

:::

1. 转到 **连接** 部分

<img src={connections} alt="Cloud SQL 中的连接部分" />

2. 转到网络子部分

<img src={connections_networking} alt="Cloud SQL 中的网络子部分" />

3. 添加 [ClickPipes 的公共 IP](../../index.md#list-of-static-ips)

<img src={firewall1} alt="将 ClickPipes 网络添加到防火墙" />
<img src={firewall2} alt="ClickPipes 网络已添加到防火墙" />


## 接下来做什么？ {#whats-next}

您现在可以 [创建您的 ClickPipe](../index.md) 并开始从您的 Postgres 实例将数据导入 ClickHouse Cloud。
请确保记下您在设置 Postgres 实例时使用的连接详细信息，因为在创建 ClickPipe 过程中您将需要这些信息。
