---
sidebar_label: 'Amazon Aurora MySQL'
description: 'Пошаговое руководство по настройке Amazon Aurora MySQL как источника для ClickPipes'
slug: /integrations/clickpipes/mysql/source/aurora
title: 'Руководство по настройке источника Aurora MySQL'
doc_type: 'guide'
keywords: ['aurora mysql', 'clickpipes', 'binlog retention', 'gtid mode', 'aws']
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


# Руководство по настройке источника Aurora MySQL

В этом пошаговом руководстве описано, как настроить Amazon Aurora MySQL для репликации данных в ClickHouse Cloud с помощью [MySQL ClickPipe](../index.md). Ответы на распространённые вопросы по MySQL CDC смотрите на странице [MySQL FAQs](/integrations/data-ingestion/clickpipes/mysql/faq.md).



## Включение хранения бинарного журнала {#enable-binlog-retention-aurora}

Бинарный журнал — это набор файлов журналов, содержащих информацию об изменениях данных, внесённых в экземпляр сервера MySQL. Файлы бинарного журнала необходимы для репликации. Чтобы настроить хранение бинарного журнала в Aurora MySQL, необходимо [включить ведение бинарного журнала](#enable-binlog-logging) и [увеличить интервал хранения бинарного журнала](#binlog-retention-interval).

### 1. Включение ведения бинарного журнала через автоматическое резервное копирование {#enable-binlog-logging}

Функция автоматического резервного копирования определяет, включено или выключено ведение бинарного журнала для MySQL. Автоматическое резервное копирование можно настроить для вашего экземпляра в консоли RDS, перейдя в **Modify** > **Additional configuration** > **Backup** и установив флажок **Enable automated backups** (если он ещё не установлен).

<Image
  img={rds_backups}
  alt='Включение автоматического резервного копирования в Aurora'
  size='lg'
  border
/>

Рекомендуется установить для параметра **Backup retention period** достаточно большое значение в зависимости от сценария использования репликации.

### 2. Увеличение интервала хранения бинарного журнала {#binlog-retention-interval}

:::warning
Если ClickPipes попытается возобновить репликацию, а необходимые файлы бинарного журнала были удалены из-за настроенного значения хранения бинарного журнала, ClickPipe перейдёт в состояние ошибки и потребуется повторная синхронизация.
:::

По умолчанию Aurora MySQL удаляет бинарный журнал как можно скорее (т. е. _отложенная очистка_). Рекомендуется увеличить интервал хранения бинарного журнала как минимум до **72 часов**, чтобы обеспечить доступность файлов бинарного журнала для репликации в случае сбоев. Чтобы установить интервал хранения бинарного журнала ([`binlog retention hours`](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration-usage-notes.binlog-retention-hours)), используйте процедуру [`mysql.rds_set_configuration`](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration):

[//]: # "NOTE Most CDC providers recommend the maximum retention period for Aurora RDS (7 days/168 hours). Since this has an impact on disk usage, we conservatively recommend a mininum of 3 days/72 hours."

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 72);
```

Если эта конфигурация не установлена или установлена на низкий интервал, это может привести к пропускам в бинарных журналах, что нарушит способность ClickPipes возобновлять репликацию.


## Настройка параметров binlog {#binlog-settings}

Группу параметров можно найти, нажав на экземпляр MySQL в консоли RDS и перейдя на вкладку **Configuration**.

:::tip
Если у вас кластер MySQL, указанные ниже параметры находятся в группе параметров [кластера БД](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html), а не в группе параметров экземпляра БД.
:::

<Image
  img={aurora_config}
  alt='Где найти группу параметров в Aurora'
  size='lg'
  border
/>

<br />
Нажмите на ссылку группы параметров — откроется её страница. В правом верхнем углу должна быть кнопка **Edit**.

<Image img={edit_button} alt='Редактирование группы параметров' size='lg' border />

<br />
Установите следующие параметры:

1. `binlog_format` — значение `ROW`.

<Image img={binlog_format} alt='Формат binlog установлен в ROW' size='lg' border />

2. `binlog_row_metadata` — значение `FULL`.

<Image img={binlog_row_metadata} alt='Метаданные строк binlog' size='lg' border />

3. `binlog_row_image` — значение `FULL`.

<Image img={binlog_row_image} alt='Образ строк binlog' size='lg' border />

<br />
Затем нажмите **Save Changes** в правом верхнем углу. Для применения изменений может потребоваться перезагрузка экземпляра — об этом свидетельствует статус `Pending reboot` рядом со ссылкой на группу параметров на вкладке **Configuration** экземпляра Aurora.


## Включение режима GTID (рекомендуется) {#gtid-mode}

:::tip
MySQL ClickPipe также поддерживает репликацию без режима GTID. Однако для повышения производительности и упрощения диагностики рекомендуется включить режим GTID.
:::

[Глобальные идентификаторы транзакций (GTID)](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html) — это уникальные идентификаторы, присваиваемые каждой зафиксированной транзакции в MySQL. Они упрощают репликацию binlog и облегчают диагностику. Мы **рекомендуем** включить режим GTID, чтобы MySQL ClickPipe мог использовать репликацию на основе GTID.

Репликация на основе GTID поддерживается для Amazon Aurora MySQL v2 (MySQL 5.7) и v3 (MySQL 8.0), а также для Aurora Serverless v2. Чтобы включить режим GTID для вашего экземпляра Aurora MySQL, выполните следующие действия:

1. В консоли RDS выберите ваш экземпляр MySQL.
2. Перейдите на вкладку **Configuration**.
3. Нажмите на ссылку группы параметров.
4. Нажмите кнопку **Edit** в правом верхнем углу.
5. Установите для параметра `enforce_gtid_consistency` значение `ON`.
6. Установите для параметра `gtid-mode` значение `ON`.
7. Нажмите **Save Changes** в правом верхнем углу.
8. Перезагрузите экземпляр, чтобы изменения вступили в силу.

<Image img={enable_gtid} alt='GTID включен' size='lg' border />


## Настройка пользователя базы данных {#configure-database-user}

Подключитесь к экземпляру Aurora MySQL от имени администратора и выполните следующие команды:

1. Создайте выделенного пользователя для ClickPipes:

   ```sql
   CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some-password';
   ```

2. Предоставьте права доступа к схеме. В следующем примере показаны права для базы данных `mysql`. Повторите эти команды для каждой базы данных и хоста, которые требуется реплицировать:

   ```sql
   GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
   ```

3. Предоставьте пользователю права на репликацию:

   ```sql
   GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
   GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
   ```


## Настройка сетевого доступа {#configure-network-access}

### Контроль доступа по IP-адресам {#ip-based-access-control}

Чтобы ограничить трафик к экземпляру Aurora MySQL, добавьте [документированные статические NAT IP-адреса](../../index.md#list-of-static-ips) в **правила входящего трафика** группы безопасности Aurora.

<Image
  img={security_group_in_rds_mysql}
  alt='Где найти группу безопасности в Aurora MySQL?'
  size='lg'
  border
/>

<Image
  img={edit_inbound_rules}
  alt='Редактирование правил входящего трафика для группы безопасности'
  size='lg'
  border
/>

### Частный доступ через AWS PrivateLink {#private-access-via-aws-privatelink}

Для подключения к экземпляру Aurora MySQL через частную сеть используйте AWS PrivateLink. Следуйте [руководству по настройке AWS PrivateLink для ClickPipes](/knowledgebase/aws-privatelink-setup-for-clickpipes) для установки соединения.


## Что дальше? {#whats-next}

Теперь, когда ваш экземпляр Amazon Aurora MySQL настроен для репликации binlog и безопасно подключается к ClickHouse Cloud, вы можете [создать свой первый MySQL ClickPipe](/integrations/clickpipes/mysql/#create-your-clickpipe). Ответы на часто задаваемые вопросы о MySQL CDC см. на [странице FAQ по MySQL](/integrations/data-ingestion/clickpipes/mysql/faq.md).
