---
'description': '`ExternalDistributed` エンジンは、リモートサーバーの MySQL または PostgreSQL に保存されているデータに対して
  `SELECT` クエリを実行できるようにします。シャーディングが可能になるため、MySQL または PostgreSQL エンジンを引数として受け取ります。'
'sidebar_label': 'ExternalDistributed'
'sidebar_position': 55
'slug': '/engines/table-engines/integrations/ExternalDistributed'
'title': 'ExternalDistributed'
'doc_type': 'reference'
---

`ExternalDistributed`エンジンは、リモートサーバーのMySQLまたはPostgreSQLに保存されたデータに対して`SELECT`クエリを実行することを可能にします。シャーディングが可能なように、引数として[MySQL](../../../engines/table-engines/integrations/mysql.md)または[PostgreSQL](../../../engines/table-engines/integrations/postgresql.md)エンジンを受け入れます。

## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = ExternalDistributed('engine', 'host:port', 'database', 'table', 'user', 'password');
```

[CREATE TABLE](/sql-reference/statements/create/table)クエリの詳細説明を参照してください。

テーブルの構造は、元のテーブルの構造と異なる場合があります：

- カラム名は元のテーブルと同じである必要がありますが、これらのカラムの一部のみを使用することができ、順序は任意です。
- カラムの型は、元のテーブルのものと異なる場合があります。ClickHouseは、値をClickHouseのデータ型に[キャスト](/sql-reference/functions/type-conversion-functions#cast)しようとします。

**エンジンパラメータ**

- `engine` — テーブルエンジン `MySQL` または `PostgreSQL`。
- `host:port` — MySQLまたはPostgreSQLサーバーのアドレス。
- `database` — リモートデータベース名。
- `table` — リモートテーブル名。
- `user` — ユーザー名。
- `password` — ユーザーパスワード。

## 実装の詳細 {#implementation-details}

複数のレプリカをサポートし、レプリカは `|` で、シャードは `,` で区切る必要があります。例えば：

```sql
CREATE TABLE test_shards (id UInt32, name String, age UInt32, money UInt32) ENGINE = ExternalDistributed('MySQL', `mysql{1|2}:3306,mysql{3|4}:3306`, 'clickhouse', 'test_replicas', 'root', 'clickhouse');
```

レプリカを指定する場合、読み取り時に各シャードの利用可能なレプリカの1つが選択されます。接続が失敗した場合は次のレプリカが選択され、すべてのレプリカについて同様に続けられます。すべてのレプリカに対する接続試行が失敗した場合、同じ方法で数回試行が繰り返されます。

各シャードに対して任意の数のシャードと任意の数のレプリカを指定できます。

**関連情報**

- [MySQLテーブルエンジン](../../../engines/table-engines/integrations/mysql.md)
- [PostgreSQLテーブルエンジン](../../../engines/table-engines/integrations/postgresql.md)
- [分散テーブルエンジン](../../../engines/table-engines/special/distributed.md)
