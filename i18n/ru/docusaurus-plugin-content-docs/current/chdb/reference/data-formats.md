---
title: 'Форматы Данных'
sidebar_label: 'Форматы Данных'
slug: /chdb/reference/data-formats
description: 'Форматы Данных для chDB'
keywords: ['chdb', 'форматы данных']
---

Когда речь идет о форматах данных, chDB на 100% совместим с ClickHouse.

Форматы ввода используются для разбора данных, предоставляемых в `INSERT` и `SELECT` из таблиц с файловой привязкой, таких как `File`, `URL` или `S3`. Форматы вывода используются для упорядочивания результатов `SELECT` и выполнения `INSERT` в таблицы с файловой привязкой. В дополнение к форматам данных, которые поддерживает ClickHouse, chDB также поддерживает:

- `ArrowTable` в качестве формата вывода, тип — Python `pyarrow.Table`
- `DataFrame` в качестве формата ввода и вывода, тип — Python `pandas.DataFrame`. Для примеров см. [`test_joindf.py`](https://github.com/chdb-io/chdb/blob/main/tests/test_joindf.py)
- `Debug` в качестве вывода (как псевдоним для `CSV`), но с включенным подробным отладочным выводом от ClickHouse.

Поддерживаемые форматы данных от ClickHouse:

| Формат                          | Ввод | Вывод |
|---------------------------------|-------|--------|
| TabSeparated                    | ✔     | ✔      |
| TabSeparatedRaw                 | ✔     | ✔      |
| TabSeparatedWithNames           | ✔     | ✔      |
| TabSeparatedWithNamesAndTypes   | ✔     | ✔      |
| TabSeparatedRawWithNames        | ✔     | ✔      |
| TabSeparatedRawWithNamesAndTypes| ✔     | ✔      |
| Template                        | ✔     | ✔      |
| TemplateIgnoreSpaces            | ✔     | ✗      |
| CSV                             | ✔     | ✔      |
| CSVWithNames                    | ✔     | ✔      |
| CSVWithNamesAndTypes            | ✔     | ✔      |
| CustomSeparated                 | ✔     | ✔      |
| CustomSeparatedWithNames        | ✔     | ✔      |
| CustomSeparatedWithNamesAndTypes| ✔     | ✔      |
| SQLInsert                       | ✗     | ✔      |
| Values                          | ✔     | ✔      |
| Vertical                        | ✗     | ✔      |
| JSON                            | ✔     | ✔      |
| JSONAsString                    | ✔     | ✗      |
| JSONStrings                     | ✔     | ✔      |
| JSONColumns                     | ✔     | ✔      |
| JSONColumnsWithMetadata         | ✔     | ✔      |
| JSONCompact                     | ✔     | ✔      |
| JSONCompactStrings              | ✗     | ✔      |
| JSONCompactColumns              | ✔     | ✔      |
| JSONEachRow                     | ✔     | ✔      |
| PrettyJSONEachRow               | ✗     | ✔      |
| JSONEachRowWithProgress         | ✗     | ✔      |
| JSONStringsEachRow              | ✔     | ✔      |
| JSONStringsEachRowWithProgress  | ✗     | ✔      |
| JSONCompactEachRow              | ✔     | ✔      |
| JSONCompactEachRowWithNames     | ✔     | ✔      |
| JSONCompactEachRowWithNamesAndTypes | ✔  | ✔      |
| JSONCompactStringsEachRow       | ✔     | ✔      |
| JSONCompactStringsEachRowWithNames | ✔  | ✔      |
| JSONCompactStringsEachRowWithNamesAndTypes | ✔ | ✔ |
| JSONObjectEachRow               | ✔     | ✔      |
| BSONEachRow                     | ✔     | ✔      |
| TSKV                            | ✔     | ✔      |
| Pretty                          | ✗     | ✔      |
| PrettyNoEscapes                 | ✗     | ✔      |
| PrettyMonoBlock                 | ✗     | ✔      |
| PrettyNoEscapesMonoBlock        | ✗     | ✔      |
| PrettyCompact                   | ✗     | ✔      |
| PrettyCompactNoEscapes          | ✗     | ✔      |
| PrettyCompactMonoBlock          | ✗     | ✔      |
| PrettyCompactNoEscapesMonoBlock | ✗     | ✔      |
| PrettySpace                     | ✗     | ✔      |
| PrettySpaceNoEscapes            | ✗     | ✔      |
| PrettySpaceMonoBlock            | ✗     | ✔      |
| PrettySpaceNoEscapesMonoBlock   | ✗     | ✔      |
| Prometheus                      | ✗     | ✔      |
| Protobuf                        | ✔     | ✔      |
| ProtobufSingle                  | ✔     | ✔      |
| Avro                            | ✔     | ✔      |
| AvroConfluent                   | ✔     | ✗      |
| Parquet                         | ✔     | ✔      |
| ParquetMetadata                 | ✔     | ✗      |
| Arrow                           | ✔     | ✔      |
| ArrowStream                     | ✔     | ✔      |
| ORC                             | ✔     | ✔      |
| One                             | ✔     | ✗      |
| RowBinary                       | ✔     | ✔      |
| RowBinaryWithNames              | ✔     | ✔      |
| RowBinaryWithNamesAndTypes      | ✔     | ✔      |
| RowBinaryWithDefaults           | ✔     | ✔      |
| Native                          | ✔     | ✔      |
| Null                            | ✗     | ✔      |
| XML                             | ✗     | ✔      |
| CapnProto                       | ✔     | ✔      |
| LineAsString                    | ✔     | ✔      |
| Regexp                          | ✔     | ✗      |
| RawBLOB                         | ✔     | ✔      |
| MsgPack                         | ✔     | ✔      |
| MySQLDump                       | ✔     | ✗      |
| Markdown                        | ✗     | ✔      |

Для получения дополнительной информации и примеров смотрите [ClickHouse форматы для ввода и вывода данных](/interfaces/formats).
