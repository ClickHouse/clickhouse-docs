---
sidebar_label: 'Deepnote'
sidebar_position: 11
slug: /integrations/deepnote
keywords: ['clickhouse', 'Deepnote', 'connect', 'integrate', 'notebook']
description: 'Эффективно запрашивайте очень большие наборы данных, анализируя и моделируя в удобной для вас среде ноутбука.'
title: 'Подключите ClickHouse к Deepnote'
---

import deepnote_01 from '@site/static/images/integrations/data-visualization/deepnote_01.png';
import deepnote_02 from '@site/static/images/integrations/data-visualization/deepnote_02.png';
import deepnote_03 from '@site/static/images/integrations/data-visualization/deepnote_03.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


# Подключите ClickHouse к Deepnote

<CommunityMaintainedBadge/>

<a href="https://www.deepnote.com/" target="_blank">Deepnote</a> — это совместимый с Jupyter коллаборативный блокнот для данных, созданный для команд, чтобы открывать и делиться инсайтами. В дополнение к совместимости с Jupyter, он работает в облаке и предоставляет вам одно центральное место для совместной работы и эффективной работы над проектами в области науки о данных.

Этот гид предполагает, что у вас уже есть учетная запись Deepnote и что у вас есть работающий экземпляр ClickHouse.

## Интерактивный пример {#interactive-example}
Если вы хотите исследовать интерактивный пример запроса ClickHouse из блокнотов данных Deepnote, нажмите кнопку ниже, чтобы запустить проект-шаблон, подключенный к [ClickHouse playground](../../getting-started/playground.md).

[<Image size="logo" img="https://deepnote.com/buttons/launch-in-deepnote.svg" alt="Запустить в Deepnote" />](https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote)

## Подключение к ClickHouse {#connect-to-clickhouse}

1. В Deepnote выберите обзор "Интеграции" и нажмите на плитку ClickHouse.

<Image size="lg" img={deepnote_01} alt="Плитка интеграции ClickHouse" border />

2. Укажите данные подключения для вашего экземпляра ClickHouse:
<ConnectionDetails />

   <Image size="md" img={deepnote_02} alt="Диалог деталей ClickHouse" border />

   **_ПРИМЕЧАНИЕ:_** Если ваше соединение с ClickHouse защищено списком доступа по IP, вам может потребоваться разрешить IP-адреса Deepnote. Узнайте больше об этом в [документации Deepnote](https://docs.deepnote.com/integrations/authorize-connections-from-deepnote-ip-addresses).

3. Поздравляем! Вы только что интегрировали ClickHouse в Deepnote.

## Использование интеграции ClickHouse. {#using-clickhouse-integration}

1. Начните с подключения к интеграции ClickHouse справа от вашего блокнота.

   <Image size="lg" img={deepnote_03} alt="Диалог деталей ClickHouse" border />

2. Теперь создайте новый блок запроса ClickHouse и выполните запрос к вашей базе данных. Результаты запроса будут сохранены в виде DataFrame и хранятся в переменной, указанной в SQL-блоке.
3. Вы также можете преобразовать любой существующий [SQL блок](https://docs.deepnote.com/features/sql-cells) в блок ClickHouse.
