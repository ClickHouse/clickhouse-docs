---
slug: /sql-reference/statements/create/dictionary/sources/local-file
title: 'Источник словаря из локального файла'
sidebar_position: 2
sidebar_label: 'Локальный файл'
description: 'Настройка локального файла как источника словаря в ClickHouse.'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Локальный файловый источник загружает данные словаря из файла в локальной файловой системе. Это полезно для небольших статических таблиц соответствия, которые могут храниться как плоские файлы в форматах, таких как TSV, CSV или любом другом [поддерживаемом формате](/sql-reference/formats).

Пример настроек:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(FILE(path './user_files/os.tsv' format 'TabSeparated'))
    ```
  </TabItem>

  <TabItem value="xml" label="Файл конфигурации">
    ```xml
    <source>
      <file>
        <path>/opt/dictionaries/os.tsv</path>
        <format>TabSeparated</format>
      </file>
    </source>
    ```
  </TabItem>
</Tabs>

<br />

Поля настроек:

| Setting  | Description                                                                                      |
| -------- | ------------------------------------------------------------------------------------------------ |
| `path`   | Абсолютный путь к файлу.                                                                         |
| `format` | Формат файла. Поддерживаются все форматы, описанные в разделе [Formats](/sql-reference/formats). |

Когда словарь с источником `FILE` создаётся с помощью DDL-команды (`CREATE DICTIONARY ...`), исходный файл должен находиться в каталоге `user_files`, чтобы предотвратить доступ пользователей БД к произвольным файлам на сервере ClickHouse.

**См. также**

* [Функция `dictionary`](/sql-reference/table-functions/dictionary)
