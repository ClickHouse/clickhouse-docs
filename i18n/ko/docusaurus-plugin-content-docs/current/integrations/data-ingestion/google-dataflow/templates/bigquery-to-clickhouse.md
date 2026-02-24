---
sidebar_label: 'BigQuery에서 ClickHouse로'
sidebar_position: 1
slug: /integrations/google-dataflow/templates/bigquery-to-clickhouse
description: 'Google Dataflow Template을 사용하여 BigQuery 데이터를 ClickHouse로 수집할 수 있습니다'
title: 'Dataflow BigQuery에서 ClickHouse로 Template'
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


# Dataflow BigQuery to ClickHouse 템플릿 \{#dataflow-bigquery-to-clickhouse-template\}

BigQuery to ClickHouse 템플릿은 BigQuery 테이블에서 ClickHouse 테이블로 데이터를 수집하는 배치 파이프라인입니다.
이 템플릿은 전체 테이블을 읽거나 제공된 SQL 쿼리를 사용하여 특정 레코드만 필터링할 수 있습니다.

<TOCInline toc={toc}   maxHeadingLevel={2}></TOCInline>

## 파이프라인 요구 사항 \{#pipeline-requirements\}

* 소스 BigQuery 테이블이 존재해야 합니다.
* 대상 ClickHouse 테이블이 존재해야 합니다.
* Dataflow 워커 머신에서 ClickHouse 호스트에 접속할 수 있어야 합니다.

## 템플릿 매개변수 \{#template-parameters\}

<br/>

<br/>

