---
slug: /sql-reference/statements/create/dictionary/sources/clickhouse
title: 'Источник словаря ClickHouse'
sidebar_position: 8
sidebar_label: 'ClickHouse'
description: 'Настройка таблицы ClickHouse как источника словаря.'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Пример настроек:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(CLICKHOUSE(
        host 'example01-01-1'
        port 9000
        user 'default'
        password ''
        db 'default'
        table 'ids'
        where 'id=10'
        secure 1
        query 'SELECT id, value_1, value_2 FROM default.ids'
    ));
    ```
  </TabItem>

  <TabItem value="xml" label="Файл конфигурации">
    ```xml
    <source>
        <clickhouse>
            <host>example01-01-1</host>
            <port>9000</port>
            <user>default</user>
            <password></password>
            <db>default</db>
            <table>ids</table>
            <where>id=10</where>
            <secure>1</secure>
            <query>SELECT id, value_1, value_2 FROM default.ids</query>
        </clickhouse>
    </source>
    ```
  </TabItem>
</Tabs>

<br />

Поля настроек:

| Setting            | Description                                                                                                                                                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `host`             | Хост ClickHouse. Если это локальный хост, запрос обрабатывается без какой-либо сетевой активности. Для повышения отказоустойчивости вы можете создать таблицу [Distributed](/engines/table-engines/special/distributed) и указать её в дальнейшей конфигурации. |
| `port`             | Порт на сервере ClickHouse.                                                                                                                                                                                                                                     |
| `user`             | Имя пользователя ClickHouse.                                                                                                                                                                                                                                    |
| `password`         | Пароль пользователя ClickHouse.                                                                                                                                                                                                                                 |
| `db`               | Имя базы данных.                                                                                                                                                                                                                                                |
| `table`            | Имя таблицы.                                                                                                                                                                                                                                                    |
| `where`            | Критерий выборки. Необязательный параметр.                                                                                                                                                                                                                      |
| `invalidate_query` | Запрос для проверки состояния словаря. Необязательный параметр. Подробнее см. раздел [Refreshing dictionary data using LIFETIME](../lifetime.md#refreshing-dictionary-data-using-lifetime).                                                                     |
| `secure`           | Использовать SSL для подключения.                                                                                                                                                                                                                               |
| `query`            | Пользовательский запрос. Необязательный параметр.                                                                                                                                                                                                               |

:::note
Поля `table` и `where` не могут использоваться совместно с полем `query`. При этом одно из полей `table` или `query` должно быть объявлено.
:::
