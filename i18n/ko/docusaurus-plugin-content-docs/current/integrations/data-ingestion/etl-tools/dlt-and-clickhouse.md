---
sidebar_label: 'dlt'
keywords: ['clickhouse', 'dlt', 'connect', 'integrate', 'etl', 'data integration']
description: 'dlt 통합을 사용하여 ClickHouse로 데이터를 적재합니다'
title: 'dlt를 ClickHouse에 연결'
slug: /integrations/data-ingestion/etl-tools/dlt-and-clickhouse
doc_type: 'guide'
---

import PartnerBadge from '@theme/badges/PartnerBadge';


# dlt를 ClickHouse에 연결하기 \{#connect-dlt-to-clickhouse\}

<PartnerBadge/>

<a href="https://dlthub.com/docs/intro" target="_blank">dlt</a>는 Python 스크립트에 추가하여 다양한, 종종 정제되지 않은 데이터 소스에서 데이터를 가져와 잘 구조화된 라이브 데이터 세트로 로드할 수 있는 오픈 소스 라이브러리입니다.

## ClickHouse와 함께 dlt 설치하기 \{#install-dlt-with-clickhouse\}

### ClickHouse 관련 종속성을 포함하여 `dlt` 라이브러리를 설치하려면: \{#to-install-the-dlt-library-with-clickhouse-dependencies\}

```bash
pip install "dlt[clickhouse]"
```


## 설정 가이드 \{#setup-guide\}

<VerticalStepper headerLevel="h3">

### dlt 프로젝트 초기화 \{#1-initialize-the-dlt-project\}

먼저 다음 명령으로 새로운 `dlt` 프로젝트를 초기화합니다:
```bash
dlt init chess clickhouse
```

:::note
이 명령은 소스로 chess를, 대상으로 ClickHouse를 사용하는 파이프라인을 초기화합니다.
:::

위 명령은 `.dlt/secrets.toml` 및 ClickHouse용 requirements 파일을 포함하여 여러 파일과 디렉터리를 생성합니다. 다음과 같이 실행하여 requirements 파일에 지정된 필요한 의존성을 설치할 수 있습니다:
```bash
pip install -r requirements.txt
```

또는 `pip install dlt[clickhouse]` 명령을 사용하면, 대상이 ClickHouse인 작업에 필요한 의존성과 함께 `dlt` 라이브러리를 설치합니다.

### ClickHouse 데이터베이스 설정 \{#2-setup-clickhouse-database\}

ClickHouse에 데이터를 적재하려면 ClickHouse 데이터베이스를 생성해야 합니다. 다음은 수행해야 할 작업에 대한 개략적인 순서입니다:

1. 기존 ClickHouse 데이터베이스를 사용하거나 새로 생성할 수 있습니다.

2. 새 데이터베이스를 생성하려면, `clickhouse-client` 명령줄 도구 또는 원하는 SQL 클라이언트를 사용하여 ClickHouse 서버에 접속합니다.

3. 다음 SQL 명령을 실행하여 새 데이터베이스와 사용자를 생성하고 필요한 권한을 부여합니다:

```bash
CREATE DATABASE IF NOT EXISTS dlt;
CREATE USER dlt IDENTIFIED WITH sha256_password BY 'Dlt*12345789234567';
GRANT CREATE, ALTER, SELECT, DELETE, DROP, TRUNCATE, OPTIMIZE, SHOW, INSERT, dictGet ON dlt.* TO dlt;
GRANT SELECT ON INFORMATION_SCHEMA.COLUMNS TO dlt;
GRANT CREATE TEMPORARY TABLE, S3 ON *.* TO dlt;
```

### 자격 증명 추가 \{#3-add-credentials\}

다음으로, 아래와 같이 `.dlt/secrets.toml` 파일에 ClickHouse 자격 증명을 설정합니다:

