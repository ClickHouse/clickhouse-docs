---
slug: /interfaces/mysql
sidebar_position: 20
sidebar_label: MySQL интерфейс
---

import mysql0 from '@site/static/images/interfaces/mysql0.png';
import mysql1 from '@site/static/images/interfaces/mysql1.png';
import mysql2 from '@site/static/images/interfaces/mysql2.png';
import mysql3 from '@site/static/images/interfaces/mysql3.png';


# MySQL интерфейс

ClickHouse поддерживает протокол MySQL. Это позволяет некоторым клиентам, у которых нет родных соединителей ClickHouse, вместо этого использовать протокол MySQL, и это было протестировано с следующими инструментами BI:

- [Looker Studio](../integrations/data-visualization/looker-studio-and-clickhouse.md)
- [Tableau Online](../integrations/tableau-online)
- [QuickSight](../integrations/quicksight)

Если вы пытаетесь использовать другие непроверенные клиенты или интеграции, имейте в виду, что могут быть следующие ограничения:

- Реализация SSL может быть несовместимой; могут возникать потенциальные проблемы с [TLS SNI](https://www.cloudflare.com/learning/ssl/what-is-sni/).
- Определенный инструмент может требовать диалектные функции (например, функции или настройки, специфичные для MySQL), которые еще не реализованы.

Если доступен нативный драйвер (например, [DBeaver](../integrations/dbeaver)), всегда предпочтительнее использовать его вместо MySQL интерфейса. Кроме того, хотя большинство клиентов языка MySQL должны работать нормально, использование MySQL интерфейса не гарантирует замену для кода с уже существующими запросами MySQL.

Если ваш случай использования связан с определенным инструментом, у которого нет родного драйвера ClickHouse, и вы хотите использовать его через MySQL интерфейс, и вы обнаружили определенные несовместимости - пожалуйста, [создайте проблему](https://github.com/ClickHouse/ClickHouse/issues) в репозитории ClickHouse.

::::note
Чтобы лучше поддерживать SQL диалект вышеупомянутых инструментов BI, MySQL интерфейс ClickHouse неявно выполняет SELECT запросы с установкой [prefer_column_name_to_alias = 1](/operations/settings/settings#prefer_column_name_to_alias).
Это нельзя отключить, и в редких крайних случаях это может привести к различному поведению между запросами, отправленными в обычный интерфейс запросов ClickHouse и MySQL интерфейс.
::::

## Включение MySQL интерфейса в ClickHouse Cloud {#enabling-the-mysql-interface-on-clickhouse-cloud}

1. После создания вашего сервиса ClickHouse Cloud нажмите кнопку `Подключиться`.

<br/>

<img src={mysql0} alt="Экран учетных данных - Подсказка" />

2. Измените выпадающее меню `Подключиться с` на `MySQL`. 

<br/>

<img src={mysql1} alt="Экран учетных данных - Выбран MySQL" />

3. Переключите тумблер, чтобы включить MySQL интерфейс для этого конкретного сервиса. Это откроет порт `3306` для этого сервиса и предоставит вам экран подключения MySQL, включая ваше уникальное имя пользователя MySQL. Пароль будет таким же, как и пароль по умолчанию для сервиса.

<br/>

<img src={mysql2} alt="Экран учетных данных - Включен MySQL" />

Скопируйте строку подключения MySQL, которая будет показана.

<img src={mysql3} alt="Экран учетных данных - Строка подключения" />

## Создание нескольких пользователей MySQL в ClickHouse Cloud {#creating-multiple-mysql-users-in-clickhouse-cloud}

По умолчанию есть встроенный пользователь `mysql4<поддомен>`, который использует тот же пароль, что и `default`. Часть `<поддомен>` - это первый сегмент имени хоста вашего ClickHouse Cloud. Этот формат необходим для работы с инструментами, которые реализуют безопасное соединение, но не предоставляют [информацию SNI в своем TLS рукопожатии](https://www.cloudflare.com/learning/ssl/what-is-sni), что делает невозможным внутреннюю маршрутизацию без дополнительного указания в имени пользователя (консольный клиент MySQL - один из таких инструментов).

Из-за этого мы _настоятельно рекомендуем_ следовать формату `mysql4<поддомен>_<имя_пользователя>` при создании нового пользователя, предназначенного для использования с MySQL интерфейсом, где `<поддомен>` является указанием для идентификации вашего облачного сервиса, а `<имя_пользователя>` является произвольным суффиксом по вашему выбору.

:::tip
Для имени хоста ClickHouse Cloud, такого как `foobar.us-east1.aws.clickhouse.cloud`, часть `<поддомен>` равна `foobar`, и пользователь MySQL может выглядеть как `mysql4foobar_team1`.
:::

Вы можете создать дополнительных пользователей для использования с MySQL интерфейсом, если, например, вам нужно применить дополнительные настройки.

1. Опционально - создайте [профиль настроек](/sql-reference/statements/create/settings-profile) для применения к вашему пользовательскому пользователю. Например, `my_custom_profile` с дополнительной настройкой, которая будет действовать по умолчанию, когда мы подключимся с пользователем, которого создадим позже:

    ```sql
    CREATE SETTINGS PROFILE my_custom_profile SETTINGS prefer_column_name_to_alias=1;
    ```

    `prefer_column_name_to_alias` используется только в качестве примера, вы можете использовать другие настройки.
2. [Создайте пользователя](/sql-reference/statements/create/user) с использованием следующего формата: `mysql4<поддомен>_<имя_пользователя>` ([см. выше](#creating-multiple-mysql-users-in-clickhouse-cloud)). Пароль должен быть в двойном формате SHA1. Например:

    ```sql
    CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$';
    ```

    или если вы хотите использовать пользовательский профиль для этого пользователя:

    ```sql
    CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$' SETTINGS PROFILE 'my_custom_profile';
    ```

    где `my_custom_profile` - это название профиля, который вы создали ранее.
3. [Предоставьте](/sql-reference/statements/grant) новому пользователю необходимые разрешения для работы с желаемыми таблицами или базами данных. Например, если вы хотите предоставить доступ только к `system.query_log`:

    ```sql
    GRANT SELECT ON system.query_log TO mysql4foobar_team1;
    ```

4. Используйте созданного пользователя для подключения к вашему сервису ClickHouse Cloud с помощью MySQL интерфейса.

### Устранение проблем с несколькими пользователями MySQL в ClickHouse Cloud {#troubleshooting-multiple-mysql-users-in-clickhouse-cloud}

Если вы создали нового пользователя MySQL и видите следующую ошибку при подключении через клиент MySQL CLI:

```sql
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading authorization packet', system error: 54
```

В этом случае убедитесь, что имя пользователя соответствует формату `mysql4<поддомен>_<имя_пользователя>`, как описано ([выше](#creating-multiple-mysql-users-in-clickhouse-cloud)).

## Включение MySQL интерфейса в самоуправляемом ClickHouse {#enabling-the-mysql-interface-on-self-managed-clickhouse}

Добавьте настройку [mysql_port](../operations/server-configuration-parameters/settings.md#mysql_port) в файл конфигурации вашего сервера. Например, вы можете определить порт в новом XML файле в вашей папке `config.d/` [папке](../operations/configuration-files):

``` xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

Запустите ваш сервер ClickHouse и ищите сообщение в логах, подобное следующему, упоминающее прослушивание протокола совместимости MySQL:

```bash
{} <Information> Application: Listening for MySQL compatibility protocol: 127.0.0.1:9004
```

## Подключение MySQL к ClickHouse {#connect-mysql-to-clickhouse}

Следующая команда демонстрирует, как подключить клиент MySQL `mysql` к ClickHouse:

```bash
mysql --protocol tcp -h [hostname] -u [username] -P [port_number] [database_name]
```

Например:

``` bash
$ mysql --protocol tcp -h 127.0.0.1 -u default -P 9004 default
```

Вывод в случае успешного подключения:

``` text
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 4
Server version: 20.2.1.1-ClickHouse

Copyright (c) 2000, 2019, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

Для совместимости со всеми клиентами MySQL рекомендуется указывать пароль пользователя с помощью [двойного SHA1](/operations/settings/settings-users#user-namepassword) в файле конфигурации.
Если пароль пользователя указан с использованием [SHA256](/sql-reference/functions/hash-functions#sha1-sha224-sha256-sha512-sha512_256), некоторые клиенты не смогут выполнить аутентификацию (mysqljs и старые версии командного инструмента MySQL и MariaDB).

Ограничения:

- подготовленные запросы не поддерживаются

- некоторые типы данных отправляются как строки

Чтобы отменить долгий запрос, используйте оператор `KILL QUERY connection_id` (он заменяется на `KILL QUERY WHERE query_id = connection_id` во время выполнения). Например:

``` bash
$ mysql --protocol tcp -h mysql_server -P 9004 default -u default --password=123 -e "KILL QUERY 123456;"
```
