---
sidebar_label: 'Neon Postgres'
description: '将 Neon Postgres 实例配置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/postgres/source/neon-postgres
title: 'Neon Postgres 数据源配置指南'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', '数据摄取', '实时同步']
---

import neon_enable_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enable-replication.png'
import neon_enabled_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enabled-replication.png'
import neon_ip_allow from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-ip-allow.png'
import neon_conn_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-conn-details.png'
import Image from '@theme/IdealImage';


# Neon Postgres 源端设置指南 {#neon-postgres-source-setup-guide}

本文档介绍如何配置 Neon Postgres，使其可在 ClickPipes 中用作数据复制源。
在进行本次设置前，请确保已登录到 [Neon 控制台](https://console.neon.tech/app/projects)。

## 创建具有权限的用户 {#creating-a-user-with-permissions}

以管理员用户身份连接到你的 Neon 实例，并执行以下命令：

1. 为 ClickPipes 创建一个专用用户：

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 为你在上一步创建的用户授予架构级只读访问权限。以下示例展示了对 `public` 架构的权限配置。对于每个包含你希望复制的表的架构，请重复这些命令：
   
    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. 为该用户授予复制权限：

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. 创建一个包含你希望复制的表的[发布](https://www.postgresql.org/docs/current/logical-replication-publication.html)。我们强烈建议在发布中只包含你需要的表，以避免额外的性能开销。

   :::warning
   包含在发布中的任何表必须要么定义了**主键（primary key）**，要么将其 **replica identity** 配置为 `FULL`。有关作用域划分的指导，请参阅 [Postgres 常见问题](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication)。
   :::

   - 为特定表创建一个发布：

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 为特定架构中的所有表创建一个发布：

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` 发布将包含由指定表生成的变更事件集合，并将在后续用于摄取复制流。

## 启用逻辑复制 {#enable-logical-replication}

在 Neon 中，可以通过 UI 启用逻辑复制。这是 ClickPipes 的 CDC 复制数据所必需的。
前往 **Settings** 选项卡，然后进入 **Logical Replication** 部分。

<Image size="lg" img={neon_enable_replication} alt="启用逻辑复制" border />

点击 **Enable** 即可完成此步骤。启用后，应会看到如下成功提示。

<Image size="lg" img={neon_enabled_replication} alt="逻辑复制已启用" border />

接下来在 Neon Postgres 实例中验证以下设置：

```sql
SHOW wal_level; -- should be logical
SHOW max_wal_senders; -- should be 10
SHOW max_replication_slots; -- should be 10
```


## IP 白名单（适用于 Neon 企业计划） {#ip-whitelisting-for-neon-enterprise-plan}

如果您使用的是 Neon 企业计划，可以将 [ClickPipes IP](../../index.md#list-of-static-ips) 加入白名单，从而允许 ClickPipes 将数据复制到您的 Neon Postgres 实例。
为此，您可以点击 **Settings** 选项卡并进入 **IP Allow** 部分。

<Image size="lg" img={neon_ip_allow} alt="Allow IPs screen" border/>

## 复制连接信息 {#copy-connection-details}

现在我们已经创建了用户、准备好了 publication 并启用了复制，可以复制连接信息来创建一个新的 ClickPipe。
前往 **Dashboard**，在显示连接字符串的文本框中，
将视图切换为 **Parameters Only**。我们在下一步会用到这些参数。

<Image size="lg" img={neon_conn_details} alt="连接信息" border/>

## 后续步骤 {#whats-next}

现在你可以[创建你的 ClickPipe](../index.md)，并开始将 Postgres 实例中的数据摄取到 ClickHouse Cloud。
请务必记录下在设置 Postgres 实例时使用的连接信息，因为在创建 ClickPipe 时你将需要这些信息。