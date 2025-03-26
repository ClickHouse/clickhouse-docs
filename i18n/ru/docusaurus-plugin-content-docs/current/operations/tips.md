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

Всегда используйте `performance` для управления масштабированием. `on-demand` работает значительно хуже при постоянно высоком спросе.

```bash
$ echo 'performance' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
```

## Ограничения CPU {#cpu-limitations}

Процессоры могут перегреваться. Используйте `dmesg`, чтобы увидеть, если тактовая частота CPU была ограничена из-за перегрева.  
Ограничение также может быть установлено извне на уровне датacenter. Вы можете использовать `turbostat` для мониторинга под нагрузкой.

## ОПЕРАТИВНАЯ ПАМЯТЬ {#ram}

Для небольших объемов данных (до ~200 ГБ сжатых) лучше использовать столько же памяти, сколько объема данных.  
Для больших объемов данных и при выполнении интерактивных (онлайн) запросов следует использовать разумное количество ОП (128 ГБ или более), чтобы горячий подмножество данных помещалось в кэш страниц.  
Даже для объемов данных ~50 ТБ на сервере использование 128 ГБ ОП значительно улучшает производительность запросов по сравнению с 64 ГБ.

Не отключайте перерасход. Значение `cat /proc/sys/vm/overcommit_memory` должно быть 0 или 1. Запустите

```bash
$ echo 0 | sudo tee /proc/sys/vm/overcommit_memory
```

Используйте `perf top`, чтобы отслеживать время, проводимое в ядре для управления памятью.  
Постоянные огромные страницы также не нужно выделять.

### Использование менее 16 ГБ ОП {#using-less-than-16gb-of-ram}

Рекомендуемое количество ОП — 32 ГБ или более.

Если ваша система имеет менее 16 ГБ ОП, вы можете столкнуться с различными исключениями по памяти, так как настройки по умолчанию не соответствуют этому объему памяти. Вы можете использовать ClickHouse в системе с небольшим объемом ОП (до 2 ГБ), но такие настройки требуют дополнительной настройки и могут только принимать данные с низкой скоростью.

При использовании ClickHouse с менее чем 16 ГБ ОП мы рекомендуем следующее:

- Уменьшите размер кэша меток в `config.xml`. Его можно установить на уровне 500 МБ, но не на ноль.
- Уменьшите количество потоков обработки запросов до `1`.
- Уменьшите `max_block_size` до `8192`. Значения до `1024` также могут быть практичными.
- Уменьшите `max_download_threads` до `1`.
- Установите `input_format_parallel_parsing` и `output_format_parallel_formatting` на `0`.

Дополнительные заметки:
- Чтобы очистить память, кэшируемую распределителем памяти, вы можете выполнить команду `SYSTEM JEMALLOC PURGE`.
- Мы не рекомендуем использовать интеграцию S3 или Kafka на машинах с низкой памятью, так как они требуют значительное количество памяти для буферов.

## Хранилище {#storage-subsystem}

Если ваш бюджет позволяет использовать SSD, используйте SSD.  
Если нет, используйте HDD. SATA HDD на 7200 об/мин подойдут.

Отдавайте предпочтение множеству серверов с локальными жесткими дисками, чем меньшему количеству серверов с прикреплёнными дисковыми полками.  
Но для хранения архивов с редкими запросами полки будут работать.

## RAID {#raid}

При использовании HDD можно комбинировать RAID-10, RAID-5, RAID-6 или RAID-50.  
Для Linux лучше использовать программный RAID (с `mdadm`).  
При создании RAID-10 выберите компоновку `far`.  
Если бюджет позволяет, выбирайте RAID-10.

LVM само по себе (без RAID или `mdadm`) допустимо, но создание RAID с ним или комбинирование с `mdadm` является менее исследуемым вариантом, и будет больше шансов на ошибки (выбор неправильного размера блока; неправильное выравнивание блоков; выбор неправильного типа RAID; забывание очистки дисков). Если вы уверены в использовании LVM, то нет ничего против его использования.

Если у вас есть более 4 дисков, используйте RAID-6 (предпочтительно) или RAID-50, вместо RAID-5.  
При использовании RAID-5, RAID-6 или RAID-50 всегда увеличивайте размер `stripe_cache_size`, так как значение по умолчанию обычно не лучший выбор.

