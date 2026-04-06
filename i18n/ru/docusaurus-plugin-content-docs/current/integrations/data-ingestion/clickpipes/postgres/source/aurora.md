---
sidebar_label: 'Amazon Aurora Postgres'
description: 'Настройте Amazon Aurora Postgres в качестве источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/aurora
title: 'Руководство по настройке источника Aurora Postgres'
doc_type: 'guide'
keywords: ['Amazon Aurora', 'PostgreSQL', 'ClickPipes', 'база данных AWS', 'настройка логической репликации']
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

# Руководство по настройке источника Aurora Postgres \{#aurora-postgres-source-setup-guide\}

## Поддерживаемые версии Postgres \{#supported-postgres-versions\}

ClickPipes поддерживает Aurora PostgreSQL-Compatible Edition версии 12 и более поздние.

## Включите логическую репликацию \{#enable-logical-replication\}

Этот раздел можно пропустить, если для вашего экземпляра Aurora уже заданы следующие параметры:

* `rds.logical_replication = 1`
* `wal_sender_timeout = 0`

Обычно эти параметры уже настроены, если вы ранее использовали другой инструмент для репликации данных.

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

1. Создайте новую группу параметров для вашей версии Aurora PostgreSQL с необходимыми настройками:
   * Установите `rds.logical_replication` в значение 1
   * Установите `wal_sender_timeout` в значение 0

<Image img={parameter_group_in_blade} alt="Где найти группы параметров в Aurora" size="lg" border />

<Image img={change_rds_logical_replication} alt="Изменение rds.logical_replication" size="lg" border />

<Image img={change_wal_sender_timeout} alt="Изменение wal_sender_timeout" size="lg" border />

2. Примените новую группу параметров к кластеру Aurora PostgreSQL

<Image img={modify_parameter_group} alt="Изменение Aurora PostgreSQL с новой группой параметров" size="lg" border />

3. Перезагрузите кластер Aurora, чтобы применить изменения

<Image img={reboot_rds} alt="Перезагрузка Aurora PostgreSQL" size="lg" border />

## Настройка пользователя базы данных \{#configure-database-user\}

Подключитесь к экземпляру Aurora PostgreSQL для записи от имени администратора и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes:

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. Предоставьте пользователю, созданному на предыдущем шаге, доступ только для чтения на уровне схемы. В следующем примере показаны права доступа для схемы `public`. Повторите эти команды для каждой схемы, содержащей таблицы, которые вы хотите реплицировать:

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. Предоставьте пользователю права на репликацию:

   ```sql
   GRANT rds_replication TO clickpipes_user;
   ```

4. Создайте [публикацию](https://www.postgresql.org/docs/current/logical-replication-publication.html) с таблицами, которые вы хотите реплицировать. Мы настоятельно рекомендуем включать в публикацию только необходимые таблицы, чтобы избежать лишней нагрузки.

   :::warning
   Любая таблица, включённая в публикацию, должна либо иметь определённый **первичный ключ**, *либо* иметь **идентичность реплики**, настроенную на `FULL`. Рекомендации по выбору области см. в [Postgres FAQs](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication).
   :::

   * Чтобы создать публикацию для конкретных таблиц:

     ```sql
     CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
     ```

   * Чтобы создать публикацию для всех таблиц в конкретной схеме:

     ```sql
     CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
     ```

   Публикация `clickpipes` будет содержать набор событий изменений, сгенерированных для указанных таблиц, и позднее будет использоваться для приёма потока репликации.

## Настройте сетевой доступ \{#configure-network-access\}

### Управление доступом по IP-адресам \{#ip-based-access-control\}

Если вы хотите ограничить доступ к своему кластеру Aurora, добавьте [задокументированные статические NAT IP-адреса](../../index.md#list-of-static-ips) в правила `Inbound rules` группы безопасности Aurora.

<Image img={security_group_in_rds_postgres} alt="Где найти группу безопасности в Aurora PostgreSQL?" size="lg" border />

<Image img={edit_inbound_rules} alt="Изменение правил inbound rules для указанной выше группы безопасности" size="lg" border />

### Частный доступ через AWS PrivateLink \{#private-access-via-aws-privatelink\}

Чтобы подключиться к вашему кластеру Aurora через частную сеть, используйте AWS PrivateLink. Для настройки подключения следуйте [руководству по настройке AWS PrivateLink для ClickPipes](/knowledgebase/aws-privatelink-setup-for-clickpipes).

### Особенности Aurora \{#aurora-specific-considerations\}

При настройке ClickPipes с Aurora PostgreSQL учитывайте следующее:

1. **Конечная точка подключения**: Всегда подключайтесь к конечной точке записи кластера Aurora, так как для логической репликации нужен доступ на запись для создания слотов репликации, а также подключение к основному экземпляру.

2. **Обработка failover**: В случае failover Aurora автоматически повысит ридер до нового writer. ClickPipes обнаружит разрыв соединения и попытается снова подключиться к конечной точке записи, которая теперь будет указывать на новый основной экземпляр.

3. **Global Database**: Если вы используете Aurora Global Database, подключайтесь к конечной точке записи основного региона, так как межрегиональная репликация уже обеспечивает перемещение данных между регионами.

4. **Особенности хранения**: В Aurora уровень хранения является общим для всех экземпляров кластера, что может обеспечивать более высокую производительность логической репликации по сравнению со стандартным RDS.

### Работа с динамическими конечными точками кластера \{#dealing-with-dynamic-cluster-endpoints\}

Хотя Aurora предоставляет стабильные конечные точки, которые автоматически направляют запросы на соответствующий экземпляр, ниже приведены дополнительные способы обеспечить стабильное подключение:

1. Для конфигураций с высокой доступностью настройте приложение на использование конечной точки записи Aurora, которая автоматически указывает на текущий основной экземпляр.

2. Если используется межрегиональная репликация, рассмотрите настройку отдельных ClickPipes для каждого региона, чтобы снизить задержку и повысить отказоустойчивость.

## Что дальше? \{#whats-next\}

Теперь вы можете [создать ClickPipe](../index.md) и начать приём данных из кластера Aurora PostgreSQL в ClickHouse Cloud.
Обязательно сохраните параметры подключения, которые вы использовали при настройке кластера Aurora PostgreSQL, — они понадобятся вам при создании ClickPipe.