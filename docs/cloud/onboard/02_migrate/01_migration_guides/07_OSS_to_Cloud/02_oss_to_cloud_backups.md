---
sidebar_label: 'Using BACKUP and RESTORE'
slug: /cloud/migration/oss-to-cloud-backup-restore
title: 'Migrating between self-managed ClickHouse and ClickHouse Cloud with BACKUP/RESTORE'
description: 'Page describing how to migrate between self-managed ClickHouse and ClickHouse Cloud using BACKUP and RESTORE commands'
doc_type: 'guide'
keywords: ['migration', 'ClickHouse Cloud', 'OSS', 'Migrate self-managed to Cloud', 'BACKUP', 'RESTORE']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Migrating from Self-Managed ClickHouse to ClickHouse Cloud Using Backup Commands

## Overview {#overview-migration-approaches}

There are two primary methods to migrate from self-managed ClickHouse (OSS) to ClickHouse Cloud:

- Using the `remoteSecure()` function in which data is directly pulled/pushed.
- Using `BACKUP`/`RESTORE` commands via cloud object storage

This migration guide focuses on the `BACKUP`/`RESTORE` approach and offers a practical example
of migrating a database in opensource ClickHouse to Cloud.

**prerequisites**
- You have OSS ClickHouse installed and running
- You have followed steps 1 and 2 of the [New York Taxi Data](/getting-started/example-datasets/nyc-taxi) to create a database, table and insert the data
- You have an [S3 bucket and IAM user](/integrations/s3#configuring-s3-for-clickhouse-use)

## Phase 1: Preparation (On Your OSS Deployment)

### 1.1 Set Up Cloud Storage Access

First you need to configure your OSS instance to write to cloud storage.
In this guide we will be using AWS S3 although you could also use GCP or Azure.







