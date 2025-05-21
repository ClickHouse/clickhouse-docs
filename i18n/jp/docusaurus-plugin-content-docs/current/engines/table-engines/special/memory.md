---
description: 'Memoryエンジンは、データをRAMに未圧縮の形式で保存します。データは、読み込まれたときに受け取った形式と正確に同じ形で保存されます。言い換えれば、このテーブルからの読み込みは完全に無料です。'
sidebar_label: 'メモリ'
sidebar_position: 110
slug: /engines/table-engines/special/memory
title: 'メモリテーブルエンジン'
---


# メモリテーブルエンジン

:::note
ClickHouse Cloudでメモリテーブルエンジンを使用する場合、データはすべてのノードにレプリケートされません（設計上）。すべてのクエリが同じノードにルーティングされ、メモリテーブルエンジンが期待通りに機能することを保証するために、次のいずれかを実行できます：
- 同じセッション内ですべての操作を実行する
- [clickhouse-client](/interfaces/cli)のように、TCPやネイティブインターフェースを使用するクライアントを使用する（これにより、スティッキーコネクションがサポートされます）
:::

メモリエンジンは、データをRAMに未圧縮の形式で保存します。データは、読み込まれたときに受け取った形式と正確に同じ形で保存されます。言い換えれば、このテーブルからの読み込みは完全に無料です。  
同時データアクセスは同期されています。ロックは短時間です：読み取りおよび書き込み操作は互いにブロックしません。  
インデックスはサポートされていません。読み取りは並列化されています。

最大生産性（10 GB/秒以上）は、ディスクからの読み取り、圧縮解除、またはデシリアライズがないため、単純なクエリで達成されます。（多くの場合、MergeTreeエンジンの生産性もほぼ同じであることに注意する必要があります。）  
サーバーを再起動すると、テーブルからデータが消失し、テーブルは空になります。  
通常、このテーブルエンジンを使用することは正当化されません。しかし、テストや、比較的少数の行（約100,000,000行まで）で最大速度が要求されるタスクに使用できます。

メモリエンジンは、クエリデータの外部テーブルに一時テーブルを使用するためにシステムによって使用されます（「クエリ処理のための外部データ」のセクションを参照）、および `GLOBAL IN` を実装するために使用されます（「IN演算子」のセクションを参照）。

メモリエンジンテーブルのサイズを制限するために、上限と下限を指定でき、実質的に円形バッファとして機能します（[エンジンパラメータ](#engine-parameters)を参照）。

## エンジンパラメータ {#engine-parameters}

- `min_bytes_to_keep` — メモリテーブルがサイズ制限されている場合に保持する最小バイト数。
  - デフォルト値: `0`
  - `max_bytes_to_keep`が必要
- `max_bytes_to_keep` — メモリテーブル内で保持する最大バイト数。古い行は各挿入時に削除されます（すなわち、円形バッファ）。最大バイト数は、古い削除対象の行のバッチが大きなブロックを追加する際に `min_bytes_to_keep` 制限に該当する場合、指定された制限を超えることがあります。
  - デフォルト値: `0`
- `min_rows_to_keep` — メモリテーブルがサイズ制限されている場合に保持する最小行数。
  - デフォルト値: `0`
  - `max_rows_to_keep`が必要
- `max_rows_to_keep` — メモリテーブル内で保持する最大行数。古い行は各挿入時に削除されます（すなわち、円形バッファ）。最大行数は、古い削除対象の行のバッチが大きなブロックを追加する際に `min_rows_to_keep` 制限に該当する場合、指定された制限を超えることがあります。
  - デフォルト値: `0`
- `compress` - メモリ内のデータを圧縮するかどうか。
  - デフォルト値: `false`

## 使用法 {#usage}

**設定の初期化**
```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**設定の変更**
```sql
ALTER TABLE memory MODIFY SETTING min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**注:** `bytes` および `rows` の制限パラメータは同時に設定できますが、`max` および `min` の下限は遵守されます。

## 例 {#examples}
```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_bytes_to_keep = 4096, max_bytes_to_keep = 16384;

/* 1. 最小閾値により古いブロックが削除されないことをテスト - 3000行 */
INSERT INTO memory SELECT * FROM numbers(0, 1600); -- 8'192バイト

/* 2. 削除されないブロックを追加 */
INSERT INTO memory SELECT * FROM numbers(1000, 100); -- 1'024バイト

/* 3. 古いブロックが削除されることをテスト - 9216バイト - 1100 */
INSERT INTO memory SELECT * FROM numbers(9000, 1000); -- 8'192バイト

/* 4. 非常に大きなブロックがすべてを上書きすることを確認 */
INSERT INTO memory SELECT * FROM numbers(9000, 10000); -- 65'536バイト

SELECT total_bytes, total_rows FROM system.tables WHERE name = 'memory' and database = currentDatabase();
```

```text
┌─total_bytes─┬─total_rows─┐
│       65536 │      10000 │
└─────────────┴────────────┘
```

行に対しても：

```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_rows_to_keep = 4000, max_rows_to_keep = 10000;

/* 1. 最小閾値により古いブロックが削除されないことをテスト - 3000行 */
INSERT INTO memory SELECT * FROM numbers(0, 1600); -- 1'600行

/* 2. 削除されないブロックを追加 */
INSERT INTO memory SELECT * FROM numbers(1000, 100); -- 100行

/* 3. 古いブロックが削除されることをテスト - 9216バイト - 1100 */
INSERT INTO memory SELECT * FROM numbers(9000, 1000); -- 1'000行

/* 4. 非常に大きなブロックがすべてを上書きすることを確認 */
INSERT INTO memory SELECT * FROM numbers(9000, 10000); -- 10'000行

SELECT total_bytes, total_rows FROM system.tables WHERE name = 'memory' and database = currentDatabase();
```

```text
┌─total_bytes─┬─total_rows─┐
│       65536 │      10000 │
└─────────────┴────────────┘
```
