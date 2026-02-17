---
description: '`BACKUP` 및 `RESTORE` 작업에 대한 로그 항목이 저장된 시스템 테이블입니다.'
keywords: ['system 테이블', '백업']
slug: /operations/system-tables/backups
title: 'system.backups'
doc_type: 'reference'
---

# system.backups \{#systembackups\}

현재 상태와 기타 속성을 포함한 모든 `BACKUP` 또는 `RESTORE` 작업의 목록을 제공합니다. 이 테이블은 지속되지 않으며 마지막 서버 재시작 이후에 실행된 작업만 표시합니다.

다음은 컬럼 이름과 설명을 포함한 마크다운 테이블입니다:

| Column              | Description                                                                                                          |
|---------------------|----------------------------------------------------------------------------------------------------------------------|
| `id`                | Operation ID입니다. `SETTINGS id=...`로 전달되거나 무작위로 생성된 UUID일 수 있습니다.                                  |
| `name`              | 작업 이름입니다. `Disk('backups', 'my_backup')`와 같은 문자열입니다.                                                  |
| `base_backup_name`  | 기준 백업 작업 이름입니다. `Disk('backups', 'my_base_backup')`와 같은 문자열입니다.                                   |
| `query_id`          | 백업을 시작한 쿼리의 Query ID입니다.                                                                                  |
| `status`            | 백업 또는 복원 작업의 상태입니다.                                                                                     |
| `error`             | 오류 메시지입니다(있는 경우).                                                                                         |
| `start_time`        | 작업이 시작된 시간입니다.                                                                                             |
| `end_time`          | 작업이 완료된 시간입니다.                                                                                             |
| `num_files`         | 백업에 저장된 파일 개수입니다.                                                                                        |
| `total_size`        | 백업에 저장된 파일의 전체 크기입니다.                                                                                |
| `num_entries`       | 백업에 있는 항목 개수입니다. 예를 들어, 백업이 폴더로 저장된 경우 해당 폴더 안의 파일 개수입니다.                      |
| `uncompressed_size` | 백업의 비압축 크기입니다.                                                                                             |
| `compressed_size`   | 백업의 압축된 크기입니다.                                                                                            |
| `files_read`        | 이 백업에서 `RESTORE` 작업 중에 읽은 파일 개수를 반환합니다.                                                          |
| `bytes_read`        | 이 백업에서 `RESTORE` 작업 중에 읽은 파일의 전체 크기를 반환합니다.                                                  |
| `ProfileEvents`     | 이 작업 동안 수집된 모든 프로파일 이벤트입니다.                                                                       |