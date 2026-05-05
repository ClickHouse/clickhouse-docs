---
slug: /sql-reference/statements/create/dictionary/sources/redis
title: 'Источник словаря Redis'
sidebar_position: 10
sidebar_label: 'Redis'
description: 'Настройка Redis в качестве источника словаря в ClickHouse.'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Пример настроек:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(REDIS(
        host 'localhost'
        port 6379
        storage_type 'simple'
        db_index 0
    ))
    ```
  </TabItem>

  <TabItem value="xml" label="Файл конфигурации">
    ```xml
    <source>
        <redis>
            <host>localhost</host>
            <port>6379</port>
            <storage_type>simple</storage_type>
            <db_index>0</db_index>
        </redis>
    </source>
    ```
  </TabItem>
</Tabs>

<br />

Поля настроек:

| Setting        | Description                                                                                                                                                                                                                                                                                                                                                      |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `host`         | Хост Redis.                                                                                                                                                                                                                                                                                                                                                      |
| `port`         | Порт сервера Redis.                                                                                                                                                                                                                                                                                                                                              |
| `storage_type` | Структура внутреннего хранилища Redis, используемая для работы с ключами. `simple` предназначен для простых источников и хешированных источников с одним ключом, `hash_map` — для хешированных источников с двумя ключами. Диапазонные источники и кэш-источники со сложным ключом не поддерживаются. Значение по умолчанию — `simple`. Необязательный параметр. |
| `db_index`     | Числовой индекс логической базы данных Redis. Значение по умолчанию — `0`. Необязательный параметр.                                                                                                                                                                                                                                                              |
