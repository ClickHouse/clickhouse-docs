---
sidebar_label: 'Backup or restore using commands'
slug: /cloud/manage/backups/backup-restore-via-commands
title: 'Take a backup or restore a backup using commands'
description: 'Page describing how to take a backup or restore a backup with your own bucket using commands'
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Take a backup or restore a backup using commands {#commands-experience}

## Requirements {#requirements}

You will need the following details to export/restore backups to your own CSP storage bucket:

<Tabs>
  <TabItem value="AWS" label="AWS" default>
    1. AWS S3 endpoint, in the format: `s3://<bucket_name>.s3.amazonaws.com/<directory>`
       For example: `s3://testchbackups.s3.amazonaws.com/backups/
       Where:
         * `testchbackups` is the name of the S3 bucket to export backups to.
         * `backups` is an optional subdirectory.
    2. AWS access key and secret. (for key/secret-based authentication. We also 
       support role based authentication which is covered in the UI experience above) 
    <br/>
  </TabItem>
  <TabItem value="GCS" label="GCS">
   1.  GCS endpoint, in the format: `https://storage.googleapis.com/<bucket_name>/`
   2. Access HMAC key and HMAC secret.
   <br/>
  </TabItem>
  <TabItem value="Azure" label="Azure">
    1. Azure storage connection string.
    2. Azure container name in the storage account.
    3. Azure Blob within the container.
    <br/>
  </TabItem>
</Tabs>

## Backup / Restore to AWS S3 Bucket {#aws-s3-bucket}

### Full Backup {#aws-full-backup}

```sql
BACKUP TABLE system.users,
TABLE system.roles,
TABLE system.settings_profiles,
TABLE system.row_policies,
TABLE system.quotas,
TABLE system.functions,
ALL EXCEPT DATABASES INFORMATION_SCHEMA, information_schema, system
TO S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>')
```

Where `uuid` is a unique identifier, used to differentiate a set of backups.

:::note
You will need to use a different UUID for each new backup in this subdirectory, otherwise you will get a `BACKUP_ALREADY_EXISTS` error. For example, if you are taking daily backups, you will need to use a new UUID each day.
:::

### Incremental Backup {#aws-incremental-backup}

```sql
BACKUP TABLE system.users,
TABLE system.roles,
TABLE system.settings_profiles,
TABLE system.row_policies,
TABLE system.quotas, TABLE system.functions, 
ALL EXCEPT DATABASES INFORMATION_SCHEMA, information_schema, system
TO S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>') 
SETTINGS base_backup = S3('https://testchbackups.s3.amazonaws.com/backups/<base-backup-uuid>', '<key id>', '<key secret>')
```

### Restore from a backup {#aws-restore-backup}

Create a new service and run the command below:

```sql
RESTORE ALL
FROM S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>',
  extra_credentials(
    role_arn = 'arn:aws:iam::651674194215:role/test-byob-ui-role'
  )
)
```

See: [Configuring BACKUP/RESTORE to use an S3 Endpoint](/docs/en/operations/backup#configuring-backuprestore-to-use-an-s3-endpoint) for more details.

## Backup / Restore to Azure Blob Storage {#azure-blob-storage}

### Full Backup {#azure-full-backup}

```sql
BACKUP TABLE system.users,
TABLE system.roles,
TABLE system.settings_profiles,
TABLE system.row_policies,
TABLE system.quotas,
TABLE system.functions,
ALL EXCEPT DATABASES INFORMATION_SCHEMA, information_schema, system
TO AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>');
```

Where `uuid` is a unique identifier, used to differentiate a set of backups.

### Incremental Backup {#azure-incremental-backup}

```sql
BACKUP TABLE system.users,
TABLE system.roles,
TABLE system.settings_profiles,
TABLE system.row_policies,
TABLE system.quotas,
TABLE system.functions,
ALL EXCEPT DATABASES INFORMATION_SCHEMA, information_schema, system
TO AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>/my_incremental') 
SETTINGS base_backup = AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<uuid>')
```

### Restore from a backup {#azure-restore-backup}

Create a new service and run the command below. You will need to provide the connection string, container name, and uuid:

```sql
RESTORE ALL
FROM AzureBlobStorage(
  '< AzureBlobStorage endpoint connection string >',
  '<Container name>',
  '<uuid>'
)
```

## Backup / Restore to Google Cloud Storage (GCS) {#google-cloud-storage}

### Full Backup {#gcs-full-backup}

```sql
BACKUP TABLE system.users,
TABLE system.roles,
TABLE system.settings_profiles,
TABLE system.row_policies,
TABLE system.quotas,
TABLE system.functions,
ALL EXCEPT DATABASES INFORMATION_SCHEMA, information_schema, system
TO S3('https://storage.googleapis.com/<bucket>/<uuid>', '<hmac-key>', '<hmac-secret>')
```

Where `uuid` is a unique identifier, used to differentiate a set of backups.

### Incremental Backup {#gcs-incremental-backup}

```sql
BACKUP TABLE system.users,
TABLE system.roles,
TABLE system.settings_profiles,
TABLE system.row_policies,
TABLE system.quotas,
TABLE system.functions,
ALL EXCEPT DATABASES INFORMATION_SCHEMA, information_schema, system
TO S3('https://storage.googleapis.com/test_gcs_backups/<uuid>/my_incremental', '<key>', '<secret>')
SETTINGS base_backup = S3('https://storage.googleapis.com/test_gcs_backups/<uuid>', '<key>', '<secret>')
```

### Restore from a backup {#gcs-restore-backup}

```sql
RESTORE ALL
FROM S3('https://storage.googleapis.com/testbyob/<uuid>',
  '<HMAC key>',
  '<secret>'
)
```




