---
description: 'Функция таблицы, которая позволяет эффективно преобразовывать и вставлять данные,
  отправленные на сервер с заданной структурой, в таблицу с другой структурой.'
sidebar_label: 'input'
sidebar_position: 95
slug: /sql-reference/table-functions/input
title: 'input'
---


# Функция таблицы input

`input(structure)` - функция таблицы, которая позволяет эффективно преобразовывать и вставлять данные, отправленные на сервер с заданной структурой, в таблицу с другой структурой.

`structure` - структура данных, отправленных на сервер в следующем формате `'column1_name column1_type, column2_name column2_type, ...'`. Например, `'id UInt32, name String'`.

Эта функция может использоваться только в запросе `INSERT SELECT` и только один раз, но в остальном ведет себя как обычная функция таблицы (например, ее можно использовать в подзапросе и т.д.).

Данные могут быть отправлены любым способом, как для обычного запроса `INSERT`, и переданы в любом доступном [формате](/sql-reference/formats), который необходимо указать в конце запроса (в отличие от обычного `INSERT SELECT`).

Главная особенность этой функции заключается в том, что когда сервер получает данные от клиента, он одновременно преобразует их согласно списку выражений в разделе `SELECT` и вставляет в целевую таблицу. Временная таблица с всеми переданными данными не создается.

**Примеры**

- Пусть таблица `test` имеет следующую структуру `(a String, b String)` и данные в `data.csv` имеют другую структуру `(col1 String, col2 Date, col3 Int32)`. Запрос для вставки данных из `data.csv` в таблицу `test` с одновременным преобразованием выглядит так:

<!-- -->

```bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT lower(col1), col3 * col3 FROM input('col1 String, col2 Date, col3 Int32') FORMAT CSV";
```

- Если `data.csv` содержит данные той же структуры `test_structure`, что и таблица `test`, тогда эти два запроса равны:

<!-- -->

```bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test FORMAT CSV"
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT * FROM input('test_structure') FORMAT CSV"
```
