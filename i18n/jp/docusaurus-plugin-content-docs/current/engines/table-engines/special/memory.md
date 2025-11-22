---
description: 'Memory エンジンはデータを RAM 上に非圧縮形式で保存します。データは受信時とまったく同じ形式のまま保持されます。つまり、このテーブルからの読み取りには追加のオーバーヘッドが一切発生しません。'
sidebar_label: 'Memory'
sidebar_position: 110
slug: /engines/table-engines/special/memory
title: 'Memory テーブルエンジン'
doc_type: 'reference'
---



# Memory テーブルエンジン

:::note
ClickHouse Cloud 上で Memory テーブルエンジンを使用する場合、データは（設計上）すべてのノード間でレプリケートされません。すべてのクエリが同じノードにルーティングされ、Memory テーブルエンジンが期待どおりに動作することを保証するために、次のいずれかを行ってください:
- すべての操作を同じセッション内で実行する
- [clickhouse-client](/interfaces/cli) など、TCP またはネイティブインターフェイス（スティッキー接続をサポートする）を使用するクライアントを利用する
:::

Memory エンジンはデータを RAM 内に、非圧縮形式で保存します。データは読み取られたときに受け取ったものとまったく同じ形式で保存されます。言い換えると、このテーブルからの読み取りにはほとんどコストがかかりません。
同時データアクセスは同期制御されています。ロックの保持時間は短く、読み取りと書き込み操作がお互いをブロックすることはありません。
インデックスはサポートされていません。読み取りは並列化されています。

シンプルなクエリでは、ディスクからの読み取りやデータの解凍・デシリアライズが不要なため、最大で 10 GB/sec を超えるスループットが達成されます。（多くの場合、MergeTree エンジンのスループットもほぼ同等であることは付記しておきます。）
サーバーを再起動すると、テーブル内のデータは消え、テーブルは空になります。
通常、このテーブルエンジンを採用することが正当化されるケースは多くありませんが、テスト用途や、比較的少ない行数（おおよそ 100,000,000 行まで）に対して最大速度が求められるタスクには使用できます。

Memory エンジンは、外部クエリデータ用の一時テーブル（「クエリ処理用の外部データ」のセクションを参照）や、`GLOBAL IN` の実装（「IN 演算子」のセクションを参照）に、システムによって使用されます。

Memory エンジンのテーブルサイズを制限するために上下限を指定でき、これによりテーブルを実質的にリングバッファ（循環バッファ）として動作させることができます（[Engine Parameters](#engine-parameters) を参照）。



## エンジンパラメータ {#engine-parameters}

- `min_bytes_to_keep` — メモリテーブルのサイズ上限に達した際に保持する最小バイト数。
  - デフォルト値: `0`
  - `max_bytes_to_keep`の指定が必要
- `max_bytes_to_keep` — メモリテーブル内で保持する最大バイト数。挿入のたびに最も古い行が削除されます(循環バッファ)。大きなブロックを追加する際に、削除対象の最も古い行のバッチが`min_bytes_to_keep`の制限を下回る場合、最大バイト数は指定された制限を超えることがあります。
  - デフォルト値: `0`
- `min_rows_to_keep` — メモリテーブルのサイズ上限に達した際に保持する最小行数。
  - デフォルト値: `0`
  - `max_rows_to_keep`の指定が必要
- `max_rows_to_keep` — メモリテーブル内で保持する最大行数。挿入のたびに最も古い行が削除されます(循環バッファ)。大きなブロックを追加する際に、削除対象の最も古い行のバッチが`min_rows_to_keep`の制限を下回る場合、最大行数は指定された制限を超えることがあります。
  - デフォルト値: `0`
- `compress` - メモリ内のデータを圧縮するかどうか。
  - デフォルト値: `false`


## 使用方法 {#usage}

**設定の初期化**

```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**設定の変更**

```sql
ALTER TABLE memory MODIFY SETTING min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**注意:** `bytes`と`rows`の上限パラメータは同時に設定できますが、`max`と`min`の境界値が遵守されます。


## 例 {#examples}

```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_bytes_to_keep = 4096, max_bytes_to_keep = 16384;

/* 1. 最小閾値により最も古いブロックが削除されないことをテスト - 3000行 */
INSERT INTO memory SELECT * FROM numbers(0, 1600); -- 8'192バイト

/* 2. 削除されないブロックを追加 */
INSERT INTO memory SELECT * FROM numbers(1000, 100); -- 1'024バイト

/* 3. 最も古いブロックが削除されることをテスト - 9216バイト - 1100 */
INSERT INTO memory SELECT * FROM numbers(9000, 1000); -- 8'192バイト

/* 4. 非常に大きなブロックがすべてを上書きすることを確認 */
INSERT INTO memory SELECT * FROM numbers(9000, 10000); -- 65'536バイト

SELECT total_bytes, total_rows FROM system.tables WHERE name = 'memory' AND database = currentDatabase();
```

```text
┌─total_bytes─┬─total_rows─┐
│       65536 │      10000 │
└─────────────┴────────────┘
```

また、行数の場合:

```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_rows_to_keep = 4000, max_rows_to_keep = 10000;

/* 1. 最小閾値により最も古いブロックが削除されないことをテスト - 3000行 */
INSERT INTO memory SELECT * FROM numbers(0, 1600); -- 1'600行

/* 2. 削除されないブロックを追加 */
INSERT INTO memory SELECT * FROM numbers(1000, 100); -- 100行

/* 3. 最も古いブロックが削除されることをテスト - 9216バイト - 1100 */
INSERT INTO memory SELECT * FROM numbers(9000, 1000); -- 1'000行

/* 4. 非常に大きなブロックがすべてを上書きすることを確認 */
INSERT INTO memory SELECT * FROM numbers(9000, 10000); -- 10'000行

SELECT total_bytes, total_rows FROM system.tables WHERE name = 'memory' AND database = currentDatabase();
```

```text
┌─total_bytes─┬─total_rows─┐
│       65536 │      10000 │
└─────────────┴────────────┘
```
