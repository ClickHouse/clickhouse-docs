---
'sidebar_label': '通用的Postgres'
'description': '将任何Postgres实例设置为ClickPipes的数据源'
'slug': '/integrations/clickpipes/postgres/source/generic'
'title': '通用Postgres数据源设置指南'
---




# 通用 Postgres 源设置指南

:::info

如果您使用受支持的提供商（在侧边栏中），请参考该提供商的特定指南。

:::


ClickPipes 支持 Postgres 12 及更高版本。

## 启用逻辑复制 {#enable-logical-replication}

1. 要在您的 Postgres 实例上启用复制，我们需要确保以下设置已启用：

```sql
    wal_level = logical
```
   要检查，可以运行以下 SQL 命令：
```sql
    SHOW wal_level;
```

   输出应为 `logical`。如果不是，请运行：
```sql
    ALTER SYSTEM SET wal_level = logical;
```

2. 此外，建议在 Postgres 实例上设置以下配置：
```sql
    max_wal_senders > 1
    max_replication_slots >= 4
```
   要检查，可以运行以下 SQL 命令：
```sql
    SHOW max_wal_senders;
    SHOW max_replication_slots;
```

   如果值与推荐值不匹配，可以运行以下 SQL 命令进行设置：
```sql
    ALTER SYSTEM SET max_wal_senders = 10;
    ALTER SYSTEM SET max_replication_slots = 10;
```
3. 如果您对配置进行了上述更改，您需要重启 Postgres 实例以使更改生效。


## 创建具有权限和发布的用户 {#creating-a-user-with-permissions-and-publication}

让我们为 ClickPipes 创建一个新用户，以及适合 CDC 的必要权限，并创建一个将用于复制的发布。

为此，您可以连接到您的 Postgres 实例并运行以下 SQL 命令：
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

请确保将 `clickpipes_user` 和 `clickpipes_password` 替换为您想要的用户名和密码。

:::


## 在 pg_hba.conf 中启用对 ClickPipes 用户的连接 {#enabling-connections-in-pg_hbaconf-to-the-clickpipes-user}

如果您是自服务的，您需要通过以下步骤允许来自 ClickPipes IP 地址的 ClickPipes 用户的连接。如果您使用的是托管服务，可以按照提供商文档执行相同操作。

1. 对 `pg_hba.conf` 文件进行必要更改，以允许来自 ClickPipes IP 地址的 ClickPipes 用户的连接。在 `pg_hba.conf` 文件中，示例条目如下所示：
```response
    host    all   clickpipes_user     0.0.0.0/0          scram-sha-256
```

2. 重新加载 PostgreSQL 实例以使更改生效：
```sql
    SELECT pg_reload_conf();
```


## 增加 `max_slot_wal_keep_size` {#increase-max_slot_wal_keep_size}

这是一个推荐的配置更改，以确保大型事务/提交不会导致复制槽被删除。

您可以将 PostgreSQL 实例的 `max_slot_wal_keep_size` 参数增加到更高的值（至少 100GB 或 `102400`），方法是更新 `postgresql.conf` 文件。

```sql
max_slot_wal_keep_size = 102400
```

您可以重新加载 Postgres 实例以使更改生效：
```sql
SELECT pg_reload_conf();
```

:::note

有关此值的更佳推荐，您可以联系 ClickPipes 团队。

:::

## 下一步是什么？ {#whats-next}

您现在可以 [创建您的 ClickPipe](../index.md) 并开始将数据从您的 Postgres 实例导入到 ClickHouse Cloud 中。
确保记下在设置 Postgres 实例时使用的连接详细信息，因为您将在 ClickPipe 创建过程中需要它们。
