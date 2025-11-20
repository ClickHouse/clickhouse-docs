---
sidebar_label: '通用 MySQL'
description: '将任意 MySQL 实例配置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/mysql/source/generic
title: '通用 MySQL 数据源配置指南'
doc_type: 'guide'
keywords: ['generic mysql', 'clickpipes', 'binary logging', 'ssl tls', 'mysql 8.x']
---



# 通用 MySQL 数据源设置指南

:::info

如果你使用的是侧边栏中列出的受支持提供程序之一，请查阅该提供程序的专用指南。

:::



## 启用二进制日志保留 {#enable-binlog-retention}

二进制日志包含对 MySQL 服务器实例进行的数据修改信息,是复制功能所必需的。

### MySQL 8.x 及更高版本 {#binlog-v8-x}

要在 MySQL 实例上启用二进制日志记录,请确保配置以下设置:

```sql
log_bin = ON                        -- 默认值
binlog_format = ROW                 -- 默认值
binlog_row_image = FULL             -- 默认值
binlog_row_metadata = FULL
binlog_expire_logs_seconds = 86400  -- 1 天或更长;默认为 30 天
```

要检查这些设置,请运行以下 SQL 命令:

```sql
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'binlog_row_metadata';
SHOW VARIABLES LIKE 'binlog_expire_logs_seconds';
```

如果值不匹配,可以运行以下 SQL 命令进行设置:

```sql
SET PERSIST log_bin = ON;
SET PERSIST binlog_format = ROW;
SET PERSIST binlog_row_image = FULL;
SET PERSIST binlog_row_metadata = FULL;
SET PERSIST binlog_expire_logs_seconds = 86400;
```

如果更改了 `log_bin` 设置,必须重启 MySQL 实例才能使更改生效。

更改设置后,继续进行[配置数据库用户](#configure-database-user)。

### MySQL 5.7 {#binlog-v5-x}

要在 MySQL 5.7 实例上启用二进制日志记录,请确保配置以下设置:

```sql
server_id = 1            -- 或更大;除 0 以外的任何值
log_bin = ON
binlog_format = ROW      -- 默认值
binlog_row_image = FULL  -- 默认值
expire_logs_days = 1     -- 或更大;0 表示永久保留日志
```

要检查这些设置,请运行以下 SQL 命令:

```sql
SHOW VARIABLES LIKE 'server_id';
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'expire_logs_days';
```

如果值不匹配,可以在配置文件中进行设置(通常位于 `/etc/my.cnf` 或 `/etc/mysql/my.cnf`):

```ini
[mysqld]
server_id = 1
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
expire_logs_days = 1
```

必须重启 MySQL 实例才能使更改生效。

:::note

MySQL 5.7 不支持列排除功能,因为 `binlog_row_metadata` 设置尚未引入。

:::


## 配置数据库用户 {#configure-database-user}

以 root 用户身份连接到 MySQL 实例并执行以下命令：

1. 为 ClickPipes 创建专用用户：

   ```sql
   CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some_secure_password';
   ```

2. 授予模式权限。以下示例展示了 `clickpipes` 数据库的权限。对需要复制的每个数据库和主机重复执行这些命令：

   ```sql
   GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'%';
   ```

3. 向用户授予复制权限：

   ```sql
   GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
   GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
   ```

:::note

请确保将 `clickpipes_user` 和 `some_secure_password` 替换为您所需的用户名和密码。

:::


## SSL/TLS 配置(推荐) {#ssl-tls-configuration}

SSL 证书可确保与 MySQL 数据库的安全连接。具体配置取决于您的证书类型:

**受信任的证书颁发机构(DigiCert、Let's Encrypt 等)** - 无需额外配置。

**内部证书颁发机构** - 从您的 IT 团队获取根 CA 证书文件。在 ClickPipes UI 中创建新的 MySQL ClickPipe 时上传该证书文件。

**自托管 MySQL** - 从您的 MySQL 服务器复制 CA 证书(通常位于 `/var/lib/mysql/ca.pem`),并在创建新的 MySQL ClickPipe 时在 UI 中上传。使用服务器的 IP 地址作为主机地址。

**无服务器访问权限的自托管 MySQL** - 联系您的 IT 团队获取证书。作为最后的选择,可以使用 ClickPipes UI 中的"跳过证书验证"开关(出于安全考虑不推荐使用)。

有关 SSL/TLS 选项的更多信息,请查看我们的 [FAQ](https://clickhouse.com/docs/integrations/clickpipes/mysql/faq#tls-certificate-validation-error)。


## 下一步 {#whats-next}

现在您可以[创建 ClickPipe](../index.md) 并开始将 MySQL 实例中的数据导入 ClickHouse Cloud。
请务必记录设置 MySQL 实例时使用的连接详细信息，因为在创建 ClickPipe 过程中需要用到这些信息。
