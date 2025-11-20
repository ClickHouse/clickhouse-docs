---
sidebar_label: 'Supabase Postgres'
description: '将 Supabase 实例配置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/postgres/source/supabase
title: 'Supabase 数据源配置指南'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

import supabase_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-commands.jpg'
import supabase_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-connection-details.jpg'
import Image from '@theme/IdealImage';


# Supabase 源配置指南

本文档介绍如何为 ClickPipes 配置 Supabase Postgres 以供使用。

:::note

ClickPipes 原生通过 IPv6 支持 Supabase，可实现无缝复制。

:::



## 创建具有权限和复制槽的用户 {#creating-a-user-with-permissions-and-replication-slot}

让我们为 ClickPipes 创建一个新用户,赋予其适用于 CDC 的必要权限,并创建一个用于复制的发布。

为此,您可以前往 Supabase 项目的 **SQL 编辑器**。在这里,我们可以运行以下 SQL 命令:

```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- 授予用户复制权限
  ALTER USER clickpipes_user REPLICATION;

-- 创建发布。我们将在创建镜像时使用它
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

<Image
  img={supabase_commands}
  alt='用户和发布命令'
  size='large'
  border
/>

点击 **Run** 以完成发布和用户的创建。

:::note

请确保将 `clickpipes_user` 和 `clickpipes_password` 替换为您所需的用户名和密码。

另外,在 ClickPipes 中创建镜像时,请记得使用相同的发布名称。

:::


## 增加 `max_slot_wal_keep_size` {#increase-max_slot_wal_keep_size}

:::warning

此步骤将重启您的 Supabase 数据库,可能会导致短暂停机。

您可以按照 [Supabase 文档](https://supabase.com/docs/guides/database/custom-postgres-config#cli-supported-parameters) 将 Supabase 数据库的 `max_slot_wal_keep_size` 参数增加到更高的值(至少 100GB 或 `102400`)

如需获得关于此值的更佳建议,请联系 ClickPipes 团队。

:::


## 用于 Supabase 的连接详细信息 {#connection-details-to-use-for-supabase}

前往您的 Supabase 项目的 `Project Settings` -> `Database`(位于 `Configuration` 下)。

**重要提示**:在此页面上禁用 `Display connection pooler`,然后前往 `Connection parameters` 部分并记录/复制参数。

<Image
  img={supabase_connection_details}
  size='lg'
  border
  alt='定位 Supabase 连接详细信息'
  border
/>

:::info

基于 CDC 的复制不支持连接池,因此需要禁用。

:::


## 关于 RLS 的注意事项 {#note-on-rls}

ClickPipes Postgres 用户不能受 RLS 策略限制,否则可能导致数据缺失。您可以通过运行以下命令为该用户禁用 RLS 策略:

```sql
ALTER USER clickpipes_user BYPASSRLS;
```


## 下一步 {#whats-next}

现在您可以[创建 ClickPipe](../index.md)，开始将 Postgres 实例中的数据导入 ClickHouse Cloud。
请务必记录设置 Postgres 实例时使用的连接信息，创建 ClickPipe 时需要用到这些信息。
