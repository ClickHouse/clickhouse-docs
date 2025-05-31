---
sidebar_label: 'Generic MySQL'
description: 'Set up any MySQL instance as a source for ClickPipes'
slug: /integrations/clickpipes/mysql/source/generic
title: 'Generic MySQL source setup guide'
---

# Generic MySQL source setup guide

:::info

If you use one of the supported providers (in the sidebar), please refer to the specific guide for that provider.

:::

## Enable binary log retention {#enable-binlog-retention}

Binary logs contain information about data modifications made to a MySQL server instance and are required for replication.

### MySQL 8.x and newer {#binlog-v8-x}

To enable binary logging on your MySQL instance, ensure that the following settings are configured:

```sql
log_bin = ON                        -- default value
binlog_format = ROW                 -- default value
binlog_row_image = FULL             -- default value
binlog_row_metadata = FULL
binlog_expire_logs_seconds = 86400  -- 1 day or higher; default is 30 days
```

To check these settings, run the following SQL commands:
```sql
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'binlog_row_metadata';
SHOW VARIABLES LIKE 'binlog_expire_logs_seconds';
```

If the values don't match, you can run the following SQL commands to set them:
```sql
SET PERSIST log_bin = ON;
SET PERSIST binlog_format = ROW;
SET PERSIST binlog_row_image = FULL;
SET PERSIST binlog_row_metadata = FULL;
SET PERSIST binlog_expire_logs_seconds = 86400;
```

If you have changed the `log_bin` setting, you NEED to RESTART the MySQL instance for the changes to take effect.

After changing the settings, continue on with [configuring a database user](#configure-database-user).

### MySQL 5.7 {#binlog-v5-x}

To enable binary logging on your MySQL 5.7 instance, ensure that the following settings are configured:

```sql
server_id = 1            -- or greater; anything but 0
log_bin = ON
binlog_format = ROW      -- default value
binlog_row_image = FULL  -- default value
expire_logs_days = 1     -- or higher; 0 would mean logs are preserved forever
```

To check these settings, run the following SQL commands:
```sql
SHOW VARIABLES LIKE 'server_id';
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'expire_logs_days';
```

If the values don't match, you can set them in the config file (typically at `/etc/my.cnf` or `/etc/mysql/my.cnf`):
```ini
[mysqld]
server_id = 1
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
expire_logs_days = 1
```

You NEED to RESTART the MySQL instance for the changes to take effect.

:::note

Column exclusion is not supported for MySQL 5.7 because the `binlog_row_metadata` setting wasn't yet introduced.

:::

## Configure a database user {#configure-database-user}

Connect to your MySQL instance as the root user and execute the following commands:

1. Create a dedicated user for ClickPipes:

    ```sql
    CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some_secure_password';
    ```

2. Grant schema permissions. The following example shows permissions for the `clickpipes` database. Repeat these commands for each database and host you want to replicate:

    ```sql
    GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'%';
    ```

3. Grant replication permissions to the user:

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

:::note

Make sure to replace `clickpipes_user` and `some_secure_password` with your desired username and password.

:::

## SSL/TLS configuration (recommended) {#ssl-tls-configuration}

SSL certificates ensure secure connections to your MySQL database. Configuration depends on your certificate type:

**Trusted Certificate Authority (DigiCert, Let's Encrypt, etc.)** - no additional configuration needed.

**Internal Certificate Authority** - Obtain the root CA certificate file from your IT team. In the ClickPipes UI, upload it when creating a new MySQL ClickPipe.

**Self-hosted MySQL** - Copy the CA certificate from your MySQL server (typically at `/var/lib/mysql/ca.pem`) and upload it in the UI when creating a new MySQL ClickPipe. Use the IP address of the server as the host.

**Self-hosted MySQL without server access** - Contact your IT team for the certificate. As a last resort, use the "Skip Certificate Verification" toggle in ClickPipes UI (not recommended for security reasons).

For more information on SSL/TLS options, check out our [FAQ](https://clickhouse.com/docs/integrations/clickpipes/mysql/faq#tls-certificate-validation-error).

## What's next? {#whats-next}

You can now [create your ClickPipe](../index.md) and start ingesting data from your MySQL instance into ClickHouse Cloud.
Make sure to note down the connection details you used while setting up your MySQL instance as you will need them during the ClickPipe creation process.