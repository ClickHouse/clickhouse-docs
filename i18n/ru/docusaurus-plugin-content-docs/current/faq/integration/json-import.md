---
slug: /faq/integration/json-import
title: 'Как импортировать JSON в ClickHouse?'
toc_hidden: true
toc_priority: 11
description: 'На этой странице описано, как импортировать JSON в ClickHouse'
keywords: ['импорт JSON', 'формат JSONEachRow', 'импорт данных', 'ингестия JSON', 'форматы данных']
doc_type: 'guide'
---



# Как импортировать JSON в ClickHouse? {#how-to-import-json-into-clickhouse}

ClickHouse поддерживает широкий спектр [форматов данных для ввода и вывода](/interfaces/formats). Среди них есть несколько вариантов JSON, но наиболее часто для ингестии данных используется формат [JSONEachRow](/interfaces/formats/JSONEachRow). Он ожидает по одному JSON‑объекту в строке, при этом каждый объект должен быть разделён символом перевода строки.



## Примеры

С помощью [HTTP-интерфейса](../../interfaces/http.md):

```bash
$ echo '{"foo":"bar"}' | curl 'http://localhost:8123/?query=INSERT%20INTO%20test%20FORMAT%20JSONEachRow' --data-binary @-
```

С помощью [интерфейса командной строки (CLI)](../../interfaces/cli.md):

```bash
$ echo '{"foo":"bar"}'  | clickhouse-client --query="INSERT INTO test FORMAT JSONEachRow"
```

Вместо ручного ввода данных вы можете использовать [инструмент интеграции](../../integrations/index.mdx).


## Полезные настройки {#useful-settings}

- `input_format_skip_unknown_fields` позволяет вставлять JSON, даже если в нём есть дополнительные поля, отсутствующие в схеме таблицы (такие поля отбрасываются).
- `input_format_import_nested_json` позволяет вставлять вложенные JSON-объекты в столбцы типа [Nested](../../sql-reference/data-types/nested-data-structures/index.md).

:::note
Настройки указываются как параметры `GET`-запроса для HTTP-интерфейса или как дополнительные аргументы командной строки с префиксом `--` для интерфейса `CLI`.
:::
