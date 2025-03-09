---
sidebar_label: Crunchy Bridge Postgres
description: 将 Crunchy Bridge Postgres 设置为 ClickPipes 的数据源
slug: /integrations/clickpipes/postgres/source/crunchy-postgres
---

import firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/firewall_rules_crunchy_bridge.png'
import add_firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/add_firewall_rules_crunchy_bridge.png'


# Crunchy Bridge Postgres 数据源设置指南

ClickPipes 支持 Postgres 12 及更高版本。

## 启用逻辑复制 {#enable-logical-replication}

Crunchy Bridge 默认启用逻辑复制 [default](https://docs.crunchybridge.com/how-to/logical-replication)。请确保以下设置配置正确。如有必要，请相应调整。

```sql
SHOW wal_level; -- 应该为 logical
SHOW max_wal_senders; -- 应该为 10
SHOW max_replication_slots; -- 应该为 10
```

## 创建 ClickPipes 用户并授予权限 {#creating-clickpipes-user-and-granting-permissions}

通过 `postgres` 用户连接到您的 Crunchy Bridge Postgres，并运行以下命令：

1. 创建一个仅供 ClickPipes 使用的 Postgres 用户。

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. 授予 `clickpipes_user` 对您要复制表的模式的只读访问权限。以下示例显示为 `public` 模式授予权限。如果您想授予多个模式的访问权限，可以为每个模式运行这三条命令。

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. 授予此用户复制访问权限：

    ```sql
     ALTER ROLE clickpipes_user REPLICATION;
    ```

4. 创建将在未来用于创建 MIRROR（复制）的发布。

    ```sql
    CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
    ```

## 安全列表 ClickPipes IP 地址 {#safe-list-clickpipes-ips}

通过在 Crunchy Bridge 中添加防火墙规则来安全列出 [ClickPipes IPs](../../index.md#list-of-static-ips)。

<img src={firewall_rules_crunchy_bridge} alt="在哪里找到 Crunchy Bridge 中的防火墙规则？"/>

<img src={add_firewall_rules_crunchy_bridge} alt="为 ClickPipes 添加防火墙规则"/>

## 接下来是什么？ {#whats-next}

您现在可以 [创建您的 ClickPipe](../index.md) 并开始从您的 Postgres 实例向 ClickHouse Cloud 导入数据。
请确保记下设置 Postgres 实例时使用的连接详细信息，因为在创建 ClickPipe 过程中需要这些信息。
