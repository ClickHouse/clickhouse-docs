---
sidebar_title: 'Конечные точки API для запросов'
slug: /cloud/features/query-api-endpoints
description: 'Легко создавайте конечные точки REST API на основе сохранённых запросов'
keywords: ['api', 'конечные точки api для запросов', 'конечные точки запросов', 'query rest api']
title: 'Конечные точки API для запросов'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import {CardSecondary} from '@clickhouse/click-ui/bundled';
import console_api_keys from '@site/static/images/cloud/guides/query-endpoints/console-api-keys.png';
import edit_api_key from '@site/static/images/cloud/guides/query-endpoints/api-key-edit.png';
import specific_locations from '@site/static/images/cloud/guides/query-endpoints/specific-locations.png';
import Link from '@docusaurus/Link'


# Конечные точки Query API \{#query-api-endpoints\}

Создание интерактивных приложений, основанных на данных, требует не только быстрой базы данных, хорошо структурированных данных и оптимизированных запросов.
Вашим фронтендам и микросервисам также нужен простой способ получать данные, возвращаемые этими запросами, желательно через хорошо структурированные API.

Функция **конечных точек Query API** позволяет создавать конечную точку API напрямую из любого сохранённого SQL‑запроса в консоли ClickHouse Cloud.
Вы сможете обращаться к конечным точкам API по HTTP, чтобы выполнять сохранённые запросы без необходимости подключаться к вашему сервису ClickHouse Cloud через нативный драйвер.

## Контроль доступа по IP \{#ip-access-control\}

Эндпоинты Query API учитывают белые списки IP-адресов на уровне API-ключа. Аналогично SQL Console, эндпоинты Query API проксируют запросы из инфраструктуры ClickHouse, поэтому настройки белого списка IP на уровне сервиса не применяются.

Чтобы ограничить клиентов, которые могут вызывать ваши эндпоинты Query API:

<VerticalStepper headerLevel="h4">

#### Откройте настройки API-ключа \{#open-settings\}

1. Перейдите в ClickHouse Cloud Console → **Organization** → **API Keys**

<Image img={console_api_keys} alt="API Keys"/>

2. Нажмите **Edit** рядом с API-ключом, который используется для эндпоинтов Query API

<Image img={edit_api_key} alt="Edit"/>

#### Добавьте разрешённые IP-адреса \{#add-ips\}

1. В разделе **Allow access to this API Key** выберите **Specific locations**
2. Введите IP-адреса или CIDR-диапазоны (например, `203.0.113.1` или `203.0.113.0/24`)
3. При необходимости добавьте несколько записей

<Image img={specific_locations} alt="Specific locations"/>

Для создания эндпоинтов Query API требуется роль Admin Console и API-ключ с соответствующими правами.

</VerticalStepper>

:::tip Совет
См. [руководство по эндпоинтам Query API](/cloud/get-started/query-endpoints) с инструкциями по настройке
эндпоинтов Query API всего за несколько простых шагов
:::