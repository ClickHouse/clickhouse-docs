---
slug: /sql-reference/statements/create/dictionary/layouts/ssd-cache
title: 'Типы размещения словаря ssd_cache'
sidebar_label: 'ssd_cache'
sidebar_position: 8
description: 'Хранение данных словаря на SSD с индексом в памяти: типы ssd_cache и complex_key_ssd_cache'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


## ssd_cache \{#ssd_cache\}

Аналогичен `cache`, но хранит данные на SSD, а индекс — в RAM. Все настройки словаря типа cache, связанные с очередью обновления, также могут применяться к словарям SSD cache.

Тип ключа словаря — [UInt64](/sql-reference/data-types/int-uint.md).

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(SSD_CACHE(BLOCK_SIZE 4096 FILE_SIZE 16777216 READ_BUFFER_SIZE 1048576
    PATH '/var/lib/clickhouse/user_files/test_dict'))
```

</TabItem>
<TabItem value="xml" label="Конфигурационный файл">

```xml
<layout>
    <ssd_cache>
        <!-- Размер минимального блока чтения в байтах. Рекомендуется устанавливать равным размеру страницы SSD. -->
        <block_size>4096</block_size>
        <!-- Максимальный размер файла кэша в байтах. -->
        <file_size>16777216</file_size>
        <!-- Размер буфера в оперативной памяти в байтах для чтения элементов с SSD. -->
        <read_buffer_size>131072</read_buffer_size>
        <!-- Размер буфера в оперативной памяти в байтах для агрегации элементов перед сбросом на SSD. -->
        <write_buffer_size>1048576</write_buffer_size>
        <!-- Путь, по которому будет храниться файл кэша. -->
        <path>/var/lib/clickhouse/user_files/test_dict</path>
    </ssd_cache>
</layout>
```

</TabItem>
</Tabs>

<br/>

## complex_key_ssd_cache \{#complex_key_ssd_cache\}

Этот тип хранилища предназначен для использования с составными [ключами](../attributes.md#composite-key). Аналогично типу `ssd_cache`.