```bash
[destination.clickhouse.credentials]
database = "dlt"                         # 생성한 데이터베이스 이름
username = "dlt"                         # ClickHouse 사용자명, 기본값은 보통 "default"
password = "Dlt*12345789234567"          # ClickHouse 비밀번호 (있는 경우)
host = "localhost"                       # ClickHouse 서버 호스트
port = 9000                              # ClickHouse HTTP 포트, 기본값은 9000
http_port = 8443                         # ClickHouse 서버의 HTTP 인터페이스에 연결할 HTTP 포트. 기본값은 8443입니다.
secure = 1                               # HTTPS를 사용하는 경우 1, 그렇지 않으면 0으로 설정합니다.

[destination.clickhouse]
dataset_table_separator = "___"          # 데이터셋과 테이블 이름을 구분하는 구분자입니다.
```

:::note HTTP_PORT
`http_port` 매개변수는 ClickHouse 서버의 HTTP 인터페이스에 연결할 때 사용할 포트 번호를 지정합니다. 이는 기본 포트 9000과는 다른데, 9000은 네이티브 TCP 프로토콜에 사용됩니다.

외부 스테이징을 사용하지 않는 경우(즉, 파이프라인에서 staging 매개변수를 설정하지 않는 경우) `http_port`를 반드시 설정해야 합니다. 이는 내장 ClickHouse 로컬 스토리지 스테이징이 ClickHouse와 HTTP로 통신하는 <a href="https://github.com/ClickHouse/clickhouse-connect">clickhouse-connect</a> 라이브러리를 사용하기 때문입니다.

ClickHouse 서버가 `http_port`에 지정한 포트에서 HTTP 연결을 수락하도록 구성되어 있는지 확인해야 합니다. 예를 들어 `http_port = 8443`으로 설정한 경우, ClickHouse는 8443 포트에서 HTTP 요청을 수신해야 합니다. 외부 스테이징을 사용하는 경우에는 이 경우 clickhouse-connect가 사용되지 않으므로 `http_port` 매개변수를 생략할 수 있습니다.
:::

`clickhouse-driver` 라이브러리에서 사용하는 것과 유사한 데이터베이스 연결 문자열을 전달할 수 있습니다. 위 자격 증명을 사용하면 다음과 같은 형태가 됩니다:

```bash
# toml 파일의 맨 위, 어떤 섹션보다 앞에 두십시오.
destination.clickhouse.credentials="clickhouse://dlt:Dlt*12345789234567@localhost:9000/dlt?secure=1"
```

</VerticalStepper>

## Write disposition \{#write-disposition\}

