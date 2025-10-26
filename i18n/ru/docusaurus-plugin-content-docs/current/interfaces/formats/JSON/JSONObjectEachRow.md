---
slug: '/interfaces/formats/JSONObjectEachRow'
description: 'Документация для формата JSONObjectEachRow'
title: JSONObjectEachRow
keywords: ['JSONObjectEachRow']
doc_type: reference
input_format: true
output_format: true
---
| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

В этом формате все данные представлены как один JSON-объект, при этом каждая строка представлена как отдельное поле этого объекта, аналогично формату [`JSONEachRow`](./JSONEachRow.md).

## Пример использования {#example-usage}

### Базовый пример {#basic-example}

Предположим, у нас есть некоторый JSON:

```json
{
  "row_1": {"num": 42, "str": "hello", "arr":  [0,1]},
  "row_2": {"num": 43, "str": "hello", "arr":  [0,1,2]},
  "row_3": {"num": 44, "str": "hello", "arr":  [0,1,2,3]}
}
```

Чтобы использовать имя объекта как значение колонки, вы можете использовать специальную настройку [`format_json_object_each_row_column_for_object_name`](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name). Значение этой настройки устанавливается на имя колонки, которая используется как JSON-ключ для строки в результирующем объекте.

#### Вывод {#output}

Предположим, у нас есть таблица `test` с двумя колонками:

```text
┌─object_name─┬─number─┐
│ first_obj   │      1 │
│ second_obj  │      2 │
│ third_obj   │      3 │
└─────────────┴────────┘
```

Давайте выведем это в формате `JSONObjectEachRow` и используем настройку `format_json_object_each_row_column_for_object_name`:

```sql title="Query"
SELECT * FROM test SETTINGS format_json_object_each_row_column_for_object_name='object_name'
```

```json title="Response"
{
    "first_obj": {"number": 1},
    "second_obj": {"number": 2},
    "third_obj": {"number": 3}
}
```

#### Ввод {#input}

Предположим, что мы сохранили вывод из предыдущего примера в файл с именем `data.json`:

```sql title="Query"
SELECT * FROM file('data.json', JSONObjectEachRow, 'object_name String, number UInt64') SETTINGS format_json_object_each_row_column_for_object_name='object_name'
```

```response title="Response"
┌─object_name─┬─number─┐
│ first_obj   │      1 │
│ second_obj  │      2 │
│ third_obj   │      3 │
└─────────────┴────────┘
```

Это также работает для вывода схемы:

```sql title="Query"
DESCRIBE file('data.json', JSONObjectEachRow) SETTING format_json_object_each_row_column_for_object_name='object_name'
```

```response title="Response"
┌─name────────┬─type────────────┐
│ object_name │ String          │
│ number      │ Nullable(Int64) │
└─────────────┴─────────────────┘
```

### Вставка данных {#json-inserting-data}

```sql title="Query"
INSERT INTO UserActivity FORMAT JSONEachRow {"PageViews":5, "UserID":"4324182021466249494", "Duration":146,"Sign":-1} {"UserID":"4324182021466249494","PageViews":6,"Duration":185,"Sign":1}
```

ClickHouse позволяет:

- Любой порядок пар ключ-значение в объекте.
- Пропуск некоторых значений.

ClickHouse игнорирует пробелы между элементами и запятые после объектов. Вы можете передавать все объекты в одной строке. Вы не обязаны разделять их переносами строки.

#### Обработка пропущенных значений {#omitted-values-processing}

ClickHouse заменяет пропущенные значения на значения по умолчанию для соответствующих [типов данных](/sql-reference/data-types/index.md).

Если указано `DEFAULT expr`, ClickHouse использует различные правила подстановки в зависимости от настройки [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields).

Рассмотрим следующую таблицу:

```sql title="Query"
CREATE TABLE IF NOT EXISTS example_table
(
    x UInt32,
    a DEFAULT x * 2
) ENGINE = Memory;
```

- Если `input_format_defaults_for_omitted_fields = 0`, тогда значение по умолчанию для `x` и `a` равно `0` (как значение по умолчанию для типа данных `UInt32`).
- Если `input_format_defaults_for_omitted_fields = 1`, тогда значение по умолчанию для `x` равно `0`, но значение по умолчанию для `a` равно `x * 2`.

:::note
При вставке данных с `input_format_defaults_for_omitted_fields = 1` ClickHouse потребляет больше вычислительных ресурсов по сравнению с вставкой с `input_format_defaults_for_omitted_fields = 0`.
:::

