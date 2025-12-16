---
sidebar_label: 'Amazon Aurora Postgres'
description: 'Настройка Amazon Aurora Postgres в качестве источника данных для ClickPipes'
slug: /integrations/clickpipes/postgres/source/aurora
title: 'Руководство по настройке источника Aurora Postgres'
doc_type: 'guide'
keywords: ['Amazon Aurora', 'PostgreSQL', 'ClickPipes', 'база данных AWS', 'настройка логической репликации']
---

import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import change_rds_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_rds_logical_replication.png';
import change_wal_sender_timeout from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_wal_sender_timeout.png';
import modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/modify_parameter_group.png';
import reboot_rds from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/reboot_rds.png';
import security_group_in_rds_postgres from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/security_group_in_rds_postgres.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';

# Руководство по настройке источника данных Aurora Postgres {#aurora-postgres-source-setup-guide}

## Поддерживаемые версии Postgres {#supported-postgres-versions}

ClickPipes поддерживает Aurora PostgreSQL-Compatible Edition версий 12 и выше.

## Включение логической репликации {#enable-logical-replication}

Вы можете пропустить этот раздел, если в вашем экземпляре Aurora уже настроены следующие параметры:

* `rds.logical_replication = 1`
* `wal_sender_timeout = 0`

Эти параметры, как правило, уже настроены, если вы ранее использовали другой инструмент репликации данных.

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

Если вы ещё этого не сделали, выполните следующие шаги:

1. Создайте новую группу параметров для вашей версии Aurora PostgreSQL со следующими настройками:
   * Установите `rds.logical_replication` в значение 1
   * Установите `wal_sender_timeout` в значение 0

<Image img={parameter_group_in_blade} alt="Где найти группы параметров в Aurora" size="lg" border />

<Image img={change_rds_logical_replication} alt="Изменение rds.logical_replication" size="lg" border />

<Image img={change_wal_sender_timeout} alt="Изменение wal_sender_timeout" size="lg" border />

2. Примените новую группу параметров к кластеру Aurora PostgreSQL

<Image img={modify_parameter_group} alt="Изменение конфигурации Aurora PostgreSQL с новой группой параметров" size="lg" border />

3. Перезагрузите кластер Aurora, чтобы применить изменения

<Image img={reboot_rds} alt="Перезагрузка Aurora PostgreSQL" size="lg" border />

## Настройка пользователя базы данных {#configure-database-user}

Подключитесь к экземпляру Aurora PostgreSQL writer с учетной записью с правами администратора и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes:

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. Назначьте права на схему. В следующем примере показаны права для схемы `public`. Повторите эти команды для каждой схемы, которую вы хотите реплицировать:

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. Назначьте права на репликацию:

    ```sql
    GRANT rds_replication TO clickpipes_user;
    ```

4. Создайте публикацию для репликации:

    ```sql
    CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
    ```

## Настройка сетевого доступа {#configure-network-access}

### Управление доступом по IP-адресам {#ip-based-access-control}

Если вы хотите ограничить трафик к кластеру Aurora, добавьте [задокументированные статические NAT IP-адреса](../../index.md#list-of-static-ips) в раздел `Inbound rules` группы безопасности Aurora.

<Image img={security_group_in_rds_postgres} alt="Где найти группу безопасности в Aurora PostgreSQL?" size="lg" border/>

<Image img={edit_inbound_rules} alt="Редактирование inbound rules для указанной выше группы безопасности" size="lg" border/>

### Закрытый доступ через AWS PrivateLink {#private-access-via-aws-privatelink}

Чтобы подключиться к кластеру Aurora по приватной сети, вы можете использовать AWS PrivateLink. Следуйте нашему [руководству по настройке AWS PrivateLink для ClickPipes](/knowledgebase/aws-privatelink-setup-for-clickpipes), чтобы настроить подключение.

### Особенности Aurora {#aurora-specific-considerations}

При настройке ClickPipes с Aurora PostgreSQL учитывайте следующие моменты:

1. **Endpoint подключения**: Всегда подключайтесь к writer endpoint кластера Aurora, так как для логической репликации требуется доступ на запись для создания replication slots, и подключение должно осуществляться к первичному (primary) инстансу.

2. **Обработка отказа (failover)**: В случае failover Aurora автоматически повысит один из reader-инстансов до роли нового writer. ClickPipes обнаружит разрыв соединения и попытается переподключиться к writer endpoint, который теперь будет указывать на новый primary-инстанс.

3. **Global Database**: Если вы используете Aurora Global Database, следует подключаться к writer endpoint первичного региона, поскольку межрегиональная репликация уже обрабатывает передачу данных между регионами.

4. **Особенности хранилища**: Слой хранения Aurora является общим для всех инстансов в кластере, что может обеспечивать лучшую производительность логической репликации по сравнению со стандартным RDS.

### Работа с динамическими endpoint'ами кластера {#dealing-with-dynamic-cluster-endpoints}

Хотя Aurora предоставляет стабильные endpoint'ы, которые автоматически маршрутизируют трафик к соответствующему инстансу, ниже приведены дополнительные подходы для обеспечения стабильного подключения:

1. Для высокодоступных конфигураций настройте приложение на использование writer endpoint Aurora, который автоматически указывает на текущий primary-инстанс.

2. При использовании межрегионной репликации рассмотрите возможность настройки отдельных ClickPipes для каждого региона, чтобы снизить задержки и повысить отказоустойчивость.

## Что дальше? {#whats-next}

Теперь вы можете [создать свой ClickPipe](../index.md) и начать приём данных из своего кластера Aurora PostgreSQL в ClickHouse Cloud.
Обязательно запишите параметры подключения, которые вы использовали при его настройке, — они понадобятся вам при создании ClickPipe.
