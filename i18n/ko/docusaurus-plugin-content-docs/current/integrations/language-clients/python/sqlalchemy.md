---
sidebar_label: 'SQLAlchemy'
sidebar_position: 7
keywords: ['clickhouse', 'python', 'sqlalchemy', 'integrate']
description: 'ClickHouse SQLAlchemy 지원'
slug: /integrations/language-clients/python/sqlalchemy
title: 'SQLAlchemy 지원'
doc_type: 'reference'
---

ClickHouse Connect에는 코어 드라이버를 기반으로 구현된 SQLAlchemy dialect(`clickhousedb`)가 포함되어 있습니다. 이 dialect는 SQLAlchemy Core API를 위해 설계되었으며 SQLAlchemy 1.4.40+ 및 2.0.x를 지원합니다.

## SQLAlchemy로 연결 \{#sqlalchemy-connect\}

엔진을 생성할 때는 `clickhousedb://` 또는 `clickhousedb+connect://` URL을 사용하십시오. 쿼리 매개변수는 ClickHouse 설정, 클라이언트 옵션, HTTP/TLS 전송 옵션에 매핑됩니다.

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

* ClickHouse 설정: 쿼리 매개변수로 전달합니다(예: `use_skip_indexes=0`).
* 클라이언트 옵션: `compression`(`compress`의 별칭), `query_limit`, 타임아웃 등.
* HTTP/TLS 옵션: HTTP 풀 및 TLS에 대한 옵션(예: `ch_http_max_field_name_size=99999`, `ca_cert=certifi`).

지원되는 옵션의 전체 목록은 아래 섹션의 [Connection arguments and Settings](driver-api.md#connection-arguments)를 참조하십시오. 이러한 옵션은 SQLAlchemy DSN을 통해서도 전달할 수 있습니다.


## 핵심 쿼리 \{#sqlalchemy-core-queries\}

이 방언은 조인, 필터, 정렬, LIMIT/OFFSET 및 `DISTINCT`를 포함한 SQLAlchemy Core `SELECT` 쿼리를 지원합니다.

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

필수 `WHERE` 절을 사용하는 경량 `DELETE`가 지원됩니다:

```python
from sqlalchemy import delete

with engine.begin() as conn:
    conn.execute(delete(users).where(users.c.name.like("%temp%")))
```


## DDL 및 리플렉션 \{#sqlalchemy-ddl-reflection\}

제공되는 DDL 헬퍼와 타입/엔진 구성체를 사용하여 데이터베이스와 테이블을 생성할 수 있습니다. 컬럼 타입과 엔진을 포함한 테이블 리플렉션을 지원합니다.

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

반영된 컬럼에는 서버에 해당 속성이 정의되어 있는 경우 `clickhousedb_default_type`, `clickhousedb_codec_expression`, `clickhousedb_ttl_expression`과 같은 dialect별 속성이 포함됩니다.


## Insert(코어 및 기본 ORM) \{#sqlalchemy-inserts\}

Insert 작업은 편의를 위해 SQLAlchemy Core와 기본 ORM 모델을 사용하여 수행할 수 있습니다.

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


## 범위 및 한계 \{#scope-and-limitations\}

- 핵심 범위: `SELECT`와 `JOIN`(`INNER`, `LEFT OUTER`, `FULL OUTER`, `CROSS`), `WHERE`, `ORDER BY`, `LIMIT`/`OFFSET`, `DISTINCT` 등 SQLAlchemy Core 기능을 사용할 수 있도록 하는 데 중점을 둡니다.
- `WHERE`가 있는 `DELETE`만 지원: 이 다이얼렉트는 경량 `DELETE`를 지원하지만, 실수로 전체 테이블이 삭제되는 것을 방지하기 위해 반드시 명시적인 `WHERE` 절이 필요합니다. 테이블 내용을 모두 삭제하려면 `TRUNCATE TABLE`을 사용하십시오.
- `UPDATE` 미지원: ClickHouse는 추가(append)에 최적화되어 있습니다. 이 다이얼렉트는 `UPDATE`를 구현하지 않습니다. 데이터를 변경해야 하는 경우 상위 단계에서 변환을 적용한 뒤 다시 삽입하거나, `ALTER TABLE ... UPDATE`와 같은 SQL 텍스트를 직접 사용해야 하며, 이때 발생하는 책임은 전적으로 사용자에게 있습니다.
- DDL 및 리플렉션(reflection): 데이터베이스 및 테이블 생성을 지원하며, 리플렉션을 통해 컬럼 타입과 테이블 엔진 메타데이터를 반환합니다. ClickHouse는 이러한 제약 조건을 강제하지 않으므로, 전통적인 PK/FK/인덱스 메타데이터는 존재하지 않습니다.
- ORM 범위: 선언적 모델과 `Session.add(...)`/`bulk_save_objects(...)`를 통한 INSERT는 편의 기능 수준에서 동작합니다. 고급 ORM 기능(relationship 관리, unit-of-work 기반 업데이트, 캐스케이딩, eager/lazy 로딩 의미론)은 지원되지 않습니다.
- 기본 키 의미론: `Column(..., primary_key=True)`는 SQLAlchemy에서 객체 식별용으로만 사용됩니다. ClickHouse 서버 측 제약 조건을 생성하지 않습니다. `ORDER BY`(및 선택적인 `PRIMARY KEY`)는 테이블 엔진(예: `MergeTree(order_by=...)`)을 통해 정의하십시오.
- 트랜잭션 및 서버 기능: 2단계 트랜잭션, 시퀀스, `RETURNING`, 고급 격리 수준은 지원되지 않습니다. `engine.begin()`은 SQL 문을 그룹화하기 위한 Python 컨텍스트 매니저를 제공하지만 실제 트랜잭션 제어는 수행하지 않으며(커밋/롤백은 아무 동작도 하지 않습니다).