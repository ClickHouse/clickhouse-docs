---
sidebar_label: '使用 azureBlobStorage 表函数'
slug: /integrations/azure-data-factory/table-function
description: '使用 ClickHouse 的 azureBlobStorage 表函数'
keywords: ['azure data factory', 'azure', 'microsoft', 'data', 'azureBlobStorage']
title: '使用 ClickHouse 的 azureBlobStorage 表函数将 Azure 数据引入 ClickHouse'
doc_type: 'guide'
integration:
   - support_level: 'core'
   - category: 'data_ingestion'
---

import Image from '@theme/IdealImage';
import azureDataStoreSettings                   from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-settings.png';
import azureDataStoreAccessKeys                 from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-access-keys.png';


# 使用 ClickHouse 的 azureBlobStorage 表函数 \{#using-azureBlobStorage-function\}

这是将数据从 Azure Blob Storage 或 Azure Data Lake Storage 复制到 ClickHouse 的最高效、最直接的方法之一。借助这个表函数，可以让 ClickHouse 直接连接到 Azure 存储，并按需读取数据。

它提供了类似表的接口，使你可以直接从源端执行查询、插入和过滤操作。该函数经过高度优化，并支持许多广泛使用的文件格式，包括 `CSV`、`JSON`、`Parquet`、`Arrow`、`TSV`、`ORC`、`Avro` 等。完整列表请参阅 ["Data formats"](/interfaces/formats)。

在本节中，我们将通过一个简单的入门示例，演示如何从 Azure Blob Storage 向 ClickHouse 传输数据，并说明高效使用该函数时的一些重要注意事项。若需了解更多详细信息和高级选项，请参阅官方文档：
[`azureBlobStorage` Table Function documentation page](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)

## 获取 Azure Blob Storage 访问密钥 \{#acquiring-azure-blob-storage-access-keys\}

要让 ClickHouse 访问你的 Azure Blob Storage，你需要一个带有访问密钥的连接字符串。

1. 在 Azure 门户中，进入你的 **Storage Account（存储帐户）**。

2. 在左侧菜单中，在 **Security + networking（安全性 + 网络）** 部分下选择 **Access keys（访问密钥）**。
   <Image img={azureDataStoreSettings} size="lg" alt="Azure Data Store Settings" border/>

3. 选择 **key1** 或 **key2**，然后点击 **Connection string（连接字符串）** 字段旁边的 **Show** 按钮。
   <Image img={azureDataStoreAccessKeys} size="lg" alt="Azure Data Store Access Keys" border/>

4. 复制该连接字符串——你将把它作为参数用于 azureBlobStorage 表函数。

## 从 Azure Blob Storage 查询数据 \{#querying-the-data-from-azure-blob-storage\}

打开常用的 ClickHouse 查询控制台——可以是 ClickHouse Cloud
的 Web 界面、ClickHouse CLI 客户端，或您用于运行
查询的任何其他工具。准备好连接字符串并打开 ClickHouse 查询控制台后，您就可以开始直接从 Azure Blob Storage 查询数据。

在下面的示例中，我们将查询存储在名为 data-container 的
容器中所有 JSON 文件里的数据：

```sql
SELECT * FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

如果您希望将这些数据复制到本地 ClickHouse 表（例如 my&#95;table），
可以使用 `INSERT INTO ... SELECT` 语句：

```sql
INSERT INTO my_table
SELECT * FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

这样即可高效地将外部数据拉取到 ClickHouse，而无需额外的 ETL 中间步骤。


## 使用 Environmental Sensors 数据集的简单示例 \{#simple-example-using-the-environmental-sensors-dataset\}

作为示例，我们将从 Environmental Sensors 数据集中下载单个文件。

1. 从 [Environmental Sensors Dataset](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors) 中下载一个[示例文件](https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/sensors/monthly/2019-06_bmp180.csv.zst)。

2. 在 Azure Portal 中，如果您还没有存储帐户，请创建一个新的存储帐户。

:::warning
请确保为您的存储帐户启用了 **Allow storage account key access**，否则您将无法使用帐户密钥访问数据。
:::

3. 在您的存储帐户中创建一个新的 container。在此示例中，我们将其命名为 sensors。
   如果您正在使用现有的 container，可以跳过此步骤。

4. 将之前下载的 `2019-06_bmp180.csv.zst` 文件上传到该 container。

5. 按照前文描述的步骤获取 Azure Blob Storage 的连接字符串。

现在一切准备就绪，您可以直接从 Azure Blob Storage 中查询数据：

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

7. 要将数据加载到表中，请先创建一个原始数据集所用 schema 的简化版本：
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
若要了解在查询 Azure Blob Storage 等外部源时的配置选项以及 schema 推断的更多信息，请参阅[从输入数据自动推断 schema](https://clickhouse.com/docs/interfaces/schema-inference)
:::

8. 现在将 Azure Blob Storage 中的数据插入到 sensors 表中：
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

现在，存储在 Azure Blob Storage 中的 `2019-06_bmp180.csv.zst` 文件里的数据已经写入 sensors 表中。


## 其他资源 \{#additional-resources\}

这只是关于使用 azureBlobStorage 函数的基础介绍。要了解更高级的选项和配置细节，请参阅官方文档：

- [azureBlobStorage 表函数](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
- [输入和输出数据格式](https://clickhouse.com/docs/sql-reference/formats)
- [从输入数据自动推断模式](https://clickhouse.com/docs/interfaces/schema-inference)