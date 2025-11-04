---
'sidebar_label': 'Timescale'
'description': '将Postgres与TimescaleDB扩展设置为ClickPipes的源'
'slug': '/integrations/clickpipes/postgres/source/timescale'
'title': 'Postgres与TimescaleDB源设置指南'
'keywords':
- 'TimescaleDB'
'doc_type': 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';


# 配置使用 TimescaleDB 的 Postgres 源设置指南

<BetaBadge/>

## 背景 {#background}

[TimescaleDB](https://github.com/timescale/timescaledb) 是由 Timescale Inc 开发的开源 Postgres 扩展，旨在提高分析查询的性能，而无需远离 Postgres。这是通过创建由扩展管理的“超表”来实现的，它支持自动分区为“分块”。超表还支持透明压缩和混合行列存储（称为“hypercore”），尽管这些特性需要具有专有许可证的扩展版本。

Timescale Inc 还为 TimescaleDB 提供两项托管服务：
- `Managed Service for Timescale`
- `Timescale Cloud`。

还有第三方供应商提供托管服务，允许您使用 TimescaleDB 扩展，但由于许可原因，这些供应商仅支持扩展的开源版本。

Timescale 超表与常规 Postgres 表在多个方面的行为不同。这给复制过程带来了一些复杂性，这就是为什么复制 Timescale 超表的能力应视为 **尽力而为**。

## 支持的 Postgres 版本 {#supported-postgres-versions}

ClickPipes 支持 Postgres 版本 12 及更高版本。

## 启用逻辑复制 {#enable-logical-replication}

要遵循的步骤取决于您部署 TimescaleDB 的 Postgres 实例的方式。

- 如果您使用的是托管服务，并且您的提供商在侧边栏中列出，请遵循该提供商的指南。
- 如果您自己部署 TimescaleDB，请遵循通用指南。

对于其他托管服务，如果尚未启用逻辑复制，请向您的供应商提交支持工单以获得帮助。

:::info
Timescale Cloud 不支持启用逻辑复制，这在 CDC 模式下对于 Postgres 管道是必需的。因此，Timescale Cloud 的用户只能执行一次性数据加载（`Initial Load Only`）与 Postgres ClickPipe。
:::

## 配置 {#configuration}

Timescale 超表并不存储插入到它们中的任何数据。相反，数据存储在多个对应的“分块”表中，这些表位于 `_timescaledb_internal` 模式下。对于运行超表上的查询，这并不成问题。但在进行逻辑复制时，我们不是在超表中检测更改，而是在分块表中检测。Postgres ClickPipe 具有自动重新映射来自分块表的更改到父超表的逻辑，但这需要额外的步骤。

:::info
如果您只想执行一次性数据加载（`Initial Load Only`），请跳过步骤 2 及之后的步骤。
:::

1. 为管道创建一个 Postgres 用户，并授予其对您希望复制的表的 `SELECT` 权限。

```sql
CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
-- If desired, you can refine these GRANTs to individual tables alone, instead of the entire schema
-- But when adding new tables to the ClickPipe, you'll need to add them to the user as well.
GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
```

:::note
确保将 `clickpipes_user` 和 `clickpipes_password` 替换为您想要的用户名和密码。
:::

2. 作为 Postgres 超级用户/管理员用户，在源实例中创建一个包含您要复制的表和超表的发布，并 **同时包括整个 `_timescaledb_internal` 模式**。在创建 ClickPipe 时，您需要选择此发布。

```sql
-- When adding new tables to the ClickPipe, you'll need to add them to the publication as well manually. 
  CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>, TABLES IN SCHEMA _timescaledb_internal;
```

:::tip
我们不推荐创建 `FOR ALL TABLES` 的发布，这会导致更多来自 Postgres 到 ClickPipes 的流量（发送其他不在管道中的表更改），从而降低整体效率。

对于手动创建的发布，请在将任何表添加到管道之前，将其添加到发布中。
:::

:::info
某些托管服务可能没有授予其管理员用户创建整个模式发布所需的权限。如果是这种情况，请向您的供应商提交支持工单。或者，您可以跳过此步骤和后面的步骤，执行一次性数据加载。
:::

3. 授予之前创建的用户复制权限。

```sql
-- Give replication permission to the USER
  ALTER USER clickpipes_user REPLICATION;
```

完成这些步骤后，您应该能够继续 [创建 ClickPipe](../index.md)。

## 配置网络访问 {#configure-network-access}

如果您想限制对 Timescale 实例的流量，请允许列入白名单的 [文档中列出的静态 NAT IP](../../index.md#list-of-static-ips)。执行此操作的说明可能因提供商而异，请查看侧边栏，如果您的提供商在列表中，或与他们提交工单。
