---
title: 'Форматы данных'
sidebar_label: 'Форматы данных'
slug: /chdb/reference/data-formats
description: 'Форматы данных для chDB'
keywords: ['chdb', 'data formats']
doc_type: 'reference'
---

В отношении форматов данных chDB на 100% совместим по функциональности с ClickHouse.

Входные форматы используются для разбора данных, передаваемых в `INSERT`, а также для `SELECT` из таблиц с файловым хранилищем, таких как `File`, `URL` или `S3`.
Выходные форматы используются для формирования результатов `SELECT` и для выполнения `INSERT` в таблицы с файловым хранилищем.
Помимо форматов данных, поддерживаемых ClickHouse, chDB также поддерживает:

- `ArrowTable` как выходной формат, тип — Python `pyarrow.Table`
- `DataFrame` как входной и выходной формат, тип — Python `pandas.DataFrame`. Примеры см. в [`test_joindf.py`](https://github.com/chdb-io/chdb/blob/main/tests/test_joindf.py)
- `Debug` как выходной формат (как псевдоним `CSV`), но с включённым подробным отладочным выводом ClickHouse.

Поддерживаемые форматы данных из ClickHouse:

| Формат                                     | Входные данные | Результат |
| ------------------------------------------ | -------------- | --------- |
| TabSeparated                               | ✔              | ✔         |
| TabSeparatedRaw                            | ✔              | ✔         |
| TabSeparatedWithNames                      | ✔              | ✔         |
| TabSeparatedWithNamesAndTypes              | ✔              | ✔         |
| TabSeparatedRawWithNames                   | ✔              | ✔         |
| TabSeparatedRawWithNamesAndTypes           | ✔              | ✔         |
| Шаблон                                     | ✔              | ✔         |
| TemplateIgnoreSpaces                       | ✔              | ✗         |
| CSV                                        | ✔              | ✔         |
| CSVWithNames                               | ✔              | ✔         |
| CSVWithNamesAndTypes                       | ✔              | ✔         |
| CustomSeparated                            | ✔              | ✔         |
| CustomSeparatedWithNames                   | ✔              | ✔         |
| CustomSeparatedWithNamesAndTypes           | ✔              | ✔         |
| SQLInsert                                  | ✗              | ✔         |
| Значения                                   | ✔              | ✔         |
| Вертикаль                                  | ✗              | ✔         |
| JSON                                       | ✔              | ✔         |
| JSONAsString                               | ✔              | ✗         |
| JSONAsObject                               | ✔              | ✗         |
| JSONStrings                                | ✔              | ✔         |
| JSONColumns                                | ✔              | ✔         |
| JSONColumnsWithMetadata                    | ✔              | ✔         |
| JSONCompact                                | ✔              | ✔         |
| JSONCompactStrings                         | ✗              | ✔         |
| JSONCompactColumns                         | ✔              | ✔         |
| JSONEachRow                                | ✔              | ✔         |
| PrettyJSONEachRow                          | ✗              | ✔         |
| JSONEachRowWithProgress                    | ✗              | ✔         |
| JSONStringsEachRow                         | ✔              | ✔         |
| JSONStringsEachRowWithProgress             | ✗              | ✔         |
| JSONCompactEachRow                         | ✔              | ✔         |
| JSONCompactEachRowWithNames                | ✔              | ✔         |
| JSONCompactEachRowWithNamesAndTypes        | ✔              | ✔         |
| JSONCompactEachRowWithProgress             | ✗              | ✔         |
| JSONCompactStringsEachRow                  | ✔              | ✔         |
| JSONCompactStringsEachRowWithNames         | ✔              | ✔         |
| JSONCompactStringsEachRowWithNamesAndTypes | ✔              | ✔         |
| JSONCompactStringsEachRowWithProgress      | ✗              | ✔         |
| JSONObjectEachRow                          | ✔              | ✔         |
| BSONEachRow                                | ✔              | ✔         |
| TSKV                                       | ✔              | ✔         |
| Pretty                                     | ✗              | ✔         |
| PrettyNoEscapes                            | ✗              | ✔         |
| PrettyMonoBlock                            | ✗              | ✔         |
| PrettyNoEscapesMonoBlock                   | ✗              | ✔         |
| PrettyCompact                              | ✗              | ✔         |
| PrettyCompactNoEscapes                     | ✗              | ✔         |
| PrettyCompactMonoBlock                     | ✗              | ✔         |
| PrettyCompactNoEscapesMonoBlock            | ✗              | ✔         |
| PrettySpace                                | ✗              | ✔         |
| PrettySpaceNoEscapes                       | ✗              | ✔         |
| PrettySpaceMonoBlock                       | ✗              | ✔         |
| PrettySpaceNoEscapesMonoBlock              | ✗              | ✔         |
| Prometheus                                 | ✗              | ✔         |
| Protobuf                                   | ✔              | ✔         |
| ProtobufSingle                             | ✔              | ✔         |
| ProtobufList                               | ✔              | ✔         |
| Avro                                       | ✔              | ✔         |
| AvroConfluent                              | ✔              | ✗         |
| Parquet                                    | ✔              | ✔         |
| ParquetMetadata                            | ✔              | ✗         |
| Arrow                                      | ✔              | ✔         |
| ArrowStream                                | ✔              | ✔         |
| ORC                                        | ✔              | ✔         |
| Один                                       | ✔              | ✗         |
| Npy                                        | ✔              | ✔         |
| RowBinary                                  | ✔              | ✔         |
| RowBinaryWithNames                         | ✔              | ✔         |
| RowBinaryWithNamesAndTypes                 | ✔              | ✔         |
| RowBinaryWithDefaults                      | ✔              | ✗         |
| Нативный                                   | ✔              | ✔         |
| Null                                       | ✗              | ✔         |
| XML                                        | ✗              | ✔         |
| CapnProto                                  | ✔              | ✔         |
| LineAsString                               | ✔              | ✔         |
| Регулярные выражения                       | ✔              | ✗         |
| RawBLOB                                    | ✔              | ✔         |
| MsgPack                                    | ✔              | ✔         |
| MySQLDump                                  | ✔              | ✗         |
| DWARF                                      | ✔              | ✗         |
| Markdown                                   | ✗              | ✔         |
| Форма                                      | ✔              | ✗         |

Дополнительную информацию и примеры см. в разделе [Форматы данных ClickHouse для ввода и вывода](/interfaces/formats).