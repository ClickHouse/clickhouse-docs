---
sidebar_label: 'Omni'
slug: /integrations/omni
keywords: ['clickhouse', 'Omni', 'connect', 'integrate', 'ui']
description: 'Omni — это корпоративная платформа для BI, data-приложений и встроенной аналитики, которая помогает вам исследовать и делиться инсайтами в реальном времени.'
title: 'Omni'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import omni_01 from '@site/static/images/integrations/data-visualization/omni_01.png';
import omni_02 from '@site/static/images/integrations/data-visualization/omni_02.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Omni

<CommunityMaintainedBadge/>

Omni может подключаться к ClickHouse Cloud или локальному развертыванию через официальный источник данных ClickHouse.

## 1. Соберите информацию для подключения {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. Создайте источник данных ClickHouse {#2-create-a-clickhouse-data-source}

Перейдите в раздел Admin -> Connections и нажмите кнопку "Add Connection" в правом верхнем углу.

<Image size="lg" img={omni_01} alt="Интерфейс администратора Omni с кнопкой Добавить соединение в разделе Соединения" border />
<br/>

Выберите `ClickHouse`. Введите свои учетные данные в форме.

<Image size="lg" img={omni_02} alt="Интерфейс настройки соединения Omni для ClickHouse, показывающий поля для ввода учетных данных" border />
<br/>

Теперь вы можете запрашивать и визуализировать данные из ClickHouse в Omni.
