---
description: "Документация по функциям AI"
sidebar_label: "AI"
slug: /sql-reference/functions/ai-functions
title: "Функции AI"
doc_type: "reference"
---

# AI-функции \{#ai-functions\}

AI-функции — это встроенные функции ClickHouse, которые можно использовать для обращения к ИИ или генерации эмбеддингов при работе с данными, извлечения информации, классификации данных и т. д.

:::note
AI-функции могут возвращать непредсказуемые результаты. Итог во многом зависит от качества промпта и используемой модели.
:::

Все функции используют общую инфраструктуру, которая обеспечивает:

* **Контроль квот**: Ограничения в рамках одного запроса на токены ([`ai_function_max_input_tokens_per_query`](/operations/settings/settings#ai_function_max_input_tokens_per_query), [`ai_function_max_output_tokens_per_query`](/operations/settings/settings#ai_function_max_output_tokens_per_query)) и вызовы API ([`ai_function_max_api_calls_per_query`](/operations/settings/settings#ai_function_max_api_calls_per_query)).
* **Повторные попытки с бэкоффом**: При временных сбоях выполняются повторные попытки ([`ai_function_max_retries`](/operations/settings/settings#ai_function_max_retries)) с экспоненциальным бэкоффом ([`ai_function_retry_initial_delay_ms`](/operations/settings/settings#ai_function_retry_initial_delay_ms)).

## Конфигурация \{#configuration\}

Функции ИИ используют **именованную коллекцию**, в которой хранятся учетные данные провайдера и настройки. Первый аргумент каждой функции — имя этой коллекции.

Пример оператора для создания именованной коллекции с учетными данными провайдера:

```sql
CREATE NAMED COLLECTION ai_credentials AS
    provider = 'openai',
    endpoint = 'https://api.openai.com/v1/chat/completions',
    model = 'gpt-4o-mini',
    api_key = 'sk-...';
```

### Параметры именованной коллекции \{#named-collection-parameters\}

| Параметр      | Тип    | По умолчанию | Описание                                                                          |
| ------------- | ------ | ------------ | --------------------------------------------------------------------------------- |
| `provider`    | String | —            | Провайдер модели. Поддерживаются: `'openai'`, `'anthropic'`. См. примечание ниже. |
| `endpoint`    | String | —            | URL конечной точки API.                                                           |
| `model`       | String | —            | Имя модели (например, `'gpt-4o-mini'`, `'text-embedding-3-small'`).               |
| `api_key`     | String | —            | Ключ аутентификации провайдера.                                                   |
| `max_tokens`  | UInt64 | `1024`       | Максимальное количество выходных токенов за один вызов API.                       |
| `api_version` | String | —            | Строка версии API. Используется в Anthropic (`'2023-06-01'`).                     |

:::note
Можно использовать любой API, совместимый с OpenAI (например, vLLM, Ollama, LiteLLM), задав `provider = 'openai'` и указав в `endpoint` адрес вашего сервиса.
:::

### Настройки на уровне запроса \{#query-level-settings\}

Все настройки, связанные с ИИ, перечислены в разделе [Settings](/operations/settings/settings) с префиксом `ai_function_`.

## Поддерживаемые провайдеры \{#supported-providers\}

| Провайдер | Значение `provider` | Функции чата | Примечания                                |
| --------- | ------------------- | ------------ | ----------------------------------------- |
| OpenAI    | `'openai'`          | Да           | Используется по умолчанию.                |
| Anthropic | `'anthropic'`       | Да           | Использует конечную точку `/v1/messages`. |

## Обсервабилити \{#observability\}

Активность AI-функций отслеживается с помощью ClickHouse [ProfileEvents](/operations/system-tables/query_log):

| ProfileEvent      | Description                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| `AIAPICalls`      | Количество HTTP-запросов, отправленных AI-провайдеру.                                                     |
| `AIInputTokens`   | Общее количество использованных входных токенов.                                                          |
| `AIOutputTokens`  | Общее количество использованных выходных токенов.                                                         |
| `AIRowsProcessed` | Количество строк, для которых был получен результат.                                                      |
| `AIRowsSkipped`   | Количество пропущенных строк (превышена квота или произошла ошибка при `ai_function_throw_on_error = 0`). |

Запросите эти события:

```sql
SELECT
    ProfileEvents['AIAPICalls'] AS api_calls,
    ProfileEvents['AIInputTokens'] AS input_tokens,
    ProfileEvents['AIOutputTokens'] AS output_tokens
FROM system.query_log
WHERE query_id = 'query_id'
AND type = 'QueryFinish'
ORDER BY event_time DESC;
```

{/*
  Внутреннее содержимое тегов ниже заменяется во время сборки документации
  документацией, сгенерированной из system.functions. Пожалуйста, не изменяйте и не удаляйте эти теги.
  См.: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }

{/*AUTOGENERATED_END*/ }