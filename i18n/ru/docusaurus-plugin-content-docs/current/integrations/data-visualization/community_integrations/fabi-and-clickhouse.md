---
sidebar_label: 'Fabi.ai'
slug: /integrations/fabi.ai
keywords: ['clickhouse', 'Fabi.ai', 'connect', 'integrate', 'notebook', 'ui', 'analytics']
description: 'Fabi.ai — это универсальная платформа для совместного анализа данных. Вы можете использовать SQL, Python, ИИ и no-code, чтобы создавать дашборды и рабочие процессы с данными быстрее, чем когда-либо раньше.'
title: 'Подключите ClickHouse к Fabi.ai'
doc_type: 'guide'
integration:
   - support_level: 'community'
   - category: 'data_visualization'
---

import fabi_01 from '@site/static/images/integrations/data-visualization/fabi_01.png';
import fabi_02 from '@site/static/images/integrations/data-visualization/fabi_02.png';
import fabi_03 from '@site/static/images/integrations/data-visualization/fabi_03.png';
import fabi_04 from '@site/static/images/integrations/data-visualization/fabi_04.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# Подключение ClickHouse к Fabi.ai \{#connecting-clickhouse-to-fabiai\}

<CommunityMaintainedBadge/>

<a href="https://www.fabi.ai/" target="_blank">Fabi.ai</a> — это универсальная платформа для совместной работы с данными. Вы можете использовать SQL, Python, ИИ и инструменты no-code, чтобы создавать дашборды и рабочие процессы с данными быстрее, чем когда‑либо. В сочетании с масштабируемостью и мощностью ClickHouse вы сможете за считаные минуты создать и поделиться своим первым высокопроизводительным дашбордом на огромном наборе данных.

<Image size="md" img={fabi_01} alt="Платформа Fabi.ai для исследования данных и построения рабочих процессов" border />

## Соберите данные для подключения \{#gather-your-connection-details\}

<ConnectionDetails />

## Создайте аккаунт Fabi.ai и подключите ClickHouse \{#connect-to-clickhouse\}

Войдите в свой аккаунт Fabi.ai или создайте новый: https://app.fabi.ai/

1. При первом входе в аккаунт вам будет предложено подключить базу данных. Если аккаунт уже есть, нажмите на панель источников данных слева в любом Smartbook и выберите пункт Add Data Source.
   
   <Image size="lg" img={fabi_02} alt="Добавить источник данных" border />

2. Затем вам будет предложено ввести параметры подключения.

   <Image size="md" img={fabi_03} alt="Форма с учетными данными ClickHouse" border />

3. Поздравляем! Теперь вы подключили ClickHouse к Fabi.ai.

## Выполнение запросов к ClickHouse. \{#querying-clickhouse\}

После того как вы подключили Fabi.ai к ClickHouse, откройте любой [Smartbook](https://docs.fabi.ai/analysis_and_reporting/smartbooks) и создайте SQL-ячейку. Если к вашему экземпляру Fabi.ai подключен только один источник данных, SQL-ячейка автоматически выберет ClickHouse, иначе вы можете указать источник для запроса в выпадающем списке источников.

<Image size="lg" img={fabi_04} alt="Выполнение запросов к ClickHouse" border />

## Дополнительные ресурсы \{#additional-resources\}

Документация [Fabi.ai](https://www.fabi.ai): https://docs.fabi.ai/introduction

Вводные обучающие видеоролики по работе с [Fabi.ai](https://www.fabi.ai): https://www.youtube.com/playlist?list=PLjxPRVnyBCQXxxByw2CLC0q7c-Aw6t2nl