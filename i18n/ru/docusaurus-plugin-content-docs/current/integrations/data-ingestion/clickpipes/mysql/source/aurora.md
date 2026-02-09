---
sidebar_label: 'Amazon Aurora MySQL'
description: 'Пошаговое руководство по настройке Amazon Aurora MySQL в качестве источника для ClickPipes'
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


# Руководство по настройке источника Aurora MySQL \{#aurora-mysql-source-setup-guide\}

В этом пошаговом руководстве описано, как настроить Amazon Aurora MySQL для репликации данных в ClickHouse Cloud с помощью [MySQL ClickPipe](../index.md). Ответы на часто задаваемые вопросы о MySQL CDC (фиксации изменений данных) см. на странице [MySQL FAQs](/integrations/data-ingestion/clickpipes/mysql/faq.md).

## Включение хранения двоичных логов \{#enable-binlog-retention-aurora\}

Двоичный лог — это набор файлов журнала, которые содержат информацию об изменениях данных, вносимых в экземпляр сервера MySQL. Файлы двоичных логов необходимы для репликации. Чтобы настроить хранение двоичных логов в Aurora MySQL, необходимо [включить двоичное логирование](#enable-binlog-logging) и [увеличить интервал хранения binlog](#binlog-retention-interval).

### 1. Включите бинарное журналирование с помощью автоматического резервного копирования \{#enable-binlog-logging\}

Функция автоматического резервного копирования определяет, включено ли бинарное журналирование для MySQL. Автоматическое резервное копирование можно настроить для вашего экземпляра в консоли RDS, перейдя в **Modify** > **Additional configuration** > **Backup** и установив флажок **Enable automated backups** (если он ещё не установлен).

<Image img={rds_backups} alt="Включение автоматического резервного копирования в Aurora" size="lg" border/>

Рекомендуется задать для параметра **Backup retention period** достаточно большое значение, в зависимости от сценария использования репликации.

### 2. Увеличьте интервал хранения binlog \{#binlog-retention-interval\}

:::warning
Если ClickPipes попытается возобновить репликацию, а нужные файлы binlog будут удалены из‑за настроенного интервала их хранения, ClickPipe перейдет в аварийное состояние и потребуется повторная синхронизация.
:::

По умолчанию Aurora MySQL очищает двоичный журнал как можно скорее (то есть использует *lazy purging* — «ленивое удаление»). Рекомендуется увеличить интервал хранения binlog как минимум до **72 часов**, чтобы обеспечить доступность файлов двоичного журнала для репликации в случае сбоев. Чтобы задать интервал хранения двоичного журнала ([`binlog retention hours`](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration-usage-notes.binlog-retention-hours)), используйте процедуру [`mysql.rds_set_configuration`](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration):

[//]: # "NOTE Most CDC providers recommend the maximum retention period for Aurora RDS (7 days/168 hours). Since this has an impact on disk usage, we conservatively recommend a mininum of 3 days/72 hours."

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 72);
```

Если этот параметр не задан или установлен на слишком небольшой интервал, это может привести к разрывам в бинарных логах, что помешает ClickPipes корректно возобновлять репликацию.


## Настройка параметров binlog \{#binlog-settings\}

Группу параметров можно найти, щёлкнув по вашему экземпляру MySQL в консоли RDS, а затем перейдя на вкладку **Configuration**.

:::tip
Если у вас кластер MySQL, то приведённые ниже параметры можно найти в группе параметров [DB cluster](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html), а не в группе параметров экземпляра БД.
:::

<Image img={aurora_config} alt="Где найти группу параметров в Aurora" size="lg" border/>

<br/>

Щёлкните по ссылке группы параметров, чтобы перейти на её отдельную страницу. В правом верхнем углу вы должны увидеть кнопку **Edit**.

<Image img={edit_button} alt="Редактирование группы параметров" size="lg" border/>

<br/>

Следующие параметры необходимо задать следующим образом:

1. `binlog_format` — `ROW`.

<Image img={binlog_format} alt="Формат binlog — ROW" size="lg" border/>

2. `binlog_row_metadata` — `FULL`.

<Image img={binlog_row_metadata} alt="Метаданные строк binlog" size="lg" border/>

3. `binlog_row_image` — `FULL`.

<Image img={binlog_row_image} alt="Параметр binlog_row_image" size="lg" border/>

<br/>

Затем нажмите **Save Changes** в правом верхнем углу. Возможно, вам потребуется перезагрузить экземпляр, чтобы изменения вступили в силу — признаком этого будет надпись `Pending reboot` рядом со ссылкой на группу параметров на вкладке **Configuration** экземпляра Aurora.

## Включить режим GTID (рекомендуется) \{#gtid-mode\}

:::tip
MySQL ClickPipe также поддерживает репликацию без режима GTID. Однако включение режима GTID рекомендуется для повышения производительности и упрощения устранения неполадок.
:::

[Глобальные идентификаторы транзакций (GTID)](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html) — это уникальные идентификаторы, назначаемые каждой зафиксированной транзакции в MySQL. Они упрощают репликацию с использованием бинарного лога (binlog) и делают устранение неполадок более простым. Мы **рекомендуем** включить режим GTID, чтобы MySQL ClickPipe могла использовать репликацию на основе GTID.

Репликация на основе GTID поддерживается для Amazon Aurora MySQL v2 (MySQL 5.7) и v3 (MySQL 8.0), а также Aurora Serverless v2. Чтобы включить режим GTID для вашего экземпляра Aurora MySQL, выполните следующие шаги:

1. В консоли RDS нажмите на ваш экземпляр MySQL.
2. Перейдите на вкладку **Configuration**.
3. Нажмите на ссылку группы параметров (parameter group).
4. Нажмите кнопку **Edit** в правом верхнем углу.
5. Установите `enforce_gtid_consistency` в значение `ON`.
6. Установите `gtid-mode` в значение `ON`.
7. Нажмите **Save Changes** в правом верхнем углу.
8. Перезагрузите экземпляр, чтобы изменения вступили в силу.

<Image img={enable_gtid} alt="GTID включён" size="lg" border/>

## Настройка пользователя базы данных \{#configure-database-user\}

Подключитесь к экземпляру Aurora MySQL с правами администратора и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes:

    ```sql
    CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some-password';
    ```

2. Предоставьте права на схему. В следующем примере показаны права для базы данных `mysql`. Повторите эти команды для каждой базы данных и хоста, которые вы хотите реплицировать:

    ```sql
    GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
    ```

3. Предоставьте пользователю права на репликацию:

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

## Настройка сетевого доступа \{#configure-network-access\}

### Контроль доступа на основе IP-адресов \{#ip-based-access-control\}

Чтобы ограничить трафик к вашему экземпляру Aurora MySQL, добавьте [задокументированные статические IP-адреса NAT](../../index.md#list-of-static-ips) в раздел **Inbound rules** вашей группы безопасности Aurora.

<Image img={security_group_in_rds_mysql} alt="Где найти группу безопасности в Aurora MySQL" size="lg" border/>

<Image img={edit_inbound_rules} alt="Редактирование inbound rules для этой группы безопасности" size="lg" border/>

### Частный доступ через AWS PrivateLink \{#private-access-via-aws-privatelink\}

Чтобы подключиться к вашему экземпляру Aurora MySQL через частную сеть, вы можете использовать AWS PrivateLink. Воспользуйтесь [руководством по настройке AWS PrivateLink для ClickPipes](/knowledgebase/aws-privatelink-setup-for-clickpipes), чтобы настроить это подключение.

## Что дальше? \{#whats-next\}

Теперь, когда ваш экземпляр Amazon Aurora MySQL настроен для репликации с использованием binlog и безопасного подключения к ClickHouse Cloud, вы можете [создать свой первый MySQL ClickPipe](/integrations/clickpipes/mysql/#create-your-clickpipe). Ответы на распространённые вопросы о MySQL CDC см. в разделе [Частые вопросы по MySQL](/integrations/data-ingestion/clickpipes/mysql/faq.md).