---
slug: /sql-reference/table-functions/jdbc
sidebar_position: 100
sidebar_label: jdbc
title: "jdbc"
description: "JDBCドライバーを介して接続されたテーブルを返します。"
---


# jdbc テーブル関数

:::note
clickhouse-jdbc-bridge には実験的なコードが含まれていて、もはやサポートされていません。信頼性の問題やセキュリティの脆弱性を含む可能性があります。自己の責任において使用してください。  
ClickHouse は、アドホッククエリシナリオ（Postgres、MySQL、MongoDB など）に対してより良い代替手段を提供する、ClickHouse に組み込まれたテーブル関数の使用を推奨します。
:::

`jdbc(datasource, schema, table)` - JDBC ドライバーを介して接続されたテーブルを返します。

このテーブル関数は、別の [clickhouse-jdbc-bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge) プログラムが実行されている必要があります。  
Nullable タイプをサポートしています（クエリされるリモートテーブルの DDL に基づく）。

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
