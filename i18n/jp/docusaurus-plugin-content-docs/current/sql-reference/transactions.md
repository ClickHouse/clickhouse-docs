---
description: 'ClickHouseにおけるトランザクション（ACID）サポートを説明するページ'
slug: /guides/developer/transactional
title: 'トランザクション（ACID）サポート'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# トランザクション（ACID）サポート

## ケース 1: MergeTree* ファミリーの一つのテーブルの一つのパーティションにINSERTする {#case-1-insert-into-one-partition-of-one-table-of-the-mergetree-family}

挿入された行がパックされ、単一のブロックとして挿入される場合、これはトランザクション（ACID）になります（注を参照）：
- **原子性**: INSERTは全体として成功するか拒否されます。クライアントに確認が送信される場合、すべての行が挿入されており、エラーが送信される場合、行は挿入されていません。
- **一貫性**: テーブルの制約が違反されていない場合、INSERT内のすべての行が挿入され、INSERTが成功します。制約が違反されると、行は挿入されません。
- **隔離性**: 同時に接続しているクライアントは、テーブルの一貫したスナップショットを観察します—テーブルがINSERT試行の前の状態、または成功したINSERTの後の状態のいずれかです。部分的な状態は見えません。他のトランザクション内のクライアントは[スナップショット隔離](https://en.wikipedia.org/wiki/Snapshot_isolation)を持ち、トランザクション外のクライアントは[未コミット読み込み](https://en.wikipedia.org/wiki/Isolation_(database_systems)#Read_uncommitted)の隔離レベルを持ちます。
- **永続性**: 成功したINSERTは、クライアントに応答する前に、単一のレプリカまたは複数のレプリカ（`insert_quorum`設定により制御）でファイルシステムに書き込まれ、ClickHouseはストレージメディア上のファイルシステムデータを同期するためにOSに要求することができます（これも`fsync_after_insert`設定で制御されます）。
- 1つのステートメントで複数のテーブルにINSERTすることは、マテリアライズドビューが関連している場合に可能です（クライアントからのINSERTは関連するマテリアライズドビューを持つテーブルへのものです）。

## ケース 2: MergeTree* ファミリーの一つのテーブルの複数のパーティションにINSERTする {#case-2-insert-into-multiple-partitions-of-one-table-of-the-mergetree-family}

上記のケース1と同様ですが、この詳細があります：
- テーブルに多くのパーティションがあり、INSERTが多くのパーティションをカバーしている場合、各パーティションへの挿入はそれ自体でトランザクショナルです

## ケース 3: MergeTree* ファミリーの一つの分散テーブルにINSERTする {#case-3-insert-into-one-distributed-table-of-the-mergetree-family}

上記のケース1と同様ですが、この詳細があります：
- 分散テーブルへのINSERTは全体としてトランザクショナルではないですが、各シャードへの挿入はトランザクショナルです

## ケース 4: バッファテーブルを使用する {#case-4-using-a-buffer-table}

- バッファテーブルにINSERTすることは、原子性も隔離性も一貫性も永続性もありません

## ケース 5: async_insertを使用する {#case-5-using-async_insert}

上記のケース1と同様ですが、この詳細があります：
- `async_insert`が有効になっており、`wait_for_async_insert`が1（デフォルト）に設定されている場合でも、原子性は保証されますが、`wait_for_async_insert`が0に設定されると、原子性は保証されません。

## 注 {#notes}
- クライアントから挿入された行が特定のデータ形式である場合、次の条件で単一ブロックにパックされます：
  - 挿入形式が行ベースである場合（CSV、TSV、Values、JSONEachRowなど）で、データに`max_insert_block_size`行未満（デフォルトでは約1,000,000）または並列解析が使用される場合（デフォルトで有効）の`min_chunk_bytes_for_parallel_parsing`バイト未満（デフォルトでは10MB）を含む場合
  - 挿入形式が列ベースである場合（Native、Parquet、ORCなど）で、データが1つのデータブロックのみを含む場合
- 挿入ブロックのサイズは、一般に多くの設定（例：`max_block_size`、`max_insert_block_size`、`min_insert_block_size_rows`、`min_insert_block_size_bytes`、`preferred_block_size_bytes`など）に依存する可能性があります
- クライアントがサーバーからの応答を受け取っていない場合、クライアントはトランザクションが成功したかどうかを知りません。クライアントは、正確に一度挿入特性を使用してトランザクションを繰り返すことができます
- ClickHouseは、内部で同時トランザクションのために[MVCC](https://en.wikipedia.org/wiki/Multiversion_concurrency_control)と[スナップショット隔離](https://en.wikipedia.org/wiki/Snapshot_isolation)を使用しています
- すべてのACID特性は、サーバーの強制終了/クラッシュの場合にも有効です
- 一般的な設定で永続的なINSERTを確保するには、異なるAZへの`insert_quorum`または`fsync`のいずれかを有効にする必要があります
- ACID用語における「一貫性」は分散システムのセマンティクスをカバーしておらず、https://jepsen.io/consistencyを参照してください。これは異なる設定（select_sequential_consistency）によって制御されます
- この説明は、複数のテーブル、マテリアライズドビュー、複数のSELECTにわたるフル機能のトランザクションを持つ新しいトランザクション機能をカバーしていません（次のセクション「トランザクション、コミット、ロールバック」を参照）

## トランザクション、コミット、ロールバック {#transactions-commit-and-rollback}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

このドキュメントの冒頭で説明した機能に加えて、ClickHouseにはトランザクション、コミット、およびロールバック機能に対する実験的サポートがあります。

### 要件 {#requirements}

- トランザクションを追跡するためにClickHouse KeeperまたはZooKeeperを展開
- 原子DBのみ（デフォルト）
- 非レプリケートMergeTreeテーブルエンジンのみ
- `config.d/transactions.xml`に以下の設定を追加して、実験的トランザクションサポートを有効にします：
  ```xml
  <clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
  </clickhouse>
  ```

### 注 {#notes-1}
- これは実験的機能であり、変更が予想されます。
- トランザクション中に例外が発生した場合、トランザクションをコミットすることはできません。これには、タイプミスによって引き起こされた`UNKNOWN_FUNCTION`例外も含まれます。
- ネストされたトランザクションはサポートされていません。現在のトランザクションを終了し、新しいものを開始してください。

### 設定 {#configuration}

これらの例は、ClickHouse Keeperが有効になった単一ノードのClickHouseサーバーを対象としています。

#### 実験的トランザクションサポートを有効にする {#enable-experimental-transaction-support}

```xml title=/etc/clickhouse-server/config.d/transactions.xml
<clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

#### ClickHouse Keeperが有効な単一のClickHouseサーバーノードの基本設定 {#basic-configuration-for-a-single-clickhouse-server-node-with-clickhouse-keeper-enabled}

:::note
ClickHouseサーバーの展開と適切なClickHouse Keeperノードの quorum に関する詳細は、[展開ガイド](/deployment-guides/terminology.md)を参照してください。ここに示されている設定は実験的な目的のためのものです。
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

`BEGIN TRANSACTION`または`START TRANSACTION`を発行し、その後に`ROLLBACK`を続けて、実験的トランザクションが有効になっていることを確認します。また、ClickHouse Keeperがトランザクションを追跡するために有効になっていることも確認します。

```sql
BEGIN TRANSACTION
```
```response
Ok.
```

:::tip
以下のエラーが表示された場合、設定ファイルを確認し、`allow_experimental_transactions`が`1`（または`0`や`false`以外の値）に設定されていることを確認してください。

```response
Code: 48. DB::Exception: Received from localhost:9000.
DB::Exception: Transactions are not supported.
(NOT_IMPLEMENTED)
```

`clickhouse keeper`が応答することを確認するには

```bash
echo ruok | nc localhost 9181
```

ClickHouse Keeperから`imok`と応答があるはずです。
:::

```sql
ROLLBACK
```

```response
Ok.
```

#### テスト用のテーブルを作成 {#create-a-table-for-testing}

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
トランザクション内からテーブルをクエリして、コミットされていないにもかかわらず行が挿入されていることを確認できます。
:::

#### トランザクションをロールバックし、再度テーブルをクエリ {#rollback-the-transaction-and-query-the-table-again}

トランザクションがロールバックされたことを確認します：

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

#### トランザクションを完了し、再度テーブルをクエリ {#complete-a-transaction-and-query-the-table-again}

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

### トランザクションの透視 {#transactions-introspection}

`system.transactions`テーブルをクエリすることでトランザクションを調べることができますが、トランザクション内のセッションからそのテーブルをクエリすることはできないことに注意してください。別の`clickhouse client`セッションを開いて、そのテーブルをクエリします。

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

より広範なテストを見つけ、進捗を追跡するために、この[メタ問題](https://github.com/ClickHouse/ClickHouse/issues/48794)を参照してください。
