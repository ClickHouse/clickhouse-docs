---
'description': 'INSERT INTO 문서'
'sidebar_label': 'INSERT INTO'
'sidebar_position': 33
'slug': '/sql-reference/statements/insert-into'
'title': 'INSERT INTO 문'
'doc_type': 'reference'
---


# INSERT INTO 문

테이블에 데이터를 삽입합니다.

**문법**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] [SETTINGS ...] VALUES (v11, v12, v13), (v21, v22, v23), ...
```

삽입할 컬럼 목록을 `(c1, c2, c3)`을 사용하여 지정할 수 있습니다. 또한 `*`와 같은 컬럼 [매처](../../sql-reference/statements/select/index.md#asterisk)와 [APPLY](/sql-reference/statements/select/apply-modifier), [EXCEPT](/sql-reference/statements/select/except-modifier), [REPLACE](/sql-reference/statements/select/replace-modifier)와 같은 [수식어](../../sql-reference/statements/select/index.md#select-modifiers)를 사용할 수 있습니다.

예를 들어, 다음과 같은 테이블을 고려해보십시오:

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

컬럼 `b`를 제외한 모든 컬럼에 데이터를 삽입하고 싶다면 `EXCEPT` 키워드를 사용하여 삽입할 수 있습니다. 위의 문법을 참고하면, 지정한 컬럼 수(`(c1, c3)`)와 동일한 수만큼의 값을(`VALUES (v11, v13)`) 삽입해야 합니다:

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

이 예제에서 우리는 두 번째로 삽입된 행이 `a`와 `c` 컬럼에 전달된 값으로 채워지고, `b`는 기본값으로 채워져 있다는 것을 볼 수 있습니다. 기본값을 삽입하기 위해 `DEFAULT` 키워드를 사용하는 것도 가능합니다:

```sql
INSERT INTO insert_select_testtable VALUES (1, DEFAULT, 1) ;
```

컬럼 목록에 모든 기존 컬럼이 포함되지 않으면 나머지 컬럼은 다음으로 채워집니다:

- 테이블 정의에 지정된 `DEFAULT` 표현식에서 계산된 값.
- `DEFAULT` 표현식이 정의되지 않은 경우, 제로와 빈 문자열.

데이터는 ClickHouse에서 지원하는 어떤 [형식](/sql-reference/formats)으로도 INSERT에 전달될 수 있습니다. 쿼리에서 형식을 명시적으로 지정해야 합니다:

```sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT format_name data_set
```

예를 들어, 아래의 쿼리 형식은 `INSERT ... VALUES`의 기본 버전과 동일합니다:

```sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT Values (v11, v12, v13), (v21, v22, v23), ...
```

ClickHouse는 데이터를 전달하기 전에 모든 공백과 한 개의 개행(있는 경우)을 제거합니다. 쿼리를 형성할 때는 데이터가 쿼리 연산자 뒤에 새 줄로 오는 것이 중요합니다. 만약 데이터가 공백으로 시작한다면 더욱 그렇습니다.

예시:

```sql
INSERT INTO t FORMAT TabSeparated
11  Hello, world!
22  Qwerty
```

쿼리와 별도로 데이터를 삽입하려면 [명령줄 클라이언트](/operations/utilities/clickhouse-local) 또는 [HTTP 인터페이스](/interfaces/http/)를 사용할 수 있습니다.

:::note
`INSERT` 쿼리에 대해 `SETTINGS`를 지정하려면 `FORMAT` 절 이전에 해야 합니다. `FORMAT format_name` 이후의 모든 내용은 데이터로 취급됩니다. 예를 들어:

```sql
INSERT INTO table SETTINGS ... FORMAT format_name data_set
```
:::

## 제약 조건 {#constraints}

테이블에 [제약 조건](../../sql-reference/statements/create/table.md#constraints)이 있는 경우, 삽입된 데이터의 각 행에 대해 그 표현식이 확인됩니다. 이들 제약 조건 중 어떤 것이 충족되지 않으면 서버는 제약 조건 이름과 표현식을 포함하는 예외를 발생시키며, 쿼리는 중단됩니다.

## SELECT 결과 삽입 {#inserting-the-results-of-select}

**문법**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] SELECT ...
```

컬럼은 `SELECT` 절에서의 위치에 따라 매핑됩니다. 그러나 `SELECT` 표현식과 `INSERT`용 테이블에서의 컬럼 이름은 다를 수 있습니다. 필요할 경우, 타입 캐스팅이 수행됩니다.

