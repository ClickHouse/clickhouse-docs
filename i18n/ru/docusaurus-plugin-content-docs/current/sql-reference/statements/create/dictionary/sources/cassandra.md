---
slug: /sql-reference/statements/create/dictionary/sources/cassandra
title: 'Источник словаря Cassandra'
sidebar_position: 11
sidebar_label: 'Cassandra'
description: 'Настройка Cassandra в качестве источника словаря в ClickHouse.'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Пример настроек:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(CASSANDRA(
        host 'localhost'
        port 9042
        user 'username'
        password 'qwerty123'
        keyspace 'database_name'
        column_family 'table_name'
        allow_filtering 1
        partition_key_prefix 1
        consistency 'One'
        where '"SomeColumn" = 42'
        max_threads 8
        query 'SELECT id, value_1, value_2 FROM database_name.table_name'
    ))
    ```
  </TabItem>

  <TabItem value="xml" label="Файл конфигурации">
    ```xml
    <source>
        <cassandra>
            <host>localhost</host>
            <port>9042</port>
            <user>username</user>
            <password>qwerty123</password>
            <keyspase>database_name</keyspase>
            <column_family>table_name</column_family>
            <allow_filtering>1</allow_filtering>
            <partition_key_prefix>1</partition_key_prefix>
            <consistency>One</consistency>
            <where>"SomeColumn" = 42</where>
            <max_threads>8</max_threads>
            <query>SELECT id, value_1, value_2 FROM database_name.table_name</query>
        </cassandra>
    </source>
    ```
  </TabItem>
</Tabs>

Поля настроек:

| Setting                | Description                                                                                                                                                                                                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `host`                 | Хост Cassandra или список хостов, разделённых запятыми.                                                                                                                                                                                                                                                             |
| `port`                 | Порт на серверах Cassandra. Если не указан, используется порт по умолчанию `9042`.                                                                                                                                                                                                                                  |
| `user`                 | Имя пользователя Cassandra.                                                                                                                                                                                                                                                                                         |
| `password`             | Пароль пользователя Cassandra.                                                                                                                                                                                                                                                                                      |
| `keyspace`             | Имя keyspace (базы данных).                                                                                                                                                                                                                                                                                         |
| `column_family`        | Имя column family (таблицы).                                                                                                                                                                                                                                                                                        |
| `allow_filtering`      | Флаг, разрешающий или запрещающий потенциально дорогостоящие условия по столбцам ключа кластеризации. Значение по умолчанию — `1`.                                                                                                                                                                                  |
| `partition_key_prefix` | Количество столбцов ключа партиции в первичном ключе таблицы Cassandra. Обязателен для словарей с составным ключом. Порядок ключевых столбцов в определении словаря должен совпадать с порядком в Cassandra. Значение по умолчанию — `1` (первый ключевой столбец — ключ партиции, остальные — ключ кластеризации). |
| `consistency`          | Уровень консистентности. Возможные значения: `One`, `Two`, `Three`, `All`, `EachQuorum`, `Quorum`, `LocalQuorum`, `LocalOne`, `Serial`, `LocalSerial`. Значение по умолчанию — `One`.                                                                                                                               |
| `where`                | Необязательные критерии отбора.                                                                                                                                                                                                                                                                                     |
| `max_threads`          | Максимальное количество потоков для загрузки данных из нескольких партиций в словарях с составным ключом.                                                                                                                                                                                                           |
| `query`                | Пользовательский запрос. Необязательный параметр.                                                                                                                                                                                                                                                                   |

:::note
Поля `column_family` или `where` не могут использоваться вместе с полем `query`. При этом одно из полей `column_family` или `query` должно быть объявлено.
:::
