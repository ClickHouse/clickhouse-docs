---
description: 'PREWHERE 句に関するドキュメント'
sidebar_label: 'PREWHERE'
slug: /sql-reference/statements/select/prewhere
title: 'PREWHERE 句'
doc_type: 'reference'
---



# PREWHERE 句

Prewhere は、フィルタリングをより効率的に適用するための最適化機構です。`PREWHERE` 句を明示的に指定しなくても、デフォルトで有効になっています。[WHERE](../../../sql-reference/statements/select/where.md) 条件の一部を自動的に PREWHERE ステージに移動することで動作します。`PREWHERE` 句の役割は、この最適化の動作を制御することだけであり、デフォルトの挙動よりも適切に指定できると考える場合に使用します。

PREWHERE 最適化では、まず PREWHERE 式を評価するために必要な列だけが読み込まれます。その後、クエリの残りの部分を実行するために必要な他の列が読み込まれますが、これは PREWHERE 式が少なくとも一部の行で `true` となるブロックに限られます。PREWHERE 式がすべての行で `false` となるブロックが多く存在し、かつ PREWHERE で必要とされる列数がクエリの他の部分より少ない場合、クエリ実行時にディスクから読み込むデータ量を大幅に削減できることがよくあります。



## Prewhereの手動制御 {#controlling-prewhere-manually}

この句は`WHERE`句と同じ意味を持ちます。違いは、テーブルからどのデータが読み取られるかという点です。クエリ内の少数の列で使用されるものの、強力なデータフィルタリングを提供するフィルタリング条件に対して`PREWHERE`を手動で制御します。これにより、読み取るデータ量が削減されます。

クエリは`PREWHERE`と`WHERE`を同時に指定できます。この場合、`PREWHERE`が`WHERE`より先に実行されます。

[optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere)設定が0に設定されている場合、`WHERE`から`PREWHERE`へ式の一部を自動的に移動するヒューリスティックが無効になります。

クエリに[FINAL](/sql-reference/statements/select/from#final-modifier)修飾子がある場合、`PREWHERE`最適化は常に正しいとは限りません。この最適化は、[optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere)と[optimize_move_to_prewhere_if_final](../../../operations/settings/settings.md#optimize_move_to_prewhere_if_final)の両方の設定が有効になっている場合にのみ有効になります。

:::note  
`PREWHERE`セクションは`FINAL`より前に実行されるため、テーブルの`ORDER BY`セクションに含まれていないフィールドで`PREWHERE`を使用すると、`FROM ... FINAL`クエリの結果が歪む可能性があります。
:::


## 制限事項 {#limitations}

`PREWHERE`は[\*MergeTree](../../../engines/table-engines/mergetree-family/index.md)ファミリーのテーブルでのみサポートされます。


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

1 row in set. Elapsed: 0.074 sec. Processed 10.00 million rows, 168.89 MB (134.98 million rows/s., 2.28 GB/s.)

-- トレースを有効にして、どの述語がPREWHEREに移動されるかを確認します
set send_logs_level='debug';

MergeTreeWhereOptimizer: condition "B = 0" moved to PREWHERE
-- ClickHouseは自動的に`B = 0`をPREWHEREに移動しますが、Bは常に0であるため効果がありません。

-- 別の述語`C = 'x'`を移動します

SELECT count()
FROM mydata
PREWHERE C = 'x'
WHERE B = 0;

1 row in set. Elapsed: 0.069 sec. Processed 10.00 million rows, 158.89 MB (144.90 million rows/s., 2.30 GB/s.)

-- 手動で`PREWHERE`を指定したこのクエリは、わずかに少ないデータを処理します：158.89 MB vs 168.89 MB
```
