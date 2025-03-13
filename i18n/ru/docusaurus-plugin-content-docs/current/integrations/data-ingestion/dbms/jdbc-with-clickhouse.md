---
sidebar_label: JDBC
sidebar_position: 2
keywords: ['clickhouse', 'jdbc', 'connect', 'integrate']
slug: /integrations/jdbc/jdbc-with-clickhouse
description: 'Мост JDBC ClickHouse позволяет ClickHouse получать доступ к данным из любого внешнего источника данных, для которого доступен драйвер JDBC'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Jdbc01 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-01.png';
import Jdbc02 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-02.png';
import Jdbc03 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-03.png';


# Подключение ClickHouse к внешним источникам данных с помощью JDBC

:::note
Использование JDBC требует наличия моста JDBC ClickHouse, поэтому вам потребуется использовать `clickhouse-local` на локальной машине для передачи данных из вашей базы данных в ClickHouse Cloud. Посетите страницу [**Использование clickhouse-local**](/integrations/migration/clickhouse-local-etl.md#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge) в разделе **Миграция** документации для подробностей.
:::

**Обзор:** <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge" target="_blank">Мост JDBC ClickHouse</a> в сочетании с [jdbc table function](/sql-reference/table-functions/jdbc.md) или [JDBC table engine](/engines/table-engines/integrations/jdbc.md) позволяет ClickHouse получать доступ к данным из любого внешнего источника данных, для которого доступен <a href="https://en.wikipedia.org/wiki/JDBC_driver" target="_blank">драйвер JDBC</a>:

<img src={Jdbc01} class="image" alt="Мост JDBC ClickHouse"/>
Это удобно, когда нет встроенного [интеграционного движка](/engines/table-engines/integrations), функции таблицы или внешнего словаря для доступного внешнего источника данных, но драйвер JDBC для источника данных существует.

Вы можете использовать мост JDBC ClickHouse как для чтения, так и для записи. И параллельно для нескольких внешних источников данных, например, вы можете выполнять распределенные запросы в ClickHouse одновременно на нескольких внешних и внутренних источниках данных в реальном времени.

В этом уроке мы покажем вам, как легко установить, настроить и запустить мост JDBC ClickHouse, чтобы подключить ClickHouse к внешнему источнику данных. Мы будем использовать MySQL в качестве внешнего источника данных для этого урока.

Давайте начнем!

:::note Предварительные требования
У вас есть доступ к машине, на которой установлены:
1. Unix shell и доступ в интернет
2. <a href="https://www.gnu.org/software/wget/" target="_blank">wget</a>
3. актуальная версия **Java** (например, <a href="https://openjdk.java.net" target="_blank">OpenJDK</a> версия >= 17)
4. актуальная версия **MySQL** (например, <a href="https://www.mysql.com" target="_blank">MySQL</a> версия >= 8), установленная и работающая
5. актуальная версия **ClickHouse** [установленная](/getting-started/install.md) и работающая
:::

## Установка моста JDBC ClickHouse локально {#install-the-clickhouse-jdbc-bridge-locally}

Самый простой способ использования моста JDBC ClickHouse — установить и запустить его на том же хосте, где работает ClickHouse:<img src={Jdbc02} class="image" alt="Мост JDBC ClickHouse локально"/>

Начнем с подключения к Unix shell на машине, где работает ClickHouse, и создадим локальную папку, в которую мы позже установим мост JDBC ClickHouse (вы можете назвать папку как угодно и разместить её где угодно):
```bash
mkdir ~/clickhouse-jdbc-bridge
```

Теперь мы загрузим <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/" target="_blank">текущую версию</a> моста JDBC ClickHouse в эту папку:

```bash
cd ~/clickhouse-jdbc-bridge
wget https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/download/v2.0.7/clickhouse-jdbc-bridge-2.0.7-shaded.jar
```

Чтобы иметь возможность подключиться к MySQL, мы создаем именованный источник данных:

```bash
cd ~/clickhouse-jdbc-bridge
mkdir -p config/datasources
touch config/datasources/mysql8.json
```

Теперь вы можете скопировать и вставить следующую конфигурацию в файл `~/clickhouse-jdbc-bridge/config/datasources/mysql8.json`:

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
В файле конфигурации выше:
- вы можете использовать любое имя для источника данных, мы использовали `mysql8`
- в значении для `jdbcUrl` вам нужно заменить `<host>` и `<port>` на соответствующие значения в зависимости от вашей работающей экземпляра MySQL, например, `"jdbc:mysql://localhost:3306"`
- вам нужно заменить `<username>` и `<password>` на ваши учетные данные MySQL, если вы не используете пароль, вы можете удалить строку `"password": "<password>"` в файле конфигурации выше.
- в значении для `driverUrls` мы просто указали URL, по которому можно скачать <a href="https://repo1.maven.org/maven2/mysql/mysql-connector-java/" target="_blank">актуальную версию</a> драйвера JDBC MySQL. Это всё, что нам нужно сделать, и мост JDBC ClickHouse автоматически скачает этот драйвер JDBC (в OS специфичный каталог).
:::

<br/>

Теперь мы готовы запустить мост JDBC ClickHouse:
```bash
cd ~/clickhouse-jdbc-bridge
java -jar clickhouse-jdbc-bridge-2.0.7-shaded.jar
```
:::note
Мы запустили мост JDBC ClickHouse в режиме foreground. Чтобы остановить мост, вы можете вернуть окно Unix shell из вышеупомянутого в foreground и нажать `CTRL+C`.
:::


## Использование подключения JDBC из ClickHouse {#use-the-jdbc-connection-from-within-clickhouse}

Теперь ClickHouse может получить доступ к данным MySQL, используя либо [jdbc table function](/sql-reference/table-functions/jdbc.md), либо [JDBC table engine](/engines/table-engines/integrations/jdbc.md).

Самый простой способ выполнить следующие примеры — скопировать и вставить их в [`clickhouse-client`](/interfaces/cli.md) или в [Play UI](/interfaces/http.md).



- Функция таблицы jdbc:

```sql
SELECT * FROM jdbc('mysql8', 'mydatabase', 'mytable');
```
:::note
В качестве первого параметра для функции таблицы jdbc мы используем имя именованного источника данных, который мы настроили выше.
:::



- Движок таблицы JDBC:
```sql
CREATE TABLE mytable (
     <column> <column_type>,
     ...
 )
 ENGINE = JDBC('mysql8', 'mydatabase', 'mytable');

 SELECT * FROM mytable;
```
:::note
В качестве первого параметра для выражения движка jdbc мы используем имя именованного источника данных, который мы настроили выше.

Схема таблицы движка JDBC ClickHouse и схема подключенной таблицы MySQL должны соответствовать, например, имена и порядок колонок должны быть одинаковыми, а типы данных колонок должны быть совместимыми.
:::







## Установка моста JDBC ClickHouse внешне {#install-the-clickhouse-jdbc-bridge-externally}

Для распределенного кластера ClickHouse (кластера с более чем одним хостом ClickHouse) имеет смысл установить и запустить мост JDBC ClickHouse на отдельном хосте:
<img src={Jdbc03} class="image" alt="Мост JDBC ClickHouse внешне"/>
Это имеет преимущество в том, что каждый хост ClickHouse может получить доступ к мосту JDBC. В противном случае мост JDBC должен быть установлен локально для каждого экземпляра ClickHouse, который предполагается использовать для доступа к внешним источникам данных через мост.

Чтобы установить мост JDBC ClickHouse внешне, мы выполняем следующие шаги:


1. Мы устанавливаем, настраиваем и запускаем мост JDBC ClickHouse на выделенном хосте, следуя шагам, описанным в разделе 1 этого руководства.

2. На каждом хосте ClickHouse мы добавляем следующий блок конфигурации в <a href="https://clickhouse.com/docs/operations/configuration-files/#configuration_files" target="_blank">конфигурацию сервера ClickHouse</a> (в зависимости от вашего выбранного формата конфигурации, используйте либо XML, либо YAML версию):

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
   - вам нужно заменить `JDBC-Bridge-Host` на имя хоста или IP-адрес выделенного хоста моста JDBC ClickHouse
   - мы указали порт по умолчанию для моста JDBC ClickHouse `9019`, если вы используете другой порт для моста JDBC, вам необходимо соответствующим образом адаптировать конфигурацию выше
:::


