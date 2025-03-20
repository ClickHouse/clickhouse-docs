---
description: 'ディクショナリに関する情報を含むシステムテーブル'
slug: /operations/system-tables/dictionaries
title: 'system.dictionaries'
keywords: ['system table', 'dictionaries']
---
import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

[dictionaries](../../sql-reference/dictionaries/index.md) に関する情報を含みます。

カラム:

- `database` ([String](../../sql-reference/data-types/string.md)) — DDL クエリによって作成されたディクショナリを含むデータベースの名前。他のディクショナリの場合、空の文字列。
- `name` ([String](../../sql-reference/data-types/string.md)) — [ディクショナリ名](../../sql-reference/dictionaries/index.md)。
- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — ディクショナリの UUID。
- `status` ([Enum8](../../sql-reference/data-types/enum.md)) — ディクショナリのステータス。可能な値:
    - `NOT_LOADED` — ディクショナリは使用されなかったため、ロードされませんでした。
    - `LOADED` — ディクショナリが正常にロードされました。
    - `FAILED` — エラーのため、ディクショナリをロードできませんでした。
    - `LOADING` — ディクショナリが現在ロード中です。
    - `LOADED_AND_RELOADING` — ディクショナリが正常にロードされ、現在再ロード中です（頻繁な理由: [SYSTEM RELOAD DICTIONARY](/sql-reference/statements/system#reload-dictionaries) クエリ、タイムアウト、ディクショナリ構成が変更された）。
    - `FAILED_AND_RELOADING` — エラーのためディクショナリをロードできず、現在ロード中です。
- `origin` ([String](../../sql-reference/data-types/string.md)) — ディクショナリを記述する構成ファイルのパス。
- `type` ([String](../../sql-reference/data-types/string.md)) — ディクショナリの割り当てのタイプ。 [メモリ内のディクショナリの保存](/sql-reference/dictionaries#storing-dictionaries-in-memory)。
- `key.names` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — ディクショナリによって提供される [キー名](/operations/system-tables/dictionaries) の配列。
- `key.types` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — ディクショナリによって提供される対応する [キータイプ](/sql-reference/dictionaries#dictionary-key-and-fields) の配列。
- `attribute.names` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — ディクショナリによって提供される [属性名](/sql-reference/dictionaries#dictionary-key-and-fields) の配列。
- `attribute.types` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — ディクショナリによって提供される対応する [属性タイプ](/sql-reference/dictionaries#dictionary-key-and-fields) の配列。
- `bytes_allocated` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — ディクショナリに割り当てられたRAMの量。
- `query_count` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — ディクショナリがロードされて以来のクエリの数、または最後の成功したリブート以来のクエリの数。
- `hit_rate` ([Float64](../../sql-reference/data-types/float.md)) — キャッシュディクショナリの場合、値がキャッシュにあった使用の割合。
- `found_rate` ([Float64](../../sql-reference/data-types/float.md)) — 値が見つかった使用の割合。
- `element_count` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — ディクショナリに保存されているアイテムの数。
- `load_factor` ([Float64](../../sql-reference/data-types/float.md)) — ディクショナリ内の充填率（ハッシュディクショナリの場合、ハッシュテーブル内の充填率）。
- `source` ([String](../../sql-reference/data-types/string.md)) — ディクショナリの [データソース](../../sql-reference/dictionaries/index.md#dictionary-sources) を説明するテキスト。
- `lifetime_min` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — ディクショナリがメモリ内で持つ最小の [ライフタイム](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime) で、この時間が経過すると ClickHouse はディクショナリを再ロードしようとします（`invalidate_query` が設定されている場合、変更があった場合のみ）。秒単位で設定。
- `lifetime_max` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — ディクショナリがメモリ内で持つ最大の [ライフタイム](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime) で、この時間が経過すると ClickHouse はディクショナリを再ロードしようとします（`invalidate_query` が設定されている場合、変更があった場合のみ）。秒単位で設定。
- `loading_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — ディクショナリのロード開始時刻。
- `last_successful_update_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — ディクショナリのロードまたは更新の終了時刻。ディクショナリソースの問題を監視し、原因を調査するのに役立ちます。
- `loading_duration` ([Float32](../../sql-reference/data-types/float.md)) — ディクショナリのロード時間。
- `last_exception` ([String](../../sql-reference/data-types/string.md)) — ディクショナリを作成または再ロードする際に発生するエラーのテキスト、ディクショナリが作成できなかった場合。
- `comment` ([String](../../sql-reference/data-types/string.md)) — ディクショナリへのコメントのテキスト。

**例**

ディクショナリを設定します:

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
