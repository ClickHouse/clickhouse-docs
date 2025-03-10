---
slug: /sql-reference/data-types/object-data-type
sidebar_position: 26
sidebar_label: Объектный тип данных
keywords: ['object', 'data type']
---

import DeprecatedBadge from '@theme/badges/DeprecatedBadge';


# Объектный тип данных 

<DeprecatedBadge/>

**Этот функционал не готов к производству и устарел.** Если вам нужно работать с JSON-документами, рассмотрите возможность использования [этого руководства](/integrations/data-formats/json/overview). Новая реализация для поддержки объектов JSON находится в Бета. Дополнительные детали [здесь](/sql-reference/data-types/newjson).

<hr />

Сохраняет документы в формате JavaScript Object Notation (JSON) в одной колонке.

`JSON` может использоваться как псевдоним для `Object('json')`, когда включена настройка [use_json_alias_for_old_object_type](/operations/settings/settings#use_json_alias_for_old_object_type).

## Пример {#example}

**Пример 1**

Создание таблицы с колонкой `JSON` и вставка данных в нее:

```sql
CREATE TABLE json
(
    o JSON
)
ENGINE = Memory
```

```sql
INSERT INTO json VALUES ('{"a": 1, "b": { "c": 2, "d": [1, 2, 3] }}')
```

```sql
SELECT o.a, o.b.c, o.b.d[3] FROM json
```

```text
┌─o.a─┬─o.b.c─┬─arrayElement(o.b.d, 3)─┐
│   1 │     2 │                      3 │
└─────┴───────┴────────────────────────┘
```

**Пример 2**

Чтобы иметь возможность создать упорядоченную таблицу семейства `MergeTree`, ключ сортировки должен быть извлечен в свою колонку. Например, для вставки файла сжатых логов HTTP в формате JSON:

```sql
CREATE TABLE logs
(
	timestamp DateTime,
	message JSON
)
ENGINE = MergeTree
ORDER BY timestamp
```

```sql
INSERT INTO logs
SELECT parseDateTimeBestEffort(JSONExtractString(json, 'timestamp')), json
FROM file('access.json.gz', JSONAsString)
```

## Отображение колонок JSON {#displaying-json-columns}

При отображении колонки `JSON` ClickHouse по умолчанию показывает только значения полей (поскольку внутренне они представлены как кортеж). Вы также можете отобразить имена полей, установив `output_format_json_named_tuples_as_objects = 1`:

```sql
SET output_format_json_named_tuples_as_objects = 1

SELECT * FROM json FORMAT JSONEachRow
```

```text
{"o":{"a":1,"b":{"c":2,"d":[1,2,3]}}}
```

## Связанное содержимое {#related-content}

- [Использование JSON в ClickHouse](/integrations/data-formats/json/overview)
- [Загрузка данных в ClickHouse - Часть 2 - Обход JSON](https://clickhouse.com/blog/getting-data-into-clickhouse-part-2-json)
