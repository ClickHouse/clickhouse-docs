---
description: 'Memory エンジンはデータを圧縮せずに RAM 上に保持します。データは取り込まれたときの形式そのままで保存されます。言い換えると、このテーブルからの読み取りでは追加の処理コストが一切発生しません。'
sidebar_label: 'Memory'
sidebar_position: 110
slug: /engines/table-engines/special/memory
title: 'Memory テーブルエンジン'
doc_type: 'reference'
---



# Memory テーブルエンジン

:::note
ClickHouse Cloud 上で Memory テーブルエンジンを使用する場合、データは（設計上）すべてのノード間でレプリケートされません。すべてのクエリが同じノードにルーティングされ、Memory テーブルエンジンが期待どおりに動作することを保証するには、次のいずれかを行ってください:
- 同一セッション内で、すべての操作を実行する
- TCP またはネイティブインターフェース（スティッキー接続をサポート）を使用するクライアント、たとえば [clickhouse-client](/interfaces/cli) を使用する
:::

Memory エンジンは、圧縮されていない形式でデータを RAM に保存します。データは読み取り時に受け取ったものとまったく同じ形式で保存されます。言い換えると、このテーブルからの読み取りコストはほぼゼロです。
同時データアクセスは同期制御されます。ロック時間は短く、読み取りと書き込み操作は互いにブロックしません。
インデックスはサポートされません。読み取りは並列化されます。

ディスクからの読み取りやデータの解凍、デシリアライズがないため、単純なクエリでは最大スループット（10 GB/秒超）が得られます。（多くの場合、MergeTree エンジンのスループットもほぼ同等であることに注意してください。）
サーバーを再起動すると、テーブル内のデータは消失し、テーブルは空になります。
通常、このテーブルエンジンを使用する必然性はあまりありません。ただし、テスト用途や、比較的少ない行数（おおよそ 100,000,000 行まで）に対して最大速度が求められるタスクには使用できます。

Memory エンジンは、クエリの外部データ用一時テーブル（「クエリを処理するための外部データ」のセクションを参照）や、`GLOBAL IN` の実装（「IN 演算子」のセクションを参照）に、システムによって使用されます。

Memory エンジンのテーブルサイズを制限するために上限および下限を指定でき、事実上、循環バッファとして動作させることができます（[Engine Parameters](#engine-parameters) を参照）。



## エンジンパラメーター {#engine-parameters}

- `min_bytes_to_keep` — メモリテーブルにサイズ制限がある場合に保持する最小バイト数。
  - デフォルト値: `0`
  - `max_bytes_to_keep` が必要
- `max_bytes_to_keep` — メモリテーブル内で保持する最大バイト数。各挿入時に最も古い行が削除されます（リングバッファ方式）。大きなブロックを追加する際、削除対象となる最古の行バッチが `min_bytes_to_keep` の制限内に収まる場合は、最大バイト数が指定した上限を超えることがあります。
  - デフォルト値: `0`
- `min_rows_to_keep` — メモリテーブルにサイズ制限がある場合に保持する最小行数。
  - デフォルト値: `0`
  - `max_rows_to_keep` が必要
- `max_rows_to_keep` — メモリテーブル内で保持する最大行数。各挿入時に最も古い行が削除されます（リングバッファ方式）。大きなブロックを追加する際、削除対象となる最古の行バッチが `min_rows_to_keep` の制限内に収まる場合は、最大行数が指定した上限を超えることがあります。
  - デフォルト値: `0`
- `compress` — メモリ上のデータを圧縮するかどうか。
  - デフォルト値: `false`



## 使用方法

**設定を初期化する**

```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**設定の変更**

```sql
ALTER TABLE memory MODIFY SETTING min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**注意:** `bytes` と `rows` の両方の上限パラメータは同時に設定できますが、`max` と `min` のうち小さい方の値が優先されます。


## 例

```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_bytes_to_keep = 4096, max_bytes_to_keep = 16384;

/* 1. 最も古いブロックが最小しきい値により削除されないことをテスト - 3000 行 */
INSERT INTO memory SELECT * FROM numbers(0, 1600); -- 8'192 バイト

/* 2. 削除されないブロックを追加 */
INSERT INTO memory SELECT * FROM numbers(1000, 100); -- 1'024 バイト

/* 3. 最も古いブロックが削除されることをテスト - 9216 バイト - 1100 */
INSERT INTO memory SELECT * FROM numbers(9000, 1000); -- 8'192 バイト

/* 4. 非常に大きなブロックがすべてを置き換えることを確認 */
INSERT INTO memory SELECT * FROM numbers(9000, 10000); -- 65'536 バイト

SELECT total_bytes, total_rows FROM system.tables WHERE name = 'memory' AND database = currentDatabase();
```

```text
┌─total_bytes─┬─total_rows─┐
│       65536 │      10000 │
└─────────────┴────────────┘
```

また、行の場合は次のとおりです：

```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_rows_to_keep = 4000, max_rows_to_keep = 10000;

/* 1. 最古のブロックが最小しきい値により削除されないことを確認 - 3000 行 */
INSERT INTO memory SELECT * FROM numbers(0, 1600); -- 1'600 行

/* 2. 削除されないブロックを追加する */
INSERT INTO memory SELECT * FROM numbers(1000, 100); -- 100 行

/* 3. 最古のブロックが削除されることを確認 - 9216 バイト - 1100 行 */
INSERT INTO memory SELECT * FROM numbers(9000, 1000); -- 1'000 行

/* 4. 非常に大きなブロックがすべてを置き換えることを確認 */
INSERT INTO memory SELECT * FROM numbers(9000, 10000); -- 10'000 行

SELECT total_bytes, total_rows FROM system.tables WHERE name = 'memory' AND database = currentDatabase();
```

```text
┌─total_bytes─┬─total_rows─┐
│       65536 │      10000 │
└─────────────┴────────────┘
```
