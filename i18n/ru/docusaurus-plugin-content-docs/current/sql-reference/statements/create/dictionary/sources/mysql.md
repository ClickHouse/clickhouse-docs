---
slug: /sql-reference/statements/create/dictionary/sources/mysql
title: 'Источник словаря MySQL'
sidebar_position: 7
sidebar_label: 'MySQL'
description: 'Настройка MySQL в качестве источника словаря в ClickHouse.'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Пример настроек:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(MYSQL(
        port 3306
        user 'clickhouse'
        password 'qwerty'
        replica(host 'example01-1' priority 1)
        replica(host 'example01-2' priority 1)
        db 'db_name'
        table 'table_name'
        where 'id=10'
        invalidate_query 'SQL_QUERY'
        fail_on_connection_loss 'true'
        query 'SELECT id, value_1, value_2 FROM db_name.table_name'
    ))
    ```
  </TabItem>

  <TabItem value="xml" label="Файл конфигурации">
    ```xml
    <source>
      <mysql>
          <port>3306</port>
          <user>clickhouse</user>
          <password>qwerty</password>
          <replica>
              <host>example01-1</host>
              <priority>1</priority>
          </replica>
          <replica>
              <host>example01-2</host>
              <priority>1</priority>
          </replica>
          <db>db_name</db>
          <table>table_name</table>
          <where>id=10</where>
          <invalidate_query>SQL_QUERY</invalidate_query>
          <fail_on_connection_loss>true</fail_on_connection_loss>
          <query>SELECT id, value_1, value_2 FROM db_name.table_name</query>
      </mysql>
    </source>
    ```
  </TabItem>
</Tabs>

<br />

Поля настроек:

| Setting                   | Description                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `port`                    | Порт на сервере MySQL. Вы можете указать его для всех реплик или для каждой реплики отдельно (внутри `<replica>`).                                                                                                                                                                                                                                                                 |
| `user`                    | Имя пользователя MySQL. Вы можете указать его для всех реплик или для каждой реплики отдельно (внутри `<replica>`).                                                                                                                                                                                                                                                                |
| `password`                | Пароль пользователя MySQL. Вы можете указать его для всех реплик или для каждой реплики отдельно (внутри `<replica>`).                                                                                                                                                                                                                                                             |
| `replica`                 | Секция конфигураций реплик. Может быть несколько таких секций.                                                                                                                                                                                                                                                                                                                     |
| `replica/host`            | Хост MySQL.                                                                                                                                                                                                                                                                                                                                                                        |
| `replica/priority`        | Приоритет реплики. При попытке установить подключение ClickHouse перебирает реплики в порядке приоритета. Чем меньше число, тем выше приоритет.                                                                                                                                                                                                                                    |
| `db`                      | Имя базы данных.                                                                                                                                                                                                                                                                                                                                                                   |
| `table`                   | Имя таблицы.                                                                                                                                                                                                                                                                                                                                                                       |
| `where`                   | Критерий выбора. Синтаксис условий такой же, как для секции `WHERE` в MySQL, например, `id > 10 AND id < 20`. Необязательный параметр.                                                                                                                                                                                                                                             |
| `invalidate_query`        | Запрос для проверки статуса словаря. Необязательный параметр. Подробности см. в разделе [Обновление данных словаря с помощью LIFETIME](../lifetime.md).                                                                                                                                                                                                                            |
| `fail_on_connection_loss` | Управляет поведением сервера при потере соединения. Если `true`, исключение выбрасывается немедленно, если соединение между клиентом и сервером было потеряно. Если `false`, сервер ClickHouse пытается выполнить запрос три раза, прежде чем выбросить исключение. Обратите внимание, что повторные попытки приводят к увеличению времени ответа. Значение по умолчанию: `false`. |
| `query`                   | Пользовательский запрос. Необязательный параметр.                                                                                                                                                                                                                                                                                                                                  |

:::note
Поля `table` или `where` нельзя использовать совместно с полем `query`. При этом одно из полей `table` или `query` должно быть объявлено.
:::

:::note
Явного параметра `secure` не существует. При установке SSL-подключения использование защищённого соединения обязательно.
:::

К серверу MySQL можно подключиться на локальном хосте через сокеты. Для этого задайте `host` и `socket`.

Пример настроек:


<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
SOURCE(MYSQL(
    host 'localhost'
    socket '/path/to/socket/file.sock'
    user 'clickhouse'
    password 'qwerty'
    db 'db_name'
    table 'table_name'
    where 'id=10'
    invalidate_query 'SQL_QUERY'
    fail_on_connection_loss 'true'
    query 'SELECT id, value_1, value_2 FROM db_name.table_name'
))
```

</TabItem>
<TabItem value="xml" label="Файл конфигурации">

```xml
<source>
  <mysql>
      <host>localhost</host>
      <socket>/path/to/socket/file.sock</socket>
      <user>clickhouse</user>
      <password>qwerty</password>
      <db>db_name</db>
      <table>table_name</table>
      <where>id=10</where>
      <invalidate_query>SQL_QUERY</invalidate_query>
      <fail_on_connection_loss>true</fail_on_connection_loss>
      <query>SELECT id, value_1, value_2 FROM db_name.table_name</query>
  </mysql>
</source>
```

</TabItem>
</Tabs>