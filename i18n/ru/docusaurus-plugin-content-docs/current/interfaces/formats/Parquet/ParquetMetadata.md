---
description: 'Документация по формату ParquetMetadata'
keywords: ['ParquetMetadata']
slug: /interfaces/formats/ParquetMetadata
title: 'ParquetMetadata'
doc_type: 'reference'
---



## Описание {#description}

Специальный формат для чтения метаданных файлов Parquet (https://parquet.apache.org/docs/file-format/metadata/). Всегда возвращает одну строку со следующей структурой:

- `num_columns` — количество столбцов
- `num_rows` — общее количество строк
- `num_row_groups` — общее количество групп строк
- `format_version` — версия формата Parquet, всегда 1.0 или 2.6
- `total_uncompressed_size` — общий размер несжатых данных в байтах, вычисляется как сумма total_byte_size из всех групп строк
- `total_compressed_size` — общий размер сжатых данных в байтах, вычисляется как сумма total_compressed_size из всех групп строк
- `columns` — список метаданных столбцов со следующей структурой:
  - `name` — имя столбца
  - `path` — путь к столбцу (отличается от имени для вложенных столбцов)
  - `max_definition_level` — максимальный уровень определения
  - `max_repetition_level` — максимальный уровень повторения
  - `physical_type` — физический тип столбца
  - `logical_type` — логический тип столбца
  - `compression` — метод сжатия, используемый для данного столбца
  - `total_uncompressed_size` — общий размер несжатых данных столбца в байтах, вычисляется как сумма total_uncompressed_size столбца из всех групп строк
  - `total_compressed_size` — общий размер сжатых данных столбца в байтах, вычисляется как сумма total_compressed_size столбца из всех групп строк
  - `space_saved` — процент сэкономленного места за счет сжатия, вычисляется как (1 - total_compressed_size/total_uncompressed_size)
  - `encodings` — список кодировок, используемых для данного столбца
- `row_groups` — список метаданных групп строк со следующей структурой:
  - `num_columns` — количество столбцов в группе строк
  - `num_rows` — количество строк в группе строк
  - `total_uncompressed_size` — общий размер несжатых данных группы строк в байтах
  - `total_compressed_size` — общий размер сжатых данных группы строк в байтах
  - `columns` — список метаданных фрагментов столбцов со следующей структурой:
    - `name` — имя столбца
    - `path` — путь к столбцу
    - `total_compressed_size` — общий размер сжатых данных столбца в байтах
    - `total_uncompressed_size` — общий размер несжатых данных группы строк в байтах
    - `have_statistics` — логический флаг, указывающий, содержат ли метаданные фрагмента столбца статистику
    - `statistics` — статистика фрагмента столбца (все поля равны NULL, если have_statistics = false) со следующей структурой:
      - `num_values` — количество ненулевых значений в фрагменте столбца
      - `null_count` — количество значений NULL в фрагменте столбца
      - `distinct_count` — количество уникальных значений в фрагменте столбца
      - `min` — минимальное значение фрагмента столбца
      - `max` — максимальное значение фрагмента столбца


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
