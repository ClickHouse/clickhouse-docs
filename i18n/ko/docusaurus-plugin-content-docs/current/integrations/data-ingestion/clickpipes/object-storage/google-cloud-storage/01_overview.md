---
sidebar_label: '개요'
description: '객체 스토리지를 ClickHouse Cloud에 원활하게 연결할 수 있습니다.'
slug: /integrations/clickpipes/object-storage/gcs/overview
sidebar_position: 1
title: 'Google Cloud Storage와 ClickHouse Cloud 통합'
doc_type: 'guide'
---

import cp_iam from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_iam.png';
import cp_credentials from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/google-cloud-storage/cp_credentials.png';
import cp_advanced_settings from '@site/static/images/integrations/data-ingestion/clickpipes/cp_advanced_settings.png';
import Image from '@theme/IdealImage';

GCS ClickPipe는 Google Cloud Storage(GCS)에서 데이터를 수집하기 위한 완전 관리형이면서 신뢰성 있는 방식을 제공합니다. **일회성 수집**과 **지속적인 수집**을 모두 지원하며, 정확히 한 번만 처리되는(exactly-once) 의미론을 보장합니다.

GCS ClickPipes는 ClickPipes UI를 사용해 수동으로 배포하고 관리할 수 있을 뿐만 아니라, [OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) 및 [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe)을 사용해 프로그래밍 방식으로도 배포하고 관리할 수 있습니다.


## 지원되는 형식 \{#supported-formats\}

- [JSON](/interfaces/formats/JSON)
- [CSV](/interfaces/formats/CSV)
- [TSV](/interfaces/formats/TabSeparated)
- [Parquet](/interfaces/formats/Parquet)
- [Avro](/interfaces/formats/Avro)

## 기능 \{#features\}

### 일회성 수집 \{#one-time-ingestion\}

기본적으로 GCS ClickPipe는 지정된 버킷에서 패턴과 일치하는 모든 파일을 찾아 단일 배치 작업으로 ClickHouse 대상 테이블에 로드합니다. 수집 작업이 완료되면 ClickPipe는 자동으로 중지됩니다. 이 일회성 수집 모드는 정확히 한 번 처리(exactly-once semantics)를 보장하여 각 파일이 중복 없이 신뢰성 있게 처리되도록 합니다.

### Continuous ingestion \{#continuous-ingestion\}

