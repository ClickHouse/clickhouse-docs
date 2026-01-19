---
sidebar_label: 'Luzmo'
slug: /integrations/luzmo
keywords: ['clickhouse', 'Luzmo', 'подключение', 'интеграция', 'ui', 'встраиваемая']
description: 'Luzmo — это платформа встраиваемой аналитики с нативной интеграцией с ClickHouse, специально разработанная для программных продуктов и SaaS‑приложений.'
title: 'Интеграция Luzmo с ClickHouse'
sidebar: 'integrations'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import luzmo_01 from '@site/static/images/integrations/data-visualization/luzmo_01.png';
import luzmo_02 from '@site/static/images/integrations/data-visualization/luzmo_02.png';
import luzmo_03 from '@site/static/images/integrations/data-visualization/luzmo_03.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Интеграция Luzmo и ClickHouse \{#integrating-luzmo-with-clickhouse\}

<CommunityMaintainedBadge/>

## 1. Настройка подключения к ClickHouse \{#1-setup-a-clickhouse-connection\}

Чтобы создать подключение к ClickHouse, перейдите на страницу **Connections**, выберите **New Connection**, затем выберите ClickHouse в диалоговом окне New Connection.

<Image img={luzmo_01} size="md" alt="Интерфейс Luzmo с открытым диалоговым окном Create a New Connection и выбранным ClickHouse" border />

Вам будет предложено указать **host**, **username** и **password**:

<Image img={luzmo_02} size="md" alt="Форма настройки подключения Luzmo с полями для ClickHouse host, username и password" border />

*   **Host**: хост, на котором доступна ваша база данных ClickHouse. Обратите внимание, что здесь разрешён только `https`, чтобы обеспечить безопасную передачу данных по сети. Структура URL-адреса хоста должна быть следующей: `https://url-to-clickhouse-db:port/database`
    По умолчанию плагин будет подключаться к базе данных `default` и к порту 443. Указав базу данных после символа `/`, вы можете задать, к какой базе данных подключаться.
*   **Username**: имя пользователя, которое будет использоваться для подключения к вашему кластеру ClickHouse.
*   **Password**: пароль для подключения к вашему кластеру ClickHouse.

Обратитесь к примерам в нашей документации для разработчиков, чтобы узнать, как [создать подключение к ClickHouse](https://developer.luzmo.com/api/createAccount?exampleSection=AccountCreateClickhouseRequestBody) через наш API.

## 2. Добавьте наборы данных \{#2-add-datasets\}

После подключения ClickHouse вы можете добавить наборы данных, как описано [здесь](https://academy.luzmo.com/article/ldx3iltg). Вы можете выбрать один или несколько наборов данных, доступных в вашем ClickHouse, и [связать](https://academy.luzmo.com/article/gkrx48x5) их в Luzmo, чтобы их можно было использовать вместе в одном дашборде. Также рекомендуем ознакомиться со статьёй [Подготовка данных к аналитике](https://academy.luzmo.com/article/u492qov0).

Чтобы узнать, как добавлять наборы данных с помощью нашего API, обратитесь к [этому примеру в документации для разработчиков](https://developer.luzmo.com/api/createDataprovider?exampleSection=DataproviderCreateClickhouseRequestBody).

Теперь вы можете использовать свои наборы данных для создания красивых (встраиваемых) дашбордов или даже для работы ИИ-аналитика данных ([Luzmo IQ](https://luzmo.com/iq)), который сможет отвечать на вопросы ваших клиентов.

<Image img={luzmo_03} size="md" alt="Пример дашборда Luzmo, показывающего несколько визуализаций данных из ClickHouse" border />

## Примечания по использованию \{#usage-notes\}

1. Коннектор Luzmo для ClickHouse использует HTTP‑интерфейс API (как правило, доступный на порту 8123) для подключения.
2. Если вы используете таблицы с движком таблицы `Distributed`, некоторые диаграммы Luzmo могут завершаться с ошибкой, когда `distributed_product_mode` имеет значение `deny`. Однако это должно происходить только в том случае, если вы связываете таблицу с другой таблицей и используете эту связь в диаграмме. В таком случае убедитесь, что вы задали для `distributed_product_mode` другой режим, который подходит для вашего кластера ClickHouse. Если вы используете ClickHouse Cloud, вы можете спокойно игнорировать этот параметр.
3. Чтобы, например, только приложение Luzmo могло получить доступ к вашему экземпляру ClickHouse, настоятельно рекомендуется **внести в белый список** [диапазон статических IP-адресов Luzmo](https://academy.luzmo.com/article/u9on8gbm). Мы также рекомендуем использовать техническую учётную запись с доступом только на чтение.
4. Коннектор ClickHouse в настоящее время поддерживает следующие типы данных:

    | Тип ClickHouse | Тип Luzmo |
    | --- | --- |
    | UInt | numeric |
    | Int | numeric |
    | Float | numeric |
    | Decimal | numeric |
    | Date | datetime |
    | DateTime | datetime |
    | String | hierarchy |
    | Enum | hierarchy |
    | FixedString | hierarchy |
    | UUID | hierarchy |
    | Bool | hierarchy |