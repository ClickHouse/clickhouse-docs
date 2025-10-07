---
'sidebar_label': 'Generic MySQL'
'description': 'Настройте любой экземпляр MySQL в качестве источника для ClickPipes'
'slug': '/integrations/clickpipes/mysql/source/generic'
'title': 'Общий гид по настройке источника MySQL'
'doc_type': 'guide'
---
# Руководство по настройке источника Generic MySQL

:::info

Если вы используете одного из поддерживаемых поставщиков (в боковой панели), пожалуйста, обратитесь к конкретному руководству для этого поставщика.

:::

## Включение хранения бинарного лога {#enable-binlog-retention}

Бинарные логи содержат информацию о модификациях данных, выполненных на экземпляре MySQL сервера, и необходимы для репликации.

### MySQL 8.x и новее {#binlog-v8-x}

Чтобы включить бинарное логирование на вашем экземпляре MySQL, убедитесь, что следующие параметры настроены:

```sql
log_bin = ON                        -- default value
binlog_format = ROW                 -- default value
binlog_row_image = FULL             -- default value
binlog_row_metadata = FULL
binlog_expire_logs_seconds = 86400  -- 1 day or higher; default is 30 days
```

Чтобы проверить эти параметры, выполните следующие SQL команды:
```sql
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'binlog_row_metadata';
SHOW VARIABLES LIKE 'binlog_expire_logs_seconds';
```

Если значения не совпадают, вы можете выполнить следующие SQL команды для их установки:
```sql
SET PERSIST log_bin = ON;
SET PERSIST binlog_format = ROW;
SET PERSIST binlog_row_image = FULL;
SET PERSIST binlog_row_metadata = FULL;
SET PERSIST binlog_expire_logs_seconds = 86400;
```

Если вы изменили параметр `log_bin`, вам НУЖНО ПЕРЕЗАПУСТИТЬ экземпляр MySQL, чтобы изменения вступили в силу.

После изменения настроек продолжите с [настройкой учетной записи базы данных](#configure-database-user).

### MySQL 5.7 {#binlog-v5-x}

Чтобы включить бинарное логирование на вашем экземпляре MySQL 5.7, убедитесь, что следующие параметры настроены:

```sql
server_id = 1            -- or greater; anything but 0
log_bin = ON
binlog_format = ROW      -- default value
binlog_row_image = FULL  -- default value
expire_logs_days = 1     -- or higher; 0 would mean logs are preserved forever
```

Чтобы проверить эти параметры, выполните следующие SQL команды:
```sql
SHOW VARIABLES LIKE 'server_id';
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'expire_logs_days';
```

Если значения не совпадают, вы можете установить их в файле конфигурации (обычно по адресу `/etc/my.cnf` или `/etc/mysql/my.cnf`):
```ini
[mysqld]
server_id = 1
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
expire_logs_days = 1
```

Вам НУЖНО ПЕРЕЗАПУСТИТЬ экземпляр MySQL, чтобы изменения вступили в силу.

:::note

Исключение колонок не поддерживается для MySQL 5.7, так как настройка `binlog_row_metadata` ещё не была введена.

:::

## Настройка учетной записи базы данных {#configure-database-user}

Подключитесь к вашему экземпляру MySQL как пользователь root и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes:

```sql
CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some_secure_password';
```

2. Предоставьте разрешения на схему. Следующий пример показывает разрешения для базы данных `clickpipes`. Повторите эти команды для каждой базы данных и хоста, которые вы хотите реплицировать:

```sql
GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'%';
```

3. Предоставьте разрешения на репликацию пользователю:

```sql
GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
```

:::note

Убедитесь, что вы заменили `clickpipes_user` и `some_secure_password` на желаемое имя пользователя и пароль.

:::

## Конфигурация SSL/TLS (рекомендуется) {#ssl-tls-configuration}

SSL сертификаты обеспечивают безопасные соединения с вашей базой данных MySQL. Конфигурация зависит от типа вашего сертификата:

**Доверенный Центр сертификации (DigiCert, Let's Encrypt и т.д.)** - дополнительная конфигурация не требуется.

**Внутренний Центр сертификации** - получите файл корневого CA сертификата от вашей IT команды. В интерфейсе ClickPipes загрузите его при создании нового MySQL ClickPipe.

**Самостоятельно управляемый MySQL** - Скопируйте CA сертификат с вашего MySQL сервера (обычно по адресу `/var/lib/mysql/ca.pem`) и загрузите его в интерфейсе при создании нового MySQL ClickPipe. Используйте IP-адрес сервера в качестве хоста.

**Самостоятельно управляемый MySQL без доступа к серверу** - Свяжитесь с вашей IT командой для получения сертификата. В качестве последнего средства, используйте переключатель "Пропустить проверку сертификата" в интерфейсе ClickPipes (не рекомендуется по соображениям безопасности).

Для получения дополнительной информации об опциях SSL/TLS ознакомьтесь с нашим [FAQ](https://clickhouse.com/docs/integrations/clickpipes/mysql/faq#tls-certificate-validation-error).

## Что далее? {#whats-next}

Теперь вы можете [создать свой ClickPipe](../index.md) и начать загрузку данных из вашего экземпляра MySQL в ClickHouse Cloud. Не забудьте записать детали подключения, которые вы использовали при настройке вашего экземпляра MySQL, так как они потребуются вам во время процесса создания ClickPipe.