---
sidebar_label: 'Supabase Postgres'
description: '将 Supabase 实例配置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/postgres/source/supabase
title: 'Supabase 数据源配置指南'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', '数据摄取', '实时同步']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import supabase_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-commands.jpg'
import supabase_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-connection-details.jpg'
import Image from '@theme/IdealImage';

# Supabase 源配置指南 {#supabase-source-setup-guide}

本文档介绍如何为在 ClickPipes 中使用而配置 Supabase Postgres。

:::note

ClickPipes 原生通过 IPv6 支持 Supabase，可实现无缝复制。

:::

## 创建具有权限和复制槽的用户 {#creating-a-user-with-permissions-and-replication-slot}

以管理员用户身份连接到你的 Supabase 实例，并执行以下命令：

1. 为 ClickPipes 创建一个专用用户：

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 为你在上一步创建的用户授予模式级的只读访问权限。以下示例展示了对 `public` 模式的权限。对于每个包含你希望复制的表的模式，都需要重复执行这些命令：
   
    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. 为该用户授予复制权限：

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. 使用你想要复制的表创建一个 [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html)。强烈建议只在 publication 中包含必要的表，以避免额外的性能开销。

   :::warning
   任何包含在 publication 中的表必须要么定义了**主键（primary key）**，要么将其 **replica identity** 配置为 `FULL`。有关如何限定 publication 范围的指导，请参阅 [Postgres 常见问题](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication)。
   :::

   - 为特定表创建 publication：

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 为特定模式中的所有表创建 publication：

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` publication 将包含由这些指定表生成的一组变更事件，并将在后续用于摄取复制流。

## 增加 `max_slot_wal_keep_size` {#increase-max_slot_wal_keep_size}

:::warning

本步骤将重启您的 Supabase 数据库，并可能导致短暂的停机。

您可以按照 [Supabase 文档](https://supabase.com/docs/guides/database/custom-postgres-config#cli-supported-parameters) 的说明，将 Supabase 数据库的 `max_slot_wal_keep_size` 参数提高到更大的值（至少 100GB 或 `102400`）。

如需更合理的参数取值建议，您可以联系 ClickPipes 团队。

:::

## 在 Supabase 中使用的连接信息 {#connection-details-to-use-for-supabase}

进入你的 Supabase 项目的 `Project Settings` -> `Database`（位于 `Configuration` 下）。

**重要**：在此页面禁用 `Display connection pooler`，然后转到 `Connection parameters` 部分并记录或复制这些参数。

<Image img={supabase_connection_details} size="lg" border alt="Locate Supabase Connection Details" border/>

:::info

基于 CDC 的复制不支持 connection pooler，因此需要将其禁用。

:::

## 关于 RLS 的说明 {#note-on-rls}

ClickPipes 使用的 Postgres 用户不能受到 RLS 策略的限制，否则可能会导致数据缺失。您可以通过运行下列命令来为该用户禁用 RLS 策略：

```sql
ALTER USER clickpipes_user BYPASSRLS;
```


## 下一步？ {#whats-next}

你现在可以[创建 ClickPipe](../index.md)，并开始将 Postgres 实例中的数据摄取到 ClickHouse Cloud 中。
请务必记录在配置 Postgres 实例时使用的连接参数，因为在创建 ClickPipe 的过程中你将需要这些信息。