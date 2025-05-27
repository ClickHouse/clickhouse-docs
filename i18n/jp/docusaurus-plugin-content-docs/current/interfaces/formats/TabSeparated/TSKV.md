---
'alias': []
'description': 'TSKVフォーマットのドキュメント'
'input_format': true
'keywords':
- 'TSKV'
'output_format': true
'slug': '/interfaces/formats/TSKV'
'title': 'TSKV'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[`TabSeparated`](./TabSeparated.md) フォーマットに似ていますが、`name=value` 形式で値を出力します。 
名前は [`TabSeparated`](./TabSeparated.md) フォーマットと同様にエスケープされ、`=` シンボルもエスケープされます。

```text
SearchPhrase=   count()=8267016
SearchPhrase=bathroom interior design    count()=2166
SearchPhrase=clickhouse     count()=1655
SearchPhrase=2014 spring fashion    count()=1549
SearchPhrase=freeform photos       count()=1480
SearchPhrase=angelina jolie    count()=1245
SearchPhrase=omsk       count()=1112
SearchPhrase=photos of dog breeds    count()=1091
SearchPhrase=curtain designs        count()=1064
SearchPhrase=baku       count()=1000
```


```sql title="クエリ"
SELECT * FROM t_null FORMAT TSKV
```

```text title="レスポンス"
x=1    y=\N
```

:::note
小さなカラムが多数ある場合、このフォーマットは効果的ではなく、一般的には使用する理由はありません。 
それでも、効率の面では [`JSONEachRow`](../JSON/JSONEachRow.md) フォーマットとあまり変わりません。
:::

パースには、異なるカラムの値の順序はサポートされています。 
一部の値が省略されることは許可されており、それらはデフォルト値と等しいと見なされます。
この場合、ゼロと空の行がデフォルト値として使用されます。 
テーブルに指定できる複雑な値はデフォルトとしてサポートされていません。

パースでは、`=` シンボルや値なしで追加のフィールド `tskv` を追加することができます。このフィールドは無視されます。

インポート時には、未知の名前のカラムはスキップされます。 
[`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合です。

[NULL](/sql-reference/syntax.md) は `\N` としてフォーマットされます。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}
