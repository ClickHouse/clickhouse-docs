---
sidebar_label: 'Crunchy Bridge Postgres'
description: '将 Crunchy Bridge Postgres 配置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/postgres/source/crunchy-postgres
title: 'Crunchy Bridge Postgres 数据源配置指南'
keywords: ['crunchy bridge', 'postgres', 'clickpipes', 'logical replication', '数据摄取']
doc_type: '指南'
---

import firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/firewall_rules_crunchy_bridge.png'
import add_firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/add_firewall_rules_crunchy_bridge.png'
import Image from '@theme/IdealImage';

# Crunchy Bridge Postgres 源设置指南 {#crunchy-bridge-postgres-source-setup-guide}

ClickPipes 支持 Postgres 12 及更高版本。

## 启用逻辑复制 {#enable-logical-replication}

Crunchy Bridge 默认已[启用](https://docs.crunchybridge.com/how-to/logical-replication)逻辑复制。请确保以下设置配置正确；如有不符，请进行相应调整。

```sql
SHOW wal_level; -- 应为 logical
SHOW max_wal_senders; -- 应为 10
SHOW max_replication_slots; -- 应为 10
```

## 创建 ClickPipes 用户并授予权限 {#creating-clickpipes-user-and-granting-permissions}

通过 `postgres` 用户连接到你的 Crunchy Bridge Postgres，并运行以下命令：

1. 为 ClickPipes 单独创建一个 Postgres 用户。

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. 为 `clickpipes_user` 授予对你要复制的表所在模式（schema）的只读访问权限。下面的示例展示了对 `public` 模式授予权限。如果你想对多个模式授权，可以为每个模式分别运行这三条命令。

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. 为该用户授予复制（replication）权限：

    ```sql
     ALTER ROLE clickpipes_user REPLICATION;
    ```

4. 创建一个 publication，供之后创建 MIRROR（复制）时使用。

    ```sql
    CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
    ```

## 将 ClickPipes IP 加入允许列表 {#safe-list-clickpipes-ips}

在 Crunchy Bridge 中添加 Firewall Rules，将 [ClickPipes IP](../../index.md#list-of-static-ips) 加入允许列表。

<Image size="lg" img={firewall_rules_crunchy_bridge} alt="在 Crunchy Bridge 中哪里可以找到 Firewall Rules？" border/>

<Image size="lg" img={add_firewall_rules_crunchy_bridge} alt="为 ClickPipes 添加 Firewall Rules" border/>

## 下一步？ {#whats-next}

现在你可以[创建你的 ClickPipe](../index.md)，并开始将 Postgres 实例中的数据摄取到 ClickHouse Cloud 中。
请务必记录好在设置 Postgres 实例时使用的连接信息，因为在创建 ClickPipe 的过程中你会需要这些信息。