연속 수집이 활성화되면 ClickPipes는 지정된 경로에서 데이터를 계속해서 수집합니다. 수집 순서를 결정하기 위해 GCS ClickPipe는 파일의 암묵적인 [사전식 순서](#continuous-ingestion-lexicographical-order)에 의존합니다.

#### 사전식 순서 \{#continuous-ingestion-lexicographical-order\}

GCS ClickPipe는 파일이 버킷에 사전식(lexicographical) 순서로 추가된다고 가정하며, 이 암묵적인 순서에 의존해 파일을 순차적으로 수집합니다. 이는 새 파일의 이름이 마지막으로 수집된 파일 이름보다 사전식으로 더 큰 값이어야 한다는 의미입니다. 예를 들어 `file1`, `file2`, `file3`라는 이름의 파일은 순차적으로 수집되지만, 버킷에 새 `file 0`이 추가되면 해당 파일 이름이 마지막으로 수집된 파일보다 사전식으로 크지 않기 때문에 **무시**됩니다.

이 모드에서 GCS ClickPipe는 지정된 경로의 **모든 파일**을 처음 한 번 로드한 뒤, 설정 가능한 간격(기본값 30초)으로 새 파일을 주기적으로 폴링(polling)합니다. 특정 파일이나 시점부터 수집을 시작하는 것은 **불가능**하며, ClickPipes는 항상 지정된 경로의 모든 파일을 로드합니다.

### 파일 패턴 매칭 \{#file-pattern-matching\}

Object Storage ClickPipes는 파일 패턴 매칭에 POSIX 표준을 따릅니다. 모든 패턴은 **대소문자를 구분**하며, 버킷 이름 뒤의 **전체 경로**와 일치합니다. 더 나은 성능을 위해 가능한 한 가장 구체적인 패턴을 사용하십시오(예: `*.csv` 대신 `data-2024-*.csv`).

#### 지원되는 패턴 \{#supported-patterns\}

| Pattern | Description | Example | Matches |
|---------|-------------|---------|---------|
| `?` | `/`를 제외한 정확히 **한 개**의 문자와 일치합니다. | `data-?.csv` | `data-1.csv`, `data-a.csv`, `data-x.csv` |
| `*` | `/`를 제외한 **0개 이상의** 문자와 일치합니다. | `data-*.csv` | `data-1.csv`, `data-001.csv`, `data-report.csv`, `data-.csv` |
| `**` <br></br> Recursive | `/`를 포함한 **0개 이상의** 문자와 일치합니다. 재귀적 디렉터리 탐색을 허용합니다. | `logs/**/error.log` | `logs/error.log`, `logs/2024/error.log`, `logs/2024/01/error.log` |

**예시:**

* `https://bucket.s3.amazonaws.com/folder/*.csv`
* `https://bucket.s3.amazonaws.com/logs/**/data.json`
* `https://bucket.s3.amazonaws.com/file-?.parquet`
* `https://bucket.s3.amazonaws.com/data-2024-*.csv.gz`

#### 지원되지 않는 패턴 \{#unsupported-patterns\}

| Pattern     | Description                 | Example                | Alternatives                                   |
|-------------|-----------------------------|------------------------|-----------------------------------------------|
| `{abc,def}` | 중괄호 확장(여러 대안 지정) | `{logs,data}/file.csv` | 각 경로마다 별도의 ClickPipes를 생성하십시오. |
| `{N..M}`    | 숫자 범위 확장             | `file-{1..100}.csv`    | `file-*.csv` 또는 `file-?.csv`를 사용하십시오. |

**예시:**

* `https://bucket.s3.amazonaws.com/{documents-01,documents-02}.json`
* `https://bucket.s3.amazonaws.com/file-{1..100}.csv`
* `https://bucket.s3.amazonaws.com/{logs,metrics}/data.parquet`

### 정확히 한 번 처리(Exactly-once semantics) \{#exactly-once-semantics\}

대용량 데이터 세트를 수집하는 동안 여러 유형의 장애가 발생할 수 있으며, 이로 인해 부분 삽입이나 중복 데이터가 생길 수 있습니다. 객체 스토리지(Object Storage) ClickPipes는 삽입 실패에 대해 견고하게 동작하며, 정확히 한 번 처리 의미론을 제공합니다. 이는 임시 "staging" 테이블을 사용하여 구현됩니다. 데이터는 먼저 staging 테이블에 삽입됩니다. 이 삽입 과정에서 문제가 발생하면, staging 테이블을 비운(truncate) 뒤 깨끗한 상태에서 삽입을 다시 시도할 수 있습니다. 삽입이 완료되고 성공했을 때에만 staging 테이블의 파티션을 대상 테이블로 이동합니다. 이 전략에 대해 더 자세히 알아보려면 [이 블로그 게시물](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)을 참고하십시오.

### Virtual columns \{#virtual-columns\}

어느 파일이 수집되었는지 추적하려면 `_file` 가상 컬럼을 컬럼 매핑 목록에 포함합니다. `_file` 가상 컬럼에는 소스 객체의 파일 이름이 포함되며, 이를 사용하여 어떤 파일이 처리되었는지 쿼리할 수 있습니다.

## 접근 제어 \{#access-control\}

### Permissions \{#permissions\}

GCS ClickPipe는 공용 및 비공용 버킷을 지원합니다. [Requester Pays](https://docs.cloud.google.com/storage/docs/requester-pays) 버킷은 **지원되지 않습니다**.

[`roles/storage.objectViewer`](https://docs.cloud.google.com/storage/docs/access-control/iam-roles#storage.objectViewer) 역할을 버킷 수준에서 부여해야 합니다. 이 역할에는 ClickPipes가 지정된 버킷에서 객체 목록을 조회하고 가져올 수 있도록 하는 [`storage.objects.list`](https://docs.cloud.google.com/storage/docs/json_api/v1/objects/list) 및 [`storage.objects.get`](https://docs.cloud.google.com/storage/docs/json_api/v1/objects/get#required-permissions) IAM 권한이 포함됩니다.

### 인증 \{#authentication\}

:::note
서비스 계정 인증은 아직 지원되지 않습니다.
:::

#### HMAC 자격 증명 \{#hmac-credentials\}

인증에 [HMAC keys](https://docs.cloud.google.com/storage/docs/authentication/hmackeys)를 사용하려면 ClickPipe 연결을 설정할 때 **Authentication method**에서 `Credentials`를 선택합니다. 그런 다음 `Access key`와 `Secret key` 항목에 각각 액세스 키(예: `GOOGTS7C7FUP3AIRVJTE2BCDKINBTES3HC2GY5CBFJDCQ2SYHV6A6XXVTJFSA`)와 시크릿 키(예: `bGoa+V7g/yqDXvKRqq+JTFn4uQZbPiQJo4pf9RzJ`)를 입력합니다.

<Image img={cp_credentials} alt="GCS ClickPipes용 HMAC 자격 증명" size="lg" border/>

HMAC 키를 사용하는 서비스 계정을 생성하려면 [이 가이드](https://clickhouse.com/docs/integrations/gcs#create-a-service-account-hmac-key-and-secret)를 따르십시오.

### 네트워크 액세스 \{#network-access\}

GCS ClickPipes는 메타데이터 검색과 데이터 수집을 위해 각각 ClickPipes 서비스와 ClickHouse Cloud 서비스를 사용하는 두 개의 별도 네트워크 경로를 사용합니다. 추가적인 네트워크 보안 계층(예: 컴플라이언스 요구 사항)을 구성하려면 **두 경로 모두에 대해 네트워크 액세스를 구성해야 합니다**.

* **IP 기반 액세스 제어**의 경우, GCS 버킷의 [IP 필터링 규칙](https://docs.cloud.google.com/storage/docs/ip-filtering-overview)에 [여기](/integrations/clickpipes#list-of-static-ips)에 나열된 ClickPipes 서비스 리전의 고정 IP와 ClickHouse Cloud 서비스의 [고정 IP](/manage/data-sources/cloud-endpoints-api)를 모두 허용하도록 설정해야 합니다. 사용 중인 ClickHouse Cloud 리전의 고정 IP를 확인하려면, 터미널을 열고 다음을 실행하십시오:

    ```bash
    # <your-region>을(를) 사용자의 ClickHouse Cloud 리전으로 변경하십시오
    curl -s https://api.clickhouse.cloud/static-ips.json | jq -r '.gcp[] | select(.region == "<your-region>") | .egress_ips[]'
    ```

## 고급 설정 \{#advanced-settings\}

ClickPipes는 대부분의 사용 사례를 충족하는 합리적인 기본값을 제공합니다. 사용 사례에 추가적인 미세 조정이 필요한 경우 다음 설정을 조정할 수 있습니다:

| 설정                               | 기본값        |  설명                               |                    
|------------------------------------|---------------|---------------------------------------------------------------------------------------|
| `Max insert bytes`                 | 10GB          | 단일 insert 배치에서 처리할 바이트 수입니다.                                           |
| `Max file count`                   | 100           | 단일 insert 배치에서 처리할 파일의 최대 개수입니다.                                    |
| `Max threads`                      | auto(3)       | 파일 처리를 위한 [동시 스레드의 최대 개수](/operations/settings/settings#max_threads)입니다. |
| `Max insert threads`               | 1             | 파일 처리를 위한 [동시 insert 스레드의 최대 개수](/operations/settings/settings#max_insert_threads)입니다. |
| `Min insert block size bytes`      | 1GB           | 테이블에 삽입할 수 있는 [블록의 최소 바이트 크기](/operations/settings/settings#min_insert_block_size_bytes)입니다. |
| `Max download threads`             | 4             | [동시 다운로드 스레드의 최대 개수](/operations/settings/settings#max_download_threads)입니다. |
| `Object storage polling interval`  | 30s           | ClickHouse 클러스터로 데이터를 삽입하기 전 최대 대기 시간(폴링 간격)을 설정합니다. |
| `Parallel distributed insert select` | 2           | [Parallel distributed insert select 설정](/operations/settings/settings#parallel_distributed_insert_select)입니다. |
| `Parallel view processing`         | false         | [순차적 처리 대신 동시에](/operations/settings/settings#parallel_view_processing) 연결된 뷰로 푸시할지 여부입니다. |
| `Use cluster function`             | true          | 여러 노드에 걸쳐 파일을 병렬로 처리할지 여부입니다. |

<Image img={cp_advanced_settings} alt="ClickPipes 고급 설정" size="lg" border/>

### 확장 \{#scaling\}

객체 스토리지 ClickPipes는 [구성된 수직 자동 확장 설정](/manage/scaling#configuring-vertical-auto-scaling)에 의해 결정되는 최소 ClickHouse 서비스 크기를 기준으로 확장됩니다. ClickPipe의 크기는 파이프를 생성할 때 결정됩니다. 이후 ClickHouse 서비스 설정을 변경하더라도 ClickPipe 크기에는 영향을 미치지 않습니다.

대규모 수집 작업의 처리량을 높이려면 ClickPipe를 생성하기 전에 ClickHouse 서비스를 미리 확장해 두는 것이 좋습니다.

## 알려진 제한 사항 \{#known-limitations\}

### 파일 크기 \{#file-size\}

ClickPipes는 크기가 **10GB 이하**인 오브젝트만 수집을 시도합니다. 파일이 10GB를 초과하는 경우 ClickPipes 전용 오류 테이블에 오류가 추가됩니다.

### 호환성 \{#compatibility\}

GCS ClickPipe는 상호 운용성을 위해 Cloud Storage [XML API](https://docs.cloud.google.com/storage/docs/interoperability)를 사용하며, 이를 위해 `gs://` 대신 `https://storage.googleapis.com/` 버킷 접두사를 사용하고 인증에는 [HMAC 키](https://docs.cloud.google.com/storage/docs/authentication/hmackeys)를 사용해야 합니다.

### View support \{#view-support\}

대상 테이블에 대한 materialized view도 지원합니다. ClickPipes는 대상 테이블뿐만 아니라 해당 테이블에 종속된 모든 materialized view에 대해서도 스테이징 테이블을 생성합니다.

materialized view가 아닌 일반 뷰에 대해서는 스테이징 테이블을 생성하지 않습니다. 따라서 하나 이상의 다운스트림 materialized view를 가진 대상 테이블이 있는 경우, 해당 materialized view에서는 대상 테이블의 데이터를 뷰를 통해 조회하는 방식을 피해야 합니다. 그렇지 않으면 materialized view에서 일부 데이터가 누락되는 상황이 발생할 수 있습니다.