---
sidebar_label: 'Использование clickhouse-local'
sidebar_position: 20
keywords: ['clickhouse', 'миграция', 'миграция данных', 'миграция', 'данные', 'etl', 'elt', 'clickhouse-local', 'clickhouse-client']
slug: /cloud/migration/clickhouse-local
title: 'Миграция в ClickHouse с использованием clickhouse-local'
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


# Миграция в ClickHouse с использованием clickhouse-local

<Image img={ch_local_01} size='sm' alt='Миграция самоуправляемого ClickHouse' background='white' />

Вы можете использовать ClickHouse или, точнее, [`clickhouse-local`](/operations/utilities/clickhouse-local.md) как ETL инструмент для миграции данных из вашей текущей системы баз данных в ClickHouse Cloud, если для вашей текущей системы баз данных существует либо предоставляемый ClickHouse [интеграционный движок](/engines/table-engines/#integration-engines), либо [табличная функция](/sql-reference/table-functions/), или доступен JDBC драйвер или ODBC драйвер от поставщика.

Мы иногда называем этот метод миграции «pivot» методом, потому что он использует промежуточную опорную точку или переход для перемещения данных из исходной базы данных в целевую базу данных. Например, этот метод может быть необходим, если внутри частной или внутренней сети разрешены только исходящие соединения из соображений безопасности, и поэтому вам необходимо извлечь данные из исходной базы данных с помощью clickhouse-local, а затем перенести данные в целевую базу данных ClickHouse, где clickhouse-local выступает в качестве опорной точки.

ClickHouse предоставляет интеграционные движки и табличные функции (которые создают интеграционные движки на лету) для [MySQL](/engines/table-engines/integrations/mysql/), [PostgreSQL](/engines/table-engines/integrations/postgresql), [MongoDB](/engines/table-engines/integrations/mongodb) и [SQLite](/engines/table-engines/integrations/sqlite). Для всех остальных популярных систем баз данных доступен JDBC драйвер или ODBC драйвер от поставщика системы.

## Что такое clickhouse-local? {#what-is-clickhouse-local}

<Image img={ch_local_02} size='lg' alt='Миграция самоуправляемого ClickHouse' background='white' />

Обычно ClickHouse работает в виде кластера, где несколько экземпляров движка базы данных ClickHouse работают в распределенном режиме на разных серверах.

На одном сервере движок базы данных ClickHouse запускается в рамках программы `clickhouse-server`. Доступ к базе данных (пути, пользователи, безопасность и т.д.) настраивается с помощью файла конфигурации сервера.

Утилита `clickhouse-local` позволяет использовать движок базы данных ClickHouse изолированно в виде командной строки для сверхбыстрой обработки SQL данных на большом количестве входных и выходных данных, без необходимости конфигурировать и запускать сервер ClickHouse.

## Установка clickhouse-local {#installing-clickhouse-local}

Вам нужен хост-компьютер для `clickhouse-local`, который имеет сетевой доступ как к вашей текущей исходной системе баз данных, так и к целевому сервису ClickHouse Cloud.

На этом хост-компьютере загрузите подходящую сборку `clickhouse-local` в зависимости от операционной системы вашего компьютера:

<Tabs groupId="os">
<TabItem value="linux" label="Linux" >

1. Самый простой способ загрузить `clickhouse-local` локально — это выполнить следующую команду:
  ```bash
  curl https://clickhouse.com/ | sh
  ```

1. Запустите `clickhouse-local` (он просто выведет свою версию):
  ```bash
  ./clickhouse-local
  ```

</TabItem>
<TabItem value="mac" label="macOS">

1. Самый простой способ загрузить `clickhouse-local` локально — это выполнить следующую команду:
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
Примеры в этом руководстве используют команды Linux для запуска `clickhouse-local` (`./clickhouse-local`). Чтобы запустить `clickhouse-local` на Mac, используйте `./clickhouse local`.
:::


:::tip Добавьте удалённую систему в список IP-доступа вашего ClickHouse Cloud сервиса
Чтобы функция `remoteSecure` могла подключиться к вашему ClickHouse Cloud сервису, IP-адрес удаленной системы должен быть разрешён в списке IP-доступа. Разверните **Управление списком IP-доступа** ниже этого совета для получения дополнительной информации.
:::

  <AddARemoteSystem />

## Пример 1: Миграция из MySQL в ClickHouse Cloud с использованием интеграционного движка {#example-1-migrating-from-mysql-to-clickhouse-cloud-with-an-integration-engine}

Мы будем использовать [интеграционный табличный движок](/engines/table-engines/integrations/mysql/) (созданный на лету при помощи [табличной функции mysql](/sql-reference/table-functions/mysql/)) для чтения данных из исходной базы данных MySQL, и будем использовать [табличную функцию remoteSecure](/sql-reference/table-functions/remote/) для записи данных в целевую таблицу на вашем ClickHouse Cloud сервисе.

<Image img={ch_local_03} size='sm' alt='Миграция самоуправляемого ClickHouse' background='white' />

### На целевом ClickHouse Cloud сервисе: {#on-the-destination-clickhouse-cloud-service}

#### Создайте целевую базу данных: {#create-the-destination-database}

  ```sql
  CREATE DATABASE db
  ```

#### Создайте целевую таблицу, которая имеет схему, эквивалентную таблице MySQL: {#create-a-destination-table-that-has-a-schema-equivalent-to-the-mysql-table}

  ```sql
  CREATE TABLE db.table ...
  ```

:::note
Схема целевой таблицы ClickHouse Cloud и схема исходной таблицы MySQL должны быть согласованы (имена колонок и порядок должны совпадать, а типы данных колонок должны быть совместимыми).
:::

### На хост-компьютере clickhouse-local: {#on-the-clickhouse-local-host-machine}

#### Запустите clickhouse-local с запросом миграции: {#run-clickhouse-local-with-the-migration-query}

  ```sql
  ./clickhouse-local --query "
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table', 'default', 'PASS')
SELECT * FROM mysql('host:port', 'database', 'table', 'user', 'password');"
  ```

:::note
Данные не хранятся локально на хост-компьютере `clickhouse-local`. Вместо этого они считываются из исходной таблицы MySQL и затем немедленно записываются в целевую таблицу на ClickHouse Cloud сервисе.
:::


## Пример 2: Миграция из MySQL в ClickHouse Cloud с использованием JDBC моста {#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge}

Мы будем использовать [JDBC интеграционный табличный движок](/engines/table-engines/integrations/jdbc.md) (созданный на лету при помощи [табличной функции jdbc](/sql-reference/table-functions/jdbc.md)) вместе с [ClickHouse JDBC Bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge) и MySQL JDBC драйвер для чтения данных из исходной базы данных MySQL, и будем использовать [табличную функцию remoteSecure](/sql-reference/table-functions/remote.md) для записи данных в целевую таблицу на вашем ClickHouse Cloud сервисе.

<Image img={ch_local_04} size='sm' alt='Миграция самоуправляемого ClickHouse' background='white' />

### На целевом ClickHouse Cloud сервисе: {#on-the-destination-clickhouse-cloud-service-1}

#### Создайте целевую базу данных: {#create-the-destination-database-1}
  ```sql
  CREATE DATABASE db
  ```
