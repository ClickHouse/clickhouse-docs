---
sidebar_label: '通用 MySQL'
description: '将任意 MySQL 实例配置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/mysql/source/generic
title: '通用 MySQL 源配置指南'
doc_type: '指南'
keywords: ['通用 mysql', 'clickpipes', '二进制日志', 'ssl/tls', 'mysql 8.x']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

# 通用 MySQL 源配置指南 \{#generic-mysql-source-setup-guide\}

:::info

如果您使用的是侧边栏中列出的受支持服务提供商之一，请参考该服务提供商对应的专用指南。

:::

## 启用二进制日志保留 \{#enable-binlog-retention\}

二进制日志记录了在 MySQL 服务器实例上进行的数据修改，是实现复制所必需的。

### MySQL 8.x 及更高版本 \{#binlog-v8-x\}

要在 MySQL 实例中启用二进制日志，请确保已配置以下设置：

```sql
log_bin = ON                        -- default value
binlog_format = ROW                 -- default value
binlog_row_image = FULL             -- default value
binlog_row_metadata = FULL
binlog_expire_logs_seconds = 86400  -- 1 day or higher; default is 30 days
```

若要检查这些设置，请执行以下 SQL 命令：

```sql
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'binlog_row_metadata';
SHOW VARIABLES LIKE 'binlog_expire_logs_seconds';
```

如果这些值不一致，则可以运行以下 SQL 命令进行设置：

```sql
SET PERSIST log_bin = ON;
SET PERSIST binlog_format = ROW;
SET PERSIST binlog_row_image = FULL;
SET PERSIST binlog_row_metadata = FULL;
SET PERSIST binlog_expire_logs_seconds = 86400;
```

如果你更改了 `log_bin` 设置，则需要重新启动该 MySQL 实例，才能使更改生效。

更改设置后，继续[配置数据库用户](#configure-database-user)。


### MySQL 5.7 \{#binlog-v5-x\}

要在 MySQL 5.7 实例上启用二进制日志，请确保按如下方式进行配置：

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

如果这些值不一致，则可以在配置文件中手动设置它们（通常位于 `/etc/my.cnf` 或 `/etc/mysql/my.cnf`）：

```ini
[mysqld]
server_id = 1
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
expire_logs_days = 1
```

必须重新启动 MySQL 实例，这些更改才能生效。

:::note

MySQL 5.7 及更早版本不支持列排除和架构更改。这些功能依赖于表元数据，而这些元数据在 [MySQL 8.0.1](https://dev.mysql.com/blog-archive/more-metadata-is-written-into-binary-log/) 之前的 binlog 中不可用。

:::


## 配置数据库用户 \{#configure-database-user\}

以 root 用户连接到你的 MySQL 实例，并执行以下命令：

1. 为 ClickPipes 创建一个专用用户：

    ```sql
    CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some_secure_password';
    ```

2. 授予 schema（模式）权限。以下示例展示了对 `clickpipes` 数据库的权限设置。对于你希望进行复制的每个数据库和主机，重复执行这些命令：

    ```sql
    GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'%';
    ```

3. 为该用户授予复制权限：

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

:::note

请务必将 `clickpipes_user` 和 `some_secure_password` 替换为你所需的用户名和密码。

:::

## SSL/TLS 配置（推荐） \{#ssl-tls-configuration\}

SSL 证书可确保与 MySQL 数据库之间的安全连接。具体配置取决于所使用的证书类型：

**受信任证书颁发机构（DigiCert、Let's Encrypt 等）** - 无需额外配置。

**内部证书颁发机构** - 向你的 IT 团队获取根 CA 证书文件。在 ClickPipes UI 中创建新的 MySQL ClickPipe 时上传该证书。

**自托管的 MySQL** - 从你的 MySQL 服务器复制 CA 证书（通常位于 `/var/lib/mysql/ca.pem`），并在 UI 中创建新的 MySQL ClickPipe 时上传。将该服务器的 IP 地址用作主机地址（host）。

**无法访问服务器的自托管 MySQL** - 联系你的 IT 团队以获取证书。作为最后手段，可以在 ClickPipes UI 中使用 “Skip Certificate Verification” 开关（出于安全原因不推荐）。

有关 SSL/TLS 选项的更多信息，请参阅我们的[常见问题](https://clickhouse.com/docs/integrations/clickpipes/mysql/faq#tls-certificate-validation-error)。

## 接下来该做什么？ \{#whats-next\}

现在可以[创建 ClickPipe](../index.md)，并开始将 MySQL 实例中的数据摄取到 ClickHouse Cloud 中。
请务必记录好在设置 MySQL 实例时使用的连接详细信息，因为在创建 ClickPipe 的过程中需要用到这些信息。