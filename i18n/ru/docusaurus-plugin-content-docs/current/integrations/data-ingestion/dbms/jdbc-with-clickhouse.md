---
sidebar_label: 'JDBC'
sidebar_position: 2
keywords: ['clickhouse', 'jdbc', 'connect', 'integrate']
slug: /integrations/jdbc/jdbc-with-clickhouse
description: 'Мост ClickHouse JDBC позволяет ClickHouse получать доступ к данным из любого внешнего источника, для которого доступен драйвер JDBC'
title: 'Подключение ClickHouse к внешним источникам данных с помощью JDBC'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Jdbc01 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-01.png';
import Jdbc02 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-02.png';
import Jdbc03 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-03.png';


# Подключение ClickHouse к внешним источникам данных через JDBC

:::note
Для использования JDBC требуется ClickHouse JDBC bridge, поэтому вам нужно запустить `clickhouse-local` на локальной машине, чтобы передавать данные из вашей базы данных в ClickHouse Cloud. Подробности см. на странице [**Using clickhouse-local**](/cloud/migration/clickhouse-local#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge) в разделе документации **Migrate**.
:::

**Обзор:** <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge" target="_blank">ClickHouse JDBC Bridge</a> в сочетании с [табличной функцией jdbc](/sql-reference/table-functions/jdbc.md) или [движком таблиц JDBC](/engines/table-engines/integrations/jdbc.md) позволяет ClickHouse получать доступ к данным из любого внешнего источника, для которого доступен <a href="https://en.wikipedia.org/wiki/JDBC_driver" target="_blank">JDBC‑драйвер</a>:

<Image img={Jdbc01} size="lg" alt="Диаграмма архитектуры ClickHouse JDBC Bridge" background='white'/>
Это удобно, когда для внешнего источника данных нет встроенного [движка интеграции](/engines/table-engines/integrations), табличной функции или внешнего словаря, но при этом существует JDBC‑драйвер для этого источника.

Вы можете использовать ClickHouse JDBC Bridge как для чтения, так и для записи, и параллельно — для нескольких внешних источников. Например, вы можете выполнять распределённые запросы в ClickHouse по нескольким внешним и внутренним источникам данных в режиме реального времени.

В этом уроке мы покажем, как просто установить, настроить и запустить ClickHouse JDBC Bridge, чтобы подключить ClickHouse к внешнему источнику данных. В качестве внешнего источника данных мы будем использовать MySQL.

Приступим!

:::note Prerequisites
У вас есть доступ к машине, на которой:
1. установлен Unix‑shell и есть доступ в интернет;
2. установлен <a href="https://www.gnu.org/software/wget/" target="_blank">wget</a>;
3. установлена актуальная версия **Java** (например, <a href="https://openjdk.java.net" target="_blank">OpenJDK</a> версии >= 17);
4. установлена и запущена актуальная версия **MySQL** (например, <a href="https://www.mysql.com" target="_blank">MySQL</a> версии >= 8);
5. установлена и запущена актуальная версия **ClickHouse** ([инструкция по установке](/getting-started/install/install.mdx)).
:::



## Локальная установка ClickHouse JDBC Bridge {#install-the-clickhouse-jdbc-bridge-locally}

Самый простой способ использовать ClickHouse JDBC Bridge — установить и запустить его на том же хосте, где работает ClickHouse:<Image img={Jdbc02} size="lg" alt="Диаграмма локального развертывания ClickHouse JDBC Bridge" background='white'/>

Начнем с подключения к Unix-оболочке на машине, где работает ClickHouse, и создадим локальную папку, в которую позже установим ClickHouse JDBC Bridge (вы можете назвать папку как угодно и разместить её где угодно):

```bash
mkdir ~/clickhouse-jdbc-bridge
```

Теперь загрузим <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/" target="_blank">текущую версию</a> ClickHouse JDBC Bridge в эту папку:

```bash
cd ~/clickhouse-jdbc-bridge
wget https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/download/v2.0.7/clickhouse-jdbc-bridge-2.0.7-shaded.jar
```

Чтобы иметь возможность подключиться к MySQL, создадим именованный источник данных:

```bash
cd ~/clickhouse-jdbc-bridge
mkdir -p config/datasources
touch config/datasources/mysql8.json
```

Теперь можно скопировать и вставить следующую конфигурацию в файл `~/clickhouse-jdbc-bridge/config/datasources/mysql8.json`:

```json
{
  "mysql8": {
    "driverUrls": [
      "https://repo1.maven.org/maven2/mysql/mysql-connector-java/8.0.28/mysql-connector-java-8.0.28.jar"
    ],
    "jdbcUrl": "jdbc:mysql://<host>:<port>",
    "username": "<username>",
    "password": "<password>"
  }
}
```

:::note
В приведенном выше конфигурационном файле:

- вы можете использовать любое имя для источника данных, мы использовали `mysql8`
- в значении `jdbcUrl` необходимо заменить `<host>` и `<port>` на соответствующие значения вашего работающего экземпляра MySQL, например `"jdbc:mysql://localhost:3306"`
- необходимо заменить `<username>` и `<password>` на ваши учетные данные MySQL; если вы не используете пароль, можно удалить строку `"password": "<password>"` из конфигурационного файла
- в значении `driverUrls` мы просто указали URL, откуда можно загрузить <a href="https://repo1.maven.org/maven2/mysql/mysql-connector-java/" target="_blank">текущую версию</a> драйвера MySQL JDBC. Это все, что нужно сделать — ClickHouse JDBC Bridge автоматически загрузит этот JDBC-драйвер (в специфичную для ОС директорию).
  :::

<br />

Теперь мы готовы запустить ClickHouse JDBC Bridge:

```bash
cd ~/clickhouse-jdbc-bridge
java -jar clickhouse-jdbc-bridge-2.0.7-shaded.jar
```

:::note
Мы запустили ClickHouse JDBC Bridge в режиме переднего плана. Чтобы остановить Bridge, можно вывести окно Unix-оболочки на передний план и нажать `CTRL+C`.
:::


## Использование JDBC-соединения из ClickHouse {#use-the-jdbc-connection-from-within-clickhouse}

ClickHouse может получать доступ к данным MySQL с помощью [табличной функции jdbc](/sql-reference/table-functions/jdbc.md) или [движка таблиц JDBC](/engines/table-engines/integrations/jdbc.md).

Самый простой способ выполнить следующие примеры — скопировать и вставить их в [`clickhouse-client`](/interfaces/cli.md) или в [интерфейс Play](/interfaces/http.md).

- Табличная функция jdbc:

```sql
SELECT * FROM jdbc('mysql8', 'mydatabase', 'mytable');
```

:::note
В качестве первого параметра табличной функции jdbc используется имя именованного источника данных, настроенного выше.
:::

- Движок таблиц JDBC:

```sql
CREATE TABLE mytable (
     <column> <column_type>,
     ...
)
ENGINE = JDBC('mysql8', 'mydatabase', 'mytable');

SELECT * FROM mytable;
```

:::note
В качестве первого параметра конструкции движка jdbc используется имя именованного источника данных, настроенного выше.

Схема таблицы ClickHouse с движком JDBC и схема подключаемой таблицы MySQL должны совпадать: имена и порядок столбцов должны быть одинаковыми, а типы данных столбцов — совместимыми.
:::


## Внешняя установка ClickHouse JDBC Bridge {#install-the-clickhouse-jdbc-bridge-externally}

Для распределённого кластера ClickHouse (кластера с более чем одним хостом ClickHouse) целесообразно установить и запустить ClickHouse JDBC Bridge внешне на отдельном хосте:

<Image
  img={Jdbc03}
  size='lg'
  alt='Диаграмма внешнего развёртывания ClickHouse JDBC Bridge'
  background='white'
/>
Это даёт преимущество в том, что каждый хост ClickHouse может получить доступ к JDBC Bridge.
В противном случае JDBC Bridge потребуется устанавливать локально для каждого
экземпляра ClickHouse, которому необходим доступ к внешним источникам данных через Bridge.

Для внешней установки ClickHouse JDBC Bridge выполните следующие шаги:

1. Установите, настройте и запустите ClickHouse JDBC Bridge на выделенном хосте, следуя шагам, описанным в разделе 1 данного руководства.

2. На каждом хосте ClickHouse добавьте следующий блок конфигурации в <a href="https://clickhouse.com/docs/operations/configuration-files/#configuration_files" target="_blank">конфигурацию сервера ClickHouse</a> (в зависимости от выбранного формата конфигурации используйте версию XML или YAML):

<Tabs>
<TabItem value="xml" label="XML">

```xml
<jdbc_bridge>
   <host>JDBC-Bridge-Host</host>
   <port>9019</port>
</jdbc_bridge>
```

</TabItem>
<TabItem value="yaml" label="YAML">

```yaml
jdbc_bridge:
  host: JDBC-Bridge-Host
  port: 9019
```

</TabItem>
</Tabs>

:::note

- необходимо заменить `JDBC-Bridge-Host` на имя хоста или IP-адрес выделенного хоста ClickHouse JDBC Bridge
- указан порт ClickHouse JDBC Bridge по умолчанию `9019`; если вы используете другой порт для JDBC Bridge, необходимо соответствующим образом изменить конфигурацию выше
  :::

[//]: # "## 4. Additional Info"
[//]: #
[//]: # "TODO: "
[//]: # "- mention that for jdbc table function it is more performant (not two queries each time) to also specify the schema as a parameter"
[//]: #
[//]: # "- mention ad hoc query vs table query, saved query, named query"
[//]: #
[//]: # "- mention insert into "
