---
'sidebar_label': 'Timescale'
'description': 'Set up Postgres with the TimescaleDB extension as a source for ClickPipes'
'slug': '/integrations/clickpipes/postgres/source/timescale'
'title': 'Postgres with TimescaleDB source setup guide'
'keywords':
- 'TimescaleDB'
---

import BetaBadge from '@theme/badges/BetaBadge';


# Postgres 与 TimescaleDB 源设置指南

<BetaBadge/>

## 背景 {#background}

[TimescaleDB](https://github.com/timescale/timescaledb) 是由 Timescale Inc 开发的一款开源 Postgres 扩展，旨在提升分析查询的性能，而无需离开 Postgres。这是通过创建由扩展管理的“超表”实现的，并支持自动分区为“块”。超表还支持透明压缩和混合行-列式存储（称为“hypercore”），尽管这些特性需要具有专有许可证的扩展版本。

Timescale Inc 还提供两种管理服务用于 TimescaleDB：
- `Managed Service for Timescale`
- `Timescale Cloud`。

有第三方供应商提供允许使用 TimescaleDB 扩展的管理服务，但由于许可证的原因，这些供应商仅支持扩展的开源版本。

Timescale 超表在多个方面的行为与常规 Postgres 表不同。这给复制过程带来了一些复杂性，因此复制 Timescale 超表的能力应被视为 **尽力而为**。

## 支持的 Postgres 版本 {#supported-postgres-versions}

ClickPipes 支持 Postgres 版本 12 及更高版本。

## 启用逻辑复制 {#enable-logical-replication}

要遵循的步骤取决于您的 TimescaleDB Postgres 实例是如何部署的。

- 如果您使用的是列在侧边栏中的托管服务，请遵循该提供商的指南。
- 如果您是自行部署 TimescaleDB，请遵循通用指南。

对于其他托管服务，如果尚未启用逻辑复制，请向您的提供商提出支持请求。

:::info
Timescale Cloud 不支持启用逻辑复制，这在 CDC 模式下是 Postgres 管道所需的。
因此，Timescale Cloud 的用户只能一次性加载他们的数据（`Initial Load Only`）到 Postgres ClickPipe 中。
:::

## 配置 {#configuration}

Timescale 超表不存储插入到其中的数据。相反，数据存储在位于 `_timescaledb_internal` 模式中的多个相应“块”表中。对于在超表上运行查询，这不是问题。但在逻辑复制过程中，我们不会检测超表中的变化，而是检测块表中的变化。Postgres ClickPipe 具有逻辑，可以自动将来自块表的变化重映射到父超表，但这需要额外步骤。

:::info
如果您只想对数据执行一次性加载（`Initial Load Only`），请跳过第 2 步及之后的步骤。
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

2. 作为 Postgres 超用户/管理员用户，在源实例上创建一个包含您希望复制的表和超表，并且 **也包括整个 `_timescaledb_internal` 模式** 的发布。在创建 ClickPipe 时，您需要选择此发布。

```sql
-- When adding new tables to the ClickPipe, you'll need to add them to the publication as well manually. 
  CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, TABLES IN SCHEMA _timescaledb_internal;
```

:::tip
我们不建议创建 `FOR ALL TABLES` 的出版物，这会导致从 Postgres 到 ClickPipes 产生更多的流量（发送其他不在管道中的表的变化），并降低整体效率。
::: 

:::info
某些托管服务不允许其管理员用户创建整个模式的出版物所需的权限。如果是这种情况，请向您的提供商提出支持请求。或者，您可以跳过此步骤及后续步骤，并执行数据的一次性加载。
:::

3. 授予先前创建的用户复制权限。

```sql
-- Give replication permission to the USER
  ALTER USER clickpipes_user REPLICATION;
```

完成这些步骤后，您应该能够继续 [创建 ClickPipe](../index.md)。

## 故障排除 {#troubleshooting}

表的初始加载可能会出现错误：

```sql
ERROR: transparent decompression only supports tableoid system column (SQLSTATE 42P10)
```

您可能需要禁用这些表的 [压缩](https://docs.timescale.com/api/latest/compression/decompress_chunk) 或 [hypercore 列存](https://docs.timescale.com/api/latest/hypercore/convert_to_rowstore)。

## 配置网络访问 {#configure-network-access}

如果您想限制对 Timescale 实例的流量，请允许列出的 [文档中静态 NAT IP](../../index.md#list-of-static-ips)。
执行此操作的说明因提供商而异，请咨询侧边栏中列出的提供商或向他们提交请求。
