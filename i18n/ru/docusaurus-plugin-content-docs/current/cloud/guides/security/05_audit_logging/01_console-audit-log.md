---
sidebar_label: 'Журнал аудита консоли'
slug: /cloud/security/audit-logging/console-audit-log
title: 'Журнал аудита консоли'
description: 'На этой странице описано, как вы можете просматривать журнал аудита в облаке'
doc_type: 'guide'
keywords: ['журнал аудита']
---

import Image from '@theme/IdealImage';
import activity_log_1 from '@site/static/images/cloud/security/activity_log1.png';
import activity_log_2 from '@site/static/images/cloud/security/activity_log2.png';
import activity_log_3 from '@site/static/images/cloud/security/activity_log3.png';


# Журнал аудита консоли \{#console-audit-log\}

Действия в консоли записываются в журнал аудита. Если у вас есть роль администратора (Admin) или разработчика (Developer) в организации, вы можете просматривать этот журнал и интегрировать его с системами логирования.

## Доступ к журналу аудита консоли через пользовательский интерфейс \{#console-audit-log-ui\}

<VerticalStepper>

## Выбор организации \{#select-org\}

В ClickHouse Cloud перейдите к сведениям о вашей организации. 

<Image img={activity_log_1} size="md" alt="Вкладка активности ClickHouse Cloud" border />

<br/>

## Выбор журнала аудита \{#select-audit\}

Выберите вкладку **Audit** в левом меню, чтобы увидеть, какие изменения были внесены в вашу организацию ClickHouse Cloud, включая информацию о том, кто внес изменения и когда они произошли.

Страница **Activity** отображает таблицу со списком событий, зарегистрированных для вашей организации. По умолчанию этот список отсортирован в обратном хронологическом порядке (самое последнее событие находится вверху). Измените порядок в таблице, щелкнув по заголовкам столбцов. Каждый элемент таблицы содержит следующие поля:

- **Activity:** Краткое текстовое описание события
- **User:** Пользователь, инициировавший событие
- **IP Address:** Если применимо, здесь указывается IP-адрес пользователя, инициировавшего событие
- **Time:** Метка времени события

<Image img={activity_log_2} size="md" alt="Таблица активности ClickHouse Cloud" border />

<br/>

## Использование строки поиска \{#use-search-bar\}

Вы можете использовать строку поиска, чтобы отфильтровать события по определённым критериям, например, по имени сервиса или IP-адресу. Вы также можете экспортировать эту информацию в формате CSV для распространения или анализа во внешнем инструменте.

</VerticalStepper>

<div class="eighty-percent">
    <Image img={activity_log_3} size="lg" alt="Экспорт активности ClickHouse Cloud в CSV" border />
</div>

## Доступ к журналу аудита консоли через API \{#console-audit-log-api\}

Вы можете использовать конечную точку `activity` ClickHouse Cloud API для экспорта
событий аудита. Дополнительную информацию можно найти в [справочнике по API](https://clickhouse.com/docs/cloud/manage/api/swagger).

## Интеграции для логов \{#log-integrations\}

Пользователи могут использовать API для интеграции с выбранной ими платформой логирования. Поддерживаются следующие коннекторы «из коробки»:
- [ClickHouse Cloud Audit add-on для Splunk](/integrations/audit-splunk)