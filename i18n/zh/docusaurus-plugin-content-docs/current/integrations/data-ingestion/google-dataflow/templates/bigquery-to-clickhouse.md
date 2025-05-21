---
'sidebar_label': 'BigQuery To ClickHouse'
'sidebar_position': 1
'slug': '/integrations/google-dataflow/templates/bigquery-to-clickhouse'
'description': 'Users can ingest data from BigQuery into ClickHouse using Google Dataflow
  Template'
'title': 'Dataflow BigQuery to ClickHouse template'
---

import TOCInline from '@theme/TOCInline';
import Image from '@theme/IdealImage';
import dataflow_inqueue_job from '@site/static/images/integrations/data-ingestion/google-dataflow/dataflow-inqueue-job.png'


# Dataflow BigQuery 到 ClickHouse 模板

BigQuery 到 ClickHouse 模板是一个批处理管道，用于将数据从 BigQuery 表摄取到 ClickHouse 表。 模板可以读取整个表，也可以使用提供的查询读取特定记录。

<TOCInline toc={toc}></TOCInline>

## 管道要求 {#pipeline-requirements}

* 源 BigQuery 表必须存在。
* 目标 ClickHouse 表必须存在。
* ClickHouse 主机必须可以从 Dataflow 工作机器访问。

## 模板参数 {#template-parameters}

<br/>
<br/>

