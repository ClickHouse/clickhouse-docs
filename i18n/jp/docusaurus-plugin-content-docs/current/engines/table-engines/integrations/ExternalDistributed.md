---
description: '`ExternalDistributed` エンジンを使用すると、リモートサーバー上の MySQL または PostgreSQL データベースに保存されているデータに対して `SELECT` クエリを実行できます。MySQL または PostgreSQL エンジンを引数として受け取れるため、シャーディングが可能です。'
sidebar_label: 'ExternalDistributed'
sidebar_position: 55
slug: /engines/table-engines/integrations/ExternalDistributed
title: 'ExternalDistributed テーブルエンジン'
doc_type: 'reference'
---



# ExternalDistributed テーブルエンジン

`ExternalDistributed` エンジンを使用すると、リモートサーバー上の MySQL または PostgreSQL データベースに保存されているデータに対して `SELECT` クエリを実行できます。引数として [MySQL](../../../engines/table-engines/integrations/mysql.md) または [PostgreSQL](../../../engines/table-engines/integrations/postgresql.md) エンジンを指定できるため、シャーディングが可能です。



## テーブルを作成する

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = ExternalDistributed('engine', 'host:port', 'database', 'table', 'user', 'password');
```

[CREATE TABLE](/sql-reference/statements/create/table) クエリの詳細について参照してください。

テーブル構造は元のテーブル構造と異なっていてもかまいません。

* 列名は元のテーブルと同じである必要がありますが、その一部のみを任意の順序で使用できます。
* 列型は元のテーブルと異なっていてもかまいません。ClickHouse は、値を ClickHouse のデータ型に[キャスト](/sql-reference/functions/type-conversion-functions#cast)しようとします。

**エンジンパラメータ**

* `engine` — テーブルエンジン。`MySQL` または `PostgreSQL` を指定します。
* `host:port` — MySQL または PostgreSQL サーバーのアドレス。
* `database` — リモートデータベース名。
* `table` — リモートテーブル名。
* `user` — ユーザー名。
* `password` — ユーザーのパスワード。


## 実装の詳細

複数レプリカ構成をサポートしており、レプリカは `|` で、シャードは `,` で区切って列挙する必要があります。例えば次のようになります。

```sql
CREATE TABLE test_shards (id UInt32, name String, age UInt32, money UInt32) ENGINE = ExternalDistributed('MySQL', `mysql{1|2}:3306,mysql{3|4}:3306`, 'clickhouse', 'test_replicas', 'root', 'clickhouse');
```

レプリカ数を指定すると、読み取り時には各シャードに対して利用可能なレプリカのうち 1 つが選択されます。接続に失敗した場合は次のレプリカが選択され、すべてのレプリカについて同様に処理されます。すべてのレプリカへの接続試行が失敗した場合は、同じ手順で複数回再試行されます。

任意の数のシャードと、各シャードに対する任意の数のレプリカを指定できます。

**関連項目**

* [MySQL table engine](../../../engines/table-engines/integrations/mysql.md)
* [PostgreSQL table engine](../../../engines/table-engines/integrations/postgresql.md)
* [Distributed table engine](../../../engines/table-engines/special/distributed.md)
