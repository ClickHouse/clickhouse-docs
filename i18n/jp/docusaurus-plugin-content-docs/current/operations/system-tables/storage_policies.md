---
description: 'サーバー構成で定義されているストレージポリシーおよびボリュームに関する情報を格納する system テーブル。'
keywords: ['system table', 'storage_policies']
slug: /operations/system-tables/storage_policies
title: 'system.storage_policies'
doc_type: 'reference'
---

# system.storage&#95;policies \{#systemstorage&#95;policies\}

[サーバー構成](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes_configure)で定義されたストレージポリシーおよびボリュームに関する情報を含みます。

Columns:

* `policy_name` ([String](../../sql-reference/data-types/string.md)) — ストレージポリシーの名前。
* `volume_name` ([String](../../sql-reference/data-types/string.md)) — ストレージポリシーで定義されているボリューム名。
* `volume_priority` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 構成内でのボリュームの順序番号。データはこの優先度に従ってボリュームに格納されます。つまり、INSERT およびマージ時のデータは、より低い優先度のボリュームに書き込まれます（他のルール: TTL、`max_data_part_size`、`move_factor` を考慮）。
* `disks` ([Array(String)](../../sql-reference/data-types/array.md)) — ストレージポリシーで定義されているディスク名。
* `volume_type` ([Enum8](../../sql-reference/data-types/enum.md))  — ボリュームの種類。次のいずれかの値を取ります:
  * `JBOD`
  * `SINGLE_DISK`
  * `UNKNOWN`
* `max_data_part_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ボリューム上のディスクに保存できるデータパーツの最大サイズ（0 — 制限なし）。
* `move_factor` ([Float64](../../sql-reference/data-types/float.md)) — 空きディスク容量の比率。この比率が構成パラメータで設定された値を超えると、ClickHouse は順番に次のボリュームへデータの移動を開始します。
* `prefer_not_to_merge` ([UInt8](../../sql-reference/data-types/int-uint.md)) — `prefer_not_to_merge` 設定の値。常に false であるべきです。この設定が有効になっている場合は、設定を誤っています。
* `perform_ttl_move_on_insert` ([UInt8](../../sql-reference/data-types/int-uint.md)) — `perform_ttl_move_on_insert` 設定の値。データパーツの INSERT 時の TTL による移動を無効にします。デフォルトでは、TTL の移動ルールですでに期限切れになっているデータパーツを挿入した場合、そのパーツは直ちに移動ルールで指定されたボリューム/ディスクに移動されます。移動先のボリューム/ディスクが遅い（例: S3）場合、INSERT が大幅に遅くなる可能性があります。
* `load_balancing` ([Enum8](../../sql-reference/data-types/enum.md))  — ディスクバランシングのポリシー。次のいずれかの値を取ります:
  * `ROUND_ROBIN`
  * `LEAST_USED`

ストレージポリシーに複数のボリュームが含まれている場合、各ボリュームの情報はテーブルの個別の行として保存されます。