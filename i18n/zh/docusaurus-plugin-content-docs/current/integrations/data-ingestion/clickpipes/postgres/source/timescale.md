---
'sidebar_label': 'Timescale'
'description': '将Postgres与TimescaleDB扩展设置为ClickPipes的源'
'slug': '/integrations/clickpipes/postgres/source/timescale'
'title': 'Postgres与TimescaleDB源设置指南'
'keywords':
- 'TimescaleDB'
---

import BetaBadge from '@theme/badges/BetaBadge';


# Postgres with TimescaleDB 源设置指南

<BetaBadge/>

## 背景 {#background}

[TimescaleDB](https://github.com/timescale/timescaledb) 是由 Timescale Inc 开发的开源 Postgres 扩展，它旨在提高分析查询的性能，而无需迁移离开 Postgres。这是通过创建由扩展管理的“超表”，并支持自动分区为“块”来实现的。超表还支持透明压缩和混合行列存储（称为“hypercore”），尽管这些功能需要具有专有许可证的扩展版本。

Timescale Inc 还为 TimescaleDB 提供两种托管服务：
- `Managed Service for Timescale`
- `Timescale Cloud`。

有第三方供应商提供托管服务，允许您使用 TimescaleDB 扩展，但由于许可证限制，这些供应商仅支持开源版本的扩展。

Timescale 超表在多个方面的行为与常规 Postgres 表不同。这给复制它们的过程带来了一些复杂性，这就是为什么考虑复制 Timescale 超表的能力应被视为 **尽力而为**。

## 支持的 Postgres 版本 {#supported-postgres-versions}

ClickPipes 支持 Postgres 版本 12 及更高版本。

## 启用逻辑复制 {#enable-logical-replication}

要遵循的步骤取决于您的 TimescaleDB 实例的部署方式。

- 如果您使用的是托管服务，并且您的服务提供商在侧边栏中列出，请遵循该提供商的指南。
- 如果您自己部署 TimescaleDB，请遵循通用指南。

对于其他托管服务，如果尚未启用逻辑复制，请向您的服务提供商提交支持票。

:::info
Timescale Cloud 不支持启用逻辑复制，这是在 CDC 模式下 Postgres 管道所需的。因此，Timescale Cloud 的用户只能进行一次性加载数据（`Initial Load Only`）与 Postgres ClickPipe。
:::

## 配置 {#configuration}

Timescale 超表不存储插入到其中的任何数据。相反，数据存储在 `_timescaledb_internal` 模式下的多个对应“块”表中。对于在超表上运行查询，这并没有问题。但在逻辑复制过程中，我们检测到的变化不是在超表中，而是在块表中。Postgres ClickPipe 有逻辑可以自动将块表中的更改重新映射到父超表，但这需要额外的步骤。

:::info
如果您只想进行一次性加载数据（`Initial Load Only`），请跳过第 2 步及后续步骤。
:::

1. 为管道创建一个 Postgres 用户，并授予其 `SELECT` 权限，允许查询您希望复制的表。

```sql
CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
-- If desired, you can refine these GRANTs to individual tables alone, instead of the entire schema
-- But when adding new tables to the ClickPipe, you'll need to add them to the user as well.
GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
```

:::note
确保将 `clickpipes_user` 和 `clickpipes_password` 替换为您希望使用的用户名和密码。
:::

2. 作为 Postgres 超级用户/管理员用户，在源实例上创建一个发布，其中包含您要复制的表和超表 **并且还包括整个 `_timescaledb_internal` 模式**。在创建 ClickPipe 时，您需要选择此发布。

```sql
-- When adding new tables to the ClickPipe, you'll need to add them to the publication as well manually. 
  CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, TABLES IN SCHEMA _timescaledb_internal;
```

:::tip
我们不推荐创建 `FOR ALL TABLES` 的发布，这会导致更多的流量从 Postgres 到 ClickPipes（发送其他不在管道中的表的更改），并降低整体效率。
:::

:::info
某些托管服务未授予其管理员用户创建整个模式发布所需的权限。如果是这种情况，请向您的服务提供商提交支持票。或者，您可以跳过此步骤及后续步骤，并进行一次性加载数据。
:::

3. 授予先前创建的用户复制权限。

```sql
-- Give replication permission to the USER
  ALTER USER clickpipes_user REPLICATION;
```

完成这些步骤后，您应该能够继续 [创建 ClickPipe](../index.md)。

## 故障排查 {#troubleshooting}

表的初始加载可能会遇到错误：

```sql
ERROR: transparent decompression only supports tableoid system column (SQLSTATE 42P10)
```

您可能需要禁用 [压缩](https://docs.timescale.com/api/latest/compression/decompress_chunk) 或 [hypercore 列存储](https://docs.timescale.com/api/latest/hypercore/convert_to_rowstore) 对于这些表。

## 配置网络访问 {#configure-network-access}

如果您想限制对 Timescale 实例的流量，请允许列入白名单的 [文档中的静态 NAT IP 地址](../../index.md#list-of-static-ips)。不同供应商的操作步骤会有所不同，请咨询侧边栏，如果您的供应商在列出中，或者向他们提交票据。
