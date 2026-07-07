---
sidebar_label: 'Omni'
slug: /integrations/omni
keywords: ['clickhouse', 'Omni', 'connect', 'integrate', 'ui']
description: 'Omni — корпоративная платформа для BI, приложений для работы с данными и встроенной аналитики, которая помогает анализировать данные и делиться выводами в реальном времени.'
title: 'Omni'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import omni_01 from '@site/static/images/integrations/data-visualization/omni_01.png';
import omni_02 from '@site/static/images/integrations/data-visualization/omni_02.png';
import PartnerBadge from '@theme/badges/PartnerBadge';

<PartnerBadge />

Omni может подключаться к ClickHouse Cloud или локально развернутому ClickHouse через официальный источник данных ClickHouse.

## 1. Соберите сведения о подключении \{#1-gather-your-connection-details\}

<ConnectionDetails />

## 2. Создайте источник данных ClickHouse \{#2-create-a-clickhouse-data-source\}

Перейдите в Admin -&gt; Connections и нажмите кнопку &quot;Add Connection&quot; в правом верхнем углу.

<Image size="lg" img={omni_01} alt="Интерфейс администратора Omni с кнопкой Add Connection в разделе Connections" border />

<br />

Выберите `ClickHouse`. Введите учетные данные в форму.

<Image size="lg" img={omni_02} alt="Интерфейс настройки подключения Omni для ClickHouse с полями формы для учетных данных" border />

<br />

Теперь вы сможете выполнять запросы к данным ClickHouse и визуализировать их в Omni.