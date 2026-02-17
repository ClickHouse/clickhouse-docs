---
description: '오픈 소스 ClickHouse 사용에 대한 권장 사항을 설명하는 페이지'
sidebar_label: 'OSS 사용 권장 사항'
sidebar_position: 58
slug: /operations/tips
title: 'OSS 사용 권장 사항'
doc_type: 'guide'
---

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />


## CPU 스케일링 거버너 \{#cpu-scaling-governor\}

항상 `performance` 스케일링 거버너를 사용하십시오. `on-demand` 스케일링 거버너는 지속적으로 높은 부하가 걸리는 경우에는 성능이 훨씬 떨어집니다.

```bash
$ echo 'performance' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
```


## CPU 제한 사항 \{#cpu-limitations\}

프로세서는 과열될 수 있습니다. `dmesg`를 사용하여 CPU의 클록 속도가 과열로 인해 제한되었는지 확인할 수 있습니다.
이러한 제한은 데이터 센터 수준에서 설정될 수도 있습니다. 부하가 걸린 상태에서 이를 모니터링하려면 `turbostat`을 사용할 수 있습니다.

## RAM \{#ram\}

소량의 데이터(압축 기준 약 200 GB까지)의 경우 데이터 양에 맞춰 가능한 한 많은 메모리를 사용하는 것이 가장 좋습니다.
대량의 데이터를 다루면서 대화형(온라인) 쿼리를 처리할 때는 핫 데이터 서브셋이 페이지 캐시에 들어갈 수 있도록 128 GB 이상 수준의 충분한 RAM을 사용하는 것이 좋습니다.
서버당 데이터 볼륨이 약 50 TB 정도이더라도, 64 GB 대신 128 GB의 RAM을 사용하면 쿼리 성능이 크게 향상됩니다.

overcommit을 비활성화하지 마십시오. `cat /proc/sys/vm/overcommit_memory` 값은 0 또는 1이어야 합니다. 다음을 실행하십시오.

```bash
$ echo 0 | sudo tee /proc/sys/vm/overcommit_memory
```

커널이 메모리 관리를 위해 소비하는 시간을 모니터링하려면 `perf top`을 사용하십시오.
permanent huge pages도 별도로 할당할 필요가 없습니다.


### RAM이 16GB 미만인 경우 사용 방법 \{#using-less-than-16gb-of-ram\}

권장 RAM 용량은 32GB 이상입니다.

시스템에 RAM이 16GB 미만인 경우, 기본 설정이 이 메모리 용량에 맞지 않기 때문에 다양한 메모리 예외가 발생할 수 있습니다. RAM이 적은 시스템(최소 2GB)에서도 ClickHouse를 사용할 수 있지만, 이러한 구성에서는 추가 튜닝이 필요하며 데이터 수집 속도는 낮게 유지됩니다.

RAM 16GB 미만 환경에서 ClickHouse를 사용할 때는 다음과 같이 설정할 것을 권장합니다:

- `config.xml`에서 mark cache 크기를 줄입니다. 최소 500MB까지 설정할 수 있지만, 0으로 설정할 수는 없습니다.
- 쿼리 처리 스레드 수를 `1`로 줄입니다.
- `max_block_size`를 `8192`로 낮춥니다. `1024`까지 낮춰도 실용적으로 사용할 수 있습니다.
- `max_download_threads`를 `1`로 줄입니다.
- `input_format_parallel_parsing`과 `output_format_parallel_formatting`을 `0`으로 설정합니다.
- 로그 테이블에 대한 쓰기를 비활성화하십시오. 로그 테이블 병합을 수행하는 백그라운드 merge 작업이 RAM을 예약하기 때문입니다. `asynchronous_metric_log`, `metric_log`, `text_log`, `trace_log`를 비활성화하십시오.

추가 참고 사항:

- 메모리 할당자가 캐시한 메모리를 플러시하려면 `SYSTEM JEMALLOC PURGE`
명령을 실행하면 됩니다.
- 버퍼에 상당한 메모리가 필요하기 때문에, 메모리가 적은 머신에서는 S3 또는 Kafka 통합 사용을 권장하지 않습니다.

## Storage Subsystem \{#storage-subsystem\}

예산이 허용한다면 SSD를 사용하십시오.
그렇지 않다면 HDD를 사용하십시오. 7200 RPM SATA HDD면 충분합니다.

디스크 셸프가 연결된 소수의 서버보다 로컬 하드 드라이브를 가진 다수의 서버를 우선적으로 선택하십시오.
다만 조회 빈도가 낮은 아카이브를 저장하는 용도라면 디스크 셸프도 적절합니다.

