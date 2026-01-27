---
sidebar_label: 'PlanetScale for Postgres 源'
description: '将 PlanetScale for Postgres 配置为 ClickPipes 的源'
slug: /integrations/clickpipes/postgres/source/planetscale
title: 'PlanetScale for Postgres 源配置指南'
doc_type: '指南'
keywords: ['clickpipes', 'postgresql', 'cdc', '数据摄取', '实时同步']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import planetscale_wal_level_logical from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_wal_level_logical.png';
import planetscale_max_slot_wal_keep_size from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_max_slot_wal_keep_size.png';
import Image from '@theme/IdealImage';


# PlanetScale for Postgres 源端设置指南 \{#planetscale-for-postgres-source-setup-guide\}

:::info
PlanetScale for Postgres 当前处于 [早期体验](https://planetscale.com/postgres) 阶段。
:::

## 支持的 Postgres 版本 \{#supported-postgres-versions\}

ClickPipes 支持 Postgres 12 及以上版本。

## 启用逻辑复制 \{#enable-logical-replication\}

1. 要在 Postgres 实例上启用复制，需要确保设置了以下参数：

    ```sql
    wal_level = logical
    ```
   要检查该配置，可以运行以下 SQL 命令：
    ```sql
    SHOW wal_level;
    ```

   输出结果默认应为 `logical`。如果不是，请登录 PlanetScale 控制台，进入 `Cluster configuration->Parameters`，然后向下滚动到 `Write-ahead log` 进行修改。

<Image img={planetscale_wal_level_logical} alt="在 PlanetScale 控制台中调整 wal_level" size="md" border/>

:::warning
在 PlanetScale 控制台中更改此项将触发实例重启。
:::

2. 此外，建议将 `max_slot_wal_keep_size` 从默认的 4GB 调大。此操作同样通过 PlanetScale 控制台完成，进入 `Cluster configuration->Parameters`，然后向下滚动到 `Write-ahead log`。如需确定合适的新值，请参考[此处](../faq#recommended-max_slot_wal_keep_size-settings)。

<Image img={planetscale_max_slot_wal_keep_size} alt="在 PlanetScale 控制台中调整 max_slot_wal_keep_size" size="md" border/>

## 创建具有权限和 publication 的用户 \{#creating-a-user-with-permissions-and-publication\}

使用默认的 `postgres.<...>` 用户连接到你的 PlanetScale Postgres 实例，并运行以下命令：

1. 为 ClickPipes 创建一个专用用户：

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. 为你在上一步创建的用户授予 schema 级别的只读访问权限。以下示例展示了对 `public` schema 的权限设置。对于每个包含你希望复制的表的 schema，重复执行这些命令：

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. 为该用户授予复制（replication）权限：

    ```sql
    ALTER USER clickpipes_user WITH REPLICATION;
    ```

4. 为你希望复制的表创建一个 [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html)。强烈建议仅将所需的表包含在 publication 中，以避免不必要的性能开销。

   :::warning
   任何包含在 publication 中的表必须要么定义 **primary key**，_要么_ 将其 **replica identity** 配置为 `FULL`。有关限定发布范围的指导，请参阅 [Postgres 常见问题](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication)。
   :::

   - 为特定表创建 publication：

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 为特定 schema 中的所有表创建 publication：

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` publication 将包含由指定表生成的一组变更事件，后续会用于摄取复制数据流。

## 注意事项 \{#caveats\}

1. 要连接到 PlanetScale Postgres，需要在上面创建的用户名后追加当前分支名。例如，如果创建的用户名为 `clickpipes_user`，则在创建 ClickPipe 时实际提供的用户需要是 `clickpipes_user`.`branch`，其中 `branch` 指的是当前 PlanetScale Postgres [branch](https://planetscale.com/docs/postgres/branching) 的 "id"。要快速确定这一点，可以参考之前用于创建该用户的 `postgres` 用户名，句点之后的部分即为分支 ID。
2. 不要为连接到 PlanetScale Postgres 的 CDC 管道使用 `PSBouncer` 端口（当前为 `6432`），必须使用常规端口 `5432`。对于仅用于初始加载的管道，可以使用任一端口。
3. 请确保只连接到主实例，目前不支持[连接到副本实例](https://planetscale.com/docs/postgres/scaling/replicas#how-to-query-postgres-replicas)。 

## 接下来 \{#whats-next\}

现在您可以[创建 ClickPipe](../index.md)，并开始将 Postgres 实例中的数据摄取到 ClickHouse Cloud。
请务必记录在设置 Postgres 实例时使用的连接信息，因为在创建 ClickPipe 的过程中还需要用到这些信息。