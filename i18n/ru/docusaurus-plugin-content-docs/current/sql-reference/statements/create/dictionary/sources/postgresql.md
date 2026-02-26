---
slug: /sql-reference/statements/create/dictionary/sources/postgresql
title: 'Источник словаря PostgreSQL'
sidebar_position: 12
sidebar_label: 'PostgreSQL'
description: 'Настройка PostgreSQL как источника словаря в ClickHouse.'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Пример настроек:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(POSTGRESQL(
        port 5432
        host 'postgresql-hostname'
        user 'postgres_user'
        password 'postgres_password'
        db 'db_name'
        table 'table_name'
        replica(host 'example01-1' port 5432 priority 1)
        replica(host 'example01-2' port 5432 priority 2)
        where 'id=10'
        invalidate_query 'SQL_QUERY'
        query 'SELECT id, value_1, value_2 FROM db_name.table_name'
    ))
    ```
  </TabItem>

  <TabItem value="xml" label="Файл конфигурации">
    ```xml
    <source>
      <postgresql>
          <host>postgresql-hostname</hoat>
          <port>5432</port>
          <user>clickhouse</user>
          <password>qwerty</password>
          <db>db_name</db>
          <table>table_name</table>
          <where>id=10</where>
          <invalidate_query>SQL_QUERY</invalidate_query>
          <query>SELECT id, value_1, value_2 FROM db_name.table_name</query>
      </postgresql>
    </source>
    ```
  </TabItem>
</Tabs>

<br />

Поля настроек:

| Setting                | Description                                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `host`                 | Хост на сервере PostgreSQL. Можно задать один хост для всех реплик или указать его для каждой реплики отдельно (внутри `<replica>`).                   |
| `port`                 | Порт на сервере PostgreSQL. Можно задать один порт для всех реплик или указать его для каждой реплики отдельно (внутри `<replica>`).                   |
| `user`                 | Имя пользователя PostgreSQL. Можно задать одного пользователя для всех реплик или указать его для каждой реплики отдельно (внутри `<replica>`).        |
| `password`             | Пароль пользователя PostgreSQL. Можно задать один пароль для всех реплик или указать его для каждой реплики отдельно (внутри `<replica>`).             |
| `replica`              | Секция настроек реплик. Секций может быть несколько.                                                                                                   |
| `replica/host`         | Хост PostgreSQL.                                                                                                                                       |
| `replica/port`         | Порт PostgreSQL.                                                                                                                                       |
| `replica/priority`     | Приоритет реплики. При попытке подключения ClickHouse обходит реплики в порядке приоритета. Чем меньше число, тем выше приоритет.                      |
| `db`                   | Имя базы данных.                                                                                                                                       |
| `table`                | Имя таблицы.                                                                                                                                           |
| `where`                | Условие выбора данных. Синтаксис условий такой же, как для предложения `WHERE` в PostgreSQL. Например, `id > 10 AND id < 20`. Необязательный параметр. |
| `invalidate_query`     | Запрос для проверки состояния словаря. Необязательный параметр. Подробнее см. раздел [Refreshing dictionary data using LIFETIME](../lifetime.md).      |
| `background_reconnect` | Переподключение к реплике в фоновом режиме при сбое соединения. Необязательный параметр.                                                               |
| `query`                | Произвольный запрос. Необязательный параметр.                                                                                                          |

:::note
Поля `table` или `where` нельзя использовать вместе с полем `query`. При этом одно из полей `table` или `query` должно быть указано.
:::
