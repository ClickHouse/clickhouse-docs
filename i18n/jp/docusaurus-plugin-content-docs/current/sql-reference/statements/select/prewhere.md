---
slug: '/sql-reference/statements/select/prewhere'
sidebar_label: 'PREWHERE'
keywords: ['PREWHERE', 'ClickHouse', 'SQL', '句, クエリ']
description: 'ClickHouseのPREWHERE句についての詳細な説明と使用例。'
---


# PREWHERE 句

Prewhereはフィルタリングをより効率的に適用するための最適化です。`PREWHERE`句が明示的に指定されていなくても、デフォルトで有効になっています。これは、[WHERE](../../../sql-reference/statements/select/where.md)条件の一部を自動的にprewhereステージに移動させることによって機能します。`PREWHERE`句の役割は、デフォルトで発生する方法よりも効果的に制御すると考える場合に、この最適化を制御することです。

Prewhere最適化を使用すると、最初にprewhere式を実行するために必要なカラムだけが読み取られます。その後、クエリの残りの部分を実行するために必要な他のカラムが読み取られますが、prewhere式が少なくともいくつかの行に対して`true`であるブロックのみが対象となります。prewhere式がすべての行に対して`false`であるブロックが多数ある場合と、prewhereがクエリの他の部分に比べて必要なカラムが少ない場合、ディスクから読み取るデータ量が大幅に少なくなることがあります。

## Prewhereの手動制御 {#controlling-prewhere-manually}

この句は`WHERE`句と同じ意味を持ちます。違いは、テーブルから読み取るデータです。クエリ内の少数のカラムで使用されるフィルタリング条件に対して`PREWHERE`を手動で制御する場合、強力なデータフィルタリングを提供します。これにより、読み取るデータの量が減少します。

クエリは同時に`PREWHERE`と`WHERE`を指定することができます。この場合、`PREWHERE`が`WHERE`の前に来ます。

[optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere)設定が0に設定されている場合、`WHERE`から`PREWHERE`への式の一部を自動的に移動するヒューリスティックは無効になります。

クエリに[FINAL](/sql-reference/statements/select/from#final-modifier)修飾子がある場合、`PREWHERE`最適化は常に正しいとは限りません。これは、[optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere)および[optimize_move_to_prewhere_if_final](../../../operations/settings/settings.md#optimize_move_to_prewhere_if_final)の両方の設定がオンになっている場合のみ有効になります。

:::note
`PREWHERE`セクションは`FINAL`の前に実行されるため、`ORDER BY`セクションにフィールドがない場合、`FROM ... FINAL`クエリの結果が歪む可能性があります。
:::

## 制限事項 {#limitations}

`PREWHERE`は、[*MergeTree](../../../engines/table-engines/mergetree-family/index.md)ファミリーのテーブルのみでサポートされています。

## 例 {#example}

```sql
CREATE TABLE mydata
(
    `A` Int64,
    `B` Int8,
    `C` String
)
ENGINE = MergeTree
ORDER BY A AS
SELECT
    number,
    0,
    if(number between 1000 and 2000, 'x', toString(number))
FROM numbers(10000000);

SELECT count()
FROM mydata
WHERE (B = 0) AND (C = 'x');

1 行がセットに含まれています。経過時間: 0.074 秒。処理された行数: 10.00 百万行、168.89 MB (134.98 百万行/s., 2.28 GB/s.)

-- PREWHEREにどの述語が移動されるかを見るためにトレースを有効にしましょう
set send_logs_level='debug';

MergeTreeWhereOptimizer: 条件 "B = 0" がPREWHEREに移動されました
-- Clickhouseは自動的に`B = 0`をPREWHEREに移動しますが、Bは常に0なので意味がありません。

-- 他の述語`C = 'x'`を移動しましょう

SELECT count()
FROM mydata
PREWHERE C = 'x'
WHERE B = 0;

1 行がセットに含まれています。経過時間: 0.069 秒。処理された行数: 10.00 百万行、158.89 MB (144.90 百万行/s., 2.30 GB/s.)

-- 手動の`PREWHERE`を使用したこのクエリは、わずかに少ないデータを処理します: 158.89 MB VS 168.89 MB
```
