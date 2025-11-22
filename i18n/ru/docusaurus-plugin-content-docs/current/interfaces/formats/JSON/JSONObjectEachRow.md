---
alias: []
description: 'Документация по формату JSONObjectEachRow'
input_format: true
keywords: ['JSONObjectEachRow']
output_format: true
slug: /interfaces/formats/JSONObjectEachRow
title: 'JSONObjectEachRow'
doc_type: 'reference'
---

| Входной формат | Выходной формат | Псевдоним |
|----------------|-----------------|-----------|
| ✔              | ✔               |           |



## Description {#description}

В этом формате все данные представлены в виде единого объекта JSON, при этом каждая строка представлена отдельным полем этого объекта, аналогично формату [`JSONEachRow`](./JSONEachRow.md).


## Примеры использования {#example-usage}

### Базовый пример {#basic-example}

Рассмотрим следующий JSON:

```json
{
  "row_1": { "num": 42, "str": "hello", "arr": [0, 1] },
  "row_2": { "num": 43, "str": "hello", "arr": [0, 1, 2] },
  "row_3": { "num": 44, "str": "hello", "arr": [0, 1, 2, 3] }
}
```

Чтобы использовать имя объекта в качестве значения столбца, можно применить специальную настройку [`format_json_object_each_row_column_for_object_name`](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name).
Значение этой настройки задаёт имя столбца, которое используется в качестве ключа JSON для строки в результирующем объекте.

#### Вывод {#output}

Предположим, у нас есть таблица `test` с двумя столбцами:

```text
┌─object_name─┬─number─┐
│ first_obj   │      1 │
│ second_obj  │      2 │
│ third_obj   │      3 │
└─────────────┴────────┘
```

Выведем её в формате `JSONObjectEachRow`, используя настройку `format_json_object_each_row_column_for_object_name`:

```sql title="Запрос"
SELECT * FROM test SETTINGS format_json_object_each_row_column_for_object_name='object_name'
```

```json title="Ответ"
{
  "first_obj": { "number": 1 },
  "second_obj": { "number": 2 },
  "third_obj": { "number": 3 }
}
```

#### Ввод {#input}

Предположим, мы сохранили вывод из предыдущего примера в файл с именем `data.json`:

```sql title="Запрос"
SELECT * FROM file('data.json', JSONObjectEachRow, 'object_name String, number UInt64') SETTINGS format_json_object_each_row_column_for_object_name='object_name'
```

```response title="Ответ"
┌─object_name─┬─number─┐
│ first_obj   │      1 │
│ second_obj  │      2 │
│ third_obj   │      3 │
└─────────────┴────────┘
```

Это также работает для автоматического определения схемы:

```sql title="Запрос"
DESCRIBE file('data.json', JSONObjectEachRow) SETTING format_json_object_each_row_column_for_object_name='object_name'
```

```response title="Ответ"
┌─name────────┬─type────────────┐
│ object_name │ String          │
│ number      │ Nullable(Int64) │
└─────────────┴─────────────────┘
```

### Вставка данных {#json-inserting-data}

```sql title="Запрос"
INSERT INTO UserActivity FORMAT JSONEachRow {"PageViews":5, "UserID":"4324182021466249494", "Duration":146,"Sign":-1} {"UserID":"4324182021466249494","PageViews":6,"Duration":185,"Sign":1}
```

ClickHouse позволяет:

- Использовать любой порядок пар ключ-значение в объекте.
- Опускать некоторые значения.

ClickHouse игнорирует пробелы между элементами и запятые после объектов. Можно передать все объекты в одной строке. Разделять их переносами строк не обязательно.

#### Обработка опущенных значений {#omitted-values-processing}

ClickHouse подставляет вместо опущенных значений значения по умолчанию для соответствующих [типов данных](/sql-reference/data-types/index.md).

Если указано `DEFAULT expr`, ClickHouse использует различные правила подстановки в зависимости от настройки [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields).

Рассмотрим следующую таблицу:

```sql title="Запрос"
CREATE TABLE IF NOT EXISTS example_table
(
    x UInt32,
    a DEFAULT x * 2
) ENGINE = Memory;
```

- Если `input_format_defaults_for_omitted_fields = 0`, то значение по умолчанию для `x` и `a` равно `0` (как значение по умолчанию для типа данных `UInt32`).
- Если `input_format_defaults_for_omitted_fields = 1`, то значение по умолчанию для `x` равно `0`, но значение по умолчанию для `a` равно `x * 2`.

:::note
При вставке данных с `input_format_defaults_for_omitted_fields = 1` ClickHouse потребляет больше вычислительных ресурсов по сравнению со вставкой с `input_format_defaults_for_omitted_fields = 0`.
:::

