---
description: 'Возвращает таблицу, подключённую через JDBC-драйвер.'
sidebar_label: 'jdbc'
sidebar_position: 100
slug: /sql-reference/table-functions/jdbc
title: 'jdbc'
doc_type: 'reference'
---

# Табличная функция jdbc {#jdbc-table-function}

:::note
clickhouse-jdbc-bridge содержит экспериментальный код и больше не поддерживается. В нём могут быть проблемы с надёжностью и уязвимости в области безопасности. Используйте его на свой страх и риск.
ClickHouse рекомендует использовать встроенные табличные функции в ClickHouse, которые являются более удобной альтернативой для сценариев разовых запросов (Postgres, MySQL, MongoDB и т. д.).
:::

Табличная функция JDBC возвращает таблицу, которая подключена через JDBC-драйвер.

Для работы этой табличной функции требуется отдельная программа [clickhouse-jdbc-bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge).
Она поддерживает типы Nullable (на основе DDL удалённой таблицы, к которой выполняется запрос).

## Синтаксис {#syntax}

```sql
jdbc(источник_данных, внешняя_база_данных, внешняя_таблица)
jdbc(источник_данных, внешняя_таблица)
jdbc(именованная_коллекция)
```

## Примеры {#examples}

Вместо имени внешней базы данных можно указать схему:

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
