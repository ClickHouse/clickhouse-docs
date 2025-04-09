---
description: 'Документация по планированию загрузки'
sidebar_label: 'Планирование загрузки'
sidebar_position: 69
slug: /operations/workload-scheduling
title: 'Планирование загрузки'
---

Когда ClickHouse выполняет несколько запросов одновременно, они могут использовать общие ресурсы (например, диски). Ограничения и политики планирования могут быть применены для регулирования того, как ресурсы используются и делятся между различными загрузками. Для каждого ресурса может быть настроена иерархия планирования. Корень иерархии представляет ресурс, в то время как листья - это очереди, содержащие запросы, превышающие емкость ресурса.

:::note
В настоящее время только удаленный ввод-вывод диска может быть запланирован с использованием описанного метода. Для планирования CPU смотрите параметры настроек касательно пулов потоков и [`concurrent_threads_soft_limit_num`](server-configuration-parameters/settings.md#concurrent_threads_soft_limit_num). Для гибких ограничений памяти смотрите [Memory overcommit](settings/memory-overcommit.md)
:::

## Конфигурация диска {#disk-config}

Чтобы включить планирование ввода-вывода для конкретного диска, необходимо указать `read_resource` и/или `write_resource` в конфигурации хранения. Это говорит ClickHouse, какой ресурс следует использовать для каждого запроса на чтение и запись с данным диском. Читаемый и записываемый ресурсы могут относиться к одному и тому же имени ресурса, что полезно для местных SSD или HDD. Несколько разных дисков также могут указывать на один и тот же ресурс, что полезно для удаленных дисков: если вы хотите обеспечить справедливое распределение пропускной способности сети между, например, "производством" и "разработкой".

Пример:
```xml
<clickhouse>
    <storage_configuration>
        ...
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>https://clickhouse-public-datasets.s3.amazonaws.com/my-bucket/root-path/</endpoint>
                <access_key_id>your_access_key_id</access_key_id>
                <secret_access_key>your_secret_access_key</secret_access_key>
                <read_resource>network_read</read_resource>
                <write_resource>network_write</write_resource>
            </s3>
        </disks>
        <policies>
            <s3_main>
                <volumes>
                    <main>
                        <disk>s3</disk>
                    </main>
                </volumes>
            </s3_main>
        </policies>
    </storage_configuration>
</clickhouse>
```

Альтернативный способ указать, какие диски используются ресурсом, - это синтаксис SQL:

```sql
CREATE RESOURCE resource_name (WRITE DISK disk1, READ DISK disk2)
```

Ресурс может быть использован для любого количества дисков для ЧТЕНИЯ или ЗАПИСИ, или для обоих. Есть синтаксис, позволяющий использовать ресурс для всех дисков:

```sql
CREATE RESOURCE all_io (READ ANY DISK, WRITE ANY DISK);
```

Обратите внимание, что параметры конфигурации сервера имеют приоритет над SQL-способом определения ресурсов.

## Разметка загрузки {#workload_markup}

Запросы могут быть размечены с помощью настройки `workload`, чтобы различать различные загрузки. Если `workload` не установлен, используется значение "default". Обратите внимание, что вы можете указать другое значение, используя профили настроек. Ограничения настройки могут быть использованы для того, чтобы сделать `workload` постоянным, если вы хотите, чтобы все запросы от пользователя были отмечены фиксированным значением настройки `workload`.

Возможно назначить настройку `workload` для фоновых действий. Слияния и мутации используют настройки сервера `merge_workload` и `mutation_workload` соответственно. Эти значения также могут быть переопределены для конкретных таблиц с помощью настроек `merge_workload` и `mutation_workload` для дерева слияния.

Рассмотрим пример системы с двумя разными загрузками: "производство" и "разработка".

```sql
SELECT count() FROM my_table WHERE value = 42 SETTINGS workload = 'production'
SELECT count() FROM my_table WHERE value = 13 SETTINGS workload = 'development'
```

## Иерархия планирования ресурсов {#hierarchy}

С точки зрения подсистемы планирования ресурс представляет собой иерархию узлов планирования.

```mermaid
graph TD
    subgraph network_read
    nr_root(("/"))
    -->|100 concurrent requests| nr_fair("fair")
    -->|75% bandwidth| nr_prod["prod"]
    nr_fair
    -->|25% bandwidth| nr_dev["dev"]
    end

    subgraph network_write
    nw_root(("/"))
    -->|100 concurrent requests| nw_fair("fair")
    -->|75% bandwidth| nw_prod["prod"]
    nw_fair
    -->|25% bandwidth| nw_dev["dev"]
    end
```

**Возможные типы узлов:**
* `inflight_limit` (ограничение) - блокирует, если либо количество одновременно текущих запросов превышает `max_requests`, либо их общая стоимость превышает `max_cost`; должен иметь единственного ребенка.
* `bandwidth_limit` (ограничение) - блокирует, если текущая пропускная способность превышает `max_speed` (0 означает неограниченный) или всплеск превышает `max_burst` (по умолчанию равен `max_speed`); должен иметь единственного ребенка.
* `fair` (политика) - выбирает следующий запрос для обслуживания из одного из своих дочерних узлов в соответствии с максимальной-минимальной справедливостью; дочерние узлы могут указывать `weight` (по умолчанию 1).
* `priority` (политика) - выбирает следующий запрос для обслуживания из одного из своих дочерних узлов в соответствии со статическими приоритетами (меньшее значение означает более высокий приоритет); дочерние узлы могут указывать `priority` (по умолчанию 0).
* `fifo` (очередь) - лист иерархии, способный удерживать запросы, которые превышают емкость ресурса.

Чтобы иметь возможность использовать всю емкость базового ресурса, вам следует использовать `inflight_limit`. Обратите внимание, что маленькое количество `max_requests` или `max_cost` может привести к неполному использованию ресурса, тогда как слишком высокие числа могут привести к пустым очередям внутри планировщика, что в свою очередь приведет к игнорированию политик (несправедливости или игнорирование приоритетов) в поддереве. С другой стороны, если вы хотите защитить ресурсы от слишком высокого использования, вы должны использовать `bandwidth_limit`. Он ограничивает, когда количество ресурса, потребляемого в течение `duration` секунд, превышает `max_burst + max_speed * duration` байт. Два узла `bandwidth_limit` на одном ресурсе могут использоваться для ограничения пикового трафика в течение коротких интервалов и средней полосы пропускания для более длительных.

Следующий пример показывает, как определить иерархии планирования ввода-вывода, показанные на картинке:

```xml
<clickhouse>
    <resources>
        <network_read>
            <node path="/">
                <type>inflight_limit</type>
                <max_requests>100</max_requests>
            </node>
            <node path="/fair">
                <type>fair</type>
            </node>
            <node path="/fair/prod">
                <type>fifo</type>
                <weight>3</weight>
            </node>
            <node path="/fair/dev">
                <type>fifo</type>
            </node>
        </network_read>
        <network_write>
            <node path="/">
                <type>inflight_limit</type>
                <max_requests>100</max_requests>
            </node>
            <node path="/fair">
                <type>fair</type>
            </node>
            <node path="/fair/prod">
                <type>fifo</type>
                <weight>3</weight>
            </node>
            <node path="/fair/dev">
                <type>fifo</type>
            </node>
        </network_write>
    </resources>
</clickhouse>
```

## Классификаторы загрузки {#workload_classifiers}

Классификаторы загрузки используются для определения соответствия `workload`, указанной запросом, к листовым очередям, которые должны использоваться для конкретных ресурсов. В данный момент классификация загрузки проста: доступно только статическое сопоставление.

Пример:
```xml
<clickhouse>
    <workload_classifiers>
        <production>
            <network_read>/fair/prod</network_read>
            <network_write>/fair/prod</network_write>
        </production>
        <development>
            <network_read>/fair/dev</network_read>
            <network_write>/fair/dev</network_write>
        </development>
        <default>
            <network_read>/fair/dev</network_read>
            <network_write>/fair/dev</network_write>
        </default>
    </workload_classifiers>
</clickhouse>
```

## Иерархия загрузок (только SQL) {#workloads}

Определение ресурсов и классификаторов в XML может быть сложным. ClickHouse предоставляет синтаксис SQL, который намного удобнее. Все ресурсы, созданные с помощью `CREATE RESOURCE`, имеют одинаковую структуру иерархии, но могут отличаться в некоторых аспектах. Каждая загрузка, созданная с помощью `CREATE WORKLOAD`, поддерживает несколько автоматически созданных узлов планирования для каждого ресурса. Дочерняя загрузка может быть создана внутри другой родительской загрузки. Вот пример, который определяет точно такую же иерархию, как и XML-конфигурация выше:

```sql
CREATE RESOURCE network_write (WRITE DISK s3)
CREATE RESOURCE network_read (READ DISK s3)
CREATE WORKLOAD all SETTINGS max_requests = 100
CREATE WORKLOAD development IN all
CREATE WORKLOAD production IN all SETTINGS weight = 3
```

Имя листовой загрузки без дочерних узлов может быть использовано в настройках запроса `SETTINGS workload = 'name'`. Обратите внимание, что классификаторы загрузки также создаются автоматически при использовании SQL-синтаксиса.

Чтобы настроить загрузку, могут быть использованы следующие настройки:
* `priority` - сопредельные загрузки обрабатываются в соответствии со статическими значениями приоритета (меньшее значение означает более высокий приоритет).
* `weight` - сопредельные загрузки с одинаковым статическим приоритетом делят ресурсы в соответствии с весами.
* `max_requests` - ограничение на количество одновременно активных запросов ресурса в этой загрузке.
* `max_cost` - ограничение на общее количество байт в состоянии ожидания для одновременно активных запросов ресурса в этой загрузке.
* `max_speed` - ограничение на скорость обработки байтов этой загрузки (ограничение независимо для каждого ресурса).
* `max_burst` - максимальное количество байтов, которое может быть обработано загрузкой без ограничения (для каждого ресурса независимо).

Обратите внимание, что настройки загрузки преобразуются в соответствующий набор узлов планирования. Для получения дополнительной информации смотрите описание [типов и опций узлов планирования](#hierarchy).

Нельзя указать разные иерархии загрузки для разных ресурсов. Но есть возможность указать разные значения настройки загрузки для конкретного ресурса:

```sql
CREATE OR REPLACE WORKLOAD all SETTINGS max_requests = 100, max_speed = 1000000 FOR network_read, max_speed = 2000000 FOR network_write
```

Также обратите внимание, что загрузка или ресурс не могут быть удалены, если на них ссылаются из другой загрузки. Чтобы обновить определение загрузки, используйте запрос `CREATE OR REPLACE WORKLOAD`.

## Хранение загрузок и ресурсов {#workload_entity_storage}
Определения всех загрузок и ресурсов в форме запросов `CREATE WORKLOAD` и `CREATE RESOURCE` хранятся постоянно либо на диске по пути `workload_path`, либо в ZooKeeper по пути `workload_zookeeper_path`. Рекомендуется использовать хранение в ZooKeeper для достижения согласованности между узлами. В качестве альтернативы можно использовать клаузулу `ON CLUSTER` вместе с хранением на диске.

## Строгий доступ к ресурсам {#strict-resource-access}
Для того чтобы заставить все запросы следовать политикам планирования ресурсов, существует настройка сервера `throw_on_unknown_workload`. Если она установлена в `true`, каждый запрос должен использовать допустимую настройку `workload`, в противном случае будет выброшено исключение `RESOURCE_ACCESS_DENIED`. Если она установлена в `false`, такой запрос не будет использовать планировщик ресурсов, т.е. получит неограниченный доступ к любому `RESOURCE`.

:::note
Не устанавливайте `throw_on_unknown_workload` в `true`, если не выполнена команда `CREATE WORKLOAD default`. Это может привести к проблемам при запуске сервера, если во время старта будет выполнен запрос без явной настройки `workload`.
:::

## См. также {#see-also}
 - [system.scheduler](/operations/system-tables/scheduler.md)
 - [system.workloads](/operations/system-tables/workloads.md)
 - [system.resources](/operations/system-tables/resources.md)
 - [merge_workload](/operations/settings/merge-tree-settings.md#merge_workload) настройка дерева слияния
 - [merge_workload](/operations/server-configuration-parameters/settings.md#merge_workload) глобальная серверная настройка
 - [mutation_workload](/operations/settings/merge-tree-settings.md#mutation_workload) настройка дерева слияния
 - [mutation_workload](/operations/server-configuration-parameters/settings.md#mutation_workload) глобальная серверная настройка
 - [workload_path](/operations/server-configuration-parameters/settings.md#workload_path) глобальная серверная настройка
 - [workload_zookeeper_path](/operations/server-configuration-parameters/settings.md#workload_zookeeper_path) глобальная серверная настройка
