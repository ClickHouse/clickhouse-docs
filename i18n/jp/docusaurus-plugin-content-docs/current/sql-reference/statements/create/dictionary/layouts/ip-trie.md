---
slug: /sql-reference/statements/create/dictionary/layouts/ip-trie
title: 'ip_trie Dictionary レイアウト'
sidebar_label: 'ip_trie'
sidebar_position: 10
description: 'IP アドレスプレフィックスを高速に検索できるよう、Dictionary をトライ木として保存します。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

`ip_trie` Dictionary は、ネットワークプレフィックスによる IP アドレスのルックアップ向けに設計されています。
CIDR 表記で IP 範囲を保存し、特定の IP がどのプレフィックス（例: サブネットや ASN の範囲）に属するかを高速に判定できるため、ジオロケーションやネットワーク分類といった IP ベースの検索に最適です。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/4dxMAqltygk?si=rrQrneBReK6lLfza" title="ip_trie Dictionary を使った IP ベース検索" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

**例**

ClickHouse に、IP プレフィックスとその対応付けを含むテーブルがあるとします。

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

このテーブル用に `ip_trie` Dictionary を定義します。`ip_trie` レイアウトでは複合キーが必要です:

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
            <!-- キーとなる属性 `prefix` は dictGetString で取得できます。 -->
            <!-- このオプションはメモリ使用量を増加させます。 -->
            <access_to_key_from_attributes>true</access_to_key_from_attributes>
        </ip_trie>
    </layout>
    ```
  </TabItem>
</Tabs>

<br />

キーには、許可された IP プレフィックスを含む `String` 型の属性を 1 つだけ持たせる必要があります。それ以外の型は現時点ではサポートされていません。

構文は次のとおりです:

```sql
dictGetT('dict_name', 'attr_name', ip)
```

この関数は、IPv4 では `UInt32` を、IPv6 では `FixedString(16)` を受け取ります。例:

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

他の型はまだサポートされていません。この関数は、この IP アドレスに対応するプレフィックスの属性を返します。プレフィックスが重複している場合は、最も特化したものが返されます。

データはすべて RAM に収まっている必要があります。
