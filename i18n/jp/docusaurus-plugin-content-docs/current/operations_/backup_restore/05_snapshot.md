---
description: 'クラウドのオブジェクトストレージを使用して、クラウドネイティブテーブルの軽量なスナップショットを作成・復元する方法。'
sidebar_label: 'スナップショットバックアップ'
sidebar_position: 5
slug: /operations/backup/snapshot
title: 'スナップショットバックアップと復元'
doc_type: 'guide'
keywords: ['スナップショット', 'バックアップ', '復元', 'SharedMergeTree', 'SharedSet', 'SharedJoin', '軽量バックアップ', 'クラウドバックアップ', 'S3', 'Azure Blob Storage', 'snapshot_locks', 'snapshot_parts', 'experimental_lightweight_snapshot']
---

# スナップショットバックアップと復元 \{#snapshot-backup-and-restore\}

スナップショットバックアップは、クラウドネイティブなテーブルエンジン向けの軽量なバックアップモードです。データをコピーする代わりに、各パーツごとのロックノードを ClickHouse Keeper に書き込みます。これらのロックにより、スナップショットが保持されている限り、参照先のオブジェクトストレージパーツがサーバーによって削除されるのを防ぎます。その後、バックアップではデータを物理的にコピーするのではなく、オブジェクトストレージへの参照を記録するため、テーブルサイズに関係なくスナップショットをすばやく作成できます。

この軽量方式は、[SharedMergeTree](/cloud/reference/shared-merge-tree)、SharedSet、および SharedJoin テーブルに適用されます。Log や Memory など、その他すべてのエンジンタイプでは、バックアップは自動的に標準のコピー方式バックアップにフォールバックします。

## スナップショットを作成する \{#create-a-snapshot\}

