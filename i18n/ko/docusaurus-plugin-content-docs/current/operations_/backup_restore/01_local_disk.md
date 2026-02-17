---
description: '로컬 디스크를 대상으로 하거나 로컬 디스크에서 수행하는 백업/복원에 대한 자세한 설명'
sidebar_label: '로컬 디스크 / S3 디스크'
slug: /operations/backup/disk
title: 'ClickHouse에서의 백업 및 복원'
doc_type: 'guide'
---

import GenericSettings from '@site/i18n/ko/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_generic_settings.md';
import S3Settings from '@site/i18n/ko/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_s3_settings.md';
import ExampleSetup from '@site/i18n/ko/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_example_setup.md';
import Syntax from '@site/i18n/ko/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_syntax.md';


# 로컬 디스크로 BACKUP / RESTORE \{#backup-to-a-local-disk\}

## 구문 \{#syntax\}

<Syntax/>

## 디스크 백업 대상 구성 \{#configure-backup-destinations-for-disk\}

### 로컬 디스크에 대한 백업 대상 구성 \{#configure-a-backup-destination\}

아래 예제에서는 백업 대상이 `Disk('backups', '1.zip')`으로 지정되어 있는 것을 볼 수 있습니다.
`Disk` 백업 엔진을 사용하려면 먼저 아래 경로에 백업 대상을 지정하는 파일을 추가해야 합니다.

```text
/etc/clickhouse-server/config.d/backup_disk.xml
```

예를 들어, 아래 구성은 `backups`라는 디스크를 정의한 다음 해당 디스크를 **backups**의 **allowed&#95;disk** 목록에 추가합니다.

```xml
<clickhouse>
    <storage_configuration>
        <disks>
<!--highlight-next-line -->
            <backups>
                <type>local</type>
                <path>/backups/</path>
            </backups>
        </disks>
    </storage_configuration>
<!--highlight-start -->
    <backups>
        <allowed_disk>backups</allowed_disk>
        <allowed_path>/backups/</allowed_path>
    </backups>
<!--highlight-end -->
</clickhouse>
```


### S3 디스크용 백업 대상 구성 \{#backuprestore-using-an-s3-disk\}

ClickHouse 저장소 설정에서 S3 디스크를 구성하여 `BACKUP`/`RESTORE`를 S3로 수행할 수도 있습니다. 로컬 디스크에 대해 앞에서 수행한 것처럼 `/etc/clickhouse-server/config.d`에 파일을 추가하여 디스크를 다음과 같이 구성하십시오.

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3_plain>
                <type>s3_plain</type>
                <endpoint></endpoint>
                <access_key_id></access_key_id>
                <secret_access_key></secret_access_key>
            </s3_plain>
        </disks>
        <policies>
            <s3>
                <volumes>
                    <main>
                        <disk>s3_plain</disk>
                    </main>
                </volumes>
            </s3>
        </policies>
    </storage_configuration>

    <backups>
        <allowed_disk>s3_plain</allowed_disk>
    </backups>
</clickhouse>
```

S3 디스크에서의 `BACKUP`/`RESTORE`는 로컬 디스크와 동일한 방식으로 수행됩니다:

```sql
BACKUP TABLE data TO Disk('s3_plain', 'cloud_backup');
RESTORE TABLE data AS data_restored FROM Disk('s3_plain', 'cloud_backup');
```

:::note

* 이 디스크는 `MergeTree` 자체에는 사용하지 말고, `BACKUP`/`RESTORE` 용도로만 사용해야 합니다.
* 테이블이 S3 스토리지를 사용하고 있고 디스크 유형이 서로 다른 경우,
  대상 버킷으로 파트를 복사할 때 `CopyObject` 호출을 사용하지 않고
  다운로드 후 업로드하는 방식으로 동작하므로 매우 비효율적입니다. 이 경우
  이러한 용도에는 `BACKUP ... TO S3(<endpoint>)` 구문을 사용하는 것이 좋습니다.
  :::


## 로컬 디스크에 대한 백업/복원 사용 예시 \{#usage-examples\}

### 테이블 백업 및 복원 \{#backup-and-restore-a-table\}

<ExampleSetup />

테이블을 백업하려면 다음 명령을 실행하십시오:

```sql title="Query"
BACKUP TABLE test_db.test_table TO Disk('backups', '1.zip')
```

```response title="Response"
   ┌─id───────────────────────────────────┬─status─────────┐
