---
slug: '/faq/integration/json-import'
description: 'Эта страница показывает вам, как импортировать JSON в ClickHouse'
title: 'Как импортировать JSON в ClickHouse?'
doc_type: guide
toc_hidden: true
toc_priority: 11
---
# Как импортировать JSON в ClickHouse? {#how-to-import-json-into-clickhouse}

ClickHouse поддерживает широкий спектр [форматов данных для ввода и вывода](../../interfaces/formats.md). Среди них есть множество вариантов JSON, но наиболее часто используемым для приема данных является [JSONEachRow](../../interfaces/formats.md#jsoneachrow). Он ожидает один JSON-объект на строку, каждый объект разделяется переводом строки.

## Примеры {#examples}

Используя [HTTP интерфейс](../../interfaces/http.md):

```bash
$ echo '{"foo":"bar"}' | curl 'http://localhost:8123/?query=INSERT%20INTO%20test%20FORMAT%20JSONEachRow' --data-binary @-
```

Используя [CLI интерфейс](../../interfaces/cli.md):

```bash
$ echo '{"foo":"bar"}'  | clickhouse-client --query="INSERT INTO test FORMAT JSONEachRow"
```

Вместо того чтобы вручную вставлять данные, вы можете рассмотреть возможность использования [инструмента интеграции](../../integrations/index.mdx).

## Полезные настройки {#useful-settings}

- `input_format_skip_unknown_fields` позволяет вставлять JSON, даже если есть дополнительные поля, отсутствующие в схеме таблицы (отбрасывая их).
- `input_format_import_nested_json` позволяет вставлять вложенные JSON-объекты в колонки типа [Nested](../../sql-reference/data-types/nested-data-structures/index.md).

:::note
Настройки указываются в качестве параметров `GET` для HTTP интерфейса или как дополнительные аргументы командной строки, начинающиеся с `--` для интерфейса `CLI`.
:::