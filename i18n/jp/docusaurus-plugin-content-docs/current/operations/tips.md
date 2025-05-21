---
description: 'http://hadoop.apache.org/zookeeper/docs/current/zookeeperAdmin.html のドキュメント'
sidebar_label: '使用推奨事項'
sidebar_position: 58
slug: /operations/tips
title: '使用推奨事項'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_automated.md';

<SelfManaged />

## CPU スケーリングガバナー {#cpu-scaling-governor}

常に `performance` スケーリングガバナーを使用してください。`on-demand` スケーリングガバナーは、需要が常に高い状況では機能が著しく劣ります。

```bash
$ echo 'performance' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
```

## CPU 制限 {#cpu-limitations}

プロセッサーは過熱する可能性があります。過熱によって CPU のクロックレートが制限されたかどうかを確認するには `dmesg` を使用してください。制限はデータセンターのレベルで外部に設定されることもあります。負荷のかかった状態で `turbostat` を使用して監視できます。

## RAM {#ram}

データが少量（約 200 GB 圧縮）である場合、データ量に見合ったメモリを使用することが最善です。大量のデータを処理しインタラクティブ（オンライン）クエリを実行する場合、ホットデータのサブセットがページキャッシュに収まるように、合理的な量の RAM（128 GB 以上）を使用する必要があります。サーバーあたり約 50 TB のデータ量でも、128 GB の RAMを使用することにより、64 GB と比べてクエリのパフォーマンスが大幅に向上します。

オーバーコミットを無効にしないでください。`cat /proc/sys/vm/overcommit_memory` の値は 0 または 1 であるべきです。次のコマンドを実行してください。

```bash
$ echo 0 | sudo tee /proc/sys/vm/overcommit_memory
```

メモリ管理のためにカーネルで費やされた時間を確認するには `perf top` を使用してください。
永続的な巨大ページも割り当てる必要はありません。

### 16GB未満のRAMの使用 {#using-less-than-16gb-of-ram}

推奨されるRAMの量は32GB以上です。

システムに16GB未満のRAMがある場合、デフォルト設定がこのメモリ量に一致しないため、さまざまなメモリエクセプションが発生する可能性があります。ClickHouseを少量のRAM（最低2GB）を持つシステムで使用することは可能ですが、これらのセットアップには追加の調整が必要で、低いレートでのみデータを取り込むことができます。

ClickHouseを16GB未満のRAMで使用する場合は、以下をお勧めします。

- `config.xml` のマークキャッシュのサイズを減らします。500 MB まで設定できますが、ゼロには設定できません。
- クエリ処理スレッドの数を `1` に減らします。
- `max_block_size` を `8192` に下げます。`1024` といった値でも実用的です。
- `max_download_threads` を `1` に減らします。
- `input_format_parallel_parsing` と `output_format_parallel_formatting` を `0` に設定します。

追加のメモ:
- メモリアロケータによってキャッシュされたメモリをフラッシュするには、`SYSTEM JEMALLOC PURGE` コマンドを実行できます。
- メモリが少ないマシンで S3 または Kafka の統合を使用することは推奨しません。これらはバッファーに大量のメモリを必要とします。

## ストレージサブシステム {#storage-subsystem}

予算に余裕があれば SSD を使用してください。そうでなければ HDD を使用します。7200 RPM の SATA HDD で十分です。

少数のサーバーで接続されたディスクシェルフよりも、ローカルハードドライブを搭載した多数のサーバーを優先してください。ただし、まれにクエリがあるアーカイブを保存する場合、シェルフは機能します。

## RAID {#raid}

HDD を使用する場合、それらを RAID-10、RAID-5、RAID-6 または RAID-50 に組み合わせることができます。Linux ではソフトウェア RAID がより優れています（`mdadm` を使用）。RAID-10 を作成する際は、`far` レイアウトを選択してください。予算に余裕があれば、RAID-10 を選択してください。

LVM 自体（RAID や `mdadm` なし）は問題ありませんが、これを使って RAID を作成したり、`mdadm` と組み合わせたりするのはあまり探求されていない選択肢で、ミスが起こりやすくなります（不適切なチャンクサイズの選択; チャンクの整列不良; 不適切な RAID タイプの選択; ディスクのクリーンアップを忘れる）。LVM を使う自信がある場合、使用には問題ありません。

ディスクが4台以上ある場合、RAID-6（推奨）または RAID-50 を使用し、RAID-5 を使用しないでください。RAID-5、RAID-6 或いは RAID-50 を使用する場合は、常に stripe_cache_size を増やしてください。デフォルトの値は通常最良の選択肢ではありません。

```bash
$ echo 4096 | sudo tee /sys/block/md2/md/stripe_cache_size
```

