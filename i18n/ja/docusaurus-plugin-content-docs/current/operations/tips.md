---
slug: /operations/tips
sidebar_position: 58
sidebar_label: 使用の推奨
title: "使用の推奨"
---
import SelfManaged from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />

## CPUスケーリングガバナー {#cpu-scaling-governor}

常に`performance`スケーリングガバナーを使用してください。`on-demand`スケーリングガバナーは、常に高い需給に対しては機能が劣ります。

``` bash
$ echo 'performance' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
```

## CPUの制限 {#cpu-limitations}

プロセッサは過熱する可能性があります。過熱のためにCPUのクロックレートが制限されているかどうかを確認するには、`dmesg`を使用してください。
この制限はデータセンターのレベルで外部に設定されることもあります。負荷の下で`turbostat`を使用して監視できます。

## RAM {#ram}

少量のデータ（約200 GB圧縮まで）に対しては、データのボリュームと同じだけのメモリを使用するのが最適です。
大量のデータを扱い、対話的（オンライン）クエリを処理する場合は、ホットデータのサブセットがページキャッシュに収まるように、適切な量のRAM（128 GB以上）を使用するべきです。
サーバーあたり約50 TBのデータボリュームであっても、128 GBのRAMを使用することで、64 GBと比べてクエリのパフォーマンスが大幅に改善されます。

オーバーコミットは無効にしないでください。値は`cat /proc/sys/vm/overcommit_memory`で0または1である必要があります。以下を実行してください。

``` bash
$ echo 0 | sudo tee /proc/sys/vm/overcommit_memory
```

メモリ管理のためにカーネルで費やされる時間を監視するには`perf top`を使用してください。
恒久的な巨大ページも別途割り当てる必要はありません。

### 16GB未満のRAMの使用 {#using-less-than-16gb-of-ram}

推奨されるRAMの量は32 GB以上です。

システムに16 GB未満のRAMがある場合、デフォルトの設定がこのメモリ量と一致しないため、さまざまなメモリエクセプションが発生する可能性があります。ClickHouseは少量のRAM（最小2 GB）でも動作させることができますが、これらの設定は追加の調整が必要で、低速での取り込みしか行えません。

ClickHouseを16GB未満のRAMで使用する際は、以下のことを推奨します：

- `config.xml`のマークキャッシュのサイズを下げます。500 MBまで下げることができますが、0に設定することはできません。
- クエリ処理スレッドの数を`1`に減らします。
- `max_block_size`を`8192`に減らします。`1024`まで下げても実用的です。
- `max_download_threads`を`1`に減らします。
- `input_format_parallel_parsing`と`output_format_parallel_formatting`を`0`に設定します。

追加の注意点：
- メモリアロケータによってキャッシュされたメモリをフラッシュするには、`SYSTEM JEMALLOC PURGE`コマンドを実行できます。
- 低メモリのマシンでS3やKafkaの統合を使用することは推奨しません。なぜなら、バッファ用にかなりのメモリが必要だからです。

## ストレージサブシステム {#storage-subsystem}

予算が許せばSSDを使用してください。
許可されていない場合はHDDを使用します。SATA HDDの7200 RPMで十分です。

ローカルハードドライブを持つ多くのサーバーを、取り付けられたディスクシェルフを持つ少数のサーバーよりも優先してください。
ただし、稀なクエリのためにアーカイブを保存するためには、シェルフが機能します。

## RAID {#raid}

HDDを使用する場合、RAID-10、RAID-5、RAID-6またはRAID-50を組み合わせることができます。
Linuxのためには、ソフトウェアRAID（`mdadm`）が最適です。
RAID-10を作成する場合、`far`レイアウトを選択してください。
予算が許せばRAID-10を選択して下さい。

LVM自体（RAIDなしや`mdadm`なし）は大丈夫ですが、それを使用してRAIDを構築するか、`mdadm`と組み合わせることはあまり探求されていない選択肢であり、ミスが生じる可能性が高くなります
（間違ったチャンクサイズの選択; チャンクの不整合; 間違ったRAIDタイプの選択; ディスクのクリーンアップを忘れる）。LVMの使用に自信がある場合は、使用しても問題ありません。

4つ以上のディスクがある場合、RAID-5の代わりにRAID-6（推奨）またはRAID-50を使用してください。
RAID-5、RAID-6またはRAID-50を使用する場合は、常にstripe_cache_sizeを増やしてください。デフォルト値は通常最良の選択ではありません。

