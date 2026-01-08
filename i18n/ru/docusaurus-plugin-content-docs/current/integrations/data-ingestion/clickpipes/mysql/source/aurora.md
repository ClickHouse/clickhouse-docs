---
sidebar_label: 'Amazon Aurora MySQL'
description: 'Пошаговое руководство по настройке Amazon Aurora MySQL в качестве источника данных для ClickPipes'
slug: /integrations/clickpipes/mysql/source/aurora
title: 'Руководство по настройке источника Aurora MySQL'
doc_type: 'guide'
keywords: ['aurora mysql', 'clickpipes', 'binlog retention', 'gtid mode', 'aws']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import rds_backups from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/rds-backups.png';
import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import security_group_in_rds_mysql from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/security-group-in-rds-mysql.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import aurora_config from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/aurora_config.png';
import binlog_format from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_format.png';
import binlog_row_image from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_image.png';
import binlog_row_metadata from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_metadata.png';
import edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/edit_button.png';
import enable_gtid from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/enable_gtid.png';
import Image from '@theme/IdealImage';

# Руководство по настройке источника Aurora MySQL {#aurora-mysql-source-setup-guide}

В этом пошаговом руководстве показано, как настроить Amazon Aurora MySQL для репликации данных в ClickHouse Cloud с помощью [MySQL ClickPipe](../index.md). Ответы на распространённые вопросы о MySQL CDC см. на странице [MySQL FAQs](/integrations/data-ingestion/clickpipes/mysql/faq.md).

## Включение хранения двоичных журналов {#enable-binlog-retention-aurora}

