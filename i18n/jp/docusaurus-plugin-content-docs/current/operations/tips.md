---
description: 'オープンソース版 ClickHouse の利用に関する推奨事項をまとめたページ'
sidebar_label: 'OSS 利用に関する推奨事項'
sidebar_position: 58
slug: /operations/tips
title: 'OSS 利用に関する推奨事項'
doc_type: 'guide'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_automated.md';

<SelfManaged />


## CPUスケーリングガバナー {#cpu-scaling-governor}

常に`performance`スケーリングガバナーを使用してください。`on-demand`スケーリングガバナーは、継続的に高負荷がかかる環境では性能が著しく低下します。

```bash
$ echo 'performance' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
```


## CPU制限 {#cpu-limitations}

プロセッサは過熱する可能性があります。過熱によってCPUのクロックレートが制限されているかどうかを確認するには、`dmesg`を使用してください。
この制限はデータセンターレベルで外部から設定されることもあります。負荷がかかっている状態での監視には`turbostat`を使用できます。


## RAM {#ram}

少量のデータ（圧縮後で最大約200 GB）の場合、データ量と同程度のメモリを使用するのが最適です。
大量のデータを扱う場合、およびインタラクティブ（オンライン）クエリを処理する場合は、ホットデータサブセットがページキャッシュに収まるよう、適切な量のRAM（128 GB以上）を使用してください。
サーバーあたり約50 TBのデータ量であっても、128 GBのRAMを使用することで、64 GBと比較してクエリパフォーマンスが大幅に向上します。

オーバーコミットを無効にしないでください。`cat /proc/sys/vm/overcommit_memory`の値は0または1である必要があります。次のコマンドを実行してください。

```bash
$ echo 0 | sudo tee /proc/sys/vm/overcommit_memory
```

`perf top`を使用して、カーネルがメモリ管理に費やす時間を監視してください。
永続的なヒュージページを割り当てる必要もありません。

### 16GB未満のRAMを使用する場合 {#using-less-than-16gb-of-ram}

推奨されるRAM容量は32 GB以上です。

システムのRAMが16 GB未満の場合、デフォルト設定がこのメモリ量に適合していないため、さまざまなメモリ例外が発生する可能性があります。少量のRAM（最小2 GB）を搭載したシステムでClickHouseを使用することは可能ですが、これらの構成には追加のチューニングが必要であり、低速でのデータ取り込みしか行えません。

16GB未満のRAMでClickHouseを使用する場合、以下を推奨します：

- `config.xml`でマークキャッシュのサイズを削減してください。最小500 MBまで設定できますが、ゼロには設定できません。
- クエリ処理スレッド数を`1`まで削減してください。
- `max_block_size`を`8192`まで削減してください。`1024`程度の値でも実用的です。
- `max_download_threads`を`1`まで削減してください。
- `input_format_parallel_parsing`と`output_format_parallel_formatting`を`0`に設定してください。
- ログテーブルへの書き込みを無効にしてください。これにより、バックグラウンドマージタスクがログテーブルのマージを実行するためにRAMを確保し続けることを防ぎます。`asynchronous_metric_log`、`metric_log`、`text_log`、`trace_log`を無効にしてください。

追加の注意事項：

- メモリアロケータによってキャッシュされたメモリをフラッシュするには、`SYSTEM JEMALLOC PURGE`コマンドを実行できます。
- 低メモリマシンでS3またはKafka統合を使用することは推奨しません。これらはバッファ用に大量のメモリを必要とするためです。


## ストレージサブシステム {#storage-subsystem}

予算が許すのであれば、SSDを使用してください。
そうでない場合は、HDDを使用してください。SATA HDD 7200 RPMで十分です。

ディスクシェルフを接続した少数のサーバーよりも、ローカルハードドライブを搭載した多数のサーバーを優先してください。
ただし、クエリ頻度の低いアーカイブの保存には、シェルフも有効です。


## RAID {#raid}

HDDを使用する場合、RAID-10、RAID-5、RAID-6、またはRAID-50を構成できます。
Linuxの場合、ソフトウェアRAID（`mdadm`を使用）を推奨します。
RAID-10を作成する際は、`far`レイアウトを選択してください。
予算が許す場合は、RAID-10を選択してください。

LVM単体（RAIDや`mdadm`なし)の使用は問題ありませんが、LVMでRAIDを構築したり`mdadm`と組み合わせたりすることは、十分に検証されていない選択肢であり、誤り(誤ったチャンクサイズの選択、チャンクの不整合、誤ったRAIDタイプの選択、ディスクのクリーンアップ忘れ)が発生する可能性が高くなります。LVMの使用に自信がある場合は、使用しても問題ありません。

