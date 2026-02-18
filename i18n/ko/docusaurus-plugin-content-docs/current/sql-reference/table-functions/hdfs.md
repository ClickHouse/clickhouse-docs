---
description: 'HDFS에 있는 파일로부터 테이블을 생성합니다. 이 테이블 함수는 url 및 file 테이블 함수와 유사합니다.'
sidebar_label: 'hdfs'
sidebar_position: 80
slug: /sql-reference/table-functions/hdfs
title: 'hdfs'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# hdfs 테이블 함수 \{#hdfs-table-function\}

HDFS에 있는 파일에서 테이블을 생성합니다. 이 테이블 함수는 [url](../../sql-reference/table-functions/url.md) 및 [file](../../sql-reference/table-functions/file.md) 테이블 함수와 유사합니다.



## 구문 \{#syntax\}

```sql
hdfs(URI, format, structure)
```


## 인수 \{#arguments\}

| Argument  | Description                                                                                                                                                              |
|-----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `URI`     | HDFS 내 파일에 대한 상대 URI입니다. 파일 경로는 읽기 전용 모드에서 다음과 같은 glob 패턴을 지원합니다: `*`, `?`, `{abc,def}`, `{N..M}` (`N`, `M`은 숫자, `'abc'`, `'def'`는 문자열). |
| `format`  | 파일의 [format](/sql-reference/formats)입니다.                                                                                                                          |
| `structure`| 테이블의 구조입니다. 형식은 `'column1_name column1_type, column2_name column2_type, ...'`입니다.                                                                           |



## 반환 값 \{#returned_value\}

지정된 파일에서 데이터를 읽거나 쓰기 위한 지정된 구조의 테이블입니다.

**예시**

`hdfs://hdfs1:9000/test`에서 생성된 테이블과 그 테이블에서 처음 두 개의 행을 선택하는 예:

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


## 경로에서 글롭(glob) 사용 \{#globs_in_path\}

경로에서 글로빙을 사용할 수 있습니다. 파일은 접두사나 접미사만이 아니라 전체 경로 패턴과 일치해야 합니다.

* `*` — 비어 있는 문자열을 포함하여 `/`를 제외한 임의 개수의 문자를 나타냅니다.
* `**` — 디렉터리 내부의 모든 파일을 재귀적으로 나타냅니다.
* `?` — 임의의 단일 문자를 나타냅니다.
* `{some_string,another_string,yet_another_one}` — 문자열 `'some_string', 'another_string', 'yet_another_one'` 중 하나로 치환됩니다. 문자열에는 `/` 기호를 포함할 수 있습니다.
* `{N..M}` — `>= N` 그리고 `<= M`인 임의의 숫자를 나타냅니다.

`{}` 구문은 [remote](remote.md) 및 [file](file.md) 테이블 함수와 유사하게 동작합니다.

**예시**

1. HDFS에 다음 URI를 가진 여러 파일이 있다고 가정합니다:

* &#39;hdfs://hdfs1:9000/some&#95;dir/some&#95;file&#95;1&#39;
* &#39;hdfs://hdfs1:9000/some&#95;dir/some&#95;file&#95;2&#39;
* &#39;hdfs://hdfs1:9000/some&#95;dir/some&#95;file&#95;3&#39;
* &#39;hdfs://hdfs1:9000/another&#95;dir/some&#95;file&#95;1&#39;
* &#39;hdfs://hdfs1:9000/another&#95;dir/some&#95;file&#95;2&#39;
* &#39;hdfs://hdfs1:9000/another&#95;dir/some&#95;file&#95;3&#39;

2. 다음 쿼리로 이 파일들의 행 수를 조회합니다:

{/* */ }

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3. 이 두 디렉터리 내 모든 파일의 행 개수를 조회합니다:

{/* */ }

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
파일 목록에 선행 0이 있는 숫자 범위가 포함되어 있는 경우, 각 자릿수마다 중괄호를 사용하는 방식이나 `?`를 사용하십시오.
:::

**예시**

`file000`, `file001`, ... , `file999`라는 이름의 파일에서 데이터를 쿼리합니다:

```sql
SELECT count(*)
FROM hdfs('hdfs://hdfs1:9000/big_dir/file{0..9}{0..9}{0..9}', 'CSV', 'name String, value UInt32')
```


## 가상 컬럼 \{#virtual-columns\}

- `_path` — 파일 경로. 타입: `LowCardinality(String)`.
- `_file` — 파일 이름. 타입: `LowCardinality(String)`.
- `_size` — 파일 크기(바이트). 타입: `Nullable(UInt64)`. 크기를 알 수 없으면 값은 `NULL`입니다.
- `_time` — 파일의 마지막 수정 시각. 타입: `Nullable(DateTime)`. 시각을 알 수 없으면 값은 `NULL`입니다.



## use_hive_partitioning 설정 \{#hive-style-partitioning\}

`use_hive_partitioning` 값이 1로 설정되어 있으면 ClickHouse는 경로(`/name=value/`)에서 Hive 스타일의 파티셔닝을 감지하고, 쿼리에서 파티션 컬럼을 가상 컬럼으로 사용할 수 있도록 허용합니다. 이러한 가상 컬럼은 파티셔닝 경로에 있는 컬럼과 동일한 이름을 가지지만, 앞에 `_`가 붙습니다.

**예시**

Hive 스타일 파티셔닝으로 생성된 가상 컬럼 사용

```sql
SELECT * FROM HDFS('hdfs://hdfs1:9000/data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```


## Storage 설정 \{#storage-settings\}

- [hdfs_truncate_on_insert](operations/settings/settings.md#hdfs_truncate_on_insert) - INSERT 전에 파일 내용을 비우도록 허용합니다. 기본적으로 비활성화되어 있습니다.
- [hdfs_create_new_file_on_insert](operations/settings/settings.md#hdfs_create_new_file_on_insert) - 포맷에 접미사가 있는 경우 각 INSERT 작업마다 새 파일을 생성하도록 허용합니다. 기본적으로 비활성화되어 있습니다.
- [hdfs_skip_empty_files](operations/settings/settings.md#hdfs_skip_empty_files) - 읽을 때 빈 파일을 건너뛰도록 허용합니다. 기본적으로 비활성화되어 있습니다.



## 관련 항목 \{#related\}

- [가상 컬럼](../../engines/table-engines/index.md#table_engines-virtual_columns)
