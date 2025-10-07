---
slug: '/sql-reference/table-functions/fuzzJSON'
sidebar_label: fuzzJSON
sidebar_position: 75
description: 'Модифицирует строку JSON с случайными вариантами.'
title: fuzzJSON
doc_type: reference
---
# fuzzJSON Табличная Функция

Изменяет строку JSON с помощью случайных вариаций.

## Синтаксис {#syntax}

```sql
fuzzJSON({ named_collection [, option=value [,..]] | json_str[, random_seed] })
```

## Аргументы {#arguments}

| Аргумент                           | Описание                                                                                   |
|------------------------------------|-------------------------------------------------------------------------------------------|
| `named_collection`                 | [ИМЕННОЕ СОБРАНИЕ](sql-reference/statements/create/named-collection.md).                   |
| `option=value`                     | Опциональные параметры именованного коллекции и их значения.                              |
| `json_str` (String)                | Исходная строка, представляющая структурированные данные в формате JSON.                  |
| `random_seed` (UInt64)             | Указанный случайный сид для получения стабильных результатов.                              |
| `reuse_output` (boolean)           | Повторно использовать вывод из процесса изменения в качестве ввода для следующего фуззера. |
| `malform_output` (boolean)         | Сгенерировать строку, которую невозможно разобрать как объект JSON.                       |
| `max_output_length` (UInt64)       | Максимально допустимая длина сгенерированной или измененной строки JSON.                  |
| `probability` (Float64)            | Вероятность изменения поля JSON (пары ключ-значение). Должна находиться в диапазоне [0, 1].|
| `max_nesting_level` (UInt64)       | Максимально допустимая глубина вложенных структур в данных JSON.                          |
| `max_array_size` (UInt64)          | Максимально допустимый размер массива JSON.                                               |
| `max_object_size` (UInt64)         | Максимально допустимое количество полей на одном уровне объекта JSON.                     |
| `max_string_value_length` (UInt64) | Максимальная длина строки значения.                                                       |
| `min_key_length` (UInt64)          | Минимальная длина ключа. Должна быть не менее 1.                                         |
| `max_key_length` (UInt64)          | Максимальная длина ключа. Должна быть больше или равна `min_key_length`, если указана.  |

## Возвращаемое значение {#returned_value}

Объект таблицы с единственным столбцом, содержащим измененные строки JSON.

## Пример использования {#usage-example}

```sql
CREATE NAMED COLLECTION json_fuzzer AS json_str='{}';
SELECT * FROM fuzzJSON(json_fuzzer) LIMIT 3;
```

```text
{"52Xz2Zd4vKNcuP2":true}
{"UPbOhOQAdPKIg91":3405264103600403024}
{"X0QUWu8yT":[]}
```

```sql
SELECT * FROM fuzzJSON(json_fuzzer, json_str='{"name" : "value"}', random_seed=1234) LIMIT 3;
```

```text
{"key":"value", "mxPG0h1R5":"L-YQLv@9hcZbOIGrAn10%GA"}
{"BRE3":true}
{"key":"value", "SWzJdEJZ04nrpSfy":[{"3Q23y":[]}]}
```

```sql
SELECT * FROM fuzzJSON(json_fuzzer, json_str='{"students" : ["Alice", "Bob"]}', reuse_output=true) LIMIT 3;
```

```text
{"students":["Alice", "Bob"], "nwALnRMc4pyKD9Krv":[]}
{"students":["1rNY5ZNs0wU&82t_P", "Bob"], "wLNRGzwDiMKdw":[{}]}
{"xeEk":["1rNY5ZNs0wU&82t_P", "Bob"], "wLNRGzwDiMKdw":[{}, {}]}
```

```sql
SELECT * FROM fuzzJSON(json_fuzzer, json_str='{"students" : ["Alice", "Bob"]}', max_output_length=512) LIMIT 3;
```

```text
{"students":["Alice", "Bob"], "BREhhXj5":true}
{"NyEsSWzJdeJZ04s":["Alice", 5737924650575683711, 5346334167565345826], "BjVO2X9L":true}
{"NyEsSWzJdeJZ04s":["Alice", 5737924650575683711, 5346334167565345826], "BjVO2X9L":true, "k1SXzbSIz":[{}]}
```

```sql
SELECT * FROM fuzzJSON('{"id":1}', 1234) LIMIT 3;
```

```text
{"id":1, "mxPG0h1R5":"L-YQLv@9hcZbOIGrAn10%GA"}
{"BRjE":16137826149911306846}
{"XjKE":15076727133550123563}
```

```sql
SELECT * FROM fuzzJSON(json_nc, json_str='{"name" : "FuzzJSON"}', random_seed=1337, malform_output=true) LIMIT 3;
```

```text
U"name":"FuzzJSON*"SpByjZKtr2VAyHCO"falseh
{"name"keFuzzJSON, "g6vVO7TCIk":jTt^
{"DBhz":YFuzzJSON5}
```