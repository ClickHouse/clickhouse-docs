---
description: 'オープンソース版 ClickHouse の利用に関する推奨事項をまとめたページ'
sidebar_label: 'OSS 利用の推奨事項'
sidebar_position: 58
slug: /operations/tips
title: 'OSS 利用の推奨事項'
doc_type: 'guide'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />

## CPU スケーリングガバナー {#cpu-scaling-governor}

常に `performance` スケーリングガバナーを使用してください。`on-demand` スケーリングガバナーは、常時高負荷のワークロードではパフォーマンスが大きく低下します。

```bash
$ echo 'performance' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
```

## CPU の制限事項 {#cpu-limitations}

プロセッサは過熱する場合があります。CPU のクロック周波数が過熱によって制限されたかどうかを確認するには、`dmesg` を使用します。
この制限はデータセンター側の設定として外部から課されている場合もあります。負荷をかけた状態で監視するには、`turbostat` を使用できます。

## RAM {#ram}

少量のデータ（圧縮後で最大約 200 GB）の場合は、データ量と同程度のメモリを搭載するのが理想的です。
大量のデータを扱い、かつインタラクティブ（オンライン）クエリを処理する場合は、ページキャッシュにホットデータのサブセットが収まるよう、妥当な量の RAM（128 GB 以上）を使用することを推奨します。
1 サーバーあたり約 50 TB のデータ量であっても、128 GB の RAM を使用することで、64 GB と比較してクエリ性能が大幅に向上します。

`overcommit` を無効化しないでください。`cat /proc/sys/vm/overcommit_memory` の値は 0 または 1 である必要があります。次を実行します

```bash
$ echo 0 | sudo tee /proc/sys/vm/overcommit_memory
```

メモリ管理に費やされるカーネル時間を観測するには、`perf top` を使用します。
恒久的なヒュージページを割り当てる必要もありません。

### 16GB 未満の RAM を使用する場合 {#using-less-than-16gb-of-ram}

推奨される RAM 容量は 32 GB 以上です。

システムの RAM が 16 GB 未満の場合、デフォルト設定がこのメモリ容量に合っていないため、さまざまなメモリ関連の例外が発生する可能性があります。少量の RAM（最小で 2 GB）しかないシステムでも ClickHouse を使用できますが、そのような構成では追加のチューニングが必要となり、取り込みレートも低くなります。

16GB 未満の RAM で ClickHouse を使用する場合、次の設定を推奨します:

- `config.xml` 内の mark cache のサイズを小さくします。500 MB まで下げられますが、0 に設定することはできません。
- クエリ処理スレッド数を `1` まで減らします。
- `max_block_size` を `8192` まで下げます。`1024` まで下げても実用的です。
- `max_download_threads` を `1` に下げます。
- `input_format_parallel_parsing` と `output_format_parallel_formatting` を `0` に設定します。
- ログテーブルへの書き込みを無効化します。ログテーブルのマージを行うバックグラウンドのマージタスクが、マージ処理のために RAM を予約し続けるためです。`asynchronous_metric_log`、`metric_log`、`text_log`、`trace_log` を無効化します。

補足事項:

- メモリアロケータによりキャッシュされたメモリを解放するには、`SYSTEM JEMALLOC PURGE`
コマンドを実行します。
- バッファ用に多くのメモリを必要とするため、メモリ量の少ないマシンでは S3 や Kafka との連携機能の使用は推奨しません。

## ストレージサブシステム {#storage-subsystem}

予算が許して SSD を使用できるなら、SSD を使用してください。
そうでなければ HDD を使用してください。7200RPM の SATA HDD で十分です。

ディスクシェルフを接続した少数のサーバーよりも、ローカルハードディスクを搭載した多数のサーバー構成を優先してください。
ただし、滅多にクエリされないアーカイブを保存する用途であれば、ディスクシェルフでも問題ありません。

## RAID {#raid}

HDD を使用する場合は、RAID-10、RAID-5、RAID-6、RAID-50 のいずれかの RAID 構成を組むことができます。
Linux では、ソフトウェア RAID（`mdadm` を使用）が望ましいです。
RAID-10 を作成する際は、`far` レイアウトを選択してください。
予算に余裕がある場合は、RAID-10 を選択してください。

