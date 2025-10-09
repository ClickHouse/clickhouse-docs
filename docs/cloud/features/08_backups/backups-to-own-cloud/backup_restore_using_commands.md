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

Users can utilize `BACKUP` and `RESTORE` commands to export backups to their storage buckets,
in addition to backing up or restoring [via user interface](/cloud/manage/backups/backup-restore-via-ui).
Commands for all three CSPs are given in this guide.

## Requirements {#requirements}

You will need the following details to export/restore backups to your own CSP storage bucket:

<Tabs>
  <TabItem value="AWS" label="AWS" default>
    1. AWS S3 endpoint, in the format: `s3://<bucket_name>.s3.amazonaws.com/<optional_directory>`
       For example: `s3://testchbackups.s3.amazonaws.com/`
       Where:
         * `testchbackups` is the name of the S3 bucket to export backups to.
         * `backups` is an optional subdirectory.
    2. AWS access key and secret. AWS role based authentication is also supported and can be used in place of AWS access key and secret as described in the section above.
    <br/>
  </TabItem>
  <TabItem value="GCP" label="GCP">
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

## Backup / Restore specific DB {#backup_restore_db}

Here we show the backup and restore of a *single* database.
See the [backup command summary](/operations/backup#command-summary) for full backup and restore commands.

### AWS S3 {#aws-s3-bucket}

<Tabs>
  <TabItem value="Backup" label="BACKUP" default>

```sql
BACKUP DATABASE test_backups 
TO S3(
'https://testchbackups.s3.amazonaws.com/<uuid>',
'<key id>',
'<key secret>'
)
```

Where `uuid` is a unique identifier, used to differentiate a set of backups.

:::note
You will need to use a different uuid for each new backup in this subdirectory, otherwise you will get a `BACKUP_ALREADY_EXISTS` error.
For example, if you are taking daily backups, you will need to use a new uuid each day.
:::
  </TabItem>
  <TabItem value="Restore" label="RESTORE" default>

```sql
RESTORE DATABASE test_backups
FROM S3(
'https://testchbackups.s3.amazonaws.com/<uuid>',
'<key id>',
'<key secret>'
)
```
  </TabItem>
</Tabs>

### Google Cloud Storage (GCS) {#google-cloud-storage}

<Tabs>
  <TabItem value="Backup" label="BACKUP" default>
```sql
BACKUP DATABASE test_backups 
TO S3(
'https://storage.googleapis.com/<bucket>/<uuid>',
'<hmac-key>',
'<hmac-secret>'
)
```

Where `uuid` is a unique identifier, used to identify the backup.

:::note
You will need to use a different uuid for each new backup in this subdirectory, otherwise you will get a `BACKUP_ALREADY_EXISTS` error.
For example, if you are taking daily backups, you will need to use a new uuid each day.
:::

  </TabItem>
  <TabItem value="Restore" label="RESTORE" default>
```sql
RESTORE DATABASE test_backups
FROM S3(
'https://storage.googleapis.com/<bucket>/<uuid>',
'<hmac-key>',
'<hmac-secret>'
)
```
  </TabItem>
</Tabs>

### Azure Blob Storage {#azure-blob-storage}

<Tabs>
  <TabItem value="Backup" label="BACKUP" default>
```sql
BACKUP DATABASE test_backups 
TO AzureBlobStorage(
'<AzureBlobStorage endpoint connection string>',
'<container>',
'<blob>/<>'
);
)
```

Where `uuid` is a unique identifier, used to identify the backup.

:::note
You will need to use a different uuid for each new backup in this subdirectory, otherwise you will get a `BACKUP_ALREADY_EXISTS` error.
For example, if you are taking daily backups, you will need to use a new uuid each day.
:::
</TabItem>
<TabItem value="Restore" label="RESTORE" default>
```sql
RESTORE DATABASE test_backups
FROM AzureBlobStorage(
'<AzureBlobStorage endpoint connection string>',
'<container>',
'<blob>/<uuid>'
)
```
  </TabItem>
</Tabs>

## Backup / Restore entire service {#backup_restore_entire_service}

For backing up the entire service, use the commands below.
This backup will contain all user data and system data for created entities, settings profiles, role policies, quotas, and functions.
We list these here for AWS S3.
You can utilize these commands with the syntax described above to take backups for GCS and Azure Blob storage.

<Tabs>
<TabItem value="Backup" label="BACKUP" default>

```sql
BACKUP 
    TABLE system.users,
    TABLE system.roles,
    TABLE system.settings_profiles,
    TABLE system.row_policies,
    TABLE system.quotas,
    TABLE system.functions,
    ALL EXCEPT DATABASES INFORMATION_SCHEMA, information_schema, system
TO S3(
    'https://testchbackups.s3.amazonaws.com/<uuid>',
    '<key id>',
    '<key secret>'
)
```

where `uuid` is a unique identifier, used to identify the backup.

</TabItem>
<TabItem value="Restore" label="RESTORE" default>

```sql
RESTORE ALL
FROM S3(
    'https://testchbackups.s3.amazonaws.com/<uuid>',
    '<key id>',
    '<key secret>'
)
```
</TabItem>
</Tabs>

## FAQ {#backups-faq}

<details>
<summary>What happens to the backups in my cloud object storage? Are they cleaned up by ClickHouse at some point?</summary>

We provide you the ability to export backups to your bucket, however, we do not clean up or delete any of the backups once written. You are responsible for managing the lifecycle of the backups in your bucket, including deleting, or archiving as needed, or moving to cheaper storage to optimize overall cost.

</details>

<details>
<summary>What happens to the restore process if I move some of the existing backups to another location?</summary>

If any backups are moved to another location, the restore command will need to be updated to reference the new location where the backups are stored.

</details>

<details>
<summary>What if I change my credentials required to access the object storage?</summary>

You will need to update the changed credentials in the UI, for backups to start happening successfully again.

</details>

<details>
<summary>What if I change the location to export my external backups to?</summary>

You will need to update the new location in the UI, and backups will start happening to the new location. The old backups will stay in the original location.

</details>

<details>
<summary>How can I disable external backups on a service that I enabled them for?</summary>

To disable external backups for a service, go to the service setting screen, and click on Change external backup. In the subsequent screen, click on Remove setup to disable external backups for the service.

</details>
