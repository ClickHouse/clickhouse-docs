---
'description': 'ClickHouse 백업 및 복원에 대한 개요'
'sidebar_label': '개요'
'slug': '/operations/backup/overview'
'title': 'ClickHouse에서 백업 및 복원'
'doc_type': 'reference'
---

import GenericSettings from '@site/i18n/ko/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_generic_settings.md';
import Syntax from '@site/i18n/ko/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_syntax.md';
import AzureSettings from '@site/i18n/ko/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_azure_settings.md';
import S3Settings from '@site/i18n/ko/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_s3_settings.md';

> 이 섹션에서는 ClickHouse의 백업 및 복원에 대해 광범위하게 다룹니다. 각 백업 방법에 대한 더 자세한 설명은 사이드바의 특정 방법에 대한 페이지를 참조하십시오.

## 소개 {#introduction}

[복제](/engines/table-engines/mergetree-family/replication)는 하드웨어 고장으로부터 보호하지만, 인간의 오류로부터는 보호하지 않습니다: 데이터의 우발적 삭제, 잘못된 테이블 삭제 또는 잘못된 클러스터의 테이블 삭제, 잘못된 데이터 처리나 데이터 손상을 초래하는 소프트웨어 버그 등이 있습니다.

이런 실수는 많은 경우 모든 복제본에 영향을 미칩니다. ClickHouse는 특정 유형의 실수를 방지하기 위한 내장 보호 장치를 가지고 있으며, 예를 들어, [기본적으로](/operations/settings/settings#max_table_size_to_drop) 50 Gb 이상의 데이터를 포함하는 `MergeTree` 계열 엔진의 테이블을 쉽게 드롭할 수는 없습니다. 그러나 이러한 보호 장치는 모든 가능한 사례를 포함하지 않으며 여전히 문제가 발생할 수 있습니다.

가능한 인간 오류를 효과적으로 완화하려면 데이터를 백업하고 복원하는 전략을 **미리** 신중하게 준비해야 합니다.

각 회사는 사용 가능한 자원과 비즈니스 요구 사항이 다르므로, 모든 상황에 맞는 ClickHouse 백업 및 복원에 대한 보편적인 솔루션은 없습니다. 한 기가바이트 데이터에 대한 방법이 수십 페타바이트 데이터에는 적용되지 않을 가능성이 높습니다. 여러 가지 장단점이 있는 다양한 접근 방식이 있으며, 이 문서의 섹션에서 제시됩니다. 다양한 단점을 보완하기 위해 한 가지 방법뿐 아니라 여러 가지 접근 방식을 사용하는 것이 좋습니다.

:::note
어떤 것을 백업하고 복원해보지 않았다면, 실제로 필요할 때 복원이 제대로 되지 않을 가능성이 있으므로, 비즈니스에서 수용할 수 있는 시간보다 더 길어질 수 있습니다. 따라서 어떤 백업 접근 방식을 선택하든 복원 프로세스를 자동화하고, 여분의 ClickHouse 클러스터에서 정기적으로 연습하는 것이 중요합니다.
:::

다음 페이지에서는 ClickHouse에서 사용할 수 있는 다양한 백업 및 복원 방법에 대해 설명합니다:

| 페이지                                                                | 설명                                               |
|---------------------------------------------------------------------|---------------------------------------------------|
| [로컬 디스크 또는 S3 디스크를 사용한 백업/복원](./01_local_disk.md)    | 로컬 디스크 또는 S3 디스크로의 백업/복원을 자세히 설명합니다. |
| [S3 엔드포인트를 사용한 백업/복원](./02_s3_endpoint.md)             | S3 엔드포인트로의 백업/복원을 자세히 설명합니다. |
| [AzureBlobStorage를 사용한 백업/복원](./03_azure_blob_storage.md) | Azure blob 저장소로의 백업/복원을 자세히 설명합니다. |
| [대체 방법](./04_alternative_methods.md)                  | 대체 백업 방법에 대해 논의합니다.                      |        

백업은 다음과 같은 특성을 가질 수 있습니다:
- [전체 또는 증분](#backup-types)
- [동기 또는 비동기](#synchronous-vs-asynchronous)
- [동시 또는 비동시](#concurrent-vs-non-concurrent)
- [압축 또는 비압축](#compressed-vs-uncompressed)
- [명명된 컬렉션 사용](#using-named-collections)
- 비밀번호 보호
- [시스템 테이블, 로그 테이블 또는 액세스 관리 테이블의 백업](#system-backups)

## 백업 유형 {#backup-types}

백업은 전체 또는 증분으로 나눌 수 있습니다. 전체 백업은 데이터의 완전한 복사본이며, 증분 백업은 마지막 전체 백업 이후의 데이터 변화(델타)입니다.

전체 백업은 다른 백업에 독립적이고 신뢰할 수 있는 복구 방법이라는 장점이 있습니다. 그러나 완료되는 데 오랜 시간이 걸릴 수 있으며 많은 공간을 차지할 수 있습니다. 반면, 증분 백업은 시간과 공간 측면에서 더 효율적이지만, 데이터 복원에는 모든 백업이 필요합니다.

필요에 따라 다음을 사용할 수 있습니다:
- 작은 데이터베이스나 중요한 데이터의 경우 **전체 백업**.
- 데이터베이스가 큰 경우나 자주 자주 비용 효율적인 백업이 필요한 경우 **증분 백업**.
- 예를 들어, 매주 전체 백업과 매일 증분 백업을 **둘 다** 사용하는 경우.

## 동기 vs 비동기 백업 {#synchronous-vs-asynchronous}

`BACKUP` 및 `RESTORE` 명령은 `ASYNC`로 표시할 수도 있습니다. 이 경우 백업 명령은 즉시 반환되며, 백업 프로세스는 백그라운드에서 실행됩니다. 명령이 `ASYNC`로 표시되지 않은 경우 백업 프로세스는 동기적으로 작동하며 명령은 백업이 완료될 때까지 차단됩니다.

## 동시 vs 비동시 백업 {#concurrent-vs-non-concurrent}

기본적으로 ClickHouse는 동시 백업 및 복원을 허용합니다. 즉, 여러 백업 또는 복원 작업을 동시에 시작할 수 있습니다. 그러나 이러한 동작을 금지하는 서버 수준 설정이 있습니다. 이러한 설정을 false로 설정하면 클러스터에서 한 번에 하나의 백업 또는 복원 작업만 실행할 수 있습니다. 이는 리소스 경쟁이나 작업 간의 잠재적 충돌을 피하는 데 도움이 될 수 있습니다.

동시 백업/복원을 금지하려면 각각 다음 설정을 사용할 수 있습니다:

```xml
<clickhouse>
    <backups>
        <allow_concurrent_backups>false</allow_concurrent_backups>
        <allow_concurrent_restores>false</allow_concurrent_restores>
    </backups>
</clickhouse>
```

기본값은 true이므로 기본적으로 동시 백업/복원이 허용됩니다. 이러한 설정이 클러스터에서 false인 경우 클러스터에서 한 번에 단일 백업/복원만 실행할 수 있습니다.

## 압축 vs 비압축 백업 {#compressed-vs-uncompressed}

ClickHouse 백업은 `compression_method` 및 `compression_level` 설정을 통해 압축을 지원합니다.

백업을 생성할 때 다음을 지정할 수 있습니다:

```sql
BACKUP TABLE test.table
  TO Disk('backups', 'filename.zip')
  SETTINGS compression_method='lzma', compression_level=3
```

## 명명된 컬렉션 사용 {#using-named-collections}

명명된 컬렉션을 사용하면 백업/복원 작업 간에 재사용할 수 있는 키-값 쌍(예: S3 자격 증명, 엔드포인트 및 설정)을 저장할 수 있습니다. 그들은 다음을 돕습니다:

- 관리자 액세스 권한이 없는 사용자로부터 자격 증명 숨기기
- 복잡한 구성을 중앙에서 저장하여 명령 단순화
- 작업 간 일관성 유지
- 쿼리 로그에서 자격 증명 노출 방지

자세한 내용은 ["명명된 컬렉션"](/operations/named-collections)를 참조하십시오.

## 시스템, 로그 또는 액세스 관리 테이블 백업 {#system-backups}

시스템 테이블도 백업 및 복원 작업에 포함될 수 있지만, 그 포함 여부는 특정 사용 사례에 따라 다릅니다.

역사적 데이터를 저장하는 시스템 테이블, 예를 들어 `_log` 접미사가 있는 테이블 (예: `query_log`, `part_log` 등)은 다른 테이블과 마찬가지로 백업 및 복원이 가능합니다. 역사적 데이터를 분석해야 하는 경우, 예를 들어 `query_log`를 사용하여 쿼리 성능을 추적하거나 문제를 디버깅하려는 경우, 이러한 테이블을 백업 전략에 포함하는 것이 좋습니다. 그러나 이러한 테이블의 역사적 데이터가 필요하지 않은 경우 백업 저장 공간을 절약하기 위해 제외할 수 있습니다.

사용자, 역할, 행 정책, 설정 프로파일 및 할당량과 같은 액세스 관리와 관련된 시스템 테이블은 백업 및 복원 작업에서 특별한 대우를 받습니다. 이러한 테이블이 백업에 포함될 경우, 그 내용은 SQL 엔티티를 생성하고 구성하기 위한 동등한 SQL 문을 캡슐화하는 특별한 `accessXX.txt` 파일로 내보내집니다. 복원 시 복원 프로세스는 이러한 파일을 해석하고 사용자, 역할 및 기타 구성을 재생성하기 위한 SQL 명령을 재적용합니다. 이 기능은 ClickHouse 클러스터의 액세스 제어 구성을 클러스터의 전체 설정의 일환으로 백업하고 복원할 수 있도록 보장합니다.

이 기능은 SQL 명령을 통해 관리되는 구성에 대해서만 작동합니다. (["SQL 기반 액세스 제어 및 계정 관리"](/operations/access-rights#enabling-access-control)라고 합니다). ClickHouse 서버 구성 파일 (예: `users.xml`)에 정의된 액세스 구성은 백업에 포함되지 않으며 이 방법으로 복원할 수 없습니다.

## 일반 구문 {#syntax}

<Syntax/>

### 명령 요약 {#command-summary}

위의 각 명령은 아래에서 자세히 설명됩니다:

| **명령**                                                            | **설명**                                                                                                                                      |
|------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| `BACKUP`                                                               | 지정된 객체의 백업을 생성합니다.                                                                                                                |
| `RESTORE`                                                              | 백업에서 객체를 복원합니다.                                                                                                                       |
| `[ASYNC]`                                                              | 비동기적으로 작업을 실행합니다 (즉시 반환되며 모니터링할 수 있는 ID가 제공됩니다).                                                              |
| `TABLE [db.]table_name [AS [db.]table_name_in_backup]`                 | 특정 테이블의 백업/복원을 수행합니다 (이름을 변경할 수 있습니다).                                                                                                  |
| `[PARTITION[S] partition_expr [,...]]`                                 | 테이블의 특정 파티션만 백업/복원합니다.                                                                                                 |
| `DICTIONARY [db.]dictionary_name [AS [db.]name_in_backup]`             | 딕셔너리 객체의 백업/복원을 수행합니다.                                                                                                                |
| `DATABASE database_name [AS database_name_in_backup]`                  | 전체 데이터베이스의 백업/복원을 수행합니다 (이름을 변경할 수 있습니다).                                                                                                |
| `TEMPORARY TABLE table_name [AS table_name_in_backup]`                 | 임시 테이블의 백업/복원을 수행합니다 (이름을 변경할 수 있습니다).                                                                                                 |
| `VIEW view_name [AS view_name_in_backup]`                              | 뷰의 백업/복원을 수행합니다 (이름을 변경할 수 있습니다).                                                                                                            |
| `[EXCEPT TABLES ...]`                                                  | 데이터베이스의 특정 테이블을 백업할 때 제외합니다.                                                                                                   |
| `ALL`                                                                  | 모든 것을 백업/복원합니다 (모든 데이터베이스, 테이블 등). ClickHouse의 23.4 버전 이전에는 `ALL`이 `RESTORE` 명령에만 적용되었습니다. |
| `[EXCEPT {TABLES\|DATABASES}...]`                                      | `ALL`을 사용할 때 특정 테이블이나 데이터베이스를 제외합니다.                                                                                                |
| `[ON CLUSTER 'cluster_name']`                                          | ClickHouse 클러스터에서 백업/복원을 실행합니다.                                                                                               |
| `TO\|FROM`                                                             | 방향: 백업 대상은 `TO`, 복원 원본은 `FROM`                                                                                     |
| `File('<path>/<filename>')`                                            | 로컬 파일 시스템에서 저장하거나 복원합니다.                                                                                                              |
| `Disk('<disk_name>', '<path>/')`                                       | 구성된 디스크에서 저장하거나 복원합니다.                                                                                                              |
| `S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>')` | Amazon S3 또는 S3 호환 저장소에서 저장하거나 복원합니다.                                                                                             |
| `[SETTINGS ...]`                                                       | 아래에서 설정의 전체 목록을 참조하십시오.                                                                                                              |                                                                                                                         |

### 설정 {#settings}

**일반 백업/복원 설정**

<GenericSettings/>

**S3 특정 설정**

<S3Settings/>

**Azure 특정 설정**

<AzureSettings/>

## 관리 및 문제 해결 {#check-the-status-of-backups}

백업 명령은 `id`와 `status`를 반환하며, 해당 `id`를 사용하여 백업의 상태를 확인할 수 있습니다. 이는 긴 `ASYNC` 백업의 진행 상황을 확인하는 데 매우 유용합니다. 아래 예제는 기존 백업 파일을 덮어쓰려고 할 때 발생한 오류를 보여줍니다:

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

[`system.backups`](/operations/system-tables/backups) 테이블과 함께 모든 백업 및 복원 작업은 시스템 로그 테이블 [`system.backup_log`](/operations/system-tables/backup_log)에서도 추적됩니다:

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
