---
'description': '로컬 디스크에서 또는 로컬 디스크로의 백업/복원 세부 정보'
'sidebar_label': '로컬 디스크 / S3 디스크'
'slug': '/operations/backup/disk'
'title': 'ClickHouse에서 백업 및 복원'
'doc_type': 'guide'
---

import GenericSettings from '@site/i18n/ko/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_generic_settings.md';
import S3Settings from '@site/i18n/ko/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_s3_settings.md';
import ExampleSetup from '@site/i18n/ko/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_example_setup.md';
import Syntax from '@site/i18n/ko/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_syntax.md';


# 백업 / 복원 to disk {#backup-to-a-local-disk}

## 구문 {#syntax}

<Syntax/>

## 디스크용 백업 대상 구성 {#configure-backup-destinations-for-disk}

### 로컬 디스크용 백업 대상 구성 {#configure-a-backup-destination}

아래 예제에서는 백업 대상을 `Disk('backups', '1.zip')`로 지정하는 방법을 보여줍니다.  
`Disk` 백업 엔진을 사용하려면 먼저 아래 경로에 백업 대상을 지정하는 파일을 추가해야 합니다:

```text
/etc/clickhouse-server/config.d/backup_disk.xml
```

예를 들어, 아래 구성은 `backups`라는 이름의 디스크를 정의하고, 그 디스크를
**allowed_disk** 목록에 추가합니다:

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

### S3 디스크용 백업 대상 구성 {#backuprestore-using-an-s3-disk}

ClickHouse 스토리지 구성에서 S3 디스크를 구성하여 `BACKUP`/`RESTORE`를 S3에 할 수 있습니다. 로컬 디스크와 마찬가지로 
`/etc/clickhouse-server/config.d`에 파일을 추가하여 디스크를 이렇게 구성합니다.

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

S3 디스크에 대한 `BACKUP`/`RESTORE`는 로컬 디스크와 동일한 방식으로 수행됩니다:

```sql
BACKUP TABLE data TO Disk('s3_plain', 'cloud_backup');
RESTORE TABLE data AS data_restored FROM Disk('s3_plain', 'cloud_backup');
```

:::note
- 이 디스크는 `MergeTree` 자체에 사용되어서는 안 되며, 오로지 `BACKUP`/`RESTORE`에만 사용해야 합니다.
- 테이블이 S3 스토리지에 백업되며 디스크의 유형이 다를 경우, 
`CopyObject` 호출을 사용하여 파트를 대상으로 복사하지 않고, 대신 다운로드 및 업로드를 수행하므로 매우 비효율적입니다. 이 경우에는 
`BACKUP ... TO S3(<endpoint>)` 구문을 사용하는 것이 좋습니다.
:::

## 로컬 디스크에 대한 백업/복원 사용 예제 {#usage-examples}

### 테이블 백업 및 복원 {#backup-and-restore-a-table}

<ExampleSetup/>

테이블을 백업하기 위해 다음 명령을 실행할 수 있습니다:

```sql title="Query"
BACKUP TABLE test_db.test_table TO Disk('backups', '1.zip')
```

```response title="Response"
   ┌─id───────────────────────────────────┬─status─────────┐
1. │ 065a8baf-9db7-4393-9c3f-ba04d1e76bcd │ BACKUP_CREATED │
   └──────────────────────────────────────┴────────────────┘
```

테이블에 데이터가 비어 있는 경우, 다음 명령을 사용하여 백업에서 복원할 수 있습니다:

```sql title="Query"
RESTORE TABLE test_db.test_table FROM Disk('backups', '1.zip')
```

```response title="Response"
   ┌─id───────────────────────────────────┬─status───┐
1. │ f29c753f-a7f2-4118-898e-0e4600cd2797 │ RESTORED │
   └──────────────────────────────────────┴──────────┘
```

:::note
위의 `RESTORE`는 테이블 `test.table`에 데이터가 포함된 경우 실패합니다.
설정 `allow_non_empty_tables=true`는 `RESTORE TABLE`이 비어 있지 않은 테이블에 데이터를 삽입할 수 있도록 허용합니다. 이는 테이블의 이전 데이터와 백업에서 추출된 데이터가 혼합됩니다.
따라서 이 설정은 테이블의 데이터 중복을 야기할 수 있으며, 주의해서 사용해야 합니다.
:::

데이터가 이미 있는 테이블을 복원하려면 다음을 실행합니다:

```sql
RESTORE TABLE test_db.table_table FROM Disk('backups', '1.zip')
SETTINGS allow_non_empty_tables=true
```

테이블은 새로운 이름으로 복원하거나 백업할 수 있습니다:

```sql
RESTORE TABLE test_db.table_table AS test_db.test_table_renamed FROM Disk('backups', '1.zip')
```

이 백업의 백업 아카이브 구조는 다음과 같습니다:

```text
├── .backup
└── metadata
    └── test_db
        └── test_table.sql
```

