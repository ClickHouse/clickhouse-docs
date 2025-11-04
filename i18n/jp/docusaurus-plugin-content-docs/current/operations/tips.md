---
'description': 'http://hadoop.apache.org/zookeeper/docs/current/zookeeperAdmin.html
  的文档'
'sidebar_label': '使用推荐'
'sidebar_position': 58
'slug': '/operations/tips'
'title': '使用推荐'
'doc_type': 'guide'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />

## CPU スケーリング ガバナー {#cpu-scaling-governor}

常に `performance` スケーリングガバナーを使用してください。`on-demand` スケーリングガバナーは、常に高い需要に対してははるかに劣ります。

```bash
$ echo 'performance' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
```

## CPU の制限 {#cpu-limitations}

プロセッサは過熱する可能性があります。`dmesg` を使用して、CPU のクロック周波数が過熱のために制限されたかどうかを確認してください。
この制限は、データセンターのレベルで外部的に設定することもできます。負荷の下でこれを監視するために `turbostat` を使用できます。

## RAM {#ram}

データ量が少ない場合（圧縮された状態で約200 GBまで）、データのボリュームと同じだけのメモリを使用するのが最適です。
大量のデータがあり、対話型（オンライン）クエリを処理する場合は、ホットデータのサブセットがページキャッシュに収まるように、合理的な量のRAM（128 GB以上）を使用するべきです。
サーバーごとに約50 TBのデータ量であっても、128 GBのRAMを使用することで、64 GBと比べてクエリ性能が大幅に向上します。

オーバーコミットは無効にしないでください。`cat /proc/sys/vm/overcommit_memory` の値は 0 または 1 であるべきです。実行してください。

```bash
$ echo 0 | sudo tee /proc/sys/vm/overcommit_memory
```

メモリ管理のためにカーネルで費やされた時間を確認するために `perf top` を使用してください。
永続的な大ページも割り当てる必要はありません。

### 16GB 未満の RAM を使用する場合 {#using-less-than-16gb-of-ram}

推奨されるRAMの量は32GB以上です。

システムのRAMが16GB未満の場合、デフォルト設定がこのメモリ量に合わないため、さまざまなメモリ例外が発生する可能性があります。RAMが少ないシステムでもClickHouseを使用できます（最低でも2GBまで可能）が、これらのセットアップは追加の調整が必要で、低いレートでしかデータを取り込むことができません。

ClickHouseを16GB未満のRAMで使用する場合、以下を推奨します：

- `config.xml`でマークキャッシュのサイズを小さく設定します。500MBまで設定できますが、ゼロには設定できません。
- クエリ処理スレッドの数を `1` に減らします。
- `max_block_size`を `8192` に下げます。`1024` のように値を小さく設定することも実用的です。
- `max_download_threads`を `1` に減らします。
- `input_format_parallel_parsing` および `output_format_parallel_formatting` を `0` に設定します。
- ログテーブルに書き込むのを無効にします。これは、背景でのマージタスクがログテーブルのマージを実行するためにRAMを保持するからです。`asynchronous_metric_log`, `metric_log`, `text_log`, `trace_log`を無効にします。

追加の注意事項：
- メモリアロケーターによってキャッシュされたメモリをフラッシュするには、`SYSTEM JEMALLOC PURGE`コマンドを実行できます。
- RAMが少ないマシンで S3 や Kafka 統合を使用することは推奨しません。これらはバッファ用のメモリを多く必要とします。

## ストレージサブシステム {#storage-subsystem}

予算が許す限り、SSDを使用してください。
そうでない場合はHDDを使用します。SATA HDD 7200 RPM であれば問題ありません。

ローカルハードドライブを備えた多数のサーバーを、少数のサーバーと接続ディスクシェルフの組み合わせよりも優先してください。
ただし、まれにクエリが行われるアーカイブの保存には、シェルフが機能します。

## RAID {#raid}

