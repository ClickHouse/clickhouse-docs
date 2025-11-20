---
'description': '파일에서 SELECT 및 INSERT할 수 있는 테이블과 유사한 인터페이스를 제공하는 테이블 엔진입니다. 로컬 파일 작업
  시 `file()`을 사용하고, S3, GCS 또는 MinIO와 같은 객체 저장소의 버킷 작업 시 `s3()`를 사용합니다.'
'sidebar_label': '파일'
'sidebar_position': 60
'slug': '/sql-reference/table-functions/file'
'title': '파일'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# file Table Function

파일에서 SELECT 및 INSERT 하기 위한 테이블과 유사한 인터페이스를 제공하는 테이블 엔진이며, [s3](/sql-reference/table-functions/url.md) 테이블 함수와 유사합니다. 로컬 파일 작업 시 `file()`를 사용하고, S3, GCS 또는 MinIO와 같은 객체 저장소에서 버킷 작업 시 `s3()`를 사용합니다.

`file` 함수는 파일에서 읽거나 파일에 쓰기 위해 `SELECT` 및 `INSERT` 쿼리에서 사용될 수 있습니다.

## Syntax {#syntax}

```sql
file([path_to_archive ::] path [,format] [,structure] [,compression])
```

## Arguments {#arguments}

| Parameter         | Description                                                                                                                                                                                                                                                                                                   |
|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `path`            | [user_files_path](operations/server-configuration-parameters/settings.md#user_files_path)로부터 파일까지의 상대 경로입니다. 읽기 전용 모드에서 다음 [globs](#globs-in-path)를 지원합니다: `*`, `?`, `{abc,def}` ('abc'와 'def'는 문자열) 및 `{N..M}` (N과 M은 숫자).                        |
| `path_to_archive` | zip/tar/7z 아카이브에 대한 상대 경로입니다. `path`와 동일한 globs를 지원합니다.                                                                                                                                                                                                                                 |
| `format`          | 파일의 [format](/interfaces/formats)입니다.                                                                                                                                                                                                                                                                |
| `structure`       | 테이블의 구조입니다. 형식: `'column1_name column1_type, column2_name column2_type, ...'`.                                                                                                                                                                                                                |
| `compression`     | `SELECT` 쿼리에서 사용할 때 기존의 압축 유형이거나, `INSERT` 쿼리에서 사용할 때 원하는 압축 유형입니다. 지원되는 압축 유형은 `gz`, `br`, `xz`, `zst`, `lz4`, 및 `bz2`입니다.                                                                                                       |

## Returned value {#returned_value}

파일에서 데이터를 읽거나 쓰기 위한 테이블입니다.

## Examples for Writing to a File {#examples-for-writing-to-a-file}

### Write to a TSV file {#write-to-a-tsv-file}

```sql
INSERT INTO TABLE FUNCTION
file('test.tsv', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
VALUES (1, 2, 3), (3, 2, 1), (1, 3, 2)
```

그 결과, 데이터는 파일 `test.tsv`에 작성됩니다:

```bash

# cat /var/lib/clickhouse/user_files/test.tsv
1    2    3
3    2    1
1    3    2
```

### Partitioned write to multiple TSV files {#partitioned-write-to-multiple-tsv-files}

`file()` 유형의 테이블 함수에 데이터를 삽입할 때 `PARTITION BY` 표현식을 지정하면 각 파티션에 대해 별도의 파일이 생성됩니다. 데이터를 별도의 파일로 분할하면 읽기 작업의 성능이 향상됩니다.

```sql
INSERT INTO TABLE FUNCTION
file('test_{_partition_id}.tsv', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
PARTITION BY column3
VALUES (1, 2, 3), (3, 2, 1), (1, 3, 2)
```

그 결과, 데이터는 세 개의 파일에 작성됩니다: `test_1.tsv`, `test_2.tsv`, 및 `test_3.tsv`.

```bash

# cat /var/lib/clickhouse/user_files/test_1.tsv
3    2    1


# cat /var/lib/clickhouse/user_files/test_2.tsv
1    3    2


# cat /var/lib/clickhouse/user_files/test_3.tsv
1    2    3
```

## Examples for Reading from a File {#examples-for-reading-from-a-file}

### SELECT from a CSV file {#select-from-a-csv-file}

먼저 서버 구성에서 `user_files_path`를 설정하고 `test.csv` 파일을 준비합니다:

```bash
$ grep user_files_path /etc/clickhouse-server/config.xml
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>

$ cat /var/lib/clickhouse/user_files/test.csv
    1,2,3
    3,2,1
    78,43,45
```

그런 다음, `test.csv`에서 테이블로 데이터를 읽고 첫 두 행을 선택합니다:

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

### Inserting data from a file into a table {#inserting-data-from-a-file-into-a-table}

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

`archive1.zip` 또는 `archive2.zip`에 위치한 `table.csv`에서 데이터를 읽습니다:

```sql
SELECT * FROM file('user_files/archives/archive{1..2}.zip :: table.csv');
```

## Globs in path {#globs-in-path}

경로는 글로빙을 사용할 수 있습니다. 파일은 전체 경로 패턴과 일치해야 하며, 접미사나 접두사만 일치하지 않아야 합니다. 단, 경로가 기존 디렉토리를 참조하고 globs를 사용하지 않을 경우, 전체 디렉토리의 파일이 선택될 수 있도록 `*`가 암묵적으로 경로에 추가됩니다.

- `*` — `/`를 제외한 임의의 많은 문자(빈 문자열 포함)를 나타냅니다.
- `?` — 임의의 단일 문자를 나타냅니다.
- `{some_string,another_string,yet_another_one}` — 문자열 `'some_string', 'another_string', 'yet_another_one'` 중 하나로 대체됩니다. 문자열에는 `/` 기호가 포함될 수 있습니다.
- `{N..M}` — `>= N` 및 `<= M`인 임의의 숫자를 나타냅니다.
- `**` - 폴더 내부의 모든 파일을 재귀적으로 나타냅니다.

`{}`와 함께 사용되는 구문은 [remote](remote.md) 및 [hdfs](hdfs.md) 테이블 함수와 유사합니다.

## Examples {#examples}

**Example**

다음과 같은 상대 경로의 파일들이 있다고 가정합니다:

- `some_dir/some_file_1`
- `some_dir/some_file_2`
- `some_dir/some_file_3`
- `another_dir/some_file_1`
- `another_dir/some_file_2`
- `another_dir/some_file_3`

모든 파일의 총 행 수를 쿼리합니다:

```sql
SELECT count(*) FROM file('{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32');
```

동일한 결과를 달성하는 대체 경로 표현식:

```sql
SELECT count(*) FROM file('{some,another}_dir/*', 'TSV', 'name String, value UInt32');
```

암묵적인 `*`을 사용하여 `some_dir`의 총 행 수를 쿼리합니다:

```sql
SELECT count(*) FROM file('some_dir', 'TSV', 'name String, value UInt32');
```

:::note
파일 목록에 선행 제로가 있는 숫자 범위가 포함된 경우, 각 숫자에 대해 중괄호 구조를 사용하거나 `?`를 사용하십시오.
:::

**Example**

`file000`, `file001`, ..., `file999`라는 파일의 총 행 수를 쿼리합니다:

```sql
SELECT count(*) FROM file('big_dir/file{0..9}{0..9}{0..9}', 'CSV', 'name String, value UInt32');
```

**Example**

디렉토리 `big_dir/` 내의 모든 파일에서 총 행 수를 재귀적으로 쿼리합니다:

```sql
SELECT count(*) FROM file('big_dir/**', 'CSV', 'name String, value UInt32');
```

**Example**

디렉토리 `big_dir/` 내의 모든 폴더 안에서 `file002`라는 모든 파일의 총 행 수를 재귀적으로 쿼리합니다:

```sql
SELECT count(*) FROM file('big_dir/**/file002', 'CSV', 'name String, value UInt32');
```

## Virtual Columns {#virtual-columns}

- `_path` — 파일 경로입니다. 타입: `LowCardinality(String)`.
- `_file` — 파일 이름입니다. 타입: `LowCardinality(String)`.
- `_size` — 파일 크기(바이트)입니다. 타입: `Nullable(UInt64)`. 파일 크기가 알려지지 않을 경우 값은 `NULL`입니다.
- `_time` — 파일의 마지막 수정 시간입니다. 타입: `Nullable(DateTime)`. 시간이 알려지지 않을 경우 값은 `NULL`입니다.

## use_hive_partitioning setting {#hive-style-partitioning}

`use_hive_partitioning` 설정이 1로 설정되면 ClickHouse는 경로에서 Hive 스타일의 파티셔닝을 감지하며 (`/name=value/`), 파티션 열을 쿼리에서 가상 열로 사용할 수 있도록 허용합니다. 이러한 가상 열은 파티션 경로의 이름과 동일하지만 `_`로 시작합니다.

**Example**

Hive 스타일 파티셔닝으로 생성된 가상 열을 사용합니다:

```sql
SELECT * FROM file('data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```

## Settings {#settings}

| Setting                                                                                                            | Description                                                                                                                                                                 |
|--------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [engine_file_empty_if_not_exists](/operations/settings/settings#engine_file_empty_if_not_exists)                   | 존재하지 않는 파일에서 빈 데이터를 선택할 수 있습니다. 기본적으로 비활성화되어 있습니다.                                                                                            |
| [engine_file_truncate_on_insert](/operations/settings/settings#engine_file_truncate_on_insert)                     | 삽입 전에 파일을 잘라낼 수 있습니다. 기본적으로 비활성화되어 있습니다.                                                                                                         |
| [engine_file_allow_create_multiple_files](operations/settings/settings.md#engine_file_allow_create_multiple_files) | 형식에 접미사가 있을 경우 각 삽입 시 새 파일을 만들 수 있습니다. 기본적으로 비활성화되어 있습니다.                                                                                       |
| [engine_file_skip_empty_files](operations/settings/settings.md#engine_file_skip_empty_files)                       | 읽기 중 빈 파일을 건너뛸 수 있도록 합니다. 기본적으로 비활성화되어 있습니다.                                                                                                              |
| [storage_file_read_method](/operations/settings/settings#engine_file_empty_if_not_exists)                          | 저장 파일에서 데이터를 읽는 방법으로, <br />읽기, pread, mmap (clickhouse-local에만 해당) 중 하나입니다. 기본 값: `pread` (clickhouse-server 용), `mmap` (clickhouse-local 용). |

## Related {#related}

- [Virtual columns](engines/table-engines/index.md#table_engines-virtual_columns)
- [Rename files after processing](operations/settings/settings.md#rename_files_after_processing)
