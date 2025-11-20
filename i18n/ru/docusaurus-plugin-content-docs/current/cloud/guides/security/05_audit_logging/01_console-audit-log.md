---
sidebar_label: 'Журнал аудита консоли'
slug: /cloud/security/audit-logging/console-audit-log
title: 'Журнал аудита консоли'
description: 'На этой странице описано, как пользователи могут просматривать журнал аудита в облаке'
doc_type: 'guide'
keywords: ['audit log']
---

import Image from '@theme/IdealImage';
import activity_log_1 from '@site/static/images/cloud/security/activity_log1.png';
import activity_log_2 from '@site/static/images/cloud/security/activity_log2.png';
import activity_log_3 from '@site/static/images/cloud/security/activity_log3.png';


# Журнал аудита консоли {#console-audit-log}

Действия пользователей в консоли регистрируются в журнале аудита, который доступен для просмотра и интеграции с системами логирования пользователям с организационной ролью Admin или Developer. Конкретные события, включаемые в журнал аудита консоли, приведены в


## Доступ к журналу консоли через пользовательский интерфейс {#console-audit-log-ui}

<VerticalStepper>


## Выбор организации {#select-org}

В ClickHouse Cloud перейдите к данным вашей организации.

<Image
  img={activity_log_1}
  size='md'
  alt='Вкладка активности ClickHouse Cloud'
  border
/>

<br />


## Выбор аудита {#select-audit}

Выберите вкладку **Audit** в левом меню, чтобы просмотреть изменения, внесенные в вашу организацию ClickHouse Cloud, включая информацию о том, кто и когда внес изменение.

Страница **Activity** отображает таблицу со списком событий, зарегистрированных в вашей организации. По умолчанию список отсортирован в обратном хронологическом порядке (самое последнее событие вверху). Чтобы изменить порядок сортировки таблицы, нажмите на заголовки столбцов. Каждая запись таблицы содержит следующие поля:

- **Activity:** Текстовое описание события
- **User:** Пользователь, инициировавший событие
- **IP Address:** Если применимо, в этом поле указывается IP-адрес пользователя, инициировавшего событие
- **Time:** Временная метка события

<Image
  img={activity_log_2}
  size='md'
  alt='Таблица активности ClickHouse Cloud'
  border
/>

<br />


## Использование строки поиска {#use-search-bar}

Вы можете использовать строку поиска для фильтрации событий по различным критериям, например, по имени сервиса или IP-адресу. Также вы можете экспортировать эту информацию в формате CSV для распространения или анализа во внешних инструментах.

</VerticalStepper>

<div class='eighty-percent'>
  <Image
    img={activity_log_3}
    size='lg'
    alt='Экспорт журнала активности ClickHouse Cloud в CSV'
    border
  />
</div>


## Доступ к журналу аудита консоли через API {#console-audit-log-api}

Для получения экспорта событий аудита можно использовать эндпоинт `activity` API ClickHouse Cloud. Подробная информация доступна в [справочнике API](https://clickhouse.com/docs/cloud/manage/api/swagger).


## Интеграции с системами логирования {#log-integrations}

Пользователи могут использовать API для интеграции с любой платформой логирования. Для следующих платформ доступны готовые коннекторы:

- [Дополнение ClickHouse Cloud Audit для Splunk](/integrations/audit-splunk)
