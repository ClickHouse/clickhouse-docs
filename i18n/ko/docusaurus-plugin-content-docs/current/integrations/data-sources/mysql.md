---
'slug': '/integrations/mysql'
'sidebar_label': 'MySQL'
'title': 'MySQL'
'hide_title': true
'description': 'MySQL 통합을 설명하는 페이지'
'doc_type': 'reference'
'integration':
- 'support_level': 'core'
- 'category': 'data_ingestion'
- 'website': 'https://github.com/ClickHouse/clickhouse'
'keywords':
- 'mysql'
- 'database integration'
- 'external table'
- 'data source'
- 'sql database'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# MySQL과 ClickHouse 통합하기

이 페이지에서는 MySQL 테이블에서 읽기 위해 `MySQL` 테이블 엔진을 사용하는 방법을 다룹니다.

:::note
ClickHouse Cloud에서는 [MySQL ClickPipe](/integrations/clickpipes/mysql)를 사용하여 MySQL 테이블에서 ClickHouse로 쉽게 데이터를 이동할 수 있습니다. (현재 공개 베타 중입니다.)
:::

## MySQL 테이블 엔진을 사용하여 ClickHouse를 MySQL에 연결하기 {#connecting-clickhouse-to-mysql-using-the-mysql-table-engine}

`MySQL` 테이블 엔진을 사용하면 ClickHouse를 MySQL에 연결할 수 있습니다. **SELECT** 및 **INSERT** 문은 ClickHouse 또는 MySQL 테이블에서 수행할 수 있습니다. 이 문서에서는 `MySQL` 테이블 엔진을 사용하는 기본 방법을 설명합니다.

### 1. MySQL 구성하기 {#1-configure-mysql}

1. MySQL에서 데이터베이스를 생성합니다:
```sql
CREATE DATABASE db1;
```

2. 테이블을 생성합니다:
```sql
CREATE TABLE db1.table1 (
  id INT,
  column1 VARCHAR(255)
);
```

3. 샘플 행을 삽입합니다:
```sql
INSERT INTO db1.table1
  (id, column1)
VALUES
  (1, 'abc'),
  (2, 'def'),
  (3, 'ghi');
```

4. ClickHouse에서 연결할 사용자를 생성합니다:
```sql
CREATE USER 'mysql_clickhouse'@'%' IDENTIFIED BY 'Password123!';
```

5. 필요한 권한을 부여합니다. (시연 목적으로 `mysql_clickhouse` 사용자에게 관리자 권한이 부여됩니다.)
```sql
GRANT ALL PRIVILEGES ON *.* TO 'mysql_clickhouse'@'%';
```

:::note
ClickHouse Cloud에서 이 기능을 사용하는 경우, ClickHouse Cloud IP 주소가 MySQL 인스턴스에 접근할 수 있도록 허용해야 할 수 있습니다. egress 트래픽에 대한 자세한 내용은 ClickHouse [Cloud Endpoints API](//cloud/get-started/query-endpoints.md)를 확인하십시오.
:::

### 2. ClickHouse에서 테이블 정의하기 {#2-define-a-table-in-clickhouse}

1. 이제 `MySQL` 테이블 엔진을 사용하는 ClickHouse 테이블을 생성해 보겠습니다:
```sql
CREATE TABLE mysql_table1 (
  id UInt64,
  column1 String
)
ENGINE = MySQL('mysql-host.domain.com','db1','table1','mysql_clickhouse','Password123!')
```

최소 매개변수는 다음과 같습니다:

|parameter|설명                    |예시                  |
|---------|--------------------------|---------------------|
|host     |호스트명 또는 IP         |mysql-host.domain.com|
|database |mysql 데이터베이스 이름  |db1                  |
|table    |mysql 테이블 이름       |table1               |
|user     |mysql에 연결할 사용자 이름|mysql_clickhouse     |
|password |mysql에 연결할 비밀번호  |Password123!         |

:::note
매개변수의 전체 목록은 [MySQL 테이블 엔진](/engines/table-engines/integrations/mysql.md) 문서 페이지를 참조하십시오.
:::

### 3. 통합 테스트하기 {#3-test-the-integration}

1. MySQL에서 샘플 행을 삽입합니다:
```sql
INSERT INTO db1.table1
  (id, column1)
VALUES
  (4, 'jkl');
```

2. MySQL 테이블에서 기존 행이 ClickHouse 테이블에 표시되고, 방금 추가한 새 행도 함께 나타나는 것을 확인합니다:
```sql
SELECT
    id,
    column1
FROM mysql_table1
```

4개의 행이 표시되어야 합니다:
```response
Query id: 6d590083-841e-4e95-8715-ef37d3e95197

┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
│  3 │ ghi     │
│  4 │ jkl     │
└────┴─────────┘

4 rows in set. Elapsed: 0.044 sec.
```

3. ClickHouse 테이블에 행을 추가해 보겠습니다:
```sql
INSERT INTO mysql_table1
  (id, column1)
VALUES
  (5,'mno')
```

4. MySQL에서 새 행이 나타나는지 확인합니다:
```bash
mysql> select id,column1 from db1.table1;
```

새 행이 표시되어야 합니다:
```response
+------+---------+
| id   | column1 |
+------+---------+
|    1 | abc     |
|    2 | def     |
|    3 | ghi     |
|    4 | jkl     |
|    5 | mno     |
+------+---------+
5 rows in set (0.01 sec)
```

### 요약 {#summary}

`MySQL` 테이블 엔진을 사용하면 ClickHouse를 MySQL에 연결하여 데이터를 서로 교환할 수 있습니다. 자세한 내용은 [MySQL 테이블 엔진](/sql-reference/table-functions/mysql.md) 문서 페이지를 확인하시기 바랍니다.
