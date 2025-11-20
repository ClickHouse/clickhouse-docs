---
'sidebar_label': 'Parquet'
'sidebar_position': 3
'slug': '/integrations/data-formats/parquet'
'title': 'ClickHouse에서 Parquet 작업하기'
'description': 'ClickHouse에서 Parquet로 작업하는 방법을 설명하는 페이지'
'doc_type': 'guide'
'keywords':
- 'parquet'
- 'columnar format'
- 'data format'
- 'compression'
- 'apache parquet'
---


# ClickHouse에서 Parquet 작업하기

Parquet은 데이터를 컬럼 지향 방식으로 저장하기 위한 효율적인 파일 포맷입니다. ClickHouse는 Parquet 파일을 읽고 쓰는 것을 지원합니다.

:::tip
쿼리에서 파일 경로를 참조할 때 ClickHouse가 읽으려는 위치는 사용 중인 ClickHouse의 변형에 따라 달라집니다.

[`clickhouse-local`](/operations/utilities/clickhouse-local.md)를 사용하는 경우 ClickHouse Local을 실행한 위치를 기준으로 상대적인 위치에서 읽습니다. ClickHouse Server 또는 `clickhouse client`를 통해 ClickHouse Cloud를 사용하는 경우 서버의 `/var/lib/clickhouse/user_files/` 디렉터리를 기준으로 상대적인 위치에서 읽습니다.
:::

## Parquet에서 가져오기 {#importing-from-parquet}

