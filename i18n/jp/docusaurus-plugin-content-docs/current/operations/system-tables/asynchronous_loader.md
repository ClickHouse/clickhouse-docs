---
description: '最近の非同期ジョブ（例：読み込み中のテーブル）の情報と状況を含むシステムテーブル。このテーブルは各ジョブに対して行を含んでいます。'
keywords: ['system table', 'asynchronous_loader']
slug: /operations/system-tables/asynchronous_loader
title: 'system.asynchronous_loader'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.asynchronous_loader

<SystemTableCloud/>

最近の非同期ジョブ（例：読み込み中のテーブル）の情報と状況を含んでいます。このテーブルは各ジョブに対して行を含んでいます。このテーブルから情報を視覚化するためのツールがあります `utils/async_loader_graph`。

例:

```sql
SELECT *
FROM system.asynchronous_loader
LIMIT 1
FORMAT Vertical
```

カラム:

- `job` (`String`) - ジョブ名（ユニークでない場合があります）。
- `job_id` (`UInt64`) - ジョブのユニークID。
- `dependencies` (`Array(UInt64)`) - このジョブの前に実行されるべきジョブのIDリスト。
- `dependencies_left` (`UInt64`) - 現在実行待ちの依存関係の数。
- `status` (`Enum`) - ジョブの現在のロード状況:
    `PENDING`:  ロードジョブはまだ開始されていません。
    `OK`: ロードジョブが実行され成功しました。
    `FAILED`: ロードジョブが実行され失敗しました。
    `CANCELED`: 削除または依存関係の失敗によりロードジョブは実行されません。

保留中のジョブは以下のいずれかの状態にあります:
- `is_executing` (`UInt8`) - ジョブが現在ワーカーによって実行中です。
- `is_blocked` (`UInt8`) - ジョブが依存関係が完了するのを待っています。
- `is_ready` (`UInt8`) - ジョブが実行可能でワーカーを待っています。
- `elapsed` (`Float64`) - 実行開始から経過した秒数。ジョブが開始されていない場合はゼロ。ジョブが完了した場合は総実行時間。

すべてのジョブには関連付けられたプールがあり、このプールで開始されます。各プールには一定の優先順位と変更可能な最大ワーカー数があります。優先順位が高い（`priority` 値が低い）ジョブは先に実行されます。少なくとも1つの高優先ジョブが準備ができているか実行中である間は、優先順位が低いジョブは開始されません。ジョブの優先順位は、優先することで上げることができます（下げることはできません）。例えば、テーブルの読み込みと起動のジョブは、このテーブルを必要とする受信クエリがある場合に優先されます。ジョブの実行中に優先順位を上げることも可能ですが、ジョブは`execution_pool` から新しく割り当てられた `pool` に移動されることはありません。ジョブは優先度の逆転を避けるために新しいジョブの作成に `pool` を使用します。すでに開始されたジョブは、高優先度のジョブによって先取りされることなく、開始後に完了するまで必ず実行されます。
- `pool_id` (`UInt64`) - 現在ジョブに割り当てられているプールのID。
- `pool` (`String`) - `pool_id` プールの名前。
- `priority` (`Int64`) - `pool_id` プールの優先順位。
- `execution_pool_id` (`UInt64`) - ジョブが実行されるプールのID。実行開始前に最初に割り当てられたプールに等しい。
- `execution_pool` (`String`) - `execution_pool_id` プールの名前。
- `execution_priority` (`Int64`) - `execution_pool_id` プールの優先順位。

- `ready_seqno` (`Nullable(UInt64)`) - 準備完了のジョブに対しては null ではありません。ワーカーはプールの準備キューから実行する次のジョブを取り出します。複数の準備完了のジョブがある場合、最も低い `ready_seqno` の値を持つジョブが選ばれます。
- `waiters` (`UInt64`) - このジョブを待機中のスレッドの数。
- `exception` (`Nullable(String)`) - 失敗したジョブとキャンセルされたジョブに対しては null ではありません。クエリ実行中に発生したエラーメッセージまたはこのジョブのキャンセルにつながるエラーを保持し、依存関係の失敗のジョブ名のチェーンを示します。

ジョブのライフサイクル中の時間の瞬間:
- `schedule_time` (`DateTime64`) - ジョブが作成され実行予定としてスケジュールされた時間（通常、すべての依存関係と共に）。
- `enqueue_time` (`Nullable(DateTime64)`) - ジョブが準備完了となり、プールの準備キューに追加された時間。ジョブがまだ準備されていない場合は null。
- `start_time` (`Nullable(DateTime64)`) - ワーカーが準備キューからジョブを取り出し実行を開始した時間。ジョブが開始されていない場合は null。
- `finish_time` (`Nullable(DateTime64)`) - ジョブの実行が完了した時間。ジョブがまだ完了していない場合は null。
