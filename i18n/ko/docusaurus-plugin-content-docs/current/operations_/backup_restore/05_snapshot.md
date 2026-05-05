---
description: '클라우드 객체 스토리지를 사용해 클라우드 네이티브 테이블의 경량 스냅샷을 생성하고 복원하는 방법입니다.'
sidebar_label: '스냅샷 백업'
sidebar_position: 5
slug: /operations/backup/snapshot
title: '스냅샷 백업 및 복원'
doc_type: 'guide'
keywords: ['스냅샷', '백업', '복원', 'SharedMergeTree', 'SharedSet', 'SharedJoin', '경량 백업', '클라우드 백업', 'S3', 'Azure Blob Storage', 'snapshot_locks', 'snapshot_parts', 'experimental_lightweight_snapshot']
---

# 스냅샷 백업 및 복원 \{#snapshot-backup-and-restore\}

스냅샷 백업은 클라우드 네이티브 테이블 엔진을 위한 경량 백업 모드입니다. 데이터를 복사하는 대신 ClickHouse Keeper에 파트별 잠금 노드를 기록합니다. 이러한 잠금은 스냅샷이 보관되는 동안 서버가 참조된 객체 스토리지 파트를 삭제하지 못하도록 합니다. 이후 백업은 데이터를 물리적으로 복사하는 대신 객체 스토리지 참조만 기록하므로, 테이블 크기와 관계없이 스냅샷을 빠르게 생성할 수 있습니다.

이 경량 방식은 [SharedMergeTree](/cloud/reference/shared-merge-tree), SharedSet, SharedJoin 테이블에 적용됩니다. Log 또는 Memory와 같은 다른 모든 엔진 유형에서는 백업이 자동으로 표준 복사 기반 백업으로 전환됩니다.

## 스냅샷 생성하기 \{#create-a-snapshot\}

