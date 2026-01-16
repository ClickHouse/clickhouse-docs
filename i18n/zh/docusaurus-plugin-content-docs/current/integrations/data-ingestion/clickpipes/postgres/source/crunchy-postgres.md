---
sidebar_label: 'Crunchy Bridge Postgres'
description: '将 Crunchy Bridge Postgres 配置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/postgres/source/crunchy-postgres
title: 'Crunchy Bridge Postgres 数据源配置指南'
keywords: ['crunchy bridge', 'postgres', 'clickpipes', 'logical replication', '数据摄取']
doc_type: '指南'
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/firewall_rules_crunchy_bridge.png'
import add_firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/add_firewall_rules_crunchy_bridge.png'
import Image from '@theme/IdealImage';

# Crunchy Bridge Postgres 源设置指南 \\{#crunchy-bridge-postgres-source-setup-guide\\}

ClickPipes 支持 Postgres 12 及更高版本。

## 启用逻辑复制 \{#enable-logical-replication\}

Crunchy Bridge 默认已[启用](https://docs.crunchybridge.com/how-to/logical-replication)逻辑复制。请确保以下设置配置正确；如有不符，请进行相应调整。

```sql
SHOW wal_level; -- should be logical
SHOW max_wal_senders; -- should be 10
SHOW max_replication_slots; -- should be 10
```


## 创建 ClickPipes 用户并授予权限 \\{#creating-clickpipes-user-and-granting-permissions\\}

使用 `postgres` 用户连接到你的 Crunchy Bridge Postgres，并运行以下命令：

1. 为 ClickPipes 创建一个专用用户：

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. 为你在上一步创建的用户授予模式级只读访问权限。以下示例展示了对 `public` 模式的权限设置。对于每个包含你希望复制的表的模式，都需要重复这些命令：

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. 为该用户授予复制权限：

    ```sql
     ALTER ROLE clickpipes_user REPLICATION;
    ```

4. 为你想要复制的表创建一个 [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html)。我们强烈建议仅在 publication 中包含你确实需要的表，以避免额外的性能开销。

   :::warning
   任何包含在 publication 中的表必须要么定义了**主键**，要么将其 **replica identity** 配置为 `FULL`。关于 publication 作用范围的指导，请参阅 [Postgres 常见问题](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication)。
   :::

   - 为特定表创建 publication：

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 为特定模式中所有表创建 publication：

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` publication 将包含由指定表生成的一组变更事件，并会在之后用于摄取复制流。

## 将 ClickPipes IP 加入允许列表 \\{#safe-list-clickpipes-ips\\}

在 Crunchy Bridge 中添加 Firewall Rules，将 [ClickPipes IP](../../index.md#list-of-static-ips) 加入允许列表。

<Image size="lg" img={firewall_rules_crunchy_bridge} alt="在 Crunchy Bridge 中哪里可以找到 Firewall Rules？" border/>

<Image size="lg" img={add_firewall_rules_crunchy_bridge} alt="为 ClickPipes 添加 Firewall Rules" border/>

## 下一步？ \\{#whats-next\\}

现在你可以[创建你的 ClickPipe](../index.md)，并开始将 Postgres 实例中的数据摄取到 ClickHouse Cloud 中。
请务必记录好在设置 Postgres 实例时使用的连接信息，因为在创建 ClickPipe 的过程中你会需要这些信息。