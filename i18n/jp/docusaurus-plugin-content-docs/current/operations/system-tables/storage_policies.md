---
description: 'サーバー設定で定義されたストレージポリシーおよびボリュームに関する情報を保持するシステムテーブル。'
keywords: ['システムテーブル', 'storage_policies']
slug: /operations/system-tables/storage_policies
title: 'system.storage_policies'
doc_type: 'reference'
---

# system.storage_policies

[サーバー設定](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes_configure)で定義されたストレージポリシーおよびボリュームに関する情報を含みます。

Columns:

- `policy_name` ([String](../../sql-reference/data-types/string.md)) — ストレージポリシー名。
- `volume_name` ([String](../../sql-reference/data-types/string.md)) — ストレージポリシーで定義されたボリューム名。
- `volume_priority` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 設定におけるボリュームの順序番号。データはこの優先度に従ってボリュームを埋めていきます。つまり、挿入およびマージ時のデータは、他のルール (TTL、`max_data_part_size`、`move_factor`) を考慮しつつ、より低い優先度のボリュームに書き込まれます。
- `disks` ([Array(String)](../../sql-reference/data-types/array.md)) — ストレージポリシーで定義されたディスク名。
- `volume_type` ([Enum8](../../sql-reference/data-types/enum.md))  — ボリュームの種類。次のいずれかの値を取ります:
  - `JBOD` 
  - `SINGLE_DISK`
  - `UNKNOWN`
- `max_data_part_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ボリューム上のディスクに保存できるデータパーツの最大サイズ (0 — 無制限)。
- `move_factor` ([Float64](../../sql-reference/data-types/float.md)) — 空きディスク容量の比率。この比率が設定パラメータの値を超えると、ClickHouse は順序で次のボリュームへデータの移動を開始します。
- `prefer_not_to_merge` ([UInt8](../../sql-reference/data-types/int-uint.md)) — `prefer_not_to_merge` 設定の値。常に false であるべきです。この設定を有効にしている場合、設定ミスをしていることになります。
- `perform_ttl_move_on_insert` ([UInt8](../../sql-reference/data-types/int-uint.md)) — `perform_ttl_move_on_insert` 設定の値。データパーツの INSERT 時の TTL move を無効にします。デフォルトでは、TTL move ルールによってすでに期限切れとなっているデータパーツを挿入した場合、それは即座に move ルールで指定されたボリューム/ディスクへ移動します。移動先のボリューム/ディスクが低速 (たとえば S3) の場合、これは挿入を大きく遅くする可能性があります。
- `load_balancing` ([Enum8](../../sql-reference/data-types/enum.md))  — ディスク負荷分散のポリシー。次のいずれかの値を取ります:
  - `ROUND_ROBIN`
  - `LEAST_USED`

ストレージポリシーに 2 つ以上のボリュームが含まれている場合、各ボリュームの情報はテーブルの個別の行に保存されます。