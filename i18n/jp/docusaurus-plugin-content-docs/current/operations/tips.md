---
slug: /operations/tips
sidebar_position: 58
sidebar_label: 使用推奨
title: "使用推奨"
---
import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />

## CPU スケーリングガバナー {#cpu-scaling-governor}

常に `performance` スケーリングガバナーを使用してください。`on-demand` スケーリングガバナーは、常に高い需要に対してはかなり劣ります。

``` bash
$ echo 'performance' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
```

## CPU 制限 {#cpu-limitations}

プロセッサは過熱する可能性があります。`dmesg` を使用して、CPU のクロックレートが過熱により制限されていたかどうかを確認してください。
制限は、データセンターのレベルでも外部から設定できます。負荷の下で `turbostat` を使用してそれを監視できます。

## RAM {#ram}

小規模なデータ（最大約200 GB圧縮）の場合、データのボリュームと同じだけのメモリを使用するのが最適です。
大量のデータを処理し、対話型（オンライン）クエリを実行する場合は、合理的な量のRAM（128 GB以上）を使用して、ホットデータサブセットがページのキャッシュに収まるようにするべきです。
サーバーあたり約50 TBのデータボリュームであっても、128 GBのRAMを使用すると、64 GBと比べてクエリ性能が大幅に向上します。

オーバーコミットを無効にしないでください。`cat /proc/sys/vm/overcommit_memory` の値は 0 または 1 であるべきです。次のコマンドを実行します。

``` bash
$ echo 0 | sudo tee /proc/sys/vm/overcommit_memory
```

`perf top` を使用して、メモリ管理のためにカーネルで費やされた時間を監視します。
恒久的な大きなページも割り当てる必要はありません。

### 16GB未満のRAMを使用している場合 {#using-less-than-16gb-of-ram}

推奨RAM量は32 GB以上です。

システムに16 GB未満のRAMがある場合、デフォルト設定がこのメモリ量に一致しないため、さまざまなメモリエクセプションが発生する可能性があります。RAMが少ない（最低2 GB）システムでもClickHouseを使用できますが、これらのセットアップは追加の調整が必要で、低速でのデータ取り込みしかできません。

16GB未満のRAMでClickHouseを使用する場合、次の推奨を行います：

- `config.xml` 内でマークキャッシュのサイズを下げます。500 MBまで下げることができますが、ゼロには設定できません。
- クエリ処理スレッド数を `1` に下げます。
- `max_block_size` を `8192` に下げます。`1024` まで下げても実用的です。
- `max_download_threads` を `1` に下げます。
- `input_format_parallel_parsing` と `output_format_parallel_formatting` を `0` に設定します。

追加の注意事項：
- メモリアロケーターによってキャッシュされたメモリをフラッシュするには、`SYSTEM JEMALLOC PURGE` コマンドを実行できます。
- メモリが少ないマシンでのS3やKafkaの統合は、バッファに大量のメモリを必要とするため、推奨しません。

## ストレージサブシステム {#storage-subsystem}

予算が許すならSSDを使用してください。
そうでなければHDDを使用します。7200 RPMのSATA HDDで十分です。

ローカルハードディスクを持つ多くのサーバーを、ディスクシェルフが接続された少数のサーバーよりも優先します。
しかし、稀なクエリを持つアーカイブの保存にはシェルフが機能します。

## RAID {#raid}

HDDを使用する際は、RAID-10、RAID-5、RAID-6、またはRAID-50を組み合わせることができます。
Linuxでは、ソフトウェアRAID（`mdadm`を使用）を選択します。
RAID-10を作成する際は、`far` レイアウトを選択してください。
予算が許すなら、RAID-10を選択しましょう。

LVM単体（RAIDや`mdadm`なし）は問題ありませんが、それを使用してRAIDを作成したり、`mdadm`と組み合わせるのはあまり試されていない選択肢であり、ミスの可能性が高くなります（不適切なチャンクサイズの選択、チャンクの不整合、RAIDタイプの誤選択、ディスクのクリーンアップを忘れるなど）。LVMの使い方に自信があるなら、使用しても問題ありません。

4台以上のディスクがある場合は、RAID-6（推奨）またはRAID-50を使用し、RAID-5を避けてください。
RAID-5、RAID-6、またはRAID-50を使用する場合は、常に`stripe_cache_size`を増やしてください。デフォルトの値は通常最適ではありません。

``` bash
$ echo 4096 | sudo tee /sys/block/md2/md/stripe_cache_size
```

デバイス数とブロックサイズから、以下の式を使って正確な数を計算します：`2 * num_devices * chunk_size_in_bytes / 4096`。

