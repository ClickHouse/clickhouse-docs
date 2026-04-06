---
description: 'S3 또는 Azure Blob Storage와 같은 원격 디스크에 저장된 데이터 파일에 대한 정보를 담고 있는 시스템 테이블입니다.'
keywords: ['시스템 테이블', 'remote_data_paths']
slug: /operations/system-tables/remote_data_paths
title: 'system.remote_data_paths'
doc_type: 'reference'
---

원격 디스크(예: S3, Azure Blob Storage)에 저장된 데이터 파일 정보와 로컬 메타데이터 경로 및 원격 blob 경로 간의 매핑 정보를 제공합니다.

각 행은 데이터 파일에 연결된 원격 blob 객체 1개를 나타냅니다.

컬럼:

* `disk_name` ([String](../../sql-reference/data-types/string.md)) — 스토리지 구성에 정의된 원격 디스크의 이름입니다.
* `path` ([String](../../sql-reference/data-types/string.md)) — 스토리지 구성에서 설정한 원격 디스크의 루트 경로입니다.
* `cache_base_path` ([String](../../sql-reference/data-types/string.md)) — 원격 디스크와 연결된 캐시 파일의 기본 디렉터리입니다.
* `local_path` ([String](../../sql-reference/data-types/string.md)) — 원격 blob에 매핑되는 파일을 가리키는 로컬 메타데이터 파일 경로이며, ClickHouse 데이터 디렉터리를 기준으로 한 상대 경로입니다.
* `remote_path` ([String](../../sql-reference/data-types/string.md)) — 로컬 메타데이터 파일이 매핑되는 원격 객체 스토리지의 blob 경로입니다.
* `size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 파일의 압축 크기(바이트)입니다.
* `common_prefix_for_blobs` ([String](../../sql-reference/data-types/string.md)) — 여러 blob이 동일한 경로 접두사를 공유하는 경우 적용되는 원격 객체 스토리지 내 blob의 공통 접두사입니다.
* `cache_paths` ([Array(String)](../../sql-reference/data-types/array.md)) — 원격 blob에 해당하는 로컬 캐시 파일 경로 목록입니다.

**설정**

* [`traverse_shadow_remote_data_paths`](../../operations/settings/settings.md#traverse_shadow_remote_data_paths) — 이 설정을 활성화하면 테이블에 동결된 파티션의 데이터도 포함됩니다(`ALTER TABLE ... FREEZE`에서 사용하는 `shadow/` 디렉터리). 기본적으로 비활성화됩니다.

**예시**

```sql
SELECT * FROM system.remote_data_paths LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
disk_name:              s3
path:                   /var/lib/clickhouse/disks/s3/
cache_base_path:        /var/lib/clickhouse/disks/s3_cache/
local_path:             store/123/1234abcd-1234-1234-1234-1234abcd1234/all_0_0_0/data.bin
remote_path:            abc123/all_0_0_0/data.bin
size:                   1048576
common_prefix_for_blobs:
cache_paths:            ['/var/lib/clickhouse/disks/s3_cache/a1/b2/c3d4e5f6']
```

**함께 보기**

* [데이터 저장에 외부 스토리지 사용](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-s3)
* [외부 스토리지 구성하기](/operations/storing-data.md/#configuring-external-storage)
* [system.disks](../../operations/system-tables/disks.md)
