---
'description': 'サーバー構成で定義されたストレージポリシーとボリュームに関する情報を含むシステムテーブルです。'
'keywords':
- 'system table'
- 'storage_policies'
'slug': '/operations/system-tables/storage_policies'
'title': 'system.storage_policies'
---




# system.storage_policies

ストレージポリシーと、[サーバー構成](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes_configure)で定義されたボリュームに関する情報が含まれています。

カラム:

- `policy_name` ([String](../../sql-reference/data-types/string.md)) — ストレージポリシーの名前。
- `volume_name` ([String](../../sql-reference/data-types/string.md)) — ストレージポリシーで定義されたボリューム名。
- `volume_priority` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 設定におけるボリュームの順序番号。データはこの優先度に従ってボリュームに格納され、つまり、挿入およびマージ中のデータは優先度が低いボリュームに書き込まれます（他のルール: TTL, `max_data_part_size`, `move_factor`を考慮）。
- `disks` ([Array(String)](../../sql-reference/data-types/array.md)) — ストレージポリシーで定義されたディスク名。
- `volume_type` ([Enum8](../../sql-reference/data-types/enum.md)) — ボリュームのタイプ。以下のいずれかの値を持つことができます：
    - `JBOD`
    - `SINGLE_DISK`
    - `UNKNOWN`
- `max_data_part_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ボリュームディスクに格納できるデータパートの最大サイズ（0 — 制限なし）。
- `move_factor` ([Float64](../../sql-reference/data-types/float.md)) — 空きディスク領域の比率。この比率が設定パラメータの値を超えると、ClickHouseは次のボリュームにデータを移動し始めます。
- `prefer_not_to_merge` ([UInt8](../../sql-reference/data-types/int-uint.md)) — `prefer_not_to_merge`設定の値。常にfalseであるべきです。この設定を有効にすると、間違いを犯したことになります。
- `perform_ttl_move_on_insert` ([UInt8](../../sql-reference/data-types/int-uint.md)) — `perform_ttl_move_on_insert`設定の値。— データパートのINSERTでTTL移動を無効にします。デフォルトでは、TTL移動ルールによってすでに期限切れのデータパートを挿入すると、それは直ちに移動ルールで宣言されたボリューム/ディスクに移動します。これにより、宛先ボリューム/ディスクが遅い場合（例：S3）は挿入が大幅に遅くなる可能性があります。
- `load_balancing` ([Enum8](../../sql-reference/data-types/enum.md)) — ディスクバランシングのポリシー。以下のいずれかの値を持つことができます：
    - `ROUND_ROBIN`
    - `LEAST_USED`

ストレージポリシーに1つ以上のボリュームが含まれている場合、各ボリュームの情報はテーブルの個別の行に保存されます。
