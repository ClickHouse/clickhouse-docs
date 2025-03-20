---
slug: /sql-reference/table-functions/jdbc
sidebar_position: 100
sidebar_label: jdbc
title: 'jdbc'
description: 'Возвращает таблицу, которая подключена через JDBC драйвер.'
---


# Функция таблицы jdbc

:::note
clickhouse-jdbc-bridge содержит экспериментальный код и больше не поддерживается. Он может содержать проблемы с надежностью и уязвимости в безопасности. Используйте его на свой страх и риск. 
ClickHouse рекомендует использовать встроенные функции таблицы в ClickHouse, которые предлагают лучшую альтернативу для сценариев выборки данных (Postgres, MySQL, MongoDB и др.).
:::

`jdbc(datasource, schema, table)` - возвращает таблицу, которая подключена через JDBC драйвер.

Эта функция таблицы требует отдельную программу [clickhouse-jdbc-bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge), которая должна быть запущена.
Она поддерживает Nullable типы (на основе DDL удаленной таблицы, к которой выполняется запрос).

**Примеры**

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
