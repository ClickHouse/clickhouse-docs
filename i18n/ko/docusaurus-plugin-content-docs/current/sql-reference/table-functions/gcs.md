---
description: 'Google Cloud Storage의 데이터에 대해 `SELECT` 및 `INSERT`를 수행하기 위한 테이블과 유사한 인터페이스를 제공합니다. `Storage Object User` IAM 역할이 필요합니다.'
keywords: ['gcs', '버킷']
sidebar_label: 'gcs'
sidebar_position: 70
slug: /sql-reference/table-functions/gcs
title: 'gcs'
doc_type: 'reference'
---



# gcs Table Function \{#gcs-table-function\}

[Google Cloud Storage](https://cloud.google.com/storage/)에서 `SELECT` 및 `INSERT`를 사용해 데이터를 조회·삽입하기 위한 테이블 형태의 인터페이스를 제공합니다. [`Storage Object User` IAM role](https://cloud.google.com/storage/docs/access-control/iam-roles)이 필요합니다.

이는 [s3 table function](../../sql-reference/table-functions/s3.md)의 별칭입니다.

클러스터에 여러 레플리카가 있는 경우, 대신 [s3Cluster function](../../sql-reference/table-functions/s3Cluster.md)(GCS와 함께 동작함)을 사용하여 insert 작업을 병렬로 수행할 수 있습니다.



## 구문 \{#syntax\}

```sql
gcs(url [, NOSIGN | hmac_key, hmac_secret] [,format] [,structure] [,compression_method])
gcs(named_collection[, option=value [,..]])
```

:::tip GCS
GCS Table Function은 GCS XML API와 HMAC 키를 사용하여 Google Cloud Storage와 연동합니다.
엔드포인트와 HMAC에 대한 자세한 내용은 [Google 상호운용성 문서](https://cloud.google.com/storage/docs/interoperability)를 참조하십시오.
:::


## Arguments \{#arguments\}

| Argument                     | Description                                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `url`                        | 파일에 대한 버킷 경로입니다. 읽기 전용 모드에서는 다음 와일드카드를 지원합니다: `*`, `**`, `?`, `{abc,def}`, `{N..M}` (여기서 `N`, `M`은 숫자이고 `'abc'`, `'def'`는 문자열입니다).    |
| `NOSIGN`                     | 이 키워드를 자격 증명 대신 지정하면 모든 요청에 서명이 적용되지 않습니다.                                                                                            |
| `hmac_key` and `hmac_secret` | 지정된 엔드포인트에서 사용할 자격 증명을 나타내는 키입니다. 선택 사항입니다.                                                                                           |
| `format`                     | 파일의 [format](/sql-reference/formats)입니다.                                                                                              |
| `structure`                  | 테이블 구조입니다. 형식: `'column1_name column1_type, column2_name column2_type, ...'`.                                                         |
| `compression_method`         | 선택적 파라미터입니다. 지원되는 값: `none`, `gzip` 또는 `gz`, `brotli` 또는 `br`, `xz` 또는 `LZMA`, `zstd` 또는 `zst`. 기본적으로 파일 확장자를 기반으로 압축 방식을 자동으로 감지합니다. |

:::note GCS
GCS 경로는 다음 형식을 사용합니다. Google XML API의 엔드포인트가 JSON API와 다르기 때문입니다:

```text
  https://storage.googleapis.com/<bucket>/<folder>/<filename(s)>
```

and not ~~https://storage.cloud.google.com~~.
:::

인수는 [named collections](operations/named-collections.md)을 사용하여 전달할 수도 있습니다. 이 경우 `url`, `format`, `structure`, `compression_method`는 동일한 방식으로 동작하며, 추가 파라미터도 지원합니다:

| Parameter                     | Description                                                                                                                                                                                        |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `access_key_id`               | `hmac_key`, 선택 사항입니다.                                                                                                                                                                              |
| `secret_access_key`           | `hmac_secret`, 선택 사항입니다.                                                                                                                                                                           |
| `filename`                    | 지정되면 URL 끝에 추가됩니다.                                                                                                                                                                                 |
| `use_environment_credentials` | 기본적으로 활성화되어 있으며, 환경 변수 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`, `AWS_CONTAINER_CREDENTIALS_FULL_URI`, `AWS_CONTAINER_AUTHORIZATION_TOKEN`, `AWS_EC2_METADATA_DISABLED`을 사용하여 추가 파라미터를 전달할 수 있습니다. |
| `no_sign_request`             | 기본적으로 비활성화되어 있습니다.                                                                                                                                                                                 |
| `expiration_window_seconds`   | 기본값은 120입니다.                                                                                                                                                                                       |


## 반환 값 \{#returned_value\}

지정된 파일에서 데이터를 읽거나 쓰기 위한 지정된 구조의 테이블입니다.



## 예시 \{#examples\}

GCS 파일 `https://storage.googleapis.com/my-test-bucket-768/data.csv`에서 생성한 테이블에서 처음 두 행을 선택합니다:

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

`gzip` 압축 방식을 사용하는 파일에서 읽는 유사한 예시는 다음과 같습니다.

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


## 사용법 \{#usage\}

GCS에 다음 URI를 가진 여러 개의 파일이 있다고 가정합니다:

* &#39;https://storage.googleapis.com/my-test-bucket-768/some&#95;prefix/some&#95;file&#95;1.csv&#39;
* &#39;https://storage.googleapis.com/my-test-bucket-768/some&#95;prefix/some&#95;file&#95;2.csv&#39;
* &#39;https://storage.googleapis.com/my-test-bucket-768/some&#95;prefix/some&#95;file&#95;3.csv&#39;
* &#39;https://storage.googleapis.com/my-test-bucket-768/some&#95;prefix/some&#95;file&#95;4.csv&#39;
* &#39;https://storage.googleapis.com/my-test-bucket-768/another&#95;prefix/some&#95;file&#95;1.csv&#39;
* &#39;https://storage.googleapis.com/my-test-bucket-768/another&#95;prefix/some&#95;file&#95;2.csv&#39;
* &#39;https://storage.googleapis.com/my-test-bucket-768/another&#95;prefix/some&#95;file&#95;3.csv&#39;
* &#39;https://storage.googleapis.com/my-test-bucket-768/another&#95;prefix/some&#95;file&#95;4.csv&#39;

1부터 3까지 숫자로 끝나는 파일의 행 수를 계산하십시오.

```sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/{some,another}_prefix/some_file_{1..3}.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
```

```text
┌─count()─┐
│      18 │
└─────────┘
```

이 두 디렉터리에 있는 모든 파일의 행 총 개수를 계산하십시오:

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
파일 목록에 앞에 0이 붙은 숫자 범위가 포함되어 있는 경우, 각 자릿수마다 중괄호를 사용하거나 `?`를 사용하십시오.
:::

`file-000.csv`, `file-001.csv`, ... , `file-999.csv`라는 이름의 파일에 있는 행의 총 개수를 계산하십시오:

```sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/big_prefix/file-{000..999}.csv', 'CSV', 'name String, value UInt32');
```

```text
┌─count()─┐
│      12 │
└─────────┘
```

`test-data.csv.gz` 파일에 데이터를 삽입하십시오:

```sql
INSERT INTO FUNCTION gcs('https://storage.googleapis.com/my-test-bucket-768/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip')
VALUES ('test-data', 1), ('test-data-2', 2);
```

기존 테이블의 데이터를 파일 `test-data.csv.gz`에 삽입합니다:

```sql
INSERT INTO FUNCTION gcs('https://storage.googleapis.com/my-test-bucket-768/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip')
SELECT name, value FROM existing_table;
```

Glob `**`는 디렉터리를 재귀적으로 탐색하는 데 사용할 수 있습니다. 아래 예제에서는 `my-test-bucket-768` 디렉터리의 모든 파일을 재귀적으로 가져옵니다.

```sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**', 'CSV', 'name String, value UInt32', 'gzip');
```

아래 예시는 `my-test-bucket` 버킷 내 모든 폴더에 있는 `test-data.csv.gz` 파일로부터 재귀적으로 데이터를 가져옵니다.

```sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip');
```

프로덕션 환경에서는 [named collections](operations/named-collections.md)을 사용하는 것이 권장됩니다. 다음은 예시입니다.

```sql

CREATE NAMED COLLECTION creds AS
        access_key_id = '***',
        secret_access_key = '***';
SELECT count(*)
FROM gcs(creds, url='https://s3-object-url.csv')
```


## 파티션별 쓰기 \{#partitioned-write\}

`GCS` 테이블에 데이터를 삽입할 때 `PARTITION BY` 표현식을 지정하면, 각 파티션 값마다 별도의 파일이 생성됩니다. 데이터를 개별 파일로 분할하면 읽기 작업의 효율을 높이는 데 도움이 됩니다.

**예시**

1. 키에 파티션 ID를 포함하면 별도의 파일이 생성됩니다:

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket/file_{_partition_id}.csv', 'CSV', 'a String, b UInt32, c UInt32')
    PARTITION BY a VALUES ('x', 2, 3), ('x', 4, 5), ('y', 11, 12), ('y', 13, 14), ('z', 21, 22), ('z', 23, 24);
```

그 결과 데이터는 `file_x.csv`, `file_y.csv`, `file_z.csv` 세 개의 파일에 기록됩니다.

2. 버킷 이름에 파티션 ID를 사용하면 서로 다른 버킷에 파일이 생성됩니다.

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket_{_partition_id}/file.csv', 'CSV', 'a UInt32, b UInt32, c UInt32')
    PARTITION BY a VALUES (1, 2, 3), (1, 4, 5), (10, 11, 12), (10, 13, 14), (20, 21, 22), (20, 23, 24);
```

그 결과 데이터는 서로 다른 버킷에 있는 세 개의 파일(`my_bucket_1/file.csv`, `my_bucket_10/file.csv`, `my_bucket_20/file.csv`)에 기록됩니다.


## 관련 항목 \{#related\}
- [S3 테이블 함수](s3.md)
- [S3 엔진](../../engines/table-engines/integrations/s3.md)
