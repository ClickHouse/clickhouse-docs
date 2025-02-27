---
description: "最近の非同期ジョブに関する情報とステータスを含むシステムテーブル（例：読み込み中のテーブル用）。テーブルは、すべてのジョブに対して行が含まれています。"
slug: /operations/system-tables/asynchronous_loader
title: "asynchronous_loader"
keywords: ["システムテーブル", "asynchronous_loader"]
---
import SystemTableCloud from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

最近の非同期ジョブに関する情報とステータスを含みます（例：テーブルの読み込み用）。テーブルは、すべてのジョブに対して行が含まれています。このテーブルからの情報を視覚化するツール `utils/async_loader_graph` があります。

例：

``` sql
SELECT *
FROM system.asynchronous_loader
LIMIT 1
FORMAT Vertical
```

カラム：

- `job` (`String`) - ジョブ名（ユニークでない場合があります）。
- `job_id` (`UInt64`) - ジョブのユニークID。
- `dependencies` (`Array(UInt64)`) - このジョブの前に完了すべきジョブのIDのリスト。
- `dependencies_left` (`UInt64`) - 今後完了する必要がある依存関係の現在の数。
- `status` (`Enum`) - ジョブの現在の読み込みステータス：
    `PENDING`: 読み込みジョブはまだ開始されていません。
    `OK`: 読み込みジョブは実行され、成功しました。
    `FAILED`: 読み込みジョブは実行され、失敗しました。
    `CANCELED`: 読み込みジョブは削除または依存関係の失敗により実行されません。

保留中のジョブは以下のいずれかの状態にある場合があります：
- `is_executing` (`UInt8`) - ジョブは現在ワーカーによって実行中です。
- `is_blocked` (`UInt8`) - ジョブは依存関係の完了を待っています。
- `is_ready` (`UInt8`) - ジョブは実行準備が整っており、ワーカーを待っています。
- `elapsed` (`Float64`) - 実行開始から経過した秒数。ジョブが開始されていなければゼロ。ジョブが終了すれば総実行時間。

すべてのジョブには関連するプールがあり、このプール内で開始されます。各プールには一定の優先度と可変の最大ワーカー数があります。優先度が高い（低い `priority` 値）のジョブが先に実行されます。少なくとも1つの高優先度のジョブが準備完了または実行中である間、低優先度のジョブは開始されません。ジョブの優先度は、高めることはできますが、下げることはできません。例えば、テーブルの読み込みや起動のジョブは、受信クエリがこのテーブルを要求した場合に優先されます。ジョブの実行中に優先度を高めることが可能ですが、ジョブはその `execution_pool` から新しく割り当てられた `pool` に移動されません。ジョブは新しいジョブを作成するために `pool` を使用し、優先度の反転を回避します。開始されたジョブは高優先度のジョブによって中断されることはなく、開始後は常に完了まで実行されます。
- `pool_id` (`UInt64`) - 現在ジョブに割り当てられているプールのID。
- `pool` (`String`) - `pool_id` プールの名前。
- `priority` (`Int64`) - `pool_id` プールの優先度。
- `execution_pool_id` (`UInt64`) - ジョブが実行されるプールのID。実行開始前に最初に割り当てられたプールに等しい。
- `execution_pool` (`String`) - `execution_pool_id` プールの名前。
- `execution_priority` (`Int64`) - `execution_pool_id` プールの優先度。

- `ready_seqno` (`Nullable(UInt64)`) - 準備が整ったジョブにはnullではありません。ワーカーは、自身のプールの準備キューから次に実行されるジョブをプルします。複数の準備が整ったジョブがある場合は、最も低い値の `ready_seqno` を持つジョブが選択されます。
- `waiters` (`UInt64`) - このジョブを待っているスレッドの数。
- `exception` (`Nullable(String)`) - 失敗またはキャンセルされたジョブにはnullではありません。クエリ実行中に発生したエラーメッセージまたは依存関係の失敗に伴うこのジョブのキャンセルを引き起こすエラーを保持します。

ジョブのライフタイム中の時間の瞬間：
- `schedule_time` (`DateTime64`) - ジョブが作成され、実行されるようにスケジュールされた時間（通常、すべての依存関係と共に）。
- `enqueue_time` (`Nullable(DateTime64)`) - ジョブが準備完了になり、自身のプールの準備キューにエンキューされた時間。ジョブがまだ準備が整っていない場合はnull。
- `start_time` (`Nullable(DateTime64)`) - ワーカーが準備キューからジョブをデキューして実行を開始した時間。ジョブがまだ開始されていない場合はnull。
- `finish_time` (`Nullable(DateTime64)`) - ジョブの実行が完了した時間。ジョブがまだ終了していない場合はnull。
