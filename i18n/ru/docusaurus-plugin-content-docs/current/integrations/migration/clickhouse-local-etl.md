---
sidebar_label: Использование clickhouse-local
sidebar_position: 20
keywords: [clickhouse, миграция, миграция данных, перемещение, данные, etl, elt, clickhouse-local, clickhouse-client]
slug: '/cloud/migration/clickhouse-local'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import AddARemoteSystem from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_add_remote_ip_access_list_detail.md';
import ch_local_01 from '@site/static/images/integrations/migration/ch-local-01.png';
import ch_local_02 from '@site/static/images/integrations/migration/ch-local-02.png';
import ch_local_03 from '@site/static/images/integrations/migration/ch-local-03.png';
import ch_local_04 from '@site/static/images/integrations/migration/ch-local-04.png';


# Миграция в ClickHouse с использованием clickhouse-local

<img src={ch_local_01} class="image" alt="Миграция самостоятельно управляемого ClickHouse" style={{width: '40%', padding: '30px'}} />

Вы можете использовать ClickHouse, точнее, [`clickhouse-local`](/operations/utilities/clickhouse-local.md) в качестве ETL инструмента для миграции данных из вашей текущей системы базы данных в ClickHouse Cloud, при условии, что для вашей текущей системы базы данных доступен либо
интеграционный движок, предоставляемый ClickHouse [integration engine](/engines/table-engines/#integration-engines), либо [функция таблицы](/sql-reference/table-functions/), или доступен JDBC-драйвер или ODBC-драйвер, предоставленный поставщиком.

Мы иногда называем этот метод миграции "методом поворота", потому что он использует промежуточную точку поворота или переход для перемещения данных из исходной базы данных в целевую базу данных. Например, этот метод может быть необходим, если в частной или внутренней сети разрешены только исходящие соединения из-за требований безопасности, и поэтому вам нужно извлечь данные из исходной базы данных с помощью clickhouse-local, а затем загрузить данные в целевую базу данных ClickHouse, где clickhouse-local выступает в роли точки поворота.

ClickHouse предоставляет интеграционные движки и функции таблиц (которые создают интеграционные движки по запросу) для [MySQL](/engines/table-engines/integrations/mysql/), [PostgreSQL](/engines/table-engines/integrations/postgresql), [MongoDB](/engines/table-engines/integrations/mongodb) и [SQLite](/engines/table-engines/integrations/sqlite).
Для всех других популярных систем баз данных доступен JDBC-драйвер или ODBC-драйвер от поставщика системы.

## Что такое clickhouse-local? {#what-is-clickhouse-local}

<img src={ch_local_02} class="image" alt="Миграция самостоятельно управляемого ClickHouse" style={{width: '100%', padding: '30px'}} />

Обычно ClickHouse работает в виде кластера, где несколько экземпляров движка базы данных ClickHouse работают распределенно на разных серверах.

На одном сервере движок базы данных ClickHouse запускается как часть программы `clickhouse-server`. Доступ к базе данных (пути, пользователи, безопасность и т.д.) настраивается с помощью файла конфигурации сервера.

Инструмент `clickhouse-local` позволяет использовать движок базы данных ClickHouse в изоляции в виде командной утилиты для очень быстрого SQL-обработки данных на большом объеме входных и выходных данных, без необходимости настраивать и запускать сервер ClickHouse.

## Установка clickhouse-local {#installing-clickhouse-local}

Вам нужна хост-машина для `clickhouse-local`, которая имеет сетевой доступ как к вашей текущей системе базы данных, так и к вашей целевой службе ClickHouse Cloud.

На этой хост-машине загрузите соответствующую сборку `clickhouse-local` в зависимости от операционной системы вашего компьютера:

<Tabs groupId="os">
<TabItem value="linux" label="Linux" >

1. Самый простой способ скачать `clickhouse-local` локально - это выполнить следующую команду:
  ```bash
  curl https://clickhouse.com/ | sh
  ```

1. Запустите `clickhouse-local` (он просто выведет свою версию):
  ```bash
  ./clickhouse-local
  ```

</TabItem>
<TabItem value="mac" label="macOS">

1. Самый простой способ скачать `clickhouse-local` локально - это выполнить следующую команду:
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
Чтобы запустить `clickhouse-local` на Mac, используйте `./clickhouse local`.
:::

:::tip Добавьте удаленную систему в свой список доступа IP ClickHouse Cloud
Чтобы функция `remoteSecure` могла подключиться к вашей службе ClickHouse Cloud, IP-адрес удаленной системы должен быть разрешен в списке доступа IP. Разверните раздел **Управляйте своим списком доступа IP** ниже этого совета для получения дополнительной информации.
:::

  <AddARemoteSystem />

## Пример 1: Миграция из MySQL в ClickHouse Cloud с помощью интеграционного движка {#example-1-migrating-from-mysql-to-clickhouse-cloud-with-an-integration-engine}

Мы будем использовать [интеграционный движок таблиц](/engines/table-engines/integrations/mysql/) (создаваемый по запросу с помощью [функции таблицы mysql](/sql-reference/table-functions/mysql/)) для чтения данных из исходной базы данных MySQL и будем использовать [функцию таблицы remoteSecure](/sql-reference/table-functions/remote/)
для записи данных в целевую таблицу на вашей службе ClickHouse Cloud.

<img src={ch_local_03} class="image" alt="Миграция самостоятельно управляемого ClickHouse" style={{width: '40%', padding: '30px'}} />

### На целевой службе ClickHouse Cloud: {#on-the-destination-clickhouse-cloud-service}

#### Создайте целевую базу данных: {#create-the-destination-database}

  ```sql
  CREATE DATABASE db
  ```

#### Создайте целевую таблицу, которая имеет схему, эквивалентную таблице MySQL: {#create-a-destination-table-that-has-a-schema-equivalent-to-the-mysql-table}

  ```sql
  CREATE TABLE db.table ...
  ```

:::note
Схема таблицы ClickHouse Cloud и схема исходной таблицы MySQL должны совпадать (имена колонок и порядок должны быть одинаковыми, а типы данных колонок должны быть совместимыми).
:::

### На хост-машине clickhouse-local: {#on-the-clickhouse-local-host-machine}

#### Запустите clickhouse-local с запросом миграции: {#run-clickhouse-local-with-the-migration-query}

  ```sql
  ./clickhouse-local --query "
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table', 'default', 'PASS')
SELECT * FROM mysql('host:port', 'database', 'table', 'user', 'password');"
  ```

:::note
Данные не хранятся локально на хост-машине `clickhouse-local`. Вместо этого данные считываются из исходной таблицы MySQL
  и затем немедленно записываются в целевую таблицу на службе ClickHouse Cloud.
:::


## Пример 2: Миграция из MySQL в ClickHouse Cloud с помощью JDBC моста {#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge}

Мы будем использовать [интеграционный движок таблиц JDBC](/engines/table-engines/integrations/jdbc.md) (создаваемый по запросу с помощью [функции таблицы jdbc](/sql-reference/table-functions/jdbc.md)) вместе с [JDBC мостом для ClickHouse](https://github.com/ClickHouse/clickhouse-jdbc-bridge) и JDBC-драйвером MySQL для чтения данных из исходной базы данных MySQL и будем использовать [функцию таблицы remoteSecure](/sql-reference/table-functions/remote.md)
для записи данных в целевую таблицу на вашей службе ClickHouse Cloud.

<img src={ch_local_04} class="image" alt="Миграция самостоятельно управляемого ClickHouse" style={{width: '40%', padding: '30px'}} />

### На целевой службе ClickHouse Cloud: {#on-the-destination-clickhouse-cloud-service-1}

#### Создайте целевую базу данных: {#create-the-destination-database-1}
  ```sql
  CREATE DATABASE db
  ```

#### Создайте целевую таблицу, которая имеет схему, эквивалентную таблице MySQL: {#create-a-destination-table-that-has-a-schema-equivalent-to-the-mysql-table-1}

  ```sql
  CREATE TABLE db.table ...
  ```

:::note
Схема таблицы ClickHouse Cloud и схема исходной таблицы MySQL должны совпадать,
например, имена колонок и порядок должны быть одинаковыми, а типы данных колонок должны быть совместимыми.
:::

### На хост-машине clickhouse-local: {#on-the-clickhouse-local-host-machine-1}

#### Установите, настройте и запустите JDBC мост ClickHouse локально: {#install-configure-and-start-the-clickhouse-jdbc-bridge-locally}

Следуйте инструкциям из [руководства](/integrations/data-ingestion/dbms/jdbc-with-clickhouse.md#install-the-clickhouse-jdbc-bridge-locally).
Руководство также содержит шаги по настройке источника данных из MySQL.

#### Запустите clickhouse-local с запросом миграции: {#run-clickhouse-local-with-the-migration-query-1}

  ```sql
  ./clickhouse-local --query "
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table', 'default', 'PASS')
SELECT * FROM jdbc('datasource', 'database', 'table');"
  ```

:::note
Данные не хранятся локально на хост-машине `clickhouse-local`. Вместо этого данные считываются из исходной таблицы MySQL
  и затем немедленно записываются в целевую таблицу на службе ClickHouse Cloud.
:::
