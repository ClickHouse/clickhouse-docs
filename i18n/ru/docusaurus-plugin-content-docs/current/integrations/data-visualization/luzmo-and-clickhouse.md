---
sidebar_label: 'Luzmo'
slug: /integrations/luzmo
keywords: ['clickhouse', 'Luzmo', 'connect', 'integrate', 'ui', 'embedded']
description: 'Luzmo - это платформа для встроенной аналитики с нативной интеграцией ClickHouse, специально разработанная для приложений Software и SaaS.'
title: 'Интеграция Luzmo с ClickHouse'
sidebar: 'integrations'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import luzmo_01 from '@site/static/images/integrations/data-visualization/luzmo_01.png';
import luzmo_02 from '@site/static/images/integrations/data-visualization/luzmo_02.png';
import luzmo_03 from '@site/static/images/integrations/data-visualization/luzmo_03.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Интеграция Luzmo с ClickHouse

<CommunityMaintainedBadge/>

## 1. Настройка соединения с ClickHouse {#1-setup-a-clickhouse-connection}

Чтобы установить соединение с ClickHouse, перейдите на страницу **Connections**, выберите **New Connection**, затем выберите ClickHouse в модальном окне New Connection.

<Image img={luzmo_01} size="md" alt="Интерфейс Luzmo показывает диалог создания нового соединения с выбранным ClickHouse" border />

Вас попросят указать **host**, **username** и **password**:

<Image img={luzmo_02} size="md" alt="Форма конфигурации соединения Luzmo, показывающая поля для хоста ClickHouse, имени пользователя и пароля" border />

*   **Host**: это хост, на котором доступна ваша база данных ClickHouse. Обратите внимание, что только `https` разрешен, чтобы обеспечить безопасную передачу данных. Структура URL хоста ожидает: `https://url-to-clickhouse-db:port/database`
    По умолчанию плагин подключается к базе данных 'default' и порту 443. Указав базу данных после '/', вы можете настроить, к какой базе данных подключиться.
*   **Username**: имя пользователя, которое будет использовано для подключения к вашему кластеру ClickHouse.
*   **Password**: пароль для подключения к вашему кластеру ClickHouse.

Пожалуйста, обратитесь к примерам в нашей документации для разработчиков, чтобы узнать, как [создать соединение с ClickHouse](https://developer.luzmo.com/api/createAccount?exampleSection=AccountCreateClickhouseRequestBody) через наш API.

## 2. Добавление наборов данных {#2-add-datasets}

После того как вы подключили ClickHouse, вы можете добавить наборы данных, как объясняется [здесь](https://academy.luzmo.com/article/ldx3iltg). Вы можете выбрать один или несколько наборов данных, доступных в вашем ClickHouse, и [связать](https://academy.luzmo.com/article/gkrx48x5) их в Luzmo, чтобы они могли использоваться вместе на панеле управления. Также не забудьте ознакомиться с этой статьей о [Подготовке ваших данных для аналитики](https://academy.luzmo.com/article/u492qov0).

Чтобы узнать, как добавлять наборы данных с помощью нашего API, пожалуйста, обратитесь к [этому примеру в нашей документации для разработчиков](https://developer.luzmo.com/api/createDataprovider?exampleSection=DataproviderCreateClickhouseRequestBody).

Теперь вы можете использовать ваши наборы данных для создания красивых (встраиваемых) панелей управления, или даже для создания AI Data Analyst ([Luzmo IQ](https://luzmo.com/iq)), который может отвечать на вопросы ваших клиентов.

<Image img={luzmo_03} size="md" alt="Пример панели управления Luzmo, показывающий несколько визуализаций данных из ClickHouse" border />

## Примечания по использованию {#usage-notes}

1. Коннектор Luzmo для ClickHouse использует HTTP API интерфейс (обычно работающий на порту 8123) для подключения.
2. Если вы используете таблицы с движком таблиц `Distributed`, некоторые диаграммы Luzmo могут не сработать, когда `distributed_product_mode` равен `deny`. Однако это должно происходить только в том случае, если вы связываете таблицу с другой таблицей и используете эту связь в диаграмме. В этом случае убедитесь, что вы установили `distributed_product_mode` на другой вариант, который имеет смысл для вас в вашем кластере ClickHouse. Если вы используете ClickHouse Cloud, вы можете безопасно игнорировать эту настройку.
3. Чтобы убедиться, что, например, только приложение Luzmo может получить доступ к вашему экземпляру ClickHouse, настоятельно рекомендуется **добавить в список разрешенных** [диапазон статических IP-адресов Luzmo](https://academy.luzmo.com/article/u9on8gbm). Мы также рекомендуем использовать технического пользователя с правами только для чтения.
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
