---
sidebar_label: 'Deepnote'
sidebar_position: 11
slug: /integrations/deepnote
keywords: ['clickhouse', 'Deepnote', 'подключение', 'интеграция', 'блокнот']
description: 'Эффективно выполняйте запросы к сверхкрупным наборам данных, анализируйте их и создавайте модели в привычной среде блокнота.'
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

# Подключение ClickHouse к Deepnote \\{#connect-clickhouse-to-deepnote\\}

<CommunityMaintainedBadge/>

<a href="https://www.deepnote.com/" target="_blank">Deepnote</a> — это совместный ноутбук для работы с данными, созданный для команд, чтобы находить и совместно использовать аналитические выводы. Помимо совместимости с Jupyter, он работает в облаке и предоставляет единое централизованное пространство для совместной работы и эффективной реализации проектов в области data science.

В этом руководстве предполагается, что у вас уже есть аккаунт Deepnote и запущенный экземпляр ClickHouse.

## Интерактивный пример \\{#interactive-example\\}

Если вы хотите изучить интерактивный пример выполнения запросов к ClickHouse из ноутбуков с данными в Deepnote, нажмите кнопку ниже, чтобы создать шаблон проекта, подключённый к [песочнице ClickHouse](../../../getting-started/playground.md).

[<Image size="logo" img="https://deepnote.com/buttons/launch-in-deepnote.svg" alt="Запустить в Deepnote" />](https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote)

## Подключение к ClickHouse \\{#connect-to-clickhouse\\}

1. В Deepnote выберите раздел «Integrations» и нажмите на плитку ClickHouse.

<Image size="lg" img={deepnote_01} alt="Плитка интеграции ClickHouse" border />

2. Укажите параметры подключения к вашему экземпляру ClickHouse:

<ConnectionDetails />

<Image size="md" img={deepnote_02} alt="Диалоговое окно с параметрами ClickHouse" border />

**_ПРИМЕЧАНИЕ:_** Если ваше подключение к ClickHouse защищено списком контроля доступа по IP-адресам (IP Access List), возможно, вам потребуется разрешить IP-адреса Deepnote. Подробнее об этом читайте в [документации Deepnote](https://docs.deepnote.com/integrations/authorize-connections-from-deepnote-ip-addresses).

3. Готово! ClickHouse интегрирован с Deepnote.

## Использование интеграции с ClickHouse. \\{#using-clickhouse-integration\\}

1. Для начала подключитесь к интеграции с ClickHouse в правой части блокнота.

   <Image size="lg" img={deepnote_03} alt="Диалоговое окно с информацией о ClickHouse" border />

2. Теперь создайте новый блок запроса ClickHouse и выполните запрос к базе данных. Результаты запроса будут сохранены в формате DataFrame и помещены в переменную, указанную в SQL-блоке.
3. Вы также можете преобразовать любой существующий [SQL-блок](https://docs.deepnote.com/features/sql-cells) в блок ClickHouse.