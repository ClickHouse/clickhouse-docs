---
{}
---



```
以下の設定はサブタグによって構成できます：

| 設定                               | 説明                                                                                                                                                 | デフォルト          | 注意                                                                                                                |
|------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|---------------------------------------------------------------------------------------------------------------------|
| `database`                         | データベースの名前。                                                                                                                                    |                     |                                                                                                                     |
| `table`                            | システムテーブルの名前。                                                                                                                                 |                     |                                                                                                                     |
| `engine`                           | [MergeTreeエンジンの定義](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table) システムテーブルのための。 |                     | `partition_by` または `order_by` が定義されている場合は使用できません。指定されていない場合はデフォルトで `MergeTree` が選択されます。      |
| `partition_by`                     | システムテーブル用の[カスタムパーティショニングキー](../../../engines/table-engines/mergetree-family/custom-partitioning-key.md)。                              |                     | システムテーブルのために `engine` が指定されている場合、`partition_by` パラメータは 'engine' 内で直接指定する必要があります。   |
| `ttl`                              | テーブルの[TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)を指定します。                                           |                     | システムテーブルのために `engine` が指定されている場合、`ttl` パラメータは 'engine' 内で直接指定する必要があります。            |
| `order_by`                         | システムテーブル用の[カスタムソートキー](../../../engines/table-engines/mergetree-family/mergetree.md#order_by)。`engine` が定義されている場合は使用できません。     |                     | システムテーブルのために `engine` が指定されている場合、`order_by` パラメータは 'engine' 内で直接指定する必要があります。       |
| `storage_policy`                   | テーブルに使用するストレージポリシーの名前（オプション）。                                                                                             |                     | システムテーブルのために `engine` が指定されている場合、`storage_policy` パラメータは 'engine' 内で直接指定する必要があります。 |
| `settings`                         | MergeTree の動作を制御する[追加パラメータ](../../../engines/table-engines/mergetree-family/mergetree.md/#settings)（オプション）。                     |                     | システムテーブルのために `engine` が指定されている場合、`settings` パラメータは 'engine' 内で直接指定する必要があります。       |
| `flush_interval_milliseconds`      | メモリ内のバッファからテーブルへのデータフラッシュの間隔。                                                                                        | `7500`              |                                                                                                                     |
| `max_size_rows`                    | ログの最大行数。この最大サイズに達した場合、フラッシュされていないログがディスクにダンプされます。                                                   | `1048576`           |                                                                                                                     |
| `reserved_size_rows`               | ログのために事前に確保されたメモリサイズ（行数）。                                                                                                    | `8192`              |                                                                                                                     |
| `buffer_size_rows_flush_threshold` | 行数のしきい値。しきい値に達した場合、ログをバックグラウンドでディスクにフラッシュします。                                                        | `max_size_rows / 2` |                                                                                                                     |
| `flush_on_crash`                   | クラッシュ時にログをディスクにダンプするかどうかを設定します。                                                                                      | `false`             |                                                                                                                     |
```
