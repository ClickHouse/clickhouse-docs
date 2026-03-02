---
description: 'File 테이블 엔진은 지원되는 파일 형식(`TabSeparated`, `Native` 등) 중 하나로 된 파일에 데이터를 저장합니다.'
sidebar_label: 'File'
sidebar_position: 40
slug: /engines/table-engines/special/file
title: 'File 테이블 엔진'
doc_type: 'reference'
---



# File 테이블 엔진 \{#file-table-engine\}

File 테이블 엔진은 지원되는 [파일 포맷](/interfaces/formats#formats-overview) (`TabSeparated`, `Native` 등) 중 하나의 파일에 데이터를 저장합니다.

사용 예:

- ClickHouse에서 파일로 데이터를 내보냅니다.
- 데이터를 한 포맷에서 다른 포맷으로 변환합니다.
- 디스크의 파일을 편집하여 ClickHouse의 데이터를 업데이트합니다.

:::note
이 엔진은 현재 ClickHouse Cloud에서는 사용할 수 없습니다. 대신 [S3 테이블 함수](/sql-reference/table-functions/s3.md)를 사용하십시오.
:::



## ClickHouse Server에서의 사용 \{#usage-in-clickhouse-server\}

```sql
File(Format)
```

`Format` 매개변수는 사용 가능한 파일 포맷 중 하나를 지정합니다.
`SELECT` 쿼리를 수행하려면 해당 포맷이 입력용으로 지원되어야 하고, `INSERT` 쿼리를 수행하려면 출력용으로 지원되어야 합니다. 사용 가능한 포맷은 [Formats](/interfaces/formats#formats-overview) 섹션에 나와 있습니다.

ClickHouse에서는 `File`에 대해 파일 시스템 경로를 직접 지정할 수 없습니다. 서버 설정의 [path](../../../operations/server-configuration-parameters/settings.md) 설정으로 정의된 폴더를 사용합니다.

`File(Format)`을 사용하여 테이블을 생성하면, 해당 폴더 안에 비어 있는 하위 디렉터리가 생성됩니다. 이 테이블에 데이터가 기록되면, 해당 하위 디렉터리의 `data.Format` 파일에 저장됩니다.

서버 파일 시스템에서 이 하위 폴더와 파일을 수동으로 생성한 뒤, 동일한 이름의 테이블 정보에 [ATTACH](../../../sql-reference/statements/attach.md)하여 그 파일의 데이터를 쿼리할 수 있습니다.

:::note
이 기능을 사용할 때는 주의해야 합니다. ClickHouse는 이러한 파일에 대한 외부 변경 사항을 추적하지 않습니다. ClickHouse를 통한 쓰기와 ClickHouse 외부에서의 쓰기가 동시에 발생하는 경우 그 결과는 정의되지 않습니다.
:::


## 예제 \{#example\}

**1.** `file_engine_table` 테이블을 생성합니다:

```sql
CREATE TABLE file_engine_table (name String, value UInt32) ENGINE=File(TabSeparated)
```

기본적으로 ClickHouse는 `/var/lib/clickhouse/data/default/file_engine_table` 디렉터리를 생성합니다.

**2.** 다음 내용을 포함하는 `/var/lib/clickhouse/data/default/file_engine_table/data.TabSeparated` 파일을 수동으로 생성합니다:

```bash
$ cat data.TabSeparated
one 1
two 2
```

**3.** 데이터를 조회합니다:

```sql
SELECT * FROM file_engine_table
```

```text
┌─name─┬─value─┐
│ one  │     1 │
│ two  │     2 │
└──────┴───────┘
```


## ClickHouse-local에서의 사용법 \{#usage-in-clickhouse-local\}

[clickhouse-local](../../../operations/utilities/clickhouse-local.md)에서는 File 엔진이 `Format` 외에 파일 경로도 인수로 받을 수 있습니다. 기본 입력/출력 스트림은 `0` 또는 `stdin`, `1` 또는 `stdout`과 같은 숫자 또는 사람이 읽기 쉬운 이름으로 지정할 수 있습니다. 추가 엔진 매개변수 또는 파일 확장자(`gz`, `br` 또는 `xz`)에 따라 압축 파일을 읽고 쓸 수 있습니다.

**예제:**

```bash
$ echo -e "1,2\n3,4" | clickhouse-local -q "CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin); SELECT a, b FROM table; DROP TABLE table"
```


## 구현 세부 사항 \{#details-of-implementation\}

- 여러 `SELECT` 쿼리를 동시에 실행할 수 있지만, `INSERT` 쿼리는 서로의 완료를 기다립니다.
- `INSERT` 쿼리로 새 파일을 생성하는 것을 지원합니다.
- 파일이 이미 존재하는 경우, `INSERT`는 해당 파일에 새 값을 이어서 추가합니다.
- 다음 기능은 지원하지 않습니다:
  - `ALTER`
  - `SELECT ... SAMPLE`
  - 인덱스
  - 복제



## PARTITION BY \{#partition-by\}

`PARTITION BY` — 선택 사항입니다. 파티션 키를 기준으로 데이터를 파티셔닝하여 별도의 파일을 생성할 수 있습니다. 대부분의 경우 파티션 키가 필요하지 않으며, 필요하더라도 일반적으로 월 단위보다 더 세분화된 파티션 키는 필요하지 않습니다. 파티셔닝은 (ORDER BY 표현식과 달리) 쿼리 성능을 향상시키지 않습니다. 지나치게 세분화된 파티셔닝은 절대 사용하지 마십시오. 데이터는 클라이언트 식별자나 이름으로 파티셔닝하지 말고, 대신 ORDER BY 표현식에서 클라이언트 식별자나 이름을 첫 번째 컬럼으로 두십시오.

월별로 파티셔닝하려면, `date_column`이 [Date](/sql-reference/data-types/date.md) 유형의 날짜를 담고 있는 컬럼인 경우 `toYYYYMM(date_column)` 표현식을 사용하십시오. 이때 파티션 이름은 `"YYYYMM"` 형식을 가집니다.



## 가상 컬럼 \{#virtual-columns\}

- `_path` — 파일 경로. 타입: `LowCardinality(String)`.
- `_file` — 파일 이름. 타입: `LowCardinality(String)`.
- `_size` — 파일 크기(바이트 단위). 타입: `Nullable(UInt64)`. 크기를 알 수 없는 경우 값은 `NULL`입니다.
- `_time` — 파일의 마지막 수정 시간. 타입: `Nullable(DateTime)`. 시간을 알 수 없는 경우 값은 `NULL`입니다.



## 설정 \{#settings\}

- [engine_file_empty_if_not_exists](/operations/settings/settings#engine_file_empty_if_not_exists) - 존재하지 않는 파일에서 빈 결과를 조회할 수 있도록 허용합니다. 기본적으로 비활성화되어 있습니다.
- [engine_file_truncate_on_insert](/operations/settings/settings#engine_file_truncate_on_insert) - 데이터를 삽입하기 전에 파일 내용을 비울 수 있도록 허용합니다. 기본적으로 비활성화되어 있습니다.
- [engine_file_allow_create_multiple_files](/operations/settings/settings.md#engine_file_allow_create_multiple_files) - 형식에 접미사가 있는 경우 각 삽입마다 새 파일을 생성할 수 있도록 허용합니다. 기본적으로 비활성화되어 있습니다.
- [engine_file_skip_empty_files](/operations/settings/settings.md#engine_file_skip_empty_files) - 읽을 때 빈 파일을 건너뛰도록 허용합니다. 기본적으로 비활성화되어 있습니다.
- [storage_file_read_method](/operations/settings/settings#engine_file_empty_if_not_exists) - 스토리지 파일에서 데이터를 읽는 방법으로, `read`, `pread`, `mmap` 중 하나입니다. mmap 방식은 clickhouse-server에는 적용되지 않으며(clickhouse-local용입니다). 기본값: clickhouse-server의 경우 `pread`, clickhouse-local의 경우 `mmap`입니다.
