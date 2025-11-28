---
sidebar_label: 'Timescale'
description: '将带有 TimescaleDB 扩展的 Postgres 配置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/postgres/source/timescale
title: 'Postgres 搭配 TimescaleDB 的源端配置指南'
keywords: ['TimescaleDB']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';


# 基于 TimescaleDB 的 Postgres 数据源配置指南

<BetaBadge/>



## 背景 {#background}

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



## 支持的 Postgres 版本 {#supported-postgres-versions}

ClickPipes 支持 Postgres 12 及以上版本。



## 启用逻辑复制 {#enable-logical-replication}

后续步骤取决于你是如何部署包含 TimescaleDB 的 Postgres 实例的。 

- 如果你在使用托管服务，并且你的服务提供商列在侧边栏中，请按照该提供商的指南操作。
- 如果你自行部署 TimescaleDB，请遵循通用指南。 

对于其他托管服务，如果尚未启用逻辑复制，请向你的服务提供商提交支持工单，请求其协助启用逻辑复制。

:::info
Timescale Cloud 不支持逻辑复制，而逻辑复制是以 CDC 模式使用 Postgres 管道所必需的。
因此，Timescale Cloud 的用户只能通过 Postgres ClickPipe 对其数据执行一次性加载（`Initial Load Only`）。
:::



## 配置

Timescale 超表本身并不存储插入到其中的任何数据。相反，数据存储在 `_timescaledb_internal` 模式中多个对应的 “chunk” 表里。对于在超表上运行查询而言，这不是问题。但在逻辑复制过程中，变更不是在超表上被检测到，而是在 chunk 表上被检测到。Postgres ClickPipe 内置了将 chunk 表中的变更自动重新映射回父超表的逻辑，但这需要额外的步骤。

:::info
如果你只希望执行一次性数据加载（`Initial Load Only`），请从第 2 步起跳过后续步骤。
:::

1. 为该 ClickPipe 创建一个 Postgres 用户，并授予其对你希望复制的表执行 `SELECT` 的权限。

```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  -- 如需要,可以将这些 GRANT 权限细化到单个表,而不是整个模式
  -- 但向 ClickPipe 添加新表时,也需要将这些表的权限授予该用户。
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
```

:::note
请务必将 `clickpipes_user` 和 `clickpipes_password` 替换为所需的用户名和密码。
:::

2. 以 Postgres 超级用户或管理员用户身份，在源实例上创建一个 publication，其中包含你想要复制的表和 hypertable，**并且还必须包含整个 `_timescaledb_internal` schema**。创建 ClickPipe 时，你需要选择这个 publication。

```sql
-- 向 ClickPipe 添加新表时,需要手动将这些表同时添加到发布中。 
  CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>, TABLES IN SCHEMA _timescaledb_internal;
```

:::tip
我们不建议创建 `FOR ALL TABLES` 的 publication。这样会导致从 Postgres 到 ClickPipes 的流量增加（会发送该 pipe 中未包含的其他表的变更），从而降低整体效率。

对于手动创建的 publication，请在将表添加到 pipe 之前，先将需要的表添加到该 publication 中。
:::

:::info
某些托管服务不会为其管理员用户授予在整个 schema 上创建 publication 所需的权限。
如果是这种情况，请向服务提供商提交支持工单。或者，你也可以跳过此步骤和后续步骤，改为对数据执行一次性加载。
:::

3. 为之前创建的用户授予复制权限。

```sql
-- 为 USER 授予复制权限
  ALTER USER clickpipes_user REPLICATION;
```

完成以上步骤后，即可[创建 ClickPipe](../index.md)。


## 配置网络访问 {#configure-network-access}

如果你想限制到 Timescale 实例的流量，请将[文档中列出的静态 NAT IP](../../index.md#list-of-static-ips) 加入允许列表。
不同云服务商的具体操作步骤会有所不同，如果你的服务商在侧边栏中列出，请参阅对应说明，否则请向他们提交工单进行咨询。
