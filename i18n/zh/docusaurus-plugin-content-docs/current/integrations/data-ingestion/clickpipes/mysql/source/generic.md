---
sidebar_label: '通用 MySQL'
description: '将任何 MySQL 实例配置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/mysql/source/generic
title: '通用 MySQL 源设置指南'
doc_type: 'guide'
keywords: ['通用 MySQL', 'ClickPipes', '二进制日志', 'SSL/TLS', 'MySQL 8.x']
---

# 通用 MySQL 数据源配置指南 {#generic-mysql-source-setup-guide}

:::info

如果你使用的是侧边栏中列出的受支持提供商之一，请参考相应提供商的专用指南。

:::

## 启用二进制日志保留 {#enable-binlog-retention}

二进制日志包含对 MySQL 服务器实例中数据修改的信息，是实现复制所必需的。

### MySQL 8.x 及更高版本 {#binlog-v8-x}

要在 MySQL 实例上启用二进制日志，请确保已配置以下设置：

```sql
log_bin = ON                        -- 默认值
binlog_format = ROW                 -- 默认值
binlog_row_image = FULL             -- 默认值
binlog_row_metadata = FULL
binlog_expire_logs_seconds = 86400  -- 1 天或更长；默认为 30 天
```

要检查这些设置，请运行以下 SQL 命令：

```sql
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'binlog_row_metadata';
SHOW VARIABLES LIKE 'binlog_expire_logs_seconds';
```

如果这些值不一致，你可以运行以下 SQL 命令进行设置：

```sql
SET PERSIST log_bin = ON;
SET PERSIST binlog_format = ROW;
SET PERSIST binlog_row_image = FULL;
SET PERSIST binlog_row_metadata = FULL;
SET PERSIST binlog_expire_logs_seconds = 86400;
```

如果已更改 `log_bin` 设置，则必须重新启动 MySQL 实例才能使更改生效。

更改设置后，继续[配置数据库用户](#configure-database-user)。

### MySQL 5.7 {#binlog-v5-x}

要在 MySQL 5.7 实例上启用二进制日志，请确保已配置以下设置：

```sql
server_id = 1            -- 大于等于 1；任何非 0 值
log_bin = ON
binlog_format = ROW      -- 默认值
binlog_row_image = FULL  -- 默认值
expire_logs_days = 1     -- 大于等于 1；0 表示永久保留日志
```

若要检查这些设置，请运行以下 SQL 命令：

```sql
SHOW VARIABLES LIKE 'server_id';
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'expire_logs_days';
```

如果这些值不一致，你可以在配置文件（通常位于 `/etc/my.cnf` 或 `/etc/mysql/my.cnf`）中进行配置：

```ini
[mysqld]
server_id = 1
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
expire_logs_days = 1
```

你必须重启 MySQL 实例才能使更改生效。

:::note

对于 MySQL 5.7，不支持列排除功能，因为当时还没有引入 `binlog_row_metadata` 设置。

:::

## 配置数据库用户 {#configure-database-user}

以 root 用户身份连接到你的 MySQL 实例，并执行以下命令：

1. 为 ClickPipes 创建一个专用用户：

    ```sql
    CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some_secure_password';
    ```

2. 授予 schema 权限。以下示例展示了为 `clickpipes` 数据库授予的权限。对于你希望复制的每个数据库和主机，请重复这些命令：

    ```sql
    GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'%';
    ```

3. 为该用户授予复制权限：

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

:::note

请确保将 `clickpipes_user` 和 `some_secure_password` 替换为你所需的用户名和密码。

:::

## SSL/TLS 配置（推荐） {#ssl-tls-configuration}

SSL 证书可确保到 MySQL 数据库的连接安全。具体配置取决于证书类型：

**受信任证书颁发机构（DigiCert、Let's Encrypt 等）** - 无需额外配置。

**内部证书颁发机构** - 从您的 IT 团队获取根 CA 证书文件。在 ClickPipes 界面中创建新的 MySQL ClickPipe 时上传该证书。

**自托管 MySQL** - 从您的 MySQL 服务器复制 CA 证书（通常位于 `/var/lib/mysql/ca.pem`），并在 ClickPipes 界面中创建新的 MySQL ClickPipe 时上传该证书。使用服务器的 IP 地址作为主机名。

**无法访问服务器的自托管 MySQL** - 联系您的 IT 团队获取证书。作为最后手段，可以在 ClickPipes 界面中使用 “Skip Certificate Verification” 开关（出于安全原因不推荐）。

有关 SSL/TLS 选项的更多信息，请查看我们的[常见问题](https://clickhouse.com/docs/integrations/clickpipes/mysql/faq#tls-certificate-validation-error)。

## 下一步 {#whats-next}

现在可以[创建 ClickPipe](../index.md)，并开始将 MySQL 实例中的数据摄取到 ClickHouse Cloud 中。
请务必记录在设置 MySQL 实例时使用的连接信息，因为在创建 ClickPipe 的过程中将需要这些信息。