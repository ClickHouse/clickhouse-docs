---
title: TSKV
slug: /interfaces/formats/TSKV
keywords: [TSKV]
input_format: true
output_format: true
alias: []
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[`TabSeparated`](./TabSeparated.md) 形式に似ていますが、`name=value` 形式で値を出力します。 
名前は [`TabSeparated`](./TabSeparated.md) 形式と同様にエスケープされ、`=` 記号もエスケープされます。

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
小さなカラムが大量にある場合、この形式は無効で、一般的に使用する理由はありません。 
それにもかかわらず、効率の面では [`JSONEachRow`](../JSON/JSONEachRow.md) 形式と比べて劣ることはありません。
:::

解析では、異なるカラムの値の順序はサポートされています。 
一部の値が省略されるのは許容されており、デフォルト値と等しいものと見なされます。
この場合、ゼロと空の行がデフォルト値として使用されます。 
テーブルに指定できる複雑な値はデフォルトとしてはサポートされていません。

解析では、等号や値なしで追加のフィールド `tskv` を追加することが可能です。このフィールドは無視されます。

インポート時に未知の名前のカラムはスキップされます、 
設定 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合は。

[NULL](/sql-reference/syntax.md) は `\N` としてフォーマットされます。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}
