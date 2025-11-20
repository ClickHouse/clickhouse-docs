---
slug: /integrations/mysql
sidebar_label: 'MySQL'
title: 'MySQL'
hide_title: true
description: 'Страница, посвящённая интеграции с MySQL'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
  - website: 'https://github.com/ClickHouse/clickhouse'
keywords: ['mysql', 'database integration', 'external table', 'data source', 'sql database']
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# Интеграция MySQL с ClickHouse

На этой странице описывается использование движка таблиц `MySQL` для чтения данных из таблицы MySQL.

:::note
В ClickHouse Cloud вы также можете использовать [MySQL ClickPipe](/integrations/clickpipes/mysql) (в настоящее время в режиме публичной беты), чтобы легко переносить данные из таблиц MySQL в ClickHouse.
:::



## Подключение ClickHouse к MySQL с использованием движка таблиц MySQL {#connecting-clickhouse-to-mysql-using-the-mysql-table-engine}

Движок таблиц `MySQL` позволяет подключить ClickHouse к MySQL. Операторы **SELECT** и **INSERT** могут выполняться как в ClickHouse, так и в таблице MySQL. В этой статье описаны основные методы использования движка таблиц `MySQL`.

### 1. Настройка MySQL {#1-configure-mysql}

1.  Создайте базу данных в MySQL:

```sql
CREATE DATABASE db1;
```

2. Создайте таблицу:

```sql
CREATE TABLE db1.table1 (
  id INT,
  column1 VARCHAR(255)
);
```

3. Вставьте тестовые строки:

```sql
INSERT INTO db1.table1
  (id, column1)
VALUES
  (1, 'abc'),
  (2, 'def'),
  (3, 'ghi');
```

4. Создайте пользователя для подключения из ClickHouse:

```sql
CREATE USER 'mysql_clickhouse'@'%' IDENTIFIED BY 'Password123!';
```

5. Предоставьте необходимые привилегии. (В демонстрационных целях пользователю `mysql_clickhouse` предоставлены права администратора.)

```sql
GRANT ALL PRIVILEGES ON *.* TO 'mysql_clickhouse'@'%';
```

:::note
Если вы используете эту функцию в ClickHouse Cloud, возможно, потребуется разрешить IP-адресам ClickHouse Cloud доступ к вашему экземпляру MySQL.
Проверьте [Cloud Endpoints API](//cloud/get-started/query-endpoints.md) ClickHouse для получения информации об исходящем трафике.
:::

### 2. Определение таблицы в ClickHouse {#2-define-a-table-in-clickhouse}

1. Теперь создадим таблицу ClickHouse, использующую движок таблиц `MySQL`:

```sql
CREATE TABLE mysql_table1 (
  id UInt64,
  column1 String
)
ENGINE = MySQL('mysql-host.domain.com','db1','table1','mysql_clickhouse','Password123!')
```

Минимальные параметры:

| параметр | Описание                     | пример                |
| -------- | ---------------------------- | --------------------- |
| host     | имя хоста или IP             | mysql-host.domain.com |
| database | имя базы данных MySQL        | db1                   |
| table    | имя таблицы MySQL            | table1                |
| user     | имя пользователя для подключения к MySQL | mysql_clickhouse      |
| password | пароль для подключения к MySQL | Password123!          |

:::note
Полный список параметров см. на странице документации [движка таблиц MySQL](/engines/table-engines/integrations/mysql.md).
:::

### 3. Тестирование интеграции {#3-test-the-integration}

1. В MySQL вставьте тестовую строку:

```sql
INSERT INTO db1.table1
  (id, column1)
VALUES
  (4, 'jkl');
```

2. Обратите внимание, что существующие строки из таблицы MySQL находятся в таблице ClickHouse вместе с только что добавленной новой строкой:

```sql
SELECT
    id,
    column1
FROM mysql_table1
```

Вы должны увидеть 4 строки:

```response
Query id: 6d590083-841e-4e95-8715-ef37d3e95197

┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
│  3 │ ghi     │
│  4 │ jkl     │
└────┴─────────┘

4 строки в наборе. Затрачено: 0.044 сек.
```

3. Добавим строку в таблицу ClickHouse:

```sql
INSERT INTO mysql_table1
  (id, column1)
VALUES
  (5,'mno')
```

4.  Обратите внимание, что новая строка появилась в MySQL:

```bash
mysql> select id,column1 from db1.table1;
```

Вы должны увидеть новую строку:

```response
+------+---------+
| id   | column1 |
+------+---------+
|    1 | abc     |
|    2 | def     |
|    3 | ghi     |
|    4 | jkl     |
|    5 | mno     |
+------+---------+
5 строк в наборе (0.01 сек)
```

### Резюме {#summary}


Движок таблиц `MySQL` позволяет подключить ClickHouse к MySQL для двустороннего обмена данными. За дополнительными сведениями обратитесь к странице документации по [движку таблиц MySQL](/sql-reference/table-functions/mysql.md).
