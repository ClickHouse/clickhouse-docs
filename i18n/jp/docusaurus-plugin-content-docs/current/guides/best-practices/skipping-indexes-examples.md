---
slug: /optimize/skipping-indexes/examples
sidebar_label: 'データスキップインデックスの例'
sidebar_position: 2
description: 'スキップインデックス例のまとめ'
title: 'データスキップインデックスの例'
doc_type: 'guide'
keywords: ['スキップインデックス', 'データスキップ', 'パフォーマンス', 'インデックス作成', 'ベストプラクティス']
---



# データスキップインデックスの例

このページでは、ClickHouse のデータスキップインデックスの例をまとめ、各インデックスの定義方法、使用すべきタイミング、適用されているかを検証する方法を示します。これらの機能はすべて [MergeTree-family テーブル](/engines/table-engines/mergetree-family/mergetree) で動作します。

**インデックス構文:**

```sql
INDEX name expr TYPE type(...) [GRANULARITY N]
```

ClickHouse は 5 種類のスキップインデックスをサポートしています：

| Index Type                                          | Description                  |
| --------------------------------------------------- | ---------------------------- |
| **minmax**                                          | 各グラニュール内の最小値と最大値を追跡する        |
| **set(N)**                                          | グラニュールごとに最大 N 個の異なる値を保持する    |
| **bloom&#95;filter([false&#95;positive&#95;rate])** | 存在チェックのための確率的フィルタ            |
| **ngrambf&#95;v1**                                  | 部分文字列検索用の N-gram Bloom フィルタ  |
| **tokenbf&#95;v1**                                  | フルテキスト検索用のトークンベース Bloom フィルタ |

各セクションではサンプルデータを用いた例を示し、クエリ実行時にインデックスが利用されているかを確認する方法を説明します。


## MinMax インデックス

`minmax` インデックスは、おおまかにソートされたデータや、`ORDER BY` と相関のあるカラムに対する範囲条件に最適です。

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

-- インデックスを活用するクエリ
SELECT count() FROM events WHERE ts >= now() - 3600;

-- 使用状況の確認
EXPLAIN indexes = 1
SELECT count() FROM events WHERE ts >= now() - 3600;
```

`EXPLAIN` とプルーニングを用いた[具体例](/best-practices/use-data-skipping-indices-where-appropriate#example)を参照してください。


## Set インデックス

ローカル（ブロック単位）のカーディナリティが低い場合に `set` インデックスを使用します。各ブロック内に多数の異なる値が存在する場合には効果がありません。

```sql
ALTER TABLE events ADD INDEX user_set user_id TYPE set(100) GRANULARITY 1;
ALTER TABLE events MATERIALIZE INDEX user_set;

SELECT * FROM events WHERE user_id IN (101, 202);

EXPLAIN indexes = 1
SELECT * FROM events WHERE user_id IN (101, 202);
```

作成／マテリアライズのワークフローと、その適用前後の効果は、[基本的な操作ガイド](/optimize/skipping-indexes#basic-operation)で確認できます。


## 汎用 Bloom フィルター（スカラー）

`bloom_filter` インデックスは、「干し草の山から針を探すような」等価比較や IN によるメンバーシップ判定に適しています。偽陽性率（デフォルト 0.025）を指定するオプションのパラメータを受け取ります。

```sql
ALTER TABLE events ADD INDEX value_bf value TYPE bloom_filter(0.01) GRANULARITY 3;
ALTER TABLE events MATERIALIZE INDEX value_bf;

SELECT * FROM events WHERE value IN (7, 42, 99);

EXPLAIN indexes = 1
SELECT * FROM events WHERE value IN (7, 42, 99);
```


## 部分文字列検索用の N-gram Bloom フィルター (ngrambf&#95;v1)

`ngrambf_v1` インデックスは、文字列を N-gram に分割します。`LIKE '%...%'` クエリに対して有効です。String/FixedString/Map（mapKeys/mapValues 経由）をサポートし、サイズ、ハッシュ数、シードを調整できます。詳細については、[N-gram Bloom filter](/engines/table-engines/mergetree-family/mergetree#n-gram-bloom-filter) のドキュメントを参照してください。

```sql
-- 部分文字列検索用インデックスの作成
ALTER TABLE logs ADD INDEX msg_ngram msg TYPE ngrambf_v1(3, 10000, 3, 7) GRANULARITY 1;
ALTER TABLE logs MATERIALIZE INDEX msg_ngram;

-- 部分文字列検索
SELECT count() FROM logs WHERE msg LIKE '%timeout%';

EXPLAIN indexes = 1
SELECT count() FROM logs WHERE msg LIKE '%timeout%';
```

[このガイド](/use-cases/observability/schema-design#bloom-filters-for-text-search)では、実践的な例と、token と ngram のどちらをいつ使用するかについて解説しています。

**パラメータ最適化ヘルパー:**

4つの ngrambf&#95;v1 パラメータ（n-gram サイズ、ビットマップサイズ、ハッシュ関数の数、シード）は、パフォーマンスとメモリ使用量に大きな影響を与えます。想定される n-gram の件数と許容する偽陽性率に基づいて、最適なビットマップサイズとハッシュ関数数を計算するために、これらの関数を使用してください。

```sql
CREATE FUNCTION bfEstimateFunctions AS
(total_grams, bits) -> round((bits / total_grams) * log(2));

