---
title: JSONObjectEachRow
slug: /interfaces/formats/JSONObjectEachRow
keywords: ['JSONObjectEachRow']
input_format: true
output_format: true
alias: []
---

| Входные данные | Выходные данные | Псевдоним |
|----------------|----------------|-----------|
| ✔              | ✔              |           |

## Описание {#description}

В этом формате все данные представлены в виде одного JSON-объекта, при этом каждая строка представляется как отдельное поле этого объекта, аналогично формату [`JSONEachRow`](./JSONEachRow.md).

## Пример использования {#example-usage}

### Основной пример {#basic-example}

Дано некоторый JSON:

```json
{
  "row_1": {"num": 42, "str": "hello", "arr":  [0,1]},
  "row_2": {"num": 43, "str": "hello", "arr":  [0,1,2]},
  "row_3": {"num": 44, "str": "hello", "arr":  [0,1,2,3]}
}
```

Чтобы использовать имя объекта в качестве значения колонки, вы можете использовать специальную настройку [`format_json_object_each_row_column_for_object_name`](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name). Значение этой настройки устанавливается на имя колонки, которое используется в качестве ключа JSON для строки в результирующем объекте.

#### Выходные данные {#output}

Допустим, у нас есть таблица `test` с двумя колонками:

```text
┌─object_name─┬─number─┐
│ first_obj   │      1 │
│ second_obj  │      2 │
│ third_obj   │      3 │
└─────────────┴────────┘
```

Выведем это в формате `JSONObjectEachRow` и используем настройку `format_json_object_each_row_column_for_object_name`:

```sql title="Запрос"
SELECT * FROM test SETTINGS format_json_object_each_row_column_for_object_name='object_name'
```

```json title="Ответ"
{
	"first_obj": {"number": 1},
	"second_obj": {"number": 2},
	"third_obj": {"number": 3}
}
```

#### Входные данные {#input}

Допустим, мы сохранили выходные данные из предыдущего примера в файл с именем `data.json`:

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

Это также работает для вывода схемы:

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

- Произвольный порядок пар ключ-значение в объекте.
- Пропускать некоторые значения.

ClickHouse игнорирует пробелы между элементами и запятые после объектов. Вы можете передавать все объекты в одной строке. Вам не нужно разделять их переносами строк.

#### Обработка пропущенных значений {#omitted-values-processing}

ClickHouse заменяет пропущенные значения на значения по умолчанию для соответствующих [типов данных](/sql-reference/data-types/index.md).

Если указан `DEFAULT expr`, ClickHouse использует разные правила замены в зависимости от настройки [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields).

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
При вставке данных с `input_format_defaults_for_omitted_fields = 1` ClickHouse потребляет больше вычислительных ресурсов, по сравнению с вставкой с `input_format_defaults_for_omitted_fields = 0`.
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

В отличие от формата [JSON](/interfaces/formats/JSON), нет замены невалидных последовательностей UTF-8. Значения экранируются так же, как и для `JSON`.

:::info
Любой набор байт может выводиться в строках. Используйте формат [`JSONEachRow`](./JSONEachRow.md), если уверены, что данные в таблице могут быть отформатированы как JSON без потери какой-либо информации.
:::

### Использование вложенных структур {#jsoneachrow-nested}

