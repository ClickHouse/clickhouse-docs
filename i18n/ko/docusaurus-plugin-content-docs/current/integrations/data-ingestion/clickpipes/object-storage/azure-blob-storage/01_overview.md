---
sidebar_label: '개요'
description: '객체 스토리지를 ClickHouse Cloud에 원활하게 연결합니다.'
slug: /integrations/clickpipes/object-storage/abs/overview
sidebar_position: 1
title: 'Azure Blob Storage와 ClickHouse Cloud 통합'
doc_type: 'guide'
---

import cp_advanced_settings from '@site/static/images/integrations/data-ingestion/clickpipes/cp_advanced_settings.png';
import Image from '@theme/IdealImage';

ABS ClickPipe는 Azure Blob Storage에서 ClickHouse Cloud로 데이터를 수집하기 위한 완전 관리형이자 안정적인 방법을 제공합니다. **일회성** 및 **지속적인 수집**을 모두 지원하며, 정확히 한 번 처리(exactly-once semantics)를 보장합니다.

ABS ClickPipes는 ClickPipes UI를 사용해 수동으로 배포 및 관리할 수 있으며, [OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post)와 [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe)을 사용해 프로그래밍 방식으로도 배포 및 관리할 수 있습니다.


## 지원되는 형식 \{#supported-formats\}

- [JSON](/interfaces/formats/JSON)
- [CSV](/interfaces/formats/CSV)
- [TSV](/interfaces/formats/TabSeparated)
- [Parquet](/interfaces/formats/Parquet)
- [Avro](/interfaces/formats/Avro)

## 기능 \{#features\}

### 일회성 수집 \{#one-time-ingestion\}

ABS ClickPipe는 지정된 컨테이너에서 패턴과 일치하는 모든 파일을 찾아 단일 배치 작업으로 ClickHouse 대상 테이블에 로드합니다. 수집 작업이 완료되면 ClickPipe는 자동으로 중지됩니다. 이 일회성 수집 모드는 정확히 한 번 처리 의미(exactly-once semantics)를 제공하여 각 파일이 중복 없이 신뢰성 있게 처리되도록 보장합니다.

### Continuous ingestion \{#continuous-ingestion\}

