---
'description': 'System table containing information about dictionaries'
'keywords':
- 'system table'
- 'dictionaries'
'slug': '/operations/system-tables/dictionaries'
'title': 'system.dictionaries'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

[dictionaries](../../sql-reference/dictionaries/index.md) に関する情報を含みます。

カラム:

- `database` ([String](../../sql-reference/data-types/string.md)) — DDL クエリによって作成された辞書を含むデータベースの名前。他の辞書の場合は空文字列。
- `name` ([String](../../sql-reference/data-types/string.md)) — [辞書名](../../sql-reference/dictionaries/index.md)。
- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — 辞書の UUID。
- `status` ([Enum8](../../sql-reference/data-types/enum.md)) — 辞書のステータス。可能な値:
    - `NOT_LOADED` — 辞書は使用されていないためロードされていません。
    - `LOADED` — 辞書が正常にロードされました。
    - `FAILED` — エラーのため辞書をロードできませんでした。
    - `LOADING` — 辞書が現在ロード中です。
    - `LOADED_AND_RELOADING` — 辞書が正常にロードされており、現在再ロード中です（頻繁な理由: [SYSTEM RELOAD DICTIONARY](/sql-reference/statements/system#reload-dictionaries) クエリ、タイムアウト、辞書設定が変更された）。
    - `FAILED_AND_RELOADING` — エラーのため辞書をロードできず、現在ロード中です。
- `origin` ([String](../../sql-reference/data-types/string.md)) — 辞書を説明する設定ファイルへのパス。
- `type` ([String](../../sql-reference/data-types/string.md)) — 辞書の割り当てタイプ。[メモリに辞書を格納する](/sql-reference/dictionaries#storing-dictionaries-in-memory)。
- `key.names` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 辞書によって提供される [キー名](/operations/system-tables/dictionaries) の配列。
- `key.types` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 辞書によって提供される [キータイプ](/sql-reference/dictionaries#dictionary-key-and-fields) の対応する配列。
- `attribute.names` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 辞書によって提供される [属性名](/sql-reference/dictionaries#dictionary-key-and-fields) の配列。
- `attribute.types` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 辞書によって提供される [属性タイプ](/sql-reference/dictionaries#dictionary-key-and-fields) の対応する配列。
- `bytes_allocated` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 辞書のために割り当てられた RAM の量。
- `query_count` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 辞書がロードされてからのクエリの数、または最後の成功した再起動からのクエリの数。
- `hit_rate` ([Float64](../../sql-reference/data-types/float.md)) — キャッシュ辞書において、値がキャッシュにあった使用の割合。
- `found_rate` ([Float64](../../sql-reference/data-types/float.md)) — 値が見つかった使用の割合。
- `element_count` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 辞書に保存されているアイテムの数。
- `load_factor` ([Float64](../../sql-reference/data-types/float.md)) — 辞書内の充填率（ハッシュ辞書の場合、ハッシュテーブル内の充填率）。
- `source` ([String](../../sql-reference/data-types/string.md)) — 辞書の [データソース](../../sql-reference/dictionaries/index.md#dictionary-sources) を説明するテキスト。
- `lifetime_min` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — メモリ内の辞書の最小 [有効期限](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime) で、これを超えると ClickHouse は辞書を再ロードしようとします（`invalidate_query` が設定されている場合、変更があった場合のみ）。秒単位で設定。
- `lifetime_max` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — メモリ内の辞書の最大 [有効期限](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime) で、これを超えると ClickHouse は辞書を再ロードしようとします（`invalidate_query` が設定されている場合、変更があった場合のみ）。秒単位で設定。
- `loading_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 辞書の読み込み開始時刻。
- `last_successful_update_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 辞書の読み込みまたは更新の終了時刻。辞書ソースのいくつかの問題を監視し、その原因を調査するのに役立ちます。
- `loading_duration` ([Float32](../../sql-reference/data-types/float.md)) — 辞書の読み込みの期間。
- `last_exception` ([String](../../sql-reference/data-types/string.md)) — 辞書を作成または再読み込みする際にエラーが発生した場合のエラーテキスト。
- `comment` ([String](../../sql-reference/data-types/string.md)) — 辞書へのコメントのテキスト。

**例**

辞書を設定します:

```sql
CREATE DICTIONARY dictionary_with_comment
(
    id UInt64,
    value String
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(HOST 'localhost' PORT tcpPort() TABLE 'source_table'))
LAYOUT(FLAT())
LIFETIME(MIN 0 MAX 1000)
COMMENT '一時辞書';
```

辞書がロードされていることを確認します。

```sql
SELECT * FROM system.dictionaries LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
database:                    default
name:                        dictionary_with_comment
uuid:                        4654d460-0d03-433a-8654-d4600d03d33a
status:                      NOT_LOADED
origin:                      4654d460-0d03-433a-8654-d4600d03d33a
type:
key.names:                   ['id']
key.types:                   ['UInt64']
attribute.names:             ['value']
attribute.types:             ['String']
bytes_allocated:             0
query_count:                 0
hit_rate:                    0
found_rate:                  0
element_count:               0
load_factor:                 0
source:
lifetime_min:                0
lifetime_max:                0
loading_start_time:          1970-01-01 00:00:00
last_successful_update_time: 1970-01-01 00:00:00
loading_duration:            0
last_exception:
comment:                     一時辞書
```
