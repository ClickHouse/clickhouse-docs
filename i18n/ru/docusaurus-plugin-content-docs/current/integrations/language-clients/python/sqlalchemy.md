---
sidebar_label: 'SQLAlchemy'
sidebar_position: 7
keywords: ['clickhouse', 'python', 'sqlalchemy', 'integrate']
description: 'Поддержка ClickHouse SQLAlchemy'
slug: /integrations/language-clients/python/sqlalchemy
title: 'Поддержка SQLAlchemy'
doc_type: 'reference'
---

ClickHouse Connect включает диалект SQLAlchemy (`clickhousedb`), реализованный поверх базового драйвера. Он ориентирован на использование SQLAlchemy Core API и поддерживает SQLAlchemy версий 1.4.40+ и 2.0.x.



## Подключение через SQLAlchemy {#sqlalchemy-connect}

Создайте движок, используя URL вида `clickhousedb://` или `clickhousedb+connect://`. Параметры запроса соответствуют настройкам ClickHouse, опциям клиента и параметрам транспорта HTTP/TLS.

```python
from sqlalchemy import create_engine, text

engine = create_engine(
    "clickhousedb://user:password@host:8123/mydb?compression=zstd"
)

with engine.begin() as conn:
    rows = conn.execute(text("SELECT version()"))
    print(rows.scalar())
```

Примечания по параметрам URL/запроса:

- Настройки ClickHouse: передаются как параметры запроса (например, `use_skip_indexes=0`).
- Опции клиента: `compression` (псевдоним для `compress`), `query_limit`, таймауты и другие.
- Опции HTTP/TLS: параметры для пула HTTP и TLS (например, `ch_http_max_field_name_size=99999`, `ca_cert=certifi`).

Полный список поддерживаемых опций см. в разделе [Аргументы подключения и настройки](driver-api.md#connection-arguments) ниже. Эти параметры также можно передать через DSN SQLAlchemy.


## Базовые запросы {#sqlalchemy-core-queries}

Диалект поддерживает запросы SQLAlchemy Core `SELECT` с соединениями, фильтрами, сортировкой, лимитами/смещениями и `DISTINCT`.

```python
from sqlalchemy import MetaData, Table, select

metadata = MetaData(schema="mydb")
users = Table("users", metadata, autoload_with=engine)
orders = Table("orders", metadata, autoload_with=engine)

```


# Простейший SELECT
with engine.begin() as conn:
    rows = conn.execute(select(users.c.id, users.c.name).order_by(users.c.id).limit(10)).fetchall()



# JOIN (INNER/LEFT OUTER/FULL OUTER/CROSS)

with engine.begin() as conn:
stmt = (
select(users.c.name, orders.c.product)
.select&#95;from(users.join(orders, users.c.id == orders.c.user&#95;id))
)
rows = conn.execute(stmt).fetchall()

````

Поддерживается легковесный `DELETE` с обязательным условием `WHERE`:

```python
from sqlalchemy import delete

with engine.begin() as conn:
    conn.execute(delete(users).where(users.c.name.like("%temp%")))
````


## DDL и рефлексия {#sqlalchemy-ddl-reflection}

Вы можете создавать базы данных и таблицы, используя предоставленные вспомогательные средства DDL и конструкции типов/движков. Поддерживается рефлексия таблиц (включая типы столбцов и движок).

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

    # Рефлексия
    reflected = db.Table("events", metadata, autoload_with=engine)
    assert reflected.engine is not None
```

Отражённые столбцы включают специфичные для диалекта атрибуты, такие как `clickhousedb_default_type`, `clickhousedb_codec_expression` и `clickhousedb_ttl_expression`, если они присутствуют на сервере.


## Вставка данных (Core и базовая ORM) {#sqlalchemy-inserts}

Вставка данных работает как через SQLAlchemy Core, так и с простыми ORM-моделями для удобства.


```python
# Базовая вставка
with engine.begin() as conn:
    conn.execute(table.insert().values(id=1, user="joe"))
```


# Базовая вставка через ORM

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

- Основная функциональность: Поддержка возможностей SQLAlchemy Core, таких как `SELECT` с `JOIN` (`INNER`, `LEFT OUTER`, `FULL OUTER`, `CROSS`), `WHERE`, `ORDER BY`, `LIMIT`/`OFFSET` и `DISTINCT`.
- `DELETE` только с `WHERE`: Диалект поддерживает упрощённый `DELETE`, но требует явного указания условия `WHERE` во избежание случайного удаления всех данных таблицы. Для очистки таблицы используйте `TRUNCATE TABLE`.
- Отсутствие `UPDATE`: ClickHouse оптимизирован для добавления данных. Диалект не реализует `UPDATE`. Если необходимо изменить данные, применяйте преобразования на этапе подготовки и выполняйте повторную вставку, либо используйте явный текстовый SQL (например, `ALTER TABLE ... UPDATE`) на свой страх и риск.
- DDL и рефлексия: Создание баз данных и таблиц поддерживается, рефлексия возвращает типы столбцов и метаданные движка таблицы. Традиционные метаданные первичных ключей (PK), внешних ключей (FK) и индексов отсутствуют, поскольку ClickHouse не применяет эти ограничения.
- Область применения ORM: Декларативные модели и вставка данных через `Session.add(...)`/`bulk_save_objects(...)` работают для удобства. Расширенные возможности ORM (управление связями, обновления в рамках единицы работы, каскадные операции, семантика немедленной/отложенной загрузки) не поддерживаются.
- Семантика первичного ключа: `Column(..., primary_key=True)` используется SQLAlchemy только для идентификации объектов. Это не создаёт ограничение на стороне сервера в ClickHouse. Определяйте `ORDER BY` (и опциональный `PRIMARY KEY`) через движки таблиц (например, `MergeTree(order_by=...)`).
- Транзакции и серверные возможности: Двухфазные транзакции, последовательности, `RETURNING` и расширенные уровни изоляции не поддерживаются. `engine.begin()` предоставляет контекстный менеджер Python для группировки операторов, но не выполняет фактического управления транзакциями (commit/rollback являются пустыми операциями).
