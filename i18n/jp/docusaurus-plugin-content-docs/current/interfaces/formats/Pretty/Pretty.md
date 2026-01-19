---
alias: []
description: 'Pretty 形式に関するドキュメント'
input_format: false
keywords: ['Pretty']
output_format: true
slug: /interfaces/formats/Pretty
title: 'Pretty'
doc_type: 'リファレンス'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 入力 | 出力 | エイリアス |
| -- | -- | ----- |
| ✗  | ✔  |       |

## 説明 \{#description\}

`Pretty` フォーマットは、Unicode アートによるテーブルとしてデータを出力し、
ターミナルで色を表示するために ANSI エスケープシーケンスを使用します。
テーブルは完全なグリッドとして描画され、各行はターミナル上で 2 行分を占有します。
各結果ブロックは個別のテーブルとして出力されます。
これは、結果をバッファリングせずにブロックを出力できるようにするためです（すべての値の見た目上の幅を事前計算するにはバッファリングが必要になります）。

[NULL](/sql-reference/syntax.md) は `ᴺᵁᴸᴸ` として出力されます。

## 使用例 \{#example-usage\}

例（[`PrettyCompact`](./PrettyCompact.md) 形式の場合）：

```sql title="Query"
SELECT * FROM t_null
```

```response title="Response"
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

`Pretty` 系のいずれのフォーマットでも、行はエスケープされません。次の例は、[`PrettyCompact`](./PrettyCompact.md) フォーマットの場合を示しています。

```sql title="Query"
SELECT 'String with \'quotes\' and \t character' AS Escaping_test
```

```response title="Response"
┌─Escaping_test────────────────────────┐
│ String with 'quotes' and      character │
└──────────────────────────────────────┘
```

ターミナルへの過剰なデータ出力を避けるため、最初の `10,000` 行のみが表示されます。
行数が `10,000` 以上の場合は、メッセージ &quot;Showed first 10 000&quot; が出力されます。

:::note
このフォーマットはクエリ結果を出力する用途にのみ適しており、データのパースには適していません。
:::

Pretty フォーマットは、合計値（`WITH TOTALS` を使用する場合）および極値（&#39;extremes&#39; が 1 に設定されている場合）の出力をサポートします。
この場合、合計値と極値はメインデータの後に、別々のテーブルとして出力されます。
これは、[`PrettyCompact`](./PrettyCompact.md) フォーマットを使用した次の例で示されています。

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

## 書式設定 \{#format-settings\}

<PrettyFormatSettings/>
