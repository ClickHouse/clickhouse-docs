---
description: 'Documentation for PREWHERE Clause'
sidebar_label: 'PREWHERE'
slug: '/sql-reference/statements/select/prewhere'
title: 'PREWHERE Clause'
---




# PREWHERE 句

Prewhere はフィルタリングをより効率的に適用するための最適化です。`PREWHERE` 句が明示的に指定されていなくても、デフォルトで有効になっています。これは、[WHERE](../../../sql-reference/statements/select/where.md) 条件の一部を自動的に Prewhere ステージに移動することによって機能します。`PREWHERE` 句の役割は、この最適化を制御することであり、デフォルトの動作よりも良い方法を知っていると考える場合に使用します。

Prewhere 最適化では、最初に Prewhere 式を実行するために必要なカラムだけが読み取られます。その後、クエリの残りを実行するために必要な他のカラムが読み取られますが、Prewhere 式が少なくともいくつかの行に対して `true` であるブロックのみです。すべての行に対して Prewhere 式が `false` のブロックが多く、Prewhere がクエリの他の部分よりも少ないカラムを必要とする場合、これによりクエリ実行のためにディスクから読み取るデータ量を大幅に削減することができます。

## Prewhere を手動で制御する {#controlling-prewhere-manually}

この句は `WHERE` 句と同じ意味を持ちます。違いは、どのデータがテーブルから読み取られるかです。クエリの中で少数のカラムによって使用されるフィルタ条件のために `PREWHERE` を手動で制御することができますが、それは強力なデータフィルタリングを提供します。これにより、読み取るデータの量が減少します。

クエリは同時に `PREWHERE` と `WHERE` を指定することができます。この場合、`PREWHERE` は `WHERE` に先行します。

[optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) 設定が 0 に設定されている場合、`WHERE` から `PREWHERE` に自動的に式の一部を移動するためのヒューリスティックは無効化されます。

クエリに [FINAL](/sql-reference/statements/select/from#final-modifier) 修飾子がある場合、`PREWHERE` の最適化は常に正しいわけではありません。これは、[optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) と [optimize_move_to_prewhere_if_final](../../../operations/settings/settings.md#optimize_move_to_prewhere_if_final) の両方が有効な場合のみ有効になります。

:::note    
`PREWHERE` セクションは `FINAL` の前に実行されるため、`ORDER BY` セクションに含まれないフィールドで `PREWHERE` を使用すると、`FROM ... FINAL` クエリの結果が歪む可能性があります。
:::

## 制限事項 {#limitations}

`PREWHERE` は [*MergeTree](../../../engines/table-engines/mergetree-family/index.md) ファミリーのテーブルでのみサポートされています。

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

1 行がセットにあります。経過時間: 0.074 秒。処理された行数: 10.00 百万行、168.89 MB (134.98 百万行/秒、2.28 GB/秒)。

-- PREWHERE に移動した述語を確認するためにトレースを有効にしましょう
set send_logs_level='debug';

MergeTreeWhereOptimizer: 条件 "B = 0" が PREWHERE に移動されました  
-- Clickhouse は自動的に `B = 0` を PREWHERE に移動しますが、B は常に 0 なので意味がありません。

-- 他の述語 `C = 'x'` を移動しましょう 

SELECT count()
FROM mydata
PREWHERE C = 'x'
WHERE B = 0;

1 行がセットにあります。経過時間: 0.069 秒。処理された行数: 10.00 百万行、158.89 MB (144.90 百万行/秒、2.30 GB/秒)。

-- 手動 `PREWHERE` を使用したこのクエリはわずかに少ないデータを処理します: 158.89 MB 対 168.89 MB
```
