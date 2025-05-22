---
'description': 'Documentation for http://hadoop.apache.org/zookeeper/docs/current/zookeeperAdmin.html'
'sidebar_label': 'Usage Recommendations'
'sidebar_position': 58
'slug': '/operations/tips'
'title': 'Usage Recommendations'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />

## CPU スケーリングガバナー {#cpu-scaling-governor}

常に `performance` スケーリングガバナーを使用してください。`on-demand` スケーリングガバナーは、常に高い需要に対しては効果が薄くなります。

```bash
$ echo 'performance' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
```

## CPU 制限事項 {#cpu-limitations}

プロセッサは過熱する可能性があります。`dmesg`を使用して、CPUのクロックレートが過熱のために制限されていたかどうかを確認してください。
この制限は、データセンターのレベルで外部的に設定されることもあります。ロード下での監視には `turbostat` を使用できます。

## RAM {#ram}

小規模なデータ（圧縮された状態で最大約200 GB）には、データのボリュームと同じだけのメモリを使用するのが最適です。
大規模なデータやインタラクティブ（オンライン）クエリを処理する際には、ホットデータのサブセットがページのキャッシュに収まるように、合理的な量のRAM（128 GB以上）を使用する必要があります。
1台のサーバーあたり約50 TBのデータボリュームでも、128 GBのRAMを使用することで、64 GBに比べてクエリパフォーマンスが大幅に向上します。

オーバーコミットは無効にしないでください。値 `cat /proc/sys/vm/overcommit_memory` は0または1にする必要があります。次のコマンドを実行してください。

```bash
$ echo 0 | sudo tee /proc/sys/vm/overcommit_memory
```

`perf top`を使用して、メモリ管理にかかるカーネルでの時間を観察してください。
恒久的な巨大ページも割り当てる必要はありません。

### 16GB未満のRAMを使用する場合 {#using-less-than-16gb-of-ram}

推奨されるRAMの量は32 GB以上です。

システムのRAMが16 GB未満の場合、デフォルト設定がこのメモリ量に適合していないため、さまざまなメモリエラーが発生する可能性があります。RAMが少ない（最低2 GBまで）システムでClickHouseを使用できますが、これらのセットアップには追加の調整が必要で、低いレートでのみデータを取り込むことができます。

16GB未満のRAMでClickHouseを使用する場合、次の推奨事項があります：

- `config.xml`内のマークキャッシュサイズを小さくします。最低500 MBに設定できますが、ゼロに設定することはできません。
- クエリ処理スレッドの数を`1`に減らします。
- `max_block_size`を`8192`に低くします。`1024`のように小さくても、実用的な場合があります。
- `max_download_threads`を`1`に低くします。
- `input_format_parallel_parsing`と`output_format_parallel_formatting`を`0`に設定します。

追加の注意事項：
- メモリアロケーターによってキャッシュされたメモリをフラッシュするには、`SYSTEM JEMALLOC PURGE`コマンドを実行できます。
- メモリが少ないマシンでのS3またはKafka統合の使用は推奨されません。これらはバッファにかなりのメモリを必要とします。

## ストレージサブシステム {#storage-subsystem}

予算が許すのであればSSDを使用してください。
そうでない場合はHDDを使用します。7200 RPMのSATA HDDで問題ありません。

接続されたディスクシェルフを持つ少数のサーバーよりも、ローカルハードドライブを持つ多数のサーバーを優先してください。
ただし、稀なクエリのためのアーカイブストレージには、ディスクシェルフが機能します。

## RAID {#raid}

HDDを使用する場合、RAID-10、RAID-5、RAID-6またはRAID-50を組み合わせることができます。
Linuxの場合、ソフトウェアRAID（`mdadm`を使用）がより良いです。 
RAID-10を作成するときは、`far`レイアウトを選択してください。
予算が許すのであれば、RAID-10を選択してください。

LVM単体（RAIDや`mdadm`なし）は問題ありませんが、それを使ったRAIDを作成したり、`mdadm`と組み合わせたりする場合はあまり探索されていないオプションで、ミスの可能性が高まります
（不適切なチャンクサイズの選択、チャンクの不整合、間違ったRAIDタイプの選択、ディスクのクリーンアップを忘れるなど）。LVMの使用に自信がある場合は、使っても構いません。

4つ以上のディスクを持っている場合は、RAID-5の代わりにRAID-6（推奨）またはRAID-50を使用してください。
RAID-5、RAID-6またはRAID-50を使用する場合は、常にstripe_cache_sizeを増加させてください。デフォルト値は通常最良の選択ではありません。

