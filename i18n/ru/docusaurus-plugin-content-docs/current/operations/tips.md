---
description: 'Страница с рекомендациями по использованию ClickHouse с открытым исходным кодом'
sidebar_label: 'Рекомендации по использованию ClickHouse с открытым исходным кодом'
sidebar_position: 58
slug: /operations/tips
title: 'Рекомендации по использованию ClickHouse с открытым исходным кодом'
doc_type: 'guide'
---

import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />

## Регулятор частоты CPU \{#cpu-scaling-governor\}

Всегда используйте регулятор `performance`. Режим `on-demand` работает значительно хуже при постоянно высокой нагрузке.

```bash
$ echo 'performance' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
```

## Ограничения по CPU \{#cpu-limitations\}

Процессоры могут перегреваться. Используйте `dmesg`, чтобы проверить, не была ли тактовая частота процессора ограничена из-за перегрева.
Ограничение также может быть установлено извне на уровне датацентра. Вы можете использовать `turbostat`, чтобы отслеживать это под нагрузкой.

## ОЗУ \{#ram\}

Для небольших объёмов данных (до ~200 ГБ в сжатом виде) оптимально, чтобы объём доступной памяти был сопоставим с объёмом данных.
Для больших объёмов данных и при обработке интерактивных (онлайн) запросов следует использовать достаточный объём ОЗУ (128 ГБ и более), чтобы «горячее» подмножество данных помещалось в кэш страниц.
Даже при объёмах данных ~50 ТБ на сервер использование 128 ГБ ОЗУ существенно улучшает производительность запросов по сравнению с 64 ГБ.

Не отключайте overcommit. Значение в файле `/proc/sys/vm/overcommit_memory` должно быть 0 или 1. Выполните

```bash
$ echo 0 | sudo tee /proc/sys/vm/overcommit_memory
```

Используйте `perf top`, чтобы отслеживать время, затрачиваемое в ядре на управление памятью.
Постоянные большие страницы (huge pages) также не требуется выделять.

### Использование менее 16 ГБ ОЗУ \{#using-less-than-16gb-of-ram\}

Рекомендуемый объём ОЗУ — 32 ГБ или больше.

Если в вашей системе меньше 16 ГБ ОЗУ, вы можете столкнуться с различными исключениями, связанными с памятью, поскольку настройки по умолчанию не рассчитаны на такой объём. Можно использовать ClickHouse в системе с небольшим объёмом ОЗУ (начиная с 2 ГБ), но такие конфигурации требуют дополнительной настройки и обеспечивают только низкую скорость приёма данных.

При использовании ClickHouse с объёмом ОЗУ менее 16 ГБ мы рекомендуем следующее:

- Уменьшите размер кэша меток в `config.xml`. Его можно установить вплоть до 500 МБ, но нельзя установить в ноль.
- Уменьшите количество потоков обработки запросов до `1`.
- Уменьшите `max_block_size` до `8192`. Значения вплоть до `1024` всё ещё могут быть практичными.
- Уменьшите `max_download_threads` до `1`.
- Установите `input_format_parallel_parsing` и `output_format_parallel_formatting` в `0`.
- Отключите запись в лог-таблицы, так как фоновая задача слияния резервирует ОЗУ для выполнения слияний лог-таблиц. Отключите `asynchronous_metric_log`, `metric_log`, `text_log`, `trace_log`.

Дополнительные замечания:

- Чтобы освободить память, закэшированную аллокатором, вы можете выполнить команду `SYSTEM JEMALLOC PURGE`.
- Мы не рекомендуем использовать интеграции с S3 или Kafka на машинах с небольшим объёмом памяти, так как им требуется значительный объём памяти для буферов.

## Подсистема хранения \{#storage-subsystem\}

Если бюджет позволяет, используйте SSD.
Если нет — используйте HDD. Подойдут SATA HDD 7200 RPM.

Предпочитайте большее число серверов с локальными жесткими дисками меньшему количеству серверов с подключаемыми дисковыми полками.
Но для хранения архивов с редкими запросами дисковые полки подойдут.

