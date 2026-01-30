---
sidebar_label: 'Универсальный MariaDB'
description: 'Настройка любого экземпляра MariaDB как источника для ClickPipes'
slug: /integrations/clickpipes/mysql/source/generic_maria
title: 'Руководство по настройке универсального источника MariaDB'
doc_type: 'guide'
keywords: ['универсальный mariadb', 'clickpipes', 'бинарный лог', 'ssl tls', 'самостоятельное размещение']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

# Общее руководство по настройке источника MariaDB \{#generic-mariadb-source-setup-guide\}

:::info

Если вы используете одного из поддерживаемых провайдеров, перечисленных в боковой панели, обратитесь к соответствующему руководству по этому провайдеру.

:::

## Включение хранения бинарных логов \{#enable-binlog-retention\}

Бинарные логи содержат информацию об изменениях данных, внесённых в экземпляр сервера MariaDB, и необходимы для репликации.

Чтобы включить бинарное логирование на экземпляре MariaDB, убедитесь, что заданы следующие параметры:

```sql
server_id = 1               -- or greater; anything but 0
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
binlog_row_metadata = FULL  -- introduced in 10.5.0
expire_logs_days = 1        -- or higher; 0 would mean logs are preserved forever
```

Чтобы проверить эти настройки, выполните следующие команды SQL:

```sql
SHOW VARIABLES LIKE 'server_id';
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'binlog_row_metadata';
SHOW VARIABLES LIKE 'expire_logs_days';
```

Если значения не совпадают, их можно задать в конфигурационном файле (обычно это `/etc/my.cnf` или `/etc/my.cnf.d/mariadb-server.cnf`):

```ini
[mysqld]
server_id = 1
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
binlog_row_metadata = FULL  ; only in 10.5.0 and newer
expire_logs_days = 1
```

Если исходная база данных является репликой, убедитесь, что вы также включили `log_slave_updates`.

НЕОБХОДИМО ПЕРЕЗАПУСТИТЬ экземпляр MariaDB, чтобы изменения вступили в силу.

:::note

Исключение столбцов не поддерживается для MariaDB &lt;= 10.4, потому что параметр `binlog_row_metadata` ещё не был введён.

:::


## Настройка пользователя базы данных \{#configure-database-user\}

Подключитесь к вашему экземпляру MariaDB от имени пользователя root и выполните следующие команды:

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

Обязательно замените `clickpipes_user` и `some_secure_password` на нужные вам имя пользователя и пароль.

:::

## Конфигурация SSL/TLS (рекомендуется) \{#ssl-tls-configuration\}

SSL-сертификаты обеспечивают защищённые подключения к вашей базе данных MariaDB. Конфигурация зависит от типа сертификата:

**Доверенный центр сертификации (DigiCert, Let's Encrypt и т. д.)** — дополнительная настройка не требуется.

**Внутренний центр сертификации** — получите корневой сертификат CA от вашего ИТ-отдела. В интерфейсе ClickPipes загрузите его при создании нового MariaDB ClickPipe.

**Самостоятельно развернутая MariaDB** — скопируйте сертификат CA с вашего сервера MariaDB (узнайте путь через параметр `ssl_ca` в файле `my.cnf`). В интерфейсе ClickPipes загрузите его при создании нового MariaDB ClickPipe. В качестве хоста используйте IP-адрес сервера.

**Самостоятельно развернутая MariaDB, начиная с версии 11.4** — если на вашем сервере настроен `ssl_ca`, следуйте варианту выше. В противном случае проконсультируйтесь с вашим ИТ-отделом по поводу выдачи корректного сертификата. В крайнем случае используйте переключатель «Skip Certificate Verification» в интерфейсе ClickPipes (не рекомендуется по соображениям безопасности).

Для получения дополнительной информации о вариантах SSL/TLS ознакомьтесь с нашим [FAQ](https://clickhouse.com/docs/integrations/clickpipes/mysql/faq#tls-certificate-validation-error).

## Что дальше? \{#whats-next\}

Теперь вы можете [создать ClickPipe](../index.md) и начать приём данных из вашего экземпляра MariaDB в ClickHouse Cloud.
Обязательно запишите параметры подключения, которые вы использовали при настройке экземпляра MariaDB, так как они понадобятся вам при создании ClickPipe.