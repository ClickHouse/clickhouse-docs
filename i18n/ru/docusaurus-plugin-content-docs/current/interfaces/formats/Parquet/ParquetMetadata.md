---
description: 'Документация для формата ParquetMetadata'
keywords: ['ParquetMetadata']
slug: /interfaces/formats/ParquetMetadata
title: 'ParquetMetadata'
---

## Описание {#description}

Специальный формат для чтения метаданных файла Parquet (https://parquet.apache.org/docs/file-format/metadata/). Он всегда возвращает одну строку с следующей структурой/содержанием:
- `num_columns` - количество колонок
- ``num_rows` - общее количество строк
- `num_row_groups` - общее количество групп строк
- `format_version` - версия формата parquet, всегда 1.0 или 2.6
- `total_uncompressed_size` - общий размер необработанных байтов данных, рассчитанный как сумма total_byte_size из всех групп строк
- `total_compressed_size` - общий размер сжатых байтов данных, рассчитанный как сумма total_compressed_size из всех групп строк
- `columns` - список метаданных колонок со следующей структурой:
    - `name` - имя колонки
    - `path` - путь колонки (отличается от имени для вложенной колонки)
    - `max_definition_level` - максимальный уровень определения
    - `max_repetition_level` - максимальный уровень повторения
    - `physical_type` - физический тип колонки
    - `logical_type` - логический тип колонки
    - `compression` - сжатие, используемое для этой колонки
    - `total_uncompressed_size` - общий размер необработанных байтов колонки, рассчитанный как сумма total_uncompressed_size колонки из всех групп строк
    - `total_compressed_size` - общий размер сжатых байтов колонки, рассчитанный как сумма total_compressed_size колонки из всех групп строк
    - `space_saved` - процент сэкономленного пространства за счет сжатия, рассчитанный как (1 - total_compressed_size/total_uncompressed_size).
    - `encodings` - список кодировок, использованных для этой колонки
- `row_groups` - список метаданных групп строк с следующей структурой:
    - `num_columns` - количество колонок в группе строк
    - `num_rows` - количество строк в группе строк
    - `total_uncompressed_size` - общий размер необработанных байтов группы строк
    - `total_compressed_size` - общий размер сжатых байтов группы строк
    - `columns` - список метаданных части колонок с следующей структурой:
        - `name` - имя колонки
        - `path` - путь колонки
        - `total_compressed_size` - общий размер сжатых байтов колонки
        - `total_uncompressed_size` - общий размер необработанных байтов группы строк
        - `have_statistics` - булевый флаг, указывающий, содержит ли метаданные части колонки статистику колонки
        - `statistics` - статистика части колонки (все поля равны NULL, если have_statistics = false) со следующей структурой:
            - `num_values` - количество ненулевых значений в части колонки
            - `null_count` - количество значений NULL в части колонки
            - `distinct_count` - количество различных значений в части колонки
            - `min` - минимальное значение части колонки
            - `max` - максимальное значение части колонки

## Пример использования {#example-usage}

Пример:

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
