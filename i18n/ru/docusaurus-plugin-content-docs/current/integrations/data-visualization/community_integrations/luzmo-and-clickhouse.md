---
sidebar_label: 'Luzmo'
slug: /integrations/luzmo
keywords: ['clickhouse', 'Luzmo', 'connect', 'integrate', 'ui', 'embedded']
description: 'Luzmo — это платформа встраиваемой аналитики с нативной интеграцией с ClickHouse, специально созданная для ПО и SaaS‑приложений.'
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


# Интеграция Luzmo с ClickHouse \{#integrating-luzmo-with-clickhouse\}

<CommunityMaintainedBadge/>

## 1. Настройка подключения к ClickHouse \{#1-setup-a-clickhouse-connection\}

Чтобы создать подключение к ClickHouse, перейдите на страницу **Connections**, нажмите **New Connection**, затем выберите ClickHouse в модальном окне New Connection.

<Image img={luzmo_01} size="md" alt="Интерфейс Luzmo, показывающий диалоговое окно Create a New Connection с выбранным ClickHouse" border />

Вам будет предложено указать **host**, **username** и **password**:

<Image img={luzmo_02} size="md" alt="Форма конфигурации подключения Luzmo с полями для ClickHouse host, username и password" border />

*   **Host**: хост, по которому доступна ваша база данных ClickHouse. Обратите внимание, что здесь допускается только `https`, чтобы обеспечить безопасную передачу данных по сети. Структура URL хоста должна соответствовать формату: `https://url-to-clickhouse-db:port/database`
    По умолчанию плагин подключается к базе данных `default` и порту 443. Указав имя базы данных после символа `/`, вы можете настроить, к какой базе данных выполнять подключение.
*   **Username**: имя пользователя, которое будет использоваться для подключения к вашему кластеру ClickHouse.
*   **Password**: пароль, который будет использоваться для подключения к вашему кластеру ClickHouse.

Смотрите примеры в нашей документации для разработчиков, чтобы узнать, как [создать подключение к ClickHouse](https://developer.luzmo.com/api/createAccount?exampleSection=AccountCreateClickhouseRequestBody) через наш API.

## 2. Добавьте наборы данных \{#2-add-datasets\}

После подключения ClickHouse вы можете добавить наборы данных, как описано [здесь](https://academy.luzmo.com/article/ldx3iltg). Вы можете выбрать один или несколько наборов данных, доступных в вашем ClickHouse, и [связать](https://academy.luzmo.com/article/gkrx48x5) их в Luzmo, чтобы их можно было совместно использовать в одном дашборде. Также обязательно ознакомьтесь со статьёй о [подготовке данных к аналитике](https://academy.luzmo.com/article/u492qov0).

Чтобы узнать, как добавлять наборы данных с помощью нашего API, обратитесь к [этому примеру в нашей документации для разработчиков](https://developer.luzmo.com/api/createDataprovider?exampleSection=DataproviderCreateClickhouseRequestBody).

Теперь вы можете использовать наборы данных для создания красивых (встраиваемых) дашбордов или даже для работы AI‑аналитика данных ([Luzmo IQ](https://luzmo.com/iq)), который сможет отвечать на вопросы ваших клиентов.

<Image img={luzmo_03} size="md" alt="Пример дашборда Luzmo с несколькими визуализациями данных из ClickHouse" border />

## Примечания по использованию \{#usage-notes\}

1. Коннектор Luzmo к ClickHouse использует интерфейс HTTP API (обычно на порту 8123) для подключения.
2. Если вы используете таблицы с табличным движком `Distributed`, некоторые диаграммы Luzmo могут завершаться с ошибкой, когда для `distributed_product_mode` установлено значение `deny`. Однако это должно происходить только в том случае, если вы связываете таблицу с другой таблицей и используете эту связь в диаграмме. В таком случае убедитесь, что вы установили для `distributed_product_mode` другое значение, подходящее для вашего кластера ClickHouse. Если вы используете ClickHouse Cloud, этот параметр можно безопасно игнорировать.
3. Чтобы, например, только приложение Luzmo могло получать доступ к вашему экземпляру ClickHouse, настоятельно рекомендуется **добавить в список разрешённых** [диапазон статических IP-адресов Luzmo](https://academy.luzmo.com/article/u9on8gbm). Мы также рекомендуем использовать техническую учётную запись с правами только на чтение.
4. Коннектор ClickHouse в настоящее время поддерживает следующие типы данных:

    | ClickHouse Type | Luzmo Type |
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