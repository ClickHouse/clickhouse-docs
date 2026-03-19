---
slug: /sql-reference/statements/create/dictionary/sources/mongodb
title: 'Источник словаря MongoDB'
sidebar_position: 9
sidebar_label: 'MongoDB'
description: 'Настройка MongoDB в качестве источника словаря в ClickHouse.'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Пример настроек:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(MONGODB(
        host 'localhost'
        port 27017
        user ''
        password ''
        db 'test'
        collection 'dictionary_source'
        options 'ssl=true'
    ))
    ```

    Или с использованием URI:

    ```sql
    SOURCE(MONGODB(
        uri 'mongodb://localhost:27017/clickhouse'
        collection 'dictionary_source'
    ))
    ```
  </TabItem>

  <TabItem value="xml" label="Файл конфигурации">
    ```xml
    <source>
        <mongodb>
            <host>localhost</host>
            <port>27017</port>
            <user></user>
            <password></password>
            <db>test</db>
            <collection>dictionary_source</collection>
            <options>ssl=true</options>
        </mongodb>
    </source>
    ```

    Или с использованием URI:

    ```xml
    <source>
        <mongodb>
            <uri>mongodb://localhost:27017/test?ssl=true</uri>
            <collection>dictionary_source</collection>
        </mongodb>
    </source>
    ```
  </TabItem>
</Tabs>

<br />

Поля настроек:

| Setting      | Description                                                                   |
| ------------ | ----------------------------------------------------------------------------- |
| `host`       | Хост MongoDB.                                                                 |
| `port`       | Порт сервера MongoDB.                                                         |
| `user`       | Имя пользователя MongoDB.                                                     |
| `password`   | Пароль пользователя MongoDB.                                                  |
| `db`         | Имя базы данных.                                                              |
| `collection` | Имя коллекции.                                                                |
| `options`    | Параметры строки подключения MongoDB. Необязательный параметр.                |
| `uri`        | URI для установления подключения (альтернатива отдельным полям host/port/db). |

[Подробнее о движке](/engines/table-engines/integrations/mongodb)
