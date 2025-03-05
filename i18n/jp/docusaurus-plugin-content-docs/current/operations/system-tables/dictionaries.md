---
description: "辞書に関する情報を含むシステムテーブル"
slug: /operations/system-tables/dictionaries
title: "system.dictionaries"
keywords: ["システムテーブル", "辞書"]
---
import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

[dictionaries](../../sql-reference/dictionaries/index.md)に関する情報を含みます。

カラム:

- `database` ([String](../../sql-reference/data-types/string.md)) — DDLクエリによって作成された辞書を含むデータベースの名前。他の辞書の場合は空文字列。
- `name` ([String](../../sql-reference/data-types/string.md)) — [辞書名](../../sql-reference/dictionaries/index.md)。
- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — 辞書のUUID。
- `status` ([Enum8](../../sql-reference/data-types/enum.md)) — 辞書の状態。可能な値:
    - `NOT_LOADED` — 辞書は使われていないため、ロードされませんでした。
    - `LOADED` — 辞書は正常にロードされました。
    - `FAILED` — エラーのため、辞書をロードできませんでした。
    - `LOADING` — 現在辞書をロード中です。
    - `LOADED_AND_RELOADING` — 辞書は正常にロードされており、現在再ロード中です（頻繁な理由: [SYSTEM RELOAD DICTIONARY](/sql-reference/statements/system#reload-dictionaries) クエリ、タイムアウト、辞書設定が変更された）。
    - `FAILED_AND_RELOADING` — エラーのため辞書をロードできず、現在ロード中です。
- `origin` ([String](../../sql-reference/data-types/string.md)) — 辞書を説明する構成ファイルへのパス。
- `type` ([String](../../sql-reference/data-types/string.md)) — 辞書の割り当てタイプ。[メモリ内の辞書の保存](/sql-reference/dictionaries#storing-dictionaries-in-memory)。
- `key.names` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 辞書によって提供される[キー名](/operations/system-tables/dictionaries)の配列。
- `key.types` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 辞書によって提供される対応する[キータイプ](/sql-reference/dictionaries#dictionary-key-and-fields)の配列。
- `attribute.names` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 辞書によって提供される[属性名](/sql-reference/dictionaries#dictionary-key-and-fields)の配列。
- `attribute.types` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 辞書によって提供される対応する[属性タイプ](/sql-reference/dictionaries#attributes)の配列。
- `bytes_allocated` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 辞書のために割り当てられたRAMの量。
- `query_count` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 辞書がロードされて以来、または最後に正常に再起動されてからのクエリ数。
- `hit_rate` ([Float64](../../sql-reference/data-types/float.md)) — キャッシュ辞書の場合、その値がキャッシュにあった使用の割合。
- `found_rate` ([Float64](../../sql-reference/data-types/float.md)) — その値が見つかった使用の割合。
- `element_count` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 辞書に保存されているアイテムの数。
- `load_factor` ([Float64](../../sql-reference/data-types/float.md)) — 辞書の充填率（ハッシュ辞書の場合、ハッシュテーブルの充填率）。
- `source` ([String](../../sql-reference/data-types/string.md)) — 辞書の[データソース](../../sql-reference/dictionaries/index.md#dictionary-sources)を説明するテキスト。
- `lifetime_min` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 辞書がメモリ内に保持される最小[寿命](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime)、これを過ぎるとClickHouseは辞書を再ロードしようとします（`invalidate_query`が設定されている場合、変更があった時だけ）。秒で設定。
- `lifetime_max` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 辞書がメモリ内に保持される最大[寿命](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime)、これを過ぎるとClickHouseは辞書を再ロードしようとします（`invalidate_query`が設定されている場合、変更があった時だけ）。秒で設定。
- `loading_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 辞書のロード開始時間。
- `last_successful_update_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 辞書のロードまたは更新終了時間。辞書ソースに関する問題を監視し、その原因を調査するのに役立ちます。
- `loading_duration` ([Float32](../../sql-reference/data-types/float.md)) — 辞書のロードの所要時間。
- `last_exception` ([String](../../sql-reference/data-types/string.md)) — 辞書を作成または再ロードする際にエラーが発生した場合、そのテキスト。
- `comment` ([String](../../sql-reference/data-types/string.md)) — 辞書へのコメントのテキスト。

**例**

辞書を構成します:

``` sql
CREATE DICTIONARY dictionary_with_comment
(
    id UInt64,
    value String
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(HOST 'localhost' PORT tcpPort() TABLE 'source_table'))
LAYOUT(FLAT())
LIFETIME(MIN 0 MAX 1000)
COMMENT '一時的な辞書';
```

辞書がロードされていることを確認します。

``` sql
SELECT * FROM system.dictionaries LIMIT 1 FORMAT Vertical;
```

``` text
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
comment:                     一時的な辞書
```
