import BetaBadge from '@theme/badges/BetaBadge';

# Postgres with TimescaleDB 源设置指南

<BetaBadge/>

## 背景 {#background}

[TimescaleDB](https://github.com/timescale/timescaledb) 是一家由 Timescale Inc 开发的开源 Postgres 扩展，旨在提升分析查询的性能，而无需离开 Postgres。其通过创建由扩展管理的“超表”，并支持自动分区为“分片”来实现这一目标。超表还支持透明压缩和混合行列存储（称为“超核心”），尽管这些功能需要具有专有许可证的扩展版本。

Timescale Inc 还提供了两种针对 TimescaleDB 的托管服务：
- `Managed Service for Timescale`
- `Timescale Cloud`。

还有第三方供应商提供托管服务，允许您使用 TimescaleDB 扩展，但由于许可证原因，这些供应商仅支持开源版本的扩展。

Timescale 超表在多个方面的行为与常规 Postgres 表不同。这使得复制它们的过程变得复杂，因此复制 Timescale 超表的能力应视为 **尽力而为**。

## 支持的 Postgres 版本 {#supported-postgres-versions}

ClickPipes 支持 Postgres 版本 12 及更高版本。

## 启用逻辑复制 {#enable-logical-replication}

要遵循的步骤取决于您与 TimescaleDB 部署的 Postgres 实例。

- 如果您使用的是托管服务，并且您的提供商已列在侧边栏，请按照该提供商的指南进行操作。
- 如果您自己部署 TimescaleDB，请遵循通用指南。

对于其他托管服务，如果尚未启用逻辑复制，请向您的提供商提交支持票。

:::info
Timescale Cloud 不支持启用逻辑复制，而这对于以 CDC 模式运行的 Postgres 管道是必要的。因此，Timescale Cloud 的用户只能进行一次性数据加载（`Initial Load Only`）与 Postgres ClickPipe。
:::

## 配置 {#configuration}

Timescale 超表不存储插入到其中的数据。相反，数据存储在与之对应的多个“分片”表中，这些表位于 `_timescaledb_internal` 模式中。对于在超表上运行查询，这并不是问题。但是在逻辑复制期间，我们不是检测超表中的更改，而是检测分片表中的更改。Postgres ClickPipe 有逻辑可自动将来自分片表的更改重映射到父超表，但这需要额外的步骤。

:::info
如果您只想进行一次性数据加载（`Initial Load Only`），请跳过第 2 步及后续步骤。
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

2. 作为 Postgres 超用户/管理员用户，在源实例上创建一个包含您希望复制的表和超表的出版物，并 **同时包括整个 `_timescaledb_internal` 模式**。在创建 ClickPipe 时，您需要选择此出版物。

```sql
-- When adding new tables to the ClickPipe, you'll need to add them to the publication as well manually. 
  CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, TABLES IN SCHEMA _timescaledb_internal;
```

:::tip
我们不建议创建 `FOR ALL TABLES` 的出版物，因为这会导致从 Postgres 到 ClickPipes 的更多流量（将其他不在管道中的表的更改发送过来），从而降低整体效率。
::: 

:::info
某些托管服务不授予其管理员用户创建整个模式出版物所需的权限。如果是这种情况，请向您的提供商提交支持票。或者，您可以跳过此步骤及后续步骤，进行一次性数据加载。
:::

3. 向先前创建的用户授予复制权限。

```sql
-- Give replication permission to the USER
  ALTER USER clickpipes_user REPLICATION;
```

完成这些步骤后，您应该能够继续 [创建 ClickPipe](../index.md)。

## 故障排除 {#troubleshooting}

表的初始加载可能会发生错误：

```sql
ERROR: transparent decompression only supports tableoid system column (SQLSTATE 42P10)
```

您可能需要禁用 [压缩](https://docs.timescale.com/api/latest/compression/decompress_chunk) 或 [超核心列存储](https://docs.timescale.com/api/latest/hypercore/convert_to_rowstore) 以便这些表的正常运行。

## 配置网络访问 {#configure-network-access}

如果您想限制对 Timescale 实例的流量，请允许列入白名单 [文档中的静态 NAT IPs](../../index.md#list-of-static-ips)。具体操作因提供商而异，请查阅侧边栏以查看您的提供商是否被列出，或者向他们提交票据。