デバイスの数とブロックサイズから正確な数を計算するには、次の式を使用します: `2 * num_devices * chunk_size_in_bytes / 4096`。

ブロックサイズが64KBであれば、ほとんどのRAID構成で十分です。平均的な clickhouse-server の書き込みサイズは約1MB（1024KB）であるため、推奨ストライプサイズも1MBです。必要に応じて、ブロックサイズは RAID 配列内の非パリティディスクの数で 1MB を割った値に設定し、すべての利用可能な非パリティディスクに並行して書き込みが行えるように最適化できます。
ブロックサイズをあまり小さくしすぎたり、大きくしすぎたりしないでください。

SSD では RAID-0 を使用できます。
RAID を使用するかどうかに関係なく、常にデータセキュリティのためにレプリケーションを使用してください。

長いキューで NCQ を有効にします。HDD の場合は mq-deadline か CFQ スケジューラーを選択し、SSD の場合は noop を選択してください。`readahead` 設定を減らさないでください。
HDD の場合は、書き込みキャッシュを有効にしてください。

OS の NVME および SSD ディスクで [`fstrim`](https://en.wikipedia.org/wiki/Trim_(computing)) が有効になっていることを確認してください（通常は cronjob または systemd サービスを使用して実装されています）。

## ファイルシステム {#file-system}

Ext4 が最も信頼性の高いオプションです。マウントオプション `noatime` を設定してください。XFS も良好に機能します。
ほとんどの他のファイルシステムも問題なく動作します。

FAT-32 および exFAT はハードリンクの欠如によりサポートされていません。

ClickHouse は独自に圧縮を行い、優れているため、圧縮ファイルシステムを使用しないでください。
暗号化ファイルシステムの使用は推奨されません。ClickHouse に内蔵の暗号化機能を使用することができるため、こちらの方が優れています。

ClickHouse は NFS 上でも動作しますが、最良の選択肢ではありません。

## Linux カーネル {#linux-kernel}

古い Linux カーネルを使用しないでください。

## ネットワーク {#network}

IPv6 を使用している場合は、ルートキャッシュのサイズを増やしてください。
Linux カーネル 3.2 以前には IPv6 実装に関して多くの問題がありました。

可能であれば、少なくとも 10 GB のネットワークを使用してください。1 Gb でも機能しますが、数十 TB のデータを持つレプリカをパッチする際や、大量の中間データを処理する分散クエリには、パフォーマンスが大幅に悪化します。

## 巨大ページ {#huge-pages}

古い Linux カーネルを使用している場合は、透過的巨大ページを無効にしてください。これはメモリアロケータに干渉し、パフォーマンスが著しく低下します。新しい Linux カーネルでは、透過的巨大ページは問題ありません。

```bash
$ echo 'madvise' | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
```

透過的巨大ページの設定を永続的に変更するには、`/etc/default/grub` を編集して `GRUB_CMDLINE_LINUX_DEFAULT` オプションに `transparent_hugepage=madvise` を追加します。

```bash
$ GRUB_CMDLINE_LINUX_DEFAULT="transparent_hugepage=madvise ..."
```

その後、`sudo update-grub` コマンドを実行し、再起動して変更を適用します。

## ハイパーバイザーの設定 {#hypervisor-configuration}

OpenStack を使用している場合は、`nova.conf` に次の設定をします。

```ini
cpu_mode=host-passthrough
```

libvirt を使用している場合は、XML 設定で次を設定します。

```xml
<cpu mode='host-passthrough'/>
```

これは ClickHouse が `cpuid` 命令で正しい情報を取得できるようにするために重要です。そうでない場合、古い CPU モデルでハイパーバイザーが実行されると `Illegal instruction` クラッシュが発生する可能性があります。

## ClickHouse Keeper と ZooKeeper {#zookeeper}

ClickHouse Keeper は ClickHouse クラスター用に ZooKeeper の代替として推奨されます。 [ClickHouse Keeper](../guides/sre/keeper/index.md) のドキュメントを参照してください。

ZooKeeper の使用を続けたい場合は、最新の ZooKeeper バージョン（3.4.9 以降）を使用するのが最良です。安定した Linux ディストリビューションに含まれるバージョンは古くなっている可能性があります。

異なる ZooKeeper クラスター間でデータを転送するために手動で作成されたスクリプトを使用しないでください。結果がシーケンシャルノードに対して不正確になるためです。同じ理由で "zkcopy" ユーティリティも使用しないでください: https://github.com/ksprojects/zkcopy/issues/15

既存の ZooKeeper クラスターを 2 つに分割したい場合は、まずレプリカの数を増やし、その後 2 つの独立したクラスターとして再構成するのが正しい方法です。

テスト環境や低い取り込みレートの環境では、ClickHouse と同じサーバー上で ClickHouse Keeper を実行できます。
本番環境では、ClickHouse と ZooKeeper/Keeper に別々のサーバーを使用するか、ClickHouse ファイルと Keeper ファイルを別々のディスクに配置することをお勧めします。ZooKeeper/Keeper はディスクのレイテンシーに非常に敏感であり、ClickHouse は利用可能なすべてのシステムリソースを利用する可能性があります。

エンサンブルに ZooKeeper のオブザーバーを持つことはできますが、ClickHouse サーバーはオブザーバーと相互作用しないでください。

`minSessionTimeout` 設定を変更しないでください。大きな値は ClickHouse の再起動の安定性に影響を与える可能性があります。

デフォルト設定のままでは、ZooKeeper はタイムボムです：

> ZooKeeper サーバーは、デフォルト設定（`autopurge` を参照）を使用していると、古いスナップショットとログからファイルを削除しないため、これはオペレーターの責任です。

このタイムボムを解除する必要があります。

以下の ZooKeeper（3.5.1）構成は、大規模な本番環境で使用されています：

zoo.cfg:

```bash

# http://hadoop.apache.org/zookeeper/docs/current/zookeeperAdmin.html


# 各ティックのミリ秒数
tickTime=2000

# 初期同期フェーズにかかるティック数

# この値はあまり動機づけられません
initLimit=300

# リクエストを送信し確認を得るまでの間に通過できるティック数
syncLimit=10

maxClientCnxns=2000


# クライアントがリクエストできる最大値です。サーバーは高いセッションタイムアウトでクライアントが作業できるように高い maxSessionTimeout を持つのは問題ありません。

# しかし、デフォルトでは 30 秒のセッションタイムアウトを要求します（ClickHouse 設定で session_timeout_ms で変更可能）。
maxSessionTimeout=60000000

# スナップショットが保存されるディレクトリです。
dataDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/data

# より良いパフォーマンスのために dataLogDir を別の物理ディスクに配置してください
dataLogDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/logs

autopurge.snapRetainCount=10
autopurge.purgeInterval=1



# 移動を避けるために、ZooKeeper はトランザクションログファイルで preAllocSize キロバイトのブロックでスペースを割り当てます。デフォルトのブロックサイズは 64M です。ブロックサイズを変更する理由の一つは、スナップショットを頻繁に取得する場合にブロックサイズを減らすことです。（snapCount も参照）。
preAllocSize=131072


# クライアントが ZooKeeper が処理可能なよりも早くリクエストを送信する場合があります。

# 特にクライアントが多い場合です。リクエストが待ち行列に入り、ZooKeeper のメモリが不足するのを防ぐために、ZooKeeper はクライアントを制限し、システム内で globalOutstandingLimit を超えるリクエストはありません。デフォルトの制限は 1000 です。

# globalOutstandingLimit=1000


# ZooKeeper はトランザクションをトランザクションログに記録します。snapCount のトランザクションがログファイルに書き込まれた後、スナップショットが開始され、新しいトランザクションログファイルが開始されます。デフォルトの snapCount は 100000 です。
snapCount=3000000


# このオプションが定義されている場合、リクエストは traceFile.year.month.day という名前のトレースファイルに記録されます。
#traceFile=


# リーダーはクライアント接続を受け入れます。デフォルトの値は "yes" です。リーダーマシンは更新を調整します。若干読取スループットが低下しますが、リーダーをクライアントを受け入れず調整に専念させると、更新のスループットが向上します。
leaderServes=yes

standaloneEnabled=false
dynamicConfigFile=/etc/zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }}/conf/zoo.cfg.dynamic
```

Javaバージョン:

```text
openjdk 11.0.5-shenandoah 2019-10-15
OpenJDK Runtime Environment (build 11.0.5-shenandoah+10-adhoc.heretic.src)
OpenJDK 64-Bit Server VM (build 11.0.5-shenandoah+10-adhoc.heretic.src, mixed mode)
```

JVM パラメータ:

```bash
NAME=zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }}
ZOOCFGDIR=/etc/$NAME/conf


# TODO これは本当に見栄えが悪い

# 必要なジャーを見つけるには？

# log4j は log4j.properties ファイルがクラスパスに必要なようです
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

Salt 初期化:

```text
description "zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }} 中央集権サービス"

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

ウイルス対策ソフトウェアを使用している場合は、ClickHouse データファイル（`/var/lib/clickhouse`）を含むフォルダーをスキップするように設定してください。そうしないと、パフォーマンスが低下し、データ取り込みやバックグラウンドマージ中に予期しないエラーが発生する可能性があります。

## 関連コンテンツ {#related-content}

- [ClickHouse を始める？ここに 13 の「致命的な過ち」とそれを避ける方法があります](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)
