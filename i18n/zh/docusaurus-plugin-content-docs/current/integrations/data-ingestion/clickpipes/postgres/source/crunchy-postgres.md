---
'sidebar_label': 'Crunchy Bridge Postgres'
'description': 'Set up Crunchy Bridge Postgres as a source for ClickPipes'
'slug': '/integrations/clickpipes/postgres/source/crunchy-postgres'
'title': 'Crunchy Bridge Postgres Source Setup Guide'
---

import firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/firewall_rules_crunchy_bridge.png'
import add_firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/add_firewall_rules_crunchy_bridge.png'
import Image from '@theme/IdealImage';


# Crunchy Bridge Postgres 源设置指南

ClickPipes 支持 Postgres 版本 12 及更高版本。

## 启用逻辑复制 {#enable-logical-replication}

Crunchy Bridge 默认启用逻辑复制，详情请查看 [默认设置](https://docs.crunchybridge.com/how-to/logical-replication)。确保下面的设置配置正确。如果没有，请相应调整。

```sql
SHOW wal_level; -- should be logical
SHOW max_wal_senders; -- should be 10
SHOW max_replication_slots; -- should be 10
```

## 创建 ClickPipes 用户并授予权限 {#creating-clickpipes-user-and-granting-permissions}

通过 `postgres` 用户连接到您的 Crunchy Bridge Postgres，并运行以下命令：

1. 创建一个专门用于 ClickPipes 的 Postgres 用户。

```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
```

2. 授予 `clickpipes_user` 对您要复制表的模式的只读访问权限。下面的示例显示了为 `public` 模式授予权限。如果您想为多个模式授予访问权限，可以为每个模式运行这三条命令。

```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
```

3. 授予该用户复制访问权限：

```sql
     ALTER ROLE clickpipes_user REPLICATION;
```

4. 创建将来用于创建 MIRROR（复制）的发布。

```sql
    CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

## 安全列入 ClickPipes IPs {#safe-list-clickpipes-ips}

通过在 Crunchy Bridge 中添加防火墙规则来安全列入 [ClickPipes IPs](../../index.md#list-of-static-ips)。

<Image size="lg" img={firewall_rules_crunchy_bridge} alt="在 Crunchy Bridge 中哪里可以找到防火墙规则？" border/>

<Image size="lg" img={add_firewall_rules_crunchy_bridge} alt="为 ClickPipes 添加防火墙规则" border/>

## 接下来做什么？ {#whats-next}

您现在可以 [创建您的 ClickPipe](../index.md)，并开始将数据从您的 Postgres 实例摄取到 ClickHouse Cloud。请确保记下您在设置 Postgres 实例时使用的连接详情，因为在 ClickPipe 创建过程中您将需要这些信息。