## RAID \{#raid\}

HDD를 사용할 때는 RAID-10, RAID-5, RAID-6 또는 RAID-50으로 구성할 수 있습니다.
Linux에서는 소프트웨어 RAID(`mdadm` 사용)가 더 좋습니다.
RAID-10을 생성할 때는 `far` 레이아웃을 선택하십시오.
예산이 허용된다면 RAID-10을 선택하십시오.

LVM만 단독으로 사용하는 것(RAID나 `mdadm` 없이)은 괜찮지만, LVM으로 RAID를 구성하거나 `mdadm`과 결합해 RAID를 만드는 방식은 상대적으로 검증된 사례가 적고,
(잘못된 청크 크기 선택, 청크 오정렬, 잘못된 RAID 타입 선택, 디스크 정리 누락 등) 실수할 가능성이 더 많습니다.
LVM 사용에 자신이 있다면, LVM을 사용하는 것 자체는 문제가 되지 않습니다.

디스크가 4개보다 많다면 RAID-5 대신 RAID-6(권장) 또는 RAID-50을 사용하십시오.
RAID-5, RAID-6 또는 RAID-50을 사용할 때는 기본값이 보통 최선의 선택이 아니므로 항상 stripe&#95;cache&#95;size를 증가시키십시오.

```bash
$ echo 4096 | sudo tee /sys/block/md2/md/stripe_cache_size
```

디바이스 개수와 블록 크기를 사용하여 다음 공식으로 정확한 수를 계산합니다: `2 * num_devices * chunk_size_in_bytes / 4096`.

대부분의 RAID 구성에서는 블록 크기 64 KB로 충분합니다. 평균 clickhouse-server 쓰기 크기는 약 1 MB(1024 KB)이므로 권장 스트라이프 크기도 1 MB입니다. 블록 크기는 필요하다면 RAID 배열에서 비패리티 디스크 수로 1 MB를 나눈 값으로 설정하여 최적화할 수 있으며, 이렇게 하면 각 쓰기가 사용 가능한 모든 비패리티 디스크에 걸쳐 병렬로 수행됩니다.
블록 크기를 너무 작게 또는 너무 크게 설정하지 마십시오.

SSD에서는 RAID-0을 사용할 수 있습니다.
RAID 사용 여부와 상관없이 항상 데이터 보안을 위해 복제를 사용해야 합니다.

긴 큐 길이를 사용하여 NCQ를 활성화하십시오. HDD의 경우 mq-deadline 또는 CFQ 스케줄러를 선택하고, SSD의 경우 noop을 선택합니다. `readahead` 설정을 줄이지 마십시오.
HDD에서는 쓰기 캐시를 활성화하십시오.

