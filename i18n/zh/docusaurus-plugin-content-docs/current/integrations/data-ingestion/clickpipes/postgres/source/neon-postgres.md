---
sidebar_label: 'Neon Postgres'
description: '将 Neon Postgres 实例设置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/postgres/source/neon-postgres
title: 'Neon Postgres 源设置指南'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'CDC（变更数据捕获）', '数据摄取', '实时同步']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import neon_enable_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enable-replication.png'
import neon_enabled_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enabled-replication.png'
import neon_ip_allow from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-ip-allow.png'
import neon_conn_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-conn-details.png'
import Image from '@theme/IdealImage';


# Neon Postgres 源端配置指南 \{#neon-postgres-source-setup-guide\}

本指南介绍如何配置 Neon Postgres，以便在 ClickPipes 中用于复制。
在进行此配置前，请确保已登录到 [Neon 控制台](https://console.neon.tech/app/projects)。

## 创建具备权限的用户 \{#creating-a-user-with-permissions\}

以管理员用户连接到你的 Neon 实例，并执行以下命令：

1. 为 ClickPipes 创建一个专用用户：

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 为前一步创建的用户授予模式级只读访问权限。以下示例展示了为 `public` 模式授予的权限。对于每个包含你要复制的表的模式，都需要重复执行这些命令：
   
    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. 为该用户授予复制权限：

   ```sql
   ALTER USER clickpipes_user WITH REPLICATION;
   ```

4. 使用你想要复制的表创建一个 [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html)。强烈建议仅将所需的表包含在 publication 中，以避免性能开销。

   :::warning
   包含在 publication 中的任意表必须定义有 **primary key**，_或者_ 已将其 **replica identity** 配置为 `FULL`。有关范围设置的指导，请参阅 [Postgres 常见问题](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication)。
   :::

   - 为特定表创建 publication：

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 为特定模式中的所有表创建 publication：

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` publication 将包含由指定表生成的一组变更事件，并会在后续用于摄取该复制流。

## 启用逻辑复制 \{#enable-logical-replication\}

在 Neon 中，可以在控制台 UI 中启用逻辑复制。这是 ClickPipes 的 CDC 执行数据复制所必需的。
前往 **Settings** 选项卡，然后进入 **Logical Replication** 部分。

<Image size="lg" img={neon_enable_replication} alt="启用逻辑复制" border />

单击 **Enable** 即可完成此步骤。启用后，应当看到如下成功提示信息。

<Image size="lg" img={neon_enabled_replication} alt="逻辑复制已启用" border />

接下来在 Neon Postgres 实例中验证以下设置：

```sql
SHOW wal_level; -- should be logical
SHOW max_wal_senders; -- should be 10
SHOW max_replication_slots; -- should be 10
```


## IP 白名单（适用于 Neon 企业版计划） \{#ip-whitelisting-for-neon-enterprise-plan\}

如果您使用的是 Neon 企业版计划，可以将 [ClickPipes 的 IP 地址](../../index.md#list-of-static-ips) 加入白名单，以允许从 ClickPipes 向您的 Neon Postgres 实例进行复制。
为此，您可以点击 **Settings** 选项卡，然后进入 **IP Allow** 部分。

<Image size="lg" img={neon_ip_allow} alt="允许 IP 的界面" border/>

## 复制连接详细信息 \{#copy-connection-details\}

现在我们已经准备好了 USER、publication，并启用了复制，可以复制这些连接详细信息来创建一个新的 ClickPipe。
前往 **Dashboard**，在显示连接字符串的文本框处，
将视图切换到 **Parameters Only**。我们在下一步中会用到这些参数。

<Image size="lg" img={neon_conn_details} alt="Connection details" border/>

## 接下来 \{#whats-next\}

现在你可以[创建 ClickPipe](../index.md)，并开始将 Postgres 实例中的数据摄取到 ClickHouse Cloud 中。
请务必记录在设置 Postgres 实例时使用的连接信息，因为在创建 ClickPipe 时还会用到这些信息。