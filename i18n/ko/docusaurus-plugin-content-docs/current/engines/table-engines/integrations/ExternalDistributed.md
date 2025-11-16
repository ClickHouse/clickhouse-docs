---
'description': '`ExternalDistributed` 엔진은 원격 서버의 MySQL 또는 PostgreSQL에 저장된 데이터에 대해
  `SELECT` 쿼리를 수행할 수 있도록 합니다. 샤딩이 가능하도록 MySQL 또는 PostgreSQL 엔진을 인수로 허용합니다.'
'sidebar_label': 'ExternalDistributed'
'sidebar_position': 55
'slug': '/engines/table-engines/integrations/ExternalDistributed'
'title': 'ExternalDistributed 테이블 엔진'
'doc_type': 'reference'
---


# ExternalDistributed 테이블 엔진

`ExternalDistributed` 엔진은 원격 서버의 MySQL 또는 PostgreSQL에 저장된 데이터에 대해 `SELECT` 쿼리를 수행할 수 있게 해줍니다. 샤딩이 가능하도록 [MySQL](../../../engines/table-engines/integrations/mysql.md) 또는 [PostgreSQL](../../../engines/table-engines/integrations/postgresql.md) 엔진을 인수로 받아들입니다.

## 테이블 생성 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = ExternalDistributed('engine', 'host:port', 'database', 'table', 'user', 'password');
```

[CREATE TABLE](/sql-reference/statements/create/table) 쿼리에 대한 자세한 설명을 참조하십시오.

테이블 구조는 원래 테이블 구조와 다를 수 있습니다:

- 컬럼 이름은 원래 테이블과 같아야 하지만 이 컬럼들 중 일부만 사용하고 아무 순서로 사용할 수 있습니다.
- 컬럼 타입은 원래 테이블의 타입과 다를 수 있습니다. ClickHouse는 값을 ClickHouse 데이터 타입으로 [변환](https://clickhouse.com/docs/en/sql-reference/functions/type-conversion-functions#cast)하려고 시도합니다.

**엔진 매개변수**

- `engine` — 테이블 엔진 `MySQL` 또는 `PostgreSQL`.
- `host:port` — MySQL 또는 PostgreSQL 서버 주소.
- `database` — 원격 데이터베이스 이름.
- `table` — 원격 테이블 이름.
- `user` — 사용자 이름.
- `password` — 사용자 비밀번호.

## 구현 세부정보 {#implementation-details}

여러 복제본을 지원하며, 복제본은 `|`로 구분되어야 하고 샤드는 `,`로 구분되어야 합니다. 예를 들면:

```sql
CREATE TABLE test_shards (id UInt32, name String, age UInt32, money UInt32) ENGINE = ExternalDistributed('MySQL', `mysql{1|2}:3306,mysql{3|4}:3306`, 'clickhouse', 'test_replicas', 'root', 'clickhouse');
```

복제본을 지정할 때, 읽기 작업 시 각 샤드에 대해 사용 가능한 복제본 중 하나가 선택됩니다. 연결이 실패하면 다음 복제본이 선택되고, 모든 복제본에 대해 이와 같은 방식으로 반복됩니다. 모든 복제본에 대한 연결 시도가 실패하면 시도가 여러 번 반복됩니다.

각 샤드에 대해 임의의 수의 샤드와 복제본을 지정할 수 있습니다.

**참고**

- [MySQL 테이블 엔진](../../../engines/table-engines/integrations/mysql.md)
- [PostgreSQL 테이블 엔진](../../../engines/table-engines/integrations/postgresql.md)
- [분산 테이블 엔진](../../../engines/table-engines/special/distributed.md)
