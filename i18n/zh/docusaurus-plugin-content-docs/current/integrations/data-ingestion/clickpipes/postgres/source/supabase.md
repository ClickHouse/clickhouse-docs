---
sidebar_label: Supabase Postgres
description: 设置 Supabase 实例作为 ClickPipes 的数据源
slug: /integrations/clickpipes/postgres/source/supabase
---

import supabase_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-commands.jpg'
import supabase_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-connection-details.jpg' 


# Supabase 数据源设置指南

这是关于如何设置 Supabase Postgres 以供 ClickPipes 使用的指南。

:::note

ClickPipes 原生支持通过 IPv6 进行无缝复制。

:::


## 创建具有权限和复制槽的用户 {#creating-a-user-with-permissions-and-replication-slot}

让我们为 ClickPipes 创建一个新用户，赋予其适合 CDC 所需的权限，同时创建一个我们将在复制中使用的发布。

为此，您可以前往您的 Supabase 项目的 **SQL 编辑器**。在这里，我们可以运行以下 SQL 命令：
```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- 给该用户赋予复制权限
  ALTER USER clickpipes_user REPLICATION;

-- 创建发布。我们将在创建镜像时使用此发布
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

<img src={supabase_commands} alt="用户和发布命令"/>


点击 **运行** 以准备好发布和用户。

:::note

确保用您想要的用户名和密码替换 `clickpipes_user` 和 `clickpipes_password`。

另外，请记得在 ClickPipes 中创建镜像时使用相同的发布名称。

:::


## 增加 `max_slot_wal_keep_size` {#increase-max_slot_wal_keep_size}


:::warning

此步骤将重新启动您的 Supabase 数据库，并可能导致短暂的停机时间。

您可以通过以下步骤将 Supabase 数据库的 `max_slot_wal_keep_size` 参数增加到更高的值（至少 100GB 或 `102400`），具体请参阅 [Supabase 文档](https://supabase.com/docs/guides/database/custom-postgres-config#cli-supported-parameters)。

如需对此值的更好建议，您可以联系 ClickPipes 团队。

:::

## 使用 Supabase 的连接详细信息 {#connection-details-to-use-for-supabase}

前往您的 Supabase 项目的 `项目设置` -> `数据库`（在 `配置` 下）。

**重要**：在此页面上禁用 `显示连接池`，然后前往 `连接参数` 部分，记录/复制该参数。

<img src={supabase_connection_details} alt="定位 Supabase 连接详细信息"/>

:::info

连接池不支持基于 CDC 的复制，因此需要禁用。

:::


## 接下来是什么？ {#whats-next}

您现在可以 [创建您的 ClickPipe](../index.md)，并开始将数据从您的 Postgres 实例导入到 ClickHouse Cloud。请确保记录您在设置 Postgres 实例时使用的连接详细信息，因为在创建 ClickPipe 过程中将需要这些信息。
