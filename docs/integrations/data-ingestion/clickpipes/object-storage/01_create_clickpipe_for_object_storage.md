---
sidebar_label: 'Create your first object storage ClickPipe'
description: 'Seamlessly connect your object storage to ClickHouse Cloud.'
slug: /integrations/clickpipes/object-storage
title: 'Creating your first object-storage ClickPipe'
doc_type: 'guide'
---

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

Object Storage ClickPipes provide a simple and resilient way to ingest data from Amazon S3, Google Cloud Storage, Azure Blob Storage, and DigitalOcean Spaces into ClickHouse Cloud. Both one-time and continuous ingestion are supported with exactly-once semantics.

# Creating your first object storage ClickPipe {#creating-your-first-clickpipe}

## Prerequisite {#prerequisite}

- You have familiarized yourself with the [ClickPipes intro](../index.md).

## Navigate to data sources {#1-load-sql-console}

In the cloud console, select the `Data Sources` button on the left-side menu and click on "Set up a ClickPipe"

<Image img={cp_step0} alt="Select imports" size="lg" border/>

## Select a data source {#2-select-data-source}

Select your data source.

<Image img={cp_step1} alt="Select data source type" size="lg" border/>

## Configure the ClickPipe {#3-configure-clickpipe}

Fill out the form by providing your ClickPipe with a name, a description (optional), your IAM role or credentials, and bucket URL.
You can specify multiple files using bash-like wildcards.
For more information, [see the documentation on using wildcards in path](/integrations/clickpipes/object-storage/reference/#limitations).

<Image img={cp_step2_object_storage} alt="Fill out connection details" size="lg" border/>

## Select data format {#4-select-format}

The UI will display a list of files in the specified bucket.
Select your data format (we currently support a subset of ClickHouse formats) and if you want to enable continuous ingestion.
([More details below](/integrations/clickpipes/object-storage/reference/#continuous-ingest)).

<Image img={cp_step3_object_storage} alt="Set data format and topic" size="lg" border/>

## Configure table, schema and settings {#5-configure-table-schema-settings}

In the next step, you can select whether you want to ingest data into a new ClickHouse table or reuse an existing one.
Follow the instructions in the screen to modify your table name, schema, and settings.
You can see a real-time preview of your changes in the sample table at the top.

<Image img={cp_step4a} alt="Set table, schema, and settings" size="lg" border/>

You can also customize the advanced settings using the controls provided

<Image img={cp_step4a3} alt="Set advanced controls" size="lg" border/>

Alternatively, you can decide to ingest your data in an existing ClickHouse table.
In that case, the UI will allow you to map fields from the source to the ClickHouse fields in the selected destination table.

<Image img={cp_step4b} alt="Use an existing table" size="lg" border/>

:::info
You can also map [virtual columns](../../sql-reference/table-functions/s3#virtual-columns), like `_path` or `_size`, to fields.
:::

## Configure permissions {#6-configure-permissions}

Finally, you can configure permissions for the internal ClickPipes user.

**Permissions:** ClickPipes will create a dedicated user for writing data into a destination table. You can select a role for this internal user using a custom role or one of the predefined role:
- `Full access`: with the full access to the cluster. Required if you use materialized view or Dictionary with the destination table.
- `Only destination table`: with the `INSERT` permissions to the destination table only.

<Image img={cp_step5} alt="Permissions" size="lg" border/>

## Complete setup {#7-complete-setup}

By clicking on "Complete Setup", the system will register your ClickPipe, and you'll be able to see it listed in the summary table.

<Image img={cp_success} alt="Success notice" size="sm" border/>

<Image img={cp_remove} alt="Remove notice" size="lg" border/>

The summary table provides controls to display sample data from the source or the destination table in ClickHouse

<Image img={cp_destination} alt="View destination" size="lg" border/>

As well as controls to remove the ClickPipe and display a summary of the ingest job.

<Image img={cp_overview} alt="View overview" size="lg" border/>

**Congratulations!** you have successfully set up your first ClickPipe.
If this is a streaming ClickPipe, it will be continuously running, ingesting data in real-time from your remote data source.
Otherwise, it will ingest the batch and complete.
