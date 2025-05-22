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

# 在 Azure Data Factory 中使用 ClickHouse HTTP 接口 {#using-clickhouse-http-interface-in-azure-data-factory}

[`azureBlobStorage` 表函数](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage) 是一种快速便捷的方法，可以将数据从 Azure Blob 存储导入到 ClickHouse。然而，使用此方法可能并不总是合适，原因包括：

- 你的数据可能并未存储在 Azure Blob 存储中——例如，它可能存在于 Azure SQL 数据库、Microsoft SQL Server 或 Cosmos DB 中。
- 安全策略可能完全阻止对 Blob 存储的外部访问——例如，如果存储帐户被锁定且没有公共终端。

在这种情况下，你可以使用 Azure Data Factory 和 [ClickHouse HTTP 接口](https://clickhouse.com/docs/interfaces/http) 将数据从 Azure 服务发送到 ClickHouse。

这种方法反转了数据流：Azure Data Factory 将数据推送到 ClickHouse，而不是让 ClickHouse 从 Azure 拉取数据。这种方法通常要求你的 ClickHouse 实例可以从公共互联网访问。

:::info
通过使用 Azure Data Factory 的自托管集成运行时，可以避免将 ClickHouse 实例暴露于互联网。此设置允许通过私有网络发送数据。然而，这超出了本文的范围。你可以在官方指南中找到更多信息：
[创建和配置一个自托管的集成运行时](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
:::

## 将 ClickHouse 转变为 REST 服务 {#turning-clickhouse-to-a-rest-service}

Azure Data Factory 支持通过 HTTP 以 JSON 格式发送数据到外部系统。我们可以利用此能力直接将数据插入到 ClickHouse 中，使用 [ClickHouse HTTP 接口](https://clickhouse.com/docs/interfaces/http)。你可以在 [ClickHouse HTTP 接口文档](https://clickhouse.com/docs/interfaces/http) 中了解更多。

在这个示例中，我们只需要指定目标表，定义输入数据格式为 JSON，并包括允许更灵活的时间戳解析的选项。

```sql
INSERT INTO my_table
SETTINGS 
    date_time_input_format='best_effort',
    input_format_json_read_objects_as_strings=1
FORMAT JSONEachRow
```

要将此查询作为 HTTP 请求的一部分发送，只需将其作为 URL 编码的字符串传递给 ClickHouse 端点中的查询参数：
```text
https://your-clickhouse-url.com?query=INSERT%20INTO%20my_table%20SETTINGS%20date_time_input_format%3D%27best_effort%27%2C%20input_format_json_read_objects_as_strings%3D1%20FORMAT%20JSONEachRow%0A
```

:::info
Azure Data Factory 可以使用其内置的 `encodeUriComponent` 函数自动处理此编码，因此你不必手动执行。
:::

现在你可以将格式为 JSON 的数据发送到此 URL。数据应符合目标表的结构。以下是一个简单的示例，使用 curl，假设表有三列：`col_1`、`col_2` 和 `col_3`。
```text
curl \
    -XPOST "https://your-clickhouse-url.com?query=<our_URL_encded_query>" \
    --data '{"col_1":9119,"col_2":50.994,"col_3":"2019-06-01 00:00:00"}'
```

你还可以发送一个 JSON 对象的数组，或者 JSON Lines（换行分隔的 JSON 对象）。Azure Data Factory 使用 JSON 数组格式，与 ClickHouse 的 `JSONEachRow` 输入完美兼容。

如你所见，在此步骤中，你不需要在 ClickHouse 方面做任何特殊的事情。HTTP 接口已经提供了一切所需的功能，可以充当 REST 风格的端点——无需额外配置。

现在我们已将 ClickHouse 配置为 REST 端点，接下来是配置 Azure Data Factory 使用它。

在接下来的步骤中，我们将创建一个 Azure Data Factory 实例，设置到你的 ClickHouse 实例的 Linked Service，定义用于 [REST 接收器](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest) 的 Dataset，并创建一个 Copy Data 活动以将数据从 Azure 发送到 ClickHouse。

## 创建 Azure Data Factory 实例 {#create-an-azure-data-factory-instance}

本指南假定你可以访问 Microsoft Azure 帐户，并且已经配置了订阅和资源组。如果你已经配置了 Azure Data Factory，则可以安全跳过此步骤，使用你现有的服务。

1. 登录到 [Microsoft Azure 门户](https://portal.azure.com/)，并点击 **创建资源**。
   <Image img={azureHomePage} size="lg" alt="Azure Portal Home Page" border/>

2. 在左侧类目窗格中，选择 **分析**，然后在热门服务列表中点击 **数据工厂**。
   <Image img={azureNewResourceAnalytics} size="lg" alt="Azure Portal New Resource" border/>

3. 选择你的订阅和资源组，输入新数据工厂实例的名称，选择区域并将版本保持为 V2。
   <Image img={azureNewDataFactory} size="lg" alt="Azure Portal New Data Factory" border/>

3. 点击 **查看 + 创建**，然后点击 **创建** 开始部署。
   <Image img={azureNewDataFactoryConfirm} size="lg" alt="Azure Portal New Data Factory Confirm" border/>

   <Image img={azureNewDataFactorySuccess} size="lg" alt="Azure Portal New Data Factory Success" border/>

部署成功完成后，你可以开始使用你新的 Azure Data Factory 实例。

## 创建新的基于 REST 的 Linked Service {#-creating-new-rest-based-linked-service}

1. 登录到 Microsoft Azure 门户并打开你的数据工厂实例。
   <Image img={azureHomeWithDataFactory} size="lg" alt="Azure Portal Home Page with Data Factory" border/>

2. 在数据工厂概览页面上，点击 **启动工作室**。
   <Image img={azureDataFactoryPage} size="lg" alt="Azure Portal Data Factory Page" border/>

3. 在左侧菜单中，选择 **管理**，然后转到 **Linked services**，点击 **+ 新建** 创建一个新的 linked service。
   <Image img={adfCreateLinkedServiceButton} size="lg" alt="Azure Data Factory New Linked Service Button" border/>

4. 在 **新建 linked service 搜索栏** 中，输入 **REST**，选择 **REST**，然后点击 **继续** 创建 [REST 连接器](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest) 实例。
   <Image img={adfNewLinkedServiceSearch} size="lg" alt="Azure Data Factory New Linked Service Search" border/>

5. 在 Linked Service 配置窗格中输入你的新服务的名称，点击 **基本 URL** 字段，然后点击 **添加动态内容**（此链接仅在选定字段时出现）。
   <Image img={adfNewLinedServicePane} size="lg" alt="New Lined Service Pane" border/>

6. 在动态内容窗格中，你可以创建一个参数化的 URL，这允许你在为不同表创建数据集时稍后定义查询——这使得 linked service 可重用。
   <Image img={adfNewLinkedServiceBaseUrlEmpty} size="lg" alt="New Linked ServiceBase Url Empty" border/>

7. 点击过滤输入框旁的 **"+"** 并添加一个新参数，将其命名为 `pQuery`，将类型设置为字符串，并将默认值设置为 `SELECT 1`。点击 **保存**。
   <Image img={adfNewLinkedServiceParams} size="lg" alt="New Linked Service Parameters" border/>

8. 在表达式字段中输入以下内容并点击 **确定**。用你实际的 ClickHouse 实例地址替换 `your-clickhouse-url.com`。
```text
@{concat('https://your-clickhouse-url.com:8443/?query=', encodeUriComponent(linkedService().pQuery))}
```
   <Image img={adfNewLinkedServiceExpressionFieldFilled} size="lg" alt="New Linked Service Expression Field Filled" border/>

9. 返回主表单，选择基本身份验证，输入用于连接到 ClickHouse HTTP 接口的用户名和密码，点击 **测试连接**。如果一切配置正确，你将看到成功消息。
   <Image img={adfNewLinkedServiceCheckConnection} size="lg" alt="New Linked Service Check Connection" border/>

10. 点击 **创建** 完成设置。
    <Image img={adfLinkedServicesList} size="lg" alt="Linked Services List" border/>

现在你应该在列表中看到新注册的基于 REST 的 linked service。

## 为 ClickHouse HTTP 接口创建新的数据集 {#creating-a-new-dataset-for-the-clickhouse-http-interface}

现在我们已为 ClickHouse HTTP 接口配置了 linked service，我们可以创建一个数据集，Azure Data Factory 将使用它向 ClickHouse 发送数据。

在这个示例中，我们将插入一小部分 [环境传感器数据](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors)。

1. 打开你选择的 ClickHouse 查询控制台——这可以是 ClickHouse Cloud 网络 UI、CLI 客户端或你用于运行查询的任何其他接口——并创建目标表：
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

2. 在 Azure Data Factory Studio 中，选中左侧窗格中的作者选项。将鼠标悬停在数据集项上，点击三点图标，选择新建数据集。
   <Image img={adfNewDatasetItem} size="lg" alt="New Dataset Item" border/>

3. 在搜索栏中输入 **REST**，选择 **REST**，然后点击 **继续**。输入数据集的名称，选择在上一步中创建的 **linked service**。点击 **确定** 创建数据集。
   <Image img={adfNewDatasetPage} size="lg" alt="New Dataset Page" border/>

4. 现在你应该在左侧的工厂资源面板中看到刚创建的数据集。选择数据集以打开其属性。你将看到在 linked service 中定义的 `pQuery` 参数。点击 **值** 文本字段，然后点击 **添加动态** 内容。
   <Image img={adfNewDatasetProperties} size="lg" alt="New Dataset Properties" border/>

5. 在打开的面板中，粘贴以下查询：
```sql
INSERT INTO sensors
SETTINGS 
    date_time_input_format=''best_effort'', 
    input_format_json_read_objects_as_strings=1 
FORMAT JSONEachRow
```

   :::danger
   查询中的所有单引号 `'` 必须替换为两个单引号 `''`。这是 Azure Data Factory 的表达式解析器所要求的。如果不进行转义，你可能不会立即看到错误——但在你尝试使用或保存数据集时，会失败。例如，`'best_effort'` 必须写成 `''best_effort''`。
   :::

   <Image img={adfNewDatasetQuery} size="xl" alt="New Dataset Query" border/>

6. 点击确定以保存表达式。点击测试连接。如果一切配置正确，你将看到连接成功消息。点击页面顶部的“发布所有”以保存你的更改。
   <Image img={adfNewDatasetConnectionSuccessful} size="xl" alt="New Dataset Connection Successful" border/>

### 设置示例数据集 {#setting-up-an-example-dataset}

在这个示例中，我们不会使用完整的环境传感器数据集，而只是使用一个可在 [传感器数据集示例](https://datasets-documentation.s3.eu-west-3.amazonaws.com/environmental/sensors.csv) 中找到的小子集。

:::info
为了使本指南更集中，我们将不深入讨论在 Azure Data Factory 中创建源数据集的确切步骤。你可以将示例数据上传到你选择的任何存储服务——例如，Azure Blob 存储、Microsoft SQL Server，甚至是 Azure Data Factory 支持的不同文件格式。
:::

将数据集上传到 Azure Blob 存储（或其他首选的存储服务），然后在 Azure Data Factory Studio 中，转到工厂资源窗格。创建一个指向上传数据的新数据集。点击“发布所有”以保存更改。

## 创建 Copy 活动将数据传输到 ClickHouse {#creating-the-copy-activity-to-transfer-data-to-clickhouse}

现在我们已经配置了输入和输出数据集，我们可以设置一个 **Copy Data** 活动以将数据从示例数据集传输到 ClickHouse 中的 `sensors` 表。

1. 打开 **Azure Data Factory Studio**，进入 **作者选项卡**。在 **工厂资源** 面板中，将鼠标悬停在 **管道** 上，点击三点图标，选择 **新建管道**。
   <Image img={adfNewPipelineItem} size="lg" alt="ADF New Pipeline Item" border/>

2. 在 **活动** 面板中，展开 **移动和转换** 部分，将 **复制数据** 活动拖到画布上。
   <Image img={adfNewCopyDataItem} size="lg" alt="New Copy DataItem" border/>

3. 选择 **源** 选项卡，选择你之前创建的源数据集。
   <Image img={adfCopyDataSource} size="lg" alt="Copy Data Source" border/>

4. 转到 **接收端** 选项卡，选择为你的传感器表创建的 ClickHouse 数据集。将 **请求方法** 设置为 POST。确保 **HTTP 压缩类型** 设置为 **无**。
   :::warning
   在 Azure Data Factory 的 Copy Data 活动中，HTTP 压缩无法正确工作。当启用时，Azure 只会发送一个有效负载，仅包含零字节——这可能是服务中的一个错误。确保将压缩保持为禁用状态。
   :::
   :::info
   我们建议保持默认批量大小 10,000，甚至进一步提高。有关更多详细信息，请参见 [选择插入策略 / 批量插入（如果同步）](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous)。
   :::
   <Image img={adfCopyDataSinkSelectPost} size="lg" alt="Copy Data Sink Select Post" border/>

5. 点击画布顶部的 **调试** 以运行管道。稍等片刻，活动将被排队并执行。如果一切配置正确，任务应该以 **成功** 状态完成。
   <Image img={adfCopyDataDebugSuccess} size="lg" alt="Copy Data Debug Success" border/>

6. 完成后，点击 **发布所有** 以保存你的管道和数据集更改。

## 其他资源 {#additional-resources-1}
- [HTTP 接口](https://clickhouse.com/docs/interfaces/http)
- [使用 Azure Data Factory 从 REST 端点复制和转换数据](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest?tabs=data-factory)
- [选择插入策略](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy)
- [创建和配置一个自托管集成运行时](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
