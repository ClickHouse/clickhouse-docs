---
description: 'Документация по функциям для работы со словарями'
sidebar_label: 'Словари'
slug: /sql-reference/functions/ext-dict-functions
title: 'Функции для работы со словарями'
doc_type: 'reference'
---

# Функции для работы со словарями \{#functions-for-working-with-dictionaries\}

:::note
Для словарей, создаваемых с помощью [DDL‑запросов](../../sql-reference/statements/create/dictionary.md), параметр `dict_name` должен быть полностью указан в формате `<database>.<dict_name>`. В противном случае используется текущая база данных.
:::

Информацию о подключении и настройке словарей см. в разделе [Словари](../../sql-reference/dictionaries/index.md).

## Примеры словарей \{#example-dictionary\}

Примеры в этом разделе используют следующие словари. Вы можете создать их в ClickHouse,
чтобы выполнить примеры для функций, описанных ниже.

<details>
<summary>Пример словаря для функций dictGet&lt;T&gt; и dictGet&lt;T&gt;OrDefault</summary>

```sql
-- Создать таблицу со всеми необходимыми типами данных
CREATE TABLE all_types_test (
    `id` UInt32,
    
    -- Тип String
    `String_value` String,
    
    -- Беззнаковые целочисленные типы
    `UInt8_value` UInt8,
    `UInt16_value` UInt16,
    `UInt32_value` UInt32,
    `UInt64_value` UInt64,
    
    -- Знаковые целочисленные типы
    `Int8_value` Int8,
    `Int16_value` Int16,
    `Int32_value` Int32,
    `Int64_value` Int64,
    
    -- Типы с плавающей точкой
    `Float32_value` Float32,
    `Float64_value` Float64,
    
    -- Типы даты/времени
    `Date_value` Date,
    `DateTime_value` DateTime,
    
    -- Сетевые типы
    `IPv4_value` IPv4,
    `IPv6_value` IPv6,
    
    -- Тип UUID
    `UUID_value` UUID
) ENGINE = MergeTree() 
ORDER BY id;
```
```sql
-- Вставить тестовые данные
INSERT INTO all_types_test VALUES
(
    1,                              -- id
    'ClickHouse',                   -- String
    100,                            -- UInt8
    5000,                           -- UInt16
    1000000,                        -- UInt32
    9223372036854775807,            -- UInt64
    -100,                           -- Int8
    -5000,                          -- Int16
    -1000000,                       -- Int32
    -9223372036854775808,           -- Int64
    123.45,                         -- Float32
    987654.123456,                  -- Float64
    '2024-01-15',                   -- Date
    '2024-01-15 10:30:00',          -- DateTime
    '192.168.1.1',                  -- IPv4
    '2001:db8::1',                  -- IPv6
    '550e8400-e29b-41d4-a716-446655440000' -- UUID
)
```

```sql
-- Создать словарь
CREATE DICTIONARY all_types_dict
(
    id UInt32,
    String_value String,
    UInt8_value UInt8,
    UInt16_value UInt16,
    UInt32_value UInt32,
    UInt64_value UInt64,
    Int8_value Int8,
    Int16_value Int16,
    Int32_value Int32,
    Int64_value Int64,
    Float32_value Float32,
    Float64_value Float64,
    Date_value Date,
    DateTime_value DateTime,
    IPv4_value IPv4,
    IPv6_value IPv6,
    UUID_value UUID
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(HOST 'localhost' PORT 9000 USER 'default' TABLE 'all_types_test' DB 'default'))
LAYOUT(HASHED())
LIFETIME(MIN 300 MAX 600);
```
</details>

<details>
<summary>Пример словаря для dictGetAll</summary>

Создайте таблицу для хранения данных словаря regexp tree:

```sql
CREATE TABLE regexp_os(
    id UInt64,
    parent_id UInt64,
    regexp String,
    keys Array(String),
    values Array(String)
)
ENGINE = Memory;
```

Вставьте данные в таблицу:

```sql
INSERT INTO regexp_os 
SELECT *
FROM s3(
    'https://datasets-documentation.s3.eu-west-3.amazonaws.com/' ||
    'user_agent_regex/regexp_os.csv'
);
```

Создайте словарь regexp tree:

```sql
CREATE DICTIONARY regexp_tree
(
    regexp String,
    os_replacement String DEFAULT 'Other',
    os_v1_replacement String DEFAULT '0',
    os_v2_replacement String DEFAULT '0',
    os_v3_replacement String DEFAULT '0',
    os_v4_replacement String DEFAULT '0'
)
PRIMARY KEY regexp
SOURCE(CLICKHOUSE(TABLE 'regexp_os'))
LIFETIME(MIN 0 MAX 0)
LAYOUT(REGEXP_TREE);
```
</details>

<details>
  <summary>Пример словаря с ключом-диапазоном</summary>

  Создайте исходную таблицу:

  ```sql
  CREATE TABLE range_key_dictionary_source_table
  (
      key UInt64,
      start_date Date,
      end_date Date,
      value String,
      value_nullable Nullable(String)
  )
  ENGINE = TinyLog();
  ```

  Вставьте данные в исходную таблицу:

  ```sql
  INSERT INTO range_key_dictionary_source_table VALUES(1, toDate('2019-05-20'), toDate('2019-05-20'), 'First', 'First');
  INSERT INTO range_key_dictionary_source_table VALUES(2, toDate('2019-05-20'), toDate('2019-05-20'), 'Second', NULL);
  INSERT INTO range_key_dictionary_source_table VALUES(3, toDate('2019-05-20'), toDate('2019-05-20'), 'Third', 'Third');
  ```

  Создайте словарь:

  ```sql
  CREATE DICTIONARY range_key_dictionary
  (
      key UInt64,
      start_date Date,
      end_date Date,
      value String,
      value_nullable Nullable(String)
  )
  PRIMARY KEY key
  SOURCE(CLICKHOUSE(HOST 'localhost' PORT tcpPort() TABLE 'range_key_dictionary_source_table'))
  LIFETIME(MIN 1 MAX 1000)
  LAYOUT(RANGE_HASHED())
  RANGE(MIN start_date MAX end_date);
  ```
