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
         * `testchbackup`s is the name of the S3 bucket to export backups to.
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

## Backup / Restore {#backup-restore}



