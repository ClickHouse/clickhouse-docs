---
description: 'INSERT INTO SQL 문 문서'
sidebar_label: 'INSERT INTO'
sidebar_position: 33
slug: /sql-reference/statements/insert-into
title: 'INSERT INTO SQL 문'
doc_type: 'reference'
---

# INSERT INTO 구문 \{#insert-into-statement\}

테이블에 데이터를 삽입합니다.

**구문**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] [SETTINGS ...] VALUES (v11, v12, v13), (v21, v22, v23), ...
```

`(c1, c2, c3)`를 사용하여 삽입할 컬럼 목록을 지정할 수 있습니다. 또한 `*`와 같은 컬럼 [matcher](../../sql-reference/statements/select/index.md#asterisk) 표현식 및 [APPLY](/sql-reference/statements/select/apply-modifier), [EXCEPT](/sql-reference/statements/select/except-modifier), [REPLACE](/sql-reference/statements/select/replace-modifier)와 같은 [수정자](../../sql-reference/statements/select/index.md#select-modifiers)를 사용할 수도 있습니다.

예를 들어, 다음과 같은 테이블을 가정합니다.

```sql
SHOW CREATE insert_select_testtable;
```

```text
CREATE TABLE insert_select_testtable
(
    `a` Int8,
    `b` String,
    `c` Int8
)
ENGINE = MergeTree()
ORDER BY a
```

```sql
INSERT INTO insert_select_testtable (*) VALUES (1, 'a', 1) ;
```

컬럼 `b`를 제외한 모든 컬럼에 데이터를 삽입하려면 `EXCEPT` 키워드를 사용할 수 있습니다. 위의 구문을 기준으로, 지정한 컬럼 개수(`(c1, c3)`)와 동일한 개수의 값(`VALUES (v11, v13)`)을 삽입해야 합니다.

```sql
INSERT INTO insert_select_testtable (* EXCEPT(b)) Values (2, 2);
```

```sql
SELECT * FROM insert_select_testtable;
```

```text
┌─a─┬─b─┬─c─┐
│ 2 │   │ 2 │
└───┴───┴───┘
┌─a─┬─b─┬─c─┐
│ 1 │ a │ 1 │
└───┴───┴───┘
```

이 예제에서 두 번째로 삽입된 행은 전달된 값으로 `a`와 `c` 컬럼이 채워지고, `b` 컬럼은 기본값으로 자동 채워집니다. 또한 `DEFAULT` 키워드를 사용하여 기본값을 삽입할 수도 있습니다.

```sql
INSERT INTO insert_select_testtable VALUES (1, DEFAULT, 1) ;
```

컬럼 목록에 모든 기존 컬럼이 포함되어 있지 않으면, 나머지 컬럼은 다음과 같이 채워집니다.

* 테이블 정의에서 지정한 `DEFAULT` 표현식으로 계산된 값
* `DEFAULT` 표현식이 정의되지 않은 경우 0과 빈 문자열

데이터는 ClickHouse에서 지원하는 [format](/sql-reference/formats)으로 INSERT에 전달할 수 있습니다. format은 쿼리에서 명시적으로 지정해야 합니다.

```sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT format_name data_set
```

예를 들어, 다음과 같은 쿼리 형식은 기본 `INSERT ... VALUES` 형식과 동일합니다:

```sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT Values (v11, v12, v13), (v21, v22, v23), ...
```

ClickHouse는 데이터 앞에 있는 모든 공백과 한 개의 줄 바꿈 문자(존재하는 경우)를 제거합니다. 쿼리를 작성할 때는 데이터가 공백으로 시작할 수 있는 경우를 고려하여, 쿼리 연산자 다음 줄에 데이터를 배치할 것을 권장합니다.

예시:

```sql
INSERT INTO t FORMAT TabSeparated
11  Hello, world!
22  Qwerty
```

쿼리와는 별도로 데이터를 삽입하려면 [command-line client](/operations/utilities/clickhouse-local) 또는 [HTTP 인터페이스](/interfaces/http)를 사용할 수 있습니다.

:::note
`INSERT` 쿼리에 대해 `SETTINGS`를 지정하려면 `FORMAT` 절보다 *앞에* 작성해야 합니다. `FORMAT format_name` 이후의 모든 내용은 데이터로 처리되기 때문입니다. 예를 들어:

```sql
INSERT INTO table SETTINGS ... FORMAT format_name data_set
```

:::


## 제약 조건 \{#constraints\}

테이블에 [제약 조건](../../sql-reference/statements/create/table.md#constraints)이 있는 경우, 삽입되는 데이터의 각 행에 대해 해당 제약 조건의 표현식이 검사됩니다. 이러한 제약 조건 중 하나라도 만족되지 않으면, 서버는 제약 조건 이름과 표현식을 포함한 예외를 발생시키고 쿼리 실행을 중단합니다.

## SELECT 결과 데이터 삽입 \{#inserting-the-results-of-select\}

**구문**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] SELECT ...
```

컬럼은 `SELECT` 절에서의 위치에 따라 매핑됩니다. 다만, `SELECT` 표현식에서의 이름과 `INSERT` 대상 테이블에서의 이름은 서로 다를 수 있습니다. 필요하면 형 변환이 수행됩니다.

