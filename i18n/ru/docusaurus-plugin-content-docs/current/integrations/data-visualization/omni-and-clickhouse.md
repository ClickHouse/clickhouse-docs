---
sidebar_label: 'Omni'
slug: /integrations/omni
keywords: ['clickhouse', 'Omni', 'connect', 'integrate', 'ui']
description: 'Omni — это корпоративная платформа для бизнес-аналитики, приложений для работы с данными и встраиваемой аналитики, которая помогает исследовать данные и делиться результатами в режиме реального времени.'
title: 'Omni'
doc_type: 'guide'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import omni_01 from '@site/static/images/integrations/data-visualization/omni_01.png';
import omni_02 from '@site/static/images/integrations/data-visualization/omni_02.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Omni

<PartnerBadge/>

Omni может подключаться к ClickHouse Cloud или к локальному развёртыванию через официальный источник данных ClickHouse.



## 1. Соберите данные для подключения {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. Создание источника данных ClickHouse {#2-create-a-clickhouse-data-source}

Перейдите в раздел Admin → Connections и нажмите кнопку «Add Connection» в правом верхнем углу.

<Image
  size='lg'
  img={omni_01}
  alt='Интерфейс администратора Omni с кнопкой Add Connection в разделе Connections'
  border
/>
<br />

Выберите `ClickHouse`. Введите свои учетные данные в форму.

<Image
  size='lg'
  img={omni_02}
  alt='Интерфейс настройки подключения Omni для ClickHouse с полями формы для ввода учетных данных'
  border
/>
<br />

Теперь вы можете выполнять запросы и визуализировать данные из ClickHouse в Omni.
