---
slug: '/sql-reference/table-functions/input'
sidebar_label: input
sidebar_position: 95
description: 'Табличная функция, которая позволяет эффективно конвертировать и вставлять'
title: input
doc_type: reference
---
# input Табличная Функция

`input(structure)` - табличная функция, которая позволяет эффективно конвертировать и вставлять данные, отправленные на сервер с заданной структурой, в таблицу с другой структурой.

`structure` - структура данных, отправленных на сервер в следующем формате `'column1_name column1_type, column2_name column2_type, ...'`. Например, `'id UInt32, name String'`.

Эта функция может использоваться только в запросе `INSERT SELECT` и только один раз, но в остальном ведет себя как обычная табличная функция (например, может быть использована в подзапросах и т.д.).

Данные могут быть отправлены любым способом, как для обычного запроса `INSERT`, и переданы в любом доступном [формате](/sql-reference/formats), который должен быть указан в конце запроса (в отличие от обычного `INSERT SELECT`).

Основная особенность этой функции заключается в том, что когда сервер получает данные от клиента, он одновременно конвертирует их в соответствии со списком выражений в операторе `SELECT` и вставляет в целевую таблицу. Временная таблица с всеми переданными данными не создается.

## Примеры {#examples}

- Пусть таблица `test` имеет следующую структуру `(a String, b String)` и данные в `data.csv` имеют другую структуру `(col1 String, col2 Date, col3 Int32)`. Запрос на вставку данных из `data.csv` в таблицу `test` с одновременной конвертацией выглядит следующим образом:

<!-- -->

```bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT lower(col1), col3 * col3 FROM input('col1 String, col2 Date, col3 Int32') FORMAT CSV";
```

- Если `data.csv` содержит данные той же структуры `test_structure`, что и таблица `test`, то эти два запроса равнозначны:

<!-- -->

```bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test FORMAT CSV"
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT * FROM input('test_structure') FORMAT CSV"
```