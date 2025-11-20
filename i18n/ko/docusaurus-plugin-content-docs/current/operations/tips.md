---
'description': '오픈소스 ClickHouse에 대한 사용 권장 사항을 설명하는 페이지'
'sidebar_label': 'OSS 사용 권장 사항'
'sidebar_position': 58
'slug': '/operations/tips'
'title': 'OSS 사용 권장 사항'
'doc_type': 'guide'
---

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />

## CPU 스케일링 거버너 {#cpu-scaling-governor}

항상 `performance` 스케일링 거버너를 사용하세요. `on-demand` 스케일링 거버너는 지속적으로 높은 수요에서 훨씬 더 나빠집니다.

```bash
$ echo 'performance' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
```

## CPU 제한 사항 {#cpu-limitations}

프로세서가 과열될 수 있습니다. 과열로 인해 CPU의 클럭 속도가 제한되었는지 확인하려면 `dmesg`를 사용하세요.
제한은 데이터 센터 수준에서 외부적으로 설정될 수도 있습니다. 부하에서 이를 모니터링하려면 `turbostat`를 사용할 수 있습니다.

## RAM {#ram}

소량의 데이터(약 200GB 압축)에 대해서는 데이터의 양만큼 메모리를 사용하는 것이 가장 좋습니다.
대량의 데이터와 상호작용(온라인) 쿼리를 처리할 때는 적절한 양의 RAM(128GB 이상)을 사용해야 하며, 그래야 핫 데이터 하위 집합이 페이지 캐시에 적합합니다.
서버당 약 50TB의 데이터 볼륨을 처리할 때도 128GB의 RAM을 사용하면 64GB에 비해 쿼리 성능이 크게 향상됩니다.

오버커밋을 비활성화하지 마세요. `cat /proc/sys/vm/overcommit_memory` 값은 0 또는 1이어야 합니다. 다음을 실행하세요.

```bash
$ echo 0 | sudo tee /proc/sys/vm/overcommit_memory
```

메모리 관리에 소요되는 시간을 보려면 `perf top`를 사용하세요.
영구적인 큰 페이지도 할당할 필요가 없습니다.

### 16GB 미만의 RAM 사용 {#using-less-than-16gb-of-ram}

권장 RAM 용량은 32GB 이상입니다.

시스템에 16GB 미만의 RAM이 있을 경우 기본 설정이 이 메모리 양과 일치하지 않기 때문에 다양한 메모리 예외가 발생할 수 있습니다. RAM이 적은 시스템(최소 2GB)에서 ClickHouse를 사용할 수 있지만 이러한 설정은 추가 조정이 필요하고 낮은 속도로만 수집할 수 있습니다.

ClickHouse를 16GB 미만의 RAM으로 사용할 때는 다음을 권장합니다:

- `config.xml`에서 마크 캐시의 크기를 낮추세요. 500MB까지 낮출 수 있지만 0으로 설정할 수는 없습니다.
- 쿼리 처리 스레드 수를 `1`로 낮추세요.
- `max_block_size`를 `8192`로 낮추세요. `1024`와 같은 값도 실용적일 수 있습니다.
- `max_download_threads`를 `1`로 낮추세요.
- `input_format_parallel_parsing` 및 `output_format_parallel_formatting`을 `0`으로 설정하세요.
- 로그 테이블에서의 쓰기를 비활성화하세요. 로그 테이블의 병합을 수행하기 위해 RAM을 예약하는 백그라운드 병합 작업을 유지하므로 `asynchronous_metric_log`, `metric_log`, `text_log`, `trace_log`를 비활성화하세요.

추가 참고 사항:
- 메모리 할당기에 의해 캐시된 메모리를 플러시하려면 `SYSTEM JEMALLOC PURGE` 명령을 실행할 수 있습니다.
- 메모리 용량이 적은 시스템에서는 S3 또는 Kafka 통합을 사용하지 않는 것이 좋습니다. 이러한 통합은 버퍼에 상당한 메모리를 필요로 합니다.

## 저장소 하부 시스템 {#storage-subsystem}

예산이 허락한다면 SSD를 사용하세요. 그렇지 않다면 HDD를 사용하세요. SATA HDD 7200 RPM도 괜찮습니다.