``` bash
$ echo 4096 | sudo tee /sys/block/md2/md/stripe_cache_size
```

デバイスの数とブロックサイズを使用して、次の式に基づいて正確な数値を計算します：`2 * num_devices * chunk_size_in_bytes / 4096`。

ブロックサイズが64 KBであれば、ほとんどのRAID構成に十分です。平均的なClickHouseサーバーの書き込みサイズは約1 MB（1024 KB）であり、そのため推奨するストライプサイズも1 MBです。ブロックサイズは必要に応じて最適化可能で、RAIDアレイ内の非パリティディスクの数で1 MBを割った値に設定することで、各書き込みが全ての利用可能な非パリティディスクに並列化されるようにします。
ブロックサイズが小さすぎたり大きすぎたりしないようにします。

SSD上ではRAID-0を使用できます。
RAIDの使用にかかわらず、常にデータのセキュリティのためにレプリケーションを使用してください。

長いキューでNCQを有効にしてください。HDDの場合、mq-deadlineまたはCFQスケジューラを選択し、SSDの場合はnoopを選びます。'readahead'設定を減らさないでください。
HDDの場合は、書き込みキャッシュを有効にしてください。

OS内のNVMEおよびSSDディスクに対して[`fstrim`](https://en.wikipedia.org/wiki/Trim_(computing))が有効になっていることを確認してください（通常はcronjobまたはsystemdサービスを使用して実装されています）。

## ファイルシステム {#file-system}

Ext4が最も信頼性の高いオプションです。マウントオプションとして`noatime`を設定してください。XFSも問題なく機能します。
その他のほとんどのファイルシステムも正常に動作するはずです。

FAT-32およびexFATはハードリンクがないため、サポートされていません。

ClickHouseは独自に圧縮を行うため、圧縮されたファイルシステムの使用は避けてください。
暗号化されたファイルシステムの使用も推奨されません。なぜなら、ClickHouse内蔵の暗号化を使用する方が優れているからです。

ClickHouseはNFS上で動作することができますが、最良の方法ではありません。

## Linuxカーネル {#linux-kernel}

古いLinuxカーネルを使用しないでください。

## ネットワーク {#network}

IPv6を使用する場合は、ルートキャッシュのサイズを増やしてください。
Linuxカーネルは3.2より前のバージョンでは、IPv6実装に多くの問題がありました。

可能であれば、少なくとも10 GBのネットワークを使用してください。1 Gbも機能しますが、テラバイト単位のデータを持つレプリカをパッチすることや、大量の中間データを持つ分散クエリを処理する際には、パフォーマンスが大幅に劣ります。

## 巨大ページ {#huge-pages}

古いLinuxカーネルを使用している場合は、透過的巨大ページを無効にしてください。それはメモリアロケータに干渉し、パフォーマンスの大幅な低下を引き起こします。
新しいLinuxカーネルでは透過的巨大ページは問題ありません。

``` bash
$ echo 'madvise' | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
```

透過的巨大ページの設定を永続的に変更するには、`/etc/default/grub`を編集し、`GRUB_CMDLINE_LINUX_DEFAULT`オプションに`transparent_hugepage=madvise`を追加します：

```bash
$ GRUB_CMDLINE_LINUX_DEFAULT="transparent_hugepage=madvise ..."
```

その後、`sudo update-grub`コマンドを実行し、再起動して反映させます。

## ハイパーバイザーの設定 {#hypervisor-configuration}

OpenStackを使用している場合、`nova.conf`に以下を設定してください。
```ini
cpu_mode=host-passthrough
```

libvirtを使用している場合、XML構成に以下を設定してください。
```xml
<cpu mode='host-passthrough'/>
```

これはClickHouseが`cpuid`命令で正しい情報を取得できるようにするために重要です。
そうしないと、古いCPUモデルでハイパーバイザーが動作しているときに`Illegal instruction`クラッシュが発生する可能性があります。

## ClickHouse KeeperとZooKeeper {#zookeeper}

ClickHouse Keeperは、ClickHouseクラスタのためにZooKeeperの代替として推奨されています。 [ClickHouse Keeper](../guides/sre/keeper/index.md)に関する文書を参照してください。

ZooKeeperを引き続き使用したい場合は、新しいバージョンのZooKeeper（3.4.9以降）を使用するのが最良です。安定したLinuxディストリビューションに含まれているバージョンは古い可能性があります。

異なるZooKeeperクラスター間でデータを転送するために手動で作成したスクリプトを使用しないでください。なぜなら、シーケンシャルノードに対しては結果が不正確になるからです。 "zkcopy"ユーティリティも同じ理由で使用しないでください：https://github.com/ksprojects/zkcopy/issues/15

既存のZooKeeperクラスターを2つに分割する場合は、複製の数を増やし、その後、2つの独立したクラスターとして再構成するのが正しい方法です。

テスト環境や取り込み率の低い環境では、ClickHouseと同じサーバーでClickHouse Keeperを実行できますが、本番環境ではClickHouseとZooKeeper/Keeperのために別々のサーバーを使用することを提案します。もしくは、ClickHouseのファイルとKeeperのファイルを別々のディスクに配置します。ZooKeeper/Keeperはディスクレイテンシに非常に敏感であり、ClickHouseは全ての利用可能なシステムリソースを使用する可能性があります。

ZooKeeperオブザーバーをアンサンブルに持つことは可能ですが、ClickHouseサーバーはオブザーバーと対話しないべきです。

`minSessionTimeout`設定を変更しないでください。大きな値はClickHouseの再起動安定性に影響を及ぼす可能性があります。

デフォルトの設定では、ZooKeeperは時限爆弾です：

> ZooKeeperサーバーは、デフォルト設定（`autopurge`を参照）を使用して古いスナップショットやログからファイルを削除しません。これはオペレーターの責任です。

この爆弾を解除する必要があります。

以下のZooKeeper（3.5.1）設定は、大規模な本番環境で使用されています：

zoo.cfg:

``` bash
# http://hadoop.apache.org/zookeeper/docs/current/zookeeperAdmin.html

# 各ティックのミリ秒数
tickTime=2000
# 初期同期フェーズに要するティックの数
# この値にはあまり理由はありません
initLimit=300
# リクエストを送信して確認を受け取るまでに経過できるティックの数
syncLimit=10

maxClientCnxns=2000

# クライアントがリクエストできる最大値。サーバーに高いmaxSessionTimeoutを持たせるのは問題ありませんが、クライアントが望む場合は高いセッションタイムアウトを持つようにしてください。
maxSessionTimeout=60000000
# スナップショットが保存されるディレクトリ。
dataDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/data
# より良いパフォーマンスのためにdataLogDirを別の物理ディスクに配置する
dataLogDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/logs

autopurge.snapRetainCount=10
autopurge.purgeInterval=1


# スラストを避けるため、ZooKeeperはトランザクションログファイルにプリエンプションサイズのキロバイトでブロックを割り当てます。デフォルトのブロックサイズは64Mです。変更理由の一つは、スナップショットをより頻繁に取得する場合にブロックサイズを減らすことです。（また、snapCountを参照）。
preAllocSize=131072

# クライアントはZooKeeperがそれらを処理するより高速にリクエストを提出できます。
# 特にクライアントが多い場合は、リクエストがキューに溜まってZooKeeperがメモリ不足になるのを防ぐため、ZooKeeperはクライアントをスロットリングします。
#システム内の残りリクエストはglobalOutstandingLimitを超えません。デフォルト制限は1000です。
# globalOutstandingLimit=1000

# ZooKeeperはトランザクションをトランザクションログに記録します。snapCountトランザクションがログファイルに書き込まれた後、スナップショットが開始され、新しいトランザクションログファイルが開始されます。デフォルトのsnapCountは100000です。
snapCount=3000000

# このオプションが定義されている場合、リクエストはtraceFile.year.month.dayという名前のトレースファイルにログされます。
#traceFile=

# リーダーはクライアント接続を受け入れます。デフォルトの値は「はい」です。リーダーマシンは更新を調整します。少しのリードスループットのコストでより高い更新スループットを得るために、リーダーはクライアントを受け入れず、調整に専念するように構成できます。
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

JVMパラメータ:

``` bash
NAME=zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }}
ZOOCFGDIR=/etc/$NAME/conf

# TODO これは本当に醜い
# どのJARが必要なのかをどうやって確認するのか？
# log4jはlog4j.propertiesファイルがクラスパスにあることを必要とします
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
description "zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }} セントラルコーディネーションサービス"

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

ウイルス対策ソフトウェアを使用する場合は、ClickHouseデータファイル（`/var/lib/clickhouse`）があるフォルダをスキップするように設定してください。そうしないとパフォーマンスが低下したり、データ取り込みやバックグラウンドマージ中に予期しないエラーが発生する可能性があります。

## 関連内容 {#related-content}

- [ClickHouseを使い始めるには？ここに13の "致命的な過ち" とそれを避ける方法があります。](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)
