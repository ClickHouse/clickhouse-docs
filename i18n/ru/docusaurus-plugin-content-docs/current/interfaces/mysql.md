---
description: 'Документация для интерфейса протокола MySQL в ClickHouse, позволяющего
  клиентам MySQL подключаться к ClickHouse'
sidebar_label: 'Интерфейс MySQL'
sidebar_position: 25
slug: /interfaces/mysql
title: 'Интерфейс MySQL'
---

import Image from '@theme/IdealImage';
import mysql0 from '@site/static/images/interfaces/mysql0.png';
import mysql1 from '@site/static/images/interfaces/mysql1.png';
import mysql2 from '@site/static/images/interfaces/mysql2.png';
import mysql3 from '@site/static/images/interfaces/mysql3.png';


# Интерфейс MySQL

ClickHouse поддерживает протокол передачи MySQL. Это позволяет определенным клиентам, у которых нет родных соединителей ClickHouse, использовать протокол MySQL, и он был протестирован с рядом инструментов бизнес-аналитики (BI):

- [Looker Studio](../integrations/data-visualization/looker-studio-and-clickhouse.md)
- [Tableau Online](../integrations/tableau-online)
- [QuickSight](../integrations/quicksight)

Если вы пробуете другие непроверенные клиенты или интеграции, имейте в виду, что могут быть следующие ограничения:

