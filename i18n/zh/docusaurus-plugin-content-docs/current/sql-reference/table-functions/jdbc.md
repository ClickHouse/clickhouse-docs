---
description: '返回一个通过 JDBC 驱动访问的表。'
sidebar_label: 'jdbc'
sidebar_position: 100
slug: /sql-reference/table-functions/jdbc
title: 'jdbc'
doc_type: 'reference'
---



# jdbc 表函数

:::note
clickhouse-jdbc-bridge 包含实验性代码且已不再受支持。它可能存在可靠性问题和安全漏洞。使用时请自行承担风险。  
ClickHouse 建议使用 ClickHouse 内置的表函数，它们为临时查询场景（Postgres、MySQL、MongoDB 等）提供了更好的替代方案。
:::

JDBC 表函数返回一个通过 JDBC 驱动连接的表。

此表函数依赖单独运行的 [clickhouse-jdbc-bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge) 程序。  
它支持 Nullable 类型（基于被查询的远程表的 DDL）。



## 语法

```sql
jdbc(datasource, external_database, external_table)
jdbc(datasource, external_table)
jdbc(named_collection)
```


## 示例

可以指定 `schema`，而不是使用外部数据库名称：

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
