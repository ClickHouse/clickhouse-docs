---
description: '백업에서 테이블/데이터베이스를 읽기 전용 모드로 즉시 연결할 수 있도록 합니다.'
sidebar_label: '백업'
sidebar_position: 60
slug: /engines/database-engines/backup
title: '백업'
doc_type: 'reference'
---

# 백업 \{#backup\}

데이터베이스 백업을 사용하면 [백업](/operations/backup/overview)에서 테이블/데이터베이스를 읽기 전용 모드로 즉시 attach하여 사용할 수 있습니다.

데이터베이스 백업은 증분 백업과 비증분(전체) 백업 모두를 지원합니다.

## 데이터베이스 생성 \{#creating-a-database\}

```sql
CREATE DATABASE backup_database
ENGINE = Backup('database_name_inside_backup', 'backup_destination')
```

백업 대상은 `Disk`, `S3`, `File`과 같은 유효한 백업 [대상](/operations/backup/disk#configure-backup-destinations-for-disk)이 될 수 있습니다.

`Disk`를 백업 대상으로 사용하는 경우, 백업에서 데이터베이스를 생성하는 쿼리는 다음과 같습니다.

```sql
CREATE DATABASE backup_database
ENGINE = Backup('database_name_inside_backup', Disk('disk_name', 'backup_name'))
```

**엔진 파라미터**

* `database_name_inside_backup` — 백업 내 데이터베이스 이름.
* `backup_destination` — 백업 저장 위치.

## 사용 예시 \{#usage-example\}

`Disk`를 백업 대상으로 사용하는 예시를 만들어 보겠습니다. 먼저 `storage.xml`에서 백업용 디스크를 설정합니다.

```xml
<storage_configuration>
    <disks>
        <backups>
            <type>local</type>
            <path>/home/ubuntu/ClickHouseWorkDir/backups/</path>
        </backups>
    </disks>
</storage_configuration>
<backups>
    <allowed_disk>backups</allowed_disk>
    <allowed_path>/home/ubuntu/ClickHouseWorkDir/backups/</allowed_path>
</backups>
```

사용 예는 다음과 같습니다. 테스트 데이터베이스와 테이블을 생성하고 일부 데이터를 삽입한 다음 백업을 생성해 보겠습니다:

```sql
CREATE DATABASE test_database;

CREATE TABLE test_database.test_table_1 (id UInt64, value String) ENGINE=MergeTree ORDER BY id;
INSERT INTO test_database.test_table_1 VALUES (0, 'test_database.test_table_1');

CREATE TABLE test_database.test_table_2 (id UInt64, value String) ENGINE=MergeTree ORDER BY id;
INSERT INTO test_database.test_table_2 VALUES (0, 'test_database.test_table_2');

CREATE TABLE test_database.test_table_3 (id UInt64, value String) ENGINE=MergeTree ORDER BY id;
INSERT INTO test_database.test_table_3 VALUES (0, 'test_database.test_table_3');

BACKUP DATABASE test_database TO Disk('backups', 'test_database_backup');
```

이제 `test_database_backup` 백업이 생성되었으므로 `Backup` 데이터베이스를 생성합니다:

```sql
CREATE DATABASE test_database_backup ENGINE = Backup('test_database', Disk('backups', 'test_database_backup'));
```

이제 데이터베이스의 임의의 테이블에 쿼리를 실행할 수 있습니다.

```sql
SELECT id, value FROM test_database_backup.test_table_1;

┌─id─┬─value──────────────────────┐
│  0 │ test_database.test_table_1 │
└────┴────────────────────────────┘

SELECT id, value FROM test_database_backup.test_table_2;

┌─id─┬─value──────────────────────┐
│  0 │ test_database.test_table_2 │
└────┴────────────────────────────┘

SELECT id, value FROM test_database_backup.test_table_3;

┌─id─┬─value──────────────────────┐
│  0 │ test_database.test_table_3 │
└────┴────────────────────────────┘
```

이 데이터베이스 Backup도 일반 데이터베이스처럼 사용할 수 있습니다. 예를 들어, 이 Backup에 있는 테이블에 쿼리를 실행할 수 있습니다.

```sql
SELECT database, name FROM system.tables WHERE database = 'test_database_backup':

┌─database─────────────┬─name─────────┐
│ test_database_backup │ test_table_1 │
│ test_database_backup │ test_table_2 │
│ test_database_backup │ test_table_3 │
└──────────────────────┴──────────────┘
```
