---
'description': 'Amazon S3와 Google Cloud Storage에서 파일을 지정된 클러스터의 여러 노드와 병렬로 처리할 수 있도록
  하는 s3 테이블 함수에 대한 확장입니다.'
'sidebar_label': 's3Cluster'
'sidebar_position': 181
'slug': '/sql-reference/table-functions/s3Cluster'
'title': 's3Cluster'
'doc_type': 'reference'
---



# s3Cluster 테이블 함수

이것은 [s3](sql-reference/table-functions/s3.md) 테이블 함수에 대한 확장입니다.

지정된 클러스터의 여러 노드에서 [Amazon S3](https://aws.amazon.com/s3/)와 Google Cloud Storage [Google Cloud Storage](https://cloud.google.com/storage/)의 파일을 병렬로 처리할 수 있습니다. 이니시에이터는 클러스터의 모든 노드에 연결을 생성하고, S3 파일 경로에서 별표를 공개하며, 각 파일을 동적으로 분배합니다. 워커 노드에서는 이니시에이터에게 다음으로 처리할 작업에 대해 요청하고 이를 처리합니다. 모든 작업이 완료될 때까지 이 과정이 반복됩니다.

## 구문 {#syntax}

```sql
s3Cluster(cluster_name, url[, NOSIGN | access_key_id, secret_access_key,[session_token]][, format][, structure][, compression_method][, headers][, extra_credentials])
s3Cluster(cluster_name, named_collection[, option=value [,..]])
```

## 인자 {#arguments}

| 인자                                  | 설명                                                                                                                                                                                               |
|---------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`                        | 원격 서버와 로컬 서버에 대한 주소 및 연결 매개변수를 구축하는 데 사용되는 클러스터의 이름입니다.                                                                                                         |
| `url`                                 | 파일 또는 다수의 파일에 대한 경로입니다. 읽기 전용 모드에서 다음의 와일드카드를 지원합니다: `*`, `**`, `?`, `{'abc','def'}` 및 `{N..M}` 여기서 `N`, `M`은 숫자이고, `abc`, `def`는 문자열입니다. 자세한 내용은 [경로의 와일드카드](../../engines/table-engines/integrations/s3.md#wildcards-in-path)를 참조하십시오. |
| `NOSIGN`                              | 이 키워드가 자격 증명 대신 제공되면 모든 요청이 서명되지 않습니다.                                                                                                                                  |
| `access_key_id` 및 `secret_access_key` | 주어진 엔드포인트에 사용할 자격 증명을 지정하는 키입니다. 선택 사항입니다.                                                                                                                            |
| `session_token`                       | 주어진 키와 함께 사용할 세션 토큰입니다. 키를 전달할 때 선택 사항입니다.                                                                                                                           |
| `format`                              | 파일의 [형식](/sql-reference/formats)입니다.                                                                                                                                                           |
| `structure`                           | 테이블의 구조입니다. 형식은 `'column1_name column1_type, column2_name column2_type, ...'`입니다.                                                                                                       |
| `compression_method`                  | 선택적 매개변수입니다. 지원되는 값은 `none`, `gzip` 또는 `gz`, `brotli` 또는 `br`, `xz` 또는 `LZMA`, `zstd` 또는 `zst`입니다. 기본적으로 파일 확장자로 압축 방법이 자동 감지됩니다.                   |
| `headers`                             | 선택적 매개변수입니다. S3 요청에 헤더를 전달할 수 있습니다. `headers(key=value)` 형식으로 전달합니다. 예: `headers('x-amz-request-payer' = 'requester')`. 사용 예는 [여기](https://clickhouse.com/docs/zh/sql-reference/table-functions/s3#accessing-requester-pays-buckets)에서 확인하십시오. |
| `extra_credentials`                   | 선택적입니다. `roleARN`을 이 매개변수를 통해 전달할 수 있습니다. 사용 예는 [여기](https://clickhouse.com/docs/zh/cloud/data-sources/secure-s3#access-your-s3-bucket-with-the-clickhouseaccess-role)에서 확인하십시오.                |

인자는 [명명된 컬렉션](operations/named-collections.md)을 사용하여 전달할 수도 있습니다. 이 경우 `url`, `access_key_id`, `secret_access_key`, `format`, `structure`, `compression_method`는 동일하게 작동하며, 추가 매개변수가 지원됩니다:

| 인자                               | 설명                                                                                                                                                                               |
|------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `filename`                         | 지정된 경우 url에 추가됩니다.                                                                                                                                                      |
| `use_environment_credentials`      | 기본적으로 활성화되어 있으며, 추가 매개변수를 환경 변수 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`, `AWS_CONTAINER_CREDENTIALS_FULL_URI`, `AWS_CONTAINER_AUTHORIZATION_TOKEN`, `AWS_EC2_METADATA_DISABLED`를 사용하여 전달할 수 있도록 합니다. |
| `no_sign_request`                  | 기본적으로 비활성화되어 있습니다.                                                                                                                                                 |
| `expiration_window_seconds`        | 기본 값은 120입니다.                                                                                                                                                               |

## 반환 값 {#returned_value}

지정된 파일에서 데이터를 읽거나 쓰기 위한 지정된 구조의 테이블입니다.

## 예제 {#examples}

`cluster_simple` 클러스터의 모든 노드를 사용하여 `/root/data/clickhouse` 및 `/root/data/database/` 폴더에 있는 모든 파일에서 데이터를 선택합니다:

```sql
SELECT * FROM s3Cluster(
    'cluster_simple',
    'http://minio1:9001/root/data/{clickhouse,database}/*',
    'minio',
    'ClickHouse_Minio_P@ssw0rd',
    'CSV',
    'name String, value UInt32, polygon Array(Array(Tuple(Float64, Float64)))'
) ORDER BY (name, value, polygon);
```

`cluster_simple` 클러스터의 모든 파일에서 총 행 수를 계산합니다:

:::tip
파일 목록에 선행 0이 있는 숫자 범위가 포함된 경우, 각 숫자에 대해 중괄호 구성을 사용하거나 `?`를 사용하십시오.
:::

프로덕션 사용 사례의 경우, [명명된 컬렉션](operations/named-collections.md)을 사용하는 것이 좋습니다. 예는 다음과 같습니다:
```sql

CREATE NAMED COLLECTION creds AS
        access_key_id = 'minio',
        secret_access_key = 'ClickHouse_Minio_P@ssw0rd';
SELECT count(*) FROM s3Cluster(
    'cluster_simple', creds, url='https://s3-object-url.csv',
    format='CSV', structure='name String, value UInt32, polygon Array(Array(Tuple(Float64, Float64)))'
)
```

## 개인 및 공용 버킷에 접근하기 {#accessing-private-and-public-buckets}

사용자는 s3 함수에 대한 문서에서 사용했던 것과 동일한 접근 방식을 사용할 수 있습니다 [여기](https://clickhouse.com/docs/zh/sql-reference/table-functions/s3#accessing-public-buckets).

## 성능 최적화 {#optimizing-performance}

s3 함수의 성능 최적화에 대한 자세한 내용은 [자세한 가이드](https://clickhouse.com/docs/zh/integrations/s3/performance)를 참조하십시오.

## 관련 {#related}

- [S3 엔진](../../engines/table-engines/integrations/s3.md)
- [s3 테이블 함수](../../sql-reference/table-functions/s3.md)
