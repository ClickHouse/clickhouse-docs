---
sidebar_label: 'Универсальный MariaDB'
description: 'Настройка любого экземпляра MariaDB в качестве источника для ClickPipes'
slug: /integrations/clickpipes/mysql/source/generic_maria
title: 'Руководство по настройке универсального источника MariaDB'
doc_type: 'guide'
keywords: ['универсальный mariadb', 'clickpipes', 'бинарный лог', 'ssl tls', 'самостоятельный хостинг']
---



# Общие рекомендации по настройке источника MariaDB

:::info

Если вы используете одного из поддерживаемых провайдеров (в боковой панели), обратитесь к соответствующему руководству для этого провайдера.

:::



## Включение хранения бинарных логов {#enable-binlog-retention}

Бинарные логи содержат информацию об изменениях данных, выполненных на экземпляре сервера MariaDB, и необходимы для репликации.

Чтобы включить бинарное логирование на экземпляре MariaDB, убедитесь, что настроены следующие параметры:

```sql
server_id = 1               -- или больше; любое значение, кроме 0
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
binlog_row_metadata = FULL  -- введено в версии 10.5.0
expire_logs_days = 1        -- или больше; 0 означает, что логи хранятся бессрочно
```

Чтобы проверить эти настройки, выполните следующие SQL-команды:

```sql
SHOW VARIABLES LIKE 'server_id';
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'binlog_row_metadata';
SHOW VARIABLES LIKE 'expire_logs_days';
```

Если значения не совпадают, их можно задать в конфигурационном файле (обычно `/etc/my.cnf` или `/etc/my.cnf.d/mariadb-server.cnf`):

```ini
[mysqld]
server_id = 1
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
binlog_row_metadata = FULL  ; только в версии 10.5.0 и новее
expire_logs_days = 1
```

Если исходная база данных является репликой, убедитесь, что также включен параметр `log_slave_updates`.

Для применения изменений НЕОБХОДИМО ПЕРЕЗАПУСТИТЬ экземпляр MariaDB.

:::note

Исключение столбцов не поддерживается для MariaDB \<= 10.4, поскольку параметр `binlog_row_metadata` еще не был введен.

:::


## Настройка пользователя базы данных {#configure-database-user}

Подключитесь к экземпляру MariaDB от имени пользователя root и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes:

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

Обязательно замените `clickpipes_user` и `some_secure_password` на нужные имя пользователя и пароль.

:::


## Настройка SSL/TLS (рекомендуется) {#ssl-tls-configuration}

SSL-сертификаты обеспечивают безопасное подключение к базе данных MariaDB. Настройка зависит от типа сертификата:

**Доверенный центр сертификации (DigiCert, Let's Encrypt и т. д.)** — дополнительная настройка не требуется.

**Внутренний центр сертификации** — получите файл корневого сертификата CA у IT-отдела. В интерфейсе ClickPipes загрузите его при создании нового MariaDB ClickPipe.

**Самостоятельно размещённая MariaDB** — скопируйте сертификат CA с сервера MariaDB (путь можно найти в параметре `ssl_ca` в файле `my.cnf`). В интерфейсе ClickPipes загрузите его при создании нового MariaDB ClickPipe. Используйте IP-адрес сервера в качестве хоста.

**Самостоятельно размещённая MariaDB начиная с версии 11.4** — если на сервере настроен параметр `ssl_ca`, следуйте инструкции выше. В противном случае обратитесь в IT-отдел для получения соответствующего сертификата. В крайнем случае используйте переключатель «Skip Certificate Verification» в интерфейсе ClickPipes (не рекомендуется по соображениям безопасности).

Дополнительную информацию о параметрах SSL/TLS см. в разделе [FAQ](https://clickhouse.com/docs/integrations/clickpipes/mysql/faq#tls-certificate-validation-error).


## Что дальше? {#whats-next}

Теперь вы можете [создать ClickPipe](../index.md) и начать загружать данные из вашего экземпляра MariaDB в ClickHouse Cloud.
Обязательно запишите параметры подключения, которые вы использовали при настройке экземпляра MariaDB, так как они понадобятся при создании ClickPipe.
