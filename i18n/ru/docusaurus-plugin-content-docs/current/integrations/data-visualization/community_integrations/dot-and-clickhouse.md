---
sidebar_label: 'Dot'
slug: /integrations/dot
keywords: ['ClickHouse', 'dot', 'ИИ', 'чат-бот', 'mysql', 'интеграция', 'интерфейс', 'виртуальный помощник']
description: 'ИИ-чат-бот | Dot — это интеллектуальный виртуальный помощник для работы с данными, который отвечает на вопросы о бизнес-данных, находит определения и связанные ресурсы данных, а также может помогать с моделированием данных на базе ClickHouse.'
title: 'Dot'
doc_type: 'guide'
integration:
   - support_level: 'community'
   - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
import dot_01 from '@site/static/images/integrations/data-visualization/dot_01.png';
import dot_02 from '@site/static/images/integrations/data-visualization/dot_02.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Dot \{#dot\}

<CommunityMaintainedBadge />

[Dot](https://www.getdot.ai/) — это ваш **ИИ-аналитик данных**.
Он напрямую подключается к ClickHouse, поэтому вы можете задавать вопросы о данных на естественном языке, исследовать данные, проверять гипотезы и получать ответы на вопросы о причинах — прямо в Slack, Microsoft Teams, ChatGPT или в собственном веб-интерфейсе.

## Предварительные требования \{#pre-requisites\}

* База данных ClickHouse — в самостоятельном размещении или в [ClickHouse Cloud](https://clickhouse.com/cloud)
* аккаунт [Dot](https://www.getdot.ai/)

## Подключение Dot к ClickHouse \{#connecting-dot-to-clickhouse\}

<Image size="md" img={dot_01} alt="Настройка подключения к ClickHouse в Dot (светлый режим)" border />

<br />

1. В интерфейсе Dot перейдите в **Settings → Connections**.
2. Нажмите **Add new connection** и выберите **ClickHouse**.
3. Укажите параметры подключения:
   * **Host**: имя хоста сервера ClickHouse или конечная точка ClickHouse Cloud
   * **Port**: `8443` (HTTPS ClickHouse Cloud) или `8123` (HTTP при самостоятельном размещении)
   * **Username / Password**: пользователь с правами на чтение
   * **Database**: при необходимости укажите схему по умолчанию
4. Нажмите **Connect**.

<Image img={dot_02} alt="Подключение к ClickHouse" size="sm" />

Dot использует **query-pushdown**: ClickHouse берёт на себя ресурсоёмкие вычисления в большом масштабе, а Dot обеспечивает точные и надёжные результаты.

## Ключевые возможности \{#highlights\}

Dot делает данные доступными через диалог:

* **Задавайте вопросы на естественном языке**: получайте ответы без написания SQL.
* **Анализ причин**: задавайте уточняющие вопросы, чтобы лучше понимать тренды и аномалии.
* **Работает там, где вы уже работаете**: Slack, Microsoft Teams, ChatGPT или веб-приложение.
* **Надёжные результаты**: Dot проверяет запросы по вашим схемам и определениям, чтобы свести количество ошибок к минимуму.
* **Масштабируемость**: решение построено на query-pushdown и сочетает интеллектуальные возможности Dot со скоростью ClickHouse.

## Безопасность и управление \{#security\}

Dot готов к корпоративному использованию:

* **Права и роли**: Наследует настройки управления доступом пользователей ClickHouse
* **Безопасность на уровне строк**: Поддерживается, если настроена в ClickHouse
* **TLS / SSL**: Включены по умолчанию в ClickHouse Cloud; при самостоятельном размещении настраиваются вручную
* **Управление и валидация**: Пространство для обучения и валидации помогает снижать риск галлюцинаций
* **Соответствие требованиям**: Сертифицирован по SOC 2 Type I

## Дополнительные ресурсы \{#additional-resources\}

* Веб-сайт Dot: [https://www.getdot.ai/](https://www.getdot.ai/)
* Документация: [https://docs.getdot.ai/](https://docs.getdot.ai/)
* Приложение Dot: [https://app.getdot.ai/](https://app.getdot.ai/)

Теперь вы можете использовать **ClickHouse + Dot** для анализа данных в формате диалога, объединяя ИИ-ассистента Dot с быстрым и масштабируемым аналитическим движком ClickHouse.