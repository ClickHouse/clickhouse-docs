---
sidebar_label: 'Dot'
slug: /integrations/dot
keywords: ['clickhouse', 'dot', 'ai', 'chatbot', 'mysql', 'интеграция', 'ui', 'виртуальный ассистент']
description: 'AI-чат-бот | Dot — интеллектуальный виртуальный помощник по данным, который отвечает на вопросы о бизнес-данных, находит определения и релевантные объекты данных и даже помогает в моделировании данных, работая на базе ClickHouse.'
title: 'Dot'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import dot_01 from '@site/static/images/integrations/data-visualization/dot_01.png';
import dot_02 from '@site/static/images/integrations/data-visualization/dot_02.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Dot

<CommunityMaintainedBadge/>

[Dot](https://www.getdot.ai/) — это ваш **аналитик данных на базе ИИ**.
Он подключается напрямую к ClickHouse, чтобы вы могли задавать вопросы о данных на естественном языке, исследовать данные, проверять гипотезы и получать ответы на вопросы «почему» — прямо в Slack, Microsoft Teams, ChatGPT или собственном веб-интерфейсе.



## Предварительные требования {#pre-requisites}

- База данных ClickHouse, развёрнутая самостоятельно или в [ClickHouse Cloud](https://clickhouse.com/cloud)
- Учётная запись [Dot](https://www.getdot.ai/)
- Учётная запись и проект [Hashboard](https://www.hashboard.com/).


## Подключение Dot к ClickHouse {#connecting-dot-to-clickhouse}

<Image
  size='md'
  img={dot_01}
  alt='Настройка подключения ClickHouse в Dot (светлая тема)'
  border
/>
<br />

1. В интерфейсе Dot перейдите в раздел **Settings → Connections**.
2. Нажмите **Add new connection** и выберите **ClickHouse**.
3. Укажите параметры подключения:
   - **Host**: имя хоста сервера ClickHouse или конечная точка ClickHouse Cloud
   - **Port**: `9440` (защищённый нативный интерфейс) или `9000` (TCP по умолчанию)
   - **Username / Password**: пользователь с правами на чтение
   - **Database**: при необходимости укажите схему по умолчанию
4. Нажмите **Connect**.

<Image img={dot_02} alt='Подключение ClickHouse' size='sm' />

Dot использует **query-pushdown**: ClickHouse выполняет ресурсоёмкие вычисления в масштабе, а Dot обеспечивает корректность и достоверность ответов.


## Основные возможности {#highlights}

Dot обеспечивает доступ к данным через диалог:

- **Запросы на естественном языке**: Получайте ответы без написания SQL-запросов.
- **Анализ причин**: Задавайте уточняющие вопросы для понимания трендов и аномалий.
- **Работает там, где работаете вы**: Slack, Microsoft Teams, ChatGPT или веб-приложение.
- **Надёжные результаты**: Dot проверяет запросы на соответствие вашим схемам и определениям, минимизируя ошибки.
- **Масштабируемость**: Построен на основе делегирования запросов, сочетая интеллектуальные возможности Dot со скоростью ClickHouse.


## Безопасность и управление {#security}

Dot готов к корпоративному использованию:

- **Разрешения и роли**: Наследует систему контроля доступа пользователей ClickHouse
- **Безопасность на уровне строк**: Поддерживается при соответствующей настройке в ClickHouse
- **TLS / SSL**: Включено по умолчанию для ClickHouse Cloud; требует ручной настройки для самостоятельного развёртывания
- **Управление и валидация**: Пространство для обучения и валидации помогает предотвратить галлюцинации
- **Соответствие стандартам**: Сертифицирован по стандарту SOC 2 Type I


## Дополнительные ресурсы {#additional-resources}

- Веб-сайт Dot: [https://www.getdot.ai/](https://www.getdot.ai/)
- Документация: [https://docs.getdot.ai/](https://docs.getdot.ai/)
- Приложение Dot: [https://app.getdot.ai/](https://app.getdot.ai/)

Теперь вы можете использовать **ClickHouse + Dot** для анализа данных в режиме диалога — сочетая AI-ассистента Dot с быстрым и масштабируемым аналитическим движком ClickHouse.
