---
slug: /optimize/skipping-indexes/examples
sidebar_label: 'データスキッピングインデックス - 例'
sidebar_position: 2
description: 'スキップインデックスの例のまとめ'
title: 'データスキッピングインデックスの例'
doc_type: 'guide'
keywords: ['skipping indexes', 'data skipping', 'performance', 'indexing', 'best practices']
---



# データスキッピングインデックスの例 {#data-skipping-index-examples}

このページでは、ClickHouseのデータスキッピングインデックスの例をまとめ、各タイプの宣言方法、使用すべき場面、適用されていることの確認方法を示します。すべての機能は[MergeTreeファミリーテーブル](/engines/table-engines/mergetree-family/mergetree)で動作します。

**インデックス構文:**

```sql
INDEX name expr TYPE type(...) [GRANULARITY N]
```

ClickHouseは5種類のスキップインデックスタイプをサポートしています:

| インデックスタイプ                              | 説明                                       |
| --------------------------------------- | ------------------------------------------------- |
| **minmax**                              | 各グラニュール内の最小値と最大値を追跡 |
| **set(N)**                              | グラニュールごとに最大N個の個別値を格納        |
| **bloom_filter([false_positive_rate])** | 存在チェック用の確率的フィルター         |
| **ngrambf_v1**                          | 部分文字列検索用のN-gramブルームフィルター        |
| **tokenbf_v1**                          | 全文検索用のトークンベースブルームフィルター   |

各セクションでは、サンプルデータを用いた例を提供し、クエリ実行時のインデックス使用状況を確認する方法を示します。


## MinMax インデックス {#minmax-index}

`minmax`インデックスは、緩やかにソートされたデータや`ORDER BY`と相関のある列に対する範囲述語に最適です。

```sql
-- CREATE TABLE で定義
CREATE TABLE events
(
  ts DateTime,
  user_id UInt64,
  value UInt32,
  INDEX ts_minmax ts TYPE minmax GRANULARITY 1
)
ENGINE=MergeTree
ORDER BY ts;

-- または後から追加してマテリアライズ
ALTER TABLE events ADD INDEX ts_minmax ts TYPE minmax GRANULARITY 1;
ALTER TABLE events MATERIALIZE INDEX ts_minmax;

-- インデックスの恩恵を受けるクエリ
SELECT count() FROM events WHERE ts >= now() - 3600;

-- 使用状況を確認
EXPLAIN indexes = 1
SELECT count() FROM events WHERE ts >= now() - 3600;
```

