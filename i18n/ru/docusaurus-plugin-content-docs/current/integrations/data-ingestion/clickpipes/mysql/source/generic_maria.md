---
'sidebar_label': 'Генерическое MariaDB'
'description': 'Настройте любой экземпляр MariaDB как источник для ClickPipes'
'slug': '/integrations/clickpipes/mysql/source/generic_maria'
'title': 'Генерическое руководство по настройке источника MariaDB'
'doc_type': 'guide'
---
# Общее руководство по настройке источника MariaDB

:::info

Если вы используете одного из поддерживаемых провайдеров (в боковом меню), пожалуйста, обратитесь к конкретному руководству для этого провайдера.

:::

## Включение хранения двоичных журналов {#enable-binlog-retention}

Двоичные журналы содержат информацию о модификациях данных, выполненных на экземпляре сервера MariaDB, и необходимы для репликации.

Чтобы включить двоичное журналирование на вашем экземпляре MariaDB, убедитесь, что следующие настройки сконфигурированы:

```sql
server_id = 1               -- or greater; anything but 0
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
binlog_row_metadata = FULL  -- introduced in 10.5.0
expire_logs_days = 1        -- or higher; 0 would mean logs are preserved forever
```

Чтобы проверить эти настройки, выполните следующие SQL команды:
```sql
SHOW VARIABLES LIKE 'server_id';
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'binlog_row_metadata';
SHOW VARIABLES LIKE 'expire_logs_days';
```

Если значения не совпадают, вы можете установить их в файле конфигурации (обычно по пути `/etc/my.cnf` или `/etc/my.cnf.d/mariadb-server.cnf`):
```ini
[mysqld]
server_id = 1
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
binlog_row_metadata = FULL  ; only in 10.5.0 and newer
expire_logs_days = 1
```

Если исходная база данных является репликой, убедитесь, что также включена опция `log_slave_updates`.

Вам НЕОБХОДИМО ПЕРЕЗАПУСТИТЬ экземпляр MariaDB, чтобы изменения вступили в силу.

:::note

Исключение колонок не поддерживается для MariaDB \<= 10.4, так как настройка `binlog_row_metadata` еще не была введена.

:::

## Настройка пользователя базы данных {#configure-database-user}

Подключитесь к вашему экземпляру MariaDB как пользователь root и выполните следующие команды:

1. Создайте выделенного пользователя для ClickPipes:

```sql
CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some_secure_password';
```

2. Предоставьте разрешения на схему. Следующий пример показывает разрешения для базы данных `clickpipes`. Повторите эти команды для каждой базы данных и хоста, которые вы хотите реплицировать:

```sql
GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'%';
```

3. Предоставьте пользователю разрешения на репликацию:

```sql
GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
```

:::note

Не забудьте заменить `clickpipes_user` и `some_secure_password` на ваше желаемое имя пользователя и пароль.

:::

## Конфигурация SSL/TLS (рекомендуется) {#ssl-tls-configuration}

SSL сертификаты обеспечивают безопасные соединения с вашей базой данных MariaDB. Конфигурация зависит от типа вашего сертификата:

**Доверенный центр сертификации (DigiCert, Let's Encrypt и т.д.)** - дополнительная конфигурация не требуется.

**Внутренний центр сертификации** - получите файл корневого сертификата CA от вашей ИТ-команды. В интерфейсе ClickPipes загрузите его при создании нового ClickPipe для MariaDB.

**Самостоятельно размещенный MariaDB** - скопируйте сертификат CA с вашего сервера MariaDB (узнайте путь через настройку `ssl_ca` в вашем `my.cnf`). В интерфейсе ClickPipes загрузите его при создании нового ClickPipe для MariaDB. Используйте IP-адрес сервера в качестве хоста.

**Самостоятельно размещенный MariaDB, начиная с версии 11.4** - если ваш сервер настроен с `ssl_ca`, следуйте предыдущему варианту. В противном случае проконсультируйтесь с вашей ИТ-командой для provisioning надлежащего сертификата. В качестве последнего средства используйте переключатель "Пропустить проверку сертификатов" в интерфейсе ClickPipes (не рекомендуется по соображениям безопасности).

Для получения дополнительной информации о параметрах SSL/TLS, ознакомьтесь с нашим [FAQ](https://clickhouse.com/docs/integrations/clickpipes/mysql/faq#tls-certificate-validation-error).

## Что дальше? {#whats-next}

Теперь вы можете [создать ваш ClickPipe](../index.md) и начать загружать данные из вашего экземпляра MariaDB в ClickHouse Cloud. Не забудьте записать детали подключения, которые вы использовали при настройке вашего экземпляра MariaDB, так как они понадобятся вам в процессе создания ClickPipe.