```bash
$ echo 4096 | sudo tee /sys/block/md2/md/stripe_cache_size
```

デバイスの数とブロックサイズから正確な数を計算するには、次の式を使用します：`2 * num_devices * chunk_size_in_bytes / 4096`。

64 KBのブロックサイズは、ほとんどのRAID構成に十分です。平均的なclickhouse-serverの書き込みサイズは約1 MB（1024 KB）であり、したがって推奨されるstripeサイズも1 MBです。必要に応じてブロックサイズを最適化できます。RAIDアレイ内の冗長性のないディスクの数で割った1 MBに設定することで、各書き込みがすべての利用可能な冗長性のないディスクに並行して行われるようにします。
ブロックサイズを小さくしすぎたり大きくしすぎたりしないでください。

SSDでRAID-0を使用することができます。
RAIDを使用しても、常にデータのセキュリティのためにレプリケーションを使用してください。

長いキューでNCQを有効にします。HDDの場合、mq-deadlineまたはCFQスケジューラを選択し、SSDの場合はnoopを選択してください。 'readahead'設定を減少させないでください。
HDDの場合、書き込みキャッシュを有効にしてください。

OSでNVMEおよびSSDディスクに対して [`fstrim`](https://en.wikipedia.org/wiki/Trim_(computing)) が有効になっていることを確認してください（通常はcronjobまたはsystemdサービスを使用して実装されています）。

## ファイルシステム {#file-system}

Ext4は最も信頼性の高い選択肢です。マウントオプションとして`noatime`を設定します。XFSも良好に機能します。
他のほとんどのファイルシステムも問題なく動作するはずです。

FAT-32およびexFATはハードリンクがサポートされていないため、使用できません。

ClickHouseは独自に圧縮を行うため、圧縮ファイルシステムは使用しないでください。また、ClickHouseでは組み込みの暗号化機能を使用できるため、暗号化ファイルシステムの使用は推奨されません。

ClickHouseはNFS経由で機能しますが、最良のアイデアではありません。

## Linux カーネル {#linux-kernel}

古いLinuxカーネルを使用しないでください。

## ネットワーク {#network}

IPv6を使用している場合、ルートキャッシュのサイズを増やしてください。
3.2以前のLinuxカーネルは、IPv6の実装に多くの問題を抱えていました。

可能であれば、少なくとも10 GBのネットワークを使用してください。1 Gbも動作しますが、数十テラバイトのデータを持つレプリカのパッチ処理や、大量の中間データを処理する分散クエリには非常に劣るでしょう。

## 巨大ページ {#huge-pages}

古いLinuxカーネルを使用している場合は、透過的巨大ページを無効にしてください。これはメモリアロケーターに干渉し、パフォーマンスの著しい低下を引き起こします。
新しいLinuxカーネルでは透過的巨大ページは問題ありません。

```bash
$ echo 'madvise' | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
```

透過的巨大ページ設定を永続的に変更する場合は、`/etc/default/grub`を編集して`GRUB_CMDLINE_LINUX_DEFAULT`オプションに`transparent_hugepage=madvise`を追加します：

```bash
$ GRUB_CMDLINE_LINUX_DEFAULT="transparent_hugepage=madvise ..."
```

その後、`sudo update-grub`コマンドを実行し、効果を発揮させるために再起動してください。

## ハイパーバイザ設定 {#hypervisor-configuration}

OpenStackを使用している場合は、`nova.conf`に次のように設定します。
```ini
cpu_mode=host-passthrough
```

libvirtを使用している場合は、XML設定内に次のように設定します。
```xml
<cpu mode='host-passthrough'/>
```

これは、ClickHouseが`cpuid`命令で正確な情報を取得できるようにするために重要です。
そうでないと、古いCPUモデルでハイパーバイザーが実行されると`Illegal instruction`のクラッシュが発生する可能性があります。

## ClickHouse Keeper と ZooKeeper {#zookeeper}

ClickHouseのクラスタには、ZooKeeperの代わりにClickHouse Keeperを使用することが推奨されます。[ClickHouse Keeperのドキュメント](../guides/sre/keeper/index.md)を参照してください。

ZooKeeperの継続使用を希望する場合は、最新のZooKeeperバージョン（3.4.9以降）を使用するのがベストです。安定したLinuxディストリビューションに含まれているバージョンは時代遅れである可能性があります。

異なるZooKeeperクラスタ間でデータを transferするために、手動で書かれたスクリプトを使用しないでください。結果が順序付きノードに対して正しくないためです。同じ理由で「zkcopy」ユーティリティも使用しないでください：https://github.com/ksprojects/zkcopy/issues/15

既存のZooKeeperクラスタを2つに分割したい場合、正しい方法はレプリカの数を増やし、その後それを2つの独立したクラスタとして再構成することです。

テスト環境や低い取り込みレートの環境では、ClickHouseと同じサーバーでClickHouse Keeperを実行できます。
本番環境では、ClickHouseとZooKeeper/Keeperのために別のサーバーを使用するか、ClickHouseファイルとKeeperファイルを別のディスクに配置することをお勧めします。なぜなら、ZooKeeper/Keeperはディスクのレイテンシに非常に敏感で、ClickHouseは利用可能なシステムリソースをすべて使用する可能性があるからです。

ZooKeeperのオブザーバーをアンサンブルに持つことはできますが、ClickHouseサーバーがオブザーバーとやりとりをするべきではありません。

`minSessionTimeout`設定を変更しないでください。大きな値はClickHouseの再起動安定性に影響を与える可能性があります。

デフォルト設定では、ZooKeeperはタイムボムです：

> デフォルト設定では、ZooKeeperサーバーは古いスナップショットやログからファイルを削除しません（`autopurge`を参照）。これはオペレーターの責任です。

このボムを解体する必要があります。

以下は、大規模な本番環境で使用されるZooKeeper（3.5.1）の構成です：

zoo.cfg:

```bash

# http://hadoop.apache.org/zookeeper/docs/current/zookeeperAdmin.html


# 各ティックのミリ秒数
tickTime=2000

# 初期同期フェーズにかかるティックの数

# この値はあまり動機付けされていません
initLimit=300

# リクエストを送信して応答を受け取る間に経過可能なティックの数
syncLimit=10

maxClientCnxns=2000


# クライアントが要求できる最大値

# クライアントが高いセッションタイムアウトで作業することを望む場合、サーバー上で高いmaxSessionTimeoutがあっても問題ありません。

# しかし、デフォルトでは30秒のセッションタイムアウトを要求します（ClickHouse設定でsession_timeout_msで変更できます）。
maxSessionTimeout=60000000

# スナップショットが格納されるディレクトリ。
dataDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/data

# より良いパフォーマンスのためにデータログディレクトリを別の物理ディスクに配置
dataLogDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/logs

autopurge.snapRetainCount=10
autopurge.purgeInterval=1


# 雪を避けるためにZooKeeperはトランザクションログファイルに

# preAllocSizeキロバイトのブロックでスペースを割り当てます。デフォルトのブロックサイズは64Mです。ブロックのサイズを変更する理由の一つは、スナップショットが

# より頻繁に取得される場合、ブロックサイズを減らすためです。（また、snapCountも参照）。
preAllocSize=131072


# クライアントはZooKeeperが処理できるよりも速くリクエストを送信できます。

# 特に多数のクライアントがいる場合。queued requestsのためにZooKeeperがメモリ不足になるのを防ぐために、ZooKeeperは

# globalOutstandingLimitのアウトスタンディングリクエストを超えないようにクライアントを制限します。デフォルトの制限は1000です。

# globalOutstandingLimit=1000


# ZooKeeperはトランザクションをトランザクションログに記録します。snapCountトランザクションが

# ログファイルに書き込まれると、スナップショットが開始され、新しいトランザクションログファイルが開始されます。デフォルトのsnapCountは100000です。
snapCount=3000000


# このオプションが定義されている場合、リクエストは

# traceFile.year.month.dayというトレースファイルに記録されます。
#traceFile=


# リーダーはクライアント接続を受け入れます。デフォルトの値は「yes」です。リーダーマシンは

# 更新を調整します。わずかなコストでより高い更新スループットを実現するために、リーダーはクライアントを受け入れずに

# 調整に焦点を当てるように構成できます。
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


# TODO これは本当に醜い

# どのjarが必要かを知る方法は？

# log4jは、log4j.propertiesファイルがクラスパスに存在することを要求するようです
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

Salt初期化：

```text
description "zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }} 中央集権型調整サービス"

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

## ウイルス対策ソフトウェア {#antivirus-software}

ウイルス対策ソフトウェアを使用する場合、ClickHouseのデータファイルフォルダ（`/var/lib/clickhouse`）をスキップするように設定してください。そうしないと、パフォーマンスが低下し、データの取り込みやバックグラウンドマージの際に予期しないエラーが発生する可能性があります。

## 関連コンテンツ {#related-content}

- [ClickHouseを始めたばかりですか？ここに13の「致命的な過ち」とその回避方法があります](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)
