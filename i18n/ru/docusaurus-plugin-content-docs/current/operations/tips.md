---
description: 'Документация для http://hadoop.apache.org/zookeeper/docs/current/zookeeperAdmin.html'
sidebar_label: 'Рекомендации по использованию'
sidebar_position: 58
slug: /operations/tips
title: 'Рекомендации по использованию'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_automated.md';

<SelfManaged />

## CPU Scaling Governor {#cpu-scaling-governor}

Всегда используйте `performance` контроллер масштабирования. Контроллер масштабирования `on-demand` работает значительно хуже при постоянно высоком спросе.

```bash
$ echo 'performance' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
```

## Ограничения процессора {#cpu-limitations}

Процессоры могут перегреваться. Используйте `dmesg`, чтобы узнать, была ли ограничена тактовая частота CPU из-за перегрева. Ограничение также может быть установлено извне на уровне дата-центра. Вы можете использовать `turbostat`, чтобы отслеживать это под нагрузкой.

## Оперативная память {#ram}

Для небольших объёмов данных (до ~200 ГБ в сжатом виде) рекомендуется использовать столько же памяти, сколько объём данных. Для больших объёмов данных и при обработке интерактивных (онлайн) запросов следует использовать разумное количество оперативной памяти (128 ГБ или более), чтобы «горячая» подмножество данных помещалось в кэш страниц. Даже для объёмов данных около ~50 ТБ на сервер, использование 128 ГБ ОЗУ значительно улучшает производительность запросов по сравнению с 64 ГБ.

Не отключайте overcommit. Значение `cat /proc/sys/vm/overcommit_memory` должно быть 0 или 1. Выполните

```bash
$ echo 0 | sudo tee /proc/sys/vm/overcommit_memory
```

Используйте `perf top` для наблюдения за временем, проведенным в ядре для управления памятью. Постоянные большие страницы также не нужно выделять.

### Использование менее 16 ГБ ОЗУ {#using-less-than-16gb-of-ram}

Рекомендуемое количество оперативной памяти — 32 ГБ и более.

Если у вашей системы менее 16 ГБ ОЗУ, вы можете столкнуться с различными исключениями из-за того, что настройки по умолчанию не соответствуют этому объёму памяти. Вы можете использовать ClickHouse в системе с небольшим объёмом ОЗУ (даже от 2 ГБ), но такие настройки требуют дополнительной оптимизации и могут лишь слабо справляться с нагрузкой.

При использовании ClickHouse с менее чем 16 ГБ ОЗУ мы рекомендуем следующее:

- Уменьшите размер кэша меток в `config.xml`. Его можно установить до 500 МБ, но не ноль.
- Уменьшите количество потоков обработки запросов до `1`.
- Уменьшите `max_block_size` до `8192`. Значения до `1024` всё ещё могут быть практическими.
- Уменьшите `max_download_threads` до `1`.
- Установите `input_format_parallel_parsing` и `output_format_parallel_formatting` в `0`.

Дополнительные заметки:
- Чтобы сбросить кэш памяти, вы можете выполнить команду `SYSTEM JEMALLOC PURGE`.
- Мы не рекомендуем использовать интеграции S3 или Kafka на машинах с низким объёмом памяти, так как они требуют значительных объёмов памяти для буферов.

## Система хранения {#storage-subsystem}

Если ваш бюджет позволяет, используйте SSD. Если нет, используйте HDD. SATA HDD на 7200 об/мин подойдут.

Отдавайте предпочтение большому количеству серверов с локальными жесткими дисками, нежели меньшему количеству серверов с подключенными дисковыми полками. Но для хранения архивов с редкими запросами колонки подойдут.

## RAID {#raid}

При использовании HDD вы можете объединять их в RAID-10, RAID-5, RAID-6 или RAID-50. Для Linux лучше использовать программный RAID (с `mdadm`). 
При создании RAID-10 выберите компоновку `far`. Если ваш бюджет позволяет, выбирайте RAID-10.

LVM без RAID или `mdadm` нормально, но создание RAID с его помощью или объединение с `mdadm` — менее исследованный вариант, и есть больший риск ошибок (неправильный размер блока; неправильное выравнивание блоков; не тот тип RAID; забывание очистки дисков). Если вы уверены в использовании LVM, его можно использовать.

