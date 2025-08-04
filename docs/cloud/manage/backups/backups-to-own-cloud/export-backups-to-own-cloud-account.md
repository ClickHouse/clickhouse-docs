---
sidebar_label: 'Export Backups to your Own Cloud Account'
slug: /cloud/manage/backups/export-backups-to-own-cloud-account
title: 'Export Backups to your Own Cloud Account'
description: 'Describes how to export backups to your own Cloud account'
sidebar_position: 1
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

<EnterprisePlanFeatureBadge/>

ClickHouse Cloud allows exporting backups to your own cloud service provider 
(CSP) account storage (AWS S3, Google Cloud Storage, or Azure Blob Storage). 
For details of how ClickHouse Cloud backups work, including "full" vs. "incremental"
backups, see the [backups](/cloud/manage/backups/overview) docs.

Here we walk through how you can export backups to your AWS, GCP, Azure object 
storage as well as how to restore from these backups in your account to a new 
ClickHouse Cloud service.

:::note
Users should be aware that any usage where backups are being exported to a 
different region in the same cloud provider will incur [data transfer](/cloud/manage/network-data-transfer)
charges. Currently, we do not support cross-cloud backups.
:::

To export backups to your own cloud account, you can leverage the UI capability 
from the cloud console. This also allows you to also set backups to happen
on a specific schedule by using [configurable backups](/cloud/manage/backups/configurable-backups).
Alternatively, you can use SQL commands to export backups to your bucket. Both 
approaches are explained in this document.

:::note
If you configure backups to your own bucket, ClickHouse Cloud will still take 
daily backups to its own bucket. This is to ensure that we have at least one 
copy of the data to restore from in case the backups in your own bucket get 
corrupted.
:::

:::warning
ClickHouse Cloud will not manage the lifecycle of backups in your bucket, as we 
do not have delete permissions for this data. You are responsible for ensuring 
that backups in your bucket are managed appropriately, for compliance reasons as
well as to manage cost. If the backups are corrupted and / or moved to another 
location, restoring the backups will not work.
:::







