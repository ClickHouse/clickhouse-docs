---
'sidebar_label': 'Crunchy Bridge Postgres'
'description': 'Настройте Crunchy Bridge Postgres как источник для ClickPipes'
'slug': '/integrations/clickpipes/postgres/source/crunchy-postgres'
'title': 'Настройка источника Crunchy Bridge Postgres'
'doc_type': 'guide'
---

import firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/firewall_rules_crunchy_bridge.png'
import add_firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/add_firewall_rules_crunchy_bridge.png'
import Image from '@theme/IdealImage';


# Руководство по настройке источника Postgres для Crunchy Bridge

ClickPipes поддерживает версии Postgres 12 и выше.

## Включение логической репликации {#enable-logical-replication}

Crunchy Bridge поставляется с включенной логической репликацией по [умолчанию](https://docs.crunchybridge.com/how-to/logical-replication). Убедитесь, что нижеуказанные параметры настроены правильно. Если нет, скорректируйте их соответственно.

```sql
SHOW wal_level; -- should be logical
SHOW max_wal_senders; -- should be 10
SHOW max_replication_slots; -- should be 10
```

## Создание пользователя ClickPipes и предоставление разрешений {#creating-clickpipes-user-and-granting-permissions}

Подключитесь к вашему Crunchy Bridge Postgres через пользователя `postgres` и выполните следующие команды:

1. Создайте пользователя Postgres исключительно для ClickPipes.

```sql
CREATE USER clickpipes_user PASSWORD 'some-password';
```

2. Предоставьте доступ только для чтения к схеме, из которой вы реплицируете таблицы, пользователю `clickpipes_user`. Пример ниже показывает, как предоставить разрешения для схемы `public`. Если вы хотите предоставить доступ к нескольким схемам, вы можете выполнить эти три команды для каждой схемы.

```sql
GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
```

3. Предоставьте этому пользователю доступ к репликации:

```sql
ALTER ROLE clickpipes_user REPLICATION;
```

4. Создайте публикацию, которую вы будете использовать для создания MIRROR (репликации) в будущем.

```sql
CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

## Добавление IP-адресов ClickPipes в белый список {#safe-list-clickpipes-ips}

Добавьте в белый список [IP-адреса ClickPipes](../../index.md#list-of-static-ips), добавив правила брандмауэра в Crunchy Bridge.

<Image size="lg" img={firewall_rules_crunchy_bridge} alt="Где найти правила брандмауэра в Crunchy Bridge?" border/>

<Image size="lg" img={add_firewall_rules_crunchy_bridge} alt="Добавьте правила брандмауэра для ClickPipes" border/>

## Что дальше? {#whats-next}

Теперь вы можете [создать свой ClickPipe](../index.md) и начать загружать данные из вашего экземпляра Postgres в ClickHouse Cloud. Не забудьте записать данные подключения, которые вы использовали при настройке вашего экземпляра Postgres, так как они понадобятся вам в процессе создания ClickPipe.
