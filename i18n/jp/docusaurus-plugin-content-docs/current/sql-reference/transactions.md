---
slug: /guides/developer/transactional
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# トランザクショナル (ACID) サポート

## ケース 1: MergeTree* ファミリーの 1 つのテーブルの 1 つのパーティションに INSERT {#case-1-insert-into-one-partition-of-one-table-of-the-mergetree-family}

これは、挿入された行がパックされ、単一のブロックとして挿入される場合にトランザクショナル (ACID) です（ノートを参照してください）：
- 原子性: INSERT は全体として成功するか、拒否されます: クライアントに確認が送信される場合、すべての行が挿入されたことになります; クライアントにエラーが送信される場合、行は挿入されません。
- 一貫性: テーブル制約が違反されていない場合、INSERT のすべての行が挿入され、INSERT が成功します; 制約が違反された場合は、行は挿入されません。
- 分離性: 同時クライアントはテーブルの一貫したスナップショットを観察します - テーブルの状態は INSERT 試行前の状態、または成功した INSERT の後の状態としてしか見えません; 部分的な状態は見えません。別のトランザクション内のクライアントは [スナップショット分離](https://en.wikipedia.org/wiki/Snapshot_isolation) を持ち、トランザクション外のクライアントは [未コミット読取](https://en.wikipedia.org/wiki/Isolation_(database_systems)#Read_uncommitted) 分離レベルを持ちます。
- 耐久性: 成功した INSERT は、クライアントへの応答前にファイルシステムに書き込まれます。これには単一のレプリカまたは複数のレプリカが含まれます（`insert_quorum` 設定によって制御されます）。ClickHouse は、ストレージメディアのファイルシステムデータを同期するために OS に要求できます（`fsync_after_insert` 設定によって制御されます）。
- 1 つのステートメントで複数のテーブルに INSERT することは、マテリアライズドビューが関与する場合に可能です（クライアントからの INSERT は、関連するマテリアライズドビューを持つテーブルに対するものです）。

## ケース 2: MergeTree* ファミリーの 1 つのテーブルの複数のパーティションに INSERT {#case-2-insert-into-multiple-partitions-of-one-table-of-the-mergetree-family}

上記のケース 1 と同様ですが、次の詳細があります：
- テーブルに多くのパーティションがあり、INSERT が多くのパーティションをカバーする場合、すべてのパーティションへの挿入はそれぞれ独自にトランザクショナルです。

## ケース 3: MergeTree* ファミリーの 1 つの分散テーブルに INSERT {#case-3-insert-into-one-distributed-table-of-the-mergetree-family}

上記のケース 1 と同様ですが、次の詳細があります：
- 分散テーブルへの INSERT は全体としてはトランザクショナルではありませんが、各シャードへの挿入はトランザクショナルです。

## ケース 4: バッファテーブルを使用 {#case-4-using-a-buffer-table}

- バッファテーブルへの挿入は原子性、分離性、一貫性、耐久性を持ちません。

## ケース 5: async_insert を使用 {#case-5-using-async_insert}

上記のケース 1 と同様ですが、次の詳細があります：
- `async_insert` が有効で `wait_for_async_insert` が 1 に設定されている場合（デフォルト）、原子性は保証されますが、`wait_for_async_insert` が 0 に設定されている場合、原子性は保証されません。

## ノート {#notes}
- クライアントから挿入された行は、次の条件で単一ブロックにパックされます：
  - 挿入形式が行ベース（CSV、TSV、Values、JSONEachRow など）の場合、データが `max_insert_block_size` 行未満（デフォルトで約 1,000,000 行）または並列解析が使用されている場合（デフォルトで有効）に `min_chunk_bytes_for_parallel_parsing` バイト未満（デフォルトで 10 MB）であるとき
  - 挿入形式が列ベース（Native、Parquet、ORC など）の場合、データが 1 つのデータブロックのみを含むとき
- 挿入ブロックのサイズは一般的に多くの設定（`max_block_size`、`max_insert_block_size`、`min_insert_block_size_rows`、`min_insert_block_size_bytes`、`preferred_block_size_bytes` など）に依存します。
- クライアントがサーバーからの応答を受け取らなかった場合、クライアントはトランザクションが成功したかどうかを認識できず、正確に一度挿入できるプロパティを使用してトランザクションを繰り返すことができます。
- ClickHouse は、同時トランザクションのために [MVCC](https://en.wikipedia.org/wiki/Multiversion_concurrency_control) と [スナップショット分離](https://en.wikipedia.org/wiki/Snapshot_isolation) を内部で使用しています。
- すべての ACID 特性は、サーバーの停止/クラッシュの場合でも有効です。
- 一般的な設定では、durable な挿入を確保するために異なる AZ への `insert_quorum` または `fsync` のいずれかを有効にする必要があります。
- ACID 用語での「一貫性」は分散システムのセマンティクスをカバーしておらず、https://jepsen.io/consistency で確認できます。これは異なる設定（select_sequential_consistency）によって制御されます。
- この説明は、複数のテーブル、マテリアライズドビュー、複数の SELECT に渡る完全なトランザクションを持つことを可能にする新しいトランザクション機能をカバーしていません（次のセクションのトランザクション、コミット、ロールバックを参照してください）。

## トランザクション、コミット、ロールバック {#transactions-commit-and-rollback}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

このドキュメントの冒頭で説明した機能に加えて、ClickHouse はトランザクション、コミット、およびロールバック機能の実験的サポートを提供します。

### 要件 {#requirements}

- トランザクションを追跡するために ClickHouse Keeper または ZooKeeper をデプロイする
- 原子データベースのみ（デフォルト）
- 非レプリケートの MergeTree テーブルエンジンのみ
- `config.d/transactions.xml` にこの設定を追加して実験的トランザクションサポートを有効にします：
  ```xml
  <clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
  </clickhouse>
  ```

### ノート {#notes-1}
- これは実験的な機能であり、変更があることが予想されます。
- トランザクション中に例外が発生した場合、トランザクションをコミットできません。これは、タイプミスによって引き起こされる `UNKNOWN_FUNCTION` 例外を含むすべての例外に該当します。
- ネストされたトランザクションはサポートされていません; 現在のトランザクションを完了し、新しいトランザクションを開始してください。

### 構成 {#configuration}

これらの例は、ClickHouse Keeper が有効になった単一ノード ClickHouse サーバーに基づいています。

#### 実験的トランザクションサポートを有効にする {#enable-experimental-transaction-support}

```xml title=/etc/clickhouse-server/config.d/transactions.xml
<clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

#### ClickHouse Keeper が有効になった単一の ClickHouse サーバーノードの基本構成 {#basic-configuration-for-a-single-clickhouse-server-node-with-clickhouse-keeper-enabled}

:::note
ClickHouse サーバーのデプロイと適切な ClickHouse Keeper ノードのクオラムに関する詳細については、[デプロイメント](/deployment-guides/terminology.md) ドキュメントを参照してください。ここに示す構成は実験的な目的です。
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

#### 実験的トランザクションが有効になっていることを確認 {#verify-that-experimental-transactions-are-enabled}

`BEGIN TRANSACTION` または `START TRANSACTION` を発行し、その後 `ROLLBACK` を実行して、実験的トランザクションが有効になっていることを確認してください。また、ClickHouse Keeper が有効である必要があります。

```sql
BEGIN TRANSACTION
```
```response
Ok.
```

:::tip
次のエラーが表示された場合は、設定ファイルを確認し、`allow_experimental_transactions` が `1`（または `0` または `false` 以外の任意の値）に設定されていることを確認してください。

```response
Code: 48. DB::Exception: Received from localhost:9000.
DB::Exception: Transactions are not supported.
(NOT_IMPLEMENTED)
```

ClickHouse Keeper を確認するために次のコマンドも実行できます。

```bash
echo ruok | nc localhost 9181
```

ClickHouse Keeper は `imok` と応答する必要があります。
:::

```sql
ROLLBACK
```

```response
Ok.
```

#### テスト用のテーブルを作成 {#create-a-table-for-testing}

:::tip
テーブルの作成はトランザクショナルではありません。 このDDLクエリはトランザクション外で実行してください。
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

#### トランザクションを開始し、行を挿入 {#begin-a-transaction-and-insert-a-row}

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
トランザクション内からテーブルをクエリすると、まだコミットされていないにもかかわらず行が挿入されていることがわかります。
:::

#### トランザクションをロールバックし、テーブルを再度クエリ {#rollback-the-transaction-and-query-the-table-again}

トランザクションがロールバックされたことを確認してください：

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

#### トランザクションを完了し、テーブルを再度クエリ {#complete-a-transaction-and-query-the-table-again}

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

### トランザクションの内部確認 {#transactions-introspection}

`system.transactions` テーブルにクエリを発行することでトランザクションを調査できますが、トランザクション中のセッションからそのテーブルをクエリすることはできません。別の `clickhouse client` セッションを開いてそのテーブルをクエリしてください。

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

この [メタ問題](https://github.com/ClickHouse/ClickHouse/issues/48794) を参照して、より広範なテストを見つけ、進捗を把握してください。
