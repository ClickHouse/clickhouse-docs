---
alias: []
description: 'TSKVフォーマットのドキュメント'
input_format: true
keywords: ['TSKV']
output_format: true
slug: /interfaces/formats/TSKV
title: 'TSKV'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[`TabSeparated`](./TabSeparated.md)フォーマットと似ていますが、`name=value`形式で値を出力します。 
名前は[`TabSeparated`](./TabSeparated.md)フォーマットと同じ方法でエスケープされ、`=`記号もエスケープされます。

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
多数の小カラムがある場合、このフォーマットは効果的ではなく、一般的に使用する理由はありません。 
それでも、効率の観点からは、[`JSONEachRow`](../JSON/JSONEachRow.md)フォーマットと同程度です。
:::

解析では、異なるカラムの値の順序はサポートされています。 
一部の値はデフォルト値と等しいと見なされるため、省略が許可されています。 
この場合、ゼロと空行がデフォルト値として使用されます。 
テーブルで指定できる複雑な値はデフォルトとしてサポートされていません。

解析では、等号や値なしで追加のフィールド`tskv`を追加することが可能です。このフィールドは無視されます。

インポート時には、未知の名前のカラムはスキップされます。
[`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields)が`1`に設定されている場合です。

[NULL](/sql-reference/syntax.md)は`\N`としてフォーマットされます。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}
