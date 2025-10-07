---
slug: '/operations/tips'
sidebar_label: 'Рекомендации по использованию'
sidebar_position: 58
description: 'Документация для http://hadoop.apache.org/ZooKeeper/docs/current/zookeeperAdmin.html'
title: 'Рекомендации по использованию'
doc_type: guide
---
import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />

## Регулятор масштабирования процессора {#cpu-scaling-governor}

Всегда используйте регулятор масштабирования `performance`. Регулятор `on-demand` работает значительно хуже при постоянно высоком спросе.

```bash
$ echo 'performance' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
```

## Ограничения процессора {#cpu-limitations}

Процессоры могут перегреваться. Используйте `dmesg`, чтобы увидеть, была ли ограничена тактовая частота процессора из-за перегрева. Ограничение также может устанавливаться внешне на уровне дата-центра. Вы можете использовать `turbostat`, чтобы отслеживать его под нагрузкой.

## Оперативная память {#ram}

Для небольших объемов данных (до ~200 ГБ в сжатом виде) лучше использовать столько же памяти, сколько объем данных. Для больших объемов данных и при обработке интерактивных (онлайн) запросов следует использовать разумное количество ОЗУ (128 ГБ или больше), чтобы горячий подмассив данных помещался в кэш страниц. Даже для объемов данных ~50 ТБ на сервер, использование 128 ГБ ОЗУ значительно улучшает производительность запросов по сравнению с 64 ГБ.

Не отключайте overcommit. Значение `cat /proc/sys/vm/overcommit_memory` должно быть 0 или 1. Запустите

```bash
$ echo 0 | sudo tee /proc/sys/vm/overcommit_memory
```

Используйте `perf top`, чтобы отслеживать время, проведенное в ядре для управления памятью. Постоянные огромные страницы также не нужно выделять.

### Использование менее 16 ГБ ОЗУ {#using-less-than-16gb-of-ram}

Рекомендуемое количество ОЗУ - 32 ГБ или больше.

Если у вашей системы менее 16 ГБ ОЗУ, вы можете столкнуться с различными исключениями памяти, поскольку настройки по умолчанию не соответствуют этому объему памяти. Вы можете использовать ClickHouse в системе с небольшим объемом ОЗУ (до 2 ГБ), но такие настройки требуют дополнительной настройки и могут обрабатывать данные с низкой скоростью.

При использовании ClickHouse с менее чем 16 ГБ ОЗУ, мы рекомендуем следующее:

- Уменьшите размер кэша меток в `config.xml`. Его можно установить как минимум на 500 МБ, однако он не может быть равен нулю.
- Уменьшите количество потоков обработки запросов до `1`.
- Уменьшите `max_block_size` до `8192`. Значения до `1024` все еще могут быть практичными.
- Уменьшите `max_download_threads` до `1`.
- Установите `input_format_parallel_parsing` и `output_format_parallel_formatting` в `0`.
- Отключите запись в журнальные таблицы, так как это удерживает фоновую задачу слияния, резервируя ОЗУ для выполнения слияний журнальных таблиц. Отключите `asynchronous_metric_log`, `metric_log`, `text_log`, `trace_log`.

Дополнительные заметки:
- Чтобы сбросить память, кэшированную выделителем памяти, вы можете запустить команду `SYSTEM JEMALLOC PURGE`.
- Мы не рекомендуем использовать интеграции S3 или Kafka на машинах с низкой памятью, так как они требуют значительного объема памяти для буферов.

## Система хранения {#storage-subsystem}

Если ваш бюджет позволяет, используйте SSD. Если нет, используйте HDD. SATA HDD на 7200 об/мин подойдут.

Предпочитайте большое количество серверов с локальными жесткими дисками меньшему количеству серверов с подключенными дисковыми полками. Но для хранения архивов с редкими запросами дисковые полки будут работать.

## RAID {#raid}

При использовании HDD вы можете комбинировать их в RAID-10, RAID-5, RAID-6 или RAID-50. Для Linux программный RAID лучше (с помощью `mdadm`). При создании RAID-10 выберите раскладку `far`. Если ваш бюджет позволяет, выбирайте RAID-10.

LVM сам по себе (без RAID или `mdadm`) нормально, но создание RAID с ним или комбинирование с `mdadm` является менее исследованным вариантом, и есть больше шансов на ошибки (выбор неправильного размера блока; неправильное выравнивание блоков; выбор неправильного типа RAID; забывание очистки дисков). Если вы уверены в использовании LVM, то нет ничего против его использования.

Если у вас более 4 дисков, используйте RAID-6 (предпочтительно) или RAID-50 вместо RAID-5. При использовании RAID-5, RAID-6 или RAID-50 всегда увеличивайте stripe_cache_size, так как значение по умолчанию обычно не является оптимальным выбором.

```bash
$ echo 4096 | sudo tee /sys/block/md2/md/stripe_cache_size
```

Рассчитайте точное количество из количества устройств и размера блока, используя формулу: `2 * num_devices * chunk_size_in_bytes / 4096`.

Размер блока 64 КБ достаточен для большинства конфигураций RAID. Средний размер записи clickhouse-server составляет примерно 1 МБ (1024 КБ), и, следовательно, рекомендуемый размер полосы также составляет 1 МБ. Размер блока может быть оптимизирован при необходимости, когда устанавливается на 1 МБ, деленный на количество дисков без четности в массиве RAID, так чтобы каждое записываемое действие выполнялось параллельно на всех доступных дисках без четности. Никогда не устанавливайте размер блока слишком маленьким или слишком большим.

