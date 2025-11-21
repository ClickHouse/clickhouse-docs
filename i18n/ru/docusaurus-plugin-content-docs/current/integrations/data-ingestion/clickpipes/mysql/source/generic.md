---
sidebar_label: 'Произвольный MySQL'
description: 'Настройка любого экземпляра MySQL как источника для ClickPipes'
slug: /integrations/clickpipes/mysql/source/generic
title: 'Руководство по настройке произвольного источника MySQL'
doc_type: 'guide'
keywords: ['generic mysql', 'clickpipes', 'binary logging', 'ssl tls', 'mysql 8.x']
---



# Общие рекомендации по настройке источника MySQL

:::info

Если вы используете одного из поддерживаемых провайдеров (см. список в боковой панели), обратитесь к соответствующему руководству по этому провайдеру.

:::



## Включение хранения бинарных логов {#enable-binlog-retention}

Бинарные логи содержат информацию об изменениях данных, выполненных на экземпляре сервера MySQL, и необходимы для репликации.

### MySQL 8.x и новее {#binlog-v8-x}

Чтобы включить бинарное логирование на экземпляре MySQL, убедитесь, что настроены следующие параметры:

```sql
log_bin = ON                        -- значение по умолчанию
binlog_format = ROW                 -- значение по умолчанию
binlog_row_image = FULL             -- значение по умолчанию
binlog_row_metadata = FULL
binlog_expire_logs_seconds = 86400  -- 1 день или больше; по умолчанию 30 дней
```

Чтобы проверить эти параметры, выполните следующие SQL-команды:

```sql
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'binlog_row_metadata';
SHOW VARIABLES LIKE 'binlog_expire_logs_seconds';
```

Если значения не совпадают, выполните следующие SQL-команды для их установки:

```sql
SET PERSIST log_bin = ON;
SET PERSIST binlog_format = ROW;
SET PERSIST binlog_row_image = FULL;
SET PERSIST binlog_row_metadata = FULL;
SET PERSIST binlog_expire_logs_seconds = 86400;
```

Если вы изменили параметр `log_bin`, НЕОБХОДИМО ПЕРЕЗАПУСТИТЬ экземпляр MySQL, чтобы изменения вступили в силу.

После изменения параметров продолжите [настройку пользователя базы данных](#configure-database-user).

### MySQL 5.7 {#binlog-v5-x}

Чтобы включить бинарное логирование на экземпляре MySQL 5.7, убедитесь, что настроены следующие параметры:

```sql
server_id = 1            -- или больше; любое значение, кроме 0
log_bin = ON
binlog_format = ROW      -- значение по умолчанию
binlog_row_image = FULL  -- значение по умолчанию
expire_logs_days = 1     -- или больше; 0 означает, что логи хранятся бессрочно
```

Чтобы проверить эти параметры, выполните следующие SQL-команды:

```sql
SHOW VARIABLES LIKE 'server_id';
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'expire_logs_days';
```

Если значения не совпадают, установите их в конфигурационном файле (обычно `/etc/my.cnf` или `/etc/mysql/my.cnf`):

```ini
[mysqld]
server_id = 1
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
expire_logs_days = 1
```

НЕОБХОДИМО ПЕРЕЗАПУСТИТЬ экземпляр MySQL, чтобы изменения вступили в силу.

:::note

Исключение столбцов не поддерживается для MySQL 5.7, поскольку параметр `binlog_row_metadata` еще не был введен.

:::


## Настройка пользователя базы данных {#configure-database-user}

Подключитесь к экземпляру MySQL от имени пользователя root и выполните следующие команды:

1. Создайте выделенного пользователя для ClickPipes:

   ```sql
   CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some_secure_password';
   ```

2. Предоставьте права доступа к схеме. В следующем примере показаны права доступа для базы данных `clickpipes`. Повторите эти команды для каждой базы данных и хоста, которые требуется реплицировать:

   ```sql
   GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'%';
   ```

3. Предоставьте пользователю права на репликацию:

   ```sql
   GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
   GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
   ```

:::note

Обязательно замените `clickpipes_user` и `some_secure_password` на требуемое имя пользователя и пароль.

:::


## Настройка SSL/TLS (рекомендуется) {#ssl-tls-configuration}

SSL-сертификаты обеспечивают безопасное подключение к базе данных MySQL. Настройка зависит от типа сертификата:

**Доверенный центр сертификации (DigiCert, Let's Encrypt и т. д.)** — дополнительная настройка не требуется.

**Внутренний центр сертификации** — получите файл корневого сертификата CA у вашей IT-команды. В интерфейсе ClickPipes загрузите его при создании нового MySQL ClickPipe.

**Самостоятельно размещённый MySQL** — скопируйте сертификат CA с сервера MySQL (обычно находится по пути `/var/lib/mysql/ca.pem`) и загрузите его в интерфейсе при создании нового MySQL ClickPipe. Используйте IP-адрес сервера в качестве хоста.

**Самостоятельно размещённый MySQL без доступа к серверу** — обратитесь к IT-команде за сертификатом. В крайнем случае используйте переключатель «Skip Certificate Verification» в интерфейсе ClickPipes (не рекомендуется по соображениям безопасности).

Дополнительную информацию о параметрах SSL/TLS см. в разделе [FAQ](https://clickhouse.com/docs/integrations/clickpipes/mysql/faq#tls-certificate-validation-error).


## Что дальше? {#whats-next}

Теперь вы можете [создать ClickPipe](../index.md) и начать загружать данные из вашего экземпляра MySQL в ClickHouse Cloud.
Обязательно запишите параметры подключения, которые вы использовали при настройке экземпляра MySQL, так как они понадобятся при создании ClickPipe.
