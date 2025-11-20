---
sidebar_label: 'Neon Postgres'
description: '将 Neon Postgres 实例设置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/postgres/source/neon-postgres
title: 'Neon Postgres 源设置指南'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

import neon_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-commands.png'
import neon_enable_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enable-replication.png'
import neon_enabled_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enabled-replication.png'
import neon_ip_allow from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-ip-allow.png'
import neon_conn_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-conn-details.png'
import Image from '@theme/IdealImage';


# Neon Postgres 源配置指南

本指南介绍如何配置 Neon Postgres，以便在 ClickPipes 中用作复制源。
在开始配置前，请确保你已登录 [Neon 控制台](https://console.neon.tech/app/projects)。



## 创建具有权限的用户 {#creating-a-user-with-permissions}

让我们为 ClickPipes 创建一个新用户,赋予其适用于 CDC 的必要权限,同时创建一个用于复制的发布。

为此,您可以前往 **SQL Editor** 选项卡。
在这里,我们可以运行以下 SQL 命令:

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

<Image
  size='lg'
  img={neon_commands}
  alt='用户和发布命令'
  border
/>

点击 **Run** 以创建发布和用户。


## 启用逻辑复制 {#enable-logical-replication}

在 Neon 中,您可以通过 UI 启用逻辑复制。这是 ClickPipes CDC 复制数据的必要条件。
进入 **Settings** 选项卡,然后转到 **Logical Replication** 部分。

<Image
  size='lg'
  img={neon_enable_replication}
  alt='启用逻辑复制'
  border
/>

点击 **Enable** 完成设置。启用后,您将看到以下成功消息。

<Image
  size='lg'
  img={neon_enabled_replication}
  alt='逻辑复制已启用'
  border
/>

接下来验证您的 Neon Postgres 实例中的以下设置:

```sql
SHOW wal_level; -- 应为 logical
SHOW max_wal_senders; -- 应为 10
SHOW max_replication_slots; -- 应为 10
```


## IP 白名单(适用于 Neon 企业版) {#ip-whitelisting-for-neon-enterprise-plan}

如果您使用 Neon 企业版,可以将 [ClickPipes IP 地址](../../index.md#list-of-static-ips)加入白名单,以允许 ClickPipes 向您的 Neon Postgres 实例复制数据。
要执行此操作,请点击 **Settings** 选项卡并进入 **IP Allow** 部分。

<Image size='lg' img={neon_ip_allow} alt='允许 IP 地址界面' border />


## 复制连接详情 {#copy-connection-details}

现在我们已经准备好用户、发布并启用了复制功能,可以复制连接详情来创建新的 ClickPipe。
前往 **Dashboard**,在显示连接字符串的文本框中,
将视图切换为 **Parameters Only**。下一步我们将需要这些参数。

<Image size='lg' img={neon_conn_details} alt='连接详情' border />


## 下一步 {#whats-next}

现在您可以[创建 ClickPipe](../index.md) 并开始将 Postgres 实例中的数据导入 ClickHouse Cloud。
请务必记录设置 Postgres 实例时使用的连接详细信息,在创建 ClickPipe 时会用到这些信息。
