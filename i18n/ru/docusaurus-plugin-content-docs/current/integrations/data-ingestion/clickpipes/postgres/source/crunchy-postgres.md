---
sidebar_label: Crunchy Bridge Postgres
description: Настройка Crunchy Bridge Postgres как источника для ClickPipes
slug: /integrations/clickpipes/postgres/source/crunchy-postgres
---

import firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/firewall_rules_crunchy_bridge.png'
import add_firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/add_firewall_rules_crunchy_bridge.png'


# Руководство по настройке источника Crunchy Bridge Postgres

ClickPipes поддерживает версию Postgres 12 и выше.

## Включение логической репликации {#enable-logical-replication}

Crunchy Bridge поставляется с включенной логической репликацией по [умолчанию](https://docs.crunchybridge.com/how-to/logical-replication). Убедитесь, что нижеприведенные настройки сконфигурированы правильно. Если нет, скорректируйте их соответствующим образом.

```sql
SHOW wal_level; -- должно быть logical
SHOW max_wal_senders; -- должно быть 10
SHOW max_replication_slots; -- должно быть 10
```

## Создание пользователя ClickPipes и предоставление разрешений {#creating-clickpipes-user-and-granting-permissions}

Подключитесь к вашему Crunchy Bridge Postgres через пользователя `postgres` и выполните следующие команды:

1. Создайте пользователя Postgres исключительно для ClickPipes.

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. Предоставьте только для чтения доступ к схеме, из которой вы реплицируете таблицы пользователю `clickpipes_user`. Пример ниже показывает, как предоставить разрешения для схемы `public`. Если вы хотите предоставить доступ к нескольким схемам, вы можете выполнить эти три команды для каждой схемы.

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

## Добавление IP-адресов ClickPipes в безопасный список {#safe-list-clickpipes-ips}

Добавьте IP-адреса [ClickPipes](../../index.md#list-of-static-ips) в безопасный список, добавив правила брандмауэра в Crunchy Bridge.

<img src={firewall_rules_crunchy_bridge} alt="Где найти правила брандмауэра в Crunchy Bridge?"/>

<img src={add_firewall_rules_crunchy_bridge} alt="Добавьте правила брандмауэра для ClickPipes"/>

## Что дальше? {#whats-next}

Теперь вы можете [создать свой ClickPipe](../index.md) и начать загружать данные из вашего экземпляра Postgres в ClickHouse Cloud. 
Не забудьте записать детали подключения, которые вы использовали при настройке вашего экземпляра Postgres, так как они понадобятся вам в процессе создания ClickPipe.
