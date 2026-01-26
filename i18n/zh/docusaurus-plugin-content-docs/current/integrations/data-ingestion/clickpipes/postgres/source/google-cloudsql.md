---
sidebar_label: 'Google Cloud SQL'
description: '将 Google Cloud SQL Postgres 实例设置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/postgres/source/google-cloudsql
title: 'Google Cloud SQL Postgres 来源设置指南'
doc_type: 'guide'
keywords: ['google cloud sql', 'postgres', 'clickpipes', 'logical decoding', 'firewall']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
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


# Google Cloud SQL Postgres 源端设置指南 \{#google-cloud-sql-postgres-source-setup-guide\}

:::info

如果您使用侧边栏中列出的受支持提供商之一，请参阅该提供商的相应指南。

:::

## 支持的 Postgres 版本 \{#supported-postgres-versions\}

Postgres 12 及更高版本

## 启用逻辑复制 \{#enable-logical-replication\}

**如果** `cloudsql. logical_decoding` 已经为 on 且 `wal_sender_timeout` 为 0，**则无需**执行以下步骤。若您是从其他数据复制工具迁移，这些设置通常已经预先配置好。

1. 在概览页面点击 **Edit** 按钮。

<Image img={edit_button} alt="Cloud SQL Postgres 中的 Edit 按钮" size="lg" border/>

2. 打开 Flags，将 `cloudsql.logical_decoding` 修改为 on，并将 `wal_sender_timeout` 修改为 0。这些更改需要重启您的 Postgres 服务器才能生效。

<Image img={cloudsql_logical_decoding1} alt="将 cloudsql.logical_decoding 修改为 on" size="lg" border/>

<Image img={cloudsql_logical_decoding2} alt="已修改 cloudsql.logical_decoding 和 wal_sender_timeout" size="lg" border/>

<Image img={cloudsql_logical_decoding3} alt="重启服务器" size="lg" border/>

## 创建 ClickPipes 用户并授予权限 \{#creating-clickpipes-user-and-granting-permissions\}

使用管理员用户连接到 Cloud SQL Postgres，并运行以下命令：

1. 为 ClickPipes 创建一个专用用户：

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 为上一步创建的用户授予 schema 级只读访问权限。以下示例展示了为 `public` schema 授予权限。对于每个包含需要复制的表的 schema，都需要重复这些命令：

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. 为该用户授予复制权限：

   ```sql
   ALTER USER clickpipes_user WITH REPLICATION;
   ```

4. 使用需要复制的表创建一个 [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html)。强烈建议仅在 publication 中包含所需的表，以避免额外的性能开销。

   :::warning
   包含在 publication 中的任意表必须定义有 **primary key**，_或者_ 将其 **replica identity** 配置为 `FULL`。关于作用域设置的指导，请参阅 [Postgres 常见问题](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication)。
   :::

   - 为指定的表创建 publication：

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 为特定 schema 中的所有表创建 publication：

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` publication 将包含由指定表生成的变更事件集合，之后会被用于摄取复制流。

[//]: # (TODO Add SSH Tunneling)

## 将 ClickPipes IP 添加到防火墙 \{#add-clickpipes-ips-to-firewall\}

请按照以下步骤将 ClickPipes IP 添加到您的网络中。

:::note

如果您使用的是 SSH 隧道（SSH Tunneling），则需要将 [ClickPipes IP](../../index.md#list-of-static-ips) 添加到跳板机/堡垒机（Jump Server/Bastion）的防火墙规则中。

:::

1. 转到 **Connections** 区域

<Image img={connections} alt="Cloud SQL 中的 Connections 区域" size="lg" border/>

2. 转到 Networking 子菜单

<Image img={connections_networking} alt="Cloud SQL 中的 Networking 子菜单" size="lg" border/>

3. 添加 [ClickPipes 的公网 IP](../../index.md#list-of-static-ips)

<Image img={firewall1} alt="将 ClickPipes 网络添加到防火墙" size="lg" border/>

<Image img={firewall2} alt="已将 ClickPipes 网络添加到防火墙" size="lg" border/>

## 下一步 \{#whats-next\}

现在你可以[创建你的 ClickPipe](../index.md)，并开始将 Postgres 实例中的数据摄取到 ClickHouse Cloud。
请务必记录下在设置 Postgres 实例时使用的连接信息，因为在创建 ClickPipe 时需要用到这些信息。