スナップショットバックアップでは、`experimental_lightweight_snapshot = true` を指定して、標準の [`BACKUP`](/operations/backup/overview#syntax) コマンドを使用します。`id` 設定は必須です。これはスナップショット名として使われ、unlock コマンドやオブザーバビリティ関連のコマンドで参照する際に使用されます。

```sql
BACKUP { TABLE [db.]table_name | DATABASE db_name | ALL [EXCEPT {TABLES | DATABASES} ...] }
TO { S3(...) | AzureBlobStorage(...) }
SETTINGS experimental_lightweight_snapshot = true, id = '<snapshot_id>'
```

この命令語は `id` と `status` を返します。`id` は [`system.backups`](/operations/system-tables/backups) で操作を追跡するために使用できます。

単一のテーブルを S3 にバックアップします:

```sql
BACKUP TABLE mydb.events
TO S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/events/', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY')
SETTINGS experimental_lightweight_snapshot = true, id = 'events_snapshot_1'
```

データベース全体をバックアップする:

```sql
BACKUP DATABASE mydb
TO S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/mydb/', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY')
SETTINGS experimental_lightweight_snapshot = true, id = 'mydb_snapshot_1'
```

1つを除外してすべてのテーブルをバックアップします:

```sql
BACKUP ALL
EXCEPT TABLES mydb.staging_table
TO S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/full/', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY')
SETTINGS experimental_lightweight_snapshot = true, id = 'full_snapshot_1'
```

Azure Blob Storageでも同じコマンドを使用できます:

```sql
BACKUP TABLE mydb.events
TO AzureBlobStorage('DefaultEndpointsProtocol=https;AccountName=myaccount;AccountKey=...', 'my-container', 'snapshots/events/')
SETTINGS experimental_lightweight_snapshot = true, id = 'events_snapshot_1'
```

## 同じサービスへの復元 \{#restore-to-same-service\}

スナップショットにはデータのコピーではなくオブジェクトストレージ内のファイルへの参照が保存されるため、新規または別の ClickHouse サービスに復元するには、元のオブジェクトストレージへのアクセスが必要です。このため、サービス間の復元は SQL ではサポートされておらず、UI からのみ実行できます。SQL を使用する場合は、`snapshot_from_current_service = 1` を指定することで、外部バックアップバケットから同じサービスにスナップショットを復元できます。この場合、リモートのスナップショットリーダーを介さず、オブジェクトは宛先ディスク経由で直接読み取られます。

```sql
RESTORE TABLE mydb.events AS mydb.events_restored
FROM S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/events/', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY')
SETTINGS snapshot_from_current_service = 1
```

`AS` 句を指定すると、元のテーブルはそのまま残したまま、新しいテーブル名で復元されます。元のテーブルを上書きするには、先に削除してください:

```sql
DROP TABLE mydb.events;

RESTORE TABLE mydb.events
FROM S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/events/', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY')
SETTINGS snapshot_from_current_service = 1
```

## スナップショットのロックを解除する \{#unlock-snapshot\}

各スナップショットは ClickHouse Keeper にロックを保持し、参照先のオブジェクトストレージ内のファイルがガベージコレクションの対象になるのを防ぎます。復元の完了後、またはスナップショットが不要になった時点で、これらのロックを解放するためにロックを解除してください。

方法は 2 つあります。1 つはシステムレベルのロック解除で、スナップショットのすべてのロックを一度に削除します。もう 1 つはテーブル単位のロック解除で、スナップショットの残りはそのままに、1 つのテーブルのロックだけを削除します。

**システムレベルのロック解除** — スナップショットのすべてのロックを削除します:

```sql
SYSTEM UNLOCK SNAPSHOT '<snapshot_id>'
FROM S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/events/', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY')
```

**テーブルごとのロック解除** — 1 つのテーブルに対してのみロックを解除します。

```sql
ALTER TABLE mydb.events UNLOCK SNAPSHOT '<snapshot_id>'
FROM S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/events/', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY')
```

スナップショットの作成時に保存先が Keeper に格納されていた場合、`FROM` 句は省略可能です (`system.snapshot_locks` の `info` カラムで確認できます) :

```sql
SYSTEM UNLOCK SNAPSHOT '<snapshot_id>'

-- or per-table:
ALTER TABLE mydb.events UNLOCK SNAPSHOT '<snapshot_id>'
```

ロックを解除すると、対応する行は `system.snapshot_locks` から消え、他のスナップショットから参照されていないパーツは `system.snapshot_parts` からも消えます。

## オブザーバビリティ \{#observability\}

### system.backups \{#system-backups\}

すべてのスナップショット操作は、通常のバックアップおよび復元操作とあわせて [`system.backups`](/operations/system-tables/backups) に表示されます。設定した `id` (または命令語によって返される UUID) を指定してクエリします。

```sql
SELECT id, name, status, error, start_time, end_time, num_files, uncompressed_size, compressed_size
FROM system.backups
WHERE id = 'events_snapshot_1'
FORMAT Vertical
```

```response
Row 1:
──────
id:                events_snapshot_1
name:              S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/events/', '[HIDDEN]')
status:            BACKUP_CREATED
error:
start_time:        2024-06-01 10:00:00
end_time:          2024-06-01 10:00:03
num_files:         42
uncompressed_size: 1073741824
compressed_size:   0
```

### system.snapshot_locks \{#system-snapshot-locks\}

`system.snapshot_locks` は、現在 Keeper に登録されているコミット済みのスナップショットを表示します。スナップショットがコミットされると、Keeper ノードが `/clickhouse/snapshot/committed/{snapshot_id}` に作成されます。サーバーは、データパートを削除する前に、コミット済みのスナップショットがそのデータパートをロックしているかどうかを確認します。ロックしている場合、そのデータパートの削除はスキップされます。ロックは、スナップショットを明示的にロック解除するまで維持されます。

```sql
SELECT *
FROM system.snapshot_locks
```

| カラム         | 型          | 説明                            |
| ----------- | ---------- | ----------------------------- |
| `id`        | `String`   | スナップショット ID                   |
| `info`      | `String`   | スナップショットの宛先 (例: `S3('...')`)  |
| `ctime`     | `DateTime` | このロックが Keeper に作成された時刻        |
| `lock_path` | `String`   | このロックの Keeper パス              |

各行は 1 つのコミット済みスナップショットを表します。すでに有効なバックアップ宛先が存在しないスナップショットのロックが表示されている場合は、`SYSTEM UNLOCK SNAPSHOT` を実行して削除してください。

特定のスナップショットロックが存在するかどうかを確認するには:

```sql
SELECT id, info, lock_path
FROM system.snapshot_locks
WHERE id = 'events_snapshot_1'
```

### system.snapshot_parts \{#system-snapshot-parts\}

`system.snapshot_parts` は、現在、少なくとも 1 つのスナップショットロックによって保持されているデータパーツを表示します。ロックされている各パーツについて、`/clickhouse/snapshot/{table_uuid}/{part_name}` に Keeper ノードが存在し、そのパーツの圧縮サイズと非圧縮サイズが格納されます。このテーブルはそれらのノードを読み取り、現在削除から保護されているパーツを表示します。

```sql
SELECT *
FROM system.snapshot_parts
ORDER BY data_compressed_bytes DESC
LIMIT 20
```

| カラム                       | 型        | 説明                              |
| ------------------------- | -------- | ------------------------------- |
| `name`                    | `String` | データパーツ名                         |
| `table_id`                | `String` | このパーツが属するテーブルの UUID             |
| `data_compressed_bytes`   | `UInt64` | このパーツの圧縮後のサイズ                   |
| `data_uncompressed_bytes` | `UInt64` | このパーツの非圧縮時のサイズ                  |
| `snapshots_size`          | `UInt64` | 現在このパーツに対するロックを保持しているスナップショットの数 |

`snapshots_size > 1` のパーツは複数のスナップショットから参照されており、保持中のすべてのスナップショットのロックが解除されるまで、オブジェクトストレージから削除されません。

ピン留めされているストレージの合計を確認するには:

```sql
SELECT
    formatReadableSize(sum(data_compressed_bytes)) AS total_pinned_compressed,
    formatReadableSize(sum(data_uncompressed_bytes)) AS total_pinned_uncompressed,
    count() AS parts_count
FROM system.snapshot_parts
```

スナップショットによってロックされているものの、すでに削除されているか、サーバー上でアクティブでなくなっているパーツ、つまりスナップショットロックのためだけにオブジェクトストレージに保持されているデータを見つけるには:

```sql
SELECT
    count(*),
    sum(data_uncompressed_bytes)
FROM system.snapshot_parts
WHERE (name, table_id) NOT IN (
    SELECT
        name,
        toString(tables.uuid)
    FROM system.parts
    INNER JOIN system.tables ON (parts.`table` = tables.name) AND parts.active
)
```

```response
┌─count()─┬─sum(data_uncompressed_bytes)─┐
│    1000 │                        96037 │
└─────────┴──────────────────────────────┘
```

これは、元のデータが変更または削除された後もスナップショットを保持する場合のストレージオーバーヘッドを把握するのに役立ちます。