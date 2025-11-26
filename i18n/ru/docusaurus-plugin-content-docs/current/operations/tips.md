---
description: 'Страница с рекомендациями по использованию ClickHouse с открытым исходным кодом'
sidebar_label: 'Рекомендации по использованию OSS'
sidebar_position: 58
slug: /operations/tips
title: 'Рекомендации по использованию ClickHouse с открытым исходным кодом'
doc_type: 'guide'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_automated.md';

<SelfManaged />


## Governor масштабирования CPU

Всегда используйте governor масштабирования `performance`. Governor `on-demand` работает значительно хуже при постоянно высокой нагрузке.

```bash
$ echo 'performance' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
```


## Ограничения ЦП {#cpu-limitations}

Процессоры могут перегреваться. Используйте `dmesg`, чтобы проверить, не была ли тактовая частота процессора ограничена из‑за перегрева.
Ограничение также может быть установлено внешне на уровне дата‑центра. Для его мониторинга под нагрузкой можно использовать `turbostat`.



## RAM

Для небольших объёмов данных (до ~200 ГБ в сжатом виде) лучше всего использовать объём оперативной памяти, примерно равный объёму данных.
Для больших объёмов данных и при обработке интерактивных (онлайн) запросов следует использовать достаточно большой объём оперативной памяти (128 ГБ или больше), чтобы горячее подмножество данных помещалось в кэш страниц.
Даже при объёмах данных порядка ~50 ТБ на сервер использование 128 ГБ оперативной памяти заметно улучшает производительность запросов по сравнению с 64 ГБ.

Не отключайте overcommit. Значение `cat /proc/sys/vm/overcommit_memory` должно быть 0 или 1. Выполните

```bash
$ echo 0 | sudo tee /proc/sys/vm/overcommit_memory
```

Используйте `perf top`, чтобы отслеживать время, затрачиваемое ядром на управление памятью.
Постоянные huge pages также не требуется выделять.

### Использование менее 16 ГБ ОЗУ

Рекомендованный объём ОЗУ — 32 ГБ или больше.

Если в вашей системе менее 16 ГБ ОЗУ, вы можете столкнуться с различными ошибками, связанными с памятью, поскольку настройки по умолчанию не соответствуют такому объёму памяти. Вы можете использовать ClickHouse в системе с небольшим объёмом ОЗУ (вплоть до 2 ГБ), но такие конфигурации требуют дополнительной настройки и могут обеспечивать приём данных только с низкой скоростью.

При использовании ClickHouse при объёме ОЗУ менее 16 ГБ мы рекомендуем следующее:

* Уменьшите размер кэша меток в `config.xml`. Его можно установить до 500 МБ, но нельзя установить в ноль.
* Уменьшите число потоков обработки запросов до `1`.
* Уменьшите `max_block_size` до `8192`. Значения вплоть до `1024` всё ещё могут быть практичными.
* Уменьшите `max_download_threads` до `1`.
* Установите `input_format_parallel_parsing` и `output_format_parallel_formatting` в `0`.
* Отключите запись в журнальные таблицы, так как при этом фоновая задача слияния резервирует ОЗУ для выполнения слияний журнальных таблиц. Отключите `asynchronous_metric_log`, `metric_log`, `text_log`, `trace_log`.

Дополнительные замечания:

* Чтобы освободить память, кэшируемую распределителем памяти, вы можете выполнить команду
  `SYSTEM JEMALLOC PURGE`.
* Мы не рекомендуем использовать интеграции с S3 или Kafka на машинах с небольшим объёмом памяти, поскольку им требуется значительный объём памяти для буферов.


## Подсистема хранения {#storage-subsystem}

Если бюджет позволяет, используйте SSD.
Если нет — используйте HDD. Подойдут SATA HDD на 7200 об/мин.

Отдавайте предпочтение большему числу серверов с локальными жёсткими дисками, а не меньшему числу серверов с подключаемыми дисковыми полками.
Но для хранения архивов с редкими запросами подойдут и полки.



## RAID

При использовании HDD вы можете объединять их в массивы RAID-10, RAID-5, RAID-6 или RAID-50.
Для Linux предпочтительнее программный RAID (с `mdadm`).
При создании RAID-10 выбирайте схему `far`.
Если бюджет позволяет, выбирайте RAID-10.

Сам по себе LVM (без RAID или `mdadm`) — нормальный вариант, но построение RAID на его основе или сочетание его с `mdadm` — менее отработанный путь, поэтому возрастает вероятность ошибок
(выбор неправильного размера блока; несоответствие границ блоков; выбор неверного типа RAID; забыть очистить диски). Если вы уверенно пользуетесь LVM, нет причин его не использовать.

