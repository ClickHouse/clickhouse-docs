---
description: "サーバー設定で定義されたストレージポリシーとボリュームに関する情報を含むシステムテーブルです。"
slug: /operations/system-tables/storage_policies
title: "system.storage_policies"
keywords: ["system table", "storage_policies"]
---

サーバー設定で定義されたストレージポリシーとボリュームに関する情報を含みます。[サーバー設定](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes_configure)を参照してください。

カラム:

- `policy_name` ([String](../../sql-reference/data-types/string.md)) — ストレージポリシーの名前。
- `volume_name` ([String](../../sql-reference/data-types/string.md)) — ストレージポリシーで定義されたボリューム名。
- `volume_priority` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 設定内のボリュームの順序番号。この優先度に従ってデータがボリュームに格納されます。すなわち、データの挿入やマージ時に優先度の低いボリュームにデータが書き込まれます（他のルール: TTL, `max_data_part_size`, `move_factor` を考慮）。
- `disks` ([Array(String)](../../sql-reference/data-types/array.md)) — ストレージポリシーで定義されたディスク名。
- `volume_type` ([Enum8](../../sql-reference/data-types/enum.md))  — ボリュームのタイプ。以下のいずれかの値を持つことができます：
    - `JBOD` 
    - `SINGLE_DISK`
    - `UNKNOWN`
- `max_data_part_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ボリュームディスクに保存できるデータパートの最大サイズ（0 — 制限なし）。
- `move_factor` ([Float64](../../sql-reference/data-types/float.md)) — 空きディスクスペースの比率。比率が設定パラメータの値を超えると、ClickHouseは次のボリュームにデータを移動し始めます。
- `prefer_not_to_merge` ([UInt8](../../sql-reference/data-types/int-uint.md)) — `prefer_not_to_merge` 設定の値。常に false であるべきです。この設定が有効な場合は誤りです。
- `perform_ttl_move_on_insert` ([UInt8](../../sql-reference/data-types/int-uint.md)) — `perform_ttl_move_on_insert` 設定の値。 — データパートの INSERT における TTL 移動を無効にします。デフォルトでは、TTL 移動ルールによってすでに期限切れになったデータパートを挿入すると、そのパートはすぐに移動ルールで宣言されたボリューム/ディスクに移動します。目的地のボリューム/ディスクが遅い（例: S3）場合、挿入が大幅に遅くなる可能性があります。
- `load_balancing` ([Enum8](../../sql-reference/data-types/enum.md))  — ディスクのバランス調整ポリシー。以下のいずれかの値を持つことができます：
    - `ROUND_ROBIN`
    - `LEAST_USED`

ストレージポリシーに複数のボリュームが含まれている場合、各ボリュームの情報はテーブルの個別の行に保存されます。
