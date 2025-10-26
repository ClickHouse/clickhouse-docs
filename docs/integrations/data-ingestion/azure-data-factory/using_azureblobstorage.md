---
sidebar_label: 'Using the azureBlobStorage table function'
slug: /integrations/azure-data-factory/table-function
description: 'Using ClickHouse''s azureBlobStorage table function'
keywords: ['azure data factory', 'azure', 'microsoft', 'data', 'azureBlobStorage']
title: 'Using ClickHouse''s azureBlobStorage table function to bring Azure data into ClickHouse'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import azureDataStoreSettings                   from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-settings.png';
import azureDataStoreAccessKeys                 from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-access-keys.png';

# Using ClickHouse's azureBlobStorage table function {#using-azureBlobStorage-function}

This is one of the most efficient and straightforward ways to copy data from
Azure Blob Storage or Azure Data Lake Storage into ClickHouse. With this table
function, you can instruct ClickHouse to connect directly to Azure storage and
read data on demand.

It provides a table-like interface that allows you to select, insert, and
filter data directly from the source. The function is highly optimized and
supports many widely used file formats, including `CSV`, `JSON`, `Parquet`, `Arrow`,
`TSV`, `ORC`, `Avro`, and more. For the full list see ["Data formats"](/interfaces/formats).

In this section, we'll walk through a simple startup guide for transferring
data from Azure Blob Storage to ClickHouse, along with important considerations
for using this function effectively. For more details and advanced options,
refer to the official documentation:
[`azureBlobStorage` Table Function documentation page](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)

## Acquiring Azure Blob Storage Access Keys {#acquiring-azure-blob-storage-access-keys}

To allow ClickHouse to access your Azure Blob Storage, you'll need a connection string with an access key.

1. In the Azure portal, navigate to your **Storage Account**.

2. In the left-hand menu, select **Access keys** under the **Security +
   networking** section.
   <Image img={azureDataStoreSettings} size="lg" alt="Azure Data Store Settings" border/>

3. Choose either **key1** or **key2**, and click the **Show** button next to
   the **Connection string** field.
   <Image img={azureDataStoreAccessKeys} size="lg" alt="Azure Data Store Access Keys" border/>

4. Copy the connection string — you'll use this as a parameter in the azureBlobStorage table function.

## Querying the data from Azure Blob Storage {#querying-the-data-from-azure-blob-storage}

Open your preferred ClickHouse query console — this can be the ClickHouse Cloud
web interface, the ClickHouse CLI client, or any other tool you use to run
queries. Once you have both the connection string and your ClickHouse query
console ready, you can start querying data directly from Azure Blob Storage.

In the following example, we query all the data stored in JSON files located in
a container named data-container:

```sql
SELECT * FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

If you'd like to copy that data into a local ClickHouse table (e.g., my_table),
you can use an `INSERT INTO ... SELECT` statement:

```sql
INSERT INTO my_table
SELECT * FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

This allows you to efficiently pull external data into ClickHouse without
needing intermediate ETL steps.

## A simple example using the Environmental sensors dataset {#simple-example-using-the-environmental-sensors-dataset}

As an example we will download a single file from the Environmental Sensors
Dataset.

1. Download a [sample file](https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/sensors/monthly/2019-06_bmp180.csv.zst)
   from the [Environmental Sensors Dataset](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors)

2. In the Azure Portal, create a new storage account if you don't already have one.

:::warning
Make sure that **Allow storage account key access** is enabled for your storage
account, otherwise you will not be able to use the account keys to access the
data.
:::

3. Create a new container in your storage account. In this example, we name it sensors.
   You can skip this step if you're using an existing container.

4. Upload the previously downloaded `2019-06_bmp180.csv.zst` file to the
   container.

5. Follow the steps described earlier to obtain the Azure Blob Storage
   connection string.

Now that everything is set up, you can query the data directly from Azure Blob Storage:

    ```sql
    SELECT *
    FROM azureBlobStorage(
        '<YOUR CONNECTION STRING>', 
        'sensors',
        '2019-06_bmp180.csv.zst', 
        'CSVWithNames')
    LIMIT 10
    SETTINGS format_csv_delimiter = ';'
    ```

7. To load the data into a table, create a simplified version of the
   schema used in the original dataset:
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

:::info
For more information on configuration options and schema inference when
querying external sources like Azure Blob Storage, see [Automatic schema
inference from input data](https://clickhouse.com/docs/interfaces/schema-inference)
:::

8. Now insert the data from Azure Blob Storage into the sensors table:
    ```sql
    INSERT INTO sensors
    SELECT sensor_id, lat, lon, timestamp, temperature
    FROM azureBlobStorage(
        '<YOUR CONNECTION STRING>', 
        'sensors',
        '2019-06_bmp180.csv.zst', 
        'CSVWithNames')
    SETTINGS format_csv_delimiter = ';'
    ```

Your sensors table is now populated with data from the `2019-06_bmp180.csv.zst`
file stored in Azure Blob Storage.

## Additional resources {#additional-resources}

This is just a basic introduction to using the azureBlobStorage function. For
more advanced options and configuration details, please refer to the official
documentation:

- [azureBlobStorage Table Function](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
- [Formats for Input and Output Data](https://clickhouse.com/docs/sql-reference/formats)
- [Automatic schema inference from input data](https://clickhouse.com/docs/interfaces/schema-inference)
