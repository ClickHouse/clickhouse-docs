---
title: Data Formats
sidebar_label: Data Formats
slug: /en/chdb/data-formats
description: Data Formats for chDB
keywords: [chdb, data formats]
---

When it comes to data formats, chDB is 100% feature compatible with ClickHouse.

Input formats are used to parse the data provided to `INSERT` and `SELECT` from a file-backed table such as `File`, `URL` or `S3`.
Output formats are used to arrange the results of a `SELECT`, and to perform `INSERT`s into a file-backed table.
As well as the data formats that ClickHouse supports, chDB also supports:

- `ArrowTable` as an output format, the type is Python `pyarrow.Table`
- `DataFrame` as an input and output format, the type is Python `pandas.DataFrame`. For examples, see [test_joindf.py](https://github.com/chdb-io/chdb/blob/main/tests/test_joindf.py)
- `Debug` as ab output (as an alias of `CSV`), but with enabled debug verbose output from ClickHouse.

The supported data formats from ClickHouse are:

<!-- DO NOT REMOVE THE LINES BELOW - used to generate table of data formats -->
<!-- DATA FORMATS TABLE BEGIN -->
| Name | Input | Output |
| --- | --- | --- |
| Arrow | ✔ | ✔ |
| ArrowStream | ✔ | ✔ |
| Avro | ✔ | ✔ |
| AvroConfluent | ✔ | ✗ |
| BSONEachRow | ✔ | ✔ |
| CSV | ✔ | ✔ |
| CSVWithNames | ✔ | ✔ |
| CSVWithNamesAndTypes | ✔ | ✔ |
| CapnProto | ✔ | ✔ |
| CustomSeparated | ✔ | ✔ |
| CustomSeparatedIgnoreSpaces | ✔ | ✗ |
| CustomSeparatedIgnoreSpacesWithNames | ✔ | ✗ |
| CustomSeparatedIgnoreSpacesWithNamesAndTypes | ✔ | ✗ |
| CustomSeparatedWithNames | ✔ | ✔ |
| CustomSeparatedWithNamesAndTypes | ✔ | ✔ |
| DWARF | ✔ | ✗ |
| Form | ✔ | ✗ |
| HiveText | ✔ | ✗ |
| JSON | ✔ | ✔ |
| JSONAsObject | ✔ | ✗ |
| JSONAsString | ✔ | ✗ |
| JSONColumns | ✔ | ✔ |
| JSONColumnsWithMetadata | ✔ | ✔ |
| JSONCompact | ✔ | ✔ |
| JSONCompactColumns | ✔ | ✔ |
| JSONCompactEachRow | ✔ | ✔ |
| JSONCompactEachRowWithNames | ✔ | ✔ |
| JSONCompactEachRowWithNamesAndTypes | ✔ | ✔ |
| JSONCompactStrings | ✗ | ✔ |
| JSONCompactStringsEachRow | ✔ | ✔ |
| JSONCompactStringsEachRowWithNames | ✔ | ✔ |
| JSONCompactStringsEachRowWithNamesAndTypes | ✔ | ✔ |
| JSONEachRow | ✔ | ✔ |
| JSONEachRowWithProgress | ✗ | ✔ |
| JSONLines | ✔ | ✔ |
| JSONObjectEachRow | ✔ | ✔ |
| JSONStrings | ✗ | ✔ |
| JSONStringsEachRow | ✔ | ✔ |
| JSONStringsEachRowWithProgress | ✗ | ✔ |
| LineAsString | ✔ | ✔ |
| LineAsStringWithNames | ✗ | ✔ |
| LineAsStringWithNamesAndTypes | ✗ | ✔ |
| Markdown | ✗ | ✔ |
| MsgPack | ✔ | ✔ |
| MySQLDump | ✔ | ✗ |
| MySQLWire | ✗ | ✔ |
| NDJSON | ✔ | ✔ |
| Native | ✔ | ✔ |
| Npy | ✔ | ✔ |
| Null | ✗ | ✔ |
| ODBCDriver2 | ✗ | ✔ |
| ORC | ✔ | ✔ |
| One | ✔ | ✗ |
| Parquet | ✔ | ✔ |
| ParquetMetadata | ✔ | ✗ |
| PostgreSQLWire | ✗ | ✔ |
| Pretty | ✗ | ✔ |
| PrettyCompact | ✗ | ✔ |
| PrettyCompactMonoBlock | ✗ | ✔ |
| PrettyCompactNoEscapes | ✗ | ✔ |
| PrettyCompactNoEscapesMonoBlock | ✗ | ✔ |
| PrettyJSONEachRow | ✗ | ✔ |
| PrettyJSONLines | ✗ | ✔ |
| PrettyMonoBlock | ✗ | ✔ |
| PrettyNDJSON | ✗ | ✔ |
| PrettyNoEscapes | ✗ | ✔ |
| PrettyNoEscapesMonoBlock | ✗ | ✔ |
| PrettySpace | ✗ | ✔ |
| PrettySpaceMonoBlock | ✗ | ✔ |
| PrettySpaceNoEscapes | ✗ | ✔ |
| PrettySpaceNoEscapesMonoBlock | ✗ | ✔ |
| Prometheus | ✗ | ✔ |
| Protobuf | ✔ | ✔ |
| ProtobufList | ✔ | ✔ |
| ProtobufSingle | ✔ | ✔ |
| Raw | ✔ | ✔ |
| RawBLOB | ✔ | ✔ |
| RawWithNames | ✔ | ✔ |
| RawWithNamesAndTypes | ✔ | ✔ |
| Regexp | ✔ | ✗ |
| RowBinary | ✔ | ✔ |
| RowBinaryWithDefaults | ✔ | ✗ |
| RowBinaryWithNames | ✔ | ✔ |
| RowBinaryWithNamesAndTypes | ✔ | ✔ |
| SQLInsert | ✗ | ✔ |
| TSKV | ✔ | ✔ |
| TSV | ✔ | ✔ |
| TSVRaw | ✔ | ✔ |
| TSVRawWithNames | ✔ | ✔ |
| TSVRawWithNamesAndTypes | ✔ | ✔ |
| TSVWithNames | ✔ | ✔ |
| TSVWithNamesAndTypes | ✔ | ✔ |
| TabSeparated | ✔ | ✔ |
| TabSeparatedRaw | ✔ | ✔ |
| TabSeparatedRawWithNames | ✔ | ✔ |
| TabSeparatedRawWithNamesAndTypes | ✔ | ✔ |
| TabSeparatedWithNames | ✔ | ✔ |
| TabSeparatedWithNamesAndTypes | ✔ | ✔ |
| Template | ✔ | ✔ |
| TemplateIgnoreSpaces | ✔ | ✗ |
| Values | ✔ | ✔ |
| Vertical | ✗ | ✔ |
| XML | ✗ | ✔ |
<!-- DATA FORMATS TABLE END -->

For further information and examples, see [ClickHouse formats for input and output data](/docs/en/interfaces/formats).