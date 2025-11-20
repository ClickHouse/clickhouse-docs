---
sidebar_title: 'Конечные точки Query API'
slug: /cloud/features/query-api-endpoints
description: 'Легко создавайте REST API конечные точки на основе сохранённых запросов'
keywords: ['api', 'query api endpoints', 'query endpoints', 'query rest api']
title: 'Конечные точки Query API'
doc_type: 'guide'
---

import {CardSecondary} from '@clickhouse/click-ui/bundled';
import Link from '@docusaurus/Link'


# Конечные точки Query API

Создание интерактивных приложений, работающих с данными, требует не только быстрой базы данных, хорошо структурированных данных и оптимизированных запросов.
Вашему фронтенду и микросервисам также нужен простой способ получать данные, возвращаемые этими запросами, предпочтительно через хорошо структурированные API.

Функция **Query API Endpoints** позволяет создать конечную точку API напрямую из любого сохранённого SQL-запроса в консоли ClickHouse Cloud.
Вы сможете обращаться к конечным точкам API по HTTP, чтобы выполнять свои сохранённые запросы без необходимости подключаться к своему сервису ClickHouse Cloud через нативный драйвер.

:::tip Guide
См. [руководство по конечным точкам Query API](/cloud/get-started/query-endpoints) с инструкциями по настройке
конечных точек Query API всего в несколько простых шагов
:::