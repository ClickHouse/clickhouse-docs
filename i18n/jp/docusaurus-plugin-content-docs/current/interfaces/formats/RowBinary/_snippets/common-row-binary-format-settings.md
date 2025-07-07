---
{}
---



<!-- Note: This snippet is reused in any file it is imported by -->

以下の設定は、すべての `RowBinary` タイプ形式に共通です。

| 設定                                                                                                                                              | 説明                                                                                                                                                                                                                                         | デフォルト |
|--------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| [`format_binary_max_string_size`](/operations/settings/settings-formats.md/#format_binary_max_string_size)                                           | RowBinary形式のStringに対して許可される最大サイズ。                                                                                                                                                                                          | `1GiB`   |
| [`output_format_binary_encode_types_in_binary_format`](/operations/settings/formats#input_format_binary_decode_types_in_binary_format) | [`RowBinaryWithNamesAndTypes`](../RowBinaryWithNamesAndTypes.md) 出力形式で、タイプ名の文字列の代わりに [`binary encoding`](/sql-reference/data-types/data-types-binary-encoding.md) を使用してヘッダーにタイプを記述できるようにします。  | `false`  |
| [`input_format_binary_decode_types_in_binary_format`](/operations/settings/formats#input_format_binary_decode_types_in_binary_format)   | [`RowBinaryWithNamesAndTypes`](../RowBinaryWithNamesAndTypes.md) 入力形式で、タイプ名の文字列の代わりに [`binary encoding`](/sql-reference/data-types/data-types-binary-encoding.md) を使用してヘッダーにタイプを読み込むことを許可します。    | `false`  |
| [`output_format_binary_write_json_as_string`](/operations/settings/settings-formats.md/#output_format_binary_write_json_as_string)                   | [`RowBinary`](../RowBinary.md) 出力形式で、[`JSON`](/sql-reference/data-types/newjson.md) データ型の値を `JSON` [String](/sql-reference/data-types/string.md) 値として書き込むことを許可します。                            | `false`  |
| [`input_format_binary_read_json_as_string`](/operations/settings/settings-formats.md/#input_format_binary_read_json_as_string)                       | [`RowBinary`](../RowBinary.md) 入力形式で、[`JSON`](/sql-reference/data-types/newjson.md) データ型の値を `JSON` [String](/sql-reference/data-types/string.md) 値として読み込むことを許可します。                              | `false`  |
