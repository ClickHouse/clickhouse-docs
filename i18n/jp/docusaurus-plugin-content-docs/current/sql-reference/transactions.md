---
description: 'ClickHouse のトランザクション（ACID）サポートについて説明するページ'
slug: /guides/developer/transactional
title: 'トランザクション（ACID）サポート'
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# トランザクション（ACID）対応 \{#transactional-acid-support\}

## ケース 1: MergeTree* ファミリーの 1 つのテーブルの 1 つのパーティションへの INSERT \{#case-1-insert-into-one-partition-of-one-table-of-the-mergetree-family\}

挿入される行が 1 つのブロックとしてまとめて挿入される場合（注を参照）、これはトランザクション特性（ACID）を満たします:
- 原子性 (Atomic): INSERT は全体として成功するか拒否されます。クライアントに成功の確認応答が送信された場合は、すべての行が挿入されています。クライアントにエラーが送信された場合は、どの行も挿入されていません。
- 一貫性 (Consistent): テーブル制約に違反がなければ、INSERT 内のすべての行が挿入され、INSERT は成功します。制約に違反した場合は、どの行も挿入されません。
- 分離性 (Isolated): 同時実行中のクライアントはテーブルの一貫したスナップショットを観測します。つまり、INSERT 実行前のテーブル状態か、成功した INSERT の後の状態のいずれかであり、中間的な状態は見えません。別のトランザクション内のクライアントは[スナップショット分離](https://en.wikipedia.org/wiki/Snapshot_isolation)を持ち、トランザクション外のクライアントは[読み取り未コミット (read uncommitted)](https://en.wikipedia.org/wiki/Isolation_(database_systems)#Read_uncommitted) 分離レベルになります。
- 永続性 (Durable): 成功した INSERT は、クライアントに応答する前にファイルシステムに書き込まれます。これは単一レプリカまたは複数レプリカ（`insert_quorum` 設定で制御）に対して行われ、ClickHouse は OS に対してストレージメディア上のファイルシステムデータの同期を要求できます（`fsync_after_insert` 設定で制御）。
- マテリアライズドビューが関与している場合、1 つのステートメントで複数のテーブルに対する INSERT が可能です（クライアントからの INSERT は、関連するマテリアライズドビューを持つテーブルに対して行われます）。

## ケース 2: MergeTree* ファミリーの 1 つのテーブルに対する、複数パーティションへの INSERT \{#case-2-insert-into-multiple-partitions-of-one-table-of-the-mergetree-family\}

上記のケース 1 と同様ですが、次の点が異なります:
- テーブルに多数のパーティションがあり、INSERT が多くのパーティションにまたがる場合、各パーティションへの挿入はそれぞれ独立したトランザクションとして扱われます

## ケース 3: MergeTree* ファミリーの 1 つの分散テーブルへの INSERT \{#case-3-insert-into-one-distributed-table-of-the-mergetree-family\}

上のケース 1 と同様ですが、次の点が異なります：
- Distributed テーブルへの INSERT は全体としてはトランザクションとして扱われませんが、各シャードへの挿入はトランザクションとして扱われます

## ケース 4: Buffer テーブルの使用 \{#case-4-using-a-buffer-table\}

- Buffer テーブルへの INSERT 操作では、アトミック性 (Atomicity)、分離性 (Isolation)、一貫性 (Consistency)、永続性 (Durability) のいずれも保証されません

## ケース5: async_insert の使用 \{#case-5-using-async_insert\}

上記のケース1と同様ですが、次の点が異なります：
- `async_insert` が有効で、`wait_for_async_insert` が 1（デフォルト）に設定されている場合にはアトミック性が保証されますが、`wait_for_async_insert` が 0 に設定されている場合にはアトミック性は保証されません。

## Notes \{#notes\}
- クライアントからあるデータフォーマットで挿入された行は、次の場合に 1 つのブロックにまとめられます:
  - 挿入フォーマットが行ベース（CSV、TSV、Values、JSONEachRow など）の場合で、データが `max_insert_block_size` 行（デフォルトでは約 1 000 000 行）未満、または並列パースを使用する場合（デフォルトで有効）には `min_chunk_bytes_for_parallel_parsing` バイト（デフォルトでは 10 MB）未満であるとき
  - 挿入フォーマットがカラムベース（Native、Parquet、ORC など）の場合で、データが 1 ブロック分のみ含まれているとき
- 一般に、挿入されるブロックのサイズは多くの設定に依存し得ます（例: `max_block_size`, `max_insert_block_size`, `min_insert_block_size_rows`, `min_insert_block_size_bytes`, `preferred_block_size_bytes` など）
- クライアントがサーバーから応答を受け取らなかった場合、トランザクションが成功したかどうかクライアントには分からないため、exactly-once 挿入特性を利用してトランザクションを再実行できます
- ClickHouse は並行トランザクションの内部処理において [MVCC](https://en.wikipedia.org/wiki/Multiversion_concurrency_control) と [snapshot isolation](https://en.wikipedia.org/wiki/Snapshot_isolation) を使用しています
- サーバーが kill されたりクラッシュした場合でも、ACID のすべての特性は保持されます
- 典型的な構成で永続的な INSERT を保証するには、異なるアベイラビリティゾーン（AZ）への `insert_quorum` か `fsync` のいずれかを有効化する必要があります
- ACID における「一貫性」は分散システムのセマンティクスを対象としていません。分散システムの一貫性については https://jepsen.io/consistency を参照してください。これは（`select_sequential_consistency` などの）別の設定によって制御されます
- この説明では、複数テーブルやマテリアライズドビュー、複数の SELECT などに対してフル機能のトランザクションを提供する新しいトランザクション機能は扱っていません（次の「Transactions, Commit, and Rollback」のセクションを参照してください）

## トランザクション、コミット、ロールバック \{#transactions-commit-and-rollback\}

<ExperimentalBadge />

<CloudNotSupportedBadge />

このドキュメントの冒頭で説明した機能に加えて、ClickHouse にはトランザクション、コミット、ロールバック機能に対する実験的なサポートがあります。

### 要件 \{#requirements\}

* トランザクションを追跡するために ClickHouse Keeper または ZooKeeper をデプロイする
* Atomic DB のみ（デフォルト）
* 非 Replicated MergeTree テーブルエンジンのみ
* `config.d/transactions.xml` に次の設定を追加して、トランザクションの実験的サポートを有効にする:
  ```xml
  <clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
  </clickhouse>
  ```

### 注意事項 \{#notes-1\}

* これは実験的な機能であり、今後変更される可能性があります。
* トランザクション中に例外が発生した場合、そのトランザクションをコミットすることはできません。これは、タイプミスによる `UNKNOWN_FUNCTION` 例外を含むすべての例外が対象です。
* ネストされたトランザクションはサポートされません。現在のトランザクションを終了してから、新しいトランザクションを開始してください。

### 設定 \{#configuration\}

これらの例は、ClickHouse Keeper を有効にした単一ノードの ClickHouse サーバーを前提としています。

#### トランザクションの実験的サポートを有効にする \{#enable-experimental-transaction-support\}

```xml title=/etc/clickhouse-server/config.d/transactions.xml
<clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

#### ClickHouse Keeper を有効にした単一の ClickHouse サーバーノード向け基本構成 \{#basic-configuration-for-a-single-clickhouse-server-node-with-clickhouse-keeper-enabled\}

:::note
ClickHouse サーバーおよび適切な ClickHouse Keeper ノードのクォーラムのデプロイ方法についての詳細は、[deployment](/deployment-guides/terminology.md) に関するドキュメントを参照してください。ここで示す構成は実験・検証目的のものです。
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

### 例 \{#example\}

#### 実験的トランザクション機能が有効になっていることを確認する \{#verify-that-experimental-transactions-are-enabled\}

`BEGIN TRANSACTION` または `START TRANSACTION` を発行し、続けて `ROLLBACK` を実行して、実験的トランザクション機能が有効であること、およびトランザクションの追跡に使用される ClickHouse Keeper が有効であることを確認します。

```sql
BEGIN TRANSACTION
```

```response
OK
```

:::tip
次のエラーが表示された場合は、設定ファイルを確認し、`allow_experimental_transactions` が `1`（または `0` や `false` 以外の値）に設定されていることを確認してください。

```response
Code: 48. DB::Exception: Received from localhost:9000.
DB::Exception: トランザクションはサポートされていません。
(NOT_IMPLEMENTED)
```

次のコマンドを実行して ClickHouse Keeper の状態を確認することもできます。

```bash
echo ruok | nc localhost 9181
```

ClickHouse Keeper は `imok` と応答するはずです。
:::

```sql
ROLLBACK
```

```response
OK
```

#### テスト用のテーブルを作成する \{#create-a-table-for-testing\}

:::tip
テーブルの作成はトランザクションとして実行されません。DDL クエリはトランザクションの外で実行してください。
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

#### トランザクションを開始して 1 行を挿入する \{#begin-a-transaction-and-insert-a-row\}

```sql
トランザクション開始
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
トランザクション内でテーブルに対してクエリを実行すると、まだコミットされていないにもかかわらず行が挿入されていることを確認できます。
:::

#### トランザクションをロールバックし、再度テーブルをクエリする \{#rollback-the-transaction-and-query-the-table-again\}

トランザクションがロールバックされていることを確認します。

```sql
ロールバック
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

#### トランザクションを完了してからテーブルを再度クエリする \{#complete-a-transaction-and-query-the-table-again\}

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
OK。
```

```sql
COMMIT
```

```response
OK。経過時間: 0.002秒。
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

### トランザクションの調査 \{#transactions-introspection\}

`system.transactions` テーブルをクエリしてトランザクションを確認できます。ただし、そのテーブルはトランザクション中のセッションからはクエリできない点に注意してください。そのテーブルをクエリするには、別の `clickhouse client` セッションを開いてください。

```sql
SELECT *
FROM system.transactions
FORMAT Vertical
```

```response
行 1:
──────
tid:         (33,61,'51e60bce-6b82-4732-9e1d-b40705ae9ab8')
tid_hash:    11240433987908122467
elapsed:     210.017820947
is_readonly: 1
state:       RUNNING
```

## 詳細情報 \{#more-details\}

より包括的なテスト内容や進捗の最新情報については、この [meta issue](https://github.com/ClickHouse/ClickHouse/issues/48794) を参照してください。
