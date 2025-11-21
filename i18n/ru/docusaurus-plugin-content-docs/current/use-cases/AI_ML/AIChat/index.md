---
slug: /use-cases/AI_ML/AIChat
sidebar_label: 'AI-чат'
title: 'Использование AI Chat в ClickHouse Cloud'
pagination_prev: null
pagination_next: null
description: 'Руководство по активации и использованию функции AI Chat в консоли ClickHouse Cloud'
keywords: ['AI', 'ClickHouse Cloud', 'чат', 'SQL Console', 'Agent', 'Docs AI']
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


# Использование AI Chat в ClickHouse Cloud

> В этом руководстве описывается, как включить и использовать функцию AI Chat в консоли ClickHouse Cloud.

<VerticalStepper headerLevel="h2">


## Предварительные требования {#prerequisites}

1. У вас должен быть доступ к организации ClickHouse Cloud с включенными функциями AI (если функции недоступны, обратитесь к администратору организации или в службу поддержки).


## Открытие панели AI Chat {#open-panel}

1. Перейдите к сервису ClickHouse Cloud.
2. На левой боковой панели нажмите на значок с блёстками с надписью «Ask AI».
3. (Сочетание клавиш) Нажмите <kbd>⌘</kbd> + <kbd>'</kbd> (macOS) или <kbd>Ctrl</kbd> + <kbd>'</kbd> (Linux/Windows), чтобы открыть или закрыть панель.

<Image img={img_open} alt='Открытие всплывающей панели AI Chat' size='md' />


## Принятие согласия на использование данных (при первом запуске) {#consent}

1. При первом использовании появляется диалоговое окно с описанием обработки данных и сторонних субпроцессоров LLM.
2. Ознакомьтесь с условиями и примите их для продолжения. При отказе панель не откроется.

<Image img={img_consent} alt='Диалоговое окно согласия' size='md' />


## Выбор режима чата {#modes}

AI Chat в настоящее время поддерживает:

- **Agent**: Многоэтапный анализ схемы и метаданных (сервис должен быть активен).
- **Docs AI (Ask)**: Вопросы и ответы на основе официальной документации ClickHouse и рекомендаций по лучшим практикам.

Для переключения используйте селектор режимов в левом нижнем углу всплывающей панели.

<Image img={img_modes} alt='Выбор режима' size='sm' />


## Составление и отправка сообщения {#compose}

1. Введите ваш вопрос (например, «Create a materialized view to aggregate daily events by user»).
2. Нажмите <kbd>Enter</kbd> для отправки (используйте <kbd>Shift</kbd> + <kbd>Enter</kbd> для перехода на новую строку).
3. Пока модель обрабатывает запрос, вы можете нажать «Stop», чтобы прервать выполнение.


## Понимание шагов «мышления» агента {#thinking-steps}

В режиме агента вы можете видеть раскрываемые промежуточные шаги «мышления» или планирования. Они обеспечивают прозрачность процесса формирования ответа ассистентом. Сворачивайте или разворачивайте их по необходимости.

<Image img={img_thinking} alt='Шаги мышления' size='md' />


## Начало новых чатов {#new-chats}

Нажмите кнопку «New Chat» (Новый чат), чтобы очистить контекст и начать новый сеанс.


## Просмотр истории чата {#history}

1. В нижней части отображается список ваших последних чатов.
2. Выберите предыдущий чат, чтобы загрузить его сообщения.
3. Удалите беседу, нажав на значок корзины.

<Image img={img_history} alt='Список истории чата' size='md' />


## Работа с сгенерированным SQL {#sql-actions}

Когда ассистент возвращает SQL:

- Проверьте корректность.
- Нажмите «Открыть в редакторе», чтобы загрузить запрос в новую вкладку SQL.
- Измените и выполните в консоли.

<Image img={img_result_actions} alt='Действия с результатом' size='md' />

<Image img={img_new_tab} alt='Открыть сгенерированный запрос в редакторе' size='md' />


## Остановка или прерывание ответа {#interrupt}

Если ответ формируется слишком долго или уходит в сторону:

1. Нажмите кнопку «Stop» (отображается во время обработки).
2. Сообщение будет помечено как прерванное; вы можете уточнить запрос и отправить его заново.


## Сочетания клавиш {#shortcuts}

| Действие       | Сочетание клавиш             |
| ------------ | -------------------- |
| Открыть AI-чат | `⌘ + '` / `Ctrl + '` |
| Отправить сообщение | `Enter`              |
| Новая строка     | `Shift + Enter`      |

</VerticalStepper>
