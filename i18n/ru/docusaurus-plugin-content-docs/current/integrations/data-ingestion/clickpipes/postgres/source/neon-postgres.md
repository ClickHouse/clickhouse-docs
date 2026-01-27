---
sidebar_label: 'Neon Postgres'
description: 'Настройка экземпляра Neon Postgres в качестве источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/neon-postgres
title: 'Руководство по настройке источника Neon Postgres'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'ингестия данных', 'синхронизация в реальном времени']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import neon_enable_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enable-replication.png'
import neon_enabled_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enabled-replication.png'
import neon_ip_allow from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-ip-allow.png'
import neon_conn_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-conn-details.png'
import Image from '@theme/IdealImage';


# Руководство по настройке источника Neon Postgres \{#neon-postgres-source-setup-guide\}

Это руководство по настройке Neon Postgres, который вы можете использовать в качестве источника репликации в ClickPipes.
Для выполнения этой настройки убедитесь, что вы вошли в свою [консоль Neon](https://console.neon.tech/app/projects).

## Создание пользователя с необходимыми правами \{#creating-a-user-with-permissions\}

Подключитесь к вашему экземпляру Neon под пользователем с правами администратора и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes:

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. Предоставьте созданному на предыдущем шаге пользователю права на доступ к схеме с правами только на чтение. В следующем примере показаны права для схемы `public`. Повторите эти команды для каждой схемы, содержащей таблицы, которые вы хотите реплицировать:
   
    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. Предоставьте пользователю привилегии репликации:

   ```sql
   ALTER USER clickpipes_user WITH REPLICATION;
   ```

4. Создайте [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html) с таблицами, которые вы хотите реплицировать. Настоятельно рекомендуется включать в публикацию только те таблицы, которые вам действительно необходимы, чтобы избежать излишних накладных расходов на производительность.

   :::warning
   Любая таблица, включённая в публикацию, должна либо иметь определённый **первичный ключ**, _либо_ её **replica identity** должна быть настроена на значение `FULL`. См. раздел [Postgres FAQs](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) для получения рекомендаций по выбору области публикаций.
   :::

   - Чтобы создать публикацию для конкретных таблиц:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - Чтобы создать публикацию для всех таблиц в конкретной схеме:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   Публикация `clickpipes` будет содержать набор событий изменений, генерируемых для указанных таблиц, и затем использоваться для приёма потока репликации.

## Включение логической репликации \{#enable-logical-replication\}

В Neon вы можете включить логическую репликацию через UI. Это необходимо для CDC (фиксация изменений данных) ClickPipes, чтобы реплицировать данные.
Перейдите на вкладку **Settings**, а затем в раздел **Logical Replication**.

<Image size="lg" img={neon_enable_replication} alt="Включить логическую репликацию" border />

Нажмите **Enable**, чтобы завершить настройку. После включения вы должны увидеть расположенное ниже сообщение об успешном выполнении.

<Image size="lg" img={neon_enabled_replication} alt="Логическая репликация включена" border />

Давайте проверим следующие настройки в вашем экземпляре Neon Postgres:

```sql
SHOW wal_level; -- should be logical
SHOW max_wal_senders; -- should be 10
SHOW max_replication_slots; -- should be 10
```


## Добавление IP-адресов в список разрешённых (для тарифного плана Neon Enterprise) \{#ip-whitelisting-for-neon-enterprise-plan\}

Если у вас тарифный план Neon Enterprise, вы можете добавить в список разрешённых [IP-адреса ClickPipes](../../index.md#list-of-static-ips), чтобы разрешить репликацию из ClickPipes в ваш экземпляр Neon Postgres.
Для этого перейдите на вкладку **Settings** и откройте раздел **IP Allow**.

<Image size="lg" img={neon_ip_allow} alt="Экран разрешения IP-адресов" border/>

## Скопируйте параметры подключения \{#copy-connection-details\}

Теперь, когда пользователь создан, публикация готова, а репликация включена, мы можем скопировать параметры подключения, чтобы создать новый ClickPipe.
Перейдите в **Dashboard** и в текстовом поле, где отображается строка подключения,
измените режим отображения на **Parameters Only**. Эти параметры понадобятся нам на следующем шаге.

<Image size="lg" img={neon_conn_details} alt="Параметры подключения" border/>

## Что дальше? \{#whats-next\}

Теперь вы можете [создать свой ClickPipe](../index.md) и начать приём данных из экземпляра Postgres в ClickHouse Cloud.
Обязательно сохраните параметры подключения, которые вы использовали при настройке экземпляра Postgres, так как они понадобятся вам в процессе создания ClickPipe.