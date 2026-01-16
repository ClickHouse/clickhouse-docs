---
sidebar_label: 'SQLAlchemy'
sidebar_position: 7
keywords: ['clickhouse', 'python', 'sqlalchemy', 'integrate']
description: 'ClickHouse SQLAlchemy 支持'
slug: /integrations/language-clients/python/sqlalchemy
title: 'SQLAlchemy 支持'
doc_type: 'reference'
---

ClickHouse Connect 包含一个基于核心驱动程序构建的 SQLAlchemy 方言（`clickhousedb`）。它面向 SQLAlchemy Core API，并支持 SQLAlchemy 1.4.40+ 和 2.0.x。

## 使用 SQLAlchemy 连接 \\{#sqlalchemy-connect\\}

使用 `clickhousedb://` 或 `clickhousedb+connect://` URL 创建 Engine。URL 查询参数会映射为 ClickHouse 设置、客户端选项以及 HTTP/TLS 传输选项。

```python
from sqlalchemy import create_engine, text

engine = create_engine(
    "clickhousedb://user:password@host:8123/mydb?compression=zstd"
)

with engine.begin() as conn:
    rows = conn.execute(text("SELECT version()"))
    print(rows.scalar())
```

关于 URL/查询参数的说明：

* ClickHouse 设置：通过查询参数传入（例如，`use_skip_indexes=0`）。
* 客户端参数：`compression`（`compress` 的别名）、`query_limit`、超时设置等。
* HTTP/TLS 参数：HTTP 连接池和 TLS 的相关参数（例如，`ch_http_max_field_name_size=99999`、`ca_cert=certifi`）。

在下文的 [Connection arguments and Settings](driver-api.md#connection-arguments) 一节可以查看支持参数的完整列表。这些参数也可以通过 SQLAlchemy DSN 进行配置。

## 核心查询 \\{#sqlalchemy-core-queries\\}

该方言支持 SQLAlchemy Core 的 `SELECT` 查询，包括联接、过滤、排序、限制/偏移以及 `DISTINCT`。

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

支持轻量级 `DELETE`，且要求必须包含 `WHERE` 子句：

```python
from sqlalchemy import delete

with engine.begin() as conn:
    conn.execute(delete(users).where(users.c.name.like("%temp%")))
```

## DDL 和反射 \\{#sqlalchemy-ddl-reflection\\}

你可以使用提供的 DDL 辅助工具以及类型/引擎构造器来创建数据库和表。支持对表进行反射（包括列类型和引擎）。

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

如果服务器上存在这些属性，则反射出的列会包含方言特定的属性，例如 `clickhousedb_default_type`、`clickhousedb_codec_expression` 和 `clickhousedb_ttl_expression`。

## 插入（Core 和基础 ORM） \\{#sqlalchemy-inserts\\}

插入既可以通过 SQLAlchemy Core 实现，也可以为方便起见使用简单的 ORM 模型来完成。

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

## 范围和限制 \\{#scope-and-limitations\\}

- 核心重点：支持 SQLAlchemy Core 功能，例如带有 `JOIN`（`INNER`、`LEFT OUTER`、`FULL OUTER`、`CROSS`）的 `SELECT`，以及 `WHERE`、`ORDER BY`、`LIMIT`/`OFFSET` 和 `DISTINCT`。
- 仅支持带 `WHERE` 的 `DELETE`：该方言支持轻量级 `DELETE`，但要求显式指定 `WHERE` 子句，以避免误删整张表。若需清空整张表，请使用 `TRUNCATE TABLE`。
- 不支持 `UPDATE`：ClickHouse 针对追加写入进行了优化。该方言不实现 `UPDATE`。如果需要修改数据，请在上游完成数据转换后重新插入，或在自行承担风险的前提下使用显式文本 SQL（例如 `ALTER TABLE ... UPDATE`）。
- DDL 和反射：支持创建数据库和数据表，反射会返回列类型和表引擎元数据。传统的主键/外键/索引元数据不存在，因为 ClickHouse 不强制这些约束。
- ORM 范围：为方便使用，支持声明式模型以及通过 `Session.add(...)`/`bulk_save_objects(...)` 进行插入。高级 ORM 功能（关系管理、工作单元更新、级联、急加载/懒加载语义）不受支持。
- 主键语义：`Column(..., primary_key=True)` 仅被 SQLAlchemy 用于对象标识，并不会在 ClickHouse 中创建服务器端约束。请通过表引擎定义 `ORDER BY`（以及可选的 `PRIMARY KEY`）（例如 `MergeTree(order_by=...)`）。
- 事务与服务器特性：不支持两阶段事务、序列、`RETURNING`，以及高级隔离级别。`engine.begin()` 提供用于对语句分组的 Python 上下文管理器，但并不执行实际的事务控制（提交/回滚为空操作）。