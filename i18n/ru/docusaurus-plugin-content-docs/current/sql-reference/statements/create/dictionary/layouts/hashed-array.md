---
slug: /sql-reference/statements/create/dictionary/layouts/hashed-array
title: 'типы размещения словаря hashed_array'
sidebar_label: 'hashed_array'
sidebar_position: 4
description: 'Хранение словаря в памяти с использованием хеш-таблицы и массивов атрибутов.'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


## hashed_array \{#hashed_array\}

Словарь полностью хранится в памяти. Каждый атрибут хранится в массиве. Атрибут-ключ хранится в виде хеш-таблицы, где значением является индекс в массиве атрибутов. Словарь может содержать любое количество элементов с любыми идентификаторами. На практике количество ключей может достигать десятков миллионов.

Ключ словаря имеет тип [UInt64](../../../data-types/int-uint.md).

Поддерживаются все типы источников. При обновлении данные (из файла или из таблицы) считываются целиком.

Пример конфигурации:

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(HASHED_ARRAY([SHARDS 1]))
```

</TabItem>
<TabItem value="xml" label="Файл конфигурации">

```xml
<layout>
  <hashed_array>
  </hashed_array>
</layout>
```

</TabItem>
</Tabs>

<br/>

## complex_key_hashed_array \{#complex_key_hashed_array\}

Этот тип хранилища предназначен для использования с составными [ключами](../keys-and-fields.md#dictionary-key-and-fields). Аналогичен [hashed_array](#hashed_array).

Пример конфигурации:

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(COMPLEX_KEY_HASHED_ARRAY([SHARDS 1]))
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<layout>
  <complex_key_hashed_array />
</layout>
```

</TabItem>
</Tabs>

<br/>