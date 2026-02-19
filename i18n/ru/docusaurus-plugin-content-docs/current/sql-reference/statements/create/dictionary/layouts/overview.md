---
description: 'Типы структур словарей для хранения в памяти'
sidebar_label: 'Обзор'
sidebar_position: 1
slug: /sql-reference/statements/create/dictionary/layouts
title: 'Структуры словарей'
doc_type: 'reference'
---

import CloudDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/sql-reference/statements/create/dictionary/_snippet_dictionary_in_cloud.md';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


## Типы размещения словарей \{#storing-dictionaries-in-memory\}

Существует несколько способов хранения словарей в памяти, каждый из которых имеет свои компромиссы между использованием CPU и RAM.

| Layout | Description |
|---|---|
| [flat](./flat.md) | Хранит данные в плоских массивах, индексируемых по ключу. Самый быстрый вариант размещения, но ключи должны быть типа `UInt64` и ограничены `max_array_size`. |
| [hashed](./hashed.md) | Хранит данные в хеш-таблице. Нет ограничения на размер ключа, поддерживает любое количество элементов. |
| [sparse_hashed](./hashed.md#sparse_hashed) | Как `hashed`, но расходует больше CPU в обмен на меньшее потребление памяти. |
| [complex_key_hashed](./hashed.md#complex_key_hashed) | Как `hashed`, но для составных ключей. |
| [complex_key_sparse_hashed](./hashed.md#complex_key_sparse_hashed) | Как `sparse_hashed`, но для составных ключей. |
| [hashed_array](./hashed-array.md) | Атрибуты хранятся в массивах с хеш-таблицей, сопоставляющей ключи с индексами массивов. Эффективно по памяти при большом количестве атрибутов. |
| [complex_key_hashed_array](./hashed-array.md#complex_key_hashed_array) | Как `hashed_array`, но для составных ключей. |
| [range_hashed](./range-hashed.md) | Хеш-таблица с упорядоченными диапазонами. Поддерживает поиск по ключу и диапазону даты/времени. |
| [complex_key_range_hashed](./range-hashed.md#complex_key_range_hashed) | Как `range_hashed`, но для составных ключей. |
| [cache](./cache.md) | Кэш фиксированного размера в памяти. Хранятся только часто запрашиваемые ключи. |
| [complex_key_cache](./complex-key-cache.md) | Как `cache`, но для составных ключей. |
| [ssd_cache](./ssd-cache.md) | Как `cache`, но хранит данные на SSD с индексом в памяти. |
| [complex_key_ssd_cache](./ssd-cache.md#complex_key_ssd_cache) | Как `ssd_cache`, но для составных ключей. |
| [direct](./direct.md) | Нет хранения в памяти — источник запрашивается напрямую для каждого обращения. |
| [complex_key_direct](./direct.md#complex_key_direct) | Как `direct`, но для составных ключей. |
| [ip_trie](./ip-trie.md) | Префиксное дерево (trie) для быстрого поиска IP-префиксов (на основе CIDR). |

:::tip Рекомендуемые варианты размещения
[flat](./flat.md), [hashed](./hashed.md) и [complex_key_hashed](./hashed.md#complex_key_hashed) обеспечивают наилучшую производительность запросов.
Варианты размещения с кэшированием не рекомендуются из-за потенциально низкой производительности и сложности настройки параметров — подробности см. в разделе [cache](./cache.md).
:::

## Указание макета словаря \{#specify-dictionary-layout\}

<CloudDetails />

Вы можете настроить макет словаря с помощью секции `LAYOUT` (для DDL) или параметра `layout` в определениях в конфигурационном файле.

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
CREATE DICTIONARY (...)
...
LAYOUT(LAYOUT_TYPE(param value)) -- параметры макета
...
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<clickhouse>
    <dictionary>
        ...
        <layout>
            <layout_type>
                <!-- параметры макета -->
            </layout_type>
        </layout>
        ...
    </dictionary>
</clickhouse>
```

</TabItem>
</Tabs>

<br/>

См. также [CREATE DICTIONARY](../index.md) для полного синтаксиса DDL.

Словари, в имени макета которых нет слова `complex-key*`, имеют ключ типа [UInt64](../../../data-types/int-uint.md), а словари с `complex-key*` имеют составной ключ (сложный, с произвольными типами).

**Пример числового ключа** (столбец `key_column` имеет тип [UInt64](../../../data-types/int-uint.md)):

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
CREATE DICTIONARY dict_name (
    key_column UInt64,
    ...
)
PRIMARY KEY key_column
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<structure>
    <id>
        <name>key_column</name>
    </id>
    ...
</structure>
```

</TabItem>
</Tabs>

<br/>

**Пример составного ключа** (ключ состоит из одного элемента типа [String](../../../data-types/string.md)):

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
CREATE DICTIONARY dict_name (
    country_code String,
    ...
)
PRIMARY KEY country_code
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<structure>
    <key>
        <attribute>
            <name>country_code</name>
            <type>String</type>
        </attribute>
    </key>
    ...
</structure>
```

</TabItem>
</Tabs>

## Повышение производительности словарей \{#improve-performance\}

Существует несколько способов повысить производительность словарей:

- Вызывать функцию работы со словарём после `GROUP BY`.
- Пометить атрибуты для извлечения как инъективные.
  Атрибут называется инъективным, если разным ключам соответствуют различные значения атрибута.
  Поэтому, когда в `GROUP BY` используется функция, которая по ключу извлекает значение атрибута, эта функция автоматически выносится из `GROUP BY`.

ClickHouse генерирует исключение при ошибках, связанных со словарями.
Примеры таких ошибок:

- Не удалось загрузить словарь, к которому выполняется обращение.
- Ошибка при запросе к словарю типа `cached`.

Вы можете просмотреть список словарей и их статусы в таблице [system.dictionaries](../../../../operations/system-tables/dictionaries.md).