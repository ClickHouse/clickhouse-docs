---
'sidebar_label': '通用 MariaDB'
'description': '将任何 MariaDB 实例设置为 ClickPipes 的数据源'
'slug': '/integrations/clickpipes/mysql/source/generic_maria'
'title': '通用 MariaDB 源设置指南'
'doc_type': 'guide'
---


# 通用 MariaDB 源设置指南

:::info

如果您使用的是支持的提供程序（在侧边栏中），请参考该提供程序的特定指南。

:::

## 启用二进制日志保留 {#enable-binlog-retention}

二进制日志包含有关对 MariaDB 服务器实例所做的数据修改的信息，并且是复制所必需的。

要在您的 MariaDB 实例上启用二进制日志，请确保配置以下设置：

```sql
server_id = 1               -- or greater; anything but 0
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
binlog_row_metadata = FULL  -- introduced in 10.5.0
expire_logs_days = 1        -- or higher; 0 would mean logs are preserved forever
```

要检查这些设置，请运行以下 SQL 命令：
```sql
SHOW VARIABLES LIKE 'server_id';
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'binlog_row_metadata';
SHOW VARIABLES LIKE 'expire_logs_days';
```

如果值不匹配，则可以在配置文件中设置它们（通常位于 `/etc/my.cnf` 或 `/etc/my.cnf.d/mariadb-server.cnf`）：
```ini
[mysqld]
server_id = 1
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
binlog_row_metadata = FULL  ; only in 10.5.0 and newer
expire_logs_days = 1
```

如果源数据库是副本，请确保还启用 `log_slave_updates`。

您需要重新启动 MariaDB 实例以使更改生效。

:::note

对于 MariaDB \<= 10.4，不支持列排除，因为尚未引入 `binlog_row_metadata` 设置。

:::

## 配置数据库用户 {#configure-database-user}

以 root 用户身份连接到您的 MariaDB 实例，并执行以下命令：

1. 为 ClickPipes 创建专用用户：

```sql
CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some_secure_password';
```

2. 授予模式权限。以下示例显示了对 `clickpipes` 数据库的权限。对每个您希望复制的数据库和主机重复这些命令：

```sql
GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'%';
```

3. 授予用户复制权限：

```sql
GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
```

:::note

确保用您想要的用户名和密码替换 `clickpipes_user` 和 `some_secure_password`。

:::

## SSL/TLS 配置（推荐） {#ssl-tls-configuration}

SSL 证书确保与您的 MariaDB 数据库的安全连接。配置取决于您的证书类型：

**受信任的证书颁发机构 (DigiCert, Let's Encrypt 等)** - 无需额外配置。

**内部证书颁发机构** - 从 IT 团队获取根 CA 证书文件。在 ClickPipes UI 中，在创建新的 MariaDB ClickPipe 时上传它。

**自托管的 MariaDB** - 从您的 MariaDB 服务器复制 CA 证书（通过 `my.cnf` 中的 `ssl_ca` 设置查找路径）。在 ClickPipes UI 中，在创建新的 MariaDB ClickPipe 时上传它。使用服务器的 IP 地址作为主机。

**自托管的 MariaDB（11.4 及以上）** - 如果您的服务器已设置 `ssl_ca`，请按照上述选项进行操作。否则，请与 IT 团队协商以提供适当的证书。作为最后手段，请在 ClickPipes UI 中使用“跳过证书验证”切换（出于安全原因，不推荐使用）。

有关 SSL/TLS 选项的更多信息，请查看我们的 [常见问题解答](https://clickhouse.com/docs/integrations/clickpipes/mysql/faq#tls-certificate-validation-error)。

## 接下来是什么？ {#whats-next}

您现在可以 [创建您的 ClickPipe](../index.md)，并开始将数据从您的 MariaDB 实例导入到 ClickHouse Cloud。
请确保记下您在设置 MariaDB 实例时使用的连接详细信息，因为在创建 ClickPipe 过程中将需要这些信息。
