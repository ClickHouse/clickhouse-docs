---
description: 'ClickHouse におけるトランザクション（ACID）サポートに関するページ'
slug: /guides/developer/transactional
title: 'トランザクション（ACID）サポート'
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# トランザクション（ACID）対応



## ケース1: MergeTree\*ファミリーの1つのテーブルの1つのパーティションへのINSERT {#case-1-insert-into-one-partition-of-one-table-of-the-mergetree-family}

挿入される行が単一のブロックとしてパックされて挿入される場合、これはトランザクショナル(ACID)です(注記を参照):

- 原子性(Atomic): INSERTは全体として成功するか拒否されます。クライアントに確認が送信された場合、すべての行が挿入されています。クライアントにエラーが送信された場合、行は一切挿入されていません。
- 一貫性(Consistent): テーブル制約が違反されていない場合、INSERTのすべての行が挿入されINSERTは成功します。制約が違反されている場合、行は一切挿入されません。
- 独立性(Isolated): 同時実行クライアントはテーブルの一貫したスナップショットを観測します。テーブルの状態は、INSERT試行前の状態か、成功したINSERT後の状態のいずれかであり、部分的な状態は観測されません。別のトランザクション内のクライアントは[スナップショット分離](https://en.wikipedia.org/wiki/Snapshot_isolation)を持ち、トランザクション外のクライアントは[リードアンコミッティド](<https://en.wikipedia.org/wiki/Isolation_(database_systems)#Read_uncommitted>)分離レベルを持ちます。
- 永続性(Durable): 成功したINSERTは、クライアントに応答する前にファイルシステムに書き込まれます。これは単一のレプリカまたは複数のレプリカ(`insert_quorum`設定で制御)で行われ、ClickHouseはストレージメディア上のファイルシステムデータを同期するようOSに要求できます(`fsync_after_insert`設定で制御)。
- マテリアライズドビューが関与している場合、1つのステートメントで複数のテーブルへのINSERTが可能です(クライアントからのINSERTは、関連するマテリアライズドビューを持つテーブルに対して行われます)。


## ケース2: MergeTree\*ファミリーの1つのテーブルの複数パーティションへのINSERT {#case-2-insert-into-multiple-partitions-of-one-table-of-the-mergetree-family}

上記のケース1と同様ですが、次の点が異なります:

- テーブルに多数のパーティションがあり、INSERTが複数のパーティションにまたがる場合、各パーティションへの挿入は個別にトランザクション処理されます


## ケース3: MergeTree\*ファミリーの分散テーブルへのINSERT {#case-3-insert-into-one-distributed-table-of-the-mergetree-family}

上記のケース1と同様ですが、以下の点が異なります:

- 分散テーブルへのINSERTは全体としてトランザクショナルではありませんが、各シャードへの挿入はトランザクショナルです


## ケース4: Bufferテーブルの使用 {#case-4-using-a-buffer-table}

- Bufferテーブルへの挿入は、原子性、分離性、一貫性、永続性のいずれも保証されません


## ケース5: async_insertの使用 {#case-5-using-async_insert}

上記のケース1と同様ですが、以下の詳細があります:

- `async_insert`が有効で`wait_for_async_insert`が1(デフォルト)に設定されている場合、原子性は保証されます。ただし、`wait_for_async_insert`が0に設定されている場合は原子性は保証されません。


## 注意事項 {#notes}

- クライアントから特定のデータ形式で挿入された行は、以下の条件で単一のブロックにパックされます:
  - 挿入形式が行ベース(CSV、TSV、Values、JSONEachRowなど)で、データが`max_insert_block_size`行未満(デフォルトで約1,000,000行)を含む場合、または並列パースが使用される場合(デフォルトで有効)に`min_chunk_bytes_for_parallel_parsing`バイト未満(デフォルトで10 MB)を含む場合
  - 挿入形式が列ベース(Native、Parquet、ORCなど)で、データが単一のデータブロックのみを含む場合
- 挿入されるブロックのサイズは、一般的に多数の設定に依存します(例: `max_block_size`、`max_insert_block_size`、`min_insert_block_size_rows`、`min_insert_block_size_bytes`、`preferred_block_size_bytes`など)
- クライアントがサーバーから応答を受信しなかった場合、トランザクションが成功したかどうかを判断できないため、正確に1回の挿入プロパティを使用してトランザクションを再試行できます
- ClickHouseは、並行トランザクションのために内部的に[スナップショット分離](https://en.wikipedia.org/wiki/Snapshot_isolation)を伴う[MVCC](https://en.wikipedia.org/wiki/Multiversion_concurrency_control)を使用しています
- すべてのACIDプロパティは、サーバーの強制終了やクラッシュの場合でも有効です
- 一般的なセットアップで永続的な挿入を保証するには、異なるAZへのinsert_quorumまたはfsyncのいずれかを有効にする必要があります
- ACID用語における「一貫性」は分散システムのセマンティクスをカバーしていません。詳細は https://jepsen.io/consistency を参照してください。これは異なる設定(select_sequential_consistency)によって制御されます
- この説明では、複数のテーブル、マテリアライズドビュー、複数のSELECTなどにわたる完全な機能を持つトランザクションを可能にする新しいトランザクション機能については扱っていません(トランザクション、コミット、およびロールバックに関する次のセクションを参照してください)


## トランザクション、コミット、およびロールバック {#transactions-commit-and-rollback}

<ExperimentalBadge />
<CloudNotSupportedBadge />

このドキュメントの冒頭で説明した機能に加えて、ClickHouseはトランザクション、コミット、およびロールバック機能の実験的サポートを提供しています。

### 要件 {#requirements}

- トランザクションを追跡するためにClickHouse KeeperまたはZooKeeperをデプロイする
- Atomic DBのみ(デフォルト)
- 非レプリケーションMergeTreeテーブルエンジンのみ
- `config.d/transactions.xml`に以下の設定を追加して実験的トランザクションサポートを有効化する:
  ```xml
  <clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
  </clickhouse>
  ```

### 注意事項 {#notes-1}

- これは実験的機能であり、変更が予想されます。
- トランザクション中に例外が発生した場合、トランザクションをコミットすることはできません。これには、タイプミスによって引き起こされる`UNKNOWN_FUNCTION`例外を含むすべての例外が含まれます。
- ネストされたトランザクションはサポートされていません。現在のトランザクションを終了してから新しいトランザクションを開始してください

### 設定 {#configuration}

以下の例は、ClickHouse Keeperを有効化した単一ノードのClickHouseサーバーを使用しています。

#### 実験的トランザクションサポートの有効化 {#enable-experimental-transaction-support}

```xml title=/etc/clickhouse-server/config.d/transactions.xml
<clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

#### ClickHouse Keeperを有効化した単一ClickHouseサーバーノードの基本設定 {#basic-configuration-for-a-single-clickhouse-server-node-with-clickhouse-keeper-enabled}

:::note
ClickHouseサーバーと適切なクォーラムのClickHouse Keeperノードのデプロイの詳細については、[デプロイメント](/deployment-guides/terminology.md)ドキュメントを参照してください。ここに示す設定は実験目的のものです。
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

#### 実験的トランザクションが有効化されていることを確認する {#verify-that-experimental-transactions-are-enabled}

`BEGIN TRANSACTION`または`START TRANSACTION`に続けて`ROLLBACK`を実行し、実験的トランザクションが有効化されていること、およびトランザクションの追跡に使用されるClickHouse Keeperが有効化されていることを確認します。

```sql
BEGIN TRANSACTION
```

```response
Ok.
```

:::tip
以下のエラーが表示される場合は、設定ファイルを確認して`allow_experimental_transactions`が`1`(または`0`や`false`以外の値)に設定されていることを確認してください。

```response
Code: 48. DB::Exception: Received from localhost:9000.
DB::Exception: Transactions are not supported.
(NOT_IMPLEMENTED)
```

以下を実行してClickHouse Keeperを確認することもできます

```bash
echo ruok | nc localhost 9181
```

ClickHouse Keeperは`imok`と応答するはずです。
:::

```sql
ROLLBACK
```

```response
Ok.
```

#### テスト用のテーブルを作成する {#create-a-table-for-testing}

:::tip
テーブルの作成はトランザクショナルではありません。このDDLクエリはトランザクションの外で実行してください。
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

#### トランザクションを開始して行を挿入する {#begin-a-transaction-and-insert-a-row}

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
トランザクション内からテーブルをクエリすると、まだコミットされていない場合でも行が挿入されていることを確認できます。
:::

#### トランザクションをロールバックして、再度テーブルをクエリする {#rollback-the-transaction-and-query-the-table-again}

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

#### トランザクションを完了して、再度テーブルをクエリする {#complete-a-transaction-and-query-the-table-again}

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

### トランザクションの検査 {#transactions-introspection}

`system.transactions`テーブルをクエリすることでトランザクションを検査できますが、トランザクション中のセッションからそのテーブルをクエリすることはできないことに注意してください。そのテーブルをクエリするには、2つ目の`clickhouse client`セッションを開いてください。

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

より広範なテストの確認および進捗状況の把握については、この[メタイシュー](https://github.com/ClickHouse/ClickHouse/issues/48794)を参照してください。