| 매개변수 이름           | 매개변수 설명                                                                                                                                                                                                                                                                                                                                      | 필수     | 비고                                                                                                                                                                                                                                                             |
|-------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `jdbcUrl`               | `jdbc:clickhouse://<host>:<port>/<schema>` 형식의 ClickHouse JDBC URL입니다.                                                                                                                                                                                                                                                                       | ✅        | JDBC 옵션으로 사용자 이름과 비밀번호를 추가하지 마십시오. 그 외 JDBC 옵션은 JDBC URL 끝에 추가할 수 있습니다. ClickHouse Cloud 사용자인 경우 `jdbcUrl`에 `ssl=true&sslmode=NONE`을 추가하십시오.                                                                 |
| `clickHouseUsername`    | 인증에 사용할 ClickHouse 사용자 이름입니다.                                                                                                                                                                                                                                                                                                       | ✅        |                                                                                                                                                                                                                                                                  |
| `clickHousePassword`    | 인증에 사용할 ClickHouse 비밀번호입니다.                                                                                                                                                                                                                                                                                                           | ✅        |                                                                                                                                                                                                                                                                  |
| `clickHouseTable`       | 데이터가 삽입될 대상 ClickHouse 테이블입니다.                                                                                                                                                                                                                                                                                                      | ✅        |                                                                                                                                                                                                                                                                  |
| `maxInsertBlockSize`    | 삽입용 블록 생성 제어가 가능한 경우, 삽입을 위한 최대 블록 크기입니다(ClickHouseIO 옵션).                                                                                                                                                                                                                                                         |          | `ClickHouseIO` 옵션입니다.                                                                                                                                                                                                                                       |
| `insertDistributedSync` | 설정을 활성화하면, 분산 테이블에 대한 INSERT 쿼리가 클러스터의 모든 노드로 데이터가 전송될 때까지 대기합니다(ClickHouseIO 옵션).                                                                                                                                                                                                                   |          | `ClickHouseIO` 옵션입니다.                                                                                                                                                                                                                                       |
| `insertQuorum`          | 복제된 테이블(Replicated Table)에 대한 INSERT 쿼리에서 지정된 개수의 레플리카에 기록이 완료될 때까지 대기하고, 데이터 추가를 선형화합니다. 0은 비활성화를 의미합니다.                                                                                                                                                                             |          | `ClickHouseIO` 옵션입니다. 이 설정은 기본 서버 설정에서 비활성화되어 있습니다.                                                                                                                                                                                  |
| `insertDeduplicate`     | 복제된 테이블에 대한 INSERT 쿼리에서, 삽입 블록의 중복 제거를 수행할지 여부를 지정합니다.                                                                                                                                                                                                                                                         |          | `ClickHouseIO` 옵션입니다.                                                                                                                                                                                                                                       |
| `maxRetries`            | 각 삽입마다 허용되는 최대 재시도 횟수입니다.                                                                                                                                                                                                                                                                                                      |          | `ClickHouseIO` 옵션입니다.                                                                                                                                                                                                                                       |
| `InputTableSpec`        | 읽을 BigQuery 테이블입니다. `inputTableSpec` 또는 `query` 중 하나를 지정해야 합니다. 둘 다 설정된 경우 `query` 매개변수가 우선합니다. 예: `<BIGQUERY_PROJECT>:<DATASET_NAME>.<INPUT_TABLE>`.                                                                                                                                                      |          | [BigQuery Storage Read API](https://cloud.google.com/bigquery/docs/reference/storage)를 사용하여 BigQuery 스토리지에서 직접 데이터를 읽습니다. [Storage Read API 제한사항](https://cloud.google.com/bigquery/docs/reference/storage#limitations)을 유의하십시오. |
| `outputDeadletterTable` | 출력 테이블에 도달하지 못한 메시지를 저장할 BigQuery 테이블입니다. 해당 테이블이 존재하지 않으면 파이프라인 실행 중에 생성됩니다. 지정하지 않으면 `<outputTableSpec>_error_records`가 사용됩니다. 예: `<PROJECT_ID>:<DATASET_NAME>.<DEADLETTER_TABLE>`.                                                                                    |          |                                                                                                                                                                                                                                                                  |
| `query`                 | BigQuery에서 데이터를 읽기 위해 사용할 SQL 쿼리입니다. BigQuery 데이터셋이 Dataflow 작업과 다른 프로젝트에 있는 경우, 예를 들어 `<PROJECT_ID>.<DATASET_NAME>.<TABLE_NAME>`처럼 SQL 쿼리에서 전체 데이터셋 이름을 지정해야 합니다. `useLegacySql`이 true가 아닌 한 기본적으로 [GoogleSQL](https://cloud.google.com/bigquery/docs/introduction-sql)이 사용됩니다. |          | `inputTableSpec` 또는 `query` 중 하나를 반드시 지정해야 합니다. 두 매개변수를 모두 설정하면 템플릿은 `query` 매개변수를 사용합니다. 예: `SELECT * FROM sampledb.sample_table`.                                                                                 |
| `useLegacySql`          | 레거시 SQL을 사용하려면 `true`로 설정합니다. 이 매개변수는 `query` 매개변수를 사용할 때만 적용됩니다. 기본값은 `false`입니다.                                                                                                                                                                                                                      |          |                                                                                                                                                                                                                                                                  |
| `queryLocation`         | 기본 테이블에 대한 권한 없이 승인된 뷰(authorized view)에서 읽을 때 필요합니다. 예: `US`.                                                                                                                                                                                                                                                         |          |                                                                                                                                                                                                                                                                  |
| `queryTempDataset`      | 쿼리 결과를 저장할 임시 테이블을 생성하기 위해 사용할 기존 데이터셋을 설정합니다. 예: `temp_dataset`.                                                                                                                                                                                                                                            |          |                                                                                                                                                                                                                                                                  |
| `KMSEncryptionKey`      | 쿼리 소스를 사용하여 BigQuery에서 읽는 경우, 생성되는 임시 테이블을 암호화하기 위해 사용할 Cloud KMS 키입니다. 예: `projects/your-project/locations/global/keyRings/your-keyring/cryptoKeys/your-key`.                                                                                                   |          |                                                                                                                                                                                                                                                                  |

:::note
모든 `ClickHouseIO` 매개변수의 기본값은 [`ClickHouseIO` Apache Beam Connector](/integrations/apache-beam#clickhouseiowrite-parameters)에 나와 있습니다.
:::

## 소스 및 타깃 테이블 스키마 \{#source-and-target-tables-schema\}

BigQuery 데이터셋을 ClickHouse로 효율적으로 적재하기 위해, 파이프라인은 다음 단계로 이루어진 컬럼 추론 과정을 수행합니다:

1. 템플릿은 대상 ClickHouse 테이블을 기반으로 스키마 객체를 생성합니다.
2. 템플릿은 BigQuery 데이터셋을 순회하면서 컬럼 이름을 기준으로 컬럼을 매핑합니다.

<br/>

:::important
따라서 BigQuery 데이터셋(테이블이든 쿼리 결과이든)은 ClickHouse 대상 테이블과 컬럼 이름이 정확히 동일해야 합니다.
:::

## 데이터 타입 매핑 \{#data-types-mapping\}

BigQuery 데이터 타입은 ClickHouse 테이블 정의를 기준으로 변환됩니다. 따라서 위의 테이블에는
특정 BigQuery 테이블/쿼리에 대해 대상 ClickHouse 테이블에서 사용해야 하는 권장 매핑이 나와 있습니다.

| BigQuery Type                                                                                                         | ClickHouse Type                                                 | Notes                                                                                                                                                                                                                                                                                                                                                                                                                  |
|-----------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [**Array Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)                 | [**Array Type**](../../../sql-reference/data-types/array)       | 내부 타입은 이 표에 나열된 지원되는 기본(primitive) 데이터 타입 중 하나여야 합니다.                                                                                                                                                                                                                                                                                                                                   |
| [**Boolean Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)             | [**Bool Type**](../../../sql-reference/data-types/boolean)      |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**Date Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)                   | [**Date Type**](../../../sql-reference/data-types/date)         |                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [**Datetime Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type)           | [**Datetime Type**](../../../sql-reference/data-types/datetime) | `Enum8`, `Enum16`, `FixedString`와 함께도 사용할 수 있습니다.                                                                                                                                                                                                                                                                                                                                                          |
| [**String Type**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)               | [**String Type**](../../../sql-reference/data-types/string)     | BigQuery에서는 모든 Int 타입(`INT`, `SMALLINT`, `INTEGER`, `BIGINT`, `TINYINT`, `BYTEINT`)이 `INT64`의 별칭입니다. 템플릿이 정의된 컬럼 타입(`Int8`, `Int16`, `Int32`, `Int64`)에 따라 컬럼을 변환하므로, ClickHouse에서 적절한 Integer 크기를 설정하는 것이 좋습니다.                                                                                                           |
| [**Numeric - Integer Types**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types) | [**Integer Types**](../../../sql-reference/data-types/int-uint) | BigQuery에서는 모든 Int 타입(`INT`, `SMALLINT`, `INTEGER`, `BIGINT`, `TINYINT`, `BYTEINT`)이 `INT64`의 별칭입니다. 템플릿이 정의된 컬럼 타입(`Int8`, `Int16`, `Int32`, `Int64`)에 따라 컬럼을 변환하므로, ClickHouse에서 적절한 Integer 크기를 설정하는 것이 좋습니다. 또한 템플릿은 ClickHouse 테이블에서 사용되는 부호 없는 Int 타입(`UInt8`, `UInt16`, `UInt32`, `UInt64`)도 변환합니다. |
| [**Numeric - Float Types**](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)   | [**Float Types**](../../../sql-reference/data-types/float)      | 지원되는 ClickHouse 타입은 `Float32`와 `Float64`입니다.                                                                                                                                                                                                                                                                                                                                                               |

## Running the Template \{#running-the-template\}

BigQuery to ClickHouse 템플릿은 Google Cloud CLI를 통해 실행할 수 있습니다.

:::note
이 문서, 특히 위의 섹션들을 검토하여 템플릿의 구성 요구 사항과 사전 조건을 충분히 이해해야 합니다.
:::

<Tabs>
  <TabItem value="console" label="Google Cloud Console" default>
    Google Cloud Console에 로그인한 다음 Dataflow를 검색합니다.

1. `CREATE JOB FROM TEMPLATE` 버튼을 누릅니다.
   <Image img={dataflow_create_job_from_template_button} border alt="DataFlow 콘솔" />
2. 템플릿 양식이 열리면 작업 이름을 입력하고 원하는 리전을 선택합니다.
   <Image img={dataflow_template_initial_form} border alt="DataFlow 템플릿 초기 양식" />
3. `DataFlow Template` 입력란에 `ClickHouse` 또는 `BigQuery`를 입력한 뒤, `BigQuery to ClickHouse` 템플릿을 선택합니다.
   <Image img={dataflow_template_clickhouse_search} border alt="BigQuery to ClickHouse 템플릿 선택" />
4. 템플릿을 선택하면 추가 세부 정보를 입력할 수 있도록 양식이 확장됩니다.
    * 다음 형식의 ClickHouse 서버 JDBC URL: `jdbc:clickhouse://host:port/schema`
    * ClickHouse 사용자 이름
    * ClickHouse 대상 테이블 이름

<br/>

:::note
ClickHouse 비밀번호 옵션은 비밀번호가 설정되어 있지 않은 경우를 위해 선택 사항으로 표시됩니다.
비밀번호를 추가하려면 아래로 스크롤하여 `Password for ClickHouse Endpoint` 옵션을 찾으십시오.
:::

<Image img={dataflow_extended_template_form} border alt="확장된 BigQuery to ClickHouse 템플릿 양식" />

5. [Template Parameters](#template-parameters) 섹션에 설명된 대로, 필요에 따라 BigQuery/ClickHouseIO 관련 설정을 구성하고 추가합니다.

  </TabItem>
  <TabItem value="cli" label="Google Cloud CLI">

### Install & Configure `gcloud` CLI \{#install--configure-gcloud-cli\}

- 아직 설치하지 않았다면 [`gcloud` CLI](https://cloud.google.com/sdk/docs/install)를 설치합니다.
- Dataflow 템플릿을 실행하는 데 필요한 구성, 설정 및 권한을 준비하기 위해
  [이 가이드](https://cloud.google.com/dataflow/docs/guides/templates/using-flex-templates#before-you-begin)의 `Before you begin` 섹션을 따르십시오.

### Run command \{#run-command\}

[`gcloud dataflow flex-template run`](https://cloud.google.com/sdk/gcloud/reference/dataflow/flex-template/run)
명령을 사용하여 Flex Template을 사용하는 Dataflow 작업을 실행합니다.

다음은 명령 예시입니다.

```bash
gcloud dataflow flex-template run "bigquery-clickhouse-dataflow-$(date +%Y%m%d-%H%M%S)" \
 --template-file-gcs-location "gs://clickhouse-dataflow-templates/bigquery-clickhouse-metadata.json" \
 --parameters inputTableSpec="<bigquery table id>",jdbcUrl="jdbc:clickhouse://<clickhouse host>:<clickhouse port>/<schema>?ssl=true&sslmode=NONE",clickHouseUsername="<username>",clickHousePassword="<password>",clickHouseTable="<clickhouse target table>"
```

### Command breakdown \{#command-breakdown\}

- **Job Name:** `run` 키워드 뒤의 텍스트가 고유한 작업 이름입니다.
- **Template File:** `--template-file-gcs-location`으로 지정된 JSON 파일은 템플릿 구조와 허용되는 파라미터에 대한 세부 정보를 정의합니다. 해당 파일 경로는 공개되어 있으며 바로 사용할 수 있습니다.
- **Parameters:** 파라미터는 쉼표로 구분됩니다. 문자열 기반 파라미터 값은 큰따옴표로 감싸야 합니다.

### Expected response \{#expected-response\}

명령을 실행한 후, 아래와 유사한 응답이 출력됩니다.

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

### 작업 모니터링 \{#monitor-the-job\}

Google Cloud Console에서 [Dataflow Jobs 탭](https://console.cloud.google.com/dataflow/jobs)으로 이동하여
작업 상태를 모니터링할 수 있습니다. 진행 상황과 발생한 오류 등을 포함한 작업 세부 정보를 확인할 수 있습니다:

<Image img={dataflow_inqueue_job} size="lg" border alt="실행 중인 BigQuery to ClickHouse 작업이 표시된 Dataflow 콘솔" />

## 문제 해결 \{#troubleshooting\}

### Memory limit (total) exceeded error (code 241) \{#code-241-dbexception-memory-limit-total-exceeded\}

이 오류는 ClickHouse가 대용량 데이터 배치를 처리하는 동안 메모리가 부족할 때 발생합니다. 이 문제를 해결하려면 다음을 수행합니다.

* 인스턴스 리소스 증가: 데이터 처리 부하를 감당할 수 있도록 더 많은 메모리를 가진 더 큰 인스턴스로 ClickHouse 서버를 업그레이드하십시오.
* 배치 크기 감소: Dataflow 작업 설정에서 배치 크기를 조정하여 더 작은 데이터 청크를 ClickHouse로 전송하면 배치당 메모리 사용량을 줄일 수 있습니다. 이러한 변경은 데이터 수집 과정에서 리소스 사용을 균형 있게 조정하는 데 도움이 됩니다.

## Template 소스 코드 \{#template-source-code\}

Template의 소스 코드는 ClickHouse에서 포크한 [DataflowTemplates](https://github.com/ClickHouse/DataflowTemplates) 저장소에서 확인할 수 있습니다.