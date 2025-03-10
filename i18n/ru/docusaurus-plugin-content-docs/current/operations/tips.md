---
slug: /operations/tips
sidebar_position: 58
sidebar_label: Рекомендации по использованию
title: 'Рекомендации по использованию'
---

import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />

## Управление масштабированием ЦП {#cpu-scaling-governor}

Всегда используйте режим масштабирования `performance`. Режим масштабирования `on-demand` работает гораздо хуже при постоянно высоком спросе.

``` bash
$ echo 'performance' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
```

## Ограничения на ЦП {#cpu-limitations}

Процессоры могут перегреваться. Используйте `dmesg`, чтобы проверить, была ли ограничена тактовая частота ЦП из-за перегрева. Ограничение также может быть установлено внешне на уровне дата-центра. Вы можете использовать `turbostat`, чтобы контролировать это под нагрузкой.

## ОЗУ {#ram}

Для небольших объемов данных (до ~200 ГБ в сжатом виде) лучше использовать столько же памяти, сколько объем данных. Для больших объемов данных и при обработке интерактивных (онлайн) запросов следует использовать разумное количество ОЗУ (128 ГБ или больше), чтобы горячая подсеть данных поместилась в кэш страниц. Даже для объемов данных ~50 ТБ на сервер 128 ГБ ОЗУ значительно улучшает производительность запросов по сравнению с 64 ГБ.

Не отключайте overcommit. Значение `cat /proc/sys/vm/overcommit_memory` должно быть 0 или 1. Запустите

``` bash
$ echo 0 | sudo tee /proc/sys/vm/overcommit_memory
```

Используйте `perf top`, чтобы отслеживать время, затраченное на управление памятью в ядре. Постоянные большие страницы также не требуют выделения.

### Использование менее 16 ГБ ОЗУ {#using-less-than-16gb-of-ram}

Рекомендуемое количество ОЗУ — 32 ГБ или больше.

Если у вашей системы менее 16 ГБ ОЗУ, вы можете столкнуться с различными исключениями памяти, поскольку параметры по умолчанию не соответствуют этому объему памяти. Вы можете использовать ClickHouse в системе с небольшим количеством ОЗУ (даже 2 ГБ), но такие настройки требуют дополнительной настройки и могут обрабатывать данные только с низкой скоростью.

При использовании ClickHouse с менее чем 16 ГБ ОЗУ, мы рекомендуем следующее:

- Уменьшить размер кэша марок в `config.xml`. Его можно установить как минимум на 500 МБ, но его нельзя установить на ноль.
- Уменьшить количество потоков обработки запроса до `1`.
- Уменьшить `max_block_size` до `8192`. Значения как минимум `1024` также могут быть практически полезными.
- Уменьшить `max_download_threads` до `1`.
- Установить `input_format_parallel_parsing` и `output_format_parallel_formatting` в `0`.

Дополнительные примечания:
- Чтобы очистить память, кэшированную распределителем памяти, вы можете выполнить команду `SYSTEM JEMALLOC PURGE`.
- Мы не рекомендуем использовать интеграции S3 или Kafka на машинах с низким объемом памяти, так как они требуют значительного объема памяти для буферов.

## Подсистема хранения {#storage-subsystem}

Если ваш бюджет позволяет использовать SSD, используйте SSD. Если нет, используйте HDD. SATA HDD 7200 об/мин подойдут.

Отдавайте предпочтение большему количеству серверов с локальными жесткими дисками, чем меньшему количеству серверов с подключенными дисковыми шкафами. Но для хранения архивов с редкими запросами шкафы будут работать.

## RAID {#raid}

При использовании HDD можете комбинировать их в RAID-10, RAID-5, RAID-6 или RAID-50. Для Linux программный RAID лучше (с `mdadm`). При создании RAID-10 выберите раскладку `far`. Если бюджет позволяет, выбирайте RAID-10.

LVM сам по себе (без RAID или `mdadm`) приемлем, но создание RAID с ним или комбинирование с `mdadm` является менее исследованным вариантом, и появится больше шансов на ошибки (неправильный размер блока; несоответствие выравнивания блоков; выбор неправильного типа RAID; забыв очистить диски). Если вы уверены в использовании LVM, нет ничего плохого в его использовании.

Если у вас более 4 дисков, используйте RAID-6 (предпочтительно) или RAID-50, вместо RAID-5. При использовании RAID-5, RAID-6 или RAID-50 всегда увеличивайте stripe_cache_size, так как значение по умолчанию обычно не является лучшим выбором.