Если у вас есть таблица с колонками типа [`Nested`](/sql-reference/data-types/nested-data-structures/index.md), вы можете вставлять данные JSON с той же структурой. Включите эту функцию с помощью настройки [input_format_import_nested_json](/operations/settings/settings-formats.md/#input_format_import_nested_json).

Например, рассмотрим следующую таблицу:

```sql
CREATE TABLE json_each_row_nested (n Nested (s String, i Int32) ) ENGINE = Memory
```

Как видно из описания типа данных `Nested`, ClickHouse обрабатывает каждый компонент вложенной структуры как отдельную колонку (`n.s` и `n.i` для нашей таблицы). Вы можете вставить данные следующим образом:

```sql
INSERT INTO json_each_row_nested FORMAT JSONEachRow {"n.s": ["abc", "def"], "n.i": [1, 23]}
```

Чтобы вставить данные как иерархический JSON-объект, установите [`input_format_import_nested_json=1`](/operations/settings/settings-formats.md/#input_format_import_nested_json).

```json
{
    "n": {
        "s": ["abc", "def"],
        "i": [1, 23]
    }
}
```

Без этой настройки ClickHouse выбросит исключение.

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

| Настройка                                                                                                                                                                            | Описание                                                                                                                                                             | Значение по умолчанию  | Примечания                                                                                                                                                                                         |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`input_format_import_nested_json`](/operations/settings/settings-formats.md/#input_format_import_nested_json)                                                              | сопоставить вложенные данные JSON с вложенными таблицами (работает для формата JSONEachRow).                                                                          | `false`                 |                                                                                                                                                                                               |
| [`input_format_json_read_bools_as_numbers`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_numbers)                                              | позволяет анализировать логические значения как числа в форматах ввода JSON.                                                                                          | `true`                  |                                                                                                                                                                                               |
| [`input_format_json_read_bools_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_strings)                                              | позволяет анализировать логические значения как строки в форматах ввода JSON.                                                                                          | `true`                  |                                                                                                                                                                                               |
| [`input_format_json_read_numbers_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_numbers_as_strings)                                          | позволяет анализировать числа как строки в форматах ввода JSON.                                                                                                       | `true`                  |                                                                                                                                                                                               |
| [`input_format_json_read_arrays_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_arrays_as_strings)                                            | позволяет анализировать массивы JSON как строки в форматах ввода JSON.                                                                                                | `true`                  |                                                                                                                                                                                               |
| [`input_format_json_read_objects_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_objects_as_strings)                                          | позволяет анализировать объекты JSON как строки в форматах ввода JSON.                                                                                                 | `true`                  |                                                                                                                                                                                               |
| [`input_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#input_format_json_named_tuples_as_objects)                                          | анализировать столбцы именованных кортежей как объекты JSON.                                                                                                          | `true`                  |                                                                                                                                                                                               |
| [`input_format_json_try_infer_numbers_from_strings`](/operations/settings/settings-formats.md/#input_format_json_try_infer_numbers_from_strings)                            | пытаться выводить числа из строковых полей во время вывода схемы.                                                                                                     | `false`                 |                                                                                                                                                                                               |
| [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/settings-formats.md/#input_format_json_try_infer_named_tuples_from_objects)                  | пытаться извлекать именованные кортежи из объектов JSON во время вывода схемы.                                                                                         | `true`                  |                                                                                                                                                                                               |
| [`input_format_json_infer_incomplete_types_as_strings`](/operations/settings/settings-formats.md/#input_format_json_infer_incomplete_types_as_strings)                      | использовать тип String для ключей, которые содержат только Null или пустые объекты/массивы во время вывода схемы в форматах ввода JSON.                             | `true`                  |                                                                                                                                                                                               |
| [`input_format_json_defaults_for_missing_elements_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_defaults_for_missing_elements_in_named_tuple) | вставлять значения по умолчанию для отсутствующих элементов в объекте JSON при разборе именованного кортежа.                                                           | `true`                  |                                                                                                                                                                                               |
| [`input_format_json_ignore_unknown_keys_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_ignore_unknown_keys_in_named_tuple)                    | игнорировать неизвестные ключи в объекте JSON для именованных кортежей.                                                                                               | `false`                 |                                                                                                                                                                                               |
| [`input_format_json_compact_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_json_compact_allow_variable_number_of_columns)        | позволяет переменное количество колонок в формате JSONCompact/JSONCompactEachRow, игнорирует лишние колонки и использует значения по умолчанию для отсутствующих колонок. | `false`                 |                                                                                                                                                                                               |
| [`input_format_json_throw_on_bad_escape_sequence`](/operations/settings/settings-formats.md/#input_format_json_throw_on_bad_escape_sequence)                                | выбрасывать исключение, если строка JSON содержит неправильную экранированную последовательность. Если отключить, неправильные экранированные последовательности останутся как есть в данных. | `true`                  |                                                                                                                                                                                               |
| [`input_format_json_empty_as_default`](/operations/settings/settings-formats.md/#input_format_json_empty_as_default)                                                        | рассматривать пустые поля в JSON-входе как значения по умолчанию.                                                                                                     | `false`.                | Для сложных значений по умолчанию [`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) также должны быть включены. |
| [`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers)                                              | управляет экранированием 64-битных целых чисел в формате вывода JSON.                                                                                                | `true`                  |                                                                                                                                                                                               |
| [`output_format_json_quote_64bit_floats`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_floats)                                                  | управляет экранированием 64-битных чисел с плавающей запятой в формате вывода JSON.                                                                                   | `false`                 |                                                                                                                                                                                               |
| [`output_format_json_quote_denormals`](/operations/settings/settings-formats.md/#output_format_json_quote_denormals)                                                        | включает выводы '+nan', '-nan', '+inf', '-inf' в формате вывода JSON.                                                                                                | `false`                 |                                                                                                                                                                                               |
| [`output_format_json_quote_decimals`](/operations/settings/settings-formats.md/#output_format_json_quote_decimals)                                                          | управляет экранированием десятичных значений в формате вывода JSON.                                                                                                  | `false`                 |                                                                                                                                                                                               |
| [`output_format_json_escape_forward_slashes`](/operations/settings/settings-formats.md/#output_format_json_escape_forward_slashes)                                          | управляет экранированием косых черт в строковых выходах в формате вывода JSON.                                                                                        | `true`                  |                                                                                                                                                                                               |
| [`output_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#output_format_json_named_tuples_as_objects)                                        | сериализовать столбцы именованных кортежей как объекты JSON.                                                                                                         | `true`                  |                                                                                                                                                                                               |
| [`output_format_json_array_of_rows`](/operations/settings/settings-formats.md/#output_format_json_array_of_rows)                                                            | выводить массив JSON всех строк в формате JSONEachRow(Compact).                                                                                                      | `false`                 |                                                                                                                                                                                               |
| [`output_format_json_validate_utf8`](/operations/settings/settings-formats.md/#output_format_json_validate_utf8)                                                            | включает проверку последовательностей UTF-8 в форматах вывода JSON (обратите внимание, что это не влияет на форматы JSON/JSONCompact/JSONColumnsWithMetadata, они всегда проверяют utf8). | `false`                 |                                                                                                                                                                                               |
