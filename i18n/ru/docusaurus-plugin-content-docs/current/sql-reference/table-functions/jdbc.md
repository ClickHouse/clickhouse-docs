---
description: 'Возвращает таблицу, подключенную через JDBC-драйвер.'
sidebar_label: 'jdbc'
sidebar_position: 100
slug: /sql-reference/table-functions/jdbc
title: 'jdbc'
---


# Функция таблицы jdbc

:::note
clickhouse-jdbc-bridge содержит экспериментальный код и больше не поддерживается. Он может содержать проблемы надежности и уязвимости безопасности. Используйте его на свой страх и риск. 
ClickHouse рекомендует использовать встроенные функции таблиц в ClickHouse, которые предоставляют лучшую альтернативу для сценариев динамического выполнения запросов (Postgres, MySQL, MongoDB и т.д.).
:::

`jdbc(datasource, schema, table)` - возвращает таблицу, подключенную через JDBC-драйвер.

Эта функция таблицы требует, чтобы программа [clickhouse-jdbc-bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge) была запущена.
Она поддерживает Nullable типы (основанные на DDL удаленной таблицы, к которой выполняется запрос).

**Примеры**

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
