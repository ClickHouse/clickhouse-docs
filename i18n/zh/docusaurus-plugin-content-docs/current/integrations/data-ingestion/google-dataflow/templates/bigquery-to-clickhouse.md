---
sidebar_label: 'BigQuery 到 ClickHouse'
sidebar_position: 1
slug: /integrations/google-dataflow/templates/bigquery-to-clickhouse
description: '用户可以使用 Google Dataflow 模板将 BigQuery 的数据摄取到 ClickHouse'
title: 'Dataflow BigQuery 到 ClickHouse 模板'
doc_type: 'guide'
keywords: ['Dataflow', 'BigQuery']
---

import TOCInline from '@theme/TOCInline';
import Image from '@theme/IdealImage';
import dataflow_inqueue_job from '@site/static/images/integrations/data-ingestion/google-dataflow/dataflow-inqueue-job.png'
import dataflow_create_job_from_template_button from '@site/static/images/integrations/data-ingestion/google-dataflow/create_job_from_template_button.png'
import dataflow_template_clickhouse_search from '@site/static/images/integrations/data-ingestion/google-dataflow/template_clickhouse_search.png'
import dataflow_template_initial_form from '@site/static/images/integrations/data-ingestion/google-dataflow/template_initial_form.png'
import dataflow_extended_template_form from '@site/static/images/integrations/data-ingestion/google-dataflow/extended_template_form.png'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Dataflow BigQuery 到 ClickHouse 模板 {#dataflow-bigquery-to-clickhouse-template}

BigQuery 到 ClickHouse 模板是一个批处理管道，用于将 BigQuery 表中的数据摄取到 ClickHouse 表中。
该模板可以读取整个表，或使用提供的 SQL 查询筛选特定记录。

<TOCInline toc={toc}   maxHeadingLevel={2}></TOCInline>



## 管道要求 {#pipeline-requirements}

* 源 BigQuery 表必须已存在。
* 目标 ClickHouse 表必须已存在。
* 必须能从 Dataflow 工作器实例访问 ClickHouse 主机。



## 模板参数 {#template-parameters}

<br/>
<br/>

| 参数名称                | 参数说明                                                                                                                                                                                                                                                                                                                                            | 是否必填 | 备注                                                                                                                                                                                                                                                            |
|-------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `jdbcUrl`               | ClickHouse JDBC URL，格式为 `jdbc:clickhouse://<host>:<port>/<schema>`。                                                                                                                                                                                                                                                                            | ✅        | 不要将用户名和密码作为 JDBC 选项添加。可以在 JDBC URL 末尾添加其他任意 JDBC 选项。对于 ClickHouse Cloud 用户，请在 `jdbcUrl` 中添加 `ssl=true&sslmode=NONE`。                                                                                                  |
| `clickHouseUsername`    | 用于身份验证的 ClickHouse 用户名。                                                                                                                                                                                                                                                                                                                 | ✅        |                                                                                                                                                                                                                                                                  |
| `clickHousePassword`    | 用于身份验证的 ClickHouse 密码。                                                                                                                                                                                                                                                                                                                   | ✅        |                                                                                                                                                                                                                                                                  |
| `clickHouseTable`       | 要插入数据的目标 ClickHouse 表。                                                                                                                                                                                                                                                                                                                   | ✅        |                                                                                                                                                                                                                                                                  |
| `maxInsertBlockSize`    | 插入时的最大块大小，当由我们控制插入块的创建时适用（ClickHouseIO 选项）。                                                                                                                                                                                                                                                                         |          | 这是一个 `ClickHouseIO` 选项。                                                                                                                                                                                                                                   |
| `insertDistributedSync` | 如果启用该设置，向 Distributed 表执行 INSERT 查询时，会在数据发送到集群中的所有节点后才完成。（ClickHouseIO 选项）。                                                                                                                                                                                                                               |          | 这是一个 `ClickHouseIO` 选项。                                                                                                                                                                                                                                   |
| `insertQuorum`          | 对复制表执行 INSERT 查询时，等待指定数量的副本完成写入，并对数据写入进行线性化。0 表示禁用。                                                                                                                                                                                                                                                      |          | 这是一个 `ClickHouseIO` 选项。此设置在默认服务器配置中是禁用的。                                                                                                                                                                                                 |
| `insertDeduplicate`     | 对复制表执行 INSERT 查询时，指定是否对插入块执行去重。                                                                                                                                                                                                                                                                                            |          | 这是一个 `ClickHouseIO` 选项。                                                                                                                                                                                                                                   |
| `maxRetries`            | 每次插入操作的最大重试次数。                                                                                                                                                                                                                                                                                                                       |          | 这是一个 `ClickHouseIO` 选项。                                                                                                                                                                                                                                   |
| `InputTableSpec`        | 要读取的 BigQuery 表。指定 `inputTableSpec` 或 `query` 之一。当二者都设置时，`query` 参数优先。示例：`<BIGQUERY_PROJECT>:<DATASET_NAME>.<INPUT_TABLE>`。                                                                                                                                                                                             |          | 使用 [BigQuery Storage Read API](https://cloud.google.com/bigquery/docs/reference/storage) 直接从 BigQuery 存储中读取数据。请注意 [Storage Read API 的限制](https://cloud.google.com/bigquery/docs/reference/storage#limitations)。                             |
| `outputDeadletterTable` | 用于存放未能写入输出表的消息的 BigQuery 表。如果该表不存在，会在管道执行期间创建。如果未指定，则使用 `<outputTableSpec>_error_records`。例如：`<PROJECT_ID>:<DATASET_NAME>.<DEADLETTER_TABLE>`。                                                                                                            |          |                                                                                                                                                                                                                                                                  |
| `query`                 | 用于从 BigQuery 读取数据的 SQL 查询。如果 BigQuery 数据集所在的项目与 Dataflow 作业不同，请在 SQL 查询中指定完整的数据集名称，例如：`<PROJECT_ID>.<DATASET_NAME>.<TABLE_NAME>`。默认使用 [GoogleSQL](https://cloud.google.com/bigquery/docs/introduction-sql)，除非将 `useLegacySql` 设为 `true`。                  |          | 必须指定 `inputTableSpec` 或 `query` 之一。如果同时设置了这两个参数，模板会使用 `query` 参数。示例：`SELECT * FROM sampledb.sample_table`。                                                                                                                     |
| `useLegacySql`          | 设为 `true` 时使用传统 SQL（legacy SQL）。该参数仅在使用 `query` 参数时生效。默认为 `false`。                                                                                                                                                                                                                                                     |          |                                                                                                                                                                                                                                                                  |
| `queryLocation`         | 在没有底层表权限、而是通过授权视图（authorized view）读取时所需的位置。例如：`US`。                                                                                                                                                                                                                                                                |          |                                                                                                                                                                                                                                                                  |
| `queryTempDataset`      | 设置一个已存在的数据集，用于创建存储查询结果的临时表。例如：`temp_dataset`。                                                                                                                                                                                                                                                                       |          |                                                                                                                                                                                                                                                                  |
| `KMSEncryptionKey`      | 当使用 query 作为数据源从 BigQuery 读取时，使用此 Cloud KMS 密钥对创建的任何临时表进行加密。例如：`projects/your-project/locations/global/keyRings/your-keyring/cryptoKeys/your-key`。                                                                                                                     |          |                                                                                                                                                                                                                                                                  |



:::note
所有 `ClickHouseIO` 参数的默认值可以在 [`ClickHouseIO` Apache Beam Connector](/integrations/apache-beam#clickhouseiowrite-parameters) 中找到。
:::



## 源表与目标表的模式 {#source-and-target-tables-schema}

为了高效地将 BigQuery 数据集加载到 ClickHouse 中，流水线会执行列推断流程，该流程包含以下阶段：

1. 模板会基于目标 ClickHouse 表构建一个 schema 对象。
2. 模板会遍历 BigQuery 数据集，并尝试根据列名匹配列。

<br/>

:::important
因此，你的 BigQuery 数据集（无论是表还是查询）必须与 ClickHouse 目标表具有完全相同的列名。
:::



## 数据类型映射 {#data-types-mapping}

BigQuery 类型会根据 ClickHouse 表的定义进行转换。因此，上表列出了在目标 ClickHouse 表中（针对给定的 BigQuery 表/查询）推荐使用的映射关系：

| BigQuery Type                                                                                                         | ClickHouse Type                                                 | Notes                                                                                                                                                                                                                                                                                                                                                                                                                  |
|-----------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [**Array Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)                 | [**Array Type**](../../../sql-reference/data-types/array)       | 内部类型必须是此表中列出的受支持基础数据类型之一。                                                                                                                                                                                                                                                                                                                                 |
| [**Boolean Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)             | [**Bool Type**](../../../sql-reference/data-types/boolean)      |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**Date Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)                   | [**Date Type**](../../../sql-reference/data-types/date)         |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**Datetime Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type)           | [**Datetime Type**](../../../sql-reference/data-types/datetime) | 同样适用于 `Enum8`、`Enum16` 和 `FixedString`。                                                                                                                                                                                                                                                                                                                                                                        |
| [**String Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)               | [**String Type**](../../../sql-reference/data-types/string)     | 在 BigQuery 中，所有 Int 类型（`INT`、`SMALLINT`、`INTEGER`、`BIGINT`、`TINYINT`、`BYTEINT`）都是 `INT64` 的别名。建议在 ClickHouse 中为列设置合适的整数宽度，因为模板会根据定义的列类型（`Int8`、`Int16`、`Int32`、`Int64`）来转换列。                                                                                                                          |
| [**Numeric - Integer Types**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types) | [**Integer Types**](../../../sql-reference/data-types/int-uint) | 在 BigQuery 中，所有 Int 类型（`INT`、`SMALLINT`、`INTEGER`、`BIGINT`、`TINYINT`、`BYTEINT`）都是 `INT64` 的别名。建议在 ClickHouse 中为列设置合适的整数宽度，因为模板会根据定义的列类型（`Int8`、`Int16`、`Int32`、`Int64`）来转换列。如果在 ClickHouse 表中使用了无符号 Int 类型（`UInt8`、`UInt16`、`UInt32`、`UInt64`），模板也会对其进行转换。 |
| [**Numeric - Float Types**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)   | [**Float Types**](../../../sql-reference/data-types/float)      | 支持的 ClickHouse 类型：`Float32` 和 `Float64`                                                                                                                                                                                                                                                                                                                                                                    |



## 运行模板 {#running-the-template}

BigQuery 到 ClickHouse 模板可以通过 Google Cloud CLI 执行。

:::note
请务必通读本文档，尤其是上面的章节，以充分了解该模板的配置要求和前置条件。
:::

<Tabs>
  <TabItem value="console" label="Google Cloud 控制台" default>
    登录 Google Cloud 控制台并搜索 Dataflow。

1. 点击 `CREATE JOB FROM TEMPLATE` 按钮
   <Image img={dataflow_create_job_from_template_button} border alt="Dataflow 控制台" />
2. 模板表单打开后，输入作业名称并选择目标区域（region）。
   <Image img={dataflow_template_initial_form} border alt="Dataflow 模板初始表单" />
3. 在 `DataFlow Template` 输入框中输入 `ClickHouse` 或 `BigQuery`，并选择 `BigQuery to ClickHouse` 模板
   <Image img={dataflow_template_clickhouse_search} border alt="选择 BigQuery to ClickHouse 模板" />
4. 选择后，表单会展开，允许你提供更多详细信息：
    * ClickHouse 服务器 JDBC URL，格式为 `jdbc:clickhouse://host:port/schema`。
    * ClickHouse 用户名。
    * ClickHouse 目标表名。

<br/>

:::note
ClickHouse 密码选项被标记为可选，适用于未配置密码的场景。
如需添加，请向下滚动至 `Password for ClickHouse Endpoint` 选项。
:::

<Image img={dataflow_extended_template_form} border alt="BigQuery to ClickHouse 扩展模板表单" />

5. 根据需要自定义并添加任何与 BigQuery/ClickHouseIO 相关的配置，具体见
   [模板参数](#template-parameters) 部分。

  </TabItem>
  <TabItem value="cli" label="Google Cloud CLI">

### 安装并配置 `gcloud` CLI {#install--configure-gcloud-cli}

- 如果尚未安装，请安装 [`gcloud` CLI](https://cloud.google.com/sdk/docs/install)。
- 按照
  [本指南](https://cloud.google.com/dataflow/docs/guides/templates/using-flex-templates#before-you-begin)
  中的 `Before you begin` 部分，完成运行 Dataflow 模板所需的配置、设置和权限。

### 运行命令 {#run-command}

使用 [`gcloud dataflow flex-template run`](https://cloud.google.com/sdk/gcloud/reference/dataflow/flex-template/run)
命令来运行使用 Flex Template 的 Dataflow 作业。

下面是该命令的示例：

```bash
gcloud dataflow flex-template run "bigquery-clickhouse-dataflow-$(date +%Y%m%d-%H%M%S)" \
 --template-file-gcs-location "gs://clickhouse-dataflow-templates/bigquery-clickhouse-metadata.json" \
 --parameters inputTableSpec="<bigquery table id>",jdbcUrl="jdbc:clickhouse://<clickhouse host>:<clickhouse port>/<schema>?ssl=true&sslmode=NONE",clickHouseUsername="<username>",clickHousePassword="<password>",clickHouseTable="<clickhouse target table>"
```

### 命令解析 {#command-breakdown}

- **作业名称（Job Name）：** `run` 关键字后面的文本是唯一的作业名称。
- **模板文件（Template File）：** 由 `--template-file-gcs-location` 指定的 JSON 文件定义了模板结构以及可接受参数的详细信息。上述文件路径是公开的，可直接使用。
- **参数（Parameters）：** 参数之间用逗号分隔。对于字符串类型的参数，请使用双引号包裹参数值。

### 预期响应 {#expected-response}

运行命令后，你应会看到类似如下的响应：

```bash
job:
  createTime: '2025-01-26T14:34:04.608442Z'
  currentStateTime: '1970-01-01T00:00:00Z'
  id: 2025-01-26_06_34_03-13881126003586053150
  location: us-central1
  name: bigquery-clickhouse-dataflow-20250126-153400
  projectId: ch-integrations
  startTime: '2025-01-26T14:34:04.608442Z'
```

  </TabItem>
</Tabs>

### 监控作业 {#monitor-the-job}

在 Google Cloud 控制台中导航到 [Dataflow Jobs 选项卡](https://console.cloud.google.com/dataflow/jobs)，以监控作业状态。你可以查看作业详情，包括进度和任何错误信息：



<Image img={dataflow_inqueue_job} size="lg" border alt="DataFlow 控制台显示一个正在运行的从 BigQuery 到 ClickHouse 的作业" />



## 疑难解答 {#troubleshooting}

### 内存总量限制超出错误（代码 241）{#code-241-dbexception-memory-limit-total-exceeded}

当 ClickHouse 在处理大批量数据时内存耗尽，就会出现此错误。要解决此问题：

* 增加实例资源：将 ClickHouse 服务器升级为具有更多内存的更大实例，以应对数据处理负载。
* 减小批大小：在 Dataflow 作业配置中调整批大小，以较小的数据块发送到 ClickHouse，从而降低每个批次的内存消耗。这些更改有助于在数据摄取过程中平衡资源使用。



## 模板源代码 {#template-source-code}

该模板的源代码可在 ClickHouse 的 [DataflowTemplates](https://github.com/ClickHouse/DataflowTemplates) 派生仓库（fork）中获取。
