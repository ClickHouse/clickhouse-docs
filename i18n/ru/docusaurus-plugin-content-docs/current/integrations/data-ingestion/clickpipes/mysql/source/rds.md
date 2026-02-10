---
sidebar_label: 'Amazon RDS MySQL'
description: 'Пошаговое руководство по настройке Amazon RDS MySQL в качестве источника данных для ClickPipes'
slug: /integrations/clickpipes/mysql/source/rds
title: 'Руководство по настройке источника RDS MySQL'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'CDC', 'ингестия данных', 'синхронизация данных в реальном времени']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import rds_backups from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/rds-backups.png';
import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import security_group_in_rds_mysql from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/security-group-in-rds-mysql.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import rds_config from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/rds_config.png';
import binlog_format from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_format.png';
import binlog_row_image from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_image.png';
import binlog_row_metadata from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_metadata.png';
import edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/edit_button.png';
import enable_gtid from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/enable_gtid.png';
import Image from '@theme/IdealImage';


# Руководство по настройке источника RDS MySQL \{#rds-mysql-source-setup-guide\}

В этом пошаговом руководстве показано, как настроить Amazon RDS MySQL для репликации данных в ClickHouse Cloud с помощью [MySQL ClickPipe](../index.md). С ответами на распространённые вопросы по CDC (фиксация изменений данных) в MySQL можно ознакомиться на странице [MySQL FAQs](/integrations/data-ingestion/clickpipes/mysql/faq.md).

## Включение хранения бинарного лога \{#enable-binlog-retention-rds\}

