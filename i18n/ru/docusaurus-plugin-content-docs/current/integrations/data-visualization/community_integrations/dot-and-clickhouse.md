---
sidebar_label: 'Dot'
slug: /integrations/dot
keywords: ['clickhouse', 'dot', 'ai', 'chatbot', 'mysql', 'integrate', 'ui', 'virtual assistant']
description: 'AI-чат-бот | Dot — это интеллектуальный виртуальный помощник по данным, который отвечает на вопросы о бизнес-данных, находит определения и связанные с ними дата-активы и даже может помогать с моделированием данных, работая на базе ClickHouse.'
title: 'Dot'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import dot_01 from '@site/static/images/integrations/data-visualization/dot_01.png';
import dot_02 from '@site/static/images/integrations/data-visualization/dot_02.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Dot

<CommunityMaintainedBadge/>

[Dot](https://www.getdot.ai/) — ваш **AI-аналитик данных**.
Он напрямую подключается к ClickHouse, чтобы вы могли задавать вопросы к данным на естественном языке, исследовать данные, проверять гипотезы и находить ответы на вопросы «почему» — прямо в Slack, Microsoft Teams, ChatGPT или собственном веб-интерфейсе.



## Предварительные требования {#pre-requisites}

- База данных ClickHouse, развёрнутая самостоятельно или в [ClickHouse Cloud](https://clickhouse.com/cloud)
- Учётная запись [Dot](https://www.getdot.ai/)
- Учётная запись и проект [Hashboard](https://www.hashboard.com/).


## Подключение Dot к ClickHouse {#connecting-dot-to-clickhouse}

<Image
  size='md'
  img={dot_01}
  alt='Настройка подключения к ClickHouse в Dot (светлая тема)'
  border
/>
<br />

1. В интерфейсе Dot перейдите в **Настройки → Подключения**.
2. Нажмите **Добавить новое подключение** и выберите **ClickHouse**.
3. Укажите параметры подключения:
   - **Host**: имя хоста сервера ClickHouse или конечная точка ClickHouse Cloud
   - **Port**: `9440` (защищённый нативный интерфейс) или `9000` (стандартный TCP)
   - **Username / Password**: пользователь с правами на чтение
   - **Database**: при необходимости укажите схему по умолчанию
4. Нажмите **Подключиться**.

<Image img={dot_02} alt='Подключение к ClickHouse' size='sm' />

Dot использует **делегирование запросов**: ClickHouse выполняет ресурсоёмкие вычисления в масштабе, а Dot обеспечивает корректные и достоверные ответы.


## Основные возможности {#highlights}

Dot обеспечивает доступ к данным через диалог:

- **Запросы на естественном языке**: Получайте ответы без написания SQL.
- **Анализ причин**: Задавайте уточняющие вопросы для понимания трендов и аномалий.
- **Работает там, где работаете вы**: Slack, Microsoft Teams, ChatGPT или веб-приложение.
- **Надёжные результаты**: Dot проверяет запросы на соответствие вашим схемам и определениям, минимизируя ошибки.
- **Масштабируемость**: Построен на основе делегирования запросов, сочетая интеллект Dot со скоростью ClickHouse.


## Безопасность и управление {#security}

Dot готов к корпоративному использованию:

- **Разрешения и роли**: Наследует систему контроля доступа пользователей ClickHouse
- **Безопасность на уровне строк**: Поддерживается при соответствующей настройке в ClickHouse
- **TLS / SSL**: Включено по умолчанию для ClickHouse Cloud; требует ручной настройки для самостоятельного развёртывания
- **Управление и валидация**: Пространство обучения и валидации помогает предотвратить галлюцинации
- **Соответствие стандартам**: Сертифицирован по стандарту SOC 2 Type I


## Дополнительные ресурсы {#additional-resources}

- Сайт Dot: [https://www.getdot.ai/](https://www.getdot.ai/)
- Документация: [https://docs.getdot.ai/](https://docs.getdot.ai/)
- Приложение Dot: [https://app.getdot.ai/](https://app.getdot.ai/)

Теперь вы можете использовать **ClickHouse + Dot** для анализа данных в диалоговом режиме — сочетая AI-ассистента Dot с быстрым и масштабируемым аналитическим движком ClickHouse.
