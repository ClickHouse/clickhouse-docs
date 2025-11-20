---
'description': 'highlight-next-line에 대한 Documentation'
'sidebar_label': '데이터 저장을 위한 외부 디스크'
'sidebar_position': 68
'slug': '/operations/storing-data'
'title': '데이터 저장을 위한 외부 디스크'
'doc_type': 'guide'
---

Data processed in ClickHouse는 일반적으로 ClickHouse 서버가 실행 중인 머신의 로컬 파일 시스템에 저장됩니다. 이로 인해 대용량 디스크가 필요하며, 이는 비용이 많이 들 수 있습니다. 데이터를 로컬에 저장하는 것을 피하기 위해 다양한 저장 옵션이 지원됩니다:
1. [Amazon S3](https://aws.amazon.com/s3/) 객체 저장소.
2. [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs).
3. 지원되지 않는 항목: 하둡 분산 파일 시스템 ([HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html))

<br/>

:::note 
ClickHouse는 이 페이지에 설명된 외부 저장 옵션과는 다른 외부 테이블 엔진도 지원합니다. 이는 Parquet과 같은 일반 파일 형식으로 저장된 데이터를 읽을 수 있도록 합니다. 이 페이지에서는 ClickHouse의 `MergeTree` 패밀리 또는 `Log` 패밀리 테이블에 대한 저장 구성에 대해 설명합니다.

1. `Amazon S3` 디스크에 저장된 데이터와 작업하려면, [S3](/engines/table-engines/integrations/s3.md) 테이블 엔진을 사용하세요.
2. Azure Blob Storage에 저장된 데이터와 작업하려면, [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage.md) 테이블 엔진을 사용하세요.
3. 하둡 분산 파일 시스템에 저장된 데이터와 작업하려면 (지원되지 않음), [HDFS](/engines/table-engines/integrations/hdfs.md) 테이블 엔진을 사용하세요.
:::
## 외부 저장소 구성 {#configuring-external-storage}

[`MergeTree`](/engines/table-engines/mergetree-family/mergetree.md)와 [`Log`](/engines/table-engines/log-family/log.md) 
패밀리 테이블 엔진은 각각 `s3`, `azure_blob_storage`, `hdfs` (지원되지 않음) 유형의 디스크에 데이터를 저장할 수 있습니다.

디스크 구성에는 다음이 필요합니다:

1. `s3`, `azure_blob_storage`, `hdfs` (지원되지 않음), `local_blob_storage`, `web` 중 하나와 동일한 `type` 섹션.
2. 특정 외부 저장소 유형에 대한 구성.

24.1 clickhouse 버전부터는 새로운 구성 옵션을 사용할 수 있습니다.
다음과 같은 사항을 지정해야 합니다:

1. `type`이 `object_storage`와 동일해야 합니다.
2. `object_storage_type`, `s3`, `azure_blob_storage` (또는 `24.3`부터는 단순히 `azure`), `hdfs` (지원되지 않음), `local_blob_storage` (또는 `24.3`부터는 단순히 `local`), `web` 중 하나와 동일해야 합니다.

<br/>

선택적으로, `metadata_type`을 지정할 수 있습니다 (기본값은 `local`입니다). 그러나 `plain`, `web`, `24.4`부터는 `plain_rewritable`로 설정할 수도 있습니다. `plain` 메타데이터 유형의 사용은 [plain storage section](/operations/storing-data#plain-storage)에서 설명되며, `web` 메타데이터 유형은 `web` 객체 저장소 유형과 함께 사용할 수 있습니다. `local` 메타데이터 유형은 메타데이터 파일을 로컬에 저장합니다 (각 메타데이터 파일은 객체 저장소의 파일 매핑과 추가 메타 정보가 포함됩니다).

예를 들어:

```xml
<s3>
    <type>s3</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

다음 구성 (버전 `24.1`에서):

```xml
<s3>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>local</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3>
```

다음 구성:

```xml
<s3_plain>
    <type>s3_plain</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

는 다음과 동일합니다:

```xml
<s3_plain>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>plain</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

전체 저장소 구성의 예는 다음과 같을 것입니다:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
                <use_environment_credentials>1</use_environment_credentials>
            </s3>
        </disks>
        <policies>
            <s3>
                <volumes>
                    <main>
                        <disk>s3</disk>
                    </main>
                </volumes>
            </s3>
        </policies>
    </storage_configuration>
</clickhouse>
```

버전 24.1부터는 다음과 같을 수 있습니다:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>object_storage</type>
                <object_storage_type>s3</object_storage_type>
                <metadata_type>local</metadata_type>
                <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
                <use_environment_credentials>1</use_environment_credentials>
            </s3>
        </disks>
        <policies>
            <s3>
                <volumes>
                    <main>
                        <disk>s3</disk>
                    </main>
                </volumes>
            </s3>
        </policies>
    </storage_configuration>
</clickhouse>
```

모든 `MergeTree` 테이블에 대한 기본 저장소 유형으로 특정 저장소를 만들려면 구성 파일에 다음 섹션을 추가하세요:

```xml
<clickhouse>
    <merge_tree>
        <storage_policy>s3</storage_policy>
    </merge_tree>
</clickhouse>
```

특정 테이블에 대해 특정 저장소 정책을 구성하려면, 테이블을 생성할 때 설정에 정의할 수 있습니다:

```sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS storage_policy = 's3';
```

`storage_policy` 대신 `disk`를 사용할 수도 있습니다. 이 경우 구성 파일에 `storage_policy` 섹션이 필요하지 않으며 `disk` 섹션만으로 충분합니다.

```sql
CREATE TABLE test (a Int32, b String)
ENGINE = MergeTree() ORDER BY a
SETTINGS disk = 's3';
```
## 동적 구성 {#dynamic-configuration}

미리 정의된 디스크 없이 구성 파일에서 저장 구성을 지정할 수 있는 가능성이 있으며, `CREATE`/`ATTACH` 쿼리 설정에서 구성할 수 있습니다.

다음 예제 쿼리는 위의 동적 디스크 구성에 기반하여 URL에 저장된 테이블에서 데이터를 캐시하기 위해 로컬 디스크를 사용하는 방법을 보여줍니다.

```sql
ATTACH TABLE uk_price_paid UUID 'cf712b4f-2ca8-435c-ac23-c4393efe52f7'
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('other' = 0, 'terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4),
    is_new UInt8,
    duration Enum8('unknown' = 0, 'freehold' = 1, 'leasehold' = 2),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY (postcode1, postcode2, addr1, addr2)
  -- highlight-start
  SETTINGS disk = disk(
    type=web,
    endpoint='https://raw.githubusercontent.com/ClickHouse/web-tables-demo/main/web/'
  );
  -- highlight-end
```

아래 예제에서는 외부 저장소에 캐시를 추가합니다.

```sql
ATTACH TABLE uk_price_paid UUID 'cf712b4f-2ca8-435c-ac23-c4393efe52f7'
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('other' = 0, 'terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4),
    is_new UInt8,
    duration Enum8('unknown' = 0, 'freehold' = 1, 'leasehold' = 2),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY (postcode1, postcode2, addr1, addr2)
-- highlight-start
  SETTINGS disk = disk(
    type=cache,
    max_size='1Gi',
    path='/var/lib/clickhouse/custom_disk_cache/',
    disk=disk(
      type=web,
      endpoint='https://raw.githubusercontent.com/ClickHouse/web-tables-demo/main/web/'
      )
  );
-- highlight-end
```

아래 강조된 설정에서 `type=web`의 디스크가 `type=cache`의 디스크 내에 중첩되어 있음을 주목하세요.

:::note
예제는 `type=web`을 사용하지만, 모든 디스크 유형은 로컬 디스크를 포함하여 동적으로 구성할 수 있습니다. 로컬 디스크는 서버 구성 매개변수 `custom_local_disks_base_directory` 내의 경로 인자를 필요로 하며, 기본값이 없으므로 로컬 디스크를 사용할 때 그것도 설정해야 합니다.
:::

구성 기반 구성과 sql 정의 구성의 조합도 가능합니다:

```sql
ATTACH TABLE uk_price_paid UUID 'cf712b4f-2ca8-435c-ac23-c4393efe52f7'
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('other' = 0, 'terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4),
    is_new UInt8,
    duration Enum8('unknown' = 0, 'freehold' = 1, 'leasehold' = 2),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY (postcode1, postcode2, addr1, addr2)
  -- highlight-start
  SETTINGS disk = disk(
    type=cache,
    max_size='1Gi',
    path='/var/lib/clickhouse/custom_disk_cache/',
    disk=disk(
      type=web,
      endpoint='https://raw.githubusercontent.com/ClickHouse/web-tables-demo/main/web/'
      )
  );
  -- highlight-end
```

여기서 `web`은 서버 구성 파일에서 가져온 것입니다:

```xml
<storage_configuration>
    <disks>
        <web>
            <type>web</type>
            <endpoint>'https://raw.githubusercontent.com/ClickHouse/web-tables-demo/main/web/'</endpoint>
        </web>
    </disks>
</storage_configuration>
```
### S3 스토리지 사용 {#s3-storage}
#### 필수 매개변수 {#required-parameters-s3}

| 매개변수           | 설명                                                                                                                                                                            |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `endpoint`          | `path` 또는 `virtual hosted` [스타일의](https://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html) S3 엔드포인트 URL. 버킷과 데이터 저장을 위한 루트 경로를 포함해야 합니다. |
| `access_key_id`     | 인증에 사용되는 S3 액세스 키 ID.                                                                                                                                              |
| `secret_access_key` | 인증에 사용되는 S3 비밀 액세스 키.                                                                                                                                          |
#### 선택적 매개변수 {#optional-parameters-s3}

| 매개변수                                       | 설명                                                                                                                                                                                                                                   | 기본값                            |
|-------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------|
| `region`                                        | S3 지역 이름.                                                                                                                                                                                                                               | -                                        |
| `support_batch_delete`                          | 배치 삭제 지원 여부를 제어합니다. Google Cloud Storage (GCS)를 사용하는 경우 `false`로 설정하세요. GCS는 배치 삭제를 지원하지 않습니다.                                                                                                | `true`                                   |
| `use_environment_credentials`                   | 존재하는 경우 환경 변수 `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, 및 `AWS_SESSION_TOKEN`에서 AWS 자격 증명을 읽습니다.                                                                                                        | `false`                                  |
| `use_insecure_imds_request`                     | `true`이면 Amazon EC2 메타데이터에서 자격 증명을 얻을 때 불안전한 IMDS 요청을 사용합니다.                                                                                                                                                    | `false`                                  |
| `expiration_window_seconds`                     | 만료 기반 자격 증명이 만료되었는지 확인하기 위한 유예 기간 (초 단위).                                                                                                                                                          | `120`                                    |
| `proxy`                                         | S3 엔드포인트에 대한 프록시 구성. `proxy` 블록 내의 각 `uri` 요소는 프록시 URL을 포함해야 합니다.                                                                                                                                      | -                                        |
| `connect_timeout_ms`                            | 밀리초 단위의 소켓 연결 시간 초과.                                                                                                                                                                                                       | `10000` (10초)                     |
| `request_timeout_ms`                            | 밀리초 단위의 요청 시간 초과.                                                                                                                                                                                                              | `5000` (5초)                       |
| `retry_attempts`                                | 실패한 요청에 대한 재시도 시도 횟수.                                                                                                                                                                                                 | `10`                                     |
| `single_read_retries`                           | 읽기 중 연결 중단에 대한 재시도 시도 횟수.                                                                                                                                                                                    | `4`                                      |
| `min_bytes_for_seek`                            | 순차적 읽기 대신 탐색 작업에 사용할 최소 바이트 수.                                                                                                                                                                     | `1 MB`                                   |
| `metadata_path`                                 | S3 메타데이터 파일을 저장할 로컬 파일 시스템 경로.                                                                                                                                                                                             | `/var/lib/clickhouse/disks/<disk_name>/` |
| `skip_access_check`                             | `true`이면 시작 시 디스크 접근 체크를 건너뜁니다.                                                                                                                                                                                           | `false`                                  |
| `header`                                        | 요청에 지정된 HTTP 헤더를 추가합니다. 여러 번 지정할 수 있습니다.                                                                                                                                                                      | -                                        |
| `server_side_encryption_customer_key_base64`    | SSE-C 암호화로 S3 객체에 접근하기 위한 필수 헤더.                                                                                                                                                                              | -                                        |
| `server_side_encryption_kms_key_id`             | [SSE-KMS 암호화](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html)로 S3 객체에 접근하기 위한 필수 헤더. 빈 문자열은 AWS 관리 S3 키를 사용합니다.                                                     | -                                        |
| `server_side_encryption_kms_encryption_context` | SSE-KMS에 대한 암호화 컨텍스트 헤더 ( `server_side_encryption_kms_key_id`와 함께 사용됨).                                                                                                                                                        | -                                        |
| `server_side_encryption_kms_bucket_key_enabled` | SSE-KMS에 대한 S3 버킷 키를 활성화합니다 ( `server_side_encryption_kms_key_id`와 함께 사용됨).                                                                                                                                                           | 버킷 수준 설정에 따름             |
| `s3_max_put_rps`                                | 제한을 초과하기 전 초당 최대 PUT 요청 수.                                                                                                                                                                                            | `0` (무제한)                          |
| `s3_max_put_burst`                              | RPS 한계에 도달하기 전 최대 동시 PUT 요청 수.                                                                                                                                                                                     | `s3_max_put_rps`와 동일                 |
| `s3_max_get_rps`                                | 제한을 초과하기 전 초당 최대 GET 요청 수.                                                                                                                                                                                            | `0` (무제한)                          |
| `s3_max_get_burst`                              | RPS 한계에 도달하기 전 최대 동시 GET 요청 수.                                                                                                                                                                                     | `s3_max_get_rps`와 동일                 |
| `read_resource`                                 | [스케줄링](/operations/workload-scheduling.md) 읽기 요청을 위한 리소스 이름.                                                                                                                                                             | 빈 문자열 (사용 안함)                  |
| `write_resource`                                | [스케줄링](/operations/workload-scheduling.md) 쓰기 요청을 위한 리소스 이름.                                                                                                                                                            | 빈 문자열 (사용 안함)                  |
| `key_template`                                  | [re2](https://github.com/google/re2/wiki/Syntax) 구문을 사용하여 객체 키 생성 형식을 정의합니다. `storage_metadata_write_full_object_key` 플래그가 필요합니다. `endpoint`의 `root path`와 호환되지 않습니다. `key_compatibility_prefix`가 필요합니다. | -                                        |
| `key_compatibility_prefix`                      | `key_template`와 함께 필요합니다. 이전 메타데이터 버전을 읽기 위해 `endpoint`의 이전 `root path`를 지정합니다.                                                                                                                         | -                                        |
| `read_only`                                      | 디스크에서 읽기만 허용합니다.                                                                                                                                                                                                          | -                                        |

:::note
Google Cloud Storage (GCS)도 `s3` 유형을 사용하여 지원됩니다. [GCS 기반 MergeTree](/integrations/gcs)를 참조하세요.
:::
### 일반 스토리지 사용 {#plain-storage}

`22.10`에서 일회성 저장을 제공하는 새로운 디스크 유형 `s3_plain`이 도입되었습니다.
구성 매개변수는 `s3` 디스크 유형과 동일합니다.
`s3` 디스크 유형과 달리, 데이터가 그대로 저장됩니다. 즉, 무작위로 생성된 blob 이름 대신 ClickHouse가 로컬 디스크에 파일을 저장하는 방식으로 정상 파일 이름을 사용하며 메타데이터를 로컬에 저장하지 않습니다. 예를 들어, `s3`의 데이터에서 파생됩니다.

이 디스크 유형은 기존 데이터에 대한 병합 실행을 허용하지 않으며 새 데이터를 삽입할 수 없기 때문에 테이블의 정적 버전을 유지할 수 있습니다. 이 디스크 유형의 사용 사례는 `BACKUP TABLE data TO Disk('plain_disk_name', 'backup_name')`를 통해 백업을 만드는 것입니다. 이후 `RESTORE TABLE data AS data_restored FROM Disk('plain_disk_name', 'backup_name')`를 실행하거나 `ATTACH TABLE data (...) ENGINE = MergeTree() SETTINGS disk = 'plain_disk_name'`를 사용할 수 있습니다.

구성:

```xml
<s3_plain>
    <type>s3_plain</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```

`24.1`부터는 `plain` 메타데이터 유형을 사용하여 모든 객체 저장 디스크(`s3`, `azure`, `hdfs` (지원되지 않음), `local`)를 구성할 수 있습니다.

구성:

```xml
<s3_plain>
    <type>object_storage</type>
    <object_storage_type>azure</object_storage_type>
    <metadata_type>plain</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain>
```
### S3 일반 재작성 가능한 스토리지 사용 {#s3-plain-rewritable-storage}

`24.4`에 새로운 디스크 유형 `s3_plain_rewritable`가 도입되었습니다.
`s3_plain` 디스크 유형과 유사하게, 메타데이터 파일에 대한 추가 저장소를 요구하지 않습니다. 대신, 메타데이터는 S3에 저장됩니다.
`s3_plain` 디스크 유형과 달리, `s3_plain_rewritable`는 병합을 실행할 수 있으며 `INSERT` 작업을 지원합니다.
[Mutations](/sql-reference/statements/alter#mutations) 및 테이블의 복제는 지원되지 않습니다.

이 디스크 유형의 사용 사례는 복제되지 않은 `MergeTree` 테이블입니다. `s3` 디스크 유형은 복제되지 않은 `MergeTree` 테이블에 적합하지만 테이블에 대해 로컬 메타데이터가 필요 없고 한정된 작업 집합을 수용할 의향이 있다면 `s3_plain_rewritable` 디스크 유형을 선택할 수 있습니다. 이는 예를 들어 시스템 테이블에 유용할 수 있습니다.

구성:

```xml
<s3_plain_rewritable>
    <type>s3_plain_rewritable</type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain_rewritable>
```

이는 다음과 동일합니다:

```xml
<s3_plain_rewritable>
    <type>object_storage</type>
    <object_storage_type>s3</object_storage_type>
    <metadata_type>plain_rewritable</metadata_type>
    <endpoint>https://s3.eu-west-1.amazonaws.com/clickhouse-eu-west-1.clickhouse.com/data/</endpoint>
    <use_environment_credentials>1</use_environment_credentials>
</s3_plain_rewritable>
```

`24.5`부터는 `plain_rewritable` 메타데이터 유형을 사용하여 모든 객체 저장 디스크 (`s3`, `azure`, `local`)를 구성할 수 있습니다.
### Azure Blob Storage 사용 {#azure-blob-storage}

`MergeTree` 패밀리 테이블 엔진은 `azure_blob_storage` 유형의 디스크를 사용하여 [Azure Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs/)에 데이터를 저장할 수 있습니다.

구성 마크업:

```xml
<storage_configuration>
    ...
    <disks>
        <blob_storage_disk>
            <type>azure_blob_storage</type>
            <storage_account_url>http://account.blob.core.windows.net</storage_account_url>
            <container_name>container</container_name>
            <account_name>account</account_name>
            <account_key>pass123</account_key>
            <metadata_path>/var/lib/clickhouse/disks/blob_storage_disk/</metadata_path>
            <cache_path>/var/lib/clickhouse/disks/blob_storage_disk/cache/</cache_path>
            <skip_access_check>false</skip_access_check>
        </blob_storage_disk>
    </disks>
    ...
</storage_configuration>
```
#### 연결 매개변수 {#azure-blob-storage-connection-parameters}

| 매개변수                        | 설명                                                                                                                                                                                      | 기본값       |
|----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|
| `storage_account_url` (필수)     | Azure Blob Storage 계정 URL. 예: `http://account.blob.core.windows.net` 또는 `http://azurite1:10000/devstoreaccount1`.                                                                    | -                   |
| `container_name`                 | 대상 컨테이너 이름.                                                                                                                                                                           | `default-container` |
| `container_already_exists`       | 컨테이너 생성 동작을 제어합니다: <br/>- `false`: 새로운 컨테이너 생성 <br/>- `true`: 기존 컨테이너에 직접 연결 <br/>- unset: 컨테이너가 존재하는지 확인하고 필요 시 생성 | -                   |

인증 매개변수 (디스크는 모든 사용 가능한 방법 **및** 관리되는 ID 자격 증명을 시도합니다):

| 매개변수           | 설명                                                     |
|---------------------|-----------------------------------------------------------------|
| `connection_string` | 연결 문자열을 사용한 인증.                   |
| `account_name`      | 공유 키를 사용한 인증. (`account_key`와 함께 사용됨)  |
| `account_key`       | 공유 키를 사용한 인증. (`account_name`과 함께 사용됨) |
#### 제한 매개변수 {#azure-blob-storage-limit-parameters}

| 매개변수                            | 설명                                                                 |
|--------------------------------------|-----------------------------------------------------------------------------|
| `s3_max_single_part_upload_size`     | Blob Storage에 대한 단일 블록 업로드의 최대 크기.                      |
| `min_bytes_for_seek`                 | 탐색 가능한 영역의 최소 크기.                                          |
| `max_single_read_retries`            | Blob Storage에서 데이터 청크를 읽기 위한 최대 시도 횟수.       |
| `max_single_download_retries`        | Blob Storage에서 읽을 수 있는 버퍼를 다운로드하기 위한 최대 시도 횟수. |
| `thread_pool_size`                   | `IDiskRemote` 인스턴스화에 대한 최대 스레드 수.                  |
| `s3_max_inflight_parts_for_one_file` | 단일 객체에 대한 최대 동시 PUT 요청 수.              |
#### 기타 매개변수 {#azure-blob-storage-other-parameters}

| 매개변수                        | 설명                                                                        | 기본값                            |
|----------------------------------|------------------------------------------------------------------------------------|------------------------------------------|
| `metadata_path`                  | Blob Storage의 메타데이터 파일을 저장하기 위한 로컬 파일 시스템 경로.                    | `/var/lib/clickhouse/disks/<disk_name>/` |
| `skip_access_check`              | `true`이면 시작 시 디스크 접근 체크를 건너뜁니다.                                | `false`                                  |
| `read_resource`                  | [스케줄링](/operations/workload-scheduling.md) 읽기 요청을 위한 리소스 이름.  | 빈 문자열 (사용 안함)                  |
| `write_resource`                 | [스케줄링](/operations/workload-scheduling.md) 쓰기 요청을 위한 리소스 이름. | 빈 문자열 (사용 안함)                  |
| `metadata_keep_free_space_bytes` | 예약할 여유 메타데이터 디스크 공간의 양.                                     | -                                        |

작동하는 구성의 예는 통합 테스트 디렉터리에서 확인할 수 있습니다 (예를 들어, [test_merge_tree_azure_blob_storage](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_merge_tree_azure_blob_storage/configs/config.d/storage_conf.xml) 또는 [test_azure_blob_storage_zero_copy_replication](https://github.com/ClickHouse/ClickHouse/blob/master/tests/integration/test_azure_blob_storage_zero_copy_replication/configs/config.d/storage_conf.xml)).

:::note 제로 복사 복제는 프로덕션 준비가 되지 않았습니다
제로 복사 복제는 ClickHouse 버전 22.8 이상에서 기본적으로 비활성화되어 있습니다. 이 기능은 프로덕션 사용을 권장하지 않습니다.
:::
## HDFS 스토리지 사용 (지원되지 않음) {#using-hdfs-storage-unsupported}

이 샘플 구성에서는:
- 디스크 유형이 `hdfs` (지원되지 않음)입니다.
- 데이터가 `hdfs://hdfs1:9000/clickhouse/`에 호스팅됩니다.

그런데 HDFS는 지원되지 않으므로 사용 중 문제가 발생할 수 있습니다. 문제 발생 시 수정 사항으로 풀 리퀘스트를 만드세요.

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <hdfs>
                <type>hdfs</type>
                <endpoint>hdfs://hdfs1:9000/clickhouse/</endpoint>
                <skip_access_check>true</skip_access_check>
            </hdfs>
            <hdd>
                <type>local</type>
                <path>/</path>
            </hdd>
        </disks>
        <policies>
            <hdfs>
                <volumes>
                    <main>
                        <disk>hdfs</disk>
                    </main>
                    <external>
                        <disk>hdd</disk>
                    </external>
                </volumes>
            </hdfs>
        </policies>
    </storage_configuration>
</clickhouse>
```

HDFS는 모서리 사례에서 작동하지 않을 수 있음을 명심하세요.
### 데이터 암호화 사용 {#encrypted-virtual-file-system}

[로컬 디스크](#using-hdfs-storage-unsupported) 또는 S3에 저장된 데이터를 암호화할 수 있습니다. 암호화 모드를 활성화하려면, 구성 파일에서 `encrypted` 유형의 디스크를 정의하고 데이터를 저장할 디스크를 선택해야 합니다. `encrypted` 디스크는 모든 기록된 파일을 즉석에서 암호화하고, `encrypted` 디스크에서 파일을 읽을 때 자동으로 복호화합니다. 따라서 일반 디스크처럼 `encrypted` 디스크와 작업할 수 있습니다.

디스크 구성 예시:

```xml
<disks>
  <disk1>
    <type>local</type>
    <path>/path1/</path>
  </disk1>
  <disk2>
    <type>encrypted</type>
    <disk>disk1</disk>
    <path>path2/</path>
    <key>_16_ascii_chars_</key>
  </disk2>
</disks>
```

예를 들어 ClickHouse가 어떤 테이블의 데이터를 `store/all_1_1_0/data.bin` 파일로 `disk1`에 쓸 때, 이 파일은 실제로 `/path1/store/all_1_1_0/data.bin` 경로의 물리적 디스크에 기록됩니다.

같은 파일을 `disk2`에 기록할 때, 실제로는 암호화 모드로 `/path1/path2/store/all_1_1_0/data.bin`의 물리적 디스크에 기록됩니다.
### 필수 매개변수 {#required-parameters-encrypted-disk}

| 매개변수  | 유형   | 설명                                                                                                                                  |
|------------|--------|----------------------------------------------------------------------------------------------------------------------------------------------|
| `type`     | 문자열 | 암호화된 디스크를 생성하기 위해 `encrypted`로 설정해야 합니다.                                                                                      |
| `disk`     | 문자열 | 기본 저장소에 사용할 디스크 유형.                                                                                                  |
| `key`      | Uint64 | 암호화 및 복호화를 위한 키. `key_hex`를 사용하여 16진수로 지정할 수 있습니다. `id` 속성을 사용하여 여러 개의 키를 지정할 수 있습니다. |
### 선택적 매개변수 {#optional-parameters-encrypted-disk}

| 매개변수        | 유형   | 기본값        | 설명                                                                                                                             |
|------------------|--------|----------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| `path`           | 문자열 | 루트 디렉터리 | 데이터가 저장될 디스크의 위치.                                                                                          |
| `current_key_id` | 문자열 | -              | 암호화에 사용되는 키 ID. 지정된 모든 키는 복호화에 사용할 수 있습니다.                                                          |
| `algorithm`      | Enum   | `AES_128_CTR`  | 암호화 알고리즘. 옵션: <br/>- `AES_128_CTR` (16바이트 키) <br/>- `AES_192_CTR` (24바이트 키) <br/>- `AES_256_CTR` (32바이트 키) |

디스크 구성 예시:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <disk_s3>
                <type>s3</type>
                <endpoint>...
            </disk_s3>
            <disk_s3_encrypted>
                <type>encrypted</type>
                <disk>disk_s3</disk>
                <algorithm>AES_128_CTR</algorithm>
                <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
                <key_hex id="1">ffeeddccbbaa99887766554433221100</key_hex>
                <current_key_id>1</current_key_id>
            </disk_s3_encrypted>
        </disks>
    </storage_configuration>
</clickhouse>
```
### 로컬 캐시 사용하기 {#using-local-cache}

버전 22.3부터 저장소 구성에서 디스크를 통한 로컬 캐시를 구성할 수 있습니다. 
버전 22.3 - 22.7에서는 `s3` 디스크 유형에만 캐시가 지원됩니다. 버전 >= 22.8에서는 모든 디스크 유형(S3, Azure, Local, Encrypted 등)에서 캐시가 지원됩니다. 
버전 >= 23.5에서는 원격 디스크 유형(S3, Azure, HDFS)에 대해서만 캐시가 지원됩니다. 
캐시는 `LRU` 캐시 정책을 사용합니다.

버전 22.8 이상에 대한 구성 예시:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>...</endpoint>
                ... s3 configuration ...
            </s3>
            <cache>
                <type>cache</type>
                <disk>s3</disk>
                <path>/s3_cache/</path>
                <max_size>10Gi</max_size>
            </cache>
        </disks>
        <policies>
            <s3_cache>
                <volumes>
                    <main>
                        <disk>cache</disk>
                    </main>
                </volumes>
            </s3_cache>
        <policies>
    </storage_configuration>
```

버전 22.8 이전에 대한 구성 예시:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>...</endpoint>
                ... s3 configuration ...
                <data_cache_enabled>1</data_cache_enabled>
                <data_cache_max_size>10737418240</data_cache_max_size>
            </s3>
        </disks>
        <policies>
            <s3_cache>
                <volumes>
                    <main>
                        <disk>s3</disk>
                    </main>
                </volumes>
            </s3_cache>
        <policies>
    </storage_configuration>
```

파일 캐시 **디스크 구성 설정들**:

이 설정들은 디스크 구성 섹션에서 정의해야 합니다.

| 매개변수                                  | 유형     | 기본값     | 설명                                                                                                                                                                                       |
|-------------------------------------------|----------|------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `path`                                    | 문자열   | -          | **필수**. 캐시가 저장될 디렉토리의 경로입니다.                                                                                                                                          |
| `max_size`                                | 크기     | -          | **필수**. 바이트 또는 읽기 가능한 형식(예: `10Gi`)으로 최대 캐시 크기입니다. 한계를 초과하면 파일은 LRU 정책을 사용하여 퇴출됩니다. `ki`, `Mi`, `Gi` 형식을 지원합니다(버전 22.10부터). |
| `cache_on_write_operations`               | 불리언   | `false`    | `INSERT` 쿼리 및 백그라운드 병합을 위한 쓰기 스루 캐시를 활성화합니다. `enable_filesystem_cache_on_write_operations`로 쿼리별로 재정의할 수 있습니다.                                          |
| `enable_filesystem_query_cache_limit`     | 불리언   | `false`    | `max_query_cache_size`에 기반한 쿼리별 캐시 크기 제한을 활성화합니다.                                                                                                                  |
| `enable_cache_hits_threshold`             | 불리언   | `false`    | 활성화 시, 데이터는 여러 번 읽힌 후에만 캐시됩니다.                                                                                                                                   |
| `cache_hits_threshold`                    | 정수     | `0`        | 데이터가 캐시되기 전에 필요한 읽기 수( `enable_cache_hits_threshold`가 필요함).                                                                                                          |
| `enable_bypass_cache_with_threshold`      | 불리언   | `false`    | 큰 읽기 범위에 대해 캐시를 우회합니다.                                                                                                                                                   |
| `bypass_cache_threshold`                  | 크기     | `256Mi`    | 캐시 우회를 트리거하는 읽기 범위 크기( `enable_bypass_cache_with_threshold`가 필요함).                                                                                                    |
| `max_file_segment_size`                   | 크기     | `8Mi`      | 바이트 또는 읽기 가능한 형식의 단일 캐시 파일의 최대 크기입니다.                                                                                                                        |
| `max_elements`                            | 정수     | `10000000` | 최대 캐시 파일 수입니다.                                                                                                                                                                    |
| `load_metadata_threads`                   | 정수     | `16`       | 시작 시 캐시 메타데이터를 로드하는 스레드 수입니다.                                                                                                                                     |

> **노트**: 크기 값은 `ki`, `Mi`, `Gi`와 같은 단위를 지원합니다(예: `10Gi`).
## 파일 캐시 쿼리/프로파일 설정 {#file-cache-query-profile-settings}

| 설정                                                           | 유형     | 기본값                  | 설명                                                                                                                                                             |
|---------------------------------------------------------------|----------|-------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `enable_filesystem_cache`                                     | 불리언   | `true`                  | `cache` 디스크 유형을 사용할 때 캐시 사용을 쿼리별로 활성화/비활성화합니다.                                                                                      |
| `read_from_filesystem_cache_if_exists_otherwise_bypass_cache` | 불리언   | `false`                 | 활성화 시, 데이터가 존재할 경우에만 캐시를 사용합니다. 새로운 데이터는 캐시되지 않습니다.                                                                                   |
| `enable_filesystem_cache_on_write_operations`                 | 불리언   | `false` (클라우드: `true`) | 쓰기 스루 캐시를 활성화합니다. 캐시 구성에서 `cache_on_write_operations`가 필요합니다.                                                                              |
| `enable_filesystem_cache_log`                                 | 불리언   | `false`                 | `system.filesystem_cache_log`에 대한 자세한 캐시 사용 로그를 활성화합니다.                                                                                          |
| `filesystem_cache_allow_background_download`                  | 불리언   | `true`                  | 부분적으로 다운로드된 세그먼트를 백그라운드에서 완료할 수 있도록 허용합니다. 현재 쿼리/세션을 위해 다운로드를 전경에서 유지하려면 비활성화합니다.                   |
| `max_query_cache_size`                                        | 크기     | `false`                 | 쿼리당 최대 캐시 크기입니다. 캐시 구성에서 `enable_filesystem_query_cache_limit`이 필요합니다.                                                                        |
| `filesystem_cache_skip_download_if_exceeds_per_query_cache_write_limit` | 불리언   | `true`          | `max_query_cache_size`에 도달했을 때 동작을 제어합니다: <br/>- `true`: 새로운 데이터 다운로드 중지 <br/>- `false`: 새로운 데이터를 위한 공간을 만들기 위해 오래된 데이터 퇴출 |

:::warning
캐시 구성 설정 및 캐시 쿼리 설정은 최신 ClickHouse 버전에 해당하며, 이전 버전에서는 지원되지 않을 수 있습니다.
:::
#### 캐시 시스템 테이블 {#cache-system-tables-file-cache}

| 테이블 이름                    | 설명                                          | 요구 사항                                       |
|--------------------------------|----------------------------------------------|------------------------------------------------|
| `system.filesystem_cache`      | 파일 시스템 캐시의 현재 상태를 표시합니다.  | 없음                                           |
| `system.filesystem_cache_log`  | 쿼리별로 자세한 캐시 사용 통계를 제공합니다. | `enable_filesystem_cache_log = true`가 필요합니다. |
#### 캐시 명령어 {#cache-commands-file-cache}
##### `SYSTEM DROP FILESYSTEM CACHE (<cache_name>) (ON CLUSTER)` -- `ON CLUSTER` {#system-drop-filesystem-cache-on-cluster}

이 명령어는 `<cache_name>`이 제공되지 않을 때만 지원됩니다.
##### `SHOW FILESYSTEM CACHES` {#show-filesystem-caches}

서버에 구성된 파일 시스템 캐시 목록을 보여줍니다. 
(버전 22.8 이하의 경우 명령어 이름은 `SHOW CACHES`입니다)

```sql title="Query"
SHOW FILESYSTEM CACHES
```

```text title="Response"
┌─Caches────┐
│ s3_cache  │
└───────────┘
```
##### `DESCRIBE FILESYSTEM CACHE '<cache_name>'` {#describe-filesystem-cache}

특정 캐시에 대한 캐시 구성 및 일반 통계를 보여줍니다. 
캐시 이름은 `SHOW FILESYSTEM CACHES` 명령어에서 가져올 수 있습니다. (버전 22.8 이하의 경우 명령어 이름은 `DESCRIBE CACHE`입니다)

```sql title="Query"
DESCRIBE FILESYSTEM CACHE 's3_cache'
```

```text title="Response"
┌────max_size─┬─max_elements─┬─max_file_segment_size─┬─boundary_alignment─┬─cache_on_write_operations─┬─cache_hits_threshold─┬─current_size─┬─current_elements─┬─path───────┬─background_download_threads─┬─enable_bypass_cache_with_threshold─┐
│ 10000000000 │      1048576 │             104857600 │            4194304 │                         1 │                    0 │         3276 │               54 │ /s3_cache/ │                           2 │                                  0 │
└─────────────┴──────────────┴───────────────────────┴────────────────────┴───────────────────────────┴──────────────────────┴──────────────┴──────────────────┴────────────┴─────────────────────────────┴────────────────────────────────────┘
```

| 캐시 현재 메트릭           | 캐시 비동기 메트릭           | 캐시 프로파일 이벤트                                                                     |
|---------------------------|-----------------------------|------------------------------------------------------------------------------------------|
| `FilesystemCacheSize`     | `FilesystemCacheBytes`      | `CachedReadBufferReadFromSourceBytes`, `CachedReadBufferReadFromCacheBytes`               |
| `FilesystemCacheElements` | `FilesystemCacheFiles`      | `CachedReadBufferReadFromSourceMicroseconds`, `CachedReadBufferReadFromCacheMicroseconds` |
|                           |                             | `CachedReadBufferCacheWriteBytes`, `CachedReadBufferCacheWriteMicroseconds`               |
|                           |                             | `CachedWriteBufferCacheWriteBytes`, `CachedWriteBufferCacheWriteMicroseconds`             |
### 정적 웹 스토리지 사용하기 (읽기 전용) {#web-storage}

이것은 읽기 전용 디스크입니다. 데이터는 오직 읽기만 하며 수정되지 않습니다. 이 디스크에는 `ATTACH TABLE` 쿼리를 통해 새 테이블이 로드됩니다(아래 예시 참조). 로컬 디스크는 실제로 사용되지 않으며, 각 `SELECT` 쿼리는 필요한 데이터를 가져오기 위해 `http` 요청을 발생시킵니다. 테이블 데이터의 모든 수정은 예외를 발생시킵니다. 즉, 다음과 같은 쿼리 유형은 허용되지 않습니다: [`CREATE TABLE`](/sql-reference/statements/create/table.md),
[`ALTER TABLE`](/sql-reference/statements/alter/index.md), [`RENAME TABLE`](/sql-reference/statements/rename#rename-table),
[`DETACH TABLE`](/sql-reference/statements/detach.md) 및 [`TRUNCATE TABLE`](/sql-reference/statements/truncate.md).
웹 스토리지는 읽기 전용 목적으로 사용할 수 있습니다. 예를 들어 샘플 데이터를 호스팅하거나 데이터를 마이그레이션할 수 있습니다. `clickhouse-static-files-uploader`라는 도구가 있으며, 이는 주어진 테이블을 위한 데이터 디렉토리를 준비합니다 (`SELECT data_paths FROM system.tables WHERE name = 'table_name'`).
필요한 각 테이블에 대해 파일 디렉토리를 얻습니다. 이 파일들은 예를 들어 정적 파일을 호스팅하는 웹 서버에 업로드할 수 있습니다. 이러한 준비가 끝난 후, 이 테이블을 `DiskWeb`을 통해 어떤 ClickHouse 서버에도 로드할 수 있습니다.

이 샘플 구성에서:
- 디스크는 `web` 유형입니다.
- 데이터는 `http://nginx:80/test1/`에 호스팅됩니다.
- 로컬 스토리지에 캐시가 사용됩니다.

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <web>
                <type>web</type>
                <endpoint>http://nginx:80/test1/</endpoint>
            </web>
            <cached_web>
                <type>cache</type>
                <disk>web</disk>
                <path>cached_web_cache/</path>
                <max_size>100000000</max_size>
            </cached_web>
        </disks>
        <policies>
            <web>
                <volumes>
                    <main>
                        <disk>web</disk>
                    </main>
                </volumes>
            </web>
            <cached_web>
                <volumes>
                    <main>
                        <disk>cached_web</disk>
                    </main>
                </volumes>
            </cached_web>
        </policies>
    </storage_configuration>
</clickhouse>
```

:::tip
쿼리 내에서 스토리지를 일시적으로 구성할 수도 있습니다. 웹 데이터 세트가 정기적으로 사용될 것으로 예상되지 않는 경우, [동적 구성](#dynamic-configuration)을 참고하고 구성 파일 수정을 건너뛸 수 있습니다.

[데모 데이터셋](https://github.com/ClickHouse/web-tables-demo)은 GitHub에 호스팅되어 있습니다. 웹 스토리지를 위한 테이블을 준비하려면 도구 [clickhouse-static-files-uploader](/operations/utilities/static-files-disk-uploader)를 참조하십시오.
:::

이 `ATTACH TABLE` 쿼리에서 제공된 `UUID`는 데이터의 디렉토리 이름과 일치하며, 엔드포인트는 원시 GitHub 콘텐츠의 URL입니다.

```sql
-- highlight-next-line
ATTACH TABLE uk_price_paid UUID 'cf712b4f-2ca8-435c-ac23-c4393efe52f7'
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('other' = 0, 'terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4),
    is_new UInt8,
    duration Enum8('unknown' = 0, 'freehold' = 1, 'leasehold' = 2),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY (postcode1, postcode2, addr1, addr2)
  -- highlight-start
  SETTINGS disk = disk(
      type=web,
      endpoint='https://raw.githubusercontent.com/ClickHouse/web-tables-demo/main/web/'
      );
  -- highlight-end
```

준비된 테스트 케이스입니다. 이 구성을 config에 추가해야 합니다:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <web>
                <type>web</type>
                <endpoint>https://clickhouse-datasets.s3.yandex.net/disk-with-static-files-tests/test-hits/</endpoint>
            </web>
        </disks>
        <policies>
            <web>
                <volumes>
                    <main>
                        <disk>web</disk>
                    </main>
                </volumes>
            </web>
        </policies>
    </storage_configuration>
</clickhouse>
```

그런 다음 이 쿼리를 실행하십시오:

```sql
ATTACH TABLE test_hits UUID '1ae36516-d62d-4218-9ae3-6516d62da218'
(
    WatchID UInt64,
    JavaEnable UInt8,
    Title String,
    GoodEvent Int16,
    EventTime DateTime,
    EventDate Date,
    CounterID UInt32,
    ClientIP UInt32,
    ClientIP6 FixedString(16),
    RegionID UInt32,
    UserID UInt64,
    CounterClass Int8,
    OS UInt8,
    UserAgent UInt8,
    URL String,
    Referer String,
    URLDomain String,
    RefererDomain String,
    Refresh UInt8,
    IsRobot UInt8,
    RefererCategories Array(UInt16),
    URLCategories Array(UInt16),
    URLRegions Array(UInt32),
    RefererRegions Array(UInt32),
    ResolutionWidth UInt16,
    ResolutionHeight UInt16,
    ResolutionDepth UInt8,
    FlashMajor UInt8,
    FlashMinor UInt8,
    FlashMinor2 String,
    NetMajor UInt8,
    NetMinor UInt8,
    UserAgentMajor UInt16,
    UserAgentMinor FixedString(2),
    CookieEnable UInt8,
    JavascriptEnable UInt8,
    IsMobile UInt8,
    MobilePhone UInt8,
    MobilePhoneModel String,
    Params String,
    IPNetworkID UInt32,
    TraficSourceID Int8,
    SearchEngineID UInt16,
    SearchPhrase String,
    AdvEngineID UInt8,
    IsArtifical UInt8,
    WindowClientWidth UInt16,
    WindowClientHeight UInt16,
    ClientTimeZone Int16,
    ClientEventTime DateTime,
    SilverlightVersion1 UInt8,
    SilverlightVersion2 UInt8,
    SilverlightVersion3 UInt32,
    SilverlightVersion4 UInt16,
    PageCharset String,
    CodeVersion UInt32,
    IsLink UInt8,
    IsDownload UInt8,
    IsNotBounce UInt8,
    FUniqID UInt64,
    HID UInt32,
    IsOldCounter UInt8,
    IsEvent UInt8,
    IsParameter UInt8,
    DontCountHits UInt8,
    WithHash UInt8,
    HitColor FixedString(1),
    UTCEventTime DateTime,
    Age UInt8,
    Sex UInt8,
    Income UInt8,
    Interests UInt16,
    Robotness UInt8,
    GeneralInterests Array(UInt16),
    RemoteIP UInt32,
    RemoteIP6 FixedString(16),
    WindowName Int32,
    OpenerName Int32,
    HistoryLength Int16,
    BrowserLanguage FixedString(2),
    BrowserCountry FixedString(2),
    SocialNetwork String,
    SocialAction String,
    HTTPError UInt16,
    SendTiming Int32,
    DNSTiming Int32,
    ConnectTiming Int32,
    ResponseStartTiming Int32,
    ResponseEndTiming Int32,
    FetchTiming Int32,
    RedirectTiming Int32,
    DOMInteractiveTiming Int32,
    DOMContentLoadedTiming Int32,
    DOMCompleteTiming Int32,
    LoadEventStartTiming Int32,
    LoadEventEndTiming Int32,
    NSToDOMContentLoadedTiming Int32,
    FirstPaintTiming Int32,
    RedirectCount Int8,
    SocialSourceNetworkID UInt8,
    SocialSourcePage String,
    ParamPrice Int64,
    ParamOrderID String,
    ParamCurrency FixedString(3),
    ParamCurrencyID UInt16,
    GoalsReached Array(UInt32),
    OpenstatServiceName String,
    OpenstatCampaignID String,
    OpenstatAdID String,
    OpenstatSourceID String,
    UTMSource String,
    UTMMedium String,
    UTMCampaign String,
    UTMContent String,
    UTMTerm String,
    FromTag String,
    HasGCLID UInt8,
    RefererHash UInt64,
    URLHash UInt64,
    CLID UInt32,
    YCLID UInt64,
    ShareService String,
    ShareURL String,
    ShareTitle String,
    ParsedParams Nested(
        Key1 String,
        Key2 String,
        Key3 String,
        Key4 String,
        Key5 String,
        ValueDouble Float64),
    IslandID FixedString(16),
    RequestNum UInt32,
    RequestTry UInt8
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(EventDate)
ORDER BY (CounterID, EventDate, intHash32(UserID))
SAMPLE BY intHash32(UserID)
SETTINGS storage_policy='web';
```
#### 필수 매개변수 {#static-web-storage-required-parameters}

| 매개변수  | 설명                                                                                                         |
|------------|---------------------------------------------------------------------------------------------------------------|
| `type`     | `web`. 수행되지 않으면 디스크가 생성되지 않습니다.                                                        |
| `endpoint` | `path` 형식의 엔드포인트 URL입니다. 엔드포인트 URL은 데이터가 저장될 루트 경로를 포함해야 합니다.                       |
#### 선택적 매개변수 {#optional-parameters-web}

| 매개변수                             | 설명                                                                           | 기본값      |
|-------------------------------------|-------------------------------------------------------------------------------|-------------|
| `min_bytes_for_seek`                | 순차 판독 대신 탐색 작업에 사용할 최소 바이트 수                           | `1` MB      |
| `remote_fs_read_backoff_threashold` | 원격 디스크의 데이터를 읽으려 할 때 기다릴 최대 시간                      | `10000`초    |
| `remote_fs_read_backoff_max_tries`  | 대기 후 읽기를 시도할 최대 횟수                                              | `5`         |

쿼리가 `DB:Exception Unreachable URL` 예외로 실패할 경우, 설정을 조정해 볼 수 있습니다: [http_connection_timeout](/operations/settings/settings.md/#http_connection_timeout), [http_receive_timeout](/operations/settings/settings.md/#http_receive_timeout), [keep_alive_timeout](/operations/server-configuration-parameters/settings#keep_alive_timeout).

업로드할 파일을 얻으려면 다음 명령어를 실행합니다:
`clickhouse static-files-disk-uploader --metadata-path <path> --output-dir <dir>` (`--metadata-path`는 쿼리 `SELECT data_paths FROM system.tables WHERE name = 'table_name'`에서 찾을 수 있습니다).

`endpoint`로 파일을 로드할 때, 이 파일들은 `<endpoint>/store/` 경로에 로드해야 하지만 구성에는 오직 `endpoint`만 포함되어야 합니다.

서버가 테이블을 시작할 때 URL에 접근할 수 없는 경우 모든 오류가 포섭됩니다. 이 경우 오류가 발생하면 테이블을 다시 로드(가시성으로 바꿈)하려면 `DETACH TABLE table_name` -> `ATTACH TABLE table_name`을 수행하십시오. 서버 시작 시 메타데이터가 성공적으로 로드되면 테이블이 즉시 사용 가능해집니다.

[http_max_single_read_retries](/operations/storing-data#web-storage) 설정을 사용하여 단일 HTTP 읽기 중 최대 재시도 횟수를 제한하십시오.
### 제로 카피 복제 (프로덕션 준비 완료되지 않음) {#zero-copy}

제로 카피 복제는 `S3` 및 `HDFS`(지원되지 않음) 디스크에서 가능하지만 권장되지 않습니다. 제로 카피 복제는 데이터가 여러 머신에 원격으로 저장되고 동기화가 필요할 때 의미합니다. 이 경우 데이터 자체가 아닌 메타데이터(데이터 파트에 대한 경로)만 복제됩니다.

:::note 제로 카피 복제는 프로덕션 준비가 완료되지 않음
제로 카피 복제는 ClickHouse 버전 22.8 이상에서 기본적으로 비활성화됩니다. 이 기능은 프로덕션 사용을 권장하지 않습니다.
:::
