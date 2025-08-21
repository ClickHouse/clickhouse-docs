---
sidebar_label: 'Using the HTTP interface'
slug: /integrations/azure-data-factory/http-interface
description: 'Using ClickHouse''s HTTP interface to bring data from Azure Data Factory into ClickHouse'
keywords: ['azure data factory', 'azure', 'microsoft', 'data', 'http interface']
title: 'Using ClickHouse HTTP Interface to bring Azure data into ClickHouse'
doc_type: how-to
---

import Image from '@theme/IdealImage';

import azureHomePage                            from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-home-page.png';
import azureNewResourceAnalytics                from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-new-resource-analytics.png';
import azureNewDataFactory                      from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-new-data-factory.png';
import azureNewDataFactoryConfirm               from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-new-data-factory-confirm.png';
import azureNewDataFactorySuccess               from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-new-data-factory-success.png';
import azureHomeWithDataFactory                 from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-home-with-data-factory.png';
import azureDataFactoryPage                     from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-factory-page.png';
import adfCreateLinkedServiceButton             from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-create-linked-service-button.png';
import adfNewLinkedServiceSearch                from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-linked-service-search.png';
import adfNewLinedServicePane                   from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-lined-service-pane.png';
import adfNewLinkedServiceBaseUrlEmpty          from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-linked-service-base-url-empty.png';
import adfNewLinkedServiceParams                from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-linked-service-params.png';
import adfNewLinkedServiceExpressionFieldFilled from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-linked-service-expression-field-filled.png';
import adfNewLinkedServiceCheckConnection       from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-linked-service-check-connection.png';
import adfLinkedServicesList                    from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-linked-services-list.png';
import adfNewDatasetItem                        from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-dataset-item.png';
import adfNewDatasetPage                        from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-dataset-page.png';
import adfNewDatasetProperties                  from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-dataset-properties.png';
import adfNewDatasetQuery                       from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-dataset-query.png';
import adfNewDatasetConnectionSuccessful        from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-dataset-connection-successful.png';
import adfNewPipelineItem                       from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-pipeline-item.png';
import adfNewCopyDataItem                       from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-copy-data-item.png';
import adfCopyDataSource                        from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-copy-data-source.png';
import adfCopyDataSinkSelectPost                from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-copy-data-sink-select-post.png';
import adfCopyDataDebugSuccess                  from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-copy-data-debug-success.png';

# Using ClickHouse HTTP interface in Azure data factory {#using-clickhouse-http-interface-in-azure-data-factory}

