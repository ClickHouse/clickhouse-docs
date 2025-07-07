---
'sidebar_label': 'Supabase Postgres'
'description': '将 Supabase 实例设置为 ClickPipes 的数据源'
'slug': '/integrations/clickpipes/postgres/source/supabase'
'title': 'Supabase 源设置指南'
---

import supabase_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-commands.jpg'
import supabase_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-connection-details.jpg'
import Image from '@theme/IdealImage';


# Supabase 源设置指南

这是关于如何为 ClickPipes 设置 Supabase Postgres 的指南。

:::note

ClickPipes 原生支持通过 IPv6 进行无缝复制的 Supabase。

:::


## 创建具有权限和复制插槽的用户 {#creating-a-user-with-permissions-and-replication-slot}

我们来为 ClickPipes 创建一个具有适合 CDC 的必要权限的新用户，并创建一个我们将用于复制的发布。

为此，您可以前往您的 Supabase 项目的 **SQL 编辑器**。在这里，我们可以运行以下 SQL 命令：
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


单击 **运行** 以准备一个发布和一个用户。

:::note

确保将 `clickpipes_user` 和 `clickpipes_password` 替换为您想要的用户名和密码。

另外，请记住在 ClickPipes 中创建镜像时使用相同的发布名称。

:::


## 增加 `max_slot_wal_keep_size` {#increase-max_slot_wal_keep_size}


:::warning

此步骤将重新启动您的 Supabase 数据库，并可能导致短暂的停机。

您可以通过以下 [Supabase Docs](https://supabase.com/docs/guides/database/custom-postgres-config#cli-supported-parameters) 提高您 Supabase 数据库的 `max_slot_wal_keep_size` 参数的值（至少 100GB 或 `102400`）。

如需更好的建议，您可以联系 ClickPipes 团队。

:::

## 用于 Supabase 的连接详情 {#connection-details-to-use-for-supabase}

前往您的 Supabase 项目的 `项目设置` -> `数据库`（在 `配置` 下）。

**重要**：在此页面上禁用 `显示连接池器`，然后转到 `连接参数` 部分并记录/复制参数。

<Image img={supabase_connection_details} size="lg" border alt="查找 Supabase 连接详情" border/>

:::info

连接池器不支持基于 CDC 的复制，因此需要禁用。

:::


## 接下来是什么？ {#whats-next}

您现在可以 [创建您的 ClickPipe](../index.md)，并开始从您的 Postgres 实例向 ClickHouse Cloud 导入数据。确保记下您在设置 Postgres 实例时使用的连接详情，因为您在创建 ClickPipe 过程中需要这些信息。