1. │ 065a8baf-9db7-4393-9c3f-ba04d1e76bcd │ BACKUP_CREATED │
   └──────────────────────────────────────┴────────────────┘
```

테이블이 비어 있는 경우 다음 명령으로 백업에서 테이블을 복원할 수 있습니다.

```sql title="Query"
RESTORE TABLE test_db.test_table FROM Disk('backups', '1.zip')
```

```response title="Response"
   ┌─id───────────────────────────────────┬─status───┐
1. │ f29c753f-a7f2-4118-898e-0e4600cd2797 │ RESTORED │
   └──────────────────────────────────────┴──────────┘
```

:::note
위의 `RESTORE`는 `test.table` 테이블에 데이터가 있는 경우 실패합니다.
`allow_non_empty_tables=true` 설정을 사용하면 `RESTORE TABLE`이
비어 있지 않은 테이블에 데이터를 삽입할 수 있습니다. 이 설정을 사용하면 테이블의 기존 데이터와 백업에서 복원된 데이터가 섞이게 됩니다.
따라서 이 설정은 테이블에 데이터가 중복될 수 있으므로 주의해서 사용해야 합니다.
:::

이미 데이터가 들어 있는 테이블을 복원하려면 다음을 실행합니다:

```sql
RESTORE TABLE test_db.table_table FROM Disk('backups', '1.zip')
SETTINGS allow_non_empty_tables=true
```

테이블을 새 이름으로 복원하거나 백업할 수 있습니다.

```sql
RESTORE TABLE test_db.table_table AS test_db.test_table_renamed FROM Disk('backups', '1.zip')
```

해당 백업 아카이브의 구조는 다음과 같습니다:

```text
├── .backup
└── metadata
    └── test_db
        └── test_table.sql