- Реализация SSL может быть несовместима; могут возникнуть потенциальные проблемы с [TLS SNI](https://www.cloudflare.com/learning/ssl/what-is-sni/).
- Определенный инструмент может требовать специфические функции диалекта (например, функции или настройки, специфичные для MySQL), которые еще не реализованы.

Если есть доступный родной драйвер (например, [DBeaver](../integrations/dbeaver)), всегда предпочтительнее использовать его вместо интерфейса MySQL. Кроме того, хотя большинство клиентов на языке MySQL должны работать без проблем, интерфейс MySQL не гарантирует замену кода с существующими запросами MySQL.

Если ваш случай использования касается определенного инструмента, у которого нет родного драйвера ClickHouse, и вы хотите использовать его через интерфейс MySQL и сталкиваетесь с определенными несовместимостями - пожалуйста, [создайте проблему](https://github.com/ClickHouse/ClickHouse/issues) в репозитории ClickHouse.

::::note
Для лучшей поддержки SQL диалекта вышеупомянутых инструментов BI, интерфейс MySQL ClickHouse неявно выполняет запросы SELECT с установленной настройкой [prefer_column_name_to_alias = 1](/operations/settings/settings#prefer_column_name_to_alias).
Эта настройка не может быть отключена и в редких крайних случаях может привести к различному поведению между запросами, отправляемыми в обычный интерфейс запросов ClickHouse и интерфейс запросов MySQL.
::::

## Включение интерфейса MySQL в ClickHouse Cloud {#enabling-the-mysql-interface-on-clickhouse-cloud}

1. После создания своего сервиса ClickHouse Cloud, нажмите кнопку `Connect`.

<br/>

<Image img={mysql0} alt="Экран учетных данных - Подсказка" size="md"/>

2. Измените выпадающий список `Connect with` на `MySQL`. 

<br/>

<Image img={mysql1} alt="Экран учетных данных - Выбран MySQL" size="md" />

3. Переключите переключатель, чтобы включить интерфейс MySQL для этого конкретного сервиса. Это откроет порт `3306` для этого сервиса и предложит вам экран подключения MySQL, который включает ваше уникальное имя пользователя MySQL. Пароль будет таким же, как и пароль по умолчанию для пользователя сервиса.

<br/>

<Image img={mysql2} alt="Экран учетных данных - Включен MySQL" size="md"/>

Скопируйте строку соединения MySQL, показанную на экране.

<Image img={mysql3} alt="Экран учетных данных - Строка подключения" size="md"/>

## Создание нескольких пользователей MySQL в ClickHouse Cloud {#creating-multiple-mysql-users-in-clickhouse-cloud}

По умолчанию есть встроенный пользователь `mysql4<subdomain>`, который использует тот же пароль, что и `default`. Часть `<subdomain>` - это первый сегмент вашего имени хоста ClickHouse Cloud. Этот формат необходим для работы с инструментами, которые реализуют безопасное соединение, но не предоставляют [информацию SNI в своем TLS рукопожатии](https://www.cloudflare.com/learning/ssl/what-is-sni), что делает невозможным внутреннюю маршрутизацию без дополнительной подсказки в имени пользователя (клиент консоли MySQL является одним из таких инструментов).

По этой причине мы _категорически рекомендуем_ следовать формату `mysql4<subdomain>_<username>` при создании нового пользователя, предназначенного для использования с интерфейсом MySQL, где `<subdomain>` является подсказкой для идентификации вашего облачного сервиса, а `<username>` - произвольный суффикс на ваше усмотрение.

:::tip
Для имени хоста ClickHouse Cloud, такого как `foobar.us-east1.aws.clickhouse.cloud`, часть `<subdomain>` равна `foobar`, и пользовательское имя MySQL может выглядеть как `mysql4foobar_team1`.
:::

Вы можете создать дополнительных пользователей для использования с интерфейсом MySQL, если, например, вам нужно применить дополнительные настройки.

1. По желанию - создайте [профиль настроек](/sql-reference/statements/create/settings-profile) для применения к вашему пользовательскому учетной записи. Например, `my_custom_profile` с дополнительной настройкой, которая будет применяться по умолчанию при подключении с пользователем, которого мы создадим позже:

    ```sql
    CREATE SETTINGS PROFILE my_custom_profile SETTINGS prefer_column_name_to_alias=1;
    ```

    `prefer_column_name_to_alias` используется здесь только как пример, вы можете использовать другие настройки.
2. [Создайте пользователя](/sql-reference/statements/create/user) с использованием следующего формата: `mysql4<subdomain>_<username>` ([см. выше](#creating-multiple-mysql-users-in-clickhouse-cloud)). Пароль должен быть в формате двойного SHA1. Например:

    ```sql
    CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$';
    ```

    или если вы хотите использовать пользовательский профиль для этого пользователя:

    ```sql
    CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$' SETTINGS PROFILE 'my_custom_profile';
    ```

    где `my_custom_profile` - это имя профиля, который вы создали ранее.
3. [Предоставьте](/sql-reference/statements/grant) новому пользователю необходимые разрешения для взаимодействия с нужными таблицами или базами данных. Например, если вы хотите предоставить доступ только к `system.query_log`:

    ```sql
    GRANT SELECT ON system.query_log TO mysql4foobar_team1;
    ```

4. Используйте созданного пользователя для подключения к вашему сервису ClickHouse Cloud через интерфейс MySQL.

### Устранение неполадок с несколькими пользователями MySQL в ClickHouse Cloud {#troubleshooting-multiple-mysql-users-in-clickhouse-cloud}

Если вы создали нового пользователя MySQL и видите следующую ошибку при подключении через клиент MySQL CLI:

```sql
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading authorization packet', system error: 54
```

В этом случае убедитесь, что имя пользователя соответствует формату `mysql4<subdomain>_<username>`, как описано ([выше](#creating-multiple-mysql-users-in-clickhouse-cloud)).

## Включение интерфейса MySQL в самоуправляемом ClickHouse {#enabling-the-mysql-interface-on-self-managed-clickhouse}

Добавьте настройку [mysql_port](../operations/server-configuration-parameters/settings.md#mysql_port) в файл конфигурации вашего сервера. Например, вы можете определить порт в новом XML файле в вашей папке `config.d/` [папке](../operations/configuration-files):

```xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

Запустите сервер ClickHouse и ищите сообщение в логах, аналогичное следующему, которое упоминает прослушивание протокола совместимости MySQL:

```bash
{} <Information> Application: Listening for MySQL compatibility protocol: 127.0.0.1:9004
```

## Подключение MySQL к ClickHouse {#connect-mysql-to-clickhouse}

Следующая команда демонстрирует, как подключить клиент MySQL `mysql` к ClickHouse:

```bash
mysql --protocol tcp -h [hostname] -u [username] -P [port_number] [database_name]
```

Например:

```bash
$ mysql --protocol tcp -h 127.0.0.1 -u default -P 9004 default
```

Вывод, если соединение установлено успешно:

```text
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
Если пароль пользователя указан с использованием [SHA256](/sql-reference/functions/hash-functions#sha1-sha224-sha256-sha512-sha512_256), некоторые клиенты не смогут пройти аутентификацию (mysqljs и старые версии командной строки MySQL и MariaDB).

Ограничения:

- подготовленные запросы не поддерживаются

- некоторые типы данных отправляются как строки

Чтобы отменить длинный запрос используйте команду `KILL QUERY connection_id` (она заменена на `KILL QUERY WHERE query_id = connection_id` во время выполнения). Например:

```bash
$ mysql --protocol tcp -h mysql_server -P 9004 default -u default --password=123 -e "KILL QUERY 123456;"
```
