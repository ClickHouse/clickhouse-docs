---
slug: '/integrations/clickpipes/postgres/source/azure-flexible-server-postgres'
sidebar_label: 'Гибкий сервер Azure для Postgres'
description: 'Настройте Azure Flexible Server для Postgres в качестве источника'
title: 'Руководство по настройке источника гибкого сервера Azure для Postgres'
doc_type: guide
---
import server_parameters from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/server_parameters.png';
import wal_level from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/wal_level.png';
import restart from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/restart.png';
import firewall from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/firewall.png';
import Image from '@theme/IdealImage';


# Руководство по настройке источника Azure Flexible Server для Postgres

ClickPipes поддерживает версию Postgres 12 и выше.

## Включение логической репликации {#enable-logical-replication}

**Вам не нужно** следовать нижеуказанным шагам, если `wal_level` установлен на `logical`. Эта настройка должна быть предварительно настроена, если вы мигрируете с другого инструмента репликации данных.

1. Нажмите на раздел **Параметры сервера**

<Image img={server_parameters} alt="Параметры сервера в Azure Flexible Server для Postgres" size="lg" border/>

2. Измените `wal_level` на `logical`

<Image img={wal_level} alt="Изменить wal_level на logical в Azure Flexible Server для Postgres" size="lg" border/>

3. Это изменение потребует перезагрузки сервера. Так что перезагрузите, когда будет запрошено.

<Image img={restart} alt="Перезагрузить сервер после изменения wal_level" size="lg" border/>

## Создание пользователей ClickPipes и предоставление разрешений {#creating-clickpipes-user-and-granting-permissions}

Подключитесь к вашему Azure Flexible Server Postgres через пользователя администратора и выполните следующие команды:

1. Создайте пользователя Postgres исключительно для ClickPipes.

```sql
CREATE USER clickpipes_user PASSWORD 'some-password';
```

2. Предоставьте доступ только для чтения к схеме, из которой вы реплицируете таблицы, пользователю `clickpipes_user`. Ниже приведен пример настроек разрешений для схемы `public`. Если вы хотите предоставить доступ к нескольким схемам, вы можете выполнить эти три команды для каждой схемы.

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

5. Установите `wal_sender_timeout` на 0 для `clickpipes_user`

```sql
ALTER ROLE clickpipes_user SET wal_sender_timeout to 0;
```

## Добавление IP-адресов ClickPipes в брандмауэр {#add-clickpipes-ips-to-firewall}

Пожалуйста, выполните следующие шаги, чтобы добавить [IP-адреса ClickPipes](../../index.md#list-of-static-ips) в вашу сеть.

1. Перейдите на вкладку **Сеть** и добавьте [IP-адреса ClickPipes](../../index.md#list-of-static-ips) в брандмауэр вашего Azure Flexible Server Postgres ИЛИ на Jump Server/Bastion, если вы используете туннелирование SSH.

<Image img={firewall} alt="Добавить IP-адреса ClickPipes в брандмауэр в Azure Flexible Server для Postgres" size="lg"/>

## Что дальше? {#whats-next}

Теперь вы можете [создать ваш ClickPipe](../index.md) и начать прием данных из вашего экземпляра Postgres в ClickHouse Cloud. Убедитесь, что вы записали данные подключения, которые вы использовали при настройке вашего экземпляра Postgres, так как они понадобятся вам в процессе создания ClickPipe.