Values 형식을 제외한 데이터 형식은 `now()`, `1 + 2`와 같은 표현식에 값을 설정할 수 없습니다. Values 형식은 제한된 표현식 사용을 허용하지만, 이는 권장되지 않습니다. 이 경우 비효율적인 코드가 실행되기 때문입니다.

데이터 파트를 수정하기 위한 다른 쿼리는 지원되지 않습니다: `UPDATE`, `DELETE`, `REPLACE`, `MERGE`, `UPSERT`, `INSERT UPDATE`. 그러나 `ALTER TABLE ... DROP PARTITION`을 사용하여 오래된 데이터를 삭제할 수 있습니다.

`SELECT` 절에 테이블 함수 [input()](../../sql-reference/table-functions/input.md) 가 포함되어 있는 경우, `FORMAT` 절은 쿼리 끝에 명시되어야 합니다.

NULL 대신 기본값을 삽입하려면 Nullable 데이터 타입의 컬럼에 대해 [insert_null_as_default](../../operations/settings/settings.md#insert_null_as_default) 설정을 활성화하십시오.

`INSERT`는 CTE(공통 테이블 표현식)를 지원합니다. 예를 들어, 다음 두 문장은 동일합니다:

```sql
INSERT INTO x WITH y AS (SELECT * FROM numbers(10)) SELECT * FROM y;
WITH y AS (SELECT * FROM numbers(10)) INSERT INTO x SELECT * FROM y;
```

## 파일에서 데이터 삽입 {#inserting-data-from-a-file}

**문법**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] FROM INFILE file_name [COMPRESSION type] [SETTINGS ...] [FORMAT format_name]
```

위 문법을 사용하여 **클라이언트** 측에 저장된 파일 또는 파일들에서 데이터를 삽입하십시오. `file_name`과 `type`은 문자열 리터럴입니다. 입력 파일 [형식](../../interfaces/formats.md)은 `FORMAT` 절에서 설정해야 합니다.

압축 파일이 지원됩니다. 압축 유형은 파일 이름의 확장자로 감지됩니다. 또는 `COMPRESSION` 절에 명시적으로 지정할 수 있습니다. 지원되는 유형은: `'none'`, `'gzip'`, `'deflate'`, `'br'`, `'xz'`, `'zstd'`, `'lz4'`, `'bz2'`입니다.

이 기능은 [명령줄 클라이언트](../../interfaces/cli.md)와 [clickhouse-local](../../operations/utilities/clickhouse-local.md)에서 가능합니다.

**예시**

### FROM INFILE로 단일 파일 {#single-file-with-from-infile}

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

### FROM INFILE로 여러 파일 glob 사용하기 {#multiple-files-with-from-infile-using-globs}

이 예제는 이전 예제와 매우 유사하지만, `FROM INFILE 'input_*.csv`를 사용하여 여러 파일에서 삽입이 이루어집니다.

```bash
echo 1,A > input_1.csv ; echo 2,B > input_2.csv
clickhouse-client --query="CREATE TABLE infile_globs (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;"
clickhouse-client --query="INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;"
clickhouse-client --query="SELECT * FROM infile_globs FORMAT PrettyCompact;"
```

