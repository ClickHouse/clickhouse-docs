---
sidebar_label: 'Generic MariaDB'
description: 'Set up any MariaDB instance as a source for ClickPipes'
slug: /integrations/clickpipes/mysql/source/generic_maria
title: 'Generic MariaDB source setup guide'
doc_type: 'guide'
keywords: ['generic mariadb', 'clickpipes', 'binary logging', 'ssl tls', 'self hosted']
---

# Generic MariaDB source setup guide

:::info

If you use one of the supported providers (in the sidebar), please refer to the specific guide for that provider.

:::

## Enable binary log retention {#enable-binlog-retention}

Binary logs contain information about data modifications made to a MariaDB server instance and are required for replication.

To enable binary logging on your MariaDB instance, ensure that the following settings are configured:

```sql
server_id = 1               -- or greater; anything but 0
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
binlog_row_metadata = FULL  -- introduced in 10.5.0
expire_logs_days = 1        -- or higher; 0 would mean logs are preserved forever
```

To check these settings, run the following SQL commands:
```sql
SHOW VARIABLES LIKE 'server_id';
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'binlog_row_metadata';
SHOW VARIABLES LIKE 'expire_logs_days';
```

If the values don't match, you can set them in the config file (typically at `/etc/my.cnf` or `/etc/my.cnf.d/mariadb-server.cnf`):
```ini
[mysqld]
server_id = 1
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
binlog_row_metadata = FULL  ; only in 10.5.0 and newer
expire_logs_days = 1
```

If the source database is a replica, make sure to also turn on `log_slave_updates`.

You NEED to RESTART the MariaDB instance for the changes to take effect.

:::note

Column exclusion is not supported for MariaDB \<= 10.4 because the `binlog_row_metadata` setting wasn't yet introduced.

:::

## Configure a database user {#configure-database-user}

Connect to your MariaDB instance as the root user and execute the following commands:

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

SSL certificates ensure secure connections to your MariaDB database. Configuration depends on your certificate type:

**Trusted Certificate Authority (DigiCert, Let's Encrypt, etc.)** - no additional configuration needed.

**Internal Certificate Authority** - Obtain the root CA certificate file from your IT team. In the ClickPipes UI, upload it when creating a new MariaDB ClickPipe.

**Self-hosted MariaDB** - Copy the CA certificate from your MariaDB server (look up the path via the `ssl_ca` setting in your `my.cnf`). In the ClickPipes UI, upload it when creating a new MariaDB ClickPipe. Use the IP address of the server as the host.

**Self-hosted MariaDB starting with 11.4** - If your server has `ssl_ca` set up, follow the option above. Otherwise, consult with your IT team to provision a proper certificate. As a last resort, use the "Skip Certificate Verification" toggle in ClickPipes UI (not recommended for security reasons).

For more information on SSL/TLS options, check out our [FAQ](https://clickhouse.com/docs/integrations/clickpipes/mysql/faq#tls-certificate-validation-error).

## What's next? {#whats-next}

You can now [create your ClickPipe](../index.md) and start ingesting data from your MariaDB instance into ClickHouse Cloud.
Make sure to note down the connection details you used while setting up your MariaDB instance as you will need them during the ClickPipe creation process.