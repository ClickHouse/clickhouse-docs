---
description: 'Табличная функция, которая позволяет эффективно преобразовывать и вставлять данные,
  отправляемые на сервер с заданной структурой, в таблицу с другой структурой.'
sidebar_label: 'input'
sidebar_position: 95
slug: /sql-reference/table-functions/input
title: 'input'
doc_type: 'reference'
---

# Табличная функция input \{#input-table-function\}

`input(structure)` — табличная функция, которая позволяет эффективно преобразовывать и вставлять данные, отправляемые на
сервер с заданной структурой, в таблицу с другой структурой.

`structure` — структура данных, отправляемых на сервер, в формате `'column1_name column1_type, column2_name column2_type, ...'`.
Например, `'id UInt32, name String'`.

Эту функцию можно использовать только в запросе `INSERT SELECT` и только один раз, но в остальном она ведет себя как обычная табличная функция
(например, может использоваться во вложенном запросе и т.п.).

Данные могут быть отправлены любым способом, как для обычного запроса `INSERT`, и переданы в любом доступном [формате](/sql-reference/formats),
который должен быть указан в конце запроса (в отличие от обычного `INSERT SELECT`).

Основная особенность этой функции заключается в том, что когда сервер получает данные от клиента, он одновременно преобразует их
в соответствии со списком выражений в секции `SELECT` и вставляет в целевую таблицу. При этом временная таблица
со всеми переданными данными не создается.

## Примеры \{#examples\}

* Пусть таблица `test` имеет следующую структуру `(a String, b String)`,
  а данные в `data.csv` имеют другую структуру `(col1 String, col2 Date, col3 Int32)`. Запрос вставки
  данных из `data.csv` в таблицу `test` с одновременным преобразованием выглядит так:

{/* */ }

```bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT lower(col1), col3 * col3 FROM input('col1 String, col2 Date, col3 Int32') FORMAT CSV";
```

* Если `data.csv` содержит данные той же структуры `test_structure`, что и таблица `test`, то эти два запроса эквивалентны:

{/* */ }

```bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test FORMAT CSV"
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT * FROM input('test_structure') FORMAT CSV"
```
