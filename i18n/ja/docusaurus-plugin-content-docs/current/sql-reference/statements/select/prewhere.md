---
slug: /sql-reference/statements/select/prewhere
sidebar_label: PREWHERE
---

# PREWHERE 句

Prewhere は、フィルタリングをより効率的に適用するための最適化です。`PREWHERE` 句が明示的に指定されていなくても、デフォルトで有効になります。この最適化は、[WHERE](../../../sql-reference/statements/select/where.md) 条件の一部を自動的に prewhere ステージに移動させることによって機能します。`PREWHERE` 句の役割は、デフォルトの動作よりも良い方法があると考える場合に、この最適化を制御することです。

Prewhere 最適化を使用すると、最初に prewhere 式を実行するために必要なカラムだけが読み取られます。次に、クエリの残りを実行するために必要な他のカラムが読み取られますが、prewhere 式が少なくともいくつかの行で `true` であるブロックのみです。すべての行で prewhere 式が `false` であるブロックが多数ある場合や、prewhere がクエリの他の部分よりも少ないカラムを必要とする場合、これは通常、クエリ実行のためにディスクから読み取るデータ量を大幅に減少させることができます。

## Prewhere の手動制御 {#controlling-prewhere-manually}

この句は、`WHERE` 句と同じ意味を持ちます。違いは、テーブルから読み取られるデータです。フィルタリング条件の `PREWHERE` を手動で制御する場合、クエリ内の少数のカラムで使用されるが強力なデータフィルタリングを提供する条件に対して使用されます。これにより、読み取るデータの量が減少します。

クエリは同時に `PREWHERE` と `WHERE` を指定することができます。この場合、`PREWHERE` は `WHERE` よりも先に処理されます。

[optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) 設定が 0 に設定されている場合、`WHERE` から `PREWHERE` に表現の一部を自動的に移動させるためのヒューリスティックスは無効になります。

クエリに [FINAL](from.md#select-from-final) 修飾子がある場合、`PREWHERE` 最適化は常に正しいわけではありません。これは、両方の設定 [optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) と [optimize_move_to_prewhere_if_final](../../../operations/settings/settings.md#optimize_move_to_prewhere_if_final) がオンの場合にのみ有効です。

:::note    
`PREWHERE` セクションは `FINAL` よりも前に実行されるため、`ORDER BY` 部分に含まれないフィールドを使用して `PREWHERE` を使用する場合、`FROM ... FINAL` クエリの結果が歪む可能性があります。
:::

## 制限事項 {#limitations}

`PREWHERE` は、[*MergeTree](../../../engines/table-engines/mergetree-family/index.md) 系統のテーブルのみでサポートされています。

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

1 行がセットに含まれています。経過時間: 0.074 秒。10,000,000 行、168.89 MB が処理されました (134.98 ミリオン行/秒、2.28 GB/秒)。

-- どの述語が PREWHERE に移動されたかを見るためにトレースを有効にしましょう
set send_logs_level='debug';

MergeTreeWhereOptimizer: 条件 "B = 0" が PREWHERE に移動しました  
-- Clickhouse は自動的に `B = 0` を PREWHERE に移動しますが、B は常に 0 であるため、意味がありません。

-- 別の述語 `C = 'x'` を移動しましょう 

SELECT count()
FROM mydata
PREWHERE C = 'x'
WHERE B = 0;

1 行がセットに含まれています。経過時間: 0.069 秒。10,000,000 行、158.89 MB が処理されました (144.90 ミリオン行/秒、2.30 GB/秒)。

-- この手動の `PREWHERE` を使用したクエリは、若干少ないデータを処理します: 158.89 MB 対 168.89 MB
```
