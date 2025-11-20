---
sidebar_label: 'Google Cloud SQL'
description: '将 Google Cloud SQL Postgres 实例设置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/postgres/source/google-cloudsql
title: 'Google Cloud SQL Postgres 数据源配置指南'
doc_type: 'guide'
keywords: ['google cloud sql', 'postgres', 'clickpipes', 'logical decoding', 'firewall']
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

如果你使用的是侧边栏中列出的受支持提供商之一，请参考该提供商的专用指南。

:::



## 支持的 Postgres 版本 {#supported-postgres-versions}

Postgres 12 及以上版本


## 启用逻辑复制 {#enable-logical-replication}

如果设置 `cloudsql.logical_decoding` 已开启且 `wal_sender_timeout` 为 0,则**无需**执行以下步骤。如果您正在从其他数据复制工具迁移,这些设置通常应已预先配置。

1. 在概览页面点击 **Edit** 按钮。

<Image
  img={edit_button}
  alt='Cloud SQL Postgres 中的编辑按钮'
  size='lg'
  border
/>

2. 进入 Flags 页面,将 `cloudsql.logical_decoding` 更改为 on,将 `wal_sender_timeout` 更改为 0。这些更改需要重启 Postgres 服务器。

<Image
  img={cloudsql_logical_decoding1}
  alt='将 cloudsql.logical_decoding 更改为 on'
  size='lg'
  border
/>
<Image
  img={cloudsql_logical_decoding2}
  alt='已更改 cloudsql.logical_decoding 和 wal_sender_timeout'
  size='lg'
  border
/>
<Image img={cloudsql_logical_decoding3} alt='重启服务器' size='lg' border />


## 创建 ClickPipes 用户并授予权限 {#creating-clickpipes-user-and-granting-permissions}

通过管理员用户连接到您的 Cloud SQL Postgres 实例并运行以下命令:

1. 创建一个专用于 ClickPipes 的 Postgres 用户。

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 为 `clickpipes_user` 授予对需要复制表所在模式的只读访问权限。以下示例展示了如何为 `public` 模式设置权限。如果需要授予对多个模式的访问权限,可以为每个模式分别运行这三条命令。

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. 为该用户授予复制权限:

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. 创建用于后续创建 MIRROR(复制)的发布。

   ```sql
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
   ```

[//]: # "TODO Add SSH Tunneling"


## 将 ClickPipes IP 地址添加到防火墙 {#add-clickpipes-ips-to-firewall}

请按照以下步骤将 ClickPipes IP 地址添加到您的网络中。

:::note

如果您使用 SSH 隧道,则需要将 [ClickPipes IP 地址](../../index.md#list-of-static-ips)添加到跳板服务器/堡垒主机的防火墙规则中。

:::

1. 转到 **Connections** 部分

<Image
  img={connections}
  alt='Cloud SQL 中的 Connections 部分'
  size='lg'
  border
/>

2. 转到 Networking 子部分

<Image
  img={connections_networking}
  alt='Cloud SQL 中的 Networking 子部分'
  size='lg'
  border
/>

3. 添加 [ClickPipes 的公网 IP 地址](../../index.md#list-of-static-ips)

<Image
  img={firewall1}
  alt='将 ClickPipes 网络添加到防火墙'
  size='lg'
  border
/>
<Image
  img={firewall2}
  alt='ClickPipes 网络已添加到防火墙'
  size='lg'
  border
/>


## 下一步 {#whats-next}

现在您可以[创建 ClickPipe](../index.md)，开始将 Postgres 实例中的数据导入 ClickHouse Cloud。
请务必记录设置 Postgres 实例时使用的连接信息，创建 ClickPipe 时需要用到这些信息。