Если у вас более 4 дисков, используйте RAID-6 (предпочтительно) или RAID-50 вместо RAID-5.
При использовании RAID-5, RAID-6 или RAID-50 всегда увеличивайте значение stripe&#95;cache&#95;size, так как значение по умолчанию обычно не является наилучшим выбором.

```bash
$ echo 4096 | sudo tee /sys/block/md2/md/stripe_cache_size
```

Вычислите точное значение, исходя из количества устройств и размера блока, используя формулу: `2 * num_devices * chunk_size_in_bytes / 4096`.

Размер блока 64 KB достаточен для большинства конфигураций RAID. Средний размер записи clickhouse-server составляет примерно 1 MB (1024 KB), и поэтому рекомендуемый размер страйпа также 1 MB. Размер блока при необходимости можно оптимизировать, установив его равным 1 MB, делённому на количество дисков без четности в массиве RAID, так, чтобы каждая запись выполнялась параллельно на всех доступных дисках без четности.
Никогда не устанавливайте размер блока слишком маленьким или слишком большим.

Вы можете использовать RAID-0 на SSD.
Независимо от использования RAID всегда применяйте репликацию для обеспечения безопасности данных.

Включите NCQ с глубокой очередью. Для HDD выберите планировщик mq-deadline или CFQ, а для SSD выберите noop. Не уменьшайте параметр `readahead`.
Для HDD включите кэш записи.