Continuous ingestion 기능이 활성화되면 ClickPipes는 지정된 경로에서 데이터를 지속적으로 수집합니다. 수집 순서를 결정하기 위해 ABS ClickPipe는 파일의 암묵적인 [사전식 순서(lexicographical order)](#continuous-ingestion-lexicographical-order)에 의존합니다.

#### Lexicographical order \{#continuous-ingestion-lexicographical-order\}

ABS ClickPipe는 파일이 컨테이너에 사전식 순서로 추가된다고 가정하며, 이 암묵적인 순서에 의존해 파일을 순차적으로 수집합니다. 따라서 새 파일은 마지막으로 수집된 파일보다 사전식으로 항상 더 커야 합니다. 예를 들어 `file1`, `file2`, `file3`라는 이름의 파일은 순차적으로 수집되지만, 컨테이너에 새 `file 0`이 추가되면 마지막으로 수집된 파일보다 파일 이름이 사전식으로 더 크지 않기 때문에 이 파일은 **무시**됩니다.

이 모드에서 ABS ClickPipe는 지정된 경로의 **모든 파일**을 최초에 한 번 로드한 다음, 설정 가능한 간격(기본값 30초)으로 새 파일을 폴링합니다. 특정 파일이나 시점에서 수집을 시작하는 것은 **불가능**하며, ClickPipes는 항상 지정된 경로의 모든 파일을 로드합니다.

### 파일 패턴 매칭 \{#file-pattern-matching\}

객체 스토리지 ClickPipes는 파일 패턴 매칭에 POSIX 표준을 따릅니다. 모든 패턴은 **대소문자를 구분**하며 컨테이너 이름 이후의 **전체 경로**와 일치해야 합니다. 성능을 향상하려면 가능한 한 가장 구체적인 패턴을 사용하십시오(예: `*.csv` 대신 `data-2024-*.csv`).

#### 지원되는 패턴 \{#supported-patterns\}

| 패턴 | 설명 | 예시 | 일치 예 |
|---------|-------------|---------|---------|
| `?` | 정확히 **한 개의** 문자(`/` 제외)와 일치합니다. | `data-?.csv` | `data-1.csv`, `data-a.csv`, `data-x.csv` |
| `*` | **0개 이상의** 문자(`/` 제외)와 일치합니다. | `data-*.csv` | `data-1.csv`, `data-001.csv`, `data-report.csv`, `data-.csv` |
| `**` <br></br> 재귀(Recursive) | **0개 이상의** 문자(`/` 포함)와 일치합니다. 디렉터리를 재귀적으로 탐색할 수 있습니다. | `logs/**/error.log` | `logs/error.log`, `logs/2024/error.log`, `logs/2024/01/error.log` |

**예시:**

* `https://storageaccount.blob.core.windows.net/container/folder/*.csv`
* `https://storageaccount.blob.core.windows.net/container/logs/**/data.json`
* `https://storageaccount.blob.core.windows.net/container/file-?.parquet`
* `https://storageaccount.blob.core.windows.net/container/data-2024-*.csv.gz`

#### 지원되지 않는 패턴 \{#unsupported-patterns\}

| Pattern     | Description                       | Example                | Alternatives                                   |
|-------------|-----------------------------------|------------------------|-----------------------------------------------|
| `{abc,def}` | 중괄호 확장(대안 나열)           | `{logs,data}/file.csv` | 각 경로에 대해 별도의 ClickPipes를 생성하십시오. |
| `{N..M}`    | 숫자 범위 확장                   | `file-{1..100}.csv`    | `file-*.csv` 또는 `file-?.csv`를 사용하십시오.    |

**예시:**

* `https://storageaccount.blob.core.windows.net/container/{documents-01,documents-02}.json`
* `https://storageaccount.blob.core.windows.net/container/file-{1..100}.csv`
* `https://storageaccount.blob.core.windows.net/container/{logs,metrics}/data.parquet`

### 정확히 한 번 처리 의미 체계(Exactly-once semantics) \{#exactly-once-semantics\}

대용량 데이터셋을 수집하는 과정에서 다양한 유형의 장애가 발생할 수 있으며, 이로 인해 부분적인 insert 또는 중복 데이터가 발생할 수 있습니다. Object Storage ClickPipes는 insert 장애에 대해 견고하게 동작하며, 정확히 한 번 처리 의미 체계(exactly-once semantics)를 제공합니다. 이는 임시 스테이징(staging) 테이블을 사용하여 구현됩니다. 먼저 데이터는 스테이징 테이블에 insert됩니다. 이 insert 과정에서 문제가 발생하면, 스테이징 테이블을 truncate하여 초기화한 뒤 insert를 다시 시도할 수 있습니다. insert가 완료되고 성공한 경우에만, 스테이징 테이블의 파티션이 대상 테이블로 이동됩니다. 이 전략에 대한 자세한 내용은 [이 블로그 게시물](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)을 참고하십시오.

### Virtual columns \{#virtual-columns\}

어떤 파일이 수집되었는지 추적하려면 `_file` 가상 컬럼을 컬럼 매핑 목록에 포함하십시오. `_file` 가상 컬럼에는 소스 객체의 파일명이 저장되며, 이를 사용해 어떤 파일이 처리되었는지 쿼리할 수 있습니다.

## 액세스 제어 \{#access-control\}

### 권한 \{#permissions\}

ABS ClickPipe는 비공개 컨테이너만 지원합니다. 공개 컨테이너는 **지원하지 않습니다**.

버킷 정책에서 [`s3:GetObject`](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html) 및 [`s3:ListBucket`](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjectsV2.html) 작업을 허용해야 합니다.

### 인증 \{#authentication\}

:::note
Microsoft Entra ID 인증(Managed Identity 포함)은 현재 지원하지 않습니다.
:::

Azure Blob Storage 인증에는 액세스 키와 공유 액세스 서명(SAS)을 모두 지원하는 [connection string](https://docs.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string)이 사용됩니다.

#### 액세스 키 \{#access-key\}

[계정 액세스 키](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage)를 사용하여 인증하려면 다음 형식의 연결 문자열을 제공하십시오:

```bash
DefaultEndpointsProtocol=https;AccountName=storage-account-name;AccountKey=account-access-key;EndpointSuffix=core.windows.net
```

스토리지 계정 이름과 액세스 키는 Azure Portal의 **Storage Account &gt; Access keys** 메뉴에서 확인할 수 있습니다.


#### Shared Access Signature (SAS) \{#sas\}

[Shared Access Signature (SAS)](https://docs.microsoft.com/en-us/azure/storage/common/storage-sas-overview)를 사용하여 인증하려면 SAS 토큰을 포함하는 연결 문자열을 제공하십시오:

```bash
BlobEndpoint=https://storage-account-name.blob.core.windows.net/;SharedAccessSignature=sas-token
```

Azure Portal의 **Storage Account &gt; Shared access signature**에서 수집하려는 컨테이너와 Blob에 대해 적절한 권한(`Read`, `List`)을 포함하는 SAS 토큰을 생성합니다.


### 네트워크 액세스 \{#network-access\}

ABS ClickPipes는 메타데이터 검색과 데이터 수집을 위해 각각 ClickPipes 서비스와 ClickHouse Cloud 서비스를 사용하는 서로 다른 두 개의 네트워크 경로를 사용합니다. 추가적인 네트워크 보안 계층(예: 규정 준수 목적)을 구성하려는 경우 **두 경로 모두에 대해 네트워크 액세스를 구성해야 합니다**.

:::warning
Azure Blob Storage 컨테이너가 ClickHouse Cloud 서비스와 동일한 Azure 리전에 있는 경우 IP 기반 액세스 제어는 **동작하지 않습니다**. 두 서비스가 동일 리전에 배치되어 있으면 트래픽은 공용 인터넷이 아니라 Azure 내부 네트워크를 통해 라우팅됩니다.
:::

* **IP 기반 액세스 제어**를 사용하는 경우 Azure Storage 방화벽의 [IP 네트워크 규칙](https://learn.microsoft.com/en-us/azure/storage/common/storage-network-security)에 ClickPipes 서비스 리전의 고정 IP( [여기](/integrations/clickpipes#list-of-static-ips)에 나열됨)와 ClickHouse Cloud 서비스의 [고정 IP](/manage/data-sources/cloud-endpoints-api)를 모두 허용하도록 설정해야 합니다. ClickHouse Cloud 리전에 대한 고정 IP를 확인하려면 터미널을 열고 다음 명령을 실행하십시오:

    ```bash
    # <your-region>을(를) 사용 중인 ClickHouse Cloud 리전으로 바꾸십시오.
    curl -s https://api.clickhouse.cloud/static-ips.json | jq -r '.azure[] | select(.region == "<your-region>") | .egress_ips[]'
    ```

## 고급 설정 \{#advanced-settings\}

ClickPipes는 대부분의 사용 사례 요구 사항을 충족하는 합리적인 기본값을 제공합니다. 사용 사례에 추가적인 세부 조정이 필요한 경우, 다음 설정을 조정할 수 있습니다:

| Setting                            | Default value |  Description                     |                    
|------------------------------------|---------------|---------------------------------------------------------------------------------------|
| `Max insert bytes`                 | 10GB          | 단일 insert 배치에서 처리할 바이트 수입니다.                                  |
| `Max file count`                   | 100           | 단일 insert 배치에서 처리할 수 있는 최대 파일 개수입니다.                          |
| `Max threads`                      | auto(3)       | 파일 처리를 위한 [동시에 실행할 수 있는 최대 스레드 수](/operations/settings/settings#max_threads)입니다. |
| `Max insert threads`               | 1             | 파일 처리를 위한 [동시에 실행할 수 있는 최대 insert 스레드 수](/operations/settings/settings#max_insert_threads)입니다. |
| `Min insert block size bytes`      | 1GB           | 테이블에 insert될 수 있는 [블록 내 최소 바이트 크기](/operations/settings/settings#min_insert_block_size_bytes)입니다. |
| `Max download threads`             | 4             | [동시에 실행할 수 있는 최대 다운로드 스레드 수](/operations/settings/settings#max_download_threads)입니다. |
| `Object storage polling interval`  | 30s           | ClickHouse 클러스터로 데이터를 insert하기 전까지의 최대 대기 시간을 설정합니다. |
| `Parallel distributed insert select` | 2           | [Parallel distributed insert select 설정](/operations/settings/settings#parallel_distributed_insert_select)입니다. |
| `Parallel view processing`         | false         | 연결된 뷰로의 푸시를 [순차적으로가 아니라 동시에 처리할지](/operations/settings/settings#parallel_view_processing) 여부입니다. |
| `Use cluster function`             | true          | 여러 노드에 걸쳐 파일을 병렬로 처리할지 여부입니다. |

<Image img={cp_advanced_settings} alt="ClickPipes용 고급 설정" size="lg" border/>

### 확장 \{#scaling\}

객체 스토리지 ClickPipes는 [수직 자동 확장 설정 구성](/manage/scaling#configuring-vertical-auto-scaling)에 의해 결정되는 최소 ClickHouse 서비스 크기를 기준으로 확장됩니다. ClickPipe의 크기는 파이프를 생성할 때 결정되며, 이후 ClickHouse 서비스 설정을 변경하더라도 ClickPipe 크기에는 영향을 주지 않습니다.

대규모 수집 작업의 처리량을 높이려면 ClickPipe를 생성하기 전에 ClickHouse 서비스를 먼저 확장할 것을 권장합니다.

## 알려진 제한 사항 \{#known-limitations\}

### 파일 크기 \{#file-size\}

ClickPipes는 크기가 **10GB 이하**인 오브젝트만 수집을 시도합니다. 파일 크기가 10GB를 초과하면 ClickPipes 전용 오류 테이블에 오류가 추가됩니다.

### 지연 시간 \{#latency\}

파일이 100,000개를 초과하는 컨테이너의 경우, Azure Blob Storage `LIST` 작업이 기본 폴링 간격 외에 신규 파일을 감지하는 데 추가 지연 시간을 발생시킵니다:

- **< 10만 개 파일**: 약 30초(기본 폴링 간격)
- **10만 개 파일**: 약 40–45초  
- **25만 개 파일**: 약 55–70초
- **50만 개+ 파일**: 90초를 초과할 수 있음

[지속적인 수집](#continuous-ingestion)의 경우, ClickPipes는 마지막으로 수집된 파일보다 사전식(lexicographical)으로 더 큰 신규 파일을 식별하기 위해 컨테이너를 스캔해야 합니다. `LIST` 작업 한 번에 조회되는 파일 수를 줄이기 위해, 파일을 더 작은 컨테이너로 구성하거나 계층적 디렉터리 구조를 사용하는 것을 권장합니다.

### View 지원 \{#view-support\}

대상 테이블에 대한 materialized view도 지원합니다. ClickPipes는 대상 테이블뿐만 아니라, 해당 대상 테이블에 종속된 모든 materialized view에 대해서도 staging 테이블을 생성합니다.

materialized view가 아닌 일반 view에 대해서는 staging 테이블을 생성하지 않습니다. 따라서 하나 이상의 다운스트림 materialized view가 있는 대상 테이블이 있는 경우, 해당 materialized view에서는 대상 테이블의 데이터를 view를 통해 조회하지 않도록 해야 합니다. 그렇지 않으면 materialized view에 데이터가 누락될 수 있습니다.

### Dependencies \{#dependencies\}

ClickPipe가 실행 중일 때 대상 테이블, 해당 materialized view(연속 materialized view 포함) 또는 materialized view의 대상 테이블을 변경하면 재시도 가능한 오류가 발생합니다. 이러한 종속성의 스키마를 변경하려면 ClickPipe를 일시 중지한 후 변경을 적용하고, 그다음 다시 재개해야 합니다.