---
'sidebar_label': '通用 Postgres'
'description': '将任何 Postgres 实例设置为 ClickPipes 的源'
'slug': '/integrations/clickpipes/postgres/source/generic'
'title': '通用 Postgres 源设置指南'
---


# 通用 Postgres 源设置指南

:::info

如果您使用的是受支持的提供商（在侧边栏中），请参考该提供商的具体指南。

:::


ClickPipes 支持 Postgres 版本 12 及更高版本。

## 启用逻辑复制 {#enable-logical-replication}

1. 要在您的 Postgres 实例上启用复制，我们需要确保以下设置已配置：

```sql
wal_level = logical
```
   要检查这些设置，您可以运行以下 SQL 命令：
```sql
SHOW wal_level;
```

   输出应该是 `logical`。如果不是，请运行：
```sql
ALTER SYSTEM SET wal_level = logical;
```

2. 此外，建议在 Postgres 实例上设置以下配置：
```sql
max_wal_senders > 1
max_replication_slots >= 4
```
   要检查这些设置，您可以运行以下 SQL 命令：
```sql
SHOW max_wal_senders;
SHOW max_replication_slots;
```

   如果值与推荐值不匹配，您可以运行以下 SQL 命令进行设置：
```sql
ALTER SYSTEM SET max_wal_senders = 10;
ALTER SYSTEM SET max_replication_slots = 10;
```
3. 如果您对配置进行了上述更改，您需要重新启动 Postgres 实例以使更改生效。


## 创建具有权限和发布的用户 {#creating-a-user-with-permissions-and-publication}

让我们为 ClickPipes 创建一个具有适合 CDC 的必要权限的新用户，并创建一个我们将用于复制的发布。

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

确保用您想要的用户名和密码替换 `clickpipes_user` 和 `clickpipes_password`。

:::


## 在 pg_hba.conf 中启用对 ClickPipes 用户的连接 {#enabling-connections-in-pg_hbaconf-to-the-clickpipes-user}

如果您是自服务用户，您需要通过以下步骤允许来自 ClickPipes IP 地址的连接。如果您使用的是托管服务，可以按照提供商的文档进行相同的操作。

1. 对 `pg_hba.conf` 文件进行必要的更改，以允许来自 ClickPipes IP 地址的连接。`pg_hba.conf` 文件中的示例条目如下所示：
```response
host    all   clickpipes_user     0.0.0.0/0          scram-sha-256
```

2. 重新加载 PostgreSQL 实例以使更改生效：
```sql
SELECT pg_reload_conf();
```


## 增加 `max_slot_wal_keep_size` {#increase-max_slot_wal_keep_size}

这是一个推荐的配置更改，以确保大事务/提交不会导致复制槽被删除。

您可以通过更新 `postgresql.conf` 文件，将 PostgreSQL 实例的 `max_slot_wal_keep_size` 参数增加到更高的值（至少 100GB 或 `102400`）。

```sql
max_slot_wal_keep_size = 102400
```

您可以重新加载 Postgres 实例以使更改生效：
```sql
SELECT pg_reload_conf();
```

:::note

关于该值的更好建议，您可以联系 ClickPipes 团队。

:::

## 下一步是什么？ {#whats-next}

您现在可以 [创建您的 ClickPipe](../index.md) 并开始将数据从您的 Postgres 实例导入到 ClickHouse Cloud。
请确保记录下您在设置 Postgres 实例时使用的连接详细信息，因为在创建 ClickPipe 过程中您将需要这些信息。
