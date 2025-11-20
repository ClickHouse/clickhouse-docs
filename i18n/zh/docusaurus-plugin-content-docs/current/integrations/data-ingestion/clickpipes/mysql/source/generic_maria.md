---
sidebar_label: '通用 MariaDB'
description: '将任意 MariaDB 实例配置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/mysql/source/generic_maria
title: '通用 MariaDB 数据源设置指南'
doc_type: 'guide'
keywords: ['generic mariadb', 'clickpipes', 'binary logging', 'ssl tls', 'self hosted']
---



# 通用 MariaDB 源设置指南

:::info

如果你使用的是侧边栏中列出的受支持服务商之一，请参考该服务商的专用指南。

:::



## 启用二进制日志保留 {#enable-binlog-retention}

二进制日志包含对 MariaDB 服务器实例进行的数据修改信息,是复制功能所必需的。

要在 MariaDB 实例上启用二进制日志记录,请确保配置以下设置:

```sql
server_id = 1               -- 或更大值;不能为 0
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
binlog_row_metadata = FULL  -- 在 10.5.0 版本中引入
expire_logs_days = 1        -- 或更大值;0 表示永久保留日志
```

要检查这些设置,请运行以下 SQL 命令:

```sql
SHOW VARIABLES LIKE 'server_id';
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'binlog_row_metadata';
SHOW VARIABLES LIKE 'expire_logs_days';
```

如果值不匹配,可以在配置文件中设置(通常位于 `/etc/my.cnf` 或 `/etc/my.cnf.d/mariadb-server.cnf`):

```ini
[mysqld]
server_id = 1
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
binlog_row_metadata = FULL  ; 仅适用于 10.5.0 及更高版本
expire_logs_days = 1
```

如果源数据库是副本,请确保同时启用 `log_slave_updates`。

您需要重启 MariaDB 实例以使更改生效。

:::note

MariaDB \<= 10.4 不支持列排除功能,因为 `binlog_row_metadata` 设置尚未引入。

:::


## 配置数据库用户 {#configure-database-user}

以 root 用户身份连接到 MariaDB 实例并执行以下命令:

1. 为 ClickPipes 创建专用用户:

   ```sql
   CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some_secure_password';
   ```

2. 授予模式权限。以下示例展示了 `clickpipes` 数据库的权限。对每个需要复制的数据库和主机重复执行这些命令:

   ```sql
   GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'%';
   ```

3. 向用户授予复制权限:

   ```sql
   GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
   GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
   ```

:::note

请确保将 `clickpipes_user` 和 `some_secure_password` 替换为您期望的用户名和密码。

:::


## SSL/TLS 配置(推荐) {#ssl-tls-configuration}

SSL 证书可确保与 MariaDB 数据库的安全连接。具体配置取决于您的证书类型:

**受信任的证书颁发机构(DigiCert、Let's Encrypt 等)** - 无需额外配置。

**内部证书颁发机构** - 从您的 IT 团队获取根 CA 证书文件。在 ClickPipes UI 中创建新的 MariaDB ClickPipe 时上传该文件。

**自托管 MariaDB** - 从您的 MariaDB 服务器复制 CA 证书(可通过 `my.cnf` 中的 `ssl_ca` 设置查找路径)。在 ClickPipes UI 中创建新的 MariaDB ClickPipe 时上传该文件。使用服务器的 IP 地址作为主机。

**自托管 MariaDB 11.4 及更高版本** - 如果您的服务器已设置 `ssl_ca`,请按照上述选项操作。否则,请咨询您的 IT 团队以配置合适的证书。作为最后的手段,可以使用 ClickPipes UI 中的"跳过证书验证"开关(出于安全考虑不推荐使用)。

有关 SSL/TLS 选项的更多信息,请查看我们的 [FAQ](https://clickhouse.com/docs/integrations/clickpipes/mysql/faq#tls-certificate-validation-error)。


## 下一步 {#whats-next}

现在您可以[创建 ClickPipe](../index.md),开始将 MariaDB 实例中的数据导入 ClickHouse Cloud。
请务必记录设置 MariaDB 实例时使用的连接详细信息,在创建 ClickPipe 时会用到这些信息。
