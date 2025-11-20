---
'description': '시스템 테이블로 `BACKUP` 및 `RESTORE` 작업에 대한 정보와 함께 로깅 항목을 포함합니다.'
'keywords':
- 'system table'
- 'backup_log'
'slug': '/operations/system-tables/backup_log'
'title': 'system.backup_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.backup_log

<SystemTableCloud/>

`BACKUP` 및 `RESTORE` 작업에 대한 정보가 포함된 로그 항목입니다.

컬럼:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 쿼리를 실행하는 서버의 호스트명.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 항목의 날짜.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 항목의 날짜 및 시간.
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 마이크로초 정밀도의 항목 시간.
- `id` ([String](../../sql-reference/data-types/string.md)) — 백업 또는 복원 작업의 식별자.
- `name` ([String](../../sql-reference/data-types/string.md)) — 백업 스토리지의 이름 ( `FROM` 또는 `TO` 절의 내용).
- `status` ([Enum8](../../sql-reference/data-types/enum.md)) — 작업 상태. 가능한 값:
  - `'CREATING_BACKUP'`
  - `'BACKUP_CREATED'`
  - `'BACKUP_FAILED'`
  - `'RESTORING'`
  - `'RESTORED'`
  - `'RESTORE_FAILED'`
- `error` ([String](../../sql-reference/data-types/string.md)) — 실패한 작업의 오류 메시지 (성공적인 작업에는 빈 문자열).
- `start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 작업의 시작 시간.
- `end_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 작업의 종료 시간.
- `num_files` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 백업에 저장된 파일 수.
- `total_size` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 백업에 저장된 파일의 총 크기.
- `num_entries` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 백업 내 항목 수, 즉 백업이 폴더로 저장된 경우 폴더 내 파일 수 또는 백업이 아카이브로 저장된 경우 아카이브 내 파일 수. 이는 증분 백업일 경우, 빈 파일이나 중복이 포함된 경우 `num_files`와 동일하지 않습니다. 다음은 항상 참입니다: `num_entries <= num_files`.
- `uncompressed_size` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 백업의 압축 해제된 크기.
- `compressed_size` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 백업의 압축된 크기. 백업이 아카이브로 저장되지 않은 경우 `uncompressed_size`와 같습니다.
- `files_read` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 복원 작업 중 읽은 파일 수.
- `bytes_read` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 복원 작업 중 읽은 파일의 총 크기.

**예제**

```sql
BACKUP TABLE test_db.my_table TO Disk('backups_disk', '1.zip')
```
```response
┌─id───────────────────────────────────┬─status─────────┐
│ e5b74ecb-f6f1-426a-80be-872f90043885 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```
```sql
SELECT * FROM system.backup_log WHERE id = 'e5b74ecb-f6f1-426a-80be-872f90043885' ORDER BY event_date, event_time_microseconds \G
```
```response
Row 1:
──────
hostname:                clickhouse.eu-central1.internal
event_date:              2023-08-19
event_time_microseconds: 2023-08-19 11:05:21.998566
id:                      e5b74ecb-f6f1-426a-80be-872f90043885
name:                    Disk('backups_disk', '1.zip')
status:                  CREATING_BACKUP
error:                   
start_time:              2023-08-19 11:05:21
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
hostname:                clickhouse.eu-central1.internal
event_date:              2023-08-19
event_time:              2023-08-19 11:08:56
event_time_microseconds: 2023-08-19 11:08:56.916192
id:                      e5b74ecb-f6f1-426a-80be-872f90043885
name:                    Disk('backups_disk', '1.zip')
status:                  BACKUP_CREATED
error:                   
start_time:              2023-08-19 11:05:21
end_time:                2023-08-19 11:08:56
num_files:               57
total_size:              4290364870
num_entries:             46
uncompressed_size:       4290362365
compressed_size:         3525068304
files_read:              0
bytes_read:              0
```
```sql
RESTORE TABLE test_db.my_table FROM Disk('backups_disk', '1.zip')
```
```response
┌─id───────────────────────────────────┬─status───┐
│ cdf1f731-52ef-42da-bc65-2e1bfcd4ce90 │ RESTORED │
└──────────────────────────────────────┴──────────┘
```
```sql
SELECT * FROM system.backup_log WHERE id = 'cdf1f731-52ef-42da-bc65-2e1bfcd4ce90' ORDER BY event_date, event_time_microseconds \G
```
```response
Row 1:
──────
hostname:                clickhouse.eu-central1.internal
event_date:              2023-08-19
event_time_microseconds: 2023-08-19 11:09:19.718077
id:                      cdf1f731-52ef-42da-bc65-2e1bfcd4ce90
name:                    Disk('backups_disk', '1.zip')
status:                  RESTORING
error:                   
start_time:              2023-08-19 11:09:19
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
hostname:                clickhouse.eu-central1.internal
event_date:              2023-08-19
event_time_microseconds: 2023-08-19 11:09:29.334234
id:                      cdf1f731-52ef-42da-bc65-2e1bfcd4ce90
name:                    Disk('backups_disk', '1.zip')
status:                  RESTORED
error:                   
start_time:              2023-08-19 11:09:19
end_time:                2023-08-19 11:09:29
num_files:               57
total_size:              4290364870
num_entries:             46
uncompressed_size:       4290362365
compressed_size:         4290362365
files_read:              57
bytes_read:              4290364870
```

이는 기본적으로 시스템 테이블 `system.backups`에 기록된 동일한 정보입니다:

```sql
SELECT * FROM system.backups ORDER BY start_time
```
```response
┌─id───────────────────────────────────┬─name──────────────────────────┬─status─────────┬─error─┬──────────start_time─┬────────────end_time─┬─num_files─┬─total_size─┬─num_entries─┬─uncompressed_size─┬─compressed_size─┬─files_read─┬─bytes_read─┐
│ e5b74ecb-f6f1-426a-80be-872f90043885 │ Disk('backups_disk', '1.zip') │ BACKUP_CREATED │       │ 2023-08-19 11:05:21 │ 2023-08-19 11:08:56 │        57 │ 4290364870 │          46 │        4290362365 │      3525068304 │          0 │          0 │
│ cdf1f731-52ef-42da-bc65-2e1bfcd4ce90 │ Disk('backups_disk', '1.zip') │ RESTORED       │       │ 2023-08-19 11:09:19 │ 2023-08-19 11:09:29 │        57 │ 4290364870 │          46 │        4290362365 │      4290362365 │         57 │ 4290364870 │
└──────────────────────────────────────┴───────────────────────────────┴────────────────┴───────┴─────────────────────┴─────────────────────┴───────────┴────────────┴─────────────┴───────────────────┴─────────────────┴────────────┴────────────┘
```

**참고** 

- [백업 및 복원](../../operations/backup.md)
