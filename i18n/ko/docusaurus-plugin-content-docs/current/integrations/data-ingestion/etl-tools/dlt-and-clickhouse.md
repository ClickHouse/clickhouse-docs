---
'sidebar_label': 'dlt'
'keywords':
- 'clickhouse'
- 'dlt'
- 'connect'
- 'integrate'
- 'etl'
- 'data integration'
'description': 'dlt 통합을 사용하여 Clickhouse에 데이터를 로드하기'
'title': 'dlt를 ClickHouse에 연결하기'
'slug': '/integrations/data-ingestion/etl-tools/dlt-and-clickhouse'
'doc_type': 'guide'
---

import PartnerBadge from '@theme/badges/PartnerBadge';


# Connect dlt to ClickHouse

<PartnerBadge/>

<a href="https://dlthub.com/docs/intro" target="_blank">dlt</a>는 다양한 복잡한 데이터 소스에서 잘 구조화된 라이브 데이터 세트로 데이터를 로드하기 위해 Python 스크립트에 추가할 수 있는 오픈 소스 라이브러리입니다.

## Install dlt with ClickHouse {#install-dlt-with-clickhouse}

### To Install the `dlt` library with ClickHouse dependencies: {#to-install-the-dlt-library-with-clickhouse-dependencies}
```bash
pip install "dlt[clickhouse]"
```

## Setup guide {#setup-guide}

<VerticalStepper headerLevel="h3">

### Initialize the dlt Project {#1-initialize-the-dlt-project}

새로운 `dlt` 프로젝트를 다음과 같이 초기화합니다:
```bash
dlt init chess clickhouse
```

:::note
이 명령은 체스를 소스로 하고 ClickHouse를 대상으로 하여 당신의 파이프라인을 초기화합니다.
:::

위의 명령은 `.dlt/secrets.toml` 및 ClickHouse를 위한 요구 사항 파일을 포함하여 여러 파일과 디렉터리를 생성합니다. 요구 사항 파일에 지정된 필요한 종속성을 설치하려면 다음과 같이 실행합니다:
```bash
pip install -r requirements.txt
```

또는 `pip install dlt[clickhouse]`를 사용하여 `dlt` 라이브러리와 ClickHouse를 대상으로 작업하기 위한 필요한 종속성을 설치합니다.

### Setup ClickHouse Database {#2-setup-clickhouse-database}

ClickHouse에 데이터를 로드하려면 ClickHouse 데이터베이스를 생성해야 합니다. 해야 할 작업의 대략적인 개요는 다음과 같습니다:

1. 기존의 ClickHouse 데이터베이스를 사용할 수 있거나 새로 만들 수 있습니다.

2. 새 데이터베이스를 만들기 위해 `clickhouse-client` 명령줄 도구 또는 선택한 SQL 클라이언트를 사용하여 ClickHouse 서버에 연결합니다.

3. 다음 SQL 명령을 실행하여 새 데이터베이스, 사용자, 그리고 필요한 권한을 부여합니다:

```bash
CREATE DATABASE IF NOT EXISTS dlt;
CREATE USER dlt IDENTIFIED WITH sha256_password BY 'Dlt*12345789234567';
GRANT CREATE, ALTER, SELECT, DELETE, DROP, TRUNCATE, OPTIMIZE, SHOW, INSERT, dictGet ON dlt.* TO dlt;
GRANT SELECT ON INFORMATION_SCHEMA.COLUMNS TO dlt;
GRANT CREATE TEMPORARY TABLE, S3 ON *.* TO dlt;
```

### Add credentials {#3-add-credentials}

다음으로, ClickHouse 자격 증명을 `.dlt/secrets.toml` 파일에 다음과 같이 설정합니다:

