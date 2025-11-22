---
description: 'Документация по функциям для работы со словарями'
sidebar_label: 'Словари'
slug: /sql-reference/functions/ext-dict-functions
title: 'Функции для работы со словарями'
doc_type: 'reference'
---



# Функции для работы со словарями

:::note
Для словарей, созданных с помощью [DDL-запросов](../../sql-reference/statements/create/dictionary.md), параметр `dict_name` должен быть указан полностью, в формате `<database>.<dict_name>`. В противном случае используется текущая база данных.
:::

Информацию о подключении и настройке словарей см. в разделе [Словари](../../sql-reference/dictionaries/index.md).



## dictGet, dictGetOrDefault, dictGetOrNull {#dictget-dictgetordefault-dictgetornull}

Извлекает значения из словаря.

```sql
dictGet('dict_name', attr_names, id_expr)
dictGetOrDefault('dict_name', attr_names, id_expr, default_value_expr)
dictGetOrNull('dict_name', attr_name, id_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [Строковый литерал](/sql-reference/syntax#string).
- `attr_names` — имя столбца словаря, [строковый литерал](/sql-reference/syntax#string), или кортеж имён столбцов, [Tuple](/sql-reference/data-types/tuple)([строковый литерал](/sql-reference/syntax#string).
- `id_expr` — значение ключа. [Выражение](/sql-reference/syntax#expressions), возвращающее значение типа ключа словаря или значение типа [Tuple](../data-types/tuple.md) в зависимости от конфигурации словаря.
- `default_value_expr` — значения, возвращаемые, если словарь не содержит строку с ключом `id_expr`. [Выражение](/sql-reference/syntax#expressions) или [Tuple](../data-types/tuple.md)([выражение](/sql-reference/syntax#expressions)), возвращающее значение (или значения) в типах данных, заданных для атрибута `attr_names`.

**Возвращаемое значение**

- Если ClickHouse успешно разбирает атрибут в [типе данных атрибута](/sql-reference/dictionaries#dictionary-key-and-fields), функции возвращают значение атрибута словаря, соответствующее `id_expr`.

- Если в словаре отсутствует ключ, соответствующий `id_expr`, то:

        - `dictGet` возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.
        - `dictGetOrDefault` возвращает значение, переданное в качестве параметра `default_value_expr`.
        - `dictGetOrNull` возвращает `NULL`, если ключ не найден в словаре.

ClickHouse выбрасывает исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.

**Пример для словаря с простым ключом**

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

**Пример для словаря со сложным ключом**

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

**Пример словаря с ключом-диапазоном**

Исходная таблица:

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


## dictHas {#dicthas}

Проверяет, присутствует ли ключ в словаре.

```sql
dictHas('dict_name', id_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [Строковый литерал](/sql-reference/syntax#string).
- `id_expr` — значение ключа. [Выражение](/sql-reference/syntax#expressions), возвращающее значение типа ключа словаря или значение типа [Tuple](../data-types/tuple.md) в зависимости от конфигурации словаря.

**Возвращаемое значение**

- 0, если ключ отсутствует. [UInt8](../data-types/int-uint.md).
- 1, если ключ присутствует. [UInt8](../data-types/int-uint.md).


## dictGetHierarchy {#dictgethierarchy}

Создаёт массив, содержащий всех родителей ключа в [иерархическом словаре](../../sql-reference/dictionaries/index.md#hierarchical-dictionaries).

**Синтаксис**

```sql
dictGetHierarchy('dict_name', key)
```

**Аргументы**

- `dict_name` — название словаря. [Строковый литерал](/sql-reference/syntax#string).
- `key` — значение ключа. [Выражение](/sql-reference/syntax#expressions), возвращающее значение типа [UInt64](../data-types/int-uint.md).

**Возвращаемое значение**

- Родительские элементы для ключа. [Array(UInt64)](../data-types/array.md).


## dictIsIn {#dictisin}

Проверяет, является ли ключ потомком указанного предка в иерархической цепочке словаря.

```sql
dictIsIn('dict_name', child_id_expr, ancestor_id_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [Строковый литерал](/sql-reference/syntax#string).
- `child_id_expr` — проверяемый ключ. [Выражение](/sql-reference/syntax#expressions), возвращающее значение типа [UInt64](../data-types/int-uint.md).
- `ancestor_id_expr` — предполагаемый предок ключа `child_id_expr`. [Выражение](/sql-reference/syntax#expressions), возвращающее значение типа [UInt64](../data-types/int-uint.md).

**Возвращаемое значение**

- 0, если `child_id_expr` не является потомком `ancestor_id_expr`. [UInt8](../data-types/int-uint.md).
- 1, если `child_id_expr` является потомком `ancestor_id_expr` или если `child_id_expr` совпадает с `ancestor_id_expr`. [UInt8](../data-types/int-uint.md).


## dictGetChildren {#dictgetchildren}

Возвращает потомков первого уровня в виде массива индексов. Это обратное преобразование для [dictGetHierarchy](#dictgethierarchy).

**Синтаксис**

```sql
dictGetChildren(dict_name, key)
```

**Аргументы**

- `dict_name` — название словаря. [Строковый литерал](/sql-reference/syntax#string).
- `key` — значение ключа. [Выражение](/sql-reference/syntax#expressions), возвращающее значение типа [UInt64](../data-types/int-uint.md).

**Возвращаемое значение**

- Потомки первого уровня для ключа. [Array](../data-types/array.md)([UInt64](../data-types/int-uint.md)).

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

Потомки первого уровня:

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


## dictGetDescendant {#dictgetdescendant}

Возвращает всех потомков, как если бы функция [dictGetChildren](#dictgetchildren) была применена рекурсивно `level` раз.

**Синтаксис**

```sql
dictGetDescendants(dict_name, key, level)
```

**Аргументы**

- `dict_name` — имя словаря. [Строковый литерал](/sql-reference/syntax#string).
- `key` — значение ключа. [Выражение](/sql-reference/syntax#expressions), возвращающее значение типа [UInt64](../data-types/int-uint.md).
- `level` — уровень иерархии. Если `level = 0`, возвращаются все потомки до конца. [UInt8](../data-types/int-uint.md).

**Возвращаемые значения**

- Потомки для ключа. [Array](../data-types/array.md)([UInt64](../data-types/int-uint.md)).

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


## dictGetAll {#dictgetall}

Извлекает значения атрибутов всех узлов, соответствующих каждому ключу в [словаре дерева регулярных выражений](../../sql-reference/dictionaries/index.md#regexp-tree-dictionary).

Помимо возврата значений типа `Array(T)` вместо `T`, эта функция работает аналогично [`dictGet`](#dictget-dictgetordefault-dictgetornull).

**Синтаксис**

```sql
dictGetAll('dict_name', attr_names, id_expr[, limit])
```

**Аргументы**

- `dict_name` — имя словаря. [Строковый литерал](/sql-reference/syntax#string).
- `attr_names` — имя столбца словаря, [строковый литерал](/sql-reference/syntax#string), или кортеж имен столбцов, [Tuple](/sql-reference/data-types/tuple)([строковый литерал](/sql-reference/syntax#string)).
- `id_expr` — значение ключа. [Выражение](/sql-reference/syntax#expressions), возвращающее массив значений типа ключа словаря или значение типа [Tuple](/sql-reference/data-types/tuple) в зависимости от конфигурации словаря.
- `limit` — максимальная длина каждого возвращаемого массива значений. При усечении дочерние узлы имеют приоритет над родительскими, в остальных случаях соблюдается определенный порядок списка для словаря дерева регулярных выражений. Если не указано, длина массива не ограничена.

**Возвращаемое значение**

- Если ClickHouse успешно разбирает атрибут в соответствии с типом данных атрибута, определенным в словаре, возвращается массив значений атрибутов словаря, соответствующих `id_expr` для каждого атрибута, указанного в `attr_names`.

- Если в словаре нет ключа, соответствующего `id_expr`, возвращается пустой массив.

ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.

**Пример**

Рассмотрим следующий словарь дерева регулярных выражений:

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

Получение всех совпадающих значений:

```sql
SELECT dictGetAll('regexp_dict', 'tag', 'foobarbaz');
```

```text
┌─dictGetAll('regexp_dict', 'tag', 'foobarbaz')─┐
│ ['foo_attr','bar_attr','baz_attr']            │
└───────────────────────────────────────────────┘
```

Получить до двух совпадающих значений:

```sql
SELECT dictGetAll('regexp_dict', 'tag', 'foobarbaz', 2);
```

```text
┌─dictGetAll('regexp_dict', 'tag', 'foobarbaz', 2)─┐
│ ['foo_attr','bar_attr']                          │
└──────────────────────────────────────────────────┘
```


## dictGetKeys {#dictgetkeys}

Возвращает ключ(и) словаря, атрибут которых равен указанному значению. Это обратная операция к [`dictGet`](#dictget-dictgetordefault-dictgetornull) для одного атрибута.

**Синтаксис**

```sql
dictGetKeys('dict_name', 'attr_name', value_expr);
```

**Аргументы**

- `dict_name` — имя словаря. [Строковый литерал](/sql-reference/syntax#string).
- `attr_name` — имя столбца атрибута словаря. [Строковый литерал](/sql-reference/syntax#string).
- `value_expr` — значение для сопоставления с атрибутом. [Выражение](/sql-reference/syntax#expressions), которое может быть преобразовано к типу данных атрибута.

**Возвращаемое значение**

- Для словарей с одним ключом: массив ключей, атрибут которых равен `value_expr`. [Array(T)](../data-types/array.md), где `T` — тип данных ключа словаря.

- Для словарей с несколькими ключами: массив кортежей ключей, атрибут которых равен `value_expr`. [Array](../data-types/array.md)([Tuple(T1, T2, ...)](../data-types/tuple.md)), где каждый `Tuple` содержит столбцы ключей словаря в порядке их следования.

- Если в словаре нет атрибута, соответствующего `value_expr`, возвращается пустой массив.

ClickHouse генерирует исключение, если не удается разобрать значение атрибута или значение не может быть преобразовано к типу данных атрибута.

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
Используйте настройку `max_reverse_dictionary_lookup_cache_size_bytes` для ограничения размера кеша обратного поиска на уровне запроса, используемого функцией `dictGetKeys`. Кеш хранит сериализованные кортежи ключей для каждого значения атрибута, чтобы избежать повторного сканирования словаря в рамках одного запроса. Кеш не сохраняется между запросами. При достижении лимита записи вытесняются по алгоритму LRU. Это наиболее эффективно для больших словарей, когда входные данные имеют низкую кардинальность, а рабочий набор помещается в кеш. Установите значение `0` для отключения кеширования.

Кроме того, если уникальные значения столбца `attr_name` помещаются в кеш, то в большинстве случаев выполнение функции будет линейным по количеству входных строк плюс небольшое количество сканирований словаря.
:::


## Другие функции {#other-functions}

ClickHouse поддерживает специализированные функции, которые преобразуют значения атрибутов словаря в определённый тип данных независимо от конфигурации словаря.

Функции:

- `dictGetInt8`, `dictGetInt16`, `dictGetInt32`, `dictGetInt64`
- `dictGetUInt8`, `dictGetUInt16`, `dictGetUInt32`, `dictGetUInt64`
- `dictGetFloat32`, `dictGetFloat64`
- `dictGetDate`
- `dictGetDateTime`
- `dictGetUUID`
- `dictGetString`
- `dictGetIPv4`, `dictGetIPv6`

Все эти функции имеют модификацию `OrDefault`. Например, `dictGetDateOrDefault`.

Синтаксис:

```sql
dictGet[Type]('dict_name', 'attr_name', id_expr)
dictGet[Type]OrDefault('dict_name', 'attr_name', id_expr, default_value_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [Строковый литерал](/sql-reference/syntax#string).
- `attr_name` — имя столбца словаря. [Строковый литерал](/sql-reference/syntax#string).
- `id_expr` — значение ключа. [Выражение](/sql-reference/syntax#expressions), возвращающее значение типа [UInt64](../data-types/int-uint.md) или [Tuple](../data-types/tuple.md) в зависимости от конфигурации словаря.
- `default_value_expr` — значение, возвращаемое, если словарь не содержит строку с ключом `id_expr`. [Выражение](/sql-reference/syntax#expressions), возвращающее значение типа данных, заданного для атрибута `attr_name`.

**Возвращаемое значение**

- Если ClickHouse успешно обрабатывает атрибут в [типе данных атрибута](/sql-reference/dictionaries#dictionary-key-and-fields), функции возвращают значение атрибута словаря, соответствующее `id_expr`.

- Если запрошенный `id_expr` отсутствует в словаре, то:

        - `dictGet[Type]` возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.
        - `dictGet[Type]OrDefault` возвращает значение, переданное в качестве параметра `default_value_expr`.

ClickHouse генерирует исключение, если не может обработать значение атрибута или значение не соответствует типу данных атрибута.


## Примеры словарей {#example-dictionary}

Примеры в этом разделе используют следующие словари. Вы можете создать их в ClickHouse
для запуска примеров функций, описанных ниже.

<details>
<summary>Пример словаря для функций dictGet\<T\> и dictGet\<T\>OrDefault</summary>

```sql
-- Создание таблицы со всеми необходимыми типами данных
CREATE TABLE all_types_test (
    `id` UInt32,

    -- Строковый тип
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

    -- Типы даты и времени
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
-- Вставка тестовых данных
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
-- Создание словаря
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
<summary>Пример словаря с составным ключом</summary>

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

<!--
The inner content of the tags below are replaced at doc framework build time with
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->


<!--AUTOGENERATED_START-->

## dictGet {#dictGet}

Introduced in: v18.16

Извлекает значения из словаря.

**Синтаксис**

```sql
dictGet('dict_name', attr_names, id_expr)
```

**Аргументы**

- `dict_name` — название словаря. [`String`](/sql-reference/data-types/string)
- `attr_names` — название столбца словаря или кортеж названий столбцов. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее UInt64/Tuple(T). [`UInt64`](/sql-reference/data-types/int-uint) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее id_expr, если ключ найден.
Если ключ не найден, возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

**Примеры**

**Извлечение одного атрибута**

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


## dictGetAll {#dictGetAll}

Введена в версии: v23.5

Преобразует значение атрибута словаря в тип данных `All` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetAll(dict_name, attr_name, id_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение типа ключа словаря или кортежа (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    'Mozilla/5.0 (Linux; Android 12; SM-G998B) Mobile Safari/537.36' AS user_agent,

    -- Найдет ВСЕ применимые шаблоны
    dictGetAll('regexp_tree', 'os_replacement', 'Mozilla/5.0 (Linux; Android 12; SM-G998B) Mobile Safari/537.36') AS all_matches,

    -- Вернет только первое совпадение
    dictGet('regexp_tree', 'os_replacement', 'Mozilla/5.0 (Linux; Android 12; SM-G998B) Mobile Safari/537.36') AS first_match;
```

```response title=Response
┌─user_agent─────────────────────────────────────────────────────┬─all_matches─────────────────────────────┬─first_match─┐
│ Mozilla/5.0 (Linux; Android 12; SM-G998B) Mobile Safari/537.36 │ ['Android','Android','Android','Linux'] │ Android     │
└────────────────────────────────────────────────────────────────┴─────────────────────────────────────────┴─────────────┘
```


## dictGetChildren {#dictGetChildren}

Введена в версии: v21.4

Возвращает дочерние элементы первого уровня в виде массива индексов. Это обратное преобразование для [dictGetHierarchy](#dictgethierarchy).

**Синтаксис**

```sql
dictGetChildren(dict_name, key)
```

**Аргументы**

- `dict_name` — название словаря. [`String`](/sql-reference/data-types/string)
- `key` — проверяемый ключ. [`const String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает потомков первого уровня для ключа. [`Array(UInt64)`](/sql-reference/data-types/array)

**Примеры**

**Получение дочерних элементов первого уровня из словаря**

```sql title=Запрос
SELECT dictGetChildren('hierarchical_dictionary', 2);
```

```response title=Результат
┌─dictGetChild⋯ionary', 2)─┐
│ [4,5]                    │
└──────────────────────────┘
```


## dictGetDate {#dictGetDate}

Введена в версии: v1.1

Преобразует значение атрибута словаря в тип данных `Date` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetDate(dict_name, attr_name, id_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение ключа словаря или кортежа (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Запрос
SELECT dictGetDate('all_types_dict', 'Date_value', 1)
```

```response title=Результат
┌─dictGetDate(⋯_value', 1)─┐
│               2020-01-01 │
└──────────────────────────┘
```


## dictGetDateOrDefault {#dictGetDateOrDefault}

Введена в версии: v1.1

Преобразует значение атрибута словаря в тип данных `Date` независимо от конфигурации словаря или возвращает указанное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetDateOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение типа ключа словаря или значение кортежа (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — значение(я), возвращаемое, если словарь не содержит строку с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Запрос
-- для существующего ключа
SELECT dictGetDate('all_types_dict', 'Date_value', 1);

-- для несуществующего ключа возвращает указанное значение по умолчанию
SELECT dictGetDateOrDefault('all_types_dict', 'Date_value', 999, toDate('1970-01-01'));
```

```response title=Результат
┌─dictGetDate(⋯_value', 1)─┐
│               2024-01-15 │
└──────────────────────────┘
┌─dictGetDateO⋯70-01-01'))─┐
│               1970-01-01 │
└──────────────────────────┘
```


## dictGetDateTime {#dictGetDateTime}

Введена в версии: v1.1

Преобразует значение атрибута словаря в тип данных `DateTime` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetDateTime(dict_name, attr_name, id_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение ключа словаря или кортежа (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Запрос
SELECT dictGetDateTime('all_types_dict', 'DateTime_value', 1)
```

```response title=Результат
┌─dictGetDateT⋯_value', 1)─┐
│      2024-01-15 10:30:00 │
└──────────────────────────┘
```


## dictGetDateTimeOrDefault {#dictGetDateTimeOrDefault}

Introduced in: v1.1

Преобразует значение атрибута словаря в тип данных `DateTime` независимо от конфигурации словаря или возвращает заданное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetDateTimeOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — значение (значения), возвращаемое, если в словаре отсутствует строка с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- для существующего ключа
SELECT dictGetDateTime('all_types_dict', 'DateTime_value', 1);

-- для несуществующего ключа возвращает заданное значение по умолчанию
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


## dictGetDescendants {#dictGetDescendants}

Введено в версии: v21.4

Возвращает всех потомков, как если бы функция [`dictGetChildren`](#dictGetChildren) применялась рекурсивно `level` раз.

**Синтаксис**

```sql
dictGetDescendants(dict_name, key, level)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `key` — ключ для проверки. [`const String`](/sql-reference/data-types/string)
- `level` — уровень иерархии. Если `level = 0`, возвращаются все потомки до конца. [`UInt8`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает потомков для указанного ключа. [`Array(UInt64)`](/sql-reference/data-types/array)

**Примеры**

**Получение потомков второго уровня словаря**

```sql title=Query
-- рассмотрим следующий иерархический словарь:
-- 0 (Корень)
-- └── 1 (Уровень 1 - Узел 1)
--     ├── 2 (Уровень 2 - Узел 2)
--     │   ├── 4 (Уровень 3 - Узел 4)
--     │   └── 5 (Уровень 3 - Узел 5)
--     └── 3 (Уровень 2 - Узел 3)
--         └── 6 (Уровень 3 - Узел 6)

SELECT dictGetDescendants('hierarchical_dictionary', 0, 2)
```

```response title=Response
┌─dictGetDesce⋯ary', 0, 2)─┐
│ [3,2]                    │
└──────────────────────────┘
```


## dictGetFloat32 {#dictGetFloat32}

Введена в версии: v1.1

Преобразует значение атрибута словаря в тип данных `Float32` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetFloat32(dict_name, attr_name, id_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение ключа словаря или кортежа (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Запрос
SELECT dictGetFloat32('all_types_dict', 'Float32_value', 1)
```

```response title=Результат
┌─dictGetFloat⋯_value', 1)─┐
│               -123.123   │
└──────────────────────────┘
```


## dictGetFloat32OrDefault {#dictGetFloat32OrDefault}

Введена в версии: v1.1

Преобразует значение атрибута словаря в тип данных `Float32` независимо от конфигурации словаря или возвращает заданное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetFloat32OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — значение (значения), возвращаемое, если словарь не содержит строку с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- для существующего ключа
SELECT dictGetFloat32('all_types_dict', 'Float32_value', 1);

-- для несуществующего ключа возвращает заданное значение по умолчанию (-1.0)
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


## dictGetFloat64 {#dictGetFloat64}

Введена в версии: v1.1

Преобразует значение атрибута словаря в тип данных `Float64` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetFloat64(dict_name, attr_name, id_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение ключа словаря или кортежа (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Запрос
SELECT dictGetFloat64('all_types_dict', 'Float64_value', 1)
```

```response title=Результат
┌─dictGetFloat⋯_value', 1)─┐
│                 -123.123 │
└──────────────────────────┘
```


## dictGetFloat64OrDefault {#dictGetFloat64OrDefault}

Введено в версии: v1.1

Преобразует значение атрибута словаря в тип данных `Float64` независимо от конфигурации словаря или возвращает заданное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetFloat64OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение типа ключа словаря или значение кортежа (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — значение (значения), возвращаемое, если словарь не содержит строку с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- для существующего ключа
SELECT dictGetFloat64('all_types_dict', 'Float64_value', 1);

-- для несуществующего ключа возвращает заданное значение по умолчанию (nan)
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


## dictGetHierarchy {#dictGetHierarchy}

Введена в версии: v1.1

Создаёт массив, содержащий всех родителей ключа в [иерархическом словаре](../../sql-reference/dictionaries/index.md#hierarchical-dictionaries).

**Синтаксис**

```sql
dictGetHierarchy(dict_name, key)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `key` — значение ключа. [`const String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает родителей ключа. [`Array(UInt64)`](/sql-reference/data-types/array)

**Примеры**

**Получение иерархии для ключа**

```sql title=Запрос
SELECT dictGetHierarchy('hierarchical_dictionary', 5)
```

```response title=Ответ
┌─dictGetHiera⋯ionary', 5)─┐
│ [5,2,1]                  │
└──────────────────────────┘
```


## dictGetIPv4 {#dictGetIPv4}

Введена в версии: v1.1

Преобразует значение атрибута словаря в тип данных `IPv4` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetIPv4(dict_name, attr_name, id_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение типа ключа словаря или кортежа (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Запрос
SELECT dictGetIPv4('all_types_dict', 'IPv4_value', 1)
```

```response title=Результат
┌─dictGetIPv4('all_⋯ 'IPv4_value', 1)─┐
│ 192.168.0.1                         │
└─────────────────────────────────────┘
```


## dictGetIPv4OrDefault {#dictGetIPv4OrDefault}

Введена в версии: v23.1

Преобразует значение атрибута словаря в тип данных `IPv4` независимо от конфигурации словаря или возвращает заданное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetIPv4OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — значение (значения), возвращаемое, если словарь не содержит строку с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- для существующего ключа
SELECT dictGetIPv4('all_types_dict', 'IPv4_value', 1);

-- для несуществующего ключа возвращает заданное значение по умолчанию
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


## dictGetIPv6 {#dictGetIPv6}

Введена в версии: v23.1

Преобразует значение атрибута словаря в тип данных `IPv6` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetIPv6(dict_name, attr_name, id_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение типа ключа словаря или кортежа (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Запрос
SELECT dictGetIPv6('all_types_dict', 'IPv6_value', 1)
```

```response title=Результат
┌─dictGetIPv6('all_⋯ 'IPv6_value', 1)─┐
│ 2001:db8:85a3::8a2e:370:7334        │
└─────────────────────────────────────┘
```


## dictGetIPv6OrDefault {#dictGetIPv6OrDefault}

Введена в версии: v23.1

Преобразует значение атрибута словаря в тип данных `IPv6` независимо от конфигурации словаря или возвращает указанное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetIPv6OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение типа ключа словаря или значение кортежа (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — значение (значения), возвращаемое, если словарь не содержит строку с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- для существующего ключа
SELECT dictGetIPv6('all_types_dict', 'IPv6_value', 1);

-- для несуществующего ключа возвращает указанное значение по умолчанию
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


## dictGetInt16 {#dictGetInt16}

Введена в версии: v1.1

Преобразует значение атрибута словаря в тип данных `Int16` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetInt16(dict_name, attr_name, id_expr)
```

**Аргументы**

- `dict_name` — название словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — название столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение типа ключа словаря или кортежа (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

:::note
ClickHouse генерирует исключение, если не удается разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Запрос
SELECT dictGetInt16('all_types_dict', 'Int16_value', 1)
```

```response title=Результат
┌─dictGetInt16⋯_value', 1)─┐
│                    -5000 │
└──────────────────────────┘
```


## dictGetInt16OrDefault {#dictGetInt16OrDefault}

Introduced in: v1.1

Преобразует значение атрибута словаря в тип данных `Int16` независимо от конфигурации словаря или возвращает заданное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetInt16OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — значение (значения), возвращаемое, если в словаре отсутствует строка с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- для существующего ключа
SELECT dictGetInt16('all_types_dict', 'Int16_value', 1);

-- для несуществующего ключа возвращает заданное значение по умолчанию (-1)
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


## dictGetInt32 {#dictGetInt32}

Введена в версии: v1.1

Преобразует значение атрибута словаря в тип данных `Int32` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetInt32(dict_name, attr_name, id_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение ключа словаря или кортежа (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Запрос
SELECT dictGetInt32('all_types_dict', 'Int32_value', 1)
```

```response title=Результат
┌─dictGetInt32⋯_value', 1)─┐
│                -1000000  │
└──────────────────────────┘
```


## dictGetInt32OrDefault {#dictGetInt32OrDefault}

Введено в версии: v1.1

Преобразует значение атрибута словаря в тип данных `Int32` независимо от конфигурации словаря или возвращает заданное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetInt32OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — значение (значения), возвращаемое, если словарь не содержит строку с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- для существующего ключа
SELECT dictGetInt32('all_types_dict', 'Int32_value', 1);

-- для несуществующего ключа возвращает заданное значение по умолчанию (-1)
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


## dictGetInt64 {#dictGetInt64}

Введена в версии: v1.1

Преобразует значение атрибута словаря в тип данных `Int64` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetInt64(dict_name, attr_name, id_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение ключа словаря или кортежа (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
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


## dictGetInt64OrDefault {#dictGetInt64OrDefault}

Введена в версии: v1.1

Преобразует значение атрибута словаря в тип данных `Int64` независимо от конфигурации словаря или возвращает заданное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetInt64OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение типа ключа словаря или значение кортежа (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — значение (значения), возвращаемое, если словарь не содержит строку с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- для существующего ключа
SELECT dictGetInt64('all_types_dict', 'Int64_value', 1);

-- для несуществующего ключа возвращает заданное значение по умолчанию (-1)
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


## dictGetInt8 {#dictGetInt8}

Введена в версии: v1.1

Преобразует значение атрибута словаря в тип данных `Int8` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetInt8(dict_name, attr_name, id_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение ключа словаря или кортежа (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Запрос
SELECT dictGetInt8('all_types_dict', 'Int8_value', 1)
```

```response title=Результат
┌─dictGetInt8(⋯_value', 1)─┐
│                     -100 │
└──────────────────────────┘
```


## dictGetInt8OrDefault {#dictGetInt8OrDefault}

Introduced in: v1.1

Преобразует значение атрибута словаря в тип данных `Int8` независимо от конфигурации словаря или возвращает заданное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetInt8OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — значение (значения), возвращаемое, если в словаре отсутствует строка с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- для существующего ключа
SELECT dictGetInt8('all_types_dict', 'Int8_value', 1);

-- для несуществующего ключа возвращает заданное значение по умолчанию (-1)
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


## dictGetKeys {#dictGetKeys}

Введено в версии: v25.11

Возвращает ключ(и) словаря, атрибут которых равен указанному значению. Это обратная операция к функции `dictGet` для одного атрибута.

Используйте настройку `max_reverse_dictionary_lookup_cache_size_bytes` для ограничения размера кеша обратного поиска на запрос, используемого функцией `dictGetKeys`.
Кеш хранит сериализованные кортежи ключей для каждого значения атрибута, чтобы избежать повторного сканирования словаря в рамках одного запроса.
Кеш не сохраняется между запросами. При достижении лимита записи вытесняются по алгоритму LRU.
Наиболее эффективно работает с большими словарями, когда входные данные имеют низкую кардинальность, а рабочий набор помещается в кеш. Установите значение `0` для отключения кеширования.

**Синтаксис**

```sql
dictGetKeys('dict_name', 'attr_name', value_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — атрибут для сопоставления. [`String`](/sql-reference/data-types/string)
- `value_expr` — значение для сопоставления с атрибутом. [`Expression`](/sql-reference/data-types/special-data-types/expression)

**Возвращаемое значение**

Для словарей с одним ключом: массив ключей, атрибут которых равен `value_expr`. Для словарей с несколькими ключами: массив кортежей ключей, атрибут которых равен `value_expr`. Если в словаре нет атрибута, соответствующего `value_expr`, возвращается пустой массив. ClickHouse выбрасывает исключение, если не может разобрать значение атрибута или если значение не может быть преобразовано к типу данных атрибута.

**Примеры**


## dictGetOrDefault {#dictGetOrDefault}

Введена в версии: v18.16

Извлекает значения из словаря, возвращая значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetOrDefault('dict_name', attr_names, id_expr, default_value)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_names` — имя столбца словаря или кортеж имён столбцов. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее UInt64/Tuple(T). [`UInt64`](/sql-reference/data-types/int-uint) или [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value` — значение по умолчанию, возвращаемое при отсутствии ключа. Тип должен соответствовать типу данных атрибута.

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`, если ключ найден.
Если ключ не найден, возвращает переданное значение `default_value`.

**Примеры**

**Получение значения со значением по умолчанию**

```sql title=Запрос
SELECT dictGetOrDefault('ext_dict_mult', 'c1', toUInt64(999), 0) AS val
```

```response title=Результат
0
```


## dictGetOrNull {#dictGetOrNull}

Введена в версии: v21.4

Извлекает значения из словаря, возвращая NULL, если ключ не найден.

**Синтаксис**

```sql
dictGetOrNull('dict_name', 'attr_name', id_expr)
```

**Аргументы**

- `dict_name` — имя словаря. Строковый литерал.
- `attr_name` — имя столбца для извлечения. Строковый литерал.
- `id_expr` — значение ключа. Выражение, возвращающее значение типа ключа словаря.

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`, если ключ найден.
Если ключ не найден, возвращает `NULL`.

**Примеры**

**Пример использования словаря с диапазонным ключом**

```sql title=Запрос
SELECT
    (number, toDate('2019-05-20')),
    dictGetOrNull('range_key_dictionary', 'value', number, toDate('2019-05-20')),
FROM system.numbers LIMIT 5 FORMAT TabSeparated;
```

```response title=Результат
(0,'2019-05-20')  \N
(1,'2019-05-20')  First
(2,'2019-05-20')  Second
(3,'2019-05-20')  Third
(4,'2019-05-20')  \N
```


## dictGetString {#dictGetString}

Введена в версии: v1.1

Преобразует значение атрибута словаря в тип данных `String` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetString(dict_name, attr_name, id_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение ключа словаря или кортежа (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Запрос
SELECT dictGetString('all_types_dict', 'String_value', 1)
```

```response title=Результат
┌─dictGetString(⋯_value', 1)─┐
│ test string                │
└────────────────────────────┘
```


## dictGetStringOrDefault {#dictGetStringOrDefault}

Введена в версии: v1.1

Преобразует значение атрибута словаря в тип данных `String` независимо от конфигурации словаря или возвращает заданное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetStringOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — значение (значения), возвращаемое, если словарь не содержит строку с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- для существующего ключа
SELECT dictGetString('all_types_dict', 'String_value', 1);

-- для несуществующего ключа возвращает заданное значение по умолчанию
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


## dictGetUInt16 {#dictGetUInt16}

Введена в версии: v1.1

Преобразует значение атрибута словаря в тип данных `UInt16` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetUInt16(dict_name, attr_name, id_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение ключа словаря или кортежа (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
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


## dictGetUInt16OrDefault {#dictGetUInt16OrDefault}

Введена в версии: v1.1

Преобразует значение атрибута словаря в тип данных `UInt16` независимо от конфигурации словаря или возвращает заданное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetUInt16OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — значение (значения), возвращаемое, если словарь не содержит строку с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- для существующего ключа
SELECT dictGetUInt16('all_types_dict', 'UInt16_value', 1);

-- для несуществующего ключа возвращает заданное значение по умолчанию (0)
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


## dictGetUInt32 {#dictGetUInt32}

Введена в версии: v1.1

Преобразует значение атрибута словаря в тип данных `UInt32` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetUInt32(dict_name, attr_name, id_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение ключа словаря или кортежа (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Запрос
SELECT dictGetUInt32('all_types_dict', 'UInt32_value', 1)
```

```response title=Результат
┌─dictGetUInt3⋯_value', 1)─┐
│                  1000000 │
└──────────────────────────┘
```


## dictGetUInt32OrDefault {#dictGetUInt32OrDefault}

Введена в версии: v1.1

Преобразует значение атрибута словаря в тип данных `UInt32` независимо от конфигурации словаря или возвращает заданное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetUInt32OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — значение (значения), возвращаемое, если словарь не содержит строку с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- для существующего ключа
SELECT dictGetUInt32('all_types_dict', 'UInt32_value', 1);

-- для несуществующего ключа возвращает заданное значение по умолчанию (0)
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


## dictGetUInt64 {#dictGetUInt64}

Введена в версии: v1.1

Преобразует значение атрибута словаря в тип данных `UInt64` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetUInt64(dict_name, attr_name, id_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение ключа словаря или кортежа (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

:::note
ClickHouse выбрасывает исключение, если не может разобрать значение атрибута или если значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Запрос
SELECT dictGetUInt64('all_types_dict', 'UInt64_value', 1)
```

```response title=Результат
┌─dictGetUInt6⋯_value', 1)─┐
│      9223372036854775807 │
└──────────────────────────┘
```


## dictGetUInt64OrDefault {#dictGetUInt64OrDefault}

Введена в версии: v1.1

Преобразует значение атрибута словаря в тип данных `UInt64` независимо от конфигурации словаря или возвращает заданное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetUInt64OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — значение (значения), возвращаемое, если словарь не содержит строку с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- для существующего ключа
SELECT dictGetUInt64('all_types_dict', 'UInt64_value', 1);

-- для несуществующего ключа возвращает заданное значение по умолчанию (0)
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


## dictGetUInt8 {#dictGetUInt8}

Введена в версии: v1.1

Преобразует значение атрибута словаря в тип данных `UInt8` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetUInt8(dict_name, attr_name, id_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение ключа словаря или кортежа (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Запрос
SELECT dictGetUInt8('all_types_dict', 'UInt8_value', 1)
```

```response title=Результат
┌─dictGetUInt8⋯_value', 1)─┐
│                      100 │
└──────────────────────────┘
```


## dictGetUInt8OrDefault {#dictGetUInt8OrDefault}

Введена в версии: v1.1

Преобразует значение атрибута словаря в тип данных `UInt8` независимо от конфигурации словаря или возвращает заданное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetUInt8OrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — значение (значения), возвращаемое, если словарь не содержит строку с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- для существующего ключа
SELECT dictGetUInt8('all_types_dict', 'UInt8_value', 1);

-- для несуществующего ключа возвращает заданное значение по умолчанию (0)
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


## dictGetUUID {#dictGetUUID}

Введена в версии: v1.1

Преобразует значение атрибута словаря в тип данных `UUID` независимо от конфигурации словаря.

**Синтаксис**

```sql
dictGetUUID(dict_name, attr_name, id_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение ключа словаря или кортежа (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Запрос
SELECT dictGetUUID('all_types_dict', 'UUID_value', 1)
```

```response title=Результат
┌─dictGetUUID(⋯_value', 1)─────────────┐
│ 123e4567-e89b-12d3-a456-426614174000 │
└──────────────────────────────────────┘
```


## dictGetUUIDOrDefault {#dictGetUUIDOrDefault}

Введена в версии: v1.1

Преобразует значение атрибута словаря в тип данных `UUID` независимо от конфигурации словаря или возвращает заданное значение по умолчанию, если ключ не найден.

**Синтаксис**

```sql
dictGetUUIDOrDefault(dict_name, attr_name, id_expr, default_value_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `attr_name` — имя столбца словаря. [`String`](/sql-reference/data-types/string) или [`Tuple(String)`](/sql-reference/data-types/tuple)
- `id_expr` — значение ключа. Выражение, возвращающее значение типа ключа словаря или кортеж (зависит от конфигурации словаря). [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)
- `default_value_expr` — значение (значения), возвращаемое, если словарь не содержит строку с ключом `id_expr`. [`Expression`](/sql-reference/data-types/special-data-types/expression) или [`Tuple(T)`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение атрибута словаря, соответствующее `id_expr`,
в противном случае возвращает значение, переданное в параметре `default_value_expr`.

:::note
ClickHouse генерирует исключение, если не может разобрать значение атрибута или значение не соответствует типу данных атрибута.
:::

**Примеры**

**Пример использования**

```sql title=Query
-- для существующего ключа
SELECT dictGetUUID('all_types_dict', 'UUID_value', 1);

-- для несуществующего ключа возвращает заданное значение по умолчанию
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


## dictHas {#dictHas}

Введена в версии: v1.1

Проверяет, присутствует ли ключ в словаре.

**Синтаксис**

```sql
dictHas('dict_name', id_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `id_expr` — значение ключа. [`const String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает `1`, если ключ существует, иначе — `0`. [`UInt8`](/sql-reference/data-types/int-uint)

**Примеры**

**Проверка наличия ключа в словаре**

```sql title=Запрос
-- рассмотрим следующий иерархический словарь:
-- 0 (Корень)
-- └── 1 (Уровень 1 - Узел 1)
--     ├── 2 (Уровень 2 - Узел 2)
--     │   ├── 4 (Уровень 3 - Узел 4)
--     │   └── 5 (Уровень 3 - Узел 5)
--     └── 3 (Уровень 2 - Узел 3)
--         └── 6 (Уровень 3 - Узел 6)

SELECT dictHas('hierarchical_dictionary', 2);
SELECT dictHas('hierarchical_dictionary', 7);
```

```response title=Результат
┌─dictHas('hie⋯ionary', 2)─┐
│                        1 │
└──────────────────────────┘
┌─dictHas('hie⋯ionary', 7)─┐
│                        0 │
└──────────────────────────┘
```


## dictIsIn {#dictIsIn}

Introduced in: v1.1

Проверяет, является ли ключ потомком указанного предка во всей иерархической цепочке словаря.

**Синтаксис**

```sql
dictIsIn(dict_name, child_id_expr, ancestor_id_expr)
```

**Аргументы**

- `dict_name` — имя словаря. [`String`](/sql-reference/data-types/string)
- `child_id_expr` — проверяемый ключ. [`String`](/sql-reference/data-types/string)
- `ancestor_id_expr` — предполагаемый предок ключа `child_id_expr`. [`const String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает `0`, если `child_id_expr` не является потомком `ancestor_id_expr`, `1`, если `child_id_expr` является потомком `ancestor_id_expr` или если `child_id_expr` совпадает с `ancestor_id_expr`. [`UInt8`](/sql-reference/data-types/int-uint)

**Примеры**

**Проверка иерархической связи**

```sql title=Query
-- корректная иерархия
SELECT dictIsIn('hierarchical_dictionary', 6, 3)

-- некорректная иерархия
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

<!--AUTOGENERATED_END-->
