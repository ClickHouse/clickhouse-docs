---
slug: /use-cases/AI_ML/AIChat
sidebar_label: 'Использование чата Ask AI в ClickHouse Cloud'
title: 'Использование чата Ask AI в ClickHouse Cloud'
pagination_prev: null
pagination_next: null
description: 'Руководство по включению и использованию функции чата AI в консоли ClickHouse Cloud'
keywords: ['AI', 'ClickHouse Cloud', 'Чат', 'SQL Console', 'Agent', 'Docs AI']
show_related_blogs: true
sidebar_position: 2
doc_type: 'guide'
---

import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import img_open from '@site/static/images/use-cases/AI_ML/AIChat/1_open_chat.png';
import img_consent from '@site/static/images/use-cases/AI_ML/AIChat/2_consent.png';
import img_modes from '@site/static/images/use-cases/AI_ML/AIChat/3_modes.png';
import img_thinking from '@site/static/images/use-cases/AI_ML/AIChat/4_thinking.png';
import img_history from '@site/static/images/use-cases/AI_ML/AIChat/5_history.png';
import img_result_actions from '@site/static/images/use-cases/AI_ML/AIChat/6_result_actions.png';
import img_new_tab from '@site/static/images/use-cases/AI_ML/AIChat/7_open_in_editor.png';

# Использование чата Ask AI в ClickHouse Cloud \{#use-ask-ai-chat-in-clickhouse-cloud\}

> В этом руководстве объясняется, как включить и использовать функцию AI Chat в консоли ClickHouse Cloud.

<VerticalStepper headerLevel="h2">

## Необходимые условия \\{#prerequisites\\}

1. У вас должен быть доступ к организации ClickHouse Cloud с включёнными AI‑функциями (обратитесь к администратору организации или в поддержку, если они недоступны).

## Открытие панели AI Chat \\{#open-panel\\}

1. Перейдите к сервису ClickHouse Cloud.
2. В левой боковой панели нажмите на значок с искрами с подписью «Ask AI».
3. (Горячая клавиша) Нажмите <kbd>⌘</kbd> + <kbd>'</kbd> (macOS) или <kbd>Ctrl</kbd> + <kbd>'</kbd> (Linux/Windows), чтобы открыть или закрыть панель.

<Image img={img_open} alt="Открытие всплывающей панели AI Chat" size="md"/>

## Принятие условий использования данных (при первом запуске) \\{#consent\\}

1. При первом использовании отображается диалог согласия с описанием обработки данных и сторонних LLM‑субобработчиков.
2. Ознакомьтесь с условиями и примите их, чтобы продолжить. Если вы отклоните условия, панель не откроется.

<Image img={img_consent} alt="Диалог согласия" size="md"/>

## Выбор режима чата \\{#modes\\}

В настоящее время AI Chat поддерживает:

- **Agent**: многошаговое рассуждение на основе схемы и метаданных (сервис должен быть активен).
- **Docs AI (Ask)**: режим вопросов и ответов, основанный на официальной документации ClickHouse и материалах по лучшим практикам.

Используйте переключатель режима в нижней левой части всплывающей панели, чтобы сменить режим.

<Image img={img_modes} alt="Выбор режима" size="sm"/>

## Написание и отправка сообщения \\{#compose\\}

1. Введите свой вопрос (например, «Создать materialized view для агрегации ежедневных событий по пользователю»).  
2. Нажмите <kbd>Enter</kbd>, чтобы отправить (используйте <kbd>Shift</kbd> + <kbd>Enter</kbd> для новой строки).  
3. Пока модель обрабатывает запрос, вы можете нажать «Stop», чтобы прервать выполнение.

## Понимание шагов рассуждения «Agent» \\{#thinking-steps\\}

В режиме Agent могут отображаться разворачиваемые промежуточные шаги «thinking» или планирования. Они помогают понять, как помощник формирует ответ. По необходимости сворачивайте или разворачивайте их.

<Image img={img_thinking} alt="Шаги рассуждения" size="md"/>

## Начало новых чатов \\{#new-chats\\}

Нажмите кнопку «New Chat», чтобы очистить контекст и начать новый сеанс.

## Просмотр истории чатов \\{#history\\}

1. В нижней части панели отображается список ваших недавних чатов.
2. Выберите предыдущий чат, чтобы загрузить его сообщения.
3. Удалите беседу с помощью значка корзины.

<Image img={img_history} alt="Список истории чатов" size="md"/>

## Работа с сгенерированным SQL \\{#sql-actions\\}

Когда помощник возвращает SQL:

- Проверьте корректность.
- Нажмите «Open in editor», чтобы загрузить запрос в новую вкладку SQL.
- Измените и выполните его в консоли.

<Image img={img_result_actions} alt="Действия с результатом" size="md"/>

<Image img={img_new_tab} alt="Открытие сгенерированного запроса в редакторе" size="md"/>

## Остановка или прерывание ответа \\{#interrupt\\}

Если ответ занимает слишком много времени или уходит в сторону:

1. Нажмите кнопку «Stop» (отображается во время обработки).
2. Сообщение помечается как прерванное; вы можете уточнить запрос и отправить его снова.

## Комбинации клавиш \\{#shortcuts\\}

| Действие | Комбинация клавиш |
| ------ | -------- |
| Открыть AI Chat | `⌘ + '` / `Ctrl + '` |
| Отправить сообщение | `Enter` |
| Новая строка | `Shift + Enter` |

</VerticalStepper>