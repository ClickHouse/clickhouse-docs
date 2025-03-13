---
sidebar_label: '通用 Postgres'
description: '将任何 Postgres 实例设置为 ClickPipes 的源'
slug: /integrations/clickpipes/postgres/source/generic
---


# 通用 Postgres 源设置指南

:::info

如果您使用的是支持的提供商（在侧边栏中），请参考该提供商的具体指南。

:::


ClickPipes 支持 Postgres 版本 12 及更高版本。

## 启用逻辑复制 {#enable-logical-replication}

1. 要在您的 Postgres 实例上启用复制，我们需要确保设置以下参数：

    ```sql
    wal_level = logical
    ```
   要检查这一点，您可以运行以下 SQL 命令：
    ```sql
    SHOW wal_level;
    ```

   输出应为 `logical`。如果不是，请运行：
    ```sql
    ALTER SYSTEM SET wal_level = logical;
    ```

2. 此外，建议在 Postgres 实例上设置以下参数：
    ```sql
    max_wal_senders > 1
    max_replication_slots >= 4
    ```
   要检查这一点，您可以运行以下 SQL 命令：
    ```sql
    SHOW max_wal_senders;
    SHOW max_replication_slots;
    ```

   如果这些值与推荐值不匹配，您可以运行以下 SQL 命令来设置它们：
    ```sql
    ALTER SYSTEM SET max_wal_senders = 10;
    ALTER SYSTEM SET max_replication_slots = 10;
    ```
3. 如果您对配置进行了上述更改，您需要重新启动 Postgres 实例以使更改生效。


## 创建具有权限和发布的用户 {#creating-a-user-with-permissions-and-publication}

让我们为 ClickPipes 创建一个新用户，赋予其适合 CDC 的必要权限，并创建一个将用于复制的发布。

为此，您可以连接到您的 Postgres 实例并运行以下 SQL 命令：
```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- 给用户赋予复制权限
  ALTER USER clickpipes_user REPLICATION;

-- 创建一个发布。在创建管道时将使用此发布
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```
:::note

请确保将 `clickpipes_user` 和 `clickpipes_password` 替换为您想要的用户名和密码。

:::


## 在 pg_hba.conf 中启用对 ClickPipes 用户的连接 {#enabling-connections-in-pg_hbaconf-to-the-clickpipes-user}

如果您是自管理的，您需要按照以下步骤允许来自 ClickPipes IP 地址的对 ClickPipes 用户的连接。如果您使用的是托管服务，可以按照提供商的文档进行相同的操作。

1. 对 `pg_hba.conf` 文件进行必要的更改，以允许来自 ClickPipes IP 地址的对 ClickPipes 用户的连接。 `pg_hba.conf` 文件中的示例条目如下：
    ```response
    host    all   clickpipes_user     0.0.0.0/0          scram-sha-256
    ```

2. 重新加载 PostgreSQL 实例以使更改生效：
    ```sql
    SELECT pg_reload_conf();
    ```


## 增加 `max_slot_wal_keep_size` {#increase-max_slot_wal_keep_size}

这是一个推荐的配置更改，以确保大事务/提交不会导致复制槽被丢弃。

您可以通过更新 `postgresql.conf` 文件将 PostgreSQL 实例的 `max_slot_wal_keep_size` 参数增加到更高的值（至少 100GB 或 `102400`）。

```sql
max_slot_wal_keep_size = 102400
```

您可以重新加载 Postgres 实例以使更改生效：
```sql
SELECT pg_reload_conf();
```

:::note

如需更好的值推荐，您可以联系 ClickPipes 团队。

:::

## 接下来要做什么？ {#whats-next}

您现在可以 [创建您的 ClickPipe](../index.md) 并开始将数据从 Postgres 实例导入到 ClickHouse Cloud。
请务必记下您在设置 Postgres 实例时使用的连接详细信息，因为您在创建 ClickPipe 过程中将需要这些信息。
