---
slug: /sql-reference/table-functions/jdbc
sidebar_position: 100
sidebar_label: jdbc
---

# jdbc

:::note
clickhouse-jdbc-bridge には実験的なコードが含まれており、もはやサポートされていません。信頼性の問題やセキュリティの脆弱性が含まれている可能性があります。自己責任で使用してください。
ClickHouse では、アドホッククエリシナリオ (Postgres、MySQL、MongoDB など) に対してより良い代替手段を提供する ClickHouse の組み込みテーブル関数の使用を推奨します。
:::

`jdbc(datasource, schema, table)` - JDBC ドライバを介して接続されるテーブルを返します。

このテーブル関数は、別途 [clickhouse-jdbc-bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge) プログラムが実行されている必要があります。
Nullable 型をサポートしています（クエリ対象のリモートテーブルの DDL に基づきます）。

**例**

``` sql
SELECT * FROM jdbc('jdbc:mysql://localhost:3306/?user=root&password=root', 'schema', 'table')
```

``` sql
SELECT * FROM jdbc('mysql://localhost:3306/?user=root&password=root', 'select * from schema.table')
```

``` sql
SELECT * FROM jdbc('mysql-dev?p1=233', 'num Int32', 'select toInt32OrZero(''{{p1}}'') as num')
```

``` sql
SELECT *
FROM jdbc('mysql-dev?p1=233', 'num Int32', 'select toInt32OrZero(''{{p1}}'') as num')
```

``` sql
SELECT a.datasource AS server1, b.datasource AS server2, b.name AS db
FROM jdbc('mysql-dev?datasource_column', 'show databases') a
INNER JOIN jdbc('self?datasource_column', 'show databases') b ON a.Database = b.name
```