```bash
[destination.clickhouse.credentials]
database = "dlt"                         # The database name you created
username = "dlt"                         # ClickHouse username, default is usually "default"
password = "Dlt*12345789234567"          # ClickHouse password if any
host = "localhost"                       # ClickHouse server host
port = 9000                              # ClickHouse HTTP port, default is 9000
http_port = 8443                         # HTTP Port to connect to ClickHouse server's HTTP interface. Defaults to 8443.
secure = 1                               # Set to 1 if using HTTPS, else 0.

[destination.clickhouse]
dataset_table_separator = "___"          # Separator for dataset table names from dataset.
```

:::note HTTP_PORT
`http_port` 매개변수는 ClickHouse 서버의 HTTP 인터페이스에 연결할 때 사용할 포트 번호를 지정합니다. 이는 기본적으로 TCP 프로토콜을 위해 사용되는 포트 9000과는 다릅니다.

외부 스테이징을 사용하지 않는 경우 `http_port`를 설정해야 합니다(즉, 파이프라인의 스테이징 매개변수를 설정하지 않는 경우). 이는 내장된 ClickHouse 로컬 스토리지 스테이징이 ClickHouse와 HTTP를 통해 통신하는 <a href="https://github.com/ClickHouse/clickhouse-connect">clickhouse content</a> 라이브러리를 사용하기 때문입니다.

ClickHouse 서버가 `http_port`에 지정된 포트에서 HTTP 연결을 수락하도록 구성되었는지 확인하십시오. 예를 들어, `http_port = 8443`을 설정하면 ClickHouse는 포트 8443에서 HTTP 요청을 수신 대기해야 합니다. 외부 스테이징을 사용하는 경우, clickhouse-connect가 사용되지 않기 때문에 `http_port` 매개변수를 생략할 수 있습니다.
:::

`clickhouse-driver` 라이브러리에서 사용하는 것과 유사한 데이터베이스 연결 문자열을 전달할 수 있습니다. 위의 자격 증명은 다음과 같이 보입니다:

```bash

# keep it at the top of your toml file, before any section starts.
destination.clickhouse.credentials="clickhouse://dlt:Dlt*12345789234567@localhost:9000/dlt?secure=1"
```

</VerticalStepper>

## Write disposition {#write-disposition}

