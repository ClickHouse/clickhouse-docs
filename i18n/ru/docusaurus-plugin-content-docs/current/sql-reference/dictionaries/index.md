---
description: 'Обзор функциональности внешних словарей в ClickHouse'
sidebar_label: 'Определение словарей'
sidebar_position: 35
slug: /sql-reference/dictionaries
title: 'Словари'
doc_type: 'reference'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';
import CloudDetails from '@site/docs/sql-reference/dictionaries/_snippet_dictionary_in_cloud.md';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Словари

Словарь — это отображение (`key -> attributes`), удобное для различных типов справочников.

ClickHouse поддерживает специальные функции для работы со словарями, которые могут использоваться в запросах. Использовать словари с функциями проще и эффективнее, чем выполнять `JOIN` со справочными таблицами.

ClickHouse поддерживает:

- Словари с [набором функций](../../sql-reference/functions/ext-dict-functions.md).
- [Встроенные словари](#embedded-dictionaries) с определённым [набором функций](../../sql-reference/functions/embedded-dict-functions.md).

:::tip Tutorial
Если вы только начинаете работать со словарями в ClickHouse, у нас есть учебное руководство, посвящённое этой теме. Ознакомьтесь с ним [здесь](tutorial.md).
:::

Вы можете добавлять собственные словари из различных источников данных. Источником для словаря может быть таблица в ClickHouse, локальный текстовый или исполняемый файл, ресурс HTTP(S) или другая СУБД. Для получения дополнительной информации смотрите раздел «[Источники словарей](#dictionary-sources)».

ClickHouse:

- Полностью или частично хранит словари в оперативной памяти.
- Периодически обновляет словари и динамически загружает отсутствующие значения. Другими словами, словари могут загружаться динамически.
- Позволяет создавать словари с помощью XML-файлов или [DDL-запросов](../../sql-reference/statements/create/dictionary.md).

Конфигурация словарей может находиться в одном или нескольких XML-файлах. Путь к конфигурации задаётся параметром [dictionaries_config](../../operations/server-configuration-parameters/settings.md#dictionaries_config).

Словари могут загружаться при запуске сервера или при первом использовании в зависимости от настройки [dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load).

Системная таблица [dictionaries](/operations/system-tables/dictionaries) содержит информацию о словарях, настроенных на сервере. Для каждого словаря там можно найти:

- Состояние словаря.
- Конфигурационные параметры.
- Метрики, такие как объём оперативной памяти, выделенный для словаря, или количество запросов с момента успешной загрузки словаря.

<CloudDetails />



## Создание словаря с помощью DDL-запроса {#creating-a-dictionary-with-a-ddl-query}

Словари можно создавать с помощью [DDL-запросов](../../sql-reference/statements/create/dictionary.md), и это рекомендуемый метод, поскольку словари, созданные через DDL:

- Не требуют добавления дополнительных записей в конфигурационные файлы сервера.
- Могут использоваться как полноценные объекты, аналогично таблицам или представлениям.
- Позволяют читать данные напрямую с помощью привычного оператора SELECT вместо табличных функций для словарей. Обратите внимание, что при прямом обращении к словарю через SELECT кешируемый словарь вернёт только кешированные данные, тогда как некешируемый словарь вернёт все хранящиеся в нём данные.
- Можно легко переименовывать.


## Создание словаря с помощью конфигурационного файла {#creating-a-dictionary-with-a-configuration-file}

<CloudNotSupportedBadge />

:::note
Создание словаря с помощью конфигурационного файла недоступно в ClickHouse Cloud. Используйте DDL (см. выше) и создавайте словарь от имени пользователя `default`.
:::

Конфигурационный файл словаря имеет следующий формат:

```xml
<clickhouse>
    <comment>Необязательный элемент с произвольным содержимым. Игнорируется сервером ClickHouse.</comment>

    <!--Необязательный элемент. Имя файла с подстановками-->
    <include_from>/etc/metrika.xml</include_from>


    <dictionary>
        <!-- Конфигурация словаря. -->
        <!-- В конфигурационном файле может быть любое количество секций словарей. -->
    </dictionary>

</clickhouse>
```

В одном файле можно [настроить](#configuring-a-dictionary) любое количество словарей.

:::note
Для небольшого словаря можно преобразовать значения, описав его в запросе `SELECT` (см. функцию [transform](../../sql-reference/functions/other-functions.md)). Эта функциональность не связана со словарями.
:::


## Настройка словаря {#configuring-a-dictionary}

<CloudDetails />

Если словарь настраивается с помощью XML-файла, то конфигурация словаря имеет следующую структуру:

```xml
<dictionary>
    <name>dict_name</name>

    <structure>
      <!-- Конфигурация составного ключа -->
    </structure>

    <source>
      <!-- Конфигурация источника -->
    </source>

    <layout>
      <!-- Конфигурация размещения в памяти -->
    </layout>

    <lifetime>
      <!-- Время жизни словаря в памяти -->
    </lifetime>
</dictionary>
```

Соответствующий [DDL-запрос](../../sql-reference/statements/create/dictionary.md) имеет следующую структуру:

```sql
CREATE DICTIONARY dict_name
(
    ... -- атрибуты
)
PRIMARY KEY ... -- конфигурация составного или одиночного ключа
SOURCE(...) -- Конфигурация источника
LAYOUT(...) -- Конфигурация размещения в памяти
LIFETIME(...) -- Время жизни словаря в памяти
```


## Хранение словарей в памяти {#storing-dictionaries-in-memory}

Существует несколько способов хранения словарей в памяти.

Рекомендуется использовать [flat](#flat), [hashed](#hashed) и [complex_key_hashed](#complex_key_hashed), которые обеспечивают оптимальную скорость обработки.

Кэширование не рекомендуется из-за потенциально низкой производительности и сложностей при выборе оптимальных параметров. Подробнее читайте в разделе [cache](#cache).

Существует несколько способов повышения производительности словарей:

- Вызывайте функцию для работы со словарём после `GROUP BY`.
- Отмечайте извлекаемые атрибуты как инъективные. Атрибут называется инъективным, если различным ключам соответствуют различные значения атрибута. Таким образом, когда `GROUP BY` использует функцию, которая получает значение атрибута по ключу, эта функция автоматически выносится из `GROUP BY`.

ClickHouse генерирует исключение при ошибках со словарями. Примеры ошибок:

- Словарь, к которому осуществляется обращение, не может быть загружен.
- Ошибка при запросе к словарю типа `cached`.

Список словарей и их статусы можно просмотреть в таблице [system.dictionaries](../../operations/system-tables/dictionaries.md).

<CloudDetails />

Конфигурация выглядит следующим образом:

```xml
<clickhouse>
    <dictionary>
        ...
        <layout>
            <layout_type>
                <!-- настройки размещения -->
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
LAYOUT(LAYOUT_TYPE(param value)) -- настройки размещения
...
```

Словари без слова `complex-key*` в типе размещения имеют ключ типа [UInt64](../../sql-reference/data-types/int-uint.md), словари `complex-key*` имеют составной ключ (сложный, с произвольными типами).

Ключи типа [UInt64](../../sql-reference/data-types/int-uint.md) в XML-словарях определяются тегом `<id>`.

Пример конфигурации (столбец key_column имеет тип UInt64):

```xml
...
<structure>
    <id>
        <name>key_column</name>
    </id>
...
```

Составные ключи `complex` в XML-словарях определяются тегом `<key>`.

Пример конфигурации составного ключа (ключ имеет один элемент типа [String](../../sql-reference/data-types/string.md)):

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

Различные методы хранения данных словарей в памяти связаны с компромиссами между использованием процессора и оперативной памяти. Дерево решений, опубликованное в разделе [Choosing a Layout](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout) [статьи блога](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse) о словарях, является хорошей отправной точкой для выбора подходящего типа размещения.

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

Словарь полностью хранится в памяти в виде плоских массивов. Сколько памяти использует словарь? Объём пропорционален размеру наибольшего ключа (в используемом пространстве).

Ключ словаря имеет тип [UInt64](../../sql-reference/data-types/int-uint.md), а значение ограничено параметром `max_array_size` (по умолчанию — 500 000). Если при создании словаря обнаруживается больший ключ, ClickHouse выбрасывает исключение и не создаёт словарь. Начальный размер плоских массивов словаря управляется настройкой `initial_array_size` (по умолчанию — 1024).

Поддерживаются все типы источников. При обновлении данные (из файла или из таблицы) читаются полностью.

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

Словарь полностью хранится в памяти в виде хеш-таблицы. Словарь может содержать любое количество элементов с любыми идентификаторами. На практике количество ключей может достигать десятков миллионов элементов.

Ключ словаря имеет тип [UInt64](../../sql-reference/data-types/int-uint.md).

Поддерживаются все типы источников. При обновлении данные (из файла или из таблицы) читаются полностью.

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
    <!-- Если количество шардов больше 1 (по умолчанию `1`), словарь будет загружать
         данные параллельно, что полезно при наличии огромного количества элементов в одном
         словаре. -->
    <shards>10</shards>

    <!-- Размер очереди блоков в параллельной очереди.

         Поскольку узким местом при параллельной загрузке является рехеширование, и чтобы избежать
         остановок из-за того, что поток выполняет рехеширование, необходимо иметь некоторый
         запас.

         10000 — хороший баланс между памятью и скоростью.
         Даже для 10e10 элементов может обработать всю нагрузку без простоев. -->
    <shard_load_queue_backlog>10000</shard_load_queue_backlog>

    <!-- Максимальный коэффициент заполнения хеш-таблицы. При больших значениях память
         используется более эффективно (меньше памяти тратится впустую), но производительность
         чтения может ухудшиться.

         Допустимые значения: [0.5, 0.99]
         По умолчанию: 0.5 -->
    <max_load_factor>0.5</max_load_factor>
  </hashed>
</layout>
```

или

```sql
LAYOUT(HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

### sparse_hashed {#sparse_hashed}

Аналогичен `hashed`, но использует меньше памяти за счёт большего использования процессора.

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

Для этого типа словаря также можно использовать `shards`, причём для `sparse_hashed` это важнее, чем для `hashed`, так как `sparse_hashed` работает медленнее.

### complex_key_hashed {#complex_key_hashed}

Этот тип хранения используется с составными [ключами](#dictionary-key-and-fields). Аналогичен `hashed`.

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

Этот тип хранения используется с составными [ключами](#dictionary-key-and-fields). Аналогичен [sparse_hashed](#sparse_hashed).

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

Словарь полностью хранится в памяти. Каждый атрибут хранится в массиве. Ключевой атрибут хранится в виде хеш-таблицы, где значение является индексом в массиве атрибутов. Словарь может содержать любое количество элементов с любыми идентификаторами. На практике количество ключей может достигать десятков миллионов элементов.

Ключ словаря имеет тип [UInt64](../../sql-reference/data-types/int-uint.md).

Поддерживаются все типы источников. При обновлении данные (из файла или таблицы) читаются полностью.

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

Этот тип хранения используется с составными [ключами](#dictionary-key-and-fields). Аналогичен [hashed_array](#hashed_array).

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

Словарь хранится в памяти в виде хеш-таблицы с упорядоченным массивом диапазонов и соответствующих им значений.

Ключ словаря имеет тип [UInt64](../../sql-reference/data-types/int-uint.md).
Этот метод хранения работает так же, как hashed, и позволяет использовать диапазоны дат/времени (произвольного числового типа) в дополнение к ключу.

Пример: таблица содержит скидки для каждого рекламодателя в формате:

```text
┌─advertiser_id─┬─discount_start_date─┬─discount_end_date─┬─amount─┐
│           123 │          2015-01-16 │        2015-01-31 │   0.25 │
│           123 │          2015-01-01 │        2015-01-15 │   0.15 │
│           456 │          2015-01-01 │        2015-01-15 │   0.05 │
└───────────────┴─────────────────────┴───────────────────┴────────┘
```


Чтобы использовать выборку для диапазонов дат, определите элементы `range_min` и `range_max` в [structure](#dictionary-key-and-fields). Эти элементы должны содержать поля `name` и `type` (если `type` не указан, будет использован тип по умолчанию — Date). `type` может быть любым числовым типом (Date / DateTime / UInt64 / Int32 / другие).

:::note
Значения `range_min` и `range_max` должны укладываться в диапазон типа `Int64`.
:::

Пример:

```xml
<layout>
    <range_hashed>
        <!-- Стратегия для перекрывающихся диапазонов (min/max). По умолчанию: min (возвращает подходящий диапазон с минимальным значением (range_min -> range_max)) -->
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

Чтобы работать с этими словарями, необходимо передать дополнительный аргумент в функцию `dictGet`, для которого задаётся диапазон:

```sql
dictGet('dict_name', 'attr_name', id, date)
```

Пример запроса:

```sql
SELECT dictGet('discounts_dict', 'amount', 1, '2022-10-20'::Date);
```

Эта функция возвращает значение для указанных `id` в диапазоне дат, который включает переданную дату.

Подробности алгоритма:

* Если `id` не найден или для `id` не найден диапазон, возвращается значение по умолчанию для типа атрибута.
* Если есть пересекающиеся диапазоны и `range_lookup_strategy=min`, возвращается подходящий диапазон с минимальным `range_min`; если найдено несколько таких диапазонов, возвращается диапазон с минимальным `range_max`; если снова найдено несколько диапазонов (несколько диапазонов имеют одинаковые `range_min` и `range_max`), возвращается случайный диапазон из них.
* Если есть пересекающиеся диапазоны и `range_lookup_strategy=max`, возвращается подходящий диапазон с максимальным `range_min`; если найдено несколько таких диапазонов, возвращается диапазон с максимальным `range_max`; если снова найдено несколько диапазонов (несколько диапазонов имеют одинаковые `range_min` и `range_max`), возвращается случайный диапазон из них.
* Если `range_max` равен `NULL`, диапазон считается открытым. `NULL` рассматривается как максимально возможное значение. Для `range_min` в качестве открытого значения могут использоваться `1970-01-01` или `0` (-MAX&#95;INT).

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

Пример конфигурации с перекрывающимися и открытыми диапазонами:

```sql
CREATE TABLE discounts
(
    advertiser_id UInt64,
    discount_start_date Date,
    discount_end_date Nullable(Date),
    amount Float64
)
ENGINE = Memory;
```


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
│ 0.1 │ -- подходит только один диапазон: 2015-01-01 - Null
└─────┘

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-16')) res;
┌─res─┐
│ 0.2 │ -- подходят два диапазона, range_min 2015-01-15 (0.2) больше, чем 2015-01-01 (0.1)
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.4 │ -- подходят два диапазона, range_min 2015-01-04 (0.4) больше, чем 2015-01-01 (0.3)
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.5 │ -- подходят два диапазона, значения range_min равны, 2015-01-15 (0.5) больше, чем 2015-01-10 (0.6)
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
│ 0.1 │ -- подходит только один диапазон: 2015-01-01 - Null
└─────┘



select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-16')) res;
┌─res─┐
│ 0.1 │ -- совпадают два диапазона, range_min 2015-01-01 (0.1) меньше, чем 2015-01-15 (0.2)
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.3 │ -- совпадают два диапазона, range_min 2015-01-01 (0.3) меньше, чем 2015-01-04 (0.4)
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.6 │ -- совпадают два диапазона, range_min равны, 2015-01-10 (0.6) меньше, чем 2015-01-15 (0.5)
└─────┘

````

### complex_key_range_hashed {#complex_key_range_hashed}

Словарь хранится в памяти в виде хеш-таблицы с упорядоченным массивом диапазонов и соответствующих им значений (см. [range_hashed](#range_hashed)). Этот тип хранения предназначен для использования с составными [ключами](#dictionary-key-and-fields).

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
````

### cache {#cache}

Словарь хранится в кеше с фиксированным количеством ячеек. Эти ячейки содержат часто используемые элементы.

Ключ словаря имеет тип [UInt64](../../sql-reference/data-types/int-uint.md).

При поиске в словаре сначала выполняется поиск в кеше. Для каждого блока данных все ключи, которые не найдены в кеше или устарели, запрашиваются из источника с помощью `SELECT attrs... FROM db.table WHERE id IN (k1, k2, ...)`. Полученные данные затем записываются в кеш.

Если ключи не найдены в словаре, создается задача обновления кеша и добавляется в очередь обновлений. Свойствами очереди обновлений можно управлять с помощью настроек `max_update_queue_size`, `update_queue_push_timeout_milliseconds`, `query_wait_timeout_milliseconds`, `max_threads_for_updates`.

Для кеш-словарей можно задать [время жизни](#refreshing-dictionary-data-using-lifetime) данных в кеше. Если с момента загрузки данных в ячейку прошло больше времени, чем `lifetime`, значение ячейки не используется, и ключ становится устаревшим. Ключ запрашивается повторно при следующем обращении к нему. Это поведение можно настроить с помощью параметра `allow_read_expired_keys`.

Это наименее эффективный из всех способов хранения словарей. Скорость работы кеша сильно зависит от правильных настроек и сценария использования. Словарь типа cache работает хорошо только при достаточно высоком проценте попаданий (рекомендуется 99% и выше). Средний процент попаданий можно посмотреть в таблице [system.dictionaries](../../operations/system-tables/dictionaries.md).

Если параметр `allow_read_expired_keys` установлен в 1 (по умолчанию 0), словарь может поддерживать асинхронные обновления. Если клиент запрашивает ключи, и все они находятся в кеше, но некоторые из них устарели, словарь вернет устаревшие ключи клиенту и асинхронно запросит их из источника.

Для улучшения производительности кеша используйте подзапрос с `LIMIT` и вызывайте функцию со словарем извне.

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

or

```sql
LAYOUT(CACHE(SIZE_IN_CELLS 1000000000))
```

Установите достаточно большой размер кэша. Количество ячеек необходимо подобрать экспериментально:

1.  Установите некоторое значение.
2.  Выполняйте запросы до полного заполнения кэша.
3.  Оцените потребление памяти с помощью таблицы `system.dictionaries`.
4.  Увеличивайте или уменьшайте количество ячеек до достижения требуемого потребления памяти.

:::note
Не используйте ClickHouse в качестве источника, так как он медленно обрабатывает запросы со случайным чтением.
:::

### complex_key_cache {#complex_key_cache}

Этот тип хранения предназначен для использования с составными [ключами](#dictionary-key-and-fields). Аналогичен `cache`.

### ssd_cache {#ssd_cache}

Аналогичен `cache`, но хранит данные на SSD, а индекс — в оперативной памяти. Все настройки кэш-словаря, связанные с очередью обновлений, также применимы к SSD-кэш словарям.

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

or

```sql
LAYOUT(SSD_CACHE(BLOCK_SIZE 4096 FILE_SIZE 16777216 READ_BUFFER_SIZE 1048576
    PATH '/var/lib/clickhouse/user_files/test_dict'))
```

### complex_key_ssd_cache {#complex_key_ssd_cache}

Этот тип хранения предназначен для использования с составными [ключами](#dictionary-key-and-fields). Аналогичен `ssd_cache`.

### direct {#direct}

Словарь не хранится в памяти и обращается непосредственно к источнику во время обработки запроса.

Ключ словаря имеет тип [UInt64](../../sql-reference/data-types/int-uint.md).

Поддерживаются все типы [источников](#dictionary-sources), кроме локальных файлов.

Пример конфигурации:

```xml
<layout>
  <direct />
</layout>
```

or

```sql
LAYOUT(DIRECT())
```

### complex_key_direct {#complex_key_direct}

Этот тип хранения предназначен для использования с составными [ключами](#dictionary-key-and-fields). Аналогичен `direct`.

### ip_trie {#ip_trie}

Этот словарь предназначен для поиска IP-адресов по сетевому префиксу. Он хранит диапазоны IP в нотации CIDR и позволяет быстро определить, в какой префикс (например, подсеть или диапазон ASN) попадает заданный IP-адрес, что делает его идеальным для поиска на основе IP, например, для геолокации или классификации сетей.

<iframe
  width='1024'
  height='576'
  src='https://www.youtube.com/embed/4dxMAqltygk?si=rrQrneBReK6lLfza'
  title='Поиск на основе IP с использованием словаря ip_trie'
  frameborder='0'
  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
  referrerpolicy='strict-origin-when-cross-origin'
  allowfullscreen
></iframe>

**Пример**

Предположим, у нас есть таблица в ClickHouse, содержащая IP-префиксы и соответствия:

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

Определим словарь `ip_trie` для этой таблицы. Тип структуры словаря `ip_trie` требует составного ключа:

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
        <!-- Ключевой атрибут `prefix` можно получить с помощью dictGetString. -->
        <!-- Эта опция увеличивает потребление памяти. -->
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

Ключ должен иметь только один атрибут типа `String`, который содержит разрешённый IP-префикс. Другие типы пока не поддерживаются.

Синтаксис следующий:

```sql
dictGetT('dict_name', 'attr_name', ip)
```

Функция принимает в качестве аргумента либо `UInt32` для IPv4, либо `FixedString(16)` для IPv6. Например:

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

Другие типы пока не поддерживаются. Функция возвращает атрибут для префикса, соответствующего этому IP-адресу. Если есть перекрывающиеся префиксы, возвращается наиболее специфичный.

Данные должны полностью умещаться в оперативной памяти.


## Обновление данных словаря с помощью LIFETIME {#refreshing-dictionary-data-using-lifetime}

ClickHouse периодически обновляет словари на основе параметра `LIFETIME` (задается в секундах). `LIFETIME` — это интервал обновления для полностью загруженных словарей и интервал инвалидации для кэшированных словарей.

Во время обновления старая версия словаря остается доступной для запросов. Обновления словаря (за исключением первоначальной загрузки) не блокируют запросы. Если во время обновления возникает ошибка, она записывается в журнал сервера, и запросы продолжают использовать старую версию словаря. При успешном обновлении словаря старая версия заменяется атомарно.

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

Установка `<lifetime>0</lifetime>` (`LIFETIME(0)`) отключает обновление словарей.

Можно задать временной интервал для обновлений, и ClickHouse выберет случайное время в пределах этого диапазона. Это необходимо для распределения нагрузки на источник словаря при обновлении на большом количестве серверов.

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

Если `<min>0</min>` и `<max>0</max>`, ClickHouse не перезагружает словарь по таймауту.
В этом случае ClickHouse может перезагрузить словарь раньше, если был изменен файл конфигурации словаря или выполнена команда `SYSTEM RELOAD DICTIONARY`.

При обновлении словарей сервер ClickHouse применяет различную логику в зависимости от типа [источника](#dictionary-sources):

- Для текстового файла проверяется время модификации. Если время отличается от ранее зафиксированного, словарь обновляется.
- Словари из других источников по умолчанию обновляются каждый раз.

Для других источников (ODBC, PostgreSQL, ClickHouse и т. д.) можно настроить запрос, который будет обновлять словари только при их фактическом изменении, а не каждый раз. Для этого выполните следующие действия:

- Таблица словаря должна содержать поле, которое всегда изменяется при обновлении исходных данных.
- В настройках источника необходимо указать запрос, который извлекает изменяющееся поле. Сервер ClickHouse интерпретирует результат запроса как строку, и если эта строка изменилась по сравнению с предыдущим состоянием, словарь обновляется. Укажите запрос в поле `<invalidate_query>` в настройках [источника](#dictionary-sources).

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

Для словарей `Flat`, `Hashed`, `HashedArray`, `ComplexKeyHashed` также возможно запрашивать только данные, которые были изменены после предыдущего обновления. Если `update_field` указан в конфигурации источника словаря, значение времени предыдущего обновления в секундах будет добавлено к запросу данных. В зависимости от типа источника (Executable, HTTP, MySQL, PostgreSQL, ClickHouse или ODBC) к `update_field` будет применена различная логика перед запросом данных из внешнего источника.


* Если источником является HTTP, то `update_field` будет добавлен как параметр запроса, значение которого — время последнего обновления.
* Если источником является Executable, то `update_field` будет добавлен как аргумент исполняемого скрипта, значение которого — время последнего обновления.
* Если источником является ClickHouse, MySQL, PostgreSQL или ODBC, к запросу будет добавлено дополнительное условие в `WHERE`, в котором `update_field` сравнивается с временем последнего обновления с помощью оператора `>=`.
  * По умолчанию это условие в `WHERE` добавляется на самом верхнем уровне SQL-запроса. При необходимости условие можно проверять в любом другом выражении `WHERE` внутри запроса с использованием ключевого слова `{condition}`. Пример:
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

Если опция `update_field` установлена, можно задать дополнительную опцию `update_lag`. Значение опции `update_lag` вычитается из времени предыдущего обновления перед запросом обновлённых данных.

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

Словарь может быть подключен к ClickHouse из множества различных источников.

Если словарь настраивается с помощью xml-файла, конфигурация выглядит следующим образом:

```xml
<clickhouse>
  <dictionary>
    ...
    <source>
      <source_type>
        <!-- Конфигурация источника -->
      </source_type>
    </source>
    ...
  </dictionary>
  ...
</clickhouse>
```

В случае [DDL-запроса](../../sql-reference/statements/create/dictionary.md) конфигурация, описанная выше, будет выглядеть следующим образом:

```sql
CREATE DICTIONARY dict_name (...)
...
SOURCE(SOURCE_TYPE(param1 val1 ... paramN valN)) -- Конфигурация источника
...
```

Источник настраивается в секции `source`.

Для типов источников [Локальный файл](#local-file), [Исполняемый файл](#executable-file), [HTTP(s)](#https), [ClickHouse](#clickhouse)
доступны дополнительные настройки:

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
- [Пул исполняемых файлов](#executable-pool)
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

Поля настроек:

- `path` – Абсолютный путь к файлу.
- `format` – Формат файла. Поддерживаются все форматы, описанные в разделе [Форматы](/sql-reference/formats).

При создании словаря с источником `FILE` с помощью DDL-команды (`CREATE DICTIONARY ...`) исходный файл должен находиться в директории `user_files`, чтобы предотвратить доступ пользователей базы данных к произвольным файлам на узле ClickHouse.

**См. также**

- [Функция dictionary](/sql-reference/table-functions/dictionary)

### Исполняемый файл {#executable-file}

Работа с исполняемыми файлами зависит от [способа хранения словаря в памяти](#storing-dictionaries-in-memory). Если словарь хранится с использованием `cache` и `complex_key_cache`, ClickHouse запрашивает необходимые ключи, отправляя запрос в STDIN исполняемого файла. В противном случае ClickHouse запускает исполняемый файл и обрабатывает его вывод как данные словаря.

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

Поля настроек:


- `command` — Абсолютный путь к исполняемому файлу или имя файла (если каталог команды находится в `PATH`).
- `format` — Формат файла. Поддерживаются все форматы, описанные в разделе [Форматы](/sql-reference/formats).
- `command_termination_timeout` — Исполняемый скрипт должен содержать основной цикл чтения-записи. После уничтожения словаря канал закрывается, и исполняемому файлу предоставляется `command_termination_timeout` секунд для завершения работы, прежде чем ClickHouse отправит сигнал SIGTERM дочернему процессу. Параметр `command_termination_timeout` указывается в секундах. Значение по умолчанию — 10. Необязательный параметр.
- `command_read_timeout` — Таймаут чтения данных из stdout команды в миллисекундах. Значение по умолчанию — 10000. Необязательный параметр.
- `command_write_timeout` — Таймаут записи данных в stdin команды в миллисекундах. Значение по умолчанию — 10000. Необязательный параметр.
- `implicit_key` — Исполняемый файл-источник может возвращать только значения, а соответствие запрошенным ключам определяется неявно — по порядку строк в результате. Значение по умолчанию — false.
- `execute_direct` — Если `execute_direct` = `1`, то `command` будет искаться в папке user_scripts, указанной параметром [user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path). Дополнительные аргументы скрипта можно указать через пробел. Пример: `script_name arg1 arg2`. Если `execute_direct` = `0`, `command` передается как аргумент для `bin/sh -c`. Значение по умолчанию — `0`. Необязательный параметр.
- `send_chunk_header` — Управляет отправкой количества строк перед отправкой блока данных для обработки. Необязательный параметр. Значение по умолчанию — `false`.

Этот источник словаря можно настроить только через XML-конфигурацию. Создание словарей с исполняемым источником через DDL отключено; в противном случае пользователь БД мог бы выполнять произвольные исполняемые файлы на узле ClickHouse.

### Executable Pool {#executable-pool}

Executable pool позволяет загружать данные из пула процессов. Этот источник не работает с размещениями словарей, которым требуется загрузить все данные из источника. Executable pool работает, если словарь [хранится](#ways-to-store-dictionaries-in-memory) с использованием размещений `cache`, `complex_key_cache`, `ssd_cache`, `complex_key_ssd_cache`, `direct` или `complex_key_direct`.

Executable pool создает пул процессов с указанной командой и поддерживает их работу до завершения. Программа должна читать данные из STDIN, пока они доступны, и выводить результат в STDOUT. Она может ожидать следующий блок данных в STDIN. ClickHouse не закрывает STDIN после обработки блока данных, а передает следующий блок данных при необходимости. Исполняемый скрипт должен быть готов к такому способу обработки данных — он должен опрашивать STDIN и своевременно сбрасывать данные в STDOUT.

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

Поля настроек:


- `command` — Абсолютный путь к исполняемому файлу или имя файла (если каталог программы указан в `PATH`).
- `format` — Формат файла. Поддерживаются все форматы, описанные в разделе «[Форматы](/sql-reference/formats)».
- `pool_size` — Размер пула. Если для `pool_size` указано значение 0, ограничения на размер пула отсутствуют. Значение по умолчанию: `16`.
- `command_termination_timeout` — исполняемый скрипт должен содержать основной цикл чтения-записи. После удаления словаря канал закрывается, и исполняемый файл получает `command_termination_timeout` секунд на завершение работы, прежде чем ClickHouse отправит сигнал SIGTERM дочернему процессу. Указывается в секундах. Значение по умолчанию: 10. Необязательный параметр.
- `max_command_execution_time` — Максимальное время выполнения команды исполняемого скрипта для обработки блока данных. Указывается в секундах. Значение по умолчанию: 10. Необязательный параметр.
- `command_read_timeout` — таймаут чтения данных из stdout команды в миллисекундах. Значение по умолчанию: 10000. Необязательный параметр.
- `command_write_timeout` — таймаут записи данных в stdin команды в миллисекундах. Значение по умолчанию: 10000. Необязательный параметр.
- `implicit_key` — Исполняемый файл источника может возвращать только значения, а соответствие запрошенным ключам определяется неявно — по порядку строк в результате. Значение по умолчанию: false. Необязательный параметр.
- `execute_direct` — Если `execute_direct` = `1`, то `command` будет искаться в каталоге user_scripts, указанном параметром [user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path). Дополнительные аргументы скрипта можно указать через пробел. Пример: `script_name arg1 arg2`. Если `execute_direct` = `0`, `command` передается как аргумент для `bin/sh -c`. Значение по умолчанию: `1`. Необязательный параметр.
- `send_chunk_header` — управляет отправкой количества строк перед отправкой фрагмента данных для обработки. Необязательный параметр. Значение по умолчанию: `false`.

Этот источник словаря можно настроить только через XML-конфигурацию. Создание словарей с исполняемым источником через DDL отключено, в противном случае пользователь БД мог бы выполнять произвольные исполняемые файлы на узле ClickHouse.

### HTTP(S) {#https}

Работа с HTTP(S)-сервером зависит от [способа хранения словаря в памяти](#storing-dictionaries-in-memory). Если словарь хранится с использованием `cache` или `complex_key_cache`, ClickHouse запрашивает необходимые ключи, отправляя запрос методом `POST`.

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

Для доступа ClickHouse к HTTPS-ресурсу необходимо [настроить openSSL](../../operations/server-configuration-parameters/settings.md#openssl) в конфигурации сервера.

Поля настроек:

- `url` — URL источника.
- `format` — Формат файла. Поддерживаются все форматы, описанные в разделе «[Форматы](/sql-reference/formats)».
- `credentials` — Базовая HTTP-аутентификация. Необязательный параметр.
- `user` — Имя пользователя для аутентификации.
- `password` — Пароль для аутентификации.
- `headers` — Все пользовательские записи HTTP-заголовков, используемые для HTTP-запроса. Необязательный параметр.
- `header` — Одна запись HTTP-заголовка.
- `name` — Имя идентификатора, используемое для заголовка, отправляемого в запросе.
- `value` — Значение, установленное для конкретного имени идентификатора.

При создании словаря с помощью DDL-команды (`CREATE DICTIONARY ...`) удаленные хосты для HTTP-словарей проверяются на соответствие содержимому секции `remote_url_allow_hosts` в конфигурации, чтобы предотвратить доступ пользователей базы данных к произвольным HTTP-серверам.

### СУБД {#dbms}

#### ODBC {#odbc}

Этот метод можно использовать для подключения к любой базе данных, имеющей драйвер ODBC.

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

Поля настройки:

- `db` – Имя базы данных. Не указывайте это поле, если имя базы данных задано в параметрах `<connection_string>`.
- `table` – Имя таблицы и схемы, если она существует.
- `connection_string` – Строка подключения.
- `invalidate_query` – Запрос для проверки статуса словаря. Необязательный параметр. Подробнее см. в разделе [Обновление данных словаря с использованием LIFETIME](#refreshing-dictionary-data-using-lifetime).
- `background_reconnect` – Переподключение к реплике в фоновом режиме при сбое соединения. Необязательный параметр.
- `query` – Пользовательский запрос. Необязательный параметр.

:::note
Поля `table` и `query` не могут использоваться одновременно. Должно быть объявлено одно из полей: `table` или `query`.
:::

ClickHouse получает символы экранирования от драйвера ODBC и экранирует все настройки в запросах к драйверу, поэтому необходимо задавать имя таблицы в соответствии с регистром имени таблицы в базе данных.

Если у вас возникли проблемы с кодировками при использовании Oracle, см. соответствующий раздел [FAQ](/knowledgebase/oracle-odbc).

##### Известная уязвимость функциональности словарей ODBC {#known-vulnerability-of-the-odbc-dictionary-functionality}

:::note
При подключении к базе данных через драйвер ODBC параметр подключения `Servername` может быть подменен. В этом случае значения `USERNAME` и `PASSWORD` из `odbc.ini` отправляются на удаленный сервер и могут быть скомпрометированы.
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

Если затем выполнить запрос вида

```sql
SELECT * FROM odbc('DSN=gregtest;Servername=some-server.com', 'test_db');
```

драйвер ODBC отправит значения `USERNAME` и `PASSWORD` из `odbc.ini` на `some-server.com`.

##### Пример подключения к PostgreSQL {#example-of-connecting-postgresql}

ОС Ubuntu.

Установка unixODBC и драйвера ODBC для PostgreSQL:

```bash
$ sudo apt-get install -y unixodbc odbcinst odbc-postgresql
```

Настройка `/etc/odbc.ini` (или `~/.odbc.ini`, если вы вошли под пользователем, который запускает ClickHouse):

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
                <!-- В connection_string можно указать следующие параметры: -->
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

or

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

Возможно, потребуется отредактировать файл `odbc.ini`, чтобы указать полный путь к библиотеке драйвера `DRIVER=/usr/local/lib/psqlodbcw.so`.

##### Пример подключения к MS SQL Server {#example-of-connecting-ms-sql-server}

ОС Ubuntu.

Установка драйвера ODBC для подключения к MS SQL:

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

    # тестирование TDS-соединения
    $ sqsh -S MSSQL -D database -U user -P password


    $ cat /etc/odbcinst.ini

    [FreeTDS]
    Description     = FreeTDS
    Driver          = /usr/lib/x86_64-linux-gnu/odbc/libtdsodbc.so
    Setup           = /usr/lib/x86_64-linux-gnu/odbc/libtdsS.so
    FileUsage       = 1
    UsageCount      = 5

    $ cat /etc/odbc.ini
    # $ cat ~/.odbc.ini # если вы вошли под пользователем, от имени которого запускается ClickHouse

    [MSSQL]
    Description     = FreeTDS
    Driver          = FreeTDS
    Servername      = MSSQL
    Database        = test
    UID             = test
    PWD             = test
    Port            = 1433


    # (опционально) тестирование ODBC-соединения (для использования инструмента isql установите пакет [unixodbc](https://packages.debian.org/sid/unixodbc))
    $ isql -v MSSQL "user" "password"
```

Примечания:

- чтобы определить минимальную версию TDS, поддерживаемую конкретной версией SQL Server, обратитесь к документации продукта или см. [MS-TDS Product Behavior](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-tds/135d0ebe-5c4c-4a94-99bf-1811eccb9f4a)

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

or


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

Поля настроек:

- `port` – Порт сервера MySQL. Можно указать для всех реплик или для каждой отдельно (внутри `<replica>`).

- `user` – Имя пользователя MySQL. Можно указать для всех реплик или для каждой отдельно (внутри `<replica>`).

- `password` – Пароль пользователя MySQL. Можно указать для всех реплик или для каждой отдельно (внутри `<replica>`).

- `replica` – Секция конфигурации реплики. Может содержать несколько секций.

        - `replica/host` – Хост MySQL.
        - `replica/priority` – Приоритет реплики. При попытке подключения ClickHouse перебирает реплики в порядке приоритета. Чем меньше число, тем выше приоритет.

- `db` – Имя базы данных.

- `table` – Имя таблицы.

- `where` – Условие выборки. Синтаксис условий такой же, как в предложении `WHERE` в MySQL, например, `id > 10 AND id < 20`. Необязательный параметр.

- `invalidate_query` – Запрос для проверки статуса словаря. Необязательный параметр. Подробнее см. в разделе [Обновление данных словаря с использованием LIFETIME](#refreshing-dictionary-data-using-lifetime).

- `fail_on_connection_loss` – Параметр конфигурации, управляющий поведением сервера при потере соединения. Если установлено значение `true`, исключение выбрасывается немедленно при потере соединения между клиентом и сервером. Если `false`, сервер ClickHouse повторяет попытку выполнения запроса три раза перед выбросом исключения. Обратите внимание, что повторные попытки увеличивают время отклика. Значение по умолчанию: `false`.

- `query` – Пользовательский запрос. Необязательный параметр.

:::note
Поля `table` или `where` нельзя использовать вместе с полем `query`. Должно быть объявлено одно из полей: `table` или `query`.
:::

:::note
Явный параметр `secure` отсутствует. При установке SSL-соединения безопасность обязательна.
:::

К MySQL можно подключиться на локальном хосте через сокеты. Для этого укажите параметры `host` и `socket`.

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

Поля настроек:

- `host` – Хост ClickHouse. Если это локальный хост, запрос обрабатывается без сетевой активности. Для повышения отказоустойчивости можно создать таблицу [Distributed](../../engines/table-engines/special/distributed.md) и указать её в последующих конфигурациях.
- `port` – Порт сервера ClickHouse.
- `user` – Имя пользователя ClickHouse.
- `password` – Пароль пользователя ClickHouse.
- `db` – Имя базы данных.
- `table` – Имя таблицы.
- `where` – Критерий выборки. Может быть опущен.
- `invalidate_query` – Запрос для проверки состояния словаря. Необязательный параметр. Подробнее в разделе [Обновление данных словаря с использованием LIFETIME](#refreshing-dictionary-data-using-lifetime).
- `secure` – Использовать SSL для соединения.
- `query` – Пользовательский запрос. Необязательный параметр.

:::note
Поля `table` или `where` не могут использоваться вместе с полем `query`. Должно быть объявлено одно из полей `table` или `query`.
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

Поля настроек:

- `host` – Хост MongoDB.
- `port` – Порт сервера MongoDB.
- `user` – Имя пользователя MongoDB.
- `password` – Пароль пользователя MongoDB.
- `db` – Имя базы данных.
- `collection` – Имя коллекции.
- `options` – Параметры строки подключения MongoDB (необязательный параметр).

или

```sql
SOURCE(MONGODB(
    uri 'mongodb://localhost:27017/clickhouse'
    collection 'dictionary_source'
))
```

Поля настроек:

- `uri` – URI для установления соединения.
- `collection` – Имя коллекции.

[Дополнительная информация о движке](../../engines/table-engines/integrations/mongodb.md)

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

Поля настроек:


- `host` – Хост Redis.
- `port` – Порт на сервере Redis.
- `storage_type` – Структура внутреннего хранилища Redis, используемого для работы с ключами. `simple` используется для простых источников и хешированных источников с одним ключом, `hash_map` — для хешированных источников с двумя ключами. Источники с диапазонами и кеш-источники со сложным ключом не поддерживаются. Может быть опущен, значение по умолчанию — `simple`.
- `db_index` – Числовой индекс логической базы данных Redis. Может быть опущен, значение по умолчанию — 0.

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

Поля настроек:

- `host` – Хост Cassandra или список хостов, разделенных запятыми.
- `port` – Порт на серверах Cassandra. Если не указан, используется порт по умолчанию 9042.
- `user` – Имя пользователя Cassandra.
- `password` – Пароль пользователя Cassandra.
- `keyspace` – Имя пространства ключей (базы данных).
- `column_family` – Имя семейства столбцов (таблицы).
- `allow_filtering` – Флаг, разрешающий или запрещающий потенциально дорогостоящие условия для столбцов ключа кластеризации. Значение по умолчанию — 1.
- `partition_key_prefix` – Количество столбцов ключа партиционирования в первичном ключе таблицы Cassandra. Требуется для словарей с составным ключом. Порядок ключевых столбцов в определении словаря должен совпадать с порядком в Cassandra. Значение по умолчанию — 1 (первый ключевой столбец является ключом партиционирования, остальные ключевые столбцы — ключами кластеризации).
- `consistency` – Уровень согласованности. Возможные значения: `One`, `Two`, `Three`, `All`, `EachQuorum`, `Quorum`, `LocalQuorum`, `LocalOne`, `Serial`, `LocalSerial`. Значение по умолчанию — `One`.
- `where` – Необязательные критерии выборки.
- `max_threads` – Максимальное количество потоков для загрузки данных из нескольких партиций в словарях с составным ключом.
- `query` – Пользовательский запрос. Необязательный параметр.

:::note
Поля `column_family` или `where` не могут использоваться вместе с полем `query`. При этом должно быть объявлено одно из полей: `column_family` или `query`.
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

Поля настроек:


- `host` – Хост сервера PostgreSQL. Можно указать для всех реплик или для каждой отдельно (внутри `<replica>`).
- `port` – Порт сервера PostgreSQL. Можно указать для всех реплик или для каждой отдельно (внутри `<replica>`).
- `user` – Имя пользователя PostgreSQL. Можно указать для всех реплик или для каждой отдельно (внутри `<replica>`).
- `password` – Пароль пользователя PostgreSQL. Можно указать для всех реплик или для каждой отдельно (внутри `<replica>`).
- `replica` – Секция конфигурации реплики. Может содержать несколько секций:
  - `replica/host` – Хост PostgreSQL.
  - `replica/port` – Порт PostgreSQL.
  - `replica/priority` – Приоритет реплики. При попытке подключения ClickHouse перебирает реплики в порядке приоритета. Чем меньше число, тем выше приоритет.
- `db` – Имя базы данных.
- `table` – Имя таблицы.
- `where` – Условие выборки. Синтаксис условий такой же, как в предложении `WHERE` в PostgreSQL. Например, `id > 10 AND id < 20`. Необязательный параметр.
- `invalidate_query` – Запрос для проверки статуса словаря. Необязательный параметр. Подробнее см. в разделе [Обновление данных словаря с использованием LIFETIME](#refreshing-dictionary-data-using-lifetime).
- `background_reconnect` – Переподключение к реплике в фоновом режиме при сбое соединения. Необязательный параметр.
- `query` – Пользовательский запрос. Необязательный параметр.

:::note
Поля `table` и `where` нельзя использовать вместе с полем `query`. При этом должно быть указано одно из полей: `table` или `query`.
:::

### Null {#null}

Специальный источник, который можно использовать для создания фиктивных (пустых) словарей. Такие словари могут быть полезны для тестирования или в конфигурациях с разделением узлов данных и запросов при использовании распределённых таблиц (Distributed).

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


## Ключ и поля словаря {#dictionary-key-and-fields}

<CloudDetails />

Секция `structure` описывает ключ словаря и поля, доступные для запросов.

Описание в XML:

```xml
<dictionary>
    <structure>
        <id>
            <name>Id</name>
        </id>

        <attribute>
            <!-- Параметры атрибута -->
        </attribute>

        ...

    </structure>
</dictionary>
```

Атрибуты описываются в следующих элементах:

- `<id>` — столбец-ключ
- `<attribute>` — столбец данных. Атрибутов может быть несколько.

DDL-запрос:

```sql
CREATE DICTIONARY dict_name (
    Id UInt64,
    -- атрибуты
)
PRIMARY KEY Id
...
```

Атрибуты описываются в теле запроса:

- `PRIMARY KEY` — столбец-ключ
- `AttrName AttrType` — столбец данных. Атрибутов может быть несколько.


## Ключ {#key}

ClickHouse поддерживает следующие типы ключей:

- Числовой ключ. `UInt64`. Определяется в теге `<id>` или с помощью ключевого слова `PRIMARY KEY`.
- Составной ключ. Набор значений различных типов. Определяется в теге `<key>` или с помощью ключевого слова `PRIMARY KEY`.

XML-структура может содержать либо `<id>`, либо `<key>`. DDL-запрос должен содержать один `PRIMARY KEY`.

:::note
Ключ не должен описываться как атрибут.
:::

### Числовой ключ {#numeric-key}

Тип: `UInt64`.

Пример конфигурации:

```xml
<id>
    <name>Id</name>
</id>
```

Поля конфигурации:

- `name` – имя столбца с ключами.

Для DDL-запроса:

```sql
CREATE DICTIONARY (
    Id UInt64,
    ...
)
PRIMARY KEY Id
...
```

- `PRIMARY KEY` – имя столбца с ключами.

### Составной ключ {#composite-key}

Ключ может быть кортежем (`tuple`) из полей любых типов. В этом случае [layout](#storing-dictionaries-in-memory) должен быть `complex_key_hashed` или `complex_key_cache`.

:::tip
Составной ключ может состоять из одного элемента. Это позволяет использовать, например, строку в качестве ключа.
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

Для запроса к функции `dictGet*` кортеж передается в качестве ключа. Пример: `dictGetString('dict_name', 'attr_name', tuple('string for field1', num_for_field2))`.


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

Поля конфигурации:


| Tag                                                  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Required |
|------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `name`                                               | Имя столбца.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Yes      |
| `type`                                               | Тип данных в ClickHouse: [UInt8](../../sql-reference/data-types/int-uint.md), [UInt16](../../sql-reference/data-types/int-uint.md), [UInt32](../../sql-reference/data-types/int-uint.md), [UInt64](../../sql-reference/data-types/int-uint.md), [Int8](../../sql-reference/data-types/int-uint.md), [Int16](../../sql-reference/data-types/int-uint.md), [Int32](../../sql-reference/data-types/int-uint.md), [Int64](../../sql-reference/data-types/int-uint.md), [Float32](../../sql-reference/data-types/float.md), [Float64](../../sql-reference/data-types/float.md), [UUID](../../sql-reference/data-types/uuid.md), [Decimal32](../../sql-reference/data-types/decimal.md), [Decimal64](../../sql-reference/data-types/decimal.md), [Decimal128](../../sql-reference/data-types/decimal.md), [Decimal256](../../sql-reference/data-types/decimal.md),[Date](../../sql-reference/data-types/date.md), [Date32](../../sql-reference/data-types/date32.md), [DateTime](../../sql-reference/data-types/datetime.md), [DateTime64](../../sql-reference/data-types/datetime64.md), [String](../../sql-reference/data-types/string.md), [Array](../../sql-reference/data-types/array.md).<br/>ClickHouse пытается привести значение из словаря к указанному типу данных. Например, для MySQL поле в исходной таблице MySQL может иметь тип `TEXT`, `VARCHAR` или `BLOB`, но в ClickHouse оно может быть загружено как `String`.<br/>[Nullable](../../sql-reference/data-types/nullable.md) в настоящее время поддерживается для словарей [Flat](#flat), [Hashed](#hashed), [ComplexKeyHashed](#complex_key_hashed), [Direct](#direct), [ComplexKeyDirect](#complex_key_direct), [RangeHashed](#range_hashed), Polygon, [Cache](#cache), [ComplexKeyCache](#complex_key_cache), [SSDCache](#ssd_cache), [SSDComplexKeyCache](#complex_key_ssd_cache). В словарях [IPTrie](#ip_trie) типы `Nullable` не поддерживаются. | Yes      |
| `null_value`                                         | Значение по умолчанию для несуществующего элемента.<br/>В примере это пустая строка. Значение [NULL](../syntax.md#null) может использоваться только для типов `Nullable` (см. предыдущую строку с описанием типов).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Yes      |
| `expression`                                         | [Выражение](../../sql-reference/syntax.md#expressions), которое ClickHouse выполняет для значения.<br/>Выражением может быть имя столбца в удалённой SQL-базе данных. Таким образом, вы можете использовать его для создания псевдонима для удалённого столбца.<br/><br/>Значение по умолчанию: выражение отсутствует.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | No       |
| <a name="hierarchical-dict-attr"></a> `hierarchical` | Если `true`, атрибут содержит значение родительского ключа для текущего ключа. См. [Иерархические словари](#hierarchical-dictionaries).<br/><br/>Значение по умолчанию: `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | No       |
| `injective`                                          | Флаг, показывающий, является ли отображение `id -> attribute` [инъективным](https://en.wikipedia.org/wiki/Injective_function).<br/>Если `true`, ClickHouse может автоматически помещать после оператора `GROUP BY` запросы к инъективным словарям. Обычно это значительно сокращает количество таких запросов.<br/><br/>Значение по умолчанию: `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | No       |
| `is_object_id`                                       | Флаг, показывающий, выполняется ли запрос к документу MongoDB по полю `ObjectID`.<br/><br/>Значение по умолчанию: `false`. |



## Иерархические словари {#hierarchical-dictionaries}

ClickHouse поддерживает иерархические словари с [числовым ключом](#numeric-key).

Рассмотрим следующую иерархическую структуру:

```text
0 (Общий родитель)
│
├── 1 (Россия)
│   │
│   └── 2 (Москва)
│       │
│       └── 3 (Центр)
│
└── 4 (Великобритания)
    │
    └── 5 (Лондон)
```

Эту иерархию можно представить в виде следующей таблицы словаря.

| region_id | parent_region | region_name      |
| --------- | ------------- | ---------------- |
| 1         | 0             | Россия           |
| 2         | 1             | Москва           |
| 3         | 2             | Центр            |
| 4         | 0             | Великобритания   |
| 5         | 4             | Лондон           |

Эта таблица содержит столбец `parent_region`, в котором хранится ключ ближайшего родительского элемента.

ClickHouse поддерживает свойство иерархичности для атрибутов внешних словарей. Это свойство позволяет настроить иерархический словарь аналогично описанному выше.

Функция [dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy) позволяет получить цепочку родительских элементов.

Для нашего примера структура словаря может выглядеть следующим образом:

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

Этот словарь оптимизирован для запросов типа «точка в полигоне», по сути представляющих собой обратное геокодирование. По заданной координате (широта/долгота) он эффективно определяет, какой полигон/регион (из множества полигонов, таких как границы стран или регионов) содержит эту точку. Он хорошо подходит для сопоставления координат местоположения с содержащим их регионом.

<iframe
  width='1024'
  height='576'
  src='https://www.youtube.com/embed/FyRsriQp46E?si=Kf8CXoPKEpGQlC-Y'
  title='Полигональные словари в ClickHouse'
  frameborder='0'
  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
  referrerpolicy='strict-origin-when-cross-origin'
  allowfullscreen
></iframe>

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
- Мультиполигон. Это массив полигонов. Каждый полигон представляет собой двумерный массив точек. Первый элемент этого массива — внешняя граница полигона, а последующие элементы задают области, которые должны быть исключены из него.

Точки могут быть заданы как массив или кортеж их координат. В текущей реализации поддерживаются только двумерные точки.

Пользователь может загружать собственные данные во всех форматах, поддерживаемых ClickHouse.

Доступны 3 типа [хранения в памяти](#storing-dictionaries-in-memory):

- `POLYGON_SIMPLE`. Это наивная реализация, при которой для каждого запроса выполняется линейный проход по всем полигонам и для каждого из них проверяется принадлежность без использования дополнительных индексов.

- `POLYGON_INDEX_EACH`. Для каждого полигона строится отдельный индекс, что позволяет быстро проверить принадлежность в большинстве случаев (оптимизировано для географических регионов).
  Также на рассматриваемую область накладывается сетка, что значительно сужает количество рассматриваемых полигонов.
  Сетка создается путем рекурсивного деления ячейки на 16 равных частей и настраивается двумя параметрами.
  Деление прекращается, когда глубина рекурсии достигает `MAX_DEPTH` или когда ячейка пересекается не более чем с `MIN_INTERSECTIONS` полигонами.
  Для ответа на запрос определяется соответствующая ячейка и поочередно обращаются к индексу для хранящихся в ней полигонов.

- `POLYGON_INDEX_CELL`. Этот способ размещения также создает описанную выше сетку. Доступны те же параметры. Для каждой листовой ячейки строится индекс по всем частям полигонов, попадающим в нее, что позволяет быстро отвечать на запрос.

- `POLYGON`. Синоним `POLYGON_INDEX_CELL`.

Запросы к словарю выполняются с использованием стандартных [функций](../../sql-reference/functions/ext-dict-functions.md) для работы со словарями.
Важное отличие заключается в том, что здесь ключами являются точки, для которых требуется найти содержащий их полигон.

**Пример**

Пример работы с определенным выше словарем:

```sql
CREATE TABLE points (
    x Float64,
    y Float64
)
...
SELECT tuple(x, y) AS key, dictGet(dict_name, 'name', key), dictGet(dict_name, 'value', key) FROM points ORDER BY x, y;
```

В результате выполнения последней команды для каждой точки в таблице 'points' будет найден полигон минимальной площади, содержащий эту точку, и будут выведены запрошенные атрибуты.

**Пример**

Вы можете читать столбцы из полигональных словарей с помощью запроса SELECT, просто включите `store_polygon_key_column = 1` в конфигурации словаря или соответствующем DDL-запросе.

Запрос:


```sql
CREATE TABLE polygons_test_table
(
    key Array(Array(Array(Tuple(Float64, Float64)))),
    name String
) ENGINE = TinyLog;

INSERT INTO polygons_test_table VALUES ([[[(3, 1), (0, 1), (0, -1), (3, -1)]]], 'Значение');

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
│ [[[(3,1),(0,1),(0,-1),(3,-1)]]] │ Значение │
└─────────────────────────────────┴───────┘
```


## Словарь с деревом регулярных выражений {#regexp-tree-dictionary}

Этот словарь позволяет сопоставлять ключи со значениями на основе иерархических шаблонов регулярных выражений. Он оптимизирован для поиска по совпадению с шаблонами (например, для классификации строк, таких как строки user agent, путём сопоставления с шаблонами регулярных выражений), а не для точного совпадения ключей.

<iframe
  width='1024'
  height='576'
  src='https://www.youtube.com/embed/ESlAhUJMoz8?si=sY2OVm-zcuxlDRaX'
  title='Введение в словари с деревом регулярных выражений ClickHouse'
  frameborder='0'
  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
  referrerpolicy='strict-origin-when-cross-origin'
  allowfullscreen
></iframe>

### Использование словаря с деревом регулярных выражений в ClickHouse Open-Source {#use-regular-expression-tree-dictionary-in-clickhouse-open-source}

Словари с деревом регулярных выражений определяются в ClickHouse open-source с использованием источника YAMLRegExpTree, которому передаётся путь к YAML-файлу, содержащему дерево регулярных выражений.

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

Источник словаря `YAMLRegExpTree` представляет структуру дерева регулярных выражений. Например:

```yaml
- regexp: 'Linux/(\d+[\.\d]*).+tlinux'
  name: "TencentOS"
  version: '\1'

- regexp: '\d+/tclwebkit(?:\d+[\.\d]*)'
  name: "Android"
  versions:
    - regexp: "33/tclwebkit"
      version: "13"
    - regexp: "3[12]/tclwebkit"
      version: "12"
    - regexp: "30/tclwebkit"
      version: "11"
    - regexp: "29/tclwebkit"
      version: "10"
```

Эта конфигурация состоит из списка узлов дерева регулярных выражений. Каждый узел имеет следующую структуру:

- **regexp**: регулярное выражение узла.
- **attributes**: список определяемых пользователем атрибутов словаря. В данном примере используются два атрибута: `name` и `version`. Первый узел определяет оба атрибута. Второй узел определяет только атрибут `name`. Атрибут `version` предоставляется дочерними узлами второго узла.
  - Значение атрибута может содержать **обратные ссылки**, указывающие на группы захвата совпавшего регулярного выражения. В примере значение атрибута `version` в первом узле состоит из обратной ссылки `\1` на группу захвата `(\d+[\.\d]*)` в регулярном выражении. Номера обратных ссылок находятся в диапазоне от 1 до 9 и записываются как `$1` или `\1` (для номера 1). Обратная ссылка заменяется совпавшей группой захвата во время выполнения запроса.
- **child nodes**: список дочерних узлов узла дерева регулярных выражений, каждый из которых имеет свои собственные атрибуты и (потенциально) дочерние узлы. Сопоставление строк выполняется в порядке обхода в глубину. Если строка совпадает с узлом регулярного выражения, словарь проверяет, совпадает ли она также с дочерними узлами этого узла. Если это так, назначаются атрибуты самого глубокого совпавшего узла. Атрибуты дочернего узла перезаписывают одноимённые атрибуты родительских узлов. Имя дочерних узлов в YAML-файлах может быть произвольным, например `versions` в приведённом выше примере.

Словари с деревом регулярных выражений допускают доступ только с использованием функций `dictGet`, `dictGetOrDefault` и `dictGetAll`.

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

В данном случае сначала происходит совпадение с регулярным выражением `\d+/tclwebkit(?:\d+[\.\d]*)` во втором узле верхнего уровня. Затем словарь продолжает просмотр дочерних узлов и обнаруживает, что строка также совпадает с `3[12]/tclwebkit`. В результате значение атрибута `name` равно `Android` (определено на первом уровне), а значение атрибута `version` равно `12` (определено в дочернем узле).


С помощью мощного конфигурационного файла YAML можно использовать словари на основе дерева регулярных выражений в качестве парсера строк user agent. Поддерживается [uap-core](https://github.com/ua-parser/uap-core), пример использования которого демонстрируется в функциональном тесте [02504_regexp_dictionary_ua_parser](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/02504_regexp_dictionary_ua_parser.sh)

#### Сбор значений атрибутов {#collecting-attribute-values}

Иногда требуется возвращать значения из нескольких совпавших регулярных выражений, а не только значение конечного узла. В таких случаях можно использовать специализированную функцию [`dictGetAll`](../../sql-reference/functions/ext-dict-functions.md#dictgetall). Если узел имеет значение атрибута типа `T`, функция `dictGetAll` вернёт `Array(T)`, содержащий ноль или более значений.

По умолчанию количество совпадений, возвращаемых для каждого ключа, не ограничено. Ограничение можно передать в качестве необязательного четвёртого аргумента функции `dictGetAll`. Массив заполняется в _топологическом порядке_, что означает, что дочерние узлы идут перед родительскими узлами, а узлы одного уровня следуют порядку в источнике.

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
  tag: "ClickHouse"
  topological_index: 1
  paths:
    - regexp: 'clickhouse\.com/docs(.*)'
      tag: "ClickHouse Documentation"
      topological_index: 0
      captured: '\1'
      parent: "ClickHouse"

- regexp: "/docs(/|$)"
  tag: "Documentation"
  topological_index: 2

- regexp: "github.com"
  tag: "GitHub"
  topological_index: 3
  captured: "NULL"
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

#### Режимы сопоставления {#matching-modes}

Поведение сопоставления шаблонов можно изменить с помощью следующих настроек словаря:

- `regexp_dict_flag_case_insensitive`: использовать сопоставление без учёта регистра (по умолчанию `false`). Может быть переопределено в отдельных выражениях с помощью `(?i)` и `(?-i)`.
- `regexp_dict_flag_dotall`: разрешить символу '.' сопоставляться с символами новой строки (по умолчанию `false`).

### Использование словаря дерева регулярных выражений в ClickHouse Cloud {#use-regular-expression-tree-dictionary-in-clickhouse-cloud}

Используемый выше источник `YAMLRegExpTree` работает в ClickHouse Open Source, но не в ClickHouse Cloud. Чтобы использовать словари дерева регулярных выражений в ClickHouse Cloud, сначала создайте словарь дерева регулярных выражений из YAML-файла локально в ClickHouse Open Source, затем выгрузите этот словарь в CSV-файл с помощью табличной функции `dictionary` и конструкции [INTO OUTFILE](../statements/select/into-outfile.md).

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

Схема выгруженного файла:

- `id UInt64`: идентификатор узла RegexpTree.
- `parent_id UInt64`: идентификатор родительского узла.
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

Затем загрузите локальный CSV-файл с помощью команды:

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

Подробнее см. в разделе [Вставка локальных файлов](/integrations/data-ingestion/insert-local-files). После инициализации исходной таблицы можно создать RegexpTree из табличного источника:


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


## Встроенные словари {#embedded-dictionaries}

<SelfManaged />

ClickHouse содержит встроенную функциональность для работы с геобазой.

Это позволяет:

- Получать название региона на нужном языке по его идентификатору.
- Получать идентификатор города, области, федерального округа, страны или континента по идентификатору региона.
- Проверять, является ли регион частью другого региона.
- Получать цепочку родительских регионов.

Все функции поддерживают «транслокальность» — возможность одновременного использования различных точек зрения на принадлежность регионов. Подробнее см. раздел «Функции для работы со словарями веб-аналитики».

Внутренние словари отключены в пакете по умолчанию.
Чтобы включить их, раскомментируйте параметры `path_to_regions_hierarchy_file` и `path_to_regions_names_files` в конфигурационном файле сервера.

Геобаза загружается из текстовых файлов.

Поместите файлы `regions_hierarchy*.txt` в каталог `path_to_regions_hierarchy_file`. Этот параметр конфигурации должен содержать путь к файлу `regions_hierarchy.txt` (иерархия регионов по умолчанию), а остальные файлы (`regions_hierarchy_ua.txt`) должны находиться в том же каталоге.

Поместите файлы `regions_names_*.txt` в каталог `path_to_regions_names_files`.

Вы также можете создать эти файлы самостоятельно. Формат файлов следующий:

`regions_hierarchy*.txt`: TabSeparated (без заголовка), столбцы:

- идентификатор региона (`UInt32`)
- идентификатор родительского региона (`UInt32`)
- тип региона (`UInt8`): 1 — континент, 3 — страна, 4 — федеральный округ, 5 — регион, 6 — город; другие типы не имеют значений
- население (`UInt32`) — необязательный столбец

`regions_names_*.txt`: TabSeparated (без заголовка), столбцы:

- идентификатор региона (`UInt32`)
- название региона (`String`) — не может содержать символы табуляции или перевода строки, даже экранированные.

Для хранения в оперативной памяти используется плоский массив. По этой причине идентификаторы не должны превышать миллион.

Словари могут обновляться без перезапуска сервера. Однако набор доступных словарей не обновляется.
Для обновления проверяется время модификации файлов. Если файл изменился, словарь обновляется.
Интервал проверки изменений настраивается параметром `builtin_dictionaries_reload_interval`.
Обновления словарей (кроме загрузки при первом использовании) не блокируют запросы. Во время обновления запросы используют старые версии словарей. Если во время обновления возникает ошибка, она записывается в журнал сервера, и запросы продолжают использовать старую версию словарей.

Рекомендуется периодически обновлять словари с геобазой. Во время обновления создавайте новые файлы и записывайте их в отдельное расположение. Когда всё будет готово, переименуйте их в файлы, используемые сервером.

Также существуют функции для работы с идентификаторами операционных систем и поисковых систем, но их использовать не рекомендуется.
