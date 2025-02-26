---
slug: /guides/developer/transactional
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# トランザクショナル (ACID) サポート

## ケース 1: MergeTree* ファミリーのテーブルの1つのパーティションにINSERT {#case-1-insert-into-one-partition-of-one-table-of-the-mergetree-family}

これはトランザクション (ACID) です。挿入された行が1つのブロックとしてパッキングされて挿入される場合 (ノートを参照):
- 原子性: INSERTが成功するか、全体として拒否されます: クライアントに確認が送信されると、すべての行が挿入されます; エラーがクライアントに送信されると、行は挿入されません。
- 一貫性: テーブル制約に違反がなければ、INSERT内のすべての行が挿入され、INSERTは成功します; 制約が違反された場合、行は一切挿入されません。
- 分離性: 同時クライアントはテーブルの一貫したスナップショットを観察します - INSERT試行の前の状態か、成功したINSERTの後の状態のいずれかです; 部分的な状態は見られません。別のトランザクション内のクライアントは[スナップショット分離](https://en.wikipedia.org/wiki/Snapshot_isolation)を持ち、トランザクションの外にいるクライアントは[未コミット読み取り](https://en.wikipedia.org/wiki/Isolation_(database_systems)#Read_uncommitted)の分離レベルです。
- 耐久性: 成功したINSERTは、クライアントに応答する前にファイルシステムに書き込まれます。これは、単一レプリカまたは複数のレプリカ上で行われます（`insert_quorum` 設定によって制御されます）、また ClickHouse は OS にファイルシステムデータをストレージメディアに同期させるようリクエストできます（`fsync_after_insert` 設定によって制御されます）。
- 一つのステートメントで複数のテーブルへのINSERTが可能です（クライアントのINSERTは関連するマテリアライズドビューを持つテーブルに向けられます）。

## ケース 2: MergeTree* ファミリーのテーブルの複数のパーティションにINSERT {#case-2-insert-into-multiple-partitions-of-one-table-of-the-mergetree-family}

上記のケース1と同様ですが、この詳細があります:
- テーブルに多くのパーティションがあり、INSERTが多くのパーティションをカバーしている場合、各パーティションへの挿入はそれぞれ独自のトランザクションになります。

## ケース 3: MergeTree* ファミリーの1つの分散テーブルにINSERT {#case-3-insert-into-one-distributed-table-of-the-mergetree-family}

上記のケース1と同様ですが、この詳細があります:
- 分散テーブルへのINSERTは全体としてトランザクションではありませんが、各シャードへの挿入はトランザクションです。

## ケース 4: バッファテーブルを使用する {#case-4-using-a-buffer-table}

- バッファテーブルへのINSERTは、原子性も分離性も一貫性も耐久性もありません。

## ケース 5: async_insertを使用する {#case-5-using-async_insert}

上記のケース1と同様ですが、この詳細があります:
- `async_insert`が有効で`wait_for_async_insert`が1（デフォルト）に設定されている場合も原子性は保証されますが、`wait_for_async_insert`が0に設定されている場合は原子性が保証されません。

## ノート {#notes}
- クライアントからのデータ形式で挿入された行は、以下のときに単一のブロックにパッキングされます:
  - 挿入形式が行ベース（CSV、TSV、Values、JSONEachRowなど）であり、データが`max_insert_block_size`行未満（デフォルトで約1,000,000行）または`min_chunk_bytes_for_parallel_parsing`バイト未満（デフォルトで10 MB）の場合、並列解析が使用されているとき（デフォルトで有効）。
  - 挿入形式が列ベース（Native、Parquet、ORCなど）であり、データが単一のデータブロックのみを含む場合。
- 挿入されたブロックのサイズは一般に多くの設定に依存する場合があります（例えば:`max_block_size`, `max_insert_block_size`, `min_insert_block_size_rows`, `min_insert_block_size_bytes`, `preferred_block_size_bytes`など）。
- サーバーからクライアントが応答を受け取らなかった場合、クライアントはトランザクションが成功したかどうかわからず、正確に一度挿入プロパティを使用してトランザクションを繰り返すことができます。
- ClickHouseは、同時トランザクションのために内部で[MVC](https://en.wikipedia.org/wiki/Multiversion_concurrency_control)と[スナップショット分離](https://en.wikipedia.org/wiki/Snapshot_isolation)を使用しています。
- すべてのACIDプロパティはサーバーが切断・クラッシュされた場合でも有効です。
- 一般的に耐久性のある挿入を保証するには、異なるAZへの`insert_quorum`または`fsync`のいずれかを有効にする必要があります。
- ACID用語での「一貫性」は、分散システムのセマンティクスをカバーしておらず、https://jepsen.io/consistencyを参照してください。また、これは異なる設定（select_sequential_consistency）によって制御されます。
- この説明は、複数のテーブル、マテリアライズドビュー、複数のSELECTにわたってフル機能のトランザクションを持つことを可能にする新しいトランザクション機能をカバーしていません（次のセクションのトランザクション、コミット、ロールバックを参照）。

## トランザクション、コミット、ロールバック {#transactions-commit-and-rollback}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

この文書の先頭で説明された機能に加えて、ClickHouseはトランザクション、コミット、ロールバック機能に対する実験的なサポートを提供しています。

### 要件 {#requirements}

- トランザクションを追跡するためにClickHouse KeeperまたはZooKeeperをデプロイします。
- 原子DBのみ（デフォルト）
- 非レプリケーションMergeTreeテーブルエンジンのみ
- `config.d/transactions.xml`にこの設定を追加して実験的トランザクションサポートを有効にします:
  ```xml
  <clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
  </clickhouse>
  ```

### ノート {#notes-1}
- これは実験的な機能であり、変更が期待されます。
- トランザクション中に例外が発生した場合、そのトランザクションをコミットできません。これには、タイプミスによって引き起こされる`UNKNOWN_FUNCTION`例外を含むすべての例外が含まれます。
- ネストされたトランザクションはサポートされていません; 現在のトランザクションを終了し、新しいトランザクションを開始してください。

### 設定 {#configuration}

これらの例は、ClickHouse Keeperが有効な単一ノードClickHouseサーバーを使用しています。

#### 実験的なトランザクションサポートを有効にする {#enable-experimental-transaction-support}

```xml title=/etc/clickhouse-server/config.d/transactions.xml
<clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

#### ClickHouse Keeper が有効な単一 ClickHouse サーバーノードの基本構成 {#basic-configuration-for-a-single-clickhouse-server-node-with-clickhouse-keeper-enabled}

:::note
ClickHouseサーバーと適切なクォーラムのClickHouse Keeperノードをデプロイするための詳細は、[デプロイメント](/deployment-guides/terminology.md) ドキュメントを参照してください。ここに示されている設定は実験目的のものです。
:::

```xml title=/etc/clickhouse-server/config.d/config.xml
<clickhouse replace="true">
    <logger>
        <level>debug</level>
        <log>/var/log/clickhouse-server/clickhouse-server.log</log>
        <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <display_name>node 1</display_name>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
    <zookeeper>
        <node>
            <host>clickhouse-01</host>
            <port>9181</port>
        </node>
    </zookeeper>
    <keeper_server>
        <tcp_port>9181</tcp_port>
        <server_id>1</server_id>
        <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
        <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>
        <coordination_settings>
            <operation_timeout_ms>10000</operation_timeout_ms>
            <session_timeout_ms>30000</session_timeout_ms>
            <raft_logs_level>information</raft_logs_level>
        </coordination_settings>
        <raft_configuration>
            <server>
                <id>1</id>
                <hostname>clickhouse-keeper-01</hostname>
                <port>9234</port>
            </server>
        </raft_configuration>
    </keeper_server>
</clickhouse>
```

### 例 {#example}

#### 実験的トランザクションが有効になっていることを確認する {#verify-that-experimental-transactions-are-enabled}

`BEGIN TRANSACTION`または`START TRANSACTION`を発行し、その後`ROLLBACK`を行って、実験的なトランザクションが有効であり、ClickHouse Keeperが有効でトランザクションを追跡するために使用されていることを確認します。

```sql
BEGIN TRANSACTION
```
```response
Ok.
```

:::tip
次のエラーが表示された場合は、設定ファイルを確認して、`allow_experimental_transactions`が`1`（または`0`または`false`以外の任意の値）に設定されていることを確認してください。

```response
Code: 48. DB::Exception: Received from localhost:9000.
DB::Exception: Transactions are not supported.
(NOT_IMPLEMENTED)
```

また、次のコマンドを発行してClickHouse Keeperを確認することもできます。

```bash
echo ruok | nc localhost 9181
```

ClickHouse Keeperは`imok`で応答するはずです。
:::

```sql
ROLLBACK
```

```response
Ok.
```

#### テスト用のテーブルを作成する {#create-a-table-for-testing}

:::tip
テーブルの作成はトランザクションではありません。このDDLクエリはトランザクションの外で実行してください。
:::

```sql
CREATE TABLE mergetree_table
(
    `n` Int64
)
ENGINE = MergeTree
ORDER BY n
```

```response
Ok.
```

#### トランザクションを開始し、行を挿入する {#begin-a-transaction-and-insert-a-row}

```sql
BEGIN TRANSACTION
```

```response
Ok.
```

```sql
INSERT INTO mergetree_table FORMAT Values (10)
```

```response
Ok.
```

```sql
SELECT *
FROM mergetree_table
```

```response
┌──n─┐
│ 10 │
└────┘
```

:::note
トランザクション内からテーブルをクエリすることができ、行が挿入されたことを確認できますが、まだコミットされていません。
:::

#### トランザクションをロールバックし、再度テーブルをクエリする {#rollback-the-transaction-and-query-the-table-again}

トランザクションがロールバックされたことを確認します:

```sql
ROLLBACK
```

```response
Ok.
```

```sql
SELECT *
FROM mergetree_table
```
```response
Ok.

0 rows in set. Elapsed: 0.002 sec.
```

#### トランザクションを完了し、再度テーブルをクエリする {#complete-a-transaction-and-query-the-table-again}

```sql
BEGIN TRANSACTION
```
```response
Ok.
```

```sql
INSERT INTO mergetree_table FORMAT Values (42)
```

```response
Ok.
```

```sql
COMMIT
```

```response
Ok. Elapsed: 0.002 sec.
```

```sql
SELECT *
FROM mergetree_table
```

```response
┌──n─┐
│ 42 │
└────┘
```

### トランザクションのインスペクション {#transactions-introspection}

`system.transactions` テーブルをクエリすることでトランザクションを検査できますが、そのテーブルをトランザクション内のセッションからクエリすることはできません。2番目の`clickhouse client`セッションを開いてそのテーブルをクエリしてください。

```sql
SELECT *
FROM system.transactions
FORMAT Vertical
```

```response
Row 1:
──────
tid:         (33,61,'51e60bce-6b82-4732-9e1d-b40705ae9ab8')
tid_hash:    11240433987908122467
elapsed:     210.017820947
is_readonly: 1
state:       RUNNING
```

## さらなる詳細 {#more-details}

この[メタ問題](https://github.com/ClickHouse/ClickHouse/issues/48794)を見て、より広範なテストを見つけ、進行状況を最新の状態に保つことができます。
