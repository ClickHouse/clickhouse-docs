---
sidebar_label: 'SQLAlchemy'
sidebar_position: 7
keywords: ['clickhouse', 'python', 'sqlalchemy', 'integrate']
description: 'ClickHouse SQLAlchemy サポート'
slug: /integrations/language-clients/python/sqlalchemy
title: 'SQLAlchemy サポート'
doc_type: 'reference'
---

ClickHouse Connect には、コアドライバをベースに実装された SQLAlchemy ダイアレクト（`clickhousedb`）が含まれています。これは SQLAlchemy Core API を対象としており、SQLAlchemy 1.4.40+ および 2.0.x をサポートします。



## SQLAlchemyで接続する {#sqlalchemy-connect}

`clickhousedb://`または`clickhousedb+connect://`のURLを使用してエンジンを作成します。クエリパラメータはClickHouseの設定、クライアントオプション、HTTP/TLSトランスポートオプションにマッピングされます。

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

- ClickHouse設定: クエリパラメータとして渡します(例: `use_skip_indexes=0`)。
- クライアントオプション: `compression`(`compress`のエイリアス)、`query_limit`、タイムアウトなど。
- HTTP/TLSオプション: HTTPプールとTLSのオプション(例: `ch_http_max_field_name_size=99999`、`ca_cert=certifi`)。

サポートされているオプションの完全なリストについては、以下のセクションの[接続引数と設定](driver-api.md#connection-arguments)を参照してください。これらのオプションはSQLAlchemy DSN経由でも指定できます。


## コアクエリ {#sqlalchemy-core-queries}

このダイアレクトは、結合、フィルタ、順序付け、limit/offset、および `DISTINCT` を含む SQLAlchemy Core の `SELECT` クエリをサポートしています。

```python
from sqlalchemy import MetaData, Table, select

metadata = MetaData(schema="mydb")
users = Table("users", metadata, autoload_with=engine)
orders = Table("orders", metadata, autoload_with=engine)

```


# 基本的なSELECT
with engine.begin() as conn:
    rows = conn.execute(select(users.c.id, users.c.name).order_by(users.c.id).limit(10)).fetchall()



# JOIN（INNER / LEFT OUTER / FULL OUTER / CROSS）

with engine.begin() as conn:
stmt = (
select(users.c.name, orders.c.product)
.select&#95;from(users.join(orders, users.c.id == orders.c.user&#95;id))
)
rows = conn.execute(stmt).fetchall()

````

`WHERE`句を必須とする軽量な`DELETE`がサポートされています:

```python
from sqlalchemy import delete

with engine.begin() as conn:
    conn.execute(delete(users).where(users.c.name.like("%temp%")))
````


## DDLとリフレクション {#sqlalchemy-ddl-reflection}

提供されているDDLヘルパーと型/エンジン構造を使用して、データベースとテーブルを作成できます。テーブルリフレクション(カラム型とエンジンを含む)がサポートされています。

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

リフレクションされたカラムには、サーバー上に存在する場合、`clickhousedb_default_type`、`clickhousedb_codec_expression`、`clickhousedb_ttl_expression`などのダイアレクト固有の属性が含まれます。


## 挿入（CoreおよびBasic ORM） {#sqlalchemy-inserts}

挿入はSQLAlchemy Coreを介して動作するほか、利便性のためにシンプルなORMモデルでも使用できます。


```python
# コア挿入
with engine.begin() as conn:
    conn.execute(table.insert().values(id=1, user="joe"))
```


# 基本的な ORM による挿入

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


## スコープと制限事項 {#scope-and-limitations}

- コア機能: `JOIN`（`INNER`、`LEFT OUTER`、`FULL OUTER`、`CROSS`）、`WHERE`、`ORDER BY`、`LIMIT`/`OFFSET`、`DISTINCT`を含む`SELECT`などのSQLAlchemy Core機能を有効にします。
- `WHERE`句を伴う`DELETE`のみ: このダイアレクトは軽量な`DELETE`をサポートしますが、誤ってテーブル全体を削除することを防ぐため、明示的な`WHERE`句が必要です。テーブルをクリアするには、`TRUNCATE TABLE`を使用してください。
- `UPDATE`非対応: ClickHouseは追記最適化されています。このダイアレクトは`UPDATE`を実装していません。データを変更する必要がある場合は、上流で変換を適用して再挿入するか、明示的なテキストSQL（例: `ALTER TABLE ... UPDATE`）を自己責任で使用してください。
- DDLとリフレクション: データベースとテーブルの作成がサポートされており、リフレクションはカラム型とテーブルエンジンのメタデータを返します。ClickHouseはこれらの制約を強制しないため、従来の主キー/外部キー/インデックスのメタデータは存在しません。
- ORMスコープ: 宣言的モデルと`Session.add(...)`/`bulk_save_objects(...)`による挿入は利便性のために機能します。高度なORM機能（リレーションシップ管理、unit-of-work更新、カスケード、eager/lazy読み込みセマンティクス）はサポートされていません。
- 主キーのセマンティクス: `Column(..., primary_key=True)`はSQLAlchemyによってオブジェクトの識別にのみ使用されます。ClickHouseのサーバー側制約は作成されません。テーブルエンジンを介して`ORDER BY`（およびオプションの`PRIMARY KEY`）を定義してください（例: `MergeTree(order_by=...)`）。
- トランザクションとサーバー機能: 2フェーズトランザクション、シーケンス、`RETURNING`、高度な分離レベルはサポートされていません。`engine.begin()`はステートメントをグループ化するためのPythonコンテキストマネージャーを提供しますが、実際のトランザクション制御は実行しません（commit/rollbackは何も行いません）。
