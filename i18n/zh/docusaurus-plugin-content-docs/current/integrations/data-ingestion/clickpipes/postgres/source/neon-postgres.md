---
'sidebar_label': 'Neon Postgres'
'description': '将 Neon Postgres 实例设置为 ClickPipes 的数据源'
'slug': '/integrations/clickpipes/postgres/source/neon-postgres'
'title': 'Neon Postgres 源设置指南'
'doc_type': 'guide'
---

import neon_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-commands.png'
import neon_enable_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enable-replication.png'
import neon_enabled_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enabled-replication.png'
import neon_ip_allow from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-ip-allow.png'
import neon_conn_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-conn-details.png'
import Image from '@theme/IdealImage';


# Neon Postgres 源设置指南

这是一个关于如何设置 Neon Postgres 的指南，您可以将其用于 ClickPipes 的复制。确保您已登录到您的 [Neon 控制台](https://console.neon.tech/app/projects) 进行此设置。

## 创建具有权限的用户 {#creating-a-user-with-permissions}

让我们为 ClickPipes 创建一个新的用户，并授予其适合 CDC 的必要权限，同时创建一个用于复制的发布。

为此，您可以前往 **SQL 编辑器** 选项卡。在这里，我们可以运行以下 SQL 命令：

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

<Image size="lg" img={neon_commands} alt="用户和发布命令" border/>

单击 **运行**，以准备好一个发布和一个用户。

## 启用逻辑复制 {#enable-logical-replication}

在 Neon 中，您可以通过 UI 启用逻辑复制。这对于 ClickPipes 的 CDC 复制数据是必要的。前往 **设置** 选项卡，然后转到 **逻辑复制** 部分。

<Image size="lg" img={neon_enable_replication} alt="启用逻辑复制" border/>

单击 **启用**，以在这里完成设置。您启用后应该会看到以下成功消息。

<Image size="lg" img={neon_enabled_replication} alt="逻辑复制已启用" border/>

让我们验证您 Neon Postgres 实例中的以下设置：
```sql
SHOW wal_level; -- should be logical
SHOW max_wal_senders; -- should be 10
SHOW max_replication_slots; -- should be 10
```

## IP 白名单 (适用于 Neon 企业计划) {#ip-whitelisting-for-neon-enterprise-plan}

如果您拥有 Neon 企业计划，可以将 [ClickPipes IP](../../index.md#list-of-static-ips) 加入白名单，以允许 ClickPipes 对您的 Neon Postgres 实例进行复制。为此，您可以单击 **设置** 选项卡并转到 **IP 允许** 部分。

<Image size="lg" img={neon_ip_allow} alt="允许 IP 屏幕" border/>

## 复制连接详细信息 {#copy-connection-details}

现在我们已经准备好了用户、发布，并启用了复制，我们可以复制连接详细信息以创建新的 ClickPipe。前往 **仪表板**，在显示连接字符串的文本框中，将视图更改为 **仅参数**。我们将在下一步中需要这些参数。

<Image size="lg" img={neon_conn_details} alt="连接详细信息" border/>

## 下一步怎么办？ {#whats-next}

您现在可以 [创建您的 ClickPipe](../index.md) 并开始从您的 Postgres 实例向 ClickHouse Cloud 中摄取数据。请确保记下您在设置 Postgres 实例时使用的连接详细信息，因为在创建 ClickPipe 过程中您将需要这些信息。
