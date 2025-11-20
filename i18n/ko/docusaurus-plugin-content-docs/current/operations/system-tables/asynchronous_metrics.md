---
'description': '시스템 테이블은 백그라운드에서 주기적으로 계산된 메트릭을 포함합니다. 예를 들어, 사용 중인 RAM의 양.'
'keywords':
- 'system table'
- 'asynchronous_metrics'
'slug': '/operations/system-tables/asynchronous_metrics'
'title': 'system.asynchronous_metrics'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';



# system.asynchronous_metrics

<SystemTableCloud/>

주기적으로 백그라운드에서 계산되는 메트릭을 포함합니다. 예를 들어, 사용 중인 RAM의 양입니다.

컬럼:

- `metric` ([String](../../sql-reference/data-types/string.md)) — 메트릭 이름.
- `value` ([Float64](../../sql-reference/data-types/float.md)) — 메트릭 값.
- `description` ([String](../../sql-reference/data-types/string.md)) - 메트릭 설명.

**예제**

```sql
SELECT * FROM system.asynchronous_metrics LIMIT 10
```

```text
┌─metric──────────────────────────────────┬──────value─┬─description────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ AsynchronousMetricsCalculationTimeSpent │ 0.00179053 │ Time in seconds spent for calculation of asynchronous metrics (this is the overhead of asynchronous metrics).                                                                                                                                              │
│ NumberOfDetachedByUserParts             │          0 │ The total number of parts detached from MergeTree tables by users with the `ALTER TABLE DETACH` query (as opposed to unexpected, broken or ignored parts). The server does not care about detached parts and they can be removed.                          │
│ NumberOfDetachedParts                   │          0 │ The total number of parts detached from MergeTree tables. A part can be detached by a user with the `ALTER TABLE DETACH` query or by the server itself it the part is broken, unexpected or unneeded. The server does not care about detached parts and they can be removed. │
│ TotalRowsOfMergeTreeTables              │    2781309 │ Total amount of rows (records) stored in all tables of MergeTree family.                                                                                                                                                                                   │
│ TotalBytesOfMergeTreeTables             │    7741926 │ Total amount of bytes (compressed, including data and indices) stored in all tables of MergeTree family.                                                                                                                                                   │
│ NumberOfTables                          │         93 │ Total number of tables summed across the databases on the server, excluding the databases that cannot contain MergeTree tables. The excluded database engines are those who generate the set of tables on the fly, like `Lazy`, `MySQL`, `PostgreSQL`, `SQlite`. │
│ NumberOfDatabases                       │          6 │ Total number of databases on the server.                                                                                                                                                                                                                   │
│ MaxPartCountForPartition                │          6 │ Maximum number of parts per partition across all partitions of all tables of MergeTree family. Values larger than 300 indicates misconfiguration, overload, or massive data loading.                                                                       │
│ ReplicasSumMergesInQueue                │          0 │ Sum of merge operations in the queue (still to be applied) across Replicated tables.                                                                                                                                                                       │
│ ReplicasSumInsertsInQueue               │          0 │ Sum of INSERT operations in the queue (still to be replicated) across Replicated tables.                                                                                                                                                                   │
└─────────────────────────────────────────┴────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

<!--- system.events 및 system.metrics와 달리 비동기 메트릭은 소스 코드 파일의 간단한 목록으로 수집되지 않습니다. 
      그들은 src/Interpreters/ServerAsynchronousMetrics.cpp의 로직과 혼합되어 있습니다. 
      독자의 편의를 위해 여기서 명시적으로 나열합니다. --->
## 메트릭 설명 {#metric-descriptions}
### AsynchronousHeavyMetricsCalculationTimeSpent {#asynchronousheavymetricscalculationtimespent}

비동기 무거운 (테이블 관련) 메트릭 계산에 소요된 시간(비동기 메트릭의 오버헤드).
### AsynchronousHeavyMetricsUpdateInterval {#asynchronousheavymetricsupdateinterval}

무거운 (테이블 관련) 메트릭 업데이트 간격.
### AsynchronousMetricsCalculationTimeSpent {#asynchronousmetricscalculationtimespent}

비동기 메트릭 계산에 소요된 시간(비동기 메트릭의 오버헤드).
### AsynchronousMetricsUpdateInterval {#asynchronousmetricsupdateinterval}

메트릭 업데이트 간격.
### BlockActiveTime_*name* {#blockactivetime_name}

블록 장치가 IO 요청을 대기하는 데 소요된 시간(초). 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 출처: `/sys/block`. 자세한 내용은 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardBytes_*name* {#blockdiscardbytes_name}

블록 장치에서 삭제된 바이트 수. 이러한 작업은 SSD와 관련이 있습니다. 삭제 작업은 ClickHouse에서 사용되지 않지만 시스템의 다른 프로세스에서 사용할 수 있습니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 출처: `/sys/block`. 자세한 내용은 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardMerges_*name* {#blockdiscardmerges_name}

블록 장치에서 요청된 삭제 작업 수로, OS IO 스케줄러에 의해 함께 병합되었습니다. 이러한 작업은 SSD와 관련이 있습니다. 삭제 작업은 ClickHouse에서 사용되지 않지만 시스템의 다른 프로세스에서 사용할 수 있습니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 출처: `/sys/block`. 자세한 내용은 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardOps_*name* {#blockdiscardops_name}

블록 장치에서 요청된 삭제 작업 수. 이러한 작업은 SSD와 관련이 있습니다. 삭제 작업은 ClickHouse에서 사용되지 않지만 시스템의 다른 프로세스에서 사용할 수 있습니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 출처: `/sys/block`. 자세한 내용은 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockDiscardTime_*name* {#blockdiscardtime_name}

블록 장치에서 요청된 삭제 작업에 소요된 시간(초)으로, 모든 작업의 합산입니다. 이러한 작업은 SSD와 관련이 있습니다. 삭제 작업은 ClickHouse에서 사용되지 않지만 시스템의 다른 프로세스에서 사용할 수 있습니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 출처: `/sys/block`. 자세한 내용은 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockInFlightOps_*name* {#blockinflightops_name}

이 값은 장치 드라이버에 발행되었지만 아직 완료되지 않은 I/O 요청의 수를 셉니다. 대기 중이지만 아직 장치 드라이버에 발행되지 않은 IO 요청은 포함되지 않습니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 출처: `/sys/block`. 자세한 내용은 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockQueueTime_*name* {#blockqueuetime_name}

이 값은 IO 요청이 이 블록 장치에서 대기한 밀리초 수를 계산합니다. 대기가 있는 IO 요청이 여러 개 있을 경우, 이 값은 대기 중인 요청 수 곱하기 밀리초 수의 곱으로 증가합니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 출처: `/sys/block`. 자세한 내용은 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadBytes_*name* {#blockreadbytes_name}

블록 장치에서 읽은 바이트 수. OS 페이지 캐시 사용으로 인해 파일 시스템에서 읽은 바이트 수보다 낮을 수 있습니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 출처: `/sys/block`. 자세한 내용은 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadMerges_*name* {#blockreadmerges_name}

블록 장치에서 요청되고 OS IO 스케줄러에 의해 함께 병합된 읽기 작업 수. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 출처: `/sys/block`. 자세한 내용은 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadOps_*name* {#blockreadops_name}

블록 장치에서 요청된 읽기 작업 수. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 출처: `/sys/block`. 자세한 내용은 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockReadTime_*name* {#blockreadtime_name}

블록 장치에서 요청된 읽기 작업에 소요된 시간(초)으로, 모든 작업의 합산입니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 출처: `/sys/block`. 자세한 내용은 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteBytes_*name* {#blockwritebytes_name}

블록 장치에 기록된 바이트 수. OS 페이지 캐시 사용으로 인해 파일 시스템에 기록된 바이트 수보다 낮을 수 있습니다. 블록 장치에 대한 쓰기는 파일 시스템에 대한 해당 쓰기보다 나중에 발생할 수 있습니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 출처: `/sys/block`. 자세한 내용은 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteMerges_*name* {#blockwritemerges_name}

블록 장치에서 요청되고 OS IO 스케줄러에 의해 함께 병합된 쓰기 작업 수. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 출처: `/sys/block`. 자세한 내용은 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteOps_*name* {#blockwriteops_name}

블록 장치에서 요청된 쓰기 작업 수. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 출처: `/sys/block`. 자세한 내용은 https://www.kernel.org/doc/Documentation/block/stat.txt
### BlockWriteTime_*name* {#blockwritetime_name}

블록 장치에서 요청된 쓰기 작업에 소요된 시간(초)으로, 모든 작업의 합산입니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 출처: `/sys/block`. 자세한 내용은 https://www.kernel.org/doc/Documentation/block/stat.txt
### CPUFrequencyMHz_*name* {#cpufrequencymhz_name}

현재 CPU의 주파수(MHz). 대부분의 최신 CPU는 전력 절약 및 터보 부스트를 위해 동적으로 주파수를 조정합니다.
### DictionaryMaxUpdateDelay {#dictionarymaxlastsuccessfulupdatetime}

딕셔너리 업데이트의 최대 지연(초).
### DictionaryTotalFailedUpdates {#dictionaryloadfailed}

모든 딕셔너리에서 마지막 성공적인 로딩 이후 발생한 오류 수.
### DiskAvailable_*name* {#diskavailable_name}

디스크(가상 파일 시스템)에서 사용 가능한 바이트 수. 원격 파일 시스템은 16 EiB와 같은 큰 값을 표시할 수 있습니다.
### DiskTotal_*name* {#disktotal_name}

디스크(가상 파일 시스템)의 총 크기(바이트). 원격 파일 시스템은 16 EiB와 같은 큰 값을 표시할 수 있습니다.
### DiskUnreserved_*name* {#diskunreserved_name}

병합, 가져오기 및 이동에 대한 예약이 없는 디스크(가상 파일 시스템)에서 사용 가능한 바이트 수. 원격 파일 시스템은 16 EiB와 같은 큰 값을 표시할 수 있습니다.
### DiskUsed_*name* {#diskused_name}

디스크(가상 파일 시스템)에서 사용된 바이트 수. 원격 파일 시스템은 항상 이 정보를 제공하지 않을 수 있습니다.
### FilesystemCacheBytes {#filesystemcachebytes}

`cache` 가상 파일 시스템의 총 바이트 수. 이 캐시는 디스크에 저장됩니다.
### FilesystemCacheFiles {#filesystemcachefiles}

`cache` 가상 파일 시스템에서 캐시된 파일 세그먼트의 총 수. 이 캐시는 디스크에 저장됩니다.
### FilesystemLogsPathAvailableBytes {#filesystemlogspathavailablebytes}

ClickHouse 로그 경로가 마운트된 볼륨에서 사용 가능한 바이트 수. 이 값이 0에 가까워지면 구성 파일에서 로그 회전을 조정해야 합니다.
### FilesystemLogsPathAvailableINodes {#filesystemlogspathavailableinodes}

ClickHouse 로그 경로가 마운트된 볼륨에서 사용 가능한 inode 수.
### FilesystemLogsPathTotalBytes {#filesystemlogspathtotalbytes}

ClickHouse 로그 경로가 마운트된 볼륨의 크기(바이트). 로그에는 최소 10 GB가 권장됩니다.
### FilesystemLogsPathTotalINodes {#filesystemlogspathtotalinodes}

ClickHouse 로그 경로가 마운트된 볼륨에서 inode의 총 수.
### FilesystemLogsPathUsedBytes {#filesystemlogspathusedbytes}

ClickHouse 로그 경로가 마운트된 볼륨에서 사용된 바이트 수.
### FilesystemLogsPathUsedINodes {#filesystemlogspathusedinodes}

ClickHouse 로그 경로가 마운트된 볼륨에서 사용된 inode 수.
### FilesystemMainPathAvailableBytes {#filesystemmainpathavailablebytes}

ClickHouse의 기본 경로가 마운트된 볼륨에서 사용 가능한 바이트 수.
### FilesystemMainPathAvailableINodes {#filesystemmainpathavailableinodes}

ClickHouse의 기본 경로가 마운트된 볼륨에서 사용 가능한 inode 수. 이 값이 0에 가까워지면 잘못된 구성을 나타내며, 디스크가 가득 찼음에도 불구하고 '장치에 남은 공간이 없음'이라는 오류가 발생합니다.
### FilesystemMainPathTotalBytes {#filesystemmainpathtotalbytes}

ClickHouse의 기본 경로가 마운트된 볼륨의 크기(바이트).
### FilesystemMainPathTotalINodes {#filesystemmainpathusedinodes}

ClickHouse의 기본 경로가 마운트된 볼륨에서 inode의 총 수. 2500만보다 적으면 잘못된 구성을 나타냅니다.
### FilesystemMainPathUsedBytes {#filesystemmainpathusedbytes}

ClickHouse의 기본 경로가 마운트된 볼륨에서 사용된 바이트 수.
### FilesystemMainPathUsedINodes {#filesystemmainpathusedinodes}

ClickHouse의 기본 경로가 마운트된 볼륨에서 사용된 inode 수. 이 값은 대부분 파일 수에 해당합니다.
### HTTPThreads {#httpthreads}

HTTP 인터페이스 서버의 스레드 수(_TLS 제외).
### InterserverThreads {#interserverthreads}

복제본 통신 프로토콜의 서버에서의 스레드 수(_TLS 제외).
### Jitter {#jitter}

비동기 메트릭 계산 스레드가 예정된 깨어나는 시간과 실제로 깨어난 시간 간의 시간 차이. 시스템 전체의 지연 및 응답성의 대리 지표입니다.
### LoadAverage*N* {#loadaveragen}

1분간의 지수 평활처리된 전체 시스템 부하입니다. 부하는 현재 CPU로 실행 중이거나 IO를 기다리거나 실행 준비가 되어 있지만 현재 스케줄링되지 않은 모든 프로세스(운영 체제 커널의 스케줄링 엔터티) 간의 스레드 수를 나타냅니다. 이 숫자는 클릭하우스 서버뿐만 아니라 모든 프로세스를 포함합니다. 시스템이 과부하 상태인 경우 이 수치는 CPU 코어 수보다 클 수 있으며, 많은 프로세스가 실행 준비가 되어 있지만 CPU 또는 IO를 기다리고 있을 수 있습니다.
### MaxPartCountForPartition {#maxpartcountforpartition}

MergeTree 계열의 모든 테이블에서 파티션당 최대 파트 수. 300을 초과하는 값은 잘못된 구성, 과부하 또는 대량 데이터 로드를 나타냅니다.
### MemoryCode {#memorycode}

서버 프로세스의 기계 코드 페이지에 매핑된 가상 메모리의 양(바이트 단위).
### MemoryDataAndStack {#memorydataandstack}

스택과 할당된 메모리 사용을 위해 매핑된 가상 메모리의 양(바이트 단위). 이것이 스레드당 스택을 포함하는지 또는 'mmap' 시스템 호출로 할당된 대부분의 메모리를 포함하는지는 명시되지 않습니다. 이 메트릭은 완전성 이유로만 존재합니다. 모니터링을 위해 `MemoryResident` 메트릭을 사용하는 것이 좋습니다.
### MemoryResidentMax {#memoryresidentmax}

서버 프로세스에 의해 사용되는 물리적 메모리의 최대 양(바이트 단위).
### MemoryResident {#memoryresident}

서버 프로세스에 의해 사용되는 물리적 메모리의 양(바이트 단위).
### MemoryShared {#memoryshared}

서버 프로세스에서 사용되며 다른 프로세스와 공유되는 메모리의 양(바이트 단위). ClickHouse는 공유 메모리를 사용하지 않지만 일부 메모리는 OS에서 공유로 표시될 수 있습니다. 이 메트릭은 감시할 가치가 크지 않으며 완전성 이유로만 존재합니다.
### MemoryVirtual {#memoryvirtual}

서버 프로세스에 의해 할당된 가상 주소 공간의 크기(바이트 단위). 가상 주소 공간의 크기는 일반적으로 물리적 메모리 소비보다 훨씬 크며, 메모리 소비 추정에 사용되어서는 안 됩니다. 이 메트릭의 큰 값은 전적으로 정상이며 기술적인 의미를 가집니다.
### MySQLThreads {#mysqlthreads}

MySQL 호환성 프로토콜의 서버에서의 스레드 수.
### NetworkReceiveBytes_*name* {#networkreceivebytes_name}

네트워크 인터페이스를 통해 수신된 바이트 수. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다.
### NetworkReceiveDrop_*name* {#networkreceivedrop_name}

네트워크 인터페이스를 통해 수신 중 패킷이 삭제된 바이트 수. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다.
### NetworkReceiveErrors_*name* {#networkreceiveerrors_name}

네트워크 인터페이스를 통해 수신 중 오류가 발생한 횟수. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다.
### NetworkReceivePackets_*name* {#networkreceivepackets_name}

네트워크 인터페이스를 통해 수신된 네트워크 패킷 수. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다.
### NetworkSendBytes_*name* {#networksendbytes_name}

네트워크 인터페이스를 통해 전송된 바이트 수. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다.
### NetworkSendDrop_*name* {#networksenddrop_name}

네트워크 인터페이스를 통해 전송 중 패킷이 삭제된 횟수. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다.
### NetworkSendErrors_*name* {#networksenderrors_name}

네트워크 인터페이스를 통해 전송 중 오류가 발생한 횟수(예: TCP 재전송). 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다.
### NetworkSendPackets_*name* {#networksendpackets_name}

네트워크 인터페이스를 통해 전송된 네트워크 패킷 수. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다.
### NumberOfDatabases {#numberofdatabases}

서버의 데이터베이스 총 수.
### NumberOfDetachedByUserParts {#numberofdetachedbyuserparts}

`ALTER TABLE DETACH` 쿼리를 통해 사용자가 MergeTree 테이블에서 분리한 파트의 총 수(예상치 못한, 손상된 또는 무시된 파트가 아님). 서버는 분리된 파트에 신경 쓰지 않으며, 이들은 제거될 수 있습니다.
### NumberOfDetachedParts {#numberofdetachedparts}

MergeTree 테이블에서 분리된 파트의 총 수. 파트는 사용자가 `ALTER TABLE DETACH` 쿼리를 통해 분리하거나 서버 자체에서 손상된, 예상치 못한 또는 필요 없는 파트로 인해 분리될 수 있습니다. 서버는 분리된 파트에 신경 쓰지 않으며, 이들은 제거될 수 있습니다.
### NumberOfTables {#numberoftables}

서버의 데이터베이스에서 합산된 테이블 총 수로, MergeTree 테이블을 포함할 수 없는 데이터베이스는 제외됩니다. 제외된 데이터베이스 엔진은 `Lazy`, `MySQL`, `PostgreSQL`, `SQlite`와 같이 즉석에서 테이블 집합을 생성하는 것입니다.
### OSContextSwitches {#oscontextswitches}

호스트 머신에서 시스템이 경험한 컨텍스트 스위치의 수입니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다.
### OSGuestNiceTime {#osguestnicetime}

Linux 커널의 제어 하에 게스트 운영 체제를 위해 가상 CPU를 실행하는 데 소요된 시간의 비율로, 게스트의 우선 순위가 높게 설정되었을 때입니다( `man procfs` 참조). 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 이 메트릭은 ClickHouse와 관련이 없지만 완전성을 위해 존재합니다. 단일 CPU 코어에 대한 값은 [0..1] 간의 구간에 있을 것입니다. 모든 CPU 코어의 값은 [0..코어 수]로 합산됩니다.
### OSGuestNiceTimeCPU_*N* {#osguestnicetimecpu_n}

Linux 커널의 제어 하에 게스트 운영 체제를 위해 가상 CPU를 실행하는 데 소요된 시간의 비율로, 게스트의 우선 순위가 높게 설정되었을 때입니다( `man procfs` 참조). 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 이 메트릭은 ClickHouse와 관련이 없지만 완전성을 위해 존재합니다. 단일 CPU 코어에 대한 값은 [0..1] 간의 구간에 있을 것입니다. 모든 CPU 코어의 값은 [0..코어 수]로 합산됩니다.
### OSGuestNiceTimeNormalized {#osguestnicetimenormalized}

이 값은 `OSGuestNiceTime`과 유사하지만 CPU 코어 수로 나눠져 [0..1] 간의 구간으로 측정됩니다. 이는 코어 수가 균일하지 않더라도 클러스터 내 여러 서버에서 이 메트릭의 값을 평균화할 수 있게 해 주며, 여전히 평균 자원 사용 메트릭을 얻을 수있게 해 줍니다.
### OSGuestTime {#osguesttime}

Linux 커널의 제어 하에 가상 CPU를 실행하는 데 소요된 시간의 비율입니다( `man procfs` 참조). 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 이 메트릭은 ClickHouse와 관련이 없지만 여전히 완전성을 위해 존재합니다. 단일 CPU 코어에 대한 값은 [0..1] 간의 구간에 있을 것입니다. 모든 CPU 코어의 값은 [0..코어 수]로 합산됩니다.
### OSGuestTimeCPU_*N* {#osguesttimecpu_n}

Linux 커널의 제어 하에 가상 CPU를 실행하는 데 소요된 시간의 비율입니다( `man procfs` 참조). 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 이 메트릭은 ClickHouse와 관련이 없지만 여전히 완전성을 위해 존재합니다. 단일 CPU 코어에 대한 값은 [0..1] 간의 구간에 있을 것입니다. 모든 CPU 코어의 값은 [0..코어 수]로 합산됩니다.
### OSGuestTimeNormalized {#osguesttimenormalized}

이 값은 `OSGuestTime`과 유사하지만 CPU 코어 수로 나누어 [0..1] 간의 구간으로 측정됩니다. 이는 코어 수가 균일하지 않더라도 클러스터 내 여러 서버에서 이 메트릭의 값을 평균화할 수 있도록 해 주며, 여전히 평균 자원 사용 메트릭을 얻을 수 있습니다.
### OSIOWaitTime {#osiowaittime}

CPU 코어가 코드 실행을 하지 않았지만 OS 커널이 IO를 기다리고 있는 동안 다른 프로세스를 실행하지 않은 시간의 비율입니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 단일 CPU 코어에 대한 값은 [0..1] 간의 구간에 있을 것입니다. 모든 CPU 코어의 값은 [0..코어 수]로 합산됩니다.
### OSIOWaitTimeCPU_*N* {#osiowaittimecpu_n}

CPU 코어가 코드 실행을 하지 않았지만 OS 커널이 IO를 기다리는 동안 다른 프로세스를 실행하지 않은 시간의 비율입니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 단일 CPU 코어에 대한 값은 [0..1] 간의 구간에 있을 것입니다. 모든 CPU 코어의 값은 [0..코어 수]로 합산됩니다.
### OSIOWaitTimeNormalized {#osiowaittimenormalized}

이 값은 `OSIOWaitTime`과 유사하지만 CPU 코어 수로 나누어 [0..1] 간의 구간으로 측정됩니다. 이는 코어 수가 균일하지 않더라도 클러스터 내 여러 서버에서 이 메트릭의 값을 평균화할 수 있게 해 주며, 여전히 평균 자원 사용 메트릭을 얻을 수있게 해 줍니다.
### OSIdleTime {#osidletime}

CPU 코어가 유휴 상태(조차도 IO를 기다리는 프로세스를 실행할 준비가 되지 않은 상태)인 비율입니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 이는 CPU 내부의 이유(메모리 로드, 파이프라인 스톨, 분기 예측 오류, 다른 SMT 코어 실행 등)로 인해 CPU가 최소한으로 활용되지 않은 시간은 포함되지 않습니다. 단일 CPU 코어에 대한 값은 [0..1] 간의 구간에 있을 것입니다. 모든 CPU 코어의 값은 [0..코어 수]로 합산됩니다.
### OSIdleTimeCPU_*N* {#osidletimecpu_n}

CPU 코어가 유휴 상태(조차도 IO를 기다리는 프로세스를 실행할 준비가 되지 않은 상태)인 비율입니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 이는 CPU 내부의 이유(메모리 로드, 파이프라인 스톨, 분기 예측 오류, 다른 SMT 코어 실행 등)로 인해 CPU가 최소한으로 활용되지 않은 시간은 포함되지 않습니다. 단일 CPU 코어에 대한 값은 [0..1] 간의 구간에 있을 것입니다. 모든 CPU 코어의 값은 [0..코어 수]로 합산됩니다.
### OSIdleTimeNormalized {#osidletimenormalized}

이 값은 `OSIdleTime`과 유사하지만 CPU 코어 수로 나누어 [0..1] 간의 구간으로 측정됩니다. 이는 코어 수가 균일하지 않더라도 클러스터 내 여러 서버에서 이 메트릭의 값을 평균화할 수 있게 해 주며, 여전히 평균 자원 사용 메트릭을 얻을 수있게 해 줍니다.
### OSInterrupts {#osinterrupts}

호스트 머신에서의 인터럽트 수입니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다.
### OSIrqTime {#osirqtime}

CPU에서 하드웨어 인터럽트 요청을 실행하는 데 소요된 시간의 비율입니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 이 메트릭의 높은 수치는 하드웨어 잘못 구성이나 매우 높은 네트워크 부하를 나타낼 수 있습니다. 단일 CPU 코어에 대한 값은 [0..1] 간의 구간에 있을 것입니다. 모든 CPU 코어의 값은 [0..코어 수]로 합산됩니다.
### OSIrqTimeCPU_*N* {#osirqtimecpu_n}

CPU에서 하드웨어 인터럽트 요청을 실행하는 데 소요된 시간의 비율입니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 이 메트릭의 높은 수치는 하드웨어 잘못 구성이나 매우 높은 네트워크 부하를 나타낼 수 있습니다. 단일 CPU 코어에 대한 값은 [0..1] 간의 구간에 있을 것입니다. 모든 CPU 코어의 값은 [0..코어 수]로 합산됩니다.
### OSIrqTimeNormalized {#osirqtimenormalized}

이 값은 `OSIrqTime`과 유사하지만 CPU 코어 수로 나누어 [0..1] 간의 구간으로 측정됩니다. 이는 코어 수가 균일하지 않더라도 클러스터 내 여러 서버에서 이 메트릭의 값을 평균화할 수 있게 해 주며, 여전히 평균 자원 사용 메트릭을 얻을 수 있게 해 줍니다.
### OSMemoryAvailable {#osmemoryavailable}

프로그램에서 사용할 수 있는 메모리의 양(바이트 단위). 이는 `OSMemoryFreePlusCached` 메트릭과 매우 유사합니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다.
### OSMemoryBuffers {#osmemorybuffers}

OS 커널 버퍼에 의해 사용되는 메모리의 양(바이트 단위). 일반적으로 이 값은 작아야 하며, 큰 값은 OS의 잘못된 구성을 나타낼 수 있습니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다.
### OSMemoryCached {#osmemorycached}

OS 페이지 캐시에 의해 사용되는 메모리의 양(바이트 단위). 일반적으로 사용 가능한 메모리의 거의 모든 부분은 OS 페이지 캐시에 사용됩니다. 이 메트릭의 높은 값은 정상적이고 예상한 것입니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다.
### OSMemoryFreePlusCached {#osmemoryfreepluscached}

호스트 시스템에서의 자유 메모리 플러스 OS 페이지 캐시 메모리의 양(바이트 단위). 이 메모리는 프로그램에서 사용할 수 있습니다. 이 값은 `OSMemoryAvailable`과 매우 유사해야 합니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다.
### OSMemoryFreeWithoutCached {#osmemoryfreewithoutcached}

호스트 시스템에서의 자유 메모리의 양(바이트 단위). 이는 OS 페이지 캐시 메모리에 의해 사용되는 메모리를 포함하지 않습니다. 페이지 캐시 메모리는 프로그램에서도 사용될 수 있기 때문에 이 메트릭의 값은 혼란스러울 수 있습니다. 대신 `OSMemoryAvailable` 메트릭을 참조해 주세요. 편의상 `OSMemoryFreePlusCached` 메트릭도 제공합니다. 이 메트릭은 OSMemoryAvailable과 유사해야 합니다. 자세한 내용은 https://www.linuxatemyram.com/를 참조하세요. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다.
### OSMemoryTotal {#osmemorytotal}

호스트 시스템의 총 메모리 양(바이트 단위).
### OSNiceTime {#osnicetime}

CPU 코어가 더 높은 우선 순위로 사용자 공간 코드를 실행하는 데 소요된 시간의 비율입니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 단일 CPU 코어에 대한 값은 [0..1] 간의 구간에 있을 것입니다. 모든 CPU 코어의 값은 [0..코어 수]로 합산됩니다.
### OSNiceTimeCPU_*N* {#osnicetimecpu_n}

CPU 코어가 더 높은 우선 순위로 사용자 공간 코드를 실행하는 데 소요된 시간의 비율입니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 단일 CPU 코어에 대한 값은 [0..1] 간의 구간에 있을 것입니다. 모든 CPU 코어의 값은 [0..코어 수]로 합산됩니다.
### OSNiceTimeNormalized {#osnicetimenormalized}

이 값은 `OSNiceTime`과 유사하지만 CPU 코어 수로 나누어 [0..1] 간의 구간으로 측정됩니다. 이는 코어 수가 균일하지 않더라도 클러스터 내 여러 서버에서 이 메트릭의 값을 평균화할 수 있게 해 주며, 여전히 평균 자원 사용 메트릭을 얻을 수 있게 해 줍니다.
### OSOpenFiles {#osopenfiles}

호스트 머신에서 열린 파일의 총 수입니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다.
### OSProcessesBlocked {#osprocessesblocked}

I/O 완료를 기다리는 동안 차단된 스레드 수입니다(`man procfs`). 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다.
### OSProcessesCreated {#osprocessescreated}

생성된 프로세스의 수입니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다.
### OSProcessesRunning {#osprocessesrunning}

운영 체제에서 실행 중이거나 실행 준비가 된 스레드의 수입니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다.
### OSSoftIrqTime {#ossoftirqtime}

CPU에서 소프트웨어 인터럽트 요청을 실행하는 데 소요된 시간의 비율입니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 이 메트릭의 높은 수치는 시스템에서 비효율적인 소프트웨어가 실행되고 있음을 나타낼 수 있습니다. 단일 CPU 코어에 대한 값은 [0..1] 간의 구간에 있을 것입니다. 모든 CPU 코어의 값은 [0..코어 수]로 합산됩니다.
### OSSoftIrqTimeCPU_*N* {#ossoftirqtimecpu_n}

CPU에서 소프트웨어 인터럽트 요청을 실행하는 데 소요된 시간의 비율입니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 이 메트릭의 높은 수치는 시스템에서 비효율적인 소프트웨어가 실행되고 있음을 나타낼 수 있습니다. 단일 CPU 코어에 대한 값은 [0..1] 간의 구간에 있을 것입니다. 모든 CPU 코어의 값은 [0..코어 수]로 합산됩니다.
### OSSoftIrqTimeNormalized {#ossoftirqtimenormalized}

이 값은 `OSSoftIrqTime`과 유사하지만 CPU 코어 수로 나누어 [0..1] 간의 구간으로 측정됩니다. 이는 코어 수가 균일하지 않더라도 클러스터 내 여러 서버에서 이 메트릭의 값을 평균화할 수 있게 해 주며, 여전히 평균 자원 사용 메트릭을 얻을 수 있게 해 줍니다.
### OSStealTime {#osstealtime}

가상화된 환경에서 CPU가 다른 운영 체제에서 소요한 시간의 비율입니다. 이는 시스템 전체의 메트릭으로, 클릭하우스 서버뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 모든 가상화된 환경이 이 메트릭을 제공하는 것은 아니며 대부분 제공하지 않습니다. 단일 CPU 코어에 대한 값은 [0..1] 간의 구간에 있을 것입니다. 모든 CPU 코어의 값은 [0..코어 수]로 합산됩니다.

### OSStealTimeCPU_*N* {#osstealtimecpu_n}

CPU가 가상화 환경에서 다른 운영 체제에서 소모한 시간의 비율입니다. 이는 시스템 전체 지표로, 호스트 머신의 모든 프로세스를 포함하며, clickhouse-server만 포함하지 않습니다. 모든 가상화 환경이 이 지표를 제공하는 것은 아니며, 대부분은 제공하지 않습니다. 단일 CPU 코어의 값은 [0..1] 범위에 있으며, 모든 CPU 코어의 값은 이를 합산하여 계산됩니다 [0..num cores].
### OSStealTimeNormalized {#osstealtimenormalized}

이 값은 `OSStealTime`과 유사하지만 측정할 CPU 코어 수로 나누어 [0..1] 범위에서 측정됩니다. 이로 인해 코어 수가 비균등하더라도 클러스터 내 여러 서버의 이 지표 값을 평균화할 수 있으며, 여전히 평균 자원 사용 지표를 얻을 수 있습니다.
### OSSystemTime {#ossystemtime}

CPU 코어가 OS 커널(시스템) 코드를 실행한 시간의 비율입니다. 이는 시스템 전체 지표로, 호스트 머신의 모든 프로세스를 포함하며, clickhouse-server만 포함하지 않습니다. 단일 CPU 코어의 값은 [0..1] 범위에 있으며, 모든 CPU 코어의 값은 이를 합산하여 계산됩니다 [0..num cores].
### OSSystemTimeCPU_*N* {#ossystemtimecpu_n}

CPU 코어가 OS 커널(시스템) 코드를 실행한 시간의 비율입니다. 이는 시스템 전체 지표로, 호스트 머신의 모든 프로세스를 포함하며, clickhouse-server만 포함하지 않습니다. 단일 CPU 코어의 값은 [0..1] 범위에 있으며, 모든 CPU 코어의 값은 이를 합산하여 계산됩니다 [0..num cores].
### OSSystemTimeNormalized {#ossystemtimenormalized}

이 값은 `OSSystemTime`과 유사하지만 측정할 CPU 코어 수로 나누어 [0..1] 범위에서 측정됩니다. 이로 인해 코어 수가 비균등하더라도 클러스터 내 여러 서버의 이 지표 값을 평균화할 수 있으며, 여전히 평균 자원 사용 지표를 얻을 수 있습니다.
### OSThreadsRunnable {#osthreadsrunnable}

OS 커널 스케줄러가 인식하는 '실행 가능한' 스레드의 총 수입니다.
### OSThreadsTotal {#osthreadstotal}

OS 커널 스케줄러가 인식하는 스레드의 총 수입니다.
### OSUptime {#osuptime}

ClickHouse가 실행되는 호스트 서버의 가동 시간(초)입니다.
### OSUserTime {#osusertime}

CPU 코어가 사용자 공간 코드를 실행한 시간의 비율입니다. 이는 시스템 전체 지표로, 호스트 머신의 모든 프로세스를 포함하며, clickhouse-server만 포함하지 않습니다. 이 값에는 CPU의 내부 원인(메모리 부하, 파이프라인 정체, 브랜치 잘못 예측, 다른 SMT 코어 실행)으로 인해 CPU가 저하된 시간도 포함됩니다. 단일 CPU 코어의 값은 [0..1] 범위에 있으며, 모든 CPU 코어의 값은 이를 합산하여 계산됩니다 [0..num cores].
### OSUserTimeCPU_*N* {#osusertimecpu_n}

CPU 코어가 사용자 공간 코드를 실행한 시간의 비율입니다. 이는 시스템 전체 지표로, 호스트 머신의 모든 프로세스를 포함하며, clickhouse-server만 포함하지 않습니다. 이 값에는 CPU의 내부 원인(메모리 부하, 파이프라인 정체, 브랜치 잘못 예측, 다른 SMT 코어 실행)으로 인해 CPU가 저하된 시간도 포함됩니다. 단일 CPU 코어의 값은 [0..1] 범위에 있으며, 모든 CPU 코어의 값은 이를 합산하여 계산됩니다 [0..num cores].
### OSUserTimeNormalized {#osusertimenormalized}

이 값은 `OSUserTime`과 유사하지만 측정할 CPU 코어 수로 나누어 [0..1] 범위에서 측정됩니다. 이로 인해 코어 수가 비균등하더라도 클러스터 내 여러 서버의 이 지표 값을 평균화할 수 있으며, 여전히 평균 자원 사용 지표를 얻을 수 있습니다.
### PostgreSQLThreads {#postgresqlthreads}

PostgreSQL 호환 프로토콜 서버의 스레드 수입니다.
### ReplicasMaxAbsoluteDelay {#replicasmaxabsolutedelay}

Replicated 테이블에서 가장 최신 복제된 파트와 복제되지 않은 가장 최신 데이터 파트 간의 최대 초 차이입니다. 매우 높은 값은 데이터가 없는 복제본을 나타냅니다.
### ReplicasMaxInsertsInQueue {#replicasmaxinsertsinqueue}

Replicated 테이블에서 대기 중인 최대 INSERT 작업 수입니다.
### ReplicasMaxMergesInQueue {#replicasmaxmergesinqueue}

Replicated 테이블에서 대기 중인 최대 병합 작업 수입니다.
### ReplicasMaxQueueSize {#replicasmaxqueuesize}

Replicated 테이블에서 최대 대기열 크기(작업 수 기준: get, merge)입니다.
### ReplicasMaxRelativeDelay {#replicasmaxrelativedelay}

Replicated 테이블에서 복제본의 지연과 같은 테이블의 가장 최신 복제본의 지연 간의 최대 차이입니다.
### ReplicasSumInsertsInQueue {#replicassuminsertsinqueue}

Replicated 테이블에서 대기 중인 INSERT 작업 수의 합계입니다.
### ReplicasSumMergesInQueue {#replicassummergesinqueue}

Replicated 테이블에서 대기 중인 병합 작업 수의 합계입니다.
### ReplicasSumQueueSize {#replicassumqueuesize}

Replicated 테이블에서 대기열 크기의 합계(작업 수 기준: get, merge)입니다.
### TCPThreads {#tcpthreads}

TCP 프로토콜 서버(비 TLS)의 스레드 수입니다.
### Temperature_*N* {#temperature_n}

해당 장치의 온도(℃)입니다. 센서는 비현실적인 값을 반환할 수 있습니다. 출처: `/sys/class/thermal`
### Temperature_*name* {#temperature_name}

해당 하드웨어 모니터와 해당 센서에서 보고된 온도(℃)입니다. 센서는 비현실적인 값을 반환할 수 있습니다. 출처: `/sys/class/hwmon`
### TotalBytesOfMergeTreeTables {#totalbytesofmergetreetables}

MergeTree 계열의 모든 테이블에 저장된 총 바이트 수(압축된, 데이터 및 인덱스 포함)입니다.
### TotalPartsOfMergeTreeTables {#totalpartsofmergetreetables}

MergeTree 계열의 모든 테이블에 있는 데이터 파트의 총 수입니다. 10,000보다 큰 수는 서버 시작 시간을 부정적으로 영향을 미치며, 파티션 키의 비합리적인 선택을 의미할 수 있습니다.
### TotalPrimaryKeyBytesInMemory {#totalprimarykeybytesinmemory}

기본 키 값이 사용하는 총 메모리(바이트)입니다(활성 파트만 고려).
### TotalPrimaryKeyBytesInMemoryAllocated {#totalprimarykeybytesinmemoryallocated}

기본 키 값을 위해 예약된 총 메모리(바이트)입니다(활성 파트만 고려).
### TotalRowsOfMergeTreeTables {#totalrowsofmergetreetables}

MergeTree 계열의 모든 테이블에 저장된 총 행 수(레코드 수)입니다.
### Uptime {#uptime}

서버 가동 시간(초)입니다. 연결 수락 전에 서버 초기화에 소요된 시간도 포함됩니다.
### jemalloc.active {#jemallocactive}

저수준 메모리 할당기(jemalloc)의 내부 지표입니다. https://jemalloc.net/jemalloc.3.html 를 참조하십시오.
### jemalloc.allocated {#jemallocallocated}

저수준 메모리 할당기(jemalloc)의 내부 지표입니다. https://jemalloc.net/jemalloc.3.html 를 참조하십시오.
### jemalloc.arenas.all.dirty_purged {#jemallocarenasalldirty_purged}

저수준 메모리 할당기(jemalloc)의 내부 지표입니다. https://jemalloc.net/jemalloc.3.html 를 참조하십시오.
### jemalloc.arenas.all.muzzy_purged {#jemallocarenasallmuzzy_purged}

저수준 메모리 할당기(jemalloc)의 내부 지표입니다. https://jemalloc.net/jemalloc.3.html 를 참조하십시오.
### jemalloc.arenas.all.pactive {#jemallocarenasallpactive}

저수준 메모리 할당기(jemalloc)의 내부 지표입니다. https://jemalloc.net/jemalloc.3.html 를 참조하십시오.
### jemalloc.arenas.all.pdirty {#jemallocarenasallpdirty}

저수준 메모리 할당기(jemalloc)의 내부 지표입니다. https://jemalloc.net/jemalloc.3.html 를 참조하십시오.
### jemalloc.arenas.all.pmuzzy {#jemallocarenasallpmuzzy}

저수준 메모리 할당기(jemalloc)의 내부 지표입니다. https://jemalloc.net/jemalloc.3.html 를 참조하십시오.
### jemalloc.background_thread.num_runs {#jemallocbackground_threadnum_runs}

저수준 메모리 할당기(jemalloc)의 내부 지표입니다. https://jemalloc.net/jemalloc.3.html 를 참조하십시오.
### jemalloc.background_thread.num_threads {#jemallocbackground_threadnum_threads}

저수준 메모리 할당기(jemalloc)의 내부 지표입니다. https://jemalloc.net/jemalloc.3.html 를 참조하십시오.
### jemalloc.background_thread.run_intervals {#jemallocbackground_threadrun_intervals}

저수준 메모리 할당기(jemalloc)의 내부 지표입니다. https://jemalloc.net/jemalloc.3.html 를 참조하십시오.
### jemalloc.epoch {#jemallocepoch}

jemalloc (Jason Evans의 메모리 할당기)의 통계의 내부 증가 업데이트 수로, 모든 다른 `jemalloc` 지표에서 사용됩니다.
### jemalloc.mapped {#jemallocmapped}

저수준 메모리 할당기(jemalloc)의 내부 지표입니다. https://jemalloc.net/jemalloc.3.html 를 참조하십시오.
### jemalloc.metadata {#jemallocmetadata}

저수준 메모리 할당기(jemalloc)의 내부 지표입니다. https://jemalloc.net/jemalloc.3.html 를 참조하십시오.
### jemalloc.metadata_thp {#jemallocmetadata_thp}

저수준 메모리 할당기(jemalloc)의 내부 지표입니다. https://jemalloc.net/jemalloc.3.html 를 참조하십시오.
### jemalloc.resident {#jemallocresident}

저수준 메모리 할당기(jemalloc)의 내부 지표입니다. https://jemalloc.net/jemalloc.3.html 를 참조하십시오.
### jemalloc.retained {#jemallocretained}

저수준 메모리 할당기(jemalloc)의 내부 지표입니다. https://jemalloc.net/jemalloc.3.html 를 참조하십시오.
### jemalloc.prof.active {#jemallocprofactive}

저수준 메모리 할당기(jemalloc)의 내부 지표입니다. https://jemalloc.net/jemalloc.3.html 를 참조하십시오.

**참조**

- [모니터링](../../operations/monitoring.md) — ClickHouse 모니터링의 기본 개념.
- [system.metrics](/operations/system-tables/metrics) — 즉시 계산된 지표를 포함합니다.
- [system.events](/operations/system-tables/events) — 발생한 여러 사건을 포함합니다.
- [system.metric_log](/operations/system-tables/metric_log) — `system.metrics` 및 `system.events` 테이블의 지표 값의 기록을 포함합니다.
