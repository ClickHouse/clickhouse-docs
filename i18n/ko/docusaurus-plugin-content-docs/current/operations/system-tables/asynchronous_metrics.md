---
description: '백그라운드에서 주기적으로 계산되는 메트릭을 저장하는 system 테이블입니다. 예를 들어 사용 중인 RAM 용량이 이에 해당합니다.'
keywords: ['system 테이블', 'asynchronous_metrics']
slug: /operations/system-tables/asynchronous_metrics
title: 'system.asynchronous_metrics'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.asynchronous_metrics \{#systemasynchronous_metrics\}

<SystemTableCloud />

백그라운드에서 주기적으로 계산되는 메트릭이 포함됩니다. 예를 들어 사용 중인 RAM 용량과 같은 값입니다.

컬럼:

* `metric` ([String](../../sql-reference/data-types/string.md)) — 메트릭 이름.
* `value` ([Float64](../../sql-reference/data-types/float.md)) — 메트릭 값.
* `description` ([String](../../sql-reference/data-types/string.md) - 메트릭 설명)

**예시**

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

{/*- system.events 및 system.metrics와는 달리, 비동기 메트릭은 소스 코드 파일에서 단순 목록 형태로 정의되어 있지 않고
      src/Interpreters/ServerAsynchronousMetrics.cpp의 로직과 뒤섞여 있습니다.
      독자의 편의를 위해 여기에서 명시적으로 나열합니다. -*/ }


## 메트릭 설명 \{#metric-descriptions\}

### AsynchronousHeavyMetricsCalculationTimeSpent \{#asynchronousheavymetricscalculationtimespent\}

비동기 heavy(테이블 관련) 메트릭을 계산하는 데 소요된 시간(초)입니다. 비동기 메트릭에 의해 발생하는 추가 오버헤드에 해당합니다.

### AsynchronousHeavyMetricsUpdateInterval \{#asynchronousheavymetricsupdateinterval\}

Heavy(테이블 관련) 메트릭의 업데이트 주기

### AsynchronousMetricsCalculationTimeSpent \{#asynchronousmetricscalculationtimespent\}

비동기 메트릭 계산에 소요된 시간(초)으로, 비동기 메트릭의 오버헤드에 해당합니다.

### AsynchronousMetricsUpdateInterval \{#asynchronousmetricsupdateinterval\}

메트릭 업데이트 주기

### BlockActiveTime_*name* \{#blockactivetime_name\}

블록 장치에서 I/O 요청이 대기열에 있었던 시간(초 단위)입니다. 이는 시스템 전체 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신의 모든 프로세스를 모두 포함합니다. 출처: `/sys/block`. 자세한 내용은 https://www.kernel.org/doc/Documentation/block/stat.txt를 참조하십시오.

### BlockDiscardBytes_*name* \{#blockdiscardbytes_name\}

블록 디바이스에서 discard된 바이트 수입니다. 이러한 작업은 SSD에서 특히 관련이 있습니다. discard 작업은 ClickHouse에서는 사용하지 않지만, 시스템의 다른 프로세스에서 사용할 수 있습니다. 이 메트릭은 시스템 전체 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 소스: `/sys/block`. 자세한 내용은 https://www.kernel.org/doc/Documentation/block/stat.txt를 참조하십시오.

### BlockDiscardMerges_*name* \{#blockdiscardmerges_name\}

블록 장치에 대해 요청되었다가 OS I/O 스케줄러에 의해 병합된 discard 연산의 개수입니다. 이러한 연산은 SSD와 관련이 있습니다. Discard 연산은 ClickHouse에서는 사용되지 않지만, 시스템의 다른 프로세스에서 사용할 수 있습니다. 이는 시스템 전체 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신에서 실행 중인 모든 프로세스를 포함합니다. 소스: `/sys/block`. 자세한 내용은 https://www.kernel.org/doc/Documentation/block/stat.txt 를 참조하십시오.

### BlockDiscardOps_*name* \{#blockdiscardops_name\}

블록 디바이스에서 요청된 discard 연산 수입니다. 이러한 연산은 SSD와 관련이 있습니다. Discard 연산은 ClickHouse에서는 사용하지 않지만, 시스템의 다른 프로세스에서 사용할 수 있습니다. 이 메트릭은 시스템 전체에 대한 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 소스: `/sys/block`. https://www.kernel.org/doc/Documentation/block/stat.txt를 참조하십시오.

### BlockDiscardTime_*name* \{#blockdiscardtime_name\}

블록 디바이스에 대해 요청된 discard 연산에 소요된 시간(초)을 모든 연산에 걸쳐 합산한 값입니다. 이러한 연산은 SSD와 관련이 있습니다. discard 연산은 ClickHouse에서는 사용되지 않지만, 시스템의 다른 프로세스에서 사용될 수 있습니다. 이는 시스템 전체에 대한 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 출처: `/sys/block`. 자세한 내용은 「https://www.kernel.org/doc/Documentation/block/stat.txt」를 참조하십시오.

### BlockInFlightOps_*name* \{#blockinflightops_name\}

이 값은 디바이스 드라이버에 전달되었으나 아직 완료되지 않은 I/O 요청의 개수를 셉니다. 큐에 있지만 아직 디바이스 드라이버에 전달되지 않은 I/O 요청은 포함되지 않습니다. 이 메트릭은 시스템 전체(system-wide) 메트릭으로, clickhouse-server만이 아니라 호스트 머신에서 동작하는 모든 프로세스를 포함합니다. 출처: `/sys/block`. https://www.kernel.org/doc/Documentation/block/stat.txt를 참고하십시오.

### BlockQueueTime_*name* \{#blockqueuetime_name\}

이 값은 I/O 요청이 이 블록 디바이스에서 대기한 시간을 밀리초 단위로 측정합니다. 여러 개의 I/O 요청이 대기 중인 경우, 이 값은 「대기 밀리초 수 × 대기 중인 요청 수」의 곱만큼 증가합니다. 이는 시스템 전체에 대한 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신에서 실행 중인 모든 프로세스를 포함합니다. 출처: `/sys/block`. 자세한 내용은 https://www.kernel.org/doc/Documentation/block/stat.txt를 참조하십시오.

### BlockReadBytes_*name* \{#blockreadbytes_name\}

블록 디바이스에서 읽은 바이트 수입니다. OS 페이지 캐시를 사용해 IO를 절약하므로 파일 시스템에서 읽은 바이트 수보다 작을 수 있습니다. 이는 시스템 전체 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 출처: `/sys/block`. 자세한 내용은 https://www.kernel.org/doc/Documentation/block/stat.txt 문서를 참조하십시오.

### BlockReadMerges_*name* \{#blockreadmerges_name\}

블록 디바이스에서 요청된 읽기 작업 중 OS I/O 스케줄러에 의해 병합된 작업 수입니다. 이 메트릭은 시스템 전체에 대한 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 출처: `/sys/block`. https://www.kernel.org/doc/Documentation/block/stat.txt를 참조하십시오.

### BlockReadOps_*name* \{#blockreadops_name\}

블록 디바이스에 대해 요청된 읽기 작업의 수입니다. 시스템 전체에 대한 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 출처: `/sys/block`. 자세한 내용은 https://www.kernel.org/doc/Documentation/block/stat.txt를 참조하십시오.

### BlockReadTime_*name* \{#blockreadtime_name\}

블록 디바이스에 대해 요청된 읽기 작업에 소요된 시간(초 단위)을 모든 작업에 걸쳐 합산한 값입니다. 시스템 전역 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신에서 실행 중인 모든 프로세스를 포함합니다. 소스: `/sys/block`. 자세한 내용은 https://www.kernel.org/doc/Documentation/block/stat.txt 문서를 참고하십시오.

### BlockWriteBytes_*name* \{#blockwritebytes_name\}

블록 디바이스에 기록된 바이트 수입니다. OS 페이지 캐시를 사용해 입출력(IO)을 절약하기 때문에 파일 시스템에 기록된 바이트 수보다 작을 수 있습니다. 블록 디바이스로의 쓰기는 write-through 캐싱으로 인해 해당 파일 시스템 쓰기보다 나중에 발생할 수 있습니다. 이는 시스템 전체(system-wide) 메트릭으로, clickhouse-server만이 아니라 호스트 머신의 모든 프로세스를 포함합니다. 출처: `/sys/block`. 자세한 내용은 https://www.kernel.org/doc/Documentation/block/stat.txt 를 참조하십시오.

### BlockWriteMerges_*name* \{#blockwritemerges_name\}

블록 디바이스에 대해 요청된 쓰기 작업 중 OS IO 스케줄러에 의해 병합된 작업 수입니다. 이 메트릭은 시스템 전체에 대한 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 출처: `/sys/block`. 자세한 내용은 https://www.kernel.org/doc/Documentation/block/stat.txt를 참조하십시오.

### BlockWriteOps_*name* \{#blockwriteops_name\}

블록 디바이스에 대해 요청된 쓰기 작업 수입니다. 시스템 전체(system-wide) 메트릭으로, ClickHouse 서버 프로세스(`clickhouse-server`)뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 출처: `/sys/block`. 자세한 내용은 https://www.kernel.org/doc/Documentation/block/stat.txt을 참조하십시오.

### BlockWriteTime_*name* \{#blockwritetime_name\}

블록 디바이스에 대해 요청된 쓰기 작업에 소요된 시간(초)을 모든 작업에 걸쳐 합산한 값입니다. 이는 시스템 전체 메트릭으로, clickhouse-server뿐 아니라 호스트 머신에서 실행 중인 모든 프로세스를 포함합니다. 출처: `/sys/block`. 자세한 내용은 https://www.kernel.org/doc/Documentation/block/stat.txt를 참조하십시오.

### CPUFrequencyMHz_*name* \{#cpufrequencymhz_name\}

CPU의 현재 동작 주파수(MHz 단위)입니다. 대부분의 최신 CPU는 전력 절약과 터보 부스트(Turbo Boost) 기능을 위해 주파수를 동적으로 조정합니다.

### DictionaryMaxUpdateDelay \{#dictionarymaxlastsuccessfulupdatetime\}

딕셔너리 업데이트의 최대 지연 시간(초)을 나타냅니다.

### DictionaryTotalFailedUpdates \{#dictionaryloadfailed\}

모든 딕셔너리에서 마지막으로 성공적으로 로드된 이후 발생한 오류 수입니다.

### DiskAvailable_*name* \{#diskavailable_name\}

디스크(가상 파일 시스템)에서 사용 가능한 바이트 수입니다. 원격 파일 시스템에서는 16 EiB와 같이 매우 큰 값을 표시할 수 있습니다.

### DiskTotal_*name* \{#disktotal_name\}

디스크(가상 파일 시스템)의 총 크기(바이트 단위)입니다. 원격 파일 시스템에서는 16 EiB와 같은 매우 큰 값이 표시될 수 있습니다.

### DiskUnreserved_*name* \{#diskunreserved_name\}

머지, 페치, 이동 작업을 위한 예약 공간을 제외한 디스크(가상 파일 시스템)의 사용 가능 바이트 수입니다. 원격 파일 시스템의 경우 16 EiB와 같은 매우 큰 값이 표시될 수 있습니다.

### DiskUsed_*name* \{#diskused_name\}

디스크(가상 파일 시스템)에서 사용 중인 바이트 수입니다. 원격 파일 시스템에서는 이 정보를 항상 제공하지 않을 수도 있습니다.

### FilesystemCacheBytes \{#filesystemcachebytes\}

`cache` 가상 파일 시스템에 저장된 전체 바이트 수입니다. 이 캐시는 디스크에 저장됩니다.

### FilesystemCacheFiles \{#filesystemcachefiles\}

`cache` 가상 파일 시스템에 캐시된 파일 세그먼트의 총 개수입니다. 이 캐시는 디스크에 저장됩니다.

### FilesystemLogsPathAvailableBytes \{#filesystemlogspathavailablebytes\}

ClickHouse 로그 경로가 마운트된 볼륨에서 사용 가능한 바이트 수입니다. 이 값이 0에 가까워지면 설정 파일에서 로그 순환(로그 로테이션) 설정을 조정해야 합니다.

### FilesystemLogsPathAvailableINodes \{#filesystemlogspathavailableinodes\}

ClickHouse 로그 경로가 마운트된 볼륨의 사용 가능한 inode 개수입니다.

### FilesystemLogsPathTotalBytes \{#filesystemlogspathtotalbytes\}

ClickHouse 로그 경로가 마운트된 볼륨의 크기(바이트 단위)입니다. 로그용으로 최소 10 GB 이상의 공간을 확보하는 것이 좋습니다.

### FilesystemLogsPathTotalINodes \{#filesystemlogspathtotalinodes\}

ClickHouse 로그 경로가 마운트된 볼륨의 inode 총 수입니다.

### FilesystemLogsPathUsedBytes \{#filesystemlogspathusedbytes\}

ClickHouse 로그 경로가 마운트된 볼륨에서 사용 중인 바이트 수입니다.

### FilesystemLogsPathUsedINodes \{#filesystemlogspathusedinodes\}

ClickHouse 로그 경로가 마운트된 볼륨에서 사용 중인 inode 수입니다.

### FilesystemMainPathAvailableBytes \{#filesystemmainpathavailablebytes\}

메인 ClickHouse 경로가 마운트되어 있는 볼륨에서 사용할 수 있는 바이트 수입니다.

### FilesystemMainPathAvailableINodes \{#filesystemmainpathavailableinodes\}

메인 ClickHouse 경로가 마운트된 볼륨에서 사용 가능한 inode 수입니다. 이 값이 0에 가까워지면 설정이 잘못되었음을 의미하며, 디스크가 가득 차지 않았더라도 「no space left on device」 오류가 발생합니다.

### FilesystemMainPathTotalBytes \{#filesystemmainpathtotalbytes\}

메인 ClickHouse 경로가 마운트되어 있는 볼륨의 크기(바이트 단위)입니다.

### FilesystemMainPathTotalINodes \{#filesystemmainpathtotalinodes\}

메인 ClickHouse 경로가 마운트된 볼륨의 총 inode 수입니다. 이 값이 2,500만보다 작으면 설정이 잘못 구성된 상태임을 나타냅니다.

### FilesystemMainPathUsedBytes \{#filesystemmainpathusedbytes\}

주요 ClickHouse 경로가 마운트된 볼륨에서 사용 중인 바이트 수를 나타냅니다.

### FilesystemMainPathUsedINodes \{#filesystemmainpathusedinodes\}

메인 ClickHouse 경로가 마운트된 볼륨에서 사용 중인 inode 수입니다. 이 값은 대체로 파일 수와 거의 일치합니다.

### HTTPThreads \{#httpthreads\}

TLS를 사용하지 않는 HTTP 인터페이스 서버의 스레드 수입니다.

### HTTPSecureThreads \{#httpsecurethreads\}

HTTPS 인터페이스 서버의 스레드 개수입니다.

### InterserverThreads \{#interserverthreads\}

레플리카 통신 프로토콜 서버에서 사용되는 스레드 수(TLS 없이).

### InterserverSecureThreads \{#interserversecurethreads\}

레플리카 통신 프로토콜 서버의 스레드 수(TLS 사용).

### 지터 \{#jitter\}

비동기 메트릭을 계산하는 스레드가 깨어나도록 스케줄된 시각과 실제로 깨어난 시각 사이의 시간 차이입니다. 전체 시스템 지연 시간과 반응성을 나타내는 간접 지표입니다.

### LoadAverage*N* \{#loadaveragen\}

전체 시스템 부하를 1분 동안 지수 평활화(exponential smoothing)를 사용해 평균낸 값입니다. 이 부하는 모든 프로세스에 속한 스레드(운영체제 커널의 스케줄링 단위) 수를 나타내며, 현재 CPU에서 실행 중이거나 I/O를 기다리거나, 실행할 준비가 되었지만 이 시점에는 스케줄되지 않은 스레드를 포함합니다. 이 수치는 clickhouse-server뿐만 아니라 모든 프로세스를 포함합니다. 시스템에 과부하가 걸려 실행할 준비가 된 프로세스가 많지만 CPU나 I/O를 기다리고 있는 경우, 이 값은 CPU 코어 수보다 커질 수 있습니다.

### MaxPartCountForPartition \{#maxpartcountforpartition\}

MergeTree 계열의 모든 테이블에 있는 모든 파티션을 통틀어, 파티션 하나당 허용되는 최대 파트 수입니다. 값이 300을 초과하는 경우 설정 오류, 과부하 또는 대량 데이터 로딩을 의미합니다.

### MemoryCode \{#memorycode\}

서버 프로세스의 머신 코드 페이지에 매핑된 가상 메모리의 크기(바이트 단위)입니다.

### MemoryDataAndStack \{#memorydataandstack\}

스택 사용과 할당된 메모리 사용을 위해 매핑된 가상 메모리의 양(바이트 단위)입니다. 이 값에 스레드별 스택과 `mmap` 시스템 호출로 할당되는 대부분의 메모리가 포함되는지는 정의되어 있지 않습니다. 이 메트릭은 지표 체계를 완전하게 하기 위해서만 존재합니다. 모니터링에는 `MemoryResident` 메트릭을 사용할 것을 권장합니다.

### MemoryResidentMax \{#memoryresidentmax\}

서버 프로세스에서 사용한 물리 메모리의 최대 사용량(바이트 단위)입니다.

### MemoryResident \{#memoryresident\}

서버 프로세스가 사용하는 물리적 메모리 양(바이트 단위)입니다.

### MemoryShared \{#memoryshared\}

서버 프로세스에서 사용되며 동시에 다른 프로세스와도 공유되는 메모리의 양(바이트 단위)입니다. ClickHouse는 공유 메모리를 사용하지 않지만, 일부 메모리는 OS의 자체적인 이유로 공유 메모리로 표시될 수 있습니다. 이 메트릭은 모니터링 측면에서 큰 의미는 없으며, 단지 메트릭의 완전성을 위해 제공됩니다.

### MemoryVirtual \{#memoryvirtual\}

서버 프로세스가 할당한 가상 주소 공간의 크기(바이트 단위)입니다. 가상 주소 공간의 크기는 일반적으로 실제 메모리 사용량보다 훨씬 크며, 메모리 사용량을 추정하는 용도로 사용해서는 안 됩니다. 이 메트릭이 큰 값을 갖는 것은 전적으로 정상이며, 기술적인 관점에서만 의미가 있습니다.

### MySQLThreads \{#mysqlthreads\}

MySQL 호환 프로토콜 서버에서 실행 중인 스레드 수입니다.

### NetworkReceiveBytes_*name* \{#networkreceivebytes_name\}

네트워크 인터페이스를 통해 수신된 바이트 수입니다. 시스템 전체 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다.

### NetworkReceiveDrop_*name* \{#networkreceivedrop_name\}

네트워크 인터페이스를 통해 수신되는 패킷 중 드롭된 패킷의 바이트 수입니다. 시스템 전역 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다.

### NetworkReceiveErrors_*name* \{#networkreceiveerrors_name\}

네트워크 인터페이스를 통해 수신하는 과정에서 발생한 오류 횟수입니다. 시스템 전체 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다.

### NetworkReceivePackets_*name* \{#networkreceivepackets_name\}

네트워크 인터페이스를 통해 수신된 네트워크 패킷 수입니다. 시스템 전체에 대한 메트릭으로, ClickHouse 서버(clickhouse-server)뿐만 아니라 호스트 머신에서 동작하는 모든 프로세스를 포함합니다.

### NetworkSendBytes_*name* \{#networksendbytes_name\}

네트워크 인터페이스를 통해 전송된 바이트 수입니다. 이 메트릭은 시스템 전체에 대한 메트릭으로, clickhouse-server뿐 아니라 호스트 머신의 모든 프로세스를 포함합니다.

### NetworkSendDrop_*name* \{#networksenddrop_name\}

네트워크 인터페이스를 통해 전송되는 동안 패킷이 손실된 횟수입니다. 시스템 전체에 대한 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다.

### NetworkSendErrors_*name* \{#networksenderrors_name\}

네트워크 인터페이스를 통해 전송하는 중에 오류(예: TCP 재전송)가 발생한 횟수입니다. 시스템 전체 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다.

### NetworkSendPackets_*name* \{#networksendpackets_name\}

네트워크 인터페이스를 통해 전송된 네트워크 패킷 수입니다. 시스템 전체에 대한 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다.

### NumberOfDatabases \{#numberofdatabases\}

서버에 있는 데이터베이스의 총 개수입니다.

### NumberOfDetachedByUserParts \{#numberofdetachedbyuserparts\}

`ALTER TABLE DETACH` 쿼리를 사용하여 사용자에 의해 MergeTree 테이블에서 분리(detach)된 파트의 총 개수입니다(예기치 않게 생성되었거나, 손상되었거나, 무시된 파트는 제외). 서버는 분리된 파트를 관리하지 않으며, 해당 파트는 제거할 수 있습니다.

### NumberOfDetachedParts \{#numberofdetachedparts\}

MergeTree 테이블에서 분리(detach)된 파트의 총 개수입니다. 파트는 사용자가 `ALTER TABLE DETACH` 쿼리를 사용하여 분리할 수도 있고, 파트가 손상되었거나 예상치 못한 파트이거나 불필요한 경우 서버 자체에 의해 분리될 수도 있습니다. 서버는 분리된 파트를 따로 관리하지 않으며, 이들은 제거해도 됩니다.

### NumberOfTables \{#numberoftables\}

서버에 있는 모든 데이터베이스의 테이블 수를 합산한 총 개수입니다. 단, MergeTree 테이블을 포함할 수 없는 데이터베이스는 제외합니다. 제외되는 데이터베이스 엔진은 `Lazy`, `MySQL`, `PostgreSQL`, `SQlite`처럼 테이블 집합을 실시간으로(on the fly) 생성하는 엔진입니다.

### OSContextSwitches \{#oscontextswitches\}

호스트 머신에서 시스템이 수행한 컨텍스트 스위치(context switch) 횟수입니다. 시스템 전체에 대한 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신에서 실행 중인 모든 프로세스를 포함합니다.

### OSGuestNiceTime \{#osguestnicetime\}

Linux 커널의 제어하에 있는 게스트 운영 체제에서, 게스트에 더 높은 우선순위가 설정된 상태로 가상 CPU를 실행하는 데 소요된 시간 비율입니다(`man procfs` 참조). 시스템 전체 메트릭으로, clickhouse-server만이 아니라 호스트 머신의 모든 프로세스를 포함합니다. 이 메트릭은 ClickHouse 자체에는 크게 중요하지 않지만, 완전성을 위해 포함되어 있습니다. 단일 CPU 코어의 값은 [0..1] 구간에 있습니다. 전체 CPU 코어에 대한 값은 각 코어의 값을 합산하여 [0..num cores] 범위로 계산됩니다.

### OSGuestNiceTimeCPU_*N* \{#osguestnicetimecpu_n\}

Linux 커널의 제어 하에 있는 게스트 운영 체제를 위해 가상 CPU를 실행하는 데 소요된 시간 중, 게스트에 더 높은 우선순위가 설정되어 있을 때의 시간 비율입니다(`man procfs` 참조). 이는 시스템 전체 메트릭으로, clickhouse-server뿐 아니라 호스트 머신의 모든 프로세스를 포함합니다. 이 메트릭은 ClickHouse와는 직접적인 관련이 없지만, 지표의 완전성을 위해 포함되어 있습니다. 단일 CPU 코어에 대한 값은 [0..1] 범위에 있습니다. 모든 CPU 코어에 대한 값은 각 코어의 값을 합산하여 계산되며, [0..num cores] 범위에 있습니다.

### OSGuestNiceTimeNormalized \{#osguestnicetimenormalized\}

이 값은 `OSGuestNiceTime`과 유사하지만, CPU 코어 수로 나누어 코어 수와 관계없이 [0..1] 구간의 값으로 측정되도록 한 것입니다. 이를 통해 클러스터 내 여러 서버에서 이 메트릭 값을 평균 낼 수 있으며, 코어 수가 서로 다르더라도 평균 자원 사용률 메트릭을 얻을 수 있습니다. 지정된 경우 실제 CPU 코어 수 대신 Cgroup CPU QUOTA를 그 period로 나눈 값을 사용할 수 있으며, 이 경우 특정 시점에는 이 메트릭 값이 1을 초과할 수 있습니다.

### OSGuestTime \{#osguesttime\}

Linux 커널의 제어 하에서 게스트 운영 체제를 위해 가상 CPU를 실행하는 데 사용된 시간의 비율입니다 (`man procfs` 참고). 시스템 전체 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신에서 실행되는 모든 프로세스를 포함합니다. 이 메트릭은 ClickHouse에는 직접적인 관련은 없지만, 완전성을 위해 제공됩니다. 단일 CPU 코어의 값은 [0..1] 범위에 있습니다. 전체 CPU 코어의 값은 각 코어 값을 합산하여 [0..코어 개수] 범위에 있습니다.

### OSGuestTimeCPU_*N* \{#osguesttimecpu_n\}

Linux 커널의 제어 하에서 게스트 운영 체제를 위해 가상 CPU를 실행하는 데 소요된 시간의 비율입니다 (`man procfs` 참조). 시스템 전체 메트릭이므로, clickhouse-server만이 아니라 호스트 머신의 모든 프로세스를 포함합니다. 이 메트릭은 ClickHouse와는 직접적인 관련은 없지만, 완전성을 위해 포함되어 있습니다. 단일 CPU 코어에 대한 값은 [0..1] 구간에 있습니다. 모든 CPU 코어에 대한 값은 각 코어 값을 합산하여 [0..코어 개수] 범위가 되도록 계산됩니다.

### OSGuestTimeNormalized \{#osguesttimenormalized\}

이 값은 `OSGuestTime`와 유사하지만 CPU 코어 수로 나눈 값이어서, 코어 수와 관계없이 [0..1] 구간에서 측정됩니다. 이를 통해 코어 수가 서로 다른 클러스터 내 여러 서버의 이 메트릭 값을 평균 내더라도 평균적인 자원 사용량을 나타내는 메트릭을 얻을 수 있습니다. 명시된 경우 실제 CPU 코어 수 대신 Cgroup CPU quota를 그 기간으로 나눈 값을 사용할 수 있으며, 이 경우 특정 시점에는 이 메트릭 값이 1을 초과할 수 있습니다.

### OSIOWaitTime \{#osiowaittime\}

CPU 코어가 코드를 실행하지 않았지만, 프로세스들이 I/O를 기다리느라 OS 커널도 이 CPU에서 다른 프로세스를 실행하지 않았던 시간의 비율입니다. 이는 시스템 전역 메트릭으로, clickhouse-server만이 아니라 호스트 머신에서 동작하는 모든 프로세스를 포함합니다. 단일 CPU 코어의 값은 [0..1] 구간에 있습니다. 모든 CPU 코어에 대한 값은 각 코어 값을 합산한 [0..코어 수] 구간의 값으로 계산됩니다.

### OSIOWaitTimeCPU_*N* \{#osiowaittimecpu_n\}

CPU 코어가 코드를 실행하지 않았지만, 프로세스들이 I/O를 기다리느라 OS 커널도 이 CPU에서 다른 프로세스를 실행하지 않았던 시간의 비율입니다. 이는 시스템 전체에 대한 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 단일 CPU 코어의 값은 [0..1] 구간에 있습니다. 전체 CPU 코어에 대한 값은 모든 코어 값을 합산하여 계산하며, [0..코어 개수] 구간에 있습니다.

### OSIOWaitTimeNormalized \{#osiowaittimenormalized\}

이 값은 `OSIOWaitTime`과 비슷하지만 CPU 코어 수로 나누어, 코어 수와 관계없이 [0..1] 구간의 값으로 정규화됩니다. 이를 통해 코어 수가 균일하지 않은 클러스터 내 여러 서버에 걸쳐 이 메트릭 값을 평균 내더라도, 여전히 일관된 평균 리소스 사용률 메트릭을 얻을 수 있습니다. Cgroup CPU QUOTA가 지정되어 있는 경우 실제 CPU 코어 수 대신 QUOTA를 그 기간(period)으로 나눈 값을 사용할 수 있으며, 이 경우 특정 시점에는 이 메트릭 값이 1을 초과할 수 있습니다.

### OSIdleTime \{#osidletime\}

OS 커널 관점에서 CPU 코어가 유휴 상태(입출력(IO)을 기다리느라 실행할 준비조차 되어 있지 않은 상태)였던 시간의 비율입니다. 이는 시스템 전체 메트릭(system-wide metric)으로, clickhouse-server만이 아니라 호스트 머신에서 동작하는 모든 프로세스를 포함합니다. 여기에는 CPU 내부 요인(메모리 로드, 파이프라인 정지, 분기 예측 실패, 다른 SMT 코어 실행 등)으로 인해 CPU가 충분히 활용되지 못한 시간은 포함되지 않습니다. 단일 CPU 코어에 대한 값은 [0..1] 구간에 속합니다. 모든 CPU 코어에 대한 값은 각 코어 값을 합산하여 [0..코어 수] 범위로 계산됩니다.

### OSIdleTimeCPU_*N* \{#osidletimecpu_n\}

OS 커널 관점에서 CPU 코어가 유휴 상태(입출력을 기다리며 대기 중인 프로세스를 실행할 준비조차 되어 있지 않은 상태)였던 시간의 비율입니다. 이는 시스템 전체에 대한 메트릭으로, clickhouse-server만이 아니라 호스트 머신의 모든 프로세스를 포함합니다. 이 값에는 CPU 내부적인 이유(메모리 로드, 파이프라인 정지, 분기 예측 실패, 다른 동시 멀티스레딩(SMT) 코어 실행 등)로 인해 CPU가 충분히 활용되지 않은 시간은 포함되지 않습니다. 단일 CPU 코어에 대한 값은 [0..1] 구간에 속합니다. 모든 CPU 코어에 대한 값은 각 코어 값을 합산하여 [0..코어 개수] 구간에서 계산됩니다.

### OSIdleTimeNormalized \{#osidletimenormalized\}

이 값은 `OSIdleTime`과 비슷하지만, CPU 코어 수로 나누어 코어 수와 관계없이 [0..1] 범위에서 측정되도록 한 것입니다. 이를 통해 코어 수가 일정하지 않은 경우에도 클러스터 내 여러 서버에서 이 메트릭 값을 평균 내어, 평균 자원 사용률을 나타내는 메트릭을 얻을 수 있습니다. Cgroup CPU QUOTA가 지정된 경우, 실제 CPU 코어 수 대신 QUOTA를 그 기간(period)으로 나눈 값을 사용할 수 있으며, 이때는 특정 시점에서 이 메트릭 값이 1을 초과할 수도 있습니다.

### OSInterrupts \{#osinterrupts\}

호스트 머신에서 발생한 인터럽트 수입니다. 시스템 전체에 대한 메트릭으로, clickhouse-server만이 아니라 호스트 머신의 모든 프로세스를 포함합니다.

### OSIrqTime \{#osirqtime\}

CPU에서 하드웨어 인터럽트 요청을 실행하는 데 소요된 시간 비율입니다. 시스템 전체 메트릭으로, clickhouse-server뿐 아니라 호스트 머신의 모든 프로세스를 포함합니다. 이 메트릭 값이 높으면 하드웨어 구성 오류나 매우 높은 네트워크 부하를 나타낼 수 있습니다. 단일 CPU 코어에 대한 값은 [0..1] 범위에 있습니다. 모든 CPU 코어에 대한 값은 각 코어 값을 합산하여 [0..코어 수] 범위에 있게 됩니다.

### OSIrqTimeCPU_*N* \{#osirqtimecpu_n\}

CPU가 하드웨어 인터럽트 요청을 처리하는 데 소비한 시간의 비율입니다. 이 값은 시스템 전체 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신에서 실행 중인 모든 프로세스를 포함합니다. 이 메트릭의 값이 높으면 하드웨어 오구성 또는 매우 높은 네트워크 부하를 나타낼 수 있습니다. 단일 CPU 코어에 대한 값은 [0..1] 범위입니다. 모든 CPU 코어에 대한 값은 각 코어 값을 합산한 것으로 [0..num cores] 범위가 됩니다.

### OSIrqTimeNormalized \{#osirqtimenormalized\}

이 값은 `OSIrqTime`과 유사하지만 CPU 코어 수로 나누어, 코어 수와 무관하게 [0..1] 구간의 값이 되도록 합니다. 이를 통해 클러스터 내 여러 서버에서 코어 수가 균일하지 않더라도 이 메트릭 값을 평균 내어 평균 자원 활용도 메트릭을 얻을 수 있습니다. 설정된 경우 실제 CPU 코어 수 대신 cgroup CPU QUOTA를 그 주기로 나눈 값을 사용할 수 있으며, 이때는 특정 시점에 이 메트릭 값이 1을 초과할 수 있습니다.

### OSMemoryAvailable \{#osmemoryavailable\}

프로그램이 사용할 수 있는 메모리 용량(바이트 단위)입니다. `OSMemoryFreePlusCached` 메트릭과 매우 유사합니다. 시스템 전체에 대한 메트릭으로, clickhouse-server만이 아니라 호스트 머신에서 실행 중인 모든 프로세스를 포함합니다.

### OSMemoryBuffers \{#osmemorybuffers\}

OS 커널 버퍼가 사용하는 메모리 양(바이트 단위)입니다. 일반적으로는 이 값이 작아야 하며, 값이 크게 나타나면 OS가 잘못 구성되었을 수 있습니다. 시스템 전체 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신에서 실행 중인 모든 프로세스를 포함합니다.

### OSMemoryCached \{#osmemorycached\}

OS 페이지 캐시에서 사용 중인 메모리 양(바이트 단위)입니다. 일반적으로 사용 가능한 거의 모든 메모리가 OS 페이지 캐시에 사용되므로 이 메트릭 값이 높게 나타나는 것은 정상이며 예상된 동작입니다. 이 메트릭은 시스템 전체에 대한 지표로, clickhouse-server뿐만 아니라 호스트 머신에서 실행 중인 모든 프로세스를 포함합니다.

### OSMemoryFreePlusCached \{#osmemoryfreepluscached\}

호스트 시스템의 사용 가능한 메모리와 OS 페이지 캐시 메모리의 합을 바이트 단위로 나타낸 값입니다. 이 메모리는 프로그램에서 사용할 수 있습니다. 이 값은 `OSMemoryAvailable`과 매우 유사해야 합니다. 이는 시스템 전체에 대한 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신에서 실행 중인 모든 프로세스를 포함합니다.

### OSMemoryFreeWithoutCached \{#osmemoryfreewithoutcached\}

호스트 시스템에서 남아 있는 메모리의 양(바이트)입니다. 여기에는 OS 페이지 캐시로 사용 중인 메모리(바이트)는 포함되지 않습니다. 페이지 캐시 메모리는 프로그램에서 사용할 수 있는 메모리이기도 하므로, 이 메트릭의 값은 혼동을 줄 수 있습니다. 대신 `OSMemoryAvailable` 메트릭을 참고하십시오. 편의를 위해 `OSMemoryFreePlusCached` 메트릭도 제공하며, 이는 `OSMemoryAvailable`과 어느 정도 유사한 값을 가집니다. https://www.linuxatemyram.com/ 도 참고하십시오. 이 메트릭은 시스템 전체 메트릭으로, ClickHouse 서버만이 아니라 호스트 머신에서 동작 중인 모든 프로세스를 포함합니다.

### OSMemoryTotal \{#osmemorytotal\}

호스트 시스템의 총 메모리 용량(바이트 단위)입니다.

### OSNiceTime \{#osnicetime\}

CPU 코어가 높은 우선순위로 사용자 공간(userspace) 코드를 실행한 시간의 비율입니다. 이는 시스템 전체에 대한 메트릭으로, clickhouse-server만이 아니라 호스트 머신의 모든 프로세스를 포함합니다. 단일 CPU 코어의 값은 [0..1] 범위에 있습니다. 전체 CPU 코어에 대한 값은 각 코어 값을 합산하여 [0..num cores] 범위의 값으로 계산됩니다.

### OSNiceTimeCPU_*N* \{#osnicetimecpu_n\}

CPU 코어가 높은 우선순위의 사용자 공간(userspace) 코드를 실행하는 데 사용된 시간의 비율입니다. 이는 시스템 전체 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신에서 실행 중인 모든 프로세스를 포함합니다. 단일 CPU 코어에 대한 값은 [0..1] 범위에 있습니다. 모든 CPU 코어에 대한 값은 각 코어 값을 합산한 것으로, [0..코어 개수] 범위의 값을 가집니다.

### OSNiceTimeNormalized \{#osnicetimenormalized\}

이 값은 `OSNiceTime`과 유사하지만, CPU 코어 수로 나누어 코어 수와 무관하게 [0..1] 구간에서 표현되도록 정규화한 값입니다. 이를 통해 코어 수가 균일하지 않은 클러스터에서도 여러 서버에 걸친 이 메트릭의 값을 평균 내어, 평균적인 리소스 사용률을 나타내는 메트릭을 얻을 수 있습니다. 설정된 경우 실제 CPU 코어 수 대신 Cgroup CPU quota를 period 값으로 나눈 값을 사용할 수 있으며, 이때는 특정 시점에서 이 메트릭 값이 1을 초과할 수 있습니다.

### OSOpenFiles \{#osopenfiles\}

호스트 머신에서 열려 있는 파일의 총 개수입니다. 이는 시스템 전체 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다.

### OSProcessesBlocked \{#osprocessesblocked\}

I/O 완료를 기다리며 차단된 스레드의 수입니다 (`man procfs`). 이는 시스템 전체에 대한 메트릭으로, clickhouse-server만이 아니라 호스트 머신에서 동작하는 모든 프로세스를 포함합니다.

### OSProcessesCreated \{#osprocessescreated\}

생성된 프로세스의 개수입니다. 시스템 전체에 대한 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다.

### OSProcessesRunning \{#osprocessesrunning\}

운영 체제에서 실행 가능 상태(실행 중이거나 실행 준비가 된)의 스레드 수입니다. 시스템 전체에 대한 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신에서 동작하는 모든 프로세스를 포함합니다.

### OSSoftIrqTime \{#ossoftirqtime\}

CPU에서 소프트웨어 인터럽트 요청을 처리하는 데 소비된 시간의 비율입니다. 시스템 전체 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신에서 실행되는 모든 프로세스를 포함합니다. 이 메트릭 값이 높으면 시스템에서 비효율적인 소프트웨어가 실행되고 있을 가능성을 나타냅니다. 단일 CPU 코어의 값은 [0..1] 구간에 있습니다. 모든 CPU 코어에 대한 값은 각 코어 값을 합산하여 계산되며 [0..코어 수] 구간에 있습니다.

### OSSoftIrqTimeCPU_*N* \{#ossoftirqtimecpu_n\}

CPU에서 소프트웨어 인터럽트 요청을 처리하는 데 사용된 시간의 비율입니다. 시스템 전체 메트릭으로, clickhouse-server만이 아니라 호스트 머신의 모든 프로세스를 포함합니다. 이 메트릭 값이 높다면 시스템에서 실행 중인 소프트웨어가 비효율적일 수 있음을 나타냅니다. 단일 CPU 코어의 값은 [0..1] 구간에 포함됩니다. 모든 CPU 코어에 대한 값은 각 코어 값을 합산한 것으로, [0..코어 개수(num cores)] 범위에 있게 됩니다.

### OSSoftIrqTimeNormalized \{#ossoftirqtimenormalized\}

이 값은 `OSSoftIrqTime`과 유사하지만, CPU 코어 수로 나누어 코어 수와 무관하게 [0..1] 구간의 값으로 측정되도록 한 것입니다. 이를 통해 코어 수가 균일하지 않은 경우에도 클러스터 내 여러 서버에서 이 메트릭 값을 평균하여 평균 리소스 사용률 메트릭을 얻을 수 있습니다. 별도로 지정된 경우 실제 CPU 코어 수 대신 Cgroup CPU QUOTA를 그 기간(period)으로 나눈 값을 사용할 수 있으며, 이 경우 특정 시점에는 이 메트릭 값이 1을 초과할 수 있습니다.

### OSStealTime \{#osstealtime\}

가상화된 환경에서 CPU가 다른 운영 체제에 의해 사용된 시간의 비율입니다. 이는 시스템 전체 메트릭으로, clickhouse-server만이 아니라 호스트 머신의 모든 프로세스를 포함합니다. 모든 가상화된 환경에서 이 메트릭을 제공하는 것은 아니며, 대부분의 환경에서는 제공하지 않습니다. 단일 CPU 코어의 값은 [0..1] 구간에 있습니다. 전체 CPU 코어에 대한 값은 모든 코어에 대해 값을 합산하여 [0..코어 개수] 구간이 되도록 계산됩니다.

### OSStealTimeCPU_*N* \{#osstealtimecpu_n\}

가상화 환경에서 CPU가 다른 운영 체제에서 실행되는 작업에 사용된 시간의 비율입니다. 시스템 전역 메트릭으로, clickhouse-server만이 아니라 호스트 머신에서 실행 중인 모든 프로세스를 포함합니다. 모든 가상화 환경이 이 메트릭을 제공하는 것은 아니며, 대부분의 환경에서는 제공하지 않습니다. 단일 CPU 코어의 값은 [0..1] 구간에 있습니다. 모든 CPU 코어에 대한 값은 각 코어 값을 합산하여 [0..num cores] 구간의 값으로 계산됩니다.

### OSStealTimeNormalized \{#osstealtimenormalized\}

값은 `OSStealTime`과 비슷하지만 CPU 코어 수로 나누어, 코어 수에 관계없이 [0..1] 구간에서 측정됩니다. 이를 통해 코어 수가 균일하지 않은 경우에도 클러스터의 여러 서버에 걸쳐 이 메트릭 값을 평균하여 평균 리소스 사용률 메트릭을 얻을 수 있습니다. 해당 설정을 지정한 경우 실제 CPU 코어 수 대신 Cgroup CPU QUOTA를 그 기간으로 나눈 값을 사용할 수 있으며, 이 경우 특정 시점에는 이 메트릭 값이 1을 초과할 수 있습니다.

### OSSystemTime \{#ossystemtime\}

CPU 코어가 OS 커널(시스템) 코드를 실행한 시간의 비율입니다. 이는 시스템 전체 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신에서 실행 중인 모든 프로세스를 포함합니다. 단일 CPU 코어의 값은 [0..1] 범위에 있습니다. 모든 CPU 코어에 대한 값은 각 코어 값을 합산하여 [0..코어 개수] 범위의 값으로 계산됩니다.

### OSSystemTimeCPU_*N* \{#ossystemtimecpu_n\}

CPU 코어가 OS 커널(시스템) 모드에서 실행된 시간의 비율입니다. 이는 시스템 전체 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신에서 동작하는 모든 프로세스를 포함합니다. 단일 CPU 코어에 대한 값은 [0..1] 범위에 있습니다. 모든 CPU 코어에 대한 값은 각 코어 값을 합산하여 [0..코어 개수] 범위의 값을 갖도록 계산됩니다.

### OSSystemTimeNormalized \{#ossystemtimenormalized\}

이 값은 `OSSystemTime`과 유사하지만 CPU 코어 수로 나누어, 코어 수와 관계없이 [0..1] 범위에서 측정되도록 한 값입니다. 이를 통해 코어 수가 서버마다 서로 달라도 클러스터 내 여러 서버의 이 메트릭 값을 평균 내어 평균 리소스 사용률 메트릭을 얻을 수 있습니다. 설정된 경우 실제 CPU 코어 수 대신 Cgroup CPU QUOTA를 그 기간으로 나눈 값을 사용할 수 있으며, 이때는 특정 시점에 이 메트릭 값이 1을 초과할 수 있습니다.

### OSThreadsRunnable \{#osthreadsrunnable\}

OS 커널 스케줄러 관점에서 'runnable' 상태인 스레드의 총 개수입니다.

### OSThreadsTotal \{#osthreadstotal\}

OS 커널 스케줄러 기준으로 본 전체 스레드 수입니다.

### OSUptime \{#osuptime\}

호스트 서버(ClickHouse가 실행 중인 머신)의 가동 시간으로, 초 단위로 표시됩니다.

### OSUserTime \{#osusertime\}

CPU 코어가 유저 공간(userspace) 코드를 실행한 시간의 비율입니다. 시스템 전체 메트릭으로, clickhouse-server만이 아니라 호스트 머신에서 동작하는 모든 프로세스를 포함합니다. 또한 CPU 내부 요인(메모리 로드, 파이프라인 스톨, 분기 예측 실패, 다른 SMT 코어 실행 등)으로 인해 CPU가 충분히 활용되지 못한 시간도 포함합니다. 단일 CPU 코어의 값은 [0..1] 구간에 있습니다. 모든 CPU 코어에 대한 값은 각 코어 값을 합산하여 [0..코어 수] 구간의 값으로 계산됩니다.

### OSUserTimeCPU_*N* \{#osusertimecpu_n\}

CPU 코어가 사용자 공간(userspace) 코드를 실행한 시간의 비율입니다. 이는 시스템 전체에 대한 메트릭으로, clickhouse-server뿐만 아니라 호스트 머신의 모든 프로세스를 포함합니다. 또한 CPU 내부 요인(메모리 로드, 파이프라인 스톨, 분기 예측 실패, 다른 SMT 코어 실행 등)으로 인해 CPU가 충분히 활용되지 못한 시간도 포함합니다. 단일 CPU 코어에 대한 값은 [0..1] 구간에 있습니다. 모든 CPU 코어에 대한 값은 각 코어 값을 합산하여 [0..코어 수] 구간의 값으로 계산됩니다.

### OSUserTimeNormalized \{#osusertimenormalized\}

이 값은 `OSUserTime`과 유사하지만 CPU 코어 수로 나눈 값으로, 코어 수와 관계없이 [0..1] 구간에서 측정되도록 합니다. 이를 통해 코어 수가 균일하지 않은 클러스터의 여러 서버에 걸쳐 이 메트릭의 값을 평균 내더라도 평균적인 리소스 사용률 메트릭을 얻을 수 있습니다. 설정된 경우 실제 CPU 코어 수 대신 Cgroup CPU QUOTA를 해당 기간으로 나눈 값을 사용할 수 있으며, 이 경우 특정 시점에는 이 메트릭 값이 1을 초과할 수 있습니다.

### PostgreSQLThreads \{#postgresqlthreads\}

PostgreSQL 호환성 프로토콜 서버의 스레드 수입니다.

### ReplicasMaxAbsoluteDelay \{#replicasmaxabsolutedelay\}

복제된 테이블(Replicated Table) 전체에서, 가장 최신 복제된 파트와 아직 복제되어야 할 가장 최신 데이터 파트 사이의 최대 시간 차이(초)입니다. 값이 매우 크면 데이터가 없는 레플리카를 의미합니다.

### ReplicasMaxInsertsInQueue \{#replicasmaxinsertsinqueue\}

복제된 테이블(Replicated Table) 전반에서, 아직 복제되지 않아 대기열에 남아 있는 INSERT 연산의 최대 개수를 나타냅니다.

### ReplicasMaxMergesInQueue \{#replicasmaxmergesinqueue\}

복제된 테이블(Replicated Table) 전반에서 대기열에 있는(아직 적용되지 않은) 머지(merge) 작업의 최대 개수입니다.

### ReplicasMaxQueueSize \{#replicasmaxqueuesize\}

모든 복제된 테이블(Replicated Table)을 통틀어 `get`, `merge`와 같은 작업 개수 기준으로 산정한 최대 큐 크기입니다.

### ReplicasMaxRelativeDelay \{#replicasmaxrelativedelay\}

복제된 테이블(Replicated Table)에서 동일한 테이블에 대해, 각 레플리카의 지연 시간과 해당 테이블에서 가장 최신 레플리카의 지연 시간 사이에서 허용되는 최대 차이입니다.

### ReplicasSumInsertsInQueue \{#replicassuminsertsinqueue\}

큐에 있는 INSERT 연산(아직 복제되지 않은)의 합으로, 모든 복제된 테이블(Replicated Table)에 걸친 값입니다.

### ReplicasSumMergesInQueue \{#replicassummergesinqueue\}

복제된 테이블(Replicated Table) 전체에서 아직 적용되지 않고 큐에 대기 중인 머지 작업 수의 합입니다.

### ReplicasSumQueueSize \{#replicassumqueuesize\}

복제된 테이블(Replicated Table) 전체에 걸쳐 큐 크기를 합산한 값으로, 단위는 `get`, `merge`와 같은 작업 수입니다.

### TCPThreads \{#tcpthreads\}

TCP 프로토콜 서버의 스레드 수(TLS 없이).

### TCPSecureThreads \{#tcpsecurethreads\}

TCP 프로토콜(TLS 포함) 서버에서 사용하는 스레드 수입니다.

### GRPCThreads \{#grpcthreads\}

GRPC 프로토콜 서버에서 사용하는 스레드 수입니다.

### PrometheusThreads \{#prometheusthreads\}

Prometheus 엔드포인트 서버에서 사용하는 스레드 수입니다. 참고로 Prometheus 엔드포인트는 일반 HTTP/HTTPS 포트를 통해서도 사용할 수 있습니다.

### KeeperTCPThreads \{#keepertcpthreads\}

TLS를 사용하지 않는 Keeper TCP 프로토콜 서버의 스레드 수입니다.

### KeeperTCPSecureThreads \{#keepertcpsecurethreads\}

Keeper TCP 프로토콜(TLS 사용) 서버에서 사용하는 스레드 수입니다.

### Temperature_*N* \{#temperature_n\}

해당 장치의 온도(℃)입니다. 센서가 비정상적인 값을 반환하는 경우가 있습니다. 출처: `/sys/class/thermal`

### Temperature_*name* \{#temperature_name\}

해당 하드웨어 모니터와 센서에서 보고되는 온도(℃ 단위)입니다. 센서가 비정상적인 값을 반환할 수도 있습니다. 출처: `/sys/class/hwmon`

### TotalBytesOfMergeTreeTables \{#totalbytesofmergetreetables\}

MergeTree 계열의 모든 테이블에 저장된 압축된 바이트의 총량(데이터 및 인덱스 포함)입니다.

### MergeTree 테이블의 총 파트 수 \{#totalpartsofmergetreetables\}

MergeTree 패밀리에 속한 모든 테이블의 데이터 파트 총 개수입니다. 10 000보다 큰 수치는 서버 시작 시간에 부정적인 영향을 줄 수 있으며, 파티션 키 선택이 적절하지 않음을 나타낼 수 있습니다.

### TotalPrimaryKeyBytesInMemory \{#totalprimarykeybytesinmemory\}

기본 키 값이 사용하는 메모리의 총량(바이트 단위)입니다. 활성 파트만 포함합니다.

### TotalPrimaryKeyBytesInMemoryAllocated \{#totalprimarykeybytesinmemoryallocated\}

기본 키 값에 대해 예약된 총 메모리 크기(바이트 단위)입니다(활성 파트만 집계합니다).

### TotalRowsOfMergeTreeTables \{#totalrowsofmergetreetables\}

MergeTree 계열의 모든 테이블에 저장된 전체 행(레코드) 수입니다.

### Uptime \{#uptime\}

서버의 가동 시간(단위: 초)입니다. 연결을 수락하기 전에 서버 초기화에 소요된 시간도 포함합니다.

### ZooKeeperClientLastZXIDSeen \{#zookeeperclientlastzxidseen\}

현재 ZooKeeper 클라이언트 세션에서 마지막으로 본 ZXID입니다. 이 값은 클라이언트가 ZooKeeper의 트랜잭션을 관찰할 때마다 단조 증가합니다.

### LongestRunningMerge \{#longestrunningmerge\}

현재 실행 중인 백그라운드 머지 작업 중 가장 오래 실행 중인 작업의 경과 시간(초)입니다.

### jemalloc.active \{#jemallocactive\}

저수준 메모리 할당기(jemalloc)의 내부 지표입니다. 자세한 내용은 https://jemalloc.net/jemalloc.3.html 문서를 참고하십시오.

### jemalloc.allocated \{#jemallocallocated\}

저수준 메모리 할당기(jemalloc)의 내부 메트릭입니다. 자세한 내용은 https://jemalloc.net/jemalloc.3.html 문서를 참조하십시오.

### jemalloc.arenas.all.dirty_purged \{#jemallocarenasalldirty_purged\}

저수준 메모리 할당자(jemalloc)의 내부 메트릭입니다. 자세한 내용은 https://jemalloc.net/jemalloc.3.html 문서를 참고하십시오.

### jemalloc.arenas.all.muzzy_purged \{#jemallocarenasallmuzzy_purged\}

저수준 메모리 할당기(jemalloc)의 내부 메트릭입니다. 자세한 내용은 https://jemalloc.net/jemalloc.3.html을 참조하십시오.

### jemalloc.arenas.all.pactive \{#jemallocarenasallpactive\}

저수준 메모리 할당기(jemalloc)의 내부 메트릭입니다. 자세한 내용은 https://jemalloc.net/jemalloc.3.html 문서를 참고하십시오.

### jemalloc.arenas.all.pdirty \{#jemallocarenasallpdirty\}

저수준 메모리 할당자(jemalloc)의 내부 지표입니다. https://jemalloc.net/jemalloc.3.html을 참고하십시오.

### jemalloc.arenas.all.pmuzzy \{#jemallocarenasallpmuzzy\}

저수준 메모리 할당기(jemalloc)의 내부 메트릭입니다. 자세한 내용은 https://jemalloc.net/jemalloc.3.html을 참조하십시오.

### jemalloc.background_thread.num_runs \{#jemallocbackground_threadnum_runs\}

저수준 메모리 할당자(jemalloc)의 내부 지표입니다. https://jemalloc.net/jemalloc.3.html을 참고하십시오.

### jemalloc.background_thread.num_threads \{#jemallocbackground_threadnum_threads\}

저수준 메모리 할당자(jemalloc)의 내부 메트릭입니다. 자세한 내용은 https://jemalloc.net/jemalloc.3.html 문서를 참고하십시오.

### jemalloc.background_thread.run_intervals \{#jemallocbackground_threadrun_intervals\}

저수준 메모리 할당자(jemalloc)의 내부 메트릭입니다. 자세한 내용은 https://jemalloc.net/jemalloc.3.html을 참조하십시오.

### jemalloc.epoch \{#jemallocepoch\}

jemalloc(Jason Evans의 메모리 할당자) 통계를 위한 내부 증분 업데이트 번호로, 다른 모든 `jemalloc` 메트릭에서 사용됩니다.

### jemalloc.mapped \{#jemallocmapped\}

저수준 메모리 할당자(jemalloc)의 내부 메트릭입니다. 자세한 내용은 https://jemalloc.net/jemalloc.3.html을 참조하십시오.

### jemalloc.metadata \{#jemallocmetadata\}

저수준 메모리 할당자(jemalloc)의 내부 메트릭입니다. 자세한 사항은 https://jemalloc.net/jemalloc.3.html을 참조하십시오.

### jemalloc.metadata_thp \{#jemallocmetadata_thp\}

저수준 메모리 할당자(jemalloc)의 내부 메트릭입니다. 자세한 내용은 https://jemalloc.net/jemalloc.3.html 문서를 참조하십시오.

### jemalloc.resident \{#jemallocresident\}

저수준 메모리 할당자(jemalloc)의 내부 메트릭입니다. 자세한 내용은 https://jemalloc.net/jemalloc.3.html을 참조하십시오.

### jemalloc.retained \{#jemallocretained\}

저수준 메모리 할당자(jemalloc)의 내부 메트릭입니다. 자세한 내용은 https://jemalloc.net/jemalloc.3.html 를 참조하십시오.

### jemalloc.prof.active \{#jemallocprofactive\}

저수준 메모리 할당자(jemalloc)의 내부 메트릭입니다. 자세한 내용은 https://jemalloc.net/jemalloc.3.html 를 참조하십시오.

**함께 보기**

- [Monitoring](../../operations/monitoring.md) — ClickHouse 모니터링의 기본 개념을 다룹니다.
- [system.metrics](/operations/system-tables/metrics) — 즉시 계산되는 메트릭을 포함합니다.
- [system.events](/operations/system-tables/events) — 발생한 여러 이벤트를 포함합니다.
- [system.metric_log](/operations/system-tables/metric_log) — `system.metrics` 및 `system.events` 테이블의 메트릭 값 이력을 포함합니다.