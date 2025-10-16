---
slug: '/sql-reference/functions/ext-dict-functions'
sidebar_label: Словари
description: 'Документация для функций для работы со словарями'
title: 'Функции для работы со Словарями'
doc_type: reference
---
# Функции для работы со словарями

:::note
Для словарей, созданных с помощью [DDL-запросов](../../sql-reference/statements/create/dictionary.md), параметр `dict_name` должен быть полностью указан, например, `<database>.<dict_name>`. В противном случае будет использована текущая база данных.
:::

Для получения информации о подключении и настройке словарей смотрите [Словари](../../sql-reference/dictionaries/index.md).

## dictGet, dictGetOrDefault, dictGetOrNull {#dictget-dictgetordefault-dictgetornull}

Извлекает значения из словаря.

```sql
dictGet('dict_name', attr_names, id_expr)
dictGetOrDefault('dict_name', attr_names, id_expr, default_value_expr)
dictGetOrNull('dict_name', attr_name, id_expr)
```

**Аргументы**

- `dict_name` — Название словаря. [Строковый литерал](/sql-reference/syntax#string).
- `attr_names` — Название колонки словаря, [Строковый литерал](/sql-reference/syntax#string) или кортеж названий колонок, [Кортеж](/sql-reference/data-types/tuple)([Строковый литерал](/sql-reference/syntax#string).
- `id_expr` — Значение ключа. [Выражение](/sql-reference/syntax#expressions), возвращающее значение типа ключа словаря или значение типа [Кортеж](../data-types/tuple.md) в зависимости от конфигурации словаря.
- `default_value_expr` — Значения, возвращаемые если словарь не содержит строки с ключом `id_expr`. [Выражение](/sql-reference/syntax#expressions) или [Кортеж](../data-types/tuple.md)([Выражение](/sql-reference/syntax#expressions)), возвращающее значение (или значения) в типах данных, настроенных для атрибута `attr_names`.

**Возвращаемое значение**

- Если ClickHouse успешно анализирует атрибут в [типе данных атрибута](/sql-reference/dictionaries#dictionary-key-and-fields), функции возвращают значение атрибута словаря, соответствующее `id_expr`.

- Если в словаре нет ключа, соответствующего `id_expr`, тогда:

        - `dictGet` возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.
        - `dictGetOrDefault` возвращает значение, переданное как параметр `default_value_expr`.
        - `dictGetOrNull` возвращает `NULL`, если ключ не найден в словаре.

ClickHouse выбрасывает исключение, если он не может разобрать значение атрибута или если значение не соответствует типу данных атрибута.

**Пример для словаря с простым ключом**

Создайте текстовый файл `ext-dict-test.csv`, содержащий следующее:

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

Создайте текстовый файл `ext-dict-mult.csv`, содержащий следующее:

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

**Пример для словаря с диапазоном ключей**

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

- [Словари](../../sql-reference/dictionaries/index.md)

## dictHas {#dicthas}

Проверяет, присутствует ли ключ в словаре.

```sql
dictHas('dict_name', id_expr)
```

**Аргументы**

- `dict_name` — Название словаря. [Строковый литерал](/sql-reference/syntax#string).
- `id_expr` — Значение ключа. [Выражение](/sql-reference/syntax#expressions), возвращающее значение типа ключа словаря или значение типа [Кортеж](../data-types/tuple.md) в зависимости от конфигурации словаря.

**Возвращаемое значение**

- 0, если ключ отсутствует. [UInt8](../data-types/int-uint.md).
- 1, если ключ присутствует. [UInt8](../data-types/int-uint.md).

## dictGetHierarchy {#dictgethierarchy}

Создает массив, содержащий всех родителей ключа в [иерархическом словаре](../../sql-reference/dictionaries/index.md#hierarchical-dictionaries).

**Синтаксис**

```sql
dictGetHierarchy('dict_name', key)
```

**Аргументы**

- `dict_name` — Название словаря. [Строковый литерал](/sql-reference/syntax#string).
- `key` — Значение ключа. [Выражение](/sql-reference/syntax#expressions), возвращающее значение типа [UInt64](../data-types/int-uint.md).

**Возвращаемое значение**

- Родители для ключа. [Массив(UInt64)](../data-types/array.md).

## dictIsIn {#dictisin}

Проверяет предка ключа на протяжении всей иерархической цепочки в словаре.

```sql
dictIsIn('dict_name', child_id_expr, ancestor_id_expr)
```

**Аргументы**

- `dict_name` — Название словаря. [Строковый литерал](/sql-reference/syntax#string).
- `child_id_expr` — Ключ, который нужно проверить. [Выражение](/sql-reference/syntax#expressions), возвращающее значение типа [UInt64](../data-types/int-uint.md).
- `ancestor_id_expr` — Предполагаемый предок ключа `child_id_expr`. [Выражение](/sql-reference/syntax#expressions), возвращающее значение типа [UInt64](../data-types/int-uint.md).

**Возвращаемое значение**

- 0, если `child_id_expr` не является потомком `ancestor_id_expr`. [UInt8](../data-types/int-uint.md).
- 1, если `child_id_expr` является потомком `ancestor_id_expr` или если `child_id_expr` является `ancestor_id_expr`. [UInt8](../data-types/int-uint.md).

## dictGetChildren {#dictgetchildren}

Возвращает потомков первого уровня в виде массива индексов. Это обратное преобразование для [dictGetHierarchy](#dictgethierarchy).

**Синтаксис**

```sql
dictGetChildren(dict_name, key)
```

**Аргументы**

- `dict_name` — Название словаря. [Строковый литерал](/sql-reference/syntax#string).
- `key` — Значение ключа. [Выражение](/sql-reference/syntax#expressions), возвращающее значение типа [UInt64](../data-types/int-uint.md).

**Возвращаемые значения**

- Потомки первого уровня для ключа. [Массив](../data-types/array.md)([UInt64](../data-types/int-uint.md)).

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

Возвращает всех потомков, как если бы функция [dictGetChildren](#dictgetchildren) применялась `level` раз рекурсивно.

**Синтаксис**

```sql
dictGetDescendants(dict_name, key, level)
```

**Аргументы**

- `dict_name` — Название словаря. [Строковый литерал](/sql-reference/syntax#string).
- `key` — Значение ключа. [Выражение](/sql-reference/syntax#expressions), возвращающее значение типа [UInt64](../data-types/int-uint.md).
- `level` — Уровень иерархии. Если `level = 0`, возвращает всех потомков до конца. [UInt8](../data-types/int-uint.md).

**Возвращаемые значения**

- Потомки для ключа. [Массив](../data-types/array.md)([UInt64](../data-types/int-uint.md)).

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

Извлекает значения атрибутов всех узлов, которые соответствуют каждому ключу в [словаре деревьев регулярных выражений](../../sql-reference/dictionaries/index.md#regexp-tree-dictionary).

Кроме возврата значений типа `Array(T)` вместо `T`, эта функция ведет себя подобно [`dictGet`](#dictget-dictgetordefault-dictgetornull).

**Синтаксис**

```sql
dictGetAll('dict_name', attr_names, id_expr[, limit])
```

**Аргументы**

- `dict_name` — Название словаря. [Строковый литерал](/sql-reference/syntax#string).
- `attr_names` — Название колонки словаря, [Строковый литерал](/sql-reference/syntax#string) или кортеж названий колонок, [Кортеж](/sql-reference/data-types/tuple)([Строковый литерал](/sql-reference/syntax#string)).
- `id_expr` — Значение ключа. [Выражение](/sql-reference/syntax#expressions), возвращающее массив значений типа ключа словаря или значение типа [Кортеж](../data-types/tuple) в зависимости от конфигурации словаря.
- `limit` - Максимальная длина для каждого возвращаемого массива значений. При усечении дочерние узлы имеют преимущество перед родительскими узлами, и в противном случае соблюдается определенный порядок для словаря деревьев регулярных выражений. Если не указано, длина массива неограничена.

**Возвращаемое значение**

- Если ClickHouse успешно анализирует атрибут в типе данных атрибута, как определено в словаре, возвращает массив значений атрибутов словаря, которые соответствуют `id_expr` для каждого атрибута, указанного в `attr_names`.

- Если в словаре нет ключа, соответствующего `id_expr`, то возвращается пустой массив.

ClickHouse выбрасывает исключение, если он не может разобрать значение атрибута или если значение не соответствует типу данных атрибута.

**Пример**

Рассмотрим следующий словарь деревьев регулярных выражений:

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

Получите все совпадающие значения:

```sql
SELECT dictGetAll('regexp_dict', 'tag', 'foobarbaz');
```

```text
┌─dictGetAll('regexp_dict', 'tag', 'foobarbaz')─┐
│ ['foo_attr','bar_attr','baz_attr']            │
└───────────────────────────────────────────────┘
```

Получите до 2 совпадающих значений:

```sql
SELECT dictGetAll('regexp_dict', 'tag', 'foobarbaz', 2);
```

```text
┌─dictGetAll('regexp_dict', 'tag', 'foobarbaz', 2)─┐
│ ['foo_attr','bar_attr']                          │
└──────────────────────────────────────────────────┘
```

## Другие функции {#other-functions}

ClickHouse поддерживает специализированные функции, которые преобразуют значения атрибутов словаря в определенный тип данных, независимо от конфигурации словаря.

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

- `dict_name` — Название словаря. [Строковый литерал](/sql-reference/syntax#string).
- `attr_name` — Название колонки словаря. [Строковый литерал](/sql-reference/syntax#string).
- `id_expr` — Значение ключа. [Выражение](/sql-reference/syntax#expressions), возвращающее значение [UInt64](../data-types/int-uint.md) или значение типа [Кортеж](../data-types/tuple.md) в зависимости от конфигурации словаря.
- `default_value_expr` — Значение, возвращаемое если словарь не содержит строки с ключом `id_expr`. [Выражение](/sql-reference/syntax#expressions), возвращающее значение в типе данных, настроенном для атрибута `attr_name`.

**Возвращаемое значение**

- Если ClickHouse успешно анализирует атрибут в [типе данных атрибута](/sql-reference/dictionaries#dictionary-key-and-fields), функции возвращают значение атрибута словаря, соответствующее `id_expr`.

- Если запрашиваемый `id_expr` отсутствует в словаре, тогда:

        - `dictGet[Type]` возвращает содержимое элемента `<null_value>`, указанного для атрибута в конфигурации словаря.
        - `dictGet[Type]OrDefault` возвращает значение, переданное как параметр `default_value_expr`.

ClickHouse выбрасывает исключение, если он не может разобрать значение атрибута или если значение не соответствует типу данных атрибута.