---
'description': 'システムテーブルには、サーバー構成で定義されたストレージポリシーとボリュームに関する情報が含まれています。'
'keywords':
- 'system table'
- 'storage_policies'
'slug': '/operations/system-tables/storage_policies'
'title': 'system.storage_policies'
'doc_type': 'reference'
---


# system.storage_policies

ストレージポリシーと、[サーバー設定](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes_configure)で定義されているボリュームに関する情報を含みます。

カラム:

- `policy_name` ([String](../../sql-reference/data-types/string.md)) — ストレージポリシーの名称。
- `volume_name` ([String](../../sql-reference/data-types/string.md)) — ストレージポリシーで定義されたボリューム名。
- `volume_priority` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 設定におけるボリューム順序番号。データはこの優先度に基づいてボリュームに蓄積されます。つまり、挿入やマージの際にデータは優先度が低いボリュームに書き込まれます（他のルール: TTL, `max_data_part_size`, `move_factor` を考慮）。
- `disks` ([Array(String)](../../sql-reference/data-types/array.md)) — ストレージポリシーで定義されたディスク名。
- `volume_type` ([Enum8](../../sql-reference/data-types/enum.md))  — ボリュームの種類。次のいずれかの値を持つことができます:
  - `JBOD` 
  - `SINGLE_DISK`
  - `UNKNOWN`
- `max_data_part_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ボリュームディスクに保存できるデータパートの最大サイズ (0 — 制限なし)。
- `move_factor` ([Float64](../../sql-reference/data-types/float.md)) — 空きディスクスペースの比率。この比率が設定パラメータの値を超えると、ClickHouseは次のボリュームにデータを移動し始めます。
- `prefer_not_to_merge` ([UInt8](../../sql-reference/data-types/int-uint.md)) — `prefer_not_to_merge` 設定の値。常にfalseであるべきです。この設定が有効な場合は、間違いを犯しています。
- `perform_ttl_move_on_insert` ([UInt8](../../sql-reference/data-types/int-uint.md)) — `perform_ttl_move_on_insert` 設定の値。 — データパートのINSERTにおけるTTL移動を無効にします。デフォルトでは、TTL移動ルールによってすでに期限切れのデータパートを挿入すると、それは即座に移動ルールで宣言されたボリューム/ディスクに行きます。これにより、宛先のボリューム/ディスクが遅い場合（例: S3）、挿入が大幅に遅くなる可能性があります。
- `load_balancing` ([Enum8](../../sql-reference/data-types/enum.md))  — ディスクバランシングのポリシー。次のいずれかの値を持つことができます:
  - `ROUND_ROBIN`
  - `LEAST_USED`

ストレージポリシーが複数のボリュームを含む場合、各ボリュームに対する情報はテーブルの個別の行に保存されます。