4台以上のディスクがある場合は、RAID-5ではなくRAID-6(推奨)またはRAID-50を使用してください。
RAID-5、RAID-6、またはRAID-50を使用する場合は、デフォルト値が通常最適ではないため、必ずstripe_cache_sizeを増やしてください。

```bash
$ echo 4096 | sudo tee /sys/block/md2/md/stripe_cache_size
```

デバイス数とブロックサイズから、次の式を使用して正確な数値を計算してください:`2 * num_devices * chunk_size_in_bytes / 4096`。

ほとんどのRAID構成では、64 KBのブロックサイズで十分です。clickhouse-serverの平均書き込みサイズは約1 MB(1024 KB)であるため、推奨されるストライプサイズも1 MBです。必要に応じて、ブロックサイズを1 MBをRAIDアレイ内の非パリティディスク数で割った値に設定することで最適化でき、各書き込みが利用可能なすべての非パリティディスクに並列化されます。
ブロックサイズを小さすぎたり大きすぎたりしないように設定してください。

SSDではRAID-0を使用できます。
RAIDの使用に関わらず、データセキュリティのために常にレプリケーションを使用してください。

長いキューでNCQを有効にしてください。HDDの場合はmq-deadlineまたはCFQスケジューラを選択し、SSDの場合はnoopを選択してください。'readahead'設定を減らさないでください。
HDDの場合は、ライトキャッシュを有効にしてください。

