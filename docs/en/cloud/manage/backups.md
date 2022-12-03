---
sidebar_label: Backups
slug: /en/manage/backups
---

# Backups

## Backup status list

Each of your services are backed up daily.  You can see the backup list for a service on the **Backups** tab of the service.  From there you can restore a backup, or delete a backup:

![List of backups](@site/docs/en/_snippets/images/cloud-backup-list.png)

## Restore a backup

Backups are restored to a new ClickHouse Cloud service.  After clicking on the **Restore backup** icon you can specify the **Service name** of the new service that will be created, and then **Restore this backup**:

![Restore details](@site/docs/en/_snippets/images/cloud-backup-restore.png)

The new service will show in the services list as **Provisioning** until it is ready:

![New service provisioning](@site/docs/en/_snippets/images/cloud-backup-new-service.png)

:::note
Please do not use the `BACKUP` and `RESTORE` commands in your SQL client when working with ClickHouse Cloud services.  Cloud backups should be managed from the UI.
:::

## Working with your restored service

You now have two similar services, the **original service** one that for some reason needed to be restored, and a **new restored service** that was restored from a backup of the original.  You have two choices:

1. Use the **new restored service** and remove the **original service**.
2. Migrate data from the **new restored service** back to the **original service** and remove the **new restored service**.

### Use the **new restored service**

To use the new service perform these steps:

1. Verify that the new service has the IP Access List entries required by your use cases.
1. Verify that the new service contains the data that you need.
1. Remove the original service.

### Migrate data from the **new restored service** back to the **original service**

Suppose you cannot work with the newly restored service for any reason; for example, if you have users or applications that connect to the existing service, you may decide to migrate the newly restored data into the original service.  The migration can be accomplished by following these steps:

#### Allow remote access to the newly restored service

The new service is restored from backup with the same IP Allow List as the original service, this means that connections will not be allowed from other ClickHouse Cloud services unless you had allowed access from everywhere.  Modify the allow list and allow access from **Anywhere** temporarily.  See the [IP Access List](/docs/en/cloud/security/ip-access-list.md) docs for details.

#### On the newly restored ClickHouse service (the system that hosts the restored data)

:::note
You will need to reset the password for the new service in order to access it, you can do that from the service list.
:::

- Add a read only user that can read the source table (`db.table` in this example)
  ```sql
  CREATE USER exporter
  IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
  SETTINGS readonly = 1;
  ```

  ```sql
  GRANT SELECT ON db.table TO exporter;
  ```

- Copy the table definition
  ```sql
  select create_table_query
  from system.tables
  where database = 'db' and table = 'table'
  ```

#### On the destination ClickHouse Cloud system (the one that had the damaged table):

- Create the destination database:
  ```sql
  CREATE DATABASE db
  ```

- Using the CREATE TABLE statement from the source, create the destination.

  :::tip
  Change the ENGINE to to ReplicatedMergeTree without any parameters when you run the CREATE statement.  ClickHouse Cloud always replicates tables and provides the correct parameters.
  :::

  ```sql
  CREATE TABLE db.table ...
  # highlight-next-line
  ENGINE = ReplicatedMergeTree
  ORDER BY ...
  ```

- Use the `remoteSecure` function to pull the data from the newly restored ClickHouse Cloud service

  ```sql
  INSERT INTO db.table SELECT * FROM
  remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
  ```

- Verify the data in the service
- Delete the newly restored service once the data is verified
