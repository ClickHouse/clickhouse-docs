---
slug: /integrations/mysql
sidebar_label: 'MySQL'
title: 'MySQL'
hide_title: true
description: 'Страница, описывающая интеграцию с MySQL'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
  - website: 'https://github.com/ClickHouse/clickhouse'
keywords: ['mysql', 'интеграция с базой данных', 'внешняя таблица', 'источник данных', 'SQL-база данных']
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# Интеграция MySQL с ClickHouse

На этой странице рассматривается использование табличного движка `MySQL` для чтения данных из таблицы MySQL.

:::note
В ClickHouse Cloud вы также можете использовать [MySQL ClickPipe](/integrations/clickpipes/mysql) (в настоящее время в режиме публичного бета-тестирования), чтобы упростить перенос данных из ваших таблиц MySQL в ClickHouse.
:::



## Подключение ClickHouse к MySQL с использованием табличного движка MySQL

Табличный движок `MySQL` позволяет подключить ClickHouse к MySQL. Операторы **SELECT** и **INSERT** могут выполняться как из ClickHouse, так и непосредственно в таблице MySQL. В этой статье рассмотрены базовые способы использования табличного движка `MySQL`.

### 1. Настройка MySQL

1. Создайте базу данных в MySQL:

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

3. Добавьте несколько строк‑примеров:

```sql
INSERT INTO db1.table1
  (id, column1)
VALUES
  (1, 'abc'),
  (2, 'def'),
  (3, 'ghi');
```

4. Создайте пользователя для подключения к ClickHouse:

```sql
CREATE USER 'mysql_clickhouse'@'%' IDENTIFIED BY 'Password123!';
```

5. Предоставьте необходимые привилегии. (В демонстрационных целях пользователю `mysql_clickhouse` предоставляются административные привилегии.)

```sql
GRANT ALL PRIVILEGES ON *.* TO 'mysql_clickhouse'@'%';
```

:::note
Если вы используете эту возможность в ClickHouse Cloud, возможно, вам потребуется разрешить IP-адресам ClickHouse Cloud доступ к вашему экземпляру MySQL.
Обратитесь к ClickHouse [Cloud Endpoints API](//cloud/get-started/query-endpoints.md) для получения сведений об исходящем трафике.
:::

### 2. Определите таблицу в ClickHouse

1. Теперь давайте создадим таблицу ClickHouse, которая использует движок таблицы `MySQL`:

```sql
CREATE TABLE mysql_table1 (
  id UInt64,
  column1 String
)
ENGINE = MySQL('mysql-host.domain.com','db1','table1','mysql_clickhouse','Password123!')
```

Минимальный набор параметров:

| parameter | Description                              | example               |
| --------- | ---------------------------------------- | --------------------- |
| host      | имя хоста или IP                         | mysql-host.domain.com |
| database  | имя базы данных MySQL                    | db1                   |
| table     | имя таблицы MySQL                        | table1                |
| user      | имя пользователя для подключения к MySQL | mysql&#95;clickhouse  |
| password  | пароль для подключения к MySQL           | Password123!          |

:::note
См. страницу документации [MySQL table engine](/engines/table-engines/integrations/mysql.md) для полного списка параметров.
:::

### 3. Протестируйте интеграцию

1. В MySQL вставьте пример строки:

```sql
INSERT INTO db1.table1
  (id, column1)
VALUES
  (4, 'jkl');
```

2. Обратите внимание, что таблица ClickHouse теперь содержит существующие записи из таблицы MySQL, а также новую запись, которую вы только что добавили:

```sql
SELECT
    id,
    column1
FROM mysql_table1
```

Должны отобразиться 4 строки:

```response
Query id: 6d590083-841e-4e95-8715-ef37d3e95197

┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
│  3 │ ghi     │
│  4 │ jkl     │
└────┴─────────┘

Получено 4 строк. Затрачено: 0,044 сек.
```

3. Добавим строку в таблицу ClickHouse:

```sql
INSERT INTO mysql_table1
  (id, column1)
VALUES
  (5,'mno')
```

4. Обратите внимание, что в MySQL появилась новая запись:

```bash
mysql> select id,column1 from db1.table1;
```

Теперь вы должны увидеть новую строку:

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
5 rows in set (0.01 sec)
```

### Итоги


Движок таблицы `MySQL` позволяет подключить ClickHouse к MySQL для двустороннего обмена данными. Подробности смотрите на странице документации по [движку таблицы `MySQL`](/sql-reference/table-functions/mysql.md).
