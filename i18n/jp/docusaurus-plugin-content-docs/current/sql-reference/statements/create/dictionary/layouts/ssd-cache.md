---
slug: /sql-reference/statements/create/dictionary/layouts/ssd-cache
title: 'ssd_cache Dictionary レイアウトタイプ'
sidebar_label: 'ssd_cache'
sidebar_position: 8
description: 'Dictionary データを SSD に保存し、インメモリ索引を使用する: ssd_cache および complex_key_ssd_cache タイプ'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


## ssd_cache \{#ssd_cache\}

`cache` と同様ですが、データは SSD に、索引は RAM に保存します。更新キューに関連する cache Dictionary のすべての設定は、SSD cache Dictionary にも適用できます。

Dictionary キーの型は [UInt64](../../../data-types/int-uint.md) です。

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(SSD_CACHE(BLOCK_SIZE 4096 FILE_SIZE 16777216 READ_BUFFER_SIZE 1048576
    PATH '/var/lib/clickhouse/user_files/test_dict'))
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<layout>
    <ssd_cache>
        <!-- バイト単位の基本読み取りブロックサイズ。SSD のページサイズと同じにすることを推奨します。 -->
        <block_size>4096</block_size>
        <!-- キャッシュファイルの最大サイズ（バイト単位）。 -->
        <file_size>16777216</file_size>
        <!-- SSD から要素を読み出すための RAM バッファのサイズ（バイト単位）。 -->
        <read_buffer_size>131072</read_buffer_size>
        <!-- SSD にフラッシュする前に要素を集約するための RAM バッファのサイズ（バイト単位）。 -->
        <write_buffer_size>1048576</write_buffer_size>
        <!-- キャッシュファイルを保存するパス。 -->
        <path>/var/lib/clickhouse/user_files/test_dict</path>
    </ssd_cache>
</layout>
```

</TabItem>
</Tabs>

<br/>

## complex_key_ssd_cache \{#complex_key_ssd_cache\}

このストレージタイプは、複合[キー](../keys-and-fields.md#dictionary-key-and-fields)を持つ Dictionary 向けに使用します。`ssd_cache` と同様です。