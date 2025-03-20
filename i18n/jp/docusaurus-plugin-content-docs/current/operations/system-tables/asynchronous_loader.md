---
description: "最近の非同期ジョブ（例：読み込み中のテーブル）の情報と状態を含むシステムテーブル。このテーブルには、各ジョブの行が含まれています。"
slug: /operations/system-tables/asynchronous_loader
title: "system.asynchronous_loader"
keywords: ["システムテーブル", "asynchronous_loader"]
---
import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

最近の非同期ジョブ（例：読み込み中のテーブル）の情報と状態を含みます。このテーブルには、各ジョブの行が含まれています。このテーブルの情報を可視化するためのツール `utils/async_loader_graph` があります。

例:

``` sql
SELECT *
FROM system.asynchronous_loader
LIMIT 1
FORMAT Vertical
```

カラム:

- `job` (`String`) - ジョブ名（必ずしもユニークであるとは限りません）。
- `job_id` (`UInt64`) - ジョブのユニークID。
- `dependencies` (`Array(UInt64)`) - このジョブの前に実行されるべきジョブのIDリスト。
- `dependencies_left` (`UInt64`) - 現在残っている依存関係の数。
- `status` (`Enum`) - ジョブの現在のロード状況：
    `PENDING`: ロードジョブがまだ開始されていません。
    `OK`: ロードジョブが実行され、成功しました。
    `FAILED`: ロードジョブが実行され、失敗しました。
    `CANCELED`: ロードジョブは、削除や依存関係の失敗により実行されない予定です。

保留中のジョブは次のいずれかの状態にある可能性があります：
- `is_executing` (`UInt8`) - ジョブが現在ワーカーによって実行されています。
- `is_blocked` (`UInt8`) - ジョブはその依存関係が完了するのを待っています。
- `is_ready` (`UInt8`) - ジョブは実行の準備ができており、ワーカーを待っています。
- `elapsed` (`Float64`) - 実行開始から経過した秒数。ジョブが開始されていない場合はゼロ。ジョブが完了した場合の合計実行時間。

すべてのジョブにはそれに関連付けられたプールがあり、此のプール内で開始されます。各プールには一定の優先度と変更可能な最大ワーカー数があります。優先度の高い（低い `priority` 値の）ジョブが最初に実行されます。高い優先度のジョブが実行中または準備中の場合、低い優先度のジョブは開始されません。ジョブの優先度は、優先順位を設定することによって引き上げることができます（下げることはできません）。たとえば、テーブルの読み込みや起動のためのジョブは、受信クエリがこのテーブルを必要とする場合に優先されます。実行中にジョブの優先順位を上げることが可能ですが、ジョブはその `execution_pool` から新しく割り当てられた `pool` に移動することはありません。ジョブは、優先度 inversion を避けるために新しいジョブを作成する際に `pool` を使用します。すでに開始されたジョブは、より高い優先度のジョブによって奪われることはなく、開始された後は常に完了するまで実行されます。
- `pool_id` (`UInt64`) - 現在ジョブに割り当てられているプールのID。
- `pool` (`String`) - `pool_id` プールの名前。
- `priority` (`Int64`) - `pool_id` プールの優先度。
- `execution_pool_id` (`UInt64`) - ジョブが実行されているプールのID。実行が開始される前に割り当てられたプールと等しい。
- `execution_pool` (`String`) - `execution_pool_id` プールの名前。
- `execution_priority` (`Int64`) - `execution_pool_id` プールの優先度。

- `ready_seqno` (`Nullable(UInt64)`) - 準備ができているジョブの場合は null でない。ワーカーは、そのプールの準備キューから次に実行されるジョブを引き出します。複数の準備済みジョブがある場合は、`ready_seqno` の値が最も低いジョブが選ばれます。
- `waiters` (`UInt64`) - このジョブを待機しているスレッドの数。
- `exception` (`Nullable(String)`) - 失敗したジョブおよびキャンセルされたジョブの場合は null でない。クエリ実行中に発生したエラーメッセージまたはこのジョブのキャンセルにつながったエラーを保持し、依存関係の失敗チェーンのジョブ名を含みます。

ジョブのライフタイム中の時間点：
- `schedule_time` (`DateTime64`) - ジョブが作成され、スケジュールされて実行される時間（通常、すべての依存関係と共に）。
- `enqueue_time` (`Nullable(DateTime64)`) - ジョブが準備完了となり、このプールの準備キューにエンキューされた時間。ジョブがまだ準備できていない場合は null。
- `start_time` (`Nullable(DateTime64)`) - ワーカーが準備キューからジョブをデキューし、実行を開始した時間。ジョブがまだ開始されていない場合は null。
- `finish_time` (`Nullable(DateTime64)`) - ジョブの実行が完了した時間。ジョブがまだ完了していない場合は null。
