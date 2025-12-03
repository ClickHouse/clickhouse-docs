---
sidebar_label: 'SQLAlchemy'
sidebar_position: 7
keywords: ['clickhouse', 'python', 'sqlalchemy', 'integrate']
description: 'Поддержка ClickHouse SQLAlchemy'
slug: /integrations/language-clients/python/sqlalchemy
title: 'Поддержка SQLAlchemy'
doc_type: 'reference'
---

ClickHouse Connect включает диалект SQLAlchemy (`clickhousedb`), построенный поверх базового драйвера. Он предназначен для работы с API SQLAlchemy Core и поддерживает версии SQLAlchemy 1.4.40+ и 2.0.x.

## Подключение через SQLAlchemy {#sqlalchemy-connect}

Создайте движок, используя URL-адрес вида `clickhousedb://` или `clickhousedb+connect://`. Параметры запроса соответствуют настройкам ClickHouse, параметрам клиента и параметрам транспорта HTTP/TLS.

```python
from sqlalchemy import create_engine, text

engine = create_engine(
    "clickhousedb://user:password@host:8123/mydb?compression=zstd"
)

with engine.begin() as conn:
    rows = conn.execute(text("SELECT version()"))
    print(rows.scalar())
```

Замечания по параметрам URL/запроса:

* Настройки ClickHouse: передавайте как параметры запроса (например, `use_skip_indexes=0`).
* Параметры клиента: `compression` (псевдоним `compress`), `query_limit`, таймауты и другие параметры.
* Параметры HTTP/TLS: параметры для пула HTTP и TLS (например, `ch_http_max_field_name_size=99999`, `ca_cert=certifi`).

Полный список поддерживаемых параметров см. в разделе [Connection arguments and Settings](driver-api.md#connection-arguments) ниже. Их также можно передавать через DSN SQLAlchemy.


## Основные запросы {#sqlalchemy-core-queries}

Диалект поддерживает `SELECT`-запросы SQLAlchemy Core с объединениями, фильтрацией, сортировкой, ограничениями и смещениями (LIMIT/OFFSET), а также `DISTINCT`.

```python
from sqlalchemy import MetaData, Table, select

metadata = MetaData(schema="mydb")
users = Table("users", metadata, autoload_with=engine)
orders = Table("orders", metadata, autoload_with=engine)

# Базовый запрос SELECT {#basic-select}
with engine.begin() as conn:
    rows = conn.execute(select(users.c.id, users.c.name).order_by(users.c.id).limit(10)).fetchall()

# Объединения JOIN (INNER/LEFT OUTER/FULL OUTER/CROSS) {#joins-innerleft-outerfull-outercross}
with engine.begin() as conn:
    stmt = (
        select(users.c.name, orders.c.product)
        .select_from(users.join(orders, users.c.id == orders.c.user_id))
    )
    rows = conn.execute(stmt).fetchall()
```

Поддерживается легковесный `DELETE` с обязательным условием `WHERE`:

```python
from sqlalchemy import delete

with engine.begin() as conn:
    conn.execute(delete(users).where(users.c.name.like("%temp%")))
```


## DDL и рефлексия {#sqlalchemy-ddl-reflection}

Вы можете создавать базы данных и таблицы, используя предоставленные DDL‑помощники и конструкторы типов/движков. Поддерживается рефлексия таблиц (включая типы столбцов и движок).

```python
import sqlalchemy as db
from sqlalchemy import MetaData
from clickhouse_connect.cc_sqlalchemy.ddl.custom import CreateDatabase, DropDatabase
from clickhouse_connect.cc_sqlalchemy.ddl.tableengine import MergeTree
from clickhouse_connect.cc_sqlalchemy.datatypes.sqltypes import UInt32, String, DateTime64

with engine.begin() as conn:
    # Базы данных
    conn.execute(CreateDatabase("example_db", exists_ok=True))

    # Таблицы
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

    # Отражение схемы
    reflected = db.Table("events", metadata, autoload_with=engine)
    assert reflected.engine is not None
```

Отражённые столбцы включают атрибуты, специфичные для диалекта, такие как `clickhousedb_default_type`, `clickhousedb_codec_expression` и `clickhousedb_ttl_expression`, если они заданы на сервере.


## Операции вставки (Core и базовый ORM) {#sqlalchemy-inserts}

Операции вставки можно выполнять через SQLAlchemy Core, а также с помощью простых ORM-моделей для удобства.

```python
# Вставка через Core {#core-insert}
with engine.begin() as conn:
    conn.execute(table.insert().values(id=1, user="joe"))

# Базовая вставка через ORM {#basic-orm-insert}
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


## Область применения и ограничения {#scope-and-limitations}

- Основное назначение: Поддержка возможностей SQLAlchemy Core, таких как `SELECT` с `JOIN` (`INNER`, `LEFT OUTER`, `FULL OUTER`, `CROSS`), `WHERE`, `ORDER BY`, `LIMIT`/`OFFSET` и `DISTINCT`.
- `DELETE` только с `WHERE`: Диалект поддерживает упрощённый `DELETE`, но требует явного условия `WHERE`, чтобы избежать случайного удаления всей таблицы. Для очистки таблицы используйте `TRUNCATE TABLE`.
- Нет `UPDATE`: ClickHouse оптимизирован под добавление данных. Диалект не реализует `UPDATE`. Если необходимо изменить данные, выполняйте преобразования на стороне источника и вставляйте данные заново или используйте явный текстовый SQL (например, `ALTER TABLE ... UPDATE`) на свой риск.
- DDL и рефлексия: Поддерживается создание баз данных и таблиц, а рефлексия возвращает типы столбцов и метаданные движка таблицы. Традиционные метаданные PK/FK/индексов отсутствуют, так как ClickHouse не обеспечивает эти ограничения.
- Область применения ORM: Декларативные модели и вставки через `Session.add(...)`/`bulk_save_objects(...)` поддерживаются для удобства. Расширенные возможности ORM (управление связями, обновления в стиле unit-of-work, каскадирование, семантика eager/lazy загрузки) не поддерживаются.
- Семантика первичного ключа: `Column(..., primary_key=True)` используется SQLAlchemy только для идентификации объектов. Это не создаёт серверного ограничения в ClickHouse. Определяйте `ORDER BY` (и необязательный `PRIMARY KEY`) через движки таблиц (например, `MergeTree(order_by=...)`).
- Транзакции и функции сервера: Двухфазные транзакции, последовательности, `RETURNING` и расширенные уровни изоляции не поддерживаются. `engine.begin()` предоставляет контекстный менеджер Python для группировки выражений, но не выполняет реального управления транзакциями (commit/rollback фактически ничего не делают).