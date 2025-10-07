---
'sidebar_label': 'Luzmo'
'slug': '/integrations/luzmo'
'keywords':
- 'clickhouse'
- 'Luzmo'
- 'connect'
- 'integrate'
- 'ui'
- 'embedded'
'description': 'Luzmo - это встроенная платформа аналитики с нативной интеграцией
  ClickHouse, специально созданная для программного обеспечения и SaaS-приложений.'
'title': 'Интеграция Luzmo с ClickHouse'
'sidebar': 'integrations'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import luzmo_01 from '@site/static/images/integrations/data-visualization/luzmo_01.png';
import luzmo_02 from '@site/static/images/integrations/data-visualization/luzmo_02.png';
import luzmo_03 from '@site/static/images/integrations/data-visualization/luzmo_03.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Интеграция Luzmo с ClickHouse

<CommunityMaintainedBadge/>

## 1. Настройка подключения к ClickHouse {#1-setup-a-clickhouse-connection}

Чтобы установить соединение с ClickHouse, перейдите на страницу **Подключения**, выберите **Новое подключение**, затем выберите ClickHouse в модальном окне Нового подключения.

<Image img={luzmo_01} size="md" alt="Интерфейс Luzmo, показывающий диалог создания нового подключения с выбранным ClickHouse" border />

Вам будет предложено предоставить **хост**, **имя пользователя** и **пароль**:

<Image img={luzmo_02} size="md" alt="Форма конфигурации подключения Luzmo, показывающая поля для хоста ClickHouse, имени пользователя и пароля" border />

*   **Хост**: это хост, где ваша база данных ClickHouse доступна. Обратите внимание, что здесь разрешен только `https`, чтобы безопасно передавать данные по сети. Структура URL хоста ожидает: `https://url-to-clickhouse-db:port/database`
    По умолчанию, плагин будет подключаться к базе данных 'default' и порту 443. Указав базу данных после '/', вы можете настроить, к какой базе данных подключаться.
*   **Имя пользователя**: имя пользователя, которое будет использоваться для подключения к вашему кластеру ClickHouse.
*   **Пароль**: пароль для подключения к вашему кластеру ClickHouse.

Пожалуйста, ознакомьтесь с примерами в нашей документации для разработчиков, чтобы узнать, как [создать подключение к ClickHouse](https://developer.luzmo.com/api/createAccount?exampleSection=AccountCreateClickhouseRequestBody) через наш API.

## 2. Добавление наборов данных {#2-add-datasets}

После подключения к вашему ClickHouse вы можете добавить наборы данных, как объяснено [здесь](https://academy.luzmo.com/article/ldx3iltg). Вы можете выбрать один или несколько наборов данных, доступных в вашем ClickHouse, и [связать](https://academy.luzmo.com/article/gkrx48x5) их в Luzmo, чтобы обеспечить возможность их совместного использования на панели мониторинга. Также не забудьте ознакомиться с этой статьей о [Подготовке ваших данных для аналитики](https://academy.luzmo.com/article/u492qov0).

Чтобы узнать, как добавить наборы данных, используя наш API, пожалуйста, обратитесь к [этому примеру в нашей документации для разработчиков](https://developer.luzmo.com/api/createDataprovider?exampleSection=DataproviderCreateClickhouseRequestBody).

Теперь вы можете использовать ваши наборы данных для создания красивых (встраиваемых) панелей мониторинга или даже для работы с AI Data Analyst ([Luzmo IQ](https://luzmo.com/iq)), который может отвечать на вопросы ваших клиентов.

<Image img={luzmo_03} size="md" alt="Пример панели мониторинга Luzmo, показывающий несколько визуализаций данных из ClickHouse" border />

## Примечания по использованию {#usage-notes}

1. Коннектор Luzmo для ClickHouse использует интерфейс HTTP API (обычно работающий на порту 8123) для подключения.
2. Если вы используете таблицы с движком таблиц `Distributed`, некоторые графики Luzmo могут не работать, когда `distributed_product_mode` установлен в `deny`. Однако это должно происходить только в том случае, если вы связываете таблицу с другой таблицей и используете эту связь в графике. В этом случае убедитесь, что вы установили `distributed_product_mode` на другой вариант, который имеет смысл для вас в вашем кластере ClickHouse. Если вы используете ClickHouse Cloud, вы можете безопасно игнорировать эту настройку.
3. Чтобы гарантировать, что, например, только приложение Luzmo может получить доступ к вашей инстанции ClickHouse, крайне рекомендуется **добавить в белый список** [диапазон статических IP-адресов Luzmo](https://academy.luzmo.com/article/u9on8gbm). Мы также рекомендуем использовать технического пользователя только для чтения.
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
