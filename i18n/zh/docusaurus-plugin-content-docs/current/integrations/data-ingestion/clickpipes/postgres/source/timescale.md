---
sidebar_label: 'Timescale'
description: '将带有 TimescaleDB 扩展的 Postgres 配置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/postgres/source/timescale
title: 'TimescaleDB 加持的 Postgres 源配置指南'
keywords: ['TimescaleDB']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';


# Postgres 与 TimescaleDB 源端配置指南

<BetaBadge/>



## 背景 {#background}

[TimescaleDB](https://github.com/timescale/timescaledb) 是由 Timescale Inc 开发的开源 Postgres 扩展，旨在提升分析查询性能，同时无需迁移离开 Postgres。该扩展通过创建"超表"（hypertables）来实现这一目标，超表由扩展管理并支持自动分区为"数据块"（chunks）。超表还支持透明压缩和混合行列式存储（称为"hypercore"），但这些功能需要使用具有专有许可证的扩展版本。

Timescale Inc 还为 TimescaleDB 提供两种托管服务：

- `Managed Service for Timescale`
- `Timescale Cloud`.

也有第三方供应商提供支持 TimescaleDB 扩展的托管服务，但由于许可证限制，这些供应商仅支持该扩展的开源版本。

Timescale 超表在多个方面的行为与常规 Postgres 表不同。这给复制过程带来了一些复杂性，因此复制 Timescale 超表的能力应被视为**尽力而为**。


## 支持的 Postgres 版本 {#supported-postgres-versions}

ClickPipes 支持 Postgres 12 及更高版本。


## 启用逻辑复制 {#enable-logical-replication}

具体步骤取决于您的 TimescaleDB Postgres 实例的部署方式。

- 如果您使用的是托管服务且您的服务商列在侧边栏中,请遵循该服务商的指南。
- 如果您自行部署 TimescaleDB,请遵循通用指南。

对于其他托管服务,如果尚未启用逻辑复制,请向您的服务商提交支持工单以获取帮助。

:::info
Timescale Cloud 不支持启用逻辑复制,而逻辑复制是 CDC 模式下 Postgres 管道所必需的。
因此,Timescale Cloud 用户只能使用 Postgres ClickPipe 执行一次性数据加载(`仅初始加载`)。
:::


## 配置 {#configuration}

Timescale 超表本身不存储任何插入的数据。数据实际存储在 `_timescaledb_internal` 模式中的多个对应"分块"表中。对于在超表上运行查询,这不会造成问题。但在逻辑复制过程中,我们检测的是分块表中的变更,而非超表中的变更。Postgres ClickPipe 具有自动将分块表的变更重新映射到父超表的逻辑,但这需要额外的配置步骤。

:::info
如果您只想执行一次性数据加载(`Initial Load Only`),请跳过步骤 2 及之后的步骤。
:::

1. 为管道创建一个 Postgres 用户,并授予其对您希望复制的表的 `SELECT` 权限。

```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  -- 如果需要,您可以将这些 GRANT 权限细化到单个表,而不是整个模式
  -- 但在向 ClickPipe 添加新表时,您还需要将它们添加到该用户的权限中。
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
```

:::note
请确保将 `clickpipes_user` 和 `clickpipes_password` 替换为您所需的用户名和密码。
:::

2. 作为 Postgres 超级用户/管理员用户,在源实例上创建一个发布,其中包含您要复制的表和超表,**并且还包括整个 `_timescaledb_internal` 模式**。在创建 ClickPipe 时,您需要选择此发布。

```sql
-- 在向 ClickPipe 添加新表时,您还需要手动将它们添加到发布中。
  CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>, TABLES IN SCHEMA _timescaledb_internal;
```

:::tip
我们不建议创建 `FOR ALL TABLES` 的发布,这会导致从 Postgres 到 ClickPipes 的流量增加(发送管道中不存在的其他表的变更),并降低整体效率。

对于手动创建的发布,请在将表添加到管道之前先将您想要的任何表添加到发布中。
:::

:::info
某些托管服务不会为其管理员用户提供为整个模式创建发布所需的权限。
如果是这种情况,请向您的提供商提交支持工单。或者,您可以跳过此步骤和后续步骤,执行一次性数据加载。
:::

3. 向之前创建的用户授予复制权限。

```sql
-- 向用户授予复制权限
  ALTER USER clickpipes_user REPLICATION;
```

完成这些步骤后,您应该能够继续[创建 ClickPipe](../index.md)。


## 配置网络访问 {#configure-network-access}

如果您需要限制对 Timescale 实例的流量访问,请将[文档中列出的静态 NAT IP 地址](../../index.md#list-of-static-ips)添加到白名单。
具体操作步骤因服务提供商而异,如果侧边栏中列出了您的服务提供商,请查阅相关说明;否则请向其提交工单咨询。
