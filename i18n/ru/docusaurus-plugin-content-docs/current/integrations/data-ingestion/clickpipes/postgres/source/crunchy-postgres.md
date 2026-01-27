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


# Руководство по настройке источника Crunchy Bridge Postgres \{#crunchy-bridge-postgres-source-setup-guide\}

ClickPipes поддерживает Postgres версии 12 и выше.

## Включение логической репликации \{#enable-logical-replication\}

Crunchy Bridge поставляется с включённой по [умолчанию](https://docs.crunchybridge.com/how-to/logical-replication) логической репликацией. Убедитесь, что ниже указанные параметры конфигурации заданы корректно. При необходимости измените их.

```sql
SHOW wal_level; -- should be logical
SHOW max_wal_senders; -- should be 10
SHOW max_replication_slots; -- should be 10
```


## Создание пользователя ClickPipes и выдача прав \{#creating-clickpipes-user-and-granting-permissions\}

Подключитесь к вашему Crunchy Bridge Postgres под пользователем `postgres` и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes:

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. Предоставьте на уровне схемы доступ только для чтения пользователю, которого вы создали на предыдущем шаге. В следующем примере показаны права для схемы `public`. Повторите эти команды для каждой схемы, содержащей таблицы, которые вы хотите реплицировать:

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. Предоставьте пользователю привилегии репликации:

    ```sql
     ALTER USER clickpipes_user WITH REPLICATION;
    ```

4. Создайте [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html) с таблицами, которые вы хотите реплицировать. Настоятельно рекомендуется включать в publication только необходимые таблицы, чтобы избежать лишней нагрузки на производительность.

   :::warning
   Любая таблица, включённая в publication, должна либо иметь определённый **primary key**, _либо_ для неё должна быть настроена **replica identity** со значением `FULL`. См. раздел [Postgres FAQs](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) для рекомендаций по выбору области действия.
   :::

   - Чтобы создать publication для конкретных таблиц:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - Чтобы создать publication для всех таблиц в определённой схеме:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   Publication `clickpipes` будет содержать набор событий изменений, сформированных из указанных таблиц, и позднее будет использоваться для приёма потока репликации.

## Добавьте IP-адреса ClickPipes в список разрешённых \{#safe-list-clickpipes-ips\}

Добавьте [IP-адреса ClickPipes](../../index.md#list-of-static-ips) в список разрешённых в Crunchy Bridge, создав правила брандмауэра (Firewall Rules).

<Image size="lg" img={firewall_rules_crunchy_bridge} alt="Где найти Firewall Rules в Crunchy Bridge?" border/>

<Image size="lg" img={add_firewall_rules_crunchy_bridge} alt="Добавление Firewall Rules для ClickPipes" border/>

## Что дальше? \{#whats-next\}

Теперь вы можете [создать ClickPipe](../index.md) и начать приём данных из вашего экземпляра Postgres в ClickHouse Cloud.
Обязательно запишите параметры подключения, которые вы использовали при настройке экземпляра Postgres, — они понадобятся вам в процессе создания ClickPipe.