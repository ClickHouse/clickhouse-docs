---
slug: /engines/table-engines/special/memory
sidebar_position: 110
sidebar_label:  Memory
title: "メモリテーブルエンジン"
description: "メモリエンジンはデータをRAMに非圧縮の形で保存します。データは読み取られる際に受け取った時と全く同じ形で保存されます。言い換えれば、このテーブルからの読み取りは完全に無料です。"
---


# メモリテーブルエンジン

:::note
ClickHouse Cloudでメモリテーブルエンジンを使用する場合、データは全ノード間でレプリケートされません（設計上の理由）。すべてのクエリが同じノードにルーティングされ、メモリテーブルエンジンが期待通りに動作することを保証するには、以下のいずれかを行うことができます：
- 同じセッション内で全ての操作を実行する
- [clickhouse-client](/interfaces/cli)などのTCPまたはネイティブインターフェースを使用するクライアントを使用する（スティッキーコネクションのサポートを有効にします）
:::

メモリエンジンはデータをRAMに非圧縮の形で保存します。データは読み取られる際に受け取った時と全く同じ形で保存されます。言い換えれば、このテーブルからの読み取りは完全に無料です。  
同時データアクセスは同期されています。ロックは短く、読み取りと書き込みの操作は互いをブロックしません。  
インデックスはサポートされていません。読み取りは並行化されています。

最大の生産性（10 GB/sec以上）は単純なクエリで達成されます。なぜなら、ディスクからの読み取り、データの解凍、またはデシリアライズがないからです。（多くの場合、MergeTreeエンジンの生産性はほぼ同じくらい高いことに注意が必要です。）  
サーバーを再起動すると、テーブルからデータが消失し、テーブルは空になります。  
通常、このテーブルエンジンの使用は正当化されません。しかし、テストや相対的に少数の行（約100,000,000行まで）で最大速度が必要なタスクに使用することができます。

メモリエンジンは、外部クエリデータのための一時テーブル（「クエリ処理のための外部データ」セクションを参照）や `GLOBAL IN` の実装にシステムによって使用されます（「IN演算子」セクションを参照）。

メモリエンジンテーブルのサイズを制限するために上下限を指定することができ、実質的に円環バッファとして機能させることができます（[エンジンパラメータ](#engine-parameters)を参照）。

## エンジンパラメータ {#engine-parameters}

- `min_bytes_to_keep` — メモリテーブルがサイズ制限されている場合に保持する最小バイト数。
  - デフォルト値: `0`
  - `max_bytes_to_keep` を必要とする
- `max_bytes_to_keep` — 最新の行が各挿入時に削除されるメモリテーブル内の最大バイト数（つまり、円環バッファ）。最大バイト数は、大きなブロックを追加する際に削除する最古の行のバッチが `min_bytes_to_keep` 制限を下回る場合、指定された制限を超えることがあります。
  - デフォルト値: `0`
- `min_rows_to_keep` — メモリテーブルがサイズ制限されている場合に保持する最小行数。
  - デフォルト値: `0`
  - `max_rows_to_keep` を必要とする
- `max_rows_to_keep` — 最新の行が各挿入時に削除されるメモリテーブル内の最大行数（つまり、円環バッファ）。最大行数は、大きなブロックを追加する際に削除する最古の行のバッチが `min_rows_to_keep` 制限を下回る場合、指定された制限を超えることがあります。
  - デフォルト値: `0`
- `compress` - メモリ内のデータを圧縮するかどうか。
  - デフォルト値: `false`

## 使用法 {#usage}

**設定を初期化する**
``` sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**設定を変更する**
```sql
ALTER TABLE memory MODIFY SETTING min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**注:** `bytes` と `rows` の制限パラメータは同時に設定することが可能ですが、`max` と `min` の下限は遵守されます。

## 例 {#examples}
``` sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_bytes_to_keep = 4096, max_bytes_to_keep = 16384;

/* 1. 最古のブロックが最小閾値により削除されないことをテスト - 3000行 */
INSERT INTO memory SELECT * FROM numbers(0, 1600); -- 8'192バイト

/* 2. 削除されないブロックを追加する */
INSERT INTO memory SELECT * FROM numbers(1000, 100); -- 1'024バイト

/* 3. 最古のブロックが削除されることをテスト - 9216バイト - 1100 */
INSERT INTO memory SELECT * FROM numbers(9000, 1000); -- 8'192バイト

/* 4. 非常に大きなブロックがすべてを上書きすることを確認する */
INSERT INTO memory SELECT * FROM numbers(9000, 10000); -- 65'536バイト

SELECT total_bytes, total_rows FROM system.tables WHERE name = 'memory' and database = currentDatabase();
```

``` text
┌─total_bytes─┬─total_rows─┐
│       65536 │      10000 │
└─────────────┴────────────┘
```

行に関しても：

``` sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_rows_to_keep = 4000, max_rows_to_keep = 10000;

/* 1. 最古のブロックが最小閾値により削除されないことをテスト - 3000行 */
INSERT INTO memory SELECT * FROM numbers(0, 1600); -- 1'600行

/* 2. 削除されないブロックを追加する */
INSERT INTO memory SELECT * FROM numbers(1000, 100); -- 100行

/* 3. 最古のブロックが削除されることをテスト - 9216バイト - 1100 */
INSERT INTO memory SELECT * FROM numbers(9000, 1000); -- 1'000行

/* 4. 非常に大きなブロックがすべてを上書きすることを確認する */
INSERT INTO memory SELECT * FROM numbers(9000, 10000); -- 10'000行

SELECT total_bytes, total_rows FROM system.tables WHERE name = 'memory' and database = currentDatabase();
```

``` text
┌─total_bytes─┬─total_rows─┐
│       65536 │      10000 │
└─────────────┴────────────┘
```
