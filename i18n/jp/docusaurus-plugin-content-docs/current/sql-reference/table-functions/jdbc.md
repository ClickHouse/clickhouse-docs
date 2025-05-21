---
description: 'JDBCドライバー経由で接続されているテーブルを返します。'
sidebar_label: 'jdbc'
sidebar_position: 100
slug: /sql-reference/table-functions/jdbc
title: 'jdbc'
---


# jdbc テーブル関数

:::note
clickhouse-jdbc-bridge には実験的なコードが含まれており、もはやサポートされていません。信頼性の問題やセキュリティの脆弱性がある可能性があります。自己責任で使用してください。 
ClickHouseでは、アドホッククエリシナリオに対してより良い代替手段を提供するClickHouseの組み込みテーブル関数を使用することを推奨しています（Postgres, MySQL, MongoDBなど）。
:::

`jdbc(datasource, schema, table)` - JDBCドライバー経由で接続されているテーブルを返します。

このテーブル関数は、別の [clickhouse-jdbc-bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge) プログラムが実行されている必要があります。
Nullableタイプをサポートしています（クエリされるリモートテーブルのDDLに基づきます）。

**例**

```sql
SELECT * FROM jdbc('jdbc:mysql://localhost:3306/?user=root&password=root', 'schema', 'table')
```

```sql
SELECT * FROM jdbc('mysql://localhost:3306/?user=root&password=root', 'select * from schema.table')
```

```sql
SELECT * FROM jdbc('mysql-dev?p1=233', 'num Int32', 'select toInt32OrZero(''{{p1}}'') as num')
```

```sql
SELECT *
FROM jdbc('mysql-dev?p1=233', 'num Int32', 'select toInt32OrZero(''{{p1}}'') as num')
```

```sql
SELECT a.datasource AS server1, b.datasource AS server2, b.name AS db
FROM jdbc('mysql-dev?datasource_column', 'show databases') a
INNER JOIN jdbc('self?datasource_column', 'show databases') b ON a.Database = b.name
```
