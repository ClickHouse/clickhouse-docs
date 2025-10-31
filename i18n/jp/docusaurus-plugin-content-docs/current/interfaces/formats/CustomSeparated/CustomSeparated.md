---
'alias': []
'description': 'CustomSeparated フォーマットのドキュメント'
'input_format': true
'keywords':
- 'CustomSeparated'
'output_format': true
'slug': '/interfaces/formats/CustomSeparated'
'title': 'CustomSeparated'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[Template](../Template/Template.md)に似ていますが、すべてのカラムの名前とタイプを印刷または読み取り、[format_custom_escaping_rule](../../../operations/settings/settings-formats.md/#format_custom_escaping_rule)設定のエスケープルールと次の設定からの区切り文字を使用します。

- [format_custom_field_delimiter](/operations/settings/settings-formats.md/#format_custom_field_delimiter)
- [format_custom_row_before_delimiter](/operations/settings/settings-formats.md/#format_custom_row_before_delimiter)
- [format_custom_row_after_delimiter](/operations/settings/settings-formats.md/#format_custom_row_after_delimiter)
- [format_custom_row_between_delimiter](/operations/settings/settings-formats.md/#format_custom_row_between_delimiter)
- [format_custom_result_before_delimiter](/operations/settings/settings-formats.md/#format_custom_result_before_delimiter)
- [format_custom_result_after_delimiter](/operations/settings/settings-formats.md/#format_custom_result_after_delimiter)

:::note
フォーマット文字列からのエスケープルール設定および区切り文字は使用しません。
:::

[`CustomSeparatedIgnoreSpaces`](../CustomSeparated/CustomSeparatedIgnoreSpaces.md)フォーマットもあり、これは[TemplateIgnoreSpaces](../Template//TemplateIgnoreSpaces.md)に似ています。

## 使用例 {#example-usage}

### データの挿入 {#inserting-data}

次のtxtファイルを使用します。`football.txt`という名前です：

```text
row('2022-04-30';2021;'Sutton United';'Bradford City';1;4),row('2022-04-30';2021;'Swindon Town';'Barrow';2;1),row('2022-04-30';2021;'Tranmere Rovers';'Oldham Athletic';2;0),row('2022-05-02';2021;'Salford City';'Mansfield Town';2;2),row('2022-05-02';2021;'Port Vale';'Newport County';1;2),row('2022-05-07';2021;'Barrow';'Northampton Town';1;3),row('2022-05-07';2021;'Bradford City';'Carlisle United';2;0),row('2022-05-07';2021;'Bristol Rovers';'Scunthorpe United';7;0),row('2022-05-07';2021;'Exeter City';'Port Vale';0;1),row('2022-05-07';2021;'Harrogate Town A.F.C.';'Sutton United';0;2),row('2022-05-07';2021;'Hartlepool United';'Colchester United';0;2),row('2022-05-07';2021;'Leyton Orient';'Tranmere Rovers';0;1),row('2022-05-07';2021;'Mansfield Town';'Forest Green Rovers';2;2),row('2022-05-07';2021;'Newport County';'Rochdale';0;2),row('2022-05-07';2021;'Oldham Athletic';'Crawley Town';3;3),row('2022-05-07';2021;'Stevenage Borough';'Salford City';4;2),row('2022-05-07';2021;'Walsall';'Swindon Town';0;3)
```

カスタム区切り文字設定を構成します：

```sql
SET format_custom_row_before_delimiter = 'row(';
SET format_custom_row_after_delimiter = ')';
SET format_custom_field_delimiter = ';';
SET format_custom_row_between_delimiter = ',';
SET format_custom_escaping_rule = 'Quoted';
```

データを挿入します：

```sql
INSERT INTO football FROM INFILE 'football.txt' FORMAT CustomSeparated;
```

### データの読み取り {#reading-data}

カスタム区切り文字設定を構成します：

```sql
SET format_custom_row_before_delimiter = 'row(';
SET format_custom_row_after_delimiter = ')';
SET format_custom_field_delimiter = ';';
SET format_custom_row_between_delimiter = ',';
SET format_custom_escaping_rule = 'Quoted';
```

`CustomSeparated`フォーマットを使用してデータを読み取ります：

```sql
SELECT *
FROM football
FORMAT CustomSeparated
```

出力は設定されたカスタムフォーマットになります：

```text
row('2022-04-30';2021;'Sutton United';'Bradford City';1;4),row('2022-04-30';2021;'Swindon Town';'Barrow';2;1),row('2022-04-30';2021;'Tranmere Rovers';'Oldham Athletic';2;0),row('2022-05-02';2021;'Port Vale';'Newport County';1;2),row('2022-05-02';2021;'Salford City';'Mansfield Town';2;2),row('2022-05-07';2021;'Barrow';'Northampton Town';1;3),row('2022-05-07';2021;'Bradford City';'Carlisle United';2;0),row('2022-05-07';2021;'Bristol Rovers';'Scunthorpe United';7;0),row('2022-05-07';2021;'Exeter City';'Port Vale';0;1),row('2022-05-07';2021;'Harrogate Town A.F.C.';'Sutton United';0;2),row('2022-05-07';2021;'Hartlepool United';'Colchester United';0;2),row('2022-05-07';2021;'Leyton Orient';'Tranmere Rovers';0;1),row('2022-05-07';2021;'Mansfield Town';'Forest Green Rovers';2;2),row('2022-05-07';2021;'Newport County';'Rochdale';0;2),row('2022-05-07';2021;'Oldham Athletic';'Crawley Town';3;3),row('2022-05-07';2021;'Stevenage Borough';'Salford City';4;2),row('2022-05-07';2021;'Walsall';'Swindon Town';0;3)
```

## フォーマット設定 {#format-settings}

追加設定：

| 設定                                                                                                                                                               | 説明                                                                                                                      | デフォルト |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------|-----------|
| [input_format_custom_detect_header](../../../operations/settings/settings-formats.md/#input_format_custom_detect_header)                                             | もしあれば、名前とタイプのヘッダーを自動検出することを有効にします。                                                          | `true`    |
| [input_format_custom_skip_trailing_empty_lines](../../../operations/settings/settings-formats.md/#input_format_custom_skip_trailing_empty_lines)                    | ファイルの末尾の空の行をスキップします。                                                                                            | `false`   |
| [input_format_custom_allow_variable_number_of_columns](../../../operations/settings/settings-formats.md/#input_format_custom_allow_variable_number_of_columns)      | CustomSeparatedフォーマットで可変数のカラムを許可し、余分なカラムを無視して、欠落しているカラムに対してデフォルト値を使用します。                                         | `false`   |
