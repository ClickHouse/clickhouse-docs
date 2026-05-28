---
slug: /integrations/integration-development/documenting-your-integration
sidebar_label: 'Документирование интеграции'
sidebar_position: 4
title: 'Документирование интеграции с ClickHouse'
description: 'Как добавлять страницы интеграций в clickhouse-docs, включая обязательные разделы и шаблон для копирования.'
keywords: ['партнер', 'интеграция', 'документация', 'участие', 'pull request', 'документация интеграций']
doc_type: 'guide'
---

# Документирование вашей интеграции ClickHouse \{#documenting-your-clickhouse-integration\}

Документация по интеграциям на этом сайте даёт конечным пользователям единое место, где можно разобраться в конфигурации и устранить неполадки. На этой странице описано, что нужно включить, куда помещать файлы и как открыть pull request.

Если вы ещё этого не сделали, начните с [Создания интеграций](/integrations/integration-development/building-integrations) и [Тестирования вашей интеграции](/integrations/integration-development/testing-your-integration).

## Где находится документация \{#where-docs-live\}

* **Репозиторий:** [`ClickHouse/clickhouse-docs`](https://github.com/ClickHouse/clickhouse-docs)
* **Формат:** Markdown, сборка выполняется с помощью Docusaurus
* **Расположение:** `/docs/integrations/<category>/<your-integration>/`, где `<category>` соответствует назначению вашего продукта (`data-visualization`, `data-ingestion`, `language-clients` и т. д.)
* **Процесс:** откройте pull request в ветку `main`. Его проверяет команда интеграций ClickHouse. Если вы впервые участвуете в проекте, подпишите Contributor License Agreement, когда бот оставит соответствующую подсказку в PR

Страницы интеграций в этом репозитории — основной справочный ресурс для конечных пользователей. На странице интеграции можно разместить ссылки на дополнительную документацию на вашем сайте с подробностями по вашему продукту.

Хорошие примеры: [Tableau](/integrations/tableau) и [Metabase](/integrations/metabase).

## Выбор категории \{#choosing-a-category\}

Выберите категорию, которая лучше всего соответствует назначению вашего продукта. Прежде чем открывать PR, просмотрите существующие категории в разделе [Интеграции](/integrations). Если вы сомневаетесь, укажите предлагаемую категорию в описании PR, и команда по интеграциям поможет определить, где разместить страницу.

## Обязательные разделы \{#required-sections\}

Каждая страница интеграции должна включать следующие разделы, желательно в таком порядке:

1. **Назначение.** Какую проблему решает интеграция, в двух-трёх предложениях. Избегайте маркетинговых формулировок. Обычно это читают инженеры, которые оценивают варианты настройки
2. **Предварительные требования и матрица поддерживаемых версий.** Что у пользователя должно быть установлено и какие версии вы поддерживаете для **ClickHouse Cloud и самоуправляемого (open source)**. Здесь хорошо подходит небольшая таблица
3. **Пошаговая настройка.** Пошаговые инструкции, которые приводят к рабочему подключению, с **параллельным описанием для Cloud и самоуправляемого** там, где есть различия (host, port, TLS)
4. **Аутентификация.** Какие способы аутентификации вы поддерживаете (как минимум имя пользователя и пароль поверх TLS, а также mTLS, SSL client cert, примечания по IP allow-list, если применимо)
5. **Сквозной пример.** Как минимум один реалистичный пример — от подключения до содержательного результата. Используйте [пример набора данных ClickHouse](/getting-started/example-datasets), чтобы читатели могли его воспроизвести
6. **Известные ограничения и характеристики производительности.** Пробелы в системе типов, пороговые значения для наборов результатов, примечания по пропускной способности, неподдерживаемые возможности. Откровенность здесь помогает сократить число обращений в поддержку
7. **Устранение неполадок.** Распространённые ошибки и способы их устранения. Для первой версии достаточно двух-трёх частых случаев

## Примечания по стилю \{#style-notes\}

* **Показывайте и Cloud, и самоуправляемый-вариант.** В Cloud обычно используется HTTPS на порту `8443` и native TCP на `9440`. В самоуправляемом по умолчанию используются порты `8123` и `9000`
* **Используйте admonitions Docusaurus** (`:::note`, `:::warning`, `:::tip`) для выносок вместо абзацев, выделенных полужирным
* **Ссылайтесь на подробную документацию.** Давайте ссылки на существующую документацию по типам данных, форматам, JDBC, ClickPipes и смежным темам вместо того, чтобы объяснять всё заново
* **Без маркетинга.** Страницы интеграций здесь — это технический справочник. Рекламный контент размещайте на своем сайте; мы можем дать на него ссылку из каталога партнеров

## Шаблон для копирования \{#copy-paste-skeleton\}

Заполните разделы в квадратных скобках, сохраните файл как `/docs/integrations/<category>/<your-integration>/index.md` и откройте PR.

```markdown
# [Your product] and ClickHouse

[One to three sentences: what the integration does and why a
ClickHouse user would want it.]

## Prerequisites

- [Your product, version X.Y or later]
- ClickHouse Cloud, or self-hosted ClickHouse version [X.Y] or later
- [Anything else: driver, plugin, network access requirements]

### Version matrix

| [Your product] | ClickHouse Cloud | ClickHouse open source | Notes    |
| -------------- | ---------------- | ---------------------- | -------- |
| X.Y            | ✅               | ✅ 24.x+               | [if any] |

## Setup

### Connect to ClickHouse Cloud

1. In the ClickHouse Cloud console, select your service and click **Connect**.
2. Choose **HTTPS**. Copy the host, port (8443), username, and password.
3. In [your product], [steps to configure the connection].

### Connect to самоуправляемый ClickHouse

1. [How to point at a самоуправляемый instance — host, port 8123 or 9000, TLS notes.]
2. In [your product], [steps to configure the connection].

## Authentication

[List supported auth modes — username/password over TLS, mTLS, etc. — and how
to configure each.]

## Example: querying the [dataset] dataset

[Walkthrough using one of the ClickHouse example datasets, end-to-end.]

## Known limits

- [Types not yet supported, e.g., deeply nested JSON]
- [Result-set size thresholds or other performance notes]
- [Feature gaps]

## Troubleshooting

### [Common error message]

[Cause and resolution.]

### [Another common error]

[Cause and resolution.]
```

## Проверка \{#review\}

Команда ClickHouse, отвечающая за интеграции, проверяет PR на техническую точность, полноту охвата Cloud и самоуправляемых развертываний, а также соответствие стилю документации. Дорабатывайте PR, пока ревьюеры не одобрят его. Без этого одобрения слияние невозможно.