```bash
$ echo 4096 | sudo tee /sys/block/md2/md/stripe_cache_size
```

Рассчитайте точное число из количества устройств и размера блока, используя формулу: `2 * num_devices * chunk_size_in_bytes / 4096`.

Размер блока 64 КБ достаточно для большинства конфигураций RAID. Средний размер записи clickhouse-server составляет примерно 1 МБ (1024 КБ), и поэтому рекомендуется размер полосы также 1 МБ. Размер блока можно оптимизировать, при необходимости установив на 1 МБ, делённый на количество ненаблюдаемых дисков в массиве RAID, так чтобы каждая запись была параллелизирована на все доступные ненаблюдаемые диски.  
Никогда не устанавливайте размер блока слишком маленьким или слишком большим.

Вы можете использовать RAID-0 на SSD.  
Несмотря на использование RAID, всегда используйте репликацию для безопасности данных.

Включите NCQ с длинной очередью. Для HDD выберите планировщик mq-deadline или CFQ, а для SSD выберите noop. Не уменьшавайте настройку 'readahead'.  
Для HDD включите кэш записи.

Убедитесь, что [`fstrim`](https://en.wikipedia.org/wiki/Trim_(computing)) включен для дисков NVME и SSD в вашей ОС (обычно это реализуется с помощью cronjob или службы systemd).

## Файловая система {#file-system}

Ext4 является наиболее надежным вариантом. Установите параметры монтирования `noatime`. XFS также хорошо работает.  
Большинство других файловых систем также должны работать нормально.

FAT-32 и exFAT не поддерживаются из-за отсутствия жестких ссылок.

Не используйте сжатые файловые системы, так как ClickHouse сам выполняет сжатие и лучше.  
Не рекомендуется использовать зашифрованные файловые системы, поскольку вы можете использовать встроенное шифрование в ClickHouse, которое лучше.

Хотя ClickHouse может работать через NFS, это не лучшая идея.

## Ядро Linux {#linux-kernel}

Не используйте устаревшее ядро Linux.

## Сеть {#network}

Если вы используете IPv6, увеличьте размер кэша маршрута.  
Ядро Linux до 3.2 имело множество проблем с реализацией IPv6.

Используйте как минимум 10 ГБ сети, если это возможно. 1 Гб также будет работать, но будет значительно хуже для обновления реплик с десятками терабайт данных или для обработки распределённых запросов с большим количеством промежуточных данных.

## Огромные страницы {#huge-pages}

Если вы используете старое ядро Linux, отключите прозрачные огромные страницы. Они мешают распределителю памяти, что приводит к значительному падению производительности.  
На новых ядрах Linux прозрачные огромные страницы в порядке.

```bash
$ echo 'madvise' | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
```

Если вы хотите изменить настройки прозрачных огромных страниц на постоянной основе, отредактируйте файл `/etc/default/grub`, чтобы добавить `transparent_hugepage=madvise` в параметры `GRUB_CMDLINE_LINUX_DEFAULT`:

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

Это важно для ClickHouse, чтобы он смог получить правильную информацию с помощью инструкции `cpuid`.  
В противном случае вы можете получить сбои `Illegal instruction`, если гипервизор работает на старых моделях CPU.

## ClickHouse Keeper и ZooKeeper {#zookeeper}

Рекомендуется использовать ClickHouse Keeper для замены ZooKeeper в кластерах ClickHouse. Смотрите документацию по [ClickHouse Keeper](../guides/sre/keeper/index.md)

Если вы хотите продолжать использовать ZooKeeper, лучше использовать свежую версию ZooKeeper — 3.4.9 или новее. Версия в стабильных дистрибутивах Linux может быть устаревшей.

Никогда не используйте вручную написанные скрипты для передачи данных между различными кластерами ZooKeeper, так как результат будет некорректным для последовательных узлов. Никогда не используйте утилиту "zkcopy" по той же причине: https://github.com/ksprojects/zkcopy/issues/15

Если вы хотите разделить существующий кластер ZooKeeper на два, правильный способ — увеличить количество его реплик, а затем перенастроить его в два независимых кластера.

Вы можете запускать ClickHouse Keeper на том же сервере, что и ClickHouse в тестовых средах или в средах с низкой скоростью поступления данных.  
Для производственных сред мы предлагаем использовать отдельные серверы для ClickHouse и ZooKeeper/Keeper или разместить файлы ClickHouse и Keeper на отдельных дисках. Поскольку ZooKeeper/Keeper очень чувствительны к задержкам диска, и ClickHouse может использовать все доступные системные ресурсы.

Вы можете иметь наблюдателей ZooKeeper в ансамбле, но серверы ClickHouse не должны взаимодействовать с наблюдателями.

Не изменяйте параметр `minSessionTimeout`, большие значения могут повлиять на стабильность перезапуска ClickHouse.

При настройках по умолчанию ZooKeeper — это бомба замедленного действия:

> Сервис ZooKeeper не удалит файлы со старых снимков и журналов, используя конфигурацию по умолчанию (см. `autopurge`), и это ответственность оператора.

Эту бомбу необходимо разминировать.

Конфигурация ZooKeeper (3.5.1) ниже применяется в крупной производственной среде:

zoo.cfg:

```bash

# http://hadoop.apache.org/zookeeper/docs/current/zookeeperAdmin.html


# Количество миллисекунд каждого тика
tickTime=2000

# Количество тиков, которые может занять начальная

# фаза синхронизации

# Эта величина не совсем обоснована
initLimit=300

# Количество тиков, которые могут пройти между

# отправкой запроса и получением подтверждения
syncLimit=10

maxClientCnxns=2000


# Это максимум, который клиент может запросить и который сервер примет.

# Наличие высокого maxSessionTimeout на сервере допускается, чтобы клиенты могли работать с высоким временем ожидания сессии, если они хотят.

# Но мы по умолчанию запрашиваем время ожидания сессии 30 секунд (вы можете изменить это с помощью session_timeout_ms в конфигурации ClickHouse).
maxSessionTimeout=60000000

# директория, где хранится снимок.
dataDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/data

# Поместите dataLogDir на отдельный физический диск для улучшения производительности
dataLogDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/logs

autopurge.snapRetainCount=10
autopurge.purgeInterval=1



# Чтобы избежать поиска, ZooKeeper выделяет пространство в файле журнала транзакций

# блоками предопределённого размера в килобайтах. Размер блока по умолчанию составляет 64 М. Одна из причин

# для изменения размера блоков — уменьшить размер блока, если снимки

# делаются чаще. (Смотрите также snapCount).
preAllocSize=131072


# Клиенты могут отправлять запросы быстрее, чем ZooKeeper может их обработать,

# особенно если клиентов много. Чтобы предотвратить исчерпание памяти ZooKeeper из-за ожидающих запросов,

# ZooKeeper будет ограничивать клиентов, так что

# в системе не будет более чем globalOutstandingLimit ожидающих запросов.

# Значение по умолчанию равно 1000.

# globalOutstandingLimit=1000


# ZooKeeper записывает транзакции в журнал транзакций. После того как snapCount транзакций

# записана в файл журнала, начинается снимок, и начинается новый журнал транзакций.

# Значение по умолчанию для snapCount равно 100000.
snapCount=3000000


# Если этот параметр определен, запросы будут записываться в файл трассировки с именем

# traceFile.year.month.day.
#traceFile=


# Лидер принимает клиентские соединения. Значение по умолчанию "да". Машина лидера

# координирует обновления. Для повышения пропускной способности обновлений за счёт 

# небольшого уменьшения пропускной способности чтения лидер может быть сконфигурирован так, чтобы не принимать клиентов и сосредоточиться на координации.
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


# TODO это действительно плохо

# Как узнать, какие jars нужны?

# кажется, что log4j требует, чтобы файл log4j.properties находился в classpath
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

## Антивирусное программное обеспечение {#antivirus-software}

Если вы используете антивирусное программное обеспечение, сконфигурируйте его, чтобы пропускать папки с данными ClickHouse (`/var/lib/clickhouse`), в противном случае производительность может быть снижена, и вы можете столкнуться с неожиданными ошибками во время загрузки данных и фоновых объединений.

## Связанные материалы {#related-content}

- [Начинаете использовать ClickHouse? Вот 13 "смертных грехов" и как их избежать](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)
