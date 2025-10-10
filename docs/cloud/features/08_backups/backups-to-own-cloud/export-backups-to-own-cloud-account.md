---
sidebar_label: 'Overview'
slug: /cloud/manage/backups/export-backups-to-own-cloud-account
title: 'Export Backups to your Own Cloud Account'
description: 'Describes how to export backups to your own Cloud account'
sidebar_position: 1
doc_type: 'guide'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

<EnterprisePlanFeatureBadge/>

## Overview {#overview}

ClickHouse Cloud allows exporting backups to your own cloud service provider (CSP) account storage (AWS S3, Google Cloud Storage, or Azure Blob Storage).
If you configure backups to your own bucket, ClickHouse Cloud will still take daily backups to its own bucket. 
This is to ensure that we have at least one copy of the data to restore from in case the backups in your bucket get corrupted.
For details of how ClickHouse Cloud backups work, see the [backups](/cloud/manage/backups/overview) docs.

In this guide, we walk through how you can export backups to your AWS, GCP, Azure object storage, as well as how to restore these backups in your account to a new ClickHouse Cloud service.
We also share backup / restore commands that allow you to export backups to your bucket and restore them.

:::note Cross-region backups
Users should be aware that any usage where backups are being exported to a 
different region in the same cloud provider will incur [data transfer](/cloud/manage/network-data-transfer)
charges.
:::

:::note Cross-cloud backups
Currently, we do not support cross-cloud backups, nor backup / restore for services utilizing [Transparent Data Encryption (TDE)](/cloud/security/cmek#transparent-data-encryption-tde) or for regulated services.
:::

## Backup options {#backup-options}

To export backups to your own cloud account, you have two options:

<VerticalStepper headerLevel="h4">

#### Via Cloud Console UI {#via-ui}

External backups can be [configured in the UI](/cloud/manage/backups/backup-restore-via-ui). 
By default, backups will then be taken daily (as specified in the [default backup policy](https://clickhouse.com/docs/cloud/manage/backups/overview#default-backup-policy)).
However, we also support [configurable](/cloud/manage/backups/configurable-backups) backups to your own cloud account, which allows for setting a custom schedule.
It is important to note that all backups to your bucket are full backups with no relationship to other previous or future backups.

#### Using SQL commands {#using-commands}

You can use [SQL commands](/cloud/manage/backups/backup-restore-via-commands) to export backups to your bucket.
</VerticalStepper>

:::warning
ClickHouse Cloud will not manage the lifecycle of backups in customer buckets.
Customers are responsible for ensuring that backups in their bucket are managed appropriately for adhering to compliance standards as well as managing cost.
If the backups are corrupted, they will not be able to be restored.
:::
