---
'description': 'システムテーブルは、最近の非同期ジョブ（例えば、読み込み中のテーブル）の情報と状態を含んでいます。テーブルは、各ジョブの行を含んでいます。'
'keywords':
- 'system table'
- 'asynchronous_loader'
'slug': '/operations/system-tables/asynchronous_loader'
'title': 'system.asynchronous_loader'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.asynchronous_loader

<SystemTableCloud/>

最近の非同期ジョブ（例：テーブルのロード）の情報とステータスを含みます。このテーブルには、各ジョブに対して1行が含まれています。このテーブルから情報を視覚化するためのツール `utils/async_loader_graph` があります。

例：

```sql
SELECT *
FROM system.asynchronous_loader
LIMIT 1
FORMAT Vertical
```

カラム:

- `job` (`String`) - ジョブ名（ユニークでない場合あり）。
- `job_id` (`UInt64`) - ジョブのユニークID。
- `dependencies` (`Array(UInt64)`) - このジョブの前に完了すべきジョブのIDのリスト。
- `dependencies_left` (`UInt64`) - 現在残っている依存関係の数。
- `status` (`Enum`) - ジョブの現在のロードステータス：
    `PENDING`: ロードジョブはまだ開始されていない。
    `OK`: ロードジョブが実行され、成功した。
    `FAILED`: ロードジョブが実行され、失敗した。
    `CANCELED`: ロードジョブは削除または依存関係の失敗により実行されない。

保留中のジョブは、次のいずれかの状態にある場合があります：
- `is_executing` (`UInt8`) - ジョブは現在ワーカーによって実行中。
- `is_blocked` (`UInt8`) - ジョブはその依存関係が完了するのを待っています。
- `is_ready` (`UInt8`) - ジョブは実行の準備ができており、ワーカーを待っています。
- `elapsed` (`Float64`) - 実行開始から経過した秒数。ジョブが開始されていない場合はゼロ。ジョブが完了した場合は合計実行時間。

すべてのジョブは、関連付けられたプールを持ち、このプールで開始されます。各プールには一定の優先度と可変の最大ワーカー数があります。優先度が高い（低い `priority` 値）のジョブが最初に実行されます。少なくとも1つの高い優先度のジョブが準備完了または実行中である間、低い優先度のジョブは開始されません。ジョブの優先度は昇格させることができますが（降格はできません）、優先処理を行うことによってのみ可能です。例えば、テーブルのロードおよび起動のためのジョブは、このテーブルが必要な受信クエリがある場合、優先されます。ジョブの実行中に優先順位を上げることは可能ですが、ジョブはその `execution_pool` から新しく割り当てられた `pool` に移動されることはありません。ジョブは新しいジョブの作成に `pool` を使用して、優先度の逆転を回避します。すでに開始されたジョブは、高い優先度のジョブによってプリエンプトされず、開始後は常に完了まで実行されます。
- `pool_id` (`UInt64`) - 現在ジョブに割り当てられているプールのID。
- `pool` (`String`) - `pool_id` プールの名前。
- `priority` (`Int64`) - `pool_id` プールの優先度。
- `execution_pool_id` (`UInt64`) - ジョブが実行されるプールのID。実行開始前の最初に割り当てられたプールと等しい。
- `execution_pool` (`String`) - `execution_pool_id` プールの名前。
- `execution_priority` (`Int64`) - `execution_pool_id` プールの優先度。

- `ready_seqno` (`Nullable(UInt64)`) - 準備完了のジョブについてはnullでない。ワーカーは、そのプールの準備キューから実行される次のジョブを取り出します。複数の準備完了ジョブがある場合、最も低い値の `ready_seqno` を持つジョブが選ばれます。
- `waiters` (`UInt64`) - このジョブを待機しているスレッドの数。
- `exception` (`Nullable(String)`) - 失敗またはキャンセルされたジョブについてはnullでない。クエリ実行中に発生したエラーメッセージまたはこのジョブをキャンセルする原因となった依存関係の失敗の連鎖のジョブ名を保持します。

ジョブのライフタイム中の時間点:
- `schedule_time` (`DateTime64`) - ジョブが作成され、実行されるようにスケジュールされた時間（通常はすべての依存関係と共に）。
- `enqueue_time` (`Nullable(DateTime64)`) - ジョブが準備完了になり、そのプールの準備キューに追加された時間。ジョブがまだ準備完了でない場合はnull。
- `start_time` (`Nullable(DateTime64)`) - ワーカーが準備キューからジョブを取り出し、実行を開始した時間。ジョブがまだ開始されていない場合はnull。
- `finish_time` (`Nullable(DateTime64)`) - ジョブの実行が完了した時間。ジョブがまだ完了していない場合はnull。
