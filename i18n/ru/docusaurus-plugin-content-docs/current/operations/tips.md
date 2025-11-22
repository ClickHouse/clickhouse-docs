---
description: 'Страница с рекомендациями по использованию ClickHouse с открытым исходным кодом'
sidebar_label: 'Рекомендации по использованию OSS'
sidebar_position: 58
slug: /operations/tips
title: 'Рекомендации по использованию OSS'
doc_type: 'guide'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_automated.md';

<SelfManaged />


## Регулятор частоты процессора {#cpu-scaling-governor}

Всегда используйте регулятор частоты `performance`. Регулятор `on-demand` работает значительно хуже при постоянно высокой нагрузке.

```bash
$ echo 'performance' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
```


## Ограничения ЦП {#cpu-limitations}

Процессоры могут перегреваться. Используйте `dmesg`, чтобы проверить, была ли снижена тактовая частота ЦП из-за перегрева.
Ограничение также может быть установлено извне на уровне дата-центра. Для мониторинга под нагрузкой можно использовать `turbostat`.


## Оперативная память {#ram}

Для небольших объёмов данных (до ~200 ГБ в сжатом виде) рекомендуется использовать объём памяти, равный объёму данных.
Для больших объёмов данных и при обработке интерактивных (онлайн) запросов следует использовать достаточный объём оперативной памяти (128 ГБ или более), чтобы горячее подмножество данных помещалось в кэше страниц.
Даже при объёмах данных ~50 ТБ на сервер использование 128 ГБ оперативной памяти значительно улучшает производительность запросов по сравнению с 64 ГБ.

Не отключайте overcommit. Значение `cat /proc/sys/vm/overcommit_memory` должно быть 0 или 1. Выполните

```bash
$ echo 0 | sudo tee /proc/sys/vm/overcommit_memory
```

Используйте `perf top` для отслеживания времени, затрачиваемого ядром на управление памятью.
Постоянные huge pages также не нужно выделять.

### Использование менее 16 ГБ оперативной памяти {#using-less-than-16gb-of-ram}

Рекомендуемый объём оперативной памяти составляет 32 ГБ или более.

Если в вашей системе менее 16 ГБ оперативной памяти, могут возникать различные исключения, связанные с памятью, поскольку настройки по умолчанию не рассчитаны на такой объём памяти. Вы можете использовать ClickHouse в системе с небольшим объёмом оперативной памяти (вплоть до 2 ГБ), но такие конфигурации требуют дополнительной настройки и могут обрабатывать данные только с низкой скоростью.

При использовании ClickHouse с объёмом оперативной памяти менее 16 ГБ рекомендуется следующее:

- Уменьшите размер кэша меток в `config.xml`. Его можно установить до 500 МБ, но нельзя устанавливать в ноль.
- Уменьшите количество потоков обработки запросов до `1`.
- Уменьшите `max_block_size` до `8192`. Значения вплоть до `1024` также могут быть приемлемыми.
- Уменьшите `max_download_threads` до `1`.
- Установите `input_format_parallel_parsing` и `output_format_parallel_formatting` в `0`.
- Отключите запись в таблицы логов, поскольку это приводит к резервированию оперативной памяти фоновой задачей слияния для выполнения слияний таблиц логов. Отключите `asynchronous_metric_log`, `metric_log`, `text_log`, `trace_log`.

Дополнительные замечания:

- Для очистки памяти, кэшированной аллокатором памяти, можно выполнить команду `SYSTEM JEMALLOC PURGE`.
- Мы не рекомендуем использовать интеграции S3 или Kafka на машинах с малым объёмом памяти, поскольку они требуют значительного объёма памяти для буферов.


## Подсистема хранения {#storage-subsystem}

Если бюджет позволяет использовать SSD, используйте SSD.
В противном случае используйте HDD. Подойдут жёсткие диски SATA 7200 об/мин.

Предпочтительнее использовать большое количество серверов с локальными жёсткими дисками, чем меньшее количество серверов с подключаемыми дисковыми полками.
Однако для хранения архивов с редкими запросами дисковые полки вполне подходят.


## RAID {#raid}

При использовании жестких дисков (HDD) их можно объединить в RAID-10, RAID-5, RAID-6 или RAID-50.
Для Linux предпочтительнее программный RAID (с использованием `mdadm`).
При создании RAID-10 выбирайте схему размещения `far`.
Если бюджет позволяет, выбирайте RAID-10.

LVM сам по себе (без RAID или `mdadm`) приемлем, но создание RAID с его помощью или комбинирование с `mdadm` является менее изученным вариантом, и вероятность ошибок будет выше
(выбор неправильного размера chunk; несовпадение выравнивания chunk; выбор неподходящего типа RAID; пропуск очистки дисков). Если вы уверены
в использовании LVM, нет причин не использовать его.

