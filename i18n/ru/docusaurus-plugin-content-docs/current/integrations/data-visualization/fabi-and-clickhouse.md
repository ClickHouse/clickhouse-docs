---
'sidebar_label': 'Fabi.ai'
'slug': '/integrations/fabi.ai'
'keywords':
- 'clickhouse'
- 'Fabi.ai'
- 'connect'
- 'integrate'
- 'notebook'
- 'ui'
- 'analytics'
'description': 'Fabi.ai является универсальной платформой для совместного анализа
  данных. Вы можете использовать SQL, Python, AI и no-code для создания дашбордов
  и рабочих процессов данных быстрее, чем когда-либо ранее.'
'title': 'Подключение ClickHouse к Fabi.ai'
'doc_type': 'guide'
---
import fabi_01 from '@site/static/images/integrations/data-visualization/fabi_01.png';
import fabi_02 from '@site/static/images/integrations/data-visualization/fabi_02.png';
import fabi_03 from '@site/static/images/integrations/data-visualization/fabi_03.png';
import fabi_04 from '@site/static/images/integrations/data-visualization/fabi_04.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# Подключение ClickHouse к Fabi.ai

<CommunityMaintainedBadge/>

<a href="https://www.fabi.ai/" target="_blank">Fabi.ai</a> — это все-в-одном платформа для совместного анализа данных. Вы можете использовать SQL, Python, AI и безкодовые технологии для быстрого создания панелей и рабочих процессов с данными. В сочетании с масштабируемостью и мощностью ClickHouse вы сможете создать и поделиться своей первой высокопроизводительной панелью на огромном наборе данных всего за несколько минут.

<Image size="md" img={fabi_01} alt="Платформа для исследования данных и рабочих процессов Fabi.ai" border />

## Соберите свои данные для подключения {#gather-your-connection-details}

<ConnectionDetails />

## Создайте учетную запись Fabi.ai и подключите ClickHouse {#connect-to-clickhouse}

Войдите или создайте свою учетную запись Fabi.ai: https://app.fabi.ai/

1. Вам будет предложено подключить вашу базу данных, когда вы впервые создадите свою учетную запись, или, если у вас уже есть учетная запись, щелкните на панели источников данных слева от любого Smartbook и выберите Добавить источник данных.

   <Image size="lg" img={fabi_02} alt="Добавить источник данных" border />

2. Затем вам будет предложено ввести ваши данные для подключения.

   <Image size="md" img={fabi_03} alt="Форма учетных данных ClickHouse" border />

3. Поздравляем! Вы только что интегрировали ClickHouse в Fabi.ai.

## Запросы к ClickHouse. {#querying-clickhouse}

После того как вы подключили Fabi.ai к ClickHouse, перейдите к любому [Smartbook](https://docs.fabi.ai/analysis_and_reporting/smartbooks) и создайте SQL ячейку. Если у вас подключен только один источник данных к вашей инстанции Fabi.ai, SQL ячейка автоматически будет настроена на ClickHouse, в противном случае вы можете выбрать источник для запроса из выпадающего списка источников.

   <Image size="lg" img={fabi_04} alt="Запрос к ClickHouse" border />

## Дополнительные ресурсы {#additional-resources}

[Документация Fabi.ai](https://www.fabi.ai): https://docs.fabi.ai/introduction

[Учебные видео Fabi.ai по началу работы](https://www.fabi.ai) : https://www.youtube.com/playlist?list=PLjxPRVnyBCQXxxByw2CLC0q7c-Aw6t2nl