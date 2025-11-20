---
sidebar_title: 'Конечные точки Query API'
slug: /cloud/features/query-api-endpoints
description: 'Легко разворачивайте REST API конечные точки на основе сохранённых запросов'
keywords: ['api', 'query api endpoints', 'query endpoints', 'query rest api']
title: 'Конечные точки Query API'
doc_type: 'guide'
---

import {CardSecondary} from '@clickhouse/click-ui/bundled';
import Link from '@docusaurus/Link'


# Конечные точки Query API

Создание интерактивных приложений, основанных на данных, требует не только быстрой базы данных, хорошо структурированных данных и оптимизированных запросов.
Вашим фронтенду и микросервисам также нужен простой способ получать данные, возвращаемые этими запросами, предпочтительно через хорошо структурированные API.

Функция **Query API Endpoints** позволяет создавать конечную точку API непосредственно из любого сохранённого SQL-запроса в консоли ClickHouse Cloud.
Вы сможете обращаться к конечным точкам API по HTTP, чтобы выполнять сохранённые запросы без необходимости подключаться к сервису ClickHouse Cloud через нативный драйвер.

:::tip Guide
См. [руководство по конечным точкам Query API](/cloud/get-started/query-endpoints), чтобы узнать, как настроить
конечные точки Query API в несколько простых шагов
:::