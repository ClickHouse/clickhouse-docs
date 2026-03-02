---
sidebar_label: 'SQL 덤프'
slug: /integrations/data-formats/sql
title: 'ClickHouse에서 SQL 데이터를 삽입 및 덤프하기'
description: 'SQL 덤프를 사용하여 다른 데이터베이스와 ClickHouse 간에 데이터를 전송하는 방법을 설명하는 페이지입니다.'
doc_type: 'guide'
keywords: ['SQL 형식', '데이터 내보내기', '데이터 가져오기', '백업', 'SQL 덤프']
---



# ClickHouse에서 SQL 데이터 삽입 및 덤프 \{#inserting-and-dumping-sql-data-in-clickhouse\}

ClickHouse는 다양한 방식으로 OLTP 데이터베이스 인프라에 쉽게 통합할 수 있습니다. 한 가지 방법은 SQL 덤프를 사용해 다른 데이터베이스와 ClickHouse 간에 데이터를 전송하는 것입니다.



## SQL 덤프 생성 \{#creating-sql-dumps\}

[SQLInsert](/interfaces/formats/SQLInsert)를 사용하여 데이터를 SQL 형식으로 덤프할 수 있습니다. ClickHouse는 데이터를 `INSERT INTO <table name> VALUES(...` 형태로 출력하며, 테이블 이름으로 [`output_format_sql_insert_table_name`](/operations/settings/settings-formats.md/#output_format_sql_insert_table_name) 설정 옵션을 사용합니다:

```sql
SET output_format_sql_insert_table_name = 'some_table';
SELECT * FROM some_data
INTO OUTFILE 'dump.sql'
FORMAT SQLInsert
```

[`output_format_sql_insert_include_column_names`](/operations/settings/settings-formats.md/#output_format_sql_insert_include_column_names) 옵션을 비활성화하면 컬럼 이름을 생략할 수 있습니다:

```sql
SET output_format_sql_insert_include_column_names = 0
```

이제 [dump.sql](assets/dump.sql) 파일을 다른 OLTP 데이터베이스에 로드할 수 있습니다:

```bash
mysql some_db < dump.sql
```

`some_db` MySQL 데이터베이스에 `some_table` 테이블이 존재한다고 가정합니다.

일부 DBMS는 단일 배치에서 처리할 수 있는 값의 수에 제한이 있을 수 있습니다. 기본적으로 ClickHouse는 65k개의 값으로 구성된 배치를 생성하지만, 이는 [`output_format_sql_insert_max_batch_size`](/operations/settings/settings-formats.md/#output_format_sql_insert_max_batch_size) 옵션으로 변경할 수 있습니다.

```sql
SET output_format_sql_insert_max_batch_size = 1000;
```

### 값 집합 내보내기 \{#exporting-a-set-of-values\}

ClickHouse에는 [Values](/interfaces/formats/Values) 형식이 있으며, 이는 SQL INSERT 구문과 비슷하지만 `INSERT INTO table VALUES` 부분은 생략하고 값들만으로 구성된 집합만을 반환합니다:

```sql
SELECT * FROM some_data LIMIT 3 FORMAT Values
```

```response
('Bangor_City_Forest','2015-07-01',34),('Alireza_Afzal','2017-02-01',24),('Akhaura-Laksam-Chittagong_Line','2015-09-01',30)
```


## SQL 덤프에서 데이터 삽입하기 \{#inserting-data-from-sql-dumps\}

SQL 덤프를 읽을 때는 [MySQLDump](/interfaces/formats/MySQLDump)를 사용합니다.

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

기본적으로 ClickHouse는 알 수 없는 컬럼을 건너뜁니다([input&#95;format&#95;skip&#95;unknown&#95;fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 옵션으로 제어됨). 또한 덤프에서 처음 발견된 테이블의 데이터만 처리합니다(여러 테이블이 단일 파일로 덤프된 경우). DDL SQL 문은 처리하지 않습니다. MySQL 덤프에서 테이블로 데이터를 적재하려면([mysql.sql](assets/mysql.sql) 파일):

```sql
INSERT INTO some_data
FROM INFILE 'mysql.sql' FORMAT MySQLDump
```

또한 MySQL 덤프 파일에서 테이블을 자동으로 생성할 수도 있습니다:

```sql
CREATE TABLE table_from_mysql
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('mysql.sql', MySQLDump)
```

여기서는 ClickHouse가 자동으로 추론한 구조를 기반으로 `table_from_mysql`라는 테이블을 생성했습니다. ClickHouse는 데이터에 따라 데이터 타입을 자동으로 판별하거나, DDL이 제공되는 경우 해당 DDL을 사용합니다:

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


## 기타 포맷 \{#other-formats\}

ClickHouse는 다양한 시나리오와 플랫폼을 지원하기 위해 텍스트 및 바이너리 형식을 포함한 여러 포맷을 지원합니다. 다음 문서에서 더 많은 포맷과 이를 사용하는 방법을 살펴보십시오:

- [CSV 및 TSV 포맷](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON 포맷](/integrations/data-ingestion/data-formats/json/intro.md)
- [Regex 및 템플릿](templates-regex.md)
- [네이티브 및 바이너리 포맷](binary.md)
- **SQL 포맷**

또한 ClickHouse 서버 없이 로컬/원격 파일로 작업할 수 있는 휴대용 완전 기능 도구인 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)도 확인하십시오.