LVM 単体（RAID や `mdadm` なし）での利用は問題ありませんが、LVM で RAID を組んだり、`mdadm` と組み合わせたりする構成はあまり検証されておらず、
チャンクサイズの誤設定、チャンクのアライメントずれ、不適切な RAID タイプの選択、ディスクのクリーンアップ忘れなど、ミスが発生しやすくなります。
LVM の使用に十分自信があるのであれば、利用しても差し支えありません。

ディスクが 4 台を超える場合は、RAID-5 ではなく RAID-6（推奨）か RAID-50 を使用してください。
RAID-5、RAID-6、RAID-50 を使用する場合は、常に `stripe_cache_size` を増やしてください。デフォルト値は通常最適な選択ではありません。

```bash
$ echo 4096 | sudo tee /sys/block/md2/md/stripe_cache_size
```

`2 * num_devices * chunk_size_in_bytes / 4096` という式を使って、デバイス数とブロックサイズから正確な値を算出します。

ほとんどの RAID 構成では、ブロックサイズとして 64 KB で十分です。平均的な clickhouse-server の書き込みサイズはおよそ 1 MB (1024 KB) であり、そのため推奨されるストライプサイズも 1 MB です。RAID アレイ内の非パリティディスクの本数で 1 MB を割った値を設定することで、必要に応じてブロックサイズを最適化できます。このように設定することで、各書き込みが利用可能なすべての非パリティディスクにまたがって並列化されます。
ブロックサイズを小さくしすぎたり、大きくしすぎたりしないでください。

SSD では RAID-0 を使用できます。
RAID を使用するかどうかに関わらず、データ保護のために常にレプリケーションを有効にしてください。

十分に長いキュー長で NCQ を有効にします。HDD には mq-deadline または CFQ スケジューラを、SSD には noop を選択します。`readahead` 設定を減らさないでください。
HDD ではライトキャッシュを有効にします。

