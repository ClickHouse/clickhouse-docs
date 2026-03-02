---
description: 'ClickHouse 백업 및 복원 개요'
sidebar_label: '개요'
slug: /operations/backup/overview
title: 'ClickHouse의 백업 및 복원'
doc_type: 'reference'
---

import GenericSettings from '@site/i18n/ko/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_generic_settings.md';
import Syntax from '@site/i18n/ko/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_syntax.md';
import AzureSettings from '@site/i18n/ko/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_azure_settings.md';
import S3Settings from '@site/i18n/ko/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_s3_settings.md';

> 이 섹션에서는 ClickHouse의 백업 및 복원에 대해 전반적으로 설명합니다. 각 백업 방식에 대한 더
> 자세한 설명은 사이드바에 있는 해당 방식별 페이지를 참조하십시오.


## 소개 \{#introduction\}

[복제](/engines/table-engines/mergetree-family/replication)는 하드웨어 장애로부터는 보호하지만, 
데이터를 실수로 삭제하거나, 잘못된 테이블 또는 잘못된 클러스터의 테이블을 삭제하는 경우, 
그리고 잘못된 데이터 처리나 데이터 손상을 초래하는 소프트웨어 버그와 같은 
인적 오류로부터는 보호하지 않습니다. 

이러한 실수는 많은 경우 모든 레플리카에 영향을 미칩니다. ClickHouse에는 일부 유형의 실수를 
방지하기 위한 안전장치가 내장되어 있으며, 예를 들어 [기본값](/operations/settings/settings#max_table_size_to_drop)으로 
50 GB를 초과하는 데이터를 포함하는 `MergeTree` 패밀리 엔진 테이블은 
무작정 삭제할 수 없습니다. 그러나 이러한 안전장치가 모든 경우를 다 
포함하는 것은 아니므로 여전히 문제가 발생할 수 있습니다.

잠재적인 인적 오류를 효과적으로 완화하려면, 데이터를 백업하고 복원하는 전략을 
**미리** 신중하게 준비해야 합니다.

각 회사는 사용 가능한 리소스와 비즈니스 요구사항이 다르므로, 
모든 상황에 맞는 범용적인 ClickHouse 백업 및 복원 솔루션은 존재하지 않습니다. 
1 기가바이트의 데이터에 적합한 방식이 수십 페타바이트의 데이터에는 적합하지 않을 가능성이 큽니다. 
각각 장단점을 가진 다양한 접근 방식이 있으며, 이 문서 섹션에서는 이러한 방법들을 설명합니다. 
여러 접근 방식을 함께 사용하여 각 방법의 다양한 한계를 보완하는 것이 좋습니다.

:::note
무언가를 백업해 두었지만 실제로 복원을 시도해 본 적이 없다면, 
실제로 복원이 필요할 때 제대로 동작하지 않을 가능성이 높습니다 
(또는 최소한 비즈니스가 허용할 수 있는 시간보다 더 오래 걸릴 수 있습니다). 
따라서 어떤 백업 방식을 선택하든, 복원 프로세스도 반드시 자동화하고 
예비 ClickHouse 클러스터에서 정기적으로 연습해야 합니다.
:::

다음 페이지들은 ClickHouse에서 사용할 수 있는 다양한 백업 및 
복원 방법을 자세히 설명합니다:

| Page                                                                | Description                                                        |
|---------------------------------------------------------------------|--------------------------------------------------------------------|
| [Backup/restore using local disk or S3 disk](./01_local_disk.md)    | 로컬 디스크 또는 S3 디스크로/에서 백업 및 복원하는 방법을 설명합니다 |
| [Backup/restore using S3 endpoint](./02_s3_endpoint.md)             | S3 엔드포인트로/에서 백업 및 복원하는 방법을 설명합니다            |
| [Backup/restore using AzureBlobStorage](./03_azure_blob_storage.md) | Azure Blob Storage로/에서 백업 및 복원하는 방법을 설명합니다       |
| [Alternative methods](./04_alternative_methods.md)                  | 대체 백업 방법을 설명합니다                                       |        

백업은 다음과 같은 특성을 가질 수 있습니다:

- [전체 또는 증분](#backup-types) 방식
- [동기식 또는 비동기식](#synchronous-vs-asynchronous)으로 수행
- [동시 또는 비동시](#concurrent-vs-non-concurrent)로 수행
- [압축 또는 비압축](#compressed-vs-uncompressed) 형태
- [명명된 컬렉션(named collections)](#using-named-collections)을 사용
- 비밀번호로 보호
- [system 테이블, 로그 테이블, 액세스 관리 테이블](#system-backups)을 포함

## 백업 유형 \{#backup-types\}

백업은 전체 백업 또는 증분 백업으로 수행할 수 있습니다. 전체 백업은 데이터의 완전한 사본이며, 증분 백업은 마지막 전체 백업 이후 변경된 데이터의 변경분입니다.

전체 백업은 다른 백업에 의존하지 않는 단순하고 신뢰할 수 있는 복구 방법이라는 장점이 있습니다. 그러나 완료하는 데 오래 걸릴 수 있고 많은 저장 공간을 차지할 수 있습니다. 반면 증분 백업은 시간과 저장 공간 면에서 더 효율적이지만, 데이터를 복원하려면 모든 백업이 사용 가능해야 합니다.

요구 사항에 따라 다음과 같이 사용할 수 있습니다:

- **전체 백업**: 규모가 작은 데이터베이스나 중요 데이터에 사용합니다.
- **증분 백업**: 규모가 큰 데이터베이스이거나 백업을 자주, 그리고 비용 효율적으로 수행해야 할 때 사용합니다.
- **둘 다**: 예를 들어, 주간 전체 백업과 일일 증분 백업을 함께 사용하는 방식입니다.

## 동기식 vs 비동기식 백업 \{#synchronous-vs-asynchronous\}

`BACKUP` 및 `RESTORE` 명령은 `ASYNC`로도 지정할 수 있습니다. 이 경우 
백업 명령은 즉시 반환되고, 백업 프로세스는 백그라운드에서 실행됩니다.
명령에 `ASYNC`가 지정되지 않은 경우 백업 프로세스는 동기식으로 동작하며,
백업이 완료될 때까지 명령이 블로킹됩니다.

## 동시 백업과 비동시 백업 \{#concurrent-vs-non-concurrent\}

기본적으로 ClickHouse는 백업과 복원을 동시에 실행하도록 허용합니다. 이는
여러 개의 백업 또는 복원 작업을 병렬로 시작할 수 있음을 의미합니다. 다만
이러한 동작을 허용하지 않도록 제어할 수 있는 서버 수준 설정이 있습니다. 이
설정을 false로 지정하면, 한 번에 하나의 백업 또는 복원 작업만 클러스터에서
실행되도록 제한됩니다. 이는 작업 간 리소스 경합이나 잠재적인 충돌을 방지하는
데 도움이 됩니다.

백업/복원의 동시 실행을 허용하지 않으려면, 각각 다음 설정을 사용할 수 있습니다:

```xml
<clickhouse>
    <backups>
        <allow_concurrent_backups>false</allow_concurrent_backups>
        <allow_concurrent_restores>false</allow_concurrent_restores>
    </backups>
</clickhouse>
```

두 설정의 기본값은 모두 true이므로 기본적으로 동시에 백업/복원 작업이 허용됩니다. 클러스터에서 이 설정이 false인 경우에는 한 번에 하나의 백업/복원 작업만 실행할 수 있습니다.


## 압축된 백업과 비압축 백업 \{#compressed-vs-uncompressed\}

ClickHouse 백업은 `compression_method` 및 `compression_level` 설정으로 압축을 지원합니다.

백업을 생성할 때 다음을 지정할 수 있습니다:

```sql
BACKUP TABLE test.table
  TO Disk('backups', 'filename.zip')
  SETTINGS compression_method='lzma', compression_level=3
```


## 이름이 지정된 컬렉션 사용 \{#using-named-collections\}

이름이 지정된 컬렉션(named collections)을 사용하면 백업/복원 작업 전반에서 재사용할 수 있는 key-value 쌍(예: S3 자격 증명, 엔드포인트, 설정)을 저장할 수 있습니다.
이를 통해 다음을 수행할 수 있습니다:

- 관리자 권한이 없는 사용자로부터 자격 증명을 숨길 수 있습니다.
- 복잡한 구성을 중앙에 저장하여 명령을 단순화할 수 있습니다.
- 작업 전반에서 일관성을 유지할 수 있습니다.
- 쿼리 로그에서 자격 증명이 노출되는 것을 방지할 수 있습니다.

자세한 내용은 ["named collections"](/operations/named-collections)을 참조하십시오.

## 시스템, 로그 또는 액세스 관리 테이블 백업 \{#system-backups\}

시스템 테이블도 백업 및 복원 워크플로우에 포함할 수 있지만, 포함 여부는
구체적인 사용 사례에 따라 달라집니다.

`query_log`, `part_log`와 같이 `_log` 접미사를 가진 테이블 등
이력 데이터를 저장하는 시스템 테이블은 다른 테이블과 동일하게
백업하고 복원할 수 있습니다. 사용 사례에서 이력 데이터 분석이 중요하다면
(예: `query_log`를 사용해 쿼리 성능을 추적하거나 문제를 디버깅하는 경우),
이러한 테이블을 백업 전략에 포함하는 것이 좋습니다. 반대로 이러한 테이블의
이력 데이터가 필요하지 않다면, 백업 스토리지 공간을 절약하기 위해
제외할 수 있습니다.

users, roles, row_policies, settings_profiles, quotas와 같이 액세스 관리와 관련된
시스템 테이블은 백업 및 복원 작업에서 별도의 방식으로 처리됩니다.
이 테이블들이 백업에 포함되면, 그 내용은 별도의 `accessXX.txt` 파일로
내보내지며, 이 파일에는 액세스 엔터티를 생성하고 설정하기 위한
동일한 SQL 문이 포함됩니다. 복원 시에는 이 파일들을
해석하여 SQL 명령을 다시 적용함으로써 사용자, 역할 및 기타 설정을
재생성합니다. 이 기능을 통해 ClickHouse 클러스터의 액세스 제어
구성을 클러스터 전체 설정의 일부로 백업하고 복원할 수 있습니다.

이 기능은 SQL 명령을 통해 관리되는 구성
(「[SQL 기반 액세스 제어 및 계정 관리](/operations/access-rights#enabling-access-control)」로 언급됨)에만
적용됩니다. ClickHouse 서버 설정 파일(예: `users.xml`)에 정의된
액세스 구성은 백업에 포함되지 않으며 이 방법으로는 복원할 수 없습니다.

## 일반적인 구문 \{#syntax\}

<Syntax/>

### 명령어 요약 \{#command-summary\}

위의 각 명령어에 대한 자세한 설명은 아래와 같습니다.

| **Command**                                                            | **Description**                                                                                                                                      |
|------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| `BACKUP`                                                               | 지정한 객체의 백업을 생성합니다                                                                                                                     |
| `RESTORE`                                                              | 백업에서 객체를 복원합니다                                                                                                                           |
| `[ASYNC]`                                                              | 작업을 비동기적으로 실행합니다 (즉시 ID를 반환하며, 해당 ID로 진행 상태를 모니터링할 수 있습니다)                                                   |
| `TABLE [db.]table_name [AS [db.]table_name_in_backup]`                 | 특정 테이블을 백업/복원합니다 (이름을 변경할 수 있습니다)                                                                                            |
| `[PARTITION[S] partition_expr [,...]]`                                 | 테이블의 특정 파티션만 백업/복원합니다                                                                                                               |
| `DICTIONARY [db.]dictionary_name [AS [db.]name_in_backup]`             | 딕셔너리 객체를 백업/복원합니다                                                                                                                      |
| `DATABASE database_name [AS database_name_in_backup]`                  | 전체 데이터베이스를 백업/복원합니다 (이름을 변경할 수 있습니다)                                                                                      |
| `TEMPORARY TABLE table_name [AS table_name_in_backup]`                 | 임시 테이블을 백업/복원합니다 (이름을 변경할 수 있습니다)                                                                                            |
| `VIEW view_name [AS view_name_in_backup]`                              | VIEW를 백업/복원합니다 (이름을 변경할 수 있습니다)                                                                                                   |
| `[EXCEPT TABLES ...]`                                                  | 데이터베이스를 백업할 때 특정 테이블을 제외합니다                                                                                                    |
| `ALL`                                                                  | 모든 항목(전체 데이터베이스, 테이블 등)을 백업/복원합니다. ClickHouse 23.4 버전 이전에는 `ALL`이 `RESTORE` 명령어에만 적용되었습니다.              |
| `[EXCEPT {TABLES\|DATABASES}...]`                                      | `ALL`을 사용할 때 특정 테이블 또는 데이터베이스를 제외합니다                                                                                         |
| `[ON CLUSTER 'cluster_name']`                                          | ClickHouse 클러스터 전체에 걸쳐 백업/복원 작업을 실행합니다                                                                                          |
| `TO\|FROM`                                                             | 방향 지정: 백업 대상에는 `TO`, 복원 소스에는 `FROM`을 사용합니다                                                                                    |
| `File('<path>/<filename>')`                                            | 로컬 파일 시스템에 저장하거나 로컬 파일 시스템에서 복원합니다                                                                                        |
| `Disk('<disk_name>', '<path>/')`                                       | 구성된 디스크에 저장하거나 해당 디스크에서 복원합니다                                                                                                |
| `S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>')` | Amazon S3 또는 S3 호환 스토리지에 저장하거나 그로부터 복원합니다                                                                                     |
| `[SETTINGS ...]`                                                       | 설정 전체 목록은 아래 내용을 참조하십시오                                                                                                            |                                                                                                                         |

### 설정 \{#settings\}

**일반 백업/복원 설정**

<GenericSettings/>

**S3 관련 설정**

<S3Settings/>

**Azure 관련 설정**

<AzureSettings/>

## 관리 및 문제 해결 \{#check-the-status-of-backups\}

백업 명령은 `id`와 `status`를 반환하며, 해당 `id`를 사용하여 백업 상태를
확인할 수 있습니다. 이는 긴 `ASYNC` 백업의 진행 상황을 확인할 때 매우
유용합니다. 아래 예시는 기존 백업 파일을 덮어쓰려고 시도하는 과정에서 발생한
실패 사례를 보여줍니다.

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

[`system.backups`](/operations/system-tables/backups) 테이블과 함께 모든 백업 및 복원 작업은 시스템 로그 테이블인 [`system.backup_log`](/operations/system-tables/backup_log)에서도 추적됩니다:

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
