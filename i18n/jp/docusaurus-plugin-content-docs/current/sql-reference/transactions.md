---
'description': 'ClickHouse におけるトランザクショナル (ACID) サポートについてのページ'
'slug': '/guides/developer/transactional'
'title': 'トランザクショナル (ACID) サポート'
'doc_type': 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# トランザクション (ACID) のサポート

## ケース 1: MergeTree* ファミリーの1つのテーブルの1つのパーティションへのINSERT {#case-1-insert-into-one-partition-of-one-table-of-the-mergetree-family}

挿入された行がパックされて単一のブロックとして挿入される場合、これはトランザクション (ACID) として扱われます（注を参照）：
- **原子性**: INSERTは全体として成功するか拒否されます: クライアントに確認が送信される場合は、すべての行が挿入されており、エラーがクライアントに送信されると、行は挿入されません。
- **一貫性**: テーブル制約が違反されない場合、INSERTのすべての行は挿入され、INSERTは成功します。制約が違反された場合、行は挿入されません。
- **分離性**: 同時クライアントはテーブルの一貫したスナップショットを観察します – INSERTの試行前のテーブルの状態、または成功したINSERTの後の状態; 部分的な状態は表示されません。他のトランザクション内のクライアントは [スナップショット分離](https://en.wikipedia.org/wiki/Snapshot_isolation) を持ち、トランザクション外のクライアントは [コミットされていない読み取り](https://en.wikipedia.org/wiki/Isolation_(database_systems)#Read_uncommitted) の分離レベルを持ちます。
- **耐久性**: 成功したINSERTはクライアントに応答する前にファイルシステムに書き込まれ、単一のレプリカまたは複数のレプリカ（`insert_quorum` 設定で制御される）になります。また、ClickHouseはOSにストレージメディアのファイルシステムデータを同期するように依頼できます（`fsync_after_insert` 設定で制御される）。
- マテリアライズドビューが関与する場合、1つのステートメントで複数のテーブルへのINSERTが可能です（クライアントからのINSERTは関連するマテリアライズドビューを持つテーブルに対して行われます）。

## ケース 2: MergeTree* ファミリーの1つのテーブルへの複数のパーティションへのINSERT {#case-2-insert-into-multiple-partitions-of-one-table-of-the-mergetree-family}

上記のケース1と同様ですが、この詳細があります：
- テーブルに多くのパーティションがあり、INSERTが多くのパーティションをカバーする場合、すべてのパーティションへの挿入はそれぞれトランザクション的になります。

## ケース 3: MergeTree* ファミリーの1つの分散テーブルへのINSERT {#case-3-insert-into-one-distributed-table-of-the-mergetree-family}

上記のケース1と同様ですが、この詳細があります：
- 分散テーブルへのINSERTは全体としてトランザクション的ではありませんが、各シャードへの挿入はトランザクション的です。

## ケース 4: バッファテーブルの使用 {#case-4-using-a-buffer-table}

- バッファテーブルへの挿入は、原子性も分離性も一貫性も耐久性もありません。

## ケース 5: async_insert の使用 {#case-5-using-async_insert}

上記のケース1と同様ですが、この詳細があります：
- `async_insert`が有効で`wait_for_async_insert`が1（デフォルト）に設定されている場合でも原子性は保証されますが、`wait_for_async_insert`が0に設定されている場合は原子性は保証されません。

## 注 {#notes}
- クライアントから挿入された行は、以下の場合に単一のブロックにパックされます:
  - 挿入フォーマットが行ベース（CSV、TSV、Values、JSONEachRowなど）であり、データが `max_insert_block_size` 行（デフォルトで約1,000,000）未満であるか、並列パーシングが使用されている場合の `min_chunk_bytes_for_parallel_parsing` バイト（デフォルトで10MB）未満である場合
  - 挿入フォーマットが列ベース（Native、Parquet、ORCなど）であり、データが1ブロックのデータのみである場合
- 挿入されるブロックのサイズは多くの設定に依存する場合があります（例: `max_block_size`, `max_insert_block_size`, `min_insert_block_size_rows`, `min_insert_block_size_bytes`, `preferred_block_size_bytes` など）。
- クライアントがサーバーから応答を受け取らなかった場合、トランザクションが成功したかどうかわからず、トランザクションを繰り返すことができます。これは正確に1回のみの挿入プロパティを使用します。
- ClickHouseは、同時トランザクションのために内部で [MVCC](https://en.wikipedia.org/wiki/Multiversion_concurrency_control) と [スナップショット分離](https://en.wikipedia.org/wiki/Snapshot_isolation) を使用しています。
- すべてのACIDプロパティは、サーバーの強制終了やクラッシュのケースでも有効です。
- 一般的なセットアップでは、耐久性のある挿入を確保するために異なるAZへの`insert_quorum`または`fsync`のいずれかを有効にする必要があります。
- ACID用語の「一貫性」は分散システムのセマンティクスをカバーしないため、異なる設定（select_sequential_consistency）によって制御される https://jepsen.io/consistency を参照してください。
- この説明では、複数のテーブル、マテリアライズドビュー、複数のSELECT に対してフル機能のトランザクションを提供する新しいトランザクション機能はカバーされていません（トランザクション、コミット、およびロールバックに関する次のセクションを参照してください）。

## トランザクション、コミット、およびロールバック {#transactions-commit-and-rollback}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

このドキュメントの冒頭で説明された機能に加えて、ClickHouseにはトランザクション、コミット、およびロールバック機能の実験的なサポートがあります。

### 要件 {#requirements}

- トランザクションを追跡するために ClickHouse Keeper または ZooKeeper をデプロイします。
- 原子DB のみ (デフォルト)
- 非レプリケートの MergeTree テーブルエンジンのみ
- `config.d/transactions.xml` にこの設定を追加して実験的トランザクションサポートを有効にします:
```xml
<clickhouse>
  <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

### 注 {#notes-1}
- これは実験的な機能であり、変更が予想されます。
- トランザクション中に例外が発生した場合、トランザクションをコミットできません。これはすべての例外を含み、タイプミスによって引き起こされる `UNKNOWN_FUNCTION` 例外を含みます。
- ネストされたトランザクションはサポートされていません; 現在のトランザクションを完了し、新しいトランザクションを開始してください。

### 設定 {#configuration}

これらの例は、ClickHouse Keeper が有効になっている単一ノードの ClickHouse サーバーです。

#### 実験的トランザクションサポートを有効にする {#enable-experimental-transaction-support}

```xml title=/etc/clickhouse-server/config.d/transactions.xml
<clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

#### ClickHouse Keeper が有効な単一 ClickHouse サーバーノードの基本設定 {#basic-configuration-for-a-single-clickhouse-server-node-with-clickhouse-keeper-enabled}

:::note
ClickHouse サーバーをデプロイする詳細については、[デプロイメント](/deployment-guides/terminology.md) ドキュメントを参照し、ClickHouse Keeper ノードの適切なクォーラムを確認してください。ここに示す設定は実験的な目的のためです。
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

`BEGIN TRANSACTION` または `START TRANSACTION` を発行し、その後に `ROLLBACK` を続けて、実験的トランザクションが有効であることを確認し、トランザクションを追跡するために使用される ClickHouse Keeper が有効であることを確認します。

```sql
BEGIN TRANSACTION
```
```response
Ok.
```

:::tip
次のエラーが表示された場合は、構成ファイルを確認して、`allow_experimental_transactions` が `1`（または `0` または `false` 以外の任意の値）に設定されていることを確認してください。

```response
Code: 48. DB::Exception: Received from localhost:9000.
DB::Exception: Transactions are not supported.
(NOT_IMPLEMENTED)
```

また、次のように ClickHouse Keeper を確認できます。

```bash
echo ruok | nc localhost 9181
```

ClickHouse Keeper は `imok` で応答する必要があります。
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
トランザクション内からテーブルをクエリし、行が挿入されていることを確認できますが、まだコミットされていません。
:::

#### トランザクションをロールバックし、再度テーブルをクエリする {#rollback-the-transaction-and-query-the-table-again}

トランザクションがロールバックされたことを確認します。

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

### トランザクションのイントロスペクション {#transactions-introspection}

`system.transactions` テーブルをクエリすることでトランザクションを調査できますが、トランザクション内のセッションからそのテーブルをクエリすることはできません。別の `clickhouse client` セッションを開いてそのテーブルをクエリしてください。

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

## 詳細情報 {#more-details}

この [メタ問題](https://github.com/ClickHouse/ClickHouse/issues/48794) を参照して、より広範なテストを見つけ、進捗状況を把握してください。
