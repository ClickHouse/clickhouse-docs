---
sidebar_label: 'Amazon RDS Postgres'
description: 'Настройка Amazon RDS Postgres в качестве источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/rds
title: 'Руководство по настройке источника RDS Postgres'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'ингестия данных', 'синхронизация в реальном времени']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import change_rds_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_rds_logical_replication.png';
import change_wal_sender_timeout from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_wal_sender_timeout.png';
import modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/modify_parameter_group.png';
import reboot_rds from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/reboot_rds.png';
import security_group_in_rds_postgres from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/security_group_in_rds_postgres.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';


# Руководство по настройке источника данных RDS Postgres \{#rds-postgres-source-setup-guide\}

## Поддерживаемые версии Postgres \{#supported-postgres-versions\}

ClickPipes поддерживает Postgres начиная с версии 12.

## Включить логическую репликацию \{#enable-logical-replication\}

Вы можете пропустить этот раздел, если в вашем экземпляре RDS уже заданы следующие параметры:

* `rds.logical_replication = 1`
* `wal_sender_timeout = 0`

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

Если это ещё не настроено, выполните следующие шаги:

1. Создайте новую группу параметров для вашей версии Postgres с необходимыми настройками:
   * Установите значение `rds.logical_replication` равным 1
   * Установите значение `wal_sender_timeout` равным 0

<Image img={parameter_group_in_blade} alt="Где находятся группы параметров в RDS?" size="lg" border />

<Image img={change_rds_logical_replication} alt="Настройка rds.logical_replication" size="lg" border />

<Image img={change_wal_sender_timeout} alt="Настройка wal_sender_timeout" size="lg" border />

2. Примените новую группу параметров к вашей базе данных RDS Postgres

<Image img={modify_parameter_group} alt="Изменение конфигурации RDS Postgres с новой группой параметров" size="lg" border />

3. Перезапустите экземпляр RDS, чтобы применить изменения

<Image img={reboot_rds} alt="Перезапуск RDS Postgres" size="lg" border />


## Настройка пользователя базы данных \{#configure-database-user\}

Подключитесь к вашему экземпляру RDS Postgres под учётной записью администратора и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes:

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. Предоставьте этому пользователю права только на чтение на уровне схемы. В следующем примере показаны права для схемы `public`. Повторите эти команды для каждой схемы, содержащей таблицы, которые вы хотите реплицировать:

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. Предоставьте пользователю привилегии репликации:

    ```sql
    GRANT rds_replication TO clickpipes_user;
    ```

4. Создайте [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html) с таблицами, которые вы хотите реплицировать. Настоятельно рекомендуется включать в publication только те таблицы, которые вам действительно нужны, чтобы избежать излишней нагрузки на производительность.

   :::warning
   Любая таблица, включённая в publication, должна либо иметь определённый **primary key**, _либо_ её **replica identity** должна быть настроена на `FULL`. См. раздел [Postgres FAQs](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) для рекомендаций по выбору области действия.
   :::

   - Чтобы создать publication для конкретных таблиц:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - Чтобы создать publication для всех таблиц в конкретной схеме:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   Publication `clickpipes` будет содержать набор событий изменений, сгенерированных из указанных таблиц, и позднее будет использоваться для приёма потока репликации.

## Настройка сетевого доступа \{#configure-network-access\}

### Управление доступом на основе IP-адресов \{#ip-based-access-control\}

Если вы хотите ограничить трафик к своему экземпляру RDS, добавьте [задокументированные статические NAT IP-адреса](../../index.md#list-of-static-ips) в раздел `Inbound rules` группы безопасности RDS.

<Image img={security_group_in_rds_postgres} alt="Где найти группу безопасности в RDS Postgres?" size="lg" border/>

<Image img={edit_inbound_rules} alt="Редактирование inbound rules для указанной выше группы безопасности" size="lg" border/>

### Приватный доступ через AWS PrivateLink \{#private-access-via-aws-privatelink\}

Чтобы подключиться к вашему экземпляру RDS по частной сети, вы можете использовать AWS PrivateLink. Воспользуйтесь нашим [руководством по настройке AWS PrivateLink для ClickPipes](/knowledgebase/aws-privatelink-setup-for-clickpipes), чтобы настроить подключение.

### Обходные решения для RDS Proxy \{#workarounds-for-rds-proxy\}

RDS Proxy не поддерживает подключения логической репликации. Если у вас динамические IP‑адреса в RDS и вы не можете использовать DNS‑имя или AWS Lambda, вот несколько альтернатив:

1. С помощью cron‑задания периодически разрешайте IP‑адрес конечной точки RDS и обновляйте NLB, если он изменился.
2. Использование RDS Event Notifications с EventBridge/SNS: автоматически инициируйте обновления с помощью уведомлений о событиях AWS RDS.
3. Постоянный экземпляр EC2: разверните экземпляр EC2, который будет выступать в роли сервиса опроса или IP‑прокси.
4. Автоматизируйте управление IP‑адресами с помощью таких инструментов, как Terraform или CloudFormation.

## Что дальше? \{#whats-next\}

Теперь вы можете [создать свой ClickPipe](../index.md) и начать приём данных из экземпляра Postgres в ClickHouse Cloud.
Обязательно запишите параметры подключения, которые вы использовали при настройке экземпляра Postgres, так как они понадобятся вам при создании ClickPipe.