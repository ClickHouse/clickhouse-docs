---
sidebar_label: 'Crunchy Bridge Postgres'
description: 'Настройка Crunchy Bridge Postgres в качестве источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/crunchy-postgres
title: 'Руководство по настройке источника Crunchy Bridge Postgres'
keywords: ['crunchy bridge', 'postgres', 'clickpipes', 'логическая репликация', 'ингестия данных']
doc_type: 'guide'
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/firewall_rules_crunchy_bridge.png'
import add_firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/add_firewall_rules_crunchy_bridge.png'
import Image from '@theme/IdealImage';

# Руководство по настройке источника данных Crunchy Bridge Postgres {#crunchy-bridge-postgres-source-setup-guide}

ClickPipes поддерживает Postgres версии 12 и новее.

## Включение логической репликации {#enable-logical-replication}

Crunchy Bridge по умолчанию включает логическую репликацию ([подробнее](https://docs.crunchybridge.com/how-to/logical-replication)). Убедитесь, что приведённые ниже параметры настроены верно. При необходимости измените их.

```sql
SHOW wal_level; -- should be logical
SHOW max_wal_senders; -- should be 10
SHOW max_replication_slots; -- should be 10
```


## Создание пользователя ClickPipes и выдача прав {#creating-clickpipes-user-and-granting-permissions}

Подключитесь к вашему Crunchy Bridge Postgres от имени пользователя `postgres` и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes:

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. Предоставьте на уровне схемы доступ только для чтения пользователю, созданному на предыдущем шаге. В следующем примере показаны права для схемы `public`. Повторите эти команды для каждой схемы, содержащей таблицы, которые вы хотите реплицировать:

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. Выдайте пользователю права на репликацию:

    ```sql
     ALTER ROLE clickpipes_user REPLICATION;
    ```

4. Создайте [публикацию](https://www.postgresql.org/docs/current/logical-replication-publication.html) с таблицами, которые вы хотите реплицировать. Настоятельно рекомендуется включать в публикацию только необходимые таблицы, чтобы избежать лишних накладных расходов и деградации производительности.

   :::warning
   Любая таблица, включённая в публикацию, должна либо иметь определённый **первичный ключ**, _либо_ её **replica identity** должна быть настроена на `FULL`. См. раздел [Postgres FAQs](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) для рекомендаций по определению области публикаций.
   :::

   - Чтобы создать публикацию для конкретных таблиц:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - Чтобы создать публикацию для всех таблиц в определённой схеме:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   Публикация `clickpipes` будет содержать набор событий изменений, сгенерированных из указанных таблиц, и позже будет использоваться для приёма потока репликации.

## Разрешение IP-адресов ClickPipes {#safe-list-clickpipes-ips}

Добавьте [IP-адреса ClickPipes](../../index.md#list-of-static-ips) в список разрешённых, создав соответствующие правила брандмауэра (Firewall Rules) в Crunchy Bridge.

<Image size="lg" img={firewall_rules_crunchy_bridge} alt="Где найти правила брандмауэра (Firewall Rules) в Crunchy Bridge?" border/>

<Image size="lg" img={add_firewall_rules_crunchy_bridge} alt="Добавление правил брандмауэра (Firewall Rules) для ClickPipes" border/>

## Что дальше? {#whats-next}

Теперь вы можете [создать ClickPipe](../index.md) и начать приём данных из экземпляра Postgres в ClickHouse Cloud.
Обязательно сохраните параметры подключения, которые вы использовали при настройке экземпляра Postgres, так как они понадобятся при создании ClickPipe.