---
description: 'ParquetMetadataフォーマットのドキュメント'
keywords: ['ParquetMetadata']
slug: /interfaces/formats/ParquetMetadata
title: 'ParquetMetadata'
---

## 説明 {#description}

Parquetファイルのメタデータを読み取るための特別なフォーマット (https://parquet.apache.org/docs/file-format/metadata/) です。常に次の構造/内容を持つ1行を出力します:
- `num_columns` - カラムの数
- ``num_rows` - 行の総数
- `num_row_groups` - 行グループの総数
- `format_version` - parquetフォーマットのバージョン、常に1.0または2.6
- `total_uncompressed_size` - データの総未圧縮バイトサイズ、すべての行グループのtotal_byte_sizeの合計として計算されます
- `total_compressed_size` - データの総圧縮バイトサイズ、すべての行グループのtotal_compressed_sizeの合計として計算されます
- `columns` - 次の構造を持つカラムメタデータのリスト:
    - `name` - カラム名
    - `path` - カラムのパス（ネストされたカラムの場合は名前と異なります）
    - `max_definition_level` - 最大定義レベル
    - `max_repetition_level` - 最大繰り返しレベル
    - `physical_type` - カラムの物理型
    - `logical_type` - カラムの論理型
    - `compression` - このカラムで使用される圧縮方式
    - `total_uncompressed_size` - カラムの総未圧縮バイトサイズ、すべての行グループからのtotal_uncompressed_sizeの合計として計算されます
    - `total_compressed_size` - カラムの総圧縮バイトサイズ、すべての行グループからのtotal_compressed_sizeの合計として計算されます
    - `space_saved` - 圧縮によって節約されたスペースの割合、計算式は(1 - total_compressed_size/total_uncompressed_size)です。
    - `encodings` - このカラムで使用されるエンコーディングのリスト
- `row_groups` - 次の構造を持つ行グループメタデータのリスト:
    - `num_columns` - 行グループ内のカラムの数
    - `num_rows` - 行グループ内の行の数
    - `total_uncompressed_size` - 行グループの総未圧縮バイトサイズ
    - `total_compressed_size` - 行グループの総圧縮バイトサイズ
    - `columns` - 次の構造を持つカラムチャンクメタデータのリスト:
        - `name` - カラム名
        - `path` - カラムのパス
        - `total_compressed_size` - カラムの総圧縮バイトサイズ
        - `total_uncompressed_size` - 行グループの総未圧縮バイトサイズ
        - `have_statistics` - カラムチャンクメタデータにカラム統計が含まれているかどうかを示すブールフラグ
        - `statistics` - カラムチャンクの統計（have_statistics = falseの場合はすべてのフィールドがNULL）で次の構造を持つ:
            - `num_values` - カラムチャンク内の非NULL値の数
            - `null_count` - カラムチャンク内のNULL値の数
            - `distinct_count` - カラムチャンク内の異なる値の数
            - `min` - カラムチャンクの最小値
            - `max` - カラムチャンクの最大値

## 使用例 {#example-usage}

例:

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
