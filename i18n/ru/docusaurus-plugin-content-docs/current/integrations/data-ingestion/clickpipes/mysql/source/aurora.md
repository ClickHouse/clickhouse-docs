---
sidebar_label: 'Amazon Aurora MySQL'
description: 'Пошаговое руководство по настройке Amazon Aurora MySQL в качестве источника для ClickPipes'
slug: /integrations/clickpipes/mysql/source/aurora
title: 'Руководство по настройке источника Aurora MySQL'
---

import rds_backups from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/rds-backups.png';
import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import security_group_in_rds_mysql from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/security-group-in-rds-mysql.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import aurora_config from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/rds_config.png';
import binlog_format from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_format.png';
import binlog_row_image from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_image.png';
import binlog_row_metadata from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_metadata.png';
import edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/edit_button.png';
import enable_gtid from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/enable_gtid.png';
import Image from '@theme/IdealImage';


# Руководство по настройке источника Aurora MySQL

Это пошаговое руководство о том, как настроить ваш экземпляр Aurora MySQL для репликации его данных через MySQL ClickPipe.
<br/>
:::info
Мы также рекомендуем ознакомиться с часто задаваемыми вопросами по MySQL [здесь](/integrations/data-ingestion/clickpipes/mysql/faq.md). Страница с часто задаваемыми вопросами активно обновляется.
:::

## Включение хранения бинарных логов {#enable-binlog-retention-aurora}
Бинарный лог — это набор файлов логов, которые содержат информацию о модификациях данных, выполненных в экземпляре MySQL, и файлы бинарного лога необходимы для репликации. Необходимо выполнить оба следующих шага:

### 1. Включите бинарное логирование через автоматизированное резервное копирование {#enable-binlog-logging-aurora}
Функция автоматизированного резервного копирования определяет, включено ли бинарное логирование для MySQL. Это можно настроить в консоли AWS:

<Image img={rds_backups} alt="Включение автоматизированных резервных копий в Aurora" size="lg" border/>

Рекомендуется установить значение хранения резервных копий на разумно длинный срок в зависимости от сценария использования репликации.

### 2. Часы хранения бинарных логов {#binlog-retention-hours-aurora}
Следующая процедура должна быть вызвана, чтобы обеспечить доступность бинарных логов для репликации:

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```
Если эта конфигурация не установлена, Amazon RDS удаляет бинарные логи как можно скорее, что приводит к пробелам в бинарных логах.

## Настройка параметров бинарного лога в группе параметров {#binlog-parameter-group-aurora}

Группу параметров можно найти, щелкнув на вашем экземпляре MySQL в консоли RDS, а затем перейдя на вкладку `Конфигурации`.

<Image img={aurora_config} alt="Где найти группу параметров в RDS" size="lg" border/>

После нажатия на ссылку группы параметров вы будете перенаправлены на страницу для ее редактирования. Вы увидите кнопку Изменить в верхнем правом углу.

<Image img={edit_button} alt="Редактировать группу параметров" size="lg" border/>

Следующие параметры необходимо установить следующим образом:

1. `binlog_format` в `ROW`.

<Image img={binlog_format} alt="Формат бинарного лога ROW" size="lg" border/>

2. `binlog_row_metadata` в `FULL`

<Image img={binlog_row_metadata} alt="Метаданные строк бинарного лога" size="lg" border/>

3. `binlog_row_image` в `FULL`

<Image img={binlog_row_image} alt="Изображение строки бинарного лога" size="lg" border/>

Затем нажмите на `Сохранить изменения` в верхнем правом углу. Вам может потребоваться перезагрузить ваш экземпляр, чтобы изменения вступили в силу — признаком этого будет появление `Ожидается перезагрузка` рядом со ссылкой на группу параметров на вкладке Конфигурации экземпляра RDS.
<br/>
:::tip
Если у вас есть кластер MySQL, вышеуказанные параметры будут находиться в группе параметров [DB Cluster](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html), а не в группе экземпляра DB.
:::

## Включение режима GTID {#gtid-mode-aurora}
Глобальные идентификаторы транзакций (GTID) — это уникальные идентификаторы, присвоенные каждой зафиксированной транзакции в MySQL. Они упрощают репликацию бинарного лога и делают устранение неполадок более простым.

Если ваш экземпляр MySQL — это версия 5.7, 8.0 или 8.4, мы рекомендуем включить режим GTID, чтобы MySQL ClickPipe мог использовать репликацию GTID.

Чтобы включить режим GTID для вашего экземпляра MySQL, выполните следующие шаги:
1. В консоли RDS щелкните на вашем экземпляре MySQL.
2. Перейдите на вкладку `Конфигурации`.
3. Щелкните на ссылку группы параметров.
4. Нажмите на кнопку `Изменить` в правом верхнем углу.
5. Установите `enforce_gtid_consistency` в `ON`.
6. Установите `gtid-mode` в `ON`.
7. Нажмите `Сохранить изменения` в правом верхнем углу.
8. Перезагрузите ваш экземпляр, чтобы изменения вступили в силу.

<Image img={enable_gtid} alt="Режим GTID включен" size="lg" border/>

<br/>
:::info
MySQL ClickPipe также поддерживает репликацию без режима GTID. Однако включение режима GTID рекомендуется для повышения производительности и упрощения устранения неполадок.
:::

## Настройка пользователя базы данных {#configure-database-user-aurora}

Подключитесь к вашему экземпляру Aurora MySQL как пользователь администратор и выполните следующие команды:

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

## Настройка сетевого доступа {#configure-network-access}

### Контроль доступа на основе IP {#ip-based-access-control}

Если вы хотите ограничить трафик к вашему экземпляру Aurora, добавьте [документированные статические IP-адреса NAT](../../index.md#list-of-static-ips) в `Inbound rules` вашей группы безопасности Aurora, как показано ниже:

<Image img={security_group_in_rds_mysql} alt="Где найти группу безопасности в Aurora MySQL?" size="lg" border/>

<Image img={edit_inbound_rules} alt="Редактировать входящие правила для вышеуказанной группы безопасности" size="lg" border/>

### Частный доступ через AWS PrivateLink {#private-access-via-aws-privatelink}

Чтобы подключиться к вашему экземпляру Aurora через частную сеть, вы можете использовать AWS PrivateLink. Ознакомьтесь с нашим [руководством по настройке AWS PrivateLink для ClickPipes](/knowledgebase/aws-privatelink-setup-for-clickpipes), чтобы установить соединение.