HDDを使用する場合、RAID-10、RAID-5、RAID-6、または RAID-50 の組み合わせが可能です。
Linuxの場合、ソフトウェアRAID（`mdadm`を使用）がより良いです。
RAID-10を作成する場合は、`far`レイアウトを選択してください。
予算が許す場合はRAID-10を選んでください。

LVM単体（RAIDや`mdadm`なし）は問題ないですが、それでRAIDを作成するか`mdadm`と組み合わせるのはあまり検討されておらず、間違いやすいです
（不適切なチャンクサイズの選択、チャンクの不整合、適切なRAIDタイプの選択、ディスクのクリーンアップを忘れる等）。LVMの使用に自信がある場合は、使用することに反対はありません。

4台以上のディスクがある場合は、RAID-6（推奨）または RAID-50 を使用してください。RAID-5、RAID-6、または RAID-50 を使用する場合は、常に stripe_cache_size を増加させてください。デフォルト値は通常、最適な選択ではありません。

```bash
$ echo 4096 | sudo tee /sys/block/md2/md/stripe_cache_size
```

デバイス数とブロックサイズから正確な数を計算するには、次の式を使用します：`2 * num_devices * chunk_size_in_bytes / 4096`。

ブロックサイズは通常のRAID構成には64KBで十分です。平均的なclickhouse-serverの書き込みサイズは約1MB（1024KB）であり、推奨されるストライプサイズも1MBです。必要に応じて、ブロックサイズはRAID配列内の非パリティディスクの数で割った1MBに設定することで最適化できます。そうすることで各書き込みが利用可能な非パリティディスク全てに並行して実行されます。
ブロックサイズをあまり小さくしたり大きくしたりしないでください。

SSDではRAID-0を使用できます。
RAIDを使用するかどうかに関わらず、データセキュリティのために常にレプリケーションを使用してください。

長いキューを持つNCQを有効にしてください。HDDの場合はmq-deadlineまたはCFQスケジューラを選択し、SSDの場合はnoopを選択してください。'readahead'設定を減少させないでください。
HDDの場合は書き込みキャッシュを有効にしてください。

