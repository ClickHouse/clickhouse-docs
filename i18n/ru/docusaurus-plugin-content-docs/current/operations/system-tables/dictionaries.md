---
description: 'Системная таблица, содержащая информацию о словарях'
keywords: ['системная таблица', 'словари']
slug: /operations/system-tables/dictionaries
title: 'system.dictionaries'
---

import SystemTableCloud from '@site/i18n/ru/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

Содержит информацию о [словарях](../../sql-reference/dictionaries/index.md).

Столбцы:

- `database` ([String](../../sql-reference/data-types/string.md)) — Название базы данных, содержащей словарь, созданный запросом DDL. Пустая строка для других словарей.
- `name` ([String](../../sql-reference/data-types/string.md)) — [Имя словаря](../../sql-reference/dictionaries/index.md).
- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — UUID словаря.
- `status` ([Enum8](../../sql-reference/data-types/enum.md)) — Статус словаря. Возможные значения:
    - `NOT_LOADED` — Словарь не был загружен, так как не использовался.
    - `LOADED` — Словарь успешно загружен.
    - `FAILED` — Не удалось загрузить словарь из-за ошибки.
    - `LOADING` — Словарь загружается.
    - `LOADED_AND_RELOADING` — Словарь успешно загружен и сейчас перезагружается (частые причины: [SYSTEM RELOAD DICTIONARY](/sql-reference/statements/system#reload-dictionaries) запрос, тайм-аут, изменена конфигурация словаря).
    - `FAILED_AND_RELOADING` — Не удалось загрузить словарь из-за ошибки и сейчас он загружается.
- `origin` ([String](../../sql-reference/data-types/string.md)) — Путь к файлу конфигурации, описывающему словарь.
- `type` ([String](../../sql-reference/data-types/string.md)) — Тип выделения словаря. [Хранение словарей в памяти](/sql-reference/dictionaries#storing-dictionaries-in-memory).
- `key.names` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Массив [имен ключей](/operations/system-tables/dictionaries), предоставляемых словарем.
- `key.types` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Соответствующий массив [типов ключей](/sql-reference/dictionaries#dictionary-key-and-fields), предоставляемых словарем.
- `attribute.names` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Массив [имен атрибутов](/sql-reference/dictionaries#dictionary-key-and-fields), предоставляемых словарем.
- `attribute.types` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Соответствующий массив [типов атрибутов](/sql-reference/dictionaries#dictionary-key-and-fields), предоставляемых словарем.
- `bytes_allocated` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Объем оперативной памяти, выделенный для словаря.
- `query_count` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Количество запросов с момента загрузки словаря или с момента последнего успешного перезапуска.
- `hit_rate` ([Float64](../../sql-reference/data-types/float.md)) — Для кэшированных словарей, процент использований, для которых значение было в кэше.
- `found_rate` ([Float64](../../sql-reference/data-types/float.md)) — Процент использований, для которых значение было найдено.
- `element_count` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Количество элементов, хранящихся в словаре.
- `load_factor` ([Float64](../../sql-reference/data-types/float.md)) — Процент заполненности словаря (для хэшированного словаря, процент заполненности хеш-таблицы).
- `source` ([String](../../sql-reference/data-types/string.md)) — Текст, описывающий [источник данных](../../sql-reference/dictionaries/index.md#dictionary-sources) для словаря.
- `lifetime_min` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Минимальный [срок жизни](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime) словаря в памяти, после которого ClickHouse пытается перезагрузить словарь (если задан `invalidate_query`, то только если он изменился). Устанавливается в секундах.
- `lifetime_max` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Максимальный [срок жизни](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime) словаря в памяти, после которого ClickHouse пытается перезагрузить словарь (если задан `invalidate_query`, то только если он изменился). Устанавливается в секундах.
- `loading_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время начала загрузки словаря.
- `last_successful_update_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время завершения загрузки или обновления словаря. Помогает отслеживать некоторые проблемы с источниками словарей и расследовать причины.
- `loading_duration` ([Float32](../../sql-reference/data-types/float.md)) — Продолжительность загрузки словаря.
- `last_exception` ([String](../../sql-reference/data-types/string.md)) — Текст ошибки, возникающей при создании или перезагрузке словаря, если словарь не мог быть создан.
- `comment` ([String](../../sql-reference/data-types/string.md)) — Текст комментария к словарю.

**Пример**

Настройка словаря:

```sql
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

```sql
SELECT * FROM system.dictionaries LIMIT 1 FORMAT Vertical;
```

```text
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
