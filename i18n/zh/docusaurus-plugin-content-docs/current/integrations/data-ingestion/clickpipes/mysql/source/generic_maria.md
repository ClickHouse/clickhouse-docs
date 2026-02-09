---
sidebar_label: '通用 MariaDB'
description: '将任意 MariaDB 实例配置为 ClickPipes 源'
slug: /integrations/clickpipes/mysql/source/generic_maria
title: '通用 MariaDB 数据源设置指南'
doc_type: 'guide'
keywords: ['通用 mariadb', 'clickpipes', 'binary logging', 'ssl tls', '自托管']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

# 通用 MariaDB 数据源设置指南 \{#generic-mariadb-source-setup-guide\}

:::info

如果您使用的是侧边栏中列出的任一受支持服务提供商，请参考该服务提供商的专用指南。

:::

## 启用二进制日志保留 \{#enable-binlog-retention\}

二进制日志包含 MariaDB 服务器实例上数据变更的信息，是实现复制所必需的。

要在 MariaDB 实例上启用二进制日志，请确保已配置以下设置：

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

如果这些值不一致，可以在配置文件中进行设置（通常位于 `/etc/my.cnf` 或 `/etc/my.cnf.d/mariadb-server.cnf`）：

```ini
[mysqld]
server_id = 1
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
binlog_row_metadata = FULL  ; only in 10.5.0 and newer
expire_logs_days = 1
```

如果源数据库是副本，请确保同时开启 `log_slave_updates`。

必须重启该 MariaDB 实例，更改才会生效。

:::note

对于 MariaDB &lt;= 10.4，由于尚未引入 `binlog_row_metadata` 设置，因此不支持列排除。

:::


## 配置数据库用户 \{#configure-database-user\}

以 root 用户连接到你的 MariaDB 实例，并执行以下命令：

1. 为 ClickPipes 创建一个专用用户：

    ```sql
    CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some_secure_password';
    ```

2. 授予 schema 权限。以下示例展示了对 `clickpipes` 数据库的权限。对于要进行复制的每个数据库和主机，请重复这些命令：

    ```sql
    GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'%';
    ```

3. 为该用户授予复制权限：

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

:::note

请确保将 `clickpipes_user` 和 `some_secure_password` 替换为你要使用的用户名和密码。

:::

## SSL/TLS 配置（推荐） \{#ssl-tls-configuration\}

SSL 证书用于确保与 MariaDB 数据库之间的安全连接。具体配置取决于证书类型：

**受信任证书颁发机构（DigiCert、Let's Encrypt 等）** - 无需额外配置。

**内部证书颁发机构** - 向你的 IT 团队获取根 CA 证书文件。在 ClickPipes UI 中创建新的 MariaDB ClickPipe 时上传该证书。

**自托管 MariaDB** - 从 MariaDB 服务器复制 CA 证书（可通过 `my.cnf` 中的 `ssl_ca` 配置项查找证书路径）。在 ClickPipes UI 中创建新的 MariaDB ClickPipe 时上传该证书。使用服务器的 IP 地址作为主机。

**从 11.4 版本起的自托管 MariaDB** - 如果服务器已配置 `ssl_ca`，请按上一条说明操作。否则，请与 IT 团队协作签发合规证书。作为最后手段，可以在 ClickPipes UI 中启用“Skip Certificate Verification”（跳过证书验证）开关（出于安全原因，不推荐）。

有关 SSL/TLS 选项的更多信息，请参阅我们的 [FAQ](https://clickhouse.com/docs/integrations/clickpipes/mysql/faq#tls-certificate-validation-error)。

## 下一步 \{#whats-next\}

您现在可以[创建 ClickPipe](../index.md)，并开始将 MariaDB 实例中的数据摄取到 ClickHouse Cloud。
请务必记录在配置 MariaDB 实例时使用的连接信息，以便在创建 ClickPipe 时使用。