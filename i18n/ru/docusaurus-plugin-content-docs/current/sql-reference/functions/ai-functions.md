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

### Ограничение хостов конечных точек \{#restricting-endpoint-hosts\}

URL `endpoint` в именованной коллекции AI — это адрес исходящего подключения, к которому сервер обращается от своего имени, передавая `api_key` коллекции в заголовках запроса. По умолчанию ClickHouse разрешает любые хосты. Чтобы ограничить функции определённым набором провайдеров, настройте [`remote_url_allow_hosts`](/operations/server-configuration-parameters/settings#remote_url_allow_hosts) в конфигурации сервера, например:

```xml
<remote_url_allow_hosts>
    <host>api.openai.com</host>
    <host>api.anthropic.com</host>
</remote_url_allow_hosts>
```

Обратите внимание, что этот параметр действует на уровне всего сервера и распространяется на все функции, использующие HTTP.

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

## aiClassify \{#aiClassify\}

Добавлено в: v26.4.0

Классифицирует указанный текст по одной из заданных категорий с помощью LLM-провайдера.

Функция отправляет текст вместе с фиксированным запросом на классификацию и форматом ответа JSON-schema,
который ограничивает модель так, чтобы она возвращала ровно одну из переданных меток. Если ответ возвращается как JSON-объект
вида `{"category": "..."}`, метка извлекается, и функция возвращает строку этой метки.

Первый аргумент — это именованная коллекция, которая задает provider, model, конечную точку и API-ключ.

**Синтаксис**

```sql
aiClassify(collection, text, categories[, temperature])
```

**Псевдонимы**: `AIClassify`

**Аргументы**

* `collection` — Имя именованной коллекции, содержащей учетные данные провайдера и параметры конфигурации. [`String`](/sql-reference/data-types/string)
* `text` — Текст для классификации. [`String`](/sql-reference/data-types/string)
* `categories` — Постоянный список меток возможных категорий. [`Array(String)`](/sql-reference/data-types/array)
* `temperature` — Температура сэмплирования, управляющая случайностью. По умолчанию: `0.0`. [`Float64`](/sql-reference/data-types/float)

**Возвращаемое значение**

Одна из указанных меток категорий или значение по умолчанию для типа столбца (пустая строка), если запрос завершился ошибкой и `ai_function_throw_on_error` отключен. [`String`](/sql-reference/data-types/string)

**Примеры**

**Классификация тональности**

```sql title=Query
SELECT aiClassify('ai_credentials', 'I love this product!', ['positive', 'negative', 'neutral'])
```

```response title=Response
positive
```

**Классификация столбца**

```sql title=Query
SELECT body, aiClassify('ai_credentials', body, ['bug', 'question', 'feature']) AS kind FROM issues LIMIT 5
```

```response title=Response
```

## aiExtract \{#aiExtract\}

Добавлено в: v26.4.0

Извлекает структурированную информацию из неструктурированного текста с помощью провайдера LLM.

Третий аргумент может быть либо произвольной инструкцией на естественном языке (например, `'the main complaint'`), либо
schema в формате JSON вида `'{"field_a": "description of field a", "field_b": "description of field b"}'`.

В режиме инструкции функция возвращает извлечённое значение в виде обычной строки или пустую строку, если ничего не найдено.
В режиме schema функция возвращает строку JSON-объекта, ключи которого соответствуют запрошенной schema; отсутствующие поля имеют значение `null`.

Первый аргумент — именованная коллекция, которая задаёт провайдера, модель, конечную точку и API-ключ.

**Синтаксис**

```sql
aiExtract(collection, text, instruction_or_schema[, temperature])
```

**Псевдонимы**: `AIExtract`

**Аргументы**

* `collection` — Имя именованной коллекции, содержащей учетные данные провайдера и настройки. [`String`](/sql-reference/data-types/string)
* `text` — Текст, из которого нужно извлечь информацию. [`String`](/sql-reference/data-types/string)
* `instruction_or_schema` — Инструкция для извлечения в свободной форме или константный JSON-объект, описывающий поля для извлечения. [`const String`](/sql-reference/data-types/string)
* `temperature` — Температура семплирования, управляющая случайностью. По умолчанию: `0.0`. [`const Float64`](/sql-reference/data-types/float)

**Возвращаемое значение**

Одно извлечённое значение (в режиме инструкции) или строка JSON-объекта (в режиме schema). Возвращает значение по умолчанию для типа столбца (пустую строку), если запрос завершился ошибкой и `ai_function_throw_on_error` отключён. [`String`](/sql-reference/data-types/string)

**Примеры**

**Инструкция в свободной форме**

```sql title=Query
SELECT aiExtract('ai_credentials', 'The package arrived late and was damaged.', 'the main complaint')
```

```response title=Response
late and damaged package
```

**Извлечение schema**

```sql title=Query
SELECT aiExtract('ai_credentials', review, '{"sentiment": "positive, negative or neutral", "topic": "main topic of the review"}') FROM reviews LIMIT 5
```

```response title=Response
```

## aiGenerate \{#aiGenerate\}

Добавлено в: v26.4.0

Генерирует произвольный текст по запросу с использованием провайдера LLM.

Функция отправляет запрос настроенному AI-провайдеру и возвращает сгенерированный текст.
При необходимости можно указать системный запрос, чтобы направлять поведение модели (например, задать тон, формат или роль).
Если системный запрос не указан, используется системный запрос по умолчанию: `You are a helpful assistant. Provide a clear and concise response.`

Первый аргумент — именованная коллекция, в которой задаются провайдер, модель, конечная точка и API-ключ.

**Синтаксис**

```sql
aiGenerate(collection, prompt[, system_prompt[, temperature]])
```

**Псевдонимы**: `AIGenerate`

**Аргументы**

* `collection` — Имя именованной коллекции, содержащей учетные данные провайдера и конфигурацию. [`String`](/sql-reference/data-types/string)
* `prompt` — Пользовательский запрос или вопрос, отправляемый модели. [`String`](/sql-reference/data-types/string)
* `system_prompt` — Необязательная постоянная инструкция системного уровня, задающая поведение модели (например, роль или формат вывода) и отправляемая с каждым запросом. [`String`](/sql-reference/data-types/string)
* `temperature` — Температура сэмплирования, управляющая случайностью. Значение по умолчанию: `0.7`. [`Float64`](/sql-reference/data-types/float)

**Возвращаемое значение**

Сгенерированный текстовый ответ или значение по умолчанию для типа столбца (пустая строка), если запрос завершился ошибкой и `ai_function_throw_on_error` отключен. [`String`](/sql-reference/data-types/string)

**Примеры**

**Простой вопрос**

```sql title=Query
SELECT aiGenerate('ai_credentials', 'What is 2 + 2? Reply with just the number.')
```

```response title=Response
4
```

**С системным промптом**

```sql title=Query
SELECT aiGenerate('ai_credentials', 'Explain ClickHouse', 'You are a database expert. Be concise.')
```

```response title=Response
```

**Сводка по значениям столбца**

```sql title=Query
SELECT article_title, aiGenerate('ai_credentials', concat('Summarize in one sentence: ', article_body)) AS summary FROM articles LIMIT 5
```

```response title=Response
```

## aiTranslate \{#aiTranslate\}

Добавлено в: v26.4.0

Переводит указанный текст на заданный язык с помощью LLM-провайдера.

Дополнительные указания по стилю или диалекту можно передать в качестве четвертого аргумента (например, `'оставлять технические термины без перевода'`).

Первый аргумент — именованная коллекция, в которой указаны провайдер, модель, конечная точка и API-ключ.

**Синтаксис**

```sql
aiTranslate(collection, text, target_language[, instructions[, temperature]])
```

**Псевдонимы**: `AITranslate`

**Аргументы**

* `collection` — Имя именованной коллекции, содержащей учетные данные провайдера и настройки. [`String`](/sql-reference/data-types/string)
* `text` — Текст для перевода. [`String`](/sql-reference/data-types/string)
* `target_language` — Имя целевого языка или код BCP-47 (например, `'French'`, `'es-MX'`). [`String`](/sql-reference/data-types/string)
* `instructions` — Необязательные дополнительные инструкции для переводчика в виде константы. [`String`](/sql-reference/data-types/string)
* `temperature` — Температура сэмплирования, определяющая степень случайности. Значение по умолчанию: `0.3`. [`Float64`](/sql-reference/data-types/float)

**Возвращаемое значение**

Переведённый текст или значение по умолчанию для типа столбца (пустая строка), если запрос завершился ошибкой и отключена настройка `ai_function_throw_on_error`. [`String`](/sql-reference/data-types/string)

**Примеры**

**Перевод на французский**

```sql title=Query
SELECT aiTranslate('ai_credentials', 'Hello, world!', 'French')
```

```response title=Response
Bonjour le monde!
```

**Перевести на японский с указаниями по стилю**

```sql title=Query
SELECT aiTranslate('ai_credentials', body, 'Japanese', 'Use polite form (desu/masu)') FROM articles LIMIT 5
```

```response title=Response
```

{/*AUTOGENERATED_END*/ }