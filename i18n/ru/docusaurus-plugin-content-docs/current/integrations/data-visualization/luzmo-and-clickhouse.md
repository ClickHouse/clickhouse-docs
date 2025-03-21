---
sidebar_label: 'Luzmo'
slug: '/integrations/luzmo'
keywords: ['clickhouse', 'Luzmo', 'connect', 'integrate', 'ui', 'embedded']
description: 'Luzmo is an embedded analytics platform with a native ClickHouse integration, purpose-built for Software and SaaS applications.'
---
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import luzmo_01 from '@site/static/images/integrations/data-visualization/luzmo_01.png';
import luzmo_02 from '@site/static/images/integrations/data-visualization/luzmo_02.png';
import luzmo_03 from '@site/static/images/integrations/data-visualization/luzmo_03.png';


# Интеграция Luzmo с ClickHouse

## 1. Настройка подключения к ClickHouse {#1-setup-a-clickhouse-connection}

Чтобы подключиться к ClickHouse, перейдите на страницу **Подключения**, выберите **Новое подключение**, затем выберите ClickHouse в модальном окне Нового подключения.

<p>
  <img src={luzmo_01} class="image" alt="Создание соединения с ClickHouse" />
</p>

Вам будет предложено предоставить **хост**, **имя пользователя** и **пароль**:

<p>
  <img src={luzmo_02} class="image" alt="Введите детали подключения к ClickHouse" />
</p>

*   **Хост**: это хост, где ваша база данных ClickHouse доступна. Обратите внимание, что здесь разрешен только `https`, чтобы обеспечить безопасную передачу данных. Структура URL хоста ожидает: `https://url-to-clickhouse-db:port/database`. По умолчанию плагин будет подключаться к базе данных 'default' и порту 443. Указав базу данных после '/', вы можете настроить, к какой базе данных подключаться.
*   **Имя пользователя**: имя пользователя, которое будет использоваться для подключения к вашему кластеру ClickHouse.
*   **Пароль**: пароль для подключения к вашему кластеру ClickHouse.

Пожалуйста, обратитесь к примерам в нашей документации для разработчиков, чтобы узнать, как [создать соединение с ClickHouse](https://developer.luzmo.com/api/createAccount?exampleSection=AccountCreateClickhouseRequestBody) через наш API.

## 2. Добавление наборов данных {#2-add-datasets}

После того как вы подключили ClickHouse, вы можете добавлять наборы данных, как объяснено [здесь](https://academy.luzmo.com/article/ldx3iltg). Вы можете выбрать один или несколько наборов данных, доступных в вашем ClickHouse, и [связать](https://academy.luzmo.com/article/gkrx48x5) их в Luzmo, чтобы убедиться, что они могут использоваться вместе на дашборде. Также не забудьте ознакомиться с этой статьей о [Подготовке ваших данных для аналитики](https://academy.luzmo.com/article/u492qov0).

Чтобы узнать, как добавлять наборы данных с помощью нашего API, пожалуйста, обратитесь к [этому примеру в нашей документации для разработчиков](https://developer.luzmo.com/api/createDataprovider?exampleSection=DataproviderCreateClickhouseRequestBody).

Теперь вы можете использовать свои наборы данных для создания красивых (встраиваемых) дашбордов или даже для работы AI Аналитика Данных ([Luzmo IQ](https://luzmo.com/iq)), который может отвечать на вопросы ваших клиентов.

<p>
  <img src={luzmo_03} class="image" alt="Пример дашборда Luzmo" />
</p>

## Заметки по использованию {#usage-notes}

1. Коннектор Luzmo ClickHouse использует HTTP API интерфейс (обычно работающий на порту 8123) для подключения.
2. Если вы используете таблицы с движком таблиц `Distributed`, некоторые графики Luzmo могут не сработать, когда `distributed_product_mode` равен `deny`. Это должно произойти только в том случае, если вы связываете таблицу с другой таблицей и используете эту связь в графике. В этом случае убедитесь, что вы установили `distributed_product_mode` на другой вариант, который имеет смысл для вас в вашем кластере ClickHouse. Если вы используете ClickHouse Cloud, вы можете безопасно игнорировать эту настройку.
3. Чтобы гарантировать, что только приложение Luzmo может получить доступ к вашему экземпляру ClickHouse, настоятельно рекомендуется **в белый список** [диапазон статических IP-адресов Luzmo](https://academy.luzmo.com/article/u9on8gbm). Мы также рекомендуем использовать технического пользователя с правами только для чтения.
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
