---
description: 'JDBC ドライバーを介して接続されたテーブルを返します。'
sidebar_label: 'jdbc'
sidebar_position: 100
slug: /sql-reference/table-functions/jdbc
title: 'jdbc'
doc_type: 'reference'
---

# JDBC テーブル関数 {#jdbc-table-function}

:::note
clickhouse-jdbc-bridge には実験的なコードが含まれており、すでにサポート対象外です。信頼性の問題やセキュリティ上の脆弱性を含んでいる可能性があります。自己責任で使用してください。\
ClickHouse では、アドホックなクエリシナリオ（Postgres、MySQL、MongoDB など）に対してより優れた代替手段を提供する、ClickHouse に組み込まれたテーブル関数の利用を推奨します。
:::

JDBC テーブル関数は、JDBC ドライバー経由で接続されたテーブルを返すテーブル関数です。

このテーブル関数を使用するには、別途 [clickhouse-jdbc-bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge) プログラムを起動しておく必要があります。\
リモートテーブル（クエリ対象）の DDL に基づいて Nullable 型をサポートします。

## 構文 {#syntax}

```sql
jdbc(datasource, external_database, external_table)
jdbc(datasource, external_table)
jdbc(named_collection)
```

## 例 {#examples}

外部データベース名の代わりにスキーマを指定することもできます。

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
