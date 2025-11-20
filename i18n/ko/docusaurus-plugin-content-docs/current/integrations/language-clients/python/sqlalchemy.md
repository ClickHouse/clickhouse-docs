---
'sidebar_label': 'SQLAlchemy'
'sidebar_position': 7
'keywords':
- 'clickhouse'
- 'python'
- 'sqlalchemy'
- 'integrate'
'description': 'ClickHouse SQLAlchemy 지원'
'slug': '/integrations/language-clients/python/sqlalchemy'
'title': 'SQLAlchemy 지원'
'doc_type': 'reference'
---

ClickHouse Connect는 핵심 드라이버 위에 구축된 SQLAlchemy 방언(`clickhousedb`)을 포함합니다. 이는 SQLAlchemy Core APIs를 대상으로 하며 SQLAlchemy 1.4.40+ 및 2.0.x를 지원합니다.

## SQLAlchemy로 연결하기 {#sqlalchemy-connect}

`clickhousedb://` 또는 `clickhousedb+connect://` URL을 사용하여 엔진을 생성합니다. 쿼리 매개변수는 ClickHouse 설정, 클라이언트 옵션 및 HTTP/TLS 전송 옵션에 매핑됩니다.

```python
from sqlalchemy import create_engine, text

engine = create_engine(
    "clickhousedb://user:password@host:8123/mydb?compression=zstd"
)

with engine.begin() as conn:
    rows = conn.execute(text("SELECT version()"))
    print(rows.scalar())
```

URL/쿼리 매개변수에 대한 참고 사항:
- ClickHouse 설정: 쿼리 매개변수로 전달 (예: `use_skip_indexes=0`).
- 클라이언트 옵션: `compression` (alias for `compress`), `query_limit`, timeouts 등.
- HTTP/TLS 옵션: HTTP 풀 및 TLS용 옵션 (예: `ch_http_max_field_name_size=99999`, `ca_cert=certifi`).

