---
'description': '시스템 테이블로, `BACKUP` 및 `RESTORE` 작업에 대한 정보가 포함된 로그 항목을 담고 있습니다.'
'keywords':
- 'system table'
- 'backups'
'slug': '/operations/system-tables/backups'
'title': 'system.backups'
'doc_type': 'reference'
---


# system.backups

모든 `BACKUP` 또는 `RESTORE` 작업의 목록과 현재 상태 및 기타 속성을 포함합니다. 이 테이블은 지속적이지 않으며 마지막 서버 재시작 이후에 실행된 작업만 표시됩니다.

다음은 이름 및 주석 열이 포함된 마크다운 테이블입니다:

| Column              | Description                                                                                                          |
|---------------------|----------------------------------------------------------------------------------------------------------------------|
| `id`                | 작업 ID, SETTINGS id=...를 통해 전달되거나 임의로 생성된 UUID일 수 있습니다.                                   |
| `name`              | 작업 이름, `Disk('backups', 'my_backup')`와 같은 문자열입니다.                                                 |
| `base_backup_name`  | 기본 백업 작업 이름, `Disk('backups', 'my_base_backup')`와 같은 문자열입니다.                                     |
| `query_id`          | 백업을 시작한 쿼리의 쿼리 ID입니다.                                                                                |
| `status`            | 백업 또는 복원 작업의 상태입니다.                                                                                 |
| `error`             | 오류가 있을 경우 오류 메시지입니다.                                                                               |
| `start_time`        | 작업이 시작된 시간입니다.                                                                                         |
| `end_time`          | 작업이 완료된 시간입니다.                                                                                         |
| `num_files`         | 백업에 저장된 파일의 수입니다.                                                                                    |
| `total_size`        | 백업에 저장된 파일의 총 크기입니다.                                                                              |
| `num_entries`       | 백업 내의 항목 수, 즉 백업이 폴더에 저장되는 경우 폴더 내의 파일 수입니다.                                      |
| `uncompressed_size` | 백업의 압축 해제된 크기입니다.                                                                                     |
| `compressed_size`   | 백업의 압축된 크기입니다.                                                                                        |
| `files_read`        | 이 백업에서 RESTORE 중 읽은 파일 수를 반환합니다.                                                                 |
| `bytes_read`        | 이 백업에서 RESTORE 중 읽은 파일의 총 크기를 반환합니다.                                                         |
| `ProfileEvents`     | 이 작업 중에 캡처된 모든 프로파일 이벤트입니다.                                                                  |
