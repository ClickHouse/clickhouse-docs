---
sidebar_label: 'Использование clickhouse-local'
keywords: ['clickhouse', 'migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'clickhouse-local', 'clickhouse-client']
slug: /cloud/migration/clickhouse-local
title: 'Миграция в ClickHouse с использованием clickhouse-local'
description: 'Руководство по миграции в ClickHouse с использованием clickhouse-local'
doc_type: 'guide'
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

<Image img={ch_local_01} size='sm' alt='Миграция управляемого самостоятельно ClickHouse' background='white' />

Вы можете использовать ClickHouse, а точнее [`clickhouse-local`](/operations/utilities/clickhouse-local.md),
как ETL-инструмент для миграции данных из вашей текущей СУБД в ClickHouse Cloud, при условии, что для неё существует либо
предоставленный ClickHouse [integration engine](/engines/table-engines/#integration-engines) или, соответственно, [table function](/sql-reference/table-functions/),
либо доступен JDBC- или ODBC-драйвер от поставщика системы.

Иногда мы называем этот метод миграции «пивотом» (pivot), потому что он использует промежуточную точку (hop) для переноса данных из исходной базы данных в целевую. Например, этот метод может потребоваться, если из-за требований безопасности внутри частной или внутренней сети разрешены только исходящие соединения, и, следовательно, вам необходимо сначала считать данные из исходной базы данных с помощью clickhouse-local, а затем записать данные в целевую базу данных ClickHouse, при этом clickhouse-local выступает в роли промежуточного звена.

ClickHouse предоставляет integration engines и table functions (которые создают integration engines «на лету») для [MySQL](/engines/table-engines/integrations/mysql/), [PostgreSQL](/engines/table-engines/integrations/postgresql), [MongoDB](/engines/table-engines/integrations/mongodb) и [SQLite](/engines/table-engines/integrations/sqlite).
Для всех остальных популярных систем управления базами данных поставщик системы предоставляет JDBC- или ODBC-драйвер.



## Что такое clickhouse-local? {#what-is-clickhouse-local}

<Image
  img={ch_local_02}
  size='lg'
  alt='Миграция самостоятельно управляемого ClickHouse'
  background='white'
/>

Обычно ClickHouse работает в виде кластера, где несколько экземпляров движка базы данных ClickHouse выполняются распределённо на разных серверах.

На одном сервере движок базы данных ClickHouse запускается как часть программы `clickhouse-server`. Доступ к базе данных (пути, пользователи, безопасность и т. д.) настраивается с помощью конфигурационного файла сервера.

Инструмент `clickhouse-local` позволяет использовать движок базы данных ClickHouse изолированно в виде утилиты командной строки для сверхбыстрой обработки данных SQL с большим количеством входных и выходных данных, без необходимости настройки и запуска сервера ClickHouse.


## Установка clickhouse-local {#installing-clickhouse-local}

Для работы с `clickhouse-local` вам потребуется хост-машина с сетевым доступом как к исходной системе базы данных, так и к целевому сервису ClickHouse Cloud.

На этой хост-машине загрузите соответствующую сборку `clickhouse-local` для вашей операционной системы:

<Tabs groupId="os">
<TabItem value="linux" label="Linux" >

1. Самый простой способ загрузить `clickhouse-local` — выполнить следующую команду:

```bash
curl https://clickhouse.com/ | sh
```

1. Запустите `clickhouse-local` (будет выведена только версия):

```bash
./clickhouse-local
```

</TabItem>
<TabItem value="mac" label="macOS">

1. Самый простой способ загрузить `clickhouse-local` — выполнить следующую команду:

```bash
curl https://clickhouse.com/ | sh
```

1. Запустите `clickhouse-local` (будет выведена только версия):

```bash
./clickhouse local
```

</TabItem>
</Tabs>

:::info Важно
В примерах этого руководства используются команды Linux для запуска `clickhouse-local` (`./clickhouse-local`).
Для запуска `clickhouse-local` на Mac используйте `./clickhouse local`.
:::

:::tip Добавьте удалённую систему в список IP-доступа сервиса ClickHouse Cloud
Чтобы функция `remoteSecure` могла подключиться к вашему сервису ClickHouse Cloud, IP-адрес удалённой системы должен быть добавлен в список IP-доступа. Разверните раздел **Управление списком IP-доступа** ниже для получения дополнительной информации.
:::

<AddARemoteSystem />


## Пример 1: Миграция из MySQL в ClickHouse Cloud с использованием движка интеграции {#example-1-migrating-from-mysql-to-clickhouse-cloud-with-an-integration-engine}

Мы будем использовать [движок таблиц интеграции](/engines/table-engines/integrations/mysql/) (создаваемый на лету [табличной функцией mysql](/sql-reference/table-functions/mysql/)) для чтения данных из исходной базы данных MySQL и [табличную функцию remoteSecure](/sql-reference/table-functions/remote/)
для записи данных в целевую таблицу в вашем сервисе ClickHouse Cloud.

<Image
  img={ch_local_03}
  size='sm'
  alt='Миграция самостоятельно управляемого ClickHouse'
  background='white'
/>

### На целевом сервисе ClickHouse Cloud: {#on-the-destination-clickhouse-cloud-service}

#### Создайте целевую базу данных: {#create-the-destination-database}

```sql
CREATE DATABASE db
```

#### Создайте целевую таблицу со схемой, эквивалентной таблице MySQL: {#create-a-destination-table-that-has-a-schema-equivalent-to-the-mysql-table}

```sql
CREATE TABLE db.table ...
```

:::note
Схема целевой таблицы ClickHouse Cloud и схема исходной таблицы MySQL должны совпадать (имена и порядок столбцов должны быть одинаковыми, а типы данных столбцов должны быть совместимы).
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
Данные не сохраняются локально на хост-машине `clickhouse-local`. Вместо этого данные считываются из исходной таблицы MySQL
и сразу же записываются в целевую таблицу на сервисе ClickHouse Cloud.
:::


## Пример 2: Миграция из MySQL в ClickHouse Cloud с помощью JDBC-моста {#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge}

Мы будем использовать [движок таблиц интеграции JDBC](/engines/table-engines/integrations/jdbc.md) (создаваемый на лету [табличной функцией jdbc](/sql-reference/table-functions/jdbc.md)) совместно с [ClickHouse JDBC Bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge) и драйвером MySQL JDBC для чтения данных из исходной базы данных MySQL, а также [табличную функцию remoteSecure](/sql-reference/table-functions/remote.md)
для записи данных в целевую таблицу вашего облачного сервиса ClickHouse.

<Image
  img={ch_local_04}
  size='sm'
  alt='Миграция самостоятельно управляемого ClickHouse'
  background='white'
/>

### На целевом облачном сервисе ClickHouse: {#on-the-destination-clickhouse-cloud-service-1}

#### Создайте целевую базу данных: {#create-the-destination-database-1}

```sql
CREATE DATABASE db
```
