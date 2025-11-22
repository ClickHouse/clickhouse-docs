---
alias: []
description: 'Pretty フォーマットのドキュメント'
input_format: false
keywords: ['Pretty']
output_format: true
slug: /interfaces/formats/Pretty
title: 'Pretty'
doc_type: 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 入力 | 出力 | 別名 |
| -- | -- | -- |
| ✗  | ✔  |    |


## 説明 {#description}

`Pretty`フォーマットは、データをUnicodeアートテーブルとして出力し、
ターミナルで色を表示するためにANSIエスケープシーケンスを使用します。
テーブルの完全なグリッドが描画され、各行はターミナル内で2行を占めます。
各結果ブロックは個別のテーブルとして出力されます。
これは、結果をバッファリングせずにブロックを出力できるようにするために必要です(すべての値の表示幅を事前計算するにはバッファリングが必要になります)。

[NULL](/sql-reference/syntax.md)は`ᴺᵁᴸᴸ`として出力されます。


## 使用例 {#example-usage}

例（[`PrettyCompact`](./PrettyCompact.md)フォーマットで表示）：

```sql title="クエリ"
SELECT * FROM t_null
```

```response title="レスポンス"
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

`Pretty`フォーマットでは、行はエスケープされません。以下の例は[`PrettyCompact`](./PrettyCompact.md)フォーマットで表示されています：

```sql title="クエリ"
SELECT 'String with \'quotes\' and \t character' AS Escaping_test
```

```response title="レスポンス"
┌─Escaping_test────────────────────────┐
│ String with 'quotes' and      character │
└──────────────────────────────────────┘
```

ターミナルに大量のデータが出力されるのを避けるため、最初の`10,000`行のみが表示されます。
行数が`10,000`以上の場合、「Showed first 10 000」というメッセージが表示されます。

:::note
このフォーマットはクエリ結果の出力にのみ適しており、データの解析には適していません。
:::

Prettyフォーマットは、合計値（`WITH TOTALS`使用時）と極値（'extremes'が1に設定されている場合）の出力をサポートしています。
これらの場合、合計値と極値はメインデータの後に別のテーブルとして出力されます。
以下の例は[`PrettyCompact`](./PrettyCompact.md)フォーマットを使用しています：

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

合計：
┌──EventDate─┬───────c─┐
│ 1970-01-01 │ 8873898 │
└────────────┴─────────┘

極値：
┌──EventDate─┬───────c─┐
│ 2014-03-17 │ 1031592 │
│ 2014-03-23 │ 1406958 │
└────────────┴─────────┘
```


## フォーマット設定 {#format-settings}

<PrettyFormatSettings />
