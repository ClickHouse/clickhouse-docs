---
slug: /use-cases/AI_ML/AIChat
sidebar_label: 'Использование чата Ask AI в ClickHouse Cloud'
title: 'Использование чата Ask AI в ClickHouse Cloud'
pagination_prev: null
pagination_next: null
description: 'Руководство по включению и использованию функции чата Ask AI в консоли ClickHouse Cloud'
keywords: ['AI', 'ClickHouse Cloud', 'Chat', 'SQL Console', 'Agent', 'Docs AI']
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

## Предварительные требования \{#prerequisites\}

1. У вас должен быть доступ к организации ClickHouse Cloud с включёнными функциями AI (обратитесь к администратору организации или в поддержку, если они недоступны).

## Откройте панель AI Chat \{#open-panel\}

1. Откройте сервис ClickHouse Cloud.
2. В левой боковой панели нажмите значок со звездой с подписью «Ask AI».
3. (Горячая клавиша) Нажмите <kbd>⌘</kbd> + <kbd>'</kbd> (macOS) или <kbd>Ctrl</kbd> + <kbd>'</kbd> (Linux/Windows), чтобы открыть или закрыть панель.

<Image img={img_open} alt="Открыть выезжающую панель AI Chat" size="md"/>

## Примите условия использования данных (при первом запуске) \{#consent\}

1. При первом использовании отображается диалог согласия, описывающий обработку данных и сторонних субпроцессоров LLM.
2. Ознакомьтесь с информацией и примите условия, чтобы продолжить. Если вы откажетесь, панель не откроется.

<Image img={img_consent} alt="Диалог согласия" size="md"/>

## Выберите режим чата \{#modes\}

AI Chat в настоящее время поддерживает:

- **Agent**: Многошаговое рассуждение по схеме и метаданным (сервис должен быть активен).
- **Docs AI (Ask)**: Режим вопросов и ответов, основанный на официальной документации ClickHouse и рекомендациях по наилучшей практике.

Используйте переключатель режима в левом нижнем углу панели, чтобы сменить режим.

<Image img={img_modes} alt="Выбор режима" size="sm"/>

## Составьте и отправьте сообщение \{#compose\}

1. Введите свой вопрос (например: «Create a materialized view to aggregate daily events by user»).  
2. Нажмите <kbd>Enter</kbd>, чтобы отправить (используйте <kbd>Shift</kbd> + <kbd>Enter</kbd> для перехода на новую строку).  
3. Пока модель обрабатывает запрос, вы можете нажать «Stop», чтобы прервать выполнение.

## Понимание шагов рассуждения в режиме «Agent» \{#thinking-steps\}

В режиме Agent вы можете видеть разворачиваемые промежуточные шаги «мышления» или планирования. Они обеспечивают прозрачность того, как ассистент формирует свой ответ. Сворачивайте или разворачивайте их по необходимости.

<Image img={img_thinking} alt="Шаги рассуждения" size="md"/>

## Создание новых чатов \{#new-chats\}

Нажмите кнопку «New Chat», чтобы очистить контекст и начать новый сеанс.

## Просмотр истории чатов \{#history\}

1. В нижней части панели отображается список ваших недавних чатов.
2. Выберите предыдущий чат, чтобы загрузить его сообщения.
3. Удалите беседу, нажав значок корзины.

<Image img={img_history} alt="Список истории чатов" size="md"/>

## Работа с сгенерированным SQL \{#sql-actions\}

Когда ассистент возвращает SQL‑запрос:

- Проверьте его на корректность.
- Нажмите «Open in editor», чтобы загрузить запрос в новую вкладку SQL.
- Измените и выполните его в консоли.

<Image img={img_result_actions} alt="Действия с результатом" size="md"/>

<Image img={img_new_tab} alt="Открыть сгенерированный запрос в редакторе" size="md"/>

## Остановка или прерывание ответа \{#interrupt\}

Если ответ занимает слишком много времени или уходит в сторону:

1. Нажмите кнопку «Stop» (отображается во время обработки).
2. Сообщение будет помечено как прерванное; вы можете уточнить свой запрос и отправить его снова.

## Комбинации клавиш \{#shortcuts\}

| Действие | Комбинация клавиш |
| ------ | -------- |
| Открыть AI Chat | `⌘ + '` / `Ctrl + '` |
| Отправить сообщение | `Enter` |
| Новая строка | `Shift + Enter` |

</VerticalStepper>