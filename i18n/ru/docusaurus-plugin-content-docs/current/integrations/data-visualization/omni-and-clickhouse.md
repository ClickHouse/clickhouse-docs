---
slug: '/integrations/omni'
sidebar_label: Omni
description: 'Omni является корпоративной платформой для бизнес-аналитики, data'
title: Omni
keywords: ['clickhouse', 'Omni', 'connect', 'integrate', 'ui']
doc_type: guide
---
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import omni_01 from '@site/static/images/integrations/data-visualization/omni_01.png';
import omni_02 from '@site/static/images/integrations/data-visualization/omni_02.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Omni

<CommunityMaintainedBadge/>

Omni может подключаться к ClickHouse Cloud или локальному развертыванию через официальный источник данных ClickHouse.

## 1. Соберите данные для подключения {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. Создайте источник данных ClickHouse {#2-create-a-clickhouse-data-source}

Перейдите в Админ -> Подключения и нажмите кнопку "Добавить подключение" в правом верхнем углу.

<Image size="lg" img={omni_01} alt="Интерфейс администратора Omni, показывающий кнопку Добавить подключение в разделе Подключения" border />
<br/>

Выберите `ClickHouse`. Введите свои учетные данные в форме.

<Image size="lg" img={omni_02} alt="Интерфейс настройки подключения Omni для ClickHouse, показывающий поля формы для ввода учетных данных" border />
<br/>

Теперь вы можете выполнять запросы и визуализировать данные из ClickHouse в Omni.