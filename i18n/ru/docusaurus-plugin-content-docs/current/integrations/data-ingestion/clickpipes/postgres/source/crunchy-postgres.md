---
sidebar_label: 'Crunchy Bridge Postgres'
description: 'Настройка Crunchy Bridge Postgres в качестве источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/crunchy-postgres
title: 'Руководство по настройке источника Crunchy Bridge Postgres'
keywords: ['crunchy bridge', 'postgres', 'clickpipes', 'логическая репликация', 'ингестия данных']
doc_type: 'guide'
---

import firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/firewall_rules_crunchy_bridge.png'
import add_firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/add_firewall_rules_crunchy_bridge.png'
import Image from '@theme/IdealImage';

# Руководство по настройке источника данных Crunchy Bridge Postgres {#crunchy-bridge-postgres-source-setup-guide}

ClickPipes поддерживает Postgres версии 12 и более поздних.

## Включение логической репликации {#enable-logical-replication}

Crunchy Bridge по умолчанию включает логическую репликацию ([подробнее](https://docs.crunchybridge.com/how-to/logical-replication)). Убедитесь, что приведённые ниже параметры настроены верно. При необходимости измените их.

```sql
SHOW wal_level; -- должно быть logical
SHOW max_wal_senders; -- должно быть 10
SHOW max_replication_slots; -- должно быть 10
```

## Создание пользователя ClickPipes и выдача прав доступа {#creating-clickpipes-user-and-granting-permissions}

Подключитесь к своему Crunchy Bridge Postgres под пользователем `postgres` и выполните следующие команды:

1. Создайте пользователя Postgres, предназначенного исключительно для ClickPipes.

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. Предоставьте пользователю `clickpipes_user` доступ только на чтение к схеме, из которой вы реплицируете таблицы. В приведённом ниже примере показано предоставление прав для схемы `public`. Если вы хотите предоставить доступ к нескольким схемам, выполните эти три команды для каждой схемы.

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. Предоставьте этому пользователю права на репликацию:

    ```sql
     ALTER ROLE clickpipes_user REPLICATION;
    ```

4. Создайте публикацию, которую вы будете использовать в дальнейшем для создания MIRROR (репликации).

    ```sql
    CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
    ```

## Разрешение IP-адресов ClickPipes {#safe-list-clickpipes-ips}

Добавьте [IP-адреса ClickPipes](../../index.md#list-of-static-ips) в список разрешённых, создав соответствующие правила брандмауэра (Firewall Rules) в Crunchy Bridge.

<Image size="lg" img={firewall_rules_crunchy_bridge} alt="Где найти правила брандмауэра (Firewall Rules) в Crunchy Bridge?" border/>

<Image size="lg" img={add_firewall_rules_crunchy_bridge} alt="Добавление правил брандмауэра (Firewall Rules) для ClickPipes" border/>

## Что дальше? {#whats-next}

Теперь вы можете [создать ClickPipe](../index.md) и начать приём данных из экземпляра Postgres в ClickHouse Cloud.
Обязательно сохраните параметры подключения, которые вы использовали при настройке экземпляра Postgres, так как они понадобятся при создании ClickPipe.
