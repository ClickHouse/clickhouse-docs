---
slug: /faq/integration/json-import
title: Как импортировать JSON в ClickHouse?
toc_hidden: true
toc_priority: 11
---


# Как импортировать JSON в ClickHouse? {#how-to-import-json-into-clickhouse}

ClickHouse поддерживает широкий спектр [форматов данных для ввода и вывода](../../interfaces/formats.md). Существует несколько вариантов JSON среди них, но наиболее часто используемый для загрузки данных - это [JSONEachRow](../../interfaces/formats.md#jsoneachrow). Он ожидает один JSON объект на строку, каждый объект разделен переносом строки.

## Примеры {#examples}

Используя [HTTP интерфейс](../../interfaces/http.md):

``` bash
$ echo '{"foo":"bar"}' | curl 'http://localhost:8123/?query=INSERT%20INTO%20test%20FORMAT%20JSONEachRow' --data-binary @-
```

Используя [CLI интерфейс](../../interfaces/cli.md):

``` bash
$ echo '{"foo":"bar"}'  | clickhouse-client --query="INSERT INTO test FORMAT JSONEachRow"
```

Вместо того чтобы вставлять данные вручную, вы можете рассмотреть возможность использования [инструмента интеграции](../../integrations/index.mdx).

## Полезные настройки {#useful-settings}

- `input_format_skip_unknown_fields` позволяет вставлять JSON даже если в таблице есть дополнительные поля, которых нет в схеме (отбрасывая их).
- `input_format_import_nested_json` позволяет вставлять вложенные JSON объекты в колонки типа [Nested](../../sql-reference/data-types/nested-data-structures/index.md).

:::note
Настройки указываются как параметры `GET` для HTTP интерфейса или как дополнительные аргументы командной строки, начинающиеся с `--` для `CLI` интерфейса.
:::
