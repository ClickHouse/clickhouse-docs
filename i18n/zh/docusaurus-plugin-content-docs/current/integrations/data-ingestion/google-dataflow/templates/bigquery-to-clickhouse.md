---
'sidebar_label': 'BigQuery 到 ClickHouse'
'sidebar_position': 1
'slug': '/integrations/google-dataflow/templates/bigquery-to-clickhouse'
'description': '用户可以使用 Google Dataflow 模板将数据从 BigQuery 导入到 ClickHouse'
'title': '数据流 BigQuery 到 ClickHouse 模板'
'doc_type': 'guide'
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


# Dataflow BigQuery to ClickHouse 模板

BigQuery 到 ClickHouse 模板是一个批处理管道，用于将数据从 BigQuery 表导入 ClickHouse 表。该模板可以读取整个表或使用提供的 SQL 查询过滤特定记录。

<TOCInline toc={toc}   maxHeadingLevel={2}></TOCInline>

## 管道要求 {#pipeline-requirements}

* 源 BigQuery 表必须存在。
* 目标 ClickHouse 表必须存在。
* ClickHouse 主机必须可从 Dataflow 工作节点访问。

## 模板参数 {#template-parameters}

<br/>
<br/>

| 参数名称               | 参数描述                                                                                                                                                                                                                                                                                                                                 | 是否必需 | 备注                                                                                                                                                                                                                                                |
|---------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `jdbcUrl`           | ClickHouse JDBC URL，格式为 `jdbc:clickhouse://<host>:<port>/<schema>`。                                                                                                                                                                                                                                                                 | ✅      | 不要将用户名和密码作为 JDBC 选项添加。可以在 JDBC URL 的末尾添加其他 JDBC 选项。对于 ClickHouse Cloud 用户，请在 `jdbcUrl` 中添加 `ssl=true&sslmode=NONE`。                                             |
| `clickHouseUsername`| 用于身份验证的 ClickHouse 用户名。                                                                                                                                                                                                                                                                                                      | ✅      |                                                                                                                                                                                                                                                    |
| `clickHousePassword`| 用于身份验证的 ClickHouse 密码。                                                                                                                                                                                                                                                                                                      | ✅      |                                                                                                                                                                                                                                                    |
| `clickHouseTable`   | 数据将被插入的目标 ClickHouse 表。                                                                                                                                                                                                                                                                                                   | ✅      |                                                                                                                                                                                                                                                    |
| `maxInsertBlockSize`| 控制插入块创建的最大块大小（ClickHouseIO 选项）。                                                                                                                                                                                                                                                                                      |        | `ClickHouseIO` 选项。                                                                                                                                                                                                                            |
| `insertDistributedSync`| 如果启用设置，插入查询到分布式等待，直到所有集群节点都收到数据。（ClickHouseIO 选项）。                                                                                                                                                                                                 |        | `ClickHouseIO` 选项。                                                                                                                                                                                                                            |
| `insertQuorum`      | 对于复制表中的 INSERT 查询，等待指定数量的副本写入并线性化数据添加。 0 - 禁用。                                                                                                                                                                                                                                                        |        | `ClickHouseIO` 选项。此设置在默认服务器设置中禁用。                                                                                                                                                                                           |
| `insertDeduplicate` | 对于复制表中的 INSERT 查询，指定应执行插入块的去重。                                                                                                                                                                                                                                                                                     |        | `ClickHouseIO` 选项。                                                                                                                                                                                                                            |
| `maxRetries`        | 每次插入的最大重试次数。                                                                                                                                                                                                                                                                                                                  |        | `ClickHouseIO` 选项。                                                                                                                                                                                                                            |
| `InputTableSpec`    | 要读取的 BigQuery 表。指定 `inputTableSpec` 或 `query` 之一。如果两者都设置，`query` 参数优先。示例：`<BIGQUERY_PROJECT>:<DATASET_NAME>.<INPUT_TABLE>`。                                                                                                                                   |        | 使用 [BigQuery Storage Read API](https://cloud.google.com/bigquery/docs/reference/storage) 直接从 BigQuery 存储读取数据。请注意 [Storage Read API 限制](https://cloud.google.com/bigquery/docs/reference/storage#limitations)。 |
| `outputDeadletterTable` | 用于存储未能到达输出表的消息的 BigQuery 表。如果表不存在，则在管道执行期间创建。如果未指定，则使用 `<outputTableSpec>_error_records`。例如，`<PROJECT_ID>:<DATASET_NAME>.<DEADLETTER_TABLE>`。                                                                                    |        |                                                                                                                                                                                                                                                    |
| `query`             | 用于从 BigQuery 读取数据的 SQL 查询。如果 BigQuery 数据集在与 Dataflow 作业不同的项目中，请在 SQL 查询中指定完整的数据集名称，例如：`<PROJECT_ID>.<DATASET_NAME>.<TABLE_NAME>`。默认为 [GoogleSQL](https://cloud.google.com/bigquery/docs/introduction-sql)，除非 `useLegacySql` 为 true。                         |        | 必须指定 `inputTableSpec` 或 `query` 中的一个。如果同时设置两个参数，则模板使用 `query` 参数。示例：`SELECT * FROM sampledb.sample_table`。                                                                                            |
| `useLegacySql`      | 设置为 `true` 以使用传统 SQL。此参数仅在使用 `query` 参数时适用。默认为 `false`。                                                                                                                                                                                                                                                      |        |                                                                                                                                                                                                                                                    |
| `queryLocation`     | 当从没有底层表权限的授权视图中读取时需要。例如，`US`。                                                                                                                                                                                                                                                                                 |        |                                                                                                                                                                                                                                                    |
| `queryTempDataset`  | 设置现有数据集以创建临时表以存储查询结果。例如，`temp_dataset`。                                                                                                                                                                                                                                                                             |        |                                                                                                                                                                                                                                                    |
| `KMSEncryptionKey`  | 如果使用查询源从 BigQuery 读取，请使用此 Cloud KMS 密钥加密创建的任何临时表。例如，`projects/your-project/locations/global/keyRings/your-keyring/cryptoKeys/your-key`。                                                                                                                                          |        |                                                                                                                                                                                                                                                    |

:::note
所有 `ClickHouseIO` 参数的默认值可以在 [`ClickHouseIO` Apache Beam Connector](/integrations/apache-beam#clickhouseiowrite-parameters) 中找到。
:::

## 源和目标表架构 {#source-and-target-tables-schema}

为了有效地将 BigQuery 数据集加载到 ClickHouse，管道执行以下阶段的列推断过程：

1. 模板根据目标 ClickHouse 表构建架构对象。
2. 模板遍历 BigQuery 数据集，并根据列名尝试匹配列。

<br/>

:::important
也就是说，您的 BigQuery 数据集（表或查询）必须与 ClickHouse 目标表具有完全相同的列名。
:::

## 数据类型映射 {#data-types-mapping}

BigQuery 类型根据您的 ClickHouse 表定义进行转换。因此，上表列出了您在目标 ClickHouse 表中应具备的推荐映射（针对给定的 BigQuery 表/查询）：

| BigQuery 类型                                                                                                         | ClickHouse 类型                                                 | 备注                                                                                                                                                                                                                                                                                                                                                                                                                                           |
|-----------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [**数组类型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)                  | [**数组类型**](../../../sql-reference/data-types/array)       | 内部类型必须是此表中列出的有效原始数据类型之一。                                                                                                                                                                                                                                                                                                                                                                                       |
| [**布尔类型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)                | [**布尔类型**](../../../sql-reference/data-types/boolean)      |                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| [**日期类型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)                    | [**日期类型**](../../../sql-reference/data-types/date)         |                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| [**日期时间类型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type)            | [**日期时间类型**](../../../sql-reference/data-types/datetime) | 同样适用于 `Enum8`、`Enum16` 和 `FixedString`。                                                                                                                                                                                                                                                                                                                                                                                           |
| [**字符串类型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)                | [**字符串类型**](../../../sql-reference/data-types/string)     | 在 BigQuery 中，所有整数类型（`INT`、`SMALLINT`、`INTEGER`、`BIGINT`、`TINYINT`、`BYTEINT`）都是 `INT64` 的别名。我们建议您在 ClickHouse 设置正确的整数大小，因为模板会根据定义的列类型转换列（`Int8`、`Int16`、`Int32`、`Int64`）。                                                                          |
| [**数字 - 整数类型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)           | [**整数类型**](../../../sql-reference/data-types/int-uint)      | 在 BigQuery 中，所有整数类型（`INT`、`SMALLINT`、`INTEGER`、`BIGINT`、`TINYINT`、`BYTEINT`）都是 `INT64` 的别名。我们建议您在 ClickHouse 设置正确的整数大小，因为模板会根据定义的列类型转换列（`Int8`、`Int16`、`Int32`、`Int64`）。模板还会转换在 ClickHouse 表中使用的未指定整数类型（`UInt8`、`UInt16`、`UInt32`、`UInt64`）。                                 |
| [**数字 - 浮点类型**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)           | [**浮点类型**](../../../sql-reference/data-types/float)         | 支持的 ClickHouse 类型：`Float32` 和 `Float64`                                                                                                                                                                                                                                                                                                                                                                                       |

## 运行模板 {#running-the-template}

BigQuery 到 ClickHouse 模板可通过 Google Cloud CLI 执行。

:::note
务必查看本文档，特别是上述部分，以全面了解模板的配置要求和先决条件。
:::

<Tabs>
  <TabItem value="console" label="Google Cloud 控制台" default>
    登录到您的 Google Cloud 控制台并搜索 DataFlow。

1. 按下 `CREATE JOB FROM TEMPLATE` 按钮
   <Image img={dataflow_create_job_from_template_button} border alt="DataFlow console" />
2. 模板表单打开后，输入作业名称并选择所需区域。
   <Image img={dataflow_template_initial_form} border alt="DataFlow template initial form" />
3. 在 `DataFlow Template` 输入框中，输入 `ClickHouse` 或 `BigQuery`，并选择 `BigQuery 到 ClickHouse` 模板
   <Image img={dataflow_template_clickhouse_search} border alt="Select BigQuery to ClickHouse template" />
4. 选中后，表单将展开以允许您提供其他详细信息：
    * ClickHouse 服务器 JDBC URL，格式为 `jdbc:clickhouse://host:port/schema`。
    * ClickHouse 用户名。
    * ClickHouse 目标表名称。

<br/>

:::note
ClickHouse 密码选项被标记为可选，适用于未配置密码的用例。
要添加它，请向下滚动到 `Password for ClickHouse Endpoint` 选项。
:::

<Image img={dataflow_extended_template_form} border alt="BigQuery to ClickHouse extended template form" />

5. 根据 [模板参数](#template-parameters) 部分的详细信息自定义并添加任何与 BigQuery/ClickHouseIO 相关的配置。

  </TabItem>
  <TabItem value="cli" label="Google Cloud CLI">

### 安装与配置 `gcloud` CLI {#install--configure-gcloud-cli}

- 如果尚未安装，请安装 [`gcloud` CLI](https://cloud.google.com/sdk/docs/install)。
- 请遵循 [this guide](https://cloud.google.com/dataflow/docs/guides/templates/using-flex-templates#before-you-begin) 中的 `Before you begin` 部分，为运行 DataFlow 模板设置所需的配置、设置和权限。

### 运行命令 {#run-command}

使用 [`gcloud dataflow flex-template run`](https://cloud.google.com/sdk/gcloud/reference/dataflow/flex-template/run) 命令运行一个使用 Flex Template 的 Dataflow 作业。

以下是命令的示例：

```bash
gcloud dataflow flex-template run "bigquery-clickhouse-dataflow-$(date +%Y%m%d-%H%M%S)" \
 --template-file-gcs-location "gs://clickhouse-dataflow-templates/bigquery-clickhouse-metadata.json" \
 --parameters inputTableSpec="<bigquery table id>",jdbcUrl="jdbc:clickhouse://<clickhouse host>:<clickhouse port>/<schema>?ssl=true&sslmode=NONE",clickHouseUsername="<username>",clickHousePassword="<password>",clickHouseTable="<clickhouse target table>"
```

### 命令分解 {#command-breakdown}

- **作业名称：** 跟随 `run` 关键字的文本是唯一的作业名称。
- **模板文件：** 由 `--template-file-gcs-location` 指定的 JSON 文件定义了模板结构以及接受的参数的详细信息。提到的文件路径是公共的并准备好使用。
- **参数：** 参数用逗号分隔。对于基于字符串的参数，将值用双引号括起来。

### 预期响应 {#expected-response}

运行命令后，您应该看到类似于以下的响应：

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

导航到您的 Google Cloud 控制台中的 [Dataflow Jobs tab](https://console.cloud.google.com/dataflow/jobs) 以监控作业的状态。您将找到作业的详细信息，包括进度和任何错误：

<Image img={dataflow_inqueue_job} size="lg" border alt="DataFlow console showing a running BigQuery to ClickHouse job" />

## 故障排除 {#troubleshooting}

### 内存限制（总）超出错误（代码 241） {#code-241-dbexception-memory-limit-total-exceeded}

当 ClickHouse 在处理大型数据批次时内存不足时，会出现此错误。为解决此问题：

* 增加实例资源：将 ClickHouse 服务器升级到更大的实例，以便拥有更多内存来处理数据处理负荷。
* 减少批量大小：调整 Dataflow 作业配置中的批量大小，以便将较小的数据块发送到 ClickHouse，降低每个批次的内存消耗。这些更改可以帮助在数据摄取期间平衡资源使用。

## 模板源代码 {#template-source-code}

模板的源代码可在 ClickHouse 的 [DataflowTemplates](https://github.com/ClickHouse/DataflowTemplates) 分支中找到。
