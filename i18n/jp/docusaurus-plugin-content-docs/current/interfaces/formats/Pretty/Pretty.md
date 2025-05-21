---
alias: []
description: 'Prettyフォーマットのドキュメント'
input_format: false
keywords: ['Pretty']
output_format: true
slug: /interfaces/formats/Pretty
title: 'Pretty'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 入力 | 出力  | エイリアス |
|-------|---------|-------|
| ✗     | ✔       |       |

## 説明 {#description}

`Pretty`フォーマットは、データをUnicodeアートのテーブルとして出力します。
ANSIエスケープシーケンスを使用して、ターミナルで色を表示します。
テーブルの完全なグリッドが描画され、各行はターミナル内で2行を占めます。
各結果ブロックは別々のテーブルとして出力されます。
これは、ブロックをバッファリングせずに出力できるようにするために必要です（すべての値の可視幅を事前に計算するにはバッファリングが必要です）。

[NULL](/sql-reference/syntax.md)は`ᴺᵁᴸᴸ`として出力されます。

## 使用例 {#example-usage}

例（[`PrettyCompact`](./PrettyCompact.md)フォーマットのために示されています）:

```sql title="クエリ"
SELECT * FROM t_null
```

```response title="レスポンス"
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

行はどの`Pretty`フォーマットでもエスケープされません。次の例は[`PrettyCompact`](./PrettyCompact.md)フォーマットのために示されています。

```sql title="クエリ"
SELECT 'String with \'quotes\' and \t character' AS Escaping_test
```

```response title="レスポンス"
┌─Escaping_test────────────────────────┐
│ String with 'quotes' and      character │
└──────────────────────────────────────┘
```

ターミナルに過剰なデータをダンプしないように、最初の`10,000`行のみが印刷されます。
行数が`10,000`以上の場合、「最初の 10,000 を表示しました」のメッセージが印刷されます。

:::note
このフォーマットは、クエリ結果を出力するのには適していますが、データを解析するのには適していません。
:::

`Pretty`フォーマットは、（`WITH TOTALS`を使用する場合）合計値や、'extremes'が1に設定されている場合の極端値を出力することをサポートしています。
これらの場合、合計値と極端値はメインデータの後に、別々のテーブルで出力されます。
次の例は[`PrettyCompact`](./PrettyCompact.md)フォーマットを使用しています。

```sql title="クエリ"
SELECT EventDate, count() AS c 
FROM test.hits 
GROUP BY EventDate 
WITH TOTALS 
ORDER BY EventDate 
FORMAT PrettyCompact
```

```response title="レスポンス"
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

極端値:
┌──EventDate─┬───────c─┐
│ 2014-03-17 │ 1031592 │
│ 2014-03-23 │ 1406958 │
└────────────┴─────────┘
```

## フォーマット設定 {#format-settings}

<PrettyFormatSettings/>
