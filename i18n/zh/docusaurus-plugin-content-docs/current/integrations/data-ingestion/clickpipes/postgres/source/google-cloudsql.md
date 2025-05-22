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

如果您使用的是支持的提供商（在侧边栏中），请参阅该提供商的具体指南。

:::


## 支持的 Postgres 版本 {#supported-postgres-versions}

在 Postgres 12 及以后的版本

## 启用逻辑复制 {#enable-logical-replication}

**如果** `cloudsql.logical_decoding` 设置为开启且 `wal_sender_timeout` 设置为 0，您**不需要**遵循以下步骤。如果您是从其他数据复制工具迁移，这些设置通常应该是预先配置好的。

1. 点击概述页面上的 **编辑** 按钮。

<Image img={edit_button} alt="Cloud SQL Postgres 中的编辑按钮" size="lg" border/>

2. 前往 Flags 并将 `cloudsql.logical_decoding` 改为开启、`wal_sender_timeout` 改为 0。这些更改需要重启您的 Postgres 服务器。

<Image img={cloudsql_logical_decoding1} alt="将 cloudsql.logical_decoding 改为开启" size="lg" border/>
<Image img={cloudsql_logical_decoding2} alt="已更改 cloudsql.logical_decoding 和 wal_sender_timeout" size="lg" border/>
<Image img={cloudsql_logical_decoding3} alt="重启服务器" size="lg" border/>


## 创建 ClickPipes 用户并授予权限 {#creating-clickpipes-user-and-granting-permissions}

通过管理员用户连接到您的 Cloud SQL Postgres，并运行以下命令：

1. 创建一个专用于 ClickPipes 的 Postgres 用户。

```sql
CREATE USER clickpipes_user PASSWORD 'some-password';
```

2. 为您复制表的模式提供只读访问权限给 `clickpipes_user`。以下示例展示了为 `public` 模式设置权限。如果您想要授予多个模式的访问权限，可以对每个模式运行这三条命令。

```sql
GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
```

3. 授予该用户复制访问权限：

```sql
ALTER ROLE clickpipes_user REPLICATION;
```

4. 创建您将在未来用于创建镜像（复制）的发布。

```sql
CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

[//]: # (TODO 添加 SSH 隧道)


## 将 ClickPipes IP 添加到防火墙 {#add-clickpipes-ips-to-firewall}

请遵循以下步骤将 ClickPipes IP 添加到您的网络。

:::note

如果您正在使用 SSH 隧道，则需要将 [ClickPipes IPs](../../index.md#list-of-static-ips) 添加到 Jump Server/Bastion 的防火墙规则中。

:::

1. 转到 **连接** 部分

<Image img={connections} alt="Cloud SQL 中的连接部分" size="lg" border/>

2. 前往网络子部分

<Image img={connections_networking} alt="Cloud SQL 中的网络子部分" size="lg" border/>

3. 添加 [ClickPipes 的公共 IP](../../index.md#list-of-static-ips)

<Image img={firewall1} alt="添加 ClickPipes 网络到防火墙" size="lg" border/>
<Image img={firewall2} alt="ClickPipes 网络已添加到防火墙" size="lg" border/>


## 接下来怎样？ {#whats-next}

您现在可以 [创建您的 ClickPipe](../index.md) 并开始将数据从您的 Postgres 实例注入到 ClickHouse Cloud 中。
请确保记录您在设置 Postgres 实例时使用的连接详情，因为在创建 ClickPipe 过程中需要使用这些信息。
