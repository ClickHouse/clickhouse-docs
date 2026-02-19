---
slug: /sql-reference/statements/create/dictionary/layouts/hashed
title: 'типы размещения словаря hashed'
sidebar_label: 'hashed'
sidebar_position: 3
description: 'Хранение словаря в памяти с помощью хеш-таблиц: hashed, sparse_hashed, complex_key_hashed, complex_key_sparse_hashed'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


## hashed \{#hashed\}

Словарь полностью хранится в памяти в виде хеш-таблицы. Словарь может содержать произвольное количество элементов с любыми идентификаторами. На практике количество ключей может достигать десятков миллионов.

Ключ словаря имеет тип [UInt64](../../../data-types/int-uint.md).

Поддерживаются все типы источников. При обновлении данные (из файла или таблицы) считываются целиком.

Пример конфигурации:

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(HASHED())
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<layout>
  <hashed />
</layout>
```

</TabItem>
</Tabs>

<br/>

Пример конфигурации с настройками:

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<layout>
  <hashed>
    <!-- Если количество shards больше 1 (по умолчанию `1`), словарь будет загружать
         данные параллельно; это полезно, если у вас очень много элементов
         в одном словаре. -->
    <shards>10</shards>

    <!-- Размер бэклога для блоков в параллельной очереди.

         Поскольку узким местом при параллельной загрузке является rehash, и чтобы
         избежать задержек из-за того, что поток выполняет rehash, нужен некоторый
         бэклог.

         10000 — хороший баланс между потреблением памяти и скоростью.
         Даже для 10e10 элементов это позволяет обработать всю нагрузку без голодания. -->
    <shard_load_queue_backlog>10000</shard_load_queue_backlog>

    <!-- Максимальный коэффициент загрузки хеш-таблицы; при более высоких значениях
         память используется эффективнее (меньше нерационально расходуемой памяти),
         но производительность чтения может ухудшиться.

         Допустимые значения: [0.5, 0.99]
         Значение по умолчанию: 0.5 -->
    <max_load_factor>0.5</max_load_factor>
  </hashed>
</layout>
```

</TabItem>
</Tabs>

<br/>

## sparse_hashed \{#sparse_hashed\}

Аналогичен `hashed`, но использует меньше памяти ценой большего расхода CPU.

Ключ словаря имеет тип [UInt64](../../../data-types/int-uint.md).

Пример конфигурации:

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

</TabItem>
<TabItem value="xml" label="Файл конфигурации">

```xml
<layout>
  <sparse_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </sparse_hashed>
</layout>
```

</TabItem>
</Tabs>

<br/>

Для этого типа словаря также можно использовать параметр `shards`; для `sparse_hashed` это даже важнее, чем для `hashed`, поскольку `sparse_hashed` работает медленнее.

## complex_key_hashed \{#complex_key_hashed\}

Этот тип хранилища используется для составных [ключей](../keys-and-fields.md#dictionary-key-and-fields). По своей работе аналогичен `hashed`.

Пример конфигурации:

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(COMPLEX_KEY_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

</TabItem>
<TabItem value="xml" label="Файл конфигурации">

```xml
<layout>
  <complex_key_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </complex_key_hashed>
</layout>
```

</TabItem>
</Tabs>

<br/>

## complex_key_sparse_hashed \{#complex_key_sparse_hashed\}

Этот тип хранилища предназначен для использования с составными [ключами](../keys-and-fields.md#dictionary-key-and-fields). Аналогичен [sparse_hashed](#sparse_hashed).

Пример конфигурации:

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(COMPLEX_KEY_SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<layout>
  <complex_key_sparse_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </complex_key_sparse_hashed>
</layout>
```

</TabItem>
</Tabs>

<br/>