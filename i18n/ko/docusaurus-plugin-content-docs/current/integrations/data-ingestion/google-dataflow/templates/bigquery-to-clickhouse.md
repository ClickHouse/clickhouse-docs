---
'sidebar_label': 'BigQuery에서 ClickHouse'
'sidebar_position': 1
'slug': '/integrations/google-dataflow/templates/bigquery-to-clickhouse'
'description': '사용자는 Google Dataflow 템플릿을 사용하여 BigQuery에서 ClickHouse로 데이터를 수집할 수 있습니다.'
'title': 'Dataflow BigQuery에서 ClickHouse 템플릿'
'doc_type': 'guide'
'keywords':
- 'Dataflow'
- 'BigQuery'
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



# Dataflow BigQuery to ClickHouse template

The BigQuery to ClickHouse template is a batch pipeline that ingests data from a BigQuery table into a ClickHouse table.
The template can read the entire table or filter specific records using a provided SQL query.

<TOCInline toc={toc}   maxHeadingLevel={2}></TOCInline>

## Pipeline requirements {#pipeline-requirements}

* The source BigQuery table must exist.
* The target ClickHouse table must exist.
* The ClickHouse host must be accessible from the Dataflow worker machines.

## Template parameters {#template-parameters}

<br/>
<br/>

