---
sidebar_label: 'Middleware'
slug: /integrations/middleware
keywords: ['clickhouse', 'middleware', 'обсервабилити', 'интеграция', 'мониторинг']
description: 'Подключите Middleware к ClickHouse для мониторинга и анализа метрик и логов ClickHouse.'
title: 'Подключение Middleware к ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_integration'
---

import PartnerBadge from '@theme/badges/PartnerBadge';

# Подключение Middleware к ClickHouse \{#connecting-middleware-to-clickhouse\}

<PartnerBadge />

[Middleware](https://middleware.io/) — это облачная платформа обсервабилити для мониторинга инфраструктуры, логов и производительности приложений.

Вы можете подключить ClickHouse к Middleware, чтобы собирать и визуализировать телеметрию базы данных в рамках более широких сценариев мониторинга.

## Предварительные требования \{#prerequisites\}

* Работающий сервис ClickHouse (Cloud или самоуправляемый)
* Доступ к хосту ClickHouse, порту, имени пользователя и паролю
* Учетная запись Middleware

## Подключение ClickHouse в Middleware \{#connect-clickhouse-in-middleware\}

1. Войдите в свою учетную запись Middleware.
2. Перейдите в **Integrations** и найдите **ClickHouse**.
3. Выберите интеграцию ClickHouse и введите данные подключения:
   * Host
   * Port
   * Database
   * Username
   * Password
4. Сохраните интеграцию и выполните проверку подключения.

## Проверьте сбор данных \{#verify-data-collection\}

После настройки убедитесь, что метрики и/или логи ClickHouse отображаются на панелях мониторинга Middleware.

Если проверка подключения завершается ошибкой, убедитесь, что:

* ClickHouse принимает входящие подключения от Middleware
* Параметры SSL/TLS соответствуют конечной точке ClickHouse
* Учетные данные и права доступа к базе данных указаны верно

## Дополнительные ресурсы \{#additional-resources\}

* [Сайт Middleware](https://middleware.io/)