<!-- TO DO: 
백업 형식에 대한 설명. Issue 24a 참조
https://github.com/ClickHouse/clickhouse-docs/issues/3968
--> 

zip 외의 형식도 사용할 수 있습니다. 아래의 ["tar 아카이브로서의 백업"](#backups-as-tar-archives)에서 더 자세한 내용을 확인하십시오.

### 디스크에 대한 증분 백업 {#incremental-backups}

ClickHouse의 기본 백업은 이후 증분 백업이 생성되는 초기 전체 백업입니다. 증분 백업은 기본 백업 이후의 변경 사항만 저장하므로, 
모든 증분 백업에서 복원하려면 기본 백업을 계속 사용할 수 있어야 합니다. 기본 백업 대상은 
설정 `base_backup`을 통해 설정할 수 있습니다.

:::note
증분 백업은 기본 백업에 의존합니다. 기본 백업은 증분 백업에서 복원할 수 있도록 항상 사용 가능해야 합니다.
:::

테이블의 증분 백업을 만들려면 먼저 기본 백업을 만들어야 합니다:

```sql
BACKUP TABLE test_db.test_table TO Disk('backups', 'd.zip')
```

```sql
BACKUP TABLE test_db.test_table TO Disk('backups', 'incremental-a.zip')
SETTINGS base_backup = Disk('backups', 'd.zip')
```

증분 백업과 기본 백업의 모든 데이터를 새로운 테이블 `test_db.test_table2`로 복원할 수 있습니다:

```sql
RESTORE TABLE test_db.test_table AS test_db.test_table2
FROM Disk('backups', 'incremental-a.zip');
```

### 백업 보호하기 {#assign-a-password-to-the-backup}

디스크에 작성된 백업에는 파일에 적용할 수 있는 비밀번호를 설정할 수 있습니다.
비밀번호는 `password` 설정을 사용하여 지정할 수 있습니다:

```sql
BACKUP TABLE test_db.test_table
TO Disk('backups', 'password-protected.zip')
SETTINGS password='qwerty'
```

비밀번호로 보호된 백업을 복원하려면, 다시 한번 `password` 설정을 사용하여 비밀번호를 지정해야 합니다:

```sql
RESTORE TABLE test_db.test_table
FROM Disk('backups', 'password-protected.zip')
SETTINGS password='qwerty'
```

### tar 아카이브로서의 백업 {#backups-as-tar-archives}

백업은 zip 아카이브뿐만 아니라 tar 아카이브로도 저장할 수 있습니다. 
기능은 zip과 동일하지만, tar 아카이브는 비밀번호 보호를 지원하지 않습니다. 또한, tar 아카이브는 다양한 
압축 방법을 지원합니다.

테이블을 tar로 백업하려면:

```sql
BACKUP TABLE test_db.test_table TO Disk('backups', '1.tar')
```

tar 아카이브에서 복원하려면:

```sql
RESTORE TABLE test_db.test_table FROM Disk('backups', '1.tar')
```

압축 방법을 변경하려면, 백업 이름에 올바른 파일 접미사를 추가해야 합니다. 예를 들어, gzip을 사용하여 tar 아카이브를 압축하려면 다음을 실행합니다:

```sql
BACKUP TABLE test_db.test_table TO Disk('backups', '1.tar.gz')
```

지원되는 압축 파일 접미사는 다음과 같습니다:
- `tar.gz`
- `.tgz`
- `tar.bz2`
- `tar.lzma`
- `.tar.zst`
- `.tzst`
- `.tar.xz`

### 압축 설정 {#compression-settings}

압축 방법과 압축 수준은 각각 설정 `compression_method`와 `compression_level`을 사용하여 지정할 수 있습니다.

<!-- TO DO:
이 설정에 대한 추가 정보와 이를 통해 수행하고자 하는 이유에 대한 설명 필요
-->

```sql
BACKUP TABLE test_db.test_table
TO Disk('backups', 'filename.zip')
SETTINGS compression_method='lzma', compression_level=3
```

### 특정 파티션 복원 {#restore-specific-partitions}

테이블과 관련된 특정 파티션을 복원해야 하는 경우 이를 지정할 수 있습니다.

간단한 파티션화된 테이블을 4개의 파트로 생성하고, 일부 데이터를 삽입한 다음 
첫 번째와 네 번째 파트만 백업을 수행해 보겠습니다:

<details>

<summary>설정</summary>

```sql
CREATE IF NOT EXISTS test_db;

-- Create a partitioend table
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

다음 명령을 실행하여 1번과 4번 파트를 백업합니다:

```sql
BACKUP TABLE test_db.partitioned PARTITIONS '1', '4'
TO Disk('backups', 'partitioned.zip')
```

다음 명령을 실행하여 1번과 4번 파트를 복원합니다:

```sql
RESTORE TABLE test_db.partitioned PARTITIONS '1', '4'
FROM Disk('backups', 'partitioned.zip')
SETTINGS allow_non_empty_tables=true
```
