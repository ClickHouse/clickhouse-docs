---
sidebar_label: Splunk
slug: /integrations/audit-splunk
keywords: [clickhouse, Splunk, audit, cloud]
description: Храните журналы аудита ClickHouse Cloud в Splunk.
---

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



# Хранение журналов аудита ClickHouse Cloud в Splunk

[Splunk](https://www.splunk.com/) — это платформа для анализа и мониторинга данных.

Этот аддон позволяет пользователям сохранять [журналы аудита ClickHouse Cloud](/cloud/security/audit-logging) в Splunk. Он использует [ClickHouse Cloud API](/cloud/manage/api/api-overview) для загрузки журналов аудита.

Этот аддон содержит только модульный ввод, никаких дополнительных пользовательских интерфейсов не предусмотрено.


# Установка

## Для Splunk Enterprise {#for-splunk-enterprise}

Скачайте аддон для аудита ClickHouse Cloud для Splunk с [Splunkbase](https://splunkbase.splunk.com/app/7709).

<img src={splunk_001} className="image" alt="Скачать с Splunkbase" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

В Splunk Enterprise перейдите в Apps -> Manage. Затем нажмите на Установить приложение из файла.

<img src={splunk_002} className="image" alt="Управление приложениями" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Выберите архивированный файл, загруженный с Splunkbase, и нажмите на Загрузить.

<img src={splunk_003} className="image" alt="Управление приложениями" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Если все прошло хорошо, вы теперь должны видеть установленное приложение журналов аудита ClickHouse. Если нет, проверьте логи Splunkd на наличие ошибок.


# Конфигурация модульного ввода

Для настройки модульного ввода вам сначала потребуется информация из вашего развертывания ClickHouse Cloud:

- ID организации
- Ключ [API](/cloud/manage/openapi)

## Получение информации из ClickHouse Cloud {#getting-information-from-clickhouse-cloud}

Войдите в [консоль ClickHouse Cloud](https://console.clickhouse.cloud/).

Перейдите в вашу Организацию -> Детали организации. Там вы сможете скопировать ID организации.

<img src={splunk_004} className="image" alt="Управление приложениями" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Затем перейдите в API Keys в левом меню.

<img src={splunk_005} className="image" alt="Управление приложениями" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Создайте API ключ, дайте ему понятное имя и выберите права `Admin`. Нажмите на Генерировать API ключ.

<img src={splunk_006} className="image" alt="Управление приложениями" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Сохраните API ключ и секрет в надежном месте.

<img src={splunk_007} className="image" alt="Управление приложениями" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

## Настройка ввода данных в Splunk {#configure-data-input-in-splunk}

Вернувшись в Splunk, перейдите в Настройки -> Вводы данных.

<img src={splunk_008} className="image" alt="Управление приложениями" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Выберите ввод данных журналов аудита ClickHouse Cloud.

<img src={splunk_009} className="image" alt="Управление приложениями" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Нажмите "Новый", чтобы настроить новый экземпляр ввода данных.

<img src={splunk_010} className="image" alt="Управление приложениями" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

После ввода всей информации нажмите Далее.

<img src={splunk_011} className="image" alt="Управление приложениями" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Ввод настроен, вы можете начать просматривать журналы аудита.


# Использование

Модульный ввод хранит данные в Splunk. Чтобы просмотреть данные, вы можете использовать общий вид поиска в Splunk.

<img src={splunk_012} className="image" alt="Управление приложениями" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>