Вы можете использовать RAID-0 на SSD. Независимо от использования RAID, всегда используйте репликацию для безопасности данных.

Включите NCQ с длинной очередью. Для HDD выберите планировщик mq-deadline или CFQ, а для SSD выберите noop. Не уменьшайте настройку 'readahead'. Для HDD включите кэш записи.

Убедитесь, что [`fstrim`](https://en.wikipedia.org/wiki/Trim_(computing)) включен для NVME и SSD-дисков в вашей ОС (обычно это реализуется с помощью cronjob или системной службы).

## Файловая система {#file-system}

Ext4 является самым надежным вариантом. Установите параметры монтирования `noatime`. XFS также хорошо работает. Большинство других файловых систем тоже должны работать нормально.

FAT-32 и exFAT не поддерживаются из-за отсутствия жестких ссылок.

Не используйте сжатые файловые системы, так как ClickHouse выполняет сжатие самостоятельно и лучше. Не рекомендуется использовать зашифрованные файловые системы, так как вы можете использовать встроенное шифрование в ClickHouse, которое лучше.

Хотя ClickHouse может работать через NFS, это не лучшее решение.

## Ядро Linux {#linux-kernel}

Не используйте устаревшее ядро Linux.

## Сеть {#network}

Если вы используете IPv6, увеличьте размер кэша маршрутов. Ядро Linux до 3.2 имело множество проблем с реализацией IPv6.

Используйте сеть не менее 10 ГБ, если возможно. 1 Гб также будет работать, но это будет значительно хуже для восстановления реплик с десятками терабайт данных или для обработки распределенных запросов с большим объемом промежуточных данных.

## Огромные страницы {#huge-pages}

Если вы используете старое ядро Linux, отключите прозрачные огромные страницы. Это мешает выделителю памяти, что приводит к значительному ухудшению производительности. На более новых ядрах Linux прозрачные огромные страницы вполне приемлемы.

```bash
$ echo 'madvise' | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
```

Если вы хотите постоянно изменить настройку прозрачных огромных страниц, отредактируйте файл `/etc/default/grub`, добавив `transparent_hugepage=madvise` к опции `GRUB_CMDLINE_LINUX_DEFAULT`:

```bash
$ GRUB_CMDLINE_LINUX_DEFAULT="transparent_hugepage=madvise ..."
```

После этого выполните команду `sudo update-grub`, а затем перезагрузите, чтобы изменения вступили в силу.

## Конфигурация гипервизора {#hypervisor-configuration}

Если вы используете OpenStack, установите
```ini
cpu_mode=host-passthrough
```
в `nova.conf`.

Если вы используете libvirt, установите
```xml
<cpu mode='host-passthrough'/>
```
в XML-конфигурации.

Это важно для того, чтобы ClickHouse мог получить корректную информацию с помощью инструкции `cpuid`. В противном случае вы можете получить сбои с ошибкой `Illegal instruction`, когда гипервизор запускается на старых моделях процессоров.

## ClickHouse Keeper и ZooKeeper {#zookeeper}

Рекомендуется использовать ClickHouse Keeper, чтобы заменить ZooKeeper для кластеров ClickHouse. См. документацию по [ClickHouse Keeper](../guides/sre/keeper/index.md)

Если вы хотите продолжать использовать ZooKeeper, лучше использовать свежую версию ZooKeeper – 3.4.9 или новее. Версия в стабильных дистрибутивах Linux может быть устаревшей.

Вы никогда не должны использовать вручную написанные скрипты для передачи данных между различными кластерами ZooKeeper, так как результат будет некорректным для последовательных узлов. Никогда не используйте утилиту "zkcopy" по той же причине: https://github.com/ksprojects/zkcopy/issues/15

Если вы хотите разделить существующий кластер ZooKeeper на два, правильный способ – увеличить количество его реплик, а затем перенастроить его как два независимых кластера.

Вы можете запустить ClickHouse Keeper на том же сервере, что и ClickHouse в тестовых средах или в средах с низкой скоростью приема данных. Для производственных сред мы предлагаем использовать отдельные серверы для ClickHouse и ZooKeeper/Keeper или разместить файлы ClickHouse и файлы Keeper на разных дисках. Поскольку ZooKeeper/Keeper очень чувствительны к задержке диска, а ClickHouse может использовать все доступные системные ресурсы.

Вы можете иметь наблюдателей ZooKeeper в ансамбле, но серверы ClickHouse не должны взаимодействовать с наблюдателями.

Не изменяйте настройку `minSessionTimeout`, большие значения могут повлиять на стабильность перезапуска ClickHouse.

С настройками по умолчанию ZooKeeper является бомбой замедленного действия:

> Сервер ZooKeeper не будет удалять файлы из старых снимков и журналов при использовании конфигурации по умолчанию (см. `autopurge`), и это обязанность оператора.

Эту бомбу необходимо обезвредить.

Конфигурация ZooKeeper (3.5.1) ниже используется в крупной производственной среде:

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

Версия Java:

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

## Антивирусное программное обеспечение {#antivirus-software}

Если вы используете антивирусное программное обеспечение, настройте его так, чтобы он пропускал папки с файлами данных ClickHouse (`/var/lib/clickhouse`), иначе производительность может снизиться, и вы можете столкнуться с неожиданными ошибками во время приема данных и фоновых слияний.

## Связанный контент {#related-content}

- [Вы только начинаете с ClickHouse? Вот 13 "Смертных грехов" и как их избежать](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)