---
description: 'Документация по интерфейсу протокола MySQL в ClickHouse, который позволяет
  клиентам MySQL подключаться к ClickHouse'
sidebar_label: 'Интерфейс MySQL'
sidebar_position: 25
slug: /interfaces/mysql
title: 'Интерфейс MySQL'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import mysql0 from '@site/static/images/interfaces/mysql0.png';
import mysql1 from '@site/static/images/interfaces/mysql1.png';
import mysql2 from '@site/static/images/interfaces/mysql2.png';
import mysql3 from '@site/static/images/interfaces/mysql3.png';


# Интерфейс MySQL {#mysql-interface}

ClickHouse поддерживает сетевой протокол MySQL (MySQL wire protocol). Это позволяет отдельным клиентам, у которых нет нативных коннекторов для ClickHouse, использовать вместо них протокол MySQL. Работа была проверена со следующими BI-инструментами:

- [Looker Studio](../integrations/data-visualization/looker-studio-and-clickhouse.md)
- [Tableau Online](../integrations/tableau-online)
- [QuickSight](../integrations/quicksight)

Если вы пробуете другие, ещё не протестированные клиенты или интеграции, имейте в виду, что возможны следующие ограничения:

- Реализация SSL может быть не полностью совместима; возможны проблемы с [TLS SNI](https://www.cloudflare.com/learning/ssl/what-is-sni/).
- Конкретному инструменту могут требоваться особенности диалекта (например, функции или настройки, специфичные для MySQL), которые ещё не реализованы.

Если доступен нативный драйвер (например, [DBeaver](../integrations/dbeaver)), всегда предпочтительнее использовать его вместо интерфейса MySQL. Кроме того, хотя большинство клиентов MySQL должны работать корректно, интерфейс MySQL не гарантируется как полностью прозрачная замена для существующей кодовой базы с запросами MySQL.

Если ваш сценарий использования подразумевает конкретный инструмент, для которого нет нативного драйвера ClickHouse, и вы хотите использовать его через интерфейс MySQL, но обнаружили определённые несовместимости — пожалуйста, [создайте issue](https://github.com/ClickHouse/ClickHouse/issues) в репозитории ClickHouse.

::::note
Чтобы лучше поддерживать SQL-диалект указанных выше BI-инструментов, интерфейс MySQL в ClickHouse неявно выполняет запросы SELECT с настройкой [prefer_column_name_to_alias = 1](/operations/settings/settings#prefer_column_name_to_alias).
Эту настройку нельзя отключить, и в редких пограничных случаях она может приводить к отличиям в поведении между запросами, отправленными в обычный интерфейс запросов ClickHouse и интерфейс запросов MySQL.
::::



## Включение интерфейса MySQL в ClickHouse Cloud {#enabling-the-mysql-interface-on-clickhouse-cloud}

1. После создания сервиса ClickHouse Cloud нажмите кнопку `Connect`.

<br/>

<Image img={mysql0} alt="Экран учетных данных — запрос" size="md"/>

2. Измените значение выпадающего списка `Connect with` на `MySQL`. 

<br/>

<Image img={mysql1} alt="Экран учетных данных — выбран MySQL" size="md" />

3. Переключите тумблер, чтобы включить интерфейс MySQL для этого сервиса. Это откроет порт `3306` для данного сервиса и отобразит экран подключения к MySQL, содержащий ваше уникальное имя пользователя MySQL. Пароль будет таким же, как пароль пользователя по умолчанию для сервиса.

<br/>

<Image img={mysql2} alt="Экран учетных данных — MySQL включен" size="md"/>

Скопируйте показанную строку подключения к MySQL.

<Image img={mysql3} alt="Экран учетных данных — строка подключения" size="md"/>



## Создание нескольких пользователей MySQL в ClickHouse Cloud {#creating-multiple-mysql-users-in-clickhouse-cloud}

По умолчанию существует встроенный пользователь `mysql4<subdomain>`, который использует тот же пароль, что и пользователь `default`. Часть `<subdomain>` — это первый сегмент имени хоста вашего ClickHouse Cloud. Такой формат необходим для работы с инструментами, которые реализуют безопасное подключение, но не передают [SNI-информацию в своем TLS-рукопожатии](https://www.cloudflare.com/learning/ssl/what-is-sni), из-за чего невозможно выполнить внутреннюю маршрутизацию без дополнительной подсказки в имени пользователя (консольный клиент MySQL является одним из таких инструментов).

По этой причине мы *настоятельно рекомендуем* использовать формат `mysql4<subdomain>_<username>` при создании нового пользователя, предназначенного для работы через интерфейс MySQL, где `<subdomain>` — это подсказка для идентификации вашего облачного сервиса, а `<username>` — произвольный суффикс по вашему выбору.

:::tip
Для ClickHouse Cloud с именем хоста вида `foobar.us-east1.aws.clickhouse.cloud` часть `<subdomain>` равна `foobar`, и пользователь MySQL с произвольным именем может выглядеть как `mysql4foobar_team1`.
:::

Вы можете создать дополнительных пользователей для работы через интерфейс MySQL, если, например, вам нужно применить дополнительные настройки.

1. Необязательный шаг — создайте [профиль настроек](/sql-reference/statements/create/settings-profile), который будет применяться к вашему кастомному пользователю. Например, `my_custom_profile` с дополнительной настройкой, которая будет применяться по умолчанию при подключении с использованием пользователя, которого мы создадим позже:

   ```sql
   CREATE SETTINGS PROFILE my_custom_profile SETTINGS prefer_column_name_to_alias=1;
   ```

   `prefer_column_name_to_alias` используется здесь только в качестве примера, вы можете использовать другие настройки.

2. [Создайте пользователя](/sql-reference/statements/create/user), используя следующий формат: `mysql4<subdomain>_<username>` ([см. выше](#creating-multiple-mysql-users-in-clickhouse-cloud)). Пароль должен быть в формате double SHA1. Например:

   ```sql
   CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$';
   ```

   или, если вы хотите использовать пользовательский профиль для этого пользователя:

   ```sql
   CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$' SETTINGS PROFILE 'my_custom_profile';
   ```

   где `my_custom_profile` — это имя профиля, созданного ранее.

3. С помощью [GRANT](/sql-reference/statements/grant) выдайте новому пользователю необходимые разрешения для работы с нужными таблицами или базами данных. Например, если вы хотите предоставить доступ только к `system.query_log`:

   ```sql
   GRANT SELECT ON system.query_log TO mysql4foobar_team1;
   ```

4. Используйте созданного пользователя для подключения к вашему сервису ClickHouse Cloud через интерфейс MySQL.

### Устранение неполадок при работе с несколькими пользователями MySQL в ClickHouse Cloud {#troubleshooting-multiple-mysql-users-in-clickhouse-cloud}

Если вы создали нового пользователя MySQL и видите следующую ошибку при подключении через консольный клиент MySQL (CLI):

```sql
ERROR 2013 (HY000): Потеряно соединение с сервером MySQL при 'чтении пакета авторизации', системная ошибка: 54
```

В этом случае убедитесь, что имя пользователя имеет формат `mysql4<subdomain>_<username>`, как описано ([выше](#creating-multiple-mysql-users-in-clickhouse-cloud)).


## Включение интерфейса MySQL в самостоятельно управляемом ClickHouse {#enabling-the-mysql-interface-on-self-managed-clickhouse}

Добавьте параметр [mysql&#95;port](../operations/server-configuration-parameters/settings.md#mysql_port) в файл конфигурации сервера. Например, вы можете указать порт в новом XML-файле в папке `config.d/` [folder](../operations/configuration-files):

```xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

Запустите сервер ClickHouse и найдите в журнале сообщение, похожее на следующее, в котором упоминается «Listening for MySQL compatibility protocol»:

```bash
{} <Information> Application: Прослушивается протокол совместимости MySQL: 127.0.0.1:9004
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

Вывод в случае успешного подключения:

```text
Добро пожаловать в монитор MySQL. Команды завершаются символом ; или \g.
Идентификатор вашего MySQL-подключения: 4
Версия сервера: 20.2.1.1-ClickHouse

Copyright (c) 2000, 2019, Oracle и/или аффилированные лица. Все права защищены.

Oracle является зарегистрированным товарным знаком Oracle Corporation и/или
аффилированных лиц. Другие названия могут являться товарными знаками
соответствующих владельцев.

Введите 'help;' или '\h' для получения справки. Введите '\c' для очистки текущей команды.

mysql>
```

Для совместимости со всеми клиентами MySQL рекомендуется указывать пароль пользователя в конфигурационном файле с использованием [двойного SHA1](/operations/settings/settings-users#user-namepassword).
Если пароль пользователя указан с использованием [SHA256](/sql-reference/functions/hash-functions#SHA256), некоторые клиенты не смогут пройти аутентификацию (mysqljs и старые версии утилит командной строки MySQL и MariaDB).

Ограничения:

* подготовленные запросы не поддерживаются

* некоторые типы данных отправляются как строки

Чтобы отменить долгий запрос, используйте оператор `KILL QUERY connection_id` (во время выполнения он заменяется на `KILL QUERY WHERE query_id = connection_id`). Например:

```bash
$ mysql --protocol tcp -h mysql_server -P 9004 default -u default --password=123 -e "KILL QUERY 123456;"
```
