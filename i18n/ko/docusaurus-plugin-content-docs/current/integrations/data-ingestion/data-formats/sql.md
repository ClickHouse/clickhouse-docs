---
'sidebar_label': 'SQL 덤프'
'slug': '/integrations/data-formats/sql'
'title': 'ClickHouse에서 SQL 데이터를 삽입하고 덤프하기'
'description': '다른 데이터베이스와 ClickHouse 간에 SQL 덤프를 사용하여 데이터를 전송하는 방법을 설명하는 페이지입니다.'
'doc_type': 'guide'
'keywords':
- 'sql format'
- 'data export'
- 'data import'
- 'backup'
- 'sql dumps'
---


# ClickHouse에 SQL 데이터 삽입 및 덤프

ClickHouse는 OLTP 데이터베이스 인프라에 여러 가지 방법으로 쉽게 통합될 수 있습니다. 그 중 한 가지 방법은 SQL 덤프를 사용하여 다른 데이터베이스와 ClickHouse 간에 데이터를 전송하는 것입니다.

## SQL 덤프 생성 {#creating-sql-dumps}

데이터는 [SQLInsert](/interfaces/formats/SQLInsert)를 사용하여 SQL 형식으로 덤프될 수 있습니다. ClickHouse는 데이터를 `INSERT INTO <table name> VALUES(...` 형식으로 작성하고 [`output_format_sql_insert_table_name`](/operations/settings/settings-formats.md/#output_format_sql_insert_table_name) 설정 옵션을 테이블 이름으로 사용합니다:

```sql
SET output_format_sql_insert_table_name = 'some_table';
SELECT * FROM some_data
INTO OUTFILE 'dump.sql'
FORMAT SQLInsert
```

컬럼 이름은 [`output_format_sql_insert_include_column_names`](/operations/settings/settings-formats.md/#output_format_sql_insert_include_column_names) 옵션을 비활성화하여 생략할 수 있습니다:

```sql
SET output_format_sql_insert_include_column_names = 0
```

이제 [dump.sql](assets/dump.sql) 파일을 다른 OLTP 데이터베이스에 공급할 수 있습니다:

```bash
mysql some_db < dump.sql
```

`some_db` MySQL 데이터베이스에 `some_table` 테이블이 존재한다고 가정합니다.

일부 DBMS는 단일 배치 내에서 처리할 수 있는 값의 수에 제한을 둘 수 있습니다. 기본적으로 ClickHouse는 65,000 값 배치를 생성하지만, 이는 [`output_format_sql_insert_max_batch_size`](/operations/settings/settings-formats.md/#output_format_sql_insert_max_batch_size) 옵션으로 변경할 수 있습니다:

```sql
SET output_format_sql_insert_max_batch_size = 1000;
```

### 값 집합 내보내기 {#exporting-a-set-of-values}

ClickHouse는 [Values](/interfaces/formats/Values) 형식을 지원하는데, 이는 SQLInsert와 유사하지만 `INSERT INTO table VALUES` 부분을 생략하고 값의 집합만 반환합니다:

```sql
SELECT * FROM some_data LIMIT 3 FORMAT Values
```
```response
('Bangor_City_Forest','2015-07-01',34),('Alireza_Afzal','2017-02-01',24),('Akhaura-Laksam-Chittagong_Line','2015-09-01',30)
```

## SQL 덤프에서 데이터 삽입 {#inserting-data-from-sql-dumps}

SQL 덤프를 읽기 위해 [MySQLDump](/interfaces/formats/MySQLDump)가 사용됩니다:

```sql
SELECT *
FROM file('dump.sql', MySQLDump)
LIMIT 5
```
```response
┌─path───────────────────────────┬──────month─┬─hits─┐
│ Bangor_City_Forest             │ 2015-07-01 │   34 │
│ Alireza_Afzal                  │ 2017-02-01 │   24 │
│ Akhaura-Laksam-Chittagong_Line │ 2015-09-01 │   30 │
│ 1973_National_500              │ 2017-10-01 │   80 │
│ Attachment                     │ 2017-09-01 │ 1356 │
└────────────────────────────────┴────────────┴──────┘
```

기본적으로 ClickHouse는 알려지지 않은 컬럼을 건너뛰고 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 옵션에 따라 처리하며, 덤프에서 찾은 첫 번째 테이블에 대해 데이터를 처리합니다 (여러 테이블이 단일 파일로 덤프된 경우). DDL 문은 건너뜁니다. MySQL 덤프에서 테이블로 데이터를 로드하려면 ([mysql.sql](assets/mysql.sql) 파일):

```sql
INSERT INTO some_data
FROM INFILE 'mysql.sql' FORMAT MySQLDump
```

또한 MySQL 덤프 파일에서 자동으로 테이블을 생성할 수 있습니다:

```sql
CREATE TABLE table_from_mysql
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('mysql.sql', MySQLDump)
```

여기서 ClickHouse가 자동으로 유추한 구조를 기반으로 `table_from_mysql`라는 테이블을 생성했습니다. ClickHouse는 데이터를 기반으로 유형을 감지하거나 사용할 수 있는 경우 DDL을 사용합니다:

```sql
DESCRIBE TABLE table_from_mysql;
```
```response
┌─name──┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path  │ Nullable(String) │              │                    │         │                  │                │
│ month │ Nullable(Date32) │              │                    │         │                  │                │
│ hits  │ Nullable(UInt32) │              │                    │         │                  │                │
└───────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

## 기타 형식 {#other-formats}

ClickHouse는 다양한 시나리오와 플랫폼을 다루기 위해 많은 텍스트 및 이진 형식에 대한 지원을 도입합니다. 다음 문서에서 더 많은 형식과 작업 방법을 탐색해 보십시오:

- [CSV 및 TSV 형식](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON 형식](/integrations/data-ingestion/data-formats/json/intro.md)
- [정규 표현식 및 템플릿](templates-regex.md)
- [네이티브 및 이진 형식](binary.md)
- **SQL 형식**

그리고 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)도 확인해 보십시오 - ClickHouse 서버 없이도 로컬/원격 파일에서 작업할 수 있는 휴대 가능한 풀 기능 도구입니다.