The [`azureBlobStorage` Table Function](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
is a fast and convenient way to ingest data from Azure Blob Storage into
ClickHouse. Using it may however not always be suitable for the following reasons:

- Your data might not be stored in Azure Blob Storage — for example, it could be in Azure SQL Database, Microsoft SQL Server, or Cosmos DB.
- Security policies might prevent external access to Blob Storage
  altogether — for example, if the storage account is locked down with no public endpoint.

In such scenarios, you can use Azure Data Factory together with the
[ClickHouse HTTP interface](https://clickhouse.com/docs/interfaces/http)
to send data from Azure services into ClickHouse.

This method reverses the flow: instead of having ClickHouse pull the data from
Azure, Azure Data Factory pushes the data to ClickHouse. This approach
typically requires your ClickHouse instance to be accessible from the public
internet.

:::info
It is possible to avoid exposing your ClickHouse instance to the internet by
using Azure Data Factory's Self-hosted Integration Runtime. This setup allows
data to be sent over a private network. However, it's beyond the scope of this
article. You can find more information in the official guide:
[Create and configure a self-hosted integration
runtime](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
:::

## Turning ClickHouse into a REST service {#turning-clickhouse-to-a-rest-service}

Azure Data Factory supports sending data to external systems over HTTP in JSON
format. We can use this capability to insert data directly into ClickHouse
using the [ClickHouse HTTP interface](https://clickhouse.com/docs/interfaces/http).
You can learn more in the [ClickHouse HTTP Interface
documentation](https://clickhouse.com/docs/interfaces/http).

For this example, we only need to specify the destination table, define the
input data format as JSON, and include options to allow more flexible timestamp
parsing.

```sql
INSERT INTO my_table
SETTINGS 
    date_time_input_format='best_effort',
    input_format_json_read_objects_as_strings=1
FORMAT JSONEachRow
```

To send this query as part of an HTTP request, you simply pass it as a
URL-encoded string to the query parameter in your ClickHouse endpoint:
```text
https://your-clickhouse-url.com?query=INSERT%20INTO%20my_table%20SETTINGS%20date_time_input_format%3D%27best_effort%27%2C%20input_format_json_read_objects_as_strings%3D1%20FORMAT%20JSONEachRow%0A
```

:::info
Azure Data Factory can handle this encoding automatically using its built-in
`encodeUriComponent` function, so you don't have to do it manually.
:::

Now you can send JSON-formatted data to this URL. The data should match the
structure of the target table. Here's a simple example using curl, assuming a
table with three columns: `col_1`, `col_2`, and `col_3`.
```text
curl \
    -XPOST "https://your-clickhouse-url.com?query=<our_URL_encded_query>" \
    --data '{"col_1":9119,"col_2":50.994,"col_3":"2019-06-01 00:00:00"}'
```

You can also send a JSON array of objects, or JSON Lines (newline-delimited
JSON objects). Azure Data Factory uses the JSON array format, which works
perfectly with ClickHouse's `JSONEachRow` input.

As you can see, for this step you don't need to do anything special on the ClickHouse
side. The HTTP interface already provides everything needed to act as a
REST-like endpoint — no additional configuration required.

Now that we've made ClickHouse behave like a REST endpoint, it's time to
configure Azure Data Factory to use it.

In the next steps, we'll create an Azure Data Factory instance, set up a Linked
Service to your ClickHouse instance, define a Dataset for the
[REST sink](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest),
and create a Copy Data activity to send data from Azure to ClickHouse.

## Creating an Azure data factory instance {#create-an-azure-data-factory-instance}

This guide assumes that you have access to Microsoft Azure account, and you
already have configured a subscription and a resource group. If you have
an Azure Data Factory already configured, then you can safely skip this step
and move to the next one using your existing service.

1. Log in to the [Microsoft Azure Portal](https://portal.azure.com/) and click
   **Create a resource**.
   <Image img={azureHomePage} size="lg" alt="Azure Portal Home Page" border/>

2. In the Categories pane on the left, select **Analytics**, then click on
   **Data Factory** in the list of popular services.
   <Image img={azureNewResourceAnalytics} size="lg" alt="Azure Portal New Resource" border/>

3. Select your subscription and resource group, enter a name for the new Data
   Factory instance, choose the region and leave the version as V2.
   <Image img={azureNewDataFactory} size="lg" alt="Azure Portal New Data Factory" border/>

3. Click **Review + Create**, then click **Create** to launch the deployment.
   <Image img={azureNewDataFactoryConfirm} size="lg" alt="Azure Portal New Data Factory Confirm" border/>

   <Image img={azureNewDataFactorySuccess} size="lg" alt="Azure Portal New Data Factory Success" border/>

Once the deployment completes successfully, you can start using your new Azure
Data Factory instance.

## Creating a new REST-Based linked service {#-creating-new-rest-based-linked-service}

1. Log in to the Microsoft Azure Portal and open your Data Factory instance.
   <Image img={azureHomeWithDataFactory} size="lg" alt="Azure Portal Home Page with Data Factory" border/>

2. On the Data Factory overview page, click **Launch Studio**.
   <Image img={azureDataFactoryPage} size="lg" alt="Azure Portal Data Factory Page" border/>

3. In the left-hand menu, select **Manage**, then go to **Linked services**,
   and click **+ New** to create a new linked service.
   <Image img={adfCreateLinkedServiceButton} size="lg" alt="Azure Data Factory New Linked Service Button" border/>

4. In the **New linked service search bar**, type **REST**, select **REST**, and click **Continue**
   to create [a REST connector](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest)
   instance.
   <Image img={adfNewLinkedServiceSearch} size="lg" alt="Azure Data Factory New Linked Service Search" border/>

5. In the linked service configuration pane enter a name for your new service,
   click the **Base URL** field, then click **Add dynamic content** (this link only
   appears when the field is selected).
   <Image img={adfNewLinedServicePane} size="lg" alt="New Lined Service Pane" border/>

6. In the dynamic content pane you can create a parameterized URL, which
   allows you to define the query later when creating datasets for different
   tables — this makes the linked service reusable.
   <Image img={adfNewLinkedServiceBaseUrlEmpty} size="lg" alt="New Linked ServiceBase Url Empty" border/>

7. Click the **"+"** next to the filter input and add a new parameter, name it
   `pQuery`, set the type to String, and set the default value to `SELECT 1`.
   Click **Save**.
   <Image img={adfNewLinkedServiceParams} size="lg" alt="New Linked Service Parameters" border/>

8. In the expression field, enter the following and click **OK**. Replace
   `your-clickhouse-url.com` with the actual address of your ClickHouse
   instance.
   ```text
   @{concat('https://your-clickhouse-url.com:8443/?query=', encodeUriComponent(linkedService().pQuery))}
   ```
   <Image img={adfNewLinkedServiceExpressionFieldFilled} size="lg" alt="New Linked Service Expression Field Filled" border/>

9. Back in the main form select Basic authentication, enter the username and
   password used to connect to your ClickHouse HTTP interface, click **Test
   connection**. If everything is configured correctly, you'll see a success
   message.
   <Image img={adfNewLinkedServiceCheckConnection} size="lg" alt="New Linked Service Check Connection" border/>

10. Click **Create** to finalize the setup.
    <Image img={adfLinkedServicesList} size="lg" alt="Linked Services List" border/>

You should now see your newly registered REST-based linked service in the list.

## Creating a new dataset for the ClickHouse HTTP Interface {#creating-a-new-dataset-for-the-clickhouse-http-interface}

Now that we have a linked service configured for the ClickHouse HTTP interface,
we can create a dataset that Azure Data Factory will use to send data to
ClickHouse.

In this example, we'll insert a small portion of the [Environmental Sensors
Data](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors).

1. Open the ClickHouse query console of your choice — this could be the
   ClickHouse Cloud web UI, the CLI client, or any other interface you use to
   run queries — and create the target table:
   ```sql
   CREATE TABLE sensors
   (
       sensor_id UInt16,
       lat Float32,
       lon Float32,
       timestamp DateTime,
       temperature Float32
   )
   ENGINE = MergeTree
   ORDER BY (timestamp, sensor_id);
   ```

2. In Azure Data Factory Studio, select Author in the left-hand pane. Hover
   over the Dataset item, click the three-dot icon, and choose New dataset.
   <Image img={adfNewDatasetItem} size="lg" alt="New Dataset Item" border/>

3. In the search bar, type **REST**, select **REST**, and click **Continue**.
   Enter a name for your dataset and select the **linked service** you created
   in the previous step. Click **OK** to create the dataset.
   <Image img={adfNewDatasetPage} size="lg" alt="New Dataset Page" border/>

4. You should now see your newly created dataset listed under the Datasets
   section in the Factory Resources pane on the left. Select the dataset to
   open its properties. You'll see the `pQuery` parameter that was defined in the
   linked service. Click the **Value** text field. Then click **Add dynamic**
   content.
   <Image img={adfNewDatasetProperties} size="lg" alt="New Dataset Properties" border/>

5. In the pane that opens, paste the following query:
   ```sql
   INSERT INTO sensors
   SETTINGS 
       date_time_input_format=''best_effort'', 
       input_format_json_read_objects_as_strings=1 
   FORMAT JSONEachRow
   ```

   :::danger
   All single quotes `'` in the query must be replaced with two single quotes
   `''`. This is required by Azure Data Factory's expression parser. If you
   don't escape them, you may not see an error immediately — but it will fail
   later when you try to use or save the dataset. For example, `'best_effort'`
   must be written as `''best_effort''`.
   :::

   <Image img={adfNewDatasetQuery} size="xl" alt="New Dataset Query" border/>

6. Click OK to save the expression. Click Test connection. If everything is
   configured correctly, you'll see a Connection successful message. Click Publish
   all at the top of the page to save your changes.
   <Image img={adfNewDatasetConnectionSuccessful} size="xl" alt="New Dataset Connection Successful" border/>

### Setting up an example dataset {#setting-up-an-example-dataset}

In this example, we will not use the full Environmental Sensors Dataset, but
just a small subset available at the
[Sensors Dataset Sample](https://datasets-documentation.s3.eu-west-3.amazonaws.com/environmental/sensors.csv).

:::info
To keep this guide focused, we won't go into the exact steps for creating the
source dataset in Azure Data Factory. You can upload the sample data to any
storage service of your choice — for example, Azure Blob Storage, Microsoft SQL
Server, or even a different file format supported by Azure Data Factory.
:::

Upload the dataset to your Azure Blob Storage (or another preferred storage
service), Then, in Azure Data Factory Studio, go to the Factory Resources pane.
Create a new dataset that points to the uploaded data. Click Publish all to
save your changes.

## Creating a Copy Activity to transfer data to ClickHouse {#creating-the-copy-activity-to-transfer-data-to-clickhouse}

Now that we've configured both the input and output datasets, we can set up a
**Copy Data** activity to transfer data from our example dataset into the
`sensors` table in ClickHouse.

1. Open **Azure Data Factory Studio**, go to the **Author tab**. In the
   **Factory Resources** pane, hover over **Pipeline**, click the three-dot
   icon, and select **New pipeline**.
   <Image img={adfNewPipelineItem} size="lg" alt="ADF New Pipeline Item" border/>

2. In the **Activities** pane, expand the **Move and transform** section and
   drag the **Copy data** activity onto the canvas.
   <Image img={adfNewCopyDataItem} size="lg" alt="New Copy DataItem" border/>

3. Select the **Source** tab, and choose the source dataset you created earlier.
   <Image img={adfCopyDataSource} size="lg" alt="Copy Data Source" border/>

4. Go to the **Sink** tab and select the ClickHouse dataset created for your
   sensors table. Set **Request method** to POST. Ensure **HTTP compression
   type** is set to **None**.
   :::warning
   HTTP compression does not work correctly in Azure Data Factory's Copy Data
   activity. When enabled, Azure sends a payload consisting of zero bytes only
   — likely a bug in the service. Be sure to leave compression disabled.
   :::
   :::info
   We recommend keeping the default batch size of 10,000, or even increasing it
   further. For more details, see
   [Selecting an Insert Strategy / Batch inserts if synchronous](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous)
   for more details.
   :::
   <Image img={adfCopyDataSinkSelectPost} size="lg" alt="Copy Data Sink Select Post" border/>

5. Click **Debug** at the top of the canvas to run the pipeline. After a short
   wait, the activity will be queued and executed. If everything is configured
   correctly, the task should finish with a **Success** status.
   <Image img={adfCopyDataDebugSuccess} size="lg" alt="Copy Data Debug Success" border/>

6. Once complete, click **Publish all** to save your pipeline and dataset changes.

## Additional resources {#additional-resources-1}
- [HTTP Interface](https://clickhouse.com/docs/interfaces/http)
- [Copy and transform data from and to a REST endpoint by using Azure Data Factory](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest?tabs=data-factory)
- [Selecting an Insert Strategy](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy)
- [Create and configure a self-hosted integration runtime](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
