---
'description': 'Google Cloud Storage에서 데이터를 `SELECT` 및 `INSERT` 할 수 있는 테이블과 같은 인터페이스를
  제공합니다. `Storage Object User` IAM 역할이 필요합니다.'
'keywords':
- 'gcs'
- 'bucket'
'sidebar_label': 'gcs'
'sidebar_position': 70
'slug': '/sql-reference/table-functions/gcs'
'title': 'gcs'
'doc_type': 'reference'
---


# gcs 테이블 함수

`SELECT` 및 [Google Cloud Storage](https://cloud.google.com/storage/)에서 데이터를 `INSERT`할 수 있는 테이블과 같은 인터페이스를 제공합니다. [`Storage Object User` IAM 역할](https://cloud.google.com/storage/docs/access-control/iam-roles)이 필요합니다.

이는 [s3 테이블 함수](../../sql-reference/table-functions/s3.md)의 별칭입니다.

클러스터에 여러 개의 복제본이 있는 경우, 삽입을 병렬화하기 위해 [s3Cluster 함수](../../sql-reference/table-functions/s3Cluster.md) (GCS와 함께 작동함)를 사용할 수 있습니다.

## 구문 {#syntax}

```sql
gcs(url [, NOSIGN | hmac_key, hmac_secret] [,format] [,structure] [,compression_method])
gcs(named_collection[, option=value [,..]])
```

:::tip GCS
GCS 테이블 함수는 GCS XML API 및 HMAC 키를 사용하여 Google Cloud Storage와 통합됩니다. 
엔드포인트 및 HMAC에 대한 자세한 내용은 [Google 상호 운용성 문서](https://cloud.google.com/storage/docs/interoperability)를 참조하십시오.
:::

## 인수 {#arguments}

| 인수                         | 설명                                                                                                                                                                                     |
|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                        | 파일의 버킷 경로. 읽기 전용 모드에서 다음 와일드카드를 지원합니다: `*`, `**`, `?`, `{abc,def}` 및 `{N..M}` 여기서 `N`, `M`은 숫자이고, `'abc'`, `'def'`는 문자열입니다.                           |
| `NOSIGN`                     | 자격 증명 대신 이 키워드를 제공하면 모든 요청이 서명되지 않습니다.                                                                                                               |
| `hmac_key` 및 `hmac_secret` | 주어진 엔드포인트와 함께 사용할 자격 증명을 지정하는 키. 선택 사항입니다.                                                                                                             |
| `format`                     | 파일의 [형식](/sql-reference/formats).                                                                                                                                                 |
| `structure`                  | 테이블의 구조. 형식은 `'column1_name column1_type, column2_name column2_type, ...'`입니다.                                                                                                  |
| `compression_method`         | 이 파라미터는 선택 사항입니다. 지원되는 값: `none`, `gzip` 또는 `gz`, `brotli` 또는 `br`, `xz` 또는 `LZMA`, `zstd` 또는 `zst`. 기본적으로 파일 확장자에 따라 압축 방법을 자동 감지합니다. |

:::note GCS
GCS 경로는 Google XML API의 엔드포인트가 JSON API와 다르기 때문에 아래와 같은 형식입니다:

```text
https://storage.googleapis.com/<bucket>/<folder>/<filename(s)>
```

그리고 ~~https://storage.cloud.google.com~~이 아닙니다.
:::

인수는 [명명된 컬렉션](operations/named-collections.md)을 사용하여 전달할 수도 있습니다. 이 경우 `url`, `format`, `structure`, `compression_method`는 동일하게 작동하며, 추가로 지원되는 몇 가지 매개변수가 있습니다:

| 매개변수                     | 설명                                                                                                                                                                                                                       |
|-------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `access_key_id`               | `hmac_key`, 선택 사항.                                                                                                                                                                                                  |
| `secret_access_key`           | `hmac_secret`, 선택 사항.                                                                                                                                                                                               |
| `filename`                    | 지정된 경우 URL에 추가됩니다.                                                                                                                                                                                          |
| `use_environment_credentials` | 기본적으로 활성화되어 있으며, 환경 변수 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`, `AWS_CONTAINER_CREDENTIALS_FULL_URI`, `AWS_CONTAINER_AUTHORIZATION_TOKEN`, `AWS_EC2_METADATA_DISABLED`을 사용하여 추가 매개변수를 전달할 수 있습니다. |
| `no_sign_request`             | 기본적으로 비활성화되어 있습니다.                                                                                                                                                                                      |
| `expiration_window_seconds`   | 기본값은 120입니다.                                                                                                                                                                                                     |

## 반환 값 {#returned_value}

지정된 파일에서 데이터를 읽거나 쓸 수 있는 지정된 구조의 테이블입니다.

## 예제 {#examples}

GCS 파일 `https://storage.googleapis.com/my-test-bucket-768/data.csv`에서 첫 두 행을 선택합니다:

```sql
SELECT *
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/data.csv.gz', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
LIMIT 2;
```

```text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```

유사하지만 `gzip` 압축 방법을 사용하는 파일에서의 예:

```sql
SELECT *
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/data.csv.gz', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32', 'gzip')
LIMIT 2;
```

```text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```

## 사용법 {#usage}

GCS에 다음 URI를 가진 여러 파일이 있다고 가정해 보겠습니다:

-   'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_1.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_2.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_3.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_4.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_1.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_2.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_3.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_4.csv'

1부터 3까지 숫자로 끝나는 파일의 행 수를 계산합니다:

```sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/{some,another}_prefix/some_file_{1..3}.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
```

```text
┌─count()─┐
│      18 │
└─────────┘
```

이 두 디렉터리의 모든 파일에서 총 행 수를 계산합니다:

```sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/{some,another}_prefix/*', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
```

```text
┌─count()─┐
│      24 │
└─────────┘
```

:::warning
파일 목록에 선행 영이 있는 숫자 범위가 포함된 경우 각 숫자에 대해 중괄호로 구성을 사용하거나 `?`를 사용하십시오.
:::

`file-000.csv`, `file-001.csv`, ... , `file-999.csv`라는 이름의 파일에서 총 행 수를 계산합니다:

```sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/big_prefix/file-{000..999}.csv', 'CSV', 'name String, value UInt32');
```

```text
┌─count()─┐
│      12 │
└─────────┘
```

`test-data.csv.gz` 파일에 데이터를 삽입합니다:

```sql
INSERT INTO FUNCTION gcs('https://storage.googleapis.com/my-test-bucket-768/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip')
VALUES ('test-data', 1), ('test-data-2', 2);
```

기존 테이블에서 `test-data.csv.gz` 파일로 데이터를 삽입합니다:

```sql
INSERT INTO FUNCTION gcs('https://storage.googleapis.com/my-test-bucket-768/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip')
SELECT name, value FROM existing_table;
```

Glob **는 재귀 디렉터리 탐색에 사용할 수 있습니다. 아래 예를 고려하십시오. 이는 `my-test-bucket-768` 디렉터리에서 모든 파일을 재귀적으로 가져옵니다:

```sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**', 'CSV', 'name String, value UInt32', 'gzip');
```

아래는 `my-test-bucket` 디렉터리 내의 모든 폴더에서 모든 `test-data.csv.gz` 파일에서 데이터를 가져옵니다:

```sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip');
```

생산 사용 사례에는 [명명된 컬렉션](operations/named-collections.md)을 사용하는 것이 좋습니다. 예를 들어:
```sql

CREATE NAMED COLLECTION creds AS
        access_key_id = '***',
        secret_access_key = '***';
SELECT count(*)
FROM gcs(creds, url='https://s3-object-url.csv')
```

## 파티션 쓰기 {#partitioned-write}

`GCS` 테이블에 데이터를 삽입할 때 `PARTITION BY` 식을 지정하면 각 파티션 값에 대해 별도의 파일이 생성됩니다. 데이터를 별도의 파일로 분할하면 읽기 작업 효율성이 향상됩니다.

**예제**

1. 키에 파티션 ID를 사용하면 별도의 파일이 생성됩니다:

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket/file_{_partition_id}.csv', 'CSV', 'a String, b UInt32, c UInt32')
    PARTITION BY a VALUES ('x', 2, 3), ('x', 4, 5), ('y', 11, 12), ('y', 13, 14), ('z', 21, 22), ('z', 23, 24);
```
결과적으로 데이터는 `file_x.csv`, `file_y.csv`, 및 `file_z.csv`의 세 파일에 기록됩니다.

2. 버킷 이름에 파티션 ID를 사용하면 다른 버킷에 파일이 생성됩니다:

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket_{_partition_id}/file.csv', 'CSV', 'a UInt32, b UInt32, c UInt32')
    PARTITION BY a VALUES (1, 2, 3), (1, 4, 5), (10, 11, 12), (10, 13, 14), (20, 21, 22), (20, 23, 24);
```
결과적으로 데이터는 서로 다른 버킷에 있는 세 개의 파일에 기록됩니다: `my_bucket_1/file.csv`, `my_bucket_10/file.csv`, 및 `my_bucket_20/file.csv`.

## 관련 {#related}
- [S3 테이블 함수](s3.md)
- [S3 엔진](../../engines/table-engines/integrations/s3.md)
