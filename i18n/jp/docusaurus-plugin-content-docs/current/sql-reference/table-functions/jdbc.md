---
'description': 'JDBCドライバーを介して接続されたテーブルを返します。'
'sidebar_label': 'jdbc'
'sidebar_position': 100
'slug': '/sql-reference/table-functions/jdbc'
'title': 'jdbc'
'doc_type': 'reference'
---


# jdbc テーブル関数

:::note
clickhouse-jdbc-bridge は実験的なコードを含んでおり、もはやサポートされていません。信頼性の問題やセキュリティの脆弱性を含む可能性があります。自己責任で使用してください。 
ClickHouse は、Postgres、MySQL、MongoDB などのアドホッククエリシナリオに対して、より良い代替手段を提供する ClickHouse 内蔵のテーブル関数を使用することを推奨します。
:::

JDBC テーブル関数は、JDBC ドライバを介して接続されたテーブルを返します。

このテーブル関数は、別途 [clickhouse-jdbc-bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge) プログラムが実行されている必要があります。
Nullable 型をサポートしており、クエリされるリモートテーブルの DDL に基づいています。

## 構文 {#syntax}

```sql
jdbc(datasource, external_database, external_table)
jdbc(datasource, external_table)
jdbc(named_collection)
```

## 例 {#examples}

外部データベース名の代わりにスキーマを指定できます：

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
