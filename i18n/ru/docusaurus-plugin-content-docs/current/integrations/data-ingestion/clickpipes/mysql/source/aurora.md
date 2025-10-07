---
slug: '/integrations/clickpipes/mysql/source/aurora'
sidebar_label: 'Amazon Aurora MySQL'
description: 'Пошаговое руководство, научит вас, как установить Amazon Aurora MySQL'
title: 'Руководство по настройке источника Aurora MySQL'
doc_type: guide
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

Это пошаговое руководство показывает, как настроить Amazon Aurora MySQL для репликации данных в ClickHouse Cloud с использованием [MySQL ClickPipe](../index.md). Для общих вопросов по MySQL CDC смотрите [страницу часто задаваемых вопросов MySQL](/integrations/data-ingestion/clickpipes/mysql/faq.md).

## Включите удержание двоичного журнала {#enable-binlog-retention-aurora}

Двоичный журнал - это набор файлов журналов, которые содержат информацию об изменениях данных, внесенных в экземпляр MySQL сервера, и файлы двоичного журнала необходимы для репликации. Чтобы настроить удержание двоичного журнала в Aurora MySQL, необходимо [включить двоичное логирование](#enable-binlog-logging) и [увеличить интервал удержания binlog](#binlog-retention-interval).

### 1. Включите двоичное логирование через автоматическое резервное копирование {#enable-binlog-logging}

Функция автоматического резервного копирования определяет, включено ли двоичное логирование для MySQL. Автоматические резервные копирования могут быть настроены для вашего экземпляра в консоли RDS, перейдя в **Изменить** > **Дополнительная конфигурация** > **Резервное копирование** и выбрав флажок **Включить автоматическое резервное копирование** (если он еще не выбран).

<Image img={rds_backups} alt="Включение автоматических резервных копий в Aurora" size="lg" border/>

Мы рекомендуем установить **Срок хранения резервных копий** на разумно длительное значение, в зависимости от сценария использования репликации.

### 2. Увеличьте интервал удержания binlog {#binlog-retention-interval}

:::warning
Если ClickPipes попытается возобновить репликацию, а необходимые файлы binlog были удалены из-за установленного значения удержания binlog, ClickPipe перейдет в состояние ошибки, и потребуется повторная синхронизация.
:::

По умолчанию Aurora MySQL очищает двоичный журнал как можно быстрее (т.е. _ленивая очистка_). Мы рекомендуем увеличить интервал удержания binlog до как минимум **72 часов**, чтобы обеспечить наличие файлов двоичного журнала для репликации в ситуациях отказа. Чтобы установить интервал удержания двоичного журнала ([`binlog retention hours`](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration-usage-notes.binlog-retention-hours)), используйте процедуру [`mysql.rds_set_configuration`](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration):

[//]: # "NOTE Большинство поставщиков CDC рекомендуют максимальный срок хранения для Aurora RDS (7 дней/168 часов). Поскольку это влияет на использование диска, мы осторожно рекомендуем минимум 3 дня/72 часа."

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 72);
```

Если эта конфигурация не задана или установлена на низкий интервал, это может привести к пробелам в двоичных журналах, что существенно уменьшит возможность ClickPipes возобновить репликацию.

## Настройте параметры binlog {#binlog-settings}

Группу параметров можно найти, когда вы щелкните на вашем экземпляре MySQL в консоли RDS, а затем перейдете на вкладку **Конфигурация**.

:::tip
Если у вас есть кластер MySQL, параметры ниже можно найти в группе параметров [DB cluster](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html), а не в группе параметров DB instance.
:::

<Image img={aurora_config} alt="Где найти группу параметров в Aurora" size="lg" border/>

<br/>
Щелкните по ссылке группы параметров, чтобы перейти на ее отдельную страницу. В правом верхнем углу вы должны увидеть кнопку **Изменить**.

<Image img={edit_button} alt="Изменить группу параметров" size="lg" border/>

<br/>
Следующие параметры должны быть установлены следующим образом:

1. `binlog_format` на `ROW`.

<Image img={binlog_format} alt="Формат binlog на ROW" size="lg" border/>

2. `binlog_row_metadata` на `FULL`.

<Image img={binlog_row_metadata} alt="Метаданные строки binlog" size="lg" border/>

3. `binlog_row_image` на `FULL`.

<Image img={binlog_row_image} alt="Изображение строки binlog" size="lg" border/>

<br/>
Затем нажмите **Сохранить изменения** в правом верхнем углу. Вам может понадобиться перезагрузить экземпляр, чтобы изменения вступили в силу — один из способов узнать это, если вы видите `Pending reboot` рядом со ссылкой на группу параметров на вкладке **Конфигурация** экземпляра Aurora.

## Включите режим GTID (рекомендуется) {#gtid-mode}

:::tip
MySQL ClickPipe также поддерживает репликацию без режима GTID. Тем не менее, включение режима GTID рекомендуется для лучшей производительности и более легкой отладки.
:::

[Глобальные Идентификаторы Транзакций (GTID)](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html) - это уникальные идентификаторы, присваиваемые каждой завершенной транзакции в MySQL. Они упрощают репликацию binlog и делают отладку более простой. Мы **рекомендуем** включить режим GTID, чтобы MySQL ClickPipe мог использовать репликацию на основе GTID.

Репликация на основе GTID поддерживается для Amazon Aurora MySQL v2 (MySQL 5.7) и v3 (MySQL 8.0), а также для Aurora Serverless v2. Чтобы включить режим GTID для вашего экземпляра Aurora MySQL, выполните следующие шаги:

1. В консоли RDS нажмите на ваш экземпляр MySQL.
2. Нажмите на вкладку **Конфигурация**.
3. Щелкните по ссылке группы параметров.
4. Нажмите на кнопку **Изменить** в правом верхнем углу.
5. Установите `enforce_gtid_consistency` на `ON`.
6. Установите `gtid-mode` на `ON`.
7. Нажмите на **Сохранить изменения** в правом верхнем углу.
8. Перезагрузите ваш экземпляр, чтобы изменения вступили в силу.

<Image img={enable_gtid} alt="GTID включён" size="lg" border/>

## Настройте пользователя базы данных {#configure-database-user}

Подключитесь к вашему экземпляру Aurora MySQL как администратор и выполните следующие команды:

1. Создайте выделенного пользователя для ClickPipes:

```sql
CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some-password';
```

2. Предоставьте права на схему. Следующий пример показывает права для базы данных `mysql`. Повторите эти команды для каждой базы данных и хоста, которые вы хотите реплицировать:

```sql
GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
```

3. Предоставьте права на репликацию пользователю:

```sql
GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
```

## Настройте сетевой доступ {#configure-network-access}

### Контроль доступа на основе IP {#ip-based-access-control}

Чтобы ограничить трафик к вашему экземпляру Aurora MySQL, добавьте [документированные статические NAT IP-адреса](../../index.md#list-of-static-ips) в **Входящие правила** вашей группы безопасности Aurora.

<Image img={security_group_in_rds_mysql} alt="Где найти группу безопасности в Aurora MySQL?" size="lg" border/>

<Image img={edit_inbound_rules} alt="Редактировать входящие правила для вышеуказанной группы безопасности" size="lg" border/>

### Частный доступ через AWS PrivateLink {#private-access-via-aws-privatelink}

Чтобы подключиться к вашему экземпляру Aurora MySQL через частную сеть, вы можете использовать AWS PrivateLink. Следуйте руководству по [настройке AWS PrivateLink для ClickPipes](/knowledgebase/aws-privatelink-setup-for-clickpipes), чтобы установить соединение.

## Что дальше? {#whats-next}

Теперь, когда ваш экземпляр Amazon Aurora MySQL настроен для репликации binlog и безопасно подключен к ClickHouse Cloud, вы можете [создать ваш первый MySQL ClickPipe](/integrations/clickpipes/mysql/#create-your-clickpipe). Для общих вопросов по MySQL CDC смотрите [страницу часто задаваемых вопросов MySQL](/integrations/data-ingestion/clickpipes/mysql/faq.md).