Бинарный лог — это набор файлов журнала, содержащих информацию об изменениях данных в экземпляре сервера MySQL. Файлы бинарного лога необходимы для репликации. Чтобы настроить хранение бинарного лога в RDS MySQL, необходимо [включить ведение бинарного лога](#enable-binlog-logging) и [увеличить период его хранения](#binlog-retention-interval).

### 1. Включите бинарное логирование с помощью автоматического резервного копирования \{#enable-binlog-logging\}

Функция автоматического резервного копирования определяет, включено или отключено бинарное логирование для MySQL. Автоматическое резервное копирование можно настроить для вашего инстанса в RDS Console, перейдя в **Modify** > **Additional configuration** > **Backup** и установив флажок **Enable automated backups** (если он еще не установлен).

<Image img={rds_backups} alt="Включение автоматического резервного копирования в RDS" size="lg" border/>

Рекомендуется установить для параметра **Backup retention period** достаточно большое значение, в зависимости от сценария использования репликации.

### 2. Увеличьте интервал хранения binlog \{#binlog-retention-interval\}

:::warning
Если ClickPipes попытается возобновить репликацию и нужные файлы binlog будут удалены в соответствии с настроенным периодом хранения binlog, ClickPipe перейдет в состояние ошибки, и потребуется повторная синхронизация.
:::

По умолчанию Amazon RDS очищает двоичный лог как можно скорее (т. е. применяется *lazy purging*). Рекомендуется увеличить интервал хранения binlog как минимум до **72 часов**, чтобы обеспечить доступность файлов двоичного лога для репликации в аварийных сценариях. Чтобы задать интервал хранения двоичного лога ([`binlog retention hours`](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration-usage-notes.binlog-retention-hours)), используйте процедуру [`mysql.rds_set_configuration`](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration):

[//]: # "ПРИМЕЧАНИЕ Большинство поставщиков CDC (фиксация изменений данных) рекомендуют максимальный период хранения для RDS (7 дней/168 часов). Поскольку это влияет на использование диска, мы консервативно рекомендуем минимум 3 дня/72 часа."

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 72);
```

Если этот параметр не задан или для него установлен слишком маленький интервал, это может привести к разрывам в двоичных логах и помешать ClickPipes возобновлять репликацию.


## Настройка параметров binlog \{#binlog-settings\}

Группу параметров можно найти, если щёлкнуть по экземпляру MySQL в RDS Console, а затем перейти на вкладку **Configuration**.

:::tip
Если у вас кластер MySQL, параметры ниже могут находиться в группе параметров [DB cluster](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html), а не в группе параметров экземпляра базы данных.
:::

<Image img={rds_config} alt="Где найти группу параметров в RDS" size="lg" border/>

<br/>

Нажмите на ссылку группы параметров, после чего вы перейдёте на её отдельную страницу. В правом верхнем углу должна быть кнопка **Edit**.

<Image img={edit_button} alt="Редактирование группы параметров" size="lg" border/>

Следующие параметры необходимо настроить следующим образом:

1. Установите `binlog_format` в значение `ROW`.

<Image img={binlog_format} alt="Binlog format to ROW" size="lg" border/>

2. Установите `binlog_row_metadata` в значение `FULL`.

<Image img={binlog_row_metadata} alt="Binlog row metadata to FULL" size="lg" border/>

3. Установите `binlog_row_image` в значение `FULL`.

<Image img={binlog_row_image} alt="Binlog row image to FULL" size="lg" border/>

<br/>

Затем нажмите **Save Changes** в правом верхнем углу. Возможно, потребуется перезагрузить экземпляр, чтобы изменения вступили в силу: вы увидите статус `Pending reboot` рядом со ссылкой на группу параметров на вкладке **Configuration** экземпляра RDS.

## Включение режима GTID \{#gtid-mode\}

:::tip
MySQL ClickPipe также поддерживает репликацию без режима GTID. Однако включение режима GTID рекомендуется для повышения производительности и упрощения диагностики.
:::

[Global Transaction Identifiers (GTIDs)](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html) — это уникальные идентификаторы, назначаемые каждой зафиксированной транзакции в MySQL. Они упрощают репликацию binlog и делают диагностику более простой. Мы **рекомендуем** включить режим GTID, чтобы MySQL ClickPipe мог использовать репликацию, основанную на GTID.

Репликация, основанная на GTID, поддерживается для Amazon RDS for MySQL версий 5.7, 8.0 и 8.4. Чтобы включить режим GTID для вашего экземпляра Aurora MySQL, выполните следующие шаги:

1. В консоли RDS нажмите на ваш экземпляр MySQL.
2. Перейдите на вкладку **Configuration**.
3. Нажмите на ссылку группы параметров (parameter group).
4. Нажмите кнопку **Edit** в правом верхнем углу.
5. Установите `enforce_gtid_consistency` в значение `ON`.
6. Установите `gtid-mode` в значение `ON`.
7. Нажмите **Save Changes** в правом верхнем углу.
8. Перезапустите экземпляр, чтобы изменения вступили в силу.

<Image img={enable_gtid} alt="GTID включён" size="lg" border/>

<br/>

:::tip
MySQL ClickPipe также поддерживает репликацию без режима GTID. Однако включение режима GTID рекомендуется для повышения производительности и упрощения диагностики.
:::

## Настройка пользователя базы данных \{#configure-database-user\}

Подключитесь к вашему экземпляру RDS MySQL с учетной записью администратора и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes:

    ```sql
    CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
    ```

2. Назначьте права на схему. В следующем примере показаны права для базы данных `mysql`. Повторите эти команды для каждой базы данных и хоста, которые вы хотите реплицировать:

    ```sql
    GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
    ```

3. Назначьте пользователю права на репликацию:

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

## Настройка сетевого доступа \{#configure-network-access\}

### Управление доступом по IP-адресам \{#ip-based-access-control\}

Чтобы ограничить трафик к вашему экземпляру Aurora MySQL, добавьте [задокументированные статические NAT IP-адреса](../../index.md#list-of-static-ips) во **входящие правила (Inbound rules)** группы безопасности RDS.

<Image img={security_group_in_rds_mysql} alt="Где найти группу безопасности в RDS MySQL?" size="lg" border/>

<Image img={edit_inbound_rules} alt="Редактирование входящих правил (Inbound rules) для указанной выше группы безопасности" size="lg" border/>

### Частный доступ через AWS PrivateLink \{#private-access-via-aws-privatelink\}

Чтобы подключиться к экземпляру RDS по приватной сети, используйте AWS PrivateLink. См. [руководство по настройке AWS PrivateLink для ClickPipes](/knowledgebase/aws-privatelink-setup-for-clickpipes), чтобы настроить подключение.

## Дальнейшие шаги \{#next-steps\}

Теперь, когда ваш экземпляр Amazon RDS MySQL настроен для репликации binlog и безопасного подключения к ClickHouse Cloud, вы можете [создать свой первый MySQL ClickPipe](/integrations/clickpipes/mysql/#create-your-clickpipe). Ответы на распространённые вопросы о MySQL CDC см. на [странице с часто задаваемыми вопросами по MySQL](/integrations/data-ingestion/clickpipes/mysql/faq.md).