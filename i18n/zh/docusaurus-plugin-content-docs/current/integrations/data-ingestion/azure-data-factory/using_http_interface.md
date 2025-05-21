---
'sidebar_label': '使用 HTTP 接口'
'slug': '/integrations/azure-data-factory/http-interface'
'description': '使用 ClickHouse 的 HTTP 接口将数据从 Azure Data Factory 导入到 ClickHouse'
'keywords':
- 'azure data factory'
- 'azure'
- 'microsoft'
- 'data'
- 'http interface'
'title': '使用 ClickHouse HTTP 接口将 Azure 数据导入 ClickHouse'
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


# 在 Azure Data Factory 中使用 ClickHouse HTTP 接口 {#using-clickhouse-http-interface-in-azure-data-factory}

[`azureBlobStorage` 表函数](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
是一种快速便捷的方式，可将数据从 Azure Blob 存储引入到
ClickHouse。然而，因为以下原因，使用它可能并不总是合适：

- 您的数据可能并未存储在 Azure Blob 存储中，例如，它可能位于 Azure SQL 数据库、Microsoft SQL Server 或 Cosmos DB 中。
- 安全策略可能会完全阻止对 Blob 存储的外部访问，例如，如果存储帐户被锁定并且没有公共端点。

在这种情况下，您可以使用 Azure Data Factory 结合
[ClickHouse HTTP 接口](https://clickhouse.com/docs/interfaces/http)
将数据从 Azure 服务发送到 ClickHouse。

此方法逆转了流向：不是让 ClickHouse 从 Azure 中拉取数据，而是 Azure Data Factory 将数据推送到 ClickHouse。这种方法通常要求您的 ClickHouse 实例可以从公共互联网访问。

:::info
可以通过使用 Azure Data Factory 的自管理集成运行时来避免将 ClickHouse 实例暴露于互联网。此设置允许通过私有网络发送数据。然而，这超出了本文的范围。您可以在官方指南中找到更多信息：
[创建和配置自管理集成运行时](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
:::

## 将 ClickHouse 变成 REST 服务 {#turning-clickhouse-to-a-rest-service}

Azure Data Factory 支持通过 HTTP 以 JSON 格式将数据发送到外部系统。我们可以利用这一功能直接将数据插入到 ClickHouse 中，通过 [ClickHouse HTTP 接口](https://clickhouse.com/docs/interfaces/http)。
您可以在 [ClickHouse HTTP 接口文档](https://clickhouse.com/docs/interfaces/http) 中了解更多信息。

在这个例子中，我们只需要指定目标表，定义输入数据格式为 JSON，并包括选项以允许更灵活的时间戳解析。

```sql
INSERT INTO my_table
SETTINGS 
    date_time_input_format='best_effort',
    input_format_json_read_objects_as_strings=1
FORMAT JSONEachRow
```

要将此查询作为 HTTP 请求的一部分发送，您只需将其作为 URL 编码的字符串传递给 ClickHouse 端点中的查询参数：
```text
https://your-clickhouse-url.com?query=INSERT%20INTO%20my_table%20SETTINGS%20date_time_input_format%3D%27best_effort%27%2C%20input_format_json_read_objects_as_strings%3D1%20FORMAT%20JSONEachRow%0A
```

:::info
Azure Data Factory 可以使用其内置的 `encodeUriComponent` 函数自动处理此编码，因此您不必手动进行编码。
:::

现在您可以将 JSON 格式的数据发送到此 URL。数据应与目标表的结构匹配。以下是一个使用 curl 的简单示例，假设表中有三列：`col_1`，`col_2` 和 `col_3`。
```text
curl \
    -XPOST "https://your-clickhouse-url.com?query=<our_URL_encded_query>" \
    --data '{"col_1":9119,"col_2":50.994,"col_3":"2019-06-01 00:00:00"}'
```

您还可以发送对象的 JSON 数组或 JSON Lines（换行分隔的 JSON 对象）。Azure Data Factory 使用 JSON 数组格式，这与 ClickHouse 的 `JSONEachRow` 输入格式完美兼容。

如您所见，在此步骤中，您无需在 ClickHouse 端进行任何特别操作。HTTP 接口已经提供了作为 REST 类端点所需的一切，无需额外配置。

现在我们已经使 ClickHouse 像一个 REST 端点一样运行，是时候配置 Azure Data Factory 来使用它了。

接下来的步骤中，我们将创建一个 Azure Data Factory 实例，设置到您的 ClickHouse 实例的链接服务，定义一个用于
[REST sink](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest)的数据集，并创建一个复制数据活动以将数据从 Azure 发送到 ClickHouse。

## 创建 Azure Data Factory 实例 {#create-an-azure-data-factory-instance}

本指南假设您已访问 Microsoft Azure 帐户，并且您已经配置了订阅和资源组。如果您已经配置了 Azure Data Factory，则可以安全地跳过此步骤，使用您现有的服务继续下一步。

1. 登录到 [Microsoft Azure 门户](https://portal.azure.com/)，点击 **创建资源**。
   <Image img={azureHomePage} size="lg" alt="Azure Portal Home Page" border/>

2. 在左侧的分类窗格中，选择 **分析**，然后在常用服务列表中点击 **数据工厂**。
   <Image img={azureNewResourceAnalytics} size="lg" alt="Azure Portal New Resource" border/>

3. 选择您的订阅和资源组，为新的数据工厂实例输入名称，选择区域，并将版本保持为 V2。
   <Image img={azureNewDataFactory} size="lg" alt="Azure Portal New Data Factory" border/>

3. 点击 **审核 + 创建**，然后点击 **创建** 以启动部署。
   <Image img={azureNewDataFactoryConfirm} size="lg" alt="Azure Portal New Data Factory Confirm" border/>

   <Image img={azureNewDataFactorySuccess} size="lg" alt="Azure Portal New Data Factory Success" border/>

一旦部署成功完成，您可以开始使用新的 Azure Data Factory 实例。

## 创建新的基于 REST 的链接服务 {#-creating-new-rest-based-linked-service}

1. 登录到 Microsoft Azure 门户并打开您的数据工厂实例。
   <Image img={azureHomeWithDataFactory} size="lg" alt="Azure Portal Home Page with Data Factory" border/>

2. 在数据工厂概述页面上，点击 **启动工作室**。
   <Image img={azureDataFactoryPage} size="lg" alt="Azure Portal Data Factory Page" border/>

3. 在左侧菜单中，选择 **管理**，然后转到 **链接服务**，点击 **+ 新建** 创建一个新的链接服务。
   <Image img={adfCreateLinkedServiceButton} size="lg" alt="Azure Data Factory New Linked Service Button" border/>

4. 在 **新链接服务搜索框** 中，输入 **REST**，选择 **REST**，然后点击 **继续** 以创建 [REST 连接器](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest) 实例。
   <Image img={adfNewLinkedServiceSearch} size="lg" alt="Azure Data Factory New Linked Service Search" border/>

5. 在链接服务配置窗格中，为新服务输入名称，点击 **基础 URL** 字段，然后点击 **添加动态内容**（该链接仅在字段被选中时出现）。
   <Image img={adfNewLinedServicePane} size="lg" alt="New Lined Service Pane" border/>

6. 在动态内容窗格中，您可以创建一个参数化的 URL，这允许您在创建针对不同表的数据集时定义查询——这使链接服务可重用。
   <Image img={adfNewLinkedServiceBaseUrlEmpty} size="lg" alt="New Linked ServiceBase Url Empty" border/>

7. 点击过滤器输入旁边的 **"+"** 添加一个新参数，将其命名为 `pQuery`，将类型设置为字符串，并将默认值设置为 `SELECT 1`。点击 **保存**。
   <Image img={adfNewLinkedServiceParams} size="lg" alt="New Linked Service Parameters" border/>

8. 在表达式字段中输入以下内容并点击 **确定**。将 `your-clickhouse-url.com` 替换为您的 ClickHouse 实例的实际地址。
```text
   @{concat('https://your-clickhouse-url.com:8443/?query=', encodeUriComponent(linkedService().pQuery))}
```
   <Image img={adfNewLinkedServiceExpressionFieldFilled} size="lg" alt="New Linked Service Expression Field Filled" border/>

9. 回到主表单中选择基本身份验证，输入用于连接到 ClickHouse HTTP 接口的用户名和密码，点击 **测试连接**。如果一切配置正确，您将看到成功消息。
   <Image img={adfNewLinkedServiceCheckConnection} size="lg" alt="New Linked Service Check Connection" border/>

10. 点击 **创建** 完成设置。
    <Image img={adfLinkedServicesList} size="lg" alt="Linked Services List" border/>

您现在应该在列表中看到新注册的基于 REST 的链接服务。

## 创建新的 ClickHouse HTTP 接口数据集 {#creating-a-new-dataset-for-the-clickhouse-http-interface}

现在我们已经为 ClickHouse HTTP 接口配置了链接服务，我们可以创建一个数据集，Azure Data Factory 将使用它将数据发送到 ClickHouse。

在这个例子中，我们将插入小部分的 [环境传感器数据](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors)。

1. 打开您选择的 ClickHouse 查询控制台——这可以是 ClickHouse Cloud 的 web UI、CLI 客户端或您运行查询时使用的任何其他接口——并创建目标表：
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

2. 在 Azure Data Factory Studio 中，在左侧窗格中选择 **作者**。将鼠标悬停在数据集项上，点击三点图标，选择 **新建数据集**。
   <Image img={adfNewDatasetItem} size="lg" alt="New Dataset Item" border/>

3. 在搜索框中输入 **REST**，选择 **REST**，然后点击 **继续**。输入数据集名称并选择您在上一步创建的 **链接服务**。点击 **确定** 创建数据集。
   <Image img={adfNewDatasetPage} size="lg" alt="New Dataset Page" border/>

4. 现在您应该在左侧的工厂资源窗格中的数据集部分看到新创建的数据集。选择该数据集以打开其属性。您会看到在链接服务中定义的 `pQuery` 参数。点击 **值** 文本字段。然后点击 **添加动态** 内容。
   <Image img={adfNewDatasetProperties} size="lg" alt="New Dataset Properties" border/>

5. 在打开的窗格中，粘贴以下查询：
```sql
   INSERT INTO sensors
   SETTINGS 
       date_time_input_format=''best_effort'', 
       input_format_json_read_objects_as_strings=1 
   FORMAT JSONEachRow
```

   :::danger
   查询中的所有单引号 `'` 必须替换为两个单引号 `''`。这是 Azure Data Factory 的表达式解析器所需的。如果您不对其进行转义，您可能不会立即看到错误——但是在您尝试使用或保存数据集时会失败。例如，`'best_effort'` 必须写作 `''best_effort''`。
   :::

   <Image img={adfNewDatasetQuery} size="xl" alt="New Dataset Query" border/>

6. 点击 OK 保存表达式。点击测试连接。如果一切配置正确，您将看到连接成功消息。点击页面顶部的发布所有以保存更改。
   <Image img={adfNewDatasetConnectionSuccessful} size="xl" alt="New Dataset Connection Successful" border/>

### 设置示例数据集 {#setting-up-an-example-dataset}

在此示例中，我们将不使用完整的环境传感器数据集，而只是使用在
[传感器数据集示例](https://datasets-documentation.s3.eu-west-3.amazonaws.com/environmental/sensors.csv) 中提供的小子集。

:::info
为了使本指南更为集中，我们不会详细说明在 Azure Data Factory 中创建源数据集的确切步骤。您可以将示例数据上传到您选择的任何存储服务，例如 Azure Blob 存储、Microsoft SQL Server，或甚至是 Azure Data Factory 支持的其他文件格式。
:::

将数据集上传到您的 Azure Blob 存储（或其他首选存储服务）。然后，在 Azure Data Factory Studio 中，前往工厂资源窗格。创建一个指向上传数据的新数据集。点击发布所有以保存更改。

## 创建复制活动以将数据传输到 ClickHouse {#creating-the-copy-activity-to-transfer-data-to-clickhouse}

现在我们已配置输入和输出数据集，我们可以设置一个 **复制数据** 活动，以将数据从我们的示例数据集传输到 ClickHouse 中的 `sensors` 表。

1. 打开 **Azure Data Factory Studio**，转到 **作者选项卡**。在 **工厂资源** 窗格中，将鼠标悬停在 **管道** 上，点击三点图标，选择 **新建管道**。
   <Image img={adfNewPipelineItem} size="lg" alt="ADF New Pipeline Item" border/>

2. 在 **活动** 窗格中，展开 **移动和转换** 部分，将 **复制数据** 活动拖放到画布上。
   <Image img={adfNewCopyDataItem} size="lg" alt="New Copy DataItem" border/>

3. 选择 **源** 选项卡，选择您之前创建的源数据集。
   <Image img={adfCopyDataSource} size="lg" alt="Copy Data Source" border/>

4. 转到 **接收** 选项卡，选择为您的传感器表创建的 ClickHouse 数据集。将 **请求方法** 设置为 POST。确保 **HTTP 压缩类型** 设置为 **无**。
   :::warning
   HTTP 压缩在 Azure Data Factory 的复制数据活动中工作不正常。当启用时，Azure 仅发送一个仅包含零字节的有效负载——很可能是服务中的一个错误。务必保持压缩禁用。
   :::
   :::info
   我们建议保持默认批量大小 10,000，甚至进一步增加。有关详细信息，请参见
   [选择插入策略 / 如果是同步则批量插入](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous)。
   :::
   <Image img={adfCopyDataSinkSelectPost} size="lg" alt="Copy Data Sink Select Post" border/>

5. 点击画布顶部的 **调试** 以运行管道。在短暂等待后，活动将被排队并执行。如果一切配置正确，该任务应以 **成功** 状态完成。
   <Image img={adfCopyDataDebugSuccess} size="lg" alt="Copy Data Debug Success" border/>

6. 完成后，点击 **发布所有** 保存您的管道和数据集更改。

## 其他资源 {#additional-resources-1}
- [HTTP 接口](https://clickhouse.com/docs/interfaces/http)
- [使用 Azure Data Factory 从 REST 端点复制和转换数据](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest?tabs=data-factory)
- [选择插入策略](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy)
- [创建和配置自管理集成运行时](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
