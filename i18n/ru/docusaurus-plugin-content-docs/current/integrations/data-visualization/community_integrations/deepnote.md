---
sidebar_label: 'Deepnote'
sidebar_position: 11
slug: /integrations/deepnote
keywords: ['clickhouse', 'Deepnote', 'подключить', 'интегрировать', 'notebook']
description: 'Эффективно выполняйте запросы к очень большим наборам данных, анализируя их и создавая модели в привычной notebook-среде.'
title: 'Подключите ClickHouse к Deepnote'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
  - website: 'https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote'
---

import deepnote_01 from '@site/static/images/integrations/data-visualization/deepnote_01.png';
import deepnote_02 from '@site/static/images/integrations/data-visualization/deepnote_02.png';
import deepnote_03 from '@site/static/images/integrations/data-visualization/deepnote_03.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

<CommunityMaintainedBadge />

<a href="https://www.deepnote.com/" target="_blank">Deepnote</a> — это совместный ноутбук для работы с данными, созданный для того, чтобы команды могли находить полезные выводы и делиться ими. Помимо совместимости с Jupyter, он работает в облаке и предоставляет единое пространство для совместной работы и эффективного выполнения проектов в области data science.

В этом руководстве предполагается, что у вас уже есть учетная запись Deepnote и работающий экземпляр ClickHouse.

## Интерактивный пример \{#interactive-example\}

Если вы хотите ознакомиться с интерактивным примером выполнения запросов к ClickHouse в блокнотах данных Deepnote, нажмите кнопку ниже, чтобы запустить шаблонный проект, подключенный к [Песочнице ClickHouse](../../../getting-started/playground.md).

[<Image size="logo" img="https://deepnote.com/buttons/launch-in-deepnote.svg" alt="Запустить в Deepnote" />](https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote)

## Подключение к ClickHouse \{#connect-to-clickhouse\}

1. В Deepnote откройте раздел «Интеграции» и нажмите плитку ClickHouse.

<Image size="lg" img={deepnote_01} alt="Плитка интеграции ClickHouse" border />

2. Укажите параметры подключения для вашего экземпляра ClickHouse:

<ConnectionDetails />

<Image size="md" img={deepnote_02} alt="Диалоговое окно с параметрами ClickHouse" border />

***ПРИМЕЧАНИЕ:*** Если подключение к ClickHouse защищено с помощью IP Access List, вам может потребоваться разрешить IP-адреса Deepnote. Подробнее см. в [документации Deepnote](https://docs.deepnote.com/integrations/authorize-connections-from-deepnote-ip-addresses).

3. Готово! ClickHouse успешно интегрирован в Deepnote.

## Использование интеграции ClickHouse. \{#using-clickhouse-integration\}

1. Сначала подключитесь к интеграции ClickHouse справа от вашего ноутбука.

   <Image size="lg" img={deepnote_03} alt="диалоговое окно с параметрами ClickHouse" border />

2. Теперь создайте новый блок запросов ClickHouse и выполните запрос к базе данных. Результаты запроса будут сохранены в виде DataFrame и помещены в переменную, указанную в SQL-блоке.

3. Вы также можете преобразовать любой существующий [SQL-блок](https://docs.deepnote.com/features/sql-cells) в блок ClickHouse.