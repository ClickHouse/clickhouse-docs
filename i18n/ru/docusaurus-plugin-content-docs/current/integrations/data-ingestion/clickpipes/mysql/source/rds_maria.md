---
sidebar_label: 'Amazon RDS MariaDB'
description: 'Пошаговое руководство по настройке Amazon RDS MariaDB как источника для ClickPipes'
slug: /integrations/clickpipes/mysql/source/rds_maria
title: 'Руководство по настройке источника RDS MariaDB'
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


# Руководство по настройке источника RDS MariaDB \{#rds-mariadb-source-setup-guide\}

Это пошаговое руководство по настройке инстанса RDS MariaDB для репликации его данных через MySQL ClickPipe.

<br/>

:::info
Мы также рекомендуем ознакомиться с разделом часто задаваемых вопросов по MySQL (FAQ) [здесь](/integrations/data-ingestion/clickpipes/mysql/faq.md). Страница с FAQ регулярно обновляется.
:::

## Включение хранения двоичных логов \{#enable-binlog-retention-rds\}

Двоичный лог — это набор файлов журнала, которые содержат информацию об изменениях данных, внесённых в экземпляр сервера MySQL. Файлы двоичного лога необходимы для репликации. Необходимо выполнить оба приведённых ниже шага:

### 1. Включите бинарное логирование через автоматическое резервное копирование \{#enable-binlog-logging-rds\}

Функция автоматического резервного копирования определяет, включено или отключено бинарное логирование для MySQL. Её можно настроить в консоли AWS:

<Image img={rds_backups} alt="Включение автоматического резервного копирования в RDS" size="lg" border/>

Рекомендуется задать достаточно большой срок хранения резервных копий в зависимости от сценария репликации.

### 2. Время хранения binlog \{#binlog-retention-hours-rds\}

Amazon RDS for MariaDB использует другой метод настройки длительности хранения binlog, то есть времени, в течение которого хранится файл binlog, содержащий изменения. Если некоторые изменения не будут прочитаны до удаления файла binlog, репликация не сможет продолжиться. Значение по умолчанию для времени хранения binlog — NULL, что означает, что бинарные логи не сохраняются.

Чтобы указать количество часов хранения бинарных логов на экземпляре базы данных, используйте функцию mysql.rds&#95;set&#95;configuration с периодом хранения binlog, достаточным для выполнения репликации. Рекомендуемое минимальное значение — `24 hours`.

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```


## Настройка параметров binlog в группе параметров \{#binlog-parameter-group-rds\}

Группу параметров можно найти, выбрав ваш экземпляр MariaDB в консоли RDS, а затем перейдя на вкладку `Configurations`.

<Image img={rds_config} alt="Где найти группу параметров в RDS" size="lg" border/>

После нажатия на ссылку группы параметров вы попадёте на страницу этой группы параметров. В правом верхнем углу вы увидите кнопку Edit:

<Image img={edit_button} alt="Редактирование группы параметров" size="lg" border/>

Параметры `binlog_format`, `binlog_row_metadata` и `binlog_row_image` должны быть настроены следующим образом:

1. `binlog_format` — `ROW`.

<Image img={binlog_format} alt="Формат binlog установлен в ROW" size="lg" border/>

2. `binlog_row_metadata` — `FULL`

<Image img={binlog_row_metadata} alt="Метаданные строк binlog установлены в FULL" size="lg" border/>

3. `binlog_row_image` — `FULL`

<Image img={binlog_row_image} alt="Параметр binlog_row_image установлен в FULL" size="lg" border/>

Затем нажмите `Save Changes` в правом верхнем углу. Возможно, вам потребуется перезапустить экземпляр, чтобы изменения вступили в силу. Если вы видите `Pending reboot` рядом со ссылкой на группу параметров на вкладке Configurations экземпляра RDS, это является хорошим индикатором того, что требуется перезапуск экземпляра.

<br/>

:::tip
Если у вас кластер MariaDB, указанные выше параметры будут находиться в группе параметров [DB Cluster](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html), а не в группе параметров экземпляра DB.
:::

## Включение режима GTID \{#gtid-mode-rds\}

Global Transaction Identifiers (GTID) — это уникальные идентификаторы, присваиваемые каждой зафиксированной транзакции в MySQL/MariaDB. Они упрощают репликацию binlog и делают устранение неполадок более простым. В MariaDB режим GTID включён по умолчанию, поэтому от пользователя не требуется никаких дополнительных действий для его использования.

## Настройка пользователя базы данных \{#configure-database-user-rds\}

Подключитесь к вашему экземпляру RDS MariaDB как пользователь с правами администратора и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes:

    ```sql
    CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
    ```

2. Выдайте права на схему. В следующем примере показаны права для базы данных `mysql`. Повторите эти команды для каждой базы данных и хоста, которые вы хотите реплицировать:

    ```sql
    GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
    ```

3. Выдайте пользователю права на репликацию:

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';


## Настройка сетевого доступа {#configure-network-access}

### Контроль доступа по IP-адресам {#ip-based-access-control}

Если вы хотите ограничить трафик к своему экземпляру RDS, добавьте [задокументированные статические NAT IP-адреса](../../index.md#list-of-static-ips) в `Inbound rules` группы безопасности RDS.

<Image img={security_group_in_rds_mysql} alt="Где найти группу безопасности в RDS?" size="lg" border/>

<Image img={edit_inbound_rules} alt="Редактирование Inbound rules для указанной группы безопасности" size="lg" border/>

### Частный доступ через AWS PrivateLink {#private-access-via-aws-privatelink}

Чтобы подключиться к вашему экземпляру RDS по частной сети, вы можете использовать AWS PrivateLink. Воспользуйтесь нашим [руководством по настройке AWS PrivateLink для ClickPipes](/knowledgebase/aws-privatelink-setup-for-clickpipes), чтобы настроить подключение.