Если у вас более 4 дисков, используйте RAID-6 (предпочтительно) или RAID-50 вместо RAID-5.
При использовании RAID-5, RAID-6 или RAID-50 всегда увеличивайте stripe_cache_size, поскольку значение по умолчанию обычно не является оптимальным.

```bash
$ echo 4096 | sudo tee /sys/block/md2/md/stripe_cache_size
```

Вычислите точное значение на основе количества устройств и размера блока, используя формулу: `2 * num_devices * chunk_size_in_bytes / 4096`.

Размер блока 64 КБ достаточен для большинства конфигураций RAID. Средний размер записи clickhouse-server составляет приблизительно 1 МБ (1024 КБ), поэтому рекомендуемый размер stripe также составляет 1 МБ. При необходимости размер блока можно оптимизировать, установив его равным 1 МБ, деленному на количество дисков без четности в массиве RAID, чтобы каждая запись распараллеливалась по всем доступным дискам без четности.
Никогда не устанавливайте слишком маленький или слишком большой размер блока.

Можно использовать RAID-0 на твердотельных накопителях (SSD).
Независимо от использования RAID всегда применяйте репликацию для обеспечения безопасности данных.

Включите NCQ с длинной очередью. Для HDD выбирайте планировщик mq-deadline или CFQ, а для SSD выбирайте noop. Не уменьшайте параметр 'readahead'.
Для HDD включите кэш записи.

