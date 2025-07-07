---
'description': 'System table containing information about and status of recent asynchronous
  jobs (e.g. for tables which are loading). The table contains a row for every job.'
'keywords':
- 'system table'
- 'asynchronous_loader'
'slug': '/operations/system-tables/asynchronous_loader'
'title': 'system.asynchronous_loader'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.asynchronous_loader

<SystemTableCloud/>

最近の非同期ジョブ（例えば、テーブルのロード）の情報とステータスを含みます。このテーブルには、すべてのジョブの行が含まれています。このテーブルから情報を視覚化するためのツールは `utils/async_loader_graph` です。

例:

```sql
SELECT *
FROM system.asynchronous_loader
LIMIT 1
FORMAT Vertical
```

カラム:

- `job` (`String`) - ジョブ名（必ずしもユニークではない）。
- `job_id` (`UInt64`) - ジョブのユニークID。
- `dependencies` (`Array(UInt64)`) - このジョブの前に実行される必要があるジョブのIDのリスト。
- `dependencies_left` (`UInt64`) - 実行が残っている依存関係の現在の数。
- `status` (`Enum`) - ジョブの現在のロードステータス：
    `PENDING`: ロードジョブはまだ開始されていません。
    `OK`: ロードジョブが実行され、成功しました。
    `FAILED`: ロードジョブが実行され、失敗しました。
    `CANCELED`: 削除または依存関係の失敗により、ロードジョブは実行されません。

保留中のジョブは、次のいずれかの状態にある可能性があります：
- `is_executing` (`UInt8`) - ジョブが現在ワーカーによって実行されています。
- `is_blocked` (`UInt8`) - ジョブはその依存関係が完了するのを待っています。
- `is_ready` (`UInt8`) - ジョブは実行する準備ができており、ワーカーを待っています。
- `elapsed` (`Float64`) - 実行開始から経過した秒数。ジョブが開始されていない場合はゼロ。ジョブが終了した場合の総実行時間。

すべてのジョブには関連付けられたプールがあり、このプールで開始されます。各プールには一定の優先度と可変の最大ワーカー数があります。優先度が高い（低い `priority` 値）ジョブが最初に実行されます。少なくとも1つの優先度の高いジョブが準備または実行中の場合、より低い優先度のジョブは開始されません。ジョブの優先度は、優先度を上げることで高めることができますが、下げることはできません。たとえば、テーブルのロードやスタートアップのためのジョブは、そのテーブルが必要とするクエリが受信された場合に優先されます。ジョブの実行中に優先度を上げることが可能ですが、ジョブはその `execution_pool` から新しく割り当てられた `pool` に移動されることはありません。ジョブは、新しいジョブを作成するために `pool` を使用して優先度の反転を回避します。すでに開始されたジョブは、より高い優先度のジョブによって中断されることはなく、開始後は常に完了するまで実行されます。
- `pool_id` (`UInt64`) - 現在ジョブに割り当てられているプールのID。
- `pool` (`String`) - `pool_id` プールの名前。
- `priority` (`Int64`) - `pool_id` プールの優先度。
- `execution_pool_id` (`UInt64`) - ジョブが実行されているプールのID。実行が開始される前に最初に割り当てられたプールに等しい。
- `execution_pool` (`String`) - `execution_pool_id` プールの名前。
- `execution_priority` (`Int64`) - `execution_pool_id` プールの優先度。

- `ready_seqno` (`Nullable(UInt64)`) - 準備完了のジョブの場合はnullではありません。ワーカーは、そのプールの準備キューから実行する次のジョブを取り出します。複数の準備完了のジョブがある場合、`ready_seqno` の値が最も低いジョブが選ばれます。
- `waiters` (`UInt64`) - このジョブを待っているスレッドの数。
- `exception` (`Nullable(String)`) - 失敗またはキャンセルされたジョブの場合はnullではありません。クエリ実行中に発生したエラーメッセージまたは、このジョブをキャンセルする原因となったエラーが含まれています。また、ジョブ名の依存関係失敗チェーンも含まれます。

ジョブの生涯における時間の瞬間：
- `schedule_time` (`DateTime64`) - ジョブが作成され、実行するためにスケジュールされた時間（通常はそのすべての依存関係とともに）。
- `enqueue_time` (`Nullable(DateTime64)`) - ジョブが準備完了となり、そのプールの準備キューにエンキューされた時間。ジョブがまだ準備できていない場合はnull。
- `start_time` (`Nullable(DateTime64)`) - ワーカーがジョブを準備キューから取り出し、その実行を開始した時間。ジョブがまだ開始されていない場合はnull。
- `finish_time` (`Nullable(DateTime64)`) - ジョブの実行が終了した時間。ジョブがまだ終了していない場合はnull。
