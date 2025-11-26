---
description: 'オープンソース版 ClickHouse の利用に関する推奨事項を説明するページ'
sidebar_label: 'OSS 利用に関する推奨事項'
sidebar_position: 58
slug: /operations/tips
title: 'OSS 利用に関する推奨事項'
doc_type: 'guide'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_automated.md';

<SelfManaged />


## CPU スケーリングガバナー

常に `performance` スケーリングガバナーを使用してください。`on-demand` スケーリングガバナーは、常時高負荷のワークロードではパフォーマンスが大きく低下します。

```bash
$ echo 'performance' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
```


## CPU の制限 {#cpu-limitations}

プロセッサは過熱することがあります。`dmesg` を使用して、CPU のクロック周波数が過熱によって制限されていないか確認します。
この制限は、データセンター側の設定によって外部的に課されている場合もあります。`turbostat` を使用すると、負荷をかけた状態でこれを監視できます。



## RAM

少量のデータ（圧縮後で最大約 200 GB）であれば、データ量に匹敵する容量のメモリを使用するのが最適です。
大量のデータを扱い、かつ対話的（オンライン）クエリを処理する場合は、ページキャッシュにホットデータのサブセットが収まるよう、十分な量の RAM（128 GB 以上）を使用する必要があります。
1 サーバーあたり約 50 TB のデータ量であっても、64 GB と比べて 128 GB の RAM を使用することでクエリ性能が大幅に向上します。

overcommit を無効にしないでください。`cat /proc/sys/vm/overcommit_memory` の値は 0 または 1 である必要があります。次を実行してください

```bash
$ echo 0 | sudo tee /proc/sys/vm/overcommit_memory
```

`perf top` を使用して、メモリ管理においてカーネルで消費されている時間を監視します。
Permanent huge pages も新たに割り当てる必要はありません。

### 16GB 未満の RAM を使用する場合

推奨される RAM 容量は 32 GB 以上です。

システムの RAM が 16 GB 未満の場合、デフォルト設定がこのメモリ量に適合していないため、さまざまなメモリ例外が発生する可能性があります。少量の RAM（最小で 2 GB）しかないシステムでも ClickHouse を使用できますが、そのような構成では追加のチューニングが必要となり、取り込みレートも低くなります。

16GB 未満の RAM で ClickHouse を使用する場合は、次の設定を推奨します:

* `config.xml` 内の mark cache のサイズを小さくします。最小で 500 MB まで設定できますが、ゼロにすることはできません。
* クエリ処理スレッド数を `1` に減らします。
* `max_block_size` を `8192` に下げます。`1024` まで小さくしても実用的です。
* `max_download_threads` を `1` に下げます。
* `input_format_parallel_parsing` と `output_format_parallel_formatting` を `0` に設定します。
* ログテーブルへの書き込みを無効にします。これは、ログテーブルをマージするバックグラウンドマージタスクが、そのための RAM を予約し続けるためです。`asynchronous_metric_log`、`metric_log`、`text_log`、`trace_log` を無効にします。

補足事項:

* メモリアロケータによってキャッシュされたメモリを解放（フラッシュ）するには、`SYSTEM JEMALLOC PURGE` コマンドを実行できます。
* バッファ用に大量のメモリを必要とするため、メモリが少ないマシンでの S3 や Kafka との統合機能の利用は推奨しません。


## ストレージサブシステム {#storage-subsystem}

予算が許すのであれば、SSD を使用してください。
そうでなければ HDD を使用してください。SATA HDD の 7200 RPM で十分です。

ディスクシェルフに接続された少数のサーバーよりも、ローカルハードディスクを搭載した多数のサーバーを優先してください。
ただし、まれにしかクエリされないアーカイブを保存する用途であれば、ディスクシェルフでも問題ありません。



## RAID

HDD を使用する場合は、RAID-10、RAID-5、RAID-6、RAID-50 のいずれか（または組み合わせ）を構成できます。
Linux では、ソフトウェア RAID（`mdadm` を使用）が望ましいです。
RAID-10 を作成する際は、`far` レイアウトを選択してください。
予算が許すのであれば、RAID-10 を選択してください。

LVM 単体（RAID や `mdadm` なし）での使用は問題ありませんが、LVM で RAID を構成したり、`mdadm` と組み合わせたりする方法はあまり検証されておらず、
（不適切なチャンクサイズの選択、チャンクのアライメント不良、不適切な RAID タイプの選択、ディスクのクリーンアップ忘れなど）
ミスが発生する可能性が高くなります。LVM の利用に十分自信がある場合は、LVM を使用しても問題ありません。

ディスクが 4 本を超える場合は、RAID-5 ではなく RAID-6（推奨）または RAID-50 を使用してください。
RAID-5、RAID-6、RAID-50 を使用する場合は、常に stripe&#95;cache&#95;size を増やしてください。デフォルト値は最適でないことが多いためです。

```bash
$ echo 4096 | sudo tee /sys/block/md2/md/stripe_cache_size
```

