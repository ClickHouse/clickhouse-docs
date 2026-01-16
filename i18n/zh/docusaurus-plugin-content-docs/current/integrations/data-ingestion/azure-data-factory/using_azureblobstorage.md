---
sidebar_label: '使用 azureBlobStorage 表函数'
slug: /integrations/azure-data-factory/table-function
description: '使用 ClickHouse 的 azureBlobStorage 表函数'
keywords: ['azure data factory', 'azure', 'microsoft', 'data', 'azureBlobStorage']
title: '使用 ClickHouse 的 azureBlobStorage 表函数将 Azure 中的数据导入 ClickHouse'
doc_type: 'guide'
integration:
   - support_level: 'core'
   - category: 'data_ingestion'
---

import Image from '@theme/IdealImage';
import azureDataStoreSettings                   from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-settings.png';
import azureDataStoreAccessKeys                 from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-access-keys.png';

# 使用 ClickHouse 的 azureBlobStorage 表函数 \\{#using-azureBlobStorage-function\\}

这是将数据从 Azure Blob Storage 或 Azure Data Lake Storage 复制到 ClickHouse 的最高效且最直接的方法之一。通过此表函数，可以让 ClickHouse 直接连接到 Azure 存储并按需读取数据。

它提供类似表的接口，使可以直接从数据源执行 `SELECT`、`INSERT` 和过滤操作。该函数经过高度优化，支持许多广泛使用的文件格式，包括 `CSV`、`JSON`、`Parquet`、`Arrow`、`TSV`、`ORC`、`Avro` 等。完整列表请参见 ["Data formats"](/interfaces/formats)。

在本节中，我们将通过一个从 Azure Blob Storage 向 ClickHouse 传输数据的简单入门示例进行讲解，并介绍高效使用此函数时需要注意的重要事项。有关更多细节和高级选项，请参阅官方文档：
[`azureBlobStorage` Table Function 文档页面](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)

## 获取 Azure Blob Storage 访问密钥 \\{#acquiring-azure-blob-storage-access-keys\\}

要允许 ClickHouse 访问 Azure Blob Storage，您需要一个包含访问密钥的连接字符串。

1. 在 Azure 门户中，导航到您的 **Storage Account**。

2. 在左侧菜单的 **Security + networking** 部分下选择 **Access keys**。
   <Image img={azureDataStoreSettings} size="lg" alt="Azure Data Store Settings" border/>

3. 选择 **key1** 或 **key2**，然后点击 **Show** 按钮（位于 **Connection string** 字段旁边）。
   <Image img={azureDataStoreAccessKeys} size="lg" alt="Azure Data Store Access Keys" border/>

4. 复制该连接字符串，稍后将在 azureBlobStorage 表函数中将其作为参数使用。

## 从 Azure Blob Storage 查询数据 \\{#querying-the-data-from-azure-blob-storage\\}

打开常用的 ClickHouse 查询控制台——可以是 ClickHouse Cloud
Web 界面、ClickHouse CLI 客户端，或任何用于运行查询的工具。准备好连接字符串和 ClickHouse 查询控制台之后，就可以开始直接从 Azure Blob Storage 查询数据。

在下面的示例中，我们查询存储在名为 data-container 的容器中、所有 JSON 文件里的数据：

```sql
SELECT * FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

如果您想将这些数据复制到本地 ClickHouse 表（例如 my&#95;table）中，
可以使用一条 `INSERT INTO ... SELECT` 语句：

```sql
INSERT INTO my_table
SELECT * FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

这使您能够高效地将外部数据导入 ClickHouse，而无需经过中间的 ETL 步骤。


## 使用 Environmental Sensors 数据集的简单示例 \\{#simple-example-using-the-environmental-sensors-dataset\\}

作为示例，我们将从 Environmental Sensors 数据集中下载一个文件。

1. 从 [Environmental Sensors 数据集](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors)
   下载一个[示例文件](https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/sensors/monthly/2019-06_bmp180.csv.zst)。

2. 在 Azure 门户中创建一个新的存储账户（如果尚未创建）。

:::warning
请确保已为存储账户启用 **Allow storage account key access**，否则将无法使用账户密钥访问数据。
:::

3. 在存储账户中创建一个新的容器。在本示例中，我们将其命名为 sensors。
   如果您使用的是现有容器，则可以跳过此步骤。

4. 将之前下载的 `2019-06_bmp180.csv.zst` 文件上传到该容器。

5. 按照前文描述的步骤获取 Azure Blob Storage 连接字符串。

现在一切就绪，您可以直接从 Azure Blob Storage 查询数据：

````sql
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
````


## 其他资源 \\{#additional-resources\\}

这只是对 azureBlobStorage 函数的基本介绍。要了解更高级的选项和配置细节，请参阅官方文档：

- [azureBlobStorage 表函数](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
- [输入和输出数据的格式](https://clickhouse.com/docs/sql-reference/formats)
- [从输入数据自动推断模式（schema）](https://clickhouse.com/docs/interfaces/schema-inference)