---
sidebar_label: 'Supabase Postgres'
description: '将 Supabase 实例配置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/postgres/source/supabase
title: 'Supabase 数据源配置指南'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', '数据摄取', '实时同步']
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

让我们为 ClickPipes 创建一个新用户，授予适用于 CDC 的必要权限，
并创建一个用于复制的发布（publication）。

为此，你可以打开 Supabase 项目的 **SQL 编辑器**。
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

<Image img={supabase_commands} alt="用户和 publication 命令" size="large" border />

点击 **Run** 以创建一个 publication 和一个用户。

:::note

请务必将 `clickpipes_user` 和 `clickpipes_password` 替换为你想要的用户名和密码。

另外，在 ClickPipes 中创建镜像（mirror）时，请记得使用相同的 publication 名称。

:::

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
