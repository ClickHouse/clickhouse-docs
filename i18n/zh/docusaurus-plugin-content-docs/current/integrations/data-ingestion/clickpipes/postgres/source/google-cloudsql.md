---
'sidebar_label': 'Google Cloud SQL'
'description': '将谷歌云 SQL Postgres 实例设置为 ClickPipes 的数据源'
'slug': '/integrations/clickpipes/postgres/source/google-cloudsql'
'title': '谷歌云 SQL Postgres 源设置指南'
'doc_type': 'guide'
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

如果您使用所支持的提供商之一（在侧边栏中），请参阅该提供商的特定指南。

:::

## 支持的 Postgres 版本 {#supported-postgres-versions}

任何版本为 Postgres 12 或更高版本。

## 启用逻辑复制 {#enable-logical-replication}

**如果设置 `cloudsql.logical_decoding` 为开启且 `wal_sender_timeout` 为 0，则您不需要** 按照以下步骤操作。这些设置在迁移自其他数据复制工具时通常会预先配置。

1. 点击概览页面上的 **编辑** 按钮。

<Image img={edit_button} alt="Cloud SQL Postgres 中的编辑按钮" size="lg" border/>

2. 转到标志，并将 `cloudsql.logical_decoding` 更改为开启，`wal_sender_timeout` 更改为 0。这些更改需要重启您的 Postgres 服务器。

<Image img={cloudsql_logical_decoding1} alt="将 cloudsql.logical_decoding 更改为开启" size="lg" border/>
<Image img={cloudsql_logical_decoding2} alt="更改 cloudsql.logical_decoding 和 wal_sender_timeout" size="lg" border/>
<Image img={cloudsql_logical_decoding3} alt="重启服务器" size="lg" border/>

## 创建 ClickPipes 用户并授予权限 {#creating-clickpipes-user-and-granting-permissions}

通过管理员用户连接到您的 Cloud SQL Postgres，并运行以下命令：

1. 为 ClickPipes 创建一个 Postgres 用户。

```sql
CREATE USER clickpipes_user PASSWORD 'some-password';
```

2. 向 `clickpipes_user` 提供从中复制表的架构的只读访问权限。以下示例显示了为 `public` 架构设置权限。如果您希望授予多个架构的访问权限，可以对每个架构运行这三条命令。

```sql
GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
```

3. 授予此用户复制访问权限：

```sql
ALTER ROLE clickpipes_user REPLICATION;
```

4. 创建将来用于创建 MIRROR（复制）的发布。

```sql
CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

[//]: # (TODO 添加 SSH 隧道)

## 将 ClickPipes IP 添加到防火墙 {#add-clickpipes-ips-to-firewall}

请按照以下步骤将 ClickPipes IP 添加到您的网络。

:::note

如果您使用 SSH 隧道，则需要将 [ClickPipes IP](../../index.md#list-of-static-ips) 添加到跳转服务器/堡垒的防火墙规则中。

:::

1. 转到 **连接** 部分

<Image img={connections} alt="Cloud SQL 中的连接部分" size="lg" border/>

2. 转到网络子部分

<Image img={connections_networking} alt="Cloud SQL 中的网络子部分" size="lg" border/>

3. 添加 [ClickPipes 的公共 IP](../../index.md#list-of-static-ips)

<Image img={firewall1} alt="将 ClickPipes 网络添加到防火墙" size="lg" border/>
<Image img={firewall2} alt="ClickPipes 网络已添加到防火墙" size="lg" border/>

## 下一步是什么？ {#whats-next}

您现在可以 [创建您的 ClickPipe](../index.md) 并开始将数据从您的 Postgres 实例加载到 ClickHouse Cloud 中。
确保记下您在设置 Postgres 实例时使用的连接详细信息，因为在 ClickPipe 创建过程中将需要这些信息。
