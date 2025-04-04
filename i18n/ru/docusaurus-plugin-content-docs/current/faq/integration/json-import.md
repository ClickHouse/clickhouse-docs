---
slug: /faq/integration/json-import
title: 'Как импортировать JSON в ClickHouse?'
toc_hidden: true
toc_priority: 11
description: 'Эта страница показывает, как импортировать JSON в ClickHouse'
---


# Как импортировать JSON в ClickHouse? {#how-to-import-json-into-clickhouse}

ClickHouse поддерживает широкий спектр [форматов данных для ввода и вывода](../../interfaces/formats.md). Существует несколько вариантов JSON среди них, но наиболее часто используемым для приема данных является [JSONEachRow](../../interfaces/formats.md#jsoneachrow). Он ожидает один объект JSON на строку, каждый объект отделяется переводом строки.

## Примеры {#examples}

Используя [HTTP интерфейс](../../interfaces/http.md):

``` bash
$ echo '{"foo":"bar"}' | curl 'http://localhost:8123/?query=INSERT%20INTO%20test%20FORMAT%20JSONEachRow' --data-binary @-
```

Используя [CLI интерфейс](../../interfaces/cli.md):

``` bash
$ echo '{"foo":"bar"}'  | clickhouse-client --query="INSERT INTO test FORMAT JSONEachRow"
```

Вместо того чтобы вручную вставлять данные, вы можете рассмотреть возможность использования [инструмента интеграции](../../integrations/index.mdx).

## Полезные настройки {#useful-settings}

- `input_format_skip_unknown_fields` позволяет вставлять JSON, даже если в схеме таблицы присутствуют дополнительные поля (путем их игнорирования).
- `input_format_import_nested_json` позволяет вставлять вложенные объекты JSON в колонки типа [Nested](../../sql-reference/data-types/nested-data-structures/index.md).

:::note
Настройки указываются как параметры `GET` для HTTP интерфейса или как дополнительные аргументы командной строки с префиксом `--` для интерфейса `CLI`.
:::
