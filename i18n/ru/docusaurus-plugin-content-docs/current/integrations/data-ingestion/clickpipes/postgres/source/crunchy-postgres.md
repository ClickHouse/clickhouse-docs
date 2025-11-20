---
sidebar_label: 'Crunchy Bridge Postgres'
description: 'Настройка Crunchy Bridge Postgres в качестве источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/crunchy-postgres
title: 'Руководство по настройке источника Crunchy Bridge Postgres'
keywords: ['crunchy bridge', 'postgres', 'clickpipes', 'logical replication', 'data ingestion']
doc_type: 'guide'
---

import firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/firewall_rules_crunchy_bridge.png'
import add_firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/add_firewall_rules_crunchy_bridge.png'
import Image from '@theme/IdealImage';


# Руководство по настройке источника данных Crunchy Bridge Postgres

ClickPipes поддерживает Postgres версии 12 и более новых.



## Включение логической репликации {#enable-logical-replication}

В Crunchy Bridge логическая репликация включена по [умолчанию](https://docs.crunchybridge.com/how-to/logical-replication). Убедитесь, что указанные ниже параметры настроены правильно. При необходимости скорректируйте их.

```sql
SHOW wal_level; -- должно быть logical
SHOW max_wal_senders; -- должно быть 10
SHOW max_replication_slots; -- должно быть 10
```


## Создание пользователя ClickPipes и предоставление разрешений {#creating-clickpipes-user-and-granting-permissions}

Подключитесь к вашей базе данных Crunchy Bridge Postgres под пользователем `postgres` и выполните следующие команды:

1. Создайте пользователя Postgres исключительно для ClickPipes.

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. Предоставьте доступ только для чтения к схеме, из которой реплицируются таблицы, пользователю `clickpipes_user`. В примере ниже показано предоставление разрешений для схемы `public`. Если необходимо предоставить доступ к нескольким схемам, выполните эти три команды для каждой схемы.

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. Предоставьте этому пользователю права на репликацию:

   ```sql
    ALTER ROLE clickpipes_user REPLICATION;
   ```

4. Создайте публикацию, которая будет использоваться для создания MIRROR (репликации) в дальнейшем.

   ```sql
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
   ```


## Добавление IP-адресов ClickPipes в белый список {#safe-list-clickpipes-ips}

Добавьте [IP-адреса ClickPipes](../../index.md#list-of-static-ips) в белый список, настроив правила межсетевого экрана в Crunchy Bridge.

<Image
  size='lg'
  img={firewall_rules_crunchy_bridge}
  alt='Где найти правила межсетевого экрана в Crunchy Bridge?'
  border
/>

<Image
  size='lg'
  img={add_firewall_rules_crunchy_bridge}
  alt='Добавление правил межсетевого экрана для ClickPipes'
  border
/>


## Что дальше? {#whats-next}

Теперь вы можете [создать ClickPipe](../index.md) и начать загружать данные из вашего экземпляра Postgres в ClickHouse Cloud.
Обязательно сохраните параметры подключения, которые вы использовали при настройке экземпляра Postgres, так как они понадобятся при создании ClickPipe.