OS で NVMe および SSD ディスクに対して [`fstrim`](https://en.wikipedia.org/wiki/Trim_\(computing\)) が有効になっていることを確認してください (通常は cron ジョブまたは systemd サービスとして実装されています)。

## ファイルシステム {#file-system}

Ext4 が最も信頼性の高い選択肢です。マウントオプションとして `noatime` を設定してください。XFS も同様に問題なく動作します。
その他のほとんどのファイルシステムも概ね正常に動作するはずです。

FAT-32 および exFAT はハードリンクをサポートしていないため使用できません。

圧縮ファイルシステムは使用しないでください。ClickHouse 自身が、より優れた方法で圧縮を行うためです。
暗号化ファイルシステムの利用も推奨されません。より優れた ClickHouse の組み込み暗号化機能を利用できます。

ClickHouse は NFS 上でも動作しますが、最適な選択肢とは言えません。

## Linux Kernel {#linux-kernel}

古い Linux カーネルの使用は避けてください。

## ネットワーク {#network}

IPv6 を使用している場合は、ルートキャッシュのサイズを増やしてください。
Linux カーネル 3.2 以前には、IPv6 実装に多くの問題がありました。

可能であれば、少なくとも 10 GB のネットワークを使用してください。1 Gb でも動作しますが、数十テラバイトのデータを持つレプリカへのパッチ適用や、大量の中間データを伴う分散クエリの処理では、性能が大きく低下します。

## ヒュージページ {#huge-pages}

古い Linux カーネルを使用している場合は、Transparent Huge Pages を無効化してください。メモリアロケータと干渉し、著しいパフォーマンス低下を招きます。
より新しい Linux カーネルでは、Transparent Huge Pages を有効にしたままで問題ありません。

```bash
$ echo 'madvise' | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
```

Transparent Huge Pages (THP) の設定を永続的に変更したい場合は、`/etc/default/grub` を編集し、`GRUB_CMDLINE_LINUX_DEFAULT` オプションに `transparent_hugepage=madvise` を追加します。

```bash
$ GRUB_CMDLINE_LINUX_DEFAULT="transparent_hugepage=madvise ..."
```

その後、`sudo update-grub` コマンドを実行し、反映させるためにシステムを再起動してください。

## ハイパーバイザーの構成 {#hypervisor-configuration}

OpenStack を使用している場合は、以下を設定します。

```ini
cpu_mode=host-passthrough
```

`nova.conf` 内で行います。

libvirt を使用している場合は、次を設定します。

```xml
<cpu mode='host-passthrough'/>
```

XML 設定で指定します。

これは、ClickHouse が `cpuid` 命令によって正しい情報を取得できるようにするために重要です。
そうしていない場合、古い CPU モデル上でハイパーバイザーを実行していると `Illegal instruction` エラーによりクラッシュする可能性があります。

## ClickHouse Keeper と ZooKeeper {#zookeeper}

ClickHouse Keeper は、ClickHouse クラスターにおいて ZooKeeper を置き換えることが推奨されます。[ClickHouse Keeper](../guides/sre/keeper/index.md) のドキュメントを参照してください。

ZooKeeper を引き続き使用したい場合は、新しいバージョンの ZooKeeper（3.4.9 以降）を使用するのが最善です。安定版 Linux ディストリビューションに含まれるバージョンは古くなっている可能性があります。

異なる ZooKeeper クラスター間でデータを転送するために、自前のスクリプトを決して使用してはいけません。シーケンシャルノードに対して結果が不正になるためです。同じ理由で &quot;zkcopy&quot; ユーティリティも決して使用しないでください: [https://github.com/ksprojects/zkcopy/issues/15](https://github.com/ksprojects/zkcopy/issues/15)

既存の ZooKeeper クラスターを 2 つに分割したい場合、正しい方法は、まずレプリカ数を増やしてから、それを 2 つの独立したクラスターとして再構成することです。

ClickHouse Keeper は、テスト環境やインジェストレートが低い環境では ClickHouse と同じサーバー上で実行できます。
本番環境では、ClickHouse と ZooKeeper/Keeper 用に別々のサーバーを使用するか、ClickHouse のファイルと Keeper のファイルを別々のディスクに配置することを推奨します。ZooKeeper/Keeper はディスクレイテンシに非常に敏感であり、ClickHouse は利用可能なシステムリソースをすべて使い切る可能性があるためです。

アンサンブル内に ZooKeeper オブザーバーを配置することはできますが、ClickHouse サーバーはオブザーバーと通信してはいけません。

`minSessionTimeout` 設定は変更しないでください。大きな値は ClickHouse の再起動の安定性に影響を与える可能性があります。

デフォルト設定のままでは、ZooKeeper は時限爆弾のようなものです:

> ZooKeeper サーバーは、デフォルト設定のままでは（`autopurge` を参照）、古いスナップショットやログからファイルを削除しません。これはオペレーターの責任となります。

この爆弾は必ず解除しなければなりません。

以下の ZooKeeper (3.5.1) の設定は、大規模な本番環境で使用されているものです。

zoo.cfg:

```bash
# http://hadoop.apache.org/zookeeper/docs/current/zookeeperAdmin.html {#httphadoopapacheorgzookeeperdocscurrentzookeeperadminhtml}

# 各ティックのミリ秒数 {#the-number-of-milliseconds-of-each-tick}
tickTime=2000
# 初期同期フェーズで {#the-number-of-ticks-that-the-initial}
# 許容されるティック数 {#synchronization-phase-can-take}
# この値は十分に検証されていない {#this-value-is-not-quite-motivated}
initLimit=300
# リクエスト送信から確認応答受信までに {#the-number-of-ticks-that-can-pass-between}
# 経過可能なティック数 {#sending-a-request-and-getting-an-acknowledgement}
syncLimit=10

maxClientCnxns=2000

# クライアントが要求でき、サーバーが受け入れる最大値。 {#it-is-the-maximum-value-that-client-may-request-and-the-server-will-accept}
# クライアントが高いセッションタイムアウトで動作できるよう、サーバー側でmaxSessionTimeoutを高く設定しても問題ない。 {#it-is-ok-to-have-high-maxsessiontimeout-on-server-to-allow-clients-to-work-with-high-session-timeout-if-they-want}
# ただし、デフォルトでは30秒のセッションタイムアウトを要求する（ClickHouse設定のsession_timeout_msで変更可能）。 {#but-we-request-session-timeout-of-30-seconds-by-default-you-can-change-it-with-session_timeout_ms-in-clickhouse-config}
maxSessionTimeout=60000000
# スナップショットが保存されるディレクトリ。 {#the-directory-where-the-snapshot-is-stored}
dataDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/data
# パフォーマンス向上のため、dataLogDirは別の物理ディスクに配置すること {#place-the-datalogdir-to-a-separate-physical-disc-for-better-performance}
dataLogDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/logs

autopurge.snapRetainCount=10
autopurge.purgeInterval=1


# シークを回避するため、ZooKeeperはトランザクションログファイル内の領域を {#to-avoid-seeks-zookeeper-allocates-space-in-the-transaction-log-file-in}
# preAllocSizeキロバイト単位のブロックで割り当てる。デフォルトのブロックサイズは64M。 {#blocks-of-preallocsize-kilobytes-the-default-block-size-is-64m-one-reason}
# ブロックサイズを変更する理由の一つは、スナップショットをより頻繁に取得する場合に {#for-changing-the-size-of-the-blocks-is-to-reduce-the-block-size-if-snapshots}
# ブロックサイズを削減することである（snapCountも参照）。 {#are-taken-more-often-also-see-snapcount}
preAllocSize=131072

# クライアントはZooKeeperが処理できる速度よりも速くリクエストを送信できる。 {#clients-can-submit-requests-faster-than-zookeeper-can-process-them}
# 特に多数のクライアントが存在する場合に顕著である。キューに入ったリクエストによって {#especially-if-there-are-a-lot-of-clients-to-prevent-zookeeper-from-running}
# ZooKeeperがメモリ不足に陥るのを防ぐため、ZooKeeperはクライアントをスロットルし、 {#out-of-memory-due-to-queued-requests-zookeeper-will-throttle-clients-so-that}
# システム内の未処理リクエスト数がglobalOutstandingLimitを超えないようにする。 {#there-is-no-more-than-globaloutstandinglimit-outstanding-requests-in-the}
# デフォルトの制限値は1000。 {#system-the-default-limit-is-1000}
# globalOutstandingLimit=1000 {#globaloutstandinglimit1000}

# ZooKeeperはトランザクションをトランザクションログに記録する。snapCount件のトランザクションが {#zookeeper-logs-transactions-to-a-transaction-log-after-snapcount-transactions}
# ログファイルに書き込まれた後、スナップショットが開始され、新しいトランザクションログファイルが {#are-written-to-a-log-file-a-snapshot-is-started-and-a-new-transaction-log-file}
# 開始される。デフォルトのsnapCountは100000。 {#is-started-the-default-snapcount-is-100000}
snapCount=3000000

# このオプションが定義されている場合、リクエストは {#if-this-option-is-defined-requests-will-be-will-logged-to-a-trace-file-named}
# traceFile.year.month.dayという名前のトレースファイルに記録される。 {#tracefileyearmonthday}
#traceFile=

# リーダーはクライアント接続を受け入れる。デフォルト値は"yes"。リーダーマシンは {#leader-accepts-client-connections-default-value-is-yes-the-leader-machine}
# 更新を調整する。読み取りスループットをわずかに犠牲にして更新スループットを向上させるため、 {#coordinates-updates-for-higher-update-throughput-at-thes-slight-expense-of}
# リーダーをクライアント接続を受け入れず調整に専念するよう設定できる。 {#read-throughput-the-leader-can-be-configured-to-not-accept-clients-and-focus}
leaderServes=yes

standaloneEnabled=false
dynamicConfigFile=/etc/zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }}/conf/zoo.cfg.dynamic
```

Java 版:

```text
openjdk 11.0.5-shenandoah 2019-10-15
OpenJDK Runtime Environment (build 11.0.5-shenandoah+10-adhoc.heretic.src)
OpenJDK 64-Bit Server VM (build 11.0.5-shenandoah+10-adhoc.heretic.src, mixed mode)
```

JVM パラメータ:

```bash
NAME=zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }}
ZOOCFGDIR=/etc/$NAME/conf

# TODO this is really ugly {#on-coordination}
# How to find out, which jars are needed? {#todo-this-is-really-ugly}
# seems, that log4j requires the log4j.properties file to be in the classpath {#how-to-find-out-which-jars-are-needed}
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

ソルトの初期化

```text
description "zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }} 集中コーディネーションサービス"

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

アンチウイルスソフトウェアを使用している場合は、ClickHouse のデータファイル（`/var/lib/clickhouse`）が格納されているディレクトリをスキャン対象から除外するように設定してください。そうしない場合、パフォーマンスが低下し、データのインジェストやバックグラウンドマージ中に予期しないエラーが発生する可能性があります。

## 関連コンテンツ {#related-content}

- [ClickHouse を使い始めるときの 13 の「大罪」とその回避方法](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)