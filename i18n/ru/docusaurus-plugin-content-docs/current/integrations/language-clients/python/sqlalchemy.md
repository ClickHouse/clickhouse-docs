---
sidebar_label: 'SQLAlchemy'
sidebar_position: 7
keywords: ['clickhouse', 'python', 'sqlalchemy', 'integrate']
description: 'Поддержка ClickHouse SQLAlchemy'
slug: /integrations/language-clients/python/sqlalchemy
title: 'Поддержка SQLAlchemy'
doc_type: 'reference'
---

ClickHouse Connect предоставляет диалект SQLAlchemy (`clickhousedb`), построенный поверх основного драйвера. Он ориентирован на API SQLAlchemy Core и поддерживает SQLAlchemy версии 1.4.40+ и 2.0.x.



## Подключение с помощью SQLAlchemy

Создайте движок, используя URL-адрес `clickhousedb://` или `clickhousedb+connect://`. Параметры запроса сопоставляются с настройками ClickHouse, параметрами клиента и параметрами транспорта HTTP/TLS.

```python
from sqlalchemy import create_engine, text

engine = create_engine(
    "clickhousedb://user:password@host:8123/mydb?compression=zstd"
)

with engine.begin() as conn:
    rows = conn.execute(text("SELECT version()"))
    print(rows.scalar())
```

Примечания по параметрам URL и запроса:

* Настройки ClickHouse: передавайте как параметры запроса (например, `use_skip_indexes=0`).
* Параметры клиента: `compression` (псевдоним для `compress`), `query_limit`, тайм-ауты и другие параметры.
* Параметры HTTP/TLS: параметры для пула HTTP и TLS (например, `ch_http_max_field_name_size=99999`, `ca_cert=certifi`).

Полный список поддерживаемых параметров см. в разделе [Connection arguments and Settings](driver-api.md#connection-arguments) ниже. Их также можно передать через DSN SQLAlchemy.


## Основные запросы

Диалект поддерживает запросы SQLAlchemy Core `SELECT` с объединениями, фильтрами, сортировкой, ограничением/смещением (LIMIT/OFFSET) и `DISTINCT`.

```python
from sqlalchemy import MetaData, Table, select

metadata = MetaData(schema="mydb")
users = Table("users", metadata, autoload_with=engine)
orders = Table("orders", metadata, autoload_with=engine)
```


# Простой SELECT
with engine.begin() as conn:
    rows = conn.execute(select(users.c.id, users.c.name).order_by(users.c.id).limit(10)).fetchall()



# Операции JOIN (INNER/LEFT OUTER/FULL OUTER/CROSS)

with engine.begin() as conn:
stmt = (
select(users.c.name, orders.c.product)
.select&#95;from(users.join(orders, users.c.id == orders.c.user&#95;id))
)
rows = conn.execute(stmt).fetchall()

````

Поддерживается облегчённая операция `DELETE` с обязательным условием `WHERE`:

```python
from sqlalchemy import delete

with engine.begin() as conn:
    conn.execute(delete(users).where(users.c.name.like("%temp%")))
````


## DDL и отражение схемы

Вы можете создавать базы данных и таблицы с помощью предоставленных вспомогательных средств DDL и конструкций типов/движков. Поддерживается отражение структуры таблиц (включая типы столбцов и движок).

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

    # Отражение
    reflected = db.Table("events", metadata, autoload_with=engine)
    assert reflected.engine is not None
```

Отражённые столбцы включают зависящие от диалекта атрибуты, такие как `clickhousedb_default_type`, `clickhousedb_codec_expression` и `clickhousedb_ttl_expression`, если они заданы на сервере.


## Вставки (Core и базовый ORM) {#sqlalchemy-inserts}

Операции вставки выполняются с помощью SQLAlchemy Core, а также с простыми моделями ORM для удобства.



```python
# Базовая вставка
with engine.begin() as conn:
    conn.execute(table.insert().values(id=1, user="joe"))
```


# Базовый пример вставки через ORM

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


## Область применения и ограничения {#scope-and-limitations}
- Основная цель: поддержка возможностей SQLAlchemy Core, таких как `SELECT` с `JOIN` (`INNER`, `LEFT OUTER`, `FULL OUTER`, `CROSS`), `WHERE`, `ORDER BY`, `LIMIT`/`OFFSET` и `DISTINCT`.
- `DELETE` только с `WHERE`: диалект поддерживает облегчённую операцию `DELETE`, но требует явного указания предложения `WHERE`, чтобы избежать случайного удаления всей таблицы. Для очистки таблицы используйте `TRUNCATE TABLE`.
- Нет `UPDATE`: ClickHouse оптимизирован для добавления данных. Диалект не реализует `UPDATE`. Если нужно изменить данные, примените преобразования на предыдущих этапах конвейера и выполните повторную вставку или используйте явный текстовый SQL (например, `ALTER TABLE ... UPDATE`) на свой риск.
- DDL и рефлексия: создание баз данных и таблиц поддерживается, а рефлексия возвращает типы столбцов и метаданные движка таблицы. Традиционные метаданные PK/FK/индексов отсутствуют, поскольку ClickHouse не применяет эти ограничения.
- Область применения ORM: декларативные модели и вставки через `Session.add(...)`/`bulk_save_objects(...)` поддерживаются для удобства. Расширенные возможности ORM (управление связями, обновления в стиле unit-of-work, каскадирование, семантика жадной/отложенной загрузки) не поддерживаются.
- Семантика первичного ключа: `Column(..., primary_key=True)` используется SQLAlchemy только для идентификации объектов. Это не создаёт ограничение на стороне сервера в ClickHouse. Определяйте `ORDER BY` (и необязательный `PRIMARY KEY`) через движки таблиц (например, `MergeTree(order_by=...)`).
- Транзакции и серверные функции: двухфазные транзакции, последовательности, `RETURNING` и расширенные уровни изоляции не поддерживаются. `engine.begin()` предоставляет контекстный менеджер Python для группировки выражений, но не выполняет фактического управления транзакцией (операции commit/rollback по сути являются заглушками и ничего не делают).