CREATE FUNCTION bfEstimateBmSize AS
(total_grams, p_false) -> ceil((total_grams * log(p_false)) / log(1 / pow(2, log(2))));

-- 4300個のn-gram、p_false = 0.0001の場合のサイズ計算例
SELECT bfEstimateBmSize(4300, 0.0001) / 8 AS size_bytes;  -- 約10304
SELECT bfEstimateFunctions(4300, bfEstimateBmSize(4300, 0.0001)) AS k; -- 約13
```

チューニングに関する完全なガイダンスについては、[パラメータのドキュメント](/engines/table-engines/mergetree-family/mergetree#n-gram-bloom-filter)を参照してください。


## 単語ベース検索用の Token Bloom フィルタ (tokenbf&#95;v1)

`tokenbf_v1` は、英数字以外の文字で区切られたトークンをインデックス化します。[`hasToken`](/sql-reference/functions/string-search-functions#hasToken)、`LIKE` による単語パターン、または `=` / `IN` 演算子と併用して使用することを推奨します。`String`/`FixedString`/`Map` 型をサポートします。

詳細については、[Token Bloom フィルタ](/engines/table-engines/mergetree-family/mergetree#token-bloom-filter) ページおよび [Bloom フィルタの種類](/optimize/skipping-indexes#skip-index-types) ページを参照してください。

```sql
ALTER TABLE logs ADD INDEX msg_token lower(msg) TYPE tokenbf_v1(10000, 7, 7) GRANULARITY 1;
ALTER TABLE logs MATERIALIZE INDEX msg_token;

-- 単語検索（lowerによる大文字小文字を区別しない検索）
SELECT count() FROM logs WHERE hasToken(lower(msg), 'exception');

EXPLAIN indexes = 1
SELECT count() FROM logs WHERE hasToken(lower(msg), 'exception');
```

トークンと ngram に関するオブザーバビリティの例とガイダンスについては、[こちら](/use-cases/observability/schema-design#bloom-filters-for-text-search)を参照してください。


## CREATE TABLE 時にインデックスを追加する（複数の例）

スキップインデックスは、複合式や `Map` / `Tuple` / `Nested` 型もサポートします。これは以下の例で示します。

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


## 既存データのマテリアライズと検証

`MATERIALIZE` を使って既存のデータパーツにインデックスを追加し、以下のように `EXPLAIN` やトレースログでプルーニングの動作を確認できます。

```sql
ALTER TABLE t MATERIALIZE INDEX idx_bf;

EXPLAIN indexes = 1
SELECT count() FROM t WHERE u64 IN (123, 456);

-- オプション: 詳細な刈り込み情報
SET send_logs_level = 'trace';
```

この[具体的な minmax の例](/best-practices/use-data-skipping-indices-where-appropriate#example)は、EXPLAIN 出力の構造とプルーニング件数を示しています。


## スキップインデックスを使用すべき場合と避けるべき場合 {#when-use-and-when-to-avoid}

**スキップインデックスを使用すべき場合:**

* フィルター対象の値がデータブロック内で疎に分布している場合  
* `ORDER BY` 列との相関が強い、またはデータのインジェストパターンによって類似した値がまとまって格納されている場合  
* 大規模なログデータセットに対してテキスト検索を行う場合（`ngrambf_v1` / `tokenbf_v1` 型）

**スキップインデックスを避けるべき場合:**

* ほとんどのブロックに少なくとも 1 つは一致する値が含まれる可能性が高い場合（いずれにせよブロック全体が読み取られる）  
* データの並び順と相関のない高カーディナリティ列でフィルタリングする場合

:::note Important considerations
ある値がデータブロック内に一度でも出現すると、そのブロック全体を ClickHouse は読み取る必要があります。実運用に近いデータセットでインデックスを検証し、実際のパフォーマンス計測に基づいて粒度や型固有のパラメータを調整してください。
:::



## 一時的にインデックスを無視または強制する

テストやトラブルシューティングの際に、個々のクエリごとに名前を指定して特定のインデックスを無効化できます。必要に応じてインデックスの使用を強制するための設定もあります。[`ignore_data_skipping_indices`](/operations/settings/settings#ignore_data_skipping_indices) を参照してください。

```sql
-- 名前を指定してインデックスを無視
SELECT * FROM logs
WHERE hasToken(lower(msg), 'exception')
SETTINGS ignore_data_skipping_indices = 'msg_token';
```


## 注意事項と留意点 {#notes-and-caveats}

* スキップインデックスは [MergeTree ファミリーのテーブル](/engines/table-engines/mergetree-family/mergetree) でのみサポートされます。プルーニングはグラニュール／ブロックレベルで行われます。  
* Bloom filter ベースのインデックスは確率的な仕組みです（誤検出により余分な読み取りが発生しますが、有効なデータを取り逃がすことはありません）。  
* Bloom filter およびその他のスキップインデックスは `EXPLAIN` とトレースで検証し、プルーニング効果とインデックスサイズのバランスが取れるように粒度を調整してください。



## 関連ドキュメント {#related-docs}
- [データスキッピングインデックスのガイド](/optimize/skipping-indexes)
- [ベストプラクティスガイド](/best-practices/use-data-skipping-indices-where-appropriate)
- [データスキッピングインデックスの操作方法](/sql-reference/statements/alter/skipping-index)
- [システムテーブルに関する情報](/operations/system-tables/data_skipping_indices)
