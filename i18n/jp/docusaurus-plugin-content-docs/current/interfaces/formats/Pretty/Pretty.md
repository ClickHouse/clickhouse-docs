---
title: Pretty
slug: /interfaces/formats/Pretty
keywords: [Pretty]
input_format: false
output_format: true
alias: []
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 入力 | 出力  | エイリアス |
|-------|---------|-------|
| ✗     | ✔       |       |

## 説明 {#description}

`Pretty` フォーマットはデータを Unicode アートテーブルとして出力し、ターミナルでの色の表示のために ANSI エスケープシーケンスを使用します。テーブルの完全なグリッドが描画され、各行はターミナルで2行を占めます。各結果ブロックは別々のテーブルとして出力されます。これは、すべての値の表示幅を事前に計算するためにはバッファリングが必要であるため、ブロックをバッファリングなしで出力できるようにするために必要です。

[NULL](/sql-reference/syntax.md) は `ᴺᵁᴸᴸ` として出力されます。

## 使用例 {#example-usage}

例（[`PrettyCompact`](./PrettyCompact.md) フォーマット用に表示）:

```sql title="クエリ"
SELECT * FROM t_null
```

```response title="応答"
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

行は `Pretty` フォーマットのいずれにおいてもエスケープされません。次の例は [`PrettyCompact`](./PrettyCompact.md) フォーマットのために示されています:

```sql title="クエリ"
SELECT 'String with \'quotes\' and \t character' AS Escaping_test
```

```response title="応答"
┌─Escaping_test────────────────────────┐
│ String with 'quotes' and      character │
└──────────────────────────────────────┘
```

ターミナルに過剰なデータが出力されるのを避けるため、最初の `10,000` 行のみが印刷されます。行数が `10,000` 以上の場合、「最初の 10 000 を表示しました」というメッセージが印刷されます。

:::note
このフォーマットはクエリ結果を出力するのにのみ適しており、データの解析には適していません。
:::

Pretty フォーマットは、合計値を出力すること（`WITH TOTALS` 使用時）や、極値を出力すること（'extremes' が 1 に設定されている場合）をサポートします。この場合、合計値と極値は、メインデータの後に別々のテーブルとして出力されます。これは、以下の例で [`PrettyCompact`](./PrettyCompact.md) フォーマットを使用して示されています:

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
