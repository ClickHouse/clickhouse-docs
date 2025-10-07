---
'sidebar_label': 'Amazon RDS MySQL'
'description': '逐步指南，介绍如何将 Amazon RDS MySQL 设置为 ClickPipes 的源'
'slug': '/integrations/clickpipes/mysql/source/rds'
'title': 'RDS MySQL 源设置指南'
'doc_type': 'guide'
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


# Руководство по настройке источника RDS MySQL

В этом пошаговом руководстве показано, как настроить Amazon RDS MySQL для репликации данных в ClickHouse Cloud с помощью [MySQL ClickPipe](../index.md). Для общих вопросов по MySQL CDC смотрите [страницу часто задаваемых вопросов по MySQL](/integrations/data-ingestion/clickpipes/mysql/faq.md).

## Включение хранения бинарных логов {#enable-binlog-retention-rds}

Бинарный лог — это набор лог-файлов, содержащих информацию о модификациях данных, сделанных на экземпляре MySQL сервера, и бинарные лог-файлы необходимы для репликации. Чтобы настроить хранение бинарного лога в RDS MySQL, необходимо [включить бинарное логирование](#enable-binlog-logging) и [увеличить интервал хранения бинарного лога](#binlog-retention-interval).

### 1. Включите бинарное логирование через автоматическое резервное копирование {#enable-binlog-logging}

Функция автоматических резервных копий определяет, включено ли бинарное логирование для MySQL. Автоматические резервные копии можно настроить для вашего экземпляра в консоли RDS, перейдя в **Изменить** > **Дополнительная конфигурация** > **Резервное копирование** и выбрав флажок **Включить автоматические резервные копии** (если он еще не выбран).

<Image img={rds_backups} alt="Включение автоматических резервных копий в RDS" size="lg" border/>

Рекомендуем установить **Период хранения резервных копий** на разумно длительное значение, в зависимости от сценария использования репликации.

### 2. Увеличьте интервал хранения бинарного лога {#binlog-retention-interval}

:::warning
Если ClickPipes пытается возобновить репликацию, и необходимые бинарные лог-файлы были очищены из-за установленного значения хранения бинарного лога, ClickPipe перейдет в состояние ошибки, и потребуется повторная синхронизация.
:::

По умолчанию Amazon RDS очищает бинарный лог как можно быстрее (т.е. _ленивое очищение_). Рекомендуем увеличить интервал хранения бинарного лога как минимум до **72 часов**, чтобы обеспечить доступность бинарных лог-файлов для репликации в сценариях сбоев. Чтобы установить интервал хранения бинарного лога ([`binlog retention hours`](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration-usage-notes.binlog-retention-hours)), используйте процедуру [`mysql.rds_set_configuration`](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration):

[//]: # "ПРИМЕЧАНИЕ: большинство поставщиков CDC рекомендуют максимальный срок хранения для RDS (7 дней/168 часов). Поскольку это влияет на использование диска, мы консервативно рекомендуем минимум 3 дня/72 часа."

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 72);
```

Если эта конфигурация не установлена или установлена на низкий интервал, это может привести к пробелам в бинарных логах, что подорвет способность ClickPipes возобновить репликацию.

## Настройка параметров бинарного лога {#binlog-settings}

Группа параметров может быть найдена, когда вы нажимаете на ваш экземпляр MySQL в консоли RDS, а затем переходите на вкладку **Конфигурация**.

:::tip
Если у вас есть кластер MySQL, параметры ниже могут быть найдены в группе параметров [DB кластера](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html), а не в группе экземпляров БД.
:::

<Image img={rds_config} alt="Где найти группу параметров в RDS" size="lg" border/>

<br/>
Нажмите на ссылку группы параметров, которая переведет вас на ее страницу. Вы должны увидеть кнопку **Изменить** в верхнем правом углу.

<Image img={edit_button} alt="Изменить группу параметров" size="lg" border/>

Следующие параметры необходимо установить следующим образом:

1. `binlog_format` на `ROW`.

<Image img={binlog_format} alt="Формат бинарного лога на ROW" size="lg" border/>

2. `binlog_row_metadata` на `FULL`

<Image img={binlog_row_metadata} alt="Метаданные строк бинарного лога на FULL" size="lg" border/>

3. `binlog_row_image` на `FULL`

<Image img={binlog_row_image} alt="Изображение строки бинарного лога на FULL" size="lg" border/>

<br/>
Затем нажмите на **Сохранить изменения** в верхнем правом углу. Возможно, вам потребуется перезагрузить ваш экземпляр, чтобы изменения вступили в силу — признаком этого является наличие `Ожидает перезагрузку` рядом со ссылкой группы параметров на вкладке **Конфигурация** экземпляра RDS.

## Включите режим GTID {#gtid-mode}

:::tip
MySQL ClickPipe также поддерживает репликацию без режима GTID. Однако рекомендуется включить режим GTID для повышения производительности и упрощения устранения неполадок.
:::

[Глобальные идентификаторы транзакций (GTID)](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html) — это уникальные идентификаторы, присваиваемые каждой завершенной транзакции в MySQL. Они упрощают репликацию бинарного лога и делают устранение неполадок более простым. Мы **рекомендуем** включить режим GTID, чтобы MySQL ClickPipe мог использовать репликацию на основе GTID.

Репликация на основе GTID поддерживается для Amazon RDS для MySQL версий 5.7, 8.0 и 8.4. Чтобы включить режим GTID для вашего экземпляра Aurora MySQL, выполните следующие шаги:

1. В консоли RDS нажмите на ваш экземпляр MySQL.
2. Перейдите на вкладку **Конфигурация**.
3. Нажмите на ссылку группы параметров.
4. Нажмите на кнопку **Изменить** в верхнем правом углу.
5. Установите `enforce_gtid_consistency` в `ON`.
6. Установите `gtid-mode` в `ON`.
7. Нажмите на **Сохранить изменения** в верхнем правом углу.
8. Перезагрузите ваш экземпляр, чтобы изменения вступили в силу.

<Image img={enable_gtid} alt="Режим GTID включен" size="lg" border/>

<br/>
:::tip
MySQL ClickPipe также поддерживает репликацию без режима GTID. Однако рекомендуется включить режим GTID для повышения производительности и упрощения устранения неполадок.
:::

## Настройка пользователя базы данных {#configure-database-user}

Подключитесь к вашему экземпляру RDS MySQL как администратор и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes:

```sql
CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
```

2. Предоставьте права на схему. Пример ниже показывает права для базы данных `mysql`. Повторите эти команды для каждой базы данных и хоста, которые вы хотите реплицировать:

```sql
GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
```

3. Предоставьте пользователю права на репликацию:

```sql
GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
```

## Настройка сетевого доступа {#configure-network-access}

### Контроль доступа на основе IP адресов {#ip-based-access-control}

Чтобы ограничить трафик к вашему экземпляру Aurora MySQL, добавьте [записанные статические NAT IP адреса](../../index.md#list-of-static-ips) в **Правила входящего трафика** вашей группы безопасности RDS.

<Image img={security_group_in_rds_mysql} alt="Где найти группу безопасности в RDS MySQL?" size="lg" border/>

<Image img={edit_inbound_rules} alt="Изменить правила входящего трафика для вышеуказанной группы безопасности" size="lg" border/>

### Частный доступ через AWS PrivateLink {#private-access-via-aws-privatelink}

Чтобы подключиться к вашему экземпляру RDS через частную сеть, вы можете использовать AWS PrivateLink. Следуйте [руководству по настройке AWS PrivateLink для ClickPipes](/knowledgebase/aws-privatelink-setup-for-clickpipes), чтобы настроить соединение.

## Следующие шаги {#next-steps}

Теперь, когда ваш экземпляр Amazon RDS MySQL настроен для репликации бинарного лога и безопасного подключения к ClickHouse Cloud, вы можете [создать ваш первый MySQL ClickPipe](/integrations/clickpipes/mysql/#create-your-clickpipe). Для общих вопросов по MySQL CDC смотрите [страницу часто задаваемых вопросов по MySQL](/integrations/data-ingestion/clickpipes/mysql/faq.md).
