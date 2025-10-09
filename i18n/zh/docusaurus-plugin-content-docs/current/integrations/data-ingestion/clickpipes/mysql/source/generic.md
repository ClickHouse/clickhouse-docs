---
'sidebar_label': 'Generic MySQL'
'description': '将任何 MySQL 实例设置为 ClickPipes 的数据源'
'slug': '/integrations/clickpipes/mysql/source/generic'
'title': '通用 MySQL 源设置指南'
'doc_type': 'guide'
---


# 通用 MySQL 源设置指南

:::info

如果您使用的是支持的提供商（在侧边栏中），请参阅该提供商的特定指南。

:::

## 启用二进制日志保留 {#enable-binlog-retention}

二进制日志包含对 MySQL 服务器实例所做的数据修改的信息，并且要求用于复制。

### MySQL 8.x 及更新版本 {#binlog-v8-x}

要在您的 MySQL 实例上启用二进制日志记录，请确保配置以下设置：

```sql
log_bin = ON                        -- default value
binlog_format = ROW                 -- default value
binlog_row_image = FULL             -- default value
binlog_row_metadata = FULL
binlog_expire_logs_seconds = 86400  -- 1 day or higher; default is 30 days
```

要检查这些设置，请运行以下 SQL 命令：
```sql
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'binlog_row_metadata';
SHOW VARIABLES LIKE 'binlog_expire_logs_seconds';
```

如果值不匹配，您可以运行以下 SQL 命令进行设置：
```sql
SET PERSIST log_bin = ON;
SET PERSIST binlog_format = ROW;
SET PERSIST binlog_row_image = FULL;
SET PERSIST binlog_row_metadata = FULL;
SET PERSIST binlog_expire_logs_seconds = 86400;
```

如果您已更改 `log_bin` 设置，则需要重启 MySQL 实例以使更改生效。

更改设置后，请继续进行 [配置数据库用户](#configure-database-user)。

### MySQL 5.7 {#binlog-v5-x}

要在您的 MySQL 5.7 实例上启用二进制日志记录，请确保配置以下设置：

```sql
server_id = 1            -- or greater; anything but 0
log_bin = ON
binlog_format = ROW      -- default value
binlog_row_image = FULL  -- default value
expire_logs_days = 1     -- or higher; 0 would mean logs are preserved forever
```

要检查这些设置，请运行以下 SQL 命令：
```sql
SHOW VARIABLES LIKE 'server_id';
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'expire_logs_days';
```

如果值不匹配，您可以在配置文件中进行设置（通常位于 `/etc/my.cnf` 或 `/etc/mysql/my.cnf`）：
```ini
[mysqld]
server_id = 1
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
expire_logs_days = 1
```

您需要重启 MySQL 实例以使更改生效。

:::note

对于 MySQL 5.7，不支持列排除，因为 `binlog_row_metadata` 设置尚未引入。

:::

## 配置数据库用户 {#configure-database-user}

以 root 用户身份连接到您的 MySQL 实例并执行以下命令：

1. 为 ClickPipes 创建一个专用用户：

```sql
CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some_secure_password';
```

2. 授予架构权限。以下示例显示了 `clickpipes` 数据库的权限。对每个要复制的数据库和主机重复这些命令：

```sql
GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'%';
```

3. 授予用户复制权限：

```sql
GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
```

:::note

请确保将 `clickpipes_user` 和 `some_secure_password` 替换为您想要的用户名和密码。

:::

## SSL/TLS 配置（推荐） {#ssl-tls-configuration}

SSL 证书确保与您的 MySQL 数据库的安全连接。配置取决于您的证书类型：

**受信任的证书颁发机构（DigiCert、Let's Encrypt 等）** - 无需额外配置。

**内部证书颁发机构** - 从您的 IT 团队获取根 CA 证书文件。在 ClickPipes 管理界面，在创建新的 MySQL ClickPipe 时上传它。

**自托管 MySQL** - 从您的 MySQL 服务器复制 CA 证书（通常位于 `/var/lib/mysql/ca.pem`），并在创建新的 MySQL ClickPipe 时在 UI 中上传。使用服务器的 IP 地址作为主机。

**没有服务器访问权限的自托管 MySQL** - 联系您的 IT 团队获取证书。作为最后手段，使用 ClickPipes 管理界面中的“跳过证书验证”切换（出于安全原因不推荐）。

有关 SSL/TLS 选项的更多信息，请查看我们的 [常见问题解答](https://clickhouse.com/docs/integrations/clickpipes/mysql/faq#tls-certificate-validation-error)。

## 接下来是什么？ {#whats-next}

您现在可以 [创建 ClickPipe](../index.md)，并开始将数据从您的 MySQL 实例导入到 ClickHouse Cloud。
确保记录您在设置 MySQL 实例时使用的连接详细信息，因为在创建 ClickPipe 过程中需要这些信息。
