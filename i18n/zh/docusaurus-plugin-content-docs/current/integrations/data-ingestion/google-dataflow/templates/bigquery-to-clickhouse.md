---
sidebar_label: 'BigQuery 到 ClickHouse'
sidebar_position: 1
slug: /integrations/google-dataflow/templates/bigquery-to-clickhouse
description: '用户可以使用 Google Dataflow 模板将数据从 BigQuery 导入 ClickHouse'
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


# Dataflow BigQuery 到 ClickHouse 模板

BigQuery 到 ClickHouse 模板是一个批处理管道，用于将数据从 BigQuery 表导入 ClickHouse 表。
该模板可以读取整个表，或使用提供的 SQL 查询筛选特定记录。

<TOCInline toc={toc}   maxHeadingLevel={2}></TOCInline>



## 管道要求 {#pipeline-requirements}

- 源 BigQuery 表必须存在。
- 目标 ClickHouse 表必须存在。
- ClickHouse 主机必须可从 Dataflow 工作节点访问。


## 模板参数 {#template-parameters}

<br />
<br />

| 参数名称          | 参数说明                                                                                                                                                                                                                                                                                                                                              | 是否必需 | 说明                                                                                                                                                                                                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `jdbcUrl`               | ClickHouse JDBC URL,格式为 `jdbc:clickhouse://<host>:<port>/<schema>`。                                                                                                                                                                                                                                                  | ✅       | 请勿将用户名和密码作为 JDBC 选项添加。其他 JDBC 选项可以添加到 JDBC URL 末尾。对于 ClickHouse Cloud 用户,需在 `jdbcUrl` 中添加 `ssl=true&sslmode=NONE`。                                                                  |
| `clickHouseUsername`    | 用于身份验证的 ClickHouse 用户名。                                                                                                                                                                                                                                                                                                                      | ✅       |                                                                                                                                                                                                                                                                  |
| `clickHousePassword`    | 用于身份验证的 ClickHouse 密码。                                                                                                                                                                                                                                                                                                                      | ✅       |                                                                                                                                                                                                                                                                  |
| `clickHouseTable`       | 数据将插入的目标 ClickHouse 表。                                                                                                                                                                                                                                                      | ✅       |                                                                                                                                                                                                                                                                  |
| `maxInsertBlockSize`    | 插入时的最大块大小,当我们控制插入块的创建时使用(ClickHouseIO 选项)。                                                                                                                                                                                                                                    |          | `ClickHouseIO` 选项。                                                                                                                                                                                                                                         |
| `insertDistributedSync` | 如果启用此设置,向分布式表的插入查询将等待数据发送到集群中的所有节点(ClickHouseIO 选项)。                                                                                                                                                                                                                 |          | `ClickHouseIO` 选项。                                                                                                                                                                                                                                         |
| `insertQuorum`          | 对于复制表中的 INSERT 查询,等待写入到指定数量的副本并线性化数据添加。0 表示禁用。                                                                                                                                                                                                                |          | `ClickHouseIO` 选项。此设置在默认服务器配置中处于禁用状态。                                                                                                                                                                    |
| `insertDeduplicate`     | 对于复制表中的 INSERT 查询,指定是否对插入块执行去重。                                                                                                                                                                  |          | `ClickHouseIO` 选项。                                                                                                                                                                                                                                         |
| `maxRetries`            | 每次插入的最大重试次数。                                                                                                                                                                                                                                                                                              |          | `ClickHouseIO` 选项。                                                                                                                                                                                                                                         |
| `InputTableSpec`        | 要读取的 BigQuery 表。需指定 `inputTableSpec` 或 `query` 之一。当两者都设置时,`query` 参数优先。示例:`<BIGQUERY_PROJECT>:<DATASET_NAME>.<INPUT_TABLE>`。                                                                                                                                                |          | 使用 [BigQuery Storage Read API](https://cloud.google.com/bigquery/docs/reference/storage) 直接从 BigQuery 存储读取数据。请注意 [Storage Read API 限制](https://cloud.google.com/bigquery/docs/reference/storage#limitations)。 |
| `outputDeadletterTable` | 用于存储未能到达输出表的消息的 BigQuery 表。如果表不存在,将在管道执行期间创建。如果未指定,则使用 `<outputTableSpec>_error_records`。例如:`<PROJECT_ID>:<DATASET_NAME>.<DEADLETTER_TABLE>`。                                                                              |          |                                                                                                                                                                                                                                                                  |
| `query`                 | 用于从 BigQuery 读取数据的 SQL 查询。如果 BigQuery 数据集与 Dataflow 作业位于不同的项目中,请在 SQL 查询中指定完整的数据集名称,例如:`<PROJECT_ID>.<DATASET_NAME>.<TABLE_NAME>`。除非 `useLegacySql` 为 true,否则默认使用 [GoogleSQL](https://cloud.google.com/bigquery/docs/introduction-sql)。 |          | 必须指定 `inputTableSpec` 或 `query` 之一。如果同时设置两个参数,模板将使用 `query` 参数。示例:`SELECT * FROM sampledb.sample_table`。                                                                                        |
| `useLegacySql`          | 设置为 `true` 以使用旧版 SQL。此参数仅在使用 `query` 参数时适用。默认为 `false`。                                                                                                                                                                                                                                |          |                                                                                                                                                                                                                                                                  |
| `queryLocation`         | 在没有底层表权限的情况下从授权视图读取时需要。例如:`US`。                                                                                                                                                          |          |                                                                                                                                                                                                                                                                  |
| `queryTempDataset`      | 设置一个现有数据集以创建临时表来存储查询结果。例如:`temp_dataset`。                                                                                                                                                                                                              |          |                                                                                                                                                                                                                                                                  |
| `KMSEncryptionKey`      | 如果使用查询源从 BigQuery 读取,请使用此 Cloud KMS 密钥加密创建的任何临时表。例如:`projects/your-project/locations/global/keyRings/your-keyring/cryptoKeys/your-key`。                                                                                  |          |                                                                                                                                                                                                                                                                  |


:::note
所有 `ClickHouseIO` 参数的默认值可在 [`ClickHouseIO` Apache Beam 连接器](/integrations/apache-beam#clickhouseiowrite-parameters) 中找到。
:::



## 源表和目标表架构 {#source-and-target-tables-schema}

为了有效地将 BigQuery 数据集加载到 ClickHouse 中,数据管道会执行列推断过程,包含以下阶段:

1. 模板基于目标 ClickHouse 表构建架构对象。
2. 模板遍历 BigQuery 数据集,并尝试根据列名称进行列匹配。

<br />

:::important
也就是说,您的 BigQuery 数据集(无论是表还是查询)必须与 ClickHouse 目标表具有完全相同的列名称。
:::


## 数据类型映射 {#data-types-mapping}

BigQuery 类型会根据您的 ClickHouse 表定义进行转换。因此,下表列出了针对给定 BigQuery 表/查询,您在目标 ClickHouse 表中应使用的推荐映射:

| BigQuery 类型                                                                                                         | ClickHouse 类型                                                 | 说明                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [**Array Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)                 | [**Array Type**](../../../sql-reference/data-types/array)       | 内部类型必须是本表中列出的受支持基本数据类型之一。                                                                                                                                                                                                                                                                                                                 |
| [**Boolean Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)             | [**Bool Type**](../../../sql-reference/data-types/boolean)      |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**Date Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)                   | [**Date Type**](../../../sql-reference/data-types/date)         |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**Datetime Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type)           | [**Datetime Type**](../../../sql-reference/data-types/datetime) | 同样适用于 `Enum8`、`Enum16` 和 `FixedString`。                                                                                                                                                                                                                                                                                                                                                                |
| [**String Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)               | [**String Type**](../../../sql-reference/data-types/string)     | 在 BigQuery 中,所有整数类型(`INT`、`SMALLINT`、`INTEGER`、`BIGINT`、`TINYINT`、`BYTEINT`)都是 `INT64` 的别名。我们建议您在 ClickHouse 中设置正确的整数大小,因为模板将根据定义的列类型(`Int8`、`Int16`、`Int32`、`Int64`)进行转换。                                                                                                                          |
| [**Numeric - Integer Types**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types) | [**Integer Types**](../../../sql-reference/data-types/int-uint) | 在 BigQuery 中,所有整数类型(`INT`、`SMALLINT`、`INTEGER`、`BIGINT`、`TINYINT`、`BYTEINT`)都是 `INT64` 的别名。我们建议您在 ClickHouse 中设置正确的整数大小,因为模板将根据定义的列类型(`Int8`、`Int16`、`Int32`、`Int64`)进行转换。如果在 ClickHouse 表中使用无符号整数类型(`UInt8`、`UInt16`、`UInt32`、`UInt64`),模板也会进行转换。 |
| [**Numeric - Float Types**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)   | [**Float Types**](../../../sql-reference/data-types/float)      | 支持的 ClickHouse 类型:`Float32` 和 `Float64`                                                                                                                                                                                                                                                                                                                                                                    |


## 运行模板 {#running-the-template}

BigQuery 到 ClickHouse 模板可通过 Google Cloud CLI 执行。

:::note
请务必查看本文档,特别是上述章节,以充分了解模板的配置要求和前置条件。

:::

<Tabs>
  <TabItem value="console" label="Google Cloud 控制台" default>
    登录您的 Google Cloud 控制台并搜索 DataFlow。

1. 点击 `CREATE JOB FROM TEMPLATE` 按钮
   <Image
     img={dataflow_create_job_from_template_button}
     border
     alt='DataFlow 控制台'
   />
2. 模板表单打开后,输入作业名称并选择所需区域。
   <Image
     img={dataflow_template_initial_form}
     border
     alt='DataFlow 模板初始表单'
   />
3. 在 `DataFlow Template` 输入框中,输入 `ClickHouse` 或 `BigQuery`,然后选择 `BigQuery to ClickHouse` 模板
   <Image
     img={dataflow_template_clickhouse_search}
     border
     alt='选择 BigQuery 到 ClickHouse 模板'
   />
4. 选择后,表单将展开以允许您提供其他详细信息:
   - ClickHouse 服务器 JDBC URL,格式为 `jdbc:clickhouse://host:port/schema`。
   - ClickHouse 用户名。
   - ClickHouse 目标表名称。

<br />

:::note
ClickHouse 密码选项标记为可选,适用于未配置密码的使用场景。
要添加密码,请向下滚动到 `Password for ClickHouse Endpoint` 选项。
:::

<Image
  img={dataflow_extended_template_form}
  border
  alt='BigQuery 到 ClickHouse 扩展模板表单'
/>

5. 自定义并添加任何 BigQuery/ClickHouseIO 相关配置,详见[模板参数](#template-parameters)章节

  </TabItem>
  <TabItem value="cli" label="Google Cloud CLI">

### 安装和配置 `gcloud` CLI {#install--configure-gcloud-cli}

- 如果尚未安装,请安装 [`gcloud` CLI](https://cloud.google.com/sdk/docs/install)。
- 按照[本指南](https://cloud.google.com/dataflow/docs/guides/templates/using-flex-templates#before-you-begin)中的 `Before you begin` 章节设置运行 DataFlow 模板所需的配置、设置和权限。

### 运行命令 {#run-command}

使用 [`gcloud dataflow flex-template run`](https://cloud.google.com/sdk/gcloud/reference/dataflow/flex-template/run) 命令运行使用 Flex Template 的 Dataflow 作业。

以下是命令示例:

```bash
gcloud dataflow flex-template run "bigquery-clickhouse-dataflow-$(date +%Y%m%d-%H%M%S)" \
 --template-file-gcs-location "gs://clickhouse-dataflow-templates/bigquery-clickhouse-metadata.json" \
 --parameters inputTableSpec="<bigquery table id>",jdbcUrl="jdbc:clickhouse://<clickhouse host>:<clickhouse port>/<schema>?ssl=true&sslmode=NONE",clickHouseUsername="<username>",clickHousePassword="<password>",clickHouseTable="<clickhouse target table>"
```

### 命令详解 {#command-breakdown}

- **作业名称:** `run` 关键字后面的文本是唯一的作业名称。
- **模板文件:** 由 `--template-file-gcs-location` 指定的 JSON 文件定义了模板结构和接受的参数详情。所提到的文件路径是公开的,可直接使用。
- **参数:** 参数之间用逗号分隔。对于字符串类型的参数,请用双引号括起值。

### 预期响应 {#expected-response}

运行命令后,您应该会看到类似以下的响应:

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

导航到 Google Cloud 控制台中的 [Dataflow Jobs 标签页](https://console.cloud.google.com/dataflow/jobs)以监控作业状态。您将看到作业详情,包括进度和任何错误:


<Image img={dataflow_inqueue_job} size="lg" border alt="DataFlow 控制台显示一个正在运行的 BigQuery 到 ClickHouse 作业" />



## 故障排除 {#troubleshooting}

### 内存限制(总量)超出错误(代码 241) {#code-241-dbexception-memory-limit-total-exceeded}

当 ClickHouse 在处理大批量数据时内存不足会发生此错误。解决方法如下:

- 增加实例资源:将 ClickHouse 服务器升级到内存更大的实例,以应对数据处理负载。
- 减小批次大小:在 Dataflow 作业配置中调整批次大小,向 ClickHouse 发送更小的数据块,从而降低每个批次的内存消耗。这些调整有助于在数据摄取过程中平衡资源使用。


## 模板源代码 {#template-source-code}

该模板的源代码可在 ClickHouse 的 [DataflowTemplates](https://github.com/ClickHouse/DataflowTemplates) fork 中获取。