스냅샷 백업은 `experimental_lightweight_snapshot = true`를 지정한 표준 [`BACKUP`](/operations/backup/overview#syntax) 명령어를 사용합니다. `id` 설정은 필수이며, 스냅샷 이름을 지정하고 unlock 및 관측성 명령어에서 이를 참조하는 데 사용됩니다:

```sql
BACKUP { TABLE [db.]table_name | DATABASE db_name | ALL [EXCEPT {TABLES | DATABASES} ...] }
TO { S3(...) | AzureBlobStorage(...) }
SETTINGS experimental_lightweight_snapshot = true, id = '<snapshot_id>'
```

이 명령어는 `id`와 `status`를 반환하며, `id`를 사용해 [`system.backups`](/operations/system-tables/backups)에서 작업 상태를 추적할 수 있습니다.

단일 테이블을 S3에 백업합니다:

```sql
BACKUP TABLE mydb.events
TO S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/events/', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY')
SETTINGS experimental_lightweight_snapshot = true, id = 'events_snapshot_1'
```

전체 데이터베이스를 백업합니다:

```sql
BACKUP DATABASE mydb
TO S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/mydb/', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY')
SETTINGS experimental_lightweight_snapshot = true, id = 'mydb_snapshot_1'
```

테이블 하나를 제외하고 모두 백업합니다:

```sql
BACKUP ALL
EXCEPT TABLES mydb.staging_table
TO S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/full/', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY')
SETTINGS experimental_lightweight_snapshot = true, id = 'full_snapshot_1'
```

동일한 명령어를 Azure Blob Storage에서도 사용할 수 있습니다:

```sql
BACKUP TABLE mydb.events
TO AzureBlobStorage('DefaultEndpointsProtocol=https;AccountName=myaccount;AccountKey=...', 'my-container', 'snapshots/events/')
SETTINGS experimental_lightweight_snapshot = true, id = 'events_snapshot_1'
```

## 동일한 서비스로 복원 \{#restore-to-same-service\}

스냅샷은 데이터 복사본이 아니라 객체 스토리지 파일에 대한 참조를 저장하므로, 새롭거나 다른 ClickHouse 서비스로 복원하려면 원본 객체 스토리지에 대한 액세스가 필요합니다. 따라서 서비스 간 복원은 SQL로 지원되지 않으며 UI에서만 사용할 수 있습니다. SQL에서는 `snapshot_from_current_service = 1`을 사용하여 외부 백업 버킷에서 동일한 서비스로 스냅샷을 복원할 수 있습니다. 이 경우 원격 스냅샷 리더를 거치지 않고 대상 디스크를 통해 객체를 직접 읽습니다:

```sql
RESTORE TABLE mydb.events AS mydb.events_restored
FROM S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/events/', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY')
SETTINGS snapshot_from_current_service = 1
```

`AS` 절은 새 테이블 이름으로 복원하므로 원본 테이블은 그대로 유지됩니다. 원본 테이블에 덮어쓰려면 먼저 해당 테이블을 삭제하십시오:

```sql
DROP TABLE mydb.events;

RESTORE TABLE mydb.events
FROM S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/events/', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY')
SETTINGS snapshot_from_current_service = 1
```

## 스냅샷 잠금 해제 \{#unlock-snapshot\}

각 스냅샷은 참조된 객체 스토리지 파일이 가비지 컬렉션되지 않도록 ClickHouse Keeper에 잠금을 유지합니다. 복원이 완료되었거나 더 이상 스냅샷이 필요하지 않으면 잠금을 해제하여 해당 잠금을 해제하십시오.

잠금 해제 방식은 두 가지입니다. 하나는 시스템 수준 잠금 해제로, 스냅샷의 모든 잠금을 한 번에 제거합니다. 다른 하나는 테이블별 잠금 해제로, 나머지 스냅샷은 그대로 유지하면서 단일 테이블의 잠금만 제거합니다.

**시스템 수준 잠금 해제** — 스냅샷의 모든 잠금을 제거합니다:

```sql
SYSTEM UNLOCK SNAPSHOT '<snapshot_id>'
FROM S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/events/', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY')
```

**테이블별 잠금 해제** — 하나의 테이블에 대해서만 잠금을 해제합니다:

```sql
ALTER TABLE mydb.events UNLOCK SNAPSHOT '<snapshot_id>'
FROM S3('https://my-bucket.s3.us-east-1.amazonaws.com/snapshots/events/', 'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY')
```

스냅샷 대상이 생성 시 Keeper에 저장되어 있으면 `FROM` 절은 선택 사항입니다(`system.snapshot_locks`의 `info` 컬럼에서 확인할 수 있습니다):

```sql
SYSTEM UNLOCK SNAPSHOT '<snapshot_id>'

-- or per-table:
ALTER TABLE mydb.events UNLOCK SNAPSHOT '<snapshot_id>'
```

잠금을 해제하면 해당 행이 `system.snapshot_locks`에서 사라지고, 다른 스냅샷에서 더 이상 참조되지 않는 파트도 `system.snapshot_parts`에서 사라집니다.

## 관측성 \{#observability\}

### system.backups \{#system-backups\}

모든 스냅샷 작업은 일반적인 백업 및 복원 작업과 함께 [`system.backups`](/operations/system-tables/backups)에 표시됩니다. 설정한 `id`(또는 명령어에서 반환된 UUID)로 이를 조회하십시오:

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

`system.snapshot_locks`는 현재 Keeper에 등록된 커밋된 스냅샷을 표시합니다. 스냅샷이 커밋되면 `/clickhouse/snapshot/committed/{snapshot_id}`에 Keeper 노드가 생성됩니다. 서버는 데이터 파트를 삭제하기 전에 커밋된 스냅샷이 해당 데이터 파트를 잠그고 있는지 확인합니다. 잠금이 있으면 삭제를 건너뜁니다. 이 잠금은 스냅샷의 잠금을 명시적으로 해제할 때까지 유지됩니다.

```sql
SELECT *
FROM system.snapshot_locks
```

| 컬럼          | 유형         | 설명                        |
| ----------- | ---------- | ------------------------- |
| `id`        | `String`   | 스냅샷 ID                    |
| `info`      | `String`   | 스냅샷 대상(예: `S3('...')`) |
| `ctime`     | `DateTime` | 이 잠금이 Keeper에서 생성된 시점     |
| `lock_path` | `String`   | 이 잠금의 Keeper 경로           |

각 행은 커밋된 스냅샷 하나를 나타냅니다. 더 이상 유효한 백업 대상이 없는 스냅샷 잠금이 보이면 `SYSTEM UNLOCK SNAPSHOT`을 실행하여 정리하십시오.

특정 스냅샷 잠금이 존재하는지 확인하려면:

```sql
SELECT id, info, lock_path
FROM system.snapshot_locks
WHERE id = 'events_snapshot_1'
```

### system.snapshot_parts \{#system-snapshot-parts\}

`system.snapshot_parts`는 현재 하나 이상의 스냅샷 잠금에 의해 고정된 데이터 파트를 보여줍니다. 잠금이 설정된 각 파트에 대해 `/clickhouse/snapshot/{table_uuid}/{part_name}`에 해당 파트의 압축 크기와 비압축 크기를 포함하는 Keeper 노드가 존재합니다. 이 테이블은 해당 노드를 읽어 현재 삭제되지 않도록 보호되는 파트를 보여줍니다.

```sql
SELECT *
FROM system.snapshot_parts
ORDER BY data_compressed_bytes DESC
LIMIT 20
```

| 컬럼                        | Type     | 설명                         |
| ------------------------- | -------- | -------------------------- |
| `name`                    | `String` | 데이터 파트 이름                  |
| `table_id`                | `String` | 이 파트가 속한 테이블의 UUID         |
| `data_compressed_bytes`   | `UInt64` | 이 파트의 압축된 크기               |
| `data_uncompressed_bytes` | `UInt64` | 이 파트의 비압축 크기               |
| `snapshots_size`          | `UInt64` | 현재 이 파트에 잠금을 보유하고 있는 스냅샷 수 |

`snapshots_size > 1`인 파트는 여러 스냅샷이 참조하고 있으므로, 해당 스냅샷의 잠금이 모두 해제될 때까지 객체 스토리지에서 제거되지 않습니다.

전체 고정 스토리지를 확인하려면:

```sql
SELECT
    formatReadableSize(sum(data_compressed_bytes)) AS total_pinned_compressed,
    formatReadableSize(sum(data_uncompressed_bytes)) AS total_pinned_uncompressed,
    count() AS parts_count
FROM system.snapshot_parts
```

스냅샷에 의해 잠겨 있지만 이미 삭제되었거나 서버에서 더 이상 활성 상태가 아닌 파트 — 즉, 스냅샷 잠금 때문에만 객체 스토리지에 유지되는 데이터를 찾으려면:

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

원본 데이터가 변경되거나 제거된 후 스냅샷을 보관할 때 발생하는 스토리지 오버헤드를 이해하는 데 유용합니다.