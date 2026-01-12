---
sidebar_label: '适用于 Postgres 的 PlanetScale'
description: '将 PlanetScale for Postgres 配置为 ClickPipes 的源'
slug: /integrations/clickpipes/postgres/source/planetscale
title: 'PlanetScale for Postgres 源配置指南'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', '数据摄取', '实时同步']
integration:
   - support_level: '核心'
   - category: 'clickpipes'
---

import planetscale_wal_level_logical from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_wal_level_logical.png';
import planetscale_max_slot_wal_keep_size from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/planetscale/planetscale_max_slot_wal_keep_size.png';
import Image from '@theme/IdealImage';

# PlanetScale for Postgres 数据源设置指南 {#planetscale-for-postgres-source-setup-guide}

:::info
PlanetScale for Postgres 目前处于[早期试用](https://planetscale.com/postgres)阶段。
:::

## 支持的 Postgres 版本 {#supported-postgres-versions}

ClickPipes 支持 Postgres 12 及更高版本。

## 启用逻辑复制 {#enable-logical-replication}

1. 要在 Postgres 实例上启用复制，需要确保将以下参数设置为：

    ```sql
    wal_level = logical
    ```
   要检查当前设置，可以运行以下 SQL 命令：
    ```sql
    SHOW wal_level;
    ```

   输出默认应为 `logical`。如果不是，请登录 PlanetScale 控制台，进入 `Cluster configuration->Parameters`，向下滚动到 `Write-ahead log` 进行修改。

<Image img={planetscale_wal_level_logical} alt="在 PlanetScale 控制台中调整 wal_level" size="md" border/>

:::warning
在 PlanetScale 控制台中更改此项将会触发重启。
:::

2. 此外，建议将 `max_slot_wal_keep_size` 从默认的 4GB 提高。你也可以通过 PlanetScale 控制台来完成：进入 `Cluster configuration->Parameters`，然后向下滚动到 `Write-ahead log`。如需帮助确定新的取值，请查看[这里](../faq#recommended-max_slot_wal_keep_size-settings)。

<Image img={planetscale_max_slot_wal_keep_size} alt="在 PlanetScale 控制台中调整 max_slot_wal_keep_size" size="md" border/>

## 使用权限和发布（publication）创建用户 {#creating-a-user-with-permissions-and-publication}

使用默认的 `postgres.<...>` 用户连接到你的 PlanetScale Postgres 实例，并运行以下命令：

1. 为 ClickPipes 创建一个专用用户：

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. 为你在上一步创建的用户授予 schema 级的只读访问权限。下面的示例展示了对 `public` schema 的权限设置。对于每个包含你希望复制的表的 schema，都需要重复这些命令：

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. 为该用户授予复制权限：

    ```sql
    GRANT rds_replication TO clickpipes_user;
    ```

4. 使用你想要复制的表创建一个[发布（publication）](https://www.postgresql.org/docs/current/logical-replication-publication.html)。我们强烈建议仅将所需的表包含在发布中，以避免额外的性能开销。

   :::warning
   任何包含在发布中的表必须定义有 **primary key**，_或者_ 将其 **replica identity** 配置为 `FULL`。请参阅 [Postgres 常见问题](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) 以获得如何限定发布范围的指导。
   :::

   - 为特定表创建发布：

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 为特定 schema 中的所有表创建发布：

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` 发布将包含由指定表生成的一组变更事件，稍后将用于摄取复制流。

## 注意事项 {#caveats}
1. 要连接到 PlanetScale Postgres，需要在前面创建的用户名后追加当前分支名。例如，如果创建的用户为 `clickpipes_user`，则在创建 ClickPipe 时实际提供的用户名需要为 `clickpipes_user`.`branch`，其中 `branch` 指的是当前 PlanetScale Postgres [branch](https://planetscale.com/docs/postgres/branching) 的 “id”。要快速确定这一点，可以查看你之前用于创建该用户的 `postgres` 用户名，句点后的部分即为 branch id。
2. 不要为连接到 PlanetScale Postgres 的 CDC 管道使用 `PSBouncer` 端口（当前为 `6432`），必须使用常规端口 `5432`。对于仅用于初始加载的管道，可以使用任一端口。
3. 请确保你只连接到主实例，目前不支持[连接到副本实例](https://planetscale.com/docs/postgres/scaling/replicas#how-to-query-postgres-replicas)。 

## 后续步骤 {#whats-next}

您现在可以[创建 ClickPipe](../index.md)，并开始将 Postgres 实例中的数据摄取到 ClickHouse Cloud。
请务必记录在设置 Postgres 实例时使用的连接信息，因为在创建 ClickPipe 时将需要这些信息。