`EXPLAIN`とプルーニングを使用した[実例](/best-practices/use-data-skipping-indices-where-appropriate#example)を参照してください。


## Setインデックス {#set-index}

ローカル（ブロック単位）のカーディナリティが低い場合に`set`インデックスを使用します。各ブロックに多数の異なる値が含まれる場合は効果がありません。

```sql
ALTER TABLE events ADD INDEX user_set user_id TYPE set(100) GRANULARITY 1;
ALTER TABLE events MATERIALIZE INDEX user_set;

SELECT * FROM events WHERE user_id IN (101, 202);

EXPLAIN indexes = 1
SELECT * FROM events WHERE user_id IN (101, 202);
```

インデックスの作成とマテリアライゼーションのワークフロー、および適用前後の効果については、[基本操作ガイド](/optimize/skipping-indexes#basic-operation)を参照してください。


## 汎用Bloomフィルタ(スカラー) {#generic-bloom-filter-scalar}

`bloom_filter`インデックスは、等価性検索やIN句によるメンバーシップ検索において、大量のデータから特定の値を見つける場合に有効です。偽陽性率を指定するオプションのパラメータを受け付けます(デフォルトは0.025)。

```sql
ALTER TABLE events ADD INDEX value_bf value TYPE bloom_filter(0.01) GRANULARITY 3;
ALTER TABLE events MATERIALIZE INDEX value_bf;

SELECT * FROM events WHERE value IN (7, 42, 99);

EXPLAIN indexes = 1
SELECT * FROM events WHERE value IN (7, 42, 99);
```


## 部分文字列検索のためのN-gram Bloomフィルタ (ngrambf_v1) {#n-gram-bloom-filter-ngrambf-v1-for-substring-search}

`ngrambf_v1`インデックスは文字列をn-gramに分割します。`LIKE '%...%'`クエリに対して効果的に機能します。String/FixedString/Map（mapKeys/mapValues経由）をサポートし、サイズ、ハッシュ数、シード値を調整可能です。詳細については[N-gram bloomフィルタ](/engines/table-engines/mergetree-family/mergetree#n-gram-bloom-filter)のドキュメントを参照してください。

```sql
-- 部分文字列検索用のインデックスを作成
ALTER TABLE logs ADD INDEX msg_ngram msg TYPE ngrambf_v1(3, 10000, 3, 7) GRANULARITY 1;
ALTER TABLE logs MATERIALIZE INDEX msg_ngram;

-- 部分文字列検索
SELECT count() FROM logs WHERE msg LIKE '%timeout%';

EXPLAIN indexes = 1
SELECT count() FROM logs WHERE msg LIKE '%timeout%';
```

[このガイド](/use-cases/observability/schema-design#bloom-filters-for-text-search)では、実践的な例とtokenとngramの使い分けについて説明しています。

**パラメータ最適化ヘルパー:**

ngrambf_v1の4つのパラメータ（n-gramサイズ、ビットマップサイズ、ハッシュ関数数、シード値）は、パフォーマンスとメモリ使用量に大きく影響します。予想されるn-gram数と希望する偽陽性率に基づいて、最適なビットマップサイズとハッシュ関数数を計算するには、以下の関数を使用してください:

```sql
CREATE FUNCTION bfEstimateFunctions AS
(total_grams, bits) -> round((bits / total_grams) * log(2));

CREATE FUNCTION bfEstimateBmSize AS
(total_grams, p_false) -> ceil((total_grams * log(p_false)) / log(1 / pow(2, log(2))));

-- 4300個のngram、p_false = 0.0001の場合のサイジング例
SELECT bfEstimateBmSize(4300, 0.0001) / 8 AS size_bytes;  -- ~10304
SELECT bfEstimateFunctions(4300, bfEstimateBmSize(4300, 0.0001)) AS k; -- ~13
```

完全なチューニングガイダンスについては、[パラメータドキュメント](/engines/table-engines/mergetree-family/mergetree#n-gram-bloom-filter)を参照してください。


## 単語ベース検索のためのトークンブルームフィルタ（tokenbf_v1） {#token-bloom-filter-tokenbf-v1-for-word-based-search}

`tokenbf_v1`は、英数字以外の文字で区切られたトークンをインデックス化します。[`hasToken`](/sql-reference/functions/string-search-functions#hasToken)、`LIKE`の単語パターン、または等価/IN演算子と組み合わせて使用してください。`String`/`FixedString`/`Map`型に対応しています。

詳細については、[トークンブルームフィルタ](/engines/table-engines/mergetree-family/mergetree#token-bloom-filter)および[ブルームフィルタの種類](/optimize/skipping-indexes#skip-index-types)のページを参照してください。

```sql
ALTER TABLE logs ADD INDEX msg_token lower(msg) TYPE tokenbf_v1(10000, 7, 7) GRANULARITY 1;
ALTER TABLE logs MATERIALIZE INDEX msg_token;

-- 単語検索（lowerによる大文字小文字の区別なし）
SELECT count() FROM logs WHERE hasToken(lower(msg), 'exception');

EXPLAIN indexes = 1
SELECT count() FROM logs WHERE hasToken(lower(msg), 'exception');
```

トークンとngramの比較に関するオブザーバビリティの例とガイダンスについては、[こちら](/use-cases/observability/schema-design#bloom-filters-for-text-search)を参照してください。


## CREATE TABLE でのインデックス追加（複数の例） {#add-indexes-during-create-table-multiple-examples}

スキッピングインデックスは、複合式および `Map`/`Tuple`/`Nested` 型もサポートしています。以下の例でこれを示します：

```sql
CREATE TABLE t
(
  u64 UInt64,
  s String,
  m Map(String, String),

  INDEX idx_bf u64 TYPE bloom_filter(0.01) GRANULARITY 3,
  INDEX idx_minmax u64 TYPE minmax GRANULARITY 1,
  INDEX idx_set u64 * length(s) TYPE set(1000) GRANULARITY 4,
  INDEX idx_ngram s TYPE ngrambf_v1(3, 10000, 3, 7) GRANULARITY 1,
  INDEX idx_token mapKeys(m) TYPE tokenbf_v1(10000, 7, 7) GRANULARITY 1
)
ENGINE = MergeTree
ORDER BY u64;
```


## 既存データへのマテリアライズと検証 {#materializing-on-existing-data-and-verifying}

`MATERIALIZE`を使用して既存のデータパーツにインデックスを追加し、以下に示すように`EXPLAIN`またはトレースログでプルーニングを確認できます:

```sql
ALTER TABLE t MATERIALIZE INDEX idx_bf;

EXPLAIN indexes = 1
SELECT count() FROM t WHERE u64 IN (123, 456);

-- オプション: 詳細なプルーニング情報
SET send_logs_level = 'trace';
```

この[minmaxの実例](/best-practices/use-data-skipping-indices-where-appropriate#example)は、EXPLAIN出力の構造とプルーニングカウントを示しています。


## スキッピングインデックスを使用する場合と避ける場合 {#when-use-and-when-to-avoid}

**スキップインデックスを使用する場合:**

- データブロック内でフィルタ値がまばらに分布している場合
- `ORDER BY`列との強い相関関係が存在する場合、またはデータ取り込みパターンによって類似した値がグループ化される場合
- 大規模なログデータセットに対してテキスト検索を実行する場合(`ngrambf_v1`/`tokenbf_v1`タイプ)

**スキップインデックスを避ける場合:**

- ほとんどのブロックに少なくとも1つの一致する値が含まれている可能性が高い場合(いずれにせよブロックは読み取られます)
- データの順序付けとの相関関係がない高カーディナリティ列でフィルタリングする場合

:::note 重要な考慮事項
データブロック内に値が一度でも出現する場合、ClickHouseはブロック全体を読み取る必要があります。実際のデータセットでインデックスをテストし、実際のパフォーマンス測定に基づいて粒度とタイプ固有のパラメータを調整してください。
:::


## インデックスの一時的な無視または強制 {#temporarily-ignore-or-force-indexes}

テストやトラブルシューティング時に、個別のクエリで特定のインデックスを名前指定で無効化できます。必要に応じてインデックスの使用を強制する設定も用意されています。詳細は[`ignore_data_skipping_indices`](/operations/settings/settings#ignore_data_skipping_indices)を参照してください。

```sql
-- 名前でインデックスを無視
SELECT * FROM logs
WHERE hasToken(lower(msg), 'exception')
SETTINGS ignore_data_skipping_indices = 'msg_token';
```


## 注意事項と制約 {#notes-and-caveats}

- スキッピングインデックスは[MergeTreeファミリーテーブル](/engines/table-engines/mergetree-family/mergetree)でのみサポートされており、プルーニングはグラニュール/ブロックレベルで行われます。
- Bloomフィルターベースのインデックスは確率的なものです(偽陽性により余分な読み取りが発生する可能性がありますが、有効なデータがスキップされることはありません)。
- Bloomフィルターおよびその他のスキップインデックスは、`EXPLAIN`とトレーシングを使用して検証する必要があります。プルーニング効果とインデックスサイズのバランスを取るために、粒度を調整してください。


## 関連ドキュメント {#related-docs}

- [データスキッピングインデックスガイド](/optimize/skipping-indexes)
- [ベストプラクティスガイド](/best-practices/use-data-skipping-indices-where-appropriate)
- [データスキッピングインデックスの操作](/sql-reference/statements/alter/skipping-index)
- [システムテーブル情報](/operations/system-tables/data_skipping_indices)