:::tip
여러 파일을 `*`로 선택하는 것 외에도, 범위(`{1,2}` 또는 `{1..9}`) 및 기타 [glob 대체](/sql-reference/table-functions/file.md/#globs-in-path)를 사용할 수 있습니다. 이 세 가지는 모두 위의 예에서 작동할 것입니다:

```sql
INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_{1,2}.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_?.csv' FORMAT CSV;
```
:::

## 테이블 함수를 사용한 삽입 {#inserting-using-a-table-function}

데이터는 [테이블 함수](../../sql-reference/table-functions/index.md)를 참조하여 테이블에 삽입될 수 있습니다.

**문법**

```sql
INSERT INTO [TABLE] FUNCTION table_func ...
```

**예시**

[remote](/sql-reference/table-functions/remote) 테이블 함수는 다음 쿼리에서 사용됩니다:

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

## ClickHouse Cloud로 데이터 삽입 {#inserting-into-clickhouse-cloud}

기본적으로 ClickHouse Cloud의 서비스는 고가용성을 위해 여러 복제본을 제공합니다. 서비스에 연결하면 이러한 복제본 중 하나에 연결이 설정됩니다.

`INSERT`가 성공적으로 수행된 후, 데이터는 기본 저장소에 기록됩니다. 그러나 복제본이 이러한 업데이트를 수신하는 데 시간 소요될 수 있습니다. 따라서 이러한 다른 복제본 중 하나에서 `SELECT` 쿼리를 실행하는 다른 연결을 사용하는 경우, 업데이트된 데이터가 아직 반영되지 않을 수 있습니다.

`select_sequential_consistency`를 사용하여 복제본이 최신 업데이트를 수신하도록 강제할 수 있습니다. 다음은 이 설정을 사용하는 `SELECT` 쿼리의 예입니다:

```sql
SELECT .... SETTINGS select_sequential_consistency = 1;
```

`select_sequential_consistency`를 사용하는 경우 ClickHouse Keeper(ClickHouse Cloud가 내부적으로 사용하는)에 부하가 증가하고 서비스의 부하에 따라 성능 저하가 발생할 수 있다는 점에 유의하십시오. 필요하지 않는 한 이 설정을 활성화하는 것을 권장하지 않습니다. 권장되는 접근 방식은 같은 세션에서 읽기/쓰기를 실행하거나 네이티브 프로토콜을 사용하는 클라이언트 드라이버를 사용하는 것입니다(따라서 스티키 연결을 지원합니다).

## 복제된 설정으로의 데이터 삽입 {#inserting-into-a-replicated-setup}

복제된 설정에서는 데이터가 복제된 후 다른 복제본에서 표시됩니다. 데이터는 `INSERT` 후 즉시 복제가 시작됩니다(다른 복제본에서 다운로드됨). 이는 데이터가 즉시 공유 저장소에 기록되고 복제본이 메타데이터 변경을 구독하는 ClickHouse Cloud와 다릅니다.

복제된 설정에서는 `INSERT`가 때때로 상당한 시간이 소요될 수 있습니다(일 초 정도) ClickHouse Keeper에 커밋하여 분산 합의를 달성해야 하기 때문입니다. 저장소로 S3를 사용하는 것도 추가 대기 시간을 발생시킵니다.

## 성능 고려 사항 {#performance-considerations}

`INSERT`는 입력 데이터를 기본 키로 정렬하고 파티션 키에 따라 파티션으로 나눕니다. 여러 파티션에 한 번에 데이터를 삽입하면 `INSERT` 쿼리의 성능이 크게 감소할 수 있습니다. 이를 피하려면:

- 데이터는 비교적 큰 배치로 추가하십시오. 예를 들어 한 번에 100,000 행.
- ClickHouse에 업로드하기 전에 데이터는 파티션 키로 그룹화하십시오.

실시간으로 데이터가 추가되면 성능이 감소하지 않습니다.

### 비동기 삽입 {#asynchronous-inserts}

작지만 빈번한 삽입으로 비동기적으로 데이터를 삽입할 수 있습니다. 이러한 삽입에서의 데이터는 배치로 결합되어 테이블에 안전하게 삽입됩니다. 비동기 삽입을 사용하려면 [`async_insert`](/operations/settings/settings#async_insert) 설정을 활성화하십시오.

`async_insert` 또는 [`Buffer` 테이블 엔진](/engines/table-engines/special/buffer)을 사용하면 추가 버퍼링이 발생합니다.

### 대규모 또는 긴 실행 시간의 삽입 {#large-or-long-running-inserts}

대량의 데이터를 삽입할 때 ClickHouse는 "합치기"라는 프로세스를 통해 쓰기 성능을 최적화합니다. 메모리에 삽입된 작은 데이터 블록들이 병합되어 더 큰 블록으로 압축된 후 디스크에 기록됩니다. 합치기는 각 쓰기 작업과 관련된 오버헤드를 줄입니다. 이 과정에서 삽입된 데이터는 ClickHouse가 [`max_insert_block_size`](/operations/settings/settings#max_insert_block_size)행을 쓰기를 완료한 후 쿼리 가능한 상태가 됩니다.

**참고 문헌**

- [async_insert](/operations/settings/settings#async_insert)
- [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert)
- [wait_for_async_insert_timeout](/operations/settings/settings#wait_for_async_insert_timeout)
- [async_insert_max_data_size](/operations/settings/settings#async_insert_max_data_size)
- [async_insert_busy_timeout_ms](/operations/settings/settings#async_insert_busy_timeout_max_ms)
- [async_insert_stale_timeout_ms](/operations/settings/settings#async_insert_max_data_size)
