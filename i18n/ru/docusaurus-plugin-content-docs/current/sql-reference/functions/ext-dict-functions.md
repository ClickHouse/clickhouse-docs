---
description: 'Документация по функциям для работы со словарями'
sidebar_label: 'Словари'
slug: /sql-reference/functions/ext-dict-functions
title: 'Функции для работы со словарями'
doc_type: 'reference'
---

# Функции для работы со словарями

:::note
Для словарей, создаваемых с помощью [DDL‑запросов](../../sql-reference/statements/create/dictionary.md), параметр `dict_name` должен быть полностью указан в формате `<database>.<dict_name>`. В противном случае используется текущая база данных.
:::

Информацию о подключении и настройке словарей см. в разделе [Словари](../../sql-reference/dictionaries/index.md).

## dictGet, dictGetOrDefault, dictGetOrNull

Извлекает значения из словаря.

```sql
dictGet('dict_name', attr_names, id_expr)
dictGetOrDefault('dict_name', attr_names, id_expr, default_value_expr)
dictGetOrNull('dict_name', attr_name, id_expr)
```

**Аргументы**

* `dict_name` — имя словаря. [Строковый литерал](/sql-reference/syntax#string).
* `attr_names` — имя столбца словаря, [строковый литерал](/sql-reference/syntax#string), или кортеж имён столбцов — [Tuple](/sql-reference/data-types/tuple)([строковый литерал](/sql-reference/syntax#string)).
* `id_expr` — значение ключа. [Выражение](/sql-reference/syntax#expressions), возвращающее значение типа ключа словаря или значение типа [Tuple](../data-types/tuple.md) в зависимости от конфигурации словаря.
* `default_value_expr` — значения, возвращаемые, если в словаре нет строки с ключом `id_expr`. [Expression](/sql-reference/syntax#expressions) или [Tuple](../data-types/tuple.md)([Expression](/sql-reference/syntax#expressions)), возвращающее значение (или значения) в типах данных, настроенных для атрибута `attr_names`.

**Возвращаемое значение**

* Если ClickHouse успешно приводит атрибут к [типу данных атрибута](/sql-reference/dictionaries#dictionary-key-and-fields), функции возвращают значение атрибута словаря, соответствующее `id_expr`.

* Если в словаре отсутствует ключ, соответствующий `id_expr`, то:

  * `dictGet` возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.
  * `dictGetOrDefault` возвращает значение, переданное в параметре `default_value_expr`.
  * `dictGetOrNull` возвращает `NULL`, если ключ не найден в словаре.

ClickHouse выдает исключение, если не может распарсить значение атрибута или значение не соответствует типу данных атрибута.

**Пример словаря с простым ключом**

Создайте текстовый файл `ext-dict-test.csv` со следующим содержимым:

```text
1,1
2,2
```

Первый столбец — `id`, второй столбец — `c1`.

Настройте словарь:

```xml
<clickhouse>
    <dictionary>
        <name>ext-dict-test</name>
        <source>
            <file>
                <path>/path-to/ext-dict-test.csv</path>
                <format>CSV</format>
            </file>
        </source>
        <layout>
            <flat />
        </layout>
        <structure>
            <id>
                <name>id</name>
            </id>
            <attribute>
                <name>c1</name>
                <type>UInt32</type>
                <null_value></null_value>
            </attribute>
        </structure>
        <lifetime>0</lifetime>
    </dictionary>
</clickhouse>
```

Выполните запрос:

```sql
SELECT
    dictGetOrDefault('ext-dict-test', 'c1', number + 1, toUInt32(number * 10)) AS val,
    toTypeName(val) AS type
FROM system.numbers
LIMIT 3;
```

```text
┌─val─┬─type───┐
│   1 │ UInt32 │
│   2 │ UInt32 │
│  20 │ UInt32 │
└─────┴────────┘
```

**Пример словаря со сложным ключом**

Создайте текстовый файл `ext-dict-mult.csv` со следующим содержимым:

```text
1,1,'1'
2,2,'2'
3,3,'3'
```

Первый столбец — `id`, второй — `c1`, третий — `c2`.

Настройте словарь:

```xml
<clickhouse>
    <dictionary>
        <name>ext-dict-mult</name>
        <source>
            <file>
                <path>/path-to/ext-dict-mult.csv</path>
                <format>CSV</format>
            </file>
        </source>
        <layout>
            <flat />
        </layout>
        <structure>
            <id>
                <name>id</name>
            </id>
            <attribute>
                <name>c1</name>
                <type>UInt32</type>
                <null_value></null_value>
            </attribute>
            <attribute>
                <name>c2</name>
                <type>String</type>
                <null_value></null_value>
            </attribute>
        </structure>
        <lifetime>0</lifetime>
    </dictionary>
</clickhouse>
```

Выполните запрос:

```sql
SELECT
    dictGet('ext-dict-mult', ('c1','c2'), number + 1) AS val,
    toTypeName(val) AS type
FROM system.numbers
LIMIT 3;
```

```text
┌─val─────┬─type──────────────────┐
│ (1,'1') │ Tuple(UInt8, String)  │
│ (2,'2') │ Tuple(UInt8, String)  │
│ (3,'3') │ Tuple(UInt8, String)  │
└─────────┴───────────────────────┘
```

**Пример словаря с диапазонным ключом**

Входная таблица:

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

Выполните запрос:

```sql
SELECT
    (number, toDate('2019-05-20')),
    dictHas('range_key_dictionary', number, toDate('2019-05-20')),
    dictGetOrNull('range_key_dictionary', 'value', number, toDate('2019-05-20')),
    dictGetOrNull('range_key_dictionary', 'value_nullable', number, toDate('2019-05-20')),
    dictGetOrNull('range_key_dictionary', ('value', 'value_nullable'), number, toDate('2019-05-20'))
FROM system.numbers LIMIT 5 FORMAT TabSeparated;
```

Результат:

```text
(0,'2019-05-20')        0       \N      \N      (NULL,NULL)
(1,'2019-05-20')        1       First   First   ('First','First')
(2,'2019-05-20')        1       Second  \N      ('Second',NULL)
(3,'2019-05-20')        1       Third   Third   ('Third','Third')
(4,'2019-05-20')        0       \N      \N      (NULL,NULL)
```

**См. также**

* [Словари](../../sql-reference/dictionaries/index.md)


## dictHas

Проверяет, присутствует ли ключ в словаре.

```sql
dictHas('dict_name', id_expr)
```

**Аргументы**

* `dict_name` — имя словаря. [Строковый литерал](/sql-reference/syntax#string).
* `id_expr` — значение ключа. [Выражение](/sql-reference/syntax#expressions), возвращающее значение типа ключа словаря или значение типа [Tuple](../data-types/tuple.md) в зависимости от конфигурации словаря.

**Возвращаемое значение**

* 0, если ключ отсутствует. [UInt8](../data-types/int-uint.md).
* 1, если ключ существует. [UInt8](../data-types/int-uint.md).


## dictGetHierarchy

Создаёт массив, содержащий всех родителей заданного ключа в [иерархическом словаре](../../sql-reference/dictionaries/index.md#hierarchical-dictionaries).

**Синтаксис**

```sql
dictGetHierarchy('dict_name', key)
```

**Аргументы**

* `dict_name` — Имя словаря. [Строковый литерал](/sql-reference/syntax#string).
* `key` — Значение ключа. [Выражение](/sql-reference/syntax#expressions), возвращающее значение типа [UInt64](../data-types/int-uint.md).

**Возвращаемое значение**

* Родительские элементы для ключа. [Array(UInt64)](../data-types/array.md).


## dictIsIn

Проверяет наличие предка ключа во всей иерархической цепочке словаря.

```sql
dictIsIn('dict_name', child_id_expr, ancestor_id_expr)
```

**Аргументы**

* `dict_name` — имя словаря. [Строковый литерал](/sql-reference/syntax#string).
* `child_id_expr` — ключ, который требуется проверить. [Выражение](/sql-reference/syntax#expressions), возвращающее значение типа [UInt64](../data-types/int-uint.md).
* `ancestor_id_expr` — предполагаемый предок ключа `child_id_expr`. [Выражение](/sql-reference/syntax#expressions), возвращающее значение типа [UInt64](../data-types/int-uint.md).

**Возвращаемое значение**

* 0, если `child_id_expr` не является потомком `ancestor_id_expr`. [UInt8](../data-types/int-uint.md).
* 1, если `child_id_expr` является потомком `ancestor_id_expr` или если `child_id_expr` равен `ancestor_id_expr`. [UInt8](../data-types/int-uint.md).


## dictGetChildren

Возвращает дочерние элементы первого уровня в виде массива индексов. Является обратной операцией к [dictGetHierarchy](#dictgethierarchy).

**Синтаксис**

```sql
dictGetChildren(имя_словаря, ключ)
```

**Аргументы**

* `dict_name` — имя словаря. [Строковый литерал](/sql-reference/syntax#string).
* `key` — значение ключа. [Выражение](/sql-reference/syntax#expressions), возвращающее значение типа [UInt64](../data-types/int-uint.md).

**Возвращаемые значения**

* Потомки первого уровня для ключа. [Array](../data-types/array.md)([UInt64](../data-types/int-uint.md)).

**Пример**

Рассмотрим иерархический словарь:

```text
┌─id─┬─parent_id─┐
│  1 │         0 │
│  2 │         1 │
│  3 │         1 │
│  4 │         2 │
└────┴───────────┘
```

Дочерние элементы первого уровня:

```sql
SELECT dictGetChildren('hierarchy_flat_dictionary', number) FROM system.numbers LIMIT 4;
```

```text
┌─dictGetChildren('hierarchy_flat_dictionary', number)─┐
│ [1]                                                  │
│ [2,3]                                                │
│ [4]                                                  │
│ []                                                   │
└──────────────────────────────────────────────────────┘
```


## dictGetDescendant

Возвращает всех потомков так, как если бы функция [dictGetChildren](#dictgetchildren) была рекурсивно применена `level` раз.

**Синтаксис**

```sql
dictGetDescendants(dict_name, key, level)
```

**Аргументы**

* `dict_name` — имя словаря. [Строковый литерал](/sql-reference/syntax#string).
* `key` — значение ключа. [Выражение](/sql-reference/syntax#expressions), возвращающее значение типа [UInt64](../data-types/int-uint.md).
* `level` — уровень иерархии. Если `level = 0`, возвращает всех потомков до последнего уровня. [UInt8](../data-types/int-uint.md).

**Возвращаемые значения**

* Потомки указанного ключа. [Array](../data-types/array.md)([UInt64](../data-types/int-uint.md)).

**Пример**

Рассмотрим иерархический словарь:

```text
┌─id─┬─parent_id─┐
│  1 │         0 │
│  2 │         1 │
│  3 │         1 │
│  4 │         2 │
└────┴───────────┘
```

Все потомки:

```sql
SELECT dictGetDescendants('hierarchy_flat_dictionary', number) FROM system.numbers LIMIT 4;
```

```text
┌─dictGetDescendants('hierarchy_flat_dictionary', number)─┐
│ [1,2,3,4]                                               │
│ [2,3,4]                                                 │
│ [4]                                                     │
│ []                                                      │
└─────────────────────────────────────────────────────────┘
```

Потомки первого уровня:

```sql
SELECT dictGetDescendants('hierarchy_flat_dictionary', number, 1) FROM system.numbers LIMIT 4;
```

```text
┌─dictGetDescendants('hierarchy_flat_dictionary', number, 1)─┐
│ [1]                                                        │
│ [2,3]                                                      │
│ [4]                                                        │
│ []                                                         │
└────────────────────────────────────────────────────────────┘
```


## dictGetAll

Извлекает значения атрибутов всех узлов, соответствующих каждому ключу в [словаре на основе дерева регулярных выражений](../../sql-reference/dictionaries/index.md#regexp-tree-dictionary).

Помимо возврата значений типа `Array(T)` вместо `T`, эта функция ведёт себя аналогично [`dictGet`](#dictget-dictgetordefault-dictgetornull).

**Синтаксис**

```sql
dictGetAll('dict_name', attr_names, id_expr[, limit])
```

**Аргументы**

* `dict_name` — имя словаря. [Строковый литерал](/sql-reference/syntax#string).
* `attr_names` — имя столбца словаря — [строковый литерал](/sql-reference/syntax#string) — или кортеж имён столбцов — [Tuple](/sql-reference/data-types/tuple)([строковый литерал](/sql-reference/syntax#string)).
* `id_expr` — значение ключа. [Выражение](/sql-reference/syntax#expressions), возвращающее массив значений типа ключа словаря или значение типа [Tuple](/sql-reference/data-types/tuple) в зависимости от конфигурации словаря.
* `limit` — максимальная длина для каждого возвращаемого массива значений. При усечении дочерние узлы имеют приоритет над родительскими, а в остальных случаях соблюдается определённый порядок списка для словаря regexp tree. Если параметр не указан, длина массива не ограничена.

**Возвращаемое значение**

* Если ClickHouse успешно интерпретирует значение атрибута в его тип данных, определённый в словаре, возвращается массив значений атрибутов словаря, которые соответствуют `id_expr` для каждого атрибута, указанного в `attr_names`.

* Если в словаре нет ключа, соответствующего `id_expr`, возвращается пустой массив.

ClickHouse выбрасывает исключение, если не может интерпретировать значение атрибута или значение не соответствует типу данных атрибута.

**Пример**

Рассмотрим следующий словарь regexp tree:

```sql
CREATE DICTIONARY regexp_dict
(
    regexp String,
    tag String
)
PRIMARY KEY(regexp)
SOURCE(YAMLRegExpTree(PATH '/var/lib/clickhouse/user_files/regexp_tree.yaml'))
LAYOUT(regexp_tree)
...
```

```yaml
# /var/lib/clickhouse/user_files/regexp_tree.yaml
- regexp: 'foo'
  tag: 'foo_attr'
- regexp: 'bar'
  tag: 'bar_attr'
- regexp: 'baz'
  tag: 'baz_attr'
```

Получить все совпадающие значения:

```sql
SELECT dictGetAll('regexp_dict', 'tag', 'foobarbaz');
```

```text
┌─dictGetAll('regexp_dict', 'tag', 'foobarbaz')─┐
│ ['foo_attr','bar_attr','baz_attr']            │
└───────────────────────────────────────────────┘
```

Получите до двух совпадающих значений:

```sql
SELECT dictGetAll('regexp_dict', 'tag', 'foobarbaz', 2);
```

```text
┌─dictGetAll('regexp_dict', 'tag', 'foobarbaz', 2)─┐
│ ['foo_attr','bar_attr']                          │
└──────────────────────────────────────────────────┘
```


## dictGetKeys

Возвращает ключ(и) словаря, значение указанного атрибута которых равно заданному значению. Является обратной функцией к [`dictGet`](#dictget-dictgetordefault-dictgetornull) по одному атрибуту.

**Синтаксис**

```sql
dictGetKeys('dict_name', 'attr_name', value_expr);
```

**Аргументы**

* `dict_name` — имя словаря. [Строковый литерал](/sql-reference/syntax#string).
* `attr_name` — имя столбца атрибута словаря. [Строковый литерал](/sql-reference/syntax#string).
* `value_expr` — значение для сравнения с атрибутом. [Выражение](/sql-reference/syntax#expressions), которое может быть приведено к типу данных атрибута.

**Возвращаемое значение**

* Для словарей с простым ключом: массив ключей, для которых значение атрибута равно `value_expr`. [Array(T)](../data-types/array.md), где `T` — тип данных ключа словаря.

* Для словарей с составным ключом: массив кортежей ключей, для которых значение атрибута равно `value_expr`. [Array](../data-types/array.md)([Tuple(T1, T2, ...)](../data-types/tuple.md)), где каждый `Tuple` содержит столбцы ключа словаря в заданном порядке.

* Если в словаре нет атрибута, соответствующего `value_expr`, возвращается пустой массив.

ClickHouse генерирует исключение, если не удаётся интерпретировать значение атрибута или привести его к типу данных атрибута.

**Пример**

Рассмотрим следующий словарь:

```txt
 ┌─id─┬─level──┐
 │  1 │ low    │
 │  2 │ high   │
 │  3 │ medium │
 │  4 │ high   │
 └────┴────────┘
```

Теперь получим все идентификаторы с уровнем `high`:

```sql
SELECT dictGetKeys('levels', 'level', 'high') AS ids;
```

```text
 ┌─ids───┐
 │ [4,2] │
 └───────┘
```

:::note
Используйте параметр `max_reverse_dictionary_lookup_cache_size_bytes`, чтобы ограничить размер кеша обратного поиска для каждого запроса, используемого `dictGetKeys`. Кеш хранит сериализованные кортежи ключей для каждого значения атрибута, чтобы избежать повторного сканирования словаря в рамках одного и того же запроса. Кеш не сохраняется между запросами. Когда лимит достигается, записи вытесняются по принципу LRU. Это наиболее эффективно для больших словарей, когда входные данные имеют низкую кардинальность и рабочий набор помещается в кеш. Установите значение `0`, чтобы отключить кеширование.

Кроме того, если уникальные значения столбца `attr_name` помещаются в кеш, то в большинстве случаев выполнение функции должно быть линейным по количеству входных строк плюс небольшое количество сканирований словаря.
:::


## Другие функции

ClickHouse поддерживает специализированные функции, которые преобразуют значения атрибутов словаря в определённый тип данных независимо от конфигурации словаря.

Функции:

* `dictGetInt8`, `dictGetInt16`, `dictGetInt32`, `dictGetInt64`
* `dictGetUInt8`, `dictGetUInt16`, `dictGetUInt32`, `dictGetUInt64`
* `dictGetFloat32`, `dictGetFloat64`
* `dictGetDate`
* `dictGetDateTime`
* `dictGetUUID`
* `dictGetString`
* `dictGetIPv4`, `dictGetIPv6`

Все эти функции имеют модификацию `OrDefault`. Например, `dictGetDateOrDefault`.

Синтаксис:

```sql
dictGet[Type]('dict_name', 'attr_name', id_expr)
dictGet[Type]OrDefault('dict_name', 'attr_name', id_expr, default_value_expr)
```

**Аргументы**

* `dict_name` — Имя словаря. [Строковый литерал](/sql-reference/syntax#string).
* `attr_name` — Имя столбца словаря. [Строковый литерал](/sql-reference/syntax#string).
* `id_expr` — Значение ключа. [Выражение](/sql-reference/syntax#expressions), возвращающее значение типа [UInt64](../data-types/int-uint.md) или [Tuple](../data-types/tuple.md) в зависимости от конфигурации словаря.
* `default_value_expr` — Значение, возвращаемое, если в словаре нет строки с ключом `id_expr`. [Выражение](/sql-reference/syntax#expressions), возвращающее значение в тип данных, настроенный для атрибута `attr_name`.

**Возвращаемое значение**

* Если ClickHouse успешно разбирает атрибут в [тип данных атрибута](/sql-reference/dictionaries#dictionary-key-and-fields), функции возвращают значение атрибута словаря, соответствующее `id_expr`.

* Если запрошенный `id_expr` отсутствует в словаре, то:

  * `dictGet[Type]` возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.
  * `dictGet[Type]OrDefault` возвращает значение, переданное в параметре `default_value_expr`.

ClickHouse генерирует исключение, если не может разобрать значение атрибута или если значение не соответствует типу данных атрибута.


## Примеры словарей {#example-dictionary}

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
  <summary>Пример словаря с диапазонным ключом</summary>

  Создайте входную таблицу:

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

  Вставьте данные во входную таблицу:

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

  -- 0 (Root)
  -- └── 1 (Level 1 - Node 1)
  --     ├── 2 (Level 2 - Node 2)
  --     │   ├── 4 (Level 3 - Node 4)
  --     │   └── 5 (Level 3 - Node 5)
  --     └── 3 (Level 2 - Node 3)
  --         └── 6 (Level 3 - Node 6)
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
  Содержимое тегов ниже при сборке фреймворка документации заменяется 
  документацией, сгенерированной из system.functions. Пожалуйста, не изменяйте и не удаляйте эти теги.
  См.: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }

{/*AUTOGENERATED_END*/ }
