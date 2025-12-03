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

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✔     | ✔      |       |



## Описание {#description}

В этом формате все данные представлены одним JSON-объектом, где каждая строка является отдельным полем этого объекта, аналогично формату [`JSONEachRow`](./JSONEachRow.md).



## Пример использования {#example-usage}

### Базовый пример {#basic-example}

Пусть у нас есть следующий JSON:

```json
{
  "row_1": {"num": 42, "str": "hello", "arr":  [0,1]},
  "row_2": {"num": 43, "str": "hello", "arr":  [0,1,2]},
  "row_3": {"num": 44, "str": "hello", "arr":  [0,1,2,3]}
}
```

Чтобы использовать имя объекта в качестве значения в столбце, вы можете воспользоваться специальной настройкой [`format_json_object_each_row_column_for_object_name`](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name).
В качестве значения этой настройки задаётся имя столбца, который используется как JSON-ключ для строки в результирующем объекте.

#### Вывод {#output}

Допустим, у нас есть таблица `test` с двумя столбцами:

```text
┌─object_name─┬─number─┐
│ first_obj   │      1 │
│ second_obj  │      2 │
│ third_obj   │      3 │
└─────────────┴────────┘
```

Выведем его в формате `JSONObjectEachRow` и воспользуемся настройкой `format_json_object_each_row_column_for_object_name`:

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

Допустим, мы сохранили результат из предыдущего примера в файл с именем `data.json`:

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

Также работает для автоматического определения схемы:

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

* Любой порядок пар ключ–значение в объекте.
* Пропуск некоторых значений.

ClickHouse игнорирует пробелы между элементами и запятые после объектов. Вы можете передавать все объекты в одной строке. Не требуется разделять их переводами строки.

#### Обработка пропущенных значений {#omitted-values-processing}

ClickHouse подставляет пропущенные значения значениями по умолчанию для соответствующих [типов данных](/sql-reference/data-types/index.md).

