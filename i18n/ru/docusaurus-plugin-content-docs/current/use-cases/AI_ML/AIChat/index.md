---
'slug': '/use-cases/AI_ML/AIChat'
'sidebar_label': 'AI Chat'
'title': 'Использование AI Chat в ClickHouse Cloud'
'pagination_prev': null
'pagination_next': null
'description': 'Руководство по включению и использованию функции AI Chat в консоли
  ClickHouse Cloud'
'keywords':
- 'AI'
- 'ClickHouse Cloud'
- 'Chat'
- 'SQL Console'
- 'Agent'
- 'Docs AI'
'show_related_blogs': true
'sidebar_position': 2
'doc_type': 'guide'
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

> Этот гид объясняет, как включить и использовать функцию AI Chat в консоли ClickHouse Cloud.

<VerticalStepper headerLevel="h2">

## Предварительные требования {#prerequisites}

1. Вы должны иметь доступ к организации ClickHouse Cloud с включенными функциями AI (свяжитесь с администратором вашей организации или службой поддержки, если доступ недоступен).

## Открытие панели AI Chat {#open-panel}

1. Перейдите к сервису ClickHouse Cloud.
2. В левой боковой панели нажмите на значок искорки с меткой “Ask AI”.
3. (Сочетание клавиш) Нажмите <kbd>⌘</kbd> + <kbd>'</kbd> (macOS) или <kbd>Ctrl</kbd> + <kbd>'</kbd> (Linux/Windows), чтобы открыть панель.

<Image img={img_open} alt="Открытие всплывающего окна AI Chat" size="md"/>

## Принять согласие на использование данных (при первом запуске) {#consent}

1. При первом использовании появится диалоговое окно согласия, описывающее обработку данных и сторонних LLM-подрядчиков.
2. Ознакомьтесь с условиями и примите, чтобы продолжить. Если вы откажетесь, панель не откроется.

<Image img={img_consent} alt="Диалоговое окно согласия" size="md"/>

## Выбор режима чата {#modes}

AI Chat в настоящее время поддерживает:

- **Agent**: Многошаговое рассуждение на основе схемы + метаданных (сервис должен быть активен).
- **Docs AI (Ask)**: Ориентированный на вопросы и ответы, основанные на официальной документации ClickHouse и рекомендациях по лучшим практикам.

Используйте селектор режима в нижнем левом углу всплывающего окна, чтобы переключиться.

<Image img={img_modes} alt="Выбор режима" size="sm"/>

## Составление и отправка сообщения {#compose}

1. Введите ваш вопрос (например, “Создать материализованное представление для агрегации ежедневных событий по пользователю”).  
2. Нажмите <kbd>Enter</kbd> для отправки (используйте <kbd>Shift</kbd> + <kbd>Enter</kbd> для новой строки).  
3. Пока модель обрабатывает, вы можете нажать “Стоп”, чтобы прервать.

## Понимание шагов мышления “Agent” {#thinking-steps}

В режиме Agent вы можете видеть развертываемые промежуточные “мыслительные” или планировочные шаги. Это обеспечивает прозрачность того, как помощник формирует свой ответ. Сверните или разверните по мере необходимости.

<Image img={img_thinking} alt="Шаги мышления" size="md"/>

## Начало новых чатов {#new-chats}

Нажмите кнопку “Новый чат”, чтобы очистить контекст и начать новую сессию.

## Просмотр истории чатов {#history}

1. В нижней части списка отображаются ваши недавние чаты.
2. Выберите предыдущий чат, чтобы загрузить его сообщения.
3. Удалите разговор, используя значок мусорной корзины.

<Image img={img_history} alt="Список истории чатов" size="md"/>

## Работа с сгенерированным SQL {#sql-actions}

Когда помощник возвращает SQL:

- Проверьте на корректность.
- Нажмите “Открыть в редакторе”, чтобы загрузить запрос в новой вкладке SQL.
- Изменяйте и выполняйте в консоли.

<Image img={img_result_actions} alt="Действия с результатом" size="md"/>

<Image img={img_new_tab} alt="Открыть сгенерированный запрос в редакторе" size="md"/>

## Остановка или прерывание ответа {#interrupt}

Если ответ занимает слишком много времени или отклоняется:

1. Нажмите кнопку “Стоп” (видно во время обработки).
2. Сообщение отмечается как прерванное; вы можете уточнить свой запрос и отправить его снова.

## Горячие клавиши {#shortcuts}

| Действие | Сочетание клавиш |
| -------- | ---------------- |
| Открыть AI Chat | `⌘ + '` / `Ctrl + '` |
| Отправить сообщение | `Enter` |
| Новая строка | `Shift + Enter` |

</VerticalStepper>