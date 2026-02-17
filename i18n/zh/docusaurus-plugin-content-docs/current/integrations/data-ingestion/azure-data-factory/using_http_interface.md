---
sidebar_label: '使用 HTTP 接口'
slug: /integrations/azure-data-factory/http-interface
description: '使用 ClickHouse 的 HTTP 接口将 Azure Data Factory 中的数据导入 ClickHouse'
keywords: ['Azure Data Factory', 'Azure', 'Microsoft', '数据', 'HTTP 接口']
title: '使用 ClickHouse HTTP 接口将 Azure 数据导入 ClickHouse'
doc_type: 'guide'
integration:
   - support_level: 'core'
   - category: 'data_ingestion'
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


# 在 Azure Data Factory 中使用 ClickHouse HTTP 接口 \{#using-clickhouse-http-interface-in-azure-data-factory\}

[`azureBlobStorage` 表函数](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
是一种将 Azure Blob Storage 中的数据摄取到
ClickHouse 的快速且便捷的方式。但在以下情况下，它可能并不适用：

- 数据可能并未存储在 Azure Blob Storage 中——例如，可能位于 Azure SQL Database、Microsoft SQL Server 或 Cosmos DB 中。
- 安全策略可能完全禁止对 Blob Storage 的外部访问——例如，存储账户被锁定且没有公共终结点。

在这种情况下，可以将 Azure Data Factory 与
[ClickHouse HTTP 接口](https://clickhouse.com/docs/interfaces/http)
结合使用，将 Azure 服务中的数据发送到 ClickHouse。

这种方法反转了数据流向：不再由 ClickHouse 从 Azure 拉取数据，
而是由 Azure Data Factory 将数据推送到 ClickHouse。此方式通常要求 ClickHouse 实例能够从公网访问。

:::info
可以通过使用 Azure Data Factory 的自托管集成运行时（Self-hosted Integration Runtime），避免将 ClickHouse 实例暴露到互联网。此设置允许通过专用/私有网络发送数据。不过，这超出了本文的讨论范围。你可以在官方指南中找到更多信息：
[Create and configure a self-hosted integration
runtime](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
:::

## 将 ClickHouse 暴露为 REST 服务 \{#turning-clickhouse-to-a-rest-service\}

Azure Data Factory 支持以 JSON 格式通过 HTTP 向外部系统发送数据。我们可以利用此功能，通过 [ClickHouse HTTP 接口](https://clickhouse.com/docs/interfaces/http) 将数据直接插入 ClickHouse。更多信息参见 [ClickHouse HTTP Interface 文档](https://clickhouse.com/docs/interfaces/http)。

在本示例中，我们只需要指定目标表，将输入数据格式定义为 JSON，并包含一些选项，以支持更灵活的时间戳解析。

```sql
INSERT INTO my_table
SETTINGS 
    date_time_input_format='best_effort',
    input_format_json_read_objects_as_strings=1
FORMAT JSONEachRow
```

要通过 HTTP 请求发送此查询，只需将其作为 URL 编码后的字符串传递给 ClickHouse 端点中的 `query` 参数：

```text
https://your-clickhouse-url.com?query=INSERT%20INTO%20my_table%20SETTINGS%20date_time_input_format%3D%27best_effort%27%2C%20input_format_json_read_objects_as_strings%3D1%20FORMAT%20JSONEachRow%0A
```

:::info
Azure Data Factory 可以使用其内置的 `encodeUriComponent` 函数自动处理此编码，因此你无需手动处理。
:::

现在你可以向这个 URL 发送 JSON 格式的数据。数据应与目标表的结构相匹配。下面是一个使用 curl 的简单示例，假设有一个包含三列的表：`col_1`、`col_2` 和 `col_3`。

```text
curl \
    -XPOST "https://your-clickhouse-url.com?query=<our_URL_encded_query>" \
    --data '{"col_1":9119,"col_2":50.994,"col_3":"2019-06-01 00:00:00"}'
```

你也可以发送由对象组成的 JSON 数组，或 JSON Lines（按行分隔的 JSON 对象）。Azure Data Factory 使用 JSON 数组格式，这与 ClickHouse 的 `JSONEachRow` 输入完美兼容。

如你所见，在这一步中，无需在 ClickHouse 侧做任何特殊配置。HTTP 接口已经提供了充当类似 REST 端点所需的一切功能——不需要任何额外配置。

既然我们已经让 ClickHouse 充当一个 REST 端点，接下来就要配置 Azure Data Factory 来使用它。

在接下来的步骤中，我们将创建一个 Azure Data Factory 实例，为你的 ClickHouse 实例配置一个链接服务（Linked Service），为
[REST sink](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest)
定义一个数据集（Dataset），并创建一个 Copy Data（复制数据）活动，用于将数据从 Azure 发送到 ClickHouse。


## 创建 Azure Data Factory 实例 \{#create-an-azure-data-factory-instance\}

本指南假定您已拥有 Microsoft Azure 账号，并且
已经配置了订阅和资源组。如果您已经配置好了
Azure Data Factory，则可以安全地跳过此步骤，
在后续步骤中直接使用现有服务。

1. 登录 [Microsoft Azure Portal](https://portal.azure.com/)，然后单击
   **Create a resource**。
   <Image img={azureHomePage} size="lg" alt="Azure Portal Home Page" border/>

2. 在左侧的 Categories 面板中选择 **Analytics**，然后在热门服务列表中单击
   **Data Factory**。
   <Image img={azureNewResourceAnalytics} size="lg" alt="Azure Portal New Resource" border/>

3. 选择您的订阅和资源组，为新的 Data
   Factory 实例输入名称，选择区域，并将版本保持为 V2。
   <Image img={azureNewDataFactory} size="lg" alt="Azure Portal New Data Factory" border/>

3. 单击 **Review + Create**，然后单击 **Create** 以启动部署。
   <Image img={azureNewDataFactoryConfirm} size="lg" alt="Azure Portal New Data Factory Confirm" border/>

   <Image img={azureNewDataFactorySuccess} size="lg" alt="Azure Portal New Data Factory Success" border/>

部署成功完成后，您就可以开始使用新的 Azure
Data Factory 实例。

## 创建新的基于 REST 的链接服务 \{#-creating-new-rest-based-linked-service\}

1. 登录 Microsoft Azure 门户并打开你的 Data Factory 实例。
   <Image img={azureHomeWithDataFactory} size="lg" alt="Azure Portal Home Page with Data Factory" border/>

2. 在 Data Factory 概览页面上，点击 **Launch Studio**。
   <Image img={azureDataFactoryPage} size="lg" alt="Azure Portal Data Factory Page" border/>

3. 在左侧菜单中选择 **Manage**，然后进入 **Linked services**，
   并点击 **+ New** 来创建一个新的链接服务。
   <Image img={adfCreateLinkedServiceButton} size="lg" alt="Azure Data Factory New Linked Service Button" border/>

4. 在 **New linked service search bar** 中输入 **REST**，选择 **REST**，然后点击 **Continue**
   来创建一个 [REST connector](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest)
   实例。
   <Image img={adfNewLinkedServiceSearch} size="lg" alt="Azure Data Factory New Linked Service Search" border/>

5. 在链接服务配置面板中为你的新服务输入名称，
   点击 **Base URL** 字段，然后点击 **Add dynamic content**（该链接仅在字段被选中时出现）。
   <Image img={adfNewLinedServicePane} size="lg" alt="New Lined Service Pane" border/>

6. 在动态内容面板中，你可以创建参数化 URL，
   这样在为不同表创建数据集时可以再定义查询，从而使该链接服务可复用。
   <Image img={adfNewLinkedServiceBaseUrlEmpty} size="lg" alt="New Linked ServiceBase Url Empty" border/>

7. 点击筛选输入框旁边的 **"+"** 并添加一个新参数，将其命名为
   `pQuery`，将类型设置为 String，并将默认值设置为 `SELECT 1`。
   点击 **Save**。
   <Image img={adfNewLinkedServiceParams} size="lg" alt="New Linked Service Parameters" border/>

8. 在表达式字段中输入以下内容并点击 **OK**。将
   `your-clickhouse-url.com` 替换为你的 ClickHouse
   实例的实际地址。
   ```text
   @{concat('https://your-clickhouse-url.com:8443/?query=', encodeUriComponent(linkedService().pQuery))}
   ```
   <Image img={adfNewLinkedServiceExpressionFieldFilled} size="lg" alt="New Linked Service Expression Field Filled" border/>

9. 回到主表单中选择 Basic 身份验证（Basic authentication），输入用于连接 ClickHouse HTTP 接口的用户名和
   密码，点击 **Test
   connection**。如果所有配置都正确，你会看到成功的提示消息。
   <Image img={adfNewLinkedServiceCheckConnection} size="lg" alt="New Linked Service Check Connection" border/>

10. 点击 **Create** 完成设置。
    <Image img={adfLinkedServicesList} size="lg" alt="Linked Services List" border/>

现在你应该可以在列表中看到新注册的基于 REST 的链接服务。

## 为 ClickHouse HTTP 接口创建新的 dataset \{#creating-a-new-dataset-for-the-clickhouse-http-interface\}

现在我们已经为 ClickHouse HTTP 接口配置好了 linked service，
可以创建一个 dataset，供 Azure Data Factory 用来向 ClickHouse
发送数据。

在本示例中，我们将插入一小部分 [Environmental Sensors
Data](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors)。

1. 打开任意你偏好的 ClickHouse 查询控制台——可以是
   ClickHouse Cloud Web UI、CLI 客户端，或你用于
   运行查询的任何其他接口——并创建目标表：
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

2. 在 Azure Data Factory Studio 中，在左侧面板选择 Author。将鼠标悬停在
   Dataset 项上，点击三点图标，然后选择 New dataset。
   <Image img={adfNewDatasetItem} size="lg" alt="新建 Dataset 项" border/>

3. 在搜索栏中输入 **REST**，选择 **REST**，然后点击 **Continue**。
   为你的 dataset 输入名称，并选择你在上一步创建的 **linked service**。
   点击 **OK** 创建 dataset。
   <Image img={adfNewDatasetPage} size="lg" alt="新建 Dataset 页面" border/>

4. 现在你应当能在左侧 Factory Resources 面板的 Datasets
   部分看到新创建的 dataset。选择该 dataset 以打开其属性。
   你会看到在 linked service 中定义的 `pQuery` 参数。点击 **Value**
   文本字段，然后点击 **Add dynamic**
   content。
   <Image img={adfNewDatasetProperties} size="lg" alt="新建 Dataset 属性" border/>

5. 在打开的面板中，粘贴以下查询：
   ```sql
   INSERT INTO sensors
   SETTINGS 
       date_time_input_format=''best_effort'', 
       input_format_json_read_objects_as_strings=1 
   FORMAT JSONEachRow
   ```

   :::danger
   查询中的所有单引号 `'` 都必须替换为两个单引号
   `''`。这是 Azure Data Factory 表达式解析器的要求。如果
   你不进行转义，可能不会立刻看到错误——但在之后尝试使用或保存
   dataset 时就会失败。例如，`'best_effort'`
   必须写成 `''best_effort''`。
   :::

   <Image img={adfNewDatasetQuery} size="xl" alt="新建 Dataset 查询" border/>

6. 点击 OK 保存表达式。点击 Test connection。如果一切
   配置正确，你会看到 Connection successful 消息。点击页面顶部的
   Publish all 以保存你的更改。
   <Image img={adfNewDatasetConnectionSuccessful} size="xl" alt="新建 Dataset 连接成功" border/>

### 设置示例数据集 \{#setting-up-an-example-dataset\}

在本示例中，我们不会使用完整的 Environmental Sensors Dataset，而是
只使用一个较小的子集，可从
[Sensors Dataset Sample](https://datasets-documentation.s3.eu-west-3.amazonaws.com/environmental/sensors.csv) 获取。

:::info
为保持本指南的重点，我们不会详细介绍在 Azure Data Factory 中创建
源数据集的具体步骤。你可以将示例数据上传到任意你选择的存储服务——例如 Azure Blob Storage、Microsoft SQL
Server，或者采用 Azure Data Factory 支持的其他文件格式。
:::

将数据集上传到你的 Azure Blob Storage（或其他首选存储
服务），然后在 Azure Data Factory Studio 中，进入 Factory Resources 面板。
创建一个新的数据集，并指向已上传的数据。单击 Publish all 以
保存更改。

## 创建用于将数据传输到 ClickHouse 的 Copy Activity \{#creating-the-copy-activity-to-transfer-data-to-clickhouse\}

现在我们已经配置好了输入和输出数据集，可以设置一个
**Copy Data** 活动，将示例数据集中的数据传输到 ClickHouse 中的
`sensors` 表。

1. 打开 **Azure Data Factory Studio**，转到 **Author 选项卡**。在
   **Factory Resources** 面板中，将鼠标悬停在 **Pipeline** 上，单击三点图标，
   然后选择 **New pipeline**。
   <Image img={adfNewPipelineItem} size="lg" alt="ADF 新建 Pipeline 条目" border/>

2. 在 **Activities** 面板中，展开 **Move and transform** 部分，
   将 **Copy data** 活动拖到画布上。
   <Image img={adfNewCopyDataItem} size="lg" alt="新建 Copy Data 条目" border/>

3. 选择 **Source** 选项卡，并选择你之前创建的源数据集。
   <Image img={adfCopyDataSource} size="lg" alt="Copy Data 源" border/>

4. 转到 **Sink** 选项卡并选择为 sensors 表创建的 ClickHouse 数据集。
   将 **Request method** 设置为 POST。确保 **HTTP compression
   type** 设置为 **None**。
   :::warning
   在 Azure Data Factory 的 Copy Data 活动中，HTTP 压缩无法正常工作。
   启用后，Azure 只会发送仅包含零字节的负载——这很可能是该服务中的一个 bug。
   请务必保持压缩处于禁用状态。
   :::
   :::info
   我们建议保留默认的 10,000 的批量大小，甚至可以进一步增大。
   详情请参见
   [Selecting an Insert Strategy / Batch inserts if synchronous](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous)
   了解更多信息。
   :::
   <Image img={adfCopyDataSinkSelectPost} size="lg" alt="Copy Data Sink 选择 POST" border/>

5. 单击画布顶部的 **Debug** 来运行 pipeline。稍等片刻，该活动将被排队并执行。
   如果所有配置都正确，任务应以 **Success** 状态结束。
   <Image img={adfCopyDataDebugSuccess} size="lg" alt="Copy Data Debug 成功" border/>

6. 完成后，单击 **Publish all** 以保存你的 pipeline 和数据集更改。

## 其他资源 \{#additional-resources-1\}

- [HTTP 接口](https://clickhouse.com/docs/interfaces/http)
- [使用 Azure Data Factory 从和到 REST 终结点复制和转换数据](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest?tabs=data-factory)
- [选择插入策略](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy)
- [创建和配置自托管的集成运行时](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)