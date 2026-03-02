---
sidebar_label: '개요'
description: 'ClickPipes를 사용하여 BigQuery 데이터를 ClickHouse Cloud로 내보내는 방법을 설명합니다.'
slug: /integrations/clickpipes/bigquery/overview
sidebar_position: 1
title: 'BigQuery와 ClickHouse Cloud 통합'
doc_type: 'guide'
---

import IntroClickPipe from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/clickpipes/bigquery/_intro.md';
import cp_iam from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/cp_iam.png';
import Image from '@theme/IdealImage';

<IntroClickPipe />


## 기능 \{#features\}

### 초기 로드 \{#initial-load\}

BigQuery ClickPipe는 선택된 BigQuery [dataset](https://docs.cloud.google.com/bigquery/docs/datasets-intro)의 테이블을 단일 배치 작업으로 ClickHouse 대상 테이블에 로드합니다. 수집 작업이 완료되면 ClickPipe는 자동으로 중지됩니다. 초기 로드 수집에는 스테이징을 위한 사용자 제공 Google Cloud Storage(GCS) 버킷이 필요합니다. 향후에는 이 중간 버킷을 ClickPipes에서 제공하고 관리할 예정입니다.

:::note
ClickPipes는 BigQuery에서 스테이징 GCS 버킷으로 데이터를 가져오기 위해 배치 추출 작업을 사용합니다. 이 작업에 대해서는 BigQuery에서 **처리 요금이 부과되지 않습니다**.
:::

### CDC (Change Data Capture, 변경 데이터 캡처) \{#cdc\}

CDC는 현재 Private Preview에서는 **지원되지 않지만**, 향후 지원될 예정입니다. 그동안에는 초기 로드가 완료된 후 [Google Cloud Storage ClickPipe](/integrations/clickpipes/object-storage/gcs/overview)를 사용하여 BigQuery 데이터 내보내기 결과를 ClickHouse Cloud로 지속적으로 동기화하도록 권장합니다.

## 데이터 타입 매핑 \{#data-type-mapping\}

[BigQuery 데이터 타입](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/data-types).

| BigQuery 데이터 타입 | ClickHouse 데이터 타입 | 세부 정보                                                           |
|--------------------|----------------------|-------------------------------------------------------------------|
| `BOOL`             | `Bool`               |                                                                   |
| `INT64`            | `Int64`              |                                                                   |
| `FLOAT64`          | `Float64`            |                                                                   |
| `NUMERIC`          | `Decimal(P, S)`      | 정밀도는 최대 38, 스케일은 최대 9까지입니다. 정밀도와 스케일은 그대로 유지됩니다.  |
| `BIGNUMERIC`       | `Decimal(P, S)`      | 정밀도는 최대 76, 스케일은 최대 38까지입니다. 정밀도와 스케일은 그대로 유지됩니다. |
| `STRING`           | `String`             |                                                                   |
| `BYTES`            | `String`             |                                                                   |
| `JSON`             | `String` (JSON)      |                                                                   |
| `DATE`             | `Date`               |                                                                   |
| `TIME`             | `String`             | 마이크로초 단위 정밀도를 지원합니다.                                            |
| `DATETIME`         | `DateTime`           | 마이크로초 단위 정밀도를 지원합니다.                                            |
| `TIMESTAMP`        | `DateTime64(6)`      | 마이크로초 단위 정밀도를 지원합니다.                                            |
| `GEOGRAPHY`        | `String`             |                                                                   |
| `GEOMETRY`         | `String`             |                                                                   |
| `UUID`             | `String`             |                                                                   |
| `ARRAY<T>`         | `Array(T)`           |                                                                   |
| `ARRAY<DATE>`      | `Array(Date)`        |                                                                   |
| `STRUCT` (RECORD)  | `String`             |                                                                   |

## 액세스 제어 \{#access-control\}

### 인증 \{#authentication\}

#### 서비스 계정 자격 증명 \{#service-account-credentials\}

ClickPipes는 [서비스 계정 키](https://docs.cloud.google.com/iam/docs/keys-create-delete)를 사용하여 Google Cloud 프로젝트에 대한 인증을 수행합니다. BigQuery에서 데이터를 내보내고, 스테이징용 GCS 버킷에 로드한 뒤, 이를 ClickHouse로 읽어올 수 있도록, 필요한 [권한](#permissions)만 최소한으로 부여한 전용 서비스 계정을 별도로 생성할 것을 권장합니다.

<Image img={cp_iam} alt="BigQuery 및 Cloud Storage 권한이 있는 서비스 계정 키 생성" size="lg" border/>

### 권한 \{#permissions\}

#### BigQuery \{#bigquery\}

서비스 계정에는 다음 BigQuery 역할이 있어야 합니다.

* [`roles/bigquery.dataViewer`](https://docs.cloud.google.com/bigquery/docs/access-control#bigquery.dataViewer)
* [`roles/bigquery.jobUser`](https://docs.cloud.google.com/bigquery/docs/access-control#bigquery.jobUser)

접근 범위를 더 세밀하게 설정하려면 [IAM conditions](https://docs.cloud.google.com/bigquery/docs/conditions)를 사용하여 해당 역할이 접근할 수 있는 리소스를 제한할 것을 권장합니다. 예를 들어, 동기화하려는 테이블이 포함된 특정 데이터 세트로 `dataViewer` 역할의 범위를 제한할 수 있습니다.

```bash
resource.name.startsWith("projects/<PROJECT_ID>/datasets/<DATASET_NAME>")
```


#### Cloud Storage \{#cloud-storage\}

서비스 계정에는 다음과 같은 Cloud Storage 역할이 부여되어 있어야 합니다.

* [`roles/storage.objectAdmin`](https://docs.cloud.google.com/storage/docs/access-control/iam-roles#storage.objectAdmin)
* [`roles/storage.bucketViewer`](https://docs.cloud.google.com/storage/docs/access-control/iam-roles#storage.bucketViewer)

액세스 범위를 더 세밀하게 제한하기 위해 역할이 액세스할 수 있는 리소스를 제한하도록 [IAM conditions](https://docs.cloud.google.com/bigquery/docs/conditions)을 사용할 것을 권장합니다. 예를 들어, `objectAdmin` 및 `bucketViewer` 역할을 ClickPipes 동기화를 위해 생성된 전용 버킷으로만 제한할 수 있습니다.

```bash
resource.name.startsWith("projects/_/buckets/<BUCKET_NAME>")
```
