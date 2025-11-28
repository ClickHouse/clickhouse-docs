---
sidebar_label: 'SQLAlchemy'
sidebar_position: 7
keywords: ['clickhouse', 'python', 'sqlalchemy', 'integrate']
description: 'ClickHouse SQLAlchemy サポート'
slug: /integrations/language-clients/python/sqlalchemy
title: 'SQLAlchemy サポート'
doc_type: 'reference'
---

ClickHouse Connect には、コアドライバ上に実装された SQLAlchemy ダイアレクト（`clickhousedb`）が含まれています。これは SQLAlchemy Core API を対象としており、SQLAlchemy 1.4.40 以降および 2.0.x をサポートします。

## SQLAlchemy で接続する

`clickhousedb://` または `clickhousedb+connect://` のいずれかの URL を指定してエンジンを作成します。クエリパラメータは、ClickHouse の設定、クライアントオプション、および HTTP/TLS トランスポートオプションに対応します。

```python
from sqlalchemy import create_engine, text

engine = create_engine(
    "clickhousedb://user:password@host:8123/mydb?compression=zstd"
)

with engine.begin() as conn:
    rows = conn.execute(text("SELECT version()"))
    print(rows.scalar())
```

URL/クエリパラメータに関する注意:

* ClickHouse の設定: クエリパラメータとして指定します（例: `use_skip_indexes=0`）。
* クライアントオプション: `compression`（`compress` のエイリアス）、`query_limit`、タイムアウトなど。
* HTTP/TLS オプション: HTTP プールおよび TLS 用のオプション（例: `ch_http_max_field_name_size=99999`、`ca_cert=certifi`）。

サポートされているオプションの全一覧については、以下のセクションにある [Connection arguments and Settings](driver-api.md#connection-arguments) を参照してください。これらは SQLAlchemy の DSN で指定することもできます。


## コアクエリ

このダイアレクトは、結合、フィルタリング、並べ替え、LIMIT/OFFSET、`DISTINCT` を伴う SQLAlchemy Core の `SELECT` クエリをサポートします。

```python
from sqlalchemy import MetaData, Table, select

metadata = MetaData(schema="mydb")
users = Table("users", metadata, autoload_with=engine)
orders = Table("orders", metadata, autoload_with=engine)

# 基本的なSELECT
with engine.begin() as conn:
    rows = conn.execute(select(users.c.id, users.c.name).order_by(users.c.id).limit(10)).fetchall()

# JOIN（INNER/LEFT OUTER/FULL OUTER/CROSS）
with engine.begin() as conn:
    stmt = (
        select(users.c.name, orders.c.product)
        .select_from(users.join(orders, users.c.id == orders.c.user_id))
    )
    rows = conn.execute(stmt).fetchall()
```

`WHERE` 句の指定が必須の軽量な `DELETE` がサポートされています。

```python
from sqlalchemy import delete

with engine.begin() as conn:
    conn.execute(delete(users).where(users.c.name.like("%temp%")))
```


## DDL とリフレクション

提供されている DDL ヘルパーと型／エンジンの構成要素を使用して、データベースおよびテーブルを作成できます。テーブルのリフレクション（カラム型やエンジンを含む）にも対応しています。

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

反映された列には、サーバー上に存在する場合、`clickhousedb_default_type`、`clickhousedb_codec_expression`、`clickhousedb_ttl_expression` などのダイアレクト固有の属性が含まれます。


## INSERT（Core と基本的な ORM）

INSERT は、SQLAlchemy Core 経由だけでなく、利便性のためにシンプルな ORM モデルを使っても実行できます。

```python
# コア挿入
with engine.begin() as conn:
    conn.execute(table.insert().values(id=1, user="joe"))

# 基本的なORM挿入
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


## 対象範囲と制限事項 {#scope-and-limitations}

- 主な対象範囲: `SELECT` と `JOIN`（`INNER`、`LEFT OUTER`、`FULL OUTER`、`CROSS`）、`WHERE`、`ORDER BY`、`LIMIT`/`OFFSET`、`DISTINCT` などの SQLAlchemy Core 機能を利用できるようにすること。
- `WHERE` 付きの `DELETE` のみ: このダイアレクトは軽量な `DELETE` 操作をサポートしますが、テーブル全体を誤って削除することを避けるため、明示的な `WHERE` 句が必須です。テーブルを空にするには `TRUNCATE TABLE` を使用してください。
- `UPDATE` は非対応: ClickHouse は追記最適化されています。このダイアレクトは `UPDATE` を実装していません。データを変更する必要がある場合は、上流で変換を適用して再挿入するか、自己責任で明示的なテキスト SQL（例: `ALTER TABLE ... UPDATE`）を使用してください。
- DDL とリフレクション: データベースおよびテーブルの作成はサポートされており、リフレクションによりカラム型とテーブルエンジンのメタデータが返されます。ClickHouse はこれらの制約を強制しないため、従来型の PK/FK/インデックスのメタデータは存在しません。
- ORM の対象範囲: 宣言的モデルおよび `Session.add(...)`/`bulk_save_objects(...)` による挿入は、利便性のために動作します。高度な ORM 機能（リレーション管理、Unit of Work ベースの更新、カスケード、Eager/Lazy ローディングのセマンティクス）はサポートされません。
- プライマリキーのセマンティクス: `Column(..., primary_key=True)` は、SQLAlchemy がオブジェクト識別子を管理するためだけに使用されます。ClickHouse 上でサーバーサイド制約が作成されるわけではありません。`ORDER BY`（および任意の `PRIMARY KEY`）はテーブルエンジン（例: `MergeTree(order_by=...)`）を通じて定義してください。
- トランザクションとサーバー機能: 二相トランザクション、シーケンス、`RETURNING`、高度な分離レベルはサポートされません。`engine.begin()` はステートメントをまとめるための Python のコンテキストマネージャーを提供しますが、実際のトランザクション制御は行いません（commit/rollback は実際には何も行いません）。