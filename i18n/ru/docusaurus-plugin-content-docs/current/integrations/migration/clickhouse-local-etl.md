---
sidebar_label: 'Использование clickhouse-local'
sidebar_position: 20
keywords: ['clickhouse', 'миграция', 'мигрирование', 'данные', 'etl', 'elt', 'clickhouse-local', 'clickhouse-client']
slug: /cloud/migration/clickhouse-local
title: 'Миграция в ClickHouse с использованием clickhouse-local'
description: 'Руководство, показывающее, как мигрировать в ClickHouse с использованием clickhouse-local'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import AddARemoteSystem from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_add_remote_ip_access_list_detail.md';
import ch_local_01 from '@site/static/images/integrations/migration/ch-local-01.png';
import ch_local_02 from '@site/static/images/integrations/migration/ch-local-02.png';
import ch_local_03 from '@site/static/images/integrations/migration/ch-local-03.png';
import ch_local_04 from '@site/static/images/integrations/migration/ch-local-04.png';


# Миграция в ClickHouse с использованием clickhouse-local

<Image img={ch_local_01} size='sm' alt='Миграция самоуправляемого ClickHouse' background='white' />

Вы можете использовать ClickHouse, или, точнее, [`clickhouse-local`](/operations/utilities/clickhouse-local.md) в качестве инструмента ETL для миграции данных из вашей текущей базы данных в ClickHouse Cloud, при условии, что для вашей текущей системы базы данных имеется либо интеграционный движок, предоставленный ClickHouse, либо табличная функция, соответственно, или доступен драйвер JDBC или ODBC от поставщика.

Мы иногда называем этот метод миграции методом "пивотирования", потому что он использует промежуточную точку или переход для перемещения данных из исходной базы данных в целевую базу данных. Например, этот метод может быть необходим, если из внутренней или частной сети разрешены только исходящие соединения по соображениям безопасности, и поэтому вам нужно извлекать данные из исходной базы данных с помощью clickhouse-local, а затем загружать данные в целевую базу данных ClickHouse, при этом clickhouse-local выступает в роли точка пивотирования.

ClickHouse предоставляет интеграционные движки и табличные функции (которые создают интеграционные движки на лету) для [MySQL](/engines/table-engines/integrations/mysql/), [PostgreSQL](/engines/table-engines/integrations/postgresql), [MongoDB](/engines/table-engines/integrations/mongodb) и [SQLite](/engines/table-engines/integrations/sqlite).
Для всех остальных популярных систем баз данных доступен драйвер JDBC или ODBC от поставщика.

## Что такое clickhouse-local? {#what-is-clickhouse-local}

<Image img={ch_local_02} size='lg' alt='Миграция самоуправляемого ClickHouse' background='white' />

Как правило, ClickHouse запускается в виде кластера, где несколько экземпляров движка базы данных ClickHouse работают распределенно на разных серверах.

На одном сервере движок базы данных ClickHouse запускается как часть программы `clickhouse-server`. Доступ к базе данных (пути, пользователи, безопасность и т.д.) настраивается с помощью файла конфигурации сервера.

Инструмент `clickhouse-local` позволяет вам использовать движок базы данных ClickHouse изолированно в виде командного утилиты для молниеносной обработки SQL данных на большом объеме входных и выходных данных, без необходимости настраивать и запускать сервер ClickHouse.

## Установка clickhouse-local {#installing-clickhouse-local}

Вам нужен хост-машина для `clickhouse-local`, которая имеет сетевой доступ как к вашей текущей системе баз данных, так и к целевому сервису ClickHouse Cloud.

На этой хост-машине загрузите подходящую сборку `clickhouse-local` в зависимости от операционной системы вашего компьютера:

<Tabs groupId="os">
<TabItem value="linux" label="Linux" >

1. Самый простой способ загрузить `clickhouse-local` локально — выполнить следующую команду:
  ```bash
  curl https://clickhouse.com/ | sh
  ```

1. Запустите `clickhouse-local` (он просто выведет свою версию):
  ```bash
  ./clickhouse-local
  ```

