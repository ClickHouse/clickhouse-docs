---
slug: /engines/table-engines/special/memory
sidebar_position: 110
sidebar_label:  メモリ
title: "メモリ テーブル エンジン"
description: "メモリエンジンは、RAM内に非圧縮形式でデータを保存します。データは、読み取るときに受信したときと同じ形式で保存されます。言い換えれば、このテーブルからの読み取りは完全に無料です。"
---

# メモリ テーブル エンジン

:::note
ClickHouse Cloudでメモリテーブルエンジンを使用する場合、データは全ノード間でレプリケーションされません（設計上の理由）。すべてのクエリが同じノードにルーティングされ、メモリテーブルエンジンが期待通りに動作することを保証するために、次のいずれかを行うことができます：
- 同じセッション内ですべての操作を実行する
- [clickhouse-client](/interfaces/cli)のように、TCPまたはネイティブインターフェースを使用するクライアントを使用する（これにより、スティッキー接続がサポートされます）
:::

メモリエンジンは、RAM内に非圧縮形式でデータを保存します。データは、読み取るときに受信したときと同じ形式で保存されます。言い換えれば、このテーブルからの読み取りは完全に無料です。
同時データアクセスは同期されています。ロックは短時間で、読み取りと書き込みの操作が互いにブロックしません。
インデックスはサポートされていません。読み取りは並列化されています。

最大の生産性（10 GB/sec以上）は、ディスクからの読み取り、データの解凍、またはデシリアライズがないため、単純なクエリで達成されます。（多くの場合、MergeTreeエンジンの生産性はほぼ同じ程度であることに注意する必要があります。）
サーバーを再起動すると、テーブルからデータが消失し、テーブルは空になります。
通常、このテーブルエンジンの使用は正当化されません。しかし、テストや比較的少数の行（約100,000,000行まで）で最大のスピードが必要なタスクには使用できます。

メモリエンジンは、外部クエリデータを持つ一時テーブルのためにシステムによって使用されます（「クエリを処理するための外部データ」セクションを参照）、および `GLOBAL IN`の実装に使用されます（「IN演算子」セクションを参照）。

メモリエンジンのテーブルサイズを制限するために上限と下限を指定することができ、効果的に円形バッファーとして機能させることができます（[エンジンパラメータ](#engine-parameters)を参照）。

## エンジンパラメータ {#engine-parameters}

- `min_bytes_to_keep` — メモリテーブルがサイズ制限されているときに保持する最小バイト数。
  - デフォルト値: `0`
  - `max_bytes_to_keep`が必要
- `max_bytes_to_keep` — 古い行が各挿入時に削除されるメモリテーブル内の最大バイト数（つまり、円形バッファー）。最大バイト数は、大きなブロックを追加する際に削除対象の最古の行のバッチが`min_bytes_to_keep`制限に該当する場合には、指定された上限を超えることがあります。
  - デフォルト値: `0`
- `min_rows_to_keep` — メモリテーブルがサイズ制限されているときに保持する最小行数。
  - デフォルト値: `0`
  - `max_rows_to_keep`が必要
- `max_rows_to_keep` — 古い行が各挿入時に削除されるメモリテーブル内の最大行数（つまり、円形バッファー）。最大行数は、大きなブロックを追加する際に削除対象の最古の行のバッチが`min_rows_to_keep`制限に該当する場合には、指定された上限を超えることがあります。
  - デフォルト値: `0`
- `compress` - メモリ内のデータを圧縮するかどうか。
  - デフォルト値: `false`

## 使用法 {#usage}

**設定の初期化**
``` sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**設定の変更**
```sql
ALTER TABLE memory MODIFY SETTING min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**注意:** `bytes`と`rows`の上限パラメータは同時に設定できますが、`max`と`min`の下限は遵守されます。

## 例 {#examples}
``` sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_bytes_to_keep = 4096, max_bytes_to_keep = 16384;

/* 1. 最古のブロックが最小しきい値のため削除されないことのテスト - 3000 行 */
INSERT INTO memory SELECT * FROM numbers(0, 1600); -- 8'192 バイト

/* 2. 削除されないブロックを追加 */
INSERT INTO memory SELECT * FROM numbers(1000, 100); -- 1'024 バイト

/* 3. 最古のブロックが削除されるテスト - 9216 バイト - 1100 */
INSERT INTO memory SELECT * FROM numbers(9000, 1000); -- 8'192 バイト

/* 4. 非常に大きなブロックがすべてを上書きするか確認する */
INSERT INTO memory SELECT * FROM numbers(9000, 10000); -- 65'536 バイト

SELECT total_bytes, total_rows FROM system.tables WHERE name = 'memory' and database = currentDatabase();
```

``` text
┌─total_bytes─┬─total_rows─┐
│       65536 │      10000 │
└─────────────┴────────────┘
```

行についても:

``` sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_rows_to_keep = 4000, max_rows_to_keep = 10000;

/* 1. 最古のブロックが最小しきい値のため削除されないことのテスト - 3000 行 */
INSERT INTO memory SELECT * FROM numbers(0, 1600); -- 1'600 行

/* 2. 削除されないブロックを追加 */
INSERT INTO memory SELECT * FROM numbers(1000, 100); -- 100 行

/* 3. 最古のブロックが削除されるテスト - 9216 バイト - 1100 */
INSERT INTO memory SELECT * FROM numbers(9000, 1000); -- 1'000 行

/* 4. 非常に大きなブロックがすべてを上書きするか確認する */
INSERT INTO memory SELECT * FROM numbers(9000, 10000); -- 10'000 行

SELECT total_bytes, total_rows FROM system.tables WHERE name = 'memory' and database = currentDatabase();
```

``` text
┌─total_bytes─┬─total_rows─┐
│       65536 │      10000 │
└─────────────┴────────────┘
```