지원되는 옵션의 전체 목록은 아래 섹션의 [연결 인수 및 설정](driver-api.md#connection-arguments)을 참조하세요. 이러한 옵션은 SQLAlchemy DSN을 통해서도 제공될 수 있습니다.

## Core 쿼리 {#sqlalchemy-core-queries}

이 방언은 조인, 필터링, 정렬, 한계/오프셋 및 `DISTINCT`가 포함된 SQLAlchemy Core `SELECT` 쿼리를 지원합니다.

```python
from sqlalchemy import MetaData, Table, select

metadata = MetaData(schema="mydb")
users = Table("users", metadata, autoload_with=engine)
orders = Table("orders", metadata, autoload_with=engine)


# Basic SELECT
with engine.begin() as conn:
    rows = conn.execute(select(users.c.id, users.c.name).order_by(users.c.id).limit(10)).fetchall()


# JOINs (INNER/LEFT OUTER/FULL OUTER/CROSS)
with engine.begin() as conn:
    stmt = (
        select(users.c.name, orders.c.product)
        .select_from(users.join(orders, users.c.id == orders.c.user_id))
    )
    rows = conn.execute(stmt).fetchall()
```

필수 `WHERE` 절이 있는 경량 `DELETE`가 지원됩니다:

```python
from sqlalchemy import delete

with engine.begin() as conn:
    conn.execute(delete(users).where(users.c.name.like("%temp%")))
```

## DDL 및 반영 {#sqlalchemy-ddl-reflection}

제공된 DDL 도우미 및 유형/엔진 구조를 사용하여 데이터베이스 및 테이블을 생성할 수 있습니다. 테이블 반영(컬럼 유형 및 엔진 포함)이 지원됩니다.

```python
import sqlalchemy as db
from sqlalchemy import MetaData
from clickhouse_connect.cc_sqlalchemy.ddl.custom import CreateDatabase, DropDatabase
from clickhouse_connect.cc_sqlalchemy.ddl.tableengine import MergeTree
from clickhouse_connect.cc_sqlalchemy.datatypes.sqltypes import UInt32, String, DateTime64

with engine.begin() as conn:
    # Databases
    conn.execute(CreateDatabase("example_db", exists_ok=True))

    # Tables
    metadata = MetaData(schema="example_db")
    table = db.Table(
        "events",
        metadata,
        db.Column("id", UInt32, primary_key=True),
        db.Column("user", String),
        db.Column("created_at", DateTime64(3)),
        MergeTree(order_by="id"),
    )
    table.create(conn)

    # Reflection
    reflected = db.Table("events", metadata, autoload_with=engine)
    assert reflected.engine is not None
```

반영된 컬럼에는 서버에 존재할 경우 `clickhousedb_default_type`, `clickhousedb_codec_expression`, 및 `clickhousedb_ttl_expression`와 같은 방언별 속성이 포함됩니다.

## Inserts (Core 및 기본 ORM) {#sqlalchemy-inserts}

Insert는 SQLAlchemy Core와 간단한 ORM 모델을 통해 편의성을 위해 작동합니다.

```python

# Core insert
with engine.begin() as conn:
    conn.execute(table.insert().values(id=1, user="joe"))


# Basic ORM insert
from sqlalchemy.orm import declarative_base, Session

Base = declarative_base(metadata=MetaData(schema="example_db"))

class User(Base):
    __tablename__ = "users"
    __table_args__ = (MergeTree(order_by=["id"]),)
    id = db.Column(UInt32, primary_key=True)
    name = db.Column(String)

Base.metadata.create_all(engine)

with Session(engine) as session:
    session.add(User(id=1, name="Alice"))
    session.bulk_save_objects([User(id=2, name="Bob")])
    session.commit()
```

## 범위 및 제한 사항 {#scope-and-limitations}
- 코어 초점: `SELECT`와 `JOIN`(`INNER`, `LEFT OUTER`, `FULL OUTER`, `CROSS`), `WHERE`, `ORDER BY`, `LIMIT`/`OFFSET`, 및 `DISTINCT`와 같은 SQLAlchemy Core 기능을 활성화합니다.
- `WHERE`가 포함된 `DELETE`만 지원: 이 방언은 경량 `DELETE`를 지원하지만 우발적인 전체 테이블 삭제를 피하기 위해 명시적인 `WHERE` 절이 필요합니다. 테이블을 비우려면 `TRUNCATE TABLE`을 사용하세요.
- `UPDATE` 없음: ClickHouse는 추가 최적화되어 있습니다. 이 방언은 `UPDATE`를 구현하지 않습니다. 데이터를 변경해야 하는 경우 데이터를 변환하고 다시 삽입하거나 위험을 감수하고 명시적 텍스트 SQL(예: `ALTER TABLE ... UPDATE`)을 사용하세요.
- DDL 및 반영: 데이터베이스 및 테이블 생성이 지원되며, 반영은 컬럼 유형 및 테이블 엔진 메타데이터를 반환합니다. 전통적인 PK/FK/인덱스 메타데이터는 ClickHouse가 이러한 제약 조건을 강제하지 않기 때문에 존재하지 않습니다.
- ORM 범위: 선언적 모델 및 `Session.add(...)`/`bulk_save_objects(...)`를 통한 삽입은 편의를 위해 작동합니다. 고급 ORM 기능(관계 관리, 작업 단위 업데이트, 캐스케이딩, 선행/지연 로딩 의미론)은 지원되지 않습니다.
- 기본 키 의미: `Column(..., primary_key=True)`는 SQLAlchemy에서 객체 식별성으로만 사용됩니다. ClickHouse에서 서버 측 제약 조건을 생성하지 않습니다. 테이블 엔진을 통해 `ORDER BY`(및 선택적 `PRIMARY KEY`)를 정의하세요(예: `MergeTree(order_by=...)`).
- 트랜잭션 및 서버 기능: 2단계 트랜잭션, 시퀀스, `RETURNING` 및 고급 격리 수준은 지원되지 않습니다. `engine.begin()`은 구문 그룹화를 위한 Python 컨텍스트 관리자를 제공하지만 실제 트랜잭션 제어(커밋/롤백)는 수행하지 않습니다(아무 작업도 수행하지 않음).
