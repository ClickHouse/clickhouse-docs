---
sidebar_label: 'Dot'
slug: /integrations/dot
keywords: ['clickhouse', 'dot', 'ai', 'chatbot', 'mysql', 'integrate', 'ui', 'virtual assistant']
description: 'AI-чатбот | Dot — это интеллектуальный виртуальный помощник по данным, который отвечает на вопросы о бизнес-данных, находит определения и релевантные объекты данных, а также может помогать с моделированием данных, работая на базе ClickHouse.'
title: 'Dot'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import dot_01 from '@site/static/images/integrations/data-visualization/dot_01.png';
import dot_02 from '@site/static/images/integrations/data-visualization/dot_02.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Dot {#dot}

<CommunityMaintainedBadge/>

[Dot](https://www.getdot.ai/) — ваш **аналитик данных на базе ИИ**.
Он подключается напрямую к ClickHouse, чтобы вы могли задавать вопросы о данных на естественном языке, исследовать их, проверять гипотезы и находить ответы на вопросы «почему» — прямо в Slack, Microsoft Teams, ChatGPT или во встроенном веб‑интерфейсе.



## Предварительные требования {#pre-requisites}

- База данных ClickHouse, развернутая самостоятельно или в [ClickHouse Cloud](https://clickhouse.com/cloud)  
- Учетная запись в [Dot](https://www.getdot.ai/)  
- Учетная запись и проект в [Hashboard](https://www.hashboard.com/).



## Подключение Dot к ClickHouse {#connecting-dot-to-clickhouse}

<Image size="md" img={dot_01} alt="Настройка подключения к ClickHouse в Dot (светлая тема)" border />
<br/>

1. В интерфейсе Dot перейдите в **Settings → Connections**.  
2. Нажмите **Add new connection** и выберите **ClickHouse**.  
3. Укажите параметры подключения:  
   - **Host**: имя хоста сервера ClickHouse или конечную точку ClickHouse Cloud (endpoint)  
   - **Port**: `9440` (защищённый нативный интерфейс) или `9000` (TCP по умолчанию)  
   - **Username / Password**: пользователь с правами на чтение  
   - **Database**: при необходимости задайте схему по умолчанию  
4. Нажмите **Connect**.

<Image img={dot_02} alt="Подключение ClickHouse" size="sm"/>

Dot использует **query-pushdown**: ClickHouse обрабатывает тяжёлые вычисления в масштабе, а Dot обеспечивает корректные и достоверные ответы.



## Основные возможности {#highlights}

Dot делает данные доступными в формате диалога:

- **Спрашивайте на естественном языке**: получайте ответы без написания SQL.  
- **Анализ «почему» (why analysis)**: задавайте уточняющие вопросы, чтобы понять тенденции и аномалии.  
- **Работает там, где работаете вы**: Slack, Microsoft Teams, ChatGPT или веб‑приложение.  
- **Достоверные результаты**: Dot проверяет запросы на соответствие вашим схемам и определениям, чтобы минимизировать ошибки.  
- **Масштабируемый**: опирается на механизм query-pushdown, сочетая интеллект Dot со скоростью ClickHouse.



## Безопасность и управление {#security}

Dot соответствует требованиям корпоративного уровня:

- **Права доступа и роли**: Наследует модель управления доступом пользователей ClickHouse  
- **Безопасность на уровне строк**: Поддерживается при соответствующей конфигурации в ClickHouse  
- **TLS / SSL**: Включён по умолчанию для ClickHouse Cloud; настраивается вручную при самостоятельном развертывании  
- **Управление и валидация**: Пространство для обучения и проверки помогает снижать риск галлюцинаций  
- **Соответствие требованиям**: Сертифицирован по стандарту SOC 2 Type I



## Дополнительные ресурсы {#additional-resources}

- Сайт Dot: [https://www.getdot.ai/](https://www.getdot.ai/)  
- Документация: [https://docs.getdot.ai/](https://docs.getdot.ai/)  
- Приложение Dot: [https://app.getdot.ai/](https://app.getdot.ai/)  

Теперь вы можете использовать **ClickHouse + Dot**, чтобы анализировать данные в диалоговом режиме — сочетая ИИ-ассистента Dot с быстрым и масштабируемым аналитическим движком ClickHouse.