| 参数名称                | 参数描述                                                                                                                                                                                                                                                                                                | 是否必填 | 备注                                                                                                                                                                                                                         |
|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `jdbcUrl`               | ClickHouse JDBC URL，格式为 `jdbc:clickhouse://<host>:<port>/<schema>`。                                                                                                                                                                                                                               | ✅        | 不要将用户名和密码作为 JDBC 选项添加。任何其他 JDBC 选项可以在 JDBC URL 的末尾添加。对于 ClickHouse Cloud 用户，在 `jdbcUrl` 中添加 `ssl=true&sslmode=NONE`。                                                               |
| `clickHouseUsername`    | 用于身份验证的 ClickHouse 用户名。                                                                                                                                                                                                                                                                          | ✅        |                                                                                                                                                                                                                              |
| `clickHousePassword`    | 用于身份验证的 ClickHouse 密码。                                                                                                                                                                                                                                                                          | ✅        |                                                                                                                                                                                                                              |
| `clickHouseTable`       | 要插入数据的目标 ClickHouse 表名。                                                                                                                                                                                                                                                                      | ✅        |                                                                                                                                                                                                                              |
| `maxInsertBlockSize`    | 插入的最大块大小，如果我们控制插入的块的创建（ClickHouseIO 选项）。                                                                                                                                                                                                                                    |          | 一个 `ClickHouseIO` 选项。                                                                                                                                                                                                  |
| `insertDistributedSync` | 如果启用该设置，插入查询将等待，直到数据发送到集群中的所有节点。（ClickHouseIO 选项）                                                                                                                                                                                                               |          | 一个 `ClickHouseIO` 选项。                                                                                                                                                                                                  |
| `insertQuorum`          | 对于复制表中的 INSERT 查询，等待写入指定数量的副本并线性添加数据。0 - 禁用。                                                                                                                                                                                                                         |          | 一个 `ClickHouseIO` 选项。此设置在默认服务器设置中禁用。                                                                                                                                                                   |
| `insertDeduplicate`     | 对于复制表中的 INSERT 查询，指定应执行插入块的去重。                                                                                                                                                                                                                                                   |          | 一个 `ClickHouseIO` 选项。                                                                                                                                                                                                  |
| `maxRetries`            | 每次插入的最大重试次数。                                                                                                                                                                                                                                                                                     |          | 一个 `ClickHouseIO` 选项。                                                                                                                                                                                                  |
| `InputTableSpec`        | 要读取的 BigQuery 表。指定 `inputTableSpec` 或 `query`。当两者都设置时，`query` 参数优先。示例：`<BIGQUERY_PROJECT>:<DATASET_NAME>.<INPUT_TABLE>`。                                                                                                                                                |          | 直接从 BigQuery 存储读取数据，使用 [BigQuery Storage Read API](https://cloud.google.com/bigquery/docs/reference/storage)。注意 [Storage Read API 的限制](https://cloud.google.com/bigquery/docs/reference/storage#limitations)。  |
| `outputDeadletterTable` | 用于无法到达输出表的消息的 BigQuery 表。如果表不存在，则在管道执行期间创建。如果未指定，则使用 `<outputTableSpec>_error_records`。例如，`<PROJECT_ID>:<DATASET_NAME>.<DEADLETTER_TABLE>`。                                                                                                   |          |                                                                                                                                                                                                                              |
| `query`                 | 用于从 BigQuery 读取数据的 SQL 查询。如果 BigQuery 数据集位于与 Dataflow 作业不同的项目中，请在 SQL 查询中指定完整数据集名称，例如：`<PROJECT_ID>.<DATASET_NAME>.<TABLE_NAME>`。默认使用 [GoogleSQL](https://cloud.google.com/bigquery/docs/introduction-sql)，除非 `useLegacySql` 为 true。   |          | 你必须指定 `inputTableSpec` 或 `query` 之一。如果同时设置了这两个参数，模板将使用 `query` 参数。示例：`SELECT * FROM sampledb.sample_table`。                                                                            |
| `useLegacySql`          | 设置为 `true` 以使用遗留 SQL。此参数仅在使用 `query` 参数时适用。默认为 `false`。                                                                                                                                                                                                                    |          |                                                                                                                                                                                                                              |
| `queryLocation`         | 在没有底层表权限的情况下从授权视图读取时需要。例如，`US`。                                                                                                                                                                                                                                              |          |                                                                                                                                                                                                                              |
| `queryTempDataset`      | 设置一个现有数据集，以创建临时表以存储查询结果。例如，`temp_dataset`。                                                                                                                                                                                                                                |          |                                                                                                                                                                                                                              |
| `KMSEncryptionKey`      | 如果使用查询源从 BigQuery 读取，请使用此 Cloud KMS 密钥加密创建的任何临时表。例如，`projects/your-project/locations/global/keyRings/your-keyring/cryptoKeys/your-key`。                                                                                                                            |          |                                                                                                                                                                                                                              |


:::note
所有 `ClickHouseIO` 参数的默认值可以在 [`ClickHouseIO` Apache Beam 连接器](/integrations/apache-beam#clickhouseiowrite-parameters) 中找到。
:::

## 源和目标表的架构 {#source-and-target-tables-schema}

为了有效地将 BigQuery 数据集加载到 ClickHouse，并进行列匹配过程，遵循以下阶段：

1. 模板根据目标 ClickHouse 表构建架构对象。
2. 模板迭代 BigQuery 数据集，并试图根据列名进行匹配。

<br/>

:::important
也就是说，您的 BigQuery 数据集（表或查询）必须与您的 ClickHouse 目标表具有完全相同的列名。
:::

## 数据类型映射 {#data-types-mapping}

BigQuery 类型根据您的 ClickHouse 表定义进行转换。因此，上表列出了您在目标 ClickHouse 表中应具备的推荐映射（对于给定的 BigQuery 表/查询）：

| BigQuery 类型                                                                                                         | ClickHouse 类型                                               | 备注                                                                                                                                                                                                                                                                                                                                                                                                                    |
|-----------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [**数组类型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)                    | [**数组类型**](../../../sql-reference/data-types/array)        | 内部类型必须是此表中列出的受支持原始数据类型之一。                                                                                                                                                                                                                                                                                                                            |
| [**布尔类型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)                  | [**布尔型**](../../../sql-reference/data-types/boolean)       |                                                                                                                                                                                                                                                                                                                                                                                                                          |
| [**日期类型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)                     | [**日期类型**](../../../sql-reference/data-types/date)         |                                                                                                                                                                                                                                                                                                                                                                                                                          |
| [**日期时间类型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type)              | [**日期时间类型**](../../../sql-reference/data-types/datetime)  | 也适用于 `Enum8`、`Enum16` 和 `FixedString`。                                                                                                                                                                                                                                                                                                                                                          |
| [**字符串类型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)                   | [**字符串类型**](../../../sql-reference/data-types/string)     | 在 BigQuery 中，所有 Int 类型（`INT`、`SMALLINT`、`INTEGER`、`BIGINT`、`TINYINT`、`BYTEINT`）都是 `INT64` 的别名。我们建议您在 ClickHouse 中设置正确的整数大小，因为模板将根据定义的列类型（`Int8`、`Int16`、`Int32`、`Int64`）转换列。                                                                                                   |
| [**数值 - 整数类型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)          | [**整数类型**](../../../sql-reference/data-types/int-uint)    | 在 BigQuery 中，所有 Int 类型（`INT`、`SMALLINT`、`INTEGER`、`BIGINT`、`TINYINT`、`BYTEINT`）都是 `INT64` 的别名。我们建议您在 ClickHouse 中设置正确的整数大小，因为模板将根据定义的列类型（`Int8`、`Int16`、`Int32`、`Int64`）转换列。模板还会转换在 ClickHouse 表中使用的未分配 Int 类型（`UInt8`、`UInt16`、`UInt32`、`UInt64`）。   |
| [**数值 - 浮点类型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)              | [**浮点类型**](../../../sql-reference/data-types/float)        | 支持的 ClickHouse 类型：`Float32` 和 `Float64`                                                                                                                                                                                                                                                                                                                                                                    |

## 运行模板 {#running-the-template}

BigQuery 到 ClickHouse 模板可通过 Google Cloud CLI 执行。

:::note
请确保查看本文档，特别是上述部分，以完全理解模板的配置要求和先决条件。
:::

### 安装和配置 `gcloud` CLI {#install--configure-gcloud-cli}

- 如果尚未安装，请安装 [`gcloud` CLI](https://cloud.google.com/sdk/docs/install)。
- 在 [本指南](https://cloud.google.com/dataflow/docs/guides/templates/using-flex-templates#before-you-begin) 的 `开始之前` 部分中，按照说明进行必要的配置、设置和权限，以运行 DataFlow 模板。

### 运行命令 {#run-command}

使用 [`gcloud dataflow flex-template run`](https://cloud.google.com/sdk/gcloud/reference/dataflow/flex-template/run) 命令运行使用 Flex 模板的 Dataflow 作业。

以下是命令的示例：

```bash
gcloud dataflow flex-template run "bigquery-clickhouse-dataflow-$(date +%Y%m%d-%H%M%S)" \
 --template-file-gcs-location "gs://clickhouse-dataflow-templates/bigquery-clickhouse-metadata.json" \
 --parameters inputTableSpec="<bigquery table id>",jdbcUrl="jdbc:clickhouse://<clickhouse host>:<clickhouse port>/<schema>?ssl=true&sslmode=NONE",clickHouseUsername="<username>",clickHousePassword="<password>",clickHouseTable="<clickhouse target table>"
```

### 命令解读 {#command-breakdown}

- **作业名称：** `run` 关键字后面的文本是唯一的作业名称。
- **模板文件：** 由 `--template-file-gcs-location` 指定的 JSON 文件定义模板结构和接受的参数详细信息。提及的文件路径是公开的，可以使用。
- **参数：** 参数用逗号分隔。对于基于字符串的参数，将值用双引号括起来。

### 预期响应 {#expected-response}

运行命令后，您应该会看到类似于以下内容的响应：

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

### 监控作业 {#monitor-the-job}

导航到 [Dataflow 作业选项卡](https://console.cloud.google.com/dataflow/jobs) 在您的 Google Cloud 控制台中，监控作业的状态。您将找到作业详细信息，包括进度和任何错误：

<Image img={dataflow_inqueue_job} size="lg" border alt="DataFlow 控制台显示正在运行的 BigQuery 到 ClickHouse 作业" />

## 故障排除 {#troubleshooting}

### 代码: 241. DB::Exception: 内存限制（总）超出 {#code-241-dbexception-memory-limit-total-exceeded}

当 ClickHouse 在处理大批量数据时内存不足时，会发生此错误。要解决此问题：

* 增加实例资源：将您的 ClickHouse 服务器升级到更大的实例，并提供更多内存以处理数据处理负载。
* 减小批量大小：调整 Dataflow 作业配置中的批量大小，将较小的数据块发送到 ClickHouse，从而减少每个批次的内存消耗。
这些更改可能有助于在数据摄取期间平衡资源使用。

## 模板源代码 {#template-source-code}

模板的源代码可以在 ClickHouse 的 [DataflowTemplates](https://github.com/ClickHouse/DataflowTemplates) 分支中找到。