부Attached 디스크 셸프가 있는 소수의 서버보다는 로컬 하드 드라이브가 있는 많은 서버를 선호하세요. 그러나 드문 쿼리의 아카이브 저장을 위해서는 셸프가 작동합니다.

## RAID {#raid}

HDD를 사용할 때는 RAID-10, RAID-5, RAID-6 또는 RAID-50으로 조합할 수 있습니다.
Linux의 경우 소프트웨어 RAID가 더 좋습니다(`mdadm` 사용). 
RAID-10을 생성할 때 `far` 레이아웃을 선택하세요.
예산이 허락한다면 RAID-10을 선택하세요.

LVM 자체(RAID 또는 `mdadm` 없이)는 괜찮지만, RAID를 만들거나 `mdadm`과 결합하는 것은 덜 탐색된 옵션이며 더 많은 실수 가능성이 있습니다(잘못된 청크 크기 선택; 청크의 비대칭; 잘못된 RAID 유형 선택; 디스크 정리 잊음). LVM 사용에 자신이 있다면 사용하는 것에 반대할 것은 없습니다.

4개 이상의 디스크가 있는 경우 RAID-6(선호됨) 또는 RAID-50을 사용하고 RAID-5 대신 사용하세요.
RAID-5, RAID-6 또는 RAID-50을 사용할 때는 항상 stripe_cache_size를 증가시키세요. 기본 값이 일반적으로 최선이 아니기 때문입니다.

```bash
$ echo 4096 | sudo tee /sys/block/md2/md/stripe_cache_size
```

장치 수와 블록 크기에서 정확한 숫자를 계산하려면 다음 공식을 사용합니다: `2 * num_devices * chunk_size_in_bytes / 4096`.

대부분의 RAID 구성에 대해 64KB의 블록 크기가 충분합니다. 평균 clickhouse-server 쓰기 크기는 약 1MB(1024KB)이며, 따라서 권장 stripe 크기도 1MB입니다. 필요 시 블록 크기는 RAID 배열의 비패리티 디스크 수로 1MB를 나누어 설정하여 각 쓰기가 모두 가용한 비패리티 디스크에서 병렬화되도록 최적화할 수 있습니다.
블록 크기를 너무 작거나 너무 크게 설정하지 마세요.

SSD에서 RAID-0을 사용할 수 있습니다.
RAID 사용 여부와 관계없이 항상 데이터 보안을 위해 복제를 사용하세요.

긴 큐와 함께 NCQ를 활성화하세요. HDD의 경우 mq-deadline 또는 CFQ 스케줄러를 선택하고 SSD의 경우 noop을 선택하세요. 'readahead' 설정을 줄이지 마세요.
HDD의 경우 쓰기 캐시를 활성화하세요.

