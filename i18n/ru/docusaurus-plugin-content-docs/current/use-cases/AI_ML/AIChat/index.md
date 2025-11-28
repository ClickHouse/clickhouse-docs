---
slug: /use-cases/AI_ML/AIChat
sidebar_label: 'Чат с ИИ'
title: 'Использование AI Chat в ClickHouse Cloud'
pagination_prev: null
pagination_next: null
description: 'Руководство по включению и использованию функции AI Chat в консоли ClickHouse Cloud'
keywords: ['AI', 'ClickHouse Cloud', 'AI Chat', 'SQL Console', 'Agent', 'Docs AI']
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

1. У вас должен быть доступ к организации ClickHouse Cloud с включёнными функциями ИИ (если они недоступны, обратитесь к администратору вашей организации или в службу поддержки).



## Откройте панель AI Chat {#open-panel}

1. Перейдите к сервису ClickHouse Cloud.
2. В левой панели нажмите значок в виде искры с подписью «Ask AI».
3. (Горячая клавиша) Нажмите <kbd>⌘</kbd> + <kbd>'</kbd> (macOS) или <kbd>Ctrl</kbd> + <kbd>'</kbd> (Linux/Windows), чтобы открыть или закрыть панель.

<Image img={img_open} alt="Открытие выезжающей панели AI Chat" size="md"/>



## Примите условия использования данных (первый запуск) {#consent}

1. При первом запуске отобразится диалоговое окно с описанием обработки данных и сторонних субпроцессоров LLM.
2. Ознакомьтесь с текстом и примите условия, чтобы продолжить. Если вы отклоните согласие, панель не откроется.

<Image img={img_consent} alt="Диалоговое окно согласия" size="md"/>



## Выберите режим чата {#modes}

AI Chat в настоящее время поддерживает:

- **Agent**: многошаговое рассуждение на основе схемы и метаданных (сервис должен быть запущен).
- **Docs AI (Ask)**: формат вопросов и ответов с опорой на официальную документацию ClickHouse и рекомендации по лучшим практикам.

Используйте переключатель режима в нижней левой части всплывающей панели, чтобы сменить режим.

<Image img={img_modes} alt="Выбор режима" size="sm"/>



## Создание и отправка сообщения {#compose}

1. Введите ваш вопрос (например: «Создайте материализованное представление для агрегации ежедневных событий по пользователю»).  
2. Нажмите <kbd>Enter</kbd>, чтобы отправить (используйте <kbd>Shift</kbd> + <kbd>Enter</kbd> для перехода на новую строку).  
3. Пока модель обрабатывает запрос, вы можете нажать «Stop», чтобы прервать обработку.



## Шаги «размышления» в режиме «Агент» {#thinking-steps}

В режиме «Агент» могут отображаться разворачиваемые промежуточные шаги «размышления» или планирования. Они показывают, как именно помощник формирует свой ответ. При необходимости сворачивайте или разворачивайте их.

<Image img={img_thinking} alt="Шаги «размышления»" size="md"/>



## Создание нового чата {#new-chats}

Нажмите кнопку «New Chat», чтобы очистить контекст и начать новый сеанс.



## Просмотр истории чатов {#history}

1. В нижней части окна отображаются ваши недавние чаты.
2. Выберите предыдущий чат, чтобы загрузить его сообщения.
3. Удалите чат с помощью значка корзины.

<Image img={img_history} alt="Список чатов" size="md"/>



## Работа с сгенерированным SQL {#sql-actions}

Когда ассистент возвращает SQL-запрос:

- Проверьте его на корректность.
- Нажмите «Open in editor», чтобы загрузить запрос в новую вкладку SQL.
- При необходимости измените его и выполните в Консоли.

<Image img={img_result_actions} alt="Действия с результатом" size="md"/>

<Image img={img_new_tab} alt="Открытие сгенерированного запроса в редакторе" size="md"/>



## Остановка или прерывание ответа {#interrupt}

Если ответ занимает слишком много времени или отклоняется от темы:

1. Нажмите кнопку «Stop» (она отображается во время обработки).
2. Сообщение будет помечено как прерванное; затем вы сможете уточнить запрос и отправить его снова.



## Сочетания клавиш {#shortcuts}

| Действие            | Сочетание клавиш     |
| ------------ | -------------------- |
| Открыть AI-чат      | `⌘ + '` / `Ctrl + '` |
| Отправить сообщение | `Enter`              |
| Новая строка        | `Shift + Enter`      |

</VerticalStepper>