모든 [write dispositions](https://dlthub.com/docs/general-usage/incremental-loading#choosing-a-write-disposition)
를 모두 지원합니다.

dlt 라이브러리의 write disposition은 데이터를 대상에 어떻게 기록할지 정의합니다. write disposition에는 세 가지 유형이 있습니다:

**Replace**: 이 disposition은 리소스의 데이터로 대상에 있는 데이터를 대체합니다. 모든 클래스와 객체를 삭제하고, 데이터를 로드하기 전에 스키마를 다시 생성합니다. 자세한 내용은 <a href="https://dlthub.com/docs/general-usage/full-loading">여기</a>에서 확인할 수 있습니다.

**Merge**: 이 write disposition은 리소스의 데이터를 대상에 있는 데이터와 병합합니다. `merge` disposition을 사용하려면 리소스에 대한 `primary_key`를 지정해야 합니다. 자세한 내용은 <a href="https://dlthub.com/docs/general-usage/incremental-loading">여기</a>에서 확인할 수 있습니다.

**Append**: 기본 disposition입니다. 이 옵션은 대상의 기존 데이터에 새 데이터를 이어서 추가하며, `primary_key` 필드는 무시합니다.

## 데이터 로딩 \{#data-loading\}

데이터는 데이터 소스에 따라 가장 효율적인 방법으로 ClickHouse에 적재됩니다.

- 로컬 파일은 `clickhouse-connect` 라이브러리를 사용하여 `INSERT` 명령어로 ClickHouse 테이블에 직접 적재합니다.
- `S3`, `Google Cloud Storage`, `Azure Blob Storage`와 같은 원격 스토리지에 있는 파일은 ClickHouse 테이블 함수인 s3, gcs, azureBlobStorage를 사용하여 파일을 읽고 데이터를 테이블에 삽입합니다.

## Datasets \{#datasets\}

`ClickHouse`는 하나의 데이터베이스에서 여러 개의 dataset을 지원하지 않지만, `dlt`는 여러 이유로 dataset 개념에 의존합니다. `ClickHouse`를 `dlt`와 함께 사용하려면, `ClickHouse` 데이터베이스에서 `dlt`가 생성하는 테이블 이름 앞에 dataset 이름이 접두사로 붙고, 설정 가능한 `dataset_table_separator`로 구분됩니다. 또한 실제 데이터를 포함하지 않는 특수 sentinel 테이블이 생성되어, `dlt`가 `ClickHouse` 대상에서 어떤 가상 dataset이 이미 존재하는지 인식할 수 있도록 합니다.

## 지원되는 파일 포맷 \{#supported-file-formats\}

- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/jsonl">jsonl</a>은(는) 직접 로딩과 스테이징 모두에 권장되는 포맷입니다.
- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/parquet">parquet</a>은(는) 직접 로딩과 스테이징 모두에서 지원됩니다.

`clickhouse` 대상은 기본 SQL 대상과 비교했을 때 몇 가지 구체적인 차이점이 있습니다:

1. `Clickhouse`에는 실험적인 `object` 데이터 타입이 있지만, 다소 예측하기 어려운 면이 있어 dlt clickhouse 대상에서는 복합 데이터 타입을 `text` 컬럼으로 로드합니다. 이 기능이 필요하다면 Slack 커뮤니티로 연락해 주시면 추가를 검토하겠습니다.
2. `Clickhouse`는 `time` 데이터 타입을 지원하지 않습니다. `time` 값은 `text` 컬럼으로 로드됩니다.
3. `Clickhouse`는 `binary` 데이터 타입을 지원하지 않습니다. 대신 바이너리 데이터는 `text` 컬럼으로 로드됩니다. `jsonl`에서 로드하는 경우 바이너리 데이터는 base64 문자열이 되며, parquet에서 로드하는 경우 `binary` 객체는 `text`로 변환됩니다.
5. `Clickhouse`는 데이터가 이미 들어 있는 테이블에 null이 아닌 컬럼을 추가하는 것을 허용합니다.
6. `Clickhouse`는 특정 조건에서 float 또는 double 데이터 타입을 사용할 때 반올림 오류를 발생시킬 수 있습니다. 반올림 오류를 허용할 수 없다면 decimal 데이터 타입을 사용해야 합니다. 예를 들어, 로더 파일 포맷을 `jsonl`로 설정한 상태에서 값 12.7001을 double 컬럼에 로드하면 예측 가능한 반올림 오류가 발생합니다.

## 지원되는 컬럼 힌트 \{#supported-column-hints\}

ClickHouse는 다음과 같은 <a href="https://dlthub.com/docs/general-usage/schema#tables-and-columns">컬럼 힌트</a>를 지원합니다:

- `primary_key` - 해당 컬럼이 기본 키의 일부가 되도록 지정합니다. 여러 컬럼에 이 힌트를 지정하여 복합 기본 키를 만들 수 있습니다.

## 테이블 엔진 \{#table-engine\}

기본적으로 ClickHouse에서는 테이블이 `ReplicatedMergeTree` 테이블 엔진으로 생성됩니다. ClickHouse 어댑터에서 `table_engine_type`을 사용하여 다른 테이블 엔진을 지정할 수 있습니다:

```bash
from dlt.destinations.adapters import clickhouse_adapter

@dlt.resource()
def my_resource():
  ...

clickhouse_adapter(my_resource, table_engine_type="merge_tree")
```

지원되는 값은 다음과 같습니다:

* `merge_tree` - `MergeTree` 엔진으로 테이블을 생성합니다.
* `replicated_merge_tree` (기본값) - `ReplicatedMergeTree` 엔진으로 테이블을 생성합니다.


## 스테이징 지원 \{#staging-support\}

ClickHouse는 파일 스테이징 대상으로 Amazon S3, Google Cloud Storage 및 Azure Blob Storage를 지원합니다.

`dlt`는 Parquet 또는 jsonl 파일을 스테이징 영역에 업로드하고, ClickHouse의 table function을 사용하여 스테이징된 파일에서 데이터를 직접 로드합니다.

스테이징 대상으로 사용할 저장소에 대한 자격 증명 설정 방법은 파일 시스템 문서를 참고하십시오:

* <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#aws-s3">Amazon S3</a>
* <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#google-storage">Google Cloud Storage</a>
* <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#azure-blob-storage">Azure Blob Storage</a>

스테이징이 활성화된 파이프라인을 실행하려면:

```bash
pipeline = dlt.pipeline(
  pipeline_name='chess_pipeline',
  destination='clickhouse',
  staging='filesystem',  # add this to activate staging
  dataset_name='chess_data'
)
```


### 스테이징 영역으로 Google Cloud Storage 사용하기 \{#using-google-cloud-storage-as-a-staging-area\}

dlt는 ClickHouse로 데이터를 로드할 때 스테이징 영역으로 Google Cloud Storage(GCS)를 사용할 수 있도록 지원합니다. 이는 dlt가 내부적으로 사용하는 ClickHouse의 <a href="https://clickhouse.com/docs/sql-reference/table-functions/gcs">GCS table function</a>에 의해 자동으로 처리됩니다.

ClickHouse의 GCS table function은 Hash-based Message Authentication Code(HMAC) 키를 사용하는 인증만 지원합니다. 이를 위해 GCS는 Amazon S3 API를 에뮬레이션하는 S3 호환 모드를 제공합니다. ClickHouse는 이를 활용하여 S3 통합을 통해 GCS 버킷에 액세스할 수 있도록 합니다.

dlt에서 HMAC 인증을 사용하여 GCS 스테이징을 설정하려면:

1. <a href="https://cloud.google.com/storage/docs/authentication/managing-hmackeys#create">Google Cloud 가이드</a>를 따라 GCS 서비스 계정용 HMAC 키를 생성합니다.

2. `config.toml`의 dlt 프로젝트 ClickHouse destination 설정에서 서비스 계정의 HMAC 키와 함께 `client_email`, `project_id`, `private_key`를 설정합니다:

```bash
[destination.filesystem]
bucket_url = "gs://dlt-ci"

[destination.filesystem.credentials]
project_id = "a-cool-project"
client_email = "my-service-account@a-cool-project.iam.gserviceaccount.com"
private_key = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkaslkdjflasjnkdcopauihj...wEiEx7y+mx\nNffxQBqVVej2n/D93xY99pM=\n-----END PRIVATE KEY-----\n"

[destination.clickhouse.credentials]
database = "dlt"
username = "dlt"
password = "Dlt*12345789234567"
host = "localhost"
port = 9440
secure = 1
gcp_access_key_id = "JFJ$$*f2058024835jFffsadf"
gcp_secret_access_key = "DFJdwslf2hf57)%$02jaflsedjfasoi"
```

참고: HMAC 키 `bashgcp_access_key_id` 및 `gcp_secret_access_key` 외에도 이제 서비스 계정에 대해 `[destination.filesystem.credentials]` 아래에 `client_email`, `project_id`, `private_key`를 제공해야 합니다. 이는 GCS 스테이징 지원이 현재 임시 우회 방식으로 구현되어 있으며 아직 최적화되지 않았기 때문입니다.

dlt는 이 자격 증명을 ClickHouse에 전달하며, ClickHouse가 인증 및 GCS 액세스를 처리합니다.

향후 ClickHouse dlt destination에 대한 GCS 스테이징 구성을 단순화하고 개선하기 위한 작업이 진행 중입니다. 적절한 GCS 스테이징 지원은 다음 GitHub 이슈에서 추적되고 있습니다:

* 파일 시스템 destination이 S3 호환 모드에서 GCS와 <a href="https://github.com/dlt-hub/dlt/issues/1272">작동하도록</a> 하기
* Google Cloud Storage 스테이징 영역에 대한<a href="https://github.com/dlt-hub/dlt/issues/1181"> 지원</a>


### dbt 지원 \{#dbt-support\}

<a href="https://dlthub.com/docs/dlt-ecosystem/transformations/dbt/">dbt</a>와의 통합은 일반적으로 dbt-clickhouse를 통해 지원됩니다.

### `dlt` 상태 동기화 \{#syncing-of-dlt-state\}

이 대상은 <a href="https://dlthub.com/docs/general-usage/state#syncing-state-with-destination">dlt</a> 상태 동기화 기능을 완벽하게 지원합니다.