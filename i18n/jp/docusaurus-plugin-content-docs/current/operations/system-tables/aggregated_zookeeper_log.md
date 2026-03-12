---
description: 'セッション、パス、操作タイプ、コンポーネント、サブリクエストフラグごとに集計された
  ZooKeeper 操作の統計情報を含むシステムテーブル。'
keywords: ['システムテーブル', 'aggregated_zookeeper_log']
slug: /operations/system-tables/aggregated_zookeeper_log
title: 'system.aggregated_zookeeper_log'
doc_type: 'reference'
---

# system.aggregated_zookeeper_log \{#systemaggregated_zookeeper_log\}

このテーブルには、`(session_id, parent_path, operation, component, is_subrequest)` ごとにグループ化され、定期的にディスクにフラッシュされる ZooKeeper 操作の集計統計情報 (例: 操作数、平均レイテンシ、エラー) が格納されます。

個々のリクエストおよびレスポンスをすべて記録する [system.zookeeper&#95;log](zookeeper_log.md) とは異なり、このテーブルでは操作をグループ単位で集計するため、はるかに軽量で、本番ワークロードにより適しています。

`Multi` または `MultiRead` バッチの一部である操作は、`is_subrequest` カラムによって個別に追跡されます。サブリクエストのレイテンシは 0 です。これは、総レイテンシがそれを含む `Multi`/`MultiRead` 操作に割り当てられるためです。

カラム:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — サーバーのホスト名。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — グループがフラッシュされた日付。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — グループがフラッシュされた時刻。
* `session_id` ([Int64](../../sql-reference/data-types/int-uint.md)) — セッション ID。
* `parent_path` ([String](../../sql-reference/data-types/string.md)) — パスのプレフィックス。
* `operation` ([Enum](../../sql-reference/data-types/enum.md)) — ZooKeeper 操作の種類。
* `is_subrequest` ([UInt8](../../sql-reference/data-types/int-uint.md)) — この操作が `Multi` または `MultiRead` 操作内のサブリクエストであったかどうか。
* `count` ([UInt32](../../sql-reference/data-types/int-uint.md)) — グループ内の操作数。
* `errors` ([Map(Enum, UInt32)](../../sql-reference/data-types/map.md)) — グループ内のエラー。エラーコードから件数へのマッピングです。
* `average_latency` ([Float64](../../sql-reference/data-types/float.md)) — グループ内のすべての操作における平均レイテンシ (マイクロ秒単位) 。サブリクエストのレイテンシは 0 です。これは、レイテンシがそれを含む `Multi` または `MultiRead` 操作に割り当てられるためです。
* `component` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — イベントの原因となったコンポーネント。

**関連情報**

* [system.zookeeper&#95;log](zookeeper_log.md) — リクエスト単位の詳細な ZooKeeper ログ。
* [ZooKeeper](../../operations/tips.md#zookeeper)