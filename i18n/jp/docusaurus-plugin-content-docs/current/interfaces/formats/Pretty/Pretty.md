---
'alias': []
'description': 'PrettyフォーマットのDocumentation'
'input_format': false
'keywords':
- 'Pretty'
'output_format': true
'slug': '/interfaces/formats/Pretty'
'title': 'Pretty'
'doc_type': 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Input | Output  | Alias |
|-------|---------|-------|
| ✗     | ✔       |       |

## 説明 {#description}

`Pretty` フォーマットは、データをユニコードアートテーブルとして出力し、端末で色を表示するためにANSIエスケープシーケンスを使用します。テーブルの完全なグリッドが描画され、各行は端末で2行を占めます。各結果ブロックは、別々のテーブルとして出力されます。これは、バッファリングなしでブロックを出力できるようにするために必要です（すべての値の表示幅を事前に計算するためにはバッファリングが必要になります）。

[NULL](/sql-reference/syntax.md) は `ᴺᵁᴸᴸ` として出力されます。

## 使用例 {#example-usage}

例（[`PrettyCompact`](./PrettyCompact.md) フォーマットのために表示）：

```sql title="Query"
SELECT * FROM t_null
```

```response title="Response"
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

行は `Pretty` フォーマットのいずれにおいてもエスケープされません。以下の例は、[`PrettyCompact`](./PrettyCompact.md) フォーマットのために示されています：

```sql title="Query"
SELECT 'String with \'quotes\' and \t character' AS Escaping_test
```

```response title="Response"
┌─Escaping_test────────────────────────┐
│ String with 'quotes' and      character │
└──────────────────────────────────────┘
```

端末にデータをdumpしすぎないように、最初の `10,000` 行のみが印刷されます。行の数が `10,000` 以上の場合、「最初の 10 000 を表示しました」というメッセージが印刷されます。

:::note
このフォーマットは、クエリ結果を出力するためには適切ですが、データを解析するためには適していません。
:::

Prettyフォーマットは、合計値（`WITH TOTALS` を使用する場合）やエクストリーム（'extremes' が 1 に設定されている場合）を出力することをサポートしています。この場合、合計値とエクストリーム値は、メインデータの後に別々のテーブルとして出力されます。以下の例は、[`PrettyCompact`](./PrettyCompact.md) フォーマットを使用しています：

```sql title="Query"
SELECT EventDate, count() AS c 
FROM test.hits 
GROUP BY EventDate 
WITH TOTALS 
ORDER BY EventDate 
FORMAT PrettyCompact
```

```response title="Response"
┌──EventDate─┬───────c─┐
│ 2014-03-17 │ 1406958 │
│ 2014-03-18 │ 1383658 │
│ 2014-03-19 │ 1405797 │
│ 2014-03-20 │ 1353623 │
│ 2014-03-21 │ 1245779 │
│ 2014-03-22 │ 1031592 │
│ 2014-03-23 │ 1046491 │
└────────────┴─────────┘

Totals:
┌──EventDate─┬───────c─┐
│ 1970-01-01 │ 8873898 │
└────────────┴─────────┘

Extremes:
┌──EventDate─┬───────c─┐
│ 2014-03-17 │ 1031592 │
│ 2014-03-23 │ 1406958 │
└────────────┴─────────┘
```

## フォーマット設定 {#format-settings}

<PrettyFormatSettings/>