</details>

<details>
  <summary>Пример словаря со сложным ключом</summary>

  Создайте исходную таблицу:

  ```sql
  CREATE TABLE dict_mult_source
  (
  id UInt32,
  c1 UInt32,
  c2 String
  ) ENGINE = Memory;
  ```

  Вставьте данные в исходную таблицу:

  ```sql
  INSERT INTO dict_mult_source VALUES
  (1, 1, '1'),
  (2, 2, '2'),
  (3, 3, '3');
  ```

  Создайте словарь:

  ```sql
  CREATE DICTIONARY ext_dict_mult
  (
      id UInt32,
      c1 UInt32,
      c2 String
  )
  PRIMARY KEY id
  SOURCE(CLICKHOUSE(HOST 'localhost' PORT 9000 USER 'default' TABLE 'dict_mult_source' DB 'default'))
  LAYOUT(FLAT())
  LIFETIME(MIN 0 MAX 0);
  ```
</details>

<details>
  <summary>Пример иерархического словаря</summary>

  Создайте исходную таблицу:

  ```sql
  CREATE TABLE hierarchy_source
  (
    id UInt64,
    parent_id UInt64,
    name String
  ) ENGINE = Memory;
  ```

  Вставьте данные в исходную таблицу:

  ```sql
  INSERT INTO hierarchy_source VALUES
  (0, 0, 'Root'),
  (1, 0, 'Level 1 - Node 1'),
  (2, 1, 'Level 2 - Node 2'),
  (3, 1, 'Level 2 - Node 3'),
  (4, 2, 'Level 3 - Node 4'),
  (5, 2, 'Level 3 - Node 5'),
  (6, 3, 'Level 3 - Node 6');

  -- 0 (Корень)
  -- └── 1 (Уровень 1 - Узел 1)
  --     ├── 2 (Уровень 2 - Узел 2)
  --     │   ├── 4 (Уровень 3 - Узел 4)
  --     │   └── 5 (Уровень 3 - Узел 5)
  --     └── 3 (Уровень 2 - Узел 3)
  --         └── 6 (Уровень 3 - Узел 6)
  ```

  Создайте словарь:

  ```sql
  CREATE DICTIONARY hierarchical_dictionary
  (
      id UInt64,
      parent_id UInt64 HIERARCHICAL,
      name String
  )
  PRIMARY KEY id
  SOURCE(CLICKHOUSE(HOST 'localhost' PORT 9000 USER 'default' TABLE 'hierarchy_source' DB 'default'))
  LAYOUT(HASHED())
  LIFETIME(MIN 300 MAX 600);
  ```
</details>