OS에서 NVME 및 SSD 디스크에 대해 [`fstrim`](https://en.wikipedia.org/wiki/Trim_(computing))이 활성화되었는지 확인하세요(일반적으로 크론 잡 또는 systemd 서비스로 구현됨).

## 파일 시스템 {#file-system}

Ext4가 가장 신뢰할 수 있는 옵션입니다. 마운트 옵션 `noatime`을 설정하세요. XFS도 잘 작동합니다.
대부분의 다른 파일 시스템도 잘 작동할 것입니다.

FAT-32 및 exFAT는 하드 링크 부족으로 인해 지원되지 않습니다.

압축 파일 시스템을 사용하지 마세요. ClickHouse는 자체적으로 더 나은 압축을 수행합니다.
암호화된 파일 시스템 사용은 권장되지 않습니다. ClickHouse에서 보다 나은 내장 암호화를 사용할 수 있기 때문입니다.

ClickHouse는 NFS에서 작동할 수 있지만 최선의 선택은 아닙니다.

## Linux 커널 {#linux-kernel}

구식 Linux 커널을 사용하지 마세요.

## 네트워크 {#network}

IPv6를 사용하는 경우 라우트 캐시의 크기를 늘리세요.
3.2 이전의 Linux 커널은 IPv6 구현에 수많은 문제가 있었습니다.

가능하다면 최소 10GB 네트워크를 사용하세요. 1Gb도 작동하지만, 테라바이트 데이터 수십 개의 복제를 패치하거나 대량의 중간 데이터를 처리하는 분산 쿼리에는 훨씬 나쁜 성능을 보입니다.

## 큰 페이지 {#huge-pages}

구식 Linux 커널을 사용하는 경우 투명한 큰 페이지를 비활성화하세요. 이는 메모리 할당기에 간섭하여 성능 저하를 초래합니다.
더 최신의 Linux 커널에서는 투명한 큰 페이지가 괜찮습니다.

```bash
$ echo 'madvise' | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
```

투명한 큰 페이지 설정을 영구적으로 수정하려면 `/etc/default/grub` 파일을 편집하여 `GRUB_CMDLINE_LINUX_DEFAULT` 옵션에 `transparent_hugepage=madvise`를 추가하세요:

```bash
$ GRUB_CMDLINE_LINUX_DEFAULT="transparent_hugepage=madvise ..."
```

그 후 `sudo update-grub` 명령을 실행하고 재부팅하여 적용하세요.

## 하이퍼바이저 구성 {#hypervisor-configuration}

OpenStack을 사용하는 경우는 `nova.conf`에서

```ini
cpu_mode=host-passthrough
```

libvirt를 사용하는 경우 XML 구성에서 설정하세요.

이것은 ClickHouse가 `cpuid` 명령어로 올바른 정보를 얻을 수 있도록 하는 데 중요합니다.
그렇지 않으면 구형 CPU 모델에서 하이퍼바이저가 실행될 때 `Illegal instruction` 크래시가 발생할 수 있습니다.

## ClickHouse Keeper 및 ZooKeeper {#zookeeper}

ClickHouse 클러스터를 위해 ZooKeeper를 대체하려면 ClickHouse Keeper를 사용하는 것이 좋습니다. [ClickHouse Keeper](../guides/sre/keeper/index.md) 문서를 참조하세요.

ZooKeeper를 계속 사용하려면 최상의 버전인 3.4.9 이상을 사용하는 것이 좋습니다. 안정적인 Linux 배포판의 버전이 구식일 수 있습니다.

서로 다른 ZooKeeper 클러스터 간에 데이터를 전송하기 위해 수동으로 작성된 스크립트를 사용해서는 안 됩니다. 결과가 순차적 노드에 대해 올바르지 않을 수 있습니다. 같은 이유로 "zkcopy" 유틸리티를 사용하지 마세요: https://github.com/ksprojects/zkcopy/issues/15

기존 ZooKeeper 클러스터를 두 개로 나누려면 복제본 수를 늘린 후 두 개의 독립적인 클러스터로 재구성하는 것이 올바른 방법입니다.

테스트 환경에서 ClickHouse와 같은 서버에서 ClickHouse Keeper를 실행하거나 낮은 수집 속도의 환경에서 실행할 수 있습니다.
생산 환경에서는 ClickHouse와 ZooKeeper/Keeper를 위한 별도의 서버를 사용하거나 ClickHouse 파일과 Keeper 파일을 서로 다른 디스크에 배치하는 것이 좋습니다. ZooKeeper/Keeper는 디스크 대기 시간에 매우 민감하며 ClickHouse가 모든 가용 시스템 리소스를 사용할 수 있기 때문입니다.

ZooKeeper 감독자를 앙상블에 포함할 수 있지만 ClickHouse 서버는 감독자와 상호 작용해서는 안 됩니다.

`minSessionTimeout` 설정을 변경하지 마세요. 큰 값은 ClickHouse 재시작 안정성에 영향을 미칠 수 있습니다.

기본 설정으로 ZooKeeper는 시한 폭탄입니다:

> 기본 구성으로 사용할 때 ZooKeeper 서버는 오래된 스냅샷 및 로그의 파일을 삭제하지 않으며 (적어도 `autopurge`를 참조) 이는 운영자의 책임입니다.

이 폭탄은 해체해야 합니다.

다음 ZooKeeper (3.5.1) 구성은 대규모 생산 환경에서 사용됩니다:

zoo.cfg:

```bash

# http://hadoop.apache.org/zookeeper/docs/current/zookeeperAdmin.html


# The number of milliseconds of each tick
tickTime=2000

# The number of ticks that the initial

# synchronization phase can take

# This value is not quite motivated
initLimit=300

# The number of ticks that can pass between

# sending a request and getting an acknowledgement
syncLimit=10

maxClientCnxns=2000


# It is the maximum value that client may request and the server will accept.

# It is Ok to have high maxSessionTimeout on server to allow clients to work with high session timeout if they want.

# But we request session timeout of 30 seconds by default (you can change it with session_timeout_ms in ClickHouse config).
maxSessionTimeout=60000000

# the directory where the snapshot is stored.
dataDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/data

# Place the dataLogDir to a separate physical disc for better performance
dataLogDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/logs

autopurge.snapRetainCount=10
autopurge.purgeInterval=1



# To avoid seeks ZooKeeper allocates space in the transaction log file in

# blocks of preAllocSize kilobytes. The default block size is 64M. One reason

# for changing the size of the blocks is to reduce the block size if snapshots

# are taken more often. (Also, see snapCount).
preAllocSize=131072


# Clients can submit requests faster than ZooKeeper can process them,

# especially if there are a lot of clients. To prevent ZooKeeper from running

# out of memory due to queued requests, ZooKeeper will throttle clients so that

# there is no more than globalOutstandingLimit outstanding requests in the

# system. The default limit is 1000.

# globalOutstandingLimit=1000


# ZooKeeper logs transactions to a transaction log. After snapCount transactions

# are written to a log file a snapshot is started and a new transaction log file

# is started. The default snapCount is 100000.
snapCount=3000000


# If this option is defined, requests will be will logged to a trace file named

# traceFile.year.month.day.
#traceFile=


# Leader accepts client connections. Default value is "yes". The leader machine

# coordinates updates. For higher update throughput at thes slight expense of

# read throughput the leader can be configured to not accept clients and focus

# on coordination.
leaderServes=yes

standaloneEnabled=false
dynamicConfigFile=/etc/zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }}/conf/zoo.cfg.dynamic
```

Java 버전:

```text
openjdk 11.0.5-shenandoah 2019-10-15
OpenJDK Runtime Environment (build 11.0.5-shenandoah+10-adhoc.heretic.src)
OpenJDK 64-Bit Server VM (build 11.0.5-shenandoah+10-adhoc.heretic.src, mixed mode)
```

JVM 매개변수:

```bash
NAME=zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }}
ZOOCFGDIR=/etc/$NAME/conf


# TODO this is really ugly

# How to find out, which jars are needed?

# seems, that log4j requires the log4j.properties file to be in the classpath
CLASSPATH="$ZOOCFGDIR:/usr/build/classes:/usr/build/lib/*.jar:/usr/share/zookeeper-3.6.2/lib/audience-annotations-0.5.0.jar:/usr/share/zookeeper-3.6.2/lib/commons-cli-1.2.jar:/usr/share/zookeeper-3.6.2/lib/commons-lang-2.6.jar:/usr/share/zookeeper-3.6.2/lib/jackson-annotations-2.10.3.jar:/usr/share/zookeeper-3.6.2/lib/jackson-core-2.10.3.jar:/usr/share/zookeeper-3.6.2/lib/jackson-databind-2.10.3.jar:/usr/share/zookeeper-3.6.2/lib/javax.servlet-api-3.1.0.jar:/usr/share/zookeeper-3.6.2/lib/jetty-http-9.4.24.v20191120.jar:/usr/share/zookeeper-3.6.2/lib/jetty-io-9.4.24.v20191120.jar:/usr/share/zookeeper-3.6.2/lib/jetty-security-9.4.24.v20191120.jar:/usr/share/zookeeper-3.6.2/lib/jetty-server-9.4.24.v20191120.jar:/usr/share/zookeeper-3.6.2/lib/jetty-servlet-9.4.24.v20191120.jar:/usr/share/zookeeper-3.6.2/lib/jetty-util-9.4.24.v20191120.jar:/usr/share/zookeeper-3.6.2/lib/jline-2.14.6.jar:/usr/share/zookeeper-3.6.2/lib/json-simple-1.1.1.jar:/usr/share/zookeeper-3.6.2/lib/log4j-1.2.17.jar:/usr/share/zookeeper-3.6.2/lib/metrics-core-3.2.5.jar:/usr/share/zookeeper-3.6.2/lib/netty-buffer-4.1.50.Final.jar:/usr/share/zookeeper-3.6.2/lib/netty-codec-4.1.50.Final.jar:/usr/share/zookeeper-3.6.2/lib/netty-common-4.1.50.Final.jar:/usr/share/zookeeper-3.6.2/lib/netty-handler-4.1.50.Final.jar:/usr/share/zookeeper-3.6.2/lib/netty-resolver-4.1.50.Final.jar:/usr/share/zookeeper-3.6.2/lib/netty-transport-4.1.50.Final.jar:/usr/share/zookeeper-3.6.2/lib/netty-transport-native-epoll-4.1.50.Final.jar:/usr/share/zookeeper-3.6.2/lib/netty-transport-native-unix-common-4.1.50.Final.jar:/usr/share/zookeeper-3.6.2/lib/simpleclient-0.6.0.jar:/usr/share/zookeeper-3.6.2/lib/simpleclient_common-0.6.0.jar:/usr/share/zookeeper-3.6.2/lib/simpleclient_hotspot-0.6.0.jar:/usr/share/zookeeper-3.6.2/lib/simpleclient_servlet-0.6.0.jar:/usr/share/zookeeper-3.6.2/lib/slf4j-api-1.7.25.jar:/usr/share/zookeeper-3.6.2/lib/slf4j-log4j12-1.7.25.jar:/usr/share/zookeeper-3.6.2/lib/snappy-java-1.1.7.jar:/usr/share/zookeeper-3.6.2/lib/zookeeper-3.6.2.jar:/usr/share/zookeeper-3.6.2/lib/zookeeper-jute-3.6.2.jar:/usr/share/zookeeper-3.6.2/lib/zookeeper-prometheus-metrics-3.6.2.jar:/usr/share/zookeeper-3.6.2/etc"

ZOOCFG="$ZOOCFGDIR/zoo.cfg"
ZOO_LOG_DIR=/var/log/$NAME
USER=zookeeper
GROUP=zookeeper
PIDDIR=/var/run/$NAME
PIDFILE=$PIDDIR/$NAME.pid
SCRIPTNAME=/etc/init.d/$NAME
JAVA=/usr/local/jdk-11/bin/java
ZOOMAIN="org.apache.zookeeper.server.quorum.QuorumPeerMain"
ZOO_LOG4J_PROP="INFO,ROLLINGFILE"
JMXLOCALONLY=false
JAVA_OPTS="-Xms{{ '{{' }} cluster.get('xms','128M') {{ '}}' }} \
    -Xmx{{ '{{' }} cluster.get('xmx','1G') {{ '}}' }} \
    -Xlog:safepoint,gc*=info,age*=debug:file=/var/log/$NAME/zookeeper-gc.log:time,level,tags:filecount=16,filesize=16M
    -verbose:gc \
    -XX:+UseG1GC \
    -Djute.maxbuffer=8388608 \
    -XX:MaxGCPauseMillis=50"
```

Salt 초기화:

```text
description "zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }} centralized coordination service"

start on runlevel [2345]
stop on runlevel [!2345]

respawn

limit nofile 8192 8192

pre-start script
    [ -r "/etc/zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }}/conf/environment" ] || exit 0
    . /etc/zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }}/conf/environment
    [ -d $ZOO_LOG_DIR ] || mkdir -p $ZOO_LOG_DIR
    chown $USER:$GROUP $ZOO_LOG_DIR
end script

script
    . /etc/zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }}/conf/environment
    [ -r /etc/default/zookeeper ] && . /etc/default/zookeeper
    if [ -z "$JMXDISABLE" ]; then
        JAVA_OPTS="$JAVA_OPTS -Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.local.only=$JMXLOCALONLY"
    fi
    exec start-stop-daemon --start -c $USER --exec $JAVA --name zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }} \
        -- -cp $CLASSPATH $JAVA_OPTS -Dzookeeper.log.dir=${ZOO_LOG_DIR} \
        -Dzookeeper.root.logger=${ZOO_LOG4J_PROP} $ZOOMAIN $ZOOCFG
end script
```

## 안티바이러스 소프트웨어 {#antivirus-software}

안티바이러스 소프트웨어를 사용하는 경우 ClickHouse 데이터 파일 폴더(`/var/lib/clickhouse`)를 건너뛰도록 구성하세요. 그렇지 않으면 성능이 저하되고 데이터 수집 및 백그라운드 병합 중에 예기치 않은 오류가 발생할 수 있습니다.

## 관련 콘텐츠 {#related-content}

- [ClickHouse를 시작하시겠습니까? 여기 13가지 "치명적인 죄"와 그것을 피하는 방법이 있습니다.](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)
