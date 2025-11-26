---
sidebar_label: 'SQLAlchemy'
sidebar_position: 7
keywords: ['clickhouse', 'python', 'sqlalchemy', 'integrate']
description: 'ClickHouse 对 SQLAlchemy 的支持'
slug: /integrations/language-clients/python/sqlalchemy
title: 'SQLAlchemy 支持'
doc_type: 'reference'
---

ClickHouse Connect 包含一个在核心驱动之上实现的 SQLAlchemy 方言（`clickhousedb`）。它面向 SQLAlchemy Core API，并支持 SQLAlchemy 1.4.40+ 和 2.0.x。



## 使用 SQLAlchemy 进行连接

使用 `clickhousedb://` 或 `clickhousedb+connect://` URL 创建一个 Engine 实例。URL 查询参数会映射到 ClickHouse 配置、客户端选项以及 HTTP/TLS 传输选项。

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

* ClickHouse 设置：作为查询参数传递（例如，`use_skip_indexes=0`）。
* 客户端选项：`compression`（`compress` 的别名）、`query_limit`、超时等。
* HTTP/TLS 选项：HTTP 连接池和 TLS 的相关选项（例如，`ch_http_max_field_name_size=99999`、`ca_cert=certifi`）。

有关支持选项的完整列表，请参见下文中的 [Connection arguments and Settings](driver-api.md#connection-arguments)。这些选项也可以通过 SQLAlchemy DSN 提供。


## Core queries

该方言支持 SQLAlchemy Core 的 `SELECT` 查询，包括连接、过滤、排序、限制/偏移以及 `DISTINCT`。

```python
from sqlalchemy import MetaData, Table, select

metadata = MetaData(schema="mydb")
users = Table("users", metadata, autoload_with=engine)
orders = Table("orders", metadata, autoload_with=engine)
```


# 基础 SELECT
with engine.begin() as conn:
    rows = conn.execute(select(users.c.id, users.c.name).order_by(users.c.id).limit(10)).fetchall()



# 连接（INNER/LEFT OUTER/FULL OUTER/CROSS）

with engine.begin() as conn:
stmt = (
select(users.c.name, orders.c.product)
.select&#95;from(users.join(orders, users.c.id == orders.c.user&#95;id))
)
rows = conn.execute(stmt).fetchall()

````

支持带有必需 `WHERE` 子句的轻量级 `DELETE` 操作:

```python
from sqlalchemy import delete

with engine.begin() as conn:
    conn.execute(delete(users).where(users.c.name.like("%temp%")))
````


## DDL 和反射

你可以使用提供的 DDL 辅助工具以及类型/引擎构造器来创建数据库和表。支持表反射功能（包括列类型和引擎）。

```python
import sqlalchemy as db
from sqlalchemy import MetaData
from clickhouse_connect.cc_sqlalchemy.ddl.custom import CreateDatabase, DropDatabase
from clickhouse_connect.cc_sqlalchemy.ddl.tableengine import MergeTree
from clickhouse_connect.cc_sqlalchemy.datatypes.sqltypes import UInt32, String, DateTime64

with engine.begin() as conn:
    # 数据库
    conn.execute(CreateDatabase("example_db", exists_ok=True))

    # 表
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

    # 反射
    reflected = db.Table("events", metadata, autoload_with=engine)
    assert reflected.engine is not None
```

当服务器端存在这些属性时，反射出的列会包含方言特定的属性，例如 `clickhousedb_default_type`、`clickhousedb_codec_expression` 和 `clickhousedb_ttl_expression`。


## 插入（Core 和基础 ORM） {#sqlalchemy-inserts}

插入操作既可以通过 SQLAlchemy Core 实现，也可以配合简单的 ORM 模型以方便使用。



```python
# Core 插入操作
with engine.begin() as conn:
    conn.execute(table.insert().values(id=1, user="joe"))
```


# 基础 ORM 插入

from sqlalchemy.orm import declarative&#95;base, Session

Base = declarative&#95;base(metadata=MetaData(schema=&quot;example&#95;db&quot;))

class User(Base):
**tablename** = &quot;users&quot;
**table&#95;args** = (MergeTree(order&#95;by=[&quot;id&quot;]),)
id = db.Column(UInt32, primary&#95;key=True)
name = db.Column(String)

Base.metadata.create&#95;all(engine)

with Session(engine) as session:
session.add(User(id=1, name=&quot;Alice&quot;))
session.bulk&#95;save&#95;objects([User(id=2, name=&quot;Bob&quot;)])
session.commit()

```
```


## 适用范围与限制 {#scope-and-limitations}
- 核心范围：支持 SQLAlchemy Core 功能，例如带有 `JOIN`（`INNER`、`LEFT OUTER`、`FULL OUTER`、`CROSS`）的 `SELECT`，以及 `WHERE`、`ORDER BY`、`LIMIT`/`OFFSET` 和 `DISTINCT`。
- 仅支持带 `WHERE` 的 `DELETE`：该方言支持轻量级 `DELETE`，但要求显式提供 `WHERE` 子句，以避免意外的整表删除。若要清空整张表，请使用 `TRUNCATE TABLE`。
- 不支持 `UPDATE`：ClickHouse 针对追加写入进行了优化。该方言不实现 `UPDATE`。如果需要更改数据，请在上游完成转换后重新插入，或在自担风险的前提下使用显式文本 SQL（例如 `ALTER TABLE ... UPDATE`）。
- DDL 与反射：支持创建数据库和表，反射会返回列类型和表引擎元数据。传统的 PK/FK/索引元数据不存在，因为 ClickHouse 不强制这些约束。
- ORM 适用范围：声明式模型以及通过 `Session.add(...)`/`bulk_save_objects(...)` 执行插入可用于简化操作。不支持高级 ORM 功能（关系管理、工作单元式更新、级联、预加载/延迟加载语义等）。
- 主键语义：`Column(..., primary_key=True)` 仅被 SQLAlchemy 用于对象标识，并不会在 ClickHouse 中创建服务器端约束。请通过表引擎定义 `ORDER BY`（以及可选的 `PRIMARY KEY`）（例如 `MergeTree(order_by=...)`）。
- 事务与服务器端特性：不支持两阶段事务、序列、`RETURNING` 和高级隔离级别。`engine.begin()` 提供了用于将语句分组的 Python 上下文管理器，但不会执行实际的事务控制（commit/rollback 不产生任何效果）。
