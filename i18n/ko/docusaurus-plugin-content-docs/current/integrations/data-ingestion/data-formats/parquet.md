---
sidebar_label: 'Parquet'
sidebar_position: 3
slug: /integrations/data-formats/parquet
title: 'ClickHouse에서 Parquet 다루기'
description: 'ClickHouse에서 Parquet를 다루는 방법을 설명하는 페이지'
doc_type: 'guide'
keywords: ['parquet', '컬럼형 포맷', '데이터 포맷', '압축', 'apache parquet']
---



# ClickHouse에서 Parquet 사용하기 \{#working-with-parquet-in-clickhouse\}

Parquet는 데이터를 컬럼 지향 방식으로 저장하기 위한 효율적인 파일 형식입니다.
ClickHouse는 Parquet 파일을 읽고 쓰는 기능을 모두 제공합니다.

:::tip
쿼리에서 파일 경로를 참조할 때 ClickHouse가 실제로 어느 위치에서 데이터를 읽으려고 하는지는 사용 중인 ClickHouse의 종류에 따라 달라집니다.

[`clickhouse-local`](/operations/utilities/clickhouse-local.md)을(를) 사용하는 경우 ClickHouse Local을 실행한 위치를 기준으로 한 경로에서 데이터를 읽습니다.
`clickhouse client`를 통해 ClickHouse Server 또는 ClickHouse Cloud를 사용하는 경우 서버의 `/var/lib/clickhouse/user_files/` 디렉터리를 기준으로 한 경로에서 데이터를 읽습니다.
:::



## Parquet에서 가져오기 \{#importing-from-parquet\}

데이터를 로드하기 전에 [file()](/sql-reference/functions/files.md/#file) 함수를 사용하여 [예제 Parquet 파일](assets/data.parquet)의 구조를 살펴볼 수 있습니다.

```sql
DESCRIBE TABLE file('data.parquet', Parquet);
```

두 번째 인수로 [Parquet](/interfaces/formats/Parquet)을(를) 사용하여 ClickHouse에 파일 포맷을 알려 주었습니다. 그러면 컬럼과 해당 데이터 타입이 출력됩니다:

```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path │ Nullable(String) │              │                    │         │                  │                │
│ date │ Nullable(String) │              │                    │         │                  │                │
│ hits │ Nullable(Int64)  │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

실제로 데이터를 가져오기 전에 SQL의 강력한 기능을 활용해 파일을 미리 살펴볼 수도 있습니다:

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
`file()` 및 `INFILE`/`OUTFILE`에 대해서는 명시적으로 형식을 설정하지 않아도 됩니다.
이 경우 ClickHouse는 파일 확장자를 기준으로 형식을 자동으로 감지합니다.
:::


## 기존 테이블로 데이터 가져오기 \{#importing-to-an-existing-table\}

Parquet 데이터를 가져올 테이블을 생성합니다:

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

ClickHouse가 Parquet 문자열(`date` 컬럼)을 `Date` 타입으로 자동 변환한 점에 주목하십시오. 이는 ClickHouse가 대상 테이블의 타입에 따라 자동으로 타입 캐스팅을 수행하기 때문입니다.


## 로컬 파일을 원격 서버에 삽입하기 \{#inserting-a-local-file-to-remote-server\}

로컬 Parquet 파일을 원격 ClickHouse 서버에 삽입하려면 아래와 같이 파일의 내용을 `clickhouse-client`에 파이프로 전달하여 수행할 수 있습니다.

```sql
clickhouse client -q "INSERT INTO sometable FORMAT Parquet" < data.parquet
```


## Parquet 파일에서 새 테이블 생성 \{#creating-new-tables-from-parquet-files\}

ClickHouse가 Parquet 파일의 스키마를 읽기 때문에 즉석에서 테이블을 생성할 수 있습니다:

```sql
CREATE TABLE imported_from_parquet
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('data.parquet', Parquet)
```

이 명령은 지정한 Parquet 파일에서 테이블을 자동으로 생성하고 데이터를 채웁니다.

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

기본적으로 ClickHouse는 컬럼 이름, 타입, 값에 대해 엄격하게 처리합니다. 그러나 경우에 따라 가져오기 과정에서 존재하지 않는 컬럼이나 지원되지 않는 값을 건너뛸 수 있습니다. 이는 [Parquet 설정](/interfaces/formats/Parquet#format-settings)으로 관리할 수 있습니다.


## Parquet 형식으로 내보내기 \{#exporting-to-parquet-format\}

:::tip
ClickHouse Cloud에서 `INTO OUTFILE`을 사용할 때는 파일이 생성될 머신에서 `clickhouse client`로 명령을 실행해야 합니다.
:::

임의의 테이블이나 쿼리 결과를 Parquet 파일로 내보내려면 `INTO OUTFILE` 절을 사용할 수 있습니다:

```sql
SELECT *
FROM sometable
INTO OUTFILE 'export.parquet'
FORMAT Parquet
```

이 명령을 실행하면 작업 디렉터리에 `export.parquet` 파일이 생성됩니다.


## ClickHouse 및 Parquet 데이터 유형 \{#clickhouse-and-parquet-data-types\}

ClickHouse 및 Parquet 데이터 유형은 대부분 동일하지만 [일부 차이가 있습니다](/interfaces/formats/Parquet#data-types-matching-parquet). 예를 들어, ClickHouse는 `DateTime` 유형을 Parquet의 `int64`로 내보냅니다. 그런 다음 이를 ClickHouse로 다시 가져오면 숫자만 보이게 됩니다([time.parquet 파일](assets/time.parquet)):

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

이 경우 [type conversion](/sql-reference/functions/type-conversion-functions.md)을 사용할 수 있습니다:

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


## 추가 읽을거리 \{#further-reading\}

ClickHouse는 다양한 시나리오와 플랫폼을 지원하기 위해 텍스트 및 바이너리 형식을 포함한 여러 포맷을 지원합니다. 다음 문서에서 더 많은 포맷과 활용 방법을 살펴보십시오:

- [CSV 및 TSV 포맷](csv-tsv.md)
- [Avro, Arrow 및 ORC](arrow-avro-orc.md)
- [JSON 포맷](/integrations/data-ingestion/data-formats/json/intro.md)
- [Regex 및 템플릿](templates-regex.md)
- [네이티브 및 바이너리 포맷](binary.md)
- [SQL 포맷](sql.md)

또한 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)도 확인하십시오. ClickHouse 서버 없이 로컬/원격 파일을 다룰 수 있는 이식 가능한 풀 기능 도구입니다.