Values 형식을 제외한 다른 데이터 형식에서는 `now()`, `1 + 2`와 같은 표현식을 값으로 지정할 수 없습니다. Values 형식에서는 제한적으로 표현식을 사용할 수 있지만, 이 경우 비효율적인 코드가 실행되므로 권장되지 않습니다.

데이터 파트(parts)를 수정하는 다른 쿼리인 `UPDATE`, `DELETE`, `REPLACE`, `MERGE`, `UPSERT`, `INSERT UPDATE`는 지원하지 않습니다.
그러나 `ALTER TABLE ... DROP PARTITION`을 사용하여 오래된 데이터를 삭제할 수는 있습니다.

`SELECT` 절에 테이블 함수 [input()](../../sql-reference/table-functions/input.md)이 포함된 경우, 쿼리 끝에 반드시 `FORMAT` 절을 명시해야 합니다.

널 허용이 아닌 데이터 타입의 컬럼에 `NULL` 대신 기본값을 삽입하려면 [insert&#95;null&#95;as&#95;default](../../operations/settings/settings.md#insert_null_as_default) SETTING을 활성화합니다.

`INSERT`는 CTE(common table expression)도 지원합니다. 예를 들어, 다음 두 SQL 문은 동일합니다.

```sql
INSERT INTO x WITH y AS (SELECT * FROM numbers(10)) SELECT * FROM y;
WITH y AS (SELECT * FROM numbers(10)) INSERT INTO x SELECT * FROM y;
```


## 파일에서 데이터 삽입 \{#inserting-data-from-a-file\}

**구문**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] FROM INFILE file_name [COMPRESSION type] [SETTINGS ...] [FORMAT format_name]
```

위의 구문을 사용하면 **클라이언트** 측에 저장된 하나 또는 여러 개의 파일에서 데이터를 삽입할 수 있습니다. `file_name`과 `type`은 문자열 리터럴입니다. 입력 파일의 [포맷](../../interfaces/formats.md)은 `FORMAT` 절에서 설정해야 합니다.

압축된 파일도 지원됩니다. 압축 유형은 파일 이름의 확장자로 자동 감지됩니다. 또는 `COMPRESSION` 절에서 명시적으로 지정할 수 있습니다. 지원되는 유형은 `'none'`, `'gzip'`, `'deflate'`, `'br'`, `'xz'`, `'zstd'`, `'lz4'`, `'bz2'`입니다.

이 기능은 [command-line client](../../interfaces/cli.md)와 [clickhouse-local](../../operations/utilities/clickhouse-local.md)에서 사용할 수 있습니다.

**예시**


### 단일 파일에서 FROM INFILE 사용하기 \{#single-file-with-from-infile\}

다음 쿼리를 [명령줄 클라이언트](../../interfaces/cli.md)를 사용하여 실행하십시오:

```bash
echo 1,A > input.csv ; echo 2,B >> input.csv
clickhouse-client --query="CREATE TABLE table_from_file (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;"
clickhouse-client --query="INSERT INTO table_from_file FROM INFILE 'input.csv' FORMAT CSV;"
clickhouse-client --query="SELECT * FROM table_from_file FORMAT PrettyCompact;"
```

결과:

```text
┌─id─┬─text─┐
│  1 │ A    │
│  2 │ B    │
└────┴──────┘
```


### 글롭(glob) 패턴을 사용한 FROM INFILE 다중 파일 처리 \{#multiple-files-with-from-infile-using-globs\}

이 예시는 이전 예제와 매우 비슷하지만, `FROM INFILE 'input_*.csv'`를 사용하여 여러 파일로부터 삽입을 수행합니다.

```bash
echo 1,A > input_1.csv ; echo 2,B > input_2.csv
clickhouse-client --query="CREATE TABLE infile_globs (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;"
clickhouse-client --query="INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;"
clickhouse-client --query="SELECT * FROM infile_globs FORMAT PrettyCompact;"
```

:::tip
`*`를 사용하여 여러 파일을 선택하는 것 외에도 범위(`{1,2}` 또는 `{1..9}`)와 기타 [glob 패턴 치환](/sql-reference/table-functions/file.md/#globs-in-path)을 사용할 수 있습니다. 아래 세 가지 모두 위 예제에서도 동일하게 동작합니다:

```sql
INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_{1,2}.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_?.csv' FORMAT CSV;
```

:::


## 테이블 함수(Table Function)를 사용한 INSERT \{#inserting-using-a-table-function\}

데이터는 [테이블 함수(table functions)](../../sql-reference/table-functions/index.md)로 참조되는 테이블에 삽입할 수 있습니다.

**구문**

```sql
INSERT INTO [TABLE] FUNCTION table_func ...
```

**예시**

다음 쿼리에서는 [remote](/sql-reference/table-functions/remote) 테이블 함수를 사용합니다.

```sql
CREATE TABLE simple_table (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;
INSERT INTO TABLE FUNCTION remote('localhost', default.simple_table)
    VALUES (100, 'inserted via remote()');
SELECT * FROM simple_table;
```

결과:

```text
┌──id─┬─text──────────────────┐
│ 100 │ inserted via remote() │
└─────┴───────────────────────┘
```


## ClickHouse Cloud에 데이터 삽입 \{#inserting-into-clickhouse-cloud\}

기본적으로 ClickHouse Cloud의 서비스는 고가용성을 위해 여러 레플리카를 제공합니다. 서비스에 연결하면 이 레플리카 중 하나에 연결이 설정됩니다.

`INSERT`가 성공하면 데이터는 기반 스토리지에 기록됩니다. 그러나 레플리카가 이러한 업데이트를 수신하기까지는 시간이 걸릴 수 있습니다. 따라서 다른 연결을 사용하여 다른 레플리카 중 하나에서 `SELECT` 쿼리를 실행하는 경우, 업데이트된 데이터가 아직 반영되지 않았을 수 있습니다.

`select_sequential_consistency`를 사용하여 레플리카가 최신 업데이트를 수신하도록 강제할 수 있습니다. 다음은 이 설정을 사용한 `SELECT` 쿼리 예시입니다:

```sql
SELECT .... SETTINGS select_sequential_consistency = 1;
```

`select_sequential_consistency`를 사용하면 ClickHouse Cloud 내부에서 사용되는 ClickHouse Keeper에 대한 부하가 증가하며, 서비스의 부하 수준에 따라 성능이 저하될 수 있습니다. 특별한 필요가 없다면 이 설정을 활성화하지 않을 것을 권장합니다. 권장하는 방법은 동일한 세션에서 읽기/쓰기를 실행하거나, 네이티브 프로토콜을 사용하여(즉 sticky connection을 지원하는) 클라이언트 드라이버를 사용하는 것입니다.


## 복제된 구성에서 데이터 삽입 \{#inserting-into-a-replicated-setup\}

복제된 구성에서는 데이터가 복제된 후 다른 레플리카에서 조회할 수 있게 됩니다. 데이터는 `INSERT` 직후 즉시 복제(다른 레플리카로 다운로드)되기 시작합니다. 이는 데이터가 즉시 공유 스토리지에 기록되고 레플리카가 메타데이터 변경 사항을 구독하는 ClickHouse Cloud와는 동작 방식이 다릅니다.

복제된 구성에서는 분산 합의를 위해 ClickHouse Keeper에 커밋해야 하므로 `INSERT`가 상당한 시간(약 1초 정도)이 걸릴 수 있다는 점에 유의해야 합니다. 스토리지로 S3를 사용하는 경우 추가 지연 시간이 발생합니다.

## 성능 고려 사항 \{#performance-considerations\}

`INSERT`는 입력 데이터를 기본 키로 정렬하고, 파티션 키를 기준으로 파티션으로 분할합니다. 여러 파티션에 동시에 데이터를 삽입하면 `INSERT` 쿼리 성능이 크게 저하될 수 있습니다. 이를 피하려면 다음을 권장합니다:

- 한 번에 100,000개의 행처럼 충분히 큰 배치 단위로 데이터를 추가합니다.
- 데이터를 ClickHouse에 업로드하기 전에 파티션 키 기준으로 그룹화합니다.

다음과 같은 경우에는 성능이 저하되지 않습니다:

- 데이터가 실시간으로 추가되는 경우
- 일반적으로 시간 기준으로 정렬된 데이터를 업로드하는 경우

### 비동기 insert \{#asynchronous-inserts\}

작지만 빈번한 insert 작업은 비동기 방식으로 수행할 수 있습니다. 이러한 insert로 유입되는 데이터는 배치로 묶은 후 테이블에 안전하게 insert됩니다. 비동기 insert를 사용하려면 [`async_insert`](/operations/settings/settings#async_insert) 설정을 활성화해야 합니다.

`async_insert` 또는 [`Buffer` 테이블 엔진](/engines/table-engines/special/buffer)을 사용하면 추가 버퍼링이 발생합니다.

### 대량 또는 장시간 실행되는 INSERT \{#large-or-long-running-inserts\}

대량의 데이터를 INSERT할 때 ClickHouse는 "squashing"이라 불리는 프로세스를 통해 쓰기 성능을 최적화합니다. 메모리에 있는 작은 데이터 블록들은 디스크에 기록되기 전에 더 큰 블록으로 병합(squash)됩니다. Squashing은 각 쓰기 작업에 수반되는 오버헤드를 줄여 줍니다. 이 과정에서 삽입된 데이터는 ClickHouse가 [`max_insert_block_size`](/operations/settings/settings#max_insert_block_size) 행을 기록할 때마다 쿼리할 수 있게 됩니다.

**함께 보기**

- [async_insert](/operations/settings/settings#async_insert)
- [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert)
- [wait_for_async_insert_timeout](/operations/settings/settings#wait_for_async_insert_timeout)
- [async_insert_max_data_size](/operations/settings/settings#async_insert_max_data_size)
- [async_insert_busy_timeout_ms](/operations/settings/settings#async_insert_busy_timeout_max_ms)
- [async_insert_stale_timeout_ms](/operations/settings/settings#async_insert_max_data_size)