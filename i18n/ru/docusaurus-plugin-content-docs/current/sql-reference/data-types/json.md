---
description: 'Документация для устаревшего типа данных Object в ClickHouse'
keywords: ['object', 'тип данных']
sidebar_label: 'Тип данных Object'
sidebar_position: 26
slug: /sql-reference/data-types/object-data-type
title: 'Тип данных Object'
---

import DeprecatedBadge from '@theme/badges/DeprecatedBadge';


# Тип данных Object

<DeprecatedBadge/>

**Эта функция не готова к использованию в производственной среде и устарела.** Если вам нужно работать с JSON документами, рассмотрите возможность использования [этого руководства](/integrations/data-formats/json/overview). Новая реализация для поддержки JSON объекта находится в стадии бета-тестирования. Дополнительные детали [здесь](/sql-reference/data-types/newjson).

<hr />

Сохраняет документы в формате JavaScript Object Notation (JSON) в одном столбце.

`JSON` может использоваться как псевдоним для `Object('json')`, когда установлена настройка [use_json_alias_for_old_object_type](/operations/settings/settings#use_json_alias_for_old_object_type).

## Пример {#example}

**Пример 1**

Создание таблицы с `JSON` столбцом и вставка данных в него:

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

Чтобы создать таблицу семейства упорядоченных `MergeTree`, ключ сортировки должен быть извлечён в его столбец. Например, для вставки файла с сжатыми HTTP логами доступа в формате JSON:

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

## Отображение JSON столбцов {#displaying-json-columns}

При отображении `JSON` столбца ClickHouse по умолчанию показывает только значения полей (так как на внутреннем уровне он представлен как кортеж). Вы также можете отобразить имена полей, установив `output_format_json_named_tuples_as_objects = 1`:

```sql
SET output_format_json_named_tuples_as_objects = 1

SELECT * FROM json FORMAT JSONEachRow
```

```text
{"o":{"a":1,"b":{"c":2,"d":[1,2,3]}}}
```

## Связанный контент {#related-content}

- [Использование JSON в ClickHouse](/integrations/data-formats/json/overview)
- [Получение данных в ClickHouse — Часть 2 — Обход JSON](https://clickhouse.com/blog/getting-data-into-clickhouse-part-2-json)
