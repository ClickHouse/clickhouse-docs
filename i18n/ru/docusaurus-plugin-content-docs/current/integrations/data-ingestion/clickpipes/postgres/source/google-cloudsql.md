---
slug: '/integrations/clickpipes/postgres/source/google-cloudsql'
sidebar_label: 'Google Cloud SQL'
description: 'Настройте экземпляр Google Cloud SQL Postgres в качестве источника'
title: 'Руководство по настройке источника Google Cloud SQL Postgres'
doc_type: guide
---
import edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/edit.png';
import cloudsql_logical_decoding1 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/cloudsql_logical_decoding1.png';
import cloudsql_logical_decoding2 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/cloudsql_logical_decoding2.png';
import cloudsql_logical_decoding3 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/cloudsql_logical_decoding3.png';
import connections from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/connections.png';
import connections_networking from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/connections_networking.png';
import firewall1 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/firewall1.png';
import firewall2 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/firewall2.png';
import Image from '@theme/IdealImage';


# Настройка источника Google Cloud SQL Postgres

:::info

Если вы используете одного из поддерживаемых провайдеров (в боковом меню), пожалуйста, обратитесь к конкретному руководству для этого провайдера.

:::

## Поддерживаемые версии Postgres {#supported-postgres-versions}

Всё, начиная с Postgres 12

## Включение логической репликации {#enable-logical-replication}

**Вам не нужно** следовать приведённым ниже шагам, если настройки `cloudsql.logical_decoding` включены, а `wal_sender_timeout` равен 0. Эти настройки должны быть в большинстве случаев предварительно настроены, если вы мигрируете с другого инструмента репликации данных.

1. Нажмите кнопку **Изменить** на странице Обзор.

<Image img={edit_button} alt="Кнопка Изменить в Cloud SQL Postgres" size="lg" border/>

2. Перейдите в раздел Флаги и измените `cloudsql.logical_decoding` на включённый, а `wal_sender_timeout` на 0. Эти изменения потребуют перезапуска вашего сервера Postgres.

<Image img={cloudsql_logical_decoding1} alt="Изменение cloudsql.logical_decoding на включенный" size="lg" border/>
<Image img={cloudsql_logical_decoding2} alt="Изменение cloudsql.logical_decoding и wal_sender_timeout" size="lg" border/>
<Image img={cloudsql_logical_decoding3} alt="Перезагрузка сервера" size="lg" border/>

## Создание пользователя ClickPipes и предоставление разрешений {#creating-clickpipes-user-and-granting-permissions}

Подключитесь к вашему Cloud SQL Postgres через администратора и выполните приведённые ниже команды:

1. Создайте пользователя Postgres исключительно для ClickPipes.

```sql
CREATE USER clickpipes_user PASSWORD 'some-password';
```

2. Предоставьте пользователю `clickpipes_user` доступ только для чтения к схеме, из которой вы реплицируете таблицы. Ниже приведённый пример показывает, как установить разрешения для схемы `public`. Если вы хотите предоставить доступ к нескольким схемам, вы можете выполнить эти три команды для каждой схемы.

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

[//]: # (TODO Add SSH Tunneling)

## Добавление IP-адресов ClickPipes в брандмауэр {#add-clickpipes-ips-to-firewall}

Пожалуйста, выполните следующие шаги, чтобы добавить IP-адреса ClickPipes в вашу сеть.

:::note

Если вы используете SSH Tunneling, вам необходимо добавить [IP-адреса ClickPipes](../../index.md#list-of-static-ips) в правила брандмауэра Jump Server/Bastion.

:::

1. Перейдите в раздел **Подключения**

<Image img={connections} alt="Раздел Подключения в Cloud SQL" size="lg" border/>

2. Перейдите в подраздел Сеть

<Image img={connections_networking} alt="Подраздел Сеть в Cloud SQL" size="lg" border/>

3. Добавьте [публичные IP-адреса ClickPipes](../../index.md#list-of-static-ips)

<Image img={firewall1} alt="Добавление сетей ClickPipes в брандмауэр" size="lg" border/>
<Image img={firewall2} alt="Сети ClickPipes добавлены в брандмауэр" size="lg" border/>

## Что дальше? {#whats-next}

Теперь вы можете [создать свой ClickPipe](../index.md) и начать ввод данных из вашего экземпляра Postgres в ClickHouse Cloud. 
Не забудьте записать детали подключения, которые вы использовали при настройке вашего экземпляра Postgres, так как они понадобятся вам в процессе создания ClickPipe.