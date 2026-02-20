---
slug: /sql-reference/statements/create/dictionary/layouts/hashed-array
title: 'hashed_array Dictionary レイアウトタイプ'
sidebar_label: 'hashed_array'
sidebar_position: 4
description: '属性配列付きハッシュテーブルとして Dictionary をメモリ上に保存します。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


## hashed_array \{#hashed_array\}

Dictionary は完全にメモリ上に常駐します。各属性はそれぞれ配列として保持されます。キー属性はハッシュテーブルとして保持され、その値として属性配列内のインデックスが格納されます。Dictionary には任意の識別子を持つ任意個数の要素を含めることができます。実際には、キー数が数千万件に達することもあります。

Dictionary キーは [UInt64](../../../data-types/int-uint.md) 型です。

あらゆる種類のソースがサポートされます。更新時には、データ（ファイルまたはテーブルから）が全件読み込まれます。

構成例:

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(HASHED_ARRAY([SHARDS 1]))
```

</TabItem>
<TabItem value="xml" label="Configuration file">

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

このストレージタイプは、複合[キー](../keys-and-fields.md#dictionary-key-and-fields)で使用するためのものです。[hashed_array](#hashed_array)と類似しています。

設定例:

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(COMPLEX_KEY_HASHED_ARRAY([SHARDS 1]))
```

</TabItem>
<TabItem value="xml" label="構成ファイル">

```xml
<layout>
  <complex_key_hashed_array />
</layout>
```

</TabItem>
</Tabs>

<br/>