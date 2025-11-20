---
sidebar_label: 'Luzmo'
slug: /integrations/luzmo
keywords: ['clickhouse', 'Luzmo', 'connect', 'integrate', 'ui', 'embedded']
description: 'Luzmo — это платформа встроенной аналитики с нативной интеграцией с ClickHouse, специально разработанная для программных продуктов и SaaS‑приложений.'
title: 'Интеграция Luzmo с ClickHouse'
sidebar: 'integrations'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import luzmo_01 from '@site/static/images/integrations/data-visualization/luzmo_01.png';
import luzmo_02 from '@site/static/images/integrations/data-visualization/luzmo_02.png';
import luzmo_03 from '@site/static/images/integrations/data-visualization/luzmo_03.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Интеграция Luzmo с ClickHouse

<CommunityMaintainedBadge/>



## 1. Настройка подключения к ClickHouse {#1-setup-a-clickhouse-connection}

Чтобы установить подключение к ClickHouse, перейдите на страницу **Connections**, выберите **New Connection**, затем выберите ClickHouse в модальном окне New Connection.

<Image
  img={luzmo_01}
  size='md'
  alt='Интерфейс Luzmo с диалоговым окном Create a New Connection и выбранным ClickHouse'
  border
/>

Вам потребуется указать **host**, **username** и **password**:

<Image
  img={luzmo_02}
  size='md'
  alt='Форма настройки подключения Luzmo с полями для хоста ClickHouse, имени пользователя и пароля'
  border
/>

- **Host**: хост, на котором развёрнута ваша база данных ClickHouse. Обратите внимание, что для безопасной передачи данных разрешён только протокол `https`. Структура URL хоста должна быть следующей: `https://url-to-clickhouse-db:port/database`
  По умолчанию плагин подключается к базе данных 'default' и порту 443. Указав имя базы данных после '/', вы можете выбрать, к какой базе данных подключаться.
- **Username**: имя пользователя для подключения к вашему кластеру ClickHouse.
- **Password**: пароль для подключения к вашему кластеру ClickHouse.

Обратитесь к примерам в нашей документации для разработчиков, чтобы узнать, как [создать подключение к ClickHouse](https://developer.luzmo.com/api/createAccount?exampleSection=AccountCreateClickhouseRequestBody) через наш API.


## 2. Добавление наборов данных {#2-add-datasets}

После подключения ClickHouse вы можете добавить наборы данных, как описано [здесь](https://academy.luzmo.com/article/ldx3iltg). Вы можете выбрать один или несколько наборов данных, доступных в вашем ClickHouse, и [связать](https://academy.luzmo.com/article/gkrx48x5) их в Luzmo, чтобы обеспечить возможность их совместного использования в дашборде. Также обязательно ознакомьтесь со статьей [Подготовка данных для аналитики](https://academy.luzmo.com/article/u492qov0).

Чтобы узнать, как добавить наборы данных с помощью API, обратитесь к [этому примеру в документации для разработчиков](https://developer.luzmo.com/api/createDataprovider?exampleSection=DataproviderCreateClickhouseRequestBody).

Теперь вы можете использовать свои наборы данных для создания красивых (встраиваемых) дашбордов или даже для работы AI-аналитика данных ([Luzmo IQ](https://luzmo.com/iq)), который может отвечать на вопросы ваших клиентов.

<Image
  img={luzmo_03}
  size='md'
  alt='Пример дашборда Luzmo с несколькими визуализациями данных из ClickHouse'
  border
/>


## Примечания по использованию {#usage-notes}

1. Коннектор Luzmo для ClickHouse использует интерфейс HTTP API (обычно работает на порту 8123) для подключения.
2. Если вы используете таблицы с движком `Distributed`, некоторые графики Luzmo могут не работать при значении `distributed_product_mode` равном `deny`. Однако это происходит только в том случае, если вы связываете таблицу с другой таблицей и используете эту связь в графике. В таком случае убедитесь, что установили для `distributed_product_mode` другое значение, подходящее для вашего кластера ClickHouse. Если вы используете ClickHouse Cloud, можете не обращать внимания на эту настройку.
3. Чтобы гарантировать, что только приложение Luzmo (например) может получить доступ к вашему экземпляру ClickHouse, настоятельно рекомендуется **добавить в белый список** [диапазон статических IP-адресов Luzmo](https://academy.luzmo.com/article/u9on8gbm). Также рекомендуется использовать технического пользователя с правами только на чтение.
4. Коннектор ClickHouse в настоящее время поддерживает следующие типы данных:

   | Тип ClickHouse | Тип Luzmo |
   | -------------- | --------- |
   | UInt            | numeric    |
   | Int             | numeric    |
   | Float           | numeric    |
   | Decimal         | numeric    |
   | Date            | datetime   |
   | DateTime        | datetime   |
   | String          | hierarchy  |
   | Enum            | hierarchy  |
   | FixedString     | hierarchy  |
   | UUID            | hierarchy  |
   | Bool            | hierarchy  |
