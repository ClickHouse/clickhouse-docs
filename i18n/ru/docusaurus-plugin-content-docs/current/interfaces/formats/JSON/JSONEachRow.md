---
description: 'Документация для формата JSONEachRow'
keywords: ['JSONEachRow']
slug: /interfaces/formats/JSONEachRow
title: 'JSONEachRow'
---

## Описание {#description}

В этом формате ClickHouse выводит каждую строку как отдельный JSON-объект, разделенный переводом строки. Псевдонимы: `JSONLines`, `NDJSON`.

## Пример использования {#example-usage}

Пример:

```json
{"num":42,"str":"hello","arr":[0,1]}
{"num":43,"str":"hello","arr":[0,1,2]}
{"num":44,"str":"hello","arr":[0,1,2,3]}
```

При импорте данных колонки с неизвестными именами будут пропущены, если настройка [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в 1.

## Настройки формата {#format-settings}
