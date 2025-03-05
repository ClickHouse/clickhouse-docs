---
slug: /sql-reference/statements/select/prewhere
sidebar_label: PREWHERE
---


# PREWHERE 句

Prewhere は、フィルタリングをより効率的に適用するための最適化です。`PREWHERE` 句が明示的に指定されていなくても、デフォルトで有効になっています。これは、[WHERE](../../../sql-reference/statements/select/where.md) 条件の一部を自動的にプレウェアステージに移動させることによって機能します。`PREWHERE` 句の役割は、この最適化を制御することであり、デフォルトで行われるよりも良い方法がわかっていると思われる場合に使用します。

プレウェア最適化を使用すると、最初はプレウェア式を実行するために必要なカラムのみが読み取られます。次に、残りのクエリを実行するために必要な他のカラムが読み取られますが、その際、プレウェア式が少なくともいくつかの行で `true` であるブロックのみです。すべての行でプレウェア式が `false` であるブロックが多く、プレウェアがクエリの他の部分よりも少ないカラムを必要とする場合、これはクエリ実行のためにディスクから読み取るデータ量を大幅に削減することができます。

## プレウェアの手動制御 {#controlling-prewhere-manually}

この句は `WHERE` 句と同じ意味を持ちます。違いは、テーブルから読み取るデータの種類にあります。クエリ内の少数のカラムで使用されるフィルタ条件に対して `PREWHERE` を手動で制御する場合、強力なデータフィルタリングを提供します。これにより、読み取るデータの量が削減されます。

クエリは同時に `PREWHERE` と `WHERE` を指定できます。この場合、`PREWHERE` は `WHERE` の前に置かれます。

もし設定が [optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) に 0 が設定されている場合、`WHERE` から `PREWHERE` へ自動的に式の一部を移動するためのヒューリスティックが無効になります。

もしクエリに [FINAL](from.md#select-from-final) 修飾子がある場合、`PREWHERE` の最適化は常に正しいとは限りません。両方の設定 [optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) と [optimize_move_to_prewhere_if_final](../../../operations/settings/settings.md#optimize_move_to_prewhere_if_final) がオンになっている場合のみ有効になります。

:::note    
`PREWHERE` セクションは `FINAL` の前に実行されるため、`ORDER BY` セクションに含まれないフィールドで `PREWHERE` を使用すると、`FROM ... FINAL` クエリの結果が歪む可能性があります。
:::

## 制限 {#limitations}

`PREWHERE` は [*MergeTree](../../../engines/table-engines/mergetree-family/index.md) ファミリーのテーブルのみでサポートされています。

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

1 行のセット。経過時間: 0.074 秒。処理された行数: 1000 万行、168.89 MB (134.98 million rows/s., 2.28 GB/s.)

-- プレウェアに移動された述語を確認するためにトレースを有効にします
set send_logs_level='debug';

MergeTreeWhereOptimizer: 条件 "B = 0" が PREWHERE に移動しました  
-- Clickhouse は自動的に `B = 0` を PREWHERE に移動しますが、B は常に 0 ですので意味がありません。

-- 他の述語 `C = 'x'` を移動させましょう 

SELECT count()
FROM mydata
PREWHERE C = 'x'
WHERE B = 0;

1 行のセット。経過時間: 0.069 秒。処理された行数: 1000 万行、158.89 MB (144.90 million rows/s., 2.30 GB/s.)

-- 手動の `PREWHERE` を使用したこのクエリはわずかに少ないデータを処理しています: 158.89 MB VS 168.89 MB
```
