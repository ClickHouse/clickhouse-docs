---
title : TSKV
slug: /interfaces/formats/TSKV
keywords : [TSKV]
input_format: true
output_format: true
alias: []
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[`TabSeparated`](./TabSeparated.md)フォーマットに似ていますが、値を`name=value`形式で出力します。 
名前は[`TabSeparated`](./TabSeparated.md)フォーマットと同様にエスケープされ、`=`記号もエスケープされます。

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
小さなカラムが多数ある場合、このフォーマットは効果的ではなく、一般的に使用する理由はありません。 
それにもかかわらず、効率性に関しては、[`JSONEachRow`](../JSON/JSONEachRow.md)フォーマットと同等です。
:::

パースでは、異なるカラムの値の順序は任意です。 
一部の値が省略されても問題ありません。これは、デフォルト値と同じと見なされます。
この場合、ゼロと空の行がデフォルト値として使用されます。 
テーブルに指定可能な複雑な値はデフォルトとしてサポートされていません。

パースでは、`=`記号や値なしで追加フィールド`tskv`を追加できます。このフィールドは無視されます。

インポート中に、未知の名前のカラムはスキップされます。 
これは、[`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields)を`1`に設定した場合です。

[NULL](/sql-reference/syntax.md)は`\N`としてフォーマットされます。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}
