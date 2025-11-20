---
sidebar_label: 'Amazon Aurora Postgres'
description: 'Настройка Amazon Aurora Postgres как источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/aurora
title: 'Руководство по настройке источника Aurora Postgres'
doc_type: 'guide'
keywords: ['Amazon Aurora', 'PostgreSQL', 'ClickPipes', 'AWS database', 'logical replication setup']
---

import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import change_rds_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_rds_logical_replication.png';
import change_wal_sender_timeout from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_wal_sender_timeout.png';
import modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/modify_parameter_group.png';
import reboot_rds from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/reboot_rds.png';
import security_group_in_rds_postgres from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/security_group_in_rds_postgres.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';


# Руководство по настройке источника данных Aurora Postgres



## Поддерживаемые версии Postgres {#supported-postgres-versions}

ClickPipes поддерживает Aurora PostgreSQL-Compatible Edition версии 12 и новее.


## Включение логической репликации {#enable-logical-replication}

Вы можете пропустить этот раздел, если в вашем экземпляре Aurora уже настроены следующие параметры:

- `rds.logical_replication = 1`
- `wal_sender_timeout = 0`

Эти параметры обычно уже настроены, если вы ранее использовали другой инструмент для репликации данных.

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

Если параметры еще не настроены, выполните следующие действия:

1. Создайте новую группу параметров для вашей версии Aurora PostgreSQL с требуемыми настройками:
   - Установите `rds.logical_replication` в значение 1
   - Установите `wal_sender_timeout` в значение 0

<Image
  img={parameter_group_in_blade}
  alt='Где найти группы параметров в Aurora'
  size='lg'
  border
/>

<Image
  img={change_rds_logical_replication}
  alt='Изменение rds.logical_replication'
  size='lg'
  border
/>

<Image
  img={change_wal_sender_timeout}
  alt='Изменение wal_sender_timeout'
  size='lg'
  border
/>

2. Примените новую группу параметров к вашему кластеру Aurora PostgreSQL

<Image
  img={modify_parameter_group}
  alt='Изменение Aurora PostgreSQL с новой группой параметров'
  size='lg'
  border
/>

3. Перезагрузите кластер Aurora для применения изменений

<Image img={reboot_rds} alt='Перезагрузка Aurora PostgreSQL' size='lg' border />


## Настройка пользователя базы данных {#configure-database-user}

Подключитесь к экземпляру writer Aurora PostgreSQL от имени администратора и выполните следующие команды:

1. Создайте выделенного пользователя для ClickPipes:

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. Предоставьте права доступа к схеме. В следующем примере показаны права для схемы `public`. Повторите эти команды для каждой схемы, которую необходимо реплицировать:

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. Предоставьте привилегии репликации:

   ```sql
   GRANT rds_replication TO clickpipes_user;
   ```

4. Создайте публикацию для репликации:

   ```sql
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
   ```


## Настройка сетевого доступа {#configure-network-access}

### Контроль доступа на основе IP-адресов {#ip-based-access-control}

Если вы хотите ограничить трафик к вашему кластеру Aurora, добавьте [документированные статические NAT IP-адреса](../../index.md#list-of-static-ips) в правила `Inbound rules` группы безопасности Aurora.

<Image
  img={security_group_in_rds_postgres}
  alt='Где найти группу безопасности в Aurora PostgreSQL?'
  size='lg'
  border
/>

<Image
  img={edit_inbound_rules}
  alt='Редактирование входящих правил для указанной группы безопасности'
  size='lg'
  border
/>

### Приватный доступ через AWS PrivateLink {#private-access-via-aws-privatelink}

Для подключения к кластеру Aurora через приватную сеть можно использовать AWS PrivateLink. Следуйте [руководству по настройке AWS PrivateLink для ClickPipes](/knowledgebase/aws-privatelink-setup-for-clickpipes), чтобы настроить соединение.

### Особенности работы с Aurora {#aurora-specific-considerations}

При настройке ClickPipes с Aurora PostgreSQL учитывайте следующие моменты:

1. **Конечная точка подключения**: Всегда подключайтесь к конечной точке writer вашего кластера Aurora, поскольку логическая репликация требует доступа на запись для создания слотов репликации и должна подключаться к основному экземпляру.

2. **Обработка отказоустойчивого переключения**: В случае отказоустойчивого переключения Aurora автоматически повысит reader до нового writer. ClickPipes обнаружит разрыв соединения и попытается переподключиться к конечной точке writer, которая теперь будет указывать на новый основной экземпляр.

3. **Глобальная база данных**: Если вы используете Aurora Global Database, следует подключаться к конечной точке writer основного региона, поскольку межрегиональная репликация уже обрабатывает перемещение данных между регионами.

4. **Особенности хранения данных**: Уровень хранения Aurora является общим для всех экземпляров в кластере, что может обеспечить более высокую производительность логической репликации по сравнению со стандартным RDS.

### Работа с динамическими конечными точками кластера {#dealing-with-dynamic-cluster-endpoints}

Хотя Aurora предоставляет стабильные конечные точки, которые автоматически маршрутизируют запросы к соответствующему экземпляру, вот несколько дополнительных подходов для обеспечения стабильного подключения:

1. Для конфигураций с высокой доступностью настройте ваше приложение на использование конечной точки writer Aurora, которая автоматически указывает на текущий основной экземпляр.

2. При использовании межрегиональной репликации рассмотрите возможность настройки отдельных ClickPipes для каждого региона, чтобы снизить задержку и повысить отказоустойчивость.


## Что дальше? {#whats-next}

Теперь вы можете [создать ClickPipe](../index.md) и начать загружать данные из кластера Aurora PostgreSQL в ClickHouse Cloud.
Обязательно сохраните параметры подключения, которые вы использовали при настройке кластера Aurora PostgreSQL — они понадобятся при создании ClickPipe.
