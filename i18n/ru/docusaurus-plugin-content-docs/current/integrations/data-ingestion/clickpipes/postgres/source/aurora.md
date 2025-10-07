---
slug: '/integrations/clickpipes/postgres/source/aurora'
sidebar_label: 'Amazon Aurora Postgres'
description: 'Настройте Amazon Aurora Postgres в качестве источника для ClickPipes'
title: 'Руководство по настройке источника Aurora Postgres'
doc_type: guide
---
import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import change_rds_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_rds_logical_replication.png';
import change_wal_sender_timeout from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_wal_sender_timeout.png';
import modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/modify_parameter_group.png';
import reboot_rds from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/reboot_rds.png';
import security_group_in_rds_postgres from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/security_group_in_rds_postgres.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';


# Руководство по настройке источника Aurora Postgres

## Поддерживаемые версии Postgres {#supported-postgres-versions}

ClickPipes поддерживает Aurora PostgreSQL-Compatible Edition версии 12 и выше.

## Включите логическую репликацию {#enable-logical-replication}

Вы можете пропустить этот раздел, если ваша экземпляр Aurora уже имеет следующие настройки:

- `rds.logical_replication = 1`
- `wal_sender_timeout = 0`

Эти настройки обычно предварительно сконфигурированы, если вы ранее использовали другой инструмент репликации данных.

```text
postgres=> SHOW rds.logical_replication ;
 rds.logical_replication
-------------------------
 on
(1 row)

postgres=> SHOW wal_sender_timeout ;
 wal_sender_timeout
--------------------
 0
(1 row)
```

Если они еще не настроены, выполните следующие шаги:

1. Создайте новую группу параметров для вашей версии Aurora PostgreSQL с необходимыми настройками:
    - Установите `rds.logical_replication` в 1
    - Установите `wal_sender_timeout` в 0

<Image img={parameter_group_in_blade} alt="Где найти группы параметров в Aurora" size="lg" border/>

<Image img={change_rds_logical_replication} alt="Изменение rds.logical_replication" size="lg" border/>

<Image img={change_wal_sender_timeout} alt="Изменение wal_sender_timeout" size="lg" border/>

2. Примените новую группу параметров к вашему кластеру Aurora PostgreSQL

<Image img={modify_parameter_group} alt="Модификация Aurora PostgreSQL с новой группой параметров" size="lg" border/>

3. Перезагрузите ваш кластер Aurora, чтобы применить изменения

<Image img={reboot_rds} alt="Перезагрузка Aurora PostgreSQL" size="lg" border/>

## Настройка пользователя базы данных {#configure-database-user}

Подключитесь к вашему экземпляру Aurora PostgreSQL в качестве администратора и выполните следующие команды:

1. Создайте выделенного пользователя для ClickPipes:

```sql
CREATE USER clickpipes_user PASSWORD 'some-password';
```

2. Предоставьте разрешения на схему. В следующем примере показаны разрешения для схемы `public`. Повторите эти команды для каждой схемы, которую вы хотите реплицировать:

```sql
GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
```

3. Предоставьте права на репликацию:

```sql
GRANT rds_replication TO clickpipes_user;
```

4. Создайте публикацию для репликации:

```sql
CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

## Настройка сетевого доступа {#configure-network-access}

### Контроль доступа на основе IP {#ip-based-access-control}

Если вы хотите ограничить трафик к вашему кластеру Aurora, добавьте [документированные статические IP NAT](../../index.md#list-of-static-ips) в `Inbound rules` вашей группы безопасности Aurora.

<Image img={security_group_in_rds_postgres} alt="Где найти группу безопасности в Aurora PostgreSQL?" size="lg" border/>

<Image img={edit_inbound_rules} alt="Редактировать входящие правила для вышеуказанной группы безопасности" size="lg" border/>

### Частный доступ через AWS PrivateLink {#private-access-via-aws-privatelink}

Чтобы подключиться к вашему кластеру Aurora через частную сеть, вы можете использовать AWS PrivateLink. Следуйте нашему [руководству по настройке AWS PrivateLink для ClickPipes](/knowledgebase/aws-privatelink-setup-for-clickpipes), чтобы установить соединение.

### Учетные записи, специфичные для Aurora {#aurora-specific-considerations}

При настройке ClickPipes с Aurora PostgreSQL учитывайте следующие моменты:

1. **Конечная точка подключения**: Всегда подключайтесь к конечной точке записи вашего кластера Aurora, так как логическая репликация требует прав на запись для создания слотов репликации и должна подключаться к основному экземпляру.

2. **Обработка аварийных ситуаций**: В случае аварии Aurora автоматически повысит читателя до нового писателя. ClickPipes обнаружит разъединение и попытается переподключиться к конечной точке писателя, которая теперь будет указывать на новый основной экземпляр.

3. **Глобальная база данных**: Если вы используете Aurora Global Database, следует подключаться к конечной точке писателя главного региона, так как репликация между регионами уже управляет перемещением данных между регионами.

4. **Хранение данных**: Слой хранения Aurora разделяется между всеми экземплярами в кластере, что может обеспечить лучшую производительность для логической репликации по сравнению со стандартным RDS.

### Работа с динамическими конечными точками кластера {#dealing-with-dynamic-cluster-endpoints}

Хотя Aurora предоставляет стабильные конечные точки, которые автоматически перенаправляют на соответствующий экземпляр, вот несколько дополнительных подходов для обеспечения постоянного подключения:

1. Для высокодоступных настроек настройте ваше приложение на использование конечной точки писателя Aurora, которая автоматически указывает на текущий основной экземпляр.

2. Если используется репликация между регионами, рассмотрите возможность настройки отдельных ClickPipes для каждого региона, чтобы уменьшить задержку и улучшить отказоустойчивость.

## Что дальше? {#whats-next}

Теперь вы можете [создать ваш ClickPipe](../index.md) и начать передачу данных из вашего кластера Aurora PostgreSQL в ClickHouse Cloud. Не забудьте записать детали подключения, которые вы использовали при настройке вашего кластера Aurora PostgreSQL, так как они понадобятся вам в процессе создания ClickPipe.