---
sidebar_label: '通用 MariaDB'
description: '将任意 MariaDB 实例配置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/mysql/source/generic_maria
title: '通用 MariaDB 数据源配置指南'
doc_type: '指南'
keywords: ['通用 MariaDB', 'ClickPipes', '二进制日志', 'SSL/TLS', '自托管']
---



# 通用 MariaDB 源设置指南

:::info

如果您使用的是侧边栏中列出的受支持提供商之一，请参阅该提供商的专用指南。

:::



## 启用二进制日志保留

二进制日志包含对 MariaDB 服务器实例所做的数据修改的信息，是实现复制所必需的。

要在 MariaDB 实例上启用二进制日志，请确保配置了以下设置：

```sql
server_id = 1               -- 大于等于 1;任何非 0 的值
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
binlog_row_metadata = FULL  -- 10.5.0 版本引入
expire_logs_days = 1        -- 大于等于 1;设为 0 表示日志永久保留
```

要验证这些配置，请运行以下 SQL 命令：

```sql
SHOW VARIABLES LIKE 'server_id';
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'binlog_row_metadata';
SHOW VARIABLES LIKE 'expire_logs_days';
```

如果这些数值不一致，可以在配置文件中进行设置（通常位于 `/etc/my.cnf` 或 `/etc/my.cnf.d/mariadb-server.cnf`）：

```ini
[mysqld]
server_id = 1
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
binlog_row_metadata = FULL  ; 仅在 10.5.0 及更新版本中可用
expire_logs_days = 1
```

如果源数据库是副本，请确保同时启用 `log_slave_updates`。

必须重启 MariaDB 实例才能使更改生效。

:::note

对于 MariaDB &lt;= 10.4，不支持列排除功能，因为这些版本尚未引入 `binlog_row_metadata` 设置。

:::


## 配置数据库用户 {#configure-database-user}

以 root 用户连接到你的 MariaDB 实例，并执行以下命令：

1. 为 ClickPipes 创建一个专用用户：

    ```sql
    CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some_secure_password';
    ```

2. 授予 schema 权限。下面的示例展示了为 `clickpipes` 数据库授予的权限。对于你要进行复制的每个数据库和主机，请重复这些命令：

    ```sql
    GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'%';
    ```

3. 为该用户授予复制权限：

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

:::note

请务必将 `clickpipes_user` 和 `some_secure_password` 替换为你期望的用户名和密码。

:::



## SSL/TLS 配置（推荐） {#ssl-tls-configuration}

SSL 证书可确保与 MariaDB 数据库之间的连接安全。具体配置取决于您的证书类型：

**受信任证书颁发机构（DigiCert、Let's Encrypt 等）** - 无需额外配置。

**内部证书颁发机构** - 向您的 IT 团队获取根 CA 证书文件。在 ClickPipes UI 中创建新的 MariaDB ClickPipe 时上传该证书。

**自托管 MariaDB** - 从您的 MariaDB 服务器复制 CA 证书（可在 `my.cnf` 中通过 `ssl_ca` 设置查找其路径）。在 ClickPipes UI 中创建新的 MariaDB ClickPipe 时上传该证书。使用服务器的 IP 地址作为主机。

**自托管 MariaDB（从 11.4 开始）** - 如果您的服务器已配置 `ssl_ca`，请按上述选项操作。否则，请咨询您的 IT 团队以签发合适的证书。作为最后的手段，您可以在 ClickPipes UI 中启用“Skip Certificate Verification”开关（出于安全原因不推荐）。

有关 SSL/TLS 选项的更多信息，请参阅我们的[常见问题](https://clickhouse.com/docs/integrations/clickpipes/mysql/faq#tls-certificate-validation-error)。



## 接下来 {#whats-next}

现在，您可以[创建 ClickPipe](../index.md)，并开始将 MariaDB 实例中的数据摄取到 ClickHouse Cloud。
请务必记录在设置 MariaDB 实例时使用的连接参数，因为在创建 ClickPipe 的过程中将会用到这些信息。