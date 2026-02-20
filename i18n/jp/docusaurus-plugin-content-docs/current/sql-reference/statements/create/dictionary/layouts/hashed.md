---
slug: /sql-reference/statements/create/dictionary/layouts/hashed
title: 'hashed Dictionary レイアウトの種類'
sidebar_label: 'hashed'
sidebar_position: 3
description: 'Dictionary をハッシュテーブルを用いてメモリ上に保存します: hashed, sparse_hashed, complex_key_hashed, complex_key_sparse_hashed'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


## hashed \{#hashed\}

Dictionary はハッシュテーブルの形式で完全にメモリ上に保存されます。Dictionary には、任意の識別子を持つ任意個数の要素を含めることができます。実際には、キーの数は数千万件に達することがあります。

Dictionary キーの型は [UInt64](../../../data-types/int-uint.md) です。

すべての種類のソースがサポートされています。更新時には、データ（ファイルまたはテーブルから）は全体が読み込まれます。

設定例:

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

設定付きの例:

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
    <!-- 分片数が 1 を超える場合（デフォルトは `1`）、
         Dictionary はデータを並列に読み込みます。
         1 つの Dictionary に非常に多くの要素がある場合に有用です。 -->
    <shards>10</shards>

    <!-- 並列キュー内でのブロックのバックログのサイズ。

         並列読み込みにおけるボトルネックは再ハッシュ処理であり、
         再ハッシュを実行しているスレッドが原因で処理が停滞することを避けるために、
         ある程度のバックログが必要です。

         10000 はメモリ使用量と速度の良いバランスです。
         10e10 要素であっても、スレッドの飢餓状態になることなく
         すべての負荷を処理できます。 -->
    <shard_load_queue_backlog>10000</shard_load_queue_backlog>

    <!-- ハッシュテーブルの最大負荷率。値が大きいほどメモリは
         より効率的に利用されます（無駄なメモリが少なくなります）が、
         読み取り性能／パフォーマンスが低下する可能性があります。

         有効な値: [0.5, 0.99]
         デフォルト: 0.5 -->
    <max_load_factor>0.5</max_load_factor>
  </hashed>
</layout>
```

</TabItem>
</Tabs>

<br/>

## sparse_hashed \{#sparse_hashed\}

`hashed` と同様ですが、メモリ使用量を削減する代わりに CPU 使用量が増加します。

Dictionary のキーは [UInt64](../../../data-types/int-uint.md) 型です。

設定例:

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

</TabItem>
<TabItem value="xml" label="Configuration file">

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

この種類の Dictionary でも `shards` を使用できます。また、`sparse_hashed` は `hashed` よりも低速であるため、`hashed` の場合よりも `sparse_hashed` において `shards` の重要性が高くなります。

## complex_key_hashed \{#complex_key_hashed\}

このストレージ形式は、複合[キー](../keys-and-fields.md#dictionary-key-and-fields)を持つ Dictionary 向けです。`hashed` と同様です。

設定例：

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(COMPLEX_KEY_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

</TabItem>
<TabItem value="xml" label="構成ファイル">

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

このストレージは、複合[キー](../keys-and-fields.md#dictionary-key-and-fields)向けに使用します。[sparse_hashed](#sparse_hashed)と類似しています。

構成例:

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(COMPLEX_KEY_SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

</TabItem>
<TabItem value="xml" label="構成ファイル">

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