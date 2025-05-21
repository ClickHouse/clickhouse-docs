---
'description': 'ParquetMetadata 格式的文档'
'keywords':
- 'ParquetMetadata'
'slug': '/interfaces/formats/ParquetMetadata'
'title': 'ParquetMetadata'
---



## 描述 {#description}

读取 Parquet 文件元数据的特殊格式 (https://parquet.apache.org/docs/file-format/metadata/)。它始终输出一行，结构/内容如下：
- `num_columns` - 列的数量
- `num_rows` - 行的总数
- `num_row_groups` - 行组的总数
- `format_version` - parquet 格式版本，始终为 1.0 或 2.6
- `total_uncompressed_size` - 数据的总未压缩字节大小，计算为所有行组的 total_byte_size 之和
- `total_compressed_size` - 数据的总压缩字节大小，计算为所有行组的 total_compressed_size 之和
- `columns` - 列元数据的列表，具有以下结构：
    - `name` - 列名
    - `path` - 列路径（对于嵌套列与列名不同）
    - `max_definition_level` - 最大定义级别
    - `max_repetition_level` - 最大重复级别
    - `physical_type` - 列的物理类型
    - `logical_type` - 列的逻辑类型
    - `compression` - 用于此列的压缩类型
    - `total_uncompressed_size` - 列的总未压缩字节大小，计算为所有行组中该列的 total_uncompressed_size 之和
    - `total_compressed_size` - 列的总压缩字节大小，计算为所有行组中该列的 total_compressed_size 之和
    - `space_saved` - 通过压缩节省的空间百分比，计算为 (1 - total_compressed_size/total_uncompressed_size)。
    - `encodings` - 此列使用的编码列表
- `row_groups` - 行组元数据的列表，具有以下结构：
    - `num_columns` - 行组中的列数
    - `num_rows` - 行组中的行数
    - `total_uncompressed_size` - 行组的总未压缩字节大小
    - `total_compressed_size` - 行组的总压缩字节大小
    - `columns` - 列块元数据的列表，具有以下结构：
        - `name` - 列名
        - `path` - 列路径
        - `total_compressed_size` - 列的总压缩字节大小
        - `total_uncompressed_size` - 行组的总未压缩字节大小
        - `have_statistics` - 布尔标志，指示列块元数据是否包含列统计信息
        - `statistics` - 列块统计信息（如果 have_statistics = false，则所有字段为 NULL），具有以下结构：
            - `num_values` - 列块中非空值的数量
            - `null_count` - 列块中 NULL 值的数量
            - `distinct_count` - 列块中不同值的数量
            - `min` - 列块的最小值
            - `max` - 列块的最大值

## 示例用法 {#example-usage}

示例：

```sql
SELECT * 
FROM file(data.parquet, ParquetMetadata) 
FORMAT PrettyJSONEachRow
```

```json
{
    "num_columns": "2",
    "num_rows": "100000",
    "num_row_groups": "2",
    "format_version": "2.6",
    "metadata_size": "577",
    "total_uncompressed_size": "282436",
    "total_compressed_size": "26633",
    "columns": [
        {
            "name": "number",
            "path": "number",
            "max_definition_level": "0",
            "max_repetition_level": "0",
            "physical_type": "INT32",
            "logical_type": "Int(bitWidth=16, isSigned=false)",
            "compression": "LZ4",
            "total_uncompressed_size": "133321",
            "total_compressed_size": "13293",
            "space_saved": "90.03%",
            "encodings": [
                "RLE_DICTIONARY",
                "PLAIN",
                "RLE"
            ]
        },
        {
            "name": "concat('Hello', toString(modulo(number, 1000)))",
            "path": "concat('Hello', toString(modulo(number, 1000)))",
            "max_definition_level": "0",
            "max_repetition_level": "0",
            "physical_type": "BYTE_ARRAY",
            "logical_type": "None",
            "compression": "LZ4",
            "total_uncompressed_size": "149115",
            "total_compressed_size": "13340",
            "space_saved": "91.05%",
            "encodings": [
                "RLE_DICTIONARY",
                "PLAIN",
                "RLE"
            ]
        }
    ],
    "row_groups": [
        {
            "num_columns": "2",
            "num_rows": "65409",
            "total_uncompressed_size": "179809",
            "total_compressed_size": "14163",
            "columns": [
                {
                    "name": "number",
                    "path": "number",
                    "total_compressed_size": "7070",
                    "total_uncompressed_size": "85956",
                    "have_statistics": true,
                    "statistics": {
                        "num_values": "65409",
                        "null_count": "0",
                        "distinct_count": null,
                        "min": "0",
                        "max": "999"
                    }
                },
                {
                    "name": "concat('Hello', toString(modulo(number, 1000)))",
                    "path": "concat('Hello', toString(modulo(number, 1000)))",
                    "total_compressed_size": "7093",
                    "total_uncompressed_size": "93853",
                    "have_statistics": true,
                    "statistics": {
                        "num_values": "65409",
                        "null_count": "0",
                        "distinct_count": null,
                        "min": "Hello0",
                        "max": "Hello999"
                    }
                }
            ]
        },
        ...
    ]
}
```
