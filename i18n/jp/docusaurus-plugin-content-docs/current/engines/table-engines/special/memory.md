---
'description': 'Memory エンジンはデータをRAMに、非圧縮形式で保存します。データは、読み取る際に受信したものと全く同じ形式で保存されます。言い換えれば、このテーブルからの読み取りは完全に無料です。'
'sidebar_label': 'メモリ'
'sidebar_position': 110
'slug': '/engines/table-engines/special/memory'
'title': 'メモリテーブルエンジン'
'doc_type': 'reference'
---


# メモリテーブルエンジン

:::note
ClickHouse Cloud でメモリテーブルエンジンを使用する際、データはすべてのノードにレプリケートされません（設計上）。すべてのクエリが同じノードにルーティングされ、メモリテーブルエンジンが期待通りに機能することを保証するために、次のいずれかを行うことができます：
- 同じセッション内ですべての操作を実行する
- [clickhouse-client](/interfaces/cli) のような TCP またはネイティブインターフェースを使用するクライアントを使用する（これによりスティッキー接続がサポートされます）
:::

メモリエンジンは、データを RAM に圧縮されていない形式で保存します。データは、読み取る際に受け取ったのとまったく同じ形式で保存されます。言い換えれば、このテーブルからの読み取りは完全に無料です。
同時データアクセスは同期されます。ロックは短時間です：読み取りおよび書き込み操作は互いにブロックしません。
インデックスはサポートされていません。読み取りは並列化されます。

最大生産性（10 GB/秒を超える）は、ディスクからの読み取り、データの解凍、またはデシリアライズがないため、単純なクエリで達成されます。（多くの場合、MergeTree エンジンの生産性もほぼ同じくらい高いことに注意する必要があります。）
サーバーを再起動すると、テーブルからデータが消え、テーブルは空になります。
通常、このテーブルエンジンを使用することは正当化されません。ただし、テストや比較的小数の行（約 100,000,000 行まで）で最大速度が必要なタスクに使用できます。

メモリエンジンは、外部クエリデータを持つ一時テーブル（「クエリ処理のための外部データ」セクションを参照）や、`GLOBAL IN` の実装（「IN 演算子」セクションを参照）のためにシステムによって使用されます。

メモリエンジンのテーブルサイズを制限するために上限および下限を指定でき、これにより円形バッファとして機能させることができます（[エンジンパラメータ](#engine-parameters)を参照）。

## エンジンパラメータ {#engine-parameters}

- `min_bytes_to_keep` — メモリテーブルのサイズが制限されている場合に保持する最小バイト数。
  - デフォルト値： `0`
  - `max_bytes_to_keep` を必要とする
- `max_bytes_to_keep` — 挿入ごとに古い行が削除されるメモリテーブル内で保持する最大バイト数（すなわち円形バッファ）。最大バイト数は、古い削除対象の行のバッチが大きなブロックを追加したときに `min_bytes_to_keep` の制限に入った場合を超えることができます。
  - デフォルト値： `0`
- `min_rows_to_keep` — メモリテーブルのサイズが制限されている場合に保持する最小行数。
  - デフォルト値： `0`
  - `max_rows_to_keep` を必要とする
- `max_rows_to_keep` — 挿入ごとに古い行が削除されるメモリテーブル内で保持する最大行数（すなわち円形バッファ）。最大行数は、古い削除対象の行のバッチが大きなブロックを追加したときに `min_rows_to_keep` の制限に入った場合を超えることができます。
  - デフォルト値： `0`
- `compress` - メモリ内のデータを圧縮するかどうか。
  - デフォルト値： `false`

## 使い方 {#usage}

**設定の初期化**
```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**設定の変更**
```sql
ALTER TABLE memory MODIFY SETTING min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**注:** `bytes` と `rows` の両方の制限パラメータは同時に設定できますが、`max` と `min` の下限は遵守されます。

## 例 {#examples}
```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_bytes_to_keep = 4096, max_bytes_to_keep = 16384;

/* 1. testing oldest block doesn't get deleted due to min-threshold - 3000 rows */
INSERT INTO memory SELECT * FROM numbers(0, 1600); -- 8'192 bytes

/* 2. adding block that doesn't get deleted */
INSERT INTO memory SELECT * FROM numbers(1000, 100); -- 1'024 bytes

/* 3. testing oldest block gets deleted - 9216 bytes - 1100 */
INSERT INTO memory SELECT * FROM numbers(9000, 1000); -- 8'192 bytes

/* 4. checking a very large block overrides all */
INSERT INTO memory SELECT * FROM numbers(9000, 10000); -- 65'536 bytes

SELECT total_bytes, total_rows FROM system.tables WHERE name = 'memory' AND database = currentDatabase();
```

```text
┌─total_bytes─┬─total_rows─┐
│       65536 │      10000 │
└─────────────┴────────────┘
```

行の場合も：

```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_rows_to_keep = 4000, max_rows_to_keep = 10000;

/* 1. testing oldest block doesn't get deleted due to min-threshold - 3000 rows */
INSERT INTO memory SELECT * FROM numbers(0, 1600); -- 1'600 rows

/* 2. adding block that doesn't get deleted */
INSERT INTO memory SELECT * FROM numbers(1000, 100); -- 100 rows

/* 3. testing oldest block gets deleted - 9216 bytes - 1100 */
INSERT INTO memory SELECT * FROM numbers(9000, 1000); -- 1'000 rows

/* 4. checking a very large block overrides all */
INSERT INTO memory SELECT * FROM numbers(9000, 10000); -- 10'000 rows

SELECT total_bytes, total_rows FROM system.tables WHERE name = 'memory' AND database = currentDatabase();
```

```text
┌─total_bytes─┬─total_rows─┐
│       65536 │      10000 │
└─────────────┴────────────┘
```
