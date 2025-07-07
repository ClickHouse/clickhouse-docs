---
'alias': []
'description': 'Pretty format'
'input_format': false
'keywords':
- 'Pretty'
'output_format': true
'slug': '/interfaces/formats/Pretty'
'title': 'Pretty'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Input | Output  | Alias |
|-------|---------|-------|
| ✗     | ✔       |       |

## 説明 {#description}

`Pretty` フォーマットは、データを Unicode アートテーブルとして出力し、ターミナルで色を表示するために ANSI エスケープシーケンスを使用します。
テーブルの全体のグリッドが描画され、各行はターミナルで 2 行を占めます。
各結果ブロックは別々のテーブルとして出力されます。
これは、すべての値の可視幅を事前に計算するためにバッファリングなしでブロックを出力できるようにするために必要です（バッファリングが必要になります）。

[NULL](/sql-reference/syntax.md) は `ᴺᵁᴸᴸ` として出力されます。

## 使用例 {#example-usage}

例（[`PrettyCompact`](./PrettyCompact.md) フォーマットのために示されています）:

```sql title="クエリ"
SELECT * FROM t_null
```

```response title="応答"
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

行は `Pretty` フォーマットのいずれにおいてもエスケープされません。以下の例は[`PrettyCompact`](./PrettyCompact.md) フォーマットのために示されています：

```sql title="クエリ"
SELECT 'String with \'quotes\' and \t character' AS Escaping_test
```

```response title="応答"
┌─Escaping_test────────────────────────┐
│ String with 'quotes' and      character │
└──────────────────────────────────────┘
```

ターミナルにあまりにも多くのデータを出力しないように、最初の `10,000` 行のみが出力されます。
行数が `10,000` 以上の場合、メッセージ "Showed first 10 000" が出力されます。

:::note
このフォーマットは、クエリ結果の出力には適していますが、データの解析には適していません。
:::

Pretty フォーマットは、合計値（`WITH TOTALS` を使用する場合）や極値（`extremes` が 1 に設定されている場合）の出力をサポートしています。
これらの場合、合計値と極値は、主なデータの後に別々のテーブルで出力されます。
これは、[`PrettyCompact`](./PrettyCompact.md) フォーマットを使用した以下の例に示されています：

```sql title="クエリ"
SELECT EventDate, count() AS c 
FROM test.hits 
GROUP BY EventDate 
WITH TOTALS 
ORDER BY EventDate 
FORMAT PrettyCompact
```

```response title="応答"
┌──EventDate─┬───────c─┐
│ 2014-03-17 │ 1406958 │
│ 2014-03-18 │ 1383658 │
│ 2014-03-19 │ 1405797 │
│ 2014-03-20 │ 1353623 │
│ 2014-03-21 │ 1245779 │
│ 2014-03-22 │ 1031592 │
│ 2014-03-23 │ 1046491 │
└────────────┴─────────┘

合計:
┌──EventDate─┬───────c─┐
│ 1970-01-01 │ 8873898 │
└────────────┴─────────┘

極値:
┌──EventDate─┬───────c─┐
│ 2014-03-17 │ 1031592 │
│ 2014-03-23 │ 1406958 │
└────────────┴─────────┘
```

## フォーマット設定 {#format-settings}

<PrettyFormatSettings/>