데이터를 로드하기 전에 [file()](/sql-reference/functions/files.md/#file) 함수를 사용하여 [예제 parquet 파일](assets/data.parquet) 구조를 탐색할 수 있습니다:

```sql
DESCRIBE TABLE file('data.parquet', Parquet);
```

두 번째 인자로 [Parquet](/interfaces/formats/Parquet)를 사용했으므로 ClickHouse는 파일 포맷을 인식합니다. 이는 타입이 있는 컬럼을 출력할 것입니다:

```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path │ Nullable(String) │              │                    │         │                  │                │
│ date │ Nullable(String) │              │                    │         │                  │                │
│ hits │ Nullable(Int64)  │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

실제로 데이터를 가져오기 전에 SQL의 모든 기능을 사용하여 파일을 탐색할 수 있습니다:

```sql
SELECT *
FROM file('data.parquet', Parquet)
LIMIT 3;
```
```response
┌─path──────────────────────┬─date───────┬─hits─┐
│ Akiba_Hebrew_Academy      │ 2017-08-01 │  241 │
│ Aegithina_tiphia          │ 2018-02-01 │   34 │
│ 1971-72_Utah_Stars_season │ 2016-10-01 │    1 │
└───────────────────────────┴────────────┴──────┘
```

:::tip
`file()`와 `INFILE`/`OUTFILE`에 대해 명시적 포맷 설정을 생략할 수 있습니다.
이 경우 ClickHouse는 파일 확장자를 기반으로 포맷을 자동으로 감지합니다.
:::

## 기존 테이블에 가져오기 {#importing-to-an-existing-table}

Parquet 데이터를 가져올 테이블을 생성해 보겠습니다:

```sql
CREATE TABLE sometable
(
    `path` String,
    `date` Date,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY (date, path);
```

이제 `FROM INFILE` 절을 사용하여 데이터를 가져올 수 있습니다:

```sql
INSERT INTO sometable
FROM INFILE 'data.parquet' FORMAT Parquet;

SELECT *
FROM sometable
LIMIT 5;
```
```response
┌─path──────────────────────────┬───────date─┬─hits─┐
│ 1988_in_philosophy            │ 2015-05-01 │   70 │
│ 2004_Green_Bay_Packers_season │ 2015-05-01 │  970 │
│ 24_hours_of_lemans            │ 2015-05-01 │   37 │
│ 25604_Karlin                  │ 2015-05-01 │   20 │
│ ASCII_ART                     │ 2015-05-01 │    9 │
└───────────────────────────────┴────────────┴──────┘
```

ClickHouse가 Parquet 문자열(의 `date` 컬럼)을 `Date` 타입으로 자동 변환하는 것을 주목하십시오. 이는 ClickHouse가 대상 테이블의 타입에 따라 자동으로 타입 변환을 수행하기 때문입니다.

## 원격 서버에 로컬 파일 삽입하기 {#inserting-a-local-file-to-remote-server}

로컬 Parquet 파일을 원격 ClickHouse 서버에 삽입하려면 다음과 같이 파일의 내용을 `clickhouse-client`로 파이프 처리할 수 있습니다:

```sql
clickhouse client -q "INSERT INTO sometable FORMAT Parquet" < data.parquet
```

## Parquet 파일로부터 새로운 테이블 생성하기 {#creating-new-tables-from-parquet-files}

ClickHouse는 Parquet 파일 스키마를 읽기 때문에 테이블을 즉시 생성할 수 있습니다:

```sql
CREATE TABLE imported_from_parquet
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('data.parquet', Parquet)
```

이는 주어진 parquet 파일에서 테이블을 자동으로 생성하고 채울 것입니다:

```sql
DESCRIBE TABLE imported_from_parquet;
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path │ Nullable(String) │              │                    │         │                  │                │
│ date │ Nullable(String) │              │                    │         │                  │                │
│ hits │ Nullable(Int64)  │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

기본적으로 ClickHouse는 컬럼 이름, 타입 및 값에 대해 엄격합니다. 그러나 경우에 따라 우리는 가져오는 동안 존재하지 않는 컬럼이나 지원되지 않는 값을 생략할 수 있습니다. 이는 [Parquet 설정](/interfaces/formats/Parquet#format-settings)을 통해 관리할 수 있습니다.

## Parquet 포맷으로 내보내기 {#exporting-to-parquet-format}

:::tip
ClickHouse Cloud에서 `INTO OUTFILE`를 사용할 때는 파일이 저장될 머신에서 `clickhouse client`에서 명령어를 실행해야 합니다.
:::

어떠한 테이블이나 쿼리 결과를 Parquet 파일로 내보내려면 `INTO OUTFILE` 절을 사용할 수 있습니다:

```sql
SELECT *
FROM sometable
INTO OUTFILE 'export.parquet'
FORMAT Parquet
```

이는 작업 디렉토리에 `export.parquet` 파일을 생성합니다.

## ClickHouse와 Parquet 데이터 타입 {#clickhouse-and-parquet-data-types}
ClickHouse와 Parquet 데이터 타입은 대부분 동일하지만 여전히 [약간의 차이점이 있습니다](/interfaces/formats/Parquet#data-types-matching-parquet). 예를 들어, ClickHouse는 `DateTime` 타입을 Parquet의 `int64`로 내보냅니다. 그 후 다시 ClickHouse에 가져올 경우 숫자를 볼 수 있습니다 ([time.parquet 파일](assets/time.parquet)):

```sql
SELECT * FROM file('time.parquet', Parquet);
```
```response
┌─n─┬───────time─┐
│ 0 │ 1673622611 │
│ 1 │ 1673622610 │
│ 2 │ 1673622609 │
│ 3 │ 1673622608 │
│ 4 │ 1673622607 │
└───┴────────────┘
```

이 경우 [타입 변환](/sql-reference/functions/type-conversion-functions.md)을 사용할 수 있습니다:

```sql
SELECT
    n,
    toDateTime(time)                 <--- int to time
FROM file('time.parquet', Parquet);
```
```response
┌─n─┬────toDateTime(time)─┐
│ 0 │ 2023-01-13 15:10:11 │
│ 1 │ 2023-01-13 15:10:10 │
│ 2 │ 2023-01-13 15:10:09 │
│ 3 │ 2023-01-13 15:10:08 │
│ 4 │ 2023-01-13 15:10:07 │
└───┴─────────────────────┘
```

## 추가 읽을거리 {#further-reading}

ClickHouse는 다양한 시나리오와 플랫폼을 다루기 위해 많은 포맷에 대한 지원을 도입했습니다. 다음 기사에서 다양한 포맷과 이를 작업하는 방법을 탐색해 보세요:

- [CSV 및 TSV 포맷](csv-tsv.md)
- [Avro, Arrow 및 ORC](arrow-avro-orc.md)
- [JSON 포맷](/integrations/data-ingestion/data-formats/json/intro.md)
- [정규 표현식 및 템플릿](templates-regex.md)
- [네이티브 및 바이너리 포맷](binary.md)
- [SQL 포맷](sql.md)

또한 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)를 확인해 보세요 - ClickHouse 서버 없이 로컬/원격 파일 작업을 위한 포터블 풀-기능 툴입니다.
