---
description: 'Документация для формата JSONEachRow'
keywords: ['JSONEachRow']
slug: /interfaces/formats/JSONEachRow
title: 'JSONEachRow'
---

## Описание {#description}

В этом формате ClickHouse выводит каждую строку в виде отдельного объекта JSON, разделенного переводом строки. Псевдоним: `JSONLines`, `NDJSON`.

## Пример использования {#example-usage}

Пример:

```json
{"num":42,"str":"hello","arr":[0,1]}
{"num":43,"str":"hello","arr":[0,1,2]}
{"num":44,"str":"hello","arr":[0,1,2,3]}
```

При импорте данных столбцы с неизвестными именами будут пропущены, если настройка [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена на 1.

## Настройки формата {#format-settings}
