---
slug: '/sql-reference/dictionaries'
sidebar_label: 'Определение словарей'
sidebar_position: 35
description: 'Обзор функциональности внешних словарей в ClickHouse'
title: Словари
doc_type: Reference
---
import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';
import CloudDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/sql-reference/dictionaries/_snippet_dictionary_in_cloud.md';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Словари

Словарь — это отображение (`ключ -> атрибуты`), которое удобно для различных типов справочных списков.

ClickHouse поддерживает специальные функции для работы со словарями, которые можно использовать в запросах. Использовать словари с функциями проще и эффективнее, чем использовать `JOIN` со справочными таблицами.

ClickHouse поддерживает:

- Словари с [набором функций](../../sql-reference/functions/ext-dict-functions.md).
- [Встроенные словари](#embedded-dictionaries) с конкретным [набором функций](../../sql-reference/functions/embedded-dict-functions.md).

:::tip Учебник
Если вы только начинаете работать со Словарями в ClickHouse, у нас есть учебник, который охватывает эту тему. Загляните [сюда](tutorial.md).
:::

Вы можете добавлять свои собственные словари из различных источников данных. Источником для словаря может быть таблица ClickHouse, локальный текстовый или исполняемый файл, HTTP(s) ресурс или другая СУБД. Для получения дополнительной информации смотрите "[Источники словарей](#dictionary-sources)".

ClickHouse:

- Полностью или частично хранит словари в RAM.
- Периодически обновляет словари и динамически загружает отсутствующие значения. Другими словами, словари могут загружаться динамически.
- Позволяет создавать словари с помощью xml файлов или [DDL запросов](../../sql-reference/statements/create/dictionary.md).

Конфигурация словарей может находиться в одном или нескольких xml-файлах. Путь к конфигурации указывается в параметре [dictionaries_config](../../operations/server-configuration-parameters/settings.md#dictionaries_config).

Словари могут загружаться при запуске сервера или при первом использовании, в зависимости от настройки [dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load).

Системная таблица [dictionaries](/operations/system-tables/dictionaries) содержит информацию о словарях, сконфигурированных на сервере. Для каждого словаря там можно найти:

- Статус словаря.
- Конфигурационные параметры.
- Метрики, такие как объем RAM, выделенный для словаря, или количество запросов с момента успешной загрузки словаря.

<CloudDetails />
## Создание словаря с помощью DDL-запроса {#creating-a-dictionary-with-a-ddl-query}

Словари могут быть созданы с помощью [DDL запросов](../../sql-reference/statements/create/dictionary.md), и это рекомендуемый метод, так как при создании словарей с помощью DDL:
- Не добавляются дополнительные записи в файлы конфигурации сервера.
- Словарями можно управлять как первоклассными сущностями, такими как таблицы или представления.
- Данные могут быть прочитаны напрямую, используя знакомый SELECT, а не функции табличного словаря. Обратите внимание, что при прямом доступе к словарю через оператор SELECT кэшированный словарь вернет только кэшированные данные, в то время как некэшированный словарь — все данные, которые он хранит.
- Словари можно легко переименовывать.

## Создание словаря с помощью конфигурационного файла {#creating-a-dictionary-with-a-configuration-file}

<CloudNotSupportedBadge/>

:::note
Создание словаря с помощью конфигурационного файла не применимо к ClickHouse Cloud. Пожалуйста, используйте DDL (см. выше) и создайте свой словарь как пользователь `default`.
:::

Конфигурационный файл словаря имеет следующий формат:

```xml
<clickhouse>
    <comment>An optional element with any content. Ignored by the ClickHouse server.</comment>

    <!--Optional element. File name with substitutions-->
    <include_from>/etc/metrika.xml</include_from>


    <dictionary>
        <!-- Dictionary configuration. -->
        <!-- There can be any number of dictionary sections in a configuration file. -->
    </dictionary>

</clickhouse>
```

Вы можете [настроить](#configuring-a-dictionary) любое количество словарей в одном и том же файле.

:::note
Вы можете преобразовать значения для небольшого словаря, описывая его в запросе `SELECT` (см. функцию [transform](../../sql-reference/functions/other-functions.md)). Эта функциональность не связана со словарями.
:::
## Настройка словаря {#configuring-a-dictionary}

<CloudDetails />

Если словарь настроен с использованием xml файла, то конфигурация словаря имеет следующую структуру:

```xml
<dictionary>
    <name>dict_name</name>

    <structure>
      <!-- Complex key configuration -->
    </structure>

    <source>
      <!-- Source configuration -->
    </source>

    <layout>
      <!-- Memory layout configuration -->
    </layout>

    <lifetime>
      <!-- Lifetime of dictionary in memory -->
    </lifetime>
</dictionary>
```

Соответствующий [DDL-запрос](../../sql-reference/statements/create/dictionary.md) имеет следующую структуру:

```sql
CREATE DICTIONARY dict_name
(
    ... -- attributes
)
PRIMARY KEY ... -- complex or single key configuration
SOURCE(...) -- Source configuration
LAYOUT(...) -- Memory layout configuration
LIFETIME(...) -- Lifetime of dictionary in memory
```
## Хранение словарей в памяти {#storing-dictionaries-in-memory}

Существует множество способов хранения словарей в памяти.

Мы рекомендуем [flat](#flat), [hashed](#hashed) и [complex_key_hashed](#complex_key_hashed), которые обеспечивают оптимальную скорость обработки.

Кэширование не рекомендуется из-за потенциально низкой производительности и трудностей в выборе оптимальных параметров. Читайте подробнее в разделе [cache](#cache).

Существует несколько способов улучшить производительность словаря:

- Вызывайте функцию для работы со словарем после `GROUP BY`.
- Отмечайте атрибуты для извлечения как инъективные. Атрибут называется инъективным, если различным ключам соответствуют различные значения атрибутов. Таким образом, когда `GROUP BY` использует функцию, которая извлекает значение атрибута по ключу, эта функция автоматически исключается из `GROUP BY`.

ClickHouse генерирует исключение для ошибок со словарями. Примеры ошибок:

- Словарь, к которому осуществляется доступ, не может быть загружен.
- Ошибка при запросе к `cached` словарю.

Вы можете видеть список словарей и их статусы в таблице [system.dictionaries](../../operations/system-tables/dictionaries.md).

<CloudDetails />

Конфигурация выглядит следующим образом:

```xml
<clickhouse>
    <dictionary>
        ...
        <layout>
            <layout_type>
                <!-- layout settings -->
            </layout_type>
        </layout>
        ...
    </dictionary>
</clickhouse>
```

Соответствующий [DDL-запрос](../../sql-reference/statements/create/dictionary.md):

```sql
CREATE DICTIONARY (...)
...
LAYOUT(LAYOUT_TYPE(param value)) -- layout settings
...
```

Словари без слова `complex-key*` в компоновке имеют ключ с типом [UInt64](../../sql-reference/data-types/int-uint.md), словари `complex-key*` имеют составной ключ (сложный, с произвольными типами).

Ключи [UInt64](../../sql-reference/data-types/int-uint.md) в XML словарях определяются с помощью тега `<id>`.

Пример конфигурации (колонка key_column имеет тип UInt64):
```xml
...
<structure>
    <id>
        <name>key_column</name>
    </id>
...
```

Составные `complex` ключи XML словарей определяются тегом `<key>`.

Пример конфигурации составного ключа (ключ имеет один элемент с типом [String](../../sql-reference/data-types/string.md)):
```xml
...
<structure>
    <key>
        <attribute>
            <name>country_code</name>
            <type>String</type>
        </attribute>
    </key>
...
```
## Способы хранения словарей в памяти {#ways-to-store-dictionaries-in-memory}

Различные методы хранения данных словарей в памяти связаны с компромиссами в использовании CPU и RAM. Дерево решений, опубликованное в разделе [Выбор компоновки](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout) блога, связанного со словарями, является хорошей отправной точкой для принятия решения о том, какую компоновку использовать.

- [flat](#flat)
- [hashed](#hashed)
- [sparse_hashed](#sparse_hashed)
- [complex_key_hashed](#complex_key_hashed)
- [complex_key_sparse_hashed](#complex_key_sparse_hashed)
- [hashed_array](#hashed_array)
- [complex_key_hashed_array](#complex_key_hashed_array)
- [range_hashed](#range_hashed)
- [complex_key_range_hashed](#complex_key_range_hashed)
- [cache](#cache)
- [complex_key_cache](#complex_key_cache)
- [ssd_cache](#ssd_cache)
- [complex_key_ssd_cache](#complex_key_ssd_cache)
- [direct](#direct)
- [complex_key_direct](#complex_key_direct)
- [ip_trie](#ip_trie)
### flat {#flat}

Словарь полностью хранится в памяти в виде плоских массивов. Сколько памяти использует словарь? Объем пропорционален размеру наибольшего ключа (в занимаемом пространстве).

Ключ словаря имеет тип [UInt64](../../sql-reference/data-types/int-uint.md), а значение ограничено `max_array_size` (по умолчанию — 500,000). Если во время создания словаря обнаружен более крупный ключ, ClickHouse выбрасывает исключение и не создает словарь. Начальный размер плоских массивов словаря контролируется настройкой `initial_array_size` (по умолчанию — 1024).

Поддерживаются все типы источников. При обновлении данные (из файла или таблицы) считываются полностью.

Этот метод обеспечивает наилучшую производительность среди всех доступных методов хранения словаря.

Пример конфигурации:

```xml
<layout>
  <flat>
    <initial_array_size>50000</initial_array_size>
    <max_array_size>5000000</max_array_size>
  </flat>
</layout>
```

или

```sql
LAYOUT(FLAT(INITIAL_ARRAY_SIZE 50000 MAX_ARRAY_SIZE 5000000))
```
### hashed {#hashed}

Словарь полностью хранится в памяти в виде хеш-таблицы. Словарь может содержать любое количество элементов с любыми идентификаторами. На практике количество ключей может достигать десятков миллионов.

Ключ словаря имеет тип [UInt64](../../sql-reference/data-types/int-uint.md).

Поддерживаются все типы источников. При обновлении данные (из файла или таблицы) считываются полностью.

Пример конфигурации:

```xml
<layout>
  <hashed />
</layout>
```

или

```sql
LAYOUT(HASHED())
```

Пример конфигурации:

```xml
<layout>
  <hashed>
    <!-- If shards greater then 1 (default is `1`) the dictionary will load
         data in parallel, useful if you have huge amount of elements in one
         dictionary. -->
    <shards>10</shards>

    <!-- Size of the backlog for blocks in parallel queue.

         Since the bottleneck in parallel loading is rehash, and so to avoid
         stalling because of thread is doing rehash, you need to have some
         backlog.

         10000 is good balance between memory and speed.
         Even for 10e10 elements and can handle all the load without starvation. -->
    <shard_load_queue_backlog>10000</shard_load_queue_backlog>

    <!-- Maximum load factor of the hash table, with greater values, the memory
         is utilized more efficiently (less memory is wasted) but read/performance
         may deteriorate.

         Valid values: [0.5, 0.99]
         Default: 0.5 -->
    <max_load_factor>0.5</max_load_factor>
  </hashed>
</layout>
```

или

```sql
LAYOUT(HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```
### sparse_hashed {#sparse_hashed}

Аналогично `hashed`, но использует меньше памяти в ущерб большему использованию CPU.

Ключ словаря имеет тип [UInt64](../../sql-reference/data-types/int-uint.md).

Пример конфигурации:

```xml
<layout>
  <sparse_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </sparse_hashed>
</layout>
```

или

```sql
LAYOUT(SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

Также возможно использовать `shards` для этого типа словаря, и это более важно для `sparse_hashed`, чем для `hashed`, поскольку `sparse_hashed` медленнее.
### complex_key_hashed {#complex_key_hashed}

Этот тип хранения предназначен для использования с составными [ключами](#dictionary-key-and-fields). Аналогично `hashed`.

Пример конфигурации:

```xml
<layout>
  <complex_key_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </complex_key_hashed>
</layout>
```

или

```sql
LAYOUT(COMPLEX_KEY_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```
### complex_key_sparse_hashed {#complex_key_sparse_hashed}

Этот тип хранения предназначен для использования с составными [ключами](#dictionary-key-and-fields). Аналогично [sparse_hashed](#sparse_hashed).

Пример конфигурации:

```xml
<layout>
  <complex_key_sparse_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </complex_key_sparse_hashed>
</layout>
```

или

```sql
LAYOUT(COMPLEX_KEY_SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```
### hashed_array {#hashed_array}

Словарь полностью хранится в памяти. Каждый атрибут хранится в массиве. Ключевой атрибут хранится в виде хеш-таблицы, где значение — это индекс в массиве атрибутов. Словарь может содержать любое количество элементов с любыми идентификаторами. На практике количество ключей может достигать десятков миллионов.

Ключ словаря имеет тип [UInt64](../../sql-reference/data-types/int-uint.md).

Поддерживаются все типы источников. При обновлении данные (из файла или таблицы) считываются полностью.

Пример конфигурации:

```xml
<layout>
  <hashed_array>
  </hashed_array>
</layout>
```

или

```sql
LAYOUT(HASHED_ARRAY([SHARDS 1]))
```
### complex_key_hashed_array {#complex_key_hashed_array}

Этот тип хранения предназначен для использования с составными [ключами](#dictionary-key-and-fields). Аналогично [hashed_array](#hashed_array).

Пример конфигурации:

```xml
<layout>
  <complex_key_hashed_array />
</layout>
```

или

```sql
LAYOUT(COMPLEX_KEY_HASHED_ARRAY([SHARDS 1]))
```
### range_hashed {#range_hashed}

Словарь хранится в памяти в виде хеш-таблицы с упорядоченным массивом диапазонов и их соответствующими значениями.

Ключ словаря имеет тип [UInt64](../../sql-reference/data-types/int-uint.md). Этот метод хранения работает так же, как и hashed и позволяет использовать диапазоны даты/времени (произвольный числовой тип) в дополнение к ключу.

Пример: таблица содержит скидки для каждого рекламодателя в формате:

```text
┌─advertiser_id─┬─discount_start_date─┬─discount_end_date─┬─amount─┐
│           123 │          2015-01-16 │        2015-01-31 │   0.25 │
│           123 │          2015-01-01 │        2015-01-15 │   0.15 │
│           456 │          2015-01-01 │        2015-01-15 │   0.05 │
└───────────────┴─────────────────────┴───────────────────┴────────┘
```

Чтобы использовать выборку для диапазонов дат, определите элементы `range_min` и `range_max` в [структуре](#dictionary-key-and-fields). Эти элементы должны содержать элементы `name` и `type` (если `type` не указан, будет использован тип по умолчанию — Date). `type` может быть любым числовым типом (Date / DateTime / UInt64 / Int32 / другие).

:::note
Значения `range_min` и `range_max` должны помещаться в тип `Int64`.
:::

Пример:

```xml
<layout>
    <range_hashed>
        <!-- Strategy for overlapping ranges (min/max). Default: min (return a matching range with the min(range_min -> range_max) value) -->
        <range_lookup_strategy>min</range_lookup_strategy>
    </range_hashed>
</layout>
<structure>
    <id>
        <name>advertiser_id</name>
    </id>
    <range_min>
        <name>discount_start_date</name>
        <type>Date</type>
    </range_min>
    <range_max>
        <name>discount_end_date</name>
        <type>Date</type>
    </range_max>
    ...
```

или

```sql
CREATE DICTIONARY discounts_dict (
    advertiser_id UInt64,
    discount_start_date Date,
    discount_end_date Date,
    amount Float64
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(TABLE 'discounts'))
LIFETIME(MIN 1 MAX 1000)
LAYOUT(RANGE_HASHED(range_lookup_strategy 'max'))
RANGE(MIN discount_start_date MAX discount_end_date)
```

Для работы с этими словарями вам необходимо передать дополнительный аргумент функции `dictGet`, для которого выбирается диапазон:

```sql
dictGet('dict_name', 'attr_name', id, date)
```
Пример запроса:

```sql
SELECT dictGet('discounts_dict', 'amount', 1, '2022-10-20'::Date);
```

Эта функция возвращает значение для указанных `id` и диапазона дат, который включает переданную дату.

Подробности алгоритма:

- Если `id` не найден или диапазон не найден для `id`, возвращается значение по умолчанию типа атрибута.
- Если есть пересекающиеся диапазоны и `range_lookup_strategy=min`, возвращается совпадающий диапазон с минимальным `range_min`, если найдено несколько диапазонов, возвращается диапазон с минимальным `range_max`, если снова найдено несколько диапазонов (несколько диапазонов имели одинаковый `range_min` и `range_max`), возвращается случайный из них.
- Если есть пересекающиеся диапазоны и `range_lookup_strategy=max`, возвращается совпадающий диапазон с максимальным `range_min`, если найдено несколько диапазонов, возвращается диапазон с максимальным `range_max`, если снова найдено несколько диапазонов (несколько диапазонов имели одинаковый `range_min` и `range_max`), возвращается случайный из них.
- Если `range_max` — это `NULL`, диапазон открыт. `NULL` обрабатывается как максимальное возможное значение. Для `range_min` можно использовать `1970-01-01` или `0` (-MAX_INT) как открытое значение.

Пример конфигурации:

```xml
<clickhouse>
    <dictionary>
        ...

        <layout>
            <range_hashed />
        </layout>

        <structure>
            <id>
                <name>Abcdef</name>
            </id>
            <range_min>
                <name>StartTimeStamp</name>
                <type>UInt64</type>
            </range_min>
            <range_max>
                <name>EndTimeStamp</name>
                <type>UInt64</type>
            </range_max>
            <attribute>
                <name>XXXType</name>
                <type>String</type>
                <null_value />
            </attribute>
        </structure>

    </dictionary>
</clickhouse>
```

или

```sql
CREATE DICTIONARY somedict(
    Abcdef UInt64,
    StartTimeStamp UInt64,
    EndTimeStamp UInt64,
    XXXType String DEFAULT ''
)
PRIMARY KEY Abcdef
RANGE(MIN StartTimeStamp MAX EndTimeStamp)
```

Пример конфигурации с пересекающимися диапазонами и открытыми диапазонами:

```sql
CREATE TABLE discounts
(
    advertiser_id UInt64,
    discount_start_date Date,
    discount_end_date Nullable(Date),
    amount Float64
)
ENGINE = Memory;

INSERT INTO discounts VALUES (1, '2015-01-01', Null, 0.1);
INSERT INTO discounts VALUES (1, '2015-01-15', Null, 0.2);
INSERT INTO discounts VALUES (2, '2015-01-01', '2015-01-15', 0.3);
INSERT INTO discounts VALUES (2, '2015-01-04', '2015-01-10', 0.4);
INSERT INTO discounts VALUES (3, '1970-01-01', '2015-01-15', 0.5);
INSERT INTO discounts VALUES (3, '1970-01-01', '2015-01-10', 0.6);

SELECT * FROM discounts ORDER BY advertiser_id, discount_start_date;
┌─advertiser_id─┬─discount_start_date─┬─discount_end_date─┬─amount─┐
│             1 │          2015-01-01 │              ᴺᵁᴸᴸ │    0.1 │
│             1 │          2015-01-15 │              ᴺᵁᴸᴸ │    0.2 │
│             2 │          2015-01-01 │        2015-01-15 │    0.3 │
│             2 │          2015-01-04 │        2015-01-10 │    0.4 │
│             3 │          1970-01-01 │        2015-01-15 │    0.5 │
│             3 │          1970-01-01 │        2015-01-10 │    0.6 │
└───────────────┴─────────────────────┴───────────────────┴────────┘

-- RANGE_LOOKUP_STRATEGY 'max'

CREATE DICTIONARY discounts_dict
(
    advertiser_id UInt64,
    discount_start_date Date,
    discount_end_date Nullable(Date),
    amount Float64
)
PRIMARY KEY advertiser_id
SOURCE(CLICKHOUSE(TABLE discounts))
LIFETIME(MIN 600 MAX 900)
LAYOUT(RANGE_HASHED(RANGE_LOOKUP_STRATEGY 'max'))
RANGE(MIN discount_start_date MAX discount_end_date);

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-14')) res;
┌─res─┐
│ 0.1 │ -- the only one range is matching: 2015-01-01 - Null
└─────┘

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-16')) res;
┌─res─┐
│ 0.2 │ -- two ranges are matching, range_min 2015-01-15 (0.2) is bigger than 2015-01-01 (0.1)
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.4 │ -- two ranges are matching, range_min 2015-01-04 (0.4) is bigger than 2015-01-01 (0.3)
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.5 │ -- two ranges are matching, range_min are equal, 2015-01-15 (0.5) is bigger than 2015-01-10 (0.6)
└─────┘

DROP DICTIONARY discounts_dict;

-- RANGE_LOOKUP_STRATEGY 'min'

CREATE DICTIONARY discounts_dict
(
    advertiser_id UInt64,
    discount_start_date Date,
    discount_end_date Nullable(Date),
    amount Float64
)
PRIMARY KEY advertiser_id
SOURCE(CLICKHOUSE(TABLE discounts))
LIFETIME(MIN 600 MAX 900)
LAYOUT(RANGE_HASHED(RANGE_LOOKUP_STRATEGY 'min'))
RANGE(MIN discount_start_date MAX discount_end_date);

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-14')) res;
┌─res─┐
│ 0.1 │ -- the only one range is matching: 2015-01-01 - Null
└─────┘

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-16')) res;
┌─res─┐
│ 0.1 │ -- two ranges are matching, range_min 2015-01-01 (0.1) is less than 2015-01-15 (0.2)
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.3 │ -- two ranges are matching, range_min 2015-01-01 (0.3) is less than 2015-01-04 (0.4)
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.6 │ -- two ranges are matching, range_min are equal, 2015-01-10 (0.6) is less than 2015-01-15 (0.5)
└─────┘
```
### complex_key_range_hashed {#complex_key_range_hashed}

Словарь хранится в памяти в виде хеш-таблицы с упорядоченным массивом диапазонов и соответствующими значениями (см. [range_hashed](#range_hashed)). Этот тип хранения предназначен для использования с составными [ключами](#dictionary-key-and-fields).

Пример конфигурации:

```sql
CREATE DICTIONARY range_dictionary
(
  CountryID UInt64,
  CountryKey String,
  StartDate Date,
  EndDate Date,
  Tax Float64 DEFAULT 0.2
)
PRIMARY KEY CountryID, CountryKey
SOURCE(CLICKHOUSE(TABLE 'date_table'))
LIFETIME(MIN 1 MAX 1000)
LAYOUT(COMPLEX_KEY_RANGE_HASHED())
RANGE(MIN StartDate MAX EndDate);
```
### cache {#cache}

Словарь хранится в кэше с фиксированным количеством ячеек. Эти ячейки содержат часто используемые элементы.

Ключ словаря имеет тип [UInt64](../../sql-reference/data-types/int-uint.md).

При поиске словаря сначала ищется в кэше. Для каждого блока данных запрашиваются все ключи, которые не найдены в кэше или устарели, с использованием запроса `SELECT attrs... FROM db.table WHERE id IN (k1, k2, ...)`. Полученные данные затем записываются в кэш.

Если ключи не найдены в словаре, то создается задача обновления кэша и добавляется в очередь обновления. Свойства очереди обновления могут контролироваться с помощью настроек `max_update_queue_size`, `update_queue_push_timeout_milliseconds`, `query_wait_timeout_milliseconds`, `max_threads_for_updates`.

Для кэшированных словарей можно задать expiration [lifetime](#refreshing-dictionary-data-using-lifetime) данных в кэше. Если с момента загрузки данных в ячейку прошло больше времени, чем `lifetime`, значение ячейки не используется, и ключ становится устаревшим. Ключ запрашивается снова в следующий раз, когда он нужно будет использовать. Это поведение можно настроить с помощью настройки `allow_read_expired_keys`.

Это самый неэффективный из всех способов хранения словарей. Скорость кэша сильно зависит от правильных настроек и сценария использования. Словарь типа кэш работает хорошо только при высоких уровнях попадания (рекомендуется 99% и выше). Вы можете просмотреть средний уровень попадания в таблице [system.dictionaries](../../operations/system-tables/dictionaries.md).

Если настройка `allow_read_expired_keys` установлена в 1, по умолчанию 0, то словарь может поддерживать асинхронные обновления. Если клиент запрашивает ключи, и все они находятся в кэше, но некоторые из них устарели, то словарь вернет устаревшие ключи клиенту и запросит их асинхронно из источника.

Для повышения производительности кэша используйте подзапрос с `LIMIT` и вызывайте функцию со словарем извне.

Поддерживаются все типы источников.

Пример настроек:

```xml
<layout>
    <cache>
        <!-- The size of the cache, in number of cells. Rounded up to a power of two. -->
        <size_in_cells>1000000000</size_in_cells>
        <!-- Allows to read expired keys. -->
        <allow_read_expired_keys>0</allow_read_expired_keys>
        <!-- Max size of update queue. -->
        <max_update_queue_size>100000</max_update_queue_size>
        <!-- Max timeout in milliseconds for push update task into queue. -->
        <update_queue_push_timeout_milliseconds>10</update_queue_push_timeout_milliseconds>
        <!-- Max wait timeout in milliseconds for update task to complete. -->
        <query_wait_timeout_milliseconds>60000</query_wait_timeout_milliseconds>
        <!-- Max threads for cache dictionary update. -->
        <max_threads_for_updates>4</max_threads_for_updates>
    </cache>
</layout>
```

или

```sql
LAYOUT(CACHE(SIZE_IN_CELLS 1000000000))
```

Установите достаточно большой размер кэша. Вам нужно экспериментировать, чтобы выбрать количество ячеек:

1. Установите какое-то значение.
2. Запустите запросы, пока кэш не заполнится полностью.
3. Оцените использование памяти с помощью таблицы `system.dictionaries`.
4. Увеличивайте или уменьшайте количество ячеек, пока не будет достигнуто необходимое потребление памяти.

:::note
Не используйте ClickHouse в качестве источника, так как это медленно обрабатывает запросы с произвольными чтениями.
:::
### complex_key_cache {#complex_key_cache}

Этот тип хранения предназначен для использования с составными [ключами](#dictionary-key-and-fields). Аналогично `cache`.
### ssd_cache {#ssd_cache}

Аналогично `cache`, но хранит данные на SSD, а индекс в RAM. Все настройки кэш-диктантов, связанные с очередью обновления, также могут быть применены к словарям кэша SSD.

Ключ словаря имеет тип [UInt64](../../sql-reference/data-types/int-uint.md).

```xml
<layout>
    <ssd_cache>
        <!-- Size of elementary read block in bytes. Recommended to be equal to SSD's page size. -->
        <block_size>4096</block_size>
        <!-- Max cache file size in bytes. -->
        <file_size>16777216</file_size>
        <!-- Size of RAM buffer in bytes for reading elements from SSD. -->
        <read_buffer_size>131072</read_buffer_size>
        <!-- Size of RAM buffer in bytes for aggregating elements before flushing to SSD. -->
        <write_buffer_size>1048576</write_buffer_size>
        <!-- Path where cache file will be stored. -->
        <path>/var/lib/clickhouse/user_files/test_dict</path>
    </ssd_cache>
</layout>
```

или

```sql
LAYOUT(SSD_CACHE(BLOCK_SIZE 4096 FILE_SIZE 16777216 READ_BUFFER_SIZE 1048576
    PATH '/var/lib/clickhouse/user_files/test_dict'))
```
### complex_key_ssd_cache {#complex_key_ssd_cache}

Этот тип хранения предназначен для использования с составными [ключами](#dictionary-key-and-fields). Аналогично `ssd_cache`.
### direct {#direct}

Словарь не хранится в памяти и напрямую обращается к источнику во время обработки запроса.

Ключ словаря имеет тип [UInt64](../../sql-reference/data-types/int-uint.md).

Поддерживаются все типы [источников](#dictionary-sources), кроме локальных файлов.

Пример конфигурации:

```xml
<layout>
  <direct />
</layout>
```

или

```sql
LAYOUT(DIRECT())
```
### complex_key_direct {#complex_key_direct}

Этот тип хранения предназначен для использования с составными [ключами](#dictionary-key-and-fields). Аналогично `direct`.
### ip_trie {#ip_trie}

Этот словарь предназначен для поиска IP-адресов по сетевому префиксу. Он хранит диапазоны IP в нотации CIDR и позволяет быстро определять, к какому префиксу (например, подсеть или диапазон ASN) относится данный IP, что делает его идеальным для поиска на основе IP, такого как геолокация или классификация сети.

<iframe width="1024" height="576" src="https://www.youtube.com/embed/4dxMAqltygk?si=rrQrneBReK6lLfza" title="IP based search with the ip_trie dictionary" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

**Пример**

Предположим, у нас есть таблица в ClickHouse, которая содержит наши IP-префиксы и сопоставления:

```sql
CREATE TABLE my_ip_addresses (
    prefix String,
    asn UInt32,
    cca2 String
)
ENGINE = MergeTree
PRIMARY KEY prefix;
```

```sql
INSERT INTO my_ip_addresses VALUES
    ('202.79.32.0/20', 17501, 'NP'),
    ('2620:0:870::/48', 3856, 'US'),
    ('2a02:6b8:1::/48', 13238, 'RU'),
    ('2001:db8::/32', 65536, 'ZZ')
;
```

Давайте определим словарь `ip_trie` для этой таблицы. Компоновка `ip_trie` требует составного ключа:

```xml
<structure>
    <key>
        <attribute>
            <name>prefix</name>
            <type>String</type>
        </attribute>
    </key>
    <attribute>
            <name>asn</name>
            <type>UInt32</type>
            <null_value />
    </attribute>
    <attribute>
            <name>cca2</name>
            <type>String</type>
            <null_value>??</null_value>
    </attribute>
    ...
</structure>
<layout>
    <ip_trie>
        <!-- Key attribute `prefix` can be retrieved via dictGetString. -->
        <!-- This option increases memory usage. -->
        <access_to_key_from_attributes>true</access_to_key_from_attributes>
    </ip_trie>
</layout>
```

или

```sql
CREATE DICTIONARY my_ip_trie_dictionary (
    prefix String,
    asn UInt32,
    cca2 String DEFAULT '??'
)
PRIMARY KEY prefix
SOURCE(CLICKHOUSE(TABLE 'my_ip_addresses'))
LAYOUT(IP_TRIE)
LIFETIME(3600);
```

Ключ должен иметь только один атрибут типа `String`, который содержит допустимый IP-префикс. Другие типы пока не поддерживаются.

Синтаксис:

```sql
dictGetT('dict_name', 'attr_name', ip)
```

Функция принимает либо `UInt32` для IPv4, либо `FixedString(16)` для IPv6. Например:

```sql
SELECT dictGet('my_ip_trie_dictionary', 'cca2', toIPv4('202.79.32.10')) AS result;

┌─result─┐
│ NP     │
└────────┘


SELECT dictGet('my_ip_trie_dictionary', 'asn', IPv6StringToNum('2001:db8::1')) AS result;

┌─result─┐
│  65536 │
└────────┘


SELECT dictGet('my_ip_trie_dictionary', ('asn', 'cca2'), IPv6StringToNum('2001:db8::1')) AS result;

┌─result───────┐
│ (65536,'ZZ') │
└──────────────┘
```

Другие типы пока не поддерживаются. Функция возвращает атрибут для префикса, который соответствует данному IP-адресу. Если есть пересекающиеся префиксы, возвращается самый конкретный.

Данные должны полностью помещаться в RAM.
## Обновление данных словаря с использованием LIFETIME {#refreshing-dictionary-data-using-lifetime}

ClickHouse периодически обновляет словари на основе тега `LIFETIME` (определенным в секундах). `LIFETIME` — это интервал обновления для полностью загруженных словарей и интервал недействительности для кэшированных словарей.

Во время обновлений старая версия словаря все еще может использоваться для запросов. Обновления словаря (кроме загрузки словаря при первом использовании) не блокируют запросы. Если возникает ошибка во время обновления, ошибка записывается в журнал сервера и запросы могут продолжаться с использованием старой версии словаря. Если обновление словаря прошло успешно, старая версия словаря заменяется атомарно.

Пример настроек:

<CloudDetails />

```xml
<dictionary>
    ...
    <lifetime>300</lifetime>
    ...
</dictionary>
```

или

```sql
CREATE DICTIONARY (...)
...
LIFETIME(300)
...
```

Установка `<lifetime>0</lifetime>` (`LIFETIME(0)`) предотвращает обновление словарей.

Вы можете установить временной интервал для обновлений, и ClickHouse выберет равномерно случайное время в этом диапазоне. Это необходимо для распределения нагрузки на источник словаря при обновлении на большом количестве серверов.

Пример настроек:

```xml
<dictionary>
    ...
    <lifetime>
        <min>300</min>
        <max>360</max>
    </lifetime>
    ...
</dictionary>
```

или

```sql
LIFETIME(MIN 300 MAX 360)
```

Если `<min>0</min>` и `<max>0</max>`, ClickHouse не перезагрузит словарь по таймауту. В этом случае ClickHouse может перезагрузить словарь раньше, если конфигурационный файл словаря был изменен или была выполнена команда `SYSTEM RELOAD DICTIONARY`.

При обновлении словарей сервер ClickHouse применяет различную логику в зависимости от типа [источника](#dictionary-sources):

- Для текстового файла проверяется время модификации. Если время отличается от ранее записанного времени, словарь обновляется.
- Словари из других источников обновляются каждый раз по умолчанию.

Для других источников (ODBC, PostgreSQL, ClickHouse и т.д.) вы можете настроить запрос, который обновит словари только в том случае, если они действительно изменились, а не каждый раз. Для этого выполните следующие действия:

- Таблица словаря должна иметь поле, которое всегда меняется, когда обновляются исходные данные.
- Настройки источника должны указывать запрос, который извлекает изменяющееся поле. Сервер ClickHouse интерпретирует результат запроса как строку, и если эта строка изменилась по сравнению с ее предыдущим состоянием, словарь обновляется. Укажите запрос в поле `<invalidate_query>` в настройках для [источника](#dictionary-sources).

Пример настроек:

```xml
<dictionary>
    ...
    <odbc>
      ...
      <invalidate_query>SELECT update_time FROM dictionary_source where id = 1</invalidate_query>
    </odbc>
    ...
</dictionary>
```

или

```sql
...
SOURCE(ODBC(... invalidate_query 'SELECT update_time FROM dictionary_source where id = 1'))
...
```

Для словарей `Cache`, `ComplexKeyCache`, `SSDCache` и `SSDComplexKeyCache` поддерживаются как синхронные, так и асинхронные обновления.

Также возможно для словарей `Flat`, `Hashed`, `HashedArray`, `ComplexKeyHashed` запрашивать только данные, которые изменились после предыдущего обновления. Если `update_field` указан как часть конфигурации источника словаря, значение времени предыдущего обновления в секундах будет добавлено к запросу данных. В зависимости от типа источника (исполняемый файл, HTTP, MySQL, PostgreSQL, ClickHouse или ODBC) будет применена различная логика к `update_field` перед запросом данных из внешнего источника.

- Если источник — это HTTP, то `update_field` будет добавлен в качестве параметра запроса с последним временем обновления в качестве значения параметра.
- Если источник — исполняемый файл, то `update_field` будет добавлен в качестве аргумента исполняемого сценария с последним временем обновления в качестве значения аргумента.
- Если источник — ClickHouse, MySQL, PostgreSQL, ODBC — будет дополнительная часть `WHERE`, где `update_field` будет сравнен как больше или равно с последним временем обновления.
  - По умолчанию это условие `WHERE` проверяется на высшем уровне SQL-запроса. В качестве альтернативы это условие может быть проверено в любом другом `WHERE`-условии внутри запроса с использованием ключевого слова `{condition}`. Пример:
```sql
...
SOURCE(CLICKHOUSE(...
    update_field 'added_time'
    QUERY '
        SELECT my_arr.1 AS x, my_arr.2 AS y, creation_time
        FROM (
            SELECT arrayZip(x_arr, y_arr) AS my_arr, creation_time
            FROM dictionary_source
            WHERE {condition}
        )'
))
...
```

Если опция `update_field` установлена, можно задать дополнительную опцию `update_lag`. Значение опции `update_lag` вычитается из времени предыдущего обновления перед запросом обновленных данных.

Пример настроек:

```xml
<dictionary>
    ...
        <clickhouse>
            ...
            <update_field>added_time</update_field>
            <update_lag>15</update_lag>
        </clickhouse>
    ...
</dictionary>
```

или

```sql
...
SOURCE(CLICKHOUSE(... update_field 'added_time' update_lag 15))
...
```
## Источники словарей {#dictionary-sources}

<CloudDetails />

Словарь может быть подключен к ClickHouse из различных источников.

Если словарь настроен с использованием xml файла, конфигурация выглядит следующим образом:

```xml
<clickhouse>
  <dictionary>
    ...
    <source>
      <source_type>
        <!-- Source configuration -->
      </source_type>
    </source>
    ...
  </dictionary>
  ...
</clickhouse>
```

В случае [DDL-запроса](../../sql-reference/statements/create/dictionary.md) конфигурация, описанная выше, будет выглядеть так:

```sql
CREATE DICTIONARY dict_name (...)
...
SOURCE(SOURCE_TYPE(param1 val1 ... paramN valN)) -- Source configuration
...
```

Источник настраивается в разделе `source`.

Для типов источников [Локальный файл](#local-file), [Исполняемый файл](#executable-file), [HTTP(s)](#https), [ClickHouse](#clickhouse) доступны опциональные настройки:

```xml
<source>
  <file>
    <path>/opt/dictionaries/os.tsv</path>
    <format>TabSeparated</format>
  </file>
  <settings>
      <format_csv_allow_single_quotes>0</format_csv_allow_single_quotes>
  </settings>
</source>
```

или

```sql
SOURCE(FILE(path './user_files/os.tsv' format 'TabSeparated'))
SETTINGS(format_csv_allow_single_quotes = 0)
```

Типы источников (`source_type`):

- [Локальный файл](#local-file)
- [Исполняемый файл](#executable-file)
- [Исполняемый пул](#executable-pool)
- [HTTP(S)](#https)
- СУБД
  - [ODBC](#odbc)
  - [MySQL](#mysql)
  - [ClickHouse](#clickhouse)
  - [MongoDB](#mongodb)
  - [Redis](#redis)
  - [Cassandra](#cassandra)
  - [PostgreSQL](#postgresql)
### Локальный файл {#local-file}

Пример настроек:

```xml
<source>
  <file>
    <path>/opt/dictionaries/os.tsv</path>
    <format>TabSeparated</format>
  </file>
</source>
```

или

```sql
SOURCE(FILE(path './user_files/os.tsv' format 'TabSeparated'))
```

Поля настройки:

- `path` — Абсолютный путь к файлу.
- `format` — Формат файла. Поддерживаются все форматы, описанные в [Форматы](/sql-reference/formats).

Когда словарь с источником `FILE` создается с помощью DDL команды (`CREATE DICTIONARY ...`), исходный файл должен находиться в директории `user_files`, чтобы предотвратить доступ пользователей БД к произвольным файлам на узле ClickHouse.

**См. Также**

- [Функция словаря](/sql-reference/table-functions/dictionary)
### Исполняемый файл {#executable-file}

Работа с исполняемыми файлами зависит от [того, как словарь хранится в памяти](#storing-dictionaries-in-memory). Если словарь хранится с использованием `cache` и `complex_key_cache`, ClickHouse запрашивает необходимые ключи, отправляя запрос в STDIN исполняемого файла. В противном случае ClickHouse запускает исполняемый файл и рассматривает его вывод как данные словаря.

Пример настроек:

```xml
<source>
    <executable>
        <command>cat /opt/dictionaries/os.tsv</command>
        <format>TabSeparated</format>
        <implicit_key>false</implicit_key>
    </executable>
</source>
```

Поля настройки:

- `command` — Абсолютный путь к исполняемому файлу или имя файла (если каталог команды находится в `PATH`).
- `format` — Формат файла. Поддерживаются все форматы, описанные в [Форматы](/sql-reference/formats).
- `command_termination_timeout` — исполняемый сценарий должен содержать основной цикл чтения и записи. После уничтожения словаря труба закрывается, и исполняемый файл будет иметь `command_termination_timeout` секунд на завершение, прежде чем ClickHouse отправит сигнал SIGTERM дочернему процессу. `command_termination_timeout` указывается в секундах. Значение по умолчанию — 10. Необязательный параметр.
- `command_read_timeout` - Таймаут для чтения данных из stdout команды в миллисекундах. Значение по умолчанию — 10000. Необязательный параметр.
- `command_write_timeout` - Таймаут для записи данных в stdin команды в миллисекундах. Значение по умолчанию — 10000. Необязательный параметр.
- `implicit_key` — исполняемый исходный файл может возвращать только значения, и соответствие запрашиваемым ключам определяется неявно — по порядку строк в результате. Значение по умолчанию — false.
- `execute_direct` - Если `execute_direct` = `1`, то `command` будет искаться внутри папки user_scripts, указанной с помощью [user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path). Дополнительные аргументы сценария могут быть указаны с помощью пробела в качестве разделителя. Пример: `script_name arg1 arg2`. Если `execute_direct` = `0`, `command` передается в качестве аргумента для `bin/sh -c`. Значение по умолчанию — `0`. Необязательный параметр.
- `send_chunk_header` - контролирует, нужно ли отправлять количество строк перед отправкой блока данных для обработки. Необязательный. Значение по умолчанию — `false`.

Этот источник словаря можно настроить только с помощью XML-конфигурации. Создание словарей с исполняемым источником через DDL отключено, иначе пользователь БД мог бы выполнять произвольные бинарные файлы на узле ClickHouse.
### Исполняемый пул {#executable-pool}

Исполняемый пул позволяет загружать данные из пула процессов. Этот источник не работает с компоновками словарей, которые требуют загрузки всех данных из источника. Исполняемый пул работает, если словарь [хранится](#ways-to-store-dictionaries-in-memory) с использованием `cache`, `complex_key_cache`, `ssd_cache`, `complex_key_ssd_cache`, `direct` или `complex_key_direct` компоновок.

Исполняемый пул будет создавать пул процессов с указанной командой и поддерживать их работу до тех пор, пока они не завершатся. Программа должна считывать данные из STDIN, пока они доступны, и выводить результат в STDOUT. Она может ожидать следующий блок данных в STDIN. ClickHouse не закроет STDIN после обработки блока данных, но будет передавать другой фрагмент данных по мере необходимости. Исполняемый сценарий должен быть готов к такому способу обработки данных — он должен опрашивать STDIN и сбрасывать данные в STDOUT заранее.

Пример настроек:

```xml
<source>
    <executable_pool>
        <command><command>while read key; do printf "$key\tData for key $key\n"; done</command</command>
        <format>TabSeparated</format>
        <pool_size>10</pool_size>
        <max_command_execution_time>10<max_command_execution_time>
        <implicit_key>false</implicit_key>
    </executable_pool>
</source>
```

Поля настройки:

- `command` — Абсолютный путь к исполняемому файлу или имя файла (если каталог программы записан в `PATH`).
- `format` — Формат файла. Поддерживаются все форматы, описанные в "[Форматах](/sql-reference/formats)".
- `pool_size` — Размер пула. Если 0 указано в качестве `pool_size`, то ограничений по размеру пула нет. Значение по умолчанию — `16`.
- `command_termination_timeout` — исполняемый сценарий должен содержать основной цикл чтения и записи. После уничтожения словаря труба закрывается, и исполняемый файл будет иметь `command_termination_timeout` секунд на завершение, прежде чем ClickHouse отправит сигнал SIGTERM дочернему процессу. Указывается в секундах. Значение по умолчанию — 10. Необязательный параметр.
- `max_command_execution_time` — максимальное время выполнения команды исполняемого скрипта для обработки блока данных. Указывается в секундах. Значение по умолчанию — 10. Необязательный параметр.
- `command_read_timeout` - тайм-аут для чтения данных из stdout команды в миллисекундах. Значение по умолчанию — 10000. Необязательный параметр.
- `command_write_timeout` - тайм-аут для записи данных в stdin команды в миллисекундах. Значение по умолчанию — 10000. Необязательный параметр.
- `implicit_key` — исполняемый исходный файл может возвращать только значения, и соответствие запрашиваемым ключам определяется неявно — по порядку строк в результате. Значение по умолчанию — false. Необязательный параметр.
- `execute_direct` - Если `execute_direct` = `1`, то `command` будет искаться внутри папки user_scripts, указанной с помощью [user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path). Дополнительные аргументы сценария могут быть указаны с помощью пробела в качестве разделителя. Пример: `script_name arg1 arg2`. Если `execute_direct` = `0`, `command` передается в качестве аргумента для `bin/sh -c`. Значение по умолчанию — `1`. Необязательный параметр.
- `send_chunk_header` - контролирует, нужно ли отправлять количество строк перед отправкой блока данных для обработки. Необязательный. Значение по умолчанию — `false`.

Этот источник словаря можно настроить только с помощью XML-конфигурации. Создание словарей с исполняемым источником через DDL отключено, иначе пользователь БД мог бы выполнять произвольный бинарный файл на узле ClickHouse.
### HTTP(S) {#https}

Работа с HTTP(S) сервером зависит от [того, как словарь хранится в памяти](#storing-dictionaries-in-memory). Если словарь хранится с использованием `cache` и `complex_key_cache`, ClickHouse запрашивает необходимые ключи, отправляя запрос с помощью метода `POST`.

Пример настроек:

```xml
<source>
    <http>
        <url>http://[::1]/os.tsv</url>
        <format>TabSeparated</format>
        <credentials>
            <user>user</user>
            <password>password</password>
        </credentials>
        <headers>
            <header>
                <name>API-KEY</name>
                <value>key</value>
            </header>
        </headers>
    </http>
</source>
```

или

```sql
SOURCE(HTTP(
    url 'http://[::1]/os.tsv'
    format 'TabSeparated'
    credentials(user 'user' password 'password')
    headers(header(name 'API-KEY' value 'key'))
))
```

Для того чтобы ClickHouse мог получить доступ к HTTPS ресурсу, необходимо [настроить openSSL](../../operations/server-configuration-parameters/settings.md#openssl) в конфигурации сервера.

Параметры настроек:

- `url` – Исходный URL.
- `format` – Формат файла. Поддерживаются все форматы, описанные в "[Форматы](/sql-reference/formats)".
- `credentials` – Базовая HTTP аутентификация. Необязательный параметр.
- `user` – Имя пользователя, необходимое для аутентификации.
- `password` – Пароль, необходимый для аутентификации.
- `headers` – Все пользовательские записи заголовков HTTP, используемые для HTTP-запроса. Необязательный параметр.
- `header` – Один заголовок HTTP.
- `name` – Имя идентификатора, использующегося для заголовка, отправленного с запросом.
- `value` – Значение, установленное для определенного имени идентификатора.

При создании словаря с помощью команды DDL (`CREATE DICTIONARY ...`) удаленные хосты для HTTP словарей проверяются на соответствие содержимому секции `remote_url_allow_hosts` из конфигурации, чтобы предотвратить доступ пользователей базы данных к произвольному HTTP серверу.

### DBMS {#dbms}
#### ODBC {#odbc}

Вы можете использовать этот метод для подключения к любой базе данных, для которой есть ODBC драйвер.

Пример настроек:

```xml
<source>
    <odbc>
        <db>DatabaseName</db>
        <table>ShemaName.TableName</table>
        <connection_string>DSN=some_parameters</connection_string>
        <invalidate_query>SQL_QUERY</invalidate_query>
        <query>SELECT id, value_1, value_2 FROM ShemaName.TableName</query>
    </odbc>
</source>
```

или

```sql
SOURCE(ODBC(
    db 'DatabaseName'
    table 'SchemaName.TableName'
    connection_string 'DSN=some_parameters'
    invalidate_query 'SQL_QUERY'
    query 'SELECT id, value_1, value_2 FROM db_name.table_name'
))
```

Параметры настроек:

- `db` – Имя базы данных. Укажите его, если имя базы данных не задано в параметрах `<connection_string>`.
- `table` – Имя таблицы и схемы, если они существуют.
- `connection_string` – Строка подключения.
- `invalidate_query` – Запрос для проверки статуса словаря. Необязательный параметр. Подробнее в разделе [Обновление данных словаря с использованием LIFETIME](#refreshing-dictionary-data-using-lifetime).
- `background_reconnect` – Повторное подключение к реплике в фоновом режиме в случае сбоя подключения. Необязательный параметр.
- `query` – Пользовательский запрос. Необязательный параметр.

:::note
Поля `table` и `query` не могут использоваться одновременно. И одно из полей `table` или `query` должно быть объявлено.
:::

ClickHouse получает символы кавычек от ODBC-драйвера и кладет все настройки в запросы к драйверу, поэтому необходимо установить имя таблицы в соответствии с регистром имени таблицы в базе данных.

Если у вас возникли проблемы с кодировками при использовании Oracle, смотрите соответствующий пункт [Часто задаваемые вопросы](/knowledgebase/oracle-odbc).
##### Известная уязвимость функциональности ODBC словаря {#known-vulnerability-of-the-odbc-dictionary-functionality}

:::note
При подключении к базе данных через ODBC-драйвер параметр подключения `Servername` может быть подменен. В этом случае значения `USERNAME` и `PASSWORD` из `odbc.ini` отправляются на удаленный сервер и могут быть скомпрометированы.
:::

**Пример небезопасного использования**

Настроим unixODBC для PostgreSQL. Содержимое `/etc/odbc.ini`:

```text
[gregtest]
Driver = /usr/lib/psqlodbca.so
Servername = localhost
PORT = 5432
DATABASE = test_db
#OPTION = 3
USERNAME = test
PASSWORD = test
```

Если затем вы сделаете запрос, такой как

```sql
SELECT * FROM odbc('DSN=gregtest;Servername=some-server.com', 'test_db');
```

ODBC-драйвер отправит значения `USERNAME` и `PASSWORD` из `odbc.ini` на `some-server.com`.
##### Пример подключения к PostgreSQL {#example-of-connecting-postgresql}

Операционная система Ubuntu.

Установка unixODBC и ODBC-драйвера для PostgreSQL:

```bash
$ sudo apt-get install -y unixodbc odbcinst odbc-postgresql
```

Настройка `/etc/odbc.ini` (или `~/.odbc.ini`, если вы вошли как пользователь, который запускает ClickHouse):

```text
[DEFAULT]
Driver = myconnection

[myconnection]
Description         = PostgreSQL connection to my_db
Driver              = PostgreSQL Unicode
Database            = my_db
Servername          = 127.0.0.1
UserName            = username
Password            = password
Port                = 5432
Protocol            = 9.3
ReadOnly            = No
RowVersioning       = No
ShowSystemTables    = No
ConnSettings        =
```

Конфигурация словаря в ClickHouse:

```xml
<clickhouse>
    <dictionary>
        <name>table_name</name>
        <source>
            <odbc>
                <!-- You can specify the following parameters in connection_string: -->
                <!-- DSN=myconnection;UID=username;PWD=password;HOST=127.0.0.1;PORT=5432;DATABASE=my_db -->
                <connection_string>DSN=myconnection</connection_string>
                <table>postgresql_table</table>
            </odbc>
        </source>
        <lifetime>
            <min>300</min>
            <max>360</max>
        </lifetime>
        <layout>
            <hashed/>
        </layout>
        <structure>
            <id>
                <name>id</name>
            </id>
            <attribute>
                <name>some_column</name>
                <type>UInt64</type>
                <null_value>0</null_value>
            </attribute>
        </structure>
    </dictionary>
</clickhouse>
```

или

```sql
CREATE DICTIONARY table_name (
    id UInt64,
    some_column UInt64 DEFAULT 0
)
PRIMARY KEY id
SOURCE(ODBC(connection_string 'DSN=myconnection' table 'postgresql_table'))
LAYOUT(HASHED())
LIFETIME(MIN 300 MAX 360)
```

Возможно, вам понадобится отредактировать `odbc.ini`, чтобы указать полный путь к библиотеке с драйвером `DRIVER=/usr/local/lib/psqlodbcw.so`.
##### Пример подключения к MS SQL Server {#example-of-connecting-ms-sql-server}

Операционная система Ubuntu.

Установка ODBC-драйвера для подключения к MS SQL:

```bash
$ sudo apt-get install tdsodbc freetds-bin sqsh
```

Настройка драйвера:

```bash
$ cat /etc/freetds/freetds.conf
...

[MSSQL]
host = 192.168.56.101
port = 1433
tds version = 7.0
client charset = UTF-8


# test TDS connection
$ sqsh -S MSSQL -D database -U user -P password


$ cat /etc/odbcinst.ini

[FreeTDS]
Description     = FreeTDS
Driver          = /usr/lib/x86_64-linux-gnu/odbc/libtdsodbc.so
Setup           = /usr/lib/x86_64-linux-gnu/odbc/libtdsS.so
FileUsage       = 1
UsageCount      = 5

$ cat /etc/odbc.ini

# $ cat ~/.odbc.ini # if you signed in under a user that runs ClickHouse

[MSSQL]
Description     = FreeTDS
Driver          = FreeTDS
Servername      = MSSQL
Database        = test
UID             = test
PWD             = test
Port            = 1433



# (optional) test ODBC connection (to use isql-tool install the [unixodbc](https://packages.debian.org/sid/unixodbc)-package)
$ isql -v MSSQL "user" "password"
```

Замечания:
- Чтобы определить самую раннюю версию TDS, поддерживаемую конкретной версией SQL Server, обратитесь к документации продукта или посмотрите [MS-TDS Product Behavior](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-tds/135d0ebe-5c4c-4a94-99bf-1811eccb9f4a)

Настройка словаря в ClickHouse:

```xml
<clickhouse>
    <dictionary>
        <name>test</name>
        <source>
            <odbc>
                <table>dict</table>
                <connection_string>DSN=MSSQL;UID=test;PWD=test</connection_string>
            </odbc>
        </source>

        <lifetime>
            <min>300</min>
            <max>360</max>
        </lifetime>

        <layout>
            <flat />
        </layout>

        <structure>
            <id>
                <name>k</name>
            </id>
            <attribute>
                <name>s</name>
                <type>String</type>
                <null_value></null_value>
            </attribute>
        </structure>
    </dictionary>
</clickhouse>
```

или

```sql
CREATE DICTIONARY test (
    k UInt64,
    s String DEFAULT ''
)
PRIMARY KEY k
SOURCE(ODBC(table 'dict' connection_string 'DSN=MSSQL;UID=test;PWD=test'))
LAYOUT(FLAT())
LIFETIME(MIN 300 MAX 360)
```
#### Mysql {#mysql}

Пример настроек:

```xml
<source>
  <mysql>
      <port>3306</port>
      <user>clickhouse</user>
      <password>qwerty</password>
      <replica>
          <host>example01-1</host>
          <priority>1</priority>
      </replica>
      <replica>
          <host>example01-2</host>
          <priority>1</priority>
      </replica>
      <db>db_name</db>
      <table>table_name</table>
      <where>id=10</where>
      <invalidate_query>SQL_QUERY</invalidate_query>
      <fail_on_connection_loss>true</fail_on_connection_loss>
      <query>SELECT id, value_1, value_2 FROM db_name.table_name</query>
  </mysql>
</source>
```

или

```sql
SOURCE(MYSQL(
    port 3306
    user 'clickhouse'
    password 'qwerty'
    replica(host 'example01-1' priority 1)
    replica(host 'example01-2' priority 1)
    db 'db_name'
    table 'table_name'
    where 'id=10'
    invalidate_query 'SQL_QUERY'
    fail_on_connection_loss 'true'
    query 'SELECT id, value_1, value_2 FROM db_name.table_name'
))
```

Параметры настроек:

- `port` – Порт на сервере MySQL. Вы можете указать его для всех реплик или для каждой по отдельности (внутри `<replica>`).
- `user` – Имя пользователя MySQL. Вы можете указать его для всех реплик или для каждой по отдельности (внутри `<replica>`).
- `password` – Пароль пользователя MySQL. Вы можете указать его для всех реплик или для каждой по отдельности (внутри `<replica>`).
- `replica` – Секция конфигурации реплик. Может быть несколько секций.

        - `replica/host` – Хост MySQL.
        - `replica/priority` – Приоритет реплики. При попытке подключения ClickHouse просматривает реплики в порядке приоритета. Чем ниже число, тем выше приоритет.

- `db` – Имя базы данных.
- `table` – Имя таблицы.
- `where` – Критерии выбора. Синтаксис для условий такой же, как для оператора `WHERE` в MySQL, например, `id > 10 AND id < 20`. Необязательный параметр.
- `invalidate_query` – Запрос для проверки статуса словаря. Необязательный параметр. Подробнее в разделе [Обновление данных словаря с использованием LIFETIME](#refreshing-dictionary-data-using-lifetime).
- `fail_on_connection_loss` – Параметр конфигурации, который контролирует поведение сервера при потере подключения. Если `true`, исключение выбрасывается немедленно, если связь между клиентом и сервером была утеряна. Если `false`, сервер ClickHouse повторяет попытку выполнить запрос трижды, прежде чем выбросить исключение. Обратите внимание, что повторные попытки приводят к увеличению времени отклика. Значение по умолчанию: `false`.
- `query` – Пользовательский запрос. Необязательный параметр.

:::note
Поля `table` или `where` не могут использоваться вместе с полем `query`. И одно из полей `table` или `query` должно быть объявлено.
:::

:::note
Не существует явного параметра `secure`. При установлении SSL-соединения безопасность является обязательной.
:::

MySQL можно подключить к локальному хосту через сокеты. Для этого установите `host` и `socket`.

Пример настроек:

```xml
<source>
  <mysql>
      <host>localhost</host>
      <socket>/path/to/socket/file.sock</socket>
      <user>clickhouse</user>
      <password>qwerty</password>
      <db>db_name</db>
      <table>table_name</table>
      <where>id=10</where>
      <invalidate_query>SQL_QUERY</invalidate_query>
      <fail_on_connection_loss>true</fail_on_connection_loss>
      <query>SELECT id, value_1, value_2 FROM db_name.table_name</query>
  </mysql>
</source>
```

или

```sql
SOURCE(MYSQL(
    host 'localhost'
    socket '/path/to/socket/file.sock'
    user 'clickhouse'
    password 'qwerty'
    db 'db_name'
    table 'table_name'
    where 'id=10'
    invalidate_query 'SQL_QUERY'
    fail_on_connection_loss 'true'
    query 'SELECT id, value_1, value_2 FROM db_name.table_name'
))
```
#### ClickHouse {#clickhouse}

Пример настроек:

```xml
<source>
    <clickhouse>
        <host>example01-01-1</host>
        <port>9000</port>
        <user>default</user>
        <password></password>
        <db>default</db>
        <table>ids</table>
        <where>id=10</where>
        <secure>1</secure>
        <query>SELECT id, value_1, value_2 FROM default.ids</query>
    </clickhouse>
</source>
```

или

```sql
SOURCE(CLICKHOUSE(
    host 'example01-01-1'
    port 9000
    user 'default'
    password ''
    db 'default'
    table 'ids'
    where 'id=10'
    secure 1
    query 'SELECT id, value_1, value_2 FROM default.ids'
));
```

Параметры настроек:

- `host` – Хост ClickHouse. Если это локальный хост, запрос обрабатывается без какой-либо сетевой активности. Для повышения отказоустойчивости вы можете создать [Распределенную](../../engines/table-engines/special/distributed.md) таблицу и использовать ее в последующих конфигурациях.
- `port` – Порт на сервере ClickHouse.
- `user` – Имя пользователя ClickHouse.
- `password` – Пароль пользователя ClickHouse.
- `db` – Имя базы данных.
- `table` – Имя таблицы.
- `where` – Критерии выбора. Может быть опущено.
- `invalidate_query` – Запрос для проверки статуса словаря. Необязательный параметр. Подробнее в разделе [Обновление данных словаря с использованием LIFETIME](#refreshing-dictionary-data-using-lifetime).
- `secure` - Используйте ssl для подключения.
- `query` – Пользовательский запрос. Необязательный параметр.

:::note
Поля `table` или `where` не могут использоваться вместе с полем `query`. И одно из полей `table` или `query` должно быть объявлено.
:::
#### MongoDB {#mongodb}

Пример настроек:

```xml
<source>
    <mongodb>
        <host>localhost</host>
        <port>27017</port>
        <user></user>
        <password></password>
        <db>test</db>
        <collection>dictionary_source</collection>
        <options>ssl=true</options>
    </mongodb>
</source>
```

или

```xml
<source>
    <mongodb>
        <uri>mongodb://localhost:27017/test?ssl=true</uri>
        <collection>dictionary_source</collection>
    </mongodb>
</source>
```

или

```sql
SOURCE(MONGODB(
    host 'localhost'
    port 27017
    user ''
    password ''
    db 'test'
    collection 'dictionary_source'
    options 'ssl=true'
))
```

Параметры настроек:

- `host` – Хост MongoDB.
- `port` – Порт на сервере MongoDB.
- `user` – Имя пользователя MongoDB.
- `password` – Пароль пользователя MongoDB.
- `db` – Имя базы данных.
- `collection` – Имя коллекции.
- `options` - Опции строки подключения MongoDB (необязательный параметр).

или

```sql
SOURCE(MONGODB(
    uri 'mongodb://localhost:27017/clickhouse'
    collection 'dictionary_source'
))
```

Параметры настроек:

- `uri` - URI для Establish подключения.
- `collection` – Имя коллекции.

[Больше информации о движке](../../engines/table-engines/integrations/mongodb.md)
#### Redis {#redis}

Пример настроек:

```xml
<source>
    <redis>
        <host>localhost</host>
        <port>6379</port>
        <storage_type>simple</storage_type>
        <db_index>0</db_index>
    </redis>
</source>
```

или

```sql
SOURCE(REDIS(
    host 'localhost'
    port 6379
    storage_type 'simple'
    db_index 0
))
```

Параметры настроек:

- `host` – Хост Redis.
- `port` – Порт на сервере Redis.
- `storage_type` – Структура внутреннего хранилища Redis, используемая для работы с ключами. `simple` предназначен для простых источников и для хешированных одиночных ключевых источников, `hash_map` предназначен для хешированных источников с двумя ключами. Диапазон источников и кэшированные источники с комплексным ключом не поддерживаются. Может быть опущен, значение по умолчанию `simple`.
- `db_index` – Конкретный числовой индекс логической базы данных Redis. Может быть опущен, значение по умолчанию 0.
#### Cassandra {#cassandra}

Пример настроек:

```xml
<source>
    <cassandra>
        <host>localhost</host>
        <port>9042</port>
        <user>username</user>
        <password>qwerty123</password>
        <keyspase>database_name</keyspase>
        <column_family>table_name</column_family>
        <allow_filtering>1</allow_filtering>
        <partition_key_prefix>1</partition_key_prefix>
        <consistency>One</consistency>
        <where>"SomeColumn" = 42</where>
        <max_threads>8</max_threads>
        <query>SELECT id, value_1, value_2 FROM database_name.table_name</query>
    </cassandra>
</source>
```

Параметры настроек:

- `host` – Хост Cassandra или запятую, разделенный список хостов.
- `port` – Порт на серверах Cassandra. Если не указан, используется порт по умолчанию 9042.
- `user` – Имя пользователя Cassandra.
- `password` – Пароль пользователя Cassandra.
- `keyspace` – Имя пространства ключей (базы данных).
- `column_family` – Имя семейства столбцов (таблицы).
- `allow_filtering` – Флаг, позволяющий или запрещающий потенциально дорогие условия по столбцам ключа кластеризации. Значение по умолчанию 1.
- `partition_key_prefix` – Число столбцов ключа партиции в первичном ключе таблицы Cassandra. Обязательно для словарей составного ключа. Порядок ключевых столбцов в определении словаря должен быть таким же, как в Cassandra. Значение по умолчанию 1 (первый ключевой столбец является ключом партиции, а остальные ключевые столбцы — ключами кластеризации).
- `consistency` – Уровень согласованности. Возможные значения: `One`, `Two`, `Three`, `All`, `EachQuorum`, `Quorum`, `LocalQuorum`, `LocalOne`, `Serial`, `LocalSerial`. Значение по умолчанию `One`.
- `where` – Необязательные критерии выбора.
- `max_threads` – Максимальное количество потоков, которые могут быть использованы для загрузки данных из нескольких партиций в словарях составных ключей.
- `query` – Пользовательский запрос. Необязательный параметр.

:::note
Поля `column_family` или `where` не могут использоваться вместе с полем `query`. И одно из полей `column_family` или `query` должно быть объявлено.
:::
#### PostgreSQL {#postgresql}

Пример настроек:

```xml
<source>
  <postgresql>
      <host>postgresql-hostname</hoat>
      <port>5432</port>
      <user>clickhouse</user>
      <password>qwerty</password>
      <db>db_name</db>
      <table>table_name</table>
      <where>id=10</where>
      <invalidate_query>SQL_QUERY</invalidate_query>
      <query>SELECT id, value_1, value_2 FROM db_name.table_name</query>
  </postgresql>
</source>
```

или

```sql
SOURCE(POSTGRESQL(
    port 5432
    host 'postgresql-hostname'
    user 'postgres_user'
    password 'postgres_password'
    db 'db_name'
    table 'table_name'
    replica(host 'example01-1' port 5432 priority 1)
    replica(host 'example01-2' port 5432 priority 2)
    where 'id=10'
    invalidate_query 'SQL_QUERY'
    query 'SELECT id, value_1, value_2 FROM db_name.table_name'
))
```

Параметры настроек:

- `host` – Хост на сервере PostgreSQL. Вы можете указать его для всех реплик или для каждой по отдельности (внутри `<replica>`).
- `port` – Порт на сервере PostgreSQL. Вы можете указать его для всех реплик или для каждой по отдельности (внутри `<replica>`).
- `user` – Имя пользователя PostgreSQL. Вы можете указать его для всех реплик или для каждой по отдельности (внутри `<replica>`).
- `password` – Пароль пользователя PostgreSQL. Вы можете указать его для всех реплик или для каждой по отдельности (внутри `<replica>`).
- `replica` – Секция конфигурации реплик. Может быть несколько секций:
  - `replica/host` – Хост PostgreSQL.
  - `replica/port` – Порт PostgreSQL.
  - `replica/priority` – Приоритет реплики. При попытке подключения ClickHouse просматривает реплики в порядке приоритета. Чем ниже число, тем выше приоритет.
- `db` – Имя базы данных.
- `table` – Имя таблицы.
- `where` – Критерии выбора. Синтаксис для условий такой же, как для оператора `WHERE` в PostgreSQL. Например, `id > 10 AND id < 20`. Необязательный параметр.
- `invalidate_query` – Запрос для проверки статуса словаря. Необязательный параметр. Подробнее в разделе [Обновление данных словаря с использованием LIFETIME](#refreshing-dictionary-data-using-lifetime).
- `background_reconnect` – Повторное подключение к реплике в фоновом режиме в случае сбоя подключения. Необязательный параметр.
- `query` – Пользовательский запрос. Необязательный параметр.

:::note
Поля `table` или `where` не могут использоваться вместе с полем `query`. И одно из полей `table` или `query` должно быть объявлено.
:::
### Null {#null}

Специальный источник, который можно использовать для создания фиктивных (пустых) словарей. Такие словари могут быть полезны для тестов или с настройками с отдельными узлами данных и запросов на узлах с распределенными таблицами.

```sql
CREATE DICTIONARY null_dict (
    id              UInt64,
    val             UInt8,
    default_val     UInt8 DEFAULT 123,
    nullable_val    Nullable(UInt8)
)
PRIMARY KEY id
SOURCE(NULL())
LAYOUT(FLAT())
LIFETIME(0);
```
## Ключ словаря и поля {#dictionary-key-and-fields}

<CloudDetails />

Клаузула `structure` описывает ключ словаря и поля, доступные для запросов.

XML описание:

```xml
<dictionary>
    <structure>
        <id>
            <name>Id</name>
        </id>

        <attribute>
            <!-- Attribute parameters -->
        </attribute>

        ...

    </structure>
</dictionary>
```

Атрибуты описаны в элементах:

- `<id>` — Ключевая колонка
- `<attribute>` — Колонка данных: может быть несколько атрибутов.

DDL запрос:

```sql
CREATE DICTIONARY dict_name (
    Id UInt64,
    -- attributes
)
PRIMARY KEY Id
...
```

Атрибуты описаны в теле запроса:

- `PRIMARY KEY` — Ключевая колонка
- `AttrName AttrType` — Колонка данных. Может быть несколько атрибутов.
## Ключ {#key}

ClickHouse поддерживает следующие типы ключей:

- Числовой ключ. `UInt64`. Определен в теге `<id>` или с использованием ключевого слова `PRIMARY KEY`.
- Составной ключ. Набор значений различных типов. Определен в теге `<key>` или с помощью ключевого слова `PRIMARY KEY`.

XML-структура может содержать либо `<id>`, либо `<key>`. DDL-запрос должен содержать единственный `PRIMARY KEY`.

:::note
Вы не должны описывать ключ как атрибут.
:::
### Числовой ключ {#numeric-key}

Тип: `UInt64`.

Пример конфигурации:

```xml
<id>
    <name>Id</name>
</id>
```

Параметры конфигурации:

- `name` – Имя колонки с ключами.

Для DDL-запроса:

```sql
CREATE DICTIONARY (
    Id UInt64,
    ...
)
PRIMARY KEY Id
...
```

- `PRIMARY KEY` – Имя колонки с ключами.
### Составной ключ {#composite-key}

Ключ может быть `tuple` из любых типов полей. [Структура](#storing-dictionaries-in-memory) в этом случае должна быть `complex_key_hashed` или `complex_key_cache`.

:::tip
Составной ключ может состоять из одного элемента. Это позволяет использовать строку в качестве ключа, например.
:::

Структура ключа задается в элементе `<key>`. Поля ключа указываются в том же формате, что и [атрибуты](#dictionary-key-and-fields) словаря. Пример:

```xml
<structure>
    <key>
        <attribute>
            <name>field1</name>
            <type>String</type>
        </attribute>
        <attribute>
            <name>field2</name>
            <type>UInt32</type>
        </attribute>
        ...
    </key>
...
```

или

```sql
CREATE DICTIONARY (
    field1 String,
    field2 UInt32
    ...
)
PRIMARY KEY field1, field2
...
```

Для запроса к функции `dictGet*` в качестве ключа передается кортеж. Пример: `dictGetString('dict_name', 'attr_name', tuple('string for field1', num_for_field2))`.
## Атрибуты {#attributes}

Пример конфигурации:

```xml
<structure>
    ...
    <attribute>
        <name>Name</name>
        <type>ClickHouseDataType</type>
        <null_value></null_value>
        <expression>rand64()</expression>
        <hierarchical>true</hierarchical>
        <injective>true</injective>
        <is_object_id>true</is_object_id>
    </attribute>
</structure>
```

или

```sql
CREATE DICTIONARY somename (
    Name ClickHouseDataType DEFAULT '' EXPRESSION rand64() HIERARCHICAL INJECTIVE IS_OBJECT_ID
)
```

Параметры конфигурации:

| Тег                                                  | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Обязательно |
|------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| `name`                                               | Имя колонки.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Да         |
| `type`                                               | Тип данных ClickHouse: [UInt8](../../sql-reference/data-types/int-uint.md), [UInt16](../../sql-reference/data-types/int-uint.md), [UInt32](../../sql-reference/data-types/int-uint.md), [UInt64](../../sql-reference/data-types/int-uint.md), [Int8](../../sql-reference/data-types/int-uint.md), [Int16](../../sql-reference/data-types/int-uint.md), [Int32](../../sql-reference/data-types/int-uint.md), [Int64](../../sql-reference/data-types/int-uint.md), [Float32](../../sql-reference/data-types/float.md), [Float64](../../sql-reference/data-types/float.md), [UUID](../../sql-reference/data-types/uuid.md), [Decimal32](../../sql-reference/data-types/decimal.md), [Decimal64](../../sql-reference/data-types/decimal.md), [Decimal128](../../sql-reference/data-types/decimal.md), [Decimal256](../../sql-reference/data-types/decimal.md),[Date](../../sql-reference/data-types/date.md), [Date32](../../sql-reference/data-types/date32.md), [DateTime](../../sql-reference/data-types/datetime.md), [DateTime64](../../sql-reference/data-types/datetime64.md), [String](../../sql-reference/data-types/string.md), [Array](../../sql-reference/data-types/array.md).<br/>ClickHouse пытается привести значение из словаря к указанному типу данных. Например, для MySQL поле может быть `TEXT`, `VARCHAR` или `BLOB` в исходной таблице MySQL, но оно может быть загружено как `String` в ClickHouse.<br/>[Nullable](../../sql-reference/data-types/nullable.md) в настоящее время поддерживается для словарей [Flat](#flat), [Hashed](#hashed), [ComplexKeyHashed](#complex_key_hashed), [Direct](#direct), [ComplexKeyDirect](#complex_key_direct), [RangeHashed](#range_hashed), Polygon, [Cache](#cache), [ComplexKeyCache](#complex_key_cache), [SSDCache](#ssd_cache), [SSDComplexKeyCache](#complex_key_ssd_cache). В словарях [IPTrie](#ip_trie) типы `Nullable` не поддерживаются. | Да         |
| `null_value`                                         | Значение по умолчанию для несуществующего элемента.<br/>В примере это пустая строка. Значение [NULL](../syntax.md#null) может использоваться только для типов `Nullable` (см. предыдущую строку с описанием типов).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Да         |
| `expression`                                         | [Выражение](../../sql-reference/syntax.md#expressions), которое ClickHouse выполняет над значением.<br/>Выражение может быть именем колонки в удаленной SQL базе данных. Таким образом, вы можете использовать его для создания алиаса для удаленной колонки.<br/><br/>Значение по умолчанию: без выражения.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Нет        |
| <a name="hierarchical-dict-attr"></a> `hierarchical` | Если `true`, атрибут содержит значение родительского ключа для текущего ключа. См. [Иерархические словари](#hierarchical-dictionaries).<br/><br/>Значение по умолчанию: `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Нет        |
| `injective`                                          | Флаг, который показывает, является ли изображение `id -> attribute` [инъективным](https://en.wikipedia.org/wiki/Injective_function).<br/>Если `true`, ClickHouse может автоматически размещать после оператора `GROUP BY` запросы к словарям с инъекцией. Обычно это значительно снижает количество таких запросов.<br/><br/>Значение по умолчанию: `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Нет        |
| `is_object_id`                                       | Флаг, который показывает, выполняется ли запрос для документа MongoDB по `ObjectID`.<br/><br/>Значение по умолчанию: `false`.
## Иерархические словари {#hierarchical-dictionaries}

ClickHouse поддерживает иерархические словари с [числовым ключом](#numeric-key).

Посмотрите на следующую иерархическую структуру:

```text
0 (Common parent)
│
├── 1 (Russia)
│   │
│   └── 2 (Moscow)
│       │
│       └── 3 (Center)
│
└── 4 (Great Britain)
    │
    └── 5 (London)
```

Эта иерархия может быть выражена в виде следующей таблицы словаря.

| region_id | parent_region | region_name  |
|------------|----------------|---------------|
| 1          | 0              | Россия        |
| 2          | 1              | Москва        |
| 3          | 2              | Центр         |
| 4          | 0              | Великобритания |
| 5          | 4              | Лондон        |

Эта таблица содержит колонку `parent_region`, которая содержит ключ ближайшего родителя для элемента.

ClickHouse поддерживает иерархическое свойство для атрибутов внешних словарей. Это свойство позволяет вам настраивать иерархический словарь аналогично описанному выше.

Функция [dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy) позволяет вам получить цепочку родителей элемента.

Для нашего примера структура словаря может быть следующей:

```xml
<dictionary>
    <structure>
        <id>
            <name>region_id</name>
        </id>

        <attribute>
            <name>parent_region</name>
            <type>UInt64</type>
            <null_value>0</null_value>
            <hierarchical>true</hierarchical>
        </attribute>

        <attribute>
            <name>region_name</name>
            <type>String</type>
            <null_value></null_value>
        </attribute>

    </structure>
</dictionary>
```
## Полигональные словари {#polygon-dictionaries}

Этот словарь оптимизирован для запросов "точка в полигоне", по сути, "обратный геокодинг". Учитывая координаты (широта/долгота), он эффективно находит, какой полигон/регион (из множества полигонов, таких как границы стран или регионов) содержит эту точку. Это хорошо подходит для сопоставления координат местоположений с их содержащим регионом.

<iframe width="1024" height="576" src="https://www.youtube.com/embed/FyRsriQp46E?si=Kf8CXoPKEpGQlC-Y" title="Полигональные Словари в ClickHouse" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Пример конфигурации полигонального словаря:

<CloudDetails />

```xml
<dictionary>
    <structure>
        <key>
            <attribute>
                <name>key</name>
                <type>Array(Array(Array(Array(Float64))))</type>
            </attribute>
        </key>

        <attribute>
            <name>name</name>
            <type>String</type>
            <null_value></null_value>
        </attribute>

        <attribute>
            <name>value</name>
            <type>UInt64</type>
            <null_value>0</null_value>
        </attribute>
    </structure>

    <layout>
        <polygon>
            <store_polygon_key_column>1</store_polygon_key_column>
        </polygon>
    </layout>

    ...
</dictionary>
```

Соответствующий [DDL-запрос](/sql-reference/statements/create/dictionary):
```sql
CREATE DICTIONARY polygon_dict_name (
    key Array(Array(Array(Array(Float64)))),
    name String,
    value UInt64
)
PRIMARY KEY key
LAYOUT(POLYGON(STORE_POLYGON_KEY_COLUMN 1))
...
```

При настройке полигонального словаря ключ должен иметь один из двух типов:

- Простой полигон. Это массив точек.
- MultiPolygon. Это массив многоугольников. Каждый полигон является двумерным массивом точек. Первый элемент этого массива — это внешняя граница полигона, а последующие элементы определяют области, которые должны быть исключены из него.

Точки могут быть указаны как массив или кортеж их координат. В текущей реализации поддерживаются только двумерные точки.

Пользователь может загружать свои данные во всех форматах, поддерживаемых ClickHouse.

Доступно 3 типа [хранения в памяти](#storing-dictionaries-in-memory):

- `POLYGON_SIMPLE`. Это наивная реализация, где для каждого запроса производится линейный проход по всем полигонам, и проверяется принадлежность для каждого без использования дополнительных индексов.

- `POLYGON_INDEX_EACH`. Для каждого полигона создаётся отдельный индекс, который позволяет быстро проверить, принадлежит ли он в большинстве случаев (оптимизирован для географических регионов).
Также на рассматриваемую область накладывается сетка, что значительно сокращает количество рассматриваемых полигонов.
Сетка создаётся рекурсивно, деля ячейку на 16 равных частей, и настраивается с помощью двух параметров.
Деление останавливается, когда глубина рекурсии достигает `MAX_DEPTH`, или когда ячейка пересекает не более чем `MIN_INTERSECTIONS` полигонов.
Чтобы ответить на запрос, есть соответствующая ячейка, и к индексу для полигонов, хранящимся в ней, обращаются последовательно.

- `POLYGON_INDEX_CELL`. Это размещение также создаёт описанную выше сетку. Доступны те же параметры. Для каждой ячейки сетки создаётся индекс на все фрагменты полигонов, которые в неё попадают, что позволяет быстро ответить на запрос.

- `POLYGON`. Синоним `POLYGON_INDEX_CELL`.

Запросы к словарю осуществляются с использованием стандартных [функций](../../sql-reference/functions/ext-dict-functions.md) для работы со словарями.
Важно отметить, что здесь ключами будут точки, для которых вы хотите найти содержащий их полигон.

**Пример**

Пример работы со словарём, определённым выше:

```sql
CREATE TABLE points (
    x Float64,
    y Float64
)
...
SELECT tuple(x, y) AS key, dictGet(dict_name, 'name', key), dictGet(dict_name, 'value', key) FROM points ORDER BY x, y;
```

В результате выполнения последней команды для каждой точки в таблице 'points' будет найден минимальный полигон, содержащий эту точку, и будут выведены запрашиваемые атрибуты.

**Пример**

Вы можете читать колонки из полигональных словарей через SELECT запрос, просто включив `store_polygon_key_column = 1` в конфигурации словаря или соответствующем DDL-запросе.

Запрос:

```sql
CREATE TABLE polygons_test_table
(
    key Array(Array(Array(Tuple(Float64, Float64)))),
    name String
) ENGINE = TinyLog;

INSERT INTO polygons_test_table VALUES ([[[(3, 1), (0, 1), (0, -1), (3, -1)]]], 'Value');

CREATE DICTIONARY polygons_test_dictionary
(
    key Array(Array(Array(Tuple(Float64, Float64)))),
    name String
)
PRIMARY KEY key
SOURCE(CLICKHOUSE(TABLE 'polygons_test_table'))
LAYOUT(POLYGON(STORE_POLYGON_KEY_COLUMN 1))
LIFETIME(0);

SELECT * FROM polygons_test_dictionary;
```

Результат:

```text
┌─key─────────────────────────────┬─name──┐
│ [[[(3,1),(0,1),(0,-1),(3,-1)]]] │ Value │
└─────────────────────────────────┴───────┘
```
## Словарь дерева регулярных выражений {#regexp-tree-dictionary}

Этот словарь позволяет сопоставлять ключи значения на основе иерархических шаблонов регулярных выражений. Он оптимизирован для поиска по шаблонам (например, классификация строк, таких как строки пользовательских агентов, по совпадающим шаблонам regex), а не для точного сопоставления ключей.

<iframe width="1024" height="576" src="https://www.youtube.com/embed/ESlAhUJMoz8?si=sY2OVm-zcuxlDRaX" title="Введение в словари дерева регулярных выражений ClickHouse" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
### Использование словаря дерева регулярных выражений в ClickHouse Open-Source {#use-regular-expression-tree-dictionary-in-clickhouse-open-source}

Словари дерева регулярных выражений определяются в ClickHouse open-source с использованием источника YAMLRegExpTree, для которого предоставляется путь к YAML-файлу, содержащему дерево регулярных выражений.

```sql
CREATE DICTIONARY regexp_dict
(
    regexp String,
    name String,
    version String
)
PRIMARY KEY(regexp)
SOURCE(YAMLRegExpTree(PATH '/var/lib/clickhouse/user_files/regexp_tree.yaml'))
LAYOUT(regexp_tree)
...
```

Источником словаря `YAMLRegExpTree` является структура дерева regexp. Например:

```yaml
- regexp: 'Linux/(\d+[\.\d]*).+tlinux'
  name: 'TencentOS'
  version: '\1'

- regexp: '\d+/tclwebkit(?:\d+[\.\d]*)'
  name: 'Android'
  versions:
    - regexp: '33/tclwebkit'
      version: '13'
    - regexp: '3[12]/tclwebkit'
      version: '12'
    - regexp: '30/tclwebkit'
      version: '11'
    - regexp: '29/tclwebkit'
      version: '10'
```

Эта конфигурация состоит из списка узлов дерева регулярных выражений. Каждый узел имеет следующую структуру:

- **regexp**: регулярное выражение узла.
- **attributes**: список пользовательских атрибутов словаря. В этом примере есть два атрибута: `name` и `version`. Первый узел определяет оба атрибута. Второй узел определяет только атрибут `name`. Атрибут `version` предоставляется дочерними узлами второго узла.
  - Значение атрибута может содержать **обратные ссылки**, ссылающиеся на группы захвата совпавшего регулярного выражения. В примере значение атрибута `version` в первом узле состоит из обратной ссылки `\1` на группу захвата `(\d+[\.\d]*)` в регулярном выражении. Номера обратных ссылок варьируются от 1 до 9 и записываются как `$1` или `\1` (для номера 1). Обратная ссылка заменяется соответствующей группой захвата во время выполнения запроса.
- **дочерние узлы**: список дочерних узлов узла дерева регулярных выражений, каждый из которых имеет свои собственные атрибуты и (возможно) дочерние узлы. Сравнение строк осуществляется в обход в глубину. Если строка соответствует узлу регулярного выражения, словарь проверяет, соответствует ли она также дочерним узлам узла. Если это так, атрибуты наиболее глубокого соответствующего узла назначаются. Атрибуты дочернего узла перезаписывают атрибуты с тем же именем родительских узлов. Имена дочерних узлов в YAML-файлах могут быть произвольными, например, `versions` в приведённом выше примере.

Словари дерева регулярных выражений допускают доступ только с использованием функций `dictGet`, `dictGetOrDefault` и `dictGetAll`.

Пример:

```sql
SELECT dictGet('regexp_dict', ('name', 'version'), '31/tclwebkit1024');
```

Результат:

```text
┌─dictGet('regexp_dict', ('name', 'version'), '31/tclwebkit1024')─┐
│ ('Android','12')                                                │
└─────────────────────────────────────────────────────────────────┘
```

В этом случае мы сначала совпадаем с регулярным выражением `\d+/tclwebkit(?:\d+[\.\d]*)` во втором узле верхнего уровня. Затем словарь продолжает искать среди дочерних узлов и находит, что строка также совпадает с `3[12]/tclwebkit`. В результате значение атрибута `name` равно `Android` (определено в первом уровне), а значение атрибута `version` равно `12` (определено дочерним узлом).

С помощью мощного конфигурационного файла YAML мы можем использовать словари дерева регулярных выражений как парсер строк пользовательских агентов. Мы поддерживаем [uap-core](https://github.com/ua-parser/uap-core) и демонстрируем, как использовать его в функциональном тесте [02504_regexp_dictionary_ua_parser](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/02504_regexp_dictionary_ua_parser.sh)
#### Сбор значений атрибутов {#collecting-attribute-values}

Иногда полезно возвращать значения из нескольких регулярных выражений, которые совпали, а не только значение листового узла. В этих случаях можно использовать специализированную функцию [`dictGetAll`](../../sql-reference/functions/ext-dict-functions.md#dictgetall). Если у узла есть значение атрибута типа `T`, `dictGetAll` вернёт `Array(T)` содержащий ноль или более значений.

По умолчанию количество совпадений, возвращаемых для каждого ключа, не ограничено. Ограничение может быть передано в качестве необязательного четвёртого аргумента к `dictGetAll`. Массив заполняется в _топологическом порядке_, что означает, что дочерние узлы идут до родительских узлов, а узлы-соседи следуют порядку в источнике.

Пример:

```sql
CREATE DICTIONARY regexp_dict
(
    regexp String,
    tag String,
    topological_index Int64,
    captured Nullable(String),
    parent String
)
PRIMARY KEY(regexp)
SOURCE(YAMLRegExpTree(PATH '/var/lib/clickhouse/user_files/regexp_tree.yaml'))
LAYOUT(regexp_tree)
LIFETIME(0)
```

```yaml

# /var/lib/clickhouse/user_files/regexp_tree.yaml
- regexp: 'clickhouse\.com'
  tag: 'ClickHouse'
  topological_index: 1
  paths:
    - regexp: 'clickhouse\.com/docs(.*)'
      tag: 'ClickHouse Documentation'
      topological_index: 0
      captured: '\1'
      parent: 'ClickHouse'

- regexp: '/docs(/|$)'
  tag: 'Documentation'
  topological_index: 2

- regexp: 'github.com'
  tag: 'GitHub'
  topological_index: 3
  captured: 'NULL'
```

```sql
CREATE TABLE urls (url String) ENGINE=MergeTree ORDER BY url;
INSERT INTO urls VALUES ('clickhouse.com'), ('clickhouse.com/docs/en'), ('github.com/clickhouse/tree/master/docs');
SELECT url, dictGetAll('regexp_dict', ('tag', 'topological_index', 'captured', 'parent'), url, 2) FROM urls;
```

Результат:

```text
┌─url────────────────────────────────────┬─dictGetAll('regexp_dict', ('tag', 'topological_index', 'captured', 'parent'), url, 2)─┐
│ clickhouse.com                         │ (['ClickHouse'],[1],[],[])                                                            │
│ clickhouse.com/docs/en                 │ (['ClickHouse Documentation','ClickHouse'],[0,1],['/en'],['ClickHouse'])              │
│ github.com/clickhouse/tree/master/docs │ (['Documentation','GitHub'],[2,3],[NULL],[])                                          │
└────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────┘
```
#### Режимы совпадения {#matching-modes}

Поведение совпадения по шаблону можно изменить с помощью определённых настроек словаря:
- `regexp_dict_flag_case_insensitive`: Использовать нечувствительное к регистру совпадение (по умолчанию `false`). Может быть переопределено в отдельных выражениях с `(?i)` и `(?-i)`.
- `regexp_dict_flag_dotall`: Позволить '.' соответствовать символам новой строки (по умолчанию `false`).
### Использование словаря дерева регулярных выражений в ClickHouse Cloud {#use-regular-expression-tree-dictionary-in-clickhouse-cloud}

Выше использованный источник `YAMLRegExpTree` работает в ClickHouse Open Source, но не в ClickHouse Cloud. Чтобы использовать словари дерева регулярных выражений в ClickHouse Cloud, сначала создайте словарь дерева регулярных выражений из YAML-файла локально в ClickHouse Open Source, затем экспортируйте этот словарь в CSV-файл, используя функцию таблицы `dictionary` и оператор [INTO OUTFILE](../statements/select/into-outfile.md).

```sql
SELECT * FROM dictionary(regexp_dict) INTO OUTFILE('regexp_dict.csv')
```

Содержимое CSV-файла:

```text
1,0,"Linux/(\d+[\.\d]*).+tlinux","['version','name']","['\\1','TencentOS']"
2,0,"(\d+)/tclwebkit(\d+[\.\d]*)","['comment','version','name']","['test $1 and $2','$1','Android']"
3,2,"33/tclwebkit","['version']","['13']"
4,2,"3[12]/tclwebkit","['version']","['12']"
5,2,"3[12]/tclwebkit","['version']","['11']"
6,2,"3[12]/tclwebkit","['version']","['10']"
```

Схема экспортированного файла:

- `id UInt64`: id узла дерева RegexpTree.
- `parent_id UInt64`: id родительского узла.
- `regexp String`: строка регулярного выражения.
- `keys Array(String)`: имена пользовательских атрибутов.
- `values Array(String)`: значения пользовательских атрибутов.

Чтобы создать словарь в ClickHouse Cloud, сначала создайте таблицу `regexp_dictionary_source_table` со следующей структурой:

```sql
CREATE TABLE regexp_dictionary_source_table
(
    id UInt64,
    parent_id UInt64,
    regexp String,
    keys   Array(String),
    values Array(String)
) ENGINE=Memory;
```

Затем обновите локальный CSV следующим образом:

```bash
clickhouse client \
    --host MY_HOST \
    --secure \
    --password MY_PASSWORD \
    --query "
    INSERT INTO regexp_dictionary_source_table
    SELECT * FROM input ('id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
    FORMAT CSV" < regexp_dict.csv
```

Вы можете узнать, как [вставить локальные файлы](/integrations/data-ingestion/insert-local-files) для получения подробной информации. После инициализации исходной таблицы мы можем создать RegexpTree из источника таблицы:

```sql
CREATE DICTIONARY regexp_dict
(
    regexp String,
    name String,
    version String
PRIMARY KEY(regexp)
SOURCE(CLICKHOUSE(TABLE 'regexp_dictionary_source_table'))
LIFETIME(0)
LAYOUT(regexp_tree);
```
## Встраиваемые словари {#embedded-dictionaries}

<SelfManaged />

ClickHouse содержит встроенную функцию для работы с геобазой.

Это позволяет вам:

- Использовать ID региона для получения его названия на нужном языке.
- Использовать ID региона для получения ID города, области, федерального округа, страны или континента.
- Проверять, является ли регион частью другого региона.
- Получать цепочку родительских регионов.

Все функции поддерживают "транслокальность", возможность одновременно использовать различные перспективы собственности на регион. Для получения дополнительной информации смотрите раздел "Функции для работы с веб-аналитическими словарями".

Внутренние словари отключены в стандартном пакете.
Чтобы включить их, раскомментируйте параметры `path_to_regions_hierarchy_file` и `path_to_regions_names_files` в файле конфигурации сервера.

Геобаза загружается из текстовых файлов.

Поместите файлы `regions_hierarchy*.txt` в директорию `path_to_regions_hierarchy_file`. Этот параметр конфигурации должен содержать путь к файлу `regions_hierarchy.txt` (стандартная региональная иерархия), а остальные файлы (`regions_hierarchy_ua.txt`) должны находиться в той же директории.

Поместите файлы `regions_names_*.txt` в директорию `path_to_regions_names_files`.

Вы также можете создать эти файлы самостоятельно. Формат файла следующий:

`regions_hierarchy*.txt`: Разделенные табуляцией (без заголовка), колонки:

- ID региона (`UInt32`)
- ID родительского региона (`UInt32`)
- тип региона (`UInt8`): 1 - континент, 3 - страна, 4 - федеральный округ, 5 - регион, 6 - город; другие типы не имеют значений
- население (`UInt32`) — необязательная колонка

`regions_names_*.txt`: Разделенные табуляцией (без заголовка), колонки:

- ID региона (`UInt32`)
- название региона (`String`) — Не может содержать табуляции или символы новой строки, даже экранированные.

Для хранения в оперативной памяти используется плоский массив. По этой причине ID не должны превышать миллиона.

Словари могут обновляться без перезагрузки сервера. Однако набор доступных словарей не обновляется.
Для обновлений проверяются времена модификации файлов. Если файл был изменён, словарь обновляется.
Интервал проверки изменений настраивается в параметре `builtin_dictionaries_reload_interval`.
Обновления словарей (кроме загрузки при первом использовании) не блокируют запросы. Во время обновлений запросы используют старые версии словарей. Если во время обновления возникает ошибка, сообщение об ошибке записывается в журнал сервера, и запросы продолжают использовать старую версию словарей.

Мы рекомендуем периодически обновлять словари с геобазой. Во время обновления создавайте новые файлы и сохраняйте их в отдельном месте. Когда всё будет готово, переименуйте их в файлы, используемые сервером.

Существуют также функции для работы с идентификаторами ОС и поисковыми системами, но их не следует использовать.