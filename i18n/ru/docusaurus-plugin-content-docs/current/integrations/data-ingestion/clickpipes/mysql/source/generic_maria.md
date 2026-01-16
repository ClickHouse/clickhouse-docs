---
sidebar_label: 'Произвольный MariaDB'
description: 'Настройка любого экземпляра MariaDB в качестве источника для ClickPipes'
slug: /integrations/clickpipes/mysql/source/generic_maria
title: 'Руководство по настройке произвольного источника MariaDB'
doc_type: 'guide'
keywords: ['произвольный mariadb', 'clickpipes', 'binary logging', 'ssl tls', 'самостоятельный хостинг']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

# Общая инструкция по настройке источника MariaDB \{#generic-mariadb-source-setup-guide\}

:::info

Если вы используете один из поддерживаемых провайдеров (см. список в боковой панели), обратитесь к отдельной инструкции для этого провайдера.

:::

## Включение хранения бинарных логов \{#enable-binlog-retention\}

Бинарные логи содержат информацию об изменениях данных, внесённых в экземпляр сервера MariaDB, и необходимы для репликации.

Чтобы включить бинарное логирование на вашем экземпляре сервера MariaDB, убедитесь, что настроены следующие параметры:

```sql
server_id = 1               -- or greater; anything but 0
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
binlog_row_metadata = FULL  -- introduced in 10.5.0
expire_logs_days = 1        -- or higher; 0 would mean logs are preserved forever
```

Чтобы проверить эти настройки, выполните следующие SQL-запросы:

```sql
SHOW VARIABLES LIKE 'server_id';
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'binlog_row_metadata';
SHOW VARIABLES LIKE 'expire_logs_days';
```

Если значения отличаются, вы можете задать их в конфигурационном файле (обычно по пути `/etc/my.cnf` или `/etc/my.cnf.d/mariadb-server.cnf`):

```ini
[mysqld]
server_id = 1
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
binlog_row_metadata = FULL  ; only in 10.5.0 and newer
expire_logs_days = 1
```

Если исходная база данных является репликой, убедитесь, что параметр `log_slave_updates` также включён.

Вам НЕОБХОДИМО ПЕРЕЗАПУСТИТЬ экземпляр MariaDB, чтобы изменения вступили в силу.

:::note
Исключение столбцов не поддерживается для MariaDB &lt;= 10.4, так как настройка `binlog_row_metadata` ещё не была введена.
:::


## Настройка пользователя базы данных \{#configure-database-user\}

Подключитесь к экземпляру MariaDB под пользователем root и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes:

    ```sql
    CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some_secure_password';
    ```

2. Предоставьте права на схему. В следующем примере показаны права для базы данных `clickpipes`. Повторите эти команды для каждой базы данных и каждого хоста, которые вы хотите реплицировать:

    ```sql
    GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'%';
    ```

3. Предоставьте пользователю права на репликацию:

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

:::note

Обязательно замените `clickpipes_user` и `some_secure_password` на нужные имя пользователя и пароль.

:::

## Конфигурация SSL/TLS (рекомендуется) \{#ssl-tls-configuration\}

Сертификаты SSL обеспечивают защищённые соединения с вашей базой данных MariaDB. Конфигурация зависит от типа сертификата:

**Доверенный центр сертификации (DigiCert, Let's Encrypt и т. д.)** — дополнительная настройка не требуется.

**Внутренний центр сертификации** — получите файл корневого сертификата CA у вашей ИТ-команды. В интерфейсе ClickPipes загрузите его при создании нового MariaDB ClickPipe.

**Самостоятельно развёрнутая MariaDB** — скопируйте сертификат CA с вашего сервера MariaDB (найдите путь по настройке `ssl_ca` в вашем `my.cnf`). В интерфейсе ClickPipes загрузите его при создании нового MariaDB ClickPipe. Используйте IP-адрес сервера в качестве хоста.

**Самостоятельно развёрнутая MariaDB, начиная с версии 11.4** — если на вашем сервере настроен `ssl_ca`, следуйте варианту выше. В противном случае проконсультируйтесь с вашей ИТ-командой для выдачи корректного сертификата. В крайнем случае используйте переключатель «Skip Certificate Verification» в интерфейсе ClickPipes (не рекомендуется по соображениям безопасности).

Для получения дополнительной информации по вариантам настройки SSL/TLS см. наш [FAQ](https://clickhouse.com/docs/integrations/clickpipes/mysql/faq#tls-certificate-validation-error).

## Что дальше? \{#whats-next\}

Теперь вы можете [создать ClickPipe](../index.md) и начать приём данных из вашего экземпляра MariaDB в ClickHouse Cloud.
Обязательно запишите параметры подключения, которые вы использовали при настройке экземпляра MariaDB, так как они понадобятся при создании ClickPipe.