OS内のNVMEおよびSSDディスクに対して[`fstrim`](<https://en.wikipedia.org/wiki/Trim_(computing)>)が有効になっていることを確認してください(通常、cronjobまたはsystemdサービスを使用して実装されています)。


## ファイルシステム {#file-system}

Ext4が最も信頼性の高い選択肢です。マウントオプションに`noatime`を設定してください。XFSも良好に動作します。
その他のほとんどのファイルシステムも問題なく動作するはずです。

FAT-32とexFATはハードリンクに対応していないため、サポートされていません。

圧縮ファイルシステムは使用しないでください。ClickHouseは独自により優れた圧縮を行います。
暗号化ファイルシステムの使用は推奨されません。ClickHouseの組み込み暗号化機能を使用する方が優れています。

ClickHouseはNFS上でも動作可能ですが、推奨されません。


## Linuxカーネル {#linux-kernel}

古いLinuxカーネルは使用しないでください。


## ネットワーク {#network}

IPv6を使用している場合は、ルートキャッシュのサイズを増やしてください。
3.2より前のLinuxカーネルには、IPv6実装に関する多数の問題がありました。

可能であれば、少なくとも10 GBのネットワークを使用してください。1 Gbでも動作しますが、数十テラバイトのデータを持つレプリカのパッチ適用や、大量の中間データを伴う分散クエリの処理では、パフォーマンスが大幅に低下します。


## Huge Pages {#huge-pages}

古いLinuxカーネルを使用している場合は、transparent huge pagesを無効にしてください。メモリアロケータと干渉し、パフォーマンスが大幅に低下する原因となります。
新しいLinuxカーネルでは、transparent huge pagesは問題ありません。

```bash
$ echo 'madvise' | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
```

transparent huge pagesの設定を恒久的に変更する場合は、`/etc/default/grub`を編集して`GRUB_CMDLINE_LINUX_DEFAULT`オプションに`transparent_hugepage=madvise`を追加します:

```bash
$ GRUB_CMDLINE_LINUX_DEFAULT="transparent_hugepage=madvise ..."
```

その後、`sudo update-grub`コマンドを実行してから再起動し、設定を反映させてください。


## ハイパーバイザーの設定 {#hypervisor-configuration}

OpenStackを使用している場合は、`nova.conf`に以下を設定してください。

```ini
cpu_mode=host-passthrough
```

libvirtを使用している場合は、XML設定ファイルに以下を設定してください。

```xml
<cpu mode='host-passthrough'/>
```

この設定は、ClickHouseが`cpuid`命令で正確な情報を取得するために重要です。
設定しない場合、古いCPUモデル上でハイパーバイザーを実行すると`Illegal instruction`クラッシュが発生する可能性があります。


## ClickHouse KeeperとZooKeeper {#zookeeper}

ClickHouseクラスタではZooKeeperの代わりにClickHouse Keeperの使用を推奨します。[ClickHouse Keeper](../guides/sre/keeper/index.md)のドキュメントを参照してください。

ZooKeeperを引き続き使用する場合は、ZooKeeperの最新バージョン(3.4.9以降)を使用することを推奨します。安定版Linuxディストリビューションに含まれるバージョンは古い可能性があります。

異なるZooKeeperクラスタ間でデータを転送するために手動で作成したスクリプトを使用しないでください。シーケンシャルノードに対して正しくない結果となるためです。同じ理由で「zkcopy」ユーティリティも使用しないでください: https://github.com/ksprojects/zkcopy/issues/15

既存のZooKeeperクラスタを2つに分割する場合、正しい方法はレプリカ数を増やしてから、2つの独立したクラスタとして再構成することです。

テスト環境や取り込み速度が低い環境では、ClickHouse KeeperをClickHouseと同じサーバー上で実行できます。
本番環境では、ClickHouseとZooKeeper/Keeperに別々のサーバーを使用するか、ClickHouseのファイルとKeeperのファイルを別々のディスクに配置することを推奨します。ZooKeeper/Keeperはディスクレイテンシに非常に敏感であり、ClickHouseは利用可能なすべてのシステムリソースを使用する可能性があるためです。

アンサンブル内にZooKeeperオブザーバーを配置できますが、ClickHouseサーバーはオブザーバーと通信すべきではありません。

`minSessionTimeout`設定を変更しないでください。大きな値はClickHouseの再起動の安定性に影響を与える可能性があります。

デフォルト設定では、ZooKeeperは時限爆弾です:

> ZooKeeperサーバーはデフォルト設定を使用している場合、古いスナップショットとログのファイルを削除しません(`autopurge`を参照)。これは運用者の責任です。

この爆弾は解除する必要があります。

以下のZooKeeper(3.5.1)設定は、大規模な本番環境で使用されています:

zoo.cfg:


```bash
# http://hadoop.apache.org/zookeeper/docs/current/zookeeperAdmin.html
```


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



# クライアントが要求可能で、サーバーが受け入れる最大値です。

# クライアントが必要に応じて長いセッションタイムアウトで動作できるように、サーバー上でmaxSessionTimeoutを高く設定しても問題ありません。

# ただし、デフォルトでは30秒のセッションタイムアウトを要求します(ClickHouse設定のsession_timeout_msで変更できます)。

maxSessionTimeout=60000000

# スナップショットが保存されるディレクトリ。

dataDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/data

# パフォーマンス向上のため、dataLogDirは別の物理ディスクに配置してください。

dataLogDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/logs

autopurge.snapRetainCount=10
autopurge.purgeInterval=1


# シークを回避するために、ZooKeeper はトランザクションログファイル内の領域を
# preAllocSize キロバイト単位のブロックで事前確保します。デフォルトのブロックサイズは 64M です。
# ブロックサイズを変更する理由の 1 つとして、スナップショットをより頻繁に取得する場合に
# ブロックサイズを小さくすることが挙げられます（snapCount も参照）。
preAllocSize=131072



# Clients can submit requests faster than ZooKeeper can process them,
# especially if there are a lot of clients. To prevent ZooKeeper from running
# out of memory due to queued requests, ZooKeeper will throttle clients so that
# there is no more than globalOutstandingLimit outstanding requests in the
# system. The default limit is 1000.
# globalOutstandingLimit=1000



# ZooKeeper はトランザクションをトランザクションログに記録します。snapCount 件のトランザクションが
# ログファイルに書き込まれるとスナップショット処理が開始され、新しいトランザクションログファイルが
# 作成されます。snapCount のデフォルト値は 100000 です。
snapCount=3000000



# If this option is defined, requests will be will logged to a trace file named
# traceFile.year.month.day.
#traceFile=



# リーダーはクライアント接続を受け付けます。デフォルト値は "yes" です。リーダーマシンは

# 更新を調整します。読み取りスループットをわずかに犠牲にして更新スループットを向上させるため、

# リーダーをクライアントを受け付けないように設定し、調整に専念させることができます。

leaderServes=yes

standaloneEnabled=false
dynamicConfigFile=/etc/zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }}/conf/zoo.cfg.dynamic

````

Javaバージョン:

```text
openjdk 11.0.5-shenandoah 2019-10-15
OpenJDK Runtime Environment (build 11.0.5-shenandoah+10-adhoc.heretic.src)
OpenJDK 64-Bit Server VM (build 11.0.5-shenandoah+10-adhoc.heretic.src, mixed mode)
````

JVMパラメータ:

```bash
NAME=zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }}
ZOOCFGDIR=/etc/$NAME/conf

```


# TODO これは本当にひどい
# どの jar が必要かをどうやって特定する？
# log4j は、log4j.properties ファイルがクラスパス上に存在する必要があるようだ
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


## アンチウイルスソフトウェア {#antivirus-software}

アンチウイルスソフトウェアを使用する場合は、ClickHouseのデータファイルが格納されているフォルダ（`/var/lib/clickhouse`）をスキャン対象から除外するように設定してください。除外しない場合、パフォーマンスが低下したり、データ取り込みやバックグラウンドマージ中に予期しないエラーが発生したりする可能性があります。


## 関連コンテンツ {#related-content}

- [ClickHouse を始める方へ：13 の「致命的な過ち」とその回避方法](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)