</TabItem>
<TabItem value="mac" label="macOS">

1. Самый простой способ загрузить `clickhouse-local` локально — выполнить следующую команду:
  ```bash
  curl https://clickhouse.com/ | sh
  ```

1. Запустите `clickhouse-local` (он просто выведет свою версию):
  ```bash
  ./clickhouse local
  ```

</TabItem>
</Tabs>

:::info Важно
Примеры в этом руководстве используют команды Linux для запуска `clickhouse-local` (`./clickhouse-local`).
Для запуска `clickhouse-local` на Mac используйте `./clickhouse local`.
:::


:::tip Добавьте удаленную систему в свой список IP-адресов доступа ClickHouse Cloud
Для того чтобы функция `remoteSecure` смогла подключиться к вашему сервису ClickHouse Cloud, IP-адрес удаленной системы должен быть разрешен в списке IP-адресов доступа. Разверните **Управление вашим списком IP-адресов доступа** ниже этого совета для получения дополнительной информации.
:::

  <AddARemoteSystem />

## Пример 1: Миграция из MySQL в ClickHouse Cloud с использованием интеграционного движка {#example-1-migrating-from-mysql-to-clickhouse-cloud-with-an-integration-engine}

Мы будем использовать [интеграционный табличный движок](/engines/table-engines/integrations/mysql/) (созданный на лету с помощью [табличной функции mysql](/sql-reference/table-functions/mysql/)) для чтения данных из исходной базы данных MySQL, и мы будем использовать [табличную функцию remoteSecure](/sql-reference/table-functions/remote/) для записи данных в целевую таблицу в вашем сервисе ClickHouse Cloud.

<Image img={ch_local_03} size='sm' alt='Миграция самоуправляемого ClickHouse' background='white' />

### На целевом сервисе ClickHouse Cloud: {#on-the-destination-clickhouse-cloud-service}

#### Создайте целевую базу данных: {#create-the-destination-database}

  ```sql
  CREATE DATABASE db
  ```

#### Создайте целевую таблицу, которая будет иметь схему, эквивалентную таблице MySQL: {#create-a-destination-table-that-has-a-schema-equivalent-to-the-mysql-table}

  ```sql
  CREATE TABLE db.table ...
  ```

:::note
Схема целевой таблицы ClickHouse Cloud и схема исходной таблицы MySQL должны совпадать (имена и порядок столбцов должны быть одинаковыми, а типы данных столбцов должны быть совместимыми).
:::

### На хост-машине clickhouse-local: {#on-the-clickhouse-local-host-machine}

#### Запустите clickhouse-local с миграционным запросом: {#run-clickhouse-local-with-the-migration-query}

  ```sql
  ./clickhouse-local --query "
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table', 'default', 'PASS')
SELECT * FROM mysql('host:port', 'database', 'table', 'user', 'password');"
  ```

:::note
Данные не хранятся локально на хост-машине `clickhouse-local`. Вместо этого данные считываются из исходной таблицы MySQL
  и затем немедленно записываются в целевую таблицу на сервисе ClickHouse Cloud.
:::


## Пример 2: Миграция из MySQL в ClickHouse Cloud с использованием JDBC моста {#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge}

Мы будем использовать [интеграционный табличный движок JDBC](/engines/table-engines/integrations/jdbc.md) (созданный на лету с помощью [табличной функции jdbc](/sql-reference/table-functions/jdbc.md)) вместе с [ClickHouse JDBC Bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge) и драйвером MySQL JDBC для чтения данных из исходной базы данных MySQL, и мы будем использовать [табличную функцию remoteSecure](/sql-reference/table-functions/remote.md)
для записи данных в целевую таблицу в вашем сервисе ClickHouse Cloud.

<Image img={ch_local_04} size='sm' alt='Миграция самоуправляемого ClickHouse' background='white' />

### На целевом сервисе ClickHouse Cloud: {#on-the-destination-clickhouse-cloud-service-1}

#### Создайте целевую базу данных: {#create-the-destination-database-1}
  ```sql
  CREATE DATABASE db
  ```
