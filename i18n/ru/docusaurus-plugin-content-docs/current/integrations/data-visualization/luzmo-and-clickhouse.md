---
sidebar_label: 'Luzmo'
slug: /integrations/luzmo
keywords: ['clickhouse', 'Luzmo', 'connect', 'integrate', 'ui', 'embedded']
description: 'Luzmo является встроенной платформой аналитики с нативной интеграцией ClickHouse, специально разработанной для программного обеспечения и SaaS приложений.'
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

## 1. Настройка подключения к ClickHouse {#1-setup-a-clickhouse-connection}

Чтобы установить соединение с ClickHouse, перейдите на **страницу подключений**, выберите **Новое соединение**, затем выберите ClickHouse в модальном окне Нового соединения.

<Image img={luzmo_01} size="md" alt="Интерфейс Luzmo, показывающий диалог Создание нового соединения с выбранным ClickHouse" border />

Вам будет предложено предоставить **хост**, **имя пользователя** и **пароль**:

<Image img={luzmo_02} size="md" alt="Форма конфигурации соединения Luzmo, показывающая поля для хоста ClickHouse, имени пользователя и пароля" border />

*   **Хост**: это хост, на котором ваша база данных ClickHouse доступна. Обратите внимание, что здесь разрешен только `https` для безопасной передачи данных. Структура URL хоста ожидает: `https://url-to-clickhouse-db:port/database`
    По умолчанию плагин будет подключаться к базе данных 'default' на 443 порту. Предоставив базу данных после '/', вы можете настроить, к какой базе данных подключиться.
*   **Имя пользователя**: имя пользователя, используемое для подключения к вашему кластеру ClickHouse.
*   **Пароль**: пароль для подключения к вашему кластеру ClickHouse.

Пожалуйста, обратитесь к примерам в нашей документации для разработчиков, чтобы узнать, как [создать соединение с ClickHouse](https://developer.luzmo.com/api/createAccount?exampleSection=AccountCreateClickhouseRequestBody) через наш API.

## 2. Добавление наборов данных {#2-add-datasets}

После того как вы подключили ClickHouse, вы можете добавлять наборы данных, как объясняется [здесь](https://academy.luzmo.com/article/ldx3iltg). Вы можете выбрать один или несколько наборов данных, доступных в вашем ClickHouse, и [связать](https://academy.luzmo.com/article/gkrx48x5) их в Luzmo, чтобы обеспечить возможность их совместного использования на дашборде. Также убедитесь, что ознакомились с этой статьей о [Подготовке ваших данных для аналитики](https://academy.luzmo.com/article/u492qov0).

Чтобы узнать, как добавлять наборы данных с использованием нашего API, пожалуйста, обратитесь к [этому примеру в нашей документации для разработчиков](https://developer.luzmo.com/api/createDataprovider?exampleSection=DataproviderCreateClickhouseRequestBody).

Теперь вы можете использовать свои наборы данных для создания красивых (встраиваемых) дашбордов или даже для работы с AI Data Analyst ([Luzmo IQ](https://luzmo.com/iq)), который может отвечать на вопросы ваших клиентов.

<Image img={luzmo_03} size="md" alt="Пример дашборда Luzmo с несколькими визуализациями данных из ClickHouse" border />

## Примечания по использованию {#usage-notes}

1. Коннектор Luzmo для ClickHouse использует HTTP API интерфейс (обычно работающий на порту 8123) для подключения.
2. Если вы используете таблицы с движком таблиц `Distributed`, некоторые графики Luzmo могут не работать, если `distributed_product_mode` установлен на `deny`. Это должно происходить только в том случае, если вы связываете таблицу с другой таблицей и используете эту связь в графике. В этом случае убедитесь, что вы установили `distributed_product_mode` на другой вариант, который имеет смысл для вас в вашем кластере ClickHouse. Если вы используете ClickHouse Cloud, вы можете безопасно игнорировать эту настройку.
3. Чтобы гарантировать, что, например, только приложение Luzmo может получить доступ к вашему экземпляру ClickHouse, настоятельно рекомендуется **добавить в белый список** [диапазон статических IP адресов Luzmo](https://academy.luzmo.com/article/u9on8gbm). Мы также рекомендуем использовать технического пользователя только для чтения.
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

