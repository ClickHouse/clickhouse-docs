---
sidebar_label: 'Универсальный MySQL'
description: 'Настройка любого экземпляра MySQL как источника для ClickPipes'
slug: /integrations/clickpipes/mysql/source/generic
title: 'Руководство по настройке универсального источника MySQL'
doc_type: 'guide'
keywords: ['универсальный mysql', 'clickpipes', 'бинарное логирование', 'ssl/tls', 'mysql 8.x']
---



# Общее руководство по настройке источника MySQL {#generic-mysql-source-setup-guide}

:::info

Если вы используете одного из поддерживаемых провайдеров (см. список в боковой панели), перейдите к специальному руководству для этого провайдера.

:::



## Включение сохранения двоичных журналов {#enable-binlog-retention}

Двоичные журналы содержат информацию об изменениях данных, внесённых в экземпляр сервера MySQL, и необходимы для репликации.

### MySQL 8.x и новее {#binlog-v8-x}

Чтобы включить ведение двоичных журналов на вашем экземпляре MySQL, убедитесь, что заданы следующие настройки:

```sql
log_bin = ON                        -- значение по умолчанию
binlog_format = ROW                 -- значение по умолчанию
binlog_row_image = FULL             -- значение по умолчанию
binlog_row_metadata = FULL
binlog_expire_logs_seconds = 86400  -- 1 день или более; по умолчанию 30 дней
```

Чтобы проверить эти настройки, выполните следующие SQL команды:

```sql
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'binlog_row_metadata';
SHOW VARIABLES LIKE 'binlog_expire_logs_seconds';
```

Если значения не совпадают, вы можете выполнить следующие SQL-запросы, чтобы задать нужные значения:

```sql
SET PERSIST log_bin = ON;
SET PERSIST binlog_format = ROW;
SET PERSIST binlog_row_image = FULL;
SET PERSIST binlog_row_metadata = FULL;
SET PERSIST binlog_expire_logs_seconds = 86400;
```

Если вы изменили настройку `log_bin`, вам НЕОБХОДИМО ПЕРЕЗАПУСТИТЬ экземпляр MySQL, чтобы изменения вступили в силу.

После изменения настроек продолжайте с [настройкой пользователя базы данных](#configure-database-user).

### MySQL 5.7 {#binlog-v5-x}

Чтобы включить бинарное логирование в экземпляре MySQL 5.7, убедитесь, что заданы следующие параметры:

```sql
server_id = 1            -- или больше; любое значение, кроме 0
log_bin = ON
binlog_format = ROW      -- значение по умолчанию
binlog_row_image = FULL  -- значение по умолчанию
expire_logs_days = 1     -- или больше; 0 означает, что журналы хранятся бессрочно
```

Чтобы проверить эти настройки, выполните следующие команды SQL:

```sql
SHOW VARIABLES LIKE 'server_id';
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'expire_logs_days';
```

Если значения не совпадают, вы можете указать их в конфигурационном файле (обычно в `/etc/my.cnf` или `/etc/mysql/my.cnf`):

```ini
[mysqld]
server_id = 1
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
expire_logs_days = 1
```

Необходимо перезапустить экземпляр MySQL, чтобы изменения вступили в силу.

:::note

Исключение столбцов не поддерживается в MySQL 5.7, так как параметр `binlog_row_metadata` в этой версии еще отсутствует.

:::


## Настройка пользователя базы данных {#configure-database-user}

Подключитесь к вашему экземпляру MySQL от имени пользователя root и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes:

    ```sql
    CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some_secure_password';
    ```

2. Предоставьте права на схему. В следующем примере показаны права для базы данных `clickpipes`. Повторите эти команды для каждой базы данных и хоста, которые вы хотите реплицировать:

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



## Настройка SSL/TLS (рекомендуется) {#ssl-tls-configuration}

SSL‑сертификаты обеспечивают защищённые подключения к вашей базе данных MySQL. Настройка зависит от типа сертификата:

**Доверенный центр сертификации (DigiCert, Let's Encrypt и т. д.)** — дополнительная настройка не требуется.

**Внутренний центр сертификации** — получите файл корневого сертификата CA у вашей ИТ-команды. В интерфейсе ClickPipes загрузите его при создании нового MySQL ClickPipe.

**Самостоятельно развернутый MySQL** — скопируйте сертификат CA с вашего сервера MySQL (обычно по пути `/var/lib/mysql/ca.pem`) и загрузите его в интерфейсе при создании нового MySQL ClickPipe. В качестве хоста используйте IP-адрес сервера.

**Самостоятельно развернутый MySQL без доступа к серверу** — обратитесь к вашей ИТ-команде за сертификатом. В крайнем случае используйте переключатель «Skip Certificate Verification» в интерфейсе ClickPipes (не рекомендуется по соображениям безопасности).

Дополнительную информацию по вариантам SSL/TLS см. в нашем [FAQ](https://clickhouse.com/docs/integrations/clickpipes/mysql/faq#tls-certificate-validation-error).



## Что дальше? {#whats-next}

Теперь вы можете [создать ClickPipe](../index.md) и начать приём данных из экземпляра MySQL в ClickHouse Cloud.
Обязательно сохраните данные подключения, которые вы использовали при настройке экземпляра MySQL, так как они понадобятся вам при создании ClickPipe.