OSのNVMEおよびSSDディスクに [`fstrim`](https://en.wikipedia.org/wiki/Trim_(computing)) が有効になっていることを確認してください（通常はcronjobまたはsystemdサービスを使用して実装されます）。

## ファイルシステム {#file-system}

Ext4が最も信頼性の高いオプションです。マウントオプション `noatime` を設定します。XFSも良好です。
ほとんどの他のファイルシステムも正常に動作するはずです。

ハードリンクの欠如により、FAT-32およびexFATはサポートされていません。

圧縮ファイルシステムは使用しないでください。ClickHouseが独自に圧縮を行うため、より良好です。
暗号化ファイルシステムの使用も推奨されません。ClickHouseには組み込みの暗号化機能があり、こちらの方が優れています。

ClickHouseはNFS上で機能できますが、最良の考えではありません。

## Linux カーネル {#linux-kernel}

古いLinuxカーネルを使用しないでください。

## ネットワーク {#network}

IPv6を使用している場合は、ルートキャッシュのサイズを増やしてください。
3.2以前のLinuxカーネルには、IPv6の実装に多くの問題がありました。

可能であれば、少なくとも10GBのネットワークを使用してください。1Gbでも動作しますが、テラバイト単位のデータでレプリカをパッチする際や、大量の中間データで分散クエリを処理する際には、遥かに劣ります。

## 大ページ {#huge-pages}

古いLinuxカーネルを使用している場合は、透過的巨大ページを無効にしてください。これはメモリアロケーターに干渉し、重大なパフォーマンス低下を引き起こします。
新しいLinuxカーネルでは透過的巨大ページは問題ありません。

```bash
$ echo 'madvise' | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
```

透過的巨大ページの設定を恒久的に変更したい場合は、`/etc/default/grub` を編集して、`GRUB_CMDLINE_LINUX_DEFAULT`オプションに`transparent_hugepage=madvise`を追加します：

```bash
$ GRUB_CMDLINE_LINUX_DEFAULT="transparent_hugepage=madvise ..."
```

その後、`sudo update-grub` コマンドを実行し、再起動して変更を有効にします。

## ハイパーバイザーの設定 {#hypervisor-configuration}

OpenStackを使用している場合は、`nova.conf`に設定を行ってください。

```ini
cpu_mode=host-passthrough
```

libvirtを使用している場合は、XML設定で設定を行ってください。

```xml
<cpu mode='host-passthrough'/>
```

これは、ClickHouseが `cpuid` 命令を使用して正しい情報を取得できるようにするために重要です。
そうでない場合、古いCPUモデルでハイパーバイザーが実行されると、`Illegal instruction` のクラッシュが発生する可能性があります。

## ClickHouse Keeper と ZooKeeper {#zookeeper}

ClickHouse クラスタ用に ZooKeeper の代わりに ClickHouse Keeper を使用することが推奨されます。 [ClickHouse Keeper](../guides/sre/keeper/index.md) のドキュメントを参照してください。

ZooKeeperの使用を続けたい場合は、新しいバージョンのZooKeeper（3.4.9以降）を使用するのがベストです。安定したLinuxディストリビューションのバージョンは古い可能性があります。

異なるZooKeeperクラスタ間でデータを転送するために手動で書かれたスクリプトを絶対に使用しないでください。結果は、順次ノードに対して不正確になるからです。同じ理由で「zkcopy」ユーティリティも使用しないでください：https://github.com/ksprojects/zkcopy/issues/15

既存のZooKeeperクラスタを2つに分割したい場合、正しい方法は、レプリカの数を増やしてから2つの独立したクラスタとして再構成することです。

テスト環境や低い取り込み率の環境では、ClickHouseと同じサーバー上でClickHouse Keeperを実行できます。
本番環境では、ClickHouseとZooKeeper/Keeperに別のサーバーを使用するか、ClickHouseファイルとKeeperファイルを別のディスクに置くことをお勧めします。ZooKeeper/Keeperはディスクのレイテンシに非常に敏感で、ClickHouseは利用可能なすべてのシステムリソースを利用する可能性があるためです。

エンサンブルにZooKeeperオブザーバーを持つことができますが、ClickHouseサーバーはオブザーバーと相互作用しないべきです。

`minSessionTimeout`設定を変更しないでください。大きな値はClickHouseの再起動の安定性に影響を与える可能性があります。

デフォルト設定では、ZooKeeperはタイムボムです：

> ZooKeeperサーバーはデフォルト設定（`autopurge`を参照）を使用しているときに古いスナップショットおよびログのファイルを削除しないため、これはオペレーターの責任です。

このボムを解除する必要があります。

以下のZooKeeper（3.5.1）構成は、大規模な本番環境で使用されています：

zoo.cfg：

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

Javaバージョン：

```text
openjdk 11.0.5-shenandoah 2019-10-15
OpenJDK Runtime Environment (build 11.0.5-shenandoah+10-adhoc.heretic.src)
OpenJDK 64-Bit Server VM (build 11.0.5-shenandoah+10-adhoc.heretic.src, mixed mode)
```

JVMパラメータ：

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

Saltの初期化：

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

## アンチウイルスソフトウェア {#antivirus-software}

アンチウイルスソフトウェアを使用する場合、ClickHouseデータファイルのフォルダ（`/var/lib/clickhouse`）をスキップするように設定してください。そうでないと、パフォーマンスが低下し、データ取り込みやバックグラウンドマージ中に予期しないエラーが発生する可能性があります。

## 関連コンテンツ {#related-content}

- [ClickHouseを始めたばかりですか？ 13の「致命的な過ち」とそれを回避する方法](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)
