import supabase_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-commands.jpg'
import supabase_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-connection-details.jpg'
import Image from '@theme/IdealImage';

# Supabase 源设置指南

这是一个关于如何设置 Supabase Postgres 以便在 ClickPipes 中使用的指南。

:::note

ClickPipes 原生支持通过 IPv6 与 Supabase 进行无缝复制。

:::


## 创建具有权限和复制槽的用户 {#creating-a-user-with-permissions-and-replication-slot}

让我们为 ClickPipes 创建一个具有适合 CDC 的必要权限的新用户，并创建一个我们将用于复制的发布。

为此，您可以前往您的 Supabase 项目的 **SQL 编辑器**。
在这里，我们可以运行以下 SQL 命令：
```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- Give replication permission to the USER
  ALTER USER clickpipes_user REPLICATION;

-- Create a publication. We will use this when creating the mirror
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

<Image img={supabase_commands} alt="用户和发布命令" size="large" border/>


单击 **运行** 来准备发布和用户。

:::note

确保将 `clickpipes_user` 和 `clickpipes_password` 替换为您想要的用户名和密码。

此外，请记住在 ClickPipes 中创建镜像时使用相同的发布名称。

:::


## 增加 `max_slot_wal_keep_size` {#increase-max_slot_wal_keep_size}


:::warning

此步骤将重启您的 Supabase 数据库，并可能导致短暂的停机。

您可以通过遵循 [Supabase Docs](https://supabase.com/docs/guides/database/custom-postgres-config#cli-supported-parameters) 将 Supabase 数据库的 `max_slot_wal_keep_size` 参数增加到更高的值（至少 100GB 或 `102400`）。

如需更好的推荐值，您可以联系 ClickPipes 团队。

:::

## 用于 Supabase 的连接详情 {#connection-details-to-use-for-supabase}

前往您的 Supabase 项目的 `项目设置` -> `数据库`（在 `配置` 下）。

**重要**：在此页面上禁用 `显示连接池`，然后前往 `连接参数` 部分并记录/复制参数。

<Image img={supabase_connection_details} size="lg" border alt="定位 Supabase 连接详情" border/>

:::info

连接池不支持基于 CDC 的复制，因此需要禁用它。

:::


## 接下来是什么？ {#whats-next}

您现在可以 [创建您的 ClickPipe](../index.md) 并开始将数据从您的 Postgres 实例摄取到 ClickHouse Cloud。
请确保记录您在设置 Postgres 实例时使用的连接详情，因为您将在 ClickPipe 创建过程中需要它们。
