---
slug: /sql-reference/dictionaries
sidebar_label: Определение Словарей
sidebar_position: 35
---

import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';
import CloudDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/sql-reference/dictionaries/_snippet_dictionary_in_cloud.md';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# Словари

Словарь — это отображение (`ключ -> атрибуты`), которое удобно для различных типов справочных списков.

ClickHouse поддерживает специальные функции для работы со словарями, которые можно использовать в запросах. Использовать словари с функциями легче и эффективнее, чем `JOIN` с ссылочными таблицами.

ClickHouse поддерживает:

- Словари с [набором функций](../../sql-reference/functions/ext-dict-functions.md).
- [Встраиваемые словари](#embedded-dictionaries) с конкретным [набором функций](../../sql-reference/functions/ym-dict-functions.md).

:::tip Учебник
Если вы только начинаете работать со словарями в ClickHouse, у нас есть учебник, который охватывает эту тему. Ознакомьтесь [здесь](tutorial.md).
:::

Вы можете добавлять свои собственные словари из различных источников данных. Источником для словаря может быть таблица ClickHouse, локальный текстовый или исполняемый файл, HTTP(s) ресурс или другая СУБД. Для получения дополнительной информации смотрите "[Источники словарей](#dictionary-sources)".

ClickHouse:

- Полностью или частично хранит словари в ОЗУ.
- Периодически обновляет словари и динамически загружает недостающие значения. Иными словами, словари могут загружаться динамически.
- Позволяет создавать словари с помощью xml файлов или [DDL запросов](../../sql-reference/statements/create/dictionary.md).

Конфигурация словарей может находиться в одном или нескольких xml-файлах. Путь к конфигурации указывается в параметре [dictionaries_config](../../operations/server-configuration-parameters/settings.md#dictionaries_config).

Словари могут быть загружены при запуске сервера или при первом использовании, в зависимости от настройки [dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load).

Системная таблица [dictionaries](/operations/system-tables/dictionaries) содержит информацию о словарях, настроенных на сервере. Для каждого словаря вы можете найти:

- Статус словаря.
- Конфигурационные параметры.
- Метрики, такие как объем ОЗУ, выделенный для словаря, или количество запросов с тех пор, как словарь был успешно загружен.

<CloudDetails />
## Создание словаря с помощью DDL-запроса {#creating-a-dictionary-with-a-ddl-query}

Словари могут быть созданы с помощью [DDL запросов](../../sql-reference/statements/create/dictionary.md), и этот метод рекомендуется, потому что с помощью DDL созданные словари:
- Не добавляют дополнительные записи в файлы конфигурации сервера.
- Словари могут быть использованы как сущности первого класса, такие как таблицы или представления.
- Данные можно читать напрямую, используя знакомый SELECT, а не функции таблиц словарей.
- Словари можно легко переименовывать.

## Создание словаря с помощью файла конфигурации {#creating-a-dictionary-with-a-configuration-file}

<CloudNotSupportedBadge/>

:::note
Создание словаря с помощью файла конфигурации не применимо к ClickHouse Cloud. Пожалуйста, используйте DDL (см. выше) и создайте ваш словарь как пользователь `default`.
:::

Файл конфигурации словаря имеет следующий формат:

``` xml
<clickhouse>
    <comment>Необязательный элемент с любым содержимым. Игнорируется сервером ClickHouse.</comment>

    <!--Необязательный элемент. Имя файла с подстановками-->
    <include_from>/etc/metrika.xml</include_from>


    <dictionary>
        <!-- Конфигурация словаря. -->
        <!-- В конфигурационном файле может быть любое количество секций словаря. -->
    </dictionary>

</clickhouse>
```

Вы можете [настроить](#configuring-a-dictionary) любое количество словарей в одном и том же файле.

:::note
Вы можете преобразовать значения для небольшого словаря, описав его в запросе `SELECT` (см. функцию [transform](../../sql-reference/functions/other-functions.md)). Эта функциональность не относится к словарям.
:::

## Настройка словаря {#configuring-a-dictionary}

<CloudDetails />

Если словарь настроен с помощью xml файла, то конфигурация словаря имеет следующую структуру:

``` xml
<dictionary>
    <name>dict_name</name>

    <structure>
      <!-- Конфигурация сложного ключа -->
    </structure>

    <source>
      <!-- Конфигурация источника -->
    </source>

    <layout>
      <!-- Конфигурация памяти -->
    </layout>

    <lifetime>
      <!-- Время жизни словаря в памяти -->
    </lifetime>
</dictionary>
```

Соответствующий [DDL-запрос](../../sql-reference/statements/create/dictionary.md) имеет следующую структуру:

``` sql
CREATE DICTIONARY dict_name
(
    ... -- атрибуты
)
PRIMARY KEY ... -- конфигурация сложного или одиночного ключа
SOURCE(...) -- Конфигурация источника
LAYOUT(...) -- Конфигурация памяти
LIFETIME(...) -- Время жизни словаря в памяти
```

## Хранение словарей в памяти {#storing-dictionaries-in-memory}

Существует множество способов хранения словарей в памяти.

Рекомендуем использовать [flat](#flat), [hashed](#hashed) и [complex_key_hashed](#complex_key_hashed), которые обеспечивают оптимальную скорость обработки.

Кэширование не рекомендуется из-за потенциально плохой производительности и трудностей в выборе оптимальных параметров. Читайте больше в разделе [cache](#cache).

Существует несколько способов улучшить производительность словаря:

- Вызывайте функцию для работы со словарем после `GROUP BY`.
- Отмечайте атрибуты для извлечения как инъективные. Атрибут называется инъективным, если различным ключам соответствуют различные значения атрибута. Таким образом, когда `GROUP BY` использует функцию, которая получает значение атрибута по ключу, эта функция автоматически выносится из `GROUP BY`.

ClickHouse генерирует исключение для ошибок со словарями. Примеры ошибок:

- Не удается загрузить словарь, к которому обращаются.
- Ошибка запроса к `cached` словарю.

Вы можете просмотреть список словарей и их статусы в таблице [system.dictionaries](../../operations/system-tables/dictionaries.md).

<CloudDetails />

Конфигурация выглядит следующим образом:

``` xml
<clickhouse>
    <dictionary>
        ...
        <layout>
            <layout_type>
                <!-- настройки компоновки -->
            </layout_type>
        </layout>
        ...
    </dictionary>
</clickhouse>
```

Соответствующий [DDL-запрос](../../sql-reference/statements/create/dictionary.md):

``` sql
CREATE DICTIONARY (...)
...
LAYOUT(LAYOUT_TYPE(param value)) -- настройки компоновки
...
```

Словари без слова `complex-key*` в компоновке имеют ключ типа [UInt64](../../sql-reference/data-types/int-uint.md), словари `complex-key*` имеют составной ключ (сложный, с произвольными типами).

Ключи [UInt64](../../sql-reference/data-types/int-uint.md) в xml словарях определяются с помощью тега `<id>`.

Пример конфигурации (колонка key_column имеет тип UInt64):
```xml
...
<structure>
    <id>
        <name>key_column</name>
    </id>
...
```

Составные `complex` ключи XML словарей определяются с помощью тега `<key>`.

Пример конфигурации составного ключа (ключ состоит из одного элемента с типом [String](../../sql-reference/data-types/string.md)):
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

Словарь полностью хранится в памяти в виде плоских массивов. Сколько памяти использует словарь? Объем пропорционален размеру самого большого ключа (по занимаемому пространству).

Ключ словаря имеет тип [UInt64](../../sql-reference/data-types/int-uint.md), и значение ограничено `max_array_size` (по умолчанию — 500,000). Если при создании словаря будет обнаружен более крупный ключ, ClickHouse выбрасывает исключение и не создает словарь. Начальный размер плоских массивов словаря контролируется настройкой `initial_array_size` (по умолчанию — 1024).

Поддерживаются все типы источников. При обновлении данные (из файла или таблицы) читаются полностью.

Этот метод обеспечивает наилучшие показатели производительности среди всех доступных методов хранения словаря.

Пример конфигурации:

``` xml
<layout>
  <flat>
    <initial_array_size>50000</initial_array_size>
    <max_array_size>5000000</max_array_size>
  </flat>
</layout>
```

или

``` sql
LAYOUT(FLAT(INITIAL_ARRAY_SIZE 50000 MAX_ARRAY_SIZE 5000000))
```

### hashed {#hashed}

Словарь полностью хранится в памяти в виде хеш-таблицы. Словарь может содержать любое количество элементов с любыми идентификаторами. На практике число ключей может достигать десятков миллионов элементов.

Ключ словаря имеет тип [UInt64](../../sql-reference/data-types/int-uint.md).

Поддерживаются все типы источников. При обновлении данные (из файла или таблицы) читаются полностью.

Пример конфигурации:

``` xml
<layout>
  <hashed />
</layout>
```

или

``` sql
LAYOUT(HASHED())
```

Пример конфигурации:

``` xml
<layout>
  <hashed>
    <!-- Если шардов больше 1 (по умолчанию `1`), словарь будет загружать
         данные параллельно, что полезно, если у вас большое количество элементов в одном
         словаре. -->
    <shards>10</shards>

    <!-- Размер очереди для блоков в параллельной очереди.

         Поскольку узким местом в параллельной загрузке является перерасчет хеша, и чтобы избежать
         зависания из-за потока, который выполняет перерасчет, необходимо иметь некоторый
         запас.

         10000 — хорошее соотношение между памятью и скоростью.
         Даже для 10e10 элементов и может справляться с нагрузкой без голодания. -->
    <shard_load_queue_backlog>10000</shard_load_queue_backlog>

    <!-- Максимальный коэффициент загрузки хеш-таблицы, при больших значениях
         память используется более эффективно (меньше памяти тратится), но чтение/производительность
         могут ухудшаться.

         Допустимые значения: [0.5, 0.99]
         По умолчанию: 0.5 -->
    <max_load_factor>0.5</max_load_factor>
  </hashed>
</layout>
```

или

``` sql
LAYOUT(HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

### sparse_hashed {#sparse_hashed}

Похоже на `hashed`, но использует меньше памяти в угоду большему использованию ЦП.

Ключ словаря имеет тип [UInt64](../../sql-reference/data-types/int-uint.md).

Пример конфигурации:

``` xml
<layout>
  <sparse_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </sparse_hashed>
</layout>
```

или

``` sql
LAYOUT(SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

Также можно использовать `shards` для этого типа словаря, и это более важно для `sparse_hashed`, чем для `hashed`, поскольку `sparse_hashed` работает медленнее.

### complex_key_hashed {#complex_key_hashed}

Этот тип хранения предназначен для использования с составными [ключами](#dictionary-key-and-fields). Похоже на `hashed`.

Пример конфигурации:

``` xml
<layout>
  <complex_key_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </complex_key_hashed>
</layout>
```

или

``` sql
LAYOUT(COMPLEX_KEY_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

### complex_key_sparse_hashed {#complex_key_sparse_hashed}

Этот тип хранения предназначен для использования с составными [ключами](#dictionary-key-and-fields). Похоже на [sparse_hashed](#sparse_hashed).

Пример конфигурации:

``` xml
<layout>
  <complex_key_sparse_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </complex_key_sparse_hashed>
</layout>
```

или

``` sql
LAYOUT(COMPLEX_KEY_SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

### hashed_array {#hashed_array}

Словарь полностью хранится в памяти. Каждый атрибут хранится в массиве. Атрибут ключа хранится в виде хеш-таблицы, где значение — это индекс в массиве атрибутов. Словарь может содержать любое количество элементов с любыми идентификаторами. На практике число ключей может достигать десятков миллионов элементов.

Ключ словаря имеет тип [UInt64](../../sql-reference/data-types/int-uint.md).

Поддерживаются все типы источников. При обновлении данные (из файла или таблицы) читаются полностью.

Пример конфигурации:

``` xml
<layout>
  <hashed_array>
  </hashed_array>
</layout>
```

или

``` sql
LAYOUT(HASHED_ARRAY([SHARDS 1]))
```

### complex_key_hashed_array {#complex_key_hashed_array}

Этот тип хранения предназначен для использования с составными [ключами](#dictionary-key-and-fields). Похоже на [hashed_array](#hashed_array).

Пример конфигурации:

``` xml
<layout>
  <complex_key_hashed_array />
</layout>
```

или

``` sql
LAYOUT(COMPLEX_KEY_HASHED_ARRAY([SHARDS 1]))
```

### range_hashed {#range_hashed}

Словарь хранится в памяти в виде хеш-таблицы с упорядоченным массивом диапазонов и их соответствующих значений.

Ключ словаря имеет тип [UInt64](../../sql-reference/data-types/int-uint.md). Этот метод хранения работает так же, как hashed и позволяет использовать диапазоны дат/времени (произвольный числовой тип) в дополнение к ключу.

Пример: Таблица содержит скидки для каждого рекламодателя в формате:

``` text
┌─advertiser_id─┬─discount_start_date─┬─discount_end_date─┬─amount─┐
│           123 │          2015-01-16 │        2015-01-31 │   0.25 │
│           123 │          2015-01-01 │        2015-01-15 │   0.15 │
│           456 │          2015-01-01 │        2015-01-15 │   0.05 │
└───────────────┴─────────────────────┴───────────────────┴────────┘
```

Чтобы использовать образец для диапазонов дат, определите элементы `range_min` и `range_max` в [структуре](#dictionary-key-and-fields). Эти элементы должны содержать элементы `name` и `type` (если `type` не указан, будет использован тип по умолчанию - Date). `type` может быть любым числовым типом (Date / DateTime / UInt64 / Int32 / другие).

:::note
Значения `range_min` и `range_max` должны помещаться в тип `Int64`.
:::

Пример:

``` xml
<layout>
    <range_hashed>
        <!-- Стратегия для перекрывающихся диапазонов (min/max). По умолчанию: min (возвращает сопоставляющий диапазон с минимальным значением (range_min -> range_max). -->
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

``` sql
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

Для работы с этими словарями необходимо передать дополнительный аргумент в функцию `dictGet`, для которого выбирается диапазон:

``` sql
dictGet('dict_name', 'attr_name', id, date)
```

Пример запроса:

``` sql
SELECT dictGet('discounts_dict', 'amount', 1, '2022-10-20'::Date);
```

Эта функция возвращает значение для указанных `id` и диапазона дат, который включает переданную дату.

Подробности алгоритма:

- Если `id` не найден или диапазон не найден для `id`, возвращается значение по умолчанию для типа атрибута.
- Если есть перекрывающиеся диапазоны и `range_lookup_strategy=min`, возвращается сопоставляющий диапазон с минимальным `range_min`, если найдено несколько диапазонов, возвращается диапазон с минимальным `range_max`, если снова найдено несколько диапазонов (несколько диапазонов имели одинаковые `range_min` и `range_max`, возвращается случайный диапазон из них.
- Если есть перекрывающиеся диапазоны и `range_lookup_strategy=max`, возвращается сопоставляющий диапазон с максимальным `range_min`, если найдено несколько диапазонов, возвращается диапазон с максимальным `range_max`, если снова найдено несколько диапазонов (несколько диапазонов имели одинаковые `range_min` и `range_max`, возвращается случайный диапазон из них.
- Если `range_max` равен `NULL`, диапазон считается открытым. `NULL` трактуется как максимально возможное значение. Для `range_min` может быть использовано `1970-01-01` или `0` (-MAX_INT) как открытое значение.

Пример конфигурации:

``` xml
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

``` sql
CREATE DICTIONARY somedict(
    Abcdef UInt64,
    StartTimeStamp UInt64,
    EndTimeStamp UInt64,
    XXXType String DEFAULT ''
)
PRIMARY KEY Abcdef
RANGE(MIN StartTimeStamp MAX EndTimeStamp)
```

Пример конфигурации с перекрывающимися диапазонами и открытыми диапазонами:

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
│ 0.1 │ -- единственный подходящий диапазон: 2015-01-01 - Null
└─────┘

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-16')) res;
┌─res─┐
│ 0.2 │ -- два диапазона соответствуют, range_min 2015-01-15 (0.2) больше, чем 2015-01-01 (0.1)
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.4 │ -- два диапазона соответствуют, range_min 2015-01-01 (0.3) больше, чем 2015-01-04 (0.4)
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.5 │ -- два диапазона соответствуют, range_min равны, 2015-01-15 (0.5) больше, чем 2015-01-10 (0.6)
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
│ 0.1 │ -- единственный подходящий диапазон: 2015-01-01 - Null
└─────┘

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-16')) res;
┌─res─┐
│ 0.1 │ -- два диапазона соответствуют, range_min 2015-01-01 (0.1) меньше, чем 2015-01-15 (0.2)
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.3 │ -- два диапазона соответствуют, range_min 2015-01-01 (0.3) меньше, чем 2015-01-04 (0.4)
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.6 │ -- два диапазона соответствуют, range_min равны, 2015-01-10 (0.6) меньше, чем 2015-01-15 (0.5)
└─────┘
```
### complex_key_range_hashed {#complex_key_range_hashed}

Словарь хранится в памяти в виде хеш-таблицы с упорядоченным массивом диапазонов и их соответствующих значений (см. [range_hashed](#range_hashed)). Этот тип хранения предназначен для использования с составными [ключами](#dictionary-key-and-fields).

Пример конфигурации:

``` sql
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

Словарь хранится в кэше, который имеет фиксированное количество ячеек. Эти ячейки содержат часто используемые элементы.

Ключ словаря имеет тип [UInt64](../../sql-reference/data-types/int-uint.md).

При поиске словаря сначала ищется в кэше. Для каждого блока данных все ключи, которые не найдены в кэше или устарели, запрашиваются из источника с помощью `SELECT attrs... FROM db.table WHERE id IN (k1, k2, ...)`. Полученные данные затем записываются в кэш.

Если ключи не найдены в словаре, то создается задача обновления кэша и добавляется в очередь обновления. Свойства очереди обновления можно контролировать с помощью настроек `max_update_queue_size`, `update_queue_push_timeout_milliseconds`, `query_wait_timeout_milliseconds`, `max_threads_for_updates`.

Для кэшированных словарей можно установить срок [жизни](#refreshing-dictionary-data-using-lifetime) данных в кэше. Если с момента загрузки данных в ячейку прошло больше времени, чем `lifetime`, значение ячейки не используется, а ключ становится недействительным. Ключ запрашивается снова в следующий раз, когда его нужно использовать. Это поведение можно настроить с помощью настройки `allow_read_expired_keys`.

Это наименее эффективный из всех способов хранения словарей. Скорость кэша сильно зависит от правильных настроек и сценария использования. Словарь типа кеша работает хорошо только при достаточно высоких показателях попаданий (рекомендуется 99% и выше). Вы можете просмотреть средний показатель попадания в таблице [system.dictionaries](../../operations/system-tables/dictionaries.md).

Если настройка `allow_read_expired_keys` установлена в 1, по умолчанию 0. Тогда словарь может поддерживать асинхронные обновления. Если клиент запрашивает ключи, и все они находятся в кэше, но некоторые из них устарели, то словарь вернет устаревшие ключи клиенту и асинхронно запросит их у источника.

Чтобы улучшить производительность кэша, используйте подзапрос с `LIMIT`, и вызывайте функцию с словарем извне.

Поддерживаются все типы источников.

Пример настроек:

``` xml
<layout>
    <cache>
        <!-- Размер кэша в количестве ячеек. Округляется до степени двойки. -->
        <size_in_cells>1000000000</size_in_cells>
        <!-- Позволяет читать устаревшие ключи. -->
        <allow_read_expired_keys>0</allow_read_expired_keys>
        <!-- Максимальный размер очереди обновления. -->
        <max_update_queue_size>100000</max_update_queue_size>
        <!-- Максимальный тайм-аут в миллисекундах для добавления задачи обновления в очередь. -->
        <update_queue_push_timeout_milliseconds>10</update_queue_push_timeout_milliseconds>
        <!-- Максимальный тайм-аут ожидания в миллисекундах для завершения задачи обновления. -->
        <query_wait_timeout_milliseconds>60000</query_wait_timeout_milliseconds>
        <!-- Максимальное количество потоков для обновления словаря кэша. -->
        <max_threads_for_updates>4</max_threads_for_updates>
    </cache>
</layout>
```

или

``` sql
LAYOUT(CACHE(SIZE_IN_CELLS 1000000000))
```

Установите достаточно большой размер кэша. Вам потребуется поэкспериментировать, чтобы выбрать количество ячеек:

1. Установите какое-то значение.
2. Запустите запросы, пока кэш полностью не заполнится.
3. Оцените использование памяти с помощью таблицы `system.dictionaries`.
4. Увеличьте или уменьшите количество ячеек, пока не будет достигнуто необходимое потребление памяти.

:::note
Не используйте ClickHouse в качестве источника, потому что это медленно обрабатывает запросы с произвольными чтениями.
:::

### complex_key_cache {#complex_key_cache}

Этот тип хранения предназначен для использования с составными [ключами](#dictionary-key-and-fields). Похоже на `cache`.

### ssd_cache {#ssd_cache}

Похоже на `cache`, но хранит данные на SSD, а индекс в ОЗУ. Все настройки кэшированных словарей, относящиеся к очереди обновления, также могут быть применены к словарям кэша SSD.

Ключ словаря имеет тип [UInt64](../../sql-reference/data-types/int-uint.md).

``` xml
<layout>
    <ssd_cache>
        <!-- Размер элементарного блока чтения в байтах. Рекомендуется равным размеру страницы SSD. -->
        <block_size>4096</block_size>
        <!-- Максимальный размер файла кэша в байтах. -->
        <file_size>16777216</file_size>
        <!-- Размер ОЗУ в байтах для чтения элементов с SSD. -->
        <read_buffer_size>131072</read_buffer_size>
        <!-- Размер ОЗУ в байтах для агрегации элементов перед сбросом на SSD. -->
        <write_buffer_size>1048576</write_buffer_size>
        <!-- Путь, где будет храниться файл кэша. -->
        <path>/var/lib/clickhouse/user_files/test_dict</path>
    </ssd_cache>
</layout>
```

или

``` sql
LAYOUT(SSD_CACHE(BLOCK_SIZE 4096 FILE_SIZE 16777216 READ_BUFFER_SIZE 1048576
    PATH '/var/lib/clickhouse/user_files/test_dict'))
```

### complex_key_ssd_cache {#complex_key_ssd_cache}

Этот тип хранения предназначен для использования с составными [ключами](#dictionary-key-and-fields). Похоже на `ssd_cache`.

### direct {#direct}

Словарь не хранится в памяти и напрямую обращается к источнику во время обработки запроса.

Ключ словаря имеет тип [UInt64](../../sql-reference/data-types/int-uint.md).

Поддерживаются все типы [источников](#dictionary-sources), кроме локальных файлов.

Пример конфигурации:

``` xml
<layout>
  <direct />
</layout>
```

или

``` sql
LAYOUT(DIRECT())
```

### complex_key_direct {#complex_key_direct}

Этот тип хранения предназначен для использования с составными [ключами](#dictionary-key-and-fields). Похоже на `direct`.

### ip_trie {#ip_trie}

Этот тип хранения предназначен для отображения сетевых префиксов (IP-адресов) на метаданные, такие как ASN.

**Пример**

Предположим, у нас есть таблица в ClickHouse, которая содержит наши IP префиксы и отображения:

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

``` xml
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
        <!-- Атрибут ключа `prefix` может быть получен через dictGetString. -->
        <!-- Этот вариант увеличивает использование памяти. -->
        <access_to_key_from_attributes>true</access_to_key_from_attributes>
    </ip_trie>
</layout>
```

или

``` sql
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

Ключ должен состоять только из одного атрибута типа `String`, который содержит допустимый IP префикс. Другие типы еще не поддерживаются.

Синтаксис:

``` sql
dictGetT('dict_name', 'attr_name', ip)
```

Функция принимает либо `UInt32` для IPv4, либо `FixedString(16)` для IPv6. Например:

``` sql
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
```
## Обновление данных словаря с использованием LIFETIME {#refreshing-dictionary-data-using-lifetime}

ClickHouse периодически обновляет словари на основе тега `LIFETIME` (определяется в секундах). `LIFETIME` — это интервал обновления для полностью загруженных словарей и интервал аннулирования для кэшированных словарей.

Во время обновлений старая версия словаря все еще может быть запрошена. Обновления словарей (кроме загрузки словаря для первого использования) не блокируют запросы. Если во время обновления произошла ошибка, сообщение об ошибке записывается в журнал сервера, и запросы могут продолжать использовать старую версию словаря. Если обновление словаря прошло успешно, старая версия словаря заменяется атомарно.

Пример настроек:

<CloudDetails />

``` xml
<dictionary>
    ...
    <lifetime>300</lifetime>
    ...
</dictionary>
```

или

``` sql
CREATE DICTIONARY (...)
...
LIFETIME(300)
...
```

Установка `<lifetime>0</lifetime>` (`LIFETIME(0)`) предотвращает обновление словарей.

Вы можете установить временной интервал для обновлений, и ClickHouse выберет равномерно случайное время в этом диапазоне. Это необходимо для распределения нагрузки на источник словаря при обновлении на большом количестве серверов.

Пример настроек:

``` xml
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

``` sql
LIFETIME(MIN 300 MAX 360)
```

Если `<min>0</min>` и `<max>0</max>`, ClickHouse не перезагрузит словарь по истечении времени.
В этом случае ClickHouse может перезагрузить словарь раньше, если файл конфигурации словаря был изменен или была выполнена команда `SYSTEM RELOAD DICTIONARY`.

При обновлении словарей сервер ClickHouse применяет различную логику в зависимости от типа [источника](#dictionary-sources):

- Для текстового файла он проверяет время изменения. Если время отличается от ранее записанного времени, словарь обновляется.
- Словари из других источников обновляются каждый раз по умолчанию.

Для других источников (ODBC, PostgreSQL, ClickHouse и т.д.) вы можете настроить запрос, который будет обновлять словари только в том случае, если они действительно изменились, а не каждый раз. Для этого выполните следующие шаги:

- У таблицы словаря должно быть поле, которое всегда изменяется, когда обновляются исходные данные.
- В настройках источника должно быть указано выражение, которое извлекает изменяющееся поле. Сервер ClickHouse интерпретирует результат запроса как строку, и если эта строка изменилась по сравнению с предыдущим состоянием, словарь обновляется. Укажите запрос в поле `<invalidate_query>` в настройках для [источника](#dictionary-sources).

Пример настроек:

``` xml
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

``` sql
...
SOURCE(ODBC(... invalidate_query 'SELECT update_time FROM dictionary_source where id = 1'))
...
```

Для словарей `Cache`, `ComplexKeyCache`, `SSDCache` и `SSDComplexKeyCache` поддерживаются как синхронные, так и асинхронные обновления.

Также возможно для словарей `Flat`, `Hashed`, `ComplexKeyHashed` запрашивать только данные, которые изменились после предыдущего обновления. Если `update_field` указан как часть конфигурации источника словаря, значение предыдущего времени обновления в секундах будет добавлено к запросу данных. В зависимости от типа источника (Executable, HTTP, MySQL, PostgreSQL, ClickHouse или ODBC) разная логика будет применяться к `update_field` перед запросом данных из внешнего источника.

- Если источник — HTTP, тогда `update_field` будет добавлен как параметр запроса с временем последнего обновления в качестве значения параметра.
- Если источник — Executable, тогда `update_field` будет добавлен как аргумент исполняемого скрипта с временем последнего обновления в качестве значения аргумента.
- Если источник — ClickHouse, MySQL, PostgreSQL, ODBC, будет добавлена дополнительная часть `WHERE`, где `update_field` сравнивается как больше или равно времени последнего обновления.
    - По умолчанию это условие `WHERE` проверяется на самом высоком уровне SQL-запроса. В качестве альтернативы условие можно проверить в любом другом предложении `WHERE` внутри запроса, используя ключевое слово `{condition}`. Пример:
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

Если опция `update_field` установлена, дополнительную опцию `update_lag` можно установить. Значение опции `update_lag` вычитается из предыдущего времени обновления перед запросом обновленных данных.

Пример настроек:

``` xml
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

``` sql
...
SOURCE(CLICKHOUSE(... update_field 'added_time' update_lag 15))
...
```
## Источники словарей {#dictionary-sources}

<CloudDetails />

Словарь может быть подключен к ClickHouse из различных источников.

Если словарь настроен с использованием xml-файла, конфигурация выглядит так:

``` xml
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

В случае [DDL-запроса](../../sql-reference/statements/create/dictionary.md) конфигурация, описанная выше, будет выглядеть так:

``` sql
CREATE DICTIONARY dict_name (...)
...
SOURCE(SOURCE_TYPE(param1 val1 ... paramN valN)) -- Конфигурация источника
...
```

Источник конфигурируется в разделе `source`.

Для типов источников [Локальный файл](#local-file), [Исполняемый файл](#executable-file), [HTTP(s)](#https), [ClickHouse](#clickhouse)
доступны дополнительные настройки:

``` xml
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

``` sql
SOURCE(FILE(path './user_files/os.tsv' format 'TabSeparated'))
SETTINGS(format_csv_allow_single_quotes = 0)
```

Типы источников (`source_type`):

- [Локальный файл](#local-file)
- [Исполняемый файл](#executable-file)
- [Исполняемый пул](#executable-pool)
- [HTTP(S)](#https)
- Системы управления базами данных
    - [ODBC](#odbc)
    - [MySQL](#mysql)
    - [ClickHouse](#clickhouse)
    - [MongoDB](#mongodb)
    - [Redis](#redis)
    - [Cassandra](#cassandra)
    - [PostgreSQL](#postgresql)
### Локальный файл {#local-file}

Пример настроек:

``` xml
<source>
  <file>
    <path>/opt/dictionaries/os.tsv</path>
    <format>TabSeparated</format>
  </file>
</source>
```

или

``` sql
SOURCE(FILE(path './user_files/os.tsv' format 'TabSeparated'))
```

Поля настройки:

- `path` – Абсолютный путь к файлу.
- `format` – Формат файла. Все форматы, описанные в [Форматах](/sql-reference/formats), поддерживаются.

Когда словарь с источником `FILE` создается с помощью DDL-команды (`CREATE DICTIONARY ...`), файл источника должен находиться в директории `user_files`, чтобы предотвратить доступ пользователей БД к произвольным файлам на узле ClickHouse.

**См. также**

- [Функция словаря](/sql-reference/table-functions/dictionary)
### Исполняемый файл {#executable-file}

Работа с исполняемыми файлами зависит от [того, как словарь хранится в памяти](#storing-dictionaries-in-memory). Если словарь хранится с использованием `cache` и `complex_key_cache`, ClickHouse запрашивает необходимые ключи, отправляя запрос в STDIN исполняемого файла. В противном случае ClickHouse запускает исполняемый файл и рассматривает его вывод как данные словаря.

Пример настроек:

``` xml
<source>
    <executable>
        <command>cat /opt/dictionaries/os.tsv</command>
        <format>TabSeparated</format>
        <implicit_key>false</implicit_key>
    </executable>
</source>
```

Поля настройки:

- `command` — Абсолютный путь к исполняемому файлу или имя файла (если директория команды указана в `PATH`).
- `format` — Формат файла. Все форматы, описанные в [Форматах](/sql-reference/formats), поддерживаются.
- `command_termination_timeout` — исполняемый скрипт должен содержать основной цикл чтения и записи. После уничтожения словаря труба закрывается, и исполняемый файл будет иметь `command_termination_timeout` секунд, чтобы завершиться, прежде чем ClickHouse отправит сигнал SIGTERM дочернему процессу. `command_termination_timeout` указывается в секундах. Значение по умолчанию — 10. Необязательный параметр.
- `command_read_timeout` - Тайм-аут для чтения данных из стандартного вывода команды в миллисекундах. Значение по умолчанию 10000. Необязательный параметр.
- `command_write_timeout` - Тайм-аут для записи данных в стандартный ввод команды в миллисекундах. Значение по умолчанию 10000. Необязательный параметр.
- `implicit_key` — Исполняемый исходный файл может возвращать только значения, а соответствие запрашиваемым ключам определяется неявно — по порядку строк в результате. Значение по умолчанию — false.
- `execute_direct` - Если `execute_direct` = `1`, тогда `command` будет искать внутри папки user_scripts, указанной в [user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path). Дополнительные аргументы скрипта могут быть указаны с использованием пробела. Пример: `script_name arg1 arg2`. Если `execute_direct` = `0`, `command` передается как аргумент для `bin/sh -c`. Значение по умолчанию — `0`. Необязательный параметр.
- `send_chunk_header` - управляет тем, нужно ли отправлять количество строк перед отправкой части данных на обработку. Необязательный. Значение по умолчанию — `false`.

Этот источник словаря может быть сконфигурирован только через XML-конфигурацию. Создание словарей с исполняемым источником через DDL отключено; в противном случае пользователь БД смог бы выполнять произвольные бинарные файлы на узле ClickHouse.
### Исполняемый пул {#executable-pool}

Исполняемый пул позволяет загружать данные из пула процессов. Этот источник не работает с макетами словаря, которым необходимо загружать все данные из источника. Исполняемый пул работает, если словарь [хранится](#ways-to-store-dictionaries-in-memory) с использованием макетов `cache`, `complex_key_cache`, `ssd_cache`, `complex_key_ssd_cache`, `direct` или `complex_key_direct`.

Исполняемый пул создаст пул процессов с указанной командой и будет держать их работающими, пока они не завершатся. Программа должна читать данные из STDIN, пока они доступны, и выводить результат в STDOUT. Она может ждать следующего блока данных на STDIN. ClickHouse не закроет STDIN после обработки блока данных, но передаст другую часть данных, когда это необходимо. Исполняемый скрипт должен быть готов к такому способу обработки данных — он должен опрашивать STDIN и заранее сбрасывать данные в STDOUT.

Пример настроек:

``` xml
<source>
    <executable_pool>
        <command>while read key; do printf "$key\tData for key $key\n"; done</command>
        <format>TabSeparated</format>
        <pool_size>10</pool_size>
        <max_command_execution_time>10</max_command_execution_time>
        <implicit_key>false</implicit_key>
    </executable_pool>
</source>
```

Поля настройки:

- `command` — Абсолютный путь к исполняемому файлу или имя файла (если директория программы написана в `PATH`).
- `format` — Формат файла. Все форматы, описанные в "[Форматах](/sql-reference/formats)", поддерживаются.
- `pool_size` — Размер пула. Если для `pool_size` указано 0, то нет ограничений по размеру пула. Значение по умолчанию — `16`.
- `command_termination_timeout` — исполняемый скрипт должен содержать основной цикл чтения и записи. После уничтожения словаря труба закрывается, и исполняемый файл будет иметь `command_termination_timeout` секунд, чтобы завершиться, прежде чем ClickHouse отправит сигнал SIGTERM дочернему процессу. Указывается в секундах. Значение по умолчанию — 10. Необязательный параметр.
- `max_command_execution_time` — Максимальное время выполнения команды исполняемого скрипта для обработки блока данных. Указывается в секундах. Значение по умолчанию — 10. Необязательный параметр.
- `command_read_timeout` - тайм-аут для чтения данных из стандартного вывода команды в миллисекундах. Значение по умолчанию 10000. Необязательный параметр.
- `command_write_timeout` - тайм-аут для записи данных в стандартный ввод команды в миллисекундах. Значение по умолчанию 10000. Необязательный параметр.
- `implicit_key` — Исполняемый источник файла может возвращать только значения, а соответствие запрашиваемым ключам определяется неявно — по порядку строк в результате. Значение по умолчанию — false. Необязательный параметр.
- `execute_direct` - Если `execute_direct` = `1`, тогда `command` будет искаться внутри пользоватеской папки user_scripts, указанной в [user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path). Дополнительные аргументы скрипта могут быть указаны с использованием пробела. Пример: `script_name arg1 arg2`. Если `execute_direct` = `0`, `command` передается как аргумент для `bin/sh -c`. Значение по умолчанию — `1`. Необязательный параметр.
- `send_chunk_header` - управляет тем, нужно ли отправлять количество строк перед отправкой части данных на обработку. Необязательный. Значение по умолчанию — `false`.

Этот источник словаря может быть сконфигурирован только через XML-конфигурацию. Создание словарей с исполняемым источником через DDL отключено; в противном случае пользователь БД смог бы выполнять произвольный бинарный файл на узле ClickHouse.
### HTTP(S) {#https}

Работа с HTTP(S) сервером зависит от [того, как словарь хранится в памяти](#storing-dictionaries-in-memory). Если словарь хранится с использованием `cache` и `complex_key_cache`, ClickHouse запрашивает необходимые ключи, отправляя запрос через метод `POST`.

Пример настроек:

``` xml
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

``` sql
SOURCE(HTTP(
    url 'http://[::1]/os.tsv'
    format 'TabSeparated'
    credentials(user 'user' password 'password')
    headers(header(name 'API-KEY' value 'key'))
))
```

Чтобы ClickHouse получил доступ к ресурсу HTTPS, необходимо [настроить openSSL](../../operations/server-configuration-parameters/settings.md#openssl) в конфигурации сервера.

Поля настройки:

- `url` – URL источника.
- `format` – Формат файла. Все форматы, описанные в "[Форматах](/sql-reference/formats)", поддерживаются.
- `credentials` – Базовая HTTP-аутентификация. Необязательный параметр.
- `user` – Имя пользователя, необходимое для аутентификации.
- `password` – Пароль, необходимый для аутентификации.
- `headers` – Все пользовательские настройки HTTP заголовков, используемых для HTTP-запроса. Необязательный параметр.
- `header` – Один элемент HTTP заголовка.
- `name` – Имя идентификатора, используемого для заголовка, отправленного в запросе.
- `value` – Значение, установленное для конкретного имени идентификатора.

При создании словаря с использованием DDL-команды (`CREATE DICTIONARY ...`) удаленные хосты для HTTP словарей проверяются по содержимому секции `remote_url_allow_hosts` из конфигурации, чтобы предотвратить доступ пользователей базы данных к произвольному HTTP серверу.
### СУБД {#dbms}
#### ODBC {#odbc}

Вы можете использовать этот метод для подключения к любой базе данных, у которой есть ODBC драйвер.

Пример настроек:

``` xml
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

``` sql
SOURCE(ODBC(
    db 'DatabaseName'
    table 'SchemaName.TableName'
    connection_string 'DSN=some_parameters'
    invalidate_query 'SQL_QUERY'
    query 'SELECT id, value_1, value_2 FROM db_name.table_name'
))
```

Поля настройки:

- `db` – Имя базы данных. Не указывайте его, если имя базы данных задано в параметрах `<connection_string>`.
- `table` – Имя таблицы и схемы, если таковая имеется.
- `connection_string` – Строка подключения.
- `invalidate_query` – Запрос для проверки состояния словаря. Необязательный параметр. Читайте подробнее в разделе [Обновление данных словаря с использованием LIFETIME](#refreshing-dictionary-data-using-lifetime).
- `background_reconnect` – Повторное подключение к реплике в фоновом режиме в случае потери соединения. Необязательный параметр.
- `query` – Пользовательский запрос. Необязательный параметр.

:::note
Поля `table` и `query` не могут использоваться одновременно. И одно из полей `table` или `query` должно быть объявлено.
:::

ClickHouse получает символы обрамления от ODBC-драйвера и обрамляет все настройки в запросах к драйверу, поэтому необходимо правильно задать имя таблицы в соответствии с регистром имени таблицы в базе данных.

Если у вас есть проблемы с кодировками при использовании Oracle, смотрите соответствующий элемент [Часто задаваемые вопросы](/knowledgebase/oracle-odbc).
##### Известная уязвимость функциональности словаря ODBC {#known-vulnerability-of-the-odbc-dictionary-functionality}

:::note
При подключении к базе данных через ODBC-драйвер параметр подключения `Servername` может быть подменен. В этом случае значения `USERNAME` и `PASSWORD` из `odbc.ini` отправляются на удаленный сервер и могут быть скомпрометированы.
:::

**Пример небезопасного использования**

Настроим unixODBC для PostgreSQL. Содержимое `/etc/odbc.ini`:

``` text
[gregtest]
Driver = /usr/lib/psqlodbca.so
Servername = localhost
PORT = 5432
DATABASE = test_db
#OPTION = 3
USERNAME = test
PASSWORD = test
```

Если затем вы сделаете запрос, например

``` sql
SELECT * FROM odbc('DSN=gregtest;Servername=some-server.com', 'test_db');
```

Драйвер ODBC отправит значения `USERNAME` и `PASSWORD` из `odbc.ini` на `some-server.com`.
##### Пример подключения к Postgresql {#example-of-connecting-postgresql}

Операционная система Ubuntu.

Установка unixODBC и драйвера ODBC для PostgreSQL:

``` bash
$ sudo apt-get install -y unixodbc odbcinst odbc-postgresql
```

Настройка `/etc/odbc.ini` (или `~/.odbc.ini`, если вы вошли под пользователем, который запускает ClickHouse):

``` text
    [DEFAULT]
    Driver = myconnection

    [myconnection]
    Description         = Подключение к PostgreSQL для my_db
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

``` xml
<clickhouse>
    <dictionary>
        <name>table_name</name>
        <source>
            <odbc>
                <!-- Вы можете указать следующие параметры в строке подключения: -->
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

``` sql
CREATE DICTIONARY table_name (
    id UInt64,
    some_column UInt64 DEFAULT 0
)
PRIMARY KEY id
SOURCE(ODBC(connection_string 'DSN=myconnection' table 'postgresql_table'))
LAYOUT(HASHED())
LIFETIME(MIN 300 MAX 360)
```

Вам может понадобиться отредактировать `odbc.ini`, чтобы указать полный путь к библиотеке с драйвером `DRIVER=/usr/local/lib/psqlodbcw.so`.
##### Пример подключения к MS SQL Server {#example-of-connecting-ms-sql-server}

Операционная система Ubuntu.

Установка ODBC-драйвера для подключения к MS SQL:

``` bash
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

    # тест TDS соединения
    $ sqsh -S MSSQL -D database -U user -P password


    $ cat /etc/odbcinst.ini

    [FreeTDS]
    Description     = FreeTDS
    Driver          = /usr/lib/x86_64-linux-gnu/odbc/libtdsodbc.so
    Setup           = /usr/lib/x86_64-linux-gnu/odbc/libtdsS.so
    FileUsage       = 1
    UsageCount      = 5

    $ cat /etc/odbc.ini
    # $ cat ~/.odbc.ini # если вы вошли под пользователем, который запускает ClickHouse

    [MSSQL]
    Description     = FreeTDS
    Driver          = FreeTDS
    Servername      = MSSQL
    Database        = test
    UID             = test
    PWD             = test
    Port            = 1433


    # (необязательно) протестируйте ODBC соединение (для использования инструмента isql установите пакет [unixodbc](https://packages.debian.org/sid/unixodbc))
    $ isql -v MSSQL "user" "password"
```

Замечания:
- чтобы определить самую раннюю версию TDS, которая поддерживается конкретной версией SQL Server, обращайтесь к документации продукта или смотрите [MS-TDS Product Behavior](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-tds/135d0ebe-5c4c-4a94-99bf-1811eccb9f4a)

Настройка словаря в ClickHouse:

``` xml
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

``` sql
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

``` xml
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

``` sql
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

Поля настройки:

- `port` – Порт на сервере MySQL. Вы можете указать его для всех реплик или для каждой из них индивидуально (внутри `<replica>`).

- `user` – Имя пользователя MySQL. Вы можете указать его для всех реплик или для каждой из них индивидуально (внутри `<replica>`).

- `password` – Пароль пользователя MySQL. Вы можете указать его для всех реплик или для каждой из них индивидуально (внутри `<replica>`).

- `replica` – Раздел конфигурации реплик. Может быть несколько разделов.

        - `replica/host` – Хост MySQL.
        - `replica/priority` – Приоритет реплики. При попытке подключения ClickHouse проходит по репликам в порядке приоритета. Чем ниже число, тем выше приоритет.

- `db` – Имя базы данных.

- `table` – Имя таблицы.

- `where` – Критерии выбора. Синтаксис для условий такой же, как для оператора `WHERE` в MySQL, например, `id > 10 AND id < 20`. Необязательный параметр.

- `invalidate_query` – Запрос для проверки состояния словаря. Необязательный параметр. Читайте подробнее в разделе [Обновление данных словаря с использованием LIFETIME](#refreshing-dictionary-data-using-lifetime).

- `fail_on_connection_loss` – Параметр конфигурации, который управляет поведением сервера при потере соединения. Если `true`, исключение выбрасывается немедленно, если соединение между клиентом и сервером было потеряно. Если `false`, сервер ClickHouse повторяет попытку выполнить запрос три раза, прежде чем выбросить исключение. Обратите внимание, что повторные попытки могут привести к увеличению времени ответа. Значение по умолчанию: `false`.

- `query` – Пользовательский запрос. Необязательный параметр.

:::note
Поля `table` или `where` не могут использоваться вместе с полем `query`. И одно из полей `table` или `query` должно быть объявлено.
:::

:::note
Нет явного параметра `secure`. При установлении SSL-соединения безопасность обязательна.
:::

MySQL можно подключить на локальном хосте через сокеты. Для этого установите `host` и `socket`.

Пример настроек:

``` xml
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

``` sql
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

``` xml
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

``` sql
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

Поля настройки:

- `host` – Хост ClickHouse. Если это локальный хост, запрос обрабатывается без какой-либо сетевой активности. Чтобы улучшить отказоустойчивость, вы можете создать [Распределенную](../../engines/table-engines/special/distributed.md) таблицу и включить её в последующие конфигурации.
- `port` – Порт на сервере ClickHouse.
- `user` – Имя пользователя ClickHouse.
- `password` – Пароль пользователя ClickHouse.
- `db` – Имя базы данных.
- `table` – Имя таблицы.
- `where` – Критерии выбора. Могут быть опущены.
- `invalidate_query` – Запрос для проверки состояния словаря. Необязательный параметр. Читайте подробнее в разделе [Обновление данных словаря с использованием LIFETIME](#refreshing-dictionary-data-using-lifetime).
- `secure` - Использовать ssl для соединения.
- `query` – Пользовательский запрос. Необязательный параметр.

:::note
Поля `table` или `where` не могут использоваться вместе с полем `query`. И одно из полей `table` или `query` должно быть объявлено.
:::
#### MongoDB {#mongodb}

Пример настроек:

``` xml
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

``` xml
<source>
    <mongodb>
        <uri>mongodb://localhost:27017/test?ssl=true</uri>
        <collection>dictionary_source</collection>
    </mongodb>
</source>
```

или

``` sql
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

- `host` – Хост MongoDB.
- `port` – Порт на сервере MongoDB.
- `user` – Имя пользователя MongoDB.
- `password` – Пароль пользователя MongoDB.
- `db` – Имя базы данных.
- `collection` – Имя коллекции.
- `options` -  Опции строки подключения MongoDB (необязательный параметр).

или

``` sql
SOURCE(MONGODB(
    uri 'mongodb://localhost:27017/clickhouse'
    collection 'dictionary_source'
))
```

Поля настройки:

- `uri` - URI для установления соединения.
- `collection` – Имя коллекции.

[Дополнительная информация о движке](../../engines/table-engines/integrations/mongodb.md)
#### Redis {#redis}

Пример настроек:

``` xml
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

``` sql
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
- `storage_type` – Структура внутреннего хранилища Redis, используемая для работы с ключами. `simple` подходит для простых источников и для источников с одним хэшированным ключом, `hash_map` – для хэшированных источников с двумя ключами. Источники с диапазонами и кэшированные источники с комплексными ключами не поддерживаются. Можно пропустить, значение по умолчанию – `simple`.
- `db_index` – Конкретный числовой индекс логической базы данных Redis. Можно пропустить, значение по умолчанию – 0.

#### Cassandra {#cassandra}

Пример настроек:

``` xml
<source>
    <cassandra>
        <host>localhost</host>
        <port>9042</port>
        <user>username</user>
        <password>qwerty123</password>
        <keyspace>database_name</keyspace>
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
- `port` – Порт на серверах Cassandra. Если не указано, используется порт по умолчанию 9042.
- `user` – Имя пользователя Cassandra.
- `password` – Пароль пользователя Cassandra.
- `keyspace` – Имя пространства ключей (базы данных).
- `column_family` – Имя семейства колонок (таблицы).
- `allow_filtering` – Флаг, разрешающий или не разрешающий потенциально дорогостоящие условия по колонкам кластерного ключа. Значение по умолчанию – 1.
- `partition_key_prefix` – Количество колонок ключа партиции в первичном ключе таблицы Cassandra. Требуется для составных словарей. Порядок колонок ключа в определении словаря должен совпадать с порядком в Cassandra. Значение по умолчанию – 1 (первая колонка ключа является ключом партиции, а другие колонки ключа — кластерными ключами).
- `consistency` – Уровень согласованности. Возможные значения: `One`, `Two`, `Three`, `All`, `EachQuorum`, `Quorum`, `LocalQuorum`, `LocalOne`, `Serial`, `LocalSerial`. Значение по умолчанию – `One`.
- `where` – Необязательные критерии выбора.
- `max_threads` – Максимальное количество потоков для загрузки данных из нескольких партиций в составных словарях.
- `query` – Пользовательский запрос. Необязательный параметр.

:::note
Поля `column_family` или `where` не могут использоваться вместе с полем `query`. И должно быть объявлено одно из полей `column_family` или `query`.
:::

#### PostgreSQL {#postgresql}

Пример настроек:

``` xml
<source>
  <postgresql>
      <host>postgresql-hostname</host>
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

``` sql
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

- `host` – Хост на сервере PostgreSQL. Можно указать для всех реплик или для каждой реплики отдельно (внутри `<replica>`).
- `port` – Порт на сервере PostgreSQL. Можно указать для всех реплик или для каждой реплики отдельно (внутри `<replica>`).
- `user` – Имя пользователя PostgreSQL. Можно указать для всех реплик или для каждой реплики отдельно (внутри `<replica>`).
- `password` – Пароль пользователя PostgreSQL. Можно указать для всех реплик или для каждой реплики отдельно (внутри `<replica>`).
- `replica` – Секция конфигурации реплик. Могут быть несколько секций:
    - `replica/host` – Хост PostgreSQL.
    - `replica/port` – Порт PostgreSQL.
    - `replica/priority` – Приоритет реплики. При попытке подключения ClickHouse проходит реплики в порядке приоритета. Чем ниже число, тем выше приоритет.
- `db` – Имя базы данных.
- `table` – Имя таблицы.
- `where` – Критерии выбора. Синтаксис условий такой же, как для оператора `WHERE` в PostgreSQL. Например, `id > 10 AND id < 20`. Необязательный параметр.
- `invalidate_query` – Запрос для проверки статуса словаря. Необязательный параметр. Подробнее в разделе [Refreshing dictionary data using LIFETIME](#refreshing-dictionary-data-using-lifetime).
- `background_reconnect` – Повторное подключение к реплике в фоновом режиме, если подключение не удалось. Необязательный параметр.
- `query` – Пользовательский запрос. Необязательный параметр.

:::note
Поля `table` или `where` не могут использоваться вместе с полем `query`. И должно быть объявлено одно из полей `table` или `query`.
:::

### Null {#null}

Специальный источник, который может быть использован для создания фиктивных (пустых) словарей. Такие словари могут быть полезны для тестирования или в настройках с раздельными данными и узлами запросов на узлах с распределёнными таблицами.

``` sql
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

## Dictionary Key and Fields {#dictionary-key-and-fields}

<CloudDetails />

Клауза `structure` описывает ключ словаря и поля, доступные для запросов.

XML описание:

``` xml
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

Атрибуты описаны в элементах:

- `<id>` — Ключевая колонка
- `<attribute>` — Колонка данных: может быть несколько атрибутов.

DDL запрос:

``` sql
CREATE DICTIONARY dict_name (
    Id UInt64,
    -- атрибуты
)
PRIMARY KEY Id
...
```

Атрибуты описаны в теле запроса:

- `PRIMARY KEY` — Ключевая колонка
- `AttrName AttrType` — Колонка данных. Может быть несколько атрибутов.

## Key {#key}

ClickHouse поддерживает следующие типы ключей:

- Числовой ключ. `UInt64`. Определен в теге `<id>` или с использованием ключевого слова `PRIMARY KEY`.
- Составной ключ. Набор значений разных типов. Определен в теге `<key>` или с помощью ключевого слова `PRIMARY KEY`.

XML структура может содержать либо `<id>`, либо `<key>`. DDL-запрос должен содержать единственный `PRIMARY KEY`.

:::note
Не следует описывать ключ как атрибут.
:::

### Numeric Key {#numeric-key}

Тип: `UInt64`.

Пример конфигурации:

``` xml
<id>
    <name>Id</name>
</id>
```

Поля конфигурации:

- `name` – Имя колонки с ключами.

Для DDL-запроса:

``` sql
CREATE DICTIONARY (
    Id UInt64,
    ...
)
PRIMARY KEY Id
...
```

- `PRIMARY KEY` – Имя колонки с ключами.

### Composite Key {#composite-key}

Ключ может быть `tuple` из любых типов полей. [Макет](#storing-dictionaries-in-memory) в этом случае должен быть `complex_key_hashed` или `complex_key_cache`.

:::tip
Составной ключ может состоять из одного элемента. Это позволяет использовать строку в качестве ключа, например.
:::

Структура ключа задается в элементе `<key>`. Поля ключа указываются в том же формате, что и атрибуты словаря [attributes](#dictionary-key-and-fields). Пример:

``` xml
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

``` sql
CREATE DICTIONARY (
    field1 String,
    field2 String
    ...
)
PRIMARY KEY field1, field2
...
```

Для запроса к функции `dictGet*` в качестве ключа передается кортеж. Пример: `dictGetString('dict_name', 'attr_name', tuple('string for field1', num_for_field2))`.

## Attributes {#attributes}

Пример конфигурации:

``` xml
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

``` sql
CREATE DICTIONARY somename (
    Name ClickHouseDataType DEFAULT '' EXPRESSION rand64() HIERARCHICAL INJECTIVE IS_OBJECT_ID
)
```

Поля конфигурации:

| Tag                                                  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Required |
|------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `name`                                               | Имя колонки.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Yes      |
| `type`                                               | Тип данных ClickHouse: [UInt8](../../sql-reference/data-types/int-uint.md), [UInt16](../../sql-reference/data-types/int-uint.md), [UInt32](../../sql-reference/data-types/int-uint.md), [UInt64](../../sql-reference/data-types/int-uint.md), [Int8](../../sql-reference/data-types/int-uint.md), [Int16](../../sql-reference/data-types/int-uint.md), [Int32](../../sql-reference/data-types/int-uint.md), [Int64](../../sql-reference/data-types/int-uint.md), [Float32](../../sql-reference/data-types/float.md), [Float64](../../sql-reference/data-types/float.md), [UUID](../../sql-reference/data-types/uuid.md), [Decimal32](../../sql-reference/data-types/decimal.md), [Decimal64](../../sql-reference/data-types/decimal.md), [Decimal128](../../sql-reference/data-types/decimal.md), [Decimal256](../../sql-reference/data-types/decimal.md),[Date](../../sql-reference/data-types/date.md), [Date32](../../sql-reference/data-types/date32.md), [DateTime](../../sql-reference/data-types/datetime.md), [DateTime64](../../sql-reference/data-types/datetime64.md), [String](../../sql-reference/data-types/string.md), [Array](../../sql-reference/data-types/array.md).<br/>ClickHouse пытается привести значение из словаря к указанному типу данных. Например, для MySQL поле может быть `TEXT`, `VARCHAR` или `BLOB` в таблице источника MySQL, но оно может быть загружено как `String` в ClickHouse.<br/>[Nullable](../../sql-reference/data-types/nullable.md) в настоящее время поддерживается для словарей [Flat](#flat), [Hashed](#hashed), [ComplexKeyHashed](#complex_key_hashed), [Direct](#direct), [ComplexKeyDirect](#complex_key_direct), [RangeHashed](#range_hashed), Polygon, [Cache](#cache), [ComplexKeyCache](#complex_key_cache), [SSDCache](#ssd_cache), [SSDComplexKeyCache](#complex_key_ssd_cache). В словарях [IPTrie](#ip_trie) типы `Nullable` не поддерживаются. | Yes      |
| `null_value`                                         | Значение по умолчанию для несуществующего элемента.<br/>В примере это пустая строка. Значение [NULL](../syntax.md#null) может использоваться только для типов `Nullable` (см. предыдущую строку с описанием типов).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Yes      |
| `expression`                                         | [Выражение](../../sql-reference/syntax.md#expressions), которое ClickHouse выполняет над значением.<br/>Выражение может быть именем колонки в удаленной SQL базе данных. Таким образом, вы можете использовать его для создания псевдонима для удаленной колонки.<br/><br/>Значение по умолчанию: без выражения.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | No       |
| <a name="hierarchical-dict-attr"></a> `hierarchical` | Если `true`, атрибут содержит значение родительского ключа для текущего ключа. См. [Иерархические словари](#hierarchical-dictionaries).<br/><br/>Значение по умолчанию: `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | No       |
| `injective`                                          | Флаг, который показывает, является ли образ `id -> attribute` [инъективным](https://en.wikipedia.org/wiki/Injective_function).<br/>Если `true`, ClickHouse может автоматически разместить после оператора `GROUP BY` запросы к словарям с инъекцией. Обычно это значительно уменьшает количество таких запросов.<br/><br/>Значение по умолчанию: `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | No       |
| `is_object_id`                                       | Флаг, показывающий, выполняется ли запрос для документа MongoDB по `ObjectID`.<br/><br/>Значение по умолчанию: `false`.
## Hierarchical Dictionaries {#hierarchical-dictionaries}

ClickHouse поддерживает иерархические словари с [числовым ключом](#numeric-key).

Посмотрите на следующую иерархическую структуру:

``` text
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

Эта иерархия может быть выражена в следующей таблице словаря.

| region_id | parent_region | region_name  |
|------------|----------------|---------------|
| 1          | 0              | Россия        |
| 2          | 1              | Москва        |
| 3          | 2              | Центр        |
| 4          | 0              | Великобритания |
| 5          | 4              | Лондон        |

Эта таблица содержит колонку `parent_region`, которая содержит ключ ближайшего родителя для элемента.

ClickHouse поддерживает иерархическое свойство для внешних атрибутов словаря. Это свойство позволяет вам настраивать иерархический словарь, аналогичный описанному выше.

Функция [dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy) позволяет вам получить цепочку родительских элементов.

Для нашего примера структура словаря может быть следующей:

``` xml
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

Полигональные словари позволяют эффективно искать полигон, содержащий указанные точки. Например: определение городской территории по географическим координатам.

Пример конфигурации полигонального словаря:

<CloudDetails />

``` xml
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
``` sql
CREATE DICTIONARY polygon_dict_name (
    key Array(Array(Array(Array(Float64)))),
    name String,
    value UInt64
)
PRIMARY KEY key
LAYOUT(POLYGON(STORE_POLYGON_KEY_COLUMN 1))
...
```

При конфигурации полигонального словаря ключ должен иметь один из двух типов:

- Простой полигон. Это массив точек.
- MultiPolygon. Это массив полигонов. Каждый полигон — это двумерный массив точек. Первый элемент этого массива представляет собой внешнюю границу полигона, а последующие элементы определяют области, которые должны быть исключены из него.

Точки могут быть указаны как массив или кортеж их координат. В текущей реализации поддерживаются только двумерные точки.

Пользователь может загружать свои собственные данные во всех форматах, поддерживаемых ClickHouse.

Доступно 3 типа [хранения в памяти](#storing-dictionaries-in-memory):

- `POLYGON_SIMPLE`. Это примитивная реализация, где для каждого запроса осуществляется линейный проход по всем полигонам, и проверяется принадлежность к каждому без использования дополнительных индексов.

- `POLYGON_INDEX_EACH`. Для каждого полигона строится отдельный индекс, что позволяет быстро проверять принадлежность в большинстве случаев (оптимизировано для географических регионов). Также на рассматриваемую область накладывается сетка, что значительно сужает количество рассматриваемых полигонов. Сетка создается рекурсивным делением ячейки на 16 равных частей и настраивается с помощью двух параметров. Деление прекращается, когда глубина рекурсии достигает `MAX_DEPTH` или когда ячейка пересекает не более чем `MIN_INTERSECTIONS` полигонов. Для обработки запроса используется соответствующая ячейка, и индекс для полигонов, хранящихся в ней, запрашивается поочередно.

- `POLYGON_INDEX_CELL`. Это размещение также создает описанную выше сетку. Доступны те же параметры. Для каждой ячейки листа создается индекс для всех частей полигонов, которые в нее попадают, что позволяет быстро реагировать на запрос.

- `POLYGON`. Синоним `POLYGON_INDEX_CELL`.

Запросы к словарю осуществляются с использованием стандартных [функций](../../sql-reference/functions/ext-dict-functions.md) для работы со словарями. Важное отличие заключается в том, что здесь ключами будут точки, для которых нужно найти полигон, содержащий их.

**Пример**

Пример работы с определенным выше словарем:

``` sql
CREATE TABLE points (
    x Float64,
    y Float64
)
...
SELECT tuple(x, y) AS key, dictGet(dict_name, 'name', key), dictGet(dict_name, 'value', key) FROM points ORDER BY x, y;
```

В результате выполнения последней команды для каждой точки в таблице 'points' будет найден полигон минимальной площади, содержащий эту точку, и запрашиваемые атрибуты будут выведены.

**Пример**

Вы можете читать колонки из полигональных словарей через запрос SELECT, просто включив `store_polygon_key_column = 1` в конфигурацию словаря или соответствующем DDL-запросе.

Запрос:

``` sql
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

``` text
┌─key─────────────────────────────┬─name──┐
│ [[[(3,1),(0,1),(0,-1),(3,-1)]]] │ Value │
└─────────────────────────────────┴───────┘
```
## Словарь дерева регулярных выражений {#regexp-tree-dictionary}

Словари дерева регулярных выражений - это специальный тип словаря, который представляет собой отображение от ключа к атрибутам с использованием дерева регулярных выражений. Существуют некоторые области применения, например, парсинг [user agent](https://en.wikipedia.org/wiki/User_agent) строк, который можно элегантно выразить с помощью словарей дерева регулярных выражений.
### Использование словаря дерева регулярных выражений в ClickHouse Open Source {#use-regular-expression-tree-dictionary-in-clickhouse-open-source}

Словари дерева регулярных выражений определяются в ClickHouse open-source с помощью источника YAMLRegExpTree, в котором указывается путь к YAML-файлу, содержащему дерево регулярных выражений.

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

Источник словаря `YAMLRegExpTree` представляет собой структуру дерева регулярных выражений. Например:

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
- **attributes**: список пользовательских атрибутов словаря. В этом примере есть два атрибута: `name` и `version`. Первый узел определяет оба атрибута. Второй узел определяет только атрибут `name`. Атрибут `version` определяется дочерними узлами второго узла.
  - Значение атрибута может содержать **ссылки на подгруппы**, ссылающиеся на группы захвата соответствующего регулярного выражения. В примере значение атрибута `version` в первом узле состоит из ссылки `\1` на группу захвата `(\d+[\.\d]*)` в регулярном выражении. Номера ссылок колеблются от 1 до 9 и записываются как `$1` или `\1` (для числа 1). Ссылка заменяется на соответствующую группу захвата во время выполнения запроса.
- **дочерние узлы**: список дочерних узлов узла дерева регулярных выражений, каждый из которых имеет свои собственные атрибуты и (возможно) дочерние узлы. Сопоставление строк осуществляется в обход дерева в глубину. Если строка соответствует узлу регулярного выражения, словарь проверяет, соответствует ли она также дочерним узлам. Если это так, атрибуты самого глубокого соответствующего узла назначаются. Атрибуты дочернего узла заменяют атрибуты родительских узлов с одинаковыми именами. Названия дочерних узлов в YAML-файлах могут быть произвольными, например, `versions` в приведенном выше примере.

Словари дерева регулярных выражений разрешают доступ только с использованием функций `dictGet`, `dictGetOrDefault` и `dictGetAll`.

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

В этом случае мы сначала сопоставляем регулярное выражение `\d+/tclwebkit(?:\d+[\.\d]*)` со вторым узлом верхнего слоя. Затем словарь продолжает искать в дочерних узлах и находит, что строка также соответствует `3[12]/tclwebkit`. В результате значение атрибута `name` равно `Android` (определенное на первом уровне), а значение атрибута `version` равно `12` (определенное дочерним узлом).

С помощью мощного YAML-файла конфигурации мы можем использовать словари дерева регулярных выражений как парсер строк user agent. Мы поддерживаем [uap-core](https://github.com/ua-parser/uap-core) и демонстрируем, как использовать это в функциональном тесте [02504_regexp_dictionary_ua_parser](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/02504_regexp_dictionary_ua_parser.sh)
#### Сбор значений атрибутов {#collecting-attribute-values}

Иногда полезно возвращать значения из нескольких регулярных выражений, которые соответствовали, а не только значение листового узла. В таких случаях можно использовать специализированную [`dictGetAll`](../../sql-reference/functions/ext-dict-functions.md#dictgetall) функцию. Если узел имеет значение атрибута типа `T`, `dictGetAll` вернет `Array(T)`, содержащий ноль или более значений.

По умолчанию количество совпадений, возвращаемых на ключ, не ограничено. Ограничение может быть передано в качестве необязательного четвертого аргумента `dictGetAll`. Массив заполняется в _топологическом порядке_, что означает, что дочерние узлы идут перед родительскими узлами, а сестринские узлы следуют в порядке, указанном в источнике.

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
#### Режимы сопоставления {#matching-modes}

Поведение сопоставления шаблона можно изменить с помощью определенных настроек словаря:
- `regexp_dict_flag_case_insensitive`: Использовать нечувствительное к регистру сопоставление (по умолчанию `false`). Можно переопределить в отдельных выражениях с помощью `(?i)` и `(?-i)`.
- `regexp_dict_flag_dotall`: Позволить '.' соответствовать символам новой строки (по умолчанию `false`).
### Использование словаря дерева регулярных выражений в ClickHouse Cloud {#use-regular-expression-tree-dictionary-in-clickhouse-cloud}

Вышеупомянутый источник `YAMLRegExpTree` работает в ClickHouse Open Source, но не в ClickHouse Cloud. Чтобы использовать словари дерева регулярных выражений в ClickHouse Cloud, сначала создайте словарь дерева регулярных выражений из YAML-файла локально в ClickHouse Open Source, а затем выгрузите этот словарь в CSV-файл, используя функцию таблицы `dictionary` и оператор [INTO OUTFILE](../statements/select/into-outfile.md).

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

- `id UInt64`: id узла RegexpTree.
- `parent_id UInt64`: id родителя узла.
- `regexp String`: строка регулярного выражения.
- `keys Array(String)`: имена пользовательских атрибутов.
- `values Array(String)`: значения пользовательских атрибутов.

Чтобы создать словарь в ClickHouse Cloud, сначала создайте таблицу `regexp_dictionary_source_table` с нижеуказанной структурой таблицы:

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

Вы можете ознакомиться с тем, как [вставлять локальные файлы](/integrations/data-ingestion/insert-local-files) для получения дополнительных сведений. После инициализации исходной таблицы мы можем создать RegexpTree из таблицы-источника:

``` sql
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

- Использовать ID региона, чтобы получить его название на нужном языке.
- Использовать ID региона, чтобы получить ID города, области, федерального округа, страны или континента.
- Проверять, является ли регион частью другого региона.
- Получать цепочку родительских регионов.

Все функции поддерживают "транслокальность", способность одновременно использовать разные перспективы на собственность регионов. Для получения дополнительной информации смотрите раздел "Функции для работы с веб-аналитическими словарями".

Внутренние словари отключены в стандартном пакете. Чтобы включить их, раскомментируйте параметры `path_to_regions_hierarchy_file` и `path_to_regions_names_files` в файле конфигурации сервера.

Геобаза загружается из текстовых файлов.

Разместите файлы `regions_hierarchy*.txt` в директории `path_to_regions_hierarchy_file`. Этот параметр конфигурации должен содержать путь к файлу `regions_hierarchy.txt` (стандартная региональная иерархия), а другие файлы (`regions_hierarchy_ua.txt`) должны находиться в той же директории.

Поместите файлы `regions_names_*.txt` в директорию `path_to_regions_names_files`.

Вы также можете создать эти файлы самостоятельно. Формат файла следующий:

`regions_hierarchy*.txt`: TabSeparated (без заголовка), колонки:

- ID региона (`UInt32`)
- ID родительского региона (`UInt32`)
- Тип региона (`UInt8`): 1 - континент, 3 - страна, 4 - федеральный округ, 5 - регион, 6 - город; другие типы не имеют значений
- население (`UInt32`) — необязательная колонка

`regions_names_*.txt`: TabSeparated (без заголовка), колонки:

- ID региона (`UInt32`)
- Название региона (`String`) — не может содержать табуляций или переносов строк, даже экранированных.

Для хранения в оперативной памяти используется плоский массив. По этой причине ID не должны превышать миллиона.

Словари могут обновляться без перезапуска сервера. Однако набор доступных словарей не обновляется. Для обновления проверяются времена изменения файлов. Если файл изменился, словарь обновляется. Интервал проверки на изменения настраивается с помощью параметра `builtin_dictionaries_reload_interval`. Обновления словаря (кроме загрузки при первом использовании) не блокируют запросы. Во время обновления запросы используют старые версии словарей. Если во время обновления возникает ошибка, ошибка записывается в журналы сервера, и запросы продолжают использовать старую версию словарей.

Рекомендуется периодически обновлять словари с геобазой. Во время обновления генерируйте новые файлы и записывайте их в отдельном месте. Когда все будет готово, переименуйте их в файлы, используемые сервером.

Существуют также функции для работы с идентификаторами ОС и поисковыми системами, но их не следует использовать.
```
