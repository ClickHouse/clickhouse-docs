---
description: '`ExternalDistributed` エンジンを使用すると、リモートサーバー上の MySQL または PostgreSQL に保存されたデータに対して `SELECT` クエリを実行できます。MySQL または PostgreSQL エンジンを引数に取るため、シャーディングが可能です。'
sidebar_label: 'ExternalDistributed'
sidebar_position: 55
slug: /engines/table-engines/integrations/ExternalDistributed
title: 'ExternalDistributed テーブルエンジン'
doc_type: 'reference'
---



# ExternalDistributed テーブルエンジン

`ExternalDistributed` エンジンは、リモートサーバー上の MySQL または PostgreSQL に保存されているデータに対して `SELECT` クエリを実行できるようにします。引数として [MySQL](../../../engines/table-engines/integrations/mysql.md) エンジンまたは [PostgreSQL](../../../engines/table-engines/integrations/postgresql.md) エンジンを指定できるため、シャーディングが可能です。



## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = ExternalDistributed('engine', 'host:port', 'database', 'table', 'user', 'password');
```

[CREATE TABLE](/sql-reference/statements/create/table)クエリの詳細については、こちらを参照してください。

テーブル構造は元のテーブル構造と異なっていても構いません:

- カラム名は元のテーブルと同じである必要がありますが、一部のカラムのみを任意の順序で使用できます。
- カラム型は元のテーブルと異なっていても構いません。ClickHouseは値をClickHouseデータ型に[キャスト](/sql-reference/functions/type-conversion-functions#cast)しようとします。

**エンジンパラメータ**

- `engine` — テーブルエンジン(`MySQL`または`PostgreSQL`)。
- `host:port` — MySQLまたはPostgreSQLサーバーのアドレス。
- `database` — リモートデータベース名。
- `table` — リモートテーブル名。
- `user` — ユーザー名。
- `password` — ユーザーパスワード。


## 実装の詳細 {#implementation-details}

複数のレプリカをサポートしており、`|`で区切って列挙する必要があります。シャードは`,`で区切って列挙する必要があります。例:

```sql
CREATE TABLE test_shards (id UInt32, name String, age UInt32, money UInt32) ENGINE = ExternalDistributed('MySQL', `mysql{1|2}:3306,mysql{3|4}:3306`, 'clickhouse', 'test_replicas', 'root', 'clickhouse');
```

レプリカを指定する場合、読み取り時に各シャードに対して利用可能なレプリカの1つが選択されます。接続に失敗した場合は、次のレプリカが選択され、すべてのレプリカに対して同様の処理が続行されます。すべてのレプリカで接続試行が失敗した場合、同じ方法で数回再試行されます。

任意の数のシャードと、各シャードに対して任意の数のレプリカを指定できます。

**関連項目**

- [MySQLテーブルエンジン](../../../engines/table-engines/integrations/mysql.md)
- [PostgreSQLテーブルエンジン](../../../engines/table-engines/integrations/postgresql.md)
- [Distributedテーブルエンジン](../../../engines/table-engines/special/distributed.md)