Если у вас более 4 дисков, используйте RAID-6 (предпочтительно) или RAID-50 вместо RAID-5. При использовании RAID-5, RAID-6 или RAID-50 всегда увеличивайте stripe_cache_size, так как значение по умолчанию обычно не лучшее.

```bash
$ echo 4096 | sudo tee /sys/block/md2/md/stripe_cache_size
```

Вычислите точное количество из числа устройств и размера блока, используя формулу: `2 * num_devices * chunk_size_in_bytes / 4096`.

Размер блока в 64 КБ достаточен для большинства конфигураций RAID. Средний размер записи clickhouse-server составляет около 1 МБ (1024 КБ), и, следовательно, рекомендуемый размер полосы также составляет 1 МБ. Размер блока можно оптимизировать при необходимости, установив его в 1 МБ, делённый на количество нечетных дисков в массиве RAID, таким образом, что каждая запись будет параллелизоваться по всем доступным нечетным дискам.
Никогда не устанавливайте размер блока слишком малым или слишком большим.

Вы можете использовать RAID-0 на SSD.
Независимо от использования RAID, всегда используйте репликацию для безопасности данных.

Включите NCQ с длинной очередью. Для HDD выбирайте планировщик mq-deadline или CFQ, а для SSD выбирайте noop. Не уменьшайте настройку 'readahead'.
Для HDD включите кеш записи.

