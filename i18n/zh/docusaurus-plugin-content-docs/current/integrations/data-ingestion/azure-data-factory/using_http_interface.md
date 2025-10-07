---
'sidebar_label': '使用 HTTP 接口'
'slug': '/integrations/azure-data-factory/http-interface'
'description': '使用 ClickHouse 的 HTTP 接口将数据从 Azure Data Factory 导入 ClickHouse'
'keywords':
- 'azure data factory'
- 'azure'
- 'microsoft'
- 'data'
- 'http interface'
'title': '使用 ClickHouse HTTP 接口将 Azure 数据导入 ClickHouse'
'doc_type': 'guide'
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


# 使用 ClickHouse HTTP 接口在 Azure 数据工厂中 {#using-clickhouse-http-interface-in-azure-data-factory}

[`azureBlobStorage` 表函数](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
是将数据从 Azure Blob 存储快速便捷地导入 ClickHouse 的方法。然而，使用它可能并不总是合适，原因如下：

- 您的数据可能并未存储在 Azure Blob 存储中——例如，它可能在 Azure SQL Database、Microsoft SQL Server 或 Cosmos DB 中。
- 安全策略可能会完全阻止对 Blob 存储的外部访问——例如，如果存储帐户被锁定且没有公共终端。

在这种情况下，您可以结合使用 Azure 数据工厂和
[ClickHouse HTTP 接口](https://clickhouse.com/docs/interfaces/http) 
将数据从 Azure 服务发送到 ClickHouse。

这种方法反转了数据流：不是让 ClickHouse 从 Azure 拉取数据，而是由 Azure 数据工厂将数据推送到 ClickHouse。这种方法通常要求您的 ClickHouse 实例可从公共互联网访问。

:::info
您可以通过使用 Azure 数据工厂的自托管集成运行时避免将 ClickHouse 实例暴露于互联网。这种设置允许通过私有网络发送数据。然而，这超出了本文的范围。您可以在官方指南中找到更多信息：
[创建和配置自托管集成运行时](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
:::

## 将 ClickHouse 转变为 REST 服务 {#turning-clickhouse-to-a-rest-service}

Azure 数据工厂支持以 JSON 格式通过 HTTP 将数据发送到外部系统。我们可以利用此功能通过 [ClickHouse HTTP 接口](https://clickhouse.com/docs/interfaces/http) 将数据直接插入 ClickHouse。
您可以在 [ClickHouse HTTP 接口文档](https://clickhouse.com/docs/interfaces/http) 中了解更多信息。

在此示例中，我们只需指定目标表，将输入数据格式定义为 JSON，并包含选项以允许更灵活的时间戳解析。

```sql
INSERT INTO my_table
SETTINGS 
    date_time_input_format='best_effort',
    input_format_json_read_objects_as_strings=1
FORMAT JSONEachRow
```

要将此查询作为 HTTP 请求的一部分发送，您只需将其作为 URL 编码的字符串传递到 ClickHouse 端点中的查询参数：
```text
https://your-clickhouse-url.com?query=INSERT%20INTO%20my_table%20SETTINGS%20date_time_input_format%3D%27best_effort%27%2C%20input_format_json_read_objects_as_strings%3D1%20FORMAT%20JSONEachRow%0A
```

:::info
Azure 数据工厂可以使用其内置的 `encodeUriComponent` 函数自动处理此编码，因此您不必手动进行。
:::

现在您可以将格式为 JSON 的数据发送到此 URL。数据应与目标表的结构匹配。这里是一个使用 curl 的简单示例，假设表有三列：`col_1`、`col_2` 和 `col_3`。
```text
curl \
    -XPOST "https://your-clickhouse-url.com?query=<our_URL_encded_query>" \
    --data '{"col_1":9119,"col_2":50.994,"col_3":"2019-06-01 00:00:00"}'
```

您还可以发送 JSON 对象的数组，或 JSON Lines（换行分隔的 JSON 对象）。Azure 数据工厂使用 JSON 数组格式，这与 ClickHouse 的 `JSONEachRow` 输入完美兼容。

如您所见，在这一步中，您在 ClickHouse 侧不需要做任何特殊处理。HTTP 接口已经提供了作为 REST 风格端点所需的一切——无需额外配置。

现在我们已使 ClickHouse 像 REST 端点一样工作，是时候配置 Azure 数据工厂以使用它了。

在接下来的步骤中，我们将创建一个 Azure 数据工厂实例，设置与您的 ClickHouse 实例的链接服务，定义一个用于 [REST sink](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest) 的数据集，并创建一个 Copy Data 活动以将数据从 Azure 发送到 ClickHouse。

## 创建 Azure 数据工厂实例 {#create-an-azure-data-factory-instance}

本指南假设您拥有 Microsoft Azure 帐户的访问权限，并且您已经配置了订阅和资源组。如果您已配置 Azure 数据工厂，则可以安全跳过此步骤，直接使用您现有的服务进入下一步。

1. 登录到 [Microsoft Azure 门户](https://portal.azure.com/)，然后单击 **创建资源**。
   <Image img={azureHomePage} size="lg" alt="Azure Portal Home Page" border/>

2. 在左侧的类别面板中，选择 **分析**，然后在热门服务列表中单击 **数据工厂**。
   <Image img={azureNewResourceAnalytics} size="lg" alt="Azure Portal New Resource" border/>

3. 选择您的订阅和资源组，为新的数据工厂实例输入名称，选择区域并将版本保留为 V2。
   <Image img={azureNewDataFactory} size="lg" alt="Azure Portal New Data Factory" border/>

4. 单击 **审核 + 创建**，然后单击 **创建** 以启动部署。
   <Image img={azureNewDataFactoryConfirm} size="lg" alt="Azure Portal New Data Factory Confirm" border/>

   <Image img={azureNewDataFactorySuccess} size="lg" alt="Azure Portal New Data Factory Success" border/>

一旦部署成功完成，您可以开始使用新的 Azure 数据工厂实例。

## 创建新的基于 REST 的链接服务 {#-creating-new-rest-based-linked-service}

1. 登录到 Microsoft Azure 门户并打开您的数据工厂实例。
   <Image img={azureHomeWithDataFactory} size="lg" alt="Azure Portal Home Page with Data Factory" border/>

2. 在数据工厂概述页面上，单击 **启动工作室**。
   <Image img={azureDataFactoryPage} size="lg" alt="Azure Portal Data Factory Page" border/>

3. 在左侧菜单中选择 **管理**，然后转到 **链接服务**，单击 **+ 新建** 创建新的链接服务。
   <Image img={adfCreateLinkedServiceButton} size="lg" alt="Azure Data Factory New Linked Service Button" border/>

4. 在 **新建链接服务搜索栏** 中，输入 **REST**，选择 **REST**，然后单击 **继续** 创建 [REST 连接器](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest) 实例。
   <Image img={adfNewLinkedServiceSearch} size="lg" alt="Azure Data Factory New Linked Service Search" border/>

5. 在链接服务配置面板中输入新服务的名称，单击 **基本 URL** 字段，然后单击 **添加动态内容**（此链接仅在选择字段时出现）。
   <Image img={adfNewLinedServicePane} size="lg" alt="New Lined Service Pane" border/>

6. 在动态内容面板中，您可以创建一个参数化的 URL，这使您能够在为不同表创建数据集时定义查询——这使链接服务可重用。
   <Image img={adfNewLinkedServiceBaseUrlEmpty} size="lg" alt="New Linked ServiceBase Url Empty" border/>

7. 单击过滤输入旁边的 **"+"**，添加一个新参数，命名为 `pQuery`，将类型设置为字符串，并将默认值设置为 `SELECT 1`。然后单击 **保存**。
   <Image img={adfNewLinkedServiceParams} size="lg" alt="New Linked Service Parameters" border/>

8. 在表达式字段中输入以下内容并单击 **确定**。用您实际的 ClickHouse 实例地址替换 `your-clickhouse-url.com`。
```text
@{concat('https://your-clickhouse-url.com:8443/?query=', encodeUriComponent(linkedService().pQuery))}
```
   <Image img={adfNewLinkedServiceExpressionFieldFilled} size="lg" alt="New Linked Service Expression Field Filled" border/>

9. 返回主表单，选择基本认证，输入用于连接您的 ClickHouse HTTP 接口的用户名和密码，单击 **测试连接**。如果一切配置正确，您会看到成功消息。
   <Image img={adfNewLinkedServiceCheckConnection} size="lg" alt="New Linked Service Check Connection" border/>

10. 单击 **创建** 完成设置。
    <Image img={adfLinkedServicesList} size="lg" alt="Linked Services List" border/>

现在您应该在列表中看到新注册的基于 REST 的链接服务。

## 为 ClickHouse HTTP 接口创建新数据集 {#creating-a-new-dataset-for-the-clickhouse-http-interface}

现在我们已经为 ClickHouse HTTP 接口配置了链接服务，可以创建一个数据集，Azure 数据工厂将用其向 ClickHouse 发送数据。

在这个示例中，我们将插入一小部分 [环境传感器数据](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors)。

1. 打开您选择的 ClickHouse 查询控制台——这可以是 ClickHouse Cloud Web UI、CLI 客户端或您用来运行查询的其他界面——并创建目标表：
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

2. 在 Azure 数据工厂 Studio 中，在左侧面板中选择作者。将鼠标悬停在数据集项上，单击三点图标，然后选择新建数据集。
   <Image img={adfNewDatasetItem} size="lg" alt="New Dataset Item" border/>

3. 在搜索栏中输入 **REST**，选择 **REST**，然后单击 **继续**。为您的数据集输入名称，并选择您在上一步中创建的 **链接服务**。单击 **确定** 创建数据集。
   <Image img={adfNewDatasetPage} size="lg" alt="New Dataset Page" border/>

4. 现在，您应该在左侧的工厂资源面板中的数据集部分下看到您新创建的数据集。选择该数据集以打开其属性。您将看到在链接服务中定义的 `pQuery` 参数。单击 **值** 文本字段。然后单击 **添加动态** 内容。
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
   查询中的所有单引号 `'` 必须替换为两个单引号 `''`。这是 Azure 数据工厂的表达式解析器的要求。如果您不对其进行转义，您可能不会立即看到错误——但在尝试使用或保存数据集时会失败。例如，`'best_effort'` 必须写为 `''best_effort''`。
   :::

   <Image img={adfNewDatasetQuery} size="xl" alt="New Dataset Query" border/>

6. 单击确定以保存表达式。单击测试连接。如果一切配置正确，您将看到连接成功的消息。单击页面顶部的发布所有以保存您的更改。
   <Image img={adfNewDatasetConnectionSuccessful} size="xl" alt="New Dataset Connection Successful" border/>

### 设置示例数据集 {#setting-up-an-example-dataset}

在此示例中，我们将不使用完整的环境传感器数据集，而只使用可用的 [传感器数据集示例](https://datasets-documentation.s3.eu-west-3.amazonaws.com/environmental/sensors.csv) 的小子集。

:::info
为了使本指南集中，我们将不详细说明在 Azure 数据工厂中创建源数据集的确切步骤。您可以将样本数据上传到您选择的任何存储服务——例如，Azure Blob 存储、Microsoft SQL Server，甚至是 Azure 数据工厂支持的其他文件格式。
:::

将数据集上传到您的 Azure Blob 存储（或其他首选存储服务）中，然后在 Azure 数据工厂 Studio 中转到工厂资源面板。创建一个指向已上传数据的新数据集。单击发布所有以保存您的更改。

## 创建 Copy 活动以将数据传输到 ClickHouse {#creating-the-copy-activity-to-transfer-data-to-clickhouse}

现在我们已经配置了输入和输出数据集，可以设置 **Copy Data** 活动，将数据从示例数据集传输到 ClickHouse 中的 `sensors` 表。

1. 打开 **Azure 数据工厂 Studio**，转到 **作者选项卡**。在 **工厂资源** 面板中，将鼠标悬停在 **管道** 上，单击三点图标，然后选择 **新建管道**。
   <Image img={adfNewPipelineItem} size="lg" alt="ADF New Pipeline Item" border/>

2. 在 **活动** 面板中，展开 **移动和转换** 部分，然后将 **Copy Data** 活动拖到画布上。
   <Image img={adfNewCopyDataItem} size="lg" alt="New Copy DataItem" border/>

3. 选择 **来源** 选项卡，然后选择您之前创建的源数据集。
   <Image img={adfCopyDataSource} size="lg" alt="Copy Data Source" border/>

4. 转到 **接收方** 选项卡，选择为您的传感器表创建的 ClickHouse 数据集。将 **请求方法** 设置为 POST。确保 **HTTP 压缩类型** 设置为 **无**。
   :::warning
   在 Azure 数据工厂的 Copy Data 活动中，HTTP 压缩不能正常工作。当启用时，Azure 仅发送包含零字节的有效负载——这可能是服务中的一个错误。请确保将压缩禁用。
   :::
   :::info
   我们建议保留默认批量大小 10,000，甚至进一步增加。如果需要更多详细信息，请参见 [选择插入策略 / 如果同步则批量插入](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous)。
   :::
   <Image img={adfCopyDataSinkSelectPost} size="lg" alt="Copy Data Sink Select Post" border/>

5. 单击画布顶部的 **调试** 运行管道。稍等片刻，活动将被排队并执行。如果一切配置正确，任务应以 **成功** 状态完成。
   <Image img={adfCopyDataDebugSuccess} size="lg" alt="Copy Data Debug Success" border/>

6. 完成后，单击 **发布所有** 以保存您的管道和数据集更改。

## 其他资源 {#additional-resources-1}
- [HTTP 接口](https://clickhouse.com/docs/interfaces/http)
- [使用 Azure 数据工厂从 REST 端点复制和转换数据](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest?tabs=data-factory)
- [选择插入策略](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy)
- [创建和配置自托管集成运行时](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
