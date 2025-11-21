---
sidebar_label: 'Amazon RDS Postgres'
description: 'Настройка Amazon RDS Postgres в качестве источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/rds
title: 'Руководство по настройке источника RDS Postgres'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'загрузка данных', 'синхронизация в режиме реального времени']
---

import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import change_rds_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_rds_logical_replication.png';
import change_wal_sender_timeout from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_wal_sender_timeout.png';
import modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/modify_parameter_group.png';
import reboot_rds from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/reboot_rds.png';
import security_group_in_rds_postgres from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/security_group_in_rds_postgres.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';


# Руководство по настройке источника данных RDS Postgres



## Поддерживаемые версии Postgres {#supported-postgres-versions}

ClickPipes поддерживает Postgres версии 12 и новее.


## Включение логической репликации {#enable-logical-replication}

Вы можете пропустить этот раздел, если в вашем экземпляре RDS уже настроены следующие параметры:

- `rds.logical_replication = 1`
- `wal_sender_timeout = 0`

Эти параметры обычно уже настроены, если вы ранее использовали другой инструмент репликации данных.

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

1. Создайте новую группу параметров для вашей версии Postgres с требуемыми настройками:
   - Установите для `rds.logical_replication` значение 1
   - Установите для `wal_sender_timeout` значение 0

<Image
  img={parameter_group_in_blade}
  alt='Где найти группы параметров в RDS?'
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

2. Примените новую группу параметров к вашей базе данных RDS Postgres

<Image
  img={modify_parameter_group}
  alt='Изменение RDS Postgres с новой группой параметров'
  size='lg'
  border
/>

3. Перезагрузите экземпляр RDS для применения изменений

<Image img={reboot_rds} alt='Перезагрузка RDS Postgres' size='lg' border />


## Настройка пользователя базы данных {#configure-database-user}

Подключитесь к экземпляру RDS Postgres от имени администратора и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes:

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

Если вы хотите ограничить трафик к вашему экземпляру RDS, добавьте [документированные статические NAT IP-адреса](../../index.md#list-of-static-ips) в правила входящего трафика (`Inbound rules`) группы безопасности RDS.

<Image
  img={security_group_in_rds_postgres}
  alt='Где найти группу безопасности в RDS Postgres?'
  size='lg'
  border
/>

<Image
  img={edit_inbound_rules}
  alt='Редактирование правил входящего трафика для указанной группы безопасности'
  size='lg'
  border
/>

### Приватный доступ через AWS PrivateLink {#private-access-via-aws-privatelink}

Для подключения к экземпляру RDS через приватную сеть можно использовать AWS PrivateLink. Следуйте нашему [руководству по настройке AWS PrivateLink для ClickPipes](/knowledgebase/aws-privatelink-setup-for-clickpipes), чтобы настроить соединение.

### Обходные решения для RDS Proxy {#workarounds-for-rds-proxy}

RDS Proxy не поддерживает соединения логической репликации. Если у вас динамические IP-адреса в RDS и вы не можете использовать DNS-имя или lambda-функцию, вот несколько альтернативных вариантов:

1. С помощью задания cron периодически разрешайте IP-адрес конечной точки RDS и обновляйте NLB при его изменении.
2. Использование уведомлений о событиях RDS с EventBridge/SNS: автоматически запускайте обновления с помощью уведомлений о событиях AWS RDS.
3. Стабильный EC2: разверните экземпляр EC2 для работы в качестве службы опроса или IP-прокси.
4. Автоматизируйте управление IP-адресами с помощью таких инструментов, как Terraform или CloudFormation.


## Что дальше? {#whats-next}

Теперь вы можете [создать ClickPipe](../index.md) и начать загружать данные из вашего экземпляра Postgres в ClickHouse Cloud.
Обязательно запишите параметры подключения, которые вы использовали при настройке экземпляра Postgres, так как они понадобятся при создании ClickPipe.