Двоичный журнал — это набор файлов журнала, содержащих информацию об изменениях данных, внесённых в экземпляр сервера MySQL; файлы двоичного журнала необходимы для репликации. Чтобы настроить хранение двоичных журналов в Aurora MySQL, необходимо [включить двоичное логирование](#enable-binlog-logging) и [увеличить интервал хранения binlog](#binlog-retention-interval).

### 1. Включите двоичное логирование с помощью автоматического резервного копирования {#enable-binlog-logging}

Функция автоматического резервного копирования определяет, включено или отключено двоичное логирование для MySQL. Автоматическое резервное копирование можно настроить для вашего экземпляра в RDS Console, перейдя в **Modify** > **Additional configuration** > **Backup** и установив флажок **Enable automated backups** (если он ещё не установлен).

<Image img={rds_backups} alt="Включение автоматического резервного копирования в Aurora" size="lg" border/>

Рекомендуется задать для параметра **Backup retention period** достаточно большое значение в зависимости от сценария репликации.

### 2. Увеличьте интервал хранения binlog {#binlog-retention-interval}

:::warning
Если ClickPipes попытается возобновить репликацию, а необходимые файлы binlog уже были удалены из-за настроенного интервала хранения binlog, ClickPipe перейдёт в состояние ошибки и потребуется повторная синхронизация.
:::

По умолчанию Aurora MySQL очищает двоичный журнал как можно скорее (т. е. используется *отложенное удаление*). Рекомендуется увеличить интервал хранения binlog как минимум до **72 часов**, чтобы обеспечить доступность файлов двоичного журнала для репликации в аварийных сценариях. Чтобы задать интервал хранения двоичных журналов ([`binlog retention hours`](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration-usage-notes.binlog-retention-hours)), используйте процедуру [`mysql.rds_set_configuration`](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration):

[//]: # "ПРИМЕЧАНИЕ. Большинство провайдеров CDC рекомендуют максимальный период хранения для Aurora RDS (7 дней/168 часов). Поскольку это влияет на использование диска, мы консервативно рекомендуем минимум 3 дня/72 часа."

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 72);
```

Если эта настройка не задана или для неё установлен слишком короткий интервал, это может привести к пропускам в двоичных журналах и не позволит ClickPipes корректно возобновлять репликацию.


## Настройка параметров binlog {#binlog-settings}

Группу параметров можно найти, выбрав ваш экземпляр MySQL в консоли RDS, а затем перейдя на вкладку **Configuration**.

:::tip
Если у вас кластер MySQL, перечисленные ниже параметры можно найти в группе параметров [DB cluster](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html), а не в группе параметров экземпляра БД.
:::

<Image img={aurora_config} alt="Где найти группу параметров в Aurora" size="lg" border/>

<br/>
Нажмите на ссылку группы параметров, после чего вы попадёте на её отдельную страницу. В правом верхнем углу должна быть кнопка **Edit**.

<Image img={edit_button} alt="Редактирование группы параметров" size="lg" border/>

<br/>
Необходимо задать следующие параметры:

1. `binlog_format` — значение `ROW`.

<Image img={binlog_format} alt="Формат binlog — ROW" size="lg" border/>

2. `binlog_row_metadata` — значение `FULL`.

<Image img={binlog_row_metadata} alt="Binlog row metadata" size="lg" border/>

3. `binlog_row_image` — значение `FULL`.

<Image img={binlog_row_image} alt="Binlog row image" size="lg" border/>

<br/>
Затем нажмите **Save Changes** в правом верхнем углу. Возможно, потребуется перезагрузить экземпляр, чтобы изменения вступили в силу — об этом можно судить по индикатору `Pending reboot`, который появится рядом со ссылкой на группу параметров на вкладке **Configuration** экземпляра Aurora.

## Включение режима GTID (рекомендуется) {#gtid-mode}

:::tip
MySQL ClickPipe также поддерживает репликацию без режима GTID. Однако включение режима GTID рекомендуется для повышения производительности и упрощения устранения неполадок.
:::

[Глобальные идентификаторы транзакций (GTID)](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html) — это уникальные идентификаторы, присваиваемые каждой зафиксированной транзакции в MySQL. Они упрощают binlog-репликацию и делают диагностику более простой. Мы **рекомендуем** включить режим GTID, чтобы MySQL ClickPipe мог использовать репликацию на основе GTID.

Репликация на основе GTID поддерживается для Amazon Aurora MySQL v2 (MySQL 5.7) и v3 (MySQL 8.0), а также Aurora Serverless v2. Чтобы включить режим GTID для вашего экземпляра Aurora MySQL, выполните следующие действия:

1. В консоли RDS нажмите на ваш экземпляр MySQL.
2. Перейдите на вкладку **Configuration**.
3. Нажмите на ссылку на группу параметров.
4. Нажмите кнопку **Edit** в правом верхнем углу.
5. Установите `enforce_gtid_consistency` в значение `ON`.
6. Установите `gtid-mode` в значение `ON`.
7. Нажмите **Save Changes** в правом верхнем углу.
8. Перезагрузите экземпляр, чтобы изменения вступили в силу.

<Image img={enable_gtid} alt="Режим GTID включен" size="lg" border/>

## Настройка пользователя базы данных {#configure-database-user}

Подключитесь к экземпляру Aurora MySQL с правами администратора и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes:

    ```sql
    CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some-password';
    ```

2. Предоставьте права на схему. В следующем примере показаны права для базы данных `mysql`. Повторите эти команды для каждой базы данных и каждого хоста, которые вы хотите реплицировать:

    ```sql
    GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
    ```

3. Предоставьте пользователю права на репликацию:

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

## Настройка сетевого доступа {#configure-network-access}

### Управление доступом по IP-адресам {#ip-based-access-control}

Чтобы ограничить трафик к вашему экземпляру Aurora MySQL, добавьте [задокументированные статические NAT IP-адреса](../../index.md#list-of-static-ips) в раздел **Inbound rules** группы безопасности Aurora.

<Image img={security_group_in_rds_mysql} alt="Где найти группу безопасности в Aurora MySQL?" size="lg" border/>

<Image img={edit_inbound_rules} alt="Редактирование входящих правил для указанной группы безопасности" size="lg" border/>

### Частный доступ через AWS PrivateLink {#private-access-via-aws-privatelink}

Чтобы подключиться к вашему экземпляру Aurora MySQL по частной сети, вы можете использовать AWS PrivateLink. Следуйте [руководству по настройке AWS PrivateLink для ClickPipes](/knowledgebase/aws-privatelink-setup-for-clickpipes), чтобы настроить подключение.

## Что дальше? {#whats-next}

Теперь, когда ваш экземпляр Amazon Aurora MySQL настроен для репликации binlog и безопасного подключения к ClickHouse Cloud, вы можете [создать свой первый MySQL ClickPipe](/integrations/clickpipes/mysql/#create-your-clickpipe). Ответы на распространённые вопросы по MySQL CDC см. на странице [часто задаваемых вопросов по MySQL](/integrations/data-ingestion/clickpipes/mysql/faq.md).