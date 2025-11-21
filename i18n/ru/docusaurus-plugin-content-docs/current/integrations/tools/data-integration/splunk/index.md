---
sidebar_label: 'Splunk'
slug: /integrations/audit-splunk
keywords: ['clickhouse', 'Splunk', 'audit', 'cloud']
description: 'Хранение журналов аудита ClickHouse Cloud в Splunk.'
title: 'Хранение журналов аудита ClickHouse Cloud в Splunk'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import splunk_001 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_001.png';
import splunk_002 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_002.png';
import splunk_003 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_003.png';
import splunk_004 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_004.png';
import splunk_005 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_005.png';
import splunk_006 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_006.png';
import splunk_007 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_007.png';
import splunk_008 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_008.png';
import splunk_009 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_009.png';
import splunk_010 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_010.png';
import splunk_011 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_011.png';
import splunk_012 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_012.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Сохранение журналов аудита ClickHouse Cloud в Splunk

<PartnerBadge/>

[Splunk](https://www.splunk.com/) — это платформа для аналитики и мониторинга данных.

Этот аддон позволяет сохранять [журналы аудита ClickHouse Cloud](/cloud/security/audit-logging) в Splunk. Он использует [ClickHouse Cloud API](/cloud/manage/api/api-overview) для загрузки журналов аудита.

Этот аддон содержит только модульный источник данных; никаких дополнительных элементов пользовательского интерфейса он не предоставляет.



# Установка



## Для Splunk Enterprise {#for-splunk-enterprise}

Скачайте дополнение ClickHouse Cloud Audit Add-on для Splunk с [Splunkbase](https://splunkbase.splunk.com/app/7709).

<Image
  img={splunk_001}
  size='lg'
  alt='Веб-сайт Splunkbase со страницей загрузки дополнения ClickHouse Cloud Audit Add-on для Splunk'
  border
/>

В Splunk Enterprise перейдите в раздел Apps -> Manage. Затем нажмите Install app from file.

<Image
  img={splunk_002}
  size='lg'
  alt='Интерфейс Splunk Enterprise со страницей управления приложениями и опцией Install app from file'
  border
/>

Выберите скачанный с Splunkbase архивный файл и нажмите Upload.

<Image
  img={splunk_003}
  size='lg'
  alt='Диалоговое окно установки приложения Splunk для загрузки дополнения ClickHouse'
  border
/>

Если всё прошло успешно, вы увидите установленное приложение ClickHouse Audit logs. В противном случае проверьте логи Splunkd на наличие ошибок.


# Конфигурация модульного ввода

Чтобы настроить модульный ввод, вам сначала потребуется информация о вашем развертывании ClickHouse Cloud:

- Идентификатор организации
- Администраторский [API-ключ](/cloud/manage/openapi)



## Получение информации из ClickHouse Cloud {#getting-information-from-clickhouse-cloud}

Войдите в [консоль ClickHouse Cloud](https://console.clickhouse.cloud/).

Перейдите в раздел Organization → Organization details. Там вы сможете скопировать идентификатор организации (Organization ID).

<Image
  img={splunk_004}
  size='lg'
  alt='Консоль ClickHouse Cloud со страницей сведений об организации и идентификатором организации'
  border
/>

Затем перейдите в раздел API Keys в меню слева.

<Image
  img={splunk_005}
  size='lg'
  alt='Консоль ClickHouse Cloud с разделом API Keys в левом навигационном меню'
  border
/>

Создайте API-ключ, укажите понятное имя и выберите привилегии `Admin`. Нажмите Generate API Key.

<Image
  img={splunk_006}
  size='lg'
  alt='Консоль ClickHouse Cloud с интерфейсом создания API-ключа и выбранными привилегиями Admin'
  border
/>

Сохраните API-ключ и секретный ключ в надёжном месте.

<Image
  img={splunk_007}
  size='lg'
  alt='Консоль ClickHouse Cloud с сгенерированным API-ключом и секретным ключом для сохранения'
  border
/>


## Настройка ввода данных в Splunk {#configure-data-input-in-splunk}

Вернитесь в Splunk и перейдите в раздел Settings -> Data inputs.

<Image
  img={splunk_008}
  size='lg'
  alt='Интерфейс Splunk с меню Settings и опцией Data inputs'
  border
/>

Выберите источник данных ClickHouse Cloud Audit Logs.

<Image
  img={splunk_009}
  size='lg'
  alt='Страница Data inputs в Splunk с опцией ClickHouse Cloud Audit Logs'
  border
/>

Нажмите «New» для настройки нового экземпляра источника данных.

<Image
  img={splunk_010}
  size='lg'
  alt='Интерфейс Splunk для настройки нового источника данных ClickHouse Cloud Audit Logs'
  border
/>

После ввода всей необходимой информации нажмите Next.

<Image
  img={splunk_011}
  size='lg'
  alt='Страница конфигурации Splunk с заполненными настройками источника данных ClickHouse'
  border
/>

Источник данных настроен, теперь можно приступить к просмотру журналов аудита.


# Использование

Модульный ввод сохраняет данные в Splunk. Чтобы просмотреть данные, вы можете использовать общий режим поиска в Splunk.

<Image img={splunk_012} size="lg" alt="Интерфейс поиска Splunk, отображающий данные журналов аудита ClickHouse" border />