### Выбор данных {#json-selecting-data}

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

В отличие от формата [JSON](/interfaces/formats/JSON), нет подстановки недопустимых последовательностей UTF-8. Значения экранируются так же, как и для `JSON`.

:::info
Любой набор байтов может быть выведен в строках. Используйте формат [`JSONEachRow`](./JSONEachRow.md), если вы уверены, что данные в таблице могут быть отформатированы как JSON без потери какой-либо информации.
:::

### Использование вложенных структур {#jsoneachrow-nested}

Если у вас есть таблица с колонками типа [`Nested`](/sql-reference/data-types/nested-data-structures/index.md), вы можете вставлять JSON-данные с той же структурой. Включите эту функцию с помощью настройки [input_format_import_nested_json](/operations/settings/settings-formats.md/#input_format_import_nested_json).

Например, рассмотрим следующую таблицу:

```sql
CREATE TABLE json_each_row_nested (n Nested (s String, i Int32) ) ENGINE = Memory
```

Как видно из описания типа данных `Nested`, ClickHouse обрабатывает каждый компонент вложенной структуры как отдельную колонку (`n.s` и `n.i` для нашей таблицы). Вы можете вставить данные следующим образом:

```sql
INSERT INTO json_each_row_nested FORMAT JSONEachRow {"n.s": ["abc", "def"], "n.i": [1, 23]}
```

Чтобы вставить данные в виде иерархического JSON-объекта, установите [`input_format_import_nested_json=1`](/operations/settings/settings-formats.md/#input_format_import_nested_json).

```json
{
    "n": {
        "s": ["abc", "def"],
        "i": [1, 23]
    }
}
```

Без этой настройки ClickHouse выдает исключение.

```sql title="Query"
SELECT name, value FROM system.settings WHERE name = 'input_format_import_nested_json'
```

```response title="Response"
┌─name────────────────────────────┬─value─┐
│ input_format_import_nested_json │ 0     │
└─────────────────────────────────┴───────┘
```

```sql title="Query"
INSERT INTO json_each_row_nested FORMAT JSONEachRow {"n": {"s": ["abc", "def"], "i": [1, 23]}}
```

```response title="Response"
Code: 117. DB::Exception: Unknown field found while parsing JSONEachRow format: n: (at row 1)
```

```sql title="Query"
SET input_format_import_nested_json=1
INSERT INTO json_each_row_nested FORMAT JSONEachRow {"n": {"s": ["abc", "def"], "i": [1, 23]}}
SELECT * FROM json_each_row_nested
```

```response title="Response"
┌─n.s───────────┬─n.i────┐
│ ['abc','def'] │ [1,23] │
└───────────────┴────────┘
```

## Настройки формата {#format-settings}

| Настройка                                                                                                                                                                            | Описание                                                                                                                                                             | Значение по умолчанию  | Заметки                                                                                                                                                                                         |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`input_format_import_nested_json`](/operations/settings/settings-formats.md/#input_format_import_nested_json)                                                              | сопоставить вложенные JSON-данные со вложенными таблицами (это работает для формата JSONEachRow).                                                                                                | `false`  |                                                                                                                                                                                               |
| [`input_format_json_read_bools_as_numbers`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_numbers)                                              | разрешить парсить булевы значения как числа в JSON-входных форматах.                                                                                                                  | `true`   |                                                                                                                                                                                               |
| [`input_format_json_read_bools_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_strings)                                              | разрешить парсить булевы значения как строки в JSON-входных форматах.                                                                                                                  | `true`   |                                                                                                                                                                                               |
| [`input_format_json_read_numbers_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_numbers_as_strings)                                          | разрешить парсить числа как строки в JSON-входных форматах.                                                                                                                | `true`   |                                                                                                                                                                                               |
| [`input_format_json_read_arrays_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_arrays_as_strings)                                            | разрешить парсить JSON-массивы как строки в JSON-входных форматах.                                                                                                            | `true`   |                                                                                                                                                                                               |
| [`input_format_json_read_objects_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_objects_as_strings)                                          | разрешить парсить JSON-объекты как строки в JSON-входных форматах.                                                                                                           | `true`   |                                                                                                                                                                                               |
| [`input_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#input_format_json_named_tuples_as_objects)                                          | парсить именованные кортежи как JSON-объекты.                                                                                                                              | `true`   |                                                                                                                                                                                               |
| [`input_format_json_try_infer_numbers_from_strings`](/operations/settings/settings-formats.md/#input_format_json_try_infer_numbers_from_strings)                            | пытаться выводить числа из строковых полей во время вывода схемы.                                                                                                         | `false`  |                                                                                                                                                                                               |
| [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/settings-formats.md/#input_format_json_try_infer_named_tuples_from_objects)                  | пытаться выводить именованный кортеж из JSON-объектов во время вывода схемы.                                                                                                     | `true`   |                                                                                                                                                                                               |
| [`input_format_json_infer_incomplete_types_as_strings`](/operations/settings/settings-formats.md/#input_format_json_infer_incomplete_types_as_strings)                      | использовать тип String для ключей, которые содержат только null или пустые объекты/массивы во время вывода схемы в JSON-входных форматах.                                                | `true`   |                                                                                                                                                                                               |
| [`input_format_json_defaults_for_missing_elements_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_defaults_for_missing_elements_in_named_tuple) | вставлять значения по умолчанию для отсутствующих элементов в JSON-объекте при парсинге именованного кортежа.                                                                                   | `true`   |                                                                                                                                                                                               |
| [`input_format_json_ignore_unknown_keys_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_ignore_unknown_keys_in_named_tuple)                    | игнорировать неизвестные ключи в JSON-объекте для именованных кортежей.                                                                                                                    | `false`  |                                                                                                                                                                                               |
| [`input_format_json_compact_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_json_compact_allow_variable_number_of_columns)        | разрешить переменное количество колонок в формате JSONCompact/JSONCompactEachRow, игнорировать лишние колонки и использовать значения по умолчанию для отсутствующих колонок.                              | `false`  |                                                                                                                                                                                               |
| [`input_format_json_throw_on_bad_escape_sequence`](/operations/settings/settings-formats.md/#input_format_json_throw_on_bad_escape_sequence)                                | выбрасывать исключение, если строка JSON содержит недопустимую последовательность экранирования. Если отключено, недопустимые последовательности экранирования останутся неизменными в данных.                                        | `true`   |                                                                                                                                                                                               |
| [`input_format_json_empty_as_default`](/operations/settings/settings-formats.md/#input_format_json_empty_as_default)                                                        | рассматривать пустые поля в JSON-входе как значения по умолчанию.                                                                                                                     | `false`. | Для сложных выражений по умолчанию [`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) также должно быть включено. |
| [`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers)                                              | управляет экранированием 64-битовых целых чисел в формате JSON-вывода.                                                                                                              | `true`   |                                                                                                                                                                                               |
| [`output_format_json_quote_64bit_floats`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_floats)                                                  | управляет экранированием 64-битовых чисел с плавающей запятой в формате JSON-вывода.                                                                                                                | `false`  |                                                                                                                                                                                               |
| [`output_format_json_quote_denormals`](/operations/settings/settings-formats.md/#output_format_json_quote_denormals)                                                        | включает выводы '+nan', '-nan', '+inf', '-inf' в формате JSON-вывода.                                                                                                   | `false`  |                                                                                                                                                                                               |
| [`output_format_json_quote_decimals`](/operations/settings/settings-formats.md/#output_format_json_quote_decimals)                                                          | управляет экранированием десятичных чисел в формате JSON-вывода.                                                                                                                     | `false`  |                                                                                                                                                                                               |
| [`output_format_json_escape_forward_slashes`](/operations/settings/settings-formats.md/#output_format_json_escape_forward_slashes)                                          | управляет экранированием прямых слешей для строковых выводов в формате JSON-вывода.                                                                                             | `true`   |                                                                                                                                                                                               |
| [`output_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#output_format_json_named_tuples_as_objects)                                        | сериализовать именованные кортежи как JSON-объекты.                                                                                                                          | `true`   |                                                                                                                                                                                               |
| [`output_format_json_array_of_rows`](/operations/settings/settings-formats.md/#output_format_json_array_of_rows)                                                            | выводить массив JSON всех строк в формате JSONEachRow(Compact).                                                                                                         | `false`  |                                                                                                                                                                                               |
| [`output_format_json_validate_utf8`](/operations/settings/settings-formats.md/#output_format_json_validate_utf8)                                                            | включает проверку последовательностей UTF-8 в форматах JSON-вывода (обратите внимание, что это не влияет на форматы JSON/JSONCompact/JSONColumnsWithMetadata, они всегда проверяют utf8). | `false`  |                                                                                                                                                                                               |