---
'description': 'ClickHouse 데이터베이스 및 테이블을 백업하고 복원하는 가이드'
'sidebar_label': '백업 및 복원'
'sidebar_position': 10
'slug': '/operations/backup'
'title': '백업 및 복원'
'doc_type': 'guide'
---


# 백업 및 복원

- [로컬 디스크에 백업하기](#backup-to-a-local-disk)
- [S3 엔드포인트를 사용하도록 백업/복원 구성하기](#configuring-backuprestore-to-use-an-s3-endpoint)
- [S3 디스크를 사용한 백업/복원](#backuprestore-using-an-s3-disk)
- [대안](#alternatives)

## 명령 요약 {#command-summary}

```bash
BACKUP|RESTORE
 TABLE [db.]table_name [AS [db.]table_name_in_backup]
   [PARTITION[S] partition_expr [, ...]] |
 DICTIONARY [db.]dictionary_name [AS [db.]name_in_backup] |
 DATABASE database_name [AS database_name_in_backup]
   [EXCEPT TABLES ...] |
 TEMPORARY TABLE table_name [AS table_name_in_backup] |
 VIEW view_name [AS view_name_in_backup] |
 ALL [EXCEPT {TABLES|DATABASES}...] } [, ...]
 [ON CLUSTER 'cluster_name']
 TO|FROM File('<path>/<filename>') | Disk('<disk_name>', '<path>/') | S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>')
 [SETTINGS base_backup = File('<path>/<filename>') | Disk(...) | S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>')]
 [SYNC|ASYNC]

```

:::note ALL
ClickHouse 버전 23.4 이전에는 `ALL`이 `RESTORE` 명령에만 적용되었습니다.
:::

## 배경 {#background}

[복제](../engines/table-engines/mergetree-family/replication.md)는 하드웨어 실패에 대한 보호를 제공하지만, 인적 오류에 대한 보호는 제공하지 않습니다: 데이터의 우발적 삭제, 잘못된 테이블의 삭제 또는 잘못된 클러스터에서의 테이블 삭제, 잘못된 데이터 처리 또는 데이터 손상을 초래하는 소프트웨어 버그 등. 이러한 실수는 많은 경우 모든 복제본에 영향을 미칩니다. ClickHouse에는 일부 유형의 실수를 방지하기 위한 내장 안전 장치가 있습니다. 예를 들어 기본적으로 [50 Gb 이상의 데이터를 포함하는 MergeTree 엔진으로 테이블을 단순히 삭제할 수 없습니다](/operations/settings/settings#max_table_size_to_drop). 그러나 이러한 안전 장치는 모든 가능한 경우를 포괄하지 않으며 우회가 가능합니다.

가능한 인적 오류를 효과적으로 완화하기 위해 데이터 백업 및 복원 전략을 **미리** 신중하게 준비해야 합니다.

각 회사는 사용 가능한 자원과 비즈니스 요구 사항이 다르기 때문에 모든 상황에 맞는 ClickHouse 백업 및 복원에 대한 보편적인 솔루션은 없습니다. 1GB의 데이터에 적합한 방법은 수십 페타바이트에는 작동하지 않을 수 있습니다. 여러 접근 방식이 있으며, 각각 장단점이 존재하므로 아래에서 논의됩니다. 다양한 단점을 보완하기 위해 한 가지 방법만 사용하는 것보다 여러 가지 접근 방식을 사용하는 것이 좋습니다.

:::note
어떤 것을 백업하고 복원을 시도하지 않았다면, 실제로 필요할 때 복원이 제대로 작동하지 않을 가능성이 높습니다 (또는 비즈니스가 참을 수 있는 것보다 시간이 더 걸릴 것입니다). 따라서 어떤 백업 접근 방식을 선택하든 복원 프로세스도 자동화하고, 정기적으로 여분의 ClickHouse 클러스터에서 연습하는 것을 확인하세요.
:::

## 로컬 디스크에 백업하기 {#backup-to-a-local-disk}

### 백업 대상 구성하기 {#configure-a-backup-destination}

아래의 예에서 백업 대상은 `Disk('backups', '1.zip')`와 같이 지정됩니다. 대상을 준비하기 위해 `/etc/clickhouse-server/config.d/backup_disk.xml`에 백업 대상을 지정하는 파일을 추가합니다. 예를 들어, 이 파일은 `backups`라는 이름의 디스크를 정의하고 이 디스크를 **backups > allowed_disk** 목록에 추가합니다:

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

### 매개변수 {#parameters}

백업은 전체 또는 증분으로 수행될 수 있으며, 테이블(물리화된 뷰, 프로젝션 및 딕셔너리 포함) 및 데이터베이스를 포함할 수 있습니다. 백업은 동기(기본값) 또는 비동기로 수행될 수 있으며, 압축할 수 있습니다. 백업은 파일에 대한 비밀번호 보호를 적용할 수 있습니다.

BACKUP 및 RESTORE 명령은 DATABASE 및 TABLE 이름 목록, 대상(또는 소스), 옵션 및 설정을 사용합니다: 
- 백업의 대상 또는 복원의 소스. 이는 앞서 정의된 디스크를 기반으로 합니다. 예를 들어 `Disk('backups', 'filename.zip')`
- ASYNC: 비동기 백업 또는 복원
- PARTITIONS: 복원할 파티션 목록
- SETTINGS:
  - `id`: 백업 또는 복원 작업의 식별자입니다. 설정되지 않거나 비어 있으면 무작위로 생성된 UUID가 사용됩니다. 비어 있지 않은 문자열로 명시적으로 설정된 경우 매번 다르게 설정해야 합니다. 이 `id`는 특정 백업 또는 복원 작업과 관련된 `system.backups` 테이블의 행을 찾는 데 사용됩니다.
  - [`compression_method`](/sql-reference/statements/create/table#column_compression_codec) 및 압축 수준
  - 디스크의 파일에 대한 `password`
  - `base_backup`: 이 소스의 이전 백업의 대상. 예: `Disk('backups', '1.zip')`
  - `use_same_s3_credentials_for_base_backup`: S3에 대한 기본 백업이 쿼리의 자격 증명을 상속해야 하는지 여부. `S3`에 대해서만 작동합니다.
  - `use_same_password_for_base_backup`: 기본 백업 아카이브가 쿼리의 비밀번호를 상속해야 하는지 여부.
  - `structure_only`: 활성화되면 데이터 없이 CREATE 문만 백업 또는 복원할 수 있습니다.
  - `storage_policy`: 복원될 테이블의 스토리지 정책. [여러 블록 장치를 데이터 저장용으로 사용하는 방법](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes)을 참조하세요. 이 설정은 `RESTORE` 명령에만 적용됩니다. 지정된 스토리지 정책은 `MergeTree` 계열 엔진을 가진 테이블에만 적용됩니다.
  - `s3_storage_class`: S3 백업에 사용되는 스토리지 클래스. 예: `STANDARD`
  - `azure_attempt_to_create_container`: Azure Blob Storage를 사용할 때, 지정된 컨테이너가 존재하지 않을 경우 생성하려고 시도하는지 여부. 기본값: true.
  - [코어 설정들](/operations/settings/settings)도 여기에서 사용될 수 있습니다.

### 사용 예제 {#usage-examples}

테이블을 백업한 후 복원하기:
```sql
BACKUP TABLE test.table TO Disk('backups', '1.zip')
```

해당 복원:
```sql
RESTORE TABLE test.table FROM Disk('backups', '1.zip')
```

:::note
위의 RESTORE는 `test.table`이 데이터를 포함하고 있으면 실패하므로, RESTORE를 테스트하려면 테이블을 삭제해야 하거나 `allow_non_empty_tables=true` 설정을 사용해야 합니다:
```sql
RESTORE TABLE test.table FROM Disk('backups', '1.zip')
SETTINGS allow_non_empty_tables=true
```
:::

테이블은 새 이름으로 복원하거나 백업할 수 있습니다:
```sql
RESTORE TABLE test.table AS test.table2 FROM Disk('backups', '1.zip')
```

```sql
BACKUP TABLE test.table3 AS test.table4 TO Disk('backups', '2.zip')
```

### 증분 백업 {#incremental-backups}

증분 백업은 `base_backup`을 지정하여 수행할 수 있습니다.
:::note
증분 백업은 기본 백업에 의존합니다. 증분 백업으로부터 복원하려면 기본 백업이 사용 가능해야 합니다.
:::

기존 백업 이후의 데이터를 증분적으로 저장합니다. 설정 `base_backup`은 이전 백업 이후 `Disk('backups', 'd.zip')`의 데이터를 `Disk('backups', 'incremental-a.zip')`에 저장하게 합니다:
```sql
BACKUP TABLE test.table TO Disk('backups', 'incremental-a.zip')
  SETTINGS base_backup = Disk('backups', 'd.zip')
```

증분 백업과 기본 백업의 모든 데이터를 복원하여 새 테이블 `test.table2`에 복원합니다:
```sql
RESTORE TABLE test.table AS test.table2
  FROM Disk('backups', 'incremental-a.zip');
```

### 백업에 비밀번호 할당하기 {#assign-a-password-to-the-backup}

디스크에 기록된 백업 파일에는 비밀번호를 적용할 수 있습니다:
```sql
BACKUP TABLE test.table
  TO Disk('backups', 'password-protected.zip')
  SETTINGS password='qwerty'
```

복원:
```sql
RESTORE TABLE test.table
  FROM Disk('backups', 'password-protected.zip')
  SETTINGS password='qwerty'
```

### 압축 설정 {#compression-settings}

압축 방법이나 수준을 지정하려면:
```sql
BACKUP TABLE test.table
  TO Disk('backups', 'filename.zip')
  SETTINGS compression_method='lzma', compression_level=3
```

### 특정 파티션 복원하기 {#restore-specific-partitions}
특정 테이블과 관련된 파티션을 복원해야 하는 경우 이들을 지정할 수 있습니다. 백업에서 파티션 1과 4를 복원하려면:
```sql
RESTORE TABLE test.table PARTITIONS '2', '3'
  FROM Disk('backups', 'filename.zip')
```

### tar 아카이브로서의 백업 {#backups-as-tar-archives}

백업은 tar 아카이브로 저장될 수도 있습니다. 이 기능은 zip과 동일하지만 비밀번호는 지원되지 않습니다.

백업을 tar로 작성합니다:
```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar')
```

해당 복원:
```sql
RESTORE TABLE test.table FROM Disk('backups', '1.tar')
```

압축 방법을 변경하려면, 올바른 파일 접미사를 백업 이름에 추가해야 합니다. 즉, tar 아카이브를 gzip으로 압축하려면:
```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar.gz')
```

지원되는 압축 파일 접미사는 `tar.gz`, `.tgz`, `tar.bz2`, `tar.lzma`, `.tar.zst`, `.tzst`, `.tar.xz`입니다.

### 백업 상태 확인하기 {#check-the-status-of-backups}

백업 명령은 `id`와 `status`를 반환하며, 이 `id`는 백업 상태를 확인하는 데 사용할 수 있습니다. 이는 긴 ASYNC 백업의 진행 상황을 확인하는 데 매우 유용합니다. 아래 예는 기존 백업 파일을 덮어쓰려고 시도할 때 발생한 실패를 보여줍니다:
```sql
BACKUP TABLE helloworld.my_first_table TO Disk('backups', '1.zip') ASYNC
```
```response
┌─id───────────────────────────────────┬─status──────────┐
│ 7678b0b3-f519-4e6e-811f-5a0781a4eb52 │ CREATING_BACKUP │
└──────────────────────────────────────┴─────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

```sql
SELECT
    *
FROM system.backups
WHERE id='7678b0b3-f519-4e6e-811f-5a0781a4eb52'
FORMAT Vertical
```
```response
Row 1:
──────
id:                7678b0b3-f519-4e6e-811f-5a0781a4eb52
name:              Disk('backups', '1.zip')
#highlight-next-line
status:            BACKUP_FAILED
num_files:         0
uncompressed_size: 0
compressed_size:   0
#highlight-next-line
error:             Code: 598. DB::Exception: Backup Disk('backups', '1.zip') already exists. (BACKUP_ALREADY_EXISTS) (version 22.8.2.11 (official build))
start_time:        2022-08-30 09:21:46
end_time:          2022-08-30 09:21:46

1 row in set. Elapsed: 0.002 sec.
```

`system.backups` 테이블과 함께 모든 백업 및 복원 작업도 시스템 로그 테이블 [backup_log](../operations/system-tables/backup_log.md)에 기록됩니다:
```sql
SELECT *
FROM system.backup_log
WHERE id = '7678b0b3-f519-4e6e-811f-5a0781a4eb52'
ORDER BY event_time_microseconds ASC
FORMAT Vertical
```
```response
Row 1:
──────
event_date:              2023-08-18
event_time_microseconds: 2023-08-18 11:13:43.097414
id:                      7678b0b3-f519-4e6e-811f-5a0781a4eb52
name:                    Disk('backups', '1.zip')
status:                  CREATING_BACKUP
error:
start_time:              2023-08-18 11:13:43
end_time:                1970-01-01 03:00:00
num_files:               0
total_size:              0
num_entries:             0
uncompressed_size:       0
compressed_size:         0
files_read:              0
bytes_read:              0

Row 2:
──────
event_date:              2023-08-18
event_time_microseconds: 2023-08-18 11:13:43.174782
id:                      7678b0b3-f519-4e6e-811f-5a0781a4eb52
name:                    Disk('backups', '1.zip')
status:                  BACKUP_FAILED
#highlight-next-line
error:                   Code: 598. DB::Exception: Backup Disk('backups', '1.zip') already exists. (BACKUP_ALREADY_EXISTS) (version 23.8.1.1)
start_time:              2023-08-18 11:13:43
end_time:                2023-08-18 11:13:43
num_files:               0
total_size:              0
num_entries:             0
uncompressed_size:       0
compressed_size:         0
files_read:              0
bytes_read:              0

2 rows in set. Elapsed: 0.075 sec.
```

## S3 엔드포인트를 사용하도록 BACKUP/RESTORE 구성하기 {#configuring-backuprestore-to-use-an-s3-endpoint}

S3 버킷에 백업을 쓰려면 세 가지 정보가 필요합니다:
- S3 엔드포인트,
  예: `https://mars-doc-test.s3.amazonaws.com/backup-S3/`
- 액세스 키 ID,
  예: `ABC123`
- 비밀 액세스 키,
  예: `Abc+123`

:::note
S3 버킷 생성은 [S3 객체 저장소를 ClickHouse 디스크로 사용하는 방법](../integrations/data-ingestion/s3/index.md#configuring-s3-for-clickhouse-use)에 설명되어 있습니다. 정책을 저장한 후 이 문서로 돌아오세요. ClickHouse를 S3 버킷에 사용할 필요는 없습니다.
:::

백업의 대상은 다음과 같이 지정됩니다:

```sql
S3('<S3 endpoint>/<directory>', '<Access key ID>', '<Secret access key>')
```

```sql
CREATE TABLE data
(
    `key` Int,
    `value` String,
    `array` Array(String)
)
ENGINE = MergeTree
ORDER BY tuple()
```

```sql
INSERT INTO data SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 1000
```

### 기본(초기) 백업 만들기 {#create-a-base-initial-backup}

증분 백업은 시작할 기본 백업이 필요합니다. 이 예는 이후 기본 백업으로 사용됩니다. S3 대상의 첫 번째 매개변수는 S3 엔드포인트 다음에 이 백업에 사용할 버킷 내 디렉터리입니다. 이 예에서 디렉터리는 `my_backup`이라고 합니다.

```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ de442b75-a66c-4a3c-a193-f76f278c70f3 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

### 데이터 추가하기 {#add-more-data}

증분 백업은 기본 백업과 현재 백업 중인 테이블의 내용 간의 차이로 채워집니다. 증분 백업을 수행하기 전에 데이터를 추가합니다:

```sql
INSERT INTO data SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 100
```
### 증분 백업 수행하기 {#take-an-incremental-backup}

이 백업 명령은 기본 백업과 유사하지만 `SETTINGS base_backup`과 기본 백업의 위치를 추가합니다. 증분 백업의 대상이 기본 백업과 동일한 디렉토리가 아닙니다. 기본 백업은 `my_backup`에 있으며, 증분 백업은 `my_incremental`에 기록됩니다:
```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123') SETTINGS base_backup = S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ f6cd3900-850f-41c9-94f1-0c4df33ea528 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```
### 증분 백업에서 복원하기 {#restore-from-the-incremental-backup}

이 명령은 증분 백업을 새 테이블 `data3`로 복원합니다. 증분 백업을 복원할 때 기본 백업도 포함됩니다. 복원할 때 증분 백업만 지정합니다:
```sql
RESTORE TABLE data AS data3 FROM S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status───┐
│ ff0c8c39-7dff-4324-a241-000796de11ca │ RESTORED │
└──────────────────────────────────────┴──────────┘
```

### 카운트 확인하기 {#verify-the-count}

원래 테이블 `data`에 두 번 삽입되었으며, 하나는 1,000행과 하나는 100행으로 총 1,100입니다. 복원된 테이블에 1,100행이 있는지 확인합니다:
```sql
SELECT count()
FROM data3
```
```response
┌─count()─┐
│    1100 │
└─────────┘
```

### 내용 확인하기 {#verify-the-content}
원래 테이블 `data`와 복원된 테이블 `data3`의 내용을 비교합니다:
```sql
SELECT throwIf((
        SELECT groupArray(tuple(*))
        FROM data
    ) != (
        SELECT groupArray(tuple(*))
        FROM data3
    ), 'Data does not match after BACKUP/RESTORE')
```
## S3 디스크를 사용한 BACKUP/RESTORE {#backuprestore-using-an-s3-disk}

ClickHouse 스토리지 구성에서 S3 디스크를 구성하여 S3로 `BACKUP`/`RESTORE`를 수행할 수도 있습니다. `/etc/clickhouse-server/config.d`에 파일을 추가하여 디스크를 다음과 같이 구성합니다:

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

그런 다음 일반적으로 `BACKUP`/`RESTORE`를 수행합니다:

```sql
BACKUP TABLE data TO Disk('s3_plain', 'cloud_backup');
RESTORE TABLE data AS data_restored FROM Disk('s3_plain', 'cloud_backup');
```

:::note
하지만 명심하세요:
- 이 디스크는 `MergeTree` 자체에 사용되어서는 안 되며, 오직 `BACKUP`/`RESTORE` 용도로만 사용되어야 합니다.
- 테이블이 S3 저장소에 의해 지원되는 경우, S3 서버 측 복사본을 사용하여 `CopyObject` 호출로 파트를 대상 버킷으로 복사하려고 시도합니다. 인증 오류가 발생하면 버퍼 방법을 사용하는 복사(파트 다운로드 및 업로드)로 대체되며, 이는 매우 비효율적입니다. 이 경우, 대상 버킷의 자격 증명을 사용하여 원본 버킷에 대한 `read` 권한이 있는지 확인해야 할 수 있습니다.
:::

## 명명된 컬렉션 사용하기 {#using-named-collections}

명명된 컬렉션을 `BACKUP/RESTORE` 매개변수로 사용할 수 있습니다. [여기](./named-collections.md#named-collections-for-backups)에서 예제를 참조하세요.

## 대안 {#alternatives}

ClickHouse는 디스크에 데이터를 저장하며, 디스크를 백업하는 다양한 방법이 있습니다. 이전에 사용된 몇 가지 대안이며, 귀하의 환경에 잘 맞겠는데요.

### 소스 데이터를 다른 곳에 복제하기 {#duplicating-source-data-somewhere-else}

ClickHouse에 수집된 데이터는 종종 [Apache Kafka](https://kafka.apache.org)와 같은 지속적인 큐를 통해 전달됩니다. 이 경우 추가 구독자 집합을 구성하여 ClickHouse에 쓰일 때 동일한 데이터 스트림을 읽고 차가운 저장소에 저장할 수 있습니다. 대부분의 기업은 기본적으로 권장되는 차가운 저장소를 이미 가지고 있으며, 이는 객체 저장소 또는 [HDFS](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html)와 같은 분산 파일 시스템이 될 수 있습니다.

### 파일 시스템 스냅샷 {#filesystem-snapshots}

일부 로컬 파일 시스템은 스냅샷 기능을 제공합니다(예: [ZFS](https://en.wikipedia.org/wiki/ZFS)), 그러나 이는 라이브 쿼리 서비스에 최선의 선택이 아닐 수 있습니다. 가능한 해결책은 이러한 종류의 파일 시스템으로 추가 복제본을 생성하고 `SELECT` 쿼리에 사용되는 [분산 테이블](../engines/table-engines/special/distributed.md)에서 제외하는 것입니다. 이러한 복제본의 스냅샷은 데이터를 수정하는 모든 쿼리의 접근할 수 없습니다. 보너스로 이러한 복제본은 서버당 더 많은 디스크가 부착된 특별한 하드웨어 구성일 수 있으며, 비용 효과적일 수 있습니다.

더 작은 데이터 볼륨의 경우 간단한 `INSERT INTO ... SELECT ...`을 원격 테이블에 사용하여 해결할 수도 있습니다.

### 파트 조작 {#manipulations-with-parts}

ClickHouse는 `ALTER TABLE ... FREEZE PARTITION ...` 쿼리를 사용하여 테이블 파트의 로컬 복사본을 생성할 수 있도록 허용합니다. 이는 `/var/lib/clickhouse/shadow/` 폴더에 하드링크를 사용하여 구현되어, 일반적으로 오래된 데이터에 추가 디스크 공간을 소비하지 않습니다. 생성된 파일의 복사본은 ClickHouse 서버에 의해 관리되지 않으므로, 그냥 그대로 두면 됩니다: 추가적인 외부 시스템이 필요 없는 단순한 백업을 가지고 있지만 여전히 하드웨어 문제에는 취약합니다. 이러한 이유로 원격 위치에 복사한 후 로컬 복사본을 제거하는 것이 더 좋습니다. 분산 파일 시스템과 객체 저장소는 여전히 좋은 선택이지만, 충분한 용량을 가진 일반적인 첨부된 파일 서버도 잘 작동할 수 있습니다(이 경우 전송은 네트워크 파일 시스템 또는 [rsync](https://en.wikipedia.org/wiki/Rsync)를 통해 이루어질 수 있습니다).
백업에서 복원하려면 `ALTER TABLE ... ATTACH PARTITION ...`을 사용합니다.

파티션 조작과 관련된 쿼리에 대한 자세한 내용은 [ALTER 문서](/sql-reference/statements/alter/partition)를 참조하세요.

이 접근 방식을 자동화하는 제3자 도구가 있습니다: [clickhouse-backup](https://github.com/AlexAkulov/clickhouse-backup).

## 동시 백업/복원을 금지하기 위한 설정 {#settings-to-disallow-concurrent-backuprestore}

동시 백업/복원을 금지하려면, 다음 설정을 각각 사용할 수 있습니다.

```xml
<clickhouse>
    <backups>
        <allow_concurrent_backups>false</allow_concurrent_backups>
        <allow_concurrent_restores>false</allow_concurrent_restores>
    </backups>
</clickhouse>
```

기본값은 true이며, 따라서 기본적으로 동시 백업/복원이 허용됩니다.
이 설정이 클러스터에서 false인 경우, 클러스터에서 동시에 1개의 백업/복원만 실행될 수 있습니다.

## AzureBlobStorage 엔드포인트를 사용하도록 BACKUP/RESTORE 구성하기 {#configuring-backuprestore-to-use-an-azureblobstorage-endpoint}

AzureBlobStorage 컨테이너에 백업을 쓰려면 다음 정보가 필요합니다:
- AzureBlobStorage 엔드포인트 연결 문자열 / URL,
- 컨테이너,
- 경로,
- 계정 이름(이 URL가 지정된 경우)
- 계정 키(이 URL가 지정된 경우)

백업의 대상은 다음과 같이 지정됩니다:

```sql
AzureBlobStorage('<connection string>/<url>', '<container>', '<path>', '<account name>', '<account key>')
```

```sql
BACKUP TABLE data TO AzureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;',
    'testcontainer', 'data_backup');
RESTORE TABLE data AS data_restored FROM AzureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;',
    'testcontainer', 'data_backup');
```

## 시스템 테이블 백업하기 {#backup-up-system-tables}

시스템 테이블도 백업 및 복원 워크플로우에 포함될 수 있지만, 그 포함 여부는 특정 사용 사례에 따라 다릅니다.

### 로그 테이블 백업하기 {#backing-up-log-tables}

과거 데이터를 저장하는 시스템 테이블, 예를 들어 _log 접미사가 있는 테이블(예: `query_log`, `part_log`)은 다른 테이블과 마찬가지로 백업 및 복원할 수 있습니다. 사용 사례가 쿼리 성능을 추적하거나 문제를 디버그하기 위해 query_log를 사용하여 과거 데이터를 분석하는 것이라면 이러한 테이블을 백업 전략에 포함하는 것이 좋습니다. 그러나 이러한 테이블의 과거 데이터가 필요 없다면 백업 저장 공간을 절약하기 위해 제외할 수 있습니다.

### 액세스 관리 테이블 백업하기 {#backing-up-access-management-tables}

사용자, 역할, row_policies, settings_profiles 및 쿼터와 같은 액세스 관리와 관련된 시스템 테이블은 백업 및 복원 작업 동안 특별한 처리를 받습니다. 이러한 테이블이 백업에 포함되면 그 내용은 `accessXX.txt`라는 특별한 파일로 내보내지며, 이는 액세스 엔터티 생성 및 구성에 대한 SQL 문을 캡슐화합니다. 복원할 때 복원 프로세스는 이 파일을 해석하고 SQL 명령을 다시 적용하여 사용자, 역할 및 기타 구성을 재생성합니다.

이 기능은 ClickHouse 클러스터의 액세스 제어 구성을 백업 및 클러스터의 전체 설정의 일부로 복원할 수 있도록 보장합니다.

참고: 이 기능은 SQL 명령을 통해 관리되는 구성에 대해서만 작동합니다( ["SQL 기반 액세스 제어 및 계정 관리"](/operations/access-rights#enabling-access-control) 참조). ClickHouse 서버 구성 파일(예: `users.xml`)에 정의된 액세스 구성은 백업에 포함되지 않으며 이 방법을 통해 복원할 수 없습니다.
