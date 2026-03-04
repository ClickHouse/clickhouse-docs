---
slug: /sql-reference/statements/create/dictionary/layouts/flat
title: 'flat Dictionary レイアウト'
sidebar_label: 'flat'
sidebar_position: 2
description: 'Dictionary をメモリ上にフラットな配列として保存します。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

`flat` レイアウトでは、Dictionary はフラットな配列として完全にメモリ内に保持されます。
使用されるメモリ量は、最大のキー（が占有する領域）のサイズに比例します。

:::tip
このレイアウトタイプは、Dictionary を保存するために利用可能なすべての手法の中で、最も高いパフォーマンスを提供します。
:::

Dictionary のキーは [UInt64](/sql-reference/data-types/int-uint.md) 型であり、値は `max_array_size`（デフォルト — 500,000）に制限されます。
Dictionary の作成時に、これより大きなキーが見つかった場合、ClickHouse は例外をスローし、Dictionary を作成しません。
Dictionary のフラット配列の初期サイズは、`initial_array_size` 設定（デフォルト — 1024）によって制御されます。

すべての種類のソースをサポートします。
Dictionary を更新するとき、データ（ファイルまたはテーブルから）は全体が読み込まれます。

設定例:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    LAYOUT(FLAT(INITIAL_ARRAY_SIZE 50000 MAX_ARRAY_SIZE 5000000))
    ```
  </TabItem>

  <TabItem value="xml" label="Configuration file">
    ```xml
    <layout>
      <flat>
        <initial_array_size>50000</initial_array_size>
        <max_array_size>5000000</max_array_size>
      </flat>
    </layout>
    ```
  </TabItem>
</Tabs>

<br />