Убедитесь, что [`fstrim`](https://en.wikipedia.org/wiki/Trim_(computing)) включён для дисков NVME и SSD в вашей ОС (обычно реализуется с помощью cronjob или systemd service).

## Файловая система {#file-system}

Ext4 является наиболее надёжным вариантом. Установите параметры монтирования `noatime`. XFS также хорошо работает. Большинство других файловых систем также должны работать нормально.

FAT-32 и exFAT не поддерживаются из-за отсутствия жестких ссылок.

Не используйте сжатые файловые системы, так как ClickHouse сжимает данные самостоятельно и лучше.
Не рекомендуется использовать зашифрованные файловые системы, так как в ClickHouse уже есть встроенное шифрование, которое лучше.

Хотя ClickHouse может работать через NFS, это не лучшая идея.

## Ядро Linux {#linux-kernel}

Не используйте устаревшее ядро Linux.

## Сеть {#network}

Если вы используете IPv6, увеличьте размер кэша маршрутов. Ядро Linux до 3.2 имело множество проблем с реализацией IPv6.

Используйте как минимум сеть 10 ГБ, если это возможно. 1 ГБ также будет работать, но это будет значительно хуже для обновления реплик с десятками терабайт данных или для обработки распределенных запросов с большим объёмом промежуточных данных.

## Большие страницы {#huge-pages}

Если вы используете старое ядро Linux, отключите прозрачные большие страницы. Это мешает выделителю памяти, что приводит к значительному снижению производительности. На более новых ядрах Linux прозрачные большие страницы допустимы.

```bash
$ echo 'madvise' | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
```

Если вы хотите изменить параметр прозрачных больших страниц на постоянной основе, отредактируйте `/etc/default/grub`, добавив `transparent_hugepage=madvise` в опцию `GRUB_CMDLINE_LINUX_DEFAULT`:

```bash
$ GRUB_CMDLINE_LINUX_DEFAULT="transparent_hugepage=madvise ..."
```

После этого выполните команду `sudo update-grub`, а затем перезагрузите для применения изменений.

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
в XML конфигурации.

Это важно, чтобы ClickHouse мог получать корректную информацию с помощью инструкции `cpuid`. В противном случае вы можете получить сбои `Illegal instruction`, когда гипервизор работает на старых моделях CPU.

## ClickHouse Keeper и ZooKeeper {#zookeeper}

Рекомендуется использовать ClickHouse Keeper вместо ZooKeeper для кластеров ClickHouse. Посмотрите документацию по [ClickHouse Keeper](../guides/sre/keeper/index.md).

Если вы хотите продолжать использовать ZooKeeper, то лучше использовать свежую версию ZooKeeper — 3.4.9 или позже. Версия в стабильных дистрибутивах Linux может быть устаревшей.

Никогда не используйте вручную написанные скрипты для передачи данных между различными кластерами ZooKeeper, так как результат будет некорректным для последовательных узлов. Никогда не используйте утилиту "zkcopy" по той же причине: https://github.com/ksprojects/zkcopy/issues/15.

Если вы хотите разделить существующий кластер ZooKeeper на два, правильный способ — увеличить количество его реплик, а затем переоснастить его как два независимых кластера.

Вы можете запустить ClickHouse Keeper на том же сервере, что и ClickHouse, в тестовых средах или в средах с низкой скоростью приёма. Для производственных сред мы рекомендуем использовать отдельные серверы для ClickHouse и ZooKeeper/Keeper или разместить файлы ClickHouse и файлы Keeper на отдельных дисках, поскольку ZooKeeper/Keeper очень чувствительны к задержке на диске, а ClickHouse может использовать все доступные системные ресурсы.

Вы можете иметь наблюдателей ZooKeeper в ансамбле, но серверы ClickHouse не должны взаимодействовать с наблюдателями.

Не изменяйте настройку `minSessionTimeout`, большие значения могут повлиять на стабильность перезапуска ClickHouse.

С настройками по умолчанию ZooKeeper — это бомба замедленного действия:

> Сервер ZooKeeper не будет удалять файлы из старых снимков и журналов при использовании конфигурации по умолчанию (см. `autopurge`), и это ответственность оператора.

Эту бомбу необходимо обезвредить.

Конфигурация ZooKeeper (3.5.1) ниже используется в крупной производственной среде:

zoo.cfg:

```bash

# http://hadoop.apache.org/zookeeper/docs/current/zookeeperAdmin.html


# Количество миллисекунд для каждого тикета
tickTime=2000

# Количество тиков, которые могут потребоваться для начальной

# фазы синхронизации

# Это значение в некотором смысле не вполне обосновано
initLimit=300

# Количество тиков, которые могут пройти между

# отправкой запроса и получением подтверждения
syncLimit=10

maxClientCnxns=2000


# Это максимальное значение, которое клиент может запросить,

# и сервер примет.

# Вполне приемлемо иметь высокое значение maxSessionTimeout на сервере,

# чтобы клиенты могли работать с высоким временем ожидания сессии, если захотят.

# Но мы запрашиваем таймаут сессии в 30 секунд по умолчанию (вы можете изменить его с помощью session_timeout_ms в конфигурации ClickHouse).
maxSessionTimeout=60000000

# директория, в которой хранятся снимки.
dataDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/data

# Разместите dataLogDir на отдельном физическом диске для лучшей производительности
dataLogDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/logs

autopurge.snapRetainCount=10
autopurge.purgeInterval=1


# Чтобы избежать поиска, ZooKeeper выделяет место в файле журнала транзакций в

# блоках размера preAllocSize килобайт. По умолчанию размер блока составляет 64 МБ. Одна из причин

# изменения размера блоков — снижение размера блока, если снимки

# создаются чаще. (Также см. snapCount).
preAllocSize=131072


# Клиенты могут отправлять запросы быстрее, чем ZooKeeper может их обрабатывать,

# особенно если клиентов много. Чтобы предотвратить переполнение памяти ZooKeeper

# из-за ожидающих запросов, ZooKeeper будет ограничивать клиентов так,

# чтобы не было более чем globalOutstandingLimit ожидающих запросов в системе.

# По умолчанию лимит составляет 1000.

# globalOutstandingLimit=1000


# ZooKeeper записывает транзакции в журнал транзакций. После snapCount транзакций

# записанных в файл журнала начинается снимок, и начинается новый файл журнала транзакций.

# По умолчанию snapCount составляет 100000.
snapCount=3000000


# Если этот параметр определён, запросы будут записываться в файл трассировки с именем

# traceFile.year.month.day.
#traceFile=


# Лидер принимает клиентские соединения. Значение по умолчанию "да". Лидерская машина

# координирует обновления. Для более высокой пропускной способности обновлений при

# незначительной потере

# пропускной способности чтения можно настроить лидера так, чтобы он не принимал клиентов и сосредоточился

# на координации.
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


# TODO это действительно стремно

# Как узнать, какие jar-файлы нужны?

# Похоже, что log4j требует, чтобы файл log4j.properties находился в classpath
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

Инициализация Salt:

```text
description "zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }} централизованная координационная служба"

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

Если вы используете антивирусное программное обеспечение, настройте его так, чтобы он пропускал папки с файлами данных ClickHouse (`/var/lib/clickhouse`), иначе производительность может снизиться, и вы можете столкнуться с неожиданными ошибками при приёме данных и фоновых слияниях.

## Связанный контент {#related-content}

- [Начинаете работать с ClickHouse? Вот 13 "смертных грехов" и как их избежать](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)
