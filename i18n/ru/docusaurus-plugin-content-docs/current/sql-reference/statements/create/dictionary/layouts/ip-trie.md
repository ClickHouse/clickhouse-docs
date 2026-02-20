---
slug: /sql-reference/statements/create/dictionary/layouts/ip-trie
title: 'Тип размещения словаря ip_trie'
sidebar_label: 'ip_trie'
sidebar_position: 10
description: 'Храните словарь в виде префиксного дерева (trie) для быстрого поиска по префиксам IP-адресов.'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Словарь `ip_trie` предназначен для поиска IP-адресов по сетевому префиксу.
Он хранит IP-диапазоны в CIDR-нотации и позволяет быстро определить, к какому префиксу (например, подсети или диапазону ASN) относится заданный IP-адрес, что делает его идеальным для поисковых операций на основе IP, таких как геолокация или классификация сети.

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

Определим словарь `ip_trie` для этой таблицы. Схема `ip_trie` требует составного ключа:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
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
  </TabItem>

  <TabItem value="xml" label="Configuration file">
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
            <!-- Атрибут ключа `prefix` может быть получен с помощью dictGetString. -->
            <!-- Эта опция увеличивает расход памяти. -->
            <access_to_key_from_attributes>true</access_to_key_from_attributes>
        </ip_trie>
    </layout>
    ```
  </TabItem>
</Tabs>

<br />

Ключ может иметь только один атрибут типа `String`, в котором хранится допустимый IP-префикс. Другие типы пока не поддерживаются.

Синтаксис:

```sql
dictGetT('dict_name', 'attr_name', ip)
```

Функция принимает значение типа `UInt32` для IPv4 или `FixedString(16)` для IPv6. Например:

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

Другие типы в настоящее время не поддерживаются. Функция возвращает атрибут для префикса, который соответствует этому IP-адресу. Если есть перекрывающиеся префиксы, возвращается наиболее точный.

Данные должны полностью помещаться в оперативную память.
