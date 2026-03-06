---
slug: /sql-reference/statements/create/dictionary/layouts/cache
title: 'cache Dictionary レイアウト'
sidebar_label: 'cache'
sidebar_position: 6
description: '固定サイズのインメモリキャッシュに Dictionary を格納します。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

`cached` Dictionary レイアウトタイプは、固定数のセルを持つキャッシュ内に Dictionary を保持します。
これらのセルには、頻繁に使用される要素が格納されます。

Dictionary のキーは [UInt64](/sql-reference/data-types/int-uint.md) 型です。

Dictionary を検索する際、まずキャッシュが検索されます。各データブロックについて、キャッシュに存在しない、または古くなっているすべてのキーは、`SELECT attrs... FROM db.table WHERE id IN (k1, k2, ...)` を使用してソースから取得されます。取得したデータはキャッシュに書き込まれます。

キーが Dictionary に存在しない場合、キャッシュ更新タスクが作成され、更新キューに追加されます。更新キューのプロパティは、`max_update_queue_size`、`update_queue_push_timeout_milliseconds`、`query_wait_timeout_milliseconds`、`max_threads_for_updates` の各設定で制御できます。

cache Dictionary では、キャッシュ内データの有効期限 [lifetime](../lifetime.md) を設定できます。データがセルに読み込まれてから `lifetime` を超える時間が経過した場合、そのセルの値は使用されず、キーは期限切れになります。キーは次に使用が必要になった時に再度リクエストされます。この動作は、設定項目 `allow_read_expired_keys` によって構成できます。

これは、Dictionary を保存するすべての方法の中で最も効率が低いものです。キャッシュの速度は、設定の適切さと使用シナリオに大きく依存します。キャッシュ型 Dictionary は、ヒット率が十分に高い場合（推奨 99% 以上）にのみ良好に動作します。平均ヒット率は [system.dictionaries](/operations/system-tables/dictionaries.md) テーブルで確認できます。

`allow_read_expired_keys` 設定が 1（デフォルトは 0）に設定されている場合、Dictionary は非同期更新をサポートできます。クライアントがキーを要求し、それらがすべてキャッシュ内にあるものの、一部が期限切れの場合、Dictionary は期限切れキーをクライアントに返しつつ、ソースからの再取得を非同期で行います。

キャッシュ性能を向上させるには、`LIMIT` を指定したサブクエリを使用し、Dictionary を利用する関数はその外側から呼び出してください。

すべての種類のソースがサポートされています。

設定例:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    LAYOUT(CACHE(SIZE_IN_CELLS 1000000000))
    ```
  </TabItem>

  <TabItem value="xml" label="設定ファイル">
    ```xml
    <layout>
        <cache>
            <!-- キャッシュのサイズ（セル数）。2 の累乗に切り上げられます。 -->
            <size_in_cells>1000000000</size_in_cells>
            <!-- 期限切れキーの読み取りを許可します。 -->
            <allow_read_expired_keys>0</allow_read_expired_keys>
            <!-- 更新キューの最大サイズ。 -->
            <max_update_queue_size>100000</max_update_queue_size>
            <!-- 更新タスクをキューに投入する際の最大タイムアウト（ミリ秒）。 -->
            <update_queue_push_timeout_milliseconds>10</update_queue_push_timeout_milliseconds>
            <!-- 更新タスクの完了を待つ最大タイムアウト（ミリ秒）。 -->
            <query_wait_timeout_milliseconds>60000</query_wait_timeout_milliseconds>
            <!-- cache Dictionary 更新用の最大スレッド数。 -->
            <max_threads_for_updates>4</max_threads_for_updates>
        </cache>
    </layout>
    ```
  </TabItem>
</Tabs>

<br />

十分に大きなキャッシュサイズを設定します。セル数の選択には実験が必要です。

1. ある値を設定します。
2. キャッシュが完全に埋まるまでクエリを実行します。
3. `system.dictionaries` テーブルを使用してメモリ消費量を評価します。
4. 必要なメモリ消費量に達するまで、セル数を増減します。

:::note
このレイアウトのソースとして ClickHouse を使用することは推奨されません。Dictionary のルックアップはランダムなポイントリードを必要としますが、これは ClickHouse が最適化されているアクセスパターンではありません。
:::
