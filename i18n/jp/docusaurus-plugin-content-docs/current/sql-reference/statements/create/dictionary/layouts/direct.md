---
slug: /sql-reference/statements/create/dictionary/layouts/direct
title: 'direct Dictionary レイアウト'
sidebar_label: 'direct'
sidebar_position: 9
description: 'キャッシュを使用せずにソースを直接クエリする Dictionary レイアウト。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


## direct \{#direct\}

このDictionaryはメモリには保存されず、リクエスト処理時にソースへ直接アクセスします。

Dictionaryのキーは [UInt64](../../../data-types/int-uint.md) 型です。

ローカルファイル以外のすべての種類の[ソース](../sources/#dictionary-sources)がサポートされています。

設定例:

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(DIRECT())
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<layout>
  <direct />
</layout>
```

</TabItem>
</Tabs>

<br/>

## complex_key_direct \{#complex_key_direct\}

このストレージタイプは、複合[キー](../keys-and-fields.md#dictionary-key-and-fields)で使用します。`direct` と同様です。