``` bash
$ echo 4096 | sudo tee /sys/block/md2/md/stripe_cache_size
```

Расчитайте точное число исходя из количества устройств и размера блока, используя формулу: `2 * num_devices * chunk_size_in_bytes / 4096`.

Размер блока 64 КБ достаточен для большинства конфигураций RAID. Средний размер записи clickhouse-server составляет примерно 1 МБ (1024 КБ), поэтому рекомендуемый размер полосы также составляет 1 МБ. Размер блока можно оптимизировать, если необходимо, при установке в 1 МБ деленный на количество дисков без четности в массиве RAID, чтобы каждая запись была параллелизована по всем доступным дискам без четности. Никогда не устанавливайте размер блока слишком маленьким или слишком большим.

Вы можете использовать RAID-0 на SSD. Независимо от использования RAID, всегда используйте репликацию для безопасности данных.

Включите NCQ с длинной очередью. Для HDD выберите планировщик mq-deadline или CFQ, а для SSD выберите noop. Не снижайте значение параметра 'readahead'. Для HDD включите кэш записи.

Убедитесь, что [`fstrim`](https://en.wikipedia.org/wiki/Trim_(computing)) включен для дисков NVME и SSD в вашей ОС (обычно это реализуется с помощью cronjob или systemd-сервиса).

## Файловая система {#file-system}

Ext4 является самым надежным вариантом. Установите параметры монтирования `noatime`. XFS также хорошо работает. Большинство других файловых систем также должны работать нормально.

FAT-32 и exFAT не поддерживаются из-за отсутствия жестких ссылок.

Не используйте сжатые файловые системы, так как ClickHouse выполняет сжатие самостоятельно и лучше. Не рекомендуется использовать зашифрованные файловые системы, так как вы можете использовать встроенное шифрование в ClickHouse, которое лучше.

Хотя ClickHouse может работать через NFS, это не самая лучшая идея.

## Ядро Linux {#linux-kernel}

Не используйте устаревшее ядро Linux.

## Сеть {#network}

Если вы используете IPv6, увеличьте размер кэша маршрутов. В ядре Linux до 3.2 было множество проблем с реализацией IPv6.

Используйте сеть минимум 10 Гб, если возможно. 1 Гб также сработает, но это будет намного хуже для обновления реплик с десятками терабайт данных или для обработки распределенных запросов с большим объемом промежуточных данных.

## Большие страницы {#huge-pages}

Если вы используете старое ядро Linux, отключите прозрачные большие страницы. Они мешают распределителю памяти, что приводит к значительному ухудшению производительности. На более новых ядрах Linux прозрачные большие страницы в порядке.

``` bash
$ echo 'madvise' | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
```

Если вы хотите изменить настройку прозрачных больших страниц навсегда, отредактируйте файл `/etc/default/grub`, чтобы добавить `transparent_hugepage=madvise` в параметр `GRUB_CMDLINE_LINUX_DEFAULT`:

```bash
$ GRUB_CMDLINE_LINUX_DEFAULT="transparent_hugepage=madvise ..."
```

После этого выполните команду `sudo update-grub`, затем перезагрузите, чтобы изменения вступили в силу.

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

Это важно для того, чтобы ClickHouse мог получать правильную информацию с помощью инструкции `cpuid`. В противном случае вы можете получить сбои `Illegal instruction`, когда гипервизор работает на старых моделях ЦП.

## ClickHouse Keeper и ZooKeeper {#zookeeper}

Рекомендуется использовать ClickHouse Keeper вместо ZooKeeper для кластеров ClickHouse. См. документацию по [ClickHouse Keeper](../guides/sre/keeper/index.md).

Если вы хотите продолжать использовать ZooKeeper, лучше всего использовать свежую версию ZooKeeper — 3.4.9 или более позднюю. Версия в стабильных дистрибутивах Linux может быть устаревшей.

Вы никогда не должны использовать вручную написанные скрипты для передачи данных между различными кластерами ZooKeeper, потому что результат будет неправильным для последовательных узлов. Никогда не используйте утилиту "zkcopy" по той же причине: https://github.com/ksprojects/zkcopy/issues/15

Если вы хотите разделить существующий кластер ZooKeeper на два, правильный способ — увеличить количество его реплик, а затем перенастроить его как два независимых кластера.

Вы можете запустить ClickHouse Keeper на том же сервере, что и ClickHouse, в тестовых средах или в средах с низкой скоростью ингеста. Для производственных сред мы рекомендуем использовать отдельные серверы для ClickHouse и ZooKeeper/Keeper или разместить файлы ClickHouse и файлы Keeper на отдельных дисках. Поскольку ZooKeeper/Keeper очень чувствительны к задержкам диска, а ClickHouse может использовать все доступные системные ресурсы.

Вы можете иметь наблюдателей ZooKeeper в ансамбле, но серверы ClickHouse не должны взаимодействовать с наблюдателями.

Не изменяйте настройку `minSessionTimeout`, большие значения могут повлиять на стабильность перезапуска ClickHouse.

При настройках по умолчанию ZooKeeper является бомбой замедленного действия:

> Сервер ZooKeeper не удаляет файлы из старых снимков и журналов при использовании конфигурации по умолчанию (см. `autopurge`), и эта ответственность лежит на операторе.

Эту бомбу нужно обезвредить.

Конфигурация ZooKeeper (3.5.1) ниже используется в крупной производственной среде:

zoo.cfg:

``` bash

# http://hadoop.apache.org/zookeeper/docs/current/zookeeperAdmin.html


# Количество миллисекунд каждого тика
tickTime=2000

# Количество тиков, которые может занять начальная

# фаза синхронизации

# Это значение не совсем оправдано
initLimit=300

# Количество тиков, которые могут пройти между

# отправкой запроса и получением подтверждения
syncLimit=10

maxClientCnxns=2000


# Это максимальное значение, которое клиент может запросить, и сервер примет.

# Нормально иметь высокое maxSessionTimeout на сервере, чтобы позволить клиентам работать с высоким временем ожидания сессии, если они хотят.

# Но мы запрашиваем тайм-аут сессии в 30 секунд по умолчанию (вы можете изменить его с session_timeout_ms в конфигурации ClickHouse).
maxSessionTimeout=60000000

# каталог, в котором хранится снимок.
dataDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/data

# Поместите dataLogDir на отдельный физический диск для повышения производительности
dataLogDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/logs

autopurge.snapRetainCount=10
autopurge.purgeInterval=1



# Чтобы избежать поисков ZooKeeper выделяет пространство в файле журнала транзакций

# блоками preAllocSize килобайт. Размер блока по умолчанию — 64 М. Одна причина

# для изменения размера блоков — уменьшить размер блока, если снимки

# создаются чаще. (Также смотрите snapCount).
preAllocSize=131072


# Клиенты могут отправлять запросы быстрее, чем ZooKeeper может их обработать,

# особенно если клиентов много. Чтобы предотвратить исчерпание памяти ZooKeeper

# из-за ожидающих запросов, ZooKeeper будет ограничивать клиентов так, чтобы

# не было более чем globalOutstandingLimit ожидающих запросов в системе. Значение по умолчанию — 1000.

# globalOutstandingLimit=1000


# ZooKeeper регистрирует транзакции в журнале транзакций. После snapCount транзакций

# записывается в файл журнала, запускается снимок и начинается новый файл журнала транзакций.

# Значение по умолчанию для snapCount — 100000.
snapCount=3000000


# Если этот параметр определен, запросы будут записываться в файл трассировки с именем

# traceFile.year.month.day.
#traceFile=


# Лидер принимает соединения клиентов. Значение по умолчанию — "да". Лидирующая машина

# координирует обновления. Для более высокой производительности обновления

# при малом снижении производительности чтения лидер может быть настроен так, чтобы не принимать клиентов и сосредоточиться на координации.
leaderServes=yes

standaloneEnabled=false
dynamicConfigFile=/etc/zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }}/conf/zoo.cfg.dynamic
```

Версия Java:

``` text
openjdk 11.0.5-shenandoah 2019-10-15
OpenJDK Runtime Environment (build 11.0.5-shenandoah+10-adhoc.heretic.src)
OpenJDK 64-Bit Server VM (build 11.0.5-shenandoah+10-adhoc.heretic.src, mixed mode)
```

Параметры JVM:

``` bash
NAME=zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }}
ZOOCFGDIR=/etc/$NAME/conf


# TODO это действительно ужасно

# Как выяснить, какие jar нужны?

# кажется, что log4j требует, чтобы файл log4j.properties был в classpath
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

``` text
description "zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }} централизованный сервис координации"

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

## Антивирусное ПО {#antivirus-software}

Если вы используете антивирусное программное обеспечение, настройте его на пропуск папок с файлами данных ClickHouse (`/var/lib/clickhouse`), иначе производительность может снизиться, и вы можете столкнуться с неожиданными ошибками во время загрузки данных и фоновых слияний.

## Связанный контент {#related-content}

- [Начинаете работать с ClickHouse? Вот 13 "смертных грехов" и как их избежать](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)
