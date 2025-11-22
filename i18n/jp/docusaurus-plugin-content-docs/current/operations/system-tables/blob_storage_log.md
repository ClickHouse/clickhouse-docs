---
description: 'アップロードや削除など、さまざまな BLOB ストレージ操作に関する情報を記録したログエントリを格納するシステムテーブル。'
keywords: ['システムテーブル', 'blob_storage_log']
slug: /operations/system-tables/blob_storage_log
title: 'system.blob_storage_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';

<SystemTableCloud />

アップロードや削除など、さまざまな BLOB ストレージ操作に関する情報を含むログエントリを格納します。

列:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベントの日付。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — イベントの時刻。
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒精度でのイベントの時刻。
* `event_type` ([Enum8](../../sql-reference/data-types/enum.md)) — イベントの種類。取り得る値は次のとおりです:
  * `'Upload'`
  * `'Delete'`
  * `'MultiPartUploadCreate'`
  * `'MultiPartUploadWrite'`
  * `'MultiPartUploadComplete'`
  * `'MultiPartUploadAbort'`
* `query_id` ([String](../../sql-reference/data-types/string.md)) — イベントに関連付けられたクエリの識別子（存在する場合）。
* `thread_id` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 操作を実行しているスレッドの識別子。
* `thread_name` ([String](../../sql-reference/data-types/string.md)) — 操作を実行しているスレッドの名前。
* `disk_name` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — 関連付けられたディスクの名前。
* `bucket` ([String](../../sql-reference/data-types/string.md)) — バケット名。
* `remote_path` ([String](../../sql-reference/data-types/string.md)) — リモートリソースへのパス。
* `local_path` ([String](../../sql-reference/data-types/string.md)) — リモートリソースを参照する、ローカルシステム上のメタデータファイルへのパス。
* `data_size` ([UInt32](/sql-reference/data-types/int-uint#integer-ranges)) — アップロードイベントで扱われるデータサイズ。
* `error` ([String](../../sql-reference/data-types/string.md)) — イベントに関連付けられたエラーメッセージ（存在する場合）。

**例**

ある BLOB ストレージ操作でファイルがアップロードされ、そのイベントがログに記録されたとします。

```sql
SELECT * FROM system.blob_storage_log WHERE query_id = '7afe0450-504d-4e4b-9a80-cd9826047972' ORDER BY event_date, event_time_microseconds \G
```

```text
行 1:
──────
hostname:                clickhouse.eu-central1.internal
event_date:              2023-10-31
event_time:              2023-10-31 16:03:40
event_time_microseconds: 2023-10-31 16:03:40.481437
event_type:              Upload
query_id:                7afe0450-504d-4e4b-9a80-cd9826047972
thread_id:               2381740
disk_name:               disk_s3
bucket:                  bucket1
remote_path:             rrr/kxo/tbnqtrghgtnxkzgtcrlutwuslgawe
local_path:              store/654/6549e8b3-d753-4447-8047-d462df6e6dbe/tmp_insert_all_1_1_0/checksums.txt
data_size:               259
error:
```

この例では、アップロード操作は ID `7afe0450-504d-4e4b-9a80-cd9826047972` の `INSERT` クエリに関連付けられていました。ローカルメタデータファイル `store/654/6549e8b3-d753-4447-8047-d462df6e6dbe/tmp_insert_all_1_1_0/checksums.txt` は、ディスク `disk_s3` 上のバケット `bucket1` 内にあるリモートパス `rrr/kxo/tbnqtrghgtnxkzgtcrlutwuslgawe` を参照しており、そのサイズは 259 バイトです。

**関連項目**

* [データ保存用の外部ディスク](../../operations/storing-data.md)
