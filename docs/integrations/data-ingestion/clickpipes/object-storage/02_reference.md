---
sidebar_label: 'Reference'
description: 'Details supported formats, exactly-once semantics, view-support, scaling, limitations, authentication with object storage ClickPipes'
slug: /integrations/clickpipes/object-storage/reference
sidebar_position: 1
title: 'Reference'
doc_type: 'reference'
---

import S3svg from '@site/static/images/integrations/logos/amazon_s3_logo.svg';
import Gcssvg from '@site/static/images/integrations/logos/gcs.svg';
import DOsvg from '@site/static/images/integrations/logos/digitalocean.svg';
import ABSsvg from '@site/static/images/integrations/logos/azureblobstorage.svg';
import Image from '@theme/IdealImage';

## Supported data sources {#supported-data-sources}

| Name                 |Logo|Type| Status          | Description                                                                                          |
|----------------------|----|----|-----------------|------------------------------------------------------------------------------------------------------|
| Amazon S3            |<S3svg class="image" alt="Amazon S3 logo" style={{width: '3rem', height: 'auto'}}/>|Object Storage| Stable          | Configure ClickPipes to ingest large volumes of data from object storage.                            |
| Google Cloud Storage |<Gcssvg class="image" alt="Google Cloud Storage logo" style={{width: '3rem', height: 'auto'}}/>|Object Storage| Stable          | Configure ClickPipes to ingest large volumes of data from object storage.                            |
| DigitalOcean Spaces | <DOsvg class="image" alt="Digital Ocean logo" style={{width: '3rem', height: 'auto'}}/> | Object Storage | Stable | Configure ClickPipes to ingest large volumes of data from object storage.
| Azure Blob Storage | <ABSsvg class="image" alt="Azure Blob Storage logo" style={{width: '3rem', height: 'auto'}}/> | Object Storage | Stable | Configure ClickPipes to ingest large volumes of data from object storage.

