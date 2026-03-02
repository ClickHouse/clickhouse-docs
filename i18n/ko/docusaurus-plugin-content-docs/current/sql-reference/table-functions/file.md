---
description: '파일에서 SELECT 및 INSERT를 수행할 수 있는 테이블 형태의 인터페이스를 제공하는 테이블 엔진으로, s3 테이블 함수와 유사합니다. 로컬 파일을 사용할 때는 `file()`을, S3, GCS, MinIO와 같은 객체 스토리지의 버킷을 사용할 때는 `s3()`를 사용합니다.'
sidebar_label: 'file'
sidebar_position: 60
slug: /sql-reference/table-functions/file
title: 'file'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# file Table Function \{#file-table-function\}

[s3](/sql-reference/table-functions/url.md) 테이블 함수와 유사하게, 파일에 대해 `SELECT` 및 `INSERT`를 수행하기 위한 테이블과 같은 인터페이스를 제공하는 테이블 엔진입니다. 로컬 파일을 사용할 때는 `file()`을 사용하고, S3, GCS, MinIO와 같은 객체 스토리지의 버킷을 사용할 때는 `s3()`를 사용합니다.

`file` 테이블 함수는 `SELECT` 및 `INSERT` 쿼리에서 파일을 읽거나 쓸 때 사용할 수 있습니다.



## 문법 \{#syntax\}

```sql
file([path_to_archive ::] path [,format] [,structure] [,compression])
```


## Arguments \{#arguments\}

