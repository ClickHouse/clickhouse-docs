---
description: 'Системная таблица, содержащая информацию о словарях'
slug: /operations/system-tables/dictionaries
title: 'system.dictionaries'
keywords: ['системная таблица', 'словаря']
---

import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

Содержит информацию о [словахарях](../../sql-reference/dictionaries/index.md).

Колонки:

- `database` ([String](../../sql-reference/data-types/string.md)) — Имя базы данных, содержащей словарь, созданный с помощью DDL запроса. Пустая строка для других словарей.
- `name` ([String](../../sql-reference/data-types/string.md)) — [Имя словаря](../../sql-reference/dictionaries/index.md).
- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — UUID словаря.
- `status` ([Enum8](../../sql-reference/data-types/enum.md)) — Статус словаря. Возможные значения:
    - `NOT_LOADED` — Словарь не был загружен, потому что не использовался.
    - `LOADED` — Словарь успешно загружен.
    - `FAILED` — Не удалось загрузить словарь в результате ошибки.
    - `LOADING` — Словарь загружается сейчас.
    - `LOADED_AND_RELOADING` — Словарь успешно загружен и сейчас перезагружается (частые причины: [SYSTEM RELOAD DICTIONARY](/sql-reference/statements/system#reload-dictionaries) запрос, тайм-аут, изменена конфигурация словаря).
    - `FAILED_AND_RELOADING` — Не удалось загрузить словарь в результате ошибки и сейчас идет его загрузка.
- `origin` ([String](../../sql-reference/data-types/string.md)) — Путь к конфигурационному файлу, описывающему словарь.
- `type` ([String](../../sql-reference/data-types/string.md)) — Тип выделения словаря. [Хранение словарей в памяти](/sql-reference/dictionaries#storing-dictionaries-in-memory).
- `key.names` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Массив [имен ключей](/operations/system-tables/dictionaries), предоставленный словарем.
- `key.types` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Соответствующий массив [типов ключей](/sql-reference/dictionaries#dictionary-key-and-fields), предоставленный словарем.
- `attribute.names` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Массив [имен атрибутов](/sql-reference/dictionaries#dictionary-key-and-fields), предоставленный словарем.
- `attribute.types` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Соответствующий массив [типов атрибутов](/sql-reference/dictionaries#dictionary-key-and-fields), предоставленный словарем.
- `bytes_allocated` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Объем ОЗУ, выделенный для словаря.
- `query_count` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Количество запросов с момента загрузки словаря или с момента последней успешной перезагрузки.
- `hit_rate` ([Float64](../../sql-reference/data-types/float.md)) — Для кэшированных словарей, процент использования, при котором значение было в кэше.
- `found_rate` ([Float64](../../sql-reference/data-types/float.md)) — Процент использования, при котором значение было найдено.
- `element_count` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Количество элементов, хранящихся в словаре.
- `load_factor` ([Float64](../../sql-reference/data-types/float.md)) — Процент заполненности словаря (для хешированного словаря, процент заполненности хеш-таблицы).
- `source` ([String](../../sql-reference/data-types/string.md)) — Текст, описывающий [источник данных](../../sql-reference/dictionaries/index.md#dictionary-sources) для словаря.
- `lifetime_min` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Минимальное [время жизни](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime) словаря в памяти, после которого ClickHouse пытается перезагрузить словарь (если установлен `invalidate_query`, то только если он изменился). Установлено в секундах.
- `lifetime_max` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Максимальное [время жизни](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime) словаря в памяти, после которого ClickHouse пытается перезагрузить словарь (если установлен `invalidate_query`, то только если он изменился). Установлено в секундах.
- `loading_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время начала загрузки словаря.
- `last_successful_update_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время окончания загрузки или обновления словаря. Помогает отслеживать некоторые проблемы с источниками словарей и расследовать их причины.
- `loading_duration` ([Float32](../../sql-reference/data-types/float.md)) — Длительность загрузки словаря.
- `last_exception` ([String](../../sql-reference/data-types/string.md)) — Текст ошибки, возникающей при создании или перезагрузке словаря, если словарь не удалось создать.
- `comment` ([String](../../sql-reference/data-types/string.md)) — Текст комментария к словарю.

**Пример**

Конфигурируйте словарь:

``` sql
CREATE DICTIONARY dictionary_with_comment
(
    id UInt64,
    value String
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(HOST 'localhost' PORT tcpPort() TABLE 'source_table'))
LAYOUT(FLAT())
LIFETIME(MIN 0 MAX 1000)
COMMENT 'Временный словарь';
```

Убедитесь, что словарь загружен.

``` sql
SELECT * FROM system.dictionaries LIMIT 1 FORMAT Vertical;
```

``` text
Row 1:
──────
database:                    default
name:                        dictionary_with_comment
uuid:                        4654d460-0d03-433a-8654-d4600d03d33a
status:                      NOT_LOADED
origin:                      4654d460-0d03-433a-8654-d4600d03d33a
type:
key.names:                   ['id']
key.types:                   ['UInt64']
attribute.names:             ['value']
attribute.types:             ['String']
bytes_allocated:             0
query_count:                 0
hit_rate:                    0
found_rate:                  0
element_count:               0
load_factor:                 0
source:
lifetime_min:                0
lifetime_max:                0
loading_start_time:          1970-01-01 00:00:00
last_successful_update_time: 1970-01-01 00:00:00
loading_duration:            0
last_exception:
comment:                     Временный словарь
```
