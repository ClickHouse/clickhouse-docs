---
'description': 'System table containing information about dictionaries'
'keywords':
- 'system table'
- 'dictionaries'
'slug': '/operations/system-tables/dictionaries'
'title': 'system.dictionaries'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

包含有关 [字典](../../sql-reference/dictionaries/index.md) 的信息。

列：

- `database` ([String](../../sql-reference/data-types/string.md)) — 包含通过 DDL 查询创建的字典的数据库名称。其他字典为空字符串。
- `name` ([String](../../sql-reference/data-types/string.md)) — [字典名称](../../sql-reference/dictionaries/index.md)。
- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — 字典 UUID。
- `status` ([Enum8](../../sql-reference/data-types/enum.md)) — 字典状态。可能的值：
    - `NOT_LOADED` — 字典未加载，因为未使用。
    - `LOADED` — 字典加载成功。
    - `FAILED` — 无法加载字典，由于发生错误。
    - `LOADING` — 字典正在加载中。
    - `LOADED_AND_RELOADING` — 字典加载成功，并且正在重新加载（常见原因：[SYSTEM RELOAD DICTIONARY](/sql-reference/statements/system#reload-dictionaries) 查询、超时、字典配置已更改）。
    - `FAILED_AND_RELOADING` — 由于发生错误无法加载字典，并且目前正在加载。
- `origin` ([String](../../sql-reference/data-types/string.md)) — 描述字典的配置文件的路径。
- `type` ([String](../../sql-reference/data-types/string.md)) — 字典分配类型。 [在内存中存储字典](/sql-reference/dictionaries#storing-dictionaries-in-memory)。
- `key.names` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 字典提供的 [键名称](/operations/system-tables/dictionaries) 数组。
- `key.types` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 字典提供的相应的 [键类型](/sql-reference/dictionaries#dictionary-key-and-fields) 数组。
- `attribute.names` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 字典提供的 [属性名称](/sql-reference/dictionaries#dictionary-key-and-fields) 数组。
- `attribute.types` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 字典提供的相应的 [属性类型](/sql-reference/dictionaries#dictionary-key-and-fields) 数组。
- `bytes_allocated` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 为字典分配的内存量。
- `query_count` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 自字典加载以来或自上次成功重启以来的查询数量。
- `hit_rate` ([Float64](../../sql-reference/data-types/float.md)) — 对于缓存字典，值在缓存中的使用百分比。
- `found_rate` ([Float64](../../sql-reference/data-types/float.md)) — 值找到的使用百分比。
- `element_count` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 存储在字典中的项数。
- `load_factor` ([Float64](../../sql-reference/data-types/float.md)) — 字典中的填充百分比（对于哈希字典，哈希表中的填充百分比）。
- `source` ([String](../../sql-reference/data-types/string.md)) — 描述字典的数据源的文本，见 [数据源](../../sql-reference/dictionaries/index.md#dictionary-sources)。
- `lifetime_min` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 字典在内存中的最小 [生存时间](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime)，之后 ClickHouse 尝试重新加载字典（如果设置了 `invalidate_query`，则仅在字典更改时）。以秒为单位设置。
- `lifetime_max` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 字典在内存中的最大 [生存时间](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime)，之后 ClickHouse 尝试重新加载字典（如果设置了 `invalidate_query`，则仅在字典更改时）。以秒为单位设置。
- `loading_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 加载字典的开始时间。
- `last_successful_update_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 加载或更新字典的结束时间。帮助监控字典源的问题并调查原因。
- `loading_duration` ([Float32](../../sql-reference/data-types/float.md)) — 字典加载的持续时间。
- `last_exception` ([String](../../sql-reference/data-types/string.md)) — 创建或重新加载字典时发生的错误的文本，如果字典无法创建。
- `comment` ([String](../../sql-reference/data-types/string.md)) — 字典的备注文本。

**示例**

配置字典：

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
COMMENT 'The temporary dictionary';
```

确保字典已加载。

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
comment:                     The temporary dictionary
```