Убедитесь, что [`fstrim`](<https://en.wikipedia.org/wiki/Trim_(computing)>) включен для дисков NVME и SSD в вашей операционной системе (обычно это реализуется с помощью задания cron или службы systemd).


## Файловая система {#file-system}

Ext4 — наиболее надёжный вариант. Установите опцию монтирования `noatime`. XFS также хорошо работает.
Большинство других файловых систем тоже должны работать нормально.

FAT-32 и exFAT не поддерживаются из-за отсутствия жёстких ссылок.

Не используйте сжатые файловые системы, так как ClickHouse самостоятельно выполняет сжатие и делает это лучше.
Не рекомендуется использовать зашифрованные файловые системы, поскольку в ClickHouse есть встроенное шифрование, которое работает лучше.

Хотя ClickHouse может работать через NFS, это не лучшая идея.


## Ядро Linux {#linux-kernel}

Не используйте устаревшее ядро Linux.


## Сеть {#network}

Если вы используете IPv6, увеличьте размер кэша маршрутов.
Ядро Linux версий до 3.2 имело множество проблем с реализацией IPv6.

По возможности используйте сеть со скоростью не менее 10 Гбит/с. Сеть 1 Гбит/с также будет работать, но это будет значительно хуже для синхронизации реплик с десятками терабайт данных или для обработки распределённых запросов с большим объёмом промежуточных данных.


## Huge Pages {#huge-pages}

Если вы используете старое ядро Linux, отключите transparent huge pages (прозрачные огромные страницы). Они создают помехи в работе аллокатора памяти, что приводит к значительному снижению производительности.
В более новых ядрах Linux transparent huge pages работают корректно.

```bash
$ echo 'madvise' | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
```

Если вы хотите изменить настройку transparent huge pages на постоянной основе, отредактируйте файл `/etc/default/grub`, добавив `transparent_hugepage=madvise` в параметр `GRUB_CMDLINE_LINUX_DEFAULT`:

```bash
$ GRUB_CMDLINE_LINUX_DEFAULT="transparent_hugepage=madvise ..."
```

После этого выполните команду `sudo update-grub`, а затем перезагрузите систему, чтобы изменения вступили в силу.


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

Это необходимо для того, чтобы ClickHouse мог получать корректную информацию с помощью инструкции `cpuid`.
В противном случае при работе гипервизора на старых моделях процессоров могут возникать сбои с ошибкой `Illegal instruction`.


## ClickHouse Keeper и ZooKeeper {#zookeeper}

Для кластеров ClickHouse рекомендуется использовать ClickHouse Keeper вместо ZooKeeper. См. документацию по [ClickHouse Keeper](../guides/sre/keeper/index.md)

Если вы хотите продолжить использование ZooKeeper, рекомендуется использовать актуальную версию ZooKeeper — 3.4.9 или новее. Версия в стабильных дистрибутивах Linux может быть устаревшей.

Не используйте написанные вручную скрипты для переноса данных между различными кластерами ZooKeeper, поскольку результат будет некорректным для последовательных узлов. Не используйте утилиту "zkcopy" по той же причине: https://github.com/ksprojects/zkcopy/issues/15

Если необходимо разделить существующий кластер ZooKeeper на два, правильный способ — увеличить количество его реплик, а затем переконфигурировать его как два независимых кластера.

В тестовых средах или в средах с низкой скоростью загрузки данных можно запускать ClickHouse Keeper на том же сервере, что и ClickHouse.
Для производственных сред рекомендуется использовать отдельные серверы для ClickHouse и ZooKeeper/Keeper или размещать файлы ClickHouse и файлы Keeper на отдельных дисках. Это связано с тем, что ZooKeeper/Keeper очень чувствительны к задержкам диска, а ClickHouse может использовать все доступные системные ресурсы.

В ансамбле могут присутствовать наблюдатели ZooKeeper, но серверы ClickHouse не должны взаимодействовать с наблюдателями.

Не изменяйте параметр `minSessionTimeout`, большие значения могут повлиять на стабильность перезапуска ClickHouse.

При настройках по умолчанию ZooKeeper представляет собой бомбу замедленного действия:

> Сервер ZooKeeper не удаляет файлы старых снимков и логов при использовании конфигурации по умолчанию (см. `autopurge`), и это является обязанностью оператора.

Эту бомбу необходимо обезвредить.

Приведенная ниже конфигурация ZooKeeper (3.5.1) используется в крупной производственной среде:

zoo.cfg:


```bash
# http://hadoop.apache.org/zookeeper/docs/current/zookeeperAdmin.html
```


# Количество миллисекунд в каждом тике
tickTime=2000
# Количество тиков, которое может занять
# начальная фаза синхронизации
# Это значение не до конца обосновано
initLimit=300
# Количество тиков, которое может пройти между
# отправкой запроса и получением подтверждения
syncLimit=10

maxClientCnxns=2000



# Это максимальное значение, которое может запросить клиент и которое примет сервер.

# Допустимо устанавливать высокое значение maxSessionTimeout на сервере, чтобы клиенты могли работать с большим временем ожидания сессии при необходимости.

# Однако по умолчанию запрашивается время ожидания сессии 30 секунд (его можно изменить с помощью параметра session_timeout_ms в конфигурации ClickHouse).

maxSessionTimeout=60000000

# каталог для хранения снимков состояния.

dataDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/data

# Для повышения производительности разместите dataLogDir на отдельном физическом диске

dataLogDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/logs

autopurge.snapRetainCount=10
autopurge.purgeInterval=1


# Чтобы избежать операций seek, ZooKeeper выделяет место в файле журнала транзакций
# блоками по preAllocSize килобайт. Размер блока по умолчанию — 64M. Одна из причин
# изменить размер блоков — уменьшить размер блока, если снимки состояния (snapshots)
# создаются чаще. (См. также snapCount).
preAllocSize=131072



# Клиенты могут отправлять запросы быстрее, чем ZooKeeper способен их обрабатывать,
# особенно если клиентов много. Чтобы предотвратить исчерпание памяти ZooKeeper
# из‑за поставленных в очередь запросов, ZooKeeper будет ограничивать клиентов так,
# чтобы в системе было не более globalOutstandingLimit невыполненных запросов.
# Значение по умолчанию — 1000.
# globalOutstandingLimit=1000



# ZooKeeper записывает транзакции в журнал транзакций. После того как в файл журнала
# будет записано snapCount транзакций, создаётся снимок состояния, и начинается новый
# файл журнала транзакций. Значение snapCount по умолчанию — 100000.
snapCount=3000000



# Если этот параметр задан, запросы будут записываться в файл трассировки с именем
# traceFile.year.month.day.
#traceFile=



# Лидер принимает клиентские подключения. Значение по умолчанию — "yes". Машина-лидер

# координирует обновления. Для повышения пропускной способности обновлений при незначительном снижении

# пропускной способности чтения лидер можно настроить так, чтобы он не принимал клиентов и сосредоточился

# на координации.

leaderServes=yes

standaloneEnabled=false
dynamicConfigFile=/etc/zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }}/conf/zoo.cfg.dynamic

````

Версия Java:

```text
openjdk 11.0.5-shenandoah 2019-10-15
OpenJDK Runtime Environment (build 11.0.5-shenandoah+10-adhoc.heretic.src)
OpenJDK 64-Bit Server VM (build 11.0.5-shenandoah+10-adhoc.heretic.src, mixed mode)
````

Параметры JVM:

```bash
NAME=zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }}
ZOOCFGDIR=/etc/$NAME/conf

```


# TODO это выглядит действительно ужасно
# Как определить, какие JAR-файлы нужны?
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


## Антивирусное ПО {#antivirus-software}

Если вы используете антивирусное ПО, настройте его на исключение папок с файлами данных ClickHouse (`/var/lib/clickhouse`), иначе производительность может снизиться, и могут возникнуть неожиданные ошибки при загрузке данных и фоновых слияниях.


## Связанный контент {#related-content}

- [Начинаете работать с ClickHouse? Вот 13 «смертных грехов» и как их избежать](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)