More connectors will get added to ClickPipes, you can find out more by [contacting us](https://clickhouse.com/company/contact?loc=clickpipes).

## Supported data formats {#supported-data-formats}

The supported formats are:
- [JSON](/interfaces/formats/JSON)
- [CSV](/interfaces/formats/CSV)
- [Parquet](/interfaces/formats/Parquet)
- [Avro](/interfaces/formats/Avro)

## Exactly-once semantics {#exactly-once-semantics}

Various types of failures can occur when ingesting large dataset, which can result in a partial inserts or duplicate data. Object Storage ClickPipes are resilient to insert failures and provides exactly-once semantics. This is accomplished by using temporary "staging" tables. Data is first inserted into the staging tables. If something goes wrong with this insert, the staging table can be truncated and the insert can be retried from a clean state. Only when an insert is completed and successful, the partitions in the staging table are moved to target table. To read more about this strategy, check-out [this blog post](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3).

### View support {#view-support}
Materialized views on the target table are also supported. ClickPipes will create staging tables not only for the target table, but also any dependent materialized view.

We do not create staging tables for non-materialized views. This means that if you have a target table with one of more downstream materialized views, those materialized views should avoid selecting data via a view from the target table. Otherwise, you may find that you are missing data in the materialized view.

## Scaling {#scaling}

Object Storage ClickPipes are scaled based on the minimum ClickHouse service size determined by the [configured vertical autoscaling settings](/manage/scaling#configuring-vertical-auto-scaling). The size of the ClickPipe is determined when the pipe is created. Subsequent changes to the ClickHouse service settings will not affect the ClickPipe size.

To increase the throughput on large ingest jobs, we recommend scaling the ClickHouse service before creating the ClickPipe.

## Limitations {#limitations}
- Any changes to the destination table, its materialized views (including cascading materialized views), or the materialized view's target tables can result in temporary errors that will be retried. For best results we recommend to stop the pipe, make the necessary modifications, and then restart the pipe for the changes to be picked up and avoid errors.
- There are limitations on the types of views that are supported. Please read the section on [exactly-once semantics](#exactly-once-semantics) and [view support](#view-support) for more information.
- Role authentication is not available for S3 ClickPipes for ClickHouse Cloud instances deployed into GCP or Azure. It is only supported for AWS ClickHouse Cloud instances.
- ClickPipes will only attempt to ingest objects at 10GB or smaller in size. If a file is greater than 10GB an error will be appended to the ClickPipes dedicated error table.
- Azure Blob Storage pipes with continuous ingest on containers with over 100k files will have a latency of around 10–15 seconds in detecting new files. Latency increases with file count.
- Object Storage ClickPipes **does not** share a listing syntax with the [S3 Table Function](/sql-reference/table-functions/s3), nor Azure with the [AzureBlobStorage Table function](/sql-reference/table-functions/azureBlobStorage).
  - `?` - Substitutes any single character
  - `*` - Substitutes any number of any characters except / including empty string
  - `**` - Substitutes any number of any character include / including empty string

:::note
This is a valid path (for S3):

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/**.ndjson.gz

This is not a valid path. `{N..M}` are not supported in ClickPipes.

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/{documents-01,documents-02}.ndjson.gz
:::

## Continuous Ingest {#continuous-ingest}
ClickPipes supports continuous ingestion from S3, GCS, Azure Blob Storage, and DigitalOcean Spaces. When enabled, ClickPipes continuously ingests data from the specified path, and polls for new files at a rate of once every 30 seconds. However, new files must be lexically greater than the last ingested file. This means that they must be named in a way that defines the ingestion order. For instance, files named `file1`, `file2`, `file3`, etc., will be ingested sequentially. If a new file is added with a name like `file0`, ClickPipes will not ingest it because it is not lexically greater than the last ingested file.

## Archive table {#archive-table}
ClickPipes will create a table next to your destination table with the postfix `s3_clickpipe_<clickpipe_id>_archive`. This table will contain a list of all the files that have been ingested by the ClickPipe. This table is used to track files during ingestion and can be used to verify files have been ingested. The archive table has a [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) of 7 days.

:::note
These tables will not be visible using ClickHouse Cloud SQL Console, you will need to connect via an external client either using HTTPS or Native connection to read them.
:::

## Authentication {#authentication}

### S3 {#s3}
Both publicly accessible and protected S3 buckets are supported.

Public buckets need to allow both the `s3:GetObject` and the `s3:ListBucket` actions in their Policy.

Protected buckets can be accessed using either [IAM credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) or an [IAM Role](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html).
To use an IAM Role, you will need to create the IAM Role as specified [in this guide](/cloud/data-sources/secure-s3). Copy the new IAM Role Arn after creation and paste it into the ClickPipe configuration as the "IAM ARN role".

### GCS {#gcs}
Like S3, you can access public buckets with no configuration, and with protected buckets you can use [HMAC Keys](https://cloud.google.com/storage/docs/authentication/managing-hmackeys) in place of the AWS IAM credentials. You can read this guide from Google Cloud on [how to setup such keys](https://cloud.google.com/storage/docs/authentication/hmackeys).

Service Accounts for GCS aren't directly supported. HMAC (IAM) Credentials must be used when authenticating with non-public buckets.
The Service Account permissions attached to the HMAC credentials should be `storage.objects.list` and `storage.objects.get`.

### DigitalOcean Spaces {#dospaces}
Currently only protected buckets are supported for DigitalOcean spaces. You require an "Access Key" and a "Secret Key" to access the bucket and its files. You can read [this guide](https://docs.digitalocean.com/products/spaces/how-to/manage-access/) on how to create access keys.

### Azure Blob Storage {#azureblobstorage}
Currently only protected buckets are supported for Azure Blob Storage. Authentication is done via a connection string, which supports access keys and shared keys. For more information, read [this guide](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string).
