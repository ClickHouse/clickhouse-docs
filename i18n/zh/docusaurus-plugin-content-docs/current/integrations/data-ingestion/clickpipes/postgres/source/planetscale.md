---
'sidebar_label': 'Planetscale for Postgres'
'description': '将 Planetscale 设置为 ClickPipes 的数据源'
'slug': '/integrations/clickpipes/postgres/source/planetscale'
'title': 'PlanetScale for Postgres 源设置指南'
'doc_type': 'guide'
---

import planetscale_wal_level_logical from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_wal_level_logical.png';
import planetscale_max_slot_wal_keep_size from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_max_slot_wal_keep_size.png';
import Image from '@theme/IdealImage';


# PlanetScale for Postgres 源设置指南

:::info
PlanetScale for Postgres 目前处于 [早期访问](https://planetscale.com/postgres) 阶段。
:::

## 支持的 Postgres 版本 {#supported-postgres-versions}

ClickPipes 支持 Postgres 版本 12 及更高版本。

## 启用逻辑复制 {#enable-logical-replication}

1. 要在您的 Postgres 实例上启用复制，我们需要确保以下设置已配置：

```sql
wal_level = logical
```
   要检查相同的内容，您可以运行以下 SQL 命令：
```sql
SHOW wal_level;
```

   默认情况下，输出应该是 `logical`。如果不是，请登录到 PlanetScale 控制台，转到 `Cluster configuration->Parameters`，并向下滚动到 `Write-ahead log` 进行更改。

<Image img={planetscale_wal_level_logical} alt="调整 PlanetScale 控制台中的 wal_level" size="md" border/>

:::warning
在 PlanetScale 控制台中更改此设置将会触发重启。
:::

2. 此外，建议将 `max_slot_wal_keep_size` 的设置从默认的 4GB 增加。这也可通过 PlanetScale 控制台进行，方法是转到 `Cluster configuration->Parameters` 然后向下滚动到 `Write-ahead log`。有关新值的帮助，请查看 [这里](../faq#recommended-max_slot_wal_keep_size-settings)。

<Image img={planetscale_max_slot_wal_keep_size} alt="调整 PlanetScale 控制台中的 max_slot_wal_keep_size" size="md" border/>

## 创建具有权限和发布的用户 {#creating-a-user-with-permissions-and-publication}

让我们为 ClickPipes 创建一个具有适合 CDC 的必要权限的新用户，并创建一个我们将用于复制的发布。

为此，您可以使用默认的 `postgres.<...>` 用户连接到您的 PlanetScale Postgres 实例，并运行以下 SQL 命令：
```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
-- You may need to grant these permissions on more schemas depending on the tables you're moving
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- Give replication permission to the USER
  ALTER USER clickpipes_user REPLICATION;

-- Create a publication. We will use this when creating the pipe
-- When adding new tables to the ClickPipe, you'll need to manually add them to the publication as well. 
  CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>, <...>;
```
:::note
确保将 `clickpipes_user` 和 `clickpipes_password` 替换为您想要的用户名和密码。
:::

## 注意事项 {#caveats}
1. 要连接到 PlanetScale Postgres，目前的分支需要附加到上述创建的用户名后。例如，如果创建的用户名为 `clickpipes_user`，则在 ClickPipe 创建期间提供的实际用户需要是 `clickpipes_user`.`branch`，其中 `branch` 指的是当前 PlanetScale Postgres [分支](https://planetscale.com/docs/postgres/branching) 的 “id”。要快速确定这一点，您可以参考您之前用于创建用户的 `postgres` 用户的用户名，句点后的部分将是分支 id。
2. 连接到 PlanetScale Postgres 的 CDC 管道时，请勿使用 `PSBouncer` 端口（当前为 `6432`），必须使用常规端口 `5432`。仅在初始加载的管道中可以使用任一端口。
3. 请确保您仅连接到主实例，[连接到副本实例](https://planetscale.com/docs/postgres/scaling/replicas#how-to-query-postgres-replicas) 当前不支持。

## 接下来是什么？ {#whats-next}

您现在可以 [创建您的 ClickPipe](../index.md) 并开始将数据从您的 Postgres 实例导入到 ClickHouse Cloud。
请务必记下您在设置 Postgres 实例时使用的连接详细信息，因为在创建 ClickPipe 过程中您将需要这些信息。