## RAID \{#raid\}

При использовании HDD вы можете объединить их в RAID-10, RAID-5, RAID-6 или RAID-50.
Для Linux предпочтительнее программный RAID (с `mdadm`).
При создании RAID-10 выберите схему `far`.
Если бюджет позволяет, выбирайте RAID-10.

Сам по себе LVM (без RAID или `mdadm`) приемлем, но создание RAID на его основе или комбинирование его с `mdadm` — менее распространённая и хуже проработанная конфигурация, в которой выше риск ошибок
(выбор неправильного размера блока; неверное выравнивание блоков; выбор неподходящего типа RAID; забыв очистить диски). Если вы уверенно
пользуетесь LVM, нет препятствий для его использования.

Если у вас больше 4 дисков, используйте RAID-6 (предпочтительно) или RAID-50 вместо RAID-5.
При использовании RAID-5, RAID-6 или RAID-50 всегда увеличивайте значение stripe&#95;cache&#95;size, так как значение по умолчанию обычно далеко от оптимального.

```bash
$ echo 4096 | sudo tee /sys/block/md2/md/stripe_cache_size
```

Рассчитайте точное значение, исходя из числа устройств и размера блока, используя формулу: `2 * num_devices * chunk_size_in_bytes / 4096`.

Размер блока 64 KB достаточен для большинства конфигураций RAID. Средний размер записи clickhouse-server составляет примерно 1 MB (1024 KB), поэтому рекомендуемый размер страйпа (stripe size) также равен 1 MB. Размер блока при необходимости можно оптимизировать, установив его равным 1 MB, делённому на количество дисков без чётности (non-parity) в массиве RAID, чтобы каждая запись параллелизировалась по всем доступным дискам без чётности.
Никогда не устанавливайте размер блока слишком маленьким или слишком большим.

Вы можете использовать RAID-0 на SSD.
Независимо от использования RAID, всегда используйте репликацию для обеспечения сохранности данных.

Включите NCQ с длинной очередью. Для HDD выберите планировщик mq-deadline или CFQ, а для SSD — noop. Не уменьшайте настройку «readahead».
Для HDD включите кэш записи.