Если указано `DEFAULT expr`, ClickHouse использует разные правила подстановки в зависимости от настройки [input&#95;format&#95;defaults&#95;for&#95;omitted&#95;fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields).

Рассмотрим следующую таблицу:

```sql title="Query"
CREATE TABLE IF NOT EXISTS example_table
(
    x UInt32,
    a DEFAULT x * 2
) ENGINE = Memory;
```

* Если `input_format_defaults_for_omitted_fields = 0`, то значение по умолчанию для `x` и `a` равно `0` (как и значение по умолчанию для типа данных `UInt32`).
* Если `input_format_defaults_for_omitted_fields = 1`, то значение по умолчанию для `x` равно `0`, но значение по умолчанию для `a` равно `x * 2`.

:::note
При вставке данных при `input_format_defaults_for_omitted_fields = 1` ClickHouse потребляет больше вычислительных ресурсов по сравнению со вставкой при `input_format_defaults_for_omitted_fields = 0`.
:::

### Выборка данных {#json-selecting-data}

Рассмотрим в качестве примера таблицу `UserActivity`:


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

В отличие от формата [JSON](/interfaces/formats/JSON), некорректные последовательности UTF-8 не подставляются. Значения экранируются так же, как для `JSON`.

:::info
Любой набор байт может выводиться в строковых значениях. Используйте формат [`JSONEachRow`](./JSONEachRow.md), если вы уверены, что данные в таблице могут быть отформатированы как JSON без потери какой-либо информации.
:::

### Использование вложенных структур {#jsoneachrow-nested}

Если у вас есть таблица со столбцами типа данных [`Nested`](/sql-reference/data-types/nested-data-structures/index.md), вы можете вставлять JSON-данные с той же структурой. Включите эту возможность с помощью настройки [input&#95;format&#95;import&#95;nested&#95;json](/operations/settings/settings-formats.md/#input_format_import_nested_json).

Например, рассмотрим следующую таблицу:

```sql
CREATE TABLE json_each_row_nested (n Nested (s String, i Int32) ) ENGINE = Memory
```

Как видно из описания типа данных `Nested`, ClickHouse обрабатывает каждый компонент вложенной структуры как отдельный столбец (`n.s` и `n.i` для нашей таблицы). Данные можно вставлять следующим образом:

```sql
INSERT INTO json_each_row_nested FORMAT JSONEachRow {"n.s": ["abc", "def"], "n.i": [1, 23]}
```

Для вставки данных в виде иерархического объекта JSON установите [`input_format_import_nested_json=1`](/operations/settings/settings-formats.md/#input_format_import_nested_json).

```json
{
    "n": {
        "s": ["abc", "def"],
        "i": [1, 23]
    }
}
```

Без этой настройки ClickHouse выдаёт исключение.

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
Код: 117. DB::Exception: Обнаружено неизвестное поле при парсинге формата JSONEachRow: n: (в строке 1)
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


## Параметры форматирования {#format-settings}



| Настройка                                                                                                                                                                    | Описание                                                                                                                                                                                      | По умолчанию | Примечания                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`input_format_import_nested_json`](/operations/settings/settings-formats.md/#input_format_import_nested_json)                                                               | сопоставлять вложенные данные JSON вложенным таблицам (работает для формата JSONEachRow).                                                                                                     | `false`      |                                                                                                                                                                                                |
| [`input_format_json_read_bools_as_numbers`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_numbers)                                               | позволяет интерпретировать логические значения как числа во входных форматах JSON.                                                                                                            | `true`       |                                                                                                                                                                                                |
| [`input_format_json_read_bools_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_strings)                                               | позволяет интерпретировать логические значения как строки во входных форматах JSON.                                                                                                           | `true`       |                                                                                                                                                                                                |
| [`input_format_json_read_numbers_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_numbers_as_strings)                                           | позволяет интерпретировать числа как строки во входных форматах JSON.                                                                                                                         | `true`       |                                                                                                                                                                                                |
| [`input_format_json_read_arrays_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_arrays_as_strings)                                             | позволяет интерпретировать массивы JSON как строки во входных форматах JSON.                                                                                                                  | `true`       |                                                                                                                                                                                                |
| [`input_format_json_read_objects_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_objects_as_strings)                                           | позволяет интерпретировать JSON‑объекты как строки во входных форматах JSON.                                                                                                                  | `true`       |                                                                                                                                                                                                |
| [`input_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#input_format_json_named_tuples_as_objects)                                           | разбирать столбцы типа NamedTuple как JSON-объекты.                                                                                                                                           | `true`       |                                                                                                                                                                                                |
| [`input_format_json_try_infer_numbers_from_strings`](/operations/settings/settings-formats.md/#input_format_json_try_infer_numbers_from_strings)                             | пытаться распознавать числа в строковых полях при автоматическом определении схемы.                                                                                                           | `false`      |                                                                                                                                                                                                |
| [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/settings-formats.md/#input_format_json_try_infer_named_tuples_from_objects)                   | пытаться выводить тип NamedTuple из JSON-объектов при определении схемы.                                                                                                                      | `true`       |                                                                                                                                                                                                |
| [`input_format_json_infer_incomplete_types_as_strings`](/operations/settings/settings-formats.md/#input_format_json_infer_incomplete_types_as_strings)                       | используйте тип String для ключей, которые содержат только значения Null или пустые объекты/массивы при выводе схемы во входных форматах JSON.                                                | `true`       |                                                                                                                                                                                                |
| [`input_format_json_defaults_for_missing_elements_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_defaults_for_missing_elements_in_named_tuple) | вставлять значения по умолчанию для отсутствующих полей объекта JSON при разборе именованного кортежа.                                                                                        | `true`       |                                                                                                                                                                                                |
| [`input_format_json_ignore_unknown_keys_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_ignore_unknown_keys_in_named_tuple)                     | игнорировать неизвестные ключи в JSON-объекте для именованных кортежей.                                                                                                                       | `false`      |                                                                                                                                                                                                |
| [`input_format_json_compact_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_json_compact_allow_variable_number_of_columns)         | разрешить переменное количество столбцов в формате JSONCompact/JSONCompactEachRow, игнорировать лишние столбцы и использовать значения по умолчанию для отсутствующих столбцов.               | `false`      |                                                                                                                                                                                                |
| [`input_format_json_throw_on_bad_escape_sequence`](/operations/settings/settings-formats.md/#input_format_json_throw_on_bad_escape_sequence)                                 | выбрасывать исключение, если JSON-строка содержит некорректную escape-последовательность. Если параметр отключен, некорректные escape-последовательности останутся в данных как есть.         | `true`       |                                                                                                                                                                                                |
| [`input_format_json_empty_as_default`](/operations/settings/settings-formats.md/#input_format_json_empty_as_default)                                                         | обрабатывать пустые поля во входном JSON-документе как значения по умолчанию.                                                                                                                 | `false`.     | Для сложных выражений по умолчанию необходимо также включить [`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields). |
| [`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers)                                               | управляет заключением 64-битных целых чисел в кавычки в выходном формате JSON.                                                                                                                | `true`       |                                                                                                                                                                                                |
| [`output_format_json_quote_64bit_floats`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_floats)                                                   | определяет, заключать ли 64-битные числа с плавающей запятой в кавычки в формате вывода JSON.                                                                                                 | `false`      |                                                                                                                                                                                                |
| [`output_format_json_quote_denormals`](/operations/settings/settings-formats.md/#output_format_json_quote_denormals)                                                         | разрешает вывод значений &#39;+nan&#39;, &#39;-nan&#39;, &#39;+inf&#39;, &#39;-inf&#39; в формате JSON.                                                                                       | `false`      |                                                                                                                                                                                                |
| [`output_format_json_quote_decimals`](/operations/settings/settings-formats.md/#output_format_json_quote_decimals)                                                           | управляет тем, будут ли десятичные числа заключаться в кавычки в выводе в формате JSON.                                                                                                       | `false`      |                                                                                                                                                                                                |
| [`output_format_json_escape_forward_slashes`](/operations/settings/settings-formats.md/#output_format_json_escape_forward_slashes)                                           | управляет экранированием косых черт в строковых значениях при выводе в формате JSON.                                                                                                          | `true`       |                                                                                                                                                                                                |
| [`output_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#output_format_json_named_tuples_as_objects)                                         | сериализует столбцы именованных кортежей в виде JSON-объектов.                                                                                                                                | `true`       |                                                                                                                                                                                                |
| [`output_format_json_array_of_rows`](/operations/settings/settings-formats.md/#output_format_json_array_of_rows)                                                             | выводит JSON-массив всех строк в формате JSONEachRow(Compact).                                                                                                                                | `false`      |                                                                                                                                                                                                |
| [`output_format_json_validate_utf8`](/operations/settings/settings-formats.md/#output_format_json_validate_utf8)                                                             | включает проверку корректности последовательностей UTF-8 в форматах вывода JSON (учтите, что это не влияет на форматы JSON/JSONCompact/JSONColumnsWithMetadata — они всегда проверяют UTF-8). | `false`      |                                                                                                                                                                                                |