---
sidebar_label: 'Supabase Postgres'
description: '将 Supabase 实例设置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/postgres/source/supabase
title: 'Supabase 源设置指南'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', '数据摄取', '实时同步']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import supabase_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-commands.jpg'
import supabase_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-connection-details.jpg'
import Image from '@theme/IdealImage';


# Supabase 源配置指南 \{#supabase-source-setup-guide\}

本文档介绍如何将 Supabase Postgres 配置为在 ClickPipes 中使用的数据源。

:::note

ClickPipes 原生支持通过 IPv6 访问 Supabase，实现无缝复制。

:::

## 创建具有权限和复制槽位的用户 \{#creating-a-user-with-permissions-and-replication-slot\}

以管理员用户身份连接到你的 Supabase 实例，并执行以下命令：

1. 为 ClickPipes 创建一个专用用户：

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 为你在上一步创建的用户授予模式级、只读访问权限。下面的示例展示了为 `public` 模式授予权限。对每个包含你希望复制的表的模式重复执行这些命令：
   
    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. 为该用户授予复制权限：

   ```sql
   ALTER USER clickpipes_user WITH REPLICATION;
   ```

4. 使用你想要复制的表创建一个 [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html)。强烈建议仅在 publication 中包含你需要的表，以避免额外的性能开销。

   :::warning
   包含在 publication 中的任何表都必须定义有**主键**，_或者_ 其 **replica identity** 被配置为 `FULL`。关于作用范围的指导，请参阅 [Postgres 常见问题](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication)。
   :::

   - 为特定表创建 publication：

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 为特定模式中的所有表创建 publication：

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` publication 将包含由指定表生成的一组变更事件，后续将用于摄取复制流。

## 增加 `max_slot_wal_keep_size` \{#increase-max_slot_wal_keep_size\}

:::warning

此步骤会重启 Supabase 数据库，并可能导致短暂停机。

你可以按照 [Supabase 文档](https://supabase.com/docs/guides/database/custom-postgres-config#cli-supported-parameters) 的说明，将 Supabase 数据库的 `max_slot_wal_keep_size` 参数提高到更高的数值（至少 100GB 或 `102400`）。

如需获得对此参数取值的更佳建议，你可以联系 ClickPipes 团队。

:::

## 用于 Supabase 的连接信息 \{#connection-details-to-use-for-supabase\}

前往你的 Supabase 项目的 `Project Settings` -> `Database`（位于 `Configuration` 下）。

**重要**：在此页面禁用 `Display connection pooler`，然后前往 `Connection parameters` 部分，记录或复制这些参数。

<Image img={supabase_connection_details} size="lg" border alt="Locate Supabase Connection Details" border/>

:::info

连接池对基于 CDC（变更数据捕获）的复制不受支持，因此需要将其禁用。

:::

## 关于 RLS 的说明 \{#note-on-rls\}

ClickPipes 的 Postgres 用户不能受 RLS 策略限制，否则可能导致数据缺失。可以通过运行下面的命令为该用户禁用 RLS 策略：

```sql
ALTER USER clickpipes_user BYPASSRLS;
```


## 下一步 \{#whats-next\}

现在你可以[创建 ClickPipe](../index.md)，并开始将 Postgres 实例中的数据摄取到 ClickHouse Cloud 中。
请务必记录在设置 Postgres 实例时使用的连接信息，因为在创建 ClickPipe 的过程中会用到这些信息。