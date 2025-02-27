---
description: "辞書に関する情報を含むシステムテーブル"
slug: /operations/system-tables/dictionaries
title: "辞書"
keywords: ["システムテーブル", "辞書"]
---
import SystemTableCloud from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

[dictionaries](../../sql-reference/dictionaries/index.md)に関する情報を含みます。

カラム:

- `database` ([String](../../sql-reference/data-types/string.md)) — DDLクエリによって作成された辞書を含むデータベースの名前。その他の辞書の場合は空の文字列。
- `name` ([String](../../sql-reference/data-types/string.md)) — [辞書名](../../sql-reference/dictionaries/index.md)。
- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — 辞書のUUID。
- `status` ([Enum8](../../sql-reference/data-types/enum.md)) — 辞書のステータス。可能な値:
    - `NOT_LOADED` — 辞書は使用されなかったため、ロードされていません。
    - `LOADED` — 辞書が正常にロードされました。
    - `FAILED` — エラーの結果、辞書をロードできませんでした。
    - `LOADING` — 辞書が現在ロード中です。
    - `LOADED_AND_RELOADING` — 辞書は正常にロードされ、現在再ロード中です（頻繁な理由: [SYSTEM RELOAD DICTIONARY](../../sql-reference/statements/system.md#query_language-system-reload-dictionary)クエリ、タイムアウト、辞書の設定が変更された）。
    - `FAILED_AND_RELOADING` — エラーの結果、辞書をロードできず、現在ロード中です。
- `origin` ([String](../../sql-reference/data-types/string.md)) — 辞書を記述する設定ファイルへのパス。
- `type` ([String](../../sql-reference/data-types/string.md)) — 辞書の割り当てタイプ。[メモリ内の辞書の保存](../../sql-reference/dictionaries/index.md#storig-dictionaries-in-memory)。
- `key.names` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 辞書から提供される[キー名](../../sql-reference/dictionaries/index.md#dictionary-key-and-fields#ext_dict_structure-key)の配列。
- `key.types` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 辞書から提供される対応する[キータイプ](../../sql-reference/dictionaries/index.md#dictionary-key-and-fields#ext_dict_structure-key)の配列。
- `attribute.names` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 辞書から提供される[属性名](../../sql-reference/dictionaries/index.md#dictionary-key-and-fields#ext_dict_structure-attributes)の配列。
- `attribute.types` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 辞書から提供される対応する[属性タイプ](../../sql-reference/dictionaries/index.md#dictionary-key-and-fields#ext_dict_structure-attributes)の配列。
- `bytes_allocated` ([UInt64](../../sql-reference/data-types/int-uint.md#uint-ranges)) — 辞書のために割り当てられたRAMの量。
- `query_count` ([UInt64](../../sql-reference/data-types/int-uint.md#uint-ranges)) — 辞書がロードされて以来のクエリ数または最後の成功した再起動以降のクエリ数。
- `hit_rate` ([Float64](../../sql-reference/data-types/float.md)) — キャッシュ辞書に対して、値がキャッシュにあった使用の割合。
- `found_rate` ([Float64](../../sql-reference/data-types/float.md)) — 値が見つかった使用の割合。
- `element_count` ([UInt64](../../sql-reference/data-types/int-uint.md#uint-ranges)) — 辞書に保存されている項目の数。
- `load_factor` ([Float64](../../sql-reference/data-types/float.md)) — 辞書内の充填率（ハッシュ辞書の場合、ハッシュテーブル内の充填率）。
- `source` ([String](../../sql-reference/data-types/string.md)) — 辞書の[データソース](../../sql-reference/dictionaries/index.md#dictionary-sources)を示すテキスト。
- `lifetime_min` ([UInt64](../../sql-reference/data-types/int-uint.md#uint-ranges)) — メモリ内の辞書の最小[有効期限](../../sql-reference/dictionaries/index.md#dictionary-updates)、これを過ぎるとClickHouseは辞書の再ロードを試みます（`invalidate_query`が設定されている場合、変更されていなければならない）。秒単位で設定。
- `lifetime_max` ([UInt64](../../sql-reference/data-types/int-uint.md#uint-ranges)) — メモリ内の辞書の最大[有効期限](../../sql-reference/dictionaries/index.md#dictionary-updates)、これを過ぎるとClickHouseは辞書の再ロードを試みます（`invalidate_query`が設定されている場合、変更されていなければならない）。秒単位で設定。
- `loading_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 辞書のロード開始時間。
- `last_successful_update_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 辞書のロードまたは更新の終了時間。辞書ソースに関するいくつかのトラブルを監視し、原因を調査するのに役立ちます。
- `loading_duration` ([Float32](../../sql-reference/data-types/float.md)) — 辞書のロード時間。
- `last_exception` ([String](../../sql-reference/data-types/string.md)) — 辞書の作成または再ロード時に発生したエラーのテキスト。
- `comment` ([String](../../sql-reference/data-types/string.md)) — 辞書へのコメントのテキスト。

**例**

辞書を設定します:

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
