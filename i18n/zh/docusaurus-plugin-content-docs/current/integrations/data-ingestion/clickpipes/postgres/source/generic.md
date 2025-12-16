---
sidebar_label: '通用 Postgres'
description: '将任意 Postgres 实例配置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/postgres/source/generic
title: '通用 Postgres 源配置指南'
doc_type: 'guide'
keywords: ['postgres', 'clickpipes', 'logical replication', 'pg_hba.conf', 'wal level']
---

# 通用 Postgres 源设置指南 {#generic-postgres-source-setup-guide}

:::info

如果你使用的是侧边栏中列出的受支持提供方之一，请参考该提供方的专用指南。

:::

ClickPipes 支持 Postgres 12 及更高版本。

## 启用逻辑复制 {#enable-logical-replication}

1. 要在你的 Postgres 实例上启用复制，需要确保设置以下参数：

    ```sql
    wal_level = logical
    ```
   要检查该设置，你可以运行以下 SQL 命令：
    ```sql
    SHOW wal_level;
    ```

   输出应为 `logical`。如果不是，请运行：
    ```sql
    ALTER SYSTEM SET wal_level = logical;
    ```

2. 此外，建议在 Postgres 实例上配置以下参数：
    ```sql
    max_wal_senders > 1
    max_replication_slots >= 4
    ```
   要检查这些设置，你可以运行以下 SQL 命令：
    ```sql
    SHOW max_wal_senders;
    SHOW max_replication_slots;
    ```

   如果这些值与推荐值不一致，可以运行以下 SQL 命令进行设置：
    ```sql
    ALTER SYSTEM SET max_wal_senders = 10;
    ALTER SYSTEM SET max_replication_slots = 10;
    ```
3. 如果你对上述配置做了任何更改，必须重启 Postgres 实例，更改才会生效。

## 创建具备权限的用户和发布 {#creating-a-user-with-permissions-and-publication}

让我们为 ClickPipes 创建一个具备 CDC 所需权限的新用户，
并创建一个我们将用于复制的发布。

为此，可以连接到你的 Postgres 实例并运行以下 SQL 命令：

```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- Give replication permission to the USER
  ALTER USER clickpipes_user REPLICATION;

-- Create a publication. We will use this when creating the pipe
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

:::note

请务必将 `clickpipes_user` 和 `clickpipes_password` 替换为你希望使用的用户名和密码。

:::

## 在 pg_hba.conf 中为 ClickPipes 用户启用连接 {#enabling-connections-in-pg_hbaconf-to-the-clickpipes-user}

如果您是自托管环境，则需要按照以下步骤，允许来自 ClickPipes 的 IP 地址对 ClickPipes 用户的连接。如果您使用的是托管服务，可以参考服务提供商的文档完成相同的配置。

1. 修改 `pg_hba.conf` 文件，使其允许来自 ClickPipes 的 IP 地址对 ClickPipes 用户的连接。`pg_hba.conf` 文件中的示例条目如下：
    ```response
    host    all   clickpipes_user     0.0.0.0/0          scram-sha-256
    ```

2. 重新加载 PostgreSQL 实例以使更改生效：
    ```sql
    SELECT pg_reload_conf();
    ```

## 增大 `max_slot_wal_keep_size` {#increase-max_slot_wal_keep_size}

这是一个推荐的配置调整，用于确保大型事务或提交不会导致复制槽被丢弃。

您可以通过更新 `postgresql.conf` 文件，将 PostgreSQL 实例的 `max_slot_wal_keep_size` 参数提高到更大的值（至少 100GB 或 `102400`）。

```sql
max_slot_wal_keep_size = 102400
```

您可以重新加载 PostgreSQL 实例以使更改生效：

```sql
SELECT pg_reload_conf();
```

:::note

如需获取该数值的更佳配置建议，请联系 ClickPipes 团队。

:::

## 接下来是什么？ {#whats-next}

现在你可以[创建 ClickPipe](../index.md)，并开始将 Postgres 实例中的数据摄取到 ClickHouse Cloud 中。
请务必记录下在设置 Postgres 实例时使用的连接信息，因为在创建 ClickPipe 的过程中将需要这些信息。