デバイス数とブロックサイズから、次の式を使って正確な数値を計算します: `2 * num_devices * chunk_size_in_bytes / 4096`。

ほとんどの RAID 構成では、64 KB のブロックサイズで十分です。平均的な clickhouse-server の書き込みサイズはおよそ 1 MB (1024 KB) のため、推奨されるストライプサイズも 1 MB です。ブロックサイズは、必要に応じて RAID アレイ内の非パリティディスク数で 1 MB を割った値に設定することで最適化できます。これにより、各書き込みが利用可能なすべての非パリティディスクにまたがって並列化されます。
ブロックサイズを小さすぎたり大きすぎたりしないようにしてください。

SSD では RAID-0 を使用できます。
RAID の有無にかかわらず、データセキュリティのために常にレプリケーションを使用してください。

NCQ を有効にし、キュー深度を大きく設定します。HDD では mq-deadline または CFQ スケジューラを、SSD では noop を選択します。「readahead」設定は減らさないでください。
HDD では書き込みキャッシュを有効にします。

OS 上で NVMe および SSD ディスクに対して [`fstrim`](https://en.wikipedia.org/wiki/Trim_\(computing\)) が有効になっていることを確認します (通常は cron ジョブまたは systemd サービスを使用して実装されています)。


## ファイルシステム {#file-system}

Ext4 が最も信頼性の高い選択肢です。マウントオプションとして `noatime` を設定してください。XFS も同様に問題なく動作します。
ほとんどの他のファイルシステムも問題なく動作するはずです。

FAT-32 と exFAT はハードリンクをサポートしていないため、サポート対象外です。

圧縮ファイルシステムは使用しないでください。ClickHouse 自身がより優れた圧縮を行います。
暗号化ファイルシステムの使用も推奨されません。ClickHouse の組み込み暗号化機能を使用でき、その方が優れているためです。

ClickHouse は NFS 上でも動作しますが、最適な選択肢とは言えません。



## Linux Kernel {#linux-kernel}

古いバージョンの Linux カーネルは使用しないでください。



## ネットワーク {#network}

IPv6 を使用している場合は、ルートキャッシュのサイズを増やしてください。
Linux カーネル 3.2 以前には、IPv6 実装に多くの問題がありました。

可能であれば、少なくとも 10 Gbps クラスのネットワークを使用してください。1 Gbps でも動作しますが、数十テラバイトのデータを持つレプリカへのパッチ適用や、大量の中間データを伴う分散クエリの処理では、性能が大きく低下します。



## ヒュージページ

古い Linux カーネルを使用している場合は、Transparent Huge Pages を無効にしてください。メモリアロケータと干渉し、その結果として大きなパフォーマンス低下を引き起こします。
新しい Linux カーネルでは、Transparent Huge Pages を有効にしたままで問題ありません。

```bash
$ echo 'madvise' | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
```

Transparent Huge Pages の設定を永続的に変更したい場合は、`/etc/default/grub` を編集し、`GRUB_CMDLINE_LINUX_DEFAULT` オプションに `transparent_hugepage=madvise` を追加します。

```bash
$ GRUB_CMDLINE_LINUX_DEFAULT="transparent_hugepage=madvise ..."
```

その後、`sudo update-grub` コマンドを実行し、再起動して変更を反映させます。


## ハイパーバイザーの設定

OpenStack を使用している場合は、次を設定してください

```ini
cpu_mode=host-passthrough
```

`nova.conf` 内で。

libvirt を使用している場合は、以下を設定します。

```xml
<cpu mode='host-passthrough'/>
```

これは XML 設定内で行います。

これは、ClickHouse が `cpuid` 命令を使って正しい情報を取得できるようにするために重要です。
そうしないと、ハイパーバイザーが古い CPU モデル上で動作している場合に `Illegal instruction` が原因でクラッシュすることがあります。


## ClickHouse Keeper と ZooKeeper {#zookeeper}

ClickHouse Keeper は、ClickHouse クラスターで ZooKeeper を置き換えることが推奨されています。[ClickHouse Keeper](../guides/sre/keeper/index.md) のドキュメントを参照してください。

ZooKeeper の利用を継続したい場合は、新しいバージョンの ZooKeeper（3.4.9 以降）を使用するのが最善です。安定版 Linux ディストリビューションに含まれているバージョンは古い可能性があります。

異なる ZooKeeper クラスター間でデータを転送するために手書きのスクリプトを使用してはいけません。シーケンシャルノードに対して結果が不正になるためです。同じ理由で、"zkcopy" ユーティリティも決して使用しないでください: https://github.com/ksprojects/zkcopy/issues/15

既存の ZooKeeper クラスターを 2 つに分割したい場合、正しい方法はレプリカ数を増やし、その後 2 つの独立したクラスターとして再設定することです。

ClickHouse Keeper は、テスト環境やインジェスト率が低い環境では ClickHouse と同じサーバー上で実行できます。
本番環境では、ClickHouse と ZooKeeper/Keeper 用に別々のサーバーを使用するか、ClickHouse のファイルと Keeper のファイルを別々のディスクに配置することを推奨します。ZooKeeper/Keeper はディスクレイテンシに非常に敏感であり、ClickHouse は利用可能なシステムリソースをすべて使い切る可能性があるためです。

ZooKeeper のアンサンブルに observer を含めることはできますが、ClickHouse サーバーは observer と通信してはいけません。

`minSessionTimeout` 設定を変更しないでください。値を大きくすると、ClickHouse の再起動の安定性に影響する可能性があります。

デフォルト設定のままでは、ZooKeeper は時限爆弾です:

> デフォルト設定を使用している場合（`autopurge` を参照）、ZooKeeper サーバーは古いスナップショットとログのファイルを削除せず、その管理はオペレーターの責任となります。

この爆弾は必ず解除する必要があります。

以下の ZooKeeper (3.5.1) の設定は、大規模な本番環境で使用されているものです:

zoo.cfg:



```bash
# http://hadoop.apache.org/zookeeper/docs/current/zookeeperAdmin.html
```


# 各ティックの長さ（ミリ秒）
tickTime=2000
# 初期同期フェーズに許容される
# ティック数
# この値にはあまり明確な根拠はない
initLimit=300
# リクエスト送信から
# 応答の受信までに経過してよいティック数
syncLimit=10

maxClientCnxns=2000



# クライアントが要求可能で、サーバーが受け入れる最大値です。

# クライアントが必要に応じて長いセッションタイムアウトで動作できるよう、サーバー上でmaxSessionTimeoutを高く設定しても問題ありません。

# ただし、デフォルトでは30秒のセッションタイムアウトを要求します(ClickHouse設定のsession_timeout_msで変更できます)。

maxSessionTimeout=60000000

# スナップショットが保存されるディレクトリ。

dataDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/data

# パフォーマンス向上のため、dataLogDirは別の物理ディスクに配置してください。

dataLogDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/logs

autopurge.snapRetainCount=10
autopurge.purgeInterval=1


# シークを回避するために、ZooKeeper はトランザクションログファイル内の領域を
# preAllocSize キロバイト単位のブロックで事前割り当てします。デフォルトのブロックサイズは 64M です。
# ブロックサイズを変更する理由の 1 つは、スナップショットをより頻繁に取得する場合に
# ブロックサイズを小さくすることです（snapCount も参照してください）。
preAllocSize=131072



# Clients can submit requests faster than ZooKeeper can process them,
# especially if there are a lot of clients. To prevent ZooKeeper from running
# out of memory due to queued requests, ZooKeeper will throttle clients so that
# there is no more than globalOutstandingLimit outstanding requests in the
# system. The default limit is 1000.
# globalOutstandingLimit=1000



# ZooKeeper はトランザクションをトランザクションログに記録します。snapCount 件の
# トランザクションがログファイルに書き込まれるとスナップショットの取得が開始され、
# 新しいトランザクションログファイルが作成されます。デフォルトの snapCount は 100000 です。
snapCount=3000000



# このオプションを指定すると、リクエストは traceFile.year.month.day という名前のトレースファイルにログ出力されます。
# traceFile.year.month.day.
#traceFile=



# リーダーはクライアント接続を受け付けます。デフォルト値は "yes" です。リーダーマシンは

# 更新を調整します。読み取りスループットをわずかに犠牲にして更新スループットを高めるために、

# リーダーをクライアント接続を受け付けないように設定し、調整処理に専念させることができます。

leaderServes=yes

standaloneEnabled=false
dynamicConfigFile=/etc/zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }}/conf/zoo.cfg.dynamic

````

Java バージョン:

```text
openjdk 11.0.5-shenandoah 2019-10-15
OpenJDK Runtime Environment (build 11.0.5-shenandoah+10-adhoc.heretic.src)
OpenJDK 64-Bit Server VM (build 11.0.5-shenandoah+10-adhoc.heretic.src, mixed mode)
````

JVM パラメータ:

```bash
NAME=zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }}
ZOOCFGDIR=/etc/$NAME/conf

```


# TODO これは本当にひどい
# どの JAR が必要なのか、どうやって調べればいい？
# log4j は log4j.properties ファイルがクラスパス上にある必要があるようだ
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

````

Salt initialization:

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
````


## ウイルス対策ソフトウェア {#antivirus-software}

ウイルス対策ソフトウェアを使用している場合は、ClickHouse のデータファイル（`/var/lib/clickhouse`）が格納されているディレクトリをスキャン対象から除外するように設定してください。そうしないとパフォーマンスが低下し、データのインジェストやバックグラウンドマージの際に予期しないエラーが発生する可能性があります。



## 関連コンテンツ {#related-content}

- [ClickHouse の利用を始めたばかりですか？避けるべき 13 の「致命的な落とし穴」](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)
