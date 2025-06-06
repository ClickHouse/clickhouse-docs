---
'description': '返回一个通过 JDBC 驱动程序连接的表。'
'sidebar_label': 'jdbc'
'sidebar_position': 100
'slug': '/sql-reference/table-functions/jdbc'
'title': 'jdbc'
---


# jdbc 表函数

:::note
clickhouse-jdbc-bridge 包含实验性代码，并且不再支持。它可能包含可靠性问题和安全漏洞。请自行承担风险使用它。 
ClickHouse 推荐使用 ClickHouse 内置的表函数，这为临时查询场景（如 Postgres、MySQL、MongoDB 等）提供了更好的替代方案。
:::

`jdbc(datasource, schema, table)` - 返回通过 JDBC 驱动程序连接的表。

此表函数需要单独运行 [clickhouse-jdbc-bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge) 程序。
它支持 Nullable 类型（基于查询的远程表的 DDL）。

## 示例 {#examples}

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
