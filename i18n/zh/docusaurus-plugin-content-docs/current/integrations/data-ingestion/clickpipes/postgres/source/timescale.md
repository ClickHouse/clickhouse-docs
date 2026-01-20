---
sidebar_label: 'Timescale'
description: '将带有 TimescaleDB 扩展的 Postgres 配置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/postgres/source/timescale
title: 'Postgres 搭配 TimescaleDB 的源端配置指南'
keywords: ['TimescaleDB']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import BetaBadge from '@theme/badges/BetaBadge';

# 基于 TimescaleDB 的 Postgres 数据源配置指南 \{#postgres-with-timescaledb-source-setup-guide\}

<BetaBadge/>

## 背景 \{#background\}

[TimescaleDB](https://github.com/timescale/timescaledb) 是由 Timescale Inc 开发的开源 Postgres 扩展，
旨在在无需迁移出 Postgres 的情况下提升分析查询性能。其实现方式是创建由该扩展管理的
“hypertable（超表）”，并支持自动划分为多个 “chunk（分块）”。
Hypertable 还支持透明压缩以及混合行‑列式存储（称为 “hypercore”），不过这些功能需要使用
带有专有许可证的扩展版本。

Timescale Inc 还为 TimescaleDB 提供两种托管服务：
- `Managed Service for Timescale`
- `Timescale Cloud`。

也有第三方厂商提供托管服务，允许你使用 TimescaleDB 扩展，但由于许可限制，这些厂商只支持该
扩展的开源版本。

Timescale hypertable 在多个方面的行为与常规 Postgres 表不同。这会给复制它们的过程带来一定的复杂性，
因此对 Timescale hypertable 的复制能力应被视为**尽力而为（best effort）**。

## 支持的 Postgres 版本 \{#supported-postgres-versions\}

ClickPipes 支持 Postgres 12 及以上版本。

## 启用逻辑复制 \{#enable-logical-replication\}

后续步骤取决于你是如何部署包含 TimescaleDB 的 Postgres 实例的。 

- 如果你在使用托管服务，并且你的服务提供商列在侧边栏中，请按照该提供商的指南操作。
- 如果你自行部署 TimescaleDB，请遵循通用指南。 

对于其他托管服务，如果尚未启用逻辑复制，请向你的服务提供商提交支持工单，请求其协助启用逻辑复制。

:::info
Timescale Cloud 不支持逻辑复制，而逻辑复制是以 CDC 模式使用 Postgres 管道所必需的。
因此，Timescale Cloud 的用户只能通过 Postgres ClickPipe 对其数据执行一次性加载（`Initial Load Only`）。
:::

## 配置 \{#configuration\}

Timescale 超表本身并不存储插入到其中的任何数据。相反，数据存储在 `_timescaledb_internal` 模式中多个对应的 “chunk” 表里。对于在超表上运行查询而言，这不是问题。但在逻辑复制过程中，变更不是在超表上被检测到，而是在 chunk 表上被检测到。Postgres ClickPipe 内置了将 chunk 表中的变更自动重新映射回父超表的逻辑，但这需要额外的步骤。

:::info
如果你只希望执行一次性数据加载（`Initial Load Only`），请从第 2 步起跳过后续步骤。
:::

1. 为 ClickPipes 创建一个专用用户：

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 为上一步创建的用户授予 schema 级只读访问权限。下面的示例展示了对 `public` schema 的权限设置。对于每个包含你希望复制的表的 schema，请重复执行这些命令：

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. 为该用户授予复制相关的权限：

   ```sql
   GRANT rds_replication TO clickpipes_user;
   ```

4. 使用你想要复制的表创建一个 [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html)。我们强烈建议仅在 publication 中包含你真正需要的表，以避免额外的性能开销。

   :::warning
   任何包含在 publication 中的表都必须定义 **主键（primary key）**，*或者* 将其 **replica identity** 配置为 `FULL`。如何合理限定 publication 的范围，请参阅 [Postgres 常见问题](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication)。
   :::

   * 为特定表创建 publication：

     ```sql
     CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
     ```

   * 为特定 schema 中的所有表创建 publication：

     ```sql
     CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
     ```

   `clickpipes` publication 将包含由这些指定表生成的一组变更事件，后续会用于摄取复制流。

5. 为之前创建的用户授予复制权限。

```sql
-- Give replication permission to the USER
  ALTER USER clickpipes_user REPLICATION;
```

完成以上步骤后，即可[创建 ClickPipe](../index.md)。


## 配置网络访问 \{#configure-network-access\}

如果你想限制到 Timescale 实例的流量，请将[文档中列出的静态 NAT IP](../../index.md#list-of-static-ips) 加入允许列表。
不同云服务商的具体操作步骤会有所不同，如果你的服务商在侧边栏中列出，请参阅对应说明，否则请向他们提交工单进行咨询。