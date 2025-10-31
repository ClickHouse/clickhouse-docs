---
sidebar_label: 'ClickPipes for object storage'
description: 'Seamlessly connect your object storage to ClickHouse Cloud.'
slug: /integrations/clickpipes/object-storage
title: 'Integrating Object Storage with ClickHouse Cloud'
doc_type: 'guide'
keywords: ['clickpipes', 'object storage', 's3', 'data ingestion', 'batch loading']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import S3svg from '@site/static/images/integrations/logos/amazon_s3_logo.svg';
import Gcssvg from '@site/static/images/integrations/logos/gcs.svg';
import DOsvg from '@site/static/images/integrations/logos/digitalocean.svg';
import ABSsvg from '@site/static/images/integrations/logos/azureblobstorage.svg';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step1.png';
import cp_step2_object_storage from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step2_object_storage.png';
import cp_step3_object_storage from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3_object_storage.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step4a3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a3.png';
import cp_step4b from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4b.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_success from '@site/static/images/integrations/data-ingestion/clickpipes/cp_success.png';
import cp_remove from '@site/static/images/integrations/data-ingestion/clickpipes/cp_remove.png';
import cp_destination from '@site/static/images/integrations/data-ingestion/clickpipes/cp_destination.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';
import Image from '@theme/IdealImage';

# Integrating object storage with ClickHouse Cloud
Object Storage ClickPipes provide a simple and resilient way to ingest data from Amazon S3, Google Cloud Storage, Azure Blob Storage, and DigitalOcean Spaces into ClickHouse Cloud. Both one-time and continuous ingestion are supported with exactly-once semantics.

## Prerequisite {#prerequisite}
You have familiarized yourself with the [ClickPipes intro](./index.md).

## Creating your first ClickPipe {#creating-your-first-clickpipe}

1. In the cloud console, select the `Data Sources` button on the left-side menu and click on "Set up a ClickPipe"

<Image img={cp_step0} alt="Select imports" size="lg" border/>

2. Select your data source.

<Image img={cp_step1} alt="Select data source type" size="lg" border/>

3. Fill out the form by providing your ClickPipe with a name, a description (optional), your IAM role or credentials, and bucket URL. You can specify multiple files using bash-like wildcards. For more information, [see the documentation on using wildcards in path](#limitations).

<Image img={cp_step2_object_storage} alt="Fill out connection details" size="lg" border/>

4. The UI will display a list of files in the specified bucket. Select your data format (we currently support a subset of ClickHouse formats) and if you want to enable continuous ingestion [More details below](#continuous-ingest).

<Image img={cp_step3_object_storage} alt="Set data format and topic" size="lg" border/>

5. In the next step, you can select whether you want to ingest data into a new ClickHouse table or reuse an existing one. Follow the instructions in the screen to modify your table name, schema, and settings. You can see a real-time preview of your changes in the sample table at the top.

<Image img={cp_step4a} alt="Set table, schema, and settings" size="lg" border/>

  You can also customize the advanced settings using the controls provided

<Image img={cp_step4a3} alt="Set advanced controls" size="lg" border/>

6. Alternatively, you can decide to ingest your data in an existing ClickHouse table. In that case, the UI will allow you to map fields from the source to the ClickHouse fields in the selected destination table.

<Image img={cp_step4b} alt="Use an existing table" size="lg" border/>

:::info
You can also map [virtual columns](../../sql-reference/table-functions/s3#virtual-columns), like `_path` or `_size`, to fields.
:::

7. Finally, you can configure permissions for the internal ClickPipes user.

  **Permissions:** ClickPipes will create a dedicated user for writing data into a destination table. You can select a role for this internal user using a custom role or one of the predefined role:
    - `Full access`: with the full access to the cluster. Required if you use materialized view or Dictionary with the destination table.
    - `Only destination table`: with the `INSERT` permissions to the destination table only.

<Image img={cp_step5} alt="Permissions" size="lg" border/>

8. By clicking on "Complete Setup", the system will register you ClickPipe, and you'll be able to see it listed in the summary table.

<Image img={cp_success} alt="Success notice" size="sm" border/>

<Image img={cp_remove} alt="Remove notice" size="lg" border/>

  The summary table provides controls to display sample data from the source or the destination table in ClickHouse

<Image img={cp_destination} alt="View destination" size="lg" border/>

  As well as controls to remove the ClickPipe and display a summary of the ingest job.

<Image img={cp_overview} alt="View overview" size="lg" border/>

Image
9. **Congratulations!** you have successfully set up your first ClickPipe. If this is a streaming ClickPipe it will be continuously running, ingesting data in real-time from your remote data source. Otherwise it will ingest the batch and complete.

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
  - `?` — Substitutes any single character
  - `*` — Substitutes any number of any characters except / including empty string
  - `**` — Substitutes any number of any character include / including empty string

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

## FAQ {#faq}

- **Does ClickPipes support GCS buckets prefixed with `gs://`?**

No. For interoperability reasons we ask you to replace your `gs://` bucket prefix with `https://storage.googleapis.com/`.

- **What permissions does a GCS public bucket require?**

`allUsers` requires appropriate role assignment. The `roles/storage.objectViewer` role must be granted at the bucket level. This role provides the `storage.objects.list` permission, which allows ClickPipes to list all objects in the bucket which is required for onboarding and ingestion. This role also includes the `storage.objects.get` permission, which is required to read or download individual objects in the bucket. See: [Google Cloud Access Control](https://cloud.google.com/storage/docs/access-control/iam-roles) for further information.
