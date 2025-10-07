---
'sidebar_label': 'Использование clickhouse-local'
'keywords':
- 'clickhouse'
- 'migrate'
- 'migration'
- 'migrating'
- 'data'
- 'etl'
- 'elt'
- 'clickhouse-local'
- 'clickhouse-client'
'slug': '/cloud/migration/clickhouse-local'
'title': 'Перемещение в ClickHouse с использованием clickhouse-local'
'description': 'Руководство, показывающее, как мигрировать в ClickHouse с использованием
  clickhouse-local'
'doc_type': 'guide'
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

Вы можете использовать ClickHouse, или, более конкретно, [`clickhouse-local`](/operations/utilities/clickhouse-local.md) в качестве ETL инструмента для миграции данных из вашей текущей системы базы данных в ClickHouse Cloud, при условии, что для вашей текущей системы базы данных есть либо
интеграционный движок, предоставляемый ClickHouse, либо [табличная функция](/sql-reference/table-functions/), соответственно, 
или доступен драйвер JDBC или ODBC, предоставленный вендором.

Мы иногда называем этот метод миграции методом "пивота", потому что он использует промежуточную точку пивота или переход для переноса данных из исходной базы данных в целевую. Например, этот метод может потребоваться, если только исходящие соединения разрешены из частной или внутренней сети из-за требований безопасности, и поэтому вам нужно извлекать данные из исходной базы данных с помощью clickhouse-local, а затем загружать данные в целевую базу данных ClickHouse, с clickhouse-local, действующим как точка пивота.

ClickHouse предоставляет интеграционные движки и табличные функции (которые создают интеграционные движки на лету) для [MySQL](/engines/table-engines/integrations/mysql/), [PostgreSQL](/engines/table-engines/integrations/postgresql), [MongoDB](/engines/table-engines/integrations/mongodb) и [SQLite](/engines/table-engines/integrations/sqlite).
Для всех остальных популярных систем баз данных есть драйвер JDBC или ODBC, доступный от вендора системы.

## Что такое clickhouse-local? {#what-is-clickhouse-local}

<Image img={ch_local_02} size='lg' alt='Миграция самоуправляемого ClickHouse' background='white' />

Обычно ClickHouse работает в виде кластера, где несколько экземпляров движка базы данных ClickHouse работает распределенно на разных серверах.

На одном сервере движок базы данных ClickHouse работает как часть программы `clickhouse-server`. Доступ к базе данных (пути, пользователи, безопасность и т. д.) настраивается с помощью файла конфигурации сервера.

Инструмент `clickhouse-local` позволяет вам использовать движок базы данных ClickHouse изолировано, в виде командной утилиты, для сверхбыстрой обработки SQL данных на большом объеме входных и выходных данных, без необходимости настраивать и запускать сервер ClickHouse.

## Установка clickhouse-local {#installing-clickhouse-local}

Вам нужен хост для `clickhouse-local`, который имеет сетевой доступ как к вашей текущей исходной системе базы данных, так и к вашей целевой службе ClickHouse Cloud.

На этом хосте загрузите соответствующую сборку `clickhouse-local` в зависимости от операционной системы вашего компьютера:

<Tabs groupId="os">
<TabItem value="linux" label="Linux" >

1. Наиболее простой способ загрузить `clickhouse-local` локально — это выполнить следующую команду:
```bash
curl https://clickhouse.com/ | sh
```

1. Запустите `clickhouse-local` (он просто выведет свою версию):
```bash
./clickhouse-local
```

</TabItem>
<TabItem value="mac" label="macOS">

1. Наиболее простой способ загрузить `clickhouse-local` локально — это выполнить следующую команду:
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

:::tip Добавьте удаленную систему в ваш список IP-доступа ClickHouse Cloud
Чтобы функция `remoteSecure` могла подключиться к вашей службе ClickHouse Cloud, IP-адрес удаленной системы должен быть разрешен в списке IP-доступа. Разверните **Управление вашим списком IP-доступа** ниже этого совета для получения дополнительной информации.
:::

  <AddARemoteSystem />

## Пример 1: Миграция из MySQL в ClickHouse Cloud с интеграционным движком {#example-1-migrating-from-mysql-to-clickhouse-cloud-with-an-integration-engine}

Мы будем использовать [интеграционный движок таблиц](/engines/table-engines/integrations/mysql/) (созданный на лету с помощью [mysql табличной функции](/sql-reference/table-functions/mysql/)) для чтения данных из исходной базы данных MySQL и будем использовать [remoteSecure табличную функцию](/sql-reference/table-functions/remote/)
для записи данных в целевую таблицу на вашей службе ClickHouse Cloud.

<Image img={ch_local_03} size='sm' alt='Миграция самоуправляемого ClickHouse' background='white' />

### На целевой службе ClickHouse Cloud: {#on-the-destination-clickhouse-cloud-service}

#### Создайте целевую базу данных: {#create-the-destination-database}

```sql
CREATE DATABASE db
```

#### Создайте целевую таблицу, имеющую схему, эквивалентную таблице MySQL: {#create-a-destination-table-that-has-a-schema-equivalent-to-the-mysql-table}

```sql
CREATE TABLE db.table ...
```

:::note
Схема целевой таблицы ClickHouse Cloud и схема исходной таблицы MySQL должны быть согласованы (имена колонок и порядок должны совпадать, а типы данных колонок должны быть совместимы).
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
На хост-машине `clickhouse-local` не хранится никаких данных локально. Вместо этого данные извлекаются из исходной таблицы MySQL
  и затем немедленно записываются в целевую таблицу на службе ClickHouse Cloud.
:::

## Пример 2: Миграция из MySQL в ClickHouse Cloud с помощью JDBC моста {#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge}

Мы будем использовать [JDBC интеграционный движок таблиц](/engines/table-engines/integrations/jdbc.md) (созданный на лету с помощью [jdbc табличной функции](/sql-reference/table-functions/jdbc.md)) вместе с [ClickHouse JDBC Bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge) и драйвером MySQL JDBC для чтения данных из исходной базы данных MySQL, и мы будем использовать [remoteSecure табличную функцию](/sql-reference/table-functions/remote.md)
для записи данных в целевую таблицу на вашей службе ClickHouse Cloud.

<Image img={ch_local_04} size='sm' alt='Миграция самоуправляемого ClickHouse' background='white' />

### На целевой службе ClickHouse Cloud: {#on-the-destination-clickhouse-cloud-service-1}

#### Создайте целевую базу данных: {#create-the-destination-database-1}
```sql
CREATE DATABASE db
```
