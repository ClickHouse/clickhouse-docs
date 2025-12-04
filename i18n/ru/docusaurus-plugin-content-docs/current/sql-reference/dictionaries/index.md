---
description: 'Обзор возможностей внешних словарей в ClickHouse'
sidebar_label: 'Определение словарей'
sidebar_position: 35
slug: /sql-reference/dictionaries
title: 'Словари'
doc_type: 'reference'
---

import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';
import CloudDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/sql-reference/dictionaries/_snippet_dictionary_in_cloud.md';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# Словари {#dictionaries}

Словарь — это отображение (`key -> attributes`), удобное для различных типов справочных списков.

ClickHouse поддерживает специальные функции для работы со словарями, которые можно использовать в запросах. Использовать словари с функциями проще и эффективнее, чем применять `JOIN` со справочными таблицами.

ClickHouse поддерживает:

- Словари с [набором функций](../../sql-reference/functions/ext-dict-functions.md).
- [Встроенные словари](#embedded-dictionaries) с определённым [набором функций](../../sql-reference/functions/embedded-dict-functions.md).

:::tip Учебник
Если вы только начинаете работать со словарями в ClickHouse, у нас есть учебник, посвящённый этой теме. Ознакомьтесь с ним [здесь](tutorial.md).
:::

Вы можете добавлять собственные словари из различных источников данных. Источником для словаря может быть таблица ClickHouse, локальный текстовый или исполняемый файл, ресурс HTTP(S) или другая СУБД. Для получения дополнительной информации смотрите раздел «[Источники словарей](#dictionary-sources)».

ClickHouse:

- Полностью или частично хранит словари в RAM.
- Периодически обновляет словари и динамически загружает недостающие значения. Другими словами, словари могут загружаться динамически.
- Позволяет создавать словари на основе XML-файлов или [DDL-запросов](../../sql-reference/statements/create/dictionary.md).

Конфигурация словарей может располагаться в одном или нескольких XML-файлах. Путь к конфигурации задаётся параметром [dictionaries_config](../../operations/server-configuration-parameters/settings.md#dictionaries_config).

Словари могут загружаться при запуске сервера или при первом использовании, в зависимости от настройки [dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load).

Системная таблица [dictionaries](/operations/system-tables/dictionaries) содержит информацию о словарях, настроенных на сервере. Для каждого словаря вы можете найти там:

- Статус словаря.
- Параметры конфигурации.
- Метрики, такие как объём оперативной памяти (RAM), выделенной для словаря, или количество запросов с момента успешной загрузки словаря.

<CloudDetails />

## Создание словаря с помощью DDL-запроса {#creating-a-dictionary-with-a-ddl-query}

Словари можно создавать с помощью [DDL-запросов](../../sql-reference/statements/create/dictionary.md), и это рекомендованный способ, поскольку словари, созданные с помощью DDL:

- Не требуют добавления дополнительных записей в конфигурационные файлы сервера.
- Можно использовать как полноценные сущности, подобно таблицам или представлениям.
- Можно читать данные напрямую, используя привычный SELECT вместо табличных функций словаря. Обратите внимание, что при прямом доступе к словарю через оператор SELECT кешируемый словарь вернёт только кешированные данные, тогда как некешируемый словарь вернёт все данные, которые он хранит.
- Легко переименовывать.

## Создание словаря с помощью файла конфигурации {#creating-a-dictionary-with-a-configuration-file}

<CloudNotSupportedBadge />

:::note
Создание словаря с помощью файла конфигурации не поддерживается в ClickHouse Cloud. Пожалуйста, используйте DDL (см. выше) и создайте словарь от имени пользователя `default`.
:::

Файл конфигурации словаря имеет следующий формат:

```xml
<clickhouse>
    <comment>Необязательный элемент с произвольным содержимым. Игнорируется сервером ClickHouse.</comment>

    <!--Необязательный элемент. Имя файла с подстановками-->
    <include_from>/etc/metrika.xml</include_from>


    <dictionary>
        <!-- Конфигурация словаря. -->
        <!-- Конфигурационный файл может содержать любое количество секций словарей. -->
    </dictionary>

</clickhouse>
```

Вы можете [настроить](#configuring-a-dictionary) любое количество словарей в одном файле.

:::note
Вы можете преобразовывать значения для небольшого словаря, описав его в `SELECT`-запросе (см. функцию [transform](../../sql-reference/functions/other-functions.md)). Эта функциональность не связана со словарями.
:::

## Настройка словаря {#configuring-a-dictionary}

<CloudDetails />

Если словарь настраивается с использованием XML-файла, конфигурация словаря выглядит следующим образом:

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
PRIMARY KEY ... -- конфигурация составного или простого ключа
SOURCE(...) -- конфигурация источника
LAYOUT(...) -- конфигурация размещения в памяти
LIFETIME(...) -- время жизни словаря в памяти
```

## Хранение словарей в памяти {#storing-dictionaries-in-memory}

Существует несколько способов хранить словари в памяти.

Мы рекомендуем [flat](#flat), [hashed](#hashed) и [complex&#95;key&#95;hashed](#complex_key_hashed), которые обеспечивают оптимальную скорость обработки.

Кэширование не рекомендуется из‑за потенциально низкой производительности и трудностей с подбором оптимальных параметров. Подробнее см. в разделе [cache](#cache).

Существует несколько способов повысить производительность словарей:

* Вызывайте функцию для работы со словарём после `GROUP BY`.
* Помечайте извлекаемые атрибуты как инъективные. Атрибут называется инъективным, если разным ключам соответствуют разные значения атрибутов. Поэтому когда в `GROUP BY` используется функция, получающая значение атрибута по ключу, эта функция автоматически выносится за пределы `GROUP BY`.

ClickHouse генерирует исключение при возникновении ошибок со словарями. Примеры ошибок:

* Не удалось загрузить запрашиваемый словарь.
* Ошибка при обращении к словарю типа `cached`.

Вы можете просмотреть список словарей и их статусы в таблице [system.dictionaries](../../operations/system-tables/dictionaries.md).

<CloudDetails />

Конфигурация выглядит следующим образом:

```xml
<clickhouse>
    <dictionary>
        ...
        <layout>
            <layout_type>
                <!-- настройки макета -->
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
LAYOUT(LAYOUT_TYPE(param value)) -- настройки структуры
...
```

В словарях, у которых в макете отсутствует слово `complex-key*`, ключ имеет тип [UInt64](../../sql-reference/data-types/int-uint.md), а в словарях `complex-key*` ключ составной (complex, произвольных типов).

Ключи [UInt64](../../sql-reference/data-types/int-uint.md) в XML-словарях задаются с помощью тега `<id>`.

Пример конфигурации (столбец key&#95;column имеет тип UInt64):

```xml
...
<structure>
    <id>
        <name>key_column</name>
    </id>
...
```

Составные ключи `complex` для XML-словарей задаются с помощью тега `<key>`.

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

Различные способы хранения данных словаря в памяти связаны с определёнными компромиссами по потреблению CPU и RAM. Дерево решений, опубликованное в разделе [Choosing a Layout](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout) тематической [статьи в блоге](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse) о словарях, является хорошей отправной точкой для выбора подходящего варианта размещения.

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

Словарь полностью хранится в памяти в виде плоских массивов. Сколько памяти использует словарь? Объем пропорционален размеру наибольшего ключа (по занимаемому месту).

Ключ словаря имеет тип [UInt64](../../sql-reference/data-types/int-uint.md), а значение ограничено `max_array_size` (по умолчанию — 500000). Если при создании словаря обнаруживается ключ большего размера, ClickHouse генерирует исключение и не создает словарь. Начальный размер плоских массивов словаря контролируется настройкой `initial_array_size` (по умолчанию — 1024).

Поддерживаются все типы источников. При обновлении данные (из файла или таблицы) читаются полностью.

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

Поддерживаются все типы источников. При обновлении данные (из файла или из таблицы) считываются целиком.

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
    <!-- Если количество сегментов больше 1 (по умолчанию `1`), словарь будет загружать
         данные параллельно, что полезно при большом количестве элементов в одном
         словаре. -->
    <shards>10</shards>

    <!-- Размер очереди блоков при параллельной обработке.

         Поскольку узким местом при параллельной загрузке является перехеширование, для избежания
         простоя из-за того, что поток выполняет перехеширование, необходимо иметь
         запас в очереди.

         10000 — хороший баланс между памятью и скоростью.
         Даже для 10e10 элементов способен обработать всю нагрузку без простоев. -->
    <shard_load_queue_backlog>10000</shard_load_queue_backlog>

    <!-- Максимальный коэффициент заполнения хеш-таблицы. При больших значениях память
         используется более эффективно (меньше памяти расходуется впустую), но производительность
         чтения может снизиться.

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

### sparse&#95;hashed {#sparse_hashed}

Похож на `hashed`, но использует меньше памяти за счёт более интенсивного использования CPU.

Ключ словаря имеет тип данных [UInt64](../../sql-reference/data-types/int-uint.md).

Пример конфигурации:

```xml
<layout>
  <sparse_hashed>
    <!-- <shards>1</shards> --> <!-- сегменты -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> --> <!-- размер очереди загрузки сегмента -->
    <!-- <max_load_factor>0.5</max_load_factor> --> <!-- максимальный коэффициент загрузки -->
  </sparse_hashed>
</layout>
```

или

```sql
LAYOUT(SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

Для словарей этого типа также можно использовать `shards`; это особенно важно для `sparse_hashed` по сравнению с `hashed`, поскольку `sparse_hashed` работает медленнее.

### complex&#95;key&#95;hashed {#complex_key_hashed}

Этот тип хранилища предназначен для использования с составными [ключами](#dictionary-key-and-fields). Аналогичен `hashed`.

Пример конфигурации:

```xml
<layout>
  <complex_key_hashed>
    <!-- <shards>1</shards> --> <!-- сегменты -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> --> <!-- размер очереди загрузки сегмента -->
    <!-- <max_load_factor>0.5</max_load_factor> --> <!-- максимальный коэффициент загрузки -->
  </complex_key_hashed>
</layout>
```

или

```sql
LAYOUT(COMPLEX_KEY_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

### complex&#95;key&#95;sparse&#95;hashed {#complex_key_sparse_hashed}

Этот тип хранилища предназначен для составных [ключей](#dictionary-key-and-fields). Аналогичен типу [sparse&#95;hashed](#sparse_hashed).

Пример конфигурации:

```xml
<layout>
  <complex_key_sparse_hashed>
    <!-- <shards>1</shards> --> <!-- сегменты -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> --> <!-- размер очереди загрузки сегмента -->
    <!-- <max_load_factor>0.5</max_load_factor> --> <!-- максимальный коэффициент загрузки -->
  </complex_key_sparse_hashed>
</layout>
```

или

```sql
LAYOUT(COMPLEX_KEY_SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

### hashed&#95;array {#hashed_array}

Словарь полностью хранится в памяти. Каждый атрибут хранится в массиве. Ключевой атрибут хранится в виде хеш-таблицы, где значение — это индекс в массиве атрибутов. Словарь может содержать любое количество элементов с любыми идентификаторами. На практике количество ключей может достигать десятков миллионов.

Ключ словаря имеет тип [UInt64](../../sql-reference/data-types/int-uint.md).

Поддерживаются все типы источников. При обновлении данные (из файла или из таблицы) считываются целиком.

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

### complex&#95;key&#95;hashed&#95;array {#complex_key_hashed_array}

Этот тип хранилища предназначен для использования с составными [ключами](#dictionary-key-and-fields). Аналогичен [hashed&#95;array](#hashed_array).

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

### range&#95;hashed {#range_hashed}

Словарь хранится в памяти в виде хэш-таблицы с упорядоченным массивом диапазонов и соответствующих им значений.

Этот метод хранения работает аналогично hashed и позволяет, помимо ключа, использовать диапазоны дат/времени (произвольного числового типа).

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
Значения `range_min` и `range_max` должны умещаться в диапазон значений типа `Int64`.
:::

Пример:

```xml
<layout>
    <range_hashed>
        <!-- Стратегия для перекрывающихся диапазонов (min/max). По умолчанию: min (возвращает соответствующий диапазон с минимальным значением (range_min -> range_max)) -->
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

Эта функция возвращает значение для указанных `id` и диапазона дат, включающего переданную дату.

Подробности алгоритма:

* Если `id` не найден или для `id` не найден диапазон, возвращается значение по умолчанию для типа атрибута.
* Если имеются пересекающиеся диапазоны и `range_lookup_strategy=min`, возвращается подходящий диапазон с минимальным `range_min`; если найдено несколько диапазонов, возвращается диапазон с минимальным `range_max`; если снова найдено несколько диапазонов (несколько диапазонов имеют одинаковые `range_min` и `range_max`), возвращается случайный диапазон из них.
* Если имеются пересекающиеся диапазоны и `range_lookup_strategy=max`, возвращается подходящий диапазон с максимальным `range_min`; если найдено несколько диапазонов, возвращается диапазон с максимальным `range_max`; если снова найдено несколько диапазонов (несколько диапазонов имеют одинаковые `range_min` и `range_max`), возвращается случайный диапазон из них.
* Если `range_max` равно `NULL`, диапазон является открытым. `NULL` рассматривается как максимально возможное значение. Для `range_min` в качестве открытого значения можно использовать `1970-01-01` или `0` (-MAX&#95;INT).

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
│ 0.1 │ -- подходят два диапазона, range_min 2015-01-01 (0.1) меньше, чем 2015-01-15 (0.2)
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.3 │ -- подходят два диапазона, range_min 2015-01-01 (0.3) меньше, чем 2015-01-04 (0.4)
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.6 │ -- подходят два диапазона, значения range_min равны, 2015-01-10 (0.6) меньше, чем 2015-01-15 (0.5)
└─────┘
```

### complex&#95;key&#95;range&#95;hashed {#complex_key_range_hashed}

Словарь хранится в памяти в виде хеш-таблицы с упорядоченным массивом диапазонов и соответствующих им значений (см. [range&#95;hashed](#range_hashed)). Этот тип хранения предназначен для использования с составными [ключами](#dictionary-key-and-fields).

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

При поиске в словаре сначала выполняется поиск в кэше. Для каждого блока данных все ключи, которые не найдены в кэше или устарели, запрашиваются из источника с помощью `SELECT attrs... FROM db.table WHERE id IN (k1, k2, ...)`. Полученные данные затем записываются в кэш.

Если ключи не найдены в словаре, создаётся задача обновления кэша и добавляется в очередь обновления. Свойствами очереди обновления можно управлять с помощью настроек `max_update_queue_size`, `update_queue_push_timeout_milliseconds`, `query_wait_timeout_milliseconds`, `max_threads_for_updates`.

Для словарей типа cache может быть задан срок действия данных в кэше — [lifetime](#refreshing-dictionary-data-using-lifetime). Если с момента загрузки данных в ячейку прошло больше времени, чем указано в `lifetime`, значение ячейки не используется и ключ считается просроченным. Ключ запрашивается повторно при следующем обращении. Это поведение можно настроить с помощью настройки `allow_read_expired_keys`.

Это наименее эффективный из всех способов хранения словарей. Скорость работы кэша сильно зависит от корректных настроек и сценария использования. Словарь типа cache показывает хорошую производительность только при достаточно высокой доле попаданий (рекомендуется 99% и выше). Среднюю долю попаданий можно посмотреть в таблице [system.dictionaries](../../operations/system-tables/dictionaries.md).

Если настройка `allow_read_expired_keys` установлена в 1 (по умолчанию — 0), словарь может поддерживать асинхронные обновления. Если клиент запрашивает ключи, и все они есть в кэше, но некоторые из них просрочены, словарь вернёт клиенту просроченные значения и асинхронно запросит их из источника.

Чтобы улучшить производительность кэша, используйте подзапрос с `LIMIT` и вызывайте функцию со словарём извне.

Поддерживаются все типы источников.

Пример настроек:

```xml
<layout>
    <cache>
        <!-- Размер кэша в количестве ячеек. Округляется до степени двойки. -->
        <size_in_cells>1000000000</size_in_cells>
        <!-- Разрешает чтение истёкших ключей. -->
        <allow_read_expired_keys>0</allow_read_expired_keys>
        <!-- Максимальный размер очереди обновлений. -->
        <max_update_queue_size>100000</max_update_queue_size>
        <!-- Максимальный таймаут в миллисекундах для помещения задачи обновления в очередь. -->
        <update_queue_push_timeout_milliseconds>10</update_queue_push_timeout_milliseconds>
        <!-- Максимальный таймаут ожидания в миллисекундах для завершения задачи обновления. -->
        <query_wait_timeout_milliseconds>60000</query_wait_timeout_milliseconds>
        <!-- Максимальное количество потоков для обновления кэш-словаря. -->
        <max_threads_for_updates>4</max_threads_for_updates>
    </cache>
</layout>
```

или

```sql
LAYOUT(CACHE(SIZE_IN_CELLS 1000000000))
```

Установите достаточно большой размер кэша. Вам нужно поэкспериментировать, чтобы подобрать количество ячеек:

1. Задайте некоторое значение размера кэша.
2. Выполняйте запросы, пока кэш полностью не заполнится.
3. Оцените потребление памяти, используя таблицу `system.dictionaries`.
4. Увеличивайте или уменьшайте количество ячеек, пока не достигнете требуемого уровня потребления памяти.

:::note
Не используйте ClickHouse как источник данных, так как он медленно обрабатывает запросы со случайными чтениями.
:::

### complex_key_cache {#complex_key_cache}

Этот тип хранилища используется для составных [ключей](#dictionary-key-and-fields). Аналогичен `cache`.

### ssd&#95;cache {#ssd_cache}

Аналогично словарю `cache`, но данные сохраняются на SSD, а индекс — в оперативной памяти. Все настройки словаря cache, связанные с очередью обновления, также могут быть применены к словарям SSD cache.

Ключ словаря имеет тип [UInt64](../../sql-reference/data-types/int-uint.md).

```xml
<layout>
    <ssd_cache>
        <!-- Размер элементарного блока чтения в байтах. Рекомендуется устанавливать равным размеру страницы SSD. -->
        <block_size>4096</block_size>
        <!-- Максимальный размер файла кеша в байтах. -->
        <file_size>16777216</file_size>
        <!-- Размер буфера оперативной памяти в байтах для чтения элементов с SSD. -->
        <read_buffer_size>131072</read_buffer_size>
        <!-- Размер буфера оперативной памяти в байтах для агрегации элементов перед сбросом на SSD. -->
        <write_buffer_size>1048576</write_buffer_size>
        <!-- Путь для хранения файла кеша. -->
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

Этот тип хранилища предназначен для работы с составными [ключами](#dictionary-key-and-fields). Аналогичен `ssd_cache`.

### direct {#direct}

Словарь не хранится в памяти, и при обработке запроса происходит прямое обращение к источнику.

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

Этот тип хранилища предназначен для использования с составными [ключами](#dictionary-key-and-fields). Аналогичен типу `direct`.

### ip&#95;trie {#ip_trie}

Этот словарь предназначен для поиска IP-адресов по сетевому префиксу. Он хранит IP-диапазоны в нотации CIDR и позволяет быстро определить, к какому префиксу (например, подсети или диапазону ASN) относится конкретный IP, что делает его идеальным для поисковых операций по IP, таких как геолокация или классификация сетей.

<iframe width="1024" height="576" src="https://www.youtube.com/embed/4dxMAqltygk?si=rrQrneBReK6lLfza" title="Поиск по IP с использованием словаря ip_trie" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

**Пример**

Предположим, что у нас есть таблица в ClickHouse, которая содержит наши IP-префиксы и их сопоставления:

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

Определим словарь `ip_trie` для этой таблицы. Тип размещения `ip_trie` требует составного ключа:

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

Ключ должен содержать ровно один атрибут типа `String`, в котором указан разрешённый IP-префикс. Другие типы пока не поддерживаются.

Синтаксис:

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

Другие типы данных пока не поддерживаются. Функция возвращает атрибут для префикса, который соответствует данному IP-адресу. Если имеются перекрывающиеся префиксы, возвращается наиболее специфичный.

Данные должны полностью помещаться в оперативную память.

## Обновление данных словаря с помощью LIFETIME {#refreshing-dictionary-data-using-lifetime}

ClickHouse периодически обновляет словари на основе параметра `LIFETIME` (указывается в секундах). `LIFETIME` определяет интервал обновления для полностью загруженных словарей и интервал инвалидации для кешированных словарей.

Во время обновления старая версия словаря остаётся доступной для запросов. Обновления словаря (за исключением первоначальной загрузки) не блокируют выполнение запросов. Если во время обновления возникает ошибка, она записывается в журнал сервера, и запросы продолжают использовать старую версию словаря. При успешном обновлении старая версия словаря заменяется атомарно.

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

Вы можете задать временной интервал для обновлений, и ClickHouse выберет случайное время в пределах этого диапазона. Это необходимо для распределения нагрузки на источник словаря при обновлении на большом количестве серверов.

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

Если `<min>0</min>` и `<max>0</max>`, ClickHouse не перезагружает словарь по истечении времени ожидания.
В этом случае ClickHouse может перезагрузить словарь раньше, если был изменён файл конфигурации словаря или выполнена команда `SYSTEM RELOAD DICTIONARY`.

При обновлении словарей сервер ClickHouse применяет разную логику в зависимости от типа [источника](#dictionary-sources):

* Для текстового файла проверяется время последнего изменения. Если оно отличается от ранее сохранённого времени, словарь обновляется.
* По умолчанию словари из других источников обновляются каждый раз.

Для других источников (ODBC, PostgreSQL, ClickHouse и т. д.) можно настроить запрос, который будет обновлять словари только при их фактическом изменении, а не каждый раз. Для этого выполните следующие действия:

* В таблице словаря должно быть поле, значение которого всегда изменяется при обновлении исходных данных.
* В настройках источника необходимо указать запрос, который извлекает изменяемое поле. Сервер ClickHouse интерпретирует результат запроса как строку, и если эта строка изменилась по сравнению с предыдущим состоянием, словарь обновляется. Укажите запрос в поле `<invalidate_query>` в настройках для [источника](#dictionary-sources).

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

Словари типа `Flat`, `Hashed`, `HashedArray`, `ComplexKeyHashed` также поддерживают запрос только тех данных, которые изменились после предыдущего обновления. Если в конфигурации источника словаря указан параметр `update_field`, к запросу данных будет добавлено значение времени предыдущего обновления в секундах. В зависимости от типа источника (Executable, HTTP, MySQL, PostgreSQL, ClickHouse или ODBC) перед запросом данных из внешнего источника к `update_field` применяется соответствующая логика.

* Если источником служит HTTP, то `update_field` будет добавлен как параметр запроса, значение которого — время последнего обновления.
* Если источник имеет тип Executable, то `update_field` будет добавлен как аргумент исполняемого скрипта, а временем последнего обновления будет значение этого аргумента.
* Если источником является ClickHouse, MySQL, PostgreSQL или ODBC, будет добавлена дополнительная часть `WHERE`, в которой `update_field` сравнивается с временем последнего обновления по условию «больше или равно».
  * По умолчанию это `WHERE`-условие проверяется на самом внешнем уровне SQL-запроса. При необходимости это же условие можно проверять в любом другом `WHERE`-условии внутри запроса с использованием ключевого слова `{condition}`. Пример:
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

Если параметр `update_field` задан, можно указать дополнительный параметр `update_lag`. Значение параметра `update_lag` вычитается из предыдущего времени обновления перед запросом обновлённых данных.

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

## Источники данных словаря {#dictionary-sources}

<CloudDetails />

Словарь может быть подключен к ClickHouse из самых разных источников.

Если словарь настраивается с помощью XML-файла, конфигурация выглядит следующим образом:

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

В случае [DDL-запроса](../../sql-reference/statements/create/dictionary.md) описанная выше конфигурация будет выглядеть следующим образом:

```sql
CREATE DICTIONARY dict_name (...)
...
SOURCE(SOURCE_TYPE(param1 val1 ... paramN valN)) -- Конфигурация источника
...
```

Источник задаётся в разделе `source`.

Для следующих типов источников: [Local file](#local-file), [Executable file](#executable-file), [HTTP(s)](#https), [ClickHouse](#clickhouse)
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

Типы источников данных (`source_type`):

* [Локальный файл](#local-file)
* [Исполняемый файл](#executable-file)
* [Пул исполняемых программ](#executable-pool)
* [HTTP(S)](#https)
* СУБД
  * [ODBC](#odbc)
  * [MySQL](#mysql)
  * [ClickHouse](#clickhouse)
  * [MongoDB](#mongodb)
  * [Redis](#redis)
  * [Cassandra](#cassandra)
  * [PostgreSQL](#postgresql)

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

* `path` – Абсолютный путь к файлу.
* `format` – Формат файла. Поддерживаются все форматы, описанные в [Formats](/sql-reference/formats).

Когда словарь с источником `FILE` создаётся с помощью DDL-команды (`CREATE DICTIONARY ...`), файл-источник должен находиться в каталоге `user_files`, чтобы предотвратить доступ пользователей БД к произвольным файлам на узле ClickHouse.

**См. также**

* [Функция `dictionary`](/sql-reference/table-functions/dictionary)

### Исполняемый файл {#executable-file}

Работа с исполняемыми файлами зависит от того, [как словарь хранится в памяти](#storing-dictionaries-in-memory). Если словарь хранится с использованием `cache` и `complex_key_cache`, ClickHouse запрашивает необходимые ключи, отправляя запрос через STDIN исполняемого файла. В противном случае ClickHouse запускает исполняемый файл и рассматривает его вывод как данные словаря.

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

* `command` — абсолютный путь к исполняемому файлу или имя файла (если каталог команды находится в переменной окружения `PATH`).
* `format` — формат файла. Поддерживаются все форматы, описанные в [Formats](/sql-reference/formats).
* `command_termination_timeout` — исполняемый скрипт должен содержать основной цикл чтения-записи. После уничтожения словаря канал (pipe) закрывается, и у исполняемого файла будет `command_termination_timeout` секунд на завершение работы до того, как ClickHouse отправит дочернему процессу сигнал SIGTERM. `command_termination_timeout` задаётся в секундах. Значение по умолчанию — 10. Необязательный параметр.
* `command_read_timeout` — таймаут чтения данных из stdout команды в миллисекундах. Значение по умолчанию — 10000. Необязательный параметр.
* `command_write_timeout` — таймаут записи данных в stdin команды в миллисекундах. Значение по умолчанию — 10000. Необязательный параметр.
* `implicit_key` — исполняемый файл-источник может возвращать только значения, а соответствие запрошенным ключам определяется неявно — по порядку строк в результате. Значение по умолчанию — `false`.
* `execute_direct` — если `execute_direct` = `1`, то `command` будет искаться в каталоге `user_scripts`, указанном в [user&#95;scripts&#95;path](../../operations/server-configuration-parameters/settings.md#user_scripts_path). Дополнительные аргументы скрипта можно задавать, разделяя их пробелами. Пример: `script_name arg1 arg2`. Если `execute_direct` = `0`, `command` передаётся как аргумент для `bin/sh -c`. Значение по умолчанию — `0`. Необязательный параметр.
* `send_chunk_header` — управляет тем, нужно ли отправлять количество строк перед отправкой фрагмента данных на обработку. Необязательный параметр. Значение по умолчанию — `false`.

Этот источник словаря может быть настроен только через XML-конфигурацию. Создание словарей с исполняемым источником через DDL отключено; в противном случае пользователь БД смог бы выполнять произвольные бинарные файлы на узле ClickHouse.

### Пул исполняемых процессов {#executable-pool}

Пул исполняемых процессов позволяет загружать данные из пула процессов. Этот источник не работает с макетами словарей, для которых требуется загрузить все данные из источника. Пул исполняемых процессов работает, если словарь [хранится](#ways-to-store-dictionaries-in-memory) с использованием макетов `cache`, `complex_key_cache`, `ssd_cache`, `complex_key_ssd_cache`, `direct` или `complex_key_direct`.

Пул исполняемых процессов создаёт пул процессов с указанной командой и держит их запущенными, пока они не завершатся. Программа должна считывать данные из STDIN, пока они доступны, и выводить результат в STDOUT. Она может ожидать следующий блок данных на STDIN. ClickHouse не будет закрывать STDIN после обработки блока данных, а при необходимости передаст через него следующий фрагмент данных. Исполняемый скрипт должен быть готов к такому способу обработки данных — он должен опрашивать STDIN и как можно раньше сбрасывать данные в STDOUT.

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

* `command` — Абсолютный путь к исполняемому файлу или имя файла (если каталог программы добавлен в `PATH`).
* `format` — Формат файла. Поддерживаются все форматы, описанные в «[Formats](/sql-reference/formats)».
* `pool_size` — Размер пула. Если для `pool_size` указано значение 0, ограничения на размер пула отсутствуют. Значение по умолчанию — `16`.
* `command_termination_timeout` — Исполняемый скрипт должен содержать основной цикл чтения-записи. После уничтожения словаря канал (pipe) закрывается, и у исполняемого файла будет `command_termination_timeout` секунд на завершение работы, прежде чем ClickHouse отправит дочернему процессу сигнал SIGTERM. Задаётся в секундах. Значение по умолчанию — 10. Необязательный параметр.
* `max_command_execution_time` — Максимальное время выполнения команды исполняемого скрипта для обработки блока данных. Задаётся в секундах. Значение по умолчанию — 10. Необязательный параметр.
* `command_read_timeout` — таймаут чтения данных из stdout команды в миллисекундах. Значение по умолчанию — 10000. Необязательный параметр.
* `command_write_timeout` — таймаут записи данных в stdin команды в миллисекундах. Значение по умолчанию — 10000. Необязательный параметр.
* `implicit_key` — Исполняемый источник может возвращать только значения, а соответствие запрошенным ключам определяется неявно — по порядку строк в результате. Значение по умолчанию — `false`. Необязательный параметр.
* `execute_direct` — Если `execute_direct` = `1`, то `command` будет искаться в каталоге `user_scripts`, указанном в параметре [user&#95;scripts&#95;path](../../operations/server-configuration-parameters/settings.md#user_scripts_path). Дополнительные аргументы скрипта можно указать, разделив их пробелами. Пример: `script_name arg1 arg2`. Если `execute_direct` = `0`, `command` передаётся как аргумент для `bin/sh -c`. Значение по умолчанию — `1`. Необязательный параметр.
* `send_chunk_header` — управляет тем, отправлять ли количество строк перед передачей фрагмента данных на обработку. Необязательный параметр. Значение по умолчанию — `false`.

Этот источник словаря может быть настроен только через XML-конфигурацию. Создание словарей с исполняемым источником через DDL отключено, иначе пользователь БД смог бы выполнять произвольные бинарные файлы на узле ClickHouse.

### HTTP(S) {#https}

Работа с HTTP(S)-сервером зависит от того, [как словарь хранится в памяти](#storing-dictionaries-in-memory). Если для словаря используются типы хранения `cache` и `complex_key_cache`, ClickHouse запрашивает необходимые ключи, выполняя POST-запрос.

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

Чтобы ClickHouse мог получить доступ к HTTPS-ресурсу, необходимо [настроить OpenSSL](../../operations/server-configuration-parameters/settings.md#openssl) в конфигурации сервера.

Поля настройки:

* `url` – URL источника.
* `format` – Формат файла. Поддерживаются все форматы, описанные в разделе «[Formats](/sql-reference/formats)».
* `credentials` – Базовая HTTP-аутентификация. Необязательный параметр.
* `user` – Имя пользователя, требуемое для аутентификации.
* `password` – Пароль, требуемый для аутентификации.
* `headers` – Все пользовательские HTTP-заголовки, используемые в HTTP-запросе. Необязательный параметр.
* `header` – Отдельный HTTP-заголовок.
* `name` – Идентификатор, используемый для заголовка, отправляемого в запросе.
* `value` – Значение, устанавливаемое для указанного идентификатора.

При создании словаря с использованием DDL-команды (`CREATE DICTIONARY ...`) удалённые хосты для HTTP-словарей проверяются на соответствие содержимому секции `remote_url_allow_hosts` в конфигурации, чтобы предотвратить доступ пользователей базы данных к произвольному HTTP-серверу.

### СУБД {#dbms}

#### ODBC {#odbc}

Вы можете использовать этот метод для подключения к любой СУБД, для которой есть драйвер ODBC.

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

Поля настроек:

* `db` – Имя базы данных. Опустите его, если имя базы данных задано в параметрах `<connection_string>`.
* `table` – Имя таблицы и (при наличии) схемы.
* `connection_string` – Строка подключения.
* `invalidate_query` – Запрос для проверки состояния словаря. Необязательный параметр. Подробнее см. раздел [Refreshing dictionary data using LIFETIME](#refreshing-dictionary-data-using-lifetime).
* `background_reconnect` – Фоновое переподключение к реплике при сбое соединения. Необязательный параметр.
* `query` – Пользовательский запрос. Необязательный параметр.

:::note
Поля `table` и `query` не могут использоваться одновременно. При этом одно из полей `table` или `query` должно быть объявлено.
:::

ClickHouse получает информацию о символах кавычек от драйвера ODBC и заключает все значения настроек в запросах к драйверу в кавычки, поэтому имя таблицы необходимо указывать в том же регистре, что и в базе данных.

Если у вас возникают проблемы с кодировками при использовании Oracle, см. соответствующий пункт [FAQ](/knowledgebase/oracle-odbc).

##### Известная уязвимость функциональности словаря ODBC {#known-vulnerability-of-the-odbc-dictionary-functionality}

:::note
При подключении к базе данных через ODBC-драйвер параметр подключения `Servername` может быть подменён. В этом случае значения параметров `USERNAME` и `PASSWORD` из `odbc.ini` отправляются на удалённый сервер и могут быть скомпрометированы.
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

Если затем вы выполните, например, следующий запрос:

```sql
SELECT * FROM odbc('DSN=gregtest;Servername=some-server.com', 'test_db');
```

ODBC-драйвер отправит значения `USERNAME` и `PASSWORD` из `odbc.ini` на `some-server.com`.

##### Пример подключения к PostgreSQL {#example-of-connecting-postgresql}

ОС Ubuntu.

Установка unixODBC и ODBC-драйвера для PostgreSQL:

```bash
$ sudo apt-get install -y unixodbc odbcinst odbc-postgresql
```

Настройка `/etc/odbc.ini` (или `~/.odbc.ini`, если вы вошли в систему под пользователем, от которого запускается ClickHouse):

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

Возможно, вам потребуется отредактировать `odbc.ini`, чтобы указать полный путь к библиотеке драйвера `DRIVER=/usr/local/lib/psqlodbcw.so`.

##### Пример подключения MS SQL Server {#example-of-connecting-ms-sql-server}

ОС Ubuntu.

Установка ODBC-драйвера для подключения к MS SQL Server:

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
    # $ cat ~/.odbc.ini # если вы вошли под учётной записью, от имени которой запускается ClickHouse

    [MSSQL]
    Description     = FreeTDS
    Driver          = FreeTDS
    Servername      = MSSQL
    Database        = test
    UID             = test
    PWD             = test
    Port            = 1433


    # (необязательно) тестирование ODBC-соединения (для использования isql-tool установите пакет [unixodbc](https://packages.debian.org/sid/unixodbc))
    $ isql -v MSSQL "user" "password"
```

Примечания:

* чтобы определить минимальную версию TDS, поддерживаемую конкретной версией SQL Server, обратитесь к документации по продукту или см. [MS-TDS Product Behavior](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-tds/135d0ebe-5c4c-4a94-99bf-1811eccb9f4a)

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

#### MySQL {#mysql}

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

* `port` – Порт MySQL-сервера. Его можно указать один раз для всех реплик или для каждой реплики отдельно (внутри `<replica>`).

* `user` – Имя пользователя MySQL. Его можно указать один раз для всех реплик или для каждой реплики отдельно (внутри `<replica>`).

* `password` – Пароль пользователя MySQL. Его можно указать один раз для всех реплик или для каждой реплики отдельно (внутри `<replica>`).

* `replica` – Раздел конфигураций реплик. Может быть несколько таких разделов.

  * `replica/host` – Хост MySQL.
  * `replica/priority` – Приоритет реплики. При попытке подключения ClickHouse обходит реплики в порядке приоритета. Чем меньше число, тем выше приоритет.

* `db` – Имя базы данных.

* `table` – Имя таблицы.

* `where` – Критерий отбора. Синтаксис условий такой же, как для предложения `WHERE` в MySQL, например, `id > 10 AND id < 20`. Необязательный параметр.

* `invalidate_query` – Запрос для проверки состояния словаря. Необязательный параметр. Подробнее см. в разделе [Refreshing dictionary data using LIFETIME](#refreshing-dictionary-data-using-lifetime).

* `fail_on_connection_loss` – Параметр конфигурации, который управляет поведением сервера при потере соединения. Если `true`, исключение выбрасывается немедленно, если соединение между клиентом и сервером было потеряно. Если `false`, сервер ClickHouse делает три попытки повторного выполнения запроса, прежде чем выбросить исключение. Учтите, что повторные попытки приводят к увеличению времени ответа. Значение по умолчанию: `false`.

* `query` – Пользовательский запрос. Необязательный параметр.

:::note
Поля `table` или `where` не могут использоваться совместно с полем `query`. При этом одно из полей `table` или `query` должно быть объявлено.
:::

:::note
Явного параметра `secure` не существует. При установлении SSL-соединения использование защищённого соединения является обязательным.
:::

К MySQL можно подключиться к локальному хосту через сокеты. Для этого задайте `host` и `socket`.

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

* `host` – Хост ClickHouse. Если это локальный хост, запрос обрабатывается без какой-либо сетевой активности. Для повышения отказоустойчивости вы можете создать таблицу [Distributed](../../engines/table-engines/special/distributed.md) и использовать её в последующих конфигурациях.
* `port` – Порт сервера ClickHouse.
* `user` – Имя пользователя ClickHouse.
* `password` – Пароль пользователя ClickHouse.
* `db` – Имя базы данных.
* `table` – Имя таблицы.
* `where` – Критерии выборки. Можно опустить.
* `invalidate_query` – Запрос для проверки состояния словаря. Необязательный параметр. Подробнее см. в разделе [Refreshing dictionary data using LIFETIME](#refreshing-dictionary-data-using-lifetime).
* `secure` – Использовать SSL для подключения.
* `query` – Пользовательский запрос. Необязательный параметр.

:::note
Поля `table` и `where` не могут использоваться вместе с полем `query`. При этом должно быть объявлено одно из полей `table` или `query`.
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

Поля настройки:

* `host` – Хост MongoDB.
* `port` – Порт сервера MongoDB.
* `user` – Имя пользователя MongoDB.
* `password` – Пароль пользователя MongoDB.
* `db` – Имя базы данных.
* `collection` – Имя коллекции.
* `options` - Параметры строки подключения к MongoDB (необязательный параметр).

или

```sql
SOURCE(MONGODB(
    uri 'mongodb://localhost:27017/clickhouse'
    collection 'dictionary_source'
))
```

Поля конфигурации:

* `uri` - URI для установки соединения.
* `collection` – имя коллекции.

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

* `host` – хост Redis.
* `port` – порт сервера Redis.
* `storage_type` – структура внутреннего хранилища Redis, используемая при работе с ключами. `simple` используется для простых источников и для хешированных источников с одним ключом, `hash_map` — для хешированных источников с двумя ключами. Источники с диапазонами и кэш-источники со сложным ключом не поддерживаются. Параметр можно не указывать, значение по умолчанию — `simple`.
* `db_index` – числовой индекс логической базы данных Redis. Параметр можно не указывать, значение по умолчанию — 0.

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

* `host` – хост Cassandra или список хостов, разделённых запятыми.
* `port` – порт серверов Cassandra. Если не указан, используется порт по умолчанию 9042.
* `user` – имя пользователя Cassandra.
* `password` – пароль пользователя Cassandra.
* `keyspace` – имя keyspace (базы данных).
* `column_family` – имя column family (таблицы).
* `allow_filtering` – флаг, разрешающий или запрещающий потенциально дорогостоящие условия по столбцам ключа кластеризации. Значение по умолчанию — 1.
* `partition_key_prefix` – количество столбцов ключа партиции в первичном ключе таблицы Cassandra. Требуется для словарей с составным ключом. Порядок столбцов ключа в определении словаря должен совпадать с порядком в Cassandra. Значение по умолчанию — 1 (первый столбец ключа — ключ партиции, остальные столбцы ключа — ключ кластеризации).
* `consistency` – уровень согласованности. Возможные значения: `One`, `Two`, `Three`, `All`, `EachQuorum`, `Quorum`, `LocalQuorum`, `LocalOne`, `Serial`, `LocalSerial`. Значение по умолчанию — `One`.
* `where` – необязательный критерий отбора.
* `max_threads` – максимальное количество потоков, используемых для загрузки данных из нескольких партиций в словарях с составным ключом.
* `query` – пользовательский запрос. Необязательный параметр.

:::note
Поля `column_family` или `where` не могут использоваться вместе с полем `query`. При этом одно из полей `column_family` или `query` должно быть указано.
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

* `host` – Хост PostgreSQL-сервера. Можно задать один хост для всех реплик или указать его индивидуально для каждой (внутри `<replica>`).
* `port` – Порт PostgreSQL-сервера. Можно задать один порт для всех реплик или указать его индивидуально для каждой (внутри `<replica>`).
* `user` – Имя пользователя PostgreSQL. Можно задать одного пользователя для всех реплик или указать его индивидуально для каждой (внутри `<replica>`).
* `password` – Пароль пользователя PostgreSQL. Можно задать один пароль для всех реплик или указать его индивидуально для каждой (внутри `<replica>`).
* `replica` – Секция конфигурации реплики. Может быть несколько таких секций:
  * `replica/host` – Хост PostgreSQL.
  * `replica/port` – Порт PostgreSQL.
  * `replica/priority` – Приоритет реплики. При попытке подключения ClickHouse перебирает реплики в порядке приоритета. Чем меньше число, тем выше приоритет.
* `db` – Имя базы данных.
* `table` – Имя таблицы.
* `where` – Критерий выборки. Синтаксис условий такой же, как для предложения `WHERE` в PostgreSQL. Например, `id > 10 AND id < 20`. Необязательный параметр.
* `invalidate_query` – Запрос для проверки состояния словаря. Необязательный параметр. Подробнее см. в разделе [Refreshing dictionary data using LIFETIME](#refreshing-dictionary-data-using-lifetime).
* `background_reconnect` – Переподключаться к реплике в фоновом режиме при сбое соединения. Необязательный параметр.
* `query` – Произвольный запрос. Необязательный параметр.

:::note
Поля `table` или `where` не могут использоваться вместе с полем `query`. При этом одно из полей `table` или `query` должно быть задано.
:::

### Null {#null}

Специальный источник, который можно использовать для создания фиктивных (пустых) словарей. Такие словари могут быть полезны для тестов или в конфигурациях с разделением узлов данных и запросов, на узлах с distributed таблицами.

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

Атрибуты описываются с помощью элементов:

* `<id>` — ключевой столбец
* `<attribute>` — столбец данных: атрибутов может быть несколько.

DDL-запрос:

```sql
CREATE DICTIONARY dict_name (
    Id UInt64,
    -- атрибуты
)
PRIMARY KEY Id
...
```

Атрибуты задаются в теле запроса:

* `PRIMARY KEY` — ключевой столбец
* `AttrName AttrType` — столбец данных. Таких атрибутов может быть несколько.

## Ключ {#key}

ClickHouse поддерживает следующие типы ключей:

- Числовой ключ. Тип `UInt64`. Определяется в теге `<id>` или с помощью ключевого слова `PRIMARY KEY`.
- Составной ключ. Набор значений разных типов. Определяется в теге `<key>` или с помощью ключевого слова `PRIMARY KEY`.

XML-структура может содержать либо `<id>`, либо `<key>`. DDL-запрос должен содержать ровно один `PRIMARY KEY`.

:::note
Нельзя описывать ключ в виде атрибута.
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

* `name` – имя столбца с ключами.

Для DDL-запроса:

```sql
CREATE DICTIONARY (
    Id UInt64,
    ...
)
PRIMARY KEY Id
...
```

* `PRIMARY KEY` – Имя столбца, содержащего ключи.

### Составной ключ {#composite-key}

Ключ может представлять собой `tuple` из полей любых типов. В этом случае [layout](#storing-dictionaries-in-memory) должен быть `complex_key_hashed` или `complex_key_cache`.

:::tip
Составной ключ может состоять из одного элемента. Это, например, позволяет использовать строку в качестве ключа.
:::

Структура ключа задаётся в элементе `<key>`. Поля ключа указываются в том же формате, что и [атрибуты](#dictionary-key-and-fields) словаря. Пример:

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

В запросе к функции `dictGet*` в качестве ключа передаётся кортеж. Пример: `dictGetString('dict_name', 'attr_name', tuple('string for field1', num_for_field2))`.

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
| `name`                                               | Имя столбца.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Yes      |
| `type`                                               | Тип данных ClickHouse: [UInt8](../../sql-reference/data-types/int-uint.md), [UInt16](../../sql-reference/data-types/int-uint.md), [UInt32](../../sql-reference/data-types/int-uint.md), [UInt64](../../sql-reference/data-types/int-uint.md), [Int8](../../sql-reference/data-types/int-uint.md), [Int16](../../sql-reference/data-types/int-uint.md), [Int32](../../sql-reference/data-types/int-uint.md), [Int64](../../sql-reference/data-types/int-uint.md), [Float32](../../sql-reference/data-types/float.md), [Float64](../../sql-reference/data-types/float.md), [UUID](../../sql-reference/data-types/uuid.md), [Decimal32](../../sql-reference/data-types/decimal.md), [Decimal64](../../sql-reference/data-types/decimal.md), [Decimal128](../../sql-reference/data-types/decimal.md), [Decimal256](../../sql-reference/data-types/decimal.md),[Date](../../sql-reference/data-types/date.md), [Date32](../../sql-reference/data-types/date32.md), [DateTime](../../sql-reference/data-types/datetime.md), [DateTime64](../../sql-reference/data-types/datetime64.md), [String](../../sql-reference/data-types/string.md), [Array](../../sql-reference/data-types/array.md).<br/>ClickHouse пытается привести значение из словаря к указанному типу данных. Например, для MySQL поле в исходной таблице MySQL может иметь тип `TEXT`, `VARCHAR` или `BLOB`, но при загрузке в ClickHouse оно может иметь тип `String`.<br/>[Nullable](../../sql-reference/data-types/nullable.md) в настоящий момент поддерживается для словарей [Flat](#flat), [Hashed](#hashed), [ComplexKeyHashed](#complex_key_hashed), [Direct](#direct), [ComplexKeyDirect](#complex_key_direct), [RangeHashed](#range_hashed), Polygon, [Cache](#cache), [ComplexKeyCache](#complex_key_cache), [SSDCache](#ssd_cache), [SSDComplexKeyCache](#complex_key_ssd_cache). В словарях [IPTrie](#ip_trie) типы `Nullable` не поддерживаются. | Yes      |
| `null_value`                                         | Значение по умолчанию для несуществующего элемента.<br/>В примере это пустая строка. Значение [NULL](../syntax.md#null) может использоваться только для типов `Nullable` (см. предыдущую строку с описанием типов).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Yes      |
| `expression`                                         | [Выражение](../../sql-reference/syntax.md#expressions), которое ClickHouse выполняет над значением.<br/>Выражением может быть имя столбца в удалённой SQL-базе данных. Таким образом, вы можете использовать его для создания псевдонима для удалённого столбца.<br/><br/>Значение по умолчанию: выражение отсутствует.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | No       |
| <a name="hierarchical-dict-attr"></a> `hierarchical` | Если `true`, атрибут содержит значение родительского ключа для текущего ключа. См. [Иерархические словари](#hierarchical-dictionaries).<br/><br/>Значение по умолчанию: `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | No       |
| `injective`                                          | Флаг, который показывает, является ли отображение `id -> attribute` [инъективным](https://en.wikipedia.org/wiki/Injective_function).<br/>Если `true`, ClickHouse может автоматически выполнять после секции `GROUP BY` обращения к таким словарям. Обычно это значительно сокращает количество таких запросов.<br/><br/>Значение по умолчанию: `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | No       |
| `is_object_id`                                       | Флаг, который показывает, выполняется ли запрос для документа MongoDB по `ObjectID`.<br/><br/>Значение по умолчанию: `false`. |

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

| region&#95;id | parent&#95;region | region&#95;name |
| ------------- | ----------------- | --------------- |
| 1             | 0                 | Russia          |
| 2             | 1                 | Moscow          |
| 3             | 2                 | Center          |
| 4             | 0                 | Great Britain   |
| 5             | 4                 | London          |

Эта таблица содержит столбец `parent_region`, в котором хранится ключ ближайшего родителя для элемента.

ClickHouse поддерживает иерархическое свойство для атрибутов внешних словарей. Это свойство позволяет настраивать иерархический словарь, аналогичный описанному выше.

Функция [dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictGetHierarchy) позволяет получить цепочку родительских элементов.

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

Этот словарь оптимизирован для запросов «точка в полигоне», то есть для задач обратного геокодирования. Получив координату (широта/долгота), он эффективно определяет, какой полигон или регион (из множества полигонов, например границ стран или регионов) содержит эту точку. Он хорошо подходит для сопоставления координат местоположения с регионом, которому они принадлежат.

<iframe width="1024" height="576" src="https://www.youtube.com/embed/FyRsriQp46E?si=Kf8CXoPKEpGQlC-Y" title="Полигональные словари в ClickHouse" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

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

При настройке словаря полигонов ключ должен иметь один из двух типов:

* Простой полигон. Это массив точек.
* MultiPolygon. Это массив полигонов. Каждый полигон — это двумерный массив точек. Первый элемент этого массива — внешняя граница полигона, а последующие элементы задают области, которые необходимо из него исключить.

Точки могут быть заданы в виде массива или кортежа их координат. В текущей реализации поддерживаются только двумерные точки.

Пользователь может загружать свои данные во всех форматах, поддерживаемых ClickHouse.

Доступно 3 типа [хранения в памяти](#storing-dictionaries-in-memory):

* `POLYGON_SIMPLE`. Это наивная реализация, при которой для каждого запроса выполняется линейный проход по всем полигонам, и для каждого из них проверяется принадлежность без использования дополнительных индексов.

* `POLYGON_INDEX_EACH`. Для каждого полигона строится отдельный индекс, что в большинстве случаев позволяет быстро проверить принадлежность (оптимизировано для географических регионов).
  Также на рассматриваемую область накладывается сетка, что существенно сужает количество полигонов, попадающих в рассмотрение.
  Сетка создаётся рекурсивным делением ячейки на 16 равных частей и настраивается двумя параметрами.
  Деление останавливается, когда глубина рекурсии достигает `MAX_DEPTH` или когда ячейка пересекает не более `MIN_INTERSECTIONS` полигонов.
  Для ответа на запрос выбирается соответствующая ячейка и последовательно опрашивается индекс полигонов, хранящихся в ней.

* `POLYGON_INDEX_CELL`. При таком размещении также создаётся описанная выше сетка. Доступны те же параметры. Для каждой ячейки сетки строится индекс по всем фрагментам полигонов, попадающим в неё, что позволяет быстро отвечать на запрос.

* `POLYGON`. Синоним `POLYGON_INDEX_CELL`.

Запросы к словарю выполняются с помощью стандартных [функций](../../sql-reference/functions/ext-dict-functions.md) для работы со словарями.
Важное отличие состоит в том, что здесь ключами будут точки, для которых необходимо найти полигон, их содержащий.

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

В результате выполнения последней команды для каждой точки в таблице `points` будет найден многоугольник минимальной площади, содержащий эту точку, и выведены запрошенные атрибуты.

**Пример**

Вы можете читать столбцы из полигональных словарей с помощью запроса SELECT: просто включите параметр `store_polygon_key_column = 1` в конфигурации словаря или соответствующем DDL-запросе.

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
│ [[[(3,1),(0,1),(0,-1),(3,-1)]]] │ Значение │
└─────────────────────────────────┴───────┘
```

## Словарь на основе дерева регулярных выражений {#regexp-tree-dictionary}

Этот словарь позволяет сопоставлять ключи со значениями на основе иерархических шаблонов регулярных выражений. Он оптимизирован для поиска по совпадению с шаблоном (например, для классификации строк, таких как строки user agent, путём сопоставления с шаблонами регулярных выражений), а не для точного совпадения ключей.

<iframe width="1024" height="576" src="https://www.youtube.com/embed/ESlAhUJMoz8?si=sY2OVm-zcuxlDRaX" title="Введение в словари ClickHouse на основе дерева регулярных выражений" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### Использование словаря на основе дерева регулярных выражений в ClickHouse с открытым исходным кодом {#use-regular-expression-tree-dictionary-in-clickhouse-open-source}

Словари на основе дерева регулярных выражений в ClickHouse с открытым исходным кодом определяются с использованием источника YAMLRegExpTree, которому указывается путь к YAML‑файлу, содержащему дерево регулярных выражений.

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

Источник словаря `YAMLRegExpTree` описывает структуру дерева регулярных выражений. Например:

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

* **regexp**: регулярное выражение узла.
* **attributes**: список пользовательских атрибутов словаря. В этом примере есть два атрибута: `name` и `version`. Первый узел определяет оба атрибута. Второй узел определяет только атрибут `name`. Атрибут `version` задаётся дочерними узлами второго узла.
  * Значение атрибута может содержать **обратные ссылки**, указывающие на группы захвата в сопоставленном регулярном выражении. В примере значение атрибута `version` в первом узле состоит из обратной ссылки `\1` на группу захвата `(\d+[\.\d]*)` в регулярном выражении. Номера обратных ссылок лежат в диапазоне от 1 до 9 и записываются как `$1` или `\1` (для номера 1). Во время выполнения запроса обратная ссылка заменяется соответствующей группой захвата.
* **child nodes**: список дочерних узлов узла дерева regexp, каждый из которых имеет собственные атрибуты и (потенциально) дочерние узлы. Сопоставление строки выполняется в порядке обхода дерева в глубину. Если строка соответствует узлу regexp, словарь проверяет, соответствует ли она также дочерним узлам этого узла. Если да, используются атрибуты самого глубокого совпавшего узла. Атрибуты дочернего узла переопределяют одноимённые атрибуты родительских узлов. Имя дочерних узлов в файлах YAML может быть произвольным, например `versions` в приведённом выше примере.

Словари на основе дерева регулярных выражений допускают доступ только с использованием функций `dictGet`, `dictGetOrDefault` и `dictGetAll`.

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

В этом случае мы сначала сопоставляем регулярное выражение `\d+/tclwebkit(?:\d+[\.\d]*)` со вторым узлом верхнего уровня. Затем словарь продолжает обход дочерних узлов и обнаруживает, что строка также совпадает с `3[12]/tclwebkit`. В результате значение атрибута `name` равно `Android` (определено на верхнем уровне), а значение атрибута `version` равно `12` (определено в дочернем узле).

Используя мощный файл конфигурации YAML, мы можем использовать словарь в виде дерева регулярных выражений в качестве парсера строк User-Agent. Поддерживается [uap-core](https://github.com/ua-parser/uap-core), и в функциональном тесте [02504&#95;regexp&#95;dictionary&#95;ua&#95;parser](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/02504_regexp_dictionary_ua_parser.sh) показано, как его использовать.

#### Сбор значений атрибутов {#collecting-attribute-values}

Иногда полезно возвращать значения из нескольких регулярных выражений, которые сработали при сопоставлении, а не только значение конечного узла. В таких случаях можно использовать специализированную функцию [`dictGetAll`](../../sql-reference/functions/ext-dict-functions.md#dictGetAll). Если узел имеет значение атрибута типа `T`, `dictGetAll` вернет `Array(T)`, содержащий ноль или более значений.

По умолчанию количество совпадений, возвращаемых на один ключ, не ограничено. Ограничение можно передать в качестве необязательного четвертого аргумента в `dictGetAll`. Массив заполняется в *топологическом порядке*, что означает, что дочерние узлы идут перед родительскими, а узлы на одном уровне следуют порядку в исходных данных.

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
# /var/lib/clickhouse/user_files/regexp_tree.yaml {#varlibclickhouseuser_filesregexp_treeyaml}
- regexp: 'clickhouse\.com'
  tag: 'ClickHouse'
  topological_index: 1
  paths:
    - regexp: 'clickhouse\.com/docs(.*)'
      tag: 'Документация ClickHouse'
      topological_index: 0
      captured: '\1'
      parent: 'ClickHouse'

- regexp: '/docs(/|$)'
  tag: 'Документация'
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
│ clickhouse.com/docs/en                 │ (['Документация ClickHouse','ClickHouse'],[0,1],['/en'],['ClickHouse'])              │
│ github.com/clickhouse/tree/master/docs │ (['Документация','GitHub'],[2,3],[NULL],[])                                          │
└────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────┘
```

#### Режимы сопоставления {#matching-modes}

Поведение сопоставления по шаблону можно изменить с помощью определённых настроек словаря:

- `regexp_dict_flag_case_insensitive`: Использовать регистронезависимое сопоставление (по умолчанию `false`). Может быть переопределено в отдельных выражениях с помощью `(?i)` и `(?-i)`.
- `regexp_dict_flag_dotall`: Разрешает символу `.` сопоставляться с символами перевода строки (по умолчанию `false`).

### Использование словаря дерева регулярных выражений в ClickHouse Cloud {#use-regular-expression-tree-dictionary-in-clickhouse-cloud}

Ранее использованный источник `YAMLRegExpTree` работает в ClickHouse Open Source, но не в ClickHouse Cloud. Чтобы использовать словари дерева регулярных выражений в ClickHouse Cloud, сначала создайте такой словарь локально в ClickHouse Open Source из YAML-файла, затем выгрузите этот словарь в CSV-файл с помощью табличной функции `dictionary` и предложения [INTO OUTFILE](../statements/select/into-outfile.md).

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

Схема файла дампа:

* `id UInt64`: идентификатор узла RegexpTree.
* `parent_id UInt64`: идентификатор родительского узла.
* `regexp String`: строка регулярного выражения.
* `keys Array(String)`: имена пользовательских атрибутов.
* `values Array(String)`: значения пользовательских атрибутов.

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

Затем обновите локальный CSV, выполнив

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

Подробнее см. раздел [Insert Local Files](/integrations/data-ingestion/insert-local-files). После инициализации исходной таблицы мы можем создать RegexpTree на основе исходной таблицы:

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

Это позволяет вам:

- Использовать ID региона, чтобы получить его название на нужном языке.
- Использовать ID региона, чтобы получить ID города, области, федерального округа, страны или континента.
- Проверять, входит ли регион в состав другого региона.
- Получать цепочку родительских регионов.

Все функции поддерживают «транслокальность» — возможность одновременно использовать разные представления владения регионами. Для получения дополнительной информации см. раздел «Функции для работы с веб-аналитическими словарями».

Встроенные словари отключены в стандартном пакете по умолчанию.
Чтобы их включить, раскомментируйте параметры `path_to_regions_hierarchy_file` и `path_to_regions_names_files` в конфигурационном файле сервера.

Геобаза загружается из текстовых файлов.

Поместите файлы `regions_hierarchy*.txt` в директорию `path_to_regions_hierarchy_file`. Этот параметр конфигурации должен содержать путь к файлу `regions_hierarchy.txt` (иерархия регионов по умолчанию), а остальные файлы (`regions_hierarchy_ua.txt`) должны находиться в той же директории.

Поместите файлы `regions_names_*.txt` в директорию `path_to_regions_names_files`.

Вы также можете создать эти файлы самостоятельно. Формат файла следующий:

`regions_hierarchy*.txt`: TabSeparated (без заголовка), столбцы:

- ID региона (`UInt32`)
- ID родительского региона (`UInt32`)
- тип региона (`UInt8`): 1 — континент, 3 — страна, 4 — федеральный округ, 5 — регион, 6 — город; остальные типы не используются
- население (`UInt32`) — необязательный столбец

`regions_names_*.txt`: TabSeparated (без заголовка), столбцы:

- ID региона (`UInt32`)
- название региона (`String`) — не может содержать символы табуляции или перевода строки, даже экранированные.

Для хранения в RAM используется плоский массив. По этой причине ID не должны превышать один миллион.

Словари можно обновлять без перезапуска сервера. Однако набор доступных словарей не обновляется.
Для обновления проверяются времена модификации файлов. Если файл изменился, словарь обновляется.
Интервал проверки изменений настраивается параметром `builtin_dictionaries_reload_interval`.
Обновления словарей (помимо загрузки при первом использовании) не блокируют запросы. Во время обновлений запросы используют старые версии словарей. Если при обновлении возникает ошибка, она записывается в лог сервера, а запросы продолжают использовать старую версию словарей.

Рекомендуется периодически обновлять словари с геобазой. Во время обновления генерируйте новые файлы и записывайте их в отдельный каталог. Когда всё будет готово, переименуйте их в файлы, используемые сервером.

Также существуют функции для работы с идентификаторами ОС и поисковыми системами, но их не следует использовать.