---
slug: /faq/integration/json-import
title: 'Как импортировать JSON в ClickHouse?'
toc_hidden: true
toc_priority: 11
description: 'На этой странице показано, как импортировать данные в формате JSON в ClickHouse'
keywords: ['JSON import', 'JSONEachRow format', 'data import', 'JSON ingestion', 'data formats']
doc_type: 'guide'
---



# Как импортировать JSON в ClickHouse? {#how-to-import-json-into-clickhouse}

ClickHouse поддерживает широкий спектр [форматов данных для ввода и вывода](/interfaces/formats). Среди них есть несколько вариантов JSON, но наиболее часто используемым для загрузки данных является [JSONEachRow](/interfaces/formats/JSONEachRow). Этот формат предполагает один JSON-объект на строку, при этом объекты разделяются символом новой строки.


## Примеры {#examples}

Использование [HTTP-интерфейса](../../interfaces/http.md):

```bash
$ echo '{"foo":"bar"}' | curl 'http://localhost:8123/?query=INSERT%20INTO%20test%20FORMAT%20JSONEachRow' --data-binary @-
```

Использование [интерфейса командной строки](../../interfaces/cli.md):

```bash
$ echo '{"foo":"bar"}'  | clickhouse-client --query="INSERT INTO test FORMAT JSONEachRow"
```

Вместо ручной вставки данных рекомендуется использовать [инструменты интеграции](../../integrations/index.mdx).


## Полезные настройки {#useful-settings}

- `input_format_skip_unknown_fields` позволяет вставлять JSON, даже если в нём есть дополнительные поля, отсутствующие в схеме таблицы (такие поля будут отброшены).
- `input_format_import_nested_json` позволяет вставлять вложенные JSON-объекты в столбцы типа [Nested](../../sql-reference/data-types/nested-data-structures/index.md).

:::note
Настройки указываются как параметры `GET` для HTTP-интерфейса или как дополнительные аргументы командной строки с префиксом `--` для интерфейса `CLI`.
:::
