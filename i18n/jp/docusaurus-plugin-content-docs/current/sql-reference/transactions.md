---
description: 'ClickHouse におけるトランザクショナル（ACID）サポートを説明するページ'
slug: '/guides/developer/transactional'
title: 'Transactional (ACID) サポート'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';



# トランザクション (ACID) サポート

## ケース 1: MergeTree* ファミリーの1つのテーブルの1つのパーティションにINSERT {#case-1-insert-into-one-partition-of-one-table-of-the-mergetree-family}

これは、挿入された行がパックされ、単一のブロックとして挿入される場合、トランザクショナル (ACID) です (ノートを参照)：
- 原子性: INSERT は全体として成功するか、拒否されます。クライアントに確認が送信される場合、すべての行が挿入されたことになります。クライアントにエラーが送信される場合、行は挿入されません。
- 一貫性: テーブルの制約に違反がない場合、INSERT のすべての行が挿入され、INSERT は成功します。制約に違反がある場合、行は挿入されません。
- 独立性: 同時実行のクライアントは、テーブルの一貫したスナップショットを観察します。つまり、INSERT の試行の前のテーブルの状態、または成功した INSERT の後の状態を観察します。部分的な状態は表示されません。他のトランザクション内のクライアントは [スナップショット隔離](https://en.wikipedia.org/wiki/Snapshot_isolation) を持ち、トランザクション外のクライアントは [未コミットの読み取り](https://en.wikipedia.org/wiki/Isolation_(database_systems)#Read_uncommitted) の隔離レベルを持ちます。
- 耐久性: 成功した INSERT は、クライアントに応答する前にファイルシステムに書き込まれます。単一のレプリカまたは複数のレプリカに書き込まれます (これを制御するのが `insert_quorum` 設定) 。ClickHouse は、OS に対してストレージメディアのファイルシステムデータを同期するように依頼できます (これを制御するのが `fsync_after_insert` 設定)。
- 1つのステートメントで複数のテーブルにINSERTすることも、マテリアライズドビューが関与している場合は可能です (クライアントからのINSERTが関連するマテリアライズドビューを持つテーブルに対して行われます)。

## ケース 2: MergeTree* ファミリーの1つのテーブルに複数のパーティションにINSERT {#case-2-insert-into-multiple-partitions-of-one-table-of-the-mergetree-family}

上記のケース 1 と同様ですが、以下の詳細があります：
- テーブルに多数のパーティションがあり、INSERT が多数のパーティションをカバーする場合、すべてのパーティションへの挿入はそれぞれ独立してトランザクショナルです。

## ケース 3: MergeTree* ファミリーの1つの分散テーブルにINSERT {#case-3-insert-into-one-distributed-table-of-the-mergetree-family}

上記のケース 1 と同様ですが、以下の詳細があります：
- 分散テーブルへのINSERTは全体としてトランザクショナルではなく、各シャードへの挿入はトランザクショナルです。

## ケース 4: バッファテーブルの使用 {#case-4-using-a-buffer-table}

- バッファテーブルへのINSERTは原子性も独立性も一貫性も耐久性もありません。

## ケース 5: async_insert の使用 {#case-5-using-async_insert}

上記のケース 1 と同様ですが、以下の詳細があります：
- `async_insert` が有効で `wait_for_async_insert` が 1 (デフォルト) に設定されている場合でも原子性が保証されますが、`wait_for_async_insert` が 0 に設定されている場合は原子性が保証されません。

## ノート {#notes}
- クライアントから挿入された行は、次の条件を満たす場合に単一のブロックにパックされます：
  - 挿入形式が行ベース (CSV、TSV、Values、JSONEachRow など) で、データが `max_insert_block_size` 行 (デフォルトで約1,000,000) 未満、または並列パースが使用されている場合 (デフォルトで有効) は `min_chunk_bytes_for_parallel_parsing` バイト (デフォルトで10MB) 未満である場合
  - 挿入形式がカラムベース (Native、Parquet、ORC など) で、データがデータのブロックを1つだけ含む場合
- 挿入されたブロックのサイズは、一般的に多くの設定 (たとえば: `max_block_size`、`max_insert_block_size`、`min_insert_block_size_rows`、`min_insert_block_size_bytes`、`preferred_block_size_bytes` など) に依存することがあります。
- クライアントがサーバーから応答を受け取らなかった場合、クライアントはトランザクションが成功したかどうかを知らず、正確に1回の挿入プロパティを使用してトランザクションを繰り返すことができます。
- ClickHouseは、同時トランザクションのために内部で [MVCC](https://en.wikipedia.org/wiki/Multiversion_concurrency_control) と [スナップショット隔離](https://en.wikipedia.org/wiki/Snapshot_isolation) を使用しています。
- すべての ACID プロパティは、サーバーが強制終了/クラッシュした場合でも有効です。
- 一般的なセットアップでは、耐久性のある挿入を確保するために、異なる AZ への insert_quorum または fsync を有効にする必要があります。
- ACID の用語での「一貫性」は、分散システムの意味を網羅していません。詳細は https://jepsen.io/consistency を参照してください。これを制御するのは異なる設定 (select_sequential_consistency) です。
- この説明では、複数のテーブルやマテリアライズドビュー、複数の SELECT に対してフル機能のトランザクションを持つ新しいトランザクション機能については触れません (次の「トランザクション、コミット、ロールバック」のセクションを参照してください)。

## トランザクション、コミット、およびロールバック {#transactions-commit-and-rollback}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

この文書の最初に記載されている機能に加えて、ClickHouse はトランザクション、コミット、およびロールバック機能の実験的サポートを提供しています。

### 要件 {#requirements}

- トランザクションを追跡するために ClickHouse Keeper または ZooKeeper をデプロイする
- 原子データベースのみ (デフォルト)
- 非レプリケート MergeTree テーブルエンジンのみ
- `config.d/transactions.xml` に次の設定を追加して、実験的トランザクションサポートを有効にします：
  ```xml
  <clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
  </clickhouse>
  ```

### ノート {#notes-1}
- これは実験的な機能であり、変更が予想されます。
- トランザクション中に例外が発生した場合、トランザクションをコミットすることはできません。これは、タイプミスによって引き起こされた `UNKNOWN_FUNCTION` 例外を含むすべての例外が対象です。
- ネストされたトランザクションはサポートされていません。現在のトランザクションを終了し、新しいトランザクションを開始してください。

### 設定 {#configuration}

これらの例は、ClickHouse Keeper が有効になっている単一ノード ClickHouse サーバーを対象としています。

#### 実験的トランザクションサポートの有効化 {#enable-experimental-transaction-support}

```xml title=/etc/clickhouse-server/config.d/transactions.xml
<clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

#### ClickHouse Keeper が有効になっている単一の ClickHouse サーバーノード用の基本設定 {#basic-configuration-for-a-single-clickhouse-server-node-with-clickhouse-keeper-enabled}

:::note
ClickHouse サーバーと適切なクォーラムの ClickHouse Keeper ノードをデプロイする詳細については、[デプロイメント]( /deployment-guides/terminology.md ) ドキュメントを参照してください。ここに示す設定は実験的な目的のためのものです。
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
    <display_name>ノード 1</display_name>
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

#### 実験的トランザクションが有効であることを確認する {#verify-that-experimental-transactions-are-enabled}

`BEGIN TRANSACTION` または `START TRANSACTION` を発行し、続けて `ROLLBACK` を実行して、実験的トランザクションが有効になっていることを確認します。また、ClickHouse Keeper がトランザクションを追跡するために使用されていることを確認します。 

```sql
BEGIN TRANSACTION
```
```response
Ok.
```

:::tip
次のエラーが表示された場合は、構成ファイルを確認して、`allow_experimental_transactions` が `1` (または `0` または `false` 以外の任意の値) に設定されていることを確認してください。

```response
Code: 48. DB::Exception: Received from localhost:9000.
DB::Exception: Transactions are not supported.
(NOT_IMPLEMENTED)
```

ClickHouse Keeper を次のコマンドで確認することもできます。

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

#### テスト用のテーブルを作成する {#create-a-table-for-testing}

:::tip
テーブルの作成はトランザクショナルではありません。このDDLクエリはトランザクションの外部で実行してください。
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
トランザクション内からテーブルをクエリすると、行が挿入されたことが確認できますが、まだコミットされていません。
:::

#### トランザクションをロールバックし、再度テーブルをクエリする {#rollback-the-transaction-and-query-the-table-again}

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

### トランザクションの内部調査 {#transactions-introspection}

`system.transactions` テーブルをクエリすることでトランザクションを確認できますが、トランザクションのセッションからそのテーブルをクエリすることはできません。別の `clickhouse client` セッションを開いて、そのテーブルをクエリしてください。

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

## 詳細 {#more-details}

詳細なテストや進捗状況を把握するには、この [メタイシュー](https://github.com/ClickHouse/ClickHouse/issues/48794) を参照してください。
