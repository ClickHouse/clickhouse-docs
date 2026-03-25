---
description: 'S3 や Azure Blob Storage などのリモートディスクに保存されたデータファイルに関する情報を含むシステムテーブル。'
keywords: ['システムテーブル', 'remote_data_paths']
slug: /operations/system-tables/remote_data_paths
title: 'system.remote_data_paths'
doc_type: 'reference'
---

ローカルのメタデータパスとリモートのブロブパスの対応関係を含め、リモートディスク (例: S3、Azure Blob Storage) に保存されたデータファイルに関する情報を格納します。

各行は、データファイルに関連付けられた 1 つのリモートブロブオブジェクトを表します。

カラム:

* `disk_name` ([String](../../sql-reference/data-types/string.md)) — ストレージ設定で定義されたリモートディスクの名前。
* `path` ([String](../../sql-reference/data-types/string.md)) — ストレージ設定で設定されたリモートディスクのルートパス。
* `cache_base_path` ([String](../../sql-reference/data-types/string.md)) — リモートディスクに関連付けられたキャッシュファイルのベースディレクトリ。
* `local_path` ([String](../../sql-reference/data-types/string.md)) — ClickHouse データディレクトリからの相対パスで表したローカルメタデータファイルのパス。リモートブロブに対応するファイルを指します。
* `remote_path` ([String](../../sql-reference/data-types/string.md)) — ローカルメタデータファイルが対応する、リモートオブジェクトストレージ内のブロブパス。
* `size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ファイルの圧縮サイズ (バイト) 。
* `common_prefix_for_blobs` ([String](../../sql-reference/data-types/string.md)) — リモートオブジェクトストレージ内のブロブに共通するプレフィックス。複数のブロブが同じパスプレフィックスを共有する場合に適用されます。
* `cache_paths` ([Array(String)](../../sql-reference/data-types/array.md)) — リモートブロブに対応するローカルキャッシュファイルのパス。

**設定**

* [`traverse_shadow_remote_data_paths`](../../operations/settings/settings.md#traverse_shadow_remote_data_paths) — 有効にすると、このテーブルにはフリーズされたパーティション (`ALTER TABLE ... FREEZE` で使用される `shadow/` ディレクトリ) のデータも含まれます。デフォルトでは無効です。

**例**

```sql
SELECT * FROM system.remote_data_paths LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
disk_name:              s3
path:                   /var/lib/clickhouse/disks/s3/
cache_base_path:        /var/lib/clickhouse/disks/s3_cache/
local_path:             store/123/1234abcd-1234-1234-1234-1234abcd1234/all_0_0_0/data.bin
remote_path:            abc123/all_0_0_0/data.bin
size:                   1048576
common_prefix_for_blobs:
cache_paths:            ['/var/lib/clickhouse/disks/s3_cache/a1/b2/c3d4e5f6']
```

**関連項目**

* [データ保存に外部ストレージを使用する](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-s3)
* [外部ストレージの設定](/operations/storing-data.md/#configuring-external-storage)
* [system.disks](../../operations/system-tables/disks.md)
