---
sidebar_label: 'Использование clickhouse-local'
keywords: ['clickhouse', 'миграция', 'перенос', 'мигрирование', 'данные', 'etl', 'elt', 'clickhouse-local', 'clickhouse-client']
slug: /cloud/migration/clickhouse-local
title: 'Миграция в ClickHouse с помощью clickhouse-local'
description: 'Руководство по миграции в ClickHouse с помощью clickhouse-local'
doc_type: 'guide'
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


# Миграция в ClickHouse с использованием clickhouse-local {#migrating-to-clickhouse-using-clickhouse-local}

<Image img={ch_local_01} size='sm' alt='Миграция в самоуправляемый ClickHouse' background='white' />

Вы можете использовать ClickHouse, а точнее [`clickhouse-local`](/operations/utilities/clickhouse-local.md),
как ETL-инструмент для миграции данных из вашей текущей системы баз данных в ClickHouse Cloud, при условии, что для вашей текущей системы баз данных существует либо
предоставляемый ClickHouse [движок интеграции](/engines/table-engines/#integration-engines) или [табличная функция](/sql-reference/table-functions/) соответственно,
либо доступен JDBC- или ODBC-драйвер от производителя системы.

Иногда мы называем этот метод миграции «pivot»-методом, потому что он использует промежуточное звено (pivot/hop) для переноса данных из исходной базы данных в целевую. Например, этот метод может потребоваться, если из-за требований безопасности внутри частной или внутренней сети разрешены только исходящие подключения, и, следовательно, вам нужно сначала получить данные из исходной базы данных с помощью clickhouse-local, а затем загрузить данные в целевую базу данных ClickHouse, при этом clickhouse-local выступает в роли такого промежуточного «pivot»-звена.

ClickHouse предоставляет движки интеграции и табличные функции (которые создают движки интеграции на лету) для [MySQL](/engines/table-engines/integrations/mysql/), [PostgreSQL](/engines/table-engines/integrations/postgresql), [MongoDB](/engines/table-engines/integrations/mongodb) и [SQLite](/engines/table-engines/integrations/sqlite).
Для всех остальных популярных систем баз данных JDBC- или ODBC-драйвер доступен у производителя соответствующей системы.



## Что такое clickhouse-local? {#what-is-clickhouse-local}

<Image img={ch_local_02} size='lg' alt='Миграция самостоятельно управляемого ClickHouse' background='white' />

Обычно ClickHouse запускается в виде кластера, где несколько экземпляров движка базы данных ClickHouse работают в распределённой конфигурации на разных серверах.

На одном сервере движок базы данных ClickHouse запускается как часть программы `clickhouse-server`. Доступ к базе данных (пути, пользователи, безопасность и т. д.) настраивается с помощью конфигурационного файла сервера.

Инструмент `clickhouse-local` позволяет использовать движок базы данных ClickHouse изолированно, в виде утилиты командной строки, для сверхбыстрой обработки SQL-данных с большим количеством входных и выходных данных, без необходимости настраивать и запускать сервер ClickHouse.



## Установка clickhouse-local {#installing-clickhouse-local}

Вам нужна хостовая машина для `clickhouse-local`, которая имеет сетевой доступ как к вашей текущей исходной системе баз данных, так и к целевому сервису ClickHouse Cloud.

На этой машине загрузите подходящую сборку `clickhouse-local` в зависимости от операционной системы вашего компьютера:

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
Во всех примерах в этом руководстве используются Linux-команды для запуска `clickhouse-local` (`./clickhouse-local`).
Чтобы запустить `clickhouse-local` на Mac, используйте `./clickhouse local`.
:::

:::tip Добавьте удалённую систему в список доступа по IP вашего сервиса ClickHouse Cloud
Чтобы функция `remoteSecure` могла подключиться к вашему сервису ClickHouse Cloud, IP-адрес удалённой системы должен быть разрешён в списке доступа по IP. Разверните раздел **Manage your IP Access List** ниже для получения дополнительной информации.
:::

  <AddARemoteSystem />



## Пример 1: Миграция с MySQL в ClickHouse Cloud с использованием интеграционного движка {#example-1-migrating-from-mysql-to-clickhouse-cloud-with-an-integration-engine}

Мы будем использовать [интеграционный движок таблиц](/engines/table-engines/integrations/mysql/) (создаваемый на лету с помощью [табличной функции mysql](/sql-reference/table-functions/mysql/)) для чтения данных из исходной базы данных MySQL, а для записи данных в целевую таблицу в вашем облачном сервисе ClickHouse Cloud — [табличную функцию remoteSecure](/sql-reference/table-functions/remote/).

<Image img={ch_local_03} size="sm" alt="Миграция самоуправляемого ClickHouse" background="white" />

### На целевом сервисе ClickHouse Cloud: {#on-the-destination-clickhouse-cloud-service}

#### Создайте целевую базу данных: {#create-the-destination-database}

```sql
CREATE DATABASE db
```

#### Создайте целевую таблицу с такой же схемой, как у таблицы MySQL: {#create-a-destination-table-that-has-a-schema-equivalent-to-the-mysql-table}

```sql
CREATE TABLE db.table ...
```

:::note
Схемы целевой таблицы ClickHouse Cloud и исходной таблицы MySQL должны совпадать (имена и порядок столбцов должны быть одинаковыми, а типы данных столбцов — совместимыми).
:::

### На хосте с clickhouse-local: {#on-the-clickhouse-local-host-machine}

#### Запустите clickhouse-local с миграционным запросом: {#run-clickhouse-local-with-the-migration-query}

```sql
./clickhouse-local --query "
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table', 'default', 'PASS')
SELECT * FROM mysql('host:port', 'database', 'table', 'user', 'password');"
```

:::note
На хосте `clickhouse-local` данные локально не сохраняются. Вместо этого данные считываются из исходной таблицы MySQL
и затем сразу же записываются в целевую таблицу в сервисе ClickHouse Cloud.
:::


## Пример 2: миграция с MySQL в ClickHouse Cloud с использованием моста JDBC {#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge}

Мы будем использовать [табличный движок интеграции с JDBC](/engines/table-engines/integrations/jdbc.md) (создаваемый на лету с помощью [табличной функции JDBC](/sql-reference/table-functions/jdbc.md)) вместе с [ClickHouse JDBC Bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge) и драйвером MySQL JDBC для чтения данных из исходной базы данных MySQL, а также [табличную функцию remoteSecure](/sql-reference/table-functions/remote.md)
для записи данных в целевую таблицу в вашем сервисе ClickHouse Cloud.

<Image img={ch_local_04} size="sm" alt="Миграция самоуправляемого ClickHouse" background="white" />

### На целевом сервисе ClickHouse Cloud: {#on-the-destination-clickhouse-cloud-service-1}

#### Создайте целевую базу данных: {#create-the-destination-database-1}

```sql
CREATE DATABASE db
```