| Parameter Name          | Parameter Description                                                                                                                                                                                                                                                                                                                              | Required | Notes                                                                                                                                                                                                                                                            |
|-------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `jdbcUrl`               | The ClickHouse JDBC URL in the format `jdbc:clickhouse://<host>:<port>/<schema>`.                                                                                                                                                                                                                                                                  | ✅        | Don't add the username and password as JDBC options. Any other JDBC option could be added at the end of the JDBC URL. For ClickHouse Cloud users, add `ssl=true&sslmode=NONE` to the `jdbcUrl`.                                                                  |
| `clickHouseUsername`    | The ClickHouse username to authenticate with.                                                                                                                                                                                                                                                                                                      | ✅        |                                                                                                                                                                                                                                                                  |
| `clickHousePassword`    | The ClickHouse password to authenticate with.                                                                                                                                                                                                                                                                                                      | ✅        |                                                                                                                                                                                                                                                                  |
| `clickHouseTable`       | The target ClickHouse table into which data will be inserted.                                                                                                                                                                                                                                                                                      | ✅        |                                                                                                                                                                                                                                                                  |
| `maxInsertBlockSize`    | The maximum block size for insertion, if we control the creation of blocks for insertion (ClickHouseIO option).                                                                                                                                                                                                                                    |          | A `ClickHouseIO` option.                                                                                                                                                                                                                                         |
| `insertDistributedSync` | If setting is enabled, insert query into distributed waits until data will be sent to all nodes in cluster. (ClickHouseIO option).                                                                                                                                                                                                                 |          | A `ClickHouseIO` option.                                                                                                                                                                                                                                         |
| `insertQuorum`          | For INSERT queries in the replicated table, wait writing for the specified number of replicas and linearize the addition of the data. 0 - disabled.                                                                                                                                                                                                |          | A `ClickHouseIO` option. This setting is disabled in default server settings.                                                                                                                                                                                    |
| `insertDeduplicate`     | For INSERT queries in the replicated table, specifies that deduplication of inserting blocks should be performed.                                                                                                                                                                                                                                  |          | A `ClickHouseIO` option.                                                                                                                                                                                                                                         |
| `maxRetries`            | Maximum number of retries per insert.                                                                                                                                                                                                                                                                                                              |          | A `ClickHouseIO` option.                                                                                                                                                                                                                                         |
| `InputTableSpec`        | The BigQuery table to read from. Specify either `inputTableSpec` or `query`. When both are set, the `query` parameter takes precedence. Example: `<BIGQUERY_PROJECT>:<DATASET_NAME>.<INPUT_TABLE>`.                                                                                                                                                |          | Reads data directly from BigQuery storage using the [BigQuery Storage Read API](https://cloud.google.com/bigquery/docs/reference/storage). Be aware of the [Storage Read API limitations](https://cloud.google.com/bigquery/docs/reference/storage#limitations). |
| `outputDeadletterTable` | The BigQuery table for messages that failed to reach the output table. If a table doesn't exist, it is created during pipeline execution. If not specified, `<outputTableSpec>_error_records` is used. For example, `<PROJECT_ID>:<DATASET_NAME>.<DEADLETTER_TABLE>`.                                                                              |          |                                                                                                                                                                                                                                                                  |
| `query`                 | The SQL query to use to read data from BigQuery. If the BigQuery dataset is in a different project than the Dataflow job, specify the full dataset name in the SQL query, for example: `<PROJECT_ID>.<DATASET_NAME>.<TABLE_NAME>`. Defaults to [GoogleSQL](https://cloud.google.com/bigquery/docs/introduction-sql) unless `useLegacySql` is true. |          | You must specify either `inputTableSpec` or `query`. If you set both parameters, the template uses the `query` parameter. Example: `SELECT * FROM sampledb.sample_table`.                                                                                        |
| `useLegacySql`          | Set to `true` to use legacy SQL. This parameter only applies when using the `query` parameter. Defaults to `false`.                                                                                                                                                                                                                                |          |                                                                                                                                                                                                                                                                  |
| `queryLocation`         | Needed when reading from an authorized view without the underlying table's permission. For example, `US`.                                                                                                                                                                                                                                          |          |                                                                                                                                                                                                                                                                  |
| `queryTempDataset`      | Set an existing dataset to create the temporary table to store the results of the query. For example, `temp_dataset`.                                                                                                                                                                                                                              |          |                                                                                                                                                                                                                                                                  |
| `KMSEncryptionKey`      | If reading from BigQuery using the query source, use this Cloud KMS key to encrypt any temporary tables created. For example, `projects/your-project/locations/global/keyRings/your-keyring/cryptoKeys/your-key`.                                                                                                                                  |          |                                                                                                                                                                                                                                                                  |

:::note
Default values for all `ClickHouseIO` parameters can be found in [`ClickHouseIO` Apache Beam Connector](/integrations/apache-beam#clickhouseiowrite-parameters)
:::

## Source and target tables schema {#source-and-target-tables-schema}

To effectively load the BigQuery dataset into ClickHouse, the pipeline performs a column inference process with the following phases:

1. The templates build a schema object based on the target ClickHouse table.
2. The templates iterate over the BigQuery dataset, and attempts to match columns based on their names.

<br/>

:::important
Having said that, your BigQuery dataset (either table or query) must have the exact same column names as your ClickHouse
target table.
:::

## Data type mapping {#data-types-mapping}

The BigQuery types are converted based on your ClickHouse table definition. Therefore, the above table lists the
recommended mapping you should have in your target ClickHouse table (for a given BigQuery table/query):

| BigQuery Type                                                                                                         | ClickHouse Type                                                 | Notes                                                                                                                                                                                                                                                                                                                                                                                                                  |
|-----------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [**Array Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)                 | [**Array Type**](../../../sql-reference/data-types/array)       | The inner type must be one of the supported primitive data types listed in this table.                                                                                                                                                                                                                                                                                                                                 |
| [**Boolean Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)             | [**Bool Type**](../../../sql-reference/data-types/boolean)      |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**Date Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)                   | [**Date Type**](../../../sql-reference/data-types/date)         |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**Datetime Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type)           | [**Datetime Type**](../../../sql-reference/data-types/datetime) | Works as well with `Enum8`, `Enum16` and `FixedString`.                                                                                                                                                                                                                                                                                                                                                                |
| [**String Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)               | [**String Type**](../../../sql-reference/data-types/string)     | In BigQuery all Int types (`INT`, `SMALLINT`, `INTEGER`, `BIGINT`, `TINYINT`, `BYTEINT`) are aliases to `INT64`. We recommend you setting in ClickHouse the right Integer size, as the template will convert the column based on the defined column type (`Int8`, `Int16`, `Int32`, `Int64`).                                                                                                                          |
| [**Numeric - Integer Types**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types) | [**Integer Types**](../../../sql-reference/data-types/int-uint) | In BigQuery all Int types (`INT`, `SMALLINT`, `INTEGER`, `BIGINT`, `TINYINT`, `BYTEINT`) are aliases to `INT64`. We recommend you setting in ClickHouse the right Integer size, as the template will convert the column based on the defined column type (`Int8`, `Int16`, `Int32`, `Int64`). The template will also convert unassigned Int types if used in ClickHouse table (`UInt8`, `UInt16`, `UInt32`, `UInt64`). |
| [**Numeric - Float Types**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)   | [**Float Types**](../../../sql-reference/data-types/float)      | Supported ClickHouse types: `Float32` and `Float64`                                                                                                                                                                                                                                                                                                                                                                    |

## Running the Template {#running-the-template}

The BigQuery to ClickHouse template is available for execution via the Google Cloud CLI.

:::note
Be sure to review this document, and specifically the above sections, to fully understand the template's configuration
requirements and prerequisites.

:::

<Tabs>
  <TabItem value="console" label="Google Cloud Console" default>
    Sign in to your Google Cloud Console and search for DataFlow.

1. Press the `CREATE JOB FROM TEMPLATE` button
   <Image img={dataflow_create_job_from_template_button} border alt="DataFlow console" />
2. Once the template form is open, enter a job name and select the desired region.
   <Image img={dataflow_template_initial_form} border alt="DataFlow template initial form" />
3. In the `DataFlow Template` input, type `ClickHouse` or  `BigQuery`, and select the `BigQuery to ClickHouse` template
   <Image img={dataflow_template_clickhouse_search} border alt="Select BigQuery to ClickHouse template" />
4. Once selected, the form will expand to allow you to provide additional details:
    * The ClickHouse server JDBC url, with the following format `jdbc:clickhouse://host:port/schema`.
    * The ClickHouse username.
    * The ClickHouse target table name.

<br/>

:::note
The ClickHouse password option is marked as optional, for use cases where there is no password configured.
To add it, please scroll down to the `Password for ClickHouse Endpoint` option.
:::

<Image img={dataflow_extended_template_form} border alt="BigQuery to ClickHouse extended template form" />

5. Customize and add any BigQuery/ClickHouseIO related configurations, as detailed in
   the [Template Parameters](#template-parameters) section

  </TabItem>
  <TabItem value="cli" label="Google Cloud CLI">

### Install & Configure `gcloud` CLI {#install--configure-gcloud-cli}

- If not already installed, install the [`gcloud` CLI](https://cloud.google.com/sdk/docs/install).
- Follow the `Before you begin` section
  in [this guide](https://cloud.google.com/dataflow/docs/guides/templates/using-flex-templates#before-you-begin) to set
  up the required configurations, settings, and permissions for running the DataFlow template.

### Run command {#run-command}

Use the [`gcloud dataflow flex-template run`](https://cloud.google.com/sdk/gcloud/reference/dataflow/flex-template/run)
command to run a Dataflow job that uses the Flex Template.

Below is an example of the command:

```bash
gcloud dataflow flex-template run "bigquery-clickhouse-dataflow-$(date +%Y%m%d-%H%M%S)" \
 --template-file-gcs-location "gs://clickhouse-dataflow-templates/bigquery-clickhouse-metadata.json" \
 --parameters inputTableSpec="<bigquery table id>",jdbcUrl="jdbc:clickhouse://<clickhouse host>:<clickhouse port>/<schema>?ssl=true&sslmode=NONE",clickHouseUsername="<username>",clickHousePassword="<password>",clickHouseTable="<clickhouse target table>"
```

### Command breakdown {#command-breakdown}

- **Job Name:** The text following the `run` keyword is the unique job name.
- **Template File:** The JSON file specified by `--template-file-gcs-location` defines the template structure and
  details about the accepted parameters. The mention file path is public and ready to use.
- **Parameters:** Parameters are separated by commas. For string-based parameters, enclose the values in double quotes.

### Expected response {#expected-response}

After running the command, you should see a response similar to the following:

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

### Monitor the job {#monitor-the-job}

Navigate to the [Dataflow Jobs tab](https://console.cloud.google.com/dataflow/jobs) in your Google Cloud Console to
monitor the status of the job. You'll find the job details, including progress and any errors:

<Image img={dataflow_inqueue_job} size="lg" border alt="DataFlow console showing a running BigQuery to ClickHouse job" />

## Troubleshooting {#troubleshooting}

### Memory limit (total) exceeded error (code 241) {#code-241-dbexception-memory-limit-total-exceeded}

This error occurs when ClickHouse runs out of memory while processing large batches of data. To resolve this issue:

* Increase the instance resources: Upgrade your ClickHouse server to a larger instance with more memory to handle the data processing load.
* Decrease the batch size: Adjust the batch size in your Dataflow job configuration to send smaller chunks of data to ClickHouse, reducing memory consumption per batch. These changes can help balance resource usage during data ingestion.

## Template source code {#template-source-code}

The template's source code is available in ClickHouse's [DataflowTemplates](https://github.com/ClickHouse/DataflowTemplates) fork.


# Dataflow BigQuery to ClickHouse template

BigQuery에서 ClickHouse로의 템플릿은 BigQuery 테이블에서 ClickHouse 테이블로 데이터를 수집하는 배치 파이프라인입니다. 
이 템플릿은 전체 테이블을 읽거나 제공된 SQL 쿼리를 사용하여 특정 레코드를 필터링할 수 있습니다.

<TOCInline toc={toc}   maxHeadingLevel={2}></TOCInline>

## Pipeline requirements {#pipeline-requirements}

* 소스 BigQuery 테이블이 존재해야 합니다.
* 대상 ClickHouse 테이블이 존재해야 합니다.
* ClickHouse 호스트는 Dataflow 작업자 기계에서 접근 가능해야 합니다.

## Template parameters {#template-parameters}

<br/>
<br/>

| Parameter Name          | Parameter Description                                                                                                                                                                                                                                                                                                                              | Required | Notes                                                                                                                                                                                                                                                            |
|-------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `jdbcUrl`               | ClickHouse JDBC URL 형식으로, `jdbc:clickhouse://<host>:<port>/<schema>`입니다.                                                                                                                                                                                                                                                                    | ✅        | 사용자 이름 및 비밀번호를 JDBC 옵션으로 추가하지 마세요. 다른 JDBC 옵션은 JDBC URL 끝에 추가할 수 있습니다. ClickHouse Cloud 사용자에게는 `jdbcUrl`에 `ssl=true&sslmode=NONE`을 추가하세요.                                                                                        |
| `clickHouseUsername`    | 인증할 ClickHouse 사용자 이름입니다.                                                                                                                                                                                                                                                                                                              | ✅        |                                                                                                                                                                                                                                                                  |
| `clickHousePassword`    | 인증할 ClickHouse 비밀번호입니다.                                                                                                                                                                                                                                                                                                              | ✅        |                                                                                                                                                                                                                                                                  |
| `clickHouseTable`       | 데이터가 삽입될 대상 ClickHouse 테이블입니다.                                                                                                                                                                                                                                                                                                   | ✅        |                                                                                                                                                                                                                                                                  |
| `maxInsertBlockSize`    | 블록 생성 제어를 하는 경우, 삽입을 위한 최대 블록 크기입니다(ClickHouseIO 옵션).                                                                                                                                                                                                                                                                |          | `ClickHouseIO` 옵션입니다.                                                                                                                                                                                                                                        |
| `insertDistributedSync` | 설정이 활성화된 경우, 분산 쿼리를 삽입할 때 클러스터의 모든 노드에 데이터가 전송될 때까지 기다립니다 (ClickHouseIO 옵션).                                                                                                                                                                                                                          |          | `ClickHouseIO` 옵션입니다.                                                                                                                                                                                                                                        |
| `insertQuorum`          | 복제된 테이블의 INSERT 쿼리에서 지정된 수의 복제본에 대한 쓰기를 기다리고 데이터의 추가를 선형화합니다. 0 - 비활성화.                                                                                                                                                                                                                              |          | `ClickHouseIO` 옵션입니다. 이 설정은 기본 서버 설정에서 비활성화되어 있습니다.                                                                                                                                                                                 |
| `insertDeduplicate`     | 복제된 테이블의 INSERT 쿼리에서 삽입 블록의 중복 제거가 수행되도록 지정합니다.                                                                                                                                                                                                                                                                  |          | `ClickHouseIO` 옵션입니다.                                                                                                                                                                                                                                        |
| `maxRetries`            | 삽입당 최대 재시도 횟수입니다.                                                                                                                                                                                                                                                                                                                      |          | `ClickHouseIO` 옵션입니다.                                                                                                                                                                                                                                        |
| `InputTableSpec`        | 읽을 BigQuery 테이블입니다. `inputTableSpec` 또는 `query` 중 하나를 지정합니다. 둘 다 설정된 경우 `query` 매개변수가 우선합니다. 예시: `<BIGQUERY_PROJECT>:<DATASET_NAME>.<INPUT_TABLE>`.                                                                                                                                                   |          | [BigQuery Storage Read API](https://cloud.google.com/bigquery/docs/reference/storage)를 사용하여 BigQuery 스토리지에서 직접 데이터를 읽습니다. [Storage Read API 제한 사항](https://cloud.google.com/bigquery/docs/reference/storage#limitations)에 유의하세요. |
| `outputDeadletterTable` | 출력 테이블에 도달하지 못한 메시지를 위한 BigQuery 테이블입니다. 테이블이 존재하지 않으면 파이프라인 실행 중 생성됩니다. 지정되지 않으면 `<outputTableSpec>_error_records`가 사용됩니다. 예시: `<PROJECT_ID>:<DATASET_NAME>.<DEADLETTER_TABLE>`.                                                                                |          |                                                                                                                                                                                                                                                                  |
| `query`                 | BigQuery에서 데이터를 읽기 위해 사용할 SQL 쿼리입니다. BigQuery 데이터셋이 Dataflow 작업과 다른 프로젝트에 있는 경우, SQL 쿼리에서 전체 데이터셋 이름을 지정하세요. 예시: `<PROJECT_ID>.<DATASET_NAME>.<TABLE_NAME>`. 기본값은 `useLegacySql`이 true가 아닌 경우 [GoogleSQL](https://cloud.google.com/bigquery/docs/introduction-sql)입니다. |          | `inputTableSpec` 또는 `query` 중 하나를 지정해야 합니다. 두 매개변수를 모두 설정하면 템플릿은 `query` 매개변수를 사용합니다. 예시: `SELECT * FROM sampledb.sample_table`.                                                                                     |
| `useLegacySql`          | 포함된 경우, legacy SQL을 사용하도록 설정하세요. 이 매개변수는 `query` 매개변수를 사용할 때만 적용됩니다. 기본값은 `false`입니다.                                                                                                                                                                                                               |          |                                                                                                                                                                                                                                                                  |
| `queryLocation`         | 기본 테이블 권한 없이 승인된 뷰에서 읽을 때 필요합니다. 예를 들어, `US`.                                                                                                                                                                                                                                                                             |          |                                                                                                                                                                                                                                                                  |
| `queryTempDataset`      | 쿼리 결과를 저장할 임시 테이블을 생성할 기존 데이터셋을 지정하십시오. 예를 들어, `temp_dataset`.                                                                                                                                                                                                                                                |          |                                                                                                                                                                                                                                                                  |
| `KMSEncryptionKey`      | 쿼리 소스를 사용하여 BigQuery에서 읽을 때 생성된 임시 테이블을 암호화하는 데 이 Cloud KMS 키를 사용하십시오. 예를 들어, `projects/your-project/locations/global/keyRings/your-keyring/cryptoKeys/your-key`.                                                                                                                           |          |                                                                                                                                                                                                                                                                  |

:::note
모든 `ClickHouseIO` 매개변수의 기본값은 [`ClickHouseIO` Apache Beam Connector](/integrations/apache-beam#clickhouseiowrite-parameters)에서 확인할 수 있습니다.
:::

## Source and target tables schema {#source-and-target-tables-schema}

BigQuery 데이터셋을 ClickHouse로 효과적으로 로드하기 위해 파이프라인은 다음 단계를 거쳐 컬럼 추론 프로세스를 수행합니다.

1. 템플릿은 대상 ClickHouse 테이블을 기반으로 스키마 객체를 빌드합니다.
2. 템플릿은 BigQuery 데이터셋을 반복하고, 이름을 기준으로 컬럼을 맞추기 위해 시도합니다.

<br/>

:::important
이렇듯, BigQuery 데이터셋(테이블 또는 쿼리)은 ClickHouse 대상 테이블과 꼭 같은 컬럼 이름을 가져야 합니다.
:::

## Data type mapping {#data-types-mapping}

BigQuery 유형은 ClickHouse 테이블 정의를 기반으로 변환됩니다. 따라서 위의 표는 주어진 BigQuery 테이블/쿼리에 대해 대상 ClickHouse 테이블에서 가져야 할 권장 매핑을 나열합니다:

| BigQuery Type                                                                                                         | ClickHouse Type                                                 | Notes                                                                                                                                                                                                                                                                                                                                                                                                                  |
|-----------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [**Array Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)                 | [**Array Type**](../../../sql-reference/data-types/array)       | 내부 유형은 이 표에 나열된 지원되는 원시 데이터 유형 중 하나여야 합니다.                                                                                                                                                                                                                                                                                                                                 |
| [**Boolean Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)             | [**Bool Type**](../../../sql-reference/data-types/boolean)      |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**Date Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)                   | [**Date Type**](../../../sql-reference/data-types/date)         |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**Datetime Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type)           | [**Datetime Type**](../../../sql-reference/data-types/datetime) | `Enum8`, `Enum16` 및 `FixedString`와 함께 작동합니다.                                                                                                                                                                                                                                                                                                                                                               |
| [**String Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)               | [**String Type**](../../../sql-reference/data-types/string)     | BigQuery의 모든 Int 유형(`INT`, `SMALLINT`, `INTEGER`, `BIGINT`, `TINYINT`, `BYTEINT`)은 `INT64`의 별칭입니다. ClickHouse에서 올바른 정수 크기를 설정할 것을 권장합니다. 템플릿은 정의된 열 유형에 따라 열을 변환합니다 (`Int8`, `Int16`, `Int32`, `Int64`).                                                                                                                          |
| [**Numeric - Integer Types**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types) | [**Integer Types**](../../../sql-reference/data-types/int-uint) | BigQuery의 모든 Int 유형(`INT`, `SMALLINT`, `INTEGER`, `BIGINT`, `TINYINT`, `BYTEINT`)은 `INT64`의 별칭입니다. ClickHouse에서 올바른 정수 크기를 설정할 것을 권장합니다. 템플릿은 정의된 열 유형(`Int8`, `Int16`, `Int32`, `Int64`)에 따라 열을 변환합니다. ClickHouse 테이블에서 사용된 경우 할당되지 않은 Int 유형도 변환됩니다 (`UInt8`, `UInt16`, `UInt32`, `UInt64`). |
| [**Numeric - Float Types**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)   | [**Float Types**](../../../sql-reference/data-types/float)      | 지원되는 ClickHouse 유형: `Float32` 및 `Float64`                                                                                                                                                                                                                                                                                                                                                                    |

## Running the Template {#running-the-template}

BigQuery에서 ClickHouse로의 템플릿은 Google Cloud CLI를 통해 실행 가능합니다.

:::note
이 문서를 검토하고, 특히 위의 섹션을 이해하여 템플릿의 구성 요구 사항과 전제 조건을 완전히 이해했는지 확인하세요.
:::

<Tabs>
  <TabItem value="console" label="Google Cloud Console" default>
    Google Cloud Console에 로그인하여 DataFlow를 검색합니다.

1. `CREATE JOB FROM TEMPLATE` 버튼을 누릅니다.
   <Image img={dataflow_create_job_from_template_button} border alt="DataFlow console" />
2. 템플릿 양식이 열리면 작업 이름을 입력하고 원하는 지역을 선택합니다.
   <Image img={dataflow_template_initial_form} border alt="DataFlow template initial form" />
3. `DataFlow Template` 입력란에 `ClickHouse` 또는 `BigQuery`를 입력하고 `BigQuery to ClickHouse` 템플릿을 선택합니다.
   <Image img={dataflow_template_clickhouse_search} border alt="Select BigQuery to ClickHouse template" />
4. 선택한 후, 추가 세부 사항을 제공할 수 있도록 양식이 확장됩니다:
    * ClickHouse 서버 JDBC URL, 형식 `jdbc:clickhouse://host:port/schema`.
    * ClickHouse 사용자 이름.
    * ClickHouse 대상 테이블 이름.

<br/>

:::note
ClickHouse 비밀번호 옵션은 비밀번호가 구성되지 않은 경우를 위한 선택 사항으로 표시됩니다.
추가하려면 `ClickHouse Endpoint의 비밀번호` 옵션까지 스크롤하십시오.
:::

<Image img={dataflow_extended_template_form} border alt="BigQuery to ClickHouse extended template form" />

5. [Template Parameters](#template-parameters) 섹션에 자세히 설명된 BigQuery/ClickHouseIO 관련 구성을 사용자 지정하고 추가합니다.

  </TabItem>
  <TabItem value="cli" label="Google Cloud CLI">

### Install & Configure `gcloud` CLI {#install--configure-gcloud-cli}

- 아직 설치되지 않은 경우, [`gcloud` CLI](https://cloud.google.com/sdk/docs/install)를 설치합니다.
- [이 가이드](https://cloud.google.com/dataflow/docs/guides/templates/using-flex-templates#before-you-begin)의 `Before you begin` 섹션을 따라
  DataFlow 템플릿을 실행하기 위한 필수 구성, 설정 및 권한을 설정합니다.

### Run command {#run-command}

[`gcloud dataflow flex-template run`](https://cloud.google.com/sdk/gcloud/reference/dataflow/flex-template/run) 
명령을 사용하여 Flex 템플릿을 사용하는 Dataflow 작업을 실행합니다.

아래는 명령의 예입니다:

```bash
gcloud dataflow flex-template run "bigquery-clickhouse-dataflow-$(date +%Y%m%d-%H%M%S)" \
 --template-file-gcs-location "gs://clickhouse-dataflow-templates/bigquery-clickhouse-metadata.json" \
 --parameters inputTableSpec="<bigquery table id>",jdbcUrl="jdbc:clickhouse://<clickhouse host>:<clickhouse port>/<schema>?ssl=true&sslmode=NONE",clickHouseUsername="<username>",clickHousePassword="<password>",clickHouseTable="<clickhouse target table>"
```

### Command breakdown {#command-breakdown}

- **Job Name:** `run` 키워드 뒤의 텍스트가 고유한 작업 이름입니다.
- **Template File:** `--template-file-gcs-location`으로 지정된 JSON 파일은 템플릿 구조 및 수용 가능한 매개변수에 대한 세부 정보를 정의합니다. 언급된 파일 경로는 공개되며 사용 가능합니다.
- **Parameters:** 매개변수는 쉼표로 구분됩니다. 문자열 기반 매개변수의 경우, 값을 큰따옴표로 묶습니다.

### Expected response {#expected-response}

명령을 실행한 후 다음과 유사한 응답을 볼 수 있어야 합니다:

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

### Monitor the job {#monitor-the-job}

Google Cloud Console의 [Dataflow Jobs 탭](https://console.cloud.google.com/dataflow/jobs)으로 이동하여
작업 상태를 모니터링합니다. 작업 세부 정보, 진행 상황 및 오류를 확인할 수 있습니다:

<Image img={dataflow_inqueue_job} size="lg" border alt="DataFlow console showing a running BigQuery to ClickHouse job" />

## Troubleshooting {#troubleshooting}

### Memory limit (total) exceeded error (code 241) {#code-241-dbexception-memory-limit-total-exceeded}

이 오류는 ClickHouse가 대량의 데이터 배치를 처리하는 동안 메모리가 부족할 때 발생합니다. 이 문제를 해결하려면:

* 인스턴스 리소스를 증가시킵니다: ClickHouse 서버를 더 큰 인스턴스로 업그레이드하여 데이터 처리 부하를 처리할 수 있는 더 많은 메모리를 제공합니다.
* 배치 크기를 줄입니다: Dataflow 작업 구성에서 배치 크기를 조정하여 ClickHouse에 더 작은 데이터 덩어리를 전송하여 배치당 메모리 소비를 줄입니다. 이러한 변경 사항은 데이터 수집 중 리소스 사용의 균형을 맞추는 데 도움이 될 수 있습니다.

## Template source code {#template-source-code}

템플릿의 소스 코드는 ClickHouse의 [DataflowTemplates](https://github.com/ClickHouse/DataflowTemplates) 포크에서 확인할 수 있습니다.
