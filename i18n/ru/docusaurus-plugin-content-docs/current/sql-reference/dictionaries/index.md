---
description: 'Обзор функциональных возможностей внешних словарей в ClickHouse'
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

Словарь — это отображение (`key -> attributes`), удобное для различных типов справочных списков.

ClickHouse поддерживает специальные функции для работы со словарями, которые можно использовать в запросах. Использовать словари с функциями проще и эффективнее, чем `JOIN` со справочными таблицами.

ClickHouse поддерживает:

- Словари с [набором функций](../../sql-reference/functions/ext-dict-functions.md).
- [Встроенные словари](#embedded-dictionaries) с определённым [набором функций](../../sql-reference/functions/embedded-dict-functions.md).

:::tip Tutorial
Если вы только начинаете работать со словарями в ClickHouse, у нас есть руководство, посвящённое этой теме. Ознакомьтесь с ним [здесь](tutorial.md).
:::

Вы можете добавлять собственные словари из различных источников данных. Источником для словаря может быть таблица ClickHouse, локальный текстовый или исполняемый файл, ресурс HTTP(s) или другая СУБД. Для получения дополнительной информации см. раздел «[Источники словарей](#dictionary-sources)».

ClickHouse:

- Полностью или частично хранит словари в оперативной памяти (RAM).
- Периодически обновляет словари и динамически загружает отсутствующие значения. Другими словами, словари могут загружаться динамически.
- Позволяет создавать словари с помощью XML-файлов или [DDL-запросов](../../sql-reference/statements/create/dictionary.md).

Конфигурация словарей может быть расположена в одном или нескольких XML-файлах. Путь к конфигурации задаётся параметром [dictionaries_config](../../operations/server-configuration-parameters/settings.md#dictionaries_config).

Словари могут загружаться при запуске сервера или при первом использовании, в зависимости от настройки [dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load).

Системная таблица [dictionaries](/operations/system-tables/dictionaries) содержит информацию о словарях, настроенных на сервере. Для каждого словаря вы можете найти там:

- Статус словаря.
- Параметры конфигурации.
- Метрики, такие как объём RAM, выделенный для словаря, или количество запросов с момента успешной загрузки словаря.

<CloudDetails />



## Создание словаря с помощью DDL-запроса {#creating-a-dictionary-with-a-ddl-query}

Словари можно создавать с помощью [DDL-запросов](../../sql-reference/statements/create/dictionary.md), и это рекомендуемый способ, поскольку у словарей, созданных с помощью DDL:
- В конфигурационные файлы сервера не добавляются дополнительные записи.
- Со словарями можно работать как с полноправными сущностями, подобно таблицам или представлениям.
- Данные можно читать напрямую, используя привычный SELECT, а не табличные функции для словарей. Обратите внимание, что при непосредственном доступе к словарю через оператор SELECT кэшируемый словарь вернёт только данные, уже находящиеся в кэше, тогда как некэшируемый словарь вернёт все данные, которые он хранит.
- Словари можно легко переименовывать.



## Создание словаря с помощью файла конфигурации

<CloudNotSupportedBadge />

:::note
Создание словаря с помощью файла конфигурации в ClickHouse Cloud не поддерживается. Пожалуйста, используйте DDL (см. выше) и создайте словарь от имени пользователя `default`.
:::

Файл конфигурации словаря имеет следующий формат:

```xml
<clickhouse>
    <comment>Необязательный элемент с любым содержимым. Игнорируется сервером ClickHouse.</comment>

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
Вы можете преобразовать значения для небольшого словаря, описав его в запросе `SELECT` (см. функцию [transform](../../sql-reference/functions/other-functions.md)). Данная функциональность не относится к словарям.
:::


## Настройка словаря

<CloudDetails />

Если словарь настраивается с помощью XML-файла, конфигурация словаря имеет следующую структуру:

```xml
<dictionary>
    <name>dict_name</name>

    <structure>
      <!-- Конфигурация сложного ключа -->
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
PRIMARY KEY ... -- настройка составного или одиночного ключа
SOURCE(...) -- Настройка источника
LAYOUT(...) -- Настройка размещения в памяти
LIFETIME(...) -- Время жизни словаря в памяти
```


## Хранение словарей в памяти

Существует несколько способов хранения словарей в памяти.

Мы рекомендуем [flat](#flat), [hashed](#hashed) и [complex&#95;key&#95;hashed](#complex_key_hashed), которые обеспечивают оптимальную скорость обработки.

Кэширование не рекомендуется из-за потенциально низкой производительности и сложности подбора оптимальных параметров. Подробнее см. в разделе [cache](#cache).

Существует несколько способов повысить производительность словарей:

* Вызывайте функцию для работы со словарём после `GROUP BY`.
* Помечайте извлекаемые атрибуты как инъективные. Атрибут называется инъективным, если разным ключам соответствуют разные значения атрибута. Поэтому, когда `GROUP BY` использует функцию, извлекающую значение атрибута по ключу, эта функция автоматически выносится из `GROUP BY`.

ClickHouse генерирует исключение при ошибках, связанных со словарями. Примеры ошибок:

* Не удалось загрузить словарь, к которому выполняется обращение.
* Ошибка при запросе к словарю типа `cached`.

Вы можете посмотреть список словарей и их статусы в таблице [system.dictionaries](../../operations/system-tables/dictionaries.md).

<CloudDetails />

Конфигурация выглядит следующим образом:

```xml
<clickhouse>
    <dictionary>
        ...
        <layout>
            <layout_type>
                <!-- настройки layout -->
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
LAYOUT(LAYOUT_TYPE(param value)) -- настройки структуры хранения
...
```

Словари, в названии макета которых отсутствует слово `complex-key*`, имеют ключ типа [UInt64](../../sql-reference/data-types/int-uint.md), словари с макетом `complex-key*` используют составной ключ (complex, с произвольными типами).

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

Составные ключи типа `complex` в XML-словарях определяются с помощью тега `<key>`.

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


## Способы хранения словарей в памяти

Различные способы хранения данных словаря в памяти связаны с компромиссами по потреблению CPU и RAM. Дерево решений, опубликованное в разделе [Choosing a Layout](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout) [статьи в блоге](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse), посвящённой словарям, является хорошей отправной точкой для выбора подходящего типа размещения.

* [flat](#flat)
* [hashed](#hashed)
* [sparse&#95;hashed](#sparse_hashed)
* [complex&#95;key&#95;hashed](#complex_key_hashed)
* [complex&#95;key&#95;sparse&#95;hashed](#complex_key_sparse_hashed)
* [hashed&#95;array](#hashed_array)
* [complex&#95;key&#95;hashed&#95;array](#complex_key_hashed_array)
* [range&#95;hashed](#range_hashed)
* [complex&#95;key&#95;range&#95;hashed](#complex_key_range_hashed)
* [cache](#cache)
* [complex&#95;key&#95;cache](#complex_key_cache)
* [ssd&#95;cache](#ssd_cache)
* [complex&#95;key&#95;ssd&#95;cache](#complex_key_ssd_cache)
* [direct](#direct)
* [complex&#95;key&#95;direct](#complex_key_direct)
* [ip&#95;trie](#ip_trie)

### flat

Словарь полностью хранится в памяти в виде плоских массивов. Сколько памяти использует словарь? Объём пропорционален значению наибольшего ключа (в занимаемом им пространстве).

Ключ словаря имеет тип [UInt64](../../sql-reference/data-types/int-uint.md), а значение ограничено `max_array_size` (по умолчанию — 500,000). Если при создании словаря обнаруживается ключ с большим значением, ClickHouse генерирует исключение и не создаёт словарь. Начальный размер плоских массивов словаря задаётся настройкой `initial_array_size` (по умолчанию — 1024).

Поддерживаются все типы источников. При обновлении данные (из файла или таблицы) читаются целиком.

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

### hashed

Словарь полностью хранится в памяти в виде хеш-таблицы. Словарь может содержать любое количество элементов с произвольными идентификаторами. На практике количество ключей может достигать десятков миллионов.

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
    <!-- Если количество шардов больше 1 (по умолчанию `1`), словарь будет загружать
         данные параллельно, что полезно при большом количестве элементов в одном
         словаре. -->
    <shards>10</shards>

    <!-- Размер буфера блоков в параллельной очереди.

         Поскольку узким местом при параллельной загрузке является рехеширование, для избежания
         простоя из-за потока, выполняющего рехеширование, необходимо иметь
         буфер.

         10000 — оптимальный баланс между памятью и скоростью.
         Даже для 10e10 элементов обрабатывает всю нагрузку без простоев. -->
    <shard_load_queue_backlog>10000</shard_load_queue_backlog>

    <!-- Максимальный коэффициент заполнения хеш-таблицы. При больших значениях память
         используется эффективнее (меньше памяти расходуется впустую), но производительность
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

### sparse&#95;hashed

Похожа на `hashed`, но использует меньше памяти за счёт большего потребления ресурсов CPU.

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

Для этого типа словаря также можно использовать `shards`, и опять же это более важно для `sparse_hashed`, чем для `hashed`, так как `sparse_hashed` работает медленнее.

### complex&#95;key&#95;hashed

Этот тип хранения словаря предназначен для использования с составными [ключами](#dictionary-key-and-fields). Аналогичен типу `hashed`.

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

### complex&#95;key&#95;sparse&#95;hashed

Этот тип хранилища предназначен для использования с составными [ключами](#dictionary-key-and-fields). Аналогичен [sparse&#95;hashed](#sparse_hashed).

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

### hashed&#95;array

Словарь полностью хранится в памяти. Каждый атрибут хранится в массиве. Атрибут-ключ хранится в виде хеш-таблицы, где значение — это индекс в массиве атрибутов. Словарь может содержать любое количество элементов с любыми идентификаторами. На практике число ключей может достигать десятков миллионов.

Ключ словаря имеет тип [UInt64](../../sql-reference/data-types/int-uint.md).

Поддерживаются все типы источников. При обновлении данные (из файла или из таблицы) читаются целиком.

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

### complex&#95;key&#95;hashed&#95;array

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

### range&#95;hashed

Словарь хранится в памяти в виде хеш-таблицы с упорядоченным массивом диапазонов и соответствующими им значениями.

Ключ словаря имеет тип [UInt64](../../sql-reference/data-types/int-uint.md).
Этот способ хранения работает так же, как словарь типа `hashed`, и позволяет использовать диапазоны значений даты/времени (любого числового типа) в дополнение к ключу.

Пример: таблица содержит скидки для каждого рекламодателя в формате:

```text
┌─advertiser_id─┬─discount_start_date─┬─discount_end_date─┬─amount─┐
│           123 │          2015-01-16 │        2015-01-31 │   0.25 │
│           123 │          2015-01-01 │        2015-01-15 │   0.15 │
│           456 │          2015-01-01 │        2015-01-15 │   0.05 │
└───────────────┴─────────────────────┴───────────────────┴────────┘
```


Чтобы использовать выборку по диапазонам дат, определите элементы `range_min` и `range_max` в [структуре](#dictionary-key-and-fields). Эти элементы должны содержать элементы `name` и `type` (если `type` не указан, по умолчанию используется тип Date). `type` может быть любым числовым типом (Date / DateTime / UInt64 / Int32 / другие).

:::note
Значения `range_min` и `range_max` должны умещаться в диапазон типа `Int64`.
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

Чтобы работать с этими словарями, необходимо передать функции `dictGet` дополнительный аргумент, для которого задаётся диапазон:

```sql
dictGet('dict_name', 'attr_name', id, date)
```

Пример запроса:

```sql
SELECT dictGet('discounts_dict', 'amount', 1, '2022-10-20'::Date);
```

Эта функция возвращает значение для указанных `id` и диапазона дат, охватывающего переданную дату.

Подробности алгоритма:

* Если `id` не найден или для `id` не найден диапазон, возвращается значение по умолчанию для типа атрибута.
* Если есть пересекающиеся диапазоны и `range_lookup_strategy=min`, возвращается подходящий диапазон с минимальным `range_min`; если найдено несколько таких диапазонов, возвращается диапазон с минимальным `range_max`; если снова найдено несколько диапазонов (несколько диапазонов имеют одинаковые `range_min` и `range_max`), возвращается случайный диапазон из них.
* Если есть пересекающиеся диапазоны и `range_lookup_strategy=max`, возвращается подходящий диапазон с максимальным `range_min`; если найдено несколько таких диапазонов, возвращается диапазон с максимальным `range_max`; если снова найдено несколько диапазонов (несколько диапазонов имеют одинаковые `range_min` и `range_max`), возвращается случайный диапазон из них.
* Если `range_max` равен `NULL`, диапазон считается открытым. `NULL` трактуется как максимально возможное значение. Для `range_min` в качестве открытого значения могут использоваться `1970-01-01` или `0` (-MAX&#95;INT).

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
│ 0.1 │ -- совпадает только один диапазон: 2015-01-01 – Null
└─────┘

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-16')) res;
┌─res─┐
│ 0.2 │ -- совпадают два диапазона, range_min 2015-01-15 (0.2) больше, чем 2015-01-01 (0.1)
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.4 │ -- совпадают два диапазона, range_min 2015-01-04 (0.4) больше, чем 2015-01-01 (0.3)
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.5 │ -- совпадают два диапазона, значения range_min равны; 2015-01-15 (0.5) больше, чем 2015-01-10 (0.6)
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
│ 0.1 │ -- совпадает только один диапазон: 2015-01-01 – Null
└─────┘



select dictGet(&#39;discounts&#95;dict&#39;, &#39;amount&#39;, 1, toDate(&#39;2015-01-16&#39;)) res;
┌─res─┐
│ 0.1 │ -- совпадают два диапазона, range&#95;min 2015-01-01 (0.1) меньше чем 2015-01-15 (0.2)
└─────┘

select dictGet(&#39;discounts&#95;dict&#39;, &#39;amount&#39;, 2, toDate(&#39;2015-01-06&#39;)) res;
┌─res─┐
│ 0.3 │ -- совпадают два диапазона, range&#95;min 2015-01-01 (0.3) меньше чем 2015-01-04 (0.4)
└─────┘

select dictGet(&#39;discounts&#95;dict&#39;, &#39;amount&#39;, 3, toDate(&#39;2015-01-01&#39;)) res;
┌─res─┐
│ 0.6 │ -- совпадают два диапазона, значения range&#95;min равны, 2015-01-10 (0.6) меньше чем 2015-01-15 (0.5)
└─────┘

````

### complex_key_range_hashed

Словарь хранится в памяти в виде хеш-таблицы с упорядоченным массивом диапазонов и их соответствующими значениями (см. [range_hashed](#range_hashed)). Данный тип хранения используется с составными [ключами](#dictionary-key-and-fields).

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

### cache

Словарь хранится в кэше с фиксированным количеством ячеек. Эти ячейки содержат часто используемые элементы.

Ключ словаря имеет тип [UInt64](../../sql-reference/data-types/int-uint.md).

При обращении к словарю сначала производится поиск в кэше. Для каждого блока данных все ключи, которые не найдены в кэше или устарели, запрашиваются из источника с помощью `SELECT attrs... FROM db.table WHERE id IN (k1, k2, ...)`. Полученные данные затем записываются в кэш.

Если часть ключей не найдена в словаре, создаётся задача обновления кэша и добавляется в очередь обновлений. Свойствами очереди обновлений можно управлять с помощью настроек `max_update_queue_size`, `update_queue_push_timeout_milliseconds`, `query_wait_timeout_milliseconds`, `max_threads_for_updates`.

Для словарей типа cache можно задать время жизни ([lifetime](#refreshing-dictionary-data-using-lifetime)) данных в кэше. Если с момента загрузки данных в ячейку прошло больше времени, чем `lifetime`, значение ячейки не используется, и ключ считается просроченным. Ключ будет повторно запрошен при следующем обращении. Такое поведение можно настроить с помощью параметра `allow_read_expired_keys`.

Это наименее эффективный из всех способов хранения словарей. Производительность кэша сильно зависит от корректных настроек и сценариев использования. Словарь типа cache работает хорошо только при достаточно высоком уровне попаданий (рекомендуется 99% и выше). Средний уровень попаданий можно посмотреть в таблице [system.dictionaries](../../operations/system-tables/dictionaries.md).

Если настройка `allow_read_expired_keys` установлена в 1 (по умолчанию 0), словарь может поддерживать асинхронные обновления. Если клиент запрашивает ключи и все они находятся в кэше, но некоторые из них просрочены, словарь вернёт клиенту просроченные значения и асинхронно запросит их из источника.

Для повышения производительности кэша используйте подзапрос с `LIMIT` и вызывайте функцию, использующую словарь, снаружи.

Поддерживаются все типы источников.

Пример настроек:


```xml
<layout>
    <cache>
        <!-- Размер кэша в количестве ячеек. Округляется до ближайшей степени двойки. -->
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

Задайте достаточно большой размер кэша. Необходимо поэкспериментировать, чтобы подобрать количество ячеек:

1. Задайте некоторое значение.
2. Выполняйте запросы, пока кэш полностью не заполнится.
3. Оцените потребление памяти с помощью таблицы `system.dictionaries`.
4. Увеличивайте или уменьшайте количество ячеек, пока не будет достигнут требуемый уровень потребления памяти.

:::note
Не используйте ClickHouse в качестве источника, так как он медленно обрабатывает запросы со случайным чтением.
:::

### complex&#95;key&#95;cache

Этот тип хранилища предназначен для работы с составными [ключами](#dictionary-key-and-fields). Аналогичен `cache`.

### ssd&#95;cache

Аналогичен `cache`, но хранит данные на SSD, а индекс — в RAM. Все настройки словарей типа cache, связанные с очередью обновления, также могут применяться к словарям SSD cache.

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
        <!-- Размер буфера оперативной памяти в байтах для агрегирования элементов перед сбросом на SSD. -->
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

### complex&#95;key&#95;ssd&#95;cache

Этот тип хранилища предназначен для составных [ключей](#dictionary-key-and-fields). Аналогичен `ssd_cache`.

### direct

Словарь не хранится в памяти, и при обработке запроса данные запрашиваются непосредственно из источника.

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

### complex&#95;key&#95;direct

Этот тип хранилища предназначен для использования с составными [ключами](#dictionary-key-and-fields). Аналогичен `direct`.

### ip&#95;trie

Этот словарь предназначен для поиска IP-адресов по сетевому префиксу. Он хранит IP-диапазоны в нотации CIDR и позволяет быстро определить, к какому префиксу (например, подсети или диапазону ASN) относится заданный IP, что делает его идеальным для поисковых операций по IP, таких как геолокация или классификация сетей.

<iframe width="1024" height="576" src="https://www.youtube.com/embed/4dxMAqltygk?si=rrQrneBReK6lLfza" title="Поиск по IP с использованием словаря ip_trie" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

**Пример**

Предположим, у нас есть таблица в ClickHouse, которая содержит наши IP-префиксы и соответствующие им соответствия:

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

Давайте определим словарь `ip_trie` для этой таблицы. Структура `ip_trie` требует составного ключа:

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

Синтаксис выглядит следующим образом:

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

Другие типы пока не поддерживаются. Функция возвращает атрибут для префикса, который соответствует этому IP-адресу. Если есть перекрывающиеся префиксы, возвращается наиболее специфичный.

Данные должны полностью помещаться в оперативную память.


## Обновление данных словарей с помощью LIFETIME

ClickHouse периодически обновляет словари на основе тега `LIFETIME` (задается в секундах). `LIFETIME` — это интервал обновления для полностью загружаемых словарей и интервал инвалидации для кэшируемых словарей.

Во время обновления старая версия словаря может по-прежнему использоваться в запросах. Обновление словарей (кроме первоначальной загрузки словаря) не блокирует выполнение запросов. Если во время обновления происходит ошибка, она записывается в лог сервера, а запросы продолжают выполняться со старой версией словаря. Если обновление словаря завершилось успешно, старая версия словаря атомарно заменяется новой.

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

Установка значения `<lifetime>0</lifetime>` (`LIFETIME(0)`) предотвращает обновление словарей.

Вы можете задать интервал времени для обновлений, и ClickHouse выберет равномерно случайный момент времени внутри этого диапазона. Это необходимо для распределения нагрузки на источник словаря при обновлении на большом количестве серверов.

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

Если `<min>0</min>` и `<max>0</max>`, ClickHouse не перезагружает словарь по истечении таймаута.
В этом случае ClickHouse может перезагрузить словарь раньше, если был изменён конфигурационный файл словаря или выполнена команда `SYSTEM RELOAD DICTIONARY`.

При обновлении словарей сервер ClickHouse применяет разную логику в зависимости от типа [источника](#dictionary-sources):

* Для текстового файла проверяется время модификации. Если оно отличается от ранее зафиксированного, словарь обновляется.
* Словари из других источников по умолчанию обновляются каждый раз.

Для других источников (ODBC, PostgreSQL, ClickHouse и т. д.) можно настроить запрос, который будет обновлять словари только в том случае, если они действительно изменились, а не каждый раз. Для этого выполните следующие шаги:

* Таблица словаря должна содержать поле, которое всегда изменяется при обновлении исходных данных.
* В настройках источника должен быть указан запрос, который извлекает это изменяющееся поле. Сервер ClickHouse интерпретирует результат запроса как одну строку, и если эта строка изменилась по сравнению с предыдущим состоянием, словарь обновляется. Укажите запрос в поле `<invalidate_query>` в настройках для [источника](#dictionary-sources).

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

Также для словарей `Flat`, `Hashed`, `HashedArray`, `ComplexKeyHashed` можно запрашивать только те данные, которые были изменены после предыдущего обновления. Если `update_field` указан как часть конфигурации источника словаря, к запросу данных будет добавлено значение времени предыдущего обновления в секундах. В зависимости от типа источника (Executable, HTTP, MySQL, PostgreSQL, ClickHouse или ODBC) к `update_field` будет применяться различная логика перед запросом данных из внешнего источника.


* Если источником является HTTP, то `update_field` будет добавлен как параметр запроса со временем последнего обновления в качестве значения.
* Если источником является Executable, то `update_field` будет добавлен как аргумент исполняемого файла со временем последнего обновления в качестве значения аргумента.
* Если источником является ClickHouse, MySQL, PostgreSQL или ODBC, будет добавлена дополнительная часть `WHERE`, где `update_field` сравнивается как больше или равно времени последнего обновления.
  * По умолчанию это условие `WHERE` проверяется на самом верхнем уровне SQL‑запроса. При необходимости это условие можно проверить в любом другом выражении `WHERE` внутри запроса с использованием ключевого слова `{condition}`. Пример:
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

Если опция `update_field` задана, можно задать дополнительную опцию `update_lag`. Значение опции `update_lag` вычитается из предыдущего времени обновления перед запросом обновлённых данных.

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


## Источники словарей

<CloudDetails />

Словарь можно подключать к ClickHouse из самых разных источников.

Если словарь настроен с использованием XML-файла, конфигурация выглядит так:

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

В случае использования [DDL-запроса](../../sql-reference/statements/create/dictionary.md) описанная выше конфигурация будет выглядеть следующим образом:

```sql
CREATE DICTIONARY dict_name (...)
...
SOURCE(SOURCE_TYPE(param1 val1 ... paramN valN)) -- Конфигурация источника
...
```

Источник конфигурируется в разделе `source`.

Для следующих типов источников: [Local file](#local-file), [Executable file](#executable-file), [HTTP(s)](#https), [ClickHouse](#clickhouse)
доступны дополнительные параметры:

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

* [Локальный файл](#local-file)
* [Исполняемый файл](#executable-file)
* [Пул исполняемых файлов](#executable-pool)
* [HTTP(S)](#https)
* СУБД
  * [ODBC](#odbc)
  * [MySQL](#mysql)
  * [ClickHouse](#clickhouse)
  * [MongoDB](#mongodb)
  * [Redis](#redis)
  * [Cassandra](#cassandra)
  * [PostgreSQL](#postgresql)

### Локальный файл

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

Настройки полей:

* `path` – абсолютный путь к файлу.
* `format` – формат файла. Поддерживаются все форматы, описанные в [Форматы](/sql-reference/formats).

Когда словарь с источником `FILE` создаётся с помощью DDL-команды (`CREATE DICTIONARY ...`), файл-источник должен находиться в каталоге `user_files`, чтобы предотвратить доступ пользователей БД к произвольным файлам на узле ClickHouse.

**См. также**

* [Функция `dictionary`](/sql-reference/table-functions/dictionary)

### Исполняемый файл

Работа с исполняемыми файлами зависит от того, [как словарь хранится в памяти](#storing-dictionaries-in-memory). Если словарь хранится с использованием `cache` и `complex_key_cache`, ClickHouse запрашивает необходимые ключи, отправляя запрос на STDIN исполняемого файла. В противном случае ClickHouse запускает исполняемый файл и интерпретирует его вывод как данные словаря.

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

Задание полей:


* `command` — абсолютный путь к исполняемому файлу или имя файла (если каталог с командой находится в `PATH`).
* `format` — формат файла. Поддерживаются все форматы, описанные в разделе [Formats](/sql-reference/formats).
* `command_termination_timeout` — исполняемый скрипт должен содержать основной цикл чтения и записи. После уничтожения словаря канал (pipe) закрывается, и у исполняемого файла будет `command_termination_timeout` секунд на завершение работы, прежде чем ClickHouse отправит дочернему процессу сигнал SIGTERM. `command_termination_timeout` задаётся в секундах. Значение по умолчанию — 10. Необязательный параметр.
* `command_read_timeout` — таймаут чтения данных из stdout команды в миллисекундах. Значение по умолчанию — 10000. Необязательный параметр.
* `command_write_timeout` — таймаут записи данных в stdin команды в миллисекундах. Значение по умолчанию — 10000. Необязательный параметр.
* `implicit_key` — исполняемый источник может возвращать только значения, а соответствие запрошенным ключам определяется неявно — по порядку строк в результате. Значение по умолчанию — false.
* `execute_direct` — если `execute_direct` = `1`, то `command` будет искаться в каталоге `user_scripts`, указанном в [user&#95;scripts&#95;path](../../operations/server-configuration-parameters/settings.md#user_scripts_path). Дополнительные аргументы скрипта можно указать, разделяя их пробелами. Пример: `script_name arg1 arg2`. Если `execute_direct` = `0`, `command` передаётся как аргумент для `bin/sh -c`. Значение по умолчанию — `0`. Необязательный параметр.
* `send_chunk_header` — определяет, нужно ли отправлять количество строк перед отправкой блока данных на обработку. Необязательный параметр. Значение по умолчанию — `false`.

Этот источник словаря может быть сконфигурирован только через XML-конфигурацию. Создание словарей с исполняемым источником через DDL отключено; в противном случае пользователь БД смог бы выполнять произвольные бинарные файлы на узле ClickHouse.

### Executable Pool

Executable pool позволяет загружать данные из пула процессов. Этот источник не работает со схемами размещения словарей, которым требуется загрузить все данные из источника. Executable pool работает, если словарь [хранится](#ways-to-store-dictionaries-in-memory) с использованием схем размещения `cache`, `complex_key_cache`, `ssd_cache`, `complex_key_ssd_cache`, `direct` или `complex_key_direct`.

Executable pool создаёт пул процессов с указанной командой и поддерживает их работу до их завершения. Программа должна читать данные из STDIN, пока они доступны, и выводить результат в STDOUT. Она может ожидать следующий блок данных на STDIN. ClickHouse не будет закрывать STDIN после обработки блока данных, а при необходимости передаст по нему следующий блок данных. Исполняемый скрипт должен быть готов к такому способу обработки данных — он должен опрашивать STDIN и как можно раньше сбрасывать данные в STDOUT.

Пример настроек:

```xml
<source>
    <executable_pool>
        <command><command>while read key; do printf "$key\tДанные по ключу $key\n"; done</command</command>
        <format>TabSeparated</format>
        <pool_size>10</pool_size>
        <max_command_execution_time>10<max_command_execution_time>
        <implicit_key>false</implicit_key>
    </executable_pool>
</source>
```

Настройка полей:


* `command` — Абсолютный путь к исполняемому файлу или имя файла (если каталог программы прописан в `PATH`).
* `format` — Формат файла. Поддерживаются все форматы, описанные в разделе «[Formats](/sql-reference/formats)».
* `pool_size` — Размер пула. Если для `pool_size` указано значение `0`, ограничения на размер пула отсутствуют. Значение по умолчанию — `16`.
* `command_termination_timeout` — Исполняемый скрипт должен содержать основной цикл чтения и записи. После уничтожения словаря канал (pipe) закрывается, и у исполняемого файла будет `command_termination_timeout` секунд на завершение работы, прежде чем ClickHouse отправит сигнал SIGTERM дочернему процессу. Задаётся в секундах. Значение по умолчанию — `10`. Необязательный параметр.
* `max_command_execution_time` — Максимальное время выполнения команды исполняемого скрипта при обработке блока данных. Задаётся в секундах. Значение по умолчанию — `10`. Необязательный параметр.
* `command_read_timeout` — таймаут чтения данных из stdout команды в миллисекундах. Значение по умолчанию — `10000`. Необязательный параметр.
* `command_write_timeout` — таймаут записи данных в stdin команды в миллисекундах. Значение по умолчанию — `10000`. Необязательный параметр.
* `implicit_key` — Исполняемый источник может возвращать только значения, а соответствие запрошенным ключам определяется неявно — по порядку строк в результате. Значение по умолчанию — `false`. Необязательный параметр.
* `execute_direct` — Если `execute_direct` = `1`, то `command` будет искаться в каталоге `user_scripts`, указанном в [user&#95;scripts&#95;path](../../operations/server-configuration-parameters/settings.md#user_scripts_path). Дополнительные аргументы скрипта можно указать, разделяя их пробелами. Пример: `script_name arg1 arg2`. Если `execute_direct` = `0`, `command` передаётся как аргумент для `bin/sh -c`. Значение по умолчанию — `1`. Необязательный параметр.
* `send_chunk_header` — управляет тем, нужно ли отправлять количество строк перед отправкой фрагмента данных на обработку. Необязательный параметр. Значение по умолчанию — `false`.

Этот источник словаря может быть настроен только через XML-конфигурацию. Создание словарей с исполняемым источником через DDL отключено, иначе пользователь БД получил бы возможность выполнять произвольные бинарные файлы на узле ClickHouse.

### HTTP(S)

Работа с HTTP(S)-сервером зависит от того, [как словарь хранится в памяти](#storing-dictionaries-in-memory). Если словарь хранится с использованием `cache` и `complex_key_cache`, ClickHouse запрашивает необходимые ключи, отправляя запрос методом `POST`.

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

Поля настроек:

* `url` – URL источника.
* `format` – Формат файла. Поддерживаются все форматы, описанные в разделе «[Formats](/sql-reference/formats)».
* `credentials` – HTTP-аутентификация по схеме Basic. Необязательный параметр.
* `user` – Имя пользователя, необходимое для аутентификации.
* `password` – Пароль, необходимый для аутентификации.
* `headers` – Все пользовательские HTTP-заголовки, используемые в HTTP-запросе. Необязательный параметр.
* `header` – Отдельный HTTP-заголовок.
* `name` – Имя идентификатора, используемого для заголовка, отправляемого в запросе.
* `value` – Значение, устанавливаемое для конкретного идентификатора.

При создании словаря с помощью DDL-команды (`CREATE DICTIONARY ...`) удалённые хосты для HTTP-словарей проверяются по содержимому секции `remote_url_allow_hosts` в конфигурации, чтобы предотвратить доступ пользователей базы данных к произвольным HTTP-серверам.

### DBMS

#### ODBC

Вы можете использовать этот метод для подключения любой базы данных, для которой существует ODBC-драйвер.

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

Настройка полей:

* `db` – Имя базы данных. Опустите его, если имя базы данных задано в параметрах `<connection_string>`.
* `table` – Имя таблицы и схемы, если она используется.
* `connection_string` – Строка подключения.
* `invalidate_query` – Запрос для проверки статуса словаря. Необязательный параметр. Подробнее см. в разделе [Обновление данных словаря с помощью LIFETIME](#refreshing-dictionary-data-using-lifetime).
* `background_reconnect` – Переподключаться к реплике в фоновом режиме при сбое соединения. Необязательный параметр.
* `query` – Пользовательский запрос. Необязательный параметр.

:::note
Поля `table` и `query` не могут использоваться одновременно. При этом одно из полей `table` или `query` обязательно должно быть указано.
:::

ClickHouse получает символы кавычек от ODBC-драйвера и заключает все настройки в запросах к драйверу в кавычки, поэтому необходимо указывать имя таблицы в соответствии с регистром имени таблицы в базе данных.

Если у вас возникают проблемы с кодировками при использовании Oracle, см. соответствующий пункт [FAQ](/knowledgebase/oracle-odbc).

##### Известная уязвимость функциональности ODBC-словаря

:::note
При подключении к базе данных через ODBC-драйвер параметр подключения `Servername` может быть подменён. В этом случае значения `USERNAME` и `PASSWORD` из `odbc.ini` отправляются на удалённый сервер и могут быть скомпрометированы.
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

Если затем вы выполните, например, такой запрос:

```sql
SELECT * FROM odbc('DSN=gregtest;Servername=some-server.com', 'test_db');
```

Драйвер ODBC отправит значения параметров `USERNAME` и `PASSWORD` из файла `odbc.ini` на сервер `some-server.com`.

##### Пример подключения PostgreSQL

Операционная система Ubuntu.

Установка unixODBC и ODBC-драйвера для PostgreSQL:

```bash
$ sudo apt-get install -y unixodbc odbcinst odbc-postgresql
```

Настройка `/etc/odbc.ini` (или `~/.odbc.ini`, если вы вошли в систему под пользователем, от имени которого запускается ClickHouse):

```text
    [DEFAULT]
    Driver = myconnection

    [myconnection]
    Description         = Подключение PostgreSQL к базе данных my_db
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

Вам может понадобиться отредактировать `odbc.ini`, чтобы указать полный путь к библиотеке драйвера: `DRIVER=/usr/local/lib/psqlodbcw.so`.

##### Пример подключения MS SQL Server

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
    # $ cat ~/.odbc.ini # если вы вошли под пользователем, от имени которого запущен ClickHouse

    [MSSQL]
    Description     = FreeTDS
    Driver          = FreeTDS
    Servername      = MSSQL
    Database        = test
    UID             = test
    PWD             = test
    Port            = 1433


    # (необязательно) тестирование ODBC-соединения (для использования инструмента isql установите пакет [unixodbc](https://packages.debian.org/sid/unixodbc))
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

#### MySQL

Пример конфигурации:

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

Описание полей настроек:

* `port` – Порт сервера MySQL. Вы можете задать его для всех реплик сразу или для каждой реплики отдельно (внутри `<replica>`).

* `user` – Имя пользователя MySQL. Вы можете задать его для всех реплик сразу или для каждой реплики отдельно (внутри `<replica>`).

* `password` – Пароль пользователя MySQL. Вы можете задать его для всех реплик сразу или для каждой реплики отдельно (внутри `<replica>`).

* `replica` – Секция конфигурации реплик. Может быть несколько таких секций.

  * `replica/host` – Хост MySQL.
  * `replica/priority` – Приоритет реплики. При попытке подключения ClickHouse обходит реплики в порядке приоритета. Чем меньше число, тем выше приоритет.

* `db` – Имя базы данных.

* `table` – Имя таблицы.

* `where` – Условия выборки. Синтаксис условий такой же, как в предложении `WHERE` в MySQL, например, `id > 10 AND id < 20`. Необязательный параметр.

* `invalidate_query` – Запрос для проверки состояния словаря. Необязательный параметр. Подробнее см. в разделе [Refreshing dictionary data using LIFETIME](#refreshing-dictionary-data-using-lifetime).

* `fail_on_connection_loss` – Параметр конфигурации, который управляет поведением сервера при потере соединения. Если `true`, исключение генерируется немедленно при потере соединения между клиентом и сервером. Если `false`, сервер ClickHouse делает три попытки выполнить запрос, прежде чем сгенерировать исключение. Имейте в виду, что повторные попытки приводят к увеличению времени ответа. Значение по умолчанию: `false`.

* `query` – Пользовательский запрос. Необязательный параметр.

:::note
Поля `table` и `where` не могут использоваться совместно с полем `query`. При этом одно из полей `table` или `query` должно быть объявлено.
:::

:::note
Явного параметра `secure` не существует. При установке SSL-соединения оно всегда должно быть защищённым.
:::

К MySQL можно подключаться на локальном хосте через сокеты. Для этого задайте `host` и `socket`.

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

#### ClickHouse

Пример конфигурации:

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

Настройка полей:

* `host` – Хост ClickHouse. Если это локальный хост, запрос обрабатывается без какой-либо сетевой активности. Для повышения отказоустойчивости вы можете создать таблицу [Distributed](../../engines/table-engines/special/distributed.md) и указать её в последующих конфигурациях.
* `port` – Порт на сервере ClickHouse.
* `user` – Имя пользователя ClickHouse.
* `password` – Пароль пользователя ClickHouse.
* `db` – Имя базы данных.
* `table` – Имя таблицы.
* `where` – Критерий выборки. Поле необязательное.
* `invalidate_query` – Запрос для проверки состояния словаря. Необязательный параметр. Подробнее см. раздел [Refreshing dictionary data using LIFETIME](#refreshing-dictionary-data-using-lifetime).
* `secure` – Использовать SSL для подключения.
* `query` – Пользовательский запрос. Необязательный параметр.

:::note
Поля `table` или `where` не могут использоваться совместно с полем `query`. При этом должно быть объявлено одно из полей `table` или `query`.
:::

#### MongoDB

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
* `options` – Параметры строки подключения MongoDB (необязательный параметр).

или

```sql
SOURCE(MONGODB(
    uri 'mongodb://localhost:27017/clickhouse'
    collection 'dictionary_source'
))
```

Поля настроек:

* `uri` — URI для подключения.
* `collection` — имя коллекции.

[Подробнее об этом движке](../../engines/table-engines/integrations/mongodb.md)

#### Redis

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


* `host` – Хост Redis.
* `port` – Порт сервера Redis.
* `storage_type` – Структура внутреннего хранилища Redis, используемая для работы с ключами. `simple` — для простых источников и для хешированных источников с одним ключом, `hash_map` — для хешированных источников с двумя ключами. Источники диапазонов и источники кэша со сложным ключом не поддерживаются. Параметр может быть опущен, значение по умолчанию — `simple`.
* `db_index` – Числовой индекс логической базы данных Redis. Параметр может быть опущен, значение по умолчанию — 0.

#### Cassandra

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
* `allow_filtering` – флаг, разрешающий или запрещающий потенциально дорогостоящие условия по столбцам clustering key. Значение по умолчанию — 1.
* `partition_key_prefix` – количество столбцов partition key в первичном ключе таблицы Cassandra. Обязателен для словарей с составным ключом. Порядок ключевых столбцов в определении словаря должен совпадать с порядком в Cassandra. Значение по умолчанию — 1 (первый столбец ключа — partition key, остальные столбцы ключа — clustering key).
* `consistency` – уровень согласованности. Допустимые значения: `One`, `Two`, `Three`, `All`, `EachQuorum`, `Quorum`, `LocalQuorum`, `LocalOne`, `Serial`, `LocalSerial`. Значение по умолчанию — `One`.
* `where` – необязательные условия отбора.
* `max_threads` – максимальное количество потоков, используемых для загрузки данных из нескольких партиций в словарях с составным ключом.
* `query` – пользовательский запрос. Необязательный параметр.

:::note
Поля `column_family` или `where` нельзя использовать совместно с полем `query`. При этом должно быть объявлено одно из полей `column_family` или `query`.
:::

#### PostgreSQL

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

Поля настройки:


* `host` – Хост на сервере PostgreSQL. Вы можете указать его для всех реплик или для каждой отдельно (внутри `<replica>`).
* `port` – Порт на сервере PostgreSQL. Вы можете указать его для всех реплик или для каждой отдельно (внутри `<replica>`).
* `user` – Имя пользователя PostgreSQL. Вы можете указать его для всех реплик или для каждой отдельно (внутри `<replica>`).
* `password` – Пароль пользователя PostgreSQL. Вы можете указать его для всех реплик или для каждой отдельно (внутри `<replica>`).
* `replica` – Секция с конфигурацией реплик. Может быть несколько секций:
  * `replica/host` – Хост PostgreSQL.
  * `replica/port` – Порт PostgreSQL.
  * `replica/priority` – Приоритет реплики. При попытке подключиться ClickHouse обходит реплики в порядке приоритета. Чем меньше число, тем выше приоритет.
* `db` – Имя базы данных.
* `table` – Имя таблицы.
* `where` – Критерии отбора. Синтаксис условий такой же, как в операторе `WHERE` в PostgreSQL. Например, `id > 10 AND id < 20`. Необязательный параметр.
* `invalidate_query` – Запрос для проверки состояния словаря. Необязательный параметр. Подробнее см. в разделе [Refreshing dictionary data using LIFETIME](#refreshing-dictionary-data-using-lifetime).
* `background_reconnect` – Переподключение к реплике в фоновом режиме при сбое подключения. Необязательный параметр.
* `query` – Пользовательский запрос. Необязательный параметр.

:::note
Поля `table` или `where` нельзя использовать вместе с полем `query`. При этом одно из полей `table` или `query` должно быть объявлено.
:::

### Null

Специальный источник, который можно использовать для создания фиктивных (пустых) словарей. Такие словари могут быть полезны для тестов или в конфигурациях с раздельными узлами данных и запросов на узлах, где размещены таблицы типа Distributed.

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


## Ключ и поля словаря

<CloudDetails />

Секция `structure` описывает ключ словаря и поля, доступные для запросов.

XML-описание:

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

Атрибуты задаются элементами:

* `<id>` — ключевой столбец
* `<attribute>` — столбец данных; таких атрибутов может быть несколько.

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
* `AttrName AttrType` — столбец с данными. Таких атрибутов может быть несколько.


## Ключ

ClickHouse поддерживает следующие типы ключей:

* Числовой ключ. `UInt64`. Определяется в теге `<id>` или с помощью ключевого слова `PRIMARY KEY`.
* Составной ключ. Набор значений разных типов. Определяется в теге `<key>` или с помощью ключевого слова `PRIMARY KEY`.

XML-структура может содержать либо `<id>`, либо `<key>`. DDL-запрос должен содержать только один `PRIMARY KEY`.

:::note
Нельзя описывать ключ как атрибут.
:::

### Числовой ключ

Тип: `UInt64`.

Пример конфигурации:

```xml
<id>
    <name>Идентификатор</name>
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

### Составной ключ

Ключ может быть кортежем (`tuple`) из полей любых типов. В этом случае [layout](#storing-dictionaries-in-memory) должен быть `complex_key_hashed` или `complex_key_cache`.

:::tip
Составной ключ может состоять из единственного элемента. Это, например, позволяет использовать строку в качестве ключа.
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

В запросе к функции `dictGet*` в качестве ключа используется кортеж. Пример: `dictGetString('dict_name', 'attr_name', tuple('string for field1', num_for_field2))`.


## Атрибуты

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
| `name`                                               | Имя столбца.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Да       |
| `type`                                               | Тип данных ClickHouse: [UInt8](../../sql-reference/data-types/int-uint.md), [UInt16](../../sql-reference/data-types/int-uint.md), [UInt32](../../sql-reference/data-types/int-uint.md), [UInt64](../../sql-reference/data-types/int-uint.md), [Int8](../../sql-reference/data-types/int-uint.md), [Int16](../../sql-reference/data-types/int-uint.md), [Int32](../../sql-reference/data-types/int-uint.md), [Int64](../../sql-reference/data-types/int-uint.md), [Float32](../../sql-reference/data-types/float.md), [Float64](../../sql-reference/data-types/float.md), [UUID](../../sql-reference/data-types/uuid.md), [Decimal32](../../sql-reference/data-types/decimal.md), [Decimal64](../../sql-reference/data-types/decimal.md), [Decimal128](../../sql-reference/data-types/decimal.md), [Decimal256](../../sql-reference/data-types/decimal.md),[Date](../../sql-reference/data-types/date.md), [Date32](../../sql-reference/data-types/date32.md), [DateTime](../../sql-reference/data-types/datetime.md), [DateTime64](../../sql-reference/data-types/datetime64.md), [String](../../sql-reference/data-types/string.md), [Array](../../sql-reference/data-types/array.md).<br/>ClickHouse пытается привести значение из словаря к указанному типу данных. Например, для MySQL поле в исходной таблице MySQL может иметь тип `TEXT`, `VARCHAR` или `BLOB`, но в ClickHouse оно может быть загружено как `String`.<br/>[Nullable](../../sql-reference/data-types/nullable.md) в настоящее время поддерживается для словарей [Flat](#flat), [Hashed](#hashed), [ComplexKeyHashed](#complex_key_hashed), [Direct](#direct), [ComplexKeyDirect](#complex_key_direct), [RangeHashed](#range_hashed), Polygon, [Cache](#cache), [ComplexKeyCache](#complex_key_cache), [SSDCache](#ssd_cache), [SSDComplexKeyCache](#complex_key_ssd_cache). В словарях [IPTrie](#ip_trie) типы `Nullable` не поддерживаются. | Да       |
| `null_value`                                         | Значение по умолчанию для несуществующего элемента.<br/>В примере это пустая строка. Значение [NULL](../syntax.md#null) можно использовать только для типов `Nullable` (см. предыдущую строку с описанием типов).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Да       |
| `expression`                                         | [Выражение](../../sql-reference/syntax.md#expressions), которое ClickHouse выполняет над значением.<br/>Выражением может быть имя столбца в удалённой SQL базе данных. Таким образом, вы можете использовать его для создания псевдонима для удалённого столбца.<br/><br/>Значение по умолчанию: выражение отсутствует.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Нет      |
| <a name="hierarchical-dict-attr"></a> `hierarchical` | Если `true`, атрибут содержит значение родительского ключа для текущего ключа. См. [Иерархические словари](#hierarchical-dictionaries).<br/><br/>Значение по умолчанию: `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Нет      |
| `injective`                                          | Флаг, который показывает, является ли отображение `id -> attribute` [инъективным](https://en.wikipedia.org/wiki/Injective_function).<br/>Если `true`, ClickHouse может автоматически выполнять запросы к инъективным словарям после предложения `GROUP BY`. Обычно это существенно сокращает количество таких запросов.<br/><br/>Значение по умолчанию: `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Нет      |
| `is_object_id`                                       | Флаг, который показывает, выполняется ли запрос для документа MongoDB по `ObjectID`.<br/><br/>Значение по умолчанию: `false`. | Нет      |



## Иерархические словари

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

Эту иерархию можно представить в виде следующей словарной таблицы.

| region&#95;id | parent&#95;region | region&#95;name |
| ------------- | ----------------- | --------------- |
| 1             | 0                 | Россия          |
| 2             | 1                 | Москва          |
| 3             | 2                 | Центр           |
| 4             | 0                 | Великобритания  |
| 5             | 4                 | Лондон          |

Эта таблица содержит столбец `parent_region`, в котором хранится ключ ближайшего родительского элемента.

ClickHouse поддерживает иерархическое свойство для атрибутов внешних словарей. Это свойство позволяет настроить иерархический словарь, подобный описанному выше.

Функция [dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy) позволяет получить цепочку родительских элементов.

В нашем примере структура словаря может быть следующей:

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


## Словари полигонов

Этот словарь оптимизирован для запросов «точка в полигоне», по сути — для задач обратного геокодирования. По заданной координате (широта/долгота) он эффективно определяет, какой полигон или регион (из множества полигонов, например границ стран или регионов) содержит эту точку. Хорошо подходит для сопоставления координат местоположения с регионом, которому они принадлежат.

<iframe width="1024" height="576" src="https://www.youtube.com/embed/FyRsriQp46E?si=Kf8CXoPKEpGQlC-Y" title="Polygon Dictionaries in ClickHouse" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Пример конфигурации словаря полигонов:

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
* MultiPolygon. Это массив полигонов. Каждый полигон — это двумерный массив точек. Первый элемент этого массива — внешняя граница полигона, а последующие элементы задают области, которые следует из него исключить.

Точки могут быть заданы в виде массива или кортежа координат. В текущей реализации поддерживаются только двумерные точки.

Пользователь может загружать собственные данные во всех форматах, поддерживаемых ClickHouse.

Доступны 3 типа [хранения в памяти](#storing-dictionaries-in-memory):

* `POLYGON_SIMPLE`. Это наивная реализация, при которой для каждого запроса выполняется линейный проход по всем полигонам и для каждого из них проверяется принадлежность точки полигону без использования дополнительных индексов.

* `POLYGON_INDEX_EACH`. Для каждого полигона строится отдельный индекс, что позволяет в большинстве случаев быстро проверять принадлежность (оптимизировано для географических регионов).
  Также на рассматриваемую область накладывается сетка, что существенно сужает число полигонов, подлежащих рассмотрению.
  Сетка создаётся рекурсивным делением ячейки на 16 равных частей и настраивается двумя параметрами.
  Деление останавливается, когда глубина рекурсии достигает `MAX_DEPTH` или когда ячейка пересекает не более `MIN_INTERSECTIONS` полигонов.
  Для обработки запроса определяется соответствующая ячейка, и поочерёдно осуществляется доступ к индексу для полигонов, хранящихся в ней.

* `POLYGON_INDEX_CELL`. При таком размещении также создаётся описанная выше сетка. Доступны те же параметры настройки. Для каждой листовой ячейки сетки строится индекс по всем фрагментам полигонов, которые в неё попадают, что позволяет быстро отвечать на запрос.

* `POLYGON`. Синоним для `POLYGON_INDEX_CELL`.

Запросы к словарю выполняются с помощью стандартных [функций](../../sql-reference/functions/ext-dict-functions.md) для работы со словарями.
Важное отличие состоит в том, что здесь ключами будут точки, для которых нужно найти полигон, который их содержит.

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

В результате выполнения последнего запроса для каждой точки в таблице `points` будет найден полигон минимальной площади, содержащий эту точку, и будут выведены запрошенные атрибуты.

**Пример**

Вы можете читать столбцы из словарей полигонов с помощью запроса SELECT — просто включите `store_polygon_key_column = 1` в конфигурации словаря или в соответствующем DDL-запросе.

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


## Словарь на основе дерева регулярных выражений

Этот словарь позволяет сопоставлять ключи значениям на основе иерархических шаблонов регулярных выражений. Он оптимизирован для поиска по сопоставлению шаблонов (например, классификации строк, таких как строки User-Agent, путём сопоставления с шаблонами регулярных выражений), а не для точного соответствия ключей.

<iframe width="1024" height="576" src="https://www.youtube.com/embed/ESlAhUJMoz8?si=sY2OVm-zcuxlDRaX" title="Введение в словари ClickHouse на основе дерева регулярных выражений" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

### Использование словаря на основе дерева регулярных выражений в ClickHouse с открытым исходным кодом

Словари на основе дерева регулярных выражений в ClickHouse с открытым исходным кодом определяются с использованием источника YAMLRegExpTree, которому передаётся путь к YAML-файлу, содержащему дерево регулярных выражений.

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
  * Значение атрибута может содержать **обратные ссылки**, ссылающиеся на группы захвата сопоставленного регулярного выражения. В примере значение атрибута `version` в первом узле состоит из обратной ссылки `\1` на группу захвата `(\d+[\.\d]*)` в регулярном выражении. Номера обратных ссылок находятся в диапазоне от 1 до 9 и записываются как `$1` или `\1` (для номера 1). При выполнении запроса обратная ссылка заменяется соответствующей сопоставленной группой захвата.
* **child nodes**: список дочерних узлов узла дерева регулярных выражений, каждый из которых имеет свои атрибуты и (потенциально) дочерние узлы. Сопоставление строк выполняется в порядке обхода в глубину. Если строка соответствует узлу регулярного выражения, словарь проверяет, соответствует ли она также дочерним узлам этого узла. Если это так, назначаются атрибуты самого глубокого соответствующего узла. Атрибуты дочернего узла переопределяют одноимённые атрибуты родительских узлов. Имена дочерних узлов в YAML-файлах могут быть произвольными, например, `versions` в приведённом выше примере.

Словари в виде дерева регулярных выражений допускают доступ только с использованием функций `dictGet`, `dictGetOrDefault` и `dictGetAll`.

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

В этом случае мы сначала сопоставляем регулярное выражение `\d+/tclwebkit(?:\d+[\.\d]*)` со вторым узлом верхнего уровня. Затем словарь переходит к дочерним узлам и обнаруживает, что строка также соответствует `3[12]/tclwebkit`. В результате значение атрибута `name` равно `Android` (заданному на первом уровне), а значение атрибута `version` равно `12` (заданному в дочернем узле).


С помощью мощного конфигурационного файла YAML мы можем использовать словари в виде дерева регулярных выражений в качестве парсера строки User-Agent. Мы поддерживаем [uap-core](https://github.com/ua-parser/uap-core) и демонстрируем, как использовать его в функциональном тесте [02504&#95;regexp&#95;dictionary&#95;ua&#95;parser](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/02504_regexp_dictionary_ua_parser.sh)

#### Сбор значений атрибутов

Иногда бывает полезно возвращать значения из нескольких совпавших регулярных выражений, а не только значение листового узла. В таких случаях можно использовать специализированную функцию [`dictGetAll`](../../sql-reference/functions/ext-dict-functions.md#dictgetall). Если узел имеет значение атрибута типа `T`, `dictGetAll` вернёт `Array(T)`, содержащий ноль или более значений.

По умолчанию количество совпадений, возвращаемых для одного ключа, не ограничено. Ограничение можно передать в качестве необязательного четвёртого аргумента функции `dictGetAll`. Массив заполняется в *топологическом порядке*, что означает, что дочерние узлы идут перед родительскими, а одноуровневые узлы следуют в порядке исходного определения.

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

#### Режимы сопоставления

Поведение сопоставления по шаблону можно изменить с помощью некоторых настроек словаря:

* `regexp_dict_flag_case_insensitive`: использовать регистронезависимое сопоставление (по умолчанию `false`). Можно переопределить в отдельных выражениях с помощью `(?i)` и `(?-i)`.
* `regexp_dict_flag_dotall`: разрешить символу &#39;.&#39; сопоставляться с символами перевода строки (по умолчанию `false`).

### Использование словаря Regular Expression Tree в ClickHouse Cloud

Используемый выше источник `YAMLRegExpTree` работает в ClickHouse Open Source, но не в ClickHouse Cloud. Чтобы использовать словари regexp tree в ClickHouse Cloud, сначала создайте локально в ClickHouse Open Source словарь regexp tree из YAML-файла, затем выгрузите этот словарь в CSV-файл с помощью табличной функции `dictionary` и предложения [INTO OUTFILE](../statements/select/into-outfile.md).

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

Затем обновите локальный CSV командой

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

Подробности см. в разделе [Insert Local Files](/integrations/data-ingestion/insert-local-files). После инициализации исходной таблицы мы можем создать RegexpTree по её источнику:


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

В ClickHouse есть встроенная функциональность для работы с геобазой.

Это позволяет:

- По ID региона получать его название на нужном языке.
- По ID региона получать ID города, области, федерального округа, страны или континента.
- Проверять, входит ли один регион в состав другого региона.
- Получать цепочку родительских регионов.

Все функции поддерживают «транслокальность» — возможность одновременно использовать различные представления принадлежности регионов. Подробнее см. раздел «Функции для работы со словарями веб-аналитики».

Внутренние словари отключены в стандартном пакете.
Чтобы включить их, раскомментируйте параметры `path_to_regions_hierarchy_file` и `path_to_regions_names_files` в конфигурационном файле сервера.

Геобаза загружается из текстовых файлов.

Поместите файлы `regions_hierarchy*.txt` в директорию `path_to_regions_hierarchy_file`. Этот параметр конфигурации должен содержать путь к файлу `regions_hierarchy.txt` (иерархия регионов по умолчанию), а остальные файлы (`regions_hierarchy_ua.txt`) должны находиться в той же директории.

Поместите файлы `regions_names_*.txt` в директорию `path_to_regions_names_files`.

Вы также можете создать эти файлы самостоятельно. Формат файлов следующий:

`regions_hierarchy*.txt`: TabSeparated (без заголовка), столбцы:

- ID региона (`UInt32`)
- ID родительского региона (`UInt32`)
- тип региона (`UInt8`): 1 — континент, 3 — страна, 4 — федеральный округ, 5 — регион, 6 — город; другие типы не имеют значений
- население (`UInt32`) — необязательный столбец

`regions_names_*.txt`: TabSeparated (без заголовка), столбцы:

- ID региона (`UInt32`)
- название региона (`String`) — не может содержать символы табуляции и переводы строки, даже в экранированном виде.

Для хранения в ОЗУ используется плоский массив. По этой причине ID не должны превышать одного миллиона.

Словари можно обновлять без перезапуска сервера. Однако набор доступных словарей при этом не меняется.
Для обновления проверяются времена модификации файлов. Если файл изменился, соответствующий словарь обновляется.
Интервал проверки изменений настраивается параметром `builtin_dictionaries_reload_interval`.
Обновление словарей (кроме первоначальной загрузки при первом использовании) не блокирует запросы. Во время обновления запросы используют старые версии словарей. Если при обновлении возникает ошибка, она записывается в лог сервера, а запросы продолжают работать со старыми версиями словарей.

Мы рекомендуем периодически обновлять словари с геобазой. В ходе обновления генерируйте новые файлы и записывайте их в отдельное место. Когда все будет готово, переименуйте их в файлы, которые использует сервер.

Также существуют функции для работы с идентификаторами ОС и поисковых систем, но их не следует использовать.