모든 [write dispositions](https://dlthub.com/docs/general-usage/incremental-loading#choosing-a-write-disposition)가 지원됩니다.

dlt 라이브러리의 쓰기 디스포지션은 데이터가 대상에 어떻게 작성되어야 하는지를 정의합니다. 세 가지 유형의 쓰기 디스포지션이 있습니다:

**Replace**: 이 디스포지션은 자원에서 오는 데이터로 대상을 대체합니다. 데이터 로드 전에 모든 클래스와 객체를 삭제하고 스키마를 재생성합니다. 이에 대한 자세한 내용은 <a href="https://dlthub.com/docs/general-usage/full-loading">여기</a>에서 확인할 수 있습니다.

**Merge**: 이 쓰기 디스포지션은 자원에서 오는 데이터를 대목적지의 데이터와 병합합니다. `merge` 디스포지션의 경우, 자원에 대한 `primary_key`를 지정해야 합니다. 이에 대한 자세한 내용은 <a href="https://dlthub.com/docs/general-usage/incremental-loading">여기</a>에서 확인할 수 있습니다.

**Append**: 기본 디스포지션입니다. 데이터가 대목적지의 기존 데이터에 추가되며, `primary_key` 필드는 무시됩니다.

## Data loading {#data-loading}
데이터는 데이터 소스에 따라 가장 효율적인 방법으로 ClickHouse에 로드됩니다:

- 로컬 파일의 경우, `clickhouse-connect` 라이브러리를 사용하여 파일을 ClickHouse 테이블에 직접 로드하는 `INSERT` 명령이 사용됩니다.
- `S3` , `Google Cloud Storage` 또는 `Azure Blob Storage`와 같은 원격 스토리지의 파일의 경우, ClickHouse 테이블 함수인 s3, gcs 및 azureBlobStorage가 사용되어 파일을 읽고 테이블에 데이터를 삽입합니다.

## Datasets {#datasets}

`Clickhouse`는 하나의 데이터베이스에서 여러 데이터 세트를 지원하지 않으며, 반면에 `dlt`는 여러 가지 이유로 데이터 세트에 의존합니다. `Clickhouse`가 `dlt`와 함께 작동하도록 하기 위해, `dlt`가 생성한 테이블은 ClickHouse 데이터베이스 내에서 데이터 세트 이름으로 접두사가 붙고, 구성 가능한 `dataset_table_separator`로 구분됩니다. 또한, 데이터가 없는 특수 센티넬 테이블이 생성되어 `dlt`가 Clickhouse 목적지에 이미 존재하는 가상 데이터 세트를 인식할 수 있도록 합니다.

## Supported file formats {#supported-file-formats}

- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/jsonl">jsonl</a>은 직접 로드 및 스테이징 모두에 권장되는 형식입니다.
- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/parquet">parquet</a>는 직접 로드 및 스테이징 모두에 대해 지원됩니다.

`clickhouse` 대상은 기본 sql 대상과 몇 가지 특이점이 있습니다:

1. `Clickhouse`는 실험적인 `object` 데이터 유형을 가지고 있지만, 이는 다소 예측할 수 없으므로 dlt clickhouse 목표는 복합 데이터 유형을 텍스트 컬럼으로 로드합니다. 이 기능이 필요하면, Slack 커뮤니티에 문의하시고 추가를 고려하겠습니다.
2. `Clickhouse`는 `time` 데이터 유형을 지원하지 않습니다. 시간은 `text` 컬럼으로 로드됩니다.
3. `Clickhouse`는 `binary` 데이터 유형을 지원하지 않습니다. 대신, 이진 데이터는 `text` 컬럼에 로드됩니다. `jsonl`에서 로드할 때 이진 데이터는 base64 문자열이 되고, parquet에서 로드할 때 `binary` 객체는 `text`로 변환됩니다.
5. `Clickhouse`는 null이 아닌 데이터베이스가 채워진 테이블에 컬럼 추가를 허용합니다.
6. `Clickhouse`는 float 또는 double 데이터 유형을 사용할 때 특정 조건 하에 반올림 오류를 발생시킬 수 있습니다. 반올림 오류가 발생할 여유가 없다면, decimal 데이터 유형을 사용해야 합니다. 예를 들어, 로더 파일 형식이 `jsonl`로 설정된 상태에서 double 컬럼에 12.7001 값을 로드하면 예측 가능하게 반올림 오류가 발생합니다.

## Supported column hints {#supported-column-hints}
ClickHouse는 다음과 같은 <a href="https://dlthub.com/docs/general-usage/schema#tables-and-columns">컬럼 힌트</a>를 지원합니다:

- `primary_key` - 컬럼을 기본 키의 일부로 표시합니다. 여러 컬럼에 이 힌트를 부여하여 복합 기본 키를 생성할 수 있습니다.

## Table engine {#table-engine}
기본적으로 테이블은 ClickHouse에서 `ReplicatedMergeTree` 테이블 엔진을 사용하여 생성됩니다. clickhouse 어댑터로 `table_engine_type`을 사용하여 대체 테이블 엔진을 지정할 수 있습니다:

```bash
from dlt.destinations.adapters import clickhouse_adapter

@dlt.resource()
def my_resource():
  ...

clickhouse_adapter(my_resource, table_engine_type="merge_tree")
```

지원되는 값은 다음과 같습니다:

- `merge_tree` - `MergeTree` 엔진을 사용하여 테이블을 생성합니다
- `replicated_merge_tree` (기본값) - `ReplicatedMergeTree` 엔진을 사용하여 테이블을 생성합니다

## Staging support {#staging-support}

ClickHouse는 파일 스테이징 대기로 Amazon S3, Google Cloud Storage 및 Azure Blob Storage를 지원합니다.

`dlt`는 Parquet 또는 jsonl 파일을 스테이징 위치에 업로드하고 ClickHouse 테이블 함수를 사용하여 스테이지된 파일에서 직접 데이터를 로드합니다.

스테이징 대기의 자격 증명을 구성하는 방법에 대한 파일 시스템 문서를 참조하십시오:

- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#aws-s3">Amazon S3</a>
- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#google-storage">Google Cloud Storage</a>
- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#azure-blob-storage">Azure Blob Storage</a>

스테이징이 활성화된 상태에서 파이프라인을 실행하려면:

```bash
pipeline = dlt.pipeline(
  pipeline_name='chess_pipeline',
  destination='clickhouse',
  staging='filesystem',  # add this to activate staging
  dataset_name='chess_data'
)
```

### Using Google Cloud Storage as a staging area {#using-google-cloud-storage-as-a-staging-area}
dlt는 ClickHouse에 데이터를 로드할 때 Google Cloud Storage (GCS)를 스테이징 영역으로 사용하는 것을 지원합니다. 이는 ClickHouse의 <a href="https://clickhouse.com/docs/sql-reference/table-functions/gcs">GCS 테이블 함수</a>에 의해 자동으로 처리됩니다.

ClickHouse GCS 테이블 함수는 해시 기반 메시지 인증 코드(HMAC) 키를 사용하여 인증하는 것만 지원합니다. 이를 활성화하기 위해 GCS는 Amazon S3 API를 에뮬레이트하는 S3 호환 모드를 제공합니다. ClickHouse는 이를 통해 S3 통합을 통해 GCS 버킷에 접근할 수 있게 됩니다.

dlt에서 HMAC 인증으로 GCS 스테이징을 설정하려면:

1. <a href="https://cloud.google.com/storage/docs/authentication/managing-hmackeys#create">Google Cloud 가이드</a>를 따라 GCS 서비스 계정을 위한 HMAC 키를 생성합니다.

2. dlt 프로젝트의 ClickHouse 대상 설정에 있는 `config.toml`에서 HMAC 키, 그리고 서비스 계정을 위한 `client_email`, `project_id`, `private_key`를 구성합니다:

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

Note: HMAC 키 `bashgcp_access_key_id`와 `gcp_secret_access_key` 외에도, 이제 `[destination.filesystem.credentials]` 아래에서 서비스 계정의 `client_email`, `project_id`, `private_key`를 제공해야 합니다. 이는 GCS 스테이징 지원이 현재 임시 방편으로 구현되어 있으며 여전히 최적화되지 않았기 때문입니다.

dlt는 이러한 자격 증명을 ClickHouse에 전달하며, ClickHouse는 인증 및 GCS 접근을 처리합니다.

미래에 ClickHouse dlt 목적지를 위한 GCS 스테이징 설정을 단순화하고 개선하기 위해 진행 중인 작업이 있습니다. 적절한 GCS 스테이징 지원은 다음 GitHub 이슈에서 추적되고 있습니다:

- 파일 시스템 대상이 <a href="https://github.com/dlt-hub/dlt/issues/1272">gcs와 함께 작동</a> 할 수 있도록
- Google Cloud Storage 스테이징 영역<a href="https://github.com/dlt-hub/dlt/issues/1181"> 지원</a>

### Dbt support {#dbt-support}
<a href="https://dlthub.com/docs/dlt-ecosystem/transformations/dbt/">dbt</a>와의 통합은 일반적으로 dbt-clickhouse를 통해 지원됩니다.

### Syncing of `dlt` state {#syncing-of-dlt-state}
이 대상은 <a href="https://dlthub.com/docs/general-usage/state#syncing-state-with-destination">dlt</a> 상태 동기화를 완벽하게 지원합니다.
