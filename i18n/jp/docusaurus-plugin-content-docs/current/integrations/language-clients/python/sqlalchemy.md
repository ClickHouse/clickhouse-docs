---
sidebar_label: 'SQLAlchemy'
sidebar_position: 7
keywords: ['clickhouse', 'python', 'sqlalchemy', 'integrate']
description: 'ClickHouse SQLAlchemy サポート'
slug: /integrations/language-clients/python/sqlalchemy
title: 'SQLAlchemy サポート'
doc_type: 'reference'
---

ClickHouse Connect には、コアドライバー上に実装された SQLAlchemy ダイアレクト（`clickhousedb`）が含まれています。これは SQLAlchemy Core API を主な対象としており、SQLAlchemy 1.4.40 以降および 2.0.x をサポートします。



## SQLAlchemy で接続する

`clickhousedb://` または `clickhousedb+connect://` のいずれかの URL を使用してエンジンを作成します。クエリパラメータは、ClickHouse の設定、クライアントオプション、および HTTP/TLS トランスポートオプションに対応します。

```python
from sqlalchemy import create_engine, text

engine = create_engine(
    "clickhousedb://user:password@host:8123/mydb?compression=zstd"
)

with engine.begin() as conn:
    rows = conn.execute(text("SELECT version()"))
    print(rows.scalar())
```

URL/クエリパラメータに関する注意事項:

* ClickHouse の設定: クエリパラメータとして指定します（例: `use_skip_indexes=0`）。
* クライアントオプション: `compression`（`compress` のエイリアス）、`query_limit`、タイムアウトなど。
* HTTP/TLS オプション: HTTP プールおよび TLS 向けのオプション（例: `ch_http_max_field_name_size=99999`、`ca_cert=certifi`）。

サポートされているオプションの一覧については、以下のセクションにある [Connection arguments and Settings](driver-api.md#connection-arguments) を参照してください。これらのオプションは SQLAlchemy の DSN 経由で指定することもできます。


## コアクエリ

このダイアレクトは、結合、フィルタリング、並べ替え、LIMIT/OFFSET、および `DISTINCT` を含む SQLAlchemy Core の `SELECT` クエリをサポートします。

```python
from sqlalchemy import MetaData, Table, select

metadata = MetaData(schema="mydb")
users = Table("users", metadata, autoload_with=engine)
orders = Table("orders", metadata, autoload_with=engine)
```


# 基本的な SELECT 文
with engine.begin() as conn:
    rows = conn.execute(select(users.c.id, users.c.name).order_by(users.c.id).limit(10)).fetchall()



# JOIN（INNER／LEFT OUTER／FULL OUTER／CROSS）

with engine.begin() as conn:
stmt = (
select(users.c.name, orders.c.product)
.select&#95;from(users.join(orders, users.c.id == orders.c.user&#95;id))
)
rows = conn.execute(stmt).fetchall()

````

必須の `WHERE` 句付きの軽量な `DELETE` がサポートされています:

```python
from sqlalchemy import delete

with engine.begin() as conn:
    conn.execute(delete(users).where(users.c.name.like("%temp%")))
````


## DDL とリフレクション

提供されている DDL ヘルパーと型／エンジン構成を使用して、データベースとテーブルを作成できます。テーブルリフレクション（カラム型やエンジンを含む）にも対応しています。

```python
import sqlalchemy as db
from sqlalchemy import MetaData
from clickhouse_connect.cc_sqlalchemy.ddl.custom import CreateDatabase, DropDatabase
from clickhouse_connect.cc_sqlalchemy.ddl.tableengine import MergeTree
from clickhouse_connect.cc_sqlalchemy.datatypes.sqltypes import UInt32, String, DateTime64

with engine.begin() as conn:
    # データベース
    conn.execute(CreateDatabase("example_db", exists_ok=True))

    # テーブル
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

    # リフレクション
    reflected = db.Table("events", metadata, autoload_with=engine)
    assert reflected.engine is not None
```

反映されたカラムには、サーバー側で定義されている場合、`clickhousedb_default_type`、`clickhousedb_codec_expression`、`clickhousedb_ttl_expression` などの SQL ダイアレクト固有の属性が含まれます。


## INSERT（Core と基本的な ORM） {#sqlalchemy-inserts}

データの挿入は、SQLAlchemy Core だけでなく、利便性のためにシンプルな ORM モデルからも行えます。



```python
# Core による INSERT
with engine.begin() as conn:
    conn.execute(table.insert().values(id=1, user="joe"))
```


# 基本的な ORM による INSERT

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


## 適用範囲と制限事項 {#scope-and-limitations}
- 主な対象: `JOIN`（`INNER`、`LEFT OUTER`、`FULL OUTER`、`CROSS`）を伴う `SELECT`、`WHERE`、`ORDER BY`、`LIMIT`/`OFFSET`、`DISTINCT` など、SQLAlchemy Core の機能を利用できるようにすること。
- `WHERE` 付きの `DELETE` のみ: このダイアレクトは軽量な `DELETE` をサポートしますが、テーブル全件削除を誤って行うことを避けるため、明示的な `WHERE` 句が必須です。テーブルを空にしたい場合は、`TRUNCATE TABLE` を使用してください。
- `UPDATE` は非対応: ClickHouse は追記最適化型です。このダイアレクトは `UPDATE` を実装していません。データを変更する必要がある場合は、上流で変換を行って再挿入するか、自己責任で明示的なテキスト SQL（例: `ALTER TABLE ... UPDATE`）を使用してください。
- DDL とリフレクション: データベースおよびテーブルの作成がサポートされており、リフレクションによりカラム型とテーブルエンジンのメタデータが取得できます。ClickHouse はそれらの制約を強制しないため、従来型の PK/FK/インデックスのメタデータは存在しません。
- ORM の範囲: 宣言的モデルおよび `Session.add(...)`/`bulk_save_objects(...)` による挿入は利便性のために動作します。高度な ORM 機能（リレーション管理、ユニット・オブ・ワークによる更新、カスケード、eager/lazy ローディングのセマンティクス）はサポートされません。
- 主キーの意味付け: `Column(..., primary_key=True)` は SQLAlchemy においてオブジェクト識別のためだけに使用されます。ClickHouse サーバー側の制約を作成するものではありません。`ORDER BY`（および任意で `PRIMARY KEY`）はテーブルエンジン（例: `MergeTree(order_by=...)`）を通じて定義してください。
- トランザクションとサーバー機能: 二相トランザクション、シーケンス、`RETURNING`、および高度な分離レベルはサポートされません。`engine.begin()` は、ステートメントをまとめるための Python のコンテキストマネージャーを提供しますが、実際のトランザクション制御は行わず（commit/rollback は何も行いません）。