Убедитесь, что [`fstrim`](https://en.wikipedia.org/wiki/Trim_\(computing\)) включён для дисков NVMe и SSD в вашей ОС (обычно это реализуется с помощью задания cron или сервиса systemd).

## Файловая система \{#file-system\}

Ext4 — наиболее надёжный вариант. Установите опцию монтирования `noatime`. XFS тоже хорошо подходит.
Большинство других файловых систем, как правило, также будут работать корректно.

FAT-32 и exFAT не поддерживаются из‑за отсутствия жёстких ссылок.

Не используйте сжатые файловые системы, так как ClickHouse выполняет сжатие самостоятельно и делает это лучше.
Не рекомендуется использовать зашифрованные файловые системы, поскольку в ClickHouse есть встроенное шифрование, которое лучше.

Хотя ClickHouse может работать по NFS, это не лучшая идея.

## Ядро Linux \{#linux-kernel\}

Не используйте устаревшие версии ядра Linux.

## Сеть \{#network\}

Если вы используете IPv6, увеличьте размер кэша маршрутов.
Ядро Linux до версии 3.2 имело множество проблем с реализацией IPv6.

Используйте по возможности сеть не менее 10 Гбит/с. Сеть 1 Гбит/с тоже будет работать, но она значительно хуже подходит для синхронизации реплик с десятками терабайт данных или для обработки распределённых запросов с большим объёмом промежуточных данных.

## Huge Pages \{#huge-pages\}

Если вы используете устаревшую версию ядра Linux, отключите прозрачные huge pages. Они мешают работе аллокатора памяти, что приводит к значительному снижению производительности.
В более новых версиях ядра Linux использование прозрачных huge pages допустимо.

```bash
$ echo 'madvise' | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
```

Если вы хотите изменить настройку transparent huge pages на постоянной основе, отредактируйте `/etc/default/grub`, добавив `transparent_hugepage=madvise` в опцию `GRUB_CMDLINE_LINUX_DEFAULT`:

```bash
$ GRUB_CMDLINE_LINUX_DEFAULT="transparent_hugepage=madvise ..."
```

После этого выполните команду `sudo update-grub`, затем перезагрузите систему, чтобы изменения вступили в силу.

## Настройка гипервизора \{#hypervisor-configuration\}

Если вы используете OpenStack, задайте

```ini
cpu_mode=host-passthrough
```

в `nova.conf`.

Если вы используете libvirt, установите

```xml
<cpu mode='host-passthrough'/>
```

в конфигурации XML.

Это важно для того, чтобы ClickHouse мог получать корректную информацию из инструкции `cpuid`.
В противном случае вы можете сталкиваться с аварийным завершением работы с ошибкой `Illegal instruction` при запуске гипервизора на старых моделях CPU.

## ClickHouse Keeper и ZooKeeper \{#zookeeper\}

Рекомендуется использовать ClickHouse Keeper вместо ZooKeeper для кластеров ClickHouse. См. документацию по [ClickHouse Keeper](../guides/sre/keeper/index.md)

Если вы хотите продолжить использовать ZooKeeper, лучше использовать свежую версию ZooKeeper – 3.4.9 или более новую. Версия в стабильных дистрибутивах Linux может быть устаревшей.

Никогда не используйте самописные скрипты для переноса данных между разными кластерами ZooKeeper, так как результат будет некорректным для последовательных узлов. По этой же причине никогда не используйте утилиту «zkcopy»: [https://github.com/ksprojects/zkcopy/issues/15](https://github.com/ksprojects/zkcopy/issues/15)

Если вы хотите разделить существующий кластер ZooKeeper на два, правильный способ – увеличить число его реплик, а затем переконфигурировать его как два независимых кластера.

Вы можете запускать ClickHouse Keeper на том же сервере, что и ClickHouse, в тестовых средах или в средах с низкой скоростью ингестии.
Для продуктивных сред мы рекомендуем использовать отдельные серверы для ClickHouse и ZooKeeper/Keeper либо разместить файлы ClickHouse и файлы Keeper на отдельных дисках, поскольку ZooKeeper/Keeper очень чувствительны к задержкам дисковой подсистемы, а ClickHouse может использовать все доступные системные ресурсы.

В ансамбле могут быть наблюдатели ZooKeeper, но серверы ClickHouse не должны взаимодействовать с наблюдателями.

Не изменяйте настройку `minSessionTimeout`, большие значения могут повлиять на стабильность перезапуска ClickHouse.

С настройками по умолчанию ZooKeeper – это мина замедленного действия:

> При использовании конфигурации по умолчанию сервер ZooKeeper не удаляет файлы старых snapshots и журналов (см. `autopurge`), и это остаётся обязанностью оператора.

Эту мину необходимо обезвредить.

Ниже приведена конфигурация ZooKeeper (3.5.1), используемая в крупной продуктивной среде:

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

Версия для Java:

```text
openjdk 11.0.5-shenandoah 2019-10-15
OpenJDK Runtime Environment (build 11.0.5-shenandoah+10-adhoc.heretic.src)
OpenJDK 64-Bit Server VM (build 11.0.5-shenandoah+10-adhoc.heretic.src, mixed mode)
```

Параметры JVM:

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

Инициализация соли:

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

## Антивирусное программное обеспечение \{#antivirus-software\}

Если вы используете антивирусное программное обеспечение, настройте его так, чтобы оно не сканировало каталоги с данными ClickHouse (`/var/lib/clickhouse`), иначе производительность может снизиться, а во время ингестии данных и фоновых слияний могут возникать неожиданные ошибки.

## Похожие материалы \{#related-content\}

- [Только начинаете работать с ClickHouse? Вот 13 «смертных грехов» и способы их избежать](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)