Убедитесь, что [`fstrim`](https://en.wikipedia.org/wiki/Trim_\(computing\)) включён для дисков NVMe и SSD в вашей ОС (обычно это реализовано с помощью задания cron или сервиса systemd).


## Файловая система {#file-system}

Ext4 — наиболее надёжный вариант. Установите параметр монтирования `noatime`. XFS тоже хорошо подходит.
Большинство других файловых систем также должны работать нормально.

FAT-32 и exFAT не поддерживаются из-за отсутствия поддержки жёстких ссылок.

Не используйте файловые системы сжатия, потому что ClickHouse выполняет сжатие самостоятельно и делает это лучше.
Не рекомендуется использовать зашифрованные файловые системы, так как вы можете использовать встроенное шифрование в ClickHouse, которое лучше.

Хотя ClickHouse может работать поверх NFS, это не лучшая идея.



## Ядро Linux {#linux-kernel}

Не используйте устаревшие версии ядра Linux.



## Сеть {#network}

Если вы используете IPv6, увеличьте размер кэша маршрутов.
Ядро Linux до версии 3.2 имело множество проблем с реализацией IPv6.

По возможности используйте сеть как минимум 10 Гбит/с. Скорость 1 Гбит/с тоже будет работать, но значительно хуже при синхронизации реплик с десятками терабайт данных или при обработке распределённых запросов с большим количеством промежуточных данных.



## Huge Pages

Если вы используете устаревшую версию ядра Linux, отключите прозрачные большие страницы (Transparent Huge Pages, THP). Они мешают работе аллокатора памяти, что приводит к значительному снижению производительности.
В более новых версиях ядра Linux прозрачные большие страницы работают нормально.

```bash
$ echo 'madvise' | sudo tee /sys/kernel/mm/transparent_hugepage/enabled
```

Если вы хотите постоянно изменить настройку transparent huge pages, отредактируйте `/etc/default/grub`, добавив `transparent_hugepage=madvise` в параметр `GRUB_CMDLINE_LINUX_DEFAULT`:

```bash
$ GRUB_CMDLINE_LINUX_DEFAULT="transparent_hugepage=madvise ..."
```

После этого выполните команду `sudo update-grub`, затем перезагрузите систему, чтобы изменения вступили в силу.


## Настройка гипервизора

Если вы используете OpenStack, установите

```ini
cpu_mode=host-passthrough
```

в `nova.conf`.

Если вы используете libvirt, установите

```xml
<cpu mode='host-passthrough'/>
```

в конфигурации XML.

Это важно для того, чтобы ClickHouse мог получать корректную информацию с помощью инструкции `cpuid`.
В противном случае вы можете получить сбои `Illegal instruction`, если гипервизор запущен на старых моделях процессоров.


## ClickHouse Keeper и ZooKeeper {#zookeeper}

Рекомендуется использовать ClickHouse Keeper вместо ZooKeeper для кластеров ClickHouse. См. документацию по [ClickHouse Keeper](../guides/sre/keeper/index.md)

Если вы хотите продолжать использовать ZooKeeper, то лучше использовать свежую версию ZooKeeper — 3.4.9 или более позднюю. Версия в стабильных дистрибутивах Linux может быть устаревшей.

Ни в коем случае не используйте написанные вручную скрипты для переноса данных между разными кластерами ZooKeeper, так как результат будет некорректным для последовательных узлов. По той же причине никогда не используйте утилиту "zkcopy": https://github.com/ksprojects/zkcopy/issues/15

Если вы хотите разделить существующий кластер ZooKeeper на два, корректный способ — увеличить количество его реплик, а затем переконфигурировать его в два независимых кластера.

Вы можете запускать ClickHouse Keeper на том же сервере, что и ClickHouse, в тестовых окружениях или в окружениях с низкой скоростью ингестии.
Для промышленных (production) окружений мы рекомендуем использовать отдельные серверы для ClickHouse и ZooKeeper/Keeper или разместить файлы ClickHouse и Keeper на отдельных дисках, так как ZooKeeper/Keeper очень чувствительны к задержкам дисковой подсистемы, а ClickHouse может использовать все доступные системные ресурсы.

В ансамбле ZooKeeper могут быть наблюдатели (observers), но серверы ClickHouse не должны взаимодействовать с наблюдателями.

Не изменяйте настройку `minSessionTimeout`, большие значения могут повлиять на стабильность перезапусков ClickHouse.

С настройками по умолчанию ZooKeeper — это мина замедленного действия:

> При использовании конфигурации по умолчанию сервер ZooKeeper не будет удалять файлы старых снапшотов и логов (см. `autopurge`), и это остаётся обязанностью оператора.

Эту «бомбу» необходимо обезвредить.

Приведённая ниже конфигурация ZooKeeper (3.5.1) используется в крупной промышленной среде (production):

zoo.cfg:



```bash
# http://hadoop.apache.org/zookeeper/docs/current/zookeeperAdmin.html
```


# Количество миллисекунд в каждом тике
tickTime=2000
# Количество тиков, которое может занять
# начальная фаза синхронизации
# Это значение не особо обосновано
initLimit=300
# Количество тиков, которое может пройти между
# отправкой запроса и получением подтверждения
syncLimit=10

maxClientCnxns=2000



# Это максимальное значение, которое клиент может запросить и которое сервер примет.

# Допускается задавать высокое значение параметра maxSessionTimeout на сервере, чтобы клиенты могли работать с большим тайм-аутом сессии, если им это требуется.

# Но по умолчанию мы запрашиваем тайм-аут сессии 30 секунд (вы можете изменить это с помощью параметра session_timeout_ms в конфигурации ClickHouse).

maxSessionTimeout=60000000

# Каталог, в котором хранится снимок состояния.

dataDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/data

# Разместите каталог dataLogDir на отдельном физическом диске для повышения производительности.

dataLogDir=/opt/zookeeper/{{ '{{' }} cluster['name'] {{ '}}' }}/logs

autopurge.snapRetainCount=10
autopurge.purgeInterval=1


# Чтобы избежать операций позиционирования по файлу, ZooKeeper резервирует место в файле журнала транзакций
# блоками по preAllocSize килобайт. Размер блока по умолчанию — 64 МБ. Одна из причин
# изменить размер блоков — уменьшить его, если снимки состояния создаются чаще. (См. также snapCount).
# 
preAllocSize=131072



# Clients can submit requests faster than ZooKeeper can process them,
# especially if there are a lot of clients. To prevent ZooKeeper from running
# out of memory due to queued requests, ZooKeeper will throttle clients so that
# there is no more than globalOutstandingLimit outstanding requests in the
# system. The default limit is 1000.
# globalOutstandingLimit=1000



# ZooKeeper записывает транзакции в журнал транзакций. После того как в файл журнала
# будет записано snapCount транзакций, запускается создание snapshot, и начинается
# новый файл журнала транзакций. Значение snapCount по умолчанию равно 100000.
snapCount=3000000



# Если этот параметр задан, запросы будут журналироваться в файл трассировки с именем
# traceFile.year.month.day.
#traceFile=



# Лидер принимает соединения от клиентов. Значение по умолчанию — "yes". Узел-лидер

# координирует обновления. Для повышения пропускной способности обновлений за счет небольшого

# снижения пропускной способности чтения лидер может быть настроен так, чтобы не принимать подключения от клиентов и сосредоточиться

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


# TODO выглядит просто ужасно
# Как определить, какие JAR-файлы нужны?
# похоже, log4j требует, чтобы файл log4j.properties находился в classpath
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
description "zookeeper-{{ '{{' }} cluster['name'] {{ '}}' }} централизованная служба координации"

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


## Антивирусное программное обеспечение {#antivirus-software}

Если вы используете антивирусное программное обеспечение, настройте его так, чтобы оно исключало каталоги с файлами данных ClickHouse (`/var/lib/clickhouse`), иначе производительность может ухудшиться, и вы можете столкнуться с неожиданными ошибками во время ингестии данных и фоновых слияний.



## Похожие материалы {#related-content}

- [Только начинаете работать с ClickHouse? Вот 13 «смертных грехов» и как их избежать](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)