| Parameter         | Description                                                                                                                                                                                                                                                                                                   |
|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `path`            | [user_files_path](operations/server-configuration-parameters/settings.md#user_files_path) 기준 파일의 상대 경로입니다. 읽기 전용 모드에서는 다음 [글롭(glob)](#globs-in-path)을 지원합니다: `*`, `?`, `{abc,def}`(`'abc'`와 `'def'`는 문자열), `{N..M}`(`N`과 `M`은 숫자). |
| `path_to_archive` | zip/tar/7z 아카이브의 상대 경로입니다. `path`와 동일한 글롭을 지원합니다.                                                                                                                                                                                                                                      |
| `format`          | 파일의 [format](/interfaces/formats)입니다.                                                                                                                                                                                                                                                                    |
| `structure`       | 테이블 구조입니다. 형식: `'column1_name column1_type, column2_name column2_type, ...'`.                                                                                                                                                                                                                       |
| `compression`     | `SELECT` 쿼리에서 사용할 경우 기존 압축 유형을, `INSERT` 쿼리에서 사용할 경우 원하는 압축 유형을 나타냅니다. 지원되는 압축 유형은 `gz`, `br`, `xz`, `zst`, `lz4`, `bz2`입니다.                                                                                                                                    |



## 반환 값 \{#returned_value\}

파일의 데이터를 읽거나 쓰는 데 사용되는 테이블입니다.



## 파일에 쓰기 예제 \{#examples-for-writing-to-a-file\}

### TSV 파일에 쓰기 \{#write-to-a-tsv-file\}

```sql
INSERT INTO TABLE FUNCTION
file('test.tsv', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
VALUES (1, 2, 3), (3, 2, 1), (1, 3, 2)
```

그 결과, 데이터가 `test.tsv` 파일에 기록됩니다:


```bash
# cat /var/lib/clickhouse/user_files/test.tsv
1    2    3
3    2    1
1    3    2
```

### 여러 TSV 파일로 파티션 단위 쓰기 \{#partitioned-write-to-multiple-tsv-files\}

`file()` 유형의 테이블 함수에 데이터를 삽입할 때 `PARTITION BY` 표현식을 지정하면 파티션별로 개별 파일이 생성됩니다. 데이터를 별도 파일로 분할하면 읽기 작업 성능이 향상됩니다.

```sql
INSERT INTO TABLE FUNCTION
file('test_{_partition_id}.tsv', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
PARTITION BY column3
VALUES (1, 2, 3), (3, 2, 1), (1, 3, 2)
```

결과적으로 데이터는 `test_1.tsv`, `test_2.tsv`, `test_3.tsv` 세 개의 파일에 각각 기록됩니다.


```bash
# cat /var/lib/clickhouse/user_files/test_1.tsv
3    2    1
```


# cat /var/lib/clickhouse/user_files/test_2.tsv
1    3    2



# cat /var/lib/clickhouse/user_files/test_3.tsv

1    2    3

```
```


## 파일에서 읽기 예제

### CSV 파일에서 SELECT

먼저 서버 설정에서 `user_files_path`를 지정하고 `test.csv` 파일을 준비합니다:

```bash
$ grep user_files_path /etc/clickhouse-server/config.xml
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>

$ cat /var/lib/clickhouse/user_files/test.csv
    1,2,3
    3,2,1
    78,43,45
```

그런 다음 `test.csv`에서 데이터를 테이블로 읽어 들인 후, 처음 두 행을 조회합니다:

```sql
SELECT * FROM
file('test.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
LIMIT 2;
```

```text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```

### 파일 데이터를 테이블에 삽입하기

```sql
INSERT INTO FUNCTION
file('test.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
VALUES (1, 2, 3), (3, 2, 1);
```

```sql
SELECT * FROM
file('test.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32');
```

```text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```

`archive1.zip` 또는 `archive2.zip`(또는 둘 다)에 들어 있는 `table.csv`에서 데이터를 읽기:

```sql
SELECT * FROM file('user_files/archives/archive{1..2}.zip :: table.csv');
```


## 경로에서의 글로빙(Globs in path) \{#globs-in-path\}

경로에는 글로빙(globbing)을 사용할 수 있습니다. 파일은 접두사나 접미사만이 아니라 전체 경로 패턴과 일치해야 합니다. 한 가지 예외로, 경로가 기존 디렉터리를 가리키고 글로빙을 사용하지 않는 경우 해당 경로 끝에 암묵적으로 `*`가 추가되어, 디렉터리 내의 모든 파일이 선택됩니다.

- `*` — 빈 문자열을 포함하여 `/`를 제외한 임의 개수의 문자와 일치합니다.
- `?` — 임의의 단일 문자와 일치합니다.
- `{some_string,another_string,yet_another_one}` — 문자열 `'some_string', 'another_string', 'yet_another_one'` 중 어떤 것이든 대체합니다. 문자열에는 `/` 기호를 포함할 수 있습니다.
- `{N..M}` — `>= N` 그리고 `<= M`인 임의의 숫자를 나타냅니다.
- `**` - 폴더 내의 모든 파일과 재귀적으로 포함된 모든 파일과 일치합니다.

`{}`를 사용하는 구문은 [remote](remote.md) 및 [hdfs](hdfs.md) 테이블 함수와 유사합니다.



## 예시 \{#hive-style-partitioning\}

**예시**

다음과 같은 상대 경로를 가진 파일들이 있다고 가정합니다:

* `some_dir/some_file_1`
* `some_dir/some_file_2`
* `some_dir/some_file_3`
* `another_dir/some_file_1`
* `another_dir/some_file_2`
* `another_dir/some_file_3`

모든 파일의 전체 행 수를 쿼리합니다:

```sql
SELECT count(*) FROM file('{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32');
```

동일한 결과를 얻을 수 있는 다른 경로 표현식은 다음과 같습니다.

```sql
SELECT count(*) FROM file('{some,another}_dir/*', 'TSV', 'name String, value UInt32');
```

암시적 `*`를 사용하여 `some_dir`의 총 행 수를 조회합니다:

```sql
SELECT count(*) FROM file('some_dir', 'TSV', 'name String, value UInt32');
```

:::note
파일 목록에서 숫자 범위에 앞에 0이 붙는 경우에는 각 자릿수마다 중괄호를 사용하는 방식이나 `?`를 사용하십시오.
:::

**예시**

`file000`, `file001`, ... , `file999`라는 이름의 파일에 있는 총 행 수를 조회합니다:

```sql
SELECT count(*) FROM file('big_dir/file{0..9}{0..9}{0..9}', 'CSV', 'name String, value UInt32');
```

**예시**

디렉터리 `big_dir/` 이하의 모든 파일에 대해 재귀적으로 총 행 수를 쿼리합니다.

```sql
SELECT count(*) FROM file('big_dir/**', 'CSV', 'name String, value UInt32');
```

**예시**

디렉터리 `big_dir/` 내의 모든 하위 폴더를 재귀적으로 탐색하여, 그 안에 있는 모든 `file002` 파일의 전체 행 수를 조회합니다:

```sql
SELECT count(*) FROM file('big_dir/**/file002', 'CSV', 'name String, value UInt32');
```


## 가상 컬럼 \{#virtual-columns\}

- `_path` — 파일 경로입니다. 타입: `LowCardinality(String)`.
- `_file` — 파일 이름입니다. 타입: `LowCardinality(String)`.
- `_size` — 파일 크기(바이트 단위)입니다. 타입: `Nullable(UInt64)`. 파일 크기를 알 수 없는 경우 값은 `NULL`입니다.
- `_time` — 파일의 마지막 수정 시간입니다. 타입: `Nullable(DateTime)`. 시간을 알 수 없는 경우 값은 `NULL`입니다.



## use_hive_partitioning 설정 \{#related\}

`use_hive_partitioning` 설정 값이 1로 설정되면 ClickHouse는 경로(`/name=value/`)에서 Hive 스타일 파티셔닝을 감지하고 쿼리에서 파티션 컬럼을 가상 컬럼으로 사용할 수 있도록 허용합니다. 이러한 가상 컬럼은 파티션 경로에 있는 이름과 동일하지만, 앞에 `_`가 붙습니다.

**예시**

Hive 스타일 파티셔닝으로 생성된 가상 컬럼 사용

```sql
SELECT * FROM file('data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```


## Settings {#settings}

| Setting                                                                                                            | Description                                                                                                                                                                 |
|--------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [engine_file_empty_if_not_exists](/operations/settings/settings#engine_file_empty_if_not_exists)                   | 존재하지 않는 파일에서 빈 데이터를 조회할 수 있도록 허용합니다. 기본적으로 비활성화되어 있습니다.                                                                            |
| [engine_file_truncate_on_insert](/operations/settings/settings#engine_file_truncate_on_insert)                     | 파일에 데이터를 삽입하기 전에 파일을 truncate하도록 허용합니다. 기본적으로 비활성화되어 있습니다.                                                                            |
| [engine_file_allow_create_multiple_files](operations/settings/settings.md#engine_file_allow_create_multiple_files) | 포맷에 접미사가 있는 경우 각 INSERT마다 새 파일을 생성하도록 허용합니다. 기본적으로 비활성화되어 있습니다.                                                                   |
| [engine_file_skip_empty_files](operations/settings/settings.md#engine_file_skip_empty_files)                       | 읽는 과정에서 빈 파일을 건너뛰도록 허용합니다. 기본적으로 비활성화되어 있습니다.                                                                                            |
| [storage_file_read_method](/operations/settings/settings#engine_file_empty_if_not_exists)                          | 저장소 파일에서 데이터를 읽는 방식입니다. 다음 중 하나를 사용합니다: `read`, `pread`, `mmap`(clickhouse-local에만 해당). 기본값: clickhouse-server는 `pread`, clickhouse-local은 `mmap`입니다. |



## 관련 항목 {#related}

- [가상 컬럼](engines/table-engines/index.md#table_engines-virtual_columns)
- [처리 후 파일 이름 변경](operations/settings/settings.md#rename_files_after_processing)
