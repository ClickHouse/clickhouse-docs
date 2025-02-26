---
description: "サーバー設定で定義されたストレージポリシーとボリュームに関する情報を含むシステムテーブル。"
slug: /operations/system-tables/storage_policies
title: "storage_policies"
keywords: ["システムテーブル", "ストレージポリシー"]
---

ストレージポリシーと[サーバー設定](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes_configure)で定義されたボリュームに関する情報を含みます。

カラム:

- `policy_name` ([String](../../sql-reference/data-types/string.md)) — ストレージポリシーの名前。
- `volume_name` ([String](../../sql-reference/data-types/string.md)) — ストレージポリシーで定義されたボリュームの名前。
- `volume_priority` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 設定におけるボリュームの順序番号。この優先度に従ってデータがボリュームに記入され、挿入およびマージ時にデータは低い優先度のボリュームに書き込まれます（他のルール: TTL、`max_data_part_size`、`move_factor`を考慮する）。
- `disks` ([Array(String)](../../sql-reference/data-types/array.md)) — ストレージポリシーで定義されたディスク名。
- `volume_type` ([Enum8](../../sql-reference/data-types/enum.md)) — ボリュームのタイプ。以下のいずれかの値を持つことができます：
    - `JBOD` 
    - `SINGLE_DISK`
    - `UNKNOWN`
- `max_data_part_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ボリュームディスクに保存できるデータパートの最大サイズ（0 — 制限なし）。
- `move_factor` ([Float64](../../sql-reference/data-types/float.md)) — 空きディスク容量の比率。この比率が設定パラメータの値を超えると、ClickHouseは次のボリュームにデータを移動し始めます。
- `prefer_not_to_merge` ([UInt8](../../sql-reference/data-types/int-uint.md)) — `prefer_not_to_merge`設定の値。常にfalseであるべきです。この設定が有効な場合は、誤りを犯したことになります。
- `perform_ttl_move_on_insert` ([UInt8](../../sql-reference/data-types/int-uint.md)) — `perform_ttl_move_on_insert`設定の値。 — データパートのINSERT時にTTL移動を無効にします。デフォルトでは、TTL移動ルールによって既に期限切れのデータパートを挿入すると、それは即座に移動ルールで宣言されたボリューム/ディスクに移動します。これは、目的地のボリューム/ディスクが遅い場合（例: S3）に挿入を著しく遅くする可能性があります。
- `load_balancing` ([Enum8](../../sql-reference/data-types/enum.md)) — ディスクバランシングのポリシー。以下のいずれかの値を持つことができます：
    - `ROUND_ROBIN`
    - `LEAST_USED`

ストレージポリシーが1つ以上のボリュームを含む場合、それぞれのボリュームの情報はテーブルの個別の行に保存されます。