{/* 
  Во время сборки фреймворка документации содержимое приведённых ниже тегов заменяется документацией, сгенерированной на основе system.functions.
  Не изменяйте и не удаляйте эти теги.
  См.: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }


## dictGet \{#dictGet\}

Появилась в версии v18.16

Извлекает значения из словаря.

**Синтаксис**

```sql
dictGet('dict_name', attr_names, id_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_names` — Имя столбца словаря или кортеж имён столбцов. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — Значение ключа. Выражение, возвращающее UInt64 или Tuple(T). [`UInt64`](/sql-reference/data-types/int-uint) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`, если ключ найден.
Если ключ не найден, возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

**Примеры**

**Получение одного атрибута**

```sql title=Query
SELECT dictGet('ext_dict_test', 'c1', toUInt64(1)) AS val
```

```response title=Response
1
```

**Несколько атрибутов**

```sql title=Query
SELECT
    dictGet('ext_dict_mult', ('c1','c2'), number + 1) AS val,
    toTypeName(val) AS type
FROM system.numbers
LIMIT 3;
```

```response title=Response
┌─val─────┬─type───────────┐
│ (1,'1') │ Tuple(        ↴│
│         │↳    c1 UInt32,↴│
│         │↳    c2 String) │
│ (2,'2') │ Tuple(        ↴│
│         │↳    c1 UInt32,↴│
│         │↳    c2 String) │
│ (3,'3') │ Tuple(        ↴│
│         │↳    c1 UInt32,↴│
│         │↳    c2 String) │
└─────────┴────────────────┘
```


## dictGetAll \{#dictGetAll\}

Добавлена в версии: v23.5

Преобразует значение атрибута словаря к типу данных `All` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetAll(dict_name, attr_name, id_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — Имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — Значение ключа. Выражение, возвращающее значение типа ключа словаря или значение кортежа (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, которое соответствует `id_expr`,
в противном случае возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

:::note
ClickHouse генерирует исключение, если не может интерпретировать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    'Mozilla/5.0 (Linux; Android 12; SM-G998B) Mobile Safari/537.36' AS user_agent,

    -- This will match ALL applicable patterns
    dictGetAll('regexp_tree', 'os_replacement', 'Mozilla/5.0 (Linux; Android 12; SM-G998B) Mobile Safari/537.36') AS all_matches,

    -- This returns only the first match
    dictGet('regexp_tree', 'os_replacement', 'Mozilla/5.0 (Linux; Android 12; SM-G998B) Mobile Safari/537.36') AS first_match;
```

```response title=Response
┌─user_agent─────────────────────────────────────────────────────┬─all_matches─────────────────────────────┬─first_match─┐
│ Mozilla/5.0 (Linux; Android 12; SM-G998B) Mobile Safari/537.36 │ ['Android','Android','Android','Linux'] │ Android     │
└────────────────────────────────────────────────────────────────┴─────────────────────────────────────────┴─────────────┘
```


## dictGetChildren \{#dictGetChildren\}

Введена в версии: v21.4

Возвращает дочерние элементы первого уровня в виде массива индексов. Является обратным преобразованием для [dictGetHierarchy](#dictGetHierarchy).

**Синтаксис**

```sql
dictGetChildren(dict_name, key)
```

**Аргументы**

* `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
* `key` — ключ, для которого выполняется проверка. [`const String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает потомков первого уровня для указанного ключа. [`Array(UInt64)`](/sql-reference/data-types/array)

**Примеры**

**Получение потомков первого уровня в словаре**

```sql title=Query
SELECT dictGetChildren('hierarchical_dictionary', 2);
```

```response title=Response
┌─dictGetChild⋯ionary', 2)─┐
│ [4,5]                    │
└──────────────────────────┘
```


## dictGetDate \{#dictGetDate\}

Введено в версии: v1.1

Преобразует значение атрибута словаря к типу данных `Date` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetDate(dict_name, attr_name, id_expr)
```

**Аргументы**

* `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — значение ключа, выражение, возвращающее значение типа ключа словаря или значение кортежа (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает содержимое элемента `<null_value>`, заданного для атрибута в конфигурации словаря.

:::note
ClickHouse генерирует исключение, если не может прочитать значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
SELECT dictGetDate('all_types_dict', 'Date_value', 1)
```

```response title=Response
┌─dictGetDate(⋯_value', 1)─┐
│               2020-01-01 │
└──────────────────────────┘
```


## dictGetDateOrDefault \{#dictGetDateOrDefault\}

Добавлена в версии: v1.1

Преобразует значение атрибута словаря к типу данных `Date` независимо от конфигурации словаря или возвращает указанное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetDateOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — Имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — Значение ключа. Выражение, возвращающее значение типа ключа словаря или значение кортежа (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Значение (значения), возвращаемое, если словарь не содержит строку с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, которое соответствует `id_expr`,
иначе возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse генерирует исключение, если не может интерпретировать значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- for key which exists
SELECT dictGetDate('all_types_dict', 'Date_value', 1);

-- for key which does not exist, returns the provided default value
SELECT dictGetDateOrDefault('all_types_dict', 'Date_value', 999, toDate('1970-01-01'));
```

```response title=Response
┌─dictGetDate(⋯_value', 1)─┐
│               2024-01-15 │
└──────────────────────────┘
┌─dictGetDateO⋯70-01-01'))─┐
│               1970-01-01 │
└──────────────────────────┘
```


## dictGetDateTime \{#dictGetDateTime\}

Добавлена в версии: v1.1

Преобразует значение атрибута словаря в тип данных `DateTime` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetDateTime(dict_name, attr_name, id_expr)
```

**Аргументы**

* `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
иначе — содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
SELECT dictGetDateTime('all_types_dict', 'DateTime_value', 1)
```

```response title=Response
┌─dictGetDateT⋯_value', 1)─┐
│      2024-01-15 10:30:00 │
└──────────────────────────┘
```


## dictGetDateTimeOrDefault \{#dictGetDateTimeOrDefault\}

Появилась в версии: v1.1

Преобразует значение атрибута словаря к типу данных `DateTime` независимо от конфигурации словаря или возвращает указанное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetDateTimeOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — Имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — Значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж значений (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Значение или значения, возвращаемые, если словарь не содержит строку с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, которое соответствует `id_expr`, а в противном случае — значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- for key which exists
SELECT dictGetDateTime('all_types_dict', 'DateTime_value', 1);

-- for key which does not exist, returns the provided default value
SELECT dictGetDateTimeOrDefault('all_types_dict', 'DateTime_value', 999, toDateTime('1970-01-01 00:00:00'));
```

```response title=Response
┌─dictGetDateT⋯_value', 1)─┐
│      2024-01-15 10:30:00 │
└──────────────────────────┘
┌─dictGetDateT⋯0:00:00'))──┐
│      1970-01-01 00:00:00 │
└──────────────────────────┘
```


## dictGetDescendants \{#dictGetDescendants\}

Впервые появилась в версии v21.4

Возвращает всех потомков, как если бы функция [`dictGetChildren`](#dictGetChildren) была рекурсивно применена `level` раз.

**Синтаксис**

```sql
dictGetDescendants(dict_name, key, level)
```

**Аргументы**

* `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
* `key` — ключ для проверки. [`const String`](/sql-reference/data-types/string)
* `level` — уровень иерархии. Если `level = 0`, возвращает всех потомков до конечного уровня. [`UInt8`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает потомков для указанного ключа. [`Array(UInt64)`](/sql-reference/data-types/array)

**Примеры**

**Получение потомков первого уровня словаря**

```sql title=Query
-- consider the following hierarchical dictionary:
-- 0 (Root)
-- └── 1 (Level 1 - Node 1)
--     ├── 2 (Level 2 - Node 2)
--     │   ├── 4 (Level 3 - Node 4)
--     │   └── 5 (Level 3 - Node 5)
--     └── 3 (Level 2 - Node 3)
--         └── 6 (Level 3 - Node 6)

SELECT dictGetDescendants('hierarchical_dictionary', 0, 2)
```

```response title=Response
┌─dictGetDesce⋯ary', 0, 2)─┐
│ [3,2]                    │
└──────────────────────────┘
```


## dictGetFloat32 \{#dictGetFloat32\}

Добавлено в версии v1.1

Преобразует значение атрибута словаря к типу данных `Float32` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetFloat32(dict_name, attr_name, id_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — Имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — Значение ключа. Выражение, возвращающее значение типа ключа словаря или значение-кортеж (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

:::note
ClickHouse выбрасывает исключение, если не может преобразовать значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
SELECT dictGetFloat32('all_types_dict', 'Float32_value', 1)
```

```response title=Response
┌─dictGetFloat⋯_value', 1)─┐
│               -123.123   │
└──────────────────────────┘
```


## dictGetFloat32OrDefault \{#dictGetFloat32OrDefault\}

Введена в версии: v1.1

Преобразует значение атрибута словаря к типу данных `Float32` независимо от конфигурации словаря или возвращает указанное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetFloat32OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — Имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — Значение ключа. Выражение, возвращающее значение типа ключа словаря или значение кортежа (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Значение или значения, возвращаемые, если в словаре нет строки с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
иначе возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse выбрасывает исключение, если не может разобрать значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- for key which exists
SELECT dictGetFloat32('all_types_dict', 'Float32_value', 1);

-- for key which does not exist, returns the provided default value (-1.0)
SELECT dictGetFloat32OrDefault('all_types_dict', 'Float32_value', 999, -1.0);
```

```response title=Response
┌─dictGetFloat⋯_value', 1)─┐
│                   123.45 │
└──────────────────────────┘
┌─dictGetFloat⋯e', 999, -1)─┐
│                       -1  │
└───────────────────────────┘
```


## dictGetFloat64 \{#dictGetFloat64\}

Впервые представлена в: v1.1

Приводит значение атрибута словаря к типу данных `Float64` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetFloat64(dict_name, attr_name, id_expr)
```

**Аргументы**

* `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж значений (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, которое соответствует `id_expr`,
в противном случае возвращает содержимое элемента `<null_value>`, заданного для атрибута в конфигурации словаря.

:::note
ClickHouse генерирует исключение, если не может интерпретировать значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
SELECT dictGetFloat64('all_types_dict', 'Float64_value', 1)
```

```response title=Response
┌─dictGetFloat⋯_value', 1)─┐
│                 -123.123 │
└──────────────────────────┘
```


## dictGetFloat64OrDefault \{#dictGetFloat64OrDefault\}

Добавлено в версии: v1.1

Преобразует значение атрибута словаря к типу данных `Float64` независимо от конфигурации словаря или возвращает указанное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetFloat64OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — Имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — Значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Значения, возвращаемые, если словарь не содержит строки с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, которое соответствует `id_expr`,
в противном случае возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- for key which exists
SELECT dictGetFloat64('all_types_dict', 'Float64_value', 1);

-- for key which does not exist, returns the provided default value (nan)
SELECT dictGetFloat64OrDefault('all_types_dict', 'Float64_value', 999, nan);
```

```response title=Response
┌─dictGetFloat⋯_value', 1)─┐
│            987654.123456 │
└──────────────────────────┘
┌─dictGetFloat⋯, 999, nan)─┐
│                      nan │
└──────────────────────────┘
```


## dictGetHierarchy \{#dictGetHierarchy\}

Впервые представлена в: v1.1

Создаёт массив, содержащий всех родителей ключа в [иерархическом словаре](../../sql-reference/dictionaries/index.md#hierarchical-dictionaries).

**Синтаксис**

```sql
dictGetHierarchy(dict_name, key)
```

**Аргументы**

* `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
* `key` — значение ключа. [`const String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает родителей ключа. [`Array(UInt64)`](/sql-reference/data-types/array)

**Примеры**

**Получение иерархии ключа**

```sql title=Query
SELECT dictGetHierarchy('hierarchical_dictionary', 5)
```

```response title=Response
┌─dictGetHiera⋯ionary', 5)─┐
│ [5,2,1]                  │
└──────────────────────────┘
```


## dictGetIPv4 \{#dictGetIPv4\}

Добавлена в версии: v1.1

Преобразует значение атрибута словаря в тип данных `IPv4` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetIPv4(dict_name, attr_name, id_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — Имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — Значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, которое соответствует `id_expr`,
в противном случае возвращает содержимое элемента `<null_value>`, заданного для атрибута в конфигурации словаря.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или если значение не соответствует его типу данных.
:::

**Примеры**

**Пример использования**

```sql title=Query
SELECT dictGetIPv4('all_types_dict', 'IPv4_value', 1)
```

```response title=Response
┌─dictGetIPv4('all_⋯ 'IPv4_value', 1)─┐
│ 192.168.0.1                         │
└─────────────────────────────────────┘
```


## dictGetIPv4OrDefault \{#dictGetIPv4OrDefault\}

Введено в версии v23.1

Преобразует значение атрибута словаря к типу данных `IPv4` независимо от конфигурации словаря или возвращает указанное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetIPv4OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — Имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — Значение ключа словаря. Выражение, возвращающее значение типа ключа словаря или значение кортежа (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Значение или значения, возвращаемые, если словарь не содержит строки с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, которое соответствует `id_expr`,
в противном случае возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse выбрасывает исключение, если не может разобрать значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- for key which exists
SELECT dictGetIPv4('all_types_dict', 'IPv4_value', 1);

-- for key which does not exist, returns the provided default value
SELECT dictGetIPv4OrDefault('all_types_dict', 'IPv4_value', 999, toIPv4('0.0.0.0'));
```

```response title=Response
┌─dictGetIPv4('all_⋯ 'IPv4_value', 1)─┐
│ 192.168.0.1                         │
└─────────────────────────────────────┘
┌─dictGetIPv4OrDefa⋯0.0.0.0'))─┐
│ 0.0.0.0                      │
└──────────────────────────────┘
```


## dictGetIPv6 \{#dictGetIPv6\}

Впервые представлен в: v23.1

Преобразует значение атрибута словаря в тип данных `IPv6` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetIPv6(dict_name, attr_name, id_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — Имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — Значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж значений (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, которое соответствует `id_expr`,
в противном случае возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

:::note
ClickHouse выдаёт исключение, если не может интерпретировать значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
SELECT dictGetIPv6('all_types_dict', 'IPv6_value', 1)
```

```response title=Response
┌─dictGetIPv6('all_⋯ 'IPv6_value', 1)─┐
│ 2001:db8:85a3::8a2e:370:7334        │
└─────────────────────────────────────┘
```


## dictGetIPv6OrDefault \{#dictGetIPv6OrDefault\}

Введено в: v23.1

Преобразует значение атрибута словаря в тип данных `IPv6` независимо от конфигурации словаря или возвращает указанное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetIPv6OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — Имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — Значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Значение или значения, возвращаемые, если словарь не содержит строки с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, которое соответствует `id_expr`,
в противном случае возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse выбрасывает исключение, если не может разобрать значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- for key which exists
SELECT dictGetIPv6('all_types_dict', 'IPv6_value', 1);

-- for key which does not exist, returns the provided default value
SELECT dictGetIPv6OrDefault('all_types_dict', 'IPv6_value', 999, '::1'::IPv6);
```

```response title=Response
┌─dictGetIPv6('all_⋯ 'IPv6_value', 1)─┐
│ 2001:db8:85a3::8a2e:370:7334        │
└─────────────────────────────────────┘
┌─dictGetIPv6OrDefa⋯:1'::IPv6)─┐
│ ::1                          │
└──────────────────────────────┘
```


## dictGetInt16 \{#dictGetInt16\}

Введено в версии: v1.1

Преобразует значение атрибута словаря к типу данных `Int16` независимо от настроек словаря.

**Синтаксис**

```sql
dictGetInt16(dict_name, attr_name, id_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — Имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — Значение ключа. Выражение, возвращающее значение типа ключа словаря или значение кортежа (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

:::note
ClickHouse генерирует исключение, если не может распарсить значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
SELECT dictGetInt16('all_types_dict', 'Int16_value', 1)
```

```response title=Response
┌─dictGetInt16⋯_value', 1)─┐
│                    -5000 │
└──────────────────────────┘
```


## dictGetInt16OrDefault \{#dictGetInt16OrDefault\}

Добавлена в версии: v1.1

Преобразует значение атрибута словаря к типу данных `Int16` независимо от конфигурации словаря или возвращает указанное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetInt16OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — Имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — Значение ключа. Выражение, возвращающее значение типа ключа словаря или значение кортежа (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Значение (значения), возвращаемое, если словарь не содержит строки с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, которое соответствует `id_expr`,
в противном случае возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse выбрасывает исключение, если не может интерпретировать значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- for key which exists
SELECT dictGetInt16('all_types_dict', 'Int16_value', 1);

-- for key which does not exist, returns the provided default value (-1)
SELECT dictGetInt16OrDefault('all_types_dict', 'Int16_value', 999, -1);
```

```response title=Response
┌─dictGetInt16⋯_value', 1)─┐
│                    -5000 │
└──────────────────────────┘
┌─dictGetInt16⋯', 999, -1)─┐
│                       -1 │
└──────────────────────────┘
```


## dictGetInt32 \{#dictGetInt32\}

Добавлена в версии: v1.1

Преобразует значение атрибута словаря в тип данных `Int32` вне зависимости от конфигурации словаря.

**Синтаксис**

```sql
dictGetInt32(dict_name, attr_name, id_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — Имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — Значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

:::note
ClickHouse выбрасывает исключение, если не может разобрать значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
SELECT dictGetInt32('all_types_dict', 'Int32_value', 1)
```

```response title=Response
┌─dictGetInt32⋯_value', 1)─┐
│                -1000000  │
└──────────────────────────┘
```


## dictGetInt32OrDefault \{#dictGetInt32OrDefault\}

Введена в: v1.1

Преобразует значение атрибута словаря к типу данных `Int32` независимо от конфигурации словаря или возвращает указанное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetInt32OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — Имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — Значение ключа. Выражение, возвращающее значение типа ключа словаря или значение кортежа (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Значение или значения, которые возвращаются, если словарь не содержит строки с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, которое соответствует `id_expr`,
в противном случае возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse выбрасывает исключение, если не может разобрать значение атрибута или если значение не совпадает с типом данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- for key which exists
SELECT dictGetInt32('all_types_dict', 'Int32_value', 1);

-- for key which does not exist, returns the provided default value (-1)
SELECT dictGetInt32OrDefault('all_types_dict', 'Int32_value', 999, -1);
```

```response title=Response
┌─dictGetInt32⋯_value', 1)─┐
│                -1000000  │
└──────────────────────────┘
┌─dictGetInt32⋯', 999, -1)─┐
│                       -1 │
└──────────────────────────┘
```


## dictGetInt64 \{#dictGetInt64\}

Добавлена в версии: v1.1

Преобразует значение атрибута словаря в тип данных `Int64` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetInt64(dict_name, attr_name, id_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — Имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — Значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает содержимое элемента `<null_value>`, заданного для атрибута в конфигурации словаря.

:::note
ClickHouse выбрасывает исключение, если не может интерпретировать значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
SELECT dictGetInt64('all_types_dict', 'Int64_value', 1)
```

```response title=Response
┌─dictGetInt64⋯_value', 1)───┐
│       -9223372036854775807 │
└────────────────────────────┘
```


## dictGetInt64OrDefault \{#dictGetInt64OrDefault\}

Впервые появилась в версии: v1.1

Преобразует значение атрибута словаря к типу данных `Int64` независимо от конфигурации словаря или возвращает указанное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetInt64OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — Имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — Значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Значение или значения, возвращаемые, если словарь не содержит строку с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, которое соответствует `id_expr`,
в противном случае — значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse генерирует исключение, если не удаётся разобрать значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- for key which exists
SELECT dictGetInt64('all_types_dict', 'Int64_value', 1);

-- for key which does not exist, returns the provided default value (-1)
SELECT dictGetInt64OrDefault('all_types_dict', 'Int64_value', 999, -1);
```

```response title=Response
┌─dictGetInt64⋯_value', 1)─┐
│     -9223372036854775808 │
└──────────────────────────┘
┌─dictGetInt64⋯', 999, -1)─┐
│                       -1 │
└──────────────────────────┘
```


## dictGetInt8 \{#dictGetInt8\}

Введено в: v1.1

Преобразует значение атрибута словаря к типу данных `Int8` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetInt8(dict_name, attr_name, id_expr)
```

**Аргументы**

* `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — значение ключа. Выражение, возвращающее значение типа ключа словаря или значение-кортеж (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, которое соответствует `id_expr`,
иначе возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
SELECT dictGetInt8('all_types_dict', 'Int8_value', 1)
```

```response title=Response
┌─dictGetInt8(⋯_value', 1)─┐
│                     -100 │
└──────────────────────────┘
```


## dictGetInt8OrDefault \{#dictGetInt8OrDefault\}

Появилась в версии: v1.1

Преобразует значение атрибута словаря в тип данных `Int8` независимо от конфигурации словаря или возвращает указанное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetInt8OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

* `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — значение или значения, возвращаемые, если словарь не содержит строку с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, которое соответствует `id_expr`,
в противном случае возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- for key which exists
SELECT dictGetInt8('all_types_dict', 'Int8_value', 1);

-- for key which does not exist, returns the provided default value (-1)
SELECT dictGetInt8OrDefault('all_types_dict', 'Int8_value', 999, -1);
```

```response title=Response
┌─dictGetInt8(⋯_value', 1)─┐
│                     -100 │
└──────────────────────────┘
┌─dictGetInt8O⋯', 999, -1)─┐
│                       -1 │
└──────────────────────────┘
```


## dictGetKeys \{#dictGetKeys\}

Введена в версии: v25.12

Возвращает ключ(и) словаря, для которых значение атрибута равно указанному. Это обратная функция к `dictGet` для одного атрибута.

Используйте настройку `max_reverse_dictionary_lookup_cache_size_bytes`, чтобы ограничить размер кеша обратного поиска на запрос, используемого функцией `dictGetKeys`.
Кеш хранит сериализованные кортежи ключей для каждого значения атрибута, чтобы избежать повторного сканирования словаря в рамках одного запроса.
Кеш не сохраняется между запросами. При достижении лимита записи вытесняются по принципу LRU.
Функция наиболее эффективна для больших словарей, когда входные данные имеют низкую кардинальность, а рабочий набор помещается в кеш. Установите `0`, чтобы отключить кеширование.

**Синтаксис**

```sql
dictGetKeys('dict_name', 'attr_name', value_expr)
```

**Аргументы**

* `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — имя атрибута для сравнения. [`String`](/sql-reference/data-types/string)
* `value_expr` — значение для сравнения с атрибутом. [`Expression`](/sql-reference/data-types/special-data-types/expression)

**Возвращаемое значение**

Для словарей с одним ключом: массив ключей, у которых атрибут равен `value_expr`. Для словарей с составным ключом: массив кортежей ключей, у которых атрибут равен `value_expr`. Если в словаре нет атрибута, соответствующего `value_expr`, возвращается пустой массив. ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не может быть преобразовано к типу данных атрибута.

**Примеры**

**Пример использования**

```sql title=Query
SELECT dictGetKeys('task_id_to_priority_dictionary', 'priority_level', 'high') AS ids;
```

```response title=Response
┌─ids───┐
│ [4,2] │
└───────┘
```


## dictGetOrDefault \{#dictGetOrDefault\}

Добавлена в версии: v18.16

Извлекает значения из словаря, подставляя значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetOrDefault('dict_name', attr_names, id_expr, default_value)
```

**Аргументы**

* `dict_name` — Имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_names` — Имя столбца словаря или кортеж имён столбцов. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — Значение ключа. Выражение, возвращающее UInt64/Tuple(T). [`UInt64`](/sql-reference/data-types/int-uint) или [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value` — Значение по умолчанию, возвращаемое, если ключ не найден. Тип должен соответствовать типу данных атрибута.

**Возвращаемое значение**

Возвращает значение атрибута словаря, которое соответствует `id_expr`, если ключ найден.
Если ключ не найден, возвращает значение `default_value`.

**Примеры**

**Получение значения с учётом значения по умолчанию**

```sql title=Query
SELECT dictGetOrDefault('ext_dict_mult', 'c1', toUInt64(999), 0) AS val
```

```response title=Response
0
```


## dictGetOrNull \{#dictGetOrNull\}

Появилось в версии v21.4

Извлекает значения из словаря, возвращая NULL, если ключ не найден.

**Синтаксис**

```sql
dictGetOrNull('dict_name', 'attr_name', id_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. Строковый литерал. - `attr_name` — Имя столбца для получения. Строковый литерал. - `id_expr` — Значение ключа. Выражение, возвращающее значение типа ключа словаря.

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`, если ключ найден.
Если ключ не найден, возвращает `NULL`.

**Примеры**

**Пример с использованием словаря с диапазонным ключом**

```sql title=Query
SELECT
    (number, toDate('2019-05-20')),
    dictGetOrNull('range_key_dictionary', 'value', number, toDate('2019-05-20')),
FROM system.numbers LIMIT 5 FORMAT TabSeparated;
```

```response title=Response
(0,'2019-05-20')  \N
(1,'2019-05-20')  First
(2,'2019-05-20')  Second
(3,'2019-05-20')  Third
(4,'2019-05-20')  \N
```


## dictGetString \{#dictGetString\}

Добавлена в версии v1.1.

Преобразует значение атрибута словаря в тип данных `String` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetString(dict_name, attr_name, id_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — Имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — Значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, которое соответствует `id_expr`,
в противном случае возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

:::note
ClickHouse сгенерирует исключение, если не может разобрать значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
SELECT dictGetString('all_types_dict', 'String_value', 1)
```

```response title=Response
┌─dictGetString(⋯_value', 1)─┐
│ test string                │
└────────────────────────────┘
```


## dictGetStringOrDefault \{#dictGetStringOrDefault\}

Добавлена в версии: v1.1

Преобразует значение атрибута словаря в тип данных `String` независимо от конфигурации словаря или возвращает указанное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetStringOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — Имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — Значение ключа. Выражение, возвращающее значение типа ключа словаря или значение‑кортеж (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Значение (или значения), возвращаемое, если в словаре нет строки с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, которое соответствует `id_expr`, в противном случае возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse генерирует исключение, если не может интерпретировать значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- for key which exists
SELECT dictGetString('all_types_dict', 'String_value', 1);

-- for key which does not exist, returns the provided default value
SELECT dictGetStringOrDefault('all_types_dict', 'String_value', 999, 'default');
```

```response title=Response
┌─dictGetString(⋯_value', 1)─┐
│ test string                │
└────────────────────────────┘
┌─dictGetStringO⋯ 999, 'default')─┐
│ default                         │
└─────────────────────────────────┘
```


## dictGetUInt16 \{#dictGetUInt16\}

Впервые появилась в версии: v1.1

Преобразует значение атрибута словаря в тип данных `UInt16` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetUInt16(dict_name, attr_name, id_expr)
```

**Аргументы**

* `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, которое соответствует `id_expr`,
в противном случае возвращает содержимое элемента `<null_value>`, заданного для атрибута в конфигурации словаря.

:::note
ClickHouse выбрасывает исключение, если не может разобрать значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
SELECT dictGetUInt16('all_types_dict', 'UInt16_value', 1)
```

```response title=Response
┌─dictGetUInt1⋯_value', 1)─┐
│                     5000 │
└──────────────────────────┘
```


## dictGetUInt16OrDefault \{#dictGetUInt16OrDefault\}

Появилась в версии: v1.1

Преобразует значение атрибута словаря к типу данных `UInt16` независимо от конфигурации словаря или возвращает указанное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetUInt16OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — Имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — Значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж значений (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Значение или значения, возвращаемые, если словарь не содержит строки с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, которое соответствует `id_expr`,
в противном случае возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse выбрасывает исключение, если не может разобрать значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- for key which exists
SELECT dictGetUInt16('all_types_dict', 'UInt16_value', 1);

-- for key which does not exist, returns the provided default value (0)
SELECT dictGetUInt16OrDefault('all_types_dict', 'UInt16_value', 999, 0);
```

```response title=Response
┌─dictGetUInt1⋯_value', 1)─┐
│                     5000 │
└──────────────────────────┘
┌─dictGetUInt1⋯e', 999, 0)─┐
│                        0 │
└──────────────────────────┘
```


## dictGetUInt32 \{#dictGetUInt32\}

Добавлена в версии: v1.1

Преобразует значение атрибута словаря к типу данных `UInt32` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetUInt32(dict_name, attr_name, id_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — Имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — Значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, которое соответствует `id_expr`,
в противном случае — содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

:::note
ClickHouse выбрасывает исключение, если не удаётся разобрать значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
SELECT dictGetUInt32('all_types_dict', 'UInt32_value', 1)
```

```response title=Response
┌─dictGetUInt3⋯_value', 1)─┐
│                  1000000 │
└──────────────────────────┘
```


## dictGetUInt32OrDefault \{#dictGetUInt32OrDefault\}

Появилась в версии: v1.1

Преобразует значение атрибута словаря к типу данных `UInt32` независимо от конфигурации словаря или возвращает указанное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetUInt32OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — Имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — Значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж значений (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Значение или кортеж значений, возвращаемые, если словарь не содержит строки с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, которое соответствует `id_expr`,
в противном случае возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse выбрасывает исключение, если не может преобразовать значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- for key which exists
SELECT dictGetUInt32('all_types_dict', 'UInt32_value', 1);

-- for key which does not exist, returns the provided default value (0)
SELECT dictGetUInt32OrDefault('all_types_dict', 'UInt32_value', 999, 0);
```

```response title=Response
┌─dictGetUInt3⋯_value', 1)─┐
│                  1000000 │
└──────────────────────────┘
┌─dictGetUInt3⋯e', 999, 0)─┐
│                        0 │
└──────────────────────────┘
```


## dictGetUInt64 \{#dictGetUInt64\}

Добавлена в: v1.1

Преобразует значение атрибута словаря в тип данных `UInt64` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetUInt64(dict_name, attr_name, id_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — Имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — Значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж значений (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае — содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

:::note
ClickHouse выбрасывает исключение, если не может разобрать значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
SELECT dictGetUInt64('all_types_dict', 'UInt64_value', 1)
```

```response title=Response
┌─dictGetUInt6⋯_value', 1)─┐
│      9223372036854775807 │
└──────────────────────────┘
```


## dictGetUInt64OrDefault \{#dictGetUInt64OrDefault\}

Добавлено в версии: v1.1

Преобразует значение атрибута словаря к типу данных `UInt64` независимо от конфигурации словаря или возвращает указанное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetUInt64OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — Имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — Значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Значение (значения), возвращаемое, если словарь не содержит строки с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse генерирует исключение, если не может распарсить значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- for key which exists
SELECT dictGetUInt64('all_types_dict', 'UInt64_value', 1);

-- for key which does not exist, returns the provideddefault value (0)
SELECT dictGetUInt64OrDefault('all_types_dict', 'UInt64_value', 999, 0);
```

```response title=Response
┌─dictGetUInt6⋯_value', 1)─┐
│      9223372036854775807 │
└──────────────────────────┘
┌─dictGetUInt6⋯e', 999, 0)─┐
│                        0 │
└──────────────────────────┘
```


## dictGetUInt8 \{#dictGetUInt8\}

Впервые появилась в версии: v1.1

Преобразует значение атрибута словаря в тип данных `UInt8` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetUInt8(dict_name, attr_name, id_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — Имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — Значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, которое соответствует `id_expr`,
в противном случае — содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

:::note
ClickHouse генерирует исключение, если не может преобразовать значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
SELECT dictGetUInt8('all_types_dict', 'UInt8_value', 1)
```

```response title=Response
┌─dictGetUInt8⋯_value', 1)─┐
│                      100 │
└──────────────────────────┘
```


## dictGetUInt8OrDefault \{#dictGetUInt8OrDefault\}

Появилась в версии: v1.1

Преобразует значение атрибута словаря к типу данных `UInt8` независимо от конфигурации словаря или возвращает указанное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetUInt8OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — Имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — Значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Значение или значения, возвращаемые, если словарь не содержит строки с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, которое соответствует `id_expr`,
в противном случае возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse выбрасывает исключение, если не может разобрать значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- for key which exists
SELECT dictGetUInt8('all_types_dict', 'UInt8_value', 1);

-- for key which does not exist, returns the provided default value (0)
SELECT dictGetUInt8OrDefault('all_types_dict', 'UInt8_value', 999, 0);
```

```response title=Response
┌─dictGetUInt8⋯_value', 1)─┐
│                      100 │
└──────────────────────────┘
┌─dictGetUInt8⋯e', 999, 0)─┐
│                        0 │
└──────────────────────────┘
```


## dictGetUUID \{#dictGetUUID\}

Появилась в версии: v1.1

Преобразует значение атрибута словаря в тип данных `UUID` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetUUID(dict_name, attr_name, id_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — Имя столбца в словаре. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — Значение ключа. Выражение, возвращающее значение типа ключа словаря или значение кортежа (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
иначе возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

:::note
ClickHouse выбрасывает исключение, если не может разобрать значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
SELECT dictGetUUID('all_types_dict', 'UUID_value', 1)
```

```response title=Response
┌─dictGetUUID(⋯_value', 1)─────────────┐
│ 123e4567-e89b-12d3-a456-426614174000 │
└──────────────────────────────────────┘
```


## dictGetUUIDOrDefault \{#dictGetUUIDOrDefault\}

Введено в версии v1.1

Преобразует значение атрибута словаря к типу данных `UUID` независимо от конфигурации словаря или возвращает указанное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetUUIDOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. [`String`](/sql-reference/data-types/string)
* `attr_name` — Имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
* `id_expr` — Значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж (в зависимости от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
* `default_value_expr` — Значение (значения), возвращаемое, если словарь не содержит строки с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse выбрасывает исключение, если не может интерпретировать значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- for key which exists
SELECT dictGetUUID('all_types_dict', 'UUID_value', 1);

-- for key which does not exist, returns the provided default value
SELECT dictGetUUIDOrDefault('all_types_dict', 'UUID_value', 999, '00000000-0000-0000-0000-000000000000'::UUID);
```

```response title=Response
┌─dictGetUUID('all_t⋯ 'UUID_value', 1)─┐
│ 550e8400-e29b-41d4-a716-446655440000 │
└──────────────────────────────────────┘
┌─dictGetUUIDOrDefa⋯000000000000'::UUID)─┐
│ 00000000-0000-0000-0000-000000000000   │
└────────────────────────────────────────┘
```


## dictHas \{#dictHas\}

Впервые появилась в версии: v1.1

Проверяет, существует ли ключ в словаре.

**Синтаксис**

```sql
dictHas('dict_name', id_expr)
```

**Аргументы**

* `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
* `id_expr` — значение ключа. [`const String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает `1`, если ключ существует, в противном случае — `0`. [`UInt8`](/sql-reference/data-types/int-uint)

**Примеры**

**Проверка существования ключа в словаре**

```sql title=Query
-- consider the following hierarchical dictionary:
-- 0 (Root)
-- └── 1 (Level 1 - Node 1)
--     ├── 2 (Level 2 - Node 2)
--     │   ├── 4 (Level 3 - Node 4)
--     │   └── 5 (Level 3 - Node 5)
--     └── 3 (Level 2 - Node 3)
--         └── 6 (Level 3 - Node 6)

SELECT dictHas('hierarchical_dictionary', 2);
SELECT dictHas('hierarchical_dictionary', 7);
```

```response title=Response
┌─dictHas('hie⋯ionary', 2)─┐
│                        1 │
└──────────────────────────┘
┌─dictHas('hie⋯ionary', 7)─┐
│                        0 │
└──────────────────────────┘
```


## dictIsIn \{#dictIsIn\}

Добавлена в версии: v1.1

Проверяет предка ключа по всей иерархической цепочке в словаре.

**Синтаксис**

```sql
dictIsIn(dict_name, child_id_expr, ancestor_id_expr)
```

**Аргументы**

* `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
* `child_id_expr` — ключ, который нужно проверить. [`String`](/sql-reference/data-types/string)
* `ancestor_id_expr` — предполагаемый предок ключа `child_id_expr`. [`const String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает `0`, если `child_id_expr` не является потомком `ancestor_id_expr`, и `1`, если `child_id_expr` является потомком `ancestor_id_expr` или если `child_id_expr` совпадает с `ancestor_id_expr`. [`UInt8`](/sql-reference/data-types/int-uint)

**Примеры**

**Проверка иерархической связи**

```sql title=Query
-- valid hierarchy
SELECT dictIsIn('hierarchical_dictionary', 6, 3)

-- invalid hierarchy
SELECT dictIsIn('hierarchical_dictionary', 3, 5)
```

```response title=Response
┌─dictIsIn('hi⋯ary', 6, 3)─┐
│                        1 │
└──────────────────────────┘
┌─dictIsIn('hi⋯ary', 3, 5)─┐
│                        0 │
└──────────────────────────┘
```

{/*AUTOGENERATED_END*/ }