OS에서 NVME 및 SSD 디스크에 대해 [`fstrim`](https://en.wikipedia.org/wiki/Trim_\(computing\))이 활성화되어 있는지 확인하십시오(일반적으로 cronjob 또는 systemd 서비스로 구현됩니다).


## 파일 시스템 \{#file-system\}

Ext4가 가장 신뢰할 수 있는 선택입니다. 마운트 옵션은 `noatime`으로 설정하십시오. XFS도 잘 동작합니다.
대부분의 다른 파일 시스템도 문제 없이 동작합니다.

FAT-32와 exFAT은 하드 링크를 지원하지 않으므로 지원되지 않습니다.

압축 파일 시스템은 사용하지 마십시오. ClickHouse가 자체적으로 더 효율적인 압축을 수행하기 때문입니다.
암호화된 파일 시스템의 사용도 권장되지 않습니다. ClickHouse에 내장된 암호화를 사용하는 편이 더 낫습니다.

ClickHouse는 NFS 상에서도 동작하지만, 최선의 선택은 아닙니다.

## Linux Kernel \{#linux-kernel\}

오래된 버전의 Linux 커널은 사용하지 마십시오.

## 네트워크 \{#network\}

IPv6를 사용하는 경우 라우트 캐시 크기를 늘리십시오.
Linux 커널 3.2 이전 버전에는 IPv6 구현과 관련된 다양한 문제가 있었습니다.

가능하면 최소 10 GB 네트워크를 사용하십시오. 1 Gb 네트워크도 동작하지만, 수십 테라바이트의 데이터를 가진 레플리카를 패치하거나 많은 양의 중간 데이터를 사용하는 분산 쿼리를 처리할 때 성능이 훨씬 떨어집니다.

## Huge Pages \{#huge-pages\}

오래된 Linux 커널을 사용 중인 경우 transparent huge pages를 비활성화해야 합니다. 이는 메모리 할당기와 간섭하여 성능을 크게 저하시킵니다.
최신 Linux 커널에서는 transparent huge pages를 사용해도 문제가 없습니다.

```bash
$ echo 'madvise' | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
```

`transparent huge pages` 설정을 영구적으로 변경하려면 `/etc/default/grub` 파일을 편집하여 `GRUB_CMDLINE_LINUX_DEFAULT` 옵션에 `transparent_hugepage=madvise`를 추가합니다.

```bash
$ GRUB_CMDLINE_LINUX_DEFAULT="transparent_hugepage=madvise ..."
```

그런 다음 `sudo update-grub` 명령을 실행한 후 변경 사항이 적용되도록 시스템을 재부팅합니다.


## 하이퍼바이저 구성 \{#hypervisor-configuration\}

OpenStack을 사용하는 경우 다음을 설정합니다.

```ini
cpu_mode=host-passthrough
```

`nova.conf` 파일에서 설정합니다.

libvirt를 사용하는 경우 다음을 설정합니다.

```xml
<cpu mode='host-passthrough'/>
```

XML 구성에서 설정해야 합니다.

이렇게 설정해야 ClickHouse가 `cpuid` 명령어를 사용하여 올바른 정보를 가져올 수 있습니다.
그렇지 않으면 하이퍼바이저가 오래된 CPU 모델에서 실행될 때 `Illegal instruction` 오류가 발생하여 크래시가 날 수 있습니다.


## ClickHouse Keeper 및 ZooKeeper \{#zookeeper\}

ClickHouse Keeper는 ClickHouse 클러스터에서 ZooKeeper를 대체하여 사용하는 것이 권장됩니다. [ClickHouse Keeper](../guides/sre/keeper/index.md)에 대한 문서를 참조하십시오.

ZooKeeper 사용을 계속하려는 경우에는 가급적 3.4.9 이상의 최신 버전을 사용하는 것이 좋습니다. 안정 버전 Linux 배포판에 포함된 버전은 오래되었을 수 있습니다.

서로 다른 ZooKeeper 클러스터 간에 데이터를 전송하기 위해 수동으로 작성한 스크립트를 절대 사용하지 마십시오. 순차 노드에 대해서는 잘못된 결과가 발생합니다. 동일한 이유로 「zkcopy」 유틸리티도 절대 사용하지 마십시오: https://github.com/ksprojects/zkcopy/issues/15

기존 ZooKeeper 클러스터를 둘로 나누려면, 레플리카 수를 늘린 다음 두 개의 독립적인 클러스터로 재구성하는 것이 올바른 방법입니다.

테스트 환경이거나 수집 속도가 낮은 환경에서는 ClickHouse Keeper를 ClickHouse와 동일한 서버에서 실행할 수 있습니다.
프로덕션 환경에서는 ClickHouse와 ZooKeeper/Keeper용으로 별도의 서버를 사용하거나, ClickHouse 파일과 Keeper 파일을 서로 다른 디스크에 배치하는 것이 좋습니다. ZooKeeper/Keeper는 디스크 지연에 매우 민감하고 ClickHouse가 사용 가능한 시스템 리소스를 모두 점유할 수 있기 때문입니다.

ZooKeeper 앙상블에 observer를 둘 수는 있지만, ClickHouse 서버는 observer와 상호작용해서는 안 됩니다.

`minSessionTimeout` 설정을 변경하지 마십시오. 값이 너무 크면 ClickHouse 재시작 안정성에 영향을 줄 수 있습니다.

기본 설정 그대로의 ZooKeeper는 시한폭탄과 같습니다:

> ZooKeeper 서버는 기본 구성(`autopurge` 참조)을 사용할 때 오래된 스냅샷과 로그의 파일을 삭제하지 않으며, 이 작업은 운영자의 책임입니다.

이 폭탄은 반드시 해제해야 합니다.

아래 ZooKeeper(3.5.1) 구성은 대규모 프로덕션 환경에서 사용되고 있습니다:

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


## Antivirus software \{#antivirus-software\}

Antivirus 소프트웨어를 사용하는 경우 ClickHouse 데이터 파일이 저장된 폴더(`/var/lib/clickhouse`)는 검사 대상에서 제외하도록 설정하십시오. 그렇지 않으면 성능이 저하될 수 있으며, 데이터 수집 및 백그라운드 병합 작업 중 예기치 않은 오류가 발생할 수 있습니다.

## 관련 콘텐츠 \{#related-content\}

- [ClickHouse를 처음 사용하십니까? 피해야 할 "치명적인 실수" 13가지와 예방법](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)