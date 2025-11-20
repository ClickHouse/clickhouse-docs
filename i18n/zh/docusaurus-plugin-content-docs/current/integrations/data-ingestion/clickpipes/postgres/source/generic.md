---
sidebar_label: '通用 Postgres'
description: '将任意 Postgres 实例配置为 ClickPipes 源端'
slug: /integrations/clickpipes/postgres/source/generic
title: '通用 Postgres 源端配置指南'
doc_type: 'guide'
keywords: ['postgres', 'clickpipes', 'logical replication', 'pg_hba.conf', 'wal level']
---



# 通用 Postgres 源设置指南

:::info

如果你使用的是侧边栏列出的受支持提供方之一，请参阅该提供方的专用指南。

:::

ClickPipes 支持 Postgres 12 及更高版本。



## 启用逻辑复制 {#enable-logical-replication}

1. 要在 Postgres 实例上启用逻辑复制,需要确保设置了以下参数:

   ```sql
   wal_level = logical
   ```

   要检查该参数,可以运行以下 SQL 命令:

   ```sql
   SHOW wal_level;
   ```

   输出应为 `logical`。如果不是,请运行:

   ```sql
   ALTER SYSTEM SET wal_level = logical;
   ```

2. 此外,建议在 Postgres 实例上设置以下参数:

   ```sql
   max_wal_senders > 1
   max_replication_slots >= 4
   ```

   要检查这些参数,可以运行以下 SQL 命令:

   ```sql
   SHOW max_wal_senders;
   SHOW max_replication_slots;
   ```

   如果这些值不符合推荐值,可以运行以下 SQL 命令进行设置:

   ```sql
   ALTER SYSTEM SET max_wal_senders = 10;
   ALTER SYSTEM SET max_replication_slots = 10;
   ```

3. 如果按照上述说明对配置进行了任何更改,必须重启 Postgres 实例才能使更改生效。


## 创建具有权限和发布的用户 {#creating-a-user-with-permissions-and-publication}

让我们为 ClickPipes 创建一个新用户,为其分配适用于 CDC 的必要权限,
并创建一个用于复制的发布。

为此,您可以连接到 Postgres 实例并运行以下 SQL 命令:

```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- 为用户授予复制权限
  ALTER USER clickpipes_user REPLICATION;

-- 创建发布。创建管道时将使用此发布
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

:::note

请确保将 `clickpipes_user` 和 `clickpipes_password` 替换为您所需的用户名和密码。

:::


## 在 pg_hba.conf 中启用到 ClickPipes 用户的连接 {#enabling-connections-in-pg_hbaconf-to-the-clickpipes-user}

如果您是自托管部署,需要按照以下步骤允许 ClickPipes IP 地址连接到 ClickPipes 用户。如果您使用的是托管服务,可以参照服务提供商的文档执行相同操作。

1. 对 `pg_hba.conf` 文件进行必要的修改,以允许 ClickPipes IP 地址连接到 ClickPipes 用户。`pg_hba.conf` 文件中的示例条目如下:

   ```response
   host    all   clickpipes_user     0.0.0.0/0          scram-sha-256
   ```

2. 重新加载 PostgreSQL 实例以使更改生效:
   ```sql
   SELECT pg_reload_conf();
   ```


## 增加 `max_slot_wal_keep_size` {#increase-max_slot_wal_keep_size}

这是一项推荐的配置更改,以确保大型事务/提交不会导致复制槽被删除。

您可以通过更新 `postgresql.conf` 文件,将 PostgreSQL 实例的 `max_slot_wal_keep_size` 参数增加到更高的值(至少 100GB 或 `102400`)。

```sql
max_slot_wal_keep_size = 102400
```

您可以重新加载 Postgres 实例以使更改生效:

```sql
SELECT pg_reload_conf();
```

:::note

如需获得关于此值的更优建议,您可以联系 ClickPipes 团队。

:::


## 下一步 {#whats-next}

现在您可以[创建 ClickPipe](../index.md) 并开始将 Postgres 实例中的数据导入 ClickHouse Cloud。
请务必记录设置 Postgres 实例时使用的连接信息,在创建 ClickPipe 时会用到这些信息。
