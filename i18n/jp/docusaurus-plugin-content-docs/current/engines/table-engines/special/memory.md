---
description: 'The Memory engine stores data in RAM, in uncompressed form. Data is
  stored in exactly the same form as it is received when read. In other words, reading
  from this table is completely free.'
sidebar_label: 'Memory'
sidebar_position: 110
slug: '/engines/table-engines/special/memory'
title: 'Memory Table Engine'
---




# Memory Table Engine

:::note
ClickHouse CloudでMemoryテーブルエンジンを使用する際、データはすべてのノード間でレプリケーションされません（設計上）。すべてのクエリが同じノードにルーティングされ、Memoryテーブルエンジンが期待どおりに機能することを保証するために、次のいずれかを行うことができます：
- 同じセッション内ですべての操作を実行する
- [clickhouse-client](/interfaces/cli) のようにTCPまたはネイティブインターフェースを使用するクライアントを使用する（これによりスティッキー接続がサポートされます）
:::

MemoryエンジンはデータをRAMに非圧縮形式で保存します。データは読み取られるときに受け取ったままの形式で保存されます。言い換えれば、このテーブルからの読み取りは完全に無料です。
同時データアクセスは同期されます。ロックは短時間で済みます：読み取りと書き込みの操作は互いにブロックしません。
インデックスはサポートされていません。読み取りは並列処理されます。

最大の生産性（10GB/秒を超える）はシンプルなクエリで達成されます。これは、ディスクからの読み取り、データの解凍、またはデシリアライズがないためです。（多くのケースで、MergeTreeエンジンの生産性もほぼ同じくらい高いことに注意する必要があります。）
サーバーを再起動すると、データはテーブルから消え、テーブルは空になります。
通常、このテーブルエンジンの使用は正当化されません。しかし、テストや相対的に少数の行（約100,000,000行まで）で最大の速度が必要なタスクには使用することができます。

Memoryエンジンは、外部クエリデータを使用した一時テーブルにシステムによって使用されます（「クエリの処理のための外部データ」セクションを参照）および`GLOBAL IN`を実装するために使用されます（「IN演算子」セクションを参照）。

Memoryエンジンのテーブルサイズを制限するために上限と下限を指定でき、効果的に円形バッファとして機能します（[エンジンパラメータ](#engine-parameters)を参照）。

## Engine Parameters {#engine-parameters}

- `min_bytes_to_keep` — メモリテーブルがサイズ制限されている場合に保持する最小バイト数。
  - デフォルト値: `0`
  - `max_bytes_to_keep`を必要とします
- `max_bytes_to_keep` — メモリテーブル内で保持する最大バイト数で、最古の行は各挿入時に削除されます（つまり円形バッファ）。最古の削除対象の行のバッチが大きなブロックを追加する際に`min_bytes_to_keep`制限を下回る場合、最大バイト数は指定された制限を超えることがあります。
  - デフォルト値: `0`
- `min_rows_to_keep` — メモリテーブルがサイズ制限されている場合に保持する最小行数。
  - デフォルト値: `0`
  - `max_rows_to_keep`を必要とします
- `max_rows_to_keep` — メモリテーブル内で保持する最大行数で、最古の行は各挿入時に削除されます（つまり円形バッファ）。最古の削除対象の行のバッチが大きなブロックを追加する際に`min_rows_to_keep`制限を下回る場合、最大行数は指定された制限を超えることがあります。
  - デフォルト値: `0`
- `compress` - メモリ内のデータを圧縮するかどうか。
  - デフォルト値: `false`

## Usage {#usage}

**設定の初期化**
```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**設定の変更**
```sql
ALTER TABLE memory MODIFY SETTING min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**注意:** `bytes`と`rows`の制限パラメータは同時に設定できますが、`max`と`min`の下限は遵守されます。

## Examples {#examples}
```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_bytes_to_keep = 4096, max_bytes_to_keep = 16384;

/* 1. 最古のブロックが最小しきい値のために削除されないことをテスト - 3000行 */
INSERT INTO memory SELECT * FROM numbers(0, 1600); -- 8'192バイト

/* 2. 削除されないブロックの追加 */
INSERT INTO memory SELECT * FROM numbers(1000, 100); -- 1'024バイト

/* 3. 最古のブロックが削除されることをテスト - 9216バイト - 1100 */
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

さらに、行に関して：

```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_rows_to_keep = 4000, max_rows_to_keep = 10000;

/* 1. 最古のブロックが最小しきい値のために削除されないことをテスト - 3000行 */
INSERT INTO memory SELECT * FROM numbers(0, 1600); -- 1'600行

/* 2. 削除されないブロックの追加 */
INSERT INTO memory SELECT * FROM numbers(1000, 100); -- 100行

/* 3. 最古のブロックが削除されることをテスト - 9216バイト - 1100 */
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
