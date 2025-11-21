---
sidebar_label: 'PlanetScale for Postgres'
description: '将 PlanetScale for Postgres 配置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/postgres/source/planetscale
title: 'PlanetScale for Postgres 源配置指南'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', '数据摄取', '实时同步']
---

import planetscale_wal_level_logical from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_wal_level_logical.png';
import planetscale_max_slot_wal_keep_size from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_max_slot_wal_keep_size.png';
import Image from '@theme/IdealImage';


# PlanetScale for Postgres 源端设置指南

:::info
PlanetScale for Postgres 目前处于[早期访问阶段](https://planetscale.com/postgres)。
:::



## 支持的 Postgres 版本 {#supported-postgres-versions}

ClickPipes 支持 Postgres 12 及更高版本。


## 启用逻辑复制 {#enable-logical-replication}

1. 要在您的 Postgres 实例上启用复制,需要确保设置了以下配置:

   ```sql
   wal_level = logical
   ```

   要检查该设置,可以运行以下 SQL 命令:

   ```sql
   SHOW wal_level;
   ```

   输出默认应为 `logical`。如果不是,请登录 PlanetScale 控制台,进入 `Cluster configuration->Parameters`,然后向下滚动到 `Write-ahead log` 进行更改。

<Image
  img={planetscale_wal_level_logical}
  alt='在 PlanetScale 控制台中调整 wal_level'
  size='md'
  border
/>

:::warning
在 PlanetScale 控制台中更改此设置将触发重启。
:::

2. 此外,建议将 `max_slot_wal_keep_size` 设置从默认值 4GB 提高。同样可以通过 PlanetScale 控制台完成,进入 `Cluster configuration->Parameters`,然后向下滚动到 `Write-ahead log`。要确定新值,请参阅[此处](../faq#recommended-max_slot_wal_keep_size-settings)。

<Image
  img={planetscale_max_slot_wal_keep_size}
  alt='在 PlanetScale 控制台中调整 max_slot_wal_keep_size'
  size='md'
  border
/>


## 创建具有权限和发布的用户 {#creating-a-user-with-permissions-and-publication}

让我们为 ClickPipes 创建一个新用户,并赋予其适用于 CDC 的必要权限,
同时创建一个用于复制的发布。

为此,您可以使用默认的 `postgres.<...>` 用户连接到您的 PlanetScale Postgres 实例,并运行以下 SQL 命令:

```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
-- 根据您要迁移的表,可能需要在更多模式上授予这些权限
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- 为用户授予复制权限
  ALTER USER clickpipes_user REPLICATION;

-- 创建一个发布。我们将在创建管道时使用它
-- 向 ClickPipe 添加新表时,您还需要手动将它们添加到发布中
  CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>, <...>;
```

:::note
请确保将 `clickpipes_user` 和 `clickpipes_password` 替换为您所需的用户名和密码。
:::


## 注意事项 {#caveats}

1. 连接到 PlanetScale Postgres 时,需要将当前分支附加到上述创建的用户名中。例如,如果创建的用户名为 `clickpipes_user`,则在创建 ClickPipe 时提供的实际用户名需要为 `clickpipes_user`.`branch`,其中 `branch` 指的是当前 PlanetScale Postgres [分支](https://planetscale.com/docs/postgres/branching)的"id"。要快速确定此 id,可以参考之前用于创建用户的 `postgres` 用户的用户名,句点后面的部分即为分支 id。
2. 对于连接到 PlanetScale Postgres 的 CDC 管道,请勿使用 `PSBouncer` 端口(当前为 `6432`),必须使用标准端口 `5432`。对于仅执行初始加载的管道,可以使用任一端口。
3. 请确保仅连接到主实例,目前不支持[连接到副本实例](https://planetscale.com/docs/postgres/scaling/replicas#how-to-query-postgres-replicas)。


## 下一步 {#whats-next}

您现在可以[创建 ClickPipe](../index.md) 并开始将 Postgres 实例中的数据导入 ClickHouse Cloud。
请务必记录设置 Postgres 实例时使用的连接详细信息,因为在创建 ClickPipe 过程中需要用到这些信息。
