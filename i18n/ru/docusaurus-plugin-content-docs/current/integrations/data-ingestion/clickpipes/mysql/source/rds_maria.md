---
slug: '/integrations/clickpipes/mysql/source/rds_maria'
sidebar_label: 'Amazon RDS MariaDB'
description: 'Пошаговое руководство о том, как настроить Amazon RDS MariaDB в качестве'
title: 'Руководство по настройке источника RDS MariaDB'
doc_type: guide
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


# Руководство по настройке источника RDS MariaDB

Это пошаговое руководство о том, как настроить вашу инстанцию RDS MariaDB для репликации данных с помощью MySQL ClickPipe.
<br/>
:::info
Мы также рекомендуем ознакомиться с часто задаваемыми вопросами MySQL [здесь](/integrations/data-ingestion/clickpipes/mysql/faq.md). Страница с вопросами активно обновляется.
:::

## Включение хранения двоичного журнала {#enable-binlog-retention-rds}
Двоичный журнал — это набор файлов журнала, содержащих информацию о модификациях данных, внесённых в инстанцию MySQL. Файлы двоичного журнала необходимы для репликации. Необходимо выполнить оба следующих шага:

### 1. Включение двоичного логирования через автоматическое резервное копирование {#enable-binlog-logging-rds}

Функция автоматического резервного копирования определяет, включено ли двоичное логирование или отключено для MySQL. Это можно настроить в консоли AWS:

<Image img={rds_backups} alt="Включение автоматического резервного копирования в RDS" size="lg" border/>

Рекомендуется установить длительность хранения резервных копий на разумно длинный период в зависимости от сценария использования репликации.

### 2. Часы хранения двоичного журнала {#binlog-retention-hours-rds}
Amazon RDS для MariaDB имеет другой метод установки продолжительности хранения двоичного журнала, который определяет, как долго файл двоичного журнала с изменениями будет храниться. Если некоторые изменения не будут прочитаны до удаления файла двоичного журнала, репликация не сможет продолжаться. Значение по умолчанию для хранения двоичного журнала NULL, что означает, что двоичные журналы не хранятся.

Чтобы указать, на сколько часов хранить двоичные журналы на экземпляре БД, используйте функцию mysql.rds_set_configuration с периодом хранения двоичных журналов, достаточно длинным для выполнения репликации. Рекомендуемое минимальное значение — `24 часа`.

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```

## Настройка параметров двоичного журнала в группе параметров {#binlog-parameter-group-rds}

Группу параметров можно найти, нажав на вашу инстанцию MariaDB в консоли RDS, а затем перейдите на вкладку `Конфигурации`.

<Image img={rds_config} alt="Где найти группу параметров в RDS" size="lg" border/>

При нажатии на ссылку группы параметров вы перейдете на страницу ссылки группы параметров. В верхнем правом углу вы увидите кнопку «Редактировать»:

<Image img={edit_button} alt="Редактировать группу параметров" size="lg" border/>

Настройки `binlog_format`, `binlog_row_metadata` и `binlog_row_image` должны быть установлены следующим образом:

1. `binlog_format` на `ROW`.

<Image img={binlog_format} alt="Формат двоичного журнала на ROW" size="lg" border/>

2. `binlog_row_metadata` на `FULL`

<Image img={binlog_row_metadata} alt="Метаданные ряды двоичного журнала на FULL" size="lg" border/>

3. `binlog_row_image` на `FULL`

<Image img={binlog_row_image} alt="Изображение ряды двоичного журнала на FULL" size="lg" border/>

Затем нажмите кнопку `Сохранить изменения` в верхнем правом углу. Возможно, вам потребуется перезагрузить инстанцию для применения изменений. Если вы видите `Ожидает перезагрузки` рядом со ссылкой на группу параметров на вкладке Конфигурации инстанции RDS, это хороший признак того, что необходимо перезагрузить вашу инстанцию.

<br/>
:::tip
Если у вас есть кластер MariaDB, вышеуказанные параметры будут находиться в группе параметров [Кластера БД](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html), а не в группе параметров экземпляра БД.
:::

## Включение режима GTID {#gtid-mode-rds}
Глобальные идентификаторы транзакций (GTID) — это уникальные идентификаторы, присваиваемые каждой завершаемой транзакции в MySQL/MariaDB. Они упрощают репликацию двоичных журналов и делают устранение неполадок более простым. Режим GTID включён по умолчанию в MariaDB, поэтому никаких действий от пользователя не требуется для его использования.

## Настройка пользователя базы данных {#configure-database-user-rds}

Подключитесь к вашей инстанции RDS MariaDB как пользователь-администратор и выполните следующие команды:

1. Создайте специального пользователя для ClickPipes:

```sql
CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
```

2. Предоставьте разрешения схемы. Пример ниже показывает разрешения для базы данных `mysql`. Повторите эти команды для каждой базы данных и хоста, которые вы хотите реплицировать:

```sql
GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
```

3. Предоставьте пользователю разрешения на репликацию: