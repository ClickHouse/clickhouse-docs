---
sidebar_label: 'Timescale'
description: '将安装 TimescaleDB 扩展的 Postgres 配置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/postgres/source/timescale
title: 'Postgres 搭配 TimescaleDB 的数据源配置指南'
keywords: ['TimescaleDB']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import BetaBadge from '@theme/badges/BetaBadge';


# Postgres 搭配 TimescaleDB 数据源配置指南 \{#postgres-with-timescaledb-source-setup-guide\}

<BetaBadge/>

## 背景 \{#background\}

[TimescaleDB](https://github.com/timescale/timescaledb) 是由 Timescale Inc 开发的开源 Postgres 扩展，
旨在在无需迁移出 Postgres 的前提下提升分析查询的性能。其实现方式是创建由该扩展管理的
“hypertable”，这些 hypertable 支持自动划分为多个 “chunk”。  
Hypertable 还支持透明压缩以及混合行-列式存储（称为 “hypercore”），不过这些
特性需要使用带有专有许可的扩展版本。

Timescale Inc 还为 TimescaleDB 提供两种托管服务： 

- `Managed Service for Timescale`
- `Timescale Cloud`。 

也有第三方厂商提供托管服务，允许你使用 TimescaleDB 扩展，但由于
许可限制，这些厂商只支持该扩展的开源版本。

Timescale hypertable 在多个方面的行为与常规 Postgres 表不同。这会给复制它们的过程带来一些复杂性，
因此，对 Timescale hypertable 的复制能力应视为 **尽力而为（best effort）**。

## 支持的 Postgres 版本 \{#supported-postgres-versions\}

ClickPipes 支持 Postgres 12 及以上版本。

## 启用逻辑复制 \{#enable-logical-replication\}

需要执行的步骤取决于你是如何部署带有 TimescaleDB 的 Postgres 实例的。

- 如果你使用的是托管服务，并且你的服务提供商列在侧边栏中，请按照该提供商对应的指南操作。
- 如果你自行部署 TimescaleDB，请按照通用指南操作。

对于其他托管服务，如果尚未启用逻辑复制，请向你的服务提供商提交支持工单，请求协助启用逻辑复制。

:::info
Timescale Cloud 不支持启用逻辑复制，而逻辑复制是以 CDC 模式运行 Postgres 管道所必需的。
因此，Timescale Cloud 的用户只能使用 Postgres ClickPipe 对其数据执行一次性加载（`Initial Load Only`，仅初始加载）。
:::

## 配置 \{#configuration\}

Timescale 超表本身不会存储插入到其中的任何数据。相反，数据会存储在 `_timescaledb_internal` schema 中多个对应的 “chunk” 表里。这在对超表执行查询时不是问题。但在逻辑复制过程中，变更不是在超表上检测到，而是在 chunk 表上检测到。Postgres ClickPipe 会自动将来自 chunk 表的变更重新映射回父超表，但这需要一些额外步骤。

:::info
如果只需执行一次性数据加载（`Initial Load Only`），请跳过第 2 步及后续步骤。
:::

1. 为 ClickPipes 创建一个专用用户：

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. 为上一步创建的用户授予 schema 级别的只读访问权限。以下示例展示了对 `public` schema 的权限设置。对每个包含要复制表的 schema 重复执行这些命令：

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. 为该用户授予复制权限：

    ```sql
    ALTER USER clickpipes_user WITH REPLICATION;
    ```

4. 使用要复制的表创建一个[publication](https://www.postgresql.org/docs/current/logical-replication-publication.html)。强烈建议仅在 publication 中包含所需的表，以避免不必要的性能开销。

   :::warning
   包含在 publication 中的任何表必须定义有**主键（primary key）**，_或者_ 将其 **replica identity** 配置为 `FULL`。有关作用域设置的指导，请参阅 [Postgres 常见问题](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication)。
   :::

   - 为特定表创建 publication：

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 为特定 schema 中的所有表创建 publication：

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` publication 将包含从指定表生成的一组变更事件，并在后续用于摄取复制流。

完成这些步骤后，即可继续[创建 ClickPipe](../index.md)。

## 配置网络访问 \{#configure-network-access\}

如果您希望限制访问 Timescale 实例的网络流量，请将 [文档中列出的静态 NAT IP](../../index.md#list-of-static-ips) 加入允许列表（allowlist）。
不同云服务商的具体操作方式会有所不同；如果您的服务商在侧边栏中列出，请参考相应说明，否则请向其提交工单寻求支持。