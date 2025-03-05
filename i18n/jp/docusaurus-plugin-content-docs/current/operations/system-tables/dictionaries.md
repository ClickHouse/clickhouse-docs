---
description: "ディクショナリに関する情報を含むシステムテーブル"
slug: /operations/system-tables/dictionaries
title: "system.dictionaries"
keywords: ["システムテーブル", "ディクショナリ"]
---
import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

[dictionaries](../../sql-reference/dictionaries/index.md) に関する情報を含みます。

カラム:

- `database` ([String](../../sql-reference/data-types/string.md)) — DDL クエリによって作成されたディクショナリを含むデータベースの名前。他のディクショナリの場合は空文字列。
- `name` ([String](../../sql-reference/data-types/string.md)) — [ディクショナリ名](../../sql-reference/dictionaries/index.md)。
- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — ディクショナリの UUID。
- `status` ([Enum8](../../sql-reference/data-types/enum.md)) — ディクショナリのステータス。考え得る値:
    - `NOT_LOADED` — ディクショナリは使用されなかったためロードされていません。
    - `LOADED` — ディクショナリが正常にロードされました。
    - `FAILED` — エラーの結果、ディクショナリをロードできませんでした。
    - `LOADING` — ディクショナリが現在ロード中です。
    - `LOADED_AND_RELOADING` — ディクショナリが正常にロードされましたが、現在再ロード中です（頻繁な理由: [SYSTEM RELOAD DICTIONARY](../../sql-reference/statements/system.md#query_language-system-reload-dictionary) クエリ、タイムアウト、ディクショナリの設定が変更された）。
    - `FAILED_AND_RELOADING` — エラーの結果、ディクショナリをロードできず、現在ロード中です。
- `origin` ([String](../../sql-reference/data-types/string.md)) — ディクショナリを説明する設定ファイルへのパス。
- `type` ([String](../../sql-reference/data-types/string.md)) — ディクショナリの割り当てタイプ。 [メモリ内でのディクショナリの保存](../../sql-reference/dictionaries/index.md#storig-dictionaries-in-memory) 。
- `key.names` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — ディクショナリが提供する [キー名](../../sql-reference/dictionaries/index.md#dictionary-key-and-fields#ext_dict_structure-key) の配列。
- `key.types` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — ディクショナリが提供する対応する [キータイプ](../../sql-reference/dictionaries/index.md#dictionary-key-and-fields#ext_dict_structure-key) の配列。
- `attribute.names` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — ディクショナリが提供する [属性名](../../sql-reference/dictionaries/index.md#dictionary-key-and-fields#ext_dict_structure-attributes) の配列。
- `attribute.types` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — ディクショナリが提供する対応する [属性タイプ](../../sql-reference/dictionaries/index.md#dictionary-key-and-fields#ext_dict_structure-attributes) の配列。
- `bytes_allocated` ([UInt64](../../sql-reference/data-types/int-uint.md#uint-ranges)) — ディクショナリに対して割り当てられた RAM の量。
- `query_count` ([UInt64](../../sql-reference/data-types/int-uint.md#uint-ranges)) — ディクショナリがロードされてから、または最後の成功した再起動以降のクエリ数。
- `hit_rate` ([Float64](../../sql-reference/data-types/float.md)) — キャッシュディクショナリの場合、値がキャッシュにあった使用の割合。
- `found_rate` ([Float64](../../sql-reference/data-types/float.md)) — 値が見つかった使用の割合。
- `element_count` ([UInt64](../../sql-reference/data-types/int-uint.md#uint-ranges)) — ディクショナリに保存されたアイテムの数。
- `load_factor` ([Float64](../../sql-reference/data-types/float.md)) — ディクショナリに充填された割合（ハッシュディクショナリの場合、ハッシュテーブルに充填された割合）。
- `source` ([String](../../sql-reference/data-types/string.md)) — ディクショナリの [データソース](../../sql-reference/dictionaries/index.md#dictionary-sources) を説明するテキスト。
- `lifetime_min` ([UInt64](../../sql-reference/data-types/int-uint.md#uint-ranges)) — メモリ内のディクショナリの最小 [有効期限](../../sql-reference/dictionaries/index.md#dictionary-updates) で、これを過ぎると ClickHouse がディクショナリを再ロードしようとします（`invalidate_query` が設定されている場合、変更された場合のみ）。秒単位で設定。
- `lifetime_max` ([UInt64](../../sql-reference/data-types/int-uint.md#uint-ranges)) — メモリ内のディクショナリの最大 [有効期限](../../sql-reference/dictionaries/index.md#dictionary-updates) で、これを過ぎると ClickHouse がディクショナリを再ロードしようとします（`invalidate_query` が設定されている場合、変更された場合のみ）。秒単位で設定。
- `loading_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — ディクショナリのロード開始時間。
- `last_successful_update_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — ディクショナリのロードまたは更新の終了時間。ディクショナリソースの問題を監視し、その原因を調査するのに役立ちます。
- `loading_duration` ([Float32](../../sql-reference/data-types/float.md)) — ディクショナリのロード時間。
- `last_exception` ([String](../../sql-reference/data-types/string.md)) — ディクショナリの作成または再ロード時にエラーが発生した場合のエラーテキスト。
- `comment` ([String](../../sql-reference/data-types/string.md)) — ディクショナリへのコメントテキスト。

**例**

ディクショナリを構成します。

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
COMMENT '一時的なディクショナリ';
```

ディクショナリがロードされていることを確認します。

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
comment:                     一時的なディクショナリ
```
