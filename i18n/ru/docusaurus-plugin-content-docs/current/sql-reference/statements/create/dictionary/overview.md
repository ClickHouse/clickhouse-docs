---
description: 'Документация по созданию и настройке словарей'
sidebar_label: 'Обзор'
sidebar_position: 1
slug: /sql-reference/statements/create/dictionary
title: 'CREATE DICTIONARY'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import CloudSupportedBadge from '@theme/badges/CloudSupportedBadge';


# CREATE DICTIONARY \{#create-dictionary\}

Словарь — это отображение вида (`key -> attributes`), удобное для различных типов справочников.
ClickHouse поддерживает специальные функции работы со словарями, которые можно использовать в запросах. Использовать словари через функции проще и эффективнее, чем выполнять `JOIN` со справочными таблицами.

Словари можно создавать двумя способами:

- [С помощью DDL-запроса](#creating-a-dictionary-with-a-ddl-query) (рекомендуется)
- [С помощью файла конфигурации](#creating-a-dictionary-with-a-configuration-file)

## Создание словаря с помощью DDL-запроса \{#creating-a-dictionary-with-a-ddl-query\}

<CloudSupportedBadge/>

Словари можно создавать с помощью DDL-запросов. 
Этот метод является рекомендуемым, поскольку для словарей, созданных с помощью DDL:

- В конфигурационные файлы сервера не добавляются дополнительные записи.
- Словари могут использоваться как полноценные сущности, такие как таблицы или представления.
- Данные можно читать напрямую, используя привычный синтаксис `SELECT`, а не табличные функции словаря. Обратите внимание, что при прямом доступе к словарю через оператор `SELECT` кэшируемый словарь вернет только данные из кэша, тогда как для некэшируемого словаря будут возвращены все данные, которые он хранит.
- Словари можно легко переименовывать.

### Синтаксис \{#syntax\}

```sql
CREATE [OR REPLACE] DICTIONARY [IF NOT EXISTS] [db.]dictionary_name [ON CLUSTER cluster]
(
    key1  type1  [DEFAULT | EXPRESSION expr1] [IS_OBJECT_ID],
    key2  type2  [DEFAULT | EXPRESSION expr2],
    attr1 type2  [DEFAULT | EXPRESSION expr3] [HIERARCHICAL|INJECTIVE],
    attr2 type2  [DEFAULT | EXPRESSION expr4] [HIERARCHICAL|INJECTIVE]
)
PRIMARY KEY key1, key2
SOURCE(SOURCE_NAME([param1 value1 ... paramN valueN]))
LAYOUT(LAYOUT_NAME([param_name param_value]))
LIFETIME({MIN min_val MAX max_val | max_val})
SETTINGS(setting_name = setting_value, setting_name = setting_value, ...)
COMMENT 'Comment'
```

| Clause                                      | Description                                                                                                                                                        |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Attributes](./attributes.md)               | Атрибуты словаря задаются аналогично столбцам таблицы. Единственным обязательным свойством является тип, все остальные свойства могут иметь значения по умолчанию. |
| PRIMARY KEY                                 | Определяет ключевой(ые) столбец(ы) для обращений к словарю. В зависимости от схемы размещения один или несколько атрибутов могут быть указаны как ключи.           |
| [`SOURCE`](./sources/)                      | Определяет источник данных для словаря (например, таблица ClickHouse, HTTP, PostgreSQL).                                                                           |
| [`LAYOUT`](./layouts/)                      | Определяет, как словарь хранится в памяти (например, `FLAT`, `HASHED`, `CACHE`).                                                                                   |
| [`LIFETIME`](./lifetime.md)                 | Задает интервал обновления словаря.                                                                                                                                |
| [`ON CLUSTER`](../../../distributed-ddl.md) | Создает словарь в кластере. Необязательный параметр.                                                                                                               |
| `SETTINGS`                                  | Дополнительные настройки словаря. Необязательный параметр.                                                                                                         |
| `COMMENT`                                   | Добавляет текстовый комментарий к словарю. Необязательный параметр.                                                                                                |


## Создание словаря с помощью конфигурационного файла \{#creating-a-dictionary-with-a-configuration-file\}

<CloudNotSupportedBadge />

:::note
Создание словаря с помощью конфигурационного файла не поддерживается в ClickHouse Cloud. Пожалуйста, используйте DDL (см. выше) и создайте словарь от имени пользователя `default`.
:::

Конфигурационный файл словаря имеет следующий формат:

```xml
<clickhouse>
    <comment>An optional element with any content. Ignored by the ClickHouse server.</comment>

    <!--Optional element. File name with substitutions-->
    <include_from>/etc/metrika.xml</include_from>


    <dictionary>
        <!-- Dictionary configuration. -->
        <!-- There can be any number of dictionary sections in a configuration file. -->
    </dictionary>

</clickhouse>
```

Вы можете настроить любое количество словарей в одном файле.


## Связанные материалы \{#related-content\}

- [Layouts](./layouts/) — Хранение словарей в памяти
- [Sources](./sources/) — Подключение к источникам данных
- [Lifetime](./lifetime.md) — Настройка автоматического обновления
- [Attributes](./attributes.md) — Настройка ключей и атрибутов
- [Embedded Dictionaries](./embedded.md) — Встроенные словари геобазы
- [system.dictionaries](../../../../operations/system-tables/dictionaries.md) — Системная таблица с информацией о словарях