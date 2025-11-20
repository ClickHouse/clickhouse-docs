---
'description': 'HDFS의 파일로부터 테이블을 생성합니다. 이 테이블 함수는 url 및 file 테이블 함수와 유사합니다.'
'sidebar_label': 'hdfs'
'sidebar_position': 80
'slug': '/sql-reference/table-functions/hdfs'
'title': 'hdfs'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# hdfs 테이블 함수

HDFS의 파일에서 테이블을 생성합니다. 이 테이블 함수는 [url](../../sql-reference/table-functions/url.md) 및 [file](../../sql-reference/table-functions/file.md) 테이블 함수와 유사합니다.

## 문법 {#syntax}

```sql
hdfs(URI, format, structure)
```

## 인자 {#arguments}

| 인자      | 설명                                                                                                                                                                     |
|-----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `URI`     | HDFS의 파일에 대한 상대 URI. 파일의 경로는 다음과 같은 글로브를 읽기 전용 모드로 지원합니다: `*`, `?`, `{abc,def}` 및 `{N..M}` 여기서 `N`, `M`은 숫자, `'abc', 'def'`는 문자열입니다. |
| `format`  | 파일의 [형식](/sql-reference/formats)입니다.                                                                                                                           |
| `structure`| 테이블의 구조. 형식은 `'column1_name column1_type, column2_name column2_type, ...'`입니다.                                                                                   |

## 반환 값 {#returned_value}

지정된 파일에서 데이터를 읽거나 쓰기 위한 지정된 구조의 테이블입니다.

**예제**

`hdfs://hdfs1:9000/test`에서 테이블과 그에서 첫 두 행을 선택한 예:

```sql
SELECT *
FROM hdfs('hdfs://hdfs1:9000/test', 'TSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
LIMIT 2
```

```text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```

## 경로에서의 글로브 {#globs_in_path}

경로에서 글로빙을 사용할 수 있습니다. 파일은 전체 경로 패턴과 일치해야 하며, 단순한 접미사나 접두사에만 맞춰서는 안 됩니다.

- `*` — `/`를 제외한 임의의 여러 문자를 나타내며, 빈 문자열도 포함됩니다.
- `**` — 폴더 내부의 모든 파일을 재귀적으로 나타냅니다.
- `?` — 임의의 단일 문자를 나타냅니다.
- `{some_string,another_string,yet_another_one}` — `'some_string', 'another_string', 'yet_another_one'` 중 하나의 문자열로 대체됩니다. 문자열은 `/` 기호를 포함할 수 있습니다.
- `{N..M}` — `N` 이상 및 `M` 이하의 숫자를 나타냅니다.

`{}`로 구성된 구문은 [remote](remote.md) 및 [file](file.md) 테이블 함수와 유사합니다.

**예제**

1. HDFS에 다음 URI를 가진 여러 파일이 있다고 가정합니다:

- 'hdfs://hdfs1:9000/some_dir/some_file_1'
- 'hdfs://hdfs1:9000/some_dir/some_file_2'
- 'hdfs://hdfs1:9000/some_dir/some_file_3'
- 'hdfs://hdfs1:9000/another_dir/some_file_1'
- 'hdfs://hdfs1:9000/another_dir/some_file_2'
- 'hdfs://hdfs1:9000/another_dir/some_file_3'

2. 이 파일들에서 행의 수를 쿼리합니다:

<!-- -->

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3. 이 두 디렉터리의 모든 파일에서 행의 수를 쿼리합니다:

<!-- -->

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
파일 목록에 선행 0이 있는 숫자 범위가 포함되어 있는 경우, 각 숫자에 대해 중괄호로 이루어진 구문을 사용하거나 `?`를 사용하십시오.
:::

**예제**

`file000`, `file001`, ... , `file999`라는 이름의 파일에서 데이터를 쿼리합니다:

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/big_dir/file{0..9}{0..9}{0..9}', 'CSV', 'name String, value UInt32')
```

## 가상 컬럼 {#virtual-columns}

- `_path` — 파일의 경로. 유형: `LowCardinality(String)`.
- `_file` — 파일의 이름. 유형: `LowCardinality(String)`.
- `_size` — 바이트 단위의 파일 크기. 유형: `Nullable(UInt64)`. 크기를 알 수 없는 경우 값은 `NULL`입니다.
- `_time` — 파일의 마지막 수정 시간. 유형: `Nullable(DateTime)`. 시간을 알 수 없는 경우 값은 `NULL`입니다.

## use_hive_partitioning 설정 {#hive-style-partitioning}

`use_hive_partitioning` 설정을 1로 설정하면 ClickHouse는 경로에서 Hive 스타일의 파티셔닝을 감지하고 쿼리에서 파티션 컬럼을 가상 컬럼으로 사용할 수 있게 됩니다. 이 가상 컬럼은 파티셔닝 경로와 동일한 이름을 가지지만 `_`로 시작합니다.

**예제**

Hive 스타일의 파티셔닝으로 생성된 가상 컬럼 사용

```sql
SELECT * FROM HDFS('hdfs://hdfs1:9000/data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```

## 저장 설정 {#storage-settings}

- [hdfs_truncate_on_insert](operations/settings/settings.md#hdfs_truncate_on_insert) - 삽입하기 전에 파일을 절단할 수 있습니다. 기본적으로 비활성화되어 있습니다.
- [hdfs_create_new_file_on_insert](operations/settings/settings.md#hdfs_create_new_file_on_insert) - 형식에 접미사가 있는 경우 매 삽입 시 새 파일을 생성할 수 있습니다. 기본적으로 비활성화되어 있습니다.
- [hdfs_skip_empty_files](operations/settings/settings.md#hdfs_skip_empty_files) - 읽는 동안 빈 파일을 건너뛸 수 있습니다. 기본적으로 비활성화되어 있습니다.

## 관련 항목 {#related}

- [가상 컬럼](../../engines/table-engines/index.md#table_engines-virtual_columns)
