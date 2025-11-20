---
sidebar_label: 'Fabi.ai'
slug: /integrations/fabi.ai
keywords: ['clickhouse', 'Fabi.ai', 'connect', 'integrate', 'notebook', 'ui', 'analytics']
description: 'Fabi.ai — это единая платформа для совместного анализа данных. Вы можете использовать SQL, Python, ИИ и no-code, чтобы создавать дашборды и конвейеры обработки данных быстрее, чем когда‑либо прежде.'
title: 'Подключение ClickHouse к Fabi.ai'
doc_type: 'guide'
---

import fabi_01 from '@site/static/images/integrations/data-visualization/fabi_01.png';
import fabi_02 from '@site/static/images/integrations/data-visualization/fabi_02.png';
import fabi_03 from '@site/static/images/integrations/data-visualization/fabi_03.png';
import fabi_04 from '@site/static/images/integrations/data-visualization/fabi_04.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


# Подключение ClickHouse к Fabi.ai

<CommunityMaintainedBadge/>

<a href="https://www.fabi.ai/" target="_blank">Fabi.ai</a> — это платформа «всё в одном» для совместного анализа данных. Вы можете использовать SQL, Python, AI и no-code, чтобы создавать дашборды и конвейеры обработки данных быстрее, чем когда-либо прежде. В сочетании с масштабом и мощью ClickHouse вы сможете за считанные минуты создать и опубликовать свой первый высокопроизводительный дашборд на огромном наборе данных.

<Image size="md" img={fabi_01} alt="Платформа Fabi.ai для исследования данных и управления пайплайнами" border />



## Соберите данные для подключения {#gather-your-connection-details}

<ConnectionDetails />


## Создайте учетную запись Fabi.ai и подключите ClickHouse {#connect-to-clickhouse}

Войдите в систему или создайте учетную запись Fabi.ai: https://app.fabi.ai/

1. При первом создании учетной записи вам будет предложено подключить базу данных. Если у вас уже есть учетная запись, нажмите на панель источников данных слева в любом Smartbook и выберите «Add Data Source».

   <Image size='lg' img={fabi_02} alt='Добавление источника данных' border />

2. Затем вам будет предложено ввести данные для подключения.

   <Image size='md' img={fabi_03} alt='Форма учетных данных ClickHouse' border />

3. Поздравляем! Вы успешно интегрировали ClickHouse в Fabi.ai.


## Выполнение запросов к ClickHouse {#querying-clickhouse}

После подключения Fabi.ai к ClickHouse перейдите в любой [Smartbook](https://docs.fabi.ai/analysis_and_reporting/smartbooks) и создайте SQL-ячейку. Если к вашему экземпляру Fabi.ai подключён только один источник данных, SQL-ячейка автоматически будет использовать ClickHouse по умолчанию. В противном случае вы можете выбрать нужный источник из выпадающего списка.

<Image size='lg' img={fabi_04} alt='Выполнение запросов к ClickHouse' border />


## Дополнительные ресурсы {#additional-resources}

Документация [Fabi.ai](https://www.fabi.ai): https://docs.fabi.ai/introduction

Видеоуроки по началу работы с [Fabi.ai](https://www.fabi.ai): https://www.youtube.com/playlist?list=PLjxPRVnyBCQXxxByw2CLC0q7c-Aw6t2nl