### Выборка данных {#json-selecting-data}

Рассмотрим таблицу `UserActivity` в качестве примера:


```response
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

Запрос `SELECT * FROM UserActivity FORMAT JSONEachRow` возвращает:

```response
{"UserID":"4324182021466249494","PageViews":5,"Duration":146,"Sign":-1}
{"UserID":"4324182021466249494","PageViews":6,"Duration":185,"Sign":1}
```

В отличие от формата [JSON](/interfaces/formats/JSON), недопустимые последовательности UTF-8 не заменяются. Значения экранируются так же, как и для `JSON`.

:::info
В строках может выводиться любой набор байтов. Используйте формат [`JSONEachRow`](./JSONEachRow.md), если вы уверены, что данные в таблице можно отформатировать как JSON без потери информации.
:::

### Использование вложенных структур {#jsoneachrow-nested}

Если у вас есть таблица со столбцами типа данных [`Nested`](/sql-reference/data-types/nested-data-structures/index.md), вы можете вставлять данные JSON с такой же структурой. Включите эту функцию с помощью настройки [input_format_import_nested_json](/operations/settings/settings-formats.md/#input_format_import_nested_json).

Например, рассмотрим следующую таблицу:

```sql
CREATE TABLE json_each_row_nested (n Nested (s String, i Int32) ) ENGINE = Memory
```

Как видно из описания типа данных `Nested`, ClickHouse обрабатывает каждый компонент вложенной структуры как отдельный столбец (`n.s` и `n.i` для нашей таблицы). Вы можете вставить данные следующим образом:

```sql
INSERT INTO json_each_row_nested FORMAT JSONEachRow {"n.s": ["abc", "def"], "n.i": [1, 23]}
```

Чтобы вставить данные в виде иерархического объекта JSON, установите [`input_format_import_nested_json=1`](/operations/settings/settings-formats.md/#input_format_import_nested_json).

```json
{
  "n": {
    "s": ["abc", "def"],
    "i": [1, 23]
  }
}
```

Без этой настройки ClickHouse выбрасывает исключение.

```sql title="Запрос"
SELECT name, value FROM system.settings WHERE name = 'input_format_import_nested_json'
```

```response title="Ответ"
┌─name────────────────────────────┬─value─┐
│ input_format_import_nested_json │ 0     │
└─────────────────────────────────┴───────┘
```

```sql title="Запрос"
INSERT INTO json_each_row_nested FORMAT JSONEachRow {"n": {"s": ["abc", "def"], "i": [1, 23]}}
```

```response title="Ответ"
Code: 117. DB::Exception: Unknown field found while parsing JSONEachRow format: n: (at row 1)
```

```sql title="Запрос"
SET input_format_import_nested_json=1
INSERT INTO json_each_row_nested FORMAT JSONEachRow {"n": {"s": ["abc", "def"], "i": [1, 23]}}
SELECT * FROM json_each_row_nested
```

```response title="Ответ"
┌─n.s───────────┬─n.i────┐
│ ['abc','def'] │ [1,23] │
└───────────────┴────────┘
```


## Настройки формата {#format-settings}


| Настройка                                                                                                                                                                    | Описание                                                                                                                                                                                    | По умолчанию | Примечания                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`input_format_import_nested_json`](/operations/settings/settings-formats.md/#input_format_import_nested_json)                                                               | сопоставлять вложенные данные JSON с вложенными таблицами (работает для формата JSONEachRow).                                                                                               | `false`      |                                                                                                                                                                                                |
| [`input_format_json_read_bools_as_numbers`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_numbers)                                               | позволяет интерпретировать логические значения как числа во входных форматах JSON.                                                                                                          | `true`       |                                                                                                                                                                                                |
| [`input_format_json_read_bools_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_strings)                                               | позволяет интерпретировать булевы значения как строки во входных форматах JSON.                                                                                                             | `true`       |                                                                                                                                                                                                |
| [`input_format_json_read_numbers_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_numbers_as_strings)                                           | позволяет разбирать числа как строки во входных форматах JSON.                                                                                                                              | `true`       |                                                                                                                                                                                                |
| [`input_format_json_read_arrays_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_arrays_as_strings)                                             | позволяет интерпретировать массивы JSON как строки во входных форматах JSON.                                                                                                                | `true`       |                                                                                                                                                                                                |
| [`input_format_json_read_objects_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_objects_as_strings)                                           | позволяет интерпретировать объекты JSON как строки во входных форматах JSON.                                                                                                                | `true`       |                                                                                                                                                                                                |
| [`input_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#input_format_json_named_tuples_as_objects)                                           | разбирать столбцы типа NamedTuple как объекты JSON.                                                                                                                                         | `true`       |                                                                                                                                                                                                |
| [`input_format_json_try_infer_numbers_from_strings`](/operations/settings/settings-formats.md/#input_format_json_try_infer_numbers_from_strings)                             | пытаться выводить числовые значения из строковых полей при автоматическом определении схемы.                                                                                                | `false`      |                                                                                                                                                                                                |
| [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/settings-formats.md/#input_format_json_try_infer_named_tuples_from_objects)                   | пытаться определять именованный кортеж по объектам JSON при выводе схемы.                                                                                                                   | `true`       |                                                                                                                                                                                                |
| [`input_format_json_infer_incomplete_types_as_strings`](/operations/settings/settings-formats.md/#input_format_json_infer_incomplete_types_as_strings)                       | используйте тип String для ключей, которые содержат только значения Null или пустые объекты/массивы при выводе схемы во входных форматах JSON.                                              | `true`       |                                                                                                                                                                                                |
| [`input_format_json_defaults_for_missing_elements_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_defaults_for_missing_elements_in_named_tuple) | вставлять значения по умолчанию для отсутствующих полей JSON-объекта при разборе именованного кортежа.                                                                                      | `true`       |                                                                                                                                                                                                |
| [`input_format_json_ignore_unknown_keys_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_ignore_unknown_keys_in_named_tuple)                     | игнорировать неизвестные ключи JSON-объекта для именованных кортежей.                                                                                                                       | `false`      |                                                                                                                                                                                                |
| [`input_format_json_compact_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_json_compact_allow_variable_number_of_columns)         | разрешает переменное количество столбцов в форматах JSONCompact и JSONCompactEachRow, игнорирует лишние столбцы и использует значения по умолчанию для отсутствующих столбцов.              | `false`      |                                                                                                                                                                                                |
| [`input_format_json_throw_on_bad_escape_sequence`](/operations/settings/settings-formats.md/#input_format_json_throw_on_bad_escape_sequence)                                 | выбрасывать исключение, если строка JSON содержит некорректную escape-последовательность. Если отключено, некорректные escape-последовательности останутся в данных без изменений.          | `true`       |                                                                                                                                                                                                |
| [`input_format_json_empty_as_default`](/operations/settings/settings-formats.md/#input_format_json_empty_as_default)                                                         | обрабатывать пустые поля во входных данных JSON как значения по умолчанию.                                                                                                                  | `false`.     | Для сложных выражений по умолчанию необходимо также включить [`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields). |
| [`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers)                                               | определяет, заключать ли 64-битные целые числа в кавычки в формате вывода JSON.                                                                                                             | `true`       |                                                                                                                                                                                                |
| [`output_format_json_quote_64bit_floats`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_floats)                                                   | управляет заключением 64-битных чисел с плавающей запятой в кавычки в формате вывода JSON.                                                                                                  | `false`      |                                                                                                                                                                                                |
| [`output_format_json_quote_denormals`](/operations/settings/settings-formats.md/#output_format_json_quote_denormals)                                                         | разрешает вывод значений &#39;+nan&#39;, &#39;-nan&#39;, &#39;+inf&#39;, &#39;-inf&#39; в формате JSON.                                                                                     | `false`      |                                                                                                                                                                                                |
| [`output_format_json_quote_decimals`](/operations/settings/settings-formats.md/#output_format_json_quote_decimals)                                                           | определяет, заключать ли десятичные значения в кавычки в формате вывода JSON.                                                                                                               | `false`      |                                                                                                                                                                                                |
| [`output_format_json_escape_forward_slashes`](/operations/settings/settings-formats.md/#output_format_json_escape_forward_slashes)                                           | управляет экранированием прямых слэшей в строковых значениях при выводе в формате JSON.                                                                                                     | `true`       |                                                                                                                                                                                                |
| [`output_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#output_format_json_named_tuples_as_objects)                                         | сериализует столбцы именованных кортежей в виде объектов JSON.                                                                                                                              | `true`       |                                                                                                                                                                                                |
| [`output_format_json_array_of_rows`](/operations/settings/settings-formats.md/#output_format_json_array_of_rows)                                                             | вывести JSON‑массив всех строк в формате JSONEachRow(Compact).                                                                                                                              | `false`      |                                                                                                                                                                                                |
| [`output_format_json_validate_utf8`](/operations/settings/settings-formats.md/#output_format_json_validate_utf8)                                                             | включает проверку последовательностей UTF-8 в форматах вывода JSON (обратите внимание, что это не влияет на форматы JSON/JSONCompact/JSONColumnsWithMetadata — они всегда проверяют UTF-8). | `false`      |                                                                                                                                                                                                |