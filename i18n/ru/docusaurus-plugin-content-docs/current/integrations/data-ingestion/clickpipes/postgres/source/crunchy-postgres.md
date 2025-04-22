---
sidebar_label: 'Crunchy Bridge Postgres'
description: 'Настройка Crunchy Bridge Postgres в качестве источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/crunchy-postgres
title: 'Руководство по настройке источника Crunchy Bridge Postgres'
---

import firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/firewall_rules_crunchy_bridge.png'
import add_firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/add_firewall_rules_crunchy_bridge.png'
import Image from '@theme/IdealImage';


# Руководство по настройке источника Crunchy Bridge Postgres


ClickPipes поддерживает версии Postgres 12 и выше.

## Включение логической репликации {#enable-logical-replication}

Crunchy Bridge имеет включенную логическую репликацию по [умолчанию](https://docs.crunchybridge.com/how-to/logical-replication). Убедитесь, что параметры ниже настроены правильно. Если нет, скорректируйте их соответствующим образом.

```sql
SHOW wal_level; -- должно быть logical
SHOW max_wal_senders; -- должно быть 10
SHOW max_replication_slots; -- должно быть 10
```

## Создание пользователя ClickPipes и предоставление прав {#creating-clickpipes-user-and-granting-permissions}

Подключитесь к вашему Crunchy Bridge Postgres через пользователя `postgres` и выполните следующие команды:

1. Создайте пользователя Postgres исключительно для ClickPipes.

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. Предоставьте доступ только для чтения к схеме, из которой вы реплицируете таблицы, пользователю `clickpipes_user`. Пример ниже показывает, как предоставить права для схемы `public`. Если вы хотите предоставить доступ к нескольким схемам, выполните эти три команды для каждой схемы.

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. Предоставьте этому пользователю доступ к репликации:

    ```sql
    ALTER ROLE clickpipes_user REPLICATION;
    ```

4. Создайте публикацию, которую вы будете использовать для создания ЗЕРКАЛА (репликации) в будущем.

    ```sql
    CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
    ```

## Безопасный список IP-адресов ClickPipes {#safe-list-clickpipes-ips}

Добавьте IP-адреса [ClickPipes](../../index.md#list-of-static-ips) в безопасный список, добавив правила брандмауэра в Crunchy Bridge.

<Image size="lg" img={firewall_rules_crunchy_bridge} alt="Где найти правила брандмауэра в Crunchy Bridge?" border/>

<Image size="lg" img={add_firewall_rules_crunchy_bridge} alt="Добавьте правила брандмауэра для ClickPipes" border/>

## Что дальше? {#whats-next}

Теперь вы можете [создать ваш ClickPipe](../index.md) и начать прием данных из вашей инстанции Postgres в ClickHouse Cloud. 
Не забудьте записать детали подключения, которые вы использовали при настройке вашей инстанции Postgres, так как они понадобятся вам в процессе создания ClickPipe.
