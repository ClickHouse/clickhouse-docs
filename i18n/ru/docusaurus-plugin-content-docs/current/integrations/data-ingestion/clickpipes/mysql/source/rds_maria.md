---
sidebar_label: 'Amazon RDS MariaDB'
description: 'Пошаговое руководство по настройке Amazon RDS MariaDB в качестве источника для ClickPipes'
slug: /integrations/clickpipes/mysql/source/rds_maria
title: 'Руководство по настройке Amazon RDS MariaDB как источника данных'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'ингестия данных', 'синхронизация в реальном времени']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import rds_backups from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/rds-backups.png';
import rds_config from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/rds_config.png';
import edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/edit_button.png';
import binlog_format from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_format.png';
import binlog_row_image from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_image.png';
import binlog_row_metadata from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_metadata.png';
import security_group_in_rds_mysql from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/security-group-in-rds-mysql.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';

# Руководство по настройке источника RDS MariaDB \\{#rds-mariadb-source-setup-guide\\}

Это пошаговое руководство по настройке экземпляра RDS MariaDB для репликации его данных с помощью MySQL ClickPipe.

<br/>

:::info
Рекомендуем также ознакомиться с разделом часто задаваемых вопросов по MySQL [здесь](/integrations/data-ingestion/clickpipes/mysql/faq.md). Страница с вопросами и ответами активно обновляется.
:::

## Включение хранения двоичного лога \\{#enable-binlog-retention-rds\\}

Двоичный лог — это набор файлов журнала, которые содержат информацию об изменениях данных, выполненных в экземпляре сервера MySQL. Файлы двоичного лога необходимы для репликации. Необходимо выполнить оба шага, приведённых ниже:

### 1. Включение двоичного логирования через автоматическое резервное копирование \\{#enable-binlog-logging-rds\\}

Функция автоматического резервного копирования определяет, включено или выключено двоичное логирование для MySQL. Её можно настроить в консоли AWS:

<Image img={rds_backups} alt="Включение автоматического резервного копирования в RDS" size="lg" border />

Рекомендуется установить срок хранения резервных копий на достаточно большое значение, в зависимости от сценария репликации.

### 2. Срок хранения binlog (в часах) \\{#binlog-retention-hours-rds\\}

Amazon RDS for MariaDB использует иной способ задания длительности хранения binlog, то есть времени, в течение которого файл binlog с изменениями сохраняется. Если некоторые изменения не будут прочитаны до удаления файла binlog, репликация не сможет продолжиться. Значение по умолчанию для срока хранения binlog — NULL, что означает, что двоичные логи не сохраняются.

Чтобы указать количество часов хранения двоичных логов на экземпляре БД, используйте функцию mysql.rds&#95;set&#95;configuration с периодом хранения binlog, достаточно длинным для выполнения репликации. Рекомендуемый минимум — `24 часа`.

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```


## Настройка параметров binlog в группе параметров \\{#binlog-parameter-group-rds\\}

Группу параметров можно найти, если нажать на экземпляр MariaDB в консоли RDS, а затем перейти на вкладку `Configurations`.

<Image img={rds_config} alt="Где найти группу параметров в RDS" size="lg" border/>

После перехода по ссылке группы параметров вы попадёте на страницу группы параметров. В правом верхнем углу вы увидите кнопку Edit:

<Image img={edit_button} alt="Редактирование группы параметров" size="lg" border/>

Параметры `binlog_format`, `binlog_row_metadata` и `binlog_row_image` необходимо настроить следующим образом:

1. Установите значение `binlog_format` в `ROW`.

<Image img={binlog_format} alt="Формат binlog — значение ROW" size="lg" border/>

2. Установите значение `binlog_row_metadata` в `FULL`.

<Image img={binlog_row_metadata} alt="Метаданные строк binlog — значение FULL" size="lg" border/>

3. Установите значение `binlog_row_image` в `FULL`.

<Image img={binlog_row_image} alt="Снимок строк binlog — значение FULL" size="lg" border/>

Затем нажмите `Save Changes` в правом верхнем углу. Возможно, вам потребуется перезагрузить экземпляр, чтобы изменения вступили в силу. Если вы видите статус `Pending reboot` рядом со ссылкой на группу параметров на вкладке Configurations экземпляра RDS, это означает, что требуется перезагрузка экземпляра.

<br/>

:::tip
Если у вас кластер MariaDB, указанные выше параметры будут находиться в группе параметров [DB Cluster](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html), а не в группе параметров экземпляра БД.
:::

## Включение режима GTID \\{#gtid-mode-rds\\}

Global Transaction Identifiers (GTID) — это уникальные идентификаторы, назначаемые каждой зафиксированной транзакции в MySQL/MariaDB. Они упрощают репликацию по бинарным логам (binlog) и облегчают устранение неполадок. В MariaDB режим GTID включён по умолчанию, поэтому от пользователя не требуется никаких действий для его использования.

## Настройка пользователя базы данных \\{#configure-database-user-rds\\}

Подключитесь к экземпляру RDS MariaDB под учетной записью администратора и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes:

    ```sql
    CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
    ```

2. Выдайте права на схему. В следующем примере показаны права для базы данных `mysql`. Повторите эти команды для каждой базы данных и хоста, которые вы хотите реплицировать:

    ```sql
    GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
    ```

3. Предоставьте пользователю права на репликацию:

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';


## Настройка сетевого доступа {#configure-network-access}

### Контроль доступа на основе IP-адресов {#ip-based-access-control}

Если вы хотите ограничить трафик к своему экземпляру RDS, добавьте [указанные в документации статические NAT IP-адреса](../../index.md#list-of-static-ips) в раздел `Inbound rules` группы безопасности вашего RDS.

<Image img={security_group_in_rds_mysql} alt="Где найти группу безопасности в RDS?" size="lg" border/>

<Image img={edit_inbound_rules} alt="Редактирование правил `Inbound rules` для указанной выше группы безопасности" size="lg" border/>

### Приватный доступ через AWS PrivateLink {#private-access-via-aws-privatelink}

Чтобы подключиться к своему экземпляру RDS через приватную сеть, вы можете использовать AWS PrivateLink. Следуйте нашему [руководству по настройке AWS PrivateLink для ClickPipes](/knowledgebase/aws-privatelink-setup-for-clickpipes), чтобы настроить соединение.