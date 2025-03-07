---
sidebar_label: Omni
slug: /integrations/omni
keywords: ['clickhouse', 'Omni', 'connect', 'integrate', 'ui']
description: 'Omni — это корпоративная платформа для BI, приложений для данных и встроенной аналитики, которая помогает вам исследовать и делиться инсайтами в режиме реального времени.'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import omni_01 from '@site/static/images/integrations/data-visualization/omni_01.png';
import omni_02 from '@site/static/images/integrations/data-visualization/omni_02.png';


# Omni

Omni может подключаться к ClickHouse Cloud или развертыванию на-premise через официальный источник данных ClickHouse.

## 1. Соберите ваши данные для подключения {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. Создайте источник данных ClickHouse {#2-create-a-clickhouse-data-source}

Перейдите в Admin -> Connections и нажмите кнопку "Добавить подключение" в правом верхнем углу.

<img src={omni_01} class="image" alt="Добавление нового подключения" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

Выберите `ClickHouse`. Введите свои учетные данные в форму.

<img src={omni_02} class="image" alt="Указание ваших учетных данных" style={{width: '80%', 'background-color': 'transparent'}}/>
<br/>

Теперь вы можете выполнять запросы и визуализировать данные из ClickHouse в Omni.
