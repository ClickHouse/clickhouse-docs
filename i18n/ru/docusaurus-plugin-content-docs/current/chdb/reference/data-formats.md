---
title: 'Форматы данных'
sidebar_label: 'Форматы данных'
slug: /chdb/reference/data-formats
description: 'Форматы данных для chDB'
keywords: ['chdb', 'data formats']
doc_type: 'reference'
---

По части форматов данных chDB на 100% совместим по функциональности с ClickHouse.

Форматы ввода используются для разбора данных, передаваемых в `INSERT`, а также в `SELECT` из таблицы с файловым хранилищем, такой как `File`, `URL` или `S3`.
Форматы вывода используются для формирования результатов `SELECT` и для выполнения `INSERT` в таблицу с файловым хранилищем.
Помимо форматов данных, которые поддерживает ClickHouse, chDB также поддерживает:

- `ArrowTable` как формат вывода, тип — Python `pyarrow.Table`
- `DataFrame` как формат ввода и вывода, тип — Python `pandas.DataFrame`. Примеры см. в [`test_joindf.py`](https://github.com/chdb-io/chdb/blob/main/tests/test_joindf.py)
- `Debug` как формат вывода (как псевдоним `CSV`), но с включённым подробным отладочным выводом ClickHouse.

Поддерживаемые форматы данных из ClickHouse:

| Формат                                     | Ввод | Результат |
| ------------------------------------------ | ---- | --------- |
| TabSeparated                               | ✔    | ✔         |
| TabSeparatedRaw                            | ✔    | ✔         |
| TabSeparatedWithNames                      | ✔    | ✔         |
| TabSeparatedWithNamesAndTypes              | ✔    | ✔         |
| TabSeparatedRawWithNames                   | ✔    | ✔         |
| TabSeparatedRawWithNamesAndTypes           | ✔    | ✔         |
| Шаблон                                     | ✔    | ✔         |
| TemplateIgnoreSpaces                       | ✔    | ✗         |
| CSV                                        | ✔    | ✔         |
| CSVWithNames                               | ✔    | ✔         |
| CSVWithNamesAndTypes                       | ✔    | ✔         |
| CustomSeparated                            | ✔    | ✔         |
| CustomSeparatedWithNames                   | ✔    | ✔         |
| CustomSeparatedWithNamesAndTypes           | ✔    | ✔         |
| SQLInsert                                  | ✗    | ✔         |
| Значения                                   | ✔    | ✔         |
| Вертикаль                                  | ✗    | ✔         |
| JSON                                       | ✔    | ✔         |
| JSONAsString                               | ✔    | ✗         |
| JSONAsObject                               | ✔    | ✗         |
| JSONStrings                                | ✔    | ✔         |
| JSONColumns                                | ✔    | ✔         |
| JSONColumnsWithMetadata                    | ✔    | ✔         |
| JSONCompact                                | ✔    | ✔         |
| JSONCompactStrings                         | ✗    | ✔         |
| JSONCompactColumns                         | ✔    | ✔         |
| JSONEachRow                                | ✔    | ✔         |
| PrettyJSONEachRow                          | ✗    | ✔         |
| JSONEachRowWithProgress                    | ✗    | ✔         |
| JSONStringsEachRow                         | ✔    | ✔         |
| JSONStringsEachRowWithProgress             | ✗    | ✔         |
| JSONCompactEachRow                         | ✔    | ✔         |
| JSONCompactEachRowWithNames                | ✔    | ✔         |
| JSONCompactEachRowWithNamesAndTypes        | ✔    | ✔         |
| JSONCompactEachRowWithProgress             | ✗    | ✔         |
| JSONCompactStringsEachRow                  | ✔    | ✔         |
| JSONCompactStringsEachRowWithNames         | ✔    | ✔         |
| JSONCompactStringsEachRowWithNamesAndTypes | ✔    | ✔         |
| JSONCompactStringsEachRowWithProgress      | ✗    | ✔         |
| JSONObjectEachRow                          | ✔    | ✔         |
| BSONEachRow                                | ✔    | ✔         |
| TSKV                                       | ✔    | ✔         |
| Довольно                                   | ✗    | ✔         |
| PrettyNoEscapes                            | ✗    | ✔         |
| PrettyMonoBlock                            | ✗    | ✔         |
| PrettyNoEscapesMonoBlock                   | ✗    | ✔         |
| PrettyCompact                              | ✗    | ✔         |
| PrettyCompactNoEscapes                     | ✗    | ✔         |
| PrettyCompactMonoBlock                     | ✗    | ✔         |
| PrettyCompactNoEscapesMonoBlock            | ✗    | ✔         |
| PrettySpace                                | ✗    | ✔         |
| PrettySpaceNoEscapes                       | ✗    | ✔         |
| PrettySpaceMonoBlock                       | ✗    | ✔         |
| PrettySpaceNoEscapesMonoBlock              | ✗    | ✔         |
| Prometheus                                 | ✗    | ✔         |
| Protobuf                                   | ✔    | ✔         |
| ProtobufSingle                             | ✔    | ✔         |
| ProtobufList                               | ✔    | ✔         |
| Avro                                       | ✔    | ✔         |
| AvroConfluent                              | ✔    | ✗         |
| Parquet                                    | ✔    | ✔         |
| ParquetMetadata                            | ✔    | ✗         |
| Arrow                                      | ✔    | ✔         |
| ArrowStream                                | ✔    | ✔         |
| ORC                                        | ✔    | ✔         |
| Один                                       | ✔    | ✗         |
| Npy                                        | ✔    | ✔         |
| RowBinary                                  | ✔    | ✔         |
| RowBinaryWithNames                         | ✔    | ✔         |
| RowBinaryWithNamesAndTypes                 | ✔    | ✔         |
| RowBinaryWithDefaults                      | ✔    | ✗         |
| Нативный                                   | ✔    | ✔         |
| Null                                       | ✗    | ✔         |
| XML                                        | ✗    | ✔         |
| Cap’n Proto                                | ✔    | ✔         |
| LineAsString                               | ✔    | ✔         |
| Регулярные выражения                       | ✔    | ✗         |
| RawBLOB                                    | ✔    | ✔         |
| MsgPack                                    | ✔    | ✔         |
| MySQLDump                                  | ✔    | ✗         |
| DWARF                                      | ✔    | ✗         |
| Markdown                                   | ✗    | ✔         |
| Форма                                      | ✔    | ✗         |

Дополнительную информацию и примеры см. в разделе [Форматы ClickHouse для входных и выходных данных](/interfaces/formats).