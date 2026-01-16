---
description: 'PREWHERE 句に関するドキュメント'
sidebar_label: 'PREWHERE'
slug: /sql-reference/statements/select/prewhere
title: 'PREWHERE 句'
doc_type: 'reference'
---

# PREWHERE 句 \\{#prewhere-clause\\}

`PREWHERE` は、フィルタリングをより効率的に適用するための最適化です。`PREWHERE` 句が明示的に指定されていない場合でも、デフォルトで有効になっています。これは、[WHERE](../../../sql-reference/statements/select/where.md) 条件の一部を自動的に PREWHERE ステージへ移動することで機能します。`PREWHERE` 句の役割は、このデフォルトの最適化よりも適切に制御できると考える場合に、その挙動を明示的にコントロールすることだけです。

PREWHERE 最適化では、まず PREWHERE 式を評価するために必要な列だけが読み込まれます。その後、クエリの残りの部分を実行するために必要な他の列が読み込まれますが、これは PREWHERE 式が少なくとも一部の行で `true` となるブロックに対してのみ行われます。すべての行に対して PREWHERE 式が `false` となるブロックが多数存在し、かつ PREWHERE がクエリの他の部分より少ない列しか必要としない場合には、クエリ実行時にディスクから読み取るデータ量を大幅に削減できることがよくあります。

## PREWHERE を手動で制御する \\{#controlling-prewhere-manually\\}

この句は `WHERE` 句と同じ意味を持ちます。違いは、テーブルからどのデータが読み込まれるかという点です。クエリ内の列のうち一部の列でしか使われないものの、強力なデータフィルタリングを提供する条件について `PREWHERE` を手動で制御すると、読み取るデータ量を削減できます。

クエリで `PREWHERE` と `WHERE` を同時に指定することができます。この場合、`PREWHERE` が `WHERE` に先行して実行されます。

[optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) 設定が 0 に設定されている場合、`WHERE` から `PREWHERE` へ式の一部を自動的に移動するためのヒューリスティックは無効化されます。

クエリに [FINAL](/sql-reference/statements/select/from#final-modifier) 修飾子がある場合、`PREWHERE` による最適化が常に正しくなるとは限りません。これは、[optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) と [optimize_move_to_prewhere_if_final](../../../operations/settings/settings.md#optimize_move_to_prewhere_if_final) の両方の設定がオンになっている場合にのみ有効化されます。

:::note    
`PREWHERE` セクションは `FINAL` より前に実行されるため、テーブルの `ORDER BY` セクションに含まれないフィールドと併用して `PREWHERE` を使うと、`FROM ... FINAL` クエリの結果が偏る可能性があります。
:::

## 制限事項 \\{#limitations\\}

`PREWHERE` は、[*MergeTree](../../../engines/table-engines/mergetree-family/index.md) ファミリーに属するテーブルでのみ使用できます。

## 例 \\{#example\\}

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

-- let's enable tracing to see which predicate are moved to PREWHERE
set send_logs_level='debug';

MergeTreeWhereOptimizer: condition "B = 0" moved to PREWHERE  
-- Clickhouse moves automatically `B = 0` to PREWHERE, but it has no sense because B is always 0.

-- Let's move other predicate `C = 'x'` 

SELECT count()
FROM mydata
PREWHERE C = 'x'
WHERE B = 0;

1 row in set. Elapsed: 0.069 sec. Processed 10.00 million rows, 158.89 MB (144.90 million rows/s., 2.30 GB/s.)

-- This query with manual `PREWHERE` processes slightly less data: 158.89 MB VS 168.89 MB
```
