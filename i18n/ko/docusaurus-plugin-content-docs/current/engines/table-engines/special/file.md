---
'description': '파일 테이블 엔진은 데이터를 지원되는 파일 형식 중 하나의 파일에 저장합니다 (`TabSeparated`, `Native`,
  등).'
'sidebar_label': '파일'
'sidebar_position': 40
'slug': '/engines/table-engines/special/file'
'title': '파일 테이블 엔진'
'doc_type': 'reference'
---


# 파일 테이블 엔진

파일 테이블 엔진은 지원되는 [파일 형식](/interfaces/formats#formats-overview) 중 하나(`TabSeparated`, `Native` 등)로 파일에 데이터를 저장합니다.

사용 사례:

- ClickHouse에서 파일로 데이터 내보내기.
- 데이터를 한 형식에서 다른 형식으로 변환하기.
- 디스크의 파일을 편집하여 ClickHouse의 데이터를 업데이트하기.

:::note
이 엔진은 현재 ClickHouse Cloud에서 사용할 수 없으므로 [대신 S3 테이블 함수를 사용하세요](/sql-reference/table-functions/s3.md).
:::

## ClickHouse 서버에서의 사용 {#usage-in-clickhouse-server}

```sql
File(Format)
```

`Format` 매개변수는 사용 가능한 파일 형식 중 하나를 지정합니다. `SELECT` 쿼리를 수행하려면 형식이 입력용으로 지원되어야 하고, `INSERT` 쿼리를 수행하려면 출력용으로 지원되어야 합니다. 사용 가능한 형식은 [형식](/interfaces/formats#formats-overview) 섹션에 나열되어 있습니다.

ClickHouse는 `File`에 대해 파일 시스템 경로를 지정할 수 없습니다. 서버 구성에서 [path](../../../operations/server-configuration-parameters/settings.md) 설정에 의해 정의된 폴더를 사용합니다.

`File(Format)`을 사용하여 테이블을 만들면 해당 폴더에 빈 하위 디렉토리가 생성됩니다. 데이터가 해당 테이블에 기록되면 이 하위 디렉토리 내의 `data.Format` 파일에 저장됩니다.

이 하위 폴더와 파일을 서버 파일 시스템에서 수동으로 만들고, 해당 이름과 일치하는 테이블 정보에 [ATTACH](../../../sql-reference/statements/attach.md)하여 해당 파일에서 데이터를 쿼리할 수 있습니다.

:::note
이 기능을 사용할 때 주의해야 하며, ClickHouse는 이러한 파일에 대한 외부 변경 사항을 추적하지 않습니다. ClickHouse와 외부에서의 동시 쓰기의 결과는 정의되지 않습니다.
:::

## 예제 {#example}

**1.** `file_engine_table` 테이블 설정:

```sql
CREATE TABLE file_engine_table (name String, value UInt32) ENGINE=File(TabSeparated)
```

기본적으로 ClickHouse는 `/var/lib/clickhouse/data/default/file_engine_table` 폴더를 생성합니다.

**2.** `/var/lib/clickhouse/data/default/file_engine_table/data.TabSeparated` 파일을 수동으로 생성하고 다음을 포함합니다:

```bash
$ cat data.TabSeparated
one 1
two 2
```

**3.** 데이터 쿼리:

```sql
SELECT * FROM file_engine_table
```

```text
┌─name─┬─value─┐
│ one  │     1 │
│ two  │     2 │
└──────┴───────┘
```

## ClickHouse-local에서의 사용 {#usage-in-clickhouse-local}

[clickhouse-local](../../../operations/utilities/clickhouse-local.md)에서 파일 엔진은 `Format` 외에 파일 경로를 추가로 수용합니다. 기본 입력/출력 스트림은 `0` 또는 `stdin`, `1` 또는 `stdout`과 같은 숫자 또는 사람이 읽을 수 있는 이름으로 지정할 수 있습니다. 추가 엔진 매개변수나 파일 확장자(`gz`, `br` 또는 `xz`)를 바탕으로 압축된 파일을 읽고 쓸 수 있습니다.

**예제:**

```bash
$ echo -e "1,2\n3,4" | clickhouse-local -q "CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin); SELECT a, b FROM table; DROP TABLE table"
```

## 구현 세부 사항 {#details-of-implementation}

- 여러 `SELECT` 쿼리를 동시에 수행할 수 있지만, `INSERT` 쿼리는 서로 대기합니다.
- `INSERT` 쿼리를 통해 새 파일을 생성할 수 있습니다.
- 파일이 존재하면 `INSERT`는 그 파일에 새로운 값을 추가합니다.
- 지원하지 않음:
  - `ALTER`
  - `SELECT ... SAMPLE`
  - 인덱스
  - 복제

## PARTITION BY {#partition-by}

`PARTITION BY` — 선택 사항. 파티션 키에 따라 데이터를 파티셔닝함으로써 별도의 파일을 생성할 수 있습니다. 대부분의 경우 파티션 키가 필요하지 않으며, 필요하다면 일반적으로 월별보다 더 세분화된 파티션 키는 필요하지 않습니다. 파티셔닝은 쿼리 속도를 높이지 않습니다(ORDER BY 표현식의 경우와 대조적으로). 너무 세분화된 파티셔닝을 사용하지 않아야 합니다. 클라이언트 식별자나 이름으로 데이터를 파티션하지 마십시오(대신 클라이언트 식별자나 이름을 ORDER BY 표현식의 첫 번째 컬럼으로 만드십시오).

월별 파티션의 경우, `toYYYYMM(date_column)` 표현식을 사용하고, 여기서 `date_column`은 [Date](/sql-reference/data-types/date.md) 형식의 날짜가 있는 컬럼입니다. 여기의 파티션 이름은 `"YYYYMM"` 형식입니다.

## 가상 컬럼 {#virtual-columns}

- `_path` — 파일 경로. 유형: `LowCardinality(String)`.
- `_file` — 파일 이름. 유형: `LowCardinality(String)`.
- `_size` — 파일 크기(바이트). 유형: `Nullable(UInt64)`. 크기가 알려지지 않으면 값은 `NULL`입니다.
- `_time` — 파일의 마지막 수정 시간. 유형: `Nullable(DateTime)`. 시간이 알려지지 않으면 값은 `NULL`입니다.

## 설정 {#settings}

- [engine_file_empty_if_not_exists](/operations/settings/settings#engine_file_empty_if_not_exists) - 존재하지 않는 파일에서 빈 데이터를 선택할 수 있게 합니다. 기본적으로 비활성화됨.
- [engine_file_truncate_on_insert](/operations/settings/settings#engine_file_truncate_on_insert) - 삽입 전에 파일을 잘라낼 수 있게 합니다. 기본적으로 비활성화됨.
- [engine_file_allow_create_multiple_files](/operations/settings/settings.md#engine_file_allow_create_multiple_files) - 형식에 접미사가 있을 경우 각 삽입 시 새 파일을 생성할 수 있게 합니다. 기본적으로 비활성화됨.
- [engine_file_skip_empty_files](/operations/settings/settings.md#engine_file_skip_empty_files) - 읽는 동안 빈 파일을 건너뛸 수 있게 합니다. 기본적으로 비활성화됨.
- [storage_file_read_method](/operations/settings/settings#engine_file_empty_if_not_exists) - 저장 파일에서 데이터 읽기 방법, 선택 사항: `read`, `pread`, `mmap`. mmap 방법은 clickhouse-server에 적용되지 않으며(clickhouse-local을 위해 설계됨), 기본값은 clickhouse-server의 `pread`, clickhouse-local의 `mmap`입니다.
