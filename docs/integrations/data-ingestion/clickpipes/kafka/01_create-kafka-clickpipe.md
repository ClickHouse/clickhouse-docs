---
sidebar_label: 'Create your first Kafka ClickPipe'
description: 'Step-by-step guide to creating your first Kafka ClickPipe.'
slug: /integrations/clickpipes/kafka/create-your-first-kafka-clickpipe
sidebar_position: 1
title: 'Creating your first Kafka ClickPipe'
doc_type: 'guide'
keywords: ['create kafka clickpipe', 'kafka', 'clickpipes', 'data sources', 'setup guide']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step1.png';
import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step2.png';
import cp_step3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';
import cp_table_settings from '@site/static/images/integrations/data-ingestion/clickpipes/cp_table_settings.png';
import Image from '@theme/IdealImage';

# Creating your first Kafka ClickPipe {#creating-your-first-kafka-clickpipe}

> In this guide, we will walk you through the process of creating your first Kafka ClickPipe.

<VerticalStepper type="numbered" headerLevel="h2">

## Navigate to data sources {#1-load-sql-console}
Select the `Data Sources` button on the left-side menu and click on "Set up a ClickPipe".
<Image img={cp_step0} alt="Select imports" size="md"/>

## Select a data source {#2-select-data-source}
Select your Kafka data source from the list.
<Image img={cp_step1} alt="Select data source type" size="md"/>

## Configure the data source {#3-configure-data-source}
Fill out the form by providing your ClickPipe with a name, a description (optional), your credentials, and other connection details.
<Image img={cp_step2} alt="Fill out connection details" size="md"/>

## Configure a schema registry (optional) {#4-configure-your-schema-registry}
A valid schema is required for Avro streams. See [Schema registries](./02_schema-registries.md) for more details on how to configure a schema registry.

## Configure a reverse private endpoint (optional) {#5-configure-reverse-private-endpoint}
Configure a Reverse Private Endpoint to allow ClickPipes to connect to your Kafka cluster using AWS PrivateLink.
See our [AWS PrivateLink documentation](../aws-privatelink.md) for more information.

## Select your topic {#6-select-your-topic}
Select your topic and the UI will display a sample document from the topic.
<Image img={cp_step3} alt="Set your topic" size="md"/>

## Configure your destination table {#7-configure-your-destination-table}

In the next step, you can select whether you want to ingest data into a new ClickHouse table or reuse an existing one. Follow the instructions in the screen to modify your table name, schema, and settings. You can see a real-time preview of your changes in the sample table at the top.

<Image img={cp_step4a} alt="Set table, schema, and settings" size="md"/>

You can also customize the advanced settings using the controls provided

<Image img={cp_table_settings} alt="Set advanced controls" size="md"/>

## Configure permissions {#8-configure-permissions}
ClickPipes will create a dedicated user for writing data into a destination table. You can select a role for this internal user using a custom role or one of the predefined role:
- `Full access`: with the full access to the cluster. It might be useful if you use Materialized View or Dictionary with the destination table.
- `Only destination table`: with the `INSERT` permissions to the destination table only.

<Image img={cp_step5} alt="Permissions" size="md"/>

## Complete setup {#9-complete-setup}
Clicking on "Create ClickPipe" will create and run your ClickPipe. It will now be listed in the Data Sources section.

<Image img={cp_overview} alt="View overview" size="md"/>

</VerticalStepper>
