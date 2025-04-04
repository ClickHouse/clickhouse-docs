---
sidebar_label: 'Использование clickhouse-local'
sidebar_position: 20
keywords: ['clickhouse', 'миграция', 'миграция', 'перемещение', 'данные', 'etl', 'elt', 'clickhouse-local', 'clickhouse-client']
slug: /cloud/migration/clickhouse-local
title: 'Миграция в ClickHouse с помощью clickhouse-local'
description: 'Руководство по миграции в ClickHouse с использованием clickhouse-local'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import AddARemoteSystem from '@site/docs/_snippets/_add_remote_ip_access_list_detail.md';
import ch_local_01 from '@site/static/images/integrations/migration/ch-local-01.png';
import ch_local_02 from '@site/static/images/integrations/migration/ch-local-02.png';
import ch_local_03 from '@site/static/images/integrations/migration/ch-local-03.png';
import ch_local_04 from '@site/static/images/integrations/migration/ch-local-04.png';


# Миграция в ClickHouse с помощью clickhouse-local

<Image img={ch_local_01} size='sm' alt='Миграция самоуправляемого ClickHouse' background='white' />

Вы можете использовать ClickHouse, а точнее, [`clickhouse-local`](/operations/utilities/clickhouse-local.md)
в качестве инструмента ETL для миграции данных из вашей текущей системы базы данных в ClickHouse Cloud, при этом для вашей текущей системы базы данных должен быть доступен либо 
предоставленный ClickHouse [движок интеграции](/engines/table-engines/#integration-engines), либо [табличная функция](/sql-reference/table-functions/), соответственно,
либо доступен драйвер JDBC или ODBC, предоставленный продавцом.

Мы иногда называем этот метод миграции методом "пивота", потому что он использует промежуточную точку пивота или переход для перемещения данных из исходной базы данных в целевую базу данных. Например, этот метод может потребоваться, если разрешены только исходящие соединения из частной или внутренней сети из-за требований безопасности, и поэтому необходимо получить данные из исходной базы данных с помощью clickhouse-local, а затем загрузить данные в целевую базу данных ClickHouse, при этом clickhouse-local выступает в роли точки пивота.

ClickHouse предоставляет движки интеграции и табличные функции (которые создают движки интеграции на лету) для [MySQL](/engines/table-engines/integrations/mysql/), [PostgreSQL](/engines/table-engines/integrations/postgresql), [MongoDB](/engines/table-engines/integrations/mongodb) и [SQLite](/engines/table-engines/integrations/sqlite).
Для всех остальных популярных систем баз данных доступен драйвер JDBC или ODBC от поставщика системы.

## Что такое clickhouse-local? {#what-is-clickhouse-local}

<Image img={ch_local_02} size='lg' alt='Миграция самоуправляемого ClickHouse' background='white' />

Как правило, ClickHouse работает в виде кластера, где несколько экземпляров движка базы данных ClickHouse работают в распределенном режиме на различных серверах.

На одном сервере движок базы данных ClickHouse запускается как часть программы `clickhouse-server`. Доступ к базе данных (пути, пользователи, безопасность и т. д.) настраивается с помощью файла конфигурации сервера.

Инструмент `clickhouse-local` позволяет вам использовать движок базы данных ClickHouse в изолированной командной строке для высокоскоростной обработки данных SQL на большом количестве входных и выходных данных, без необходимости настраивать и запускать сервер ClickHouse.

## Установка clickhouse-local {#installing-clickhouse-local}

Вам нужна хост-машина для `clickhouse-local`, которая имеет сетевой доступ как к вашей текущей исходной системе базы данных, так и к целевому сервису ClickHouse Cloud.

На этой хост-машине загрузите подходящую версию `clickhouse-local` в зависимости от операционной системы вашего компьютера:

<Tabs groupId="os">
<TabItem value="linux" label="Linux" >

1. Самый простой способ загрузить `clickhouse-local` локально — запустить следующую команду:
  ```bash
  curl https://clickhouse.com/ | sh
  ```

1. Запустите `clickhouse-local` (он просто выведет свою версию):
  ```bash
  ./clickhouse-local
  ```

</TabItem>
<TabItem value="mac" label="macOS">

1. Самый простой способ загрузить `clickhouse-local` локально — запустить следующую команду:
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
Примеры в данном руководстве используют команды Linux для выполнения `clickhouse-local` (`./clickhouse-local`).
Чтобы запустить `clickhouse-local` на Mac, используйте `./clickhouse local`.
:::


:::tip Добавьте удалённую систему в список доступа IP вашего ClickHouse Cloud сервиса
Чтобы функция `remoteSecure` могла подключиться к вашему ClickHouse Cloud сервису, IP-адрес удалённой системы должен быть разрешен в списке доступа IP. Разверните **Управление вашим списком доступа IP** ниже этого совета для получения дополнительной информации.
:::

  <AddARemoteSystem />

## Пример 1: Миграция из MySQL в ClickHouse Cloud с помощью движка интеграции {#example-1-migrating-from-mysql-to-clickhouse-cloud-with-an-integration-engine}

Мы будем использовать [интеграционный движок таблицы](/engines/table-engines/integrations/mysql/) (созданный на лету с помощью [табличной функции mysql](/sql-reference/table-functions/mysql/)) для чтения данных из исходной базы данных MySQL и будем использовать [табличную функцию remoteSecure](/sql-reference/table-functions/remote/)
для записи данных в целевую таблицу на вашем ClickHouse Cloud сервисе.

<Image img={ch_local_03} size='sm' alt='Миграция самоуправляемого ClickHouse' background='white' />

### На целевом ClickHouse Cloud сервисе: {#on-the-destination-clickhouse-cloud-service}

#### Создайте целевую базу данных: {#create-the-destination-database}

  ```sql
  CREATE DATABASE db
  ```

#### Создайте целевую таблицу, имеющую схему, эквивалентную таблице MySQL: {#create-a-destination-table-that-has-a-schema-equivalent-to-the-mysql-table}

  ```sql
  CREATE TABLE db.table ...
  ```

:::note
Схема целевой таблицы ClickHouse Cloud и схема исходной таблицы MySQL должны совпадать (имена колонок и порядок должны быть одинаковыми, а типы данных колонок должны быть совместимы).
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
Данные не сохраняются локально на хост-машине `clickhouse-local`. Вместо этого данные считываются из исходной таблицы MySQL
  и затем немедленно записываются в целевую таблицу на ClickHouse Cloud сервисе.
:::


## Пример 2: Миграция из MySQL в ClickHouse Cloud с помощью JDBC моста {#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge}

Мы будем использовать [JDBC интеграционный движок таблицы](/engines/table-engines/integrations/jdbc.md) (созданный на лету с помощью [табличной функции jdbc](/sql-reference/table-functions/jdbc.md)) вместе с [ClickHouse JDBC Bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge) и драйвером MySQL JDBC для чтения данных из исходной базы данных MySQL, а также будем использовать [табличную функцию remoteSecure](/sql-reference/table-functions/remote.md)
для записи данных в целевую таблицу на вашем ClickHouse Cloud сервисе.

<Image img={ch_local_04} size='sm' alt='Миграция самоуправляемого ClickHouse' background='white' />

### На целевом ClickHouse Cloud сервисе: {#on-the-destination-clickhouse-cloud-service-1}

#### Создайте целевую базу данных: {#create-the-destination-database-1}
  ```sql
  CREATE DATABASE db
  ```
