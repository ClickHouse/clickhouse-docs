---
sidebar_label: 'Deepnote'
sidebar_position: 11
slug: /integrations/deepnote
keywords: ['clickhouse', 'Deepnote', 'connect', 'integrate', 'notebook']
description: 'Эффективно выполняйте запросы к крупным наборам данных, анализируйте и моделируйте их в привычной среде блокнота.'
title: 'Подключите ClickHouse к Deepnote'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
  - website: 'https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote'
---

import deepnote_01 from '@site/static/images/integrations/data-visualization/deepnote_01.png';
import deepnote_02 from '@site/static/images/integrations/data-visualization/deepnote_02.png';
import deepnote_03 from '@site/static/images/integrations/data-visualization/deepnote_03.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


# Подключение ClickHouse к Deepnote

<CommunityMaintainedBadge/>

<a href="https://www.deepnote.com/" target="_blank">Deepnote</a> — это совместный блокнот для работы с данными, созданный для команд, чтобы находить и делиться аналитическими выводами. Помимо совместимости с Jupyter, он работает в облаке и предоставляет вам единое место для эффективного совместного анализа и работы над проектами по обработке данных.

В этом руководстве предполагается, что у вас уже есть учетная запись Deepnote и запущенный экземпляр ClickHouse.



## Интерактивный пример {#interactive-example}

Если вы хотите изучить интерактивный пример выполнения запросов к ClickHouse из блокнотов данных Deepnote, нажмите на кнопку ниже, чтобы запустить шаблонный проект, подключённый к [песочнице ClickHouse](../../../getting-started/playground.md).

[<Image size="logo" img="https://deepnote.com/buttons/launch-in-deepnote.svg" alt="Запустить в Deepnote" />](https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote)


## Подключение к ClickHouse {#connect-to-clickhouse}

1. В Deepnote перейдите в раздел «Integrations» и нажмите на плитку ClickHouse.

<Image size='lg' img={deepnote_01} alt='Плитка интеграции ClickHouse' border />

2. Укажите параметры подключения для вашего экземпляра ClickHouse:

   <ConnectionDetails />

   <Image size='md' img={deepnote_02} alt='Диалоговое окно с параметрами ClickHouse' border />

   **_ПРИМЕЧАНИЕ:_** Если подключение к ClickHouse защищено списком разрешённых IP-адресов, вам может потребоваться добавить IP-адреса Deepnote в список разрешённых. Подробнее об этом читайте в [документации Deepnote](https://docs.deepnote.com/integrations/authorize-connections-from-deepnote-ip-addresses).

3. Поздравляем! Вы успешно интегрировали ClickHouse в Deepnote.


## Использование интеграции ClickHouse {#using-clickhouse-integration}

1. Начните с подключения к интеграции ClickHouse в правой части вашего ноутбука.

   <Image size='lg' img={deepnote_03} alt='Диалоговое окно сведений ClickHouse' border />

2. Теперь создайте новый блок запросов ClickHouse и выполните запрос к базе данных. Результаты запроса будут сохранены в виде DataFrame и помещены в переменную, указанную в блоке SQL.
3. Вы также можете преобразовать любой существующий [блок SQL](https://docs.deepnote.com/features/sql-cells) в блок ClickHouse.
