---
description: '지정된 클러스터 내 여러 노드에서 Amazon S3 및 Google Cloud Storage의 파일을 병렬로 처리할 수 있게 해 주는 s3 테이블 함수의 확장입니다.'
sidebar_label: 's3Cluster'
sidebar_position: 181
slug: /sql-reference/table-functions/s3Cluster
title: 's3Cluster'
doc_type: 'reference'
---



# s3Cluster 테이블 함수 \{#s3cluster-table-function\}

이 함수는 [s3](sql-reference/table-functions/s3.md) 테이블 함수의 확장입니다.

지정된 클러스터의 여러 노드에서 병렬로 [Amazon S3](https://aws.amazon.com/s3/) 및 Google Cloud Storage [Google Cloud Storage](https://cloud.google.com/storage/)의 파일을 처리할 수 있습니다. 이니시에이터 노드에서는 클러스터의 모든 노드에 대한 연결을 생성하고, S3 파일 경로의 와일드카드(*)를 해석하며, 각 파일을 동적으로 분배합니다. 워커 노드는 처리할 다음 작업을 이니시에이터에게 요청해 할당받고, 해당 작업을 처리합니다. 모든 작업이 완료될 때까지 이 과정이 반복됩니다.



## 구문 \{#syntax\}

```sql
s3Cluster(cluster_name, url[, NOSIGN | access_key_id, secret_access_key,[session_token]][, format][, structure][, compression_method][, headers][, extra_credentials])
s3Cluster(cluster_name, named_collection[, option=value [,..]])
```


## Arguments \{#arguments\}

| Argument                              | Description                                                                                                                                                                                             |
|---------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`                        | 원격 및 로컬 서버에 대한 주소와 연결 매개변수 집합을 구성할 때 사용하는 클러스터 이름입니다.                                                                                         |
| `url`                                 | 파일 또는 여러 파일에 대한 경로입니다. 읽기 전용 모드에서 다음 와일드카드를 지원합니다: `*`, `**`, `?`, `{'abc','def'}` 및 `N`, `M`이 숫자이고 `abc`, `def`가 문자열인 `{N..M}`. 자세한 내용은 [경로의 와일드카드](../../engines/table-engines/integrations/s3.md#wildcards-in-path)를 참고하십시오. |
| `NOSIGN`                              | 자격 증명 대신 이 키워드를 지정하면 모든 요청에 서명이 적용되지 않습니다.                                                                                                             |
| `access_key_id` and `secret_access_key` | 지정된 엔드포인트에서 사용할 자격 증명을 나타내는 키입니다. 선택 사항입니다.                                                                                                                                     |
| `session_token`                       | 지정된 키와 함께 사용할 세션 토큰입니다. 키를 전달하는 경우 선택 사항입니다.                                                                                                                                 |
| `format`                              | 파일의 [format](/sql-reference/formats)입니다.                                                                                                                                                         |
| `structure`                           | 테이블 구조입니다. 형식은 `'column1_name column1_type, column2_name column2_type, ...'`입니다.                                                                                                          |
| `compression_method`                  | 선택적 매개변수입니다. 지원되는 값: `none`, `gzip` 또는 `gz`, `brotli` 또는 `br`, `xz` 또는 `LZMA`, `zstd` 또는 `zst`. 기본적으로 파일 확장자를 기준으로 압축 방식이 자동으로 감지됩니다.                 |
| `headers`                             | 선택적 매개변수입니다. S3 요청에 헤더를 전달할 수 있습니다. `headers(key=value)` 형식으로 전달하며, 예: `headers('x-amz-request-payer' = 'requester')`. 사용 예시는 [여기](/sql-reference/table-functions/s3#accessing-requester-pays-buckets)를 참고하십시오. |
| `extra_credentials`                   | 선택 사항입니다. `roleARN`을 이 매개변수를 통해 전달할 수 있습니다. 예시는 [여기](/cloud/data-sources/secure-s3#access-your-s3-bucket-with-the-clickhouseaccess-role)를 참고하십시오.                                          |

인자(Arguments)는 [named collections](operations/named-collections.md)을 사용하여 전달할 수도 있습니다. 이 경우 `url`, `access_key_id`, `secret_access_key`, `format`, `structure`, `compression_method`는 동일한 방식으로 동작하며, 다음과 같은 추가 매개변수도 지원됩니다:

| Argument                       | Description                                                                                                                                                                                                                       |
|--------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `filename`                     | 지정된 경우 `url` 뒤에 추가됩니다.                                                                                                                                                                                                 |
| `use_environment_credentials`  | 기본적으로 활성화되어 있으며, 환경 변수 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`, `AWS_CONTAINER_CREDENTIALS_FULL_URI`, `AWS_CONTAINER_AUTHORIZATION_TOKEN`, `AWS_EC2_METADATA_DISABLED`를 사용하여 추가 매개변수를 전달할 수 있습니다. |
| `no_sign_request`              | 기본적으로 비활성화되어 있습니다.                                                                                                                                                                                                              |
| `expiration_window_seconds`    | 기본값은 120입니다.                                                                                                                                                                                                             |



## 반환 값 \{#returned_value\}

지정된 파일에서 데이터를 읽거나 쓸 수 있도록, 지정된 구조를 가진 테이블입니다.



## 예시 \{#examples\}

`cluster_simple` 클러스터의 모든 노드를 사용하여 `/root/data/clickhouse` 및 `/root/data/database/` 디렉터리에 있는 모든 파일에서 데이터를 조회합니다:

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

클러스터 `cluster_simple`의 모든 파일에 있는 행의 총 개수를 계산합니다:

:::tip
파일 목록에 앞에 0이 붙은 숫자 범위가 포함되어 있는 경우, 각 자릿수마다 중괄호를 사용하는 방식으로 지정하거나 `?`를 사용하십시오.
:::

운영 환경에서는 [named collections](operations/named-collections.md) 사용을 권장합니다. 예시는 다음과 같습니다:

```sql

CREATE NAMED COLLECTION creds AS
        access_key_id = 'minio',
        secret_access_key = 'ClickHouse_Minio_P@ssw0rd';
SELECT count(*) FROM s3Cluster(
    'cluster_simple', creds, url='https://s3-object-url.csv',
    format='CSV', structure='name String, value UInt32, polygon Array(Array(Tuple(Float64, Float64)))'
)
```


## 비공개 및 공개 버킷에 접근하기 \{#accessing-private-and-public-buckets\}

s3 함수에 대해 [여기](/sql-reference/table-functions/s3#accessing-public-buckets)에 문서화된 것과 동일한 방법을 사용할 수 있습니다.



## 성능 최적화 \{#optimizing-performance\}

S3 FUNCTION 성능 최적화에 대한 자세한 설명은 [상세 가이드](/integrations/s3/performance)를 참조하십시오.



## 관련 항목 \{#related\}

- [S3 엔진](../../engines/table-engines/integrations/s3.md)
- [S3 테이블 함수](../../sql-reference/table-functions/s3.md)
