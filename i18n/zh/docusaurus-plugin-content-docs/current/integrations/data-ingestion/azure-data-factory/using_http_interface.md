---
sidebar_label: '使用 HTTP 接口'
slug: /integrations/azure-data-factory/http-interface
description: '使用 ClickHouse 的 HTTP 接口将 Azure Data Factory 的数据导入 ClickHouse'
keywords: ['azure data factory', 'azure', 'microsoft', 'data', 'http interface']
title: '使用 ClickHouse HTTP 接口将 Azure 数据导入 ClickHouse'
doc_type: 'guide'
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


# 在 Azure 数据工厂中使用 ClickHouse HTTP 接口 {#using-clickhouse-http-interface-in-azure-data-factory}

[`azureBlobStorage` 表函数](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
是一种从 Azure Blob 存储将数据导入 ClickHouse 的快速便捷方法。但是,在以下情况下使用它可能并不总是合适:

- 您的数据可能未存储在 Azure Blob 存储中——例如,它可能位于 Azure SQL Database、Microsoft SQL Server 或 Cosmos DB 中。
- 安全策略可能完全阻止对 Blob 存储的外部访问——例如,如果存储账户已锁定且没有公共端点。

在这种情况下,您可以将 Azure 数据工厂与
[ClickHouse HTTP 接口](https://clickhouse.com/docs/interfaces/http)
结合使用,将数据从 Azure 服务发送到 ClickHouse。

此方法反转了数据流:不是让 ClickHouse 从 Azure 拉取数据,而是由 Azure 数据工厂将数据推送到 ClickHouse。这种方法通常要求您的 ClickHouse 实例可以从公共互联网访问。

:::info
通过使用 Azure 数据工厂的自承载集成运行时,可以避免将 ClickHouse 实例暴露到互联网。此设置允许通过专用网络发送数据。但是,这超出了本文的范围。您可以在官方指南中找到更多信息:
[创建和配置自承载集成运行时](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
:::


## 将 ClickHouse 转换为 REST 服务 {#turning-clickhouse-to-a-rest-service}

Azure Data Factory 支持通过 HTTP 以 JSON 格式向外部系统发送数据。我们可以利用此功能,使用 [ClickHouse HTTP 接口](https://clickhouse.com/docs/interfaces/http)直接将数据插入 ClickHouse。您可以在 [ClickHouse HTTP 接口文档](https://clickhouse.com/docs/interfaces/http)中了解更多信息。

在此示例中,我们只需指定目标表,将输入数据格式定义为 JSON,并包含允许更灵活解析时间戳的选项。

```sql
INSERT INTO my_table
SETTINGS
    date_time_input_format='best_effort',
    input_format_json_read_objects_as_strings=1
FORMAT JSONEachRow
```

要将此查询作为 HTTP 请求的一部分发送,只需将其作为 URL 编码字符串传递给 ClickHouse 端点中的 query 参数:

```text
https://your-clickhouse-url.com?query=INSERT%20INTO%20my_table%20SETTINGS%20date_time_input_format%3D%27best_effort%27%2C%20input_format_json_read_objects_as_strings%3D1%20FORMAT%20JSONEachRow%0A
```

:::info
Azure Data Factory 可以使用其内置的 `encodeUriComponent` 函数自动处理此编码,因此您无需手动操作。
:::

现在您可以向此 URL 发送 JSON 格式的数据。数据应与目标表的结构匹配。以下是使用 curl 的简单示例,假设表具有三列:`col_1`、`col_2` 和 `col_3`。

```text
curl \
    -XPOST "https://your-clickhouse-url.com?query=<our_URL_encded_query>" \
    --data '{"col_1":9119,"col_2":50.994,"col_3":"2019-06-01 00:00:00"}'
```

您还可以发送 JSON 对象数组或 JSON Lines(换行符分隔的 JSON 对象)。Azure Data Factory 使用 JSON 数组格式,该格式与 ClickHouse 的 `JSONEachRow` 输入完美兼容。

如您所见,对于此步骤,您无需在 ClickHouse 端执行任何特殊操作。HTTP 接口已经提供了充当类 REST 端点所需的一切——无需额外配置。

现在我们已经使 ClickHouse 表现得像 REST 端点,接下来可以配置 Azure Data Factory 来使用它。

在接下来的步骤中,我们将创建一个 Azure Data Factory 实例,设置到您的 ClickHouse 实例的链接服务,为 [REST 接收器](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest)定义数据集,并创建一个复制数据活动以将数据从 Azure 发送到 ClickHouse。


## 创建 Azure 数据工厂实例 {#create-an-azure-data-factory-instance}

本指南假设您已拥有 Microsoft Azure 账户的访问权限,并且已配置订阅和资源组。如果您已配置 Azure Data Factory,则可以跳过此步骤,直接使用现有服务进行下一步操作。

1. 登录 [Microsoft Azure Portal](https://portal.azure.com/) 并点击
   **创建资源**。

   <Image img={azureHomePage} size='lg' alt='Azure 门户主页' border />

2. 在左侧的类别窗格中,选择 **分析**,然后在热门服务列表中点击
   **Data Factory**。

   <Image
     img={azureNewResourceAnalytics}
     size='lg'
     alt='Azure 门户新建资源'
     border
   />

3. 选择您的订阅和资源组,为新的 Data
   Factory 实例输入名称,选择区域并将版本保留为 V2。

   <Image
     img={azureNewDataFactory}
     size='lg'
     alt='Azure 门户新建 Data Factory'
     border
   />

4. 点击 **查看 + 创建**,然后点击 **创建** 以启动部署。

   <Image
     img={azureNewDataFactoryConfirm}
     size='lg'
     alt='Azure 门户新建 Data Factory 确认'
     border
   />

   <Image
     img={azureNewDataFactorySuccess}
     size='lg'
     alt='Azure 门户新建 Data Factory 成功'
     border
   />

部署成功完成后,您即可开始使用新的 Azure
Data Factory 实例。


## 创建新的基于 REST 的链接服务 {#-creating-new-rest-based-linked-service}

1. 登录 Microsoft Azure 门户并打开您的 Data Factory 实例。

   <Image
     img={azureHomeWithDataFactory}
     size='lg'
     alt='带有 Data Factory 的 Azure 门户主页'
     border
   />

2. 在 Data Factory 概览页面上,点击 **Launch Studio**。

   <Image
     img={azureDataFactoryPage}
     size='lg'
     alt='Azure 门户 Data Factory 页面'
     border
   />

3. 在左侧菜单中,选择 **Manage**,然后转到 **Linked services**,
   并点击 **+ New** 创建新的链接服务。

   <Image
     img={adfCreateLinkedServiceButton}
     size='lg'
     alt='Azure Data Factory 新建链接服务按钮'
     border
   />

4. 在 **New linked service search bar** 中,输入 **REST**,选择 **REST**,然后点击 **Continue**
   创建 [REST 连接器](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest)
   实例。

   <Image
     img={adfNewLinkedServiceSearch}
     size='lg'
     alt='Azure Data Factory 新建链接服务搜索'
     border
   />

5. 在链接服务配置窗格中输入新服务的名称,
   点击 **Base URL** 字段,然后点击 **Add dynamic content**(此链接仅在选中该字段时显示)。

   <Image
     img={adfNewLinedServicePane}
     size='lg'
     alt='新建链接服务窗格'
     border
   />

6. 在动态内容窗格中,您可以创建参数化 URL,
   这样可以在稍后为不同表创建数据集时定义查询——从而使链接服务可重用。

   <Image
     img={adfNewLinkedServiceBaseUrlEmpty}
     size='lg'
     alt='新建链接服务基础 URL 为空'
     border
   />

7. 点击筛选器输入框旁边的 **"+"** 并添加新参数,将其命名为
   `pQuery`,将类型设置为 String,并将默认值设置为 `SELECT 1`。
   点击 **Save**。

   <Image
     img={adfNewLinkedServiceParams}
     size='lg'
     alt='新建链接服务参数'
     border
   />

8. 在表达式字段中,输入以下内容并点击 **OK**。将
   `your-clickhouse-url.com` 替换为您的 ClickHouse
   实例的实际地址。

   ```text
   @{concat('https://your-clickhouse-url.com:8443/?query=', encodeUriComponent(linkedService().pQuery))}
   ```

   <Image
     img={adfNewLinkedServiceExpressionFieldFilled}
     size='lg'
     alt='新建链接服务表达式字段已填写'
     border
   />

9. 返回主表单,选择 Basic authentication,输入用于连接 ClickHouse HTTP 接口的用户名和
   密码,点击 **Test
   connection**。如果一切配置正确,您将看到成功
   消息。

   <Image
     img={adfNewLinkedServiceCheckConnection}
     size='lg'
     alt='新建链接服务检查连接'
     border
   />

10. 点击 **Create** 完成设置。
    <Image
      img={adfLinkedServicesList}
      size='lg'
      alt='链接服务列表'
      border
    />

您现在应该能在列表中看到新注册的基于 REST 的链接服务。


## 为 ClickHouse HTTP 接口创建新数据集 {#creating-a-new-dataset-for-the-clickhouse-http-interface}

现在我们已经为 ClickHouse HTTP 接口配置了链接服务,可以创建一个数据集,供 Azure Data Factory 用于向 ClickHouse 发送数据。

在本示例中,我们将插入[环境传感器数据](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors)的一小部分。

1. 打开您选择的 ClickHouse 查询控制台——可以是 ClickHouse Cloud Web UI、CLI 客户端或您用于运行查询的任何其他界面——并创建目标表:

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

2. 在 Azure Data Factory Studio 中,选择左侧窗格中的 Author。将鼠标悬停在 Dataset 项上,点击三点图标,然后选择 New dataset。

   <Image img={adfNewDatasetItem} size='lg' alt='New Dataset Item' border />

3. 在搜索栏中,输入 **REST**,选择 **REST**,然后点击 **Continue**。为您的数据集输入名称,并选择您在上一步中创建的**链接服务**。点击 **OK** 创建数据集。

   <Image img={adfNewDatasetPage} size='lg' alt='New Dataset Page' border />

4. 现在您应该能在左侧 Factory Resources 窗格的 Datasets 部分下看到新创建的数据集。选择该数据集以打开其属性。您将看到在链接服务中定义的 `pQuery` 参数。点击 **Value** 文本字段,然后点击 **Add dynamic content**。

   <Image
     img={adfNewDatasetProperties}
     size='lg'
     alt='New Dataset Properties'
     border
   />

5. 在打开的窗格中,粘贴以下查询:

   ```sql
   INSERT INTO sensors
   SETTINGS
       date_time_input_format=''best_effort'',
       input_format_json_read_objects_as_strings=1
   FORMAT JSONEachRow
   ```

   :::danger
   查询中的所有单引号 `'` 必须替换为两个单引号 `''`。这是 Azure Data Factory 表达式解析器的要求。如果不转义它们,可能不会立即看到错误——但在您尝试使用或保存数据集时会失败。例如,`'best_effort'` 必须写成 `''best_effort''`。
   :::

   <Image img={adfNewDatasetQuery} size='xl' alt='New Dataset Query' border />

6. 点击 OK 保存表达式。点击 Test connection。如果一切配置正确,您将看到 Connection successful 消息。点击页面顶部的 Publish all 以保存您的更改。
   <Image
     img={adfNewDatasetConnectionSuccessful}
     size='xl'
     alt='New Dataset Connection Successful'
     border
   />

### 设置示例数据集 {#setting-up-an-example-dataset}

在本示例中,我们不会使用完整的环境传感器数据集,而是仅使用[传感器数据集样本](https://datasets-documentation.s3.eu-west-3.amazonaws.com/environmental/sensors.csv)中提供的一小部分数据。

:::info
为了使本指南保持重点,我们不会详细介绍在 Azure Data Factory 中创建源数据集的具体步骤。您可以将样本数据上传到任何您选择的存储服务——例如 Azure Blob Storage、Microsoft SQL Server,甚至 Azure Data Factory 支持的不同文件格式。
:::

将数据集上传到您的 Azure Blob Storage(或其他首选存储服务),然后在 Azure Data Factory Studio 中,转到 Factory Resources 窗格。创建一个指向上传数据的新数据集。点击 Publish all 以保存您的更改。


## 创建复制活动以将数据传输到 ClickHouse {#creating-the-copy-activity-to-transfer-data-to-clickhouse}

现在我们已经配置了输入和输出数据集,可以设置一个**复制数据**活动,将数据从示例数据集传输到 ClickHouse 中的 `sensors` 表。

1. 打开 **Azure Data Factory Studio**,转到**创作选项卡**。在**工厂资源**窗格中,将鼠标悬停在 **Pipeline** 上,单击三点图标,然后选择**新建管道**。

   <Image
     img={adfNewPipelineItem}
     size='lg'
     alt='ADF 新建管道项'
     border
   />

2. 在**活动**窗格中,展开**移动和转换**部分,然后将**复制数据**活动拖到画布上。

   <Image img={adfNewCopyDataItem} size='lg' alt='新建复制数据项' border />

3. 选择**源**选项卡,然后选择您之前创建的源数据集。

   <Image img={adfCopyDataSource} size='lg' alt='复制数据源' border />

4. 转到**接收器**选项卡,选择为您的传感器表创建的 ClickHouse 数据集。将**请求方法**设置为 POST。确保 **HTTP 压缩类型**设置为 **None**。
   :::warning
   HTTP 压缩在 Azure Data Factory 的复制数据活动中无法正常工作。启用时,Azure 仅发送由零字节组成的有效负载——这可能是服务中的一个错误。请务必保持压缩处于禁用状态。
   :::
   :::info
   我们建议保持默认批次大小为 10,000,甚至可以进一步增加。有关更多详细信息,请参阅[选择插入策略 / 同步批量插入](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous)。
   :::

   <Image
     img={adfCopyDataSinkSelectPost}
     size='lg'
     alt='复制数据接收器选择 Post'
     border
   />

5. 单击画布顶部的**调试**以运行管道。稍等片刻后,活动将被排队并执行。如果所有配置都正确,任务应以**成功**状态完成。

   <Image
     img={adfCopyDataDebugSuccess}
     size='lg'
     alt='复制数据调试成功'
     border
   />

6. 完成后,单击**全部发布**以保存您的管道和数据集更改。


## 其他资源 {#additional-resources-1}

- [HTTP 接口](https://clickhouse.com/docs/interfaces/http)
- [使用 Azure Data Factory 从 REST 端点复制和转换数据](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest?tabs=data-factory)
- [选择插入策略](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy)
- [创建和配置自托管集成运行时](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
