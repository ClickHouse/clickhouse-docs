---
sidebar_label: Amazon RDS Postgres
description: Настройте Amazon RDS Postgres в качестве источника для ClickPipes
slug: /integrations/clickpipes/postgres/source/rds
---

import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import change_rds_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_rds_logical_replication.png';
import change_wal_sender_timeout from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_wal_sender_timeout.png';
import modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/modify_parameter_group.png';
import reboot_rds from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/reboot_rds.png';
import security_group_in_rds_postgres from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/security_group_in_rds_postgres.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';


# Настройка источника RDS Postgres

## Поддерживаемые версии Postgres {#supported-postgres-versions}

ClickPipes поддерживает версии Postgres 12 и новее.

## Включение логической репликации {#enable-logical-replication}

Вы можете пропустить этот раздел, если ваша RDS инстанция уже имеет следующие настройки:
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

1. Создайте новую группу параметров для вашей версии Postgres с необходимыми настройками:
    - Установите `rds.logical_replication` в 1
    - Установите `wal_sender_timeout` в 0

<img src={parameter_group_in_blade} alt="Где найти группы параметров в RDS?" />

<img src={change_rds_logical_replication} alt="Изменение rds.logical_replication" />

<img src={change_wal_sender_timeout} alt="Изменение wal_sender_timeout" />

2. Примените новую группу параметров к вашей базе данных RDS Postgres

<img src={modify_parameter_group} alt="Модификация RDS Postgres с новыми группами параметров" />

3. Перезагрузите вашу RDS инстанцию, чтобы применить изменения

<img src={reboot_rds} alt="Перезагрузить RDS Postgres" />

## Настройка пользователя базы данных {#configure-database-user}

Подключитесь к вашей RDS Postgres инстанции как администратор и выполните следующие команды:

1. Создайте выделенного пользователя для ClickPipes:

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. Предоставьте права на схемы. Приведенный ниже пример показывает права для схемы `public`. Повторите эти команды для каждой схемы, которую вы хотите реплицировать:

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

### Управление доступом на основе IP {#ip-based-access-control}

Если вы хотите ограничить трафик к вашей RDS инстанции, добавьте [документированные статические NAT IP-адреса](../../index.md#list-of-static-ips) в `Правила для входящих подключений` вашей группы безопасности RDS.

<img src={security_group_in_rds_postgres} alt="Где найти группу безопасности в RDS Postgres?" />

<img src={edit_inbound_rules} alt="Изменить правила для входящих подключений для вышеупомянутой группы безопасности" />

### Приватный доступ через AWS PrivateLink {#private-access-via-aws-privatelink}

Чтобы подключиться к вашей RDS инстанции через частную сеть, вы можете использовать AWS PrivateLink. Следуйте нашему [руководству по настройке AWS PrivateLink для ClickPipes](/knowledgebase/aws-privatelink-setup-for-clickpipes), чтобы установить соединение.

### Обходные решения для RDS Proxy {#workarounds-for-rds-proxy}
RDS Proxy не поддерживает соединения для логической репликации. Если у вас динамические IP-адреса в RDS и вы не можете использовать DNS-имя или AWS Lambda, вот несколько альтернатив:

1. Используя cron-работу, периодически разрешайте IP-адрес конечной точки RDS и обновляйте NLB, если он изменился.
2. Используйте уведомления событий RDS с EventBridge/SNS: автоматически запускайте обновления с помощью уведомлений событий AWS RDS.
3. Стабильный EC2: разверните экземпляр EC2, чтобы он acted как служба опроса или прокси на основе IP.
4. Автоматизируйте управление IP-адресами с помощью инструментов, таких как Terraform или CloudFormation.

## Что дальше? {#whats-next}

Теперь вы можете [создать свой ClickPipe](../index.md) и начать загружать данные из вашего экземпляра Postgres в ClickHouse Cloud. 
Не забудьте записать данные подключения, которые вы использовали при настройке вашего экземпляра Postgres, так как они понадобятся вам во время процесса создания ClickPipe.
