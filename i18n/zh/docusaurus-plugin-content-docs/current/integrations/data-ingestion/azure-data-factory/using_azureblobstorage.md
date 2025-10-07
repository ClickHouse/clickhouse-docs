---
'sidebar_label': '使用 azureBlobStorage 表函数'
'slug': '/integrations/azure-data-factory/table-function'
'description': '使用 ClickHouse 的 azureBlobStorage 表函数'
'keywords':
- 'azure data factory'
- 'azure'
- 'microsoft'
- 'data'
- 'azureBlobStorage'
'title': '使用 ClickHouse 的 azureBlobStorage 表函数将 Azure 数据引入 ClickHouse'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import azureDataStoreSettings                   from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-settings.png';
import azureDataStoreAccessKeys                 from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-access-keys.png';


# 使用 ClickHouse 的 azureBlobStorage 表函数 {#using-azureBlobStorage-function}

这是从 Azure Blob Storage 或 Azure Data Lake Storage 复制数据到 ClickHouse 的最有效且简单的方式之一。使用此表函数，您可以指示 ClickHouse 直接连接到 Azure 存储并按需读取数据。

它提供了一个表格般的接口，允许您直接从源中选择、插入和过滤数据。该函数经过高度优化，支持许多广泛使用的文件格式，包括 `CSV`、`JSON`、`Parquet`、`Arrow`、`TSV`、`ORC`、`Avro` 等。有关完整列表，请参阅 ["数据格式"](/interfaces/formats)。

在本节中，我们将逐步介绍从 Azure Blob Storage 向 ClickHouse 传输数据的简单入门指南，以及有效使用此函数的注意事项。有关更多详细信息和高级选项，请参考官方文档：
[`azureBlobStorage` 表函数文档页面](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)

## 获取 Azure Blob Storage 访问密钥 {#acquiring-azure-blob-storage-access-keys}

要允许 ClickHouse 访问您的 Azure Blob Storage，您需要一个包含访问密钥的连接字符串。

1. 在 Azure 门户中，导航到您的 **存储账户**。

2. 在左侧菜单中，选择 **访问密钥**，位于 **安全性 + 网络** 部分。
   <Image img={azureDataStoreSettings} size="lg" alt="Azure Data Store Settings" border/>

3. 选择 **key1** 或 **key2**，然后单击 **连接字符串** 字段旁边的 **显示** 按钮。
   <Image img={azureDataStoreAccessKeys} size="lg" alt="Azure Data Store Access Keys" border/>

4. 复制连接字符串——您将在 azureBlobStorage 表函数中将其用作参数。

## 从 Azure Blob Storage 查询数据 {#querying-the-data-from-azure-blob-storage}

打开您喜欢的 ClickHouse 查询控制台——这可以是 ClickHouse Cloud 网络界面、ClickHouse CLI 客户端或您用来运行查询的任何其他工具。一旦您准备好连接字符串和 ClickHouse 查询控制台，您就可以开始直接从 Azure Blob Storage 查询数据。

在以下示例中，我们查询存储在名为 data-container 的容器中的 JSON 文件中的所有数据：

```sql
SELECT * FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

如果您想将该数据复制到本地 ClickHouse 表（例如 my_table）中，可以使用 `INSERT INTO ... SELECT` 语句：

```sql
INSERT INTO my_table
SELECT * FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

这使您能够高效地将外部数据拉入 ClickHouse，而无需中间的 ETL 步骤。

## 使用环境传感器数据集的简单示例 {#simple-example-using-the-environmental-sensors-dataset}

作为示例，我们将从环境传感器数据集中下载一个文件。

1. 从 [环境传感器数据集](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors) 下载一个 [示例文件](https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/sensors/monthly/2019-06_bmp180.csv.zst)。

2. 在 Azure 门户中，如果您还没有存储账户，请创建一个新的存储账户。

:::warning
确保您的存储账户启用了 **允许存储账户密钥访问**，否则您将无法使用账户密钥访问数据。
:::

3. 在您的存储账户中创建一个新容器。在此示例中，我们将其命名为 sensors。如果您使用的是现有的容器，可以跳过此步骤。

4. 将之前下载的 `2019-06_bmp180.csv.zst` 文件上传到容器中。

5. 按照前面描述的步骤获取 Azure Blob Storage 连接字符串。

现在一切都已设置完成，您可以直接从 Azure Blob Storage 查询数据：

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

7. 为了将数据加载到表中，请创建一个简化版本的原始数据集所使用的模式：
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
有关查询外部源（如 Azure Blob Storage）时的配置选项和模式推断的更多信息，请参见 [从输入数据自动推断模式](https://clickhouse.com/docs/interfaces/schema-inference)。
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

您的 sensors 表现在已填充来自 Azure Blob Storage 中的 `2019-06_bmp180.csv.zst` 文件的数据。

## 其他资源 {#additional-resources}

这只是使用 azureBlobStorage 函数的基本介绍。有关更高级的选项和配置细节，请参阅官方文档：

- [azureBlobStorage 表函数](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
- [输入和输出数据的格式](https://clickhouse.com/docs/sql-reference/formats)
- [从输入数据自动推断模式](https://clickhouse.com/docs/interfaces/schema-inference)
