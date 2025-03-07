---
sidebar_label: 'Deepnote'
sidebar_position: 11
slug: /integrations/deepnote
keywords: ['clickhouse', 'Deepnote', 'connect', 'integrate', 'notebook']
description: 'Эффективно выполняйте запросы к очень большим наборам данных, анализируя и моделируя в удобной знакомой среде блокнота.'
---

import deepnote_01 from '@site/static/images/integrations/data-visualization/deepnote_01.png';
import deepnote_02 from '@site/static/images/integrations/data-visualization/deepnote_02.png';
import deepnote_03 from '@site/static/images/integrations/data-visualization/deepnote_03.png';

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# Подключите ClickHouse к Deepnote

<a href="https://www.deepnote.com/" target="_blank">Deepnote</a> — это коллаборативный блокнот данных, разработанный для команд, чтобы находить и делиться инсайтами. В дополнение к совместимости с Jupyter он работает в облаке и предоставляет вам одно центральное место для совместной работы и эффективной работы над проектами в области Data Science.

Этот гид предполагает, что у вас уже есть аккаунт Deepnote и работающий экземпляр ClickHouse.

## Интерактивный пример {#interactive-example}
Если вы хотите изучить интерактивный пример выполнения запросов к ClickHouse из блокнотов данных Deepnote, нажмите кнопку ниже, чтобы запустить шаблонный проект, подключенный к [песочнице ClickHouse](../../getting-started/playground.md).

[<img src="https://deepnote.com/buttons/launch-in-deepnote.svg"/>](https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote)

## Подключение к ClickHouse {#connect-to-clickhouse}

1. В Deepnote выберите обзор "Integrations" и щелкните по плитке ClickHouse.

<img src={deepnote_01} class="image" alt="Плитка интеграции ClickHouse" style={{width: '100%'}}/>

2. Укажите данные подключения к вашему экземпляру ClickHouse:
<ConnectionDetails />

   <img src={deepnote_02} class="image" alt="Диалог деталей ClickHouse" style={{width: '100%'}}/>

   **_ПРИМЕЧАНИЕ:_** Если ваше соединение с ClickHouse защищено списком IP-адресов, вам может потребоваться разрешить IP-адреса Deepnote. Подробнее об этом можно прочитать в [документации Deepnote](https://docs.deepnote.com/integrations/authorize-connections-from-deepnote-ip-addresses).
3. Поздравляем! Теперь вы интегрировали ClickHouse в Deepnote.

## Использование интеграции ClickHouse. {#using-clickhouse-integration}

1. Начните с подключения к интеграции ClickHouse справа от вашего блокнота.

   <img src={deepnote_03} class="image" alt="Диалог деталей ClickHouse" style={{width: '100%'}}/>

2. Теперь создайте новый блок запроса ClickHouse и выполните запрос к вашей базе данных. Результаты запроса будут сохранены как DataFrame и хранятся в переменной, указанной в SQL-блоке.
3. Вы также можете преобразовать любой существующий [SQL блок](https://docs.deepnote.com/features/sql-cells) в блок ClickHouse.