```

{/* TO DO: 
  백업 포맷에 대한 설명을 여기에 추가해야 합니다. Issue 24a를 참조하십시오.
  https://github.com/ClickHouse/clickhouse-docs/issues/3968
  */ }

zip 이외의 형식도 사용할 수 있습니다. 자세한 내용은 아래의 [&quot;tar 아카이브 백업(Backups as tar archives)&quot;](#backups-as-tar-archives)를 참조하십시오.


### 디스크 증분 백업 \{#incremental-backups\}

ClickHouse에서 기준(base) 백업은 이후에 생성되는 증분 백업들의 기반이 되는
최초의 전체 백업입니다. 증분 백업은 기준 백업 이후에 발생한 변경 사항만을
저장하므로, 어떤 증분 백업에서든 복원하려면 기준 백업을 항상 사용할 수 있는
상태로 유지해야 합니다. 기준 백업 위치는 `base_backup` SETTING으로 설정할 수
있습니다.

:::note
증분 백업은 기준 백업에 의존합니다. 증분 백업에서 복원하려면 기준 백업을
항상 사용할 수 있는 상태로 유지해야 합니다.
:::

테이블의 증분 백업을 생성하려면, 먼저 기준(base) 백업을 생성하십시오:

```sql
BACKUP TABLE test_db.test_table TO Disk('backups', 'd.zip')
```

```sql
BACKUP TABLE test_db.test_table TO Disk('backups', 'incremental-a.zip')
SETTINGS base_backup = Disk('backups', 'd.zip')
```

증분 백업과 베이스 백업의 모든 데이터는 다음 명령을 사용하여 새 테이블 `test_db.test_table2`로 복원할 수 있습니다:

```sql
RESTORE TABLE test_db.test_table AS test_db.test_table2
FROM Disk('backups', 'incremental-a.zip');
```


### 백업 보호 \{#assign-a-password-to-the-backup\}

디스크에 기록되는 백업 파일에는 비밀번호를 설정할 수 있습니다.
비밀번호는 `password` 설정을 사용하여 지정할 수 있습니다:

```sql
BACKUP TABLE test_db.test_table
TO Disk('backups', 'password-protected.zip')
SETTINGS password='qwerty'
```

암호로 보호된 백업을 복원하려면 다시 `password` 설정을 사용하여 암호를 지정해야 합니다:

```sql
RESTORE TABLE test_db.test_table
FROM Disk('backups', 'password-protected.zip')
SETTINGS password='qwerty'
```


### tar 아카이브 형식의 백업 \{#backups-as-tar-archives\}

백업은 zip 아카이브뿐만 아니라 tar 아카이브로도 저장할 수 있습니다.
tar 아카이브의 경우 비밀번호 보호가 지원되지 않는다는 점을 제외하면
기능은 zip과 동일합니다. 추가로, tar 아카이브는 다양한 압축 방식을 지원합니다.

테이블을 tar 아카이브로 백업하려면 다음과 같이 수행합니다:

```sql
BACKUP TABLE test_db.test_table TO Disk('backups', '1.tar')
```

tar 아카이브로부터 복원하려면:

```sql
RESTORE TABLE test_db.test_table FROM Disk('backups', '1.tar')
```

압축 방식을 변경하려면 적절한 파일 확장자를 백업 이름에 추가해야 합니다.
예를 들어, tar 아카이브를 gzip으로 압축하려면 다음을 실행하십시오:

```sql
BACKUP TABLE test_db.test_table TO Disk('backups', '1.tar.gz')
```

지원되는 압축 파일 확장자는 다음과 같습니다.

* `tar.gz`
* `.tgz`
* `tar.bz2`
* `tar.lzma`
* `.tar.zst`
* `.tzst`
* `.tar.xz`


### 압축 설정 \{#compression-settings\}

압축 방식과 압축 수준은 각각 `compression_method` 및 `compression_level` 설정을 통해 지정할 수 있습니다.

{/* TO DO:
  해당 설정들에 대한 추가 설명과, 이러한 설정을 사용하는 이유에 대한 내용이 더 필요합니다 
  */ }

```sql
BACKUP TABLE test_db.test_table
TO Disk('backups', 'filename.zip')
SETTINGS compression_method='lzma', compression_level=3
```


### 특정 파티션 복원 \{#restore-specific-partitions\}

테이블과 연관된 특정 파티션만 복원해야 하는 경우, 해당 파티션만 지정할 수 있습니다.

4개의 파티션으로 구성된 간단한 테이블을 생성하고 여기에 데이터를 삽입한 뒤,
1번째와 4번째 파티션만 백업해 보겠습니다:

<details>
  <summary>설정</summary>

  ```sql
  CREATE IF NOT EXISTS test_db;
         
  -- 파티션 테이블 생성
  CREATE TABLE test_db.partitioned (
      id UInt32,
      data String,
      partition_key UInt8
  ) ENGINE = MergeTree()
  PARTITION BY partition_key
  ORDER BY id;

  INSERT INTO test_db.partitioned VALUES
  (1, 'data1', 1),
  (2, 'data2', 2),
  (3, 'data3', 3),
  (4, 'data4', 4);

  SELECT count() FROM test_db.partitioned;

  SELECT partition_key, count() 
  FROM test_db.partitioned
  GROUP BY partition_key
  ORDER BY partition_key;
  ```

  ```response
     ┌─count()─┐
  1. │       4 │
     └─────────┘
     ┌─partition_key─┬─count()─┐
  1. │             1 │       1 │
  2. │             2 │       1 │
  3. │             3 │       1 │
  4. │             4 │       1 │
     └───────────────┴─────────┘
  ```
</details>

다음 명령을 실행하여 1번과 4번 파티션을 백업합니다:

```sql
BACKUP TABLE test_db.partitioned PARTITIONS '1', '4'
TO Disk('backups', 'partitioned.zip')
```

다음 명령을 실행하여 파티션 1과 4를 복원하십시오:

```sql
RESTORE TABLE test_db.partitioned PARTITIONS '1', '4'
FROM Disk('backups', 'partitioned.zip')
SETTINGS allow_non_empty_tables=true
```