ブロックサイズは、多くのRAID構成にとって64 KBで十分です。average clickhouse-serverの書き込みサイズは約1 MB（1024 KB）であるため、推奨されたストライプサイズも1 MBです。必要に応じてブロックサイズは、RAID配列内の不整合ディスクの数で割った1 MBに設定することで最適化できます。すべての利用可能な不整合ディスクに書き込みを並行化するためです。
ブロックサイズを小さすぎたり大きすぎたりしてはいけません。

SSDではRAID-0を使用できます。
RAIDを使用するかどうかにかかわらず、常にデータのセキュリティのためにレプリケーションを使用してください。

長いキューでNCQを有効にします。HDDの場合はmq-deadlineまたはCFQスケジューラを選び、SSDの場合はnoopを選択します。`readahead`設定を減少させないでください。
HDDの場合、書き込みキャッシュを有効にしてください。

オペレーティングシステムのNVMEおよびSSDディスクに対して [`fstrim`](https://en.wikipedia.org/wiki/Trim_(computing)) が有効になっていることを確認してください（通常、cronjobまたはsystemdサービスを使用して実装されています）。

## ファイルシステム {#file-system}

Ext4が最も信頼性のあるオプションです。マウントオプション `noatime` を設定してください。XFSも十分に機能します。
他のほとんどのファイルシステムも問題なく動作するはずです。

FAT-32およびexFATはハードリンクがないためサポートされていません。

ClickHouse自身で圧縮を行うため、圧縮ファイルシステムは使用しないでください。
暗号化ファイルシステムを使用することは推奨されません。ClickHouse内の組み込みの暗号化を使用する方が良いからです。

ClickHouseはNFS上で動作することができますが、それは最善のアイデアではありません。

## Linuxカーネル {#linux-kernel}

古いLinuxカーネルを使用しないでください。

## ネットワーク {#network}

IPv6を使用している場合は、ルートキャッシュのサイズを増やします。
3.2以前のLinuxカーネルはIPv6実装に多くの問題がありました。

可能であれば、少なくとも10 GBのネットワークを使用してください。1 Gbも機能しますが、数十 TBのデータをレプリカにパッチする際にはずっと悪化しますし、大量の中間データを持つ分散クエリの処理には劣ります。

## 大きなページ {#huge-pages}

古いLinuxカーネルを使用している場合は、トランスペアレントな大きなページを無効にします。これはメモリアロケーターに干渉し、性能の著しい低下を引き起こします。
新しいLinuxカーネルではトランスペアレントな大きなページは問題ありません。

``` bash
$ echo 'madvise' | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
```

トランスペアレントな大きなページ設定を永続的に変更したい場合は、`/etc/default/grub`を編集し、`GRUB_CMDLINE_LINUX_DEFAULT`オプションに `transparent_hugepage=madvise` を追加します。

```bash
$ GRUB_CMDLINE_LINUX_DEFAULT="transparent_hugepage=madvise ..."
```

その後、`sudo update-grub`コマンドを実行し、再起動して適用します。

## ハイパーバイザー設定 {#hypervisor-configuration}

OpenStackを使用している場合は、`nova.conf`に次を設定します。
```ini
cpu_mode=host-passthrough
```

libvirtを使用している場合は、XML設定内で次を設定します。
```xml
<cpu mode='host-passthrough'/>
```

これは、ClickHouseが `cpuid` 命令を使用して正しい情報を取得するために重要です。
そうでなければ、古いCPUモデルでハイパーバイザーが実行されていると `Illegal instruction` でクラッシュする可能性があります。

## ClickHouse Keeper と ZooKeeper {#zookeeper}

ClickHouseクラスターにはClickHouse Keeperの使用が推奨されています。 [ClickHouse Keeper](../guides/sre/keeper/index.md) に関するドキュメントを参照してください。

ZooKeeperを引き続き使用したい場合は、最新のZooKeeperバージョン（3.4.9以降）を使用するのが最良です。安定したLinuxディストリビューションに含まれているバージョンは古くなっている可能性があります。

異なるZooKeeperクラスター間でデータを転送するために手動で書かれたスクリプトを使用しないでください。結果が順番にノードに対して不正確になるためです。同じ理由で「zkcopyユーティリティ」を使用しないでください： https://github.com/ksprojects/zkcopy/issues/15

既存のZooKeeperクラスタを2つに分割したい場合は、レプリカの数を増やし、その後2つの独立したクラスターとして再構成するのが正しい方法です。

テスト環境や低インジェクション率の環境では、ClickHouseと同じサーバー上でClickHouse Keeperを実行できます。
本番環境では、ClickHouseとZooKeeper/Keeperに別々のサーバーを使用するか、ClickHouseファイルとKeeperファイルを別々のディスクに配置することをお勧めします。ZooKeeper/Keeperはディスクの待ち時間に非常に敏感であり、ClickHouseはシステムのすべてのリソースを利用する可能性があるためです。

ZooKeeperオブザーバーをエンサンブルに持つことができますが、ClickHouseサーバーはオブザーバーと相互作用しないことに注意してください。

`minSessionTimeout` 設定を変更しないでください。大きな値はClickHouseの再起動安定性に影響を与える可能性があります。

デフォルト設定で、ZooKeeperはタイムボムです：

> デフォルト構成を使用している場合、ZooKeeperサーバーは古いスナップショットやログからファイルを削除しません（`autopurge`を参照）これがオペレーターの責任です。

この爆弾は解除する必要があります。

以下は、大規模な本番環境で使用されるZooKeeper（3.5.1）の設定です：

zoo.cfg:

``` bash

# http://hadoop.apache.org/zookeeper/docs/current/zookeeperAdmin.html


# 各ティックのミリ秒数
tickTime=2000

# 初期同期フェーズにかかるティックの数

# この値にはあまり根拠がありません
initLimit=300

# リクエストを送信して確認を得るまでのティックの数
syncLimit=10

maxClientCnxns=2000


# クライアントが要求できる最大値であり、サーバーが受け入れることができる値です。

# クライアントが高いセッションタイムアウトで作業することを許可するために、サーバーで高いmaxSessionTimeoutを持つのはOkです。

# ただし、デフォルトで30秒のセッションタイムアウトを要求します（ClickHouse configでsession_timeout_msで変更できます）。
maxSessionTimeout=60000000

# スナップショットが保存されるディレクトリ
dataDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/data

# より良いパフォーマンスのために、dataLogDirを別の物理ディスクに配置します
dataLogDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/logs

autopurge.snapRetainCount=10
autopurge.purgeInterval=1



# Seekを避けるために、ZooKeeperは事前にallocされたサイズのキロバイトでトランザクションログファイルにスペースを割り当てます。

# デフォルトのブロックサイズは64Mです。ブロックサイズを変更する理由の1つは、

# スナップショットがより頻繁に取得される場合、ブロックサイズを減少させるためです（snapCountも参照）。
preAllocSize=131072


# クライアントは、ZooKeeperが処理するよりも速くリクエストを送信できます。

# 特に多くのクライアントがいる場合、ZooKeeperがキューにあるリクエストでメモリ不足に陥らないように、ZooKeeperはクライアントを制限します。

# システム内でグローバルなおおよその制限のリクエストを未解決にします。デフォルトの制限は1000です。

# globalOutstandingLimit=1000


# ZooKeeperはトランザクションをトランザクションログに記録します。snapCountトランザクションが

# ログファイルに書き込まれると、スナップショットが開始され、新しいトランザクションログファイルが開始されます。デフォルトのsnapCountは100000です。
snapCount=3000000


# このオプションが定義されている場合、リクエストは

# traceFile.year.month.dayという名前のトレースファイルに記録されます。
#traceFile=


# リーダーはクライアント接続を受け入れます。デフォルト値は「yes」です。リーダーのマシンは

# 更新の調整を行います。若干の読み取りスループットの犠牲でより高い更新スループットのために、

# リーダーはクライアントを受け入れないように設定し、調整に集中できます。
leaderServes=yes

standaloneEnabled=false
dynamicConfigFile=/etc/zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }}/conf/zoo.cfg.dynamic
```

Javaバージョン:

``` text
openjdk 11.0.5-shenandoah 2019-10-15
OpenJDK Runtime Environment (build 11.0.5-shenandoah+10-adhoc.heretic.src)
OpenJDK 64-Bit Server VM (build 11.0.5-shenandoah+10-adhoc.heretic.src, mixed mode)
```

JVMパラメーター:

``` bash
NAME=zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }}
ZOOCFGDIR=/etc/$NAME/conf


# TODO これは本当に醜い

# どのJARが必要かを見つける方法は？

# log4jはlog4j.propertiesファイルがクラスパスにあることを要求しているようです
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

Salt初期化:

``` text
description "zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }} 中央集約型調整サービス"

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

アンチウイルスソフトウェアを使用している場合は、ClickHouseデータファイル（`/var/lib/clickhouse`）のフォルダーをスキップするように設定してください。そうしないと、性能が低下し、データの取り込みやバックグラウンドのマージ中に予期しないエラーが発生する可能性があります。

## 関連コンテンツ {#related-content}

- [ClickHouseを始めたばかりですか？ここに13の「致命的な過ち」とそれを避ける方法があります](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)
