---
description: 'Документация по функциям машинного обучения'
sidebar_label: 'Машинное обучение'
slug: /sql-reference/functions/machine-learning-functions
title: 'Функции машинного обучения'
doc_type: 'reference'
---



# Функции машинного обучения



## evalMLMethod {#evalmlmethod}

Для прогнозирования с использованием обученных регрессионных моделей используется функция `evalMLMethod`. См. ссылку в разделе `linearRegression`.


## stochasticLinearRegression {#stochasticlinearregression}

Агрегатная функция [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression) реализует метод стохастического градиентного спуска с использованием линейной модели и функции потерь MSE. Для прогнозирования на новых данных используется функция `evalMLMethod`.


## stochasticLogisticRegression {#stochasticlogisticregression}

Агрегатная функция [stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression) реализует метод стохастического градиентного спуска для решения задачи бинарной классификации. Для прогнозирования на новых данных используется функция `evalMLMethod`.


## naiveBayesClassifier {#naivebayesclassifier}

Классифицирует входной текст с использованием модели наивного байесовского классификатора с n-граммами и сглаживанием Лапласа. Модель должна быть настроена в ClickHouse перед использованием.

**Синтаксис**

```sql
naiveBayesClassifier(model_name, input_text);
```

**Аргументы**

- `model_name` — имя предварительно настроенной модели. [String](../data-types/string.md)
  Модель должна быть определена в конфигурационных файлах ClickHouse (см. ниже).
- `input_text` — текст для классификации. [String](../data-types/string.md)
  Входные данные обрабатываются в точности так, как предоставлены (регистр и пунктуация сохраняются).

**Возвращаемое значение**

- Идентификатор предсказанного класса в виде беззнакового целого числа. [UInt32](../data-types/int-uint.md)
  Идентификаторы классов соответствуют категориям, определённым при построении модели.

**Пример**

Классификация текста с помощью модели определения языка:

```sql
SELECT naiveBayesClassifier('language', 'How are you?');
```

```response
┌─naiveBayesClassifier('language', 'How are you?')─┐
│ 0                                                │
└──────────────────────────────────────────────────┘
```

_Результат `0` может представлять английский язык, а `1` — французский; значения классов зависят от обучающих данных._

---

### Детали реализации {#implementation-details}

**Алгоритм**
Использует алгоритм наивной байесовской классификации со [сглаживанием Лапласа](https://en.wikipedia.org/wiki/Additive_smoothing) для обработки неизвестных n-грамм на основе вероятностей n-грамм согласно [этому источнику](https://web.stanford.edu/~jurafsky/slp3/4.pdf).

**Ключевые особенности**

- Поддержка n-грамм любого размера
- Три режима токенизации:
  - `byte`: работает с необработанными байтами. Каждый байт является одним токеном.
  - `codepoint`: работает со скалярными значениями Unicode, декодированными из UTF‑8. Каждая кодовая точка является одним токеном.
  - `token`: разделяет по последовательностям пробельных символов Unicode (регулярное выражение \s+). Токены представляют собой подстроки без пробелов; пунктуация является частью токена, если она примыкает (например, "you?" — это один токен).

---

### Конфигурация модели {#model-configuration}

Пример исходного кода для создания модели наивного байесовского классификатора для определения языка можно найти [здесь](https://github.com/nihalzp/ClickHouse-NaiveBayesClassifier-Models).

Кроме того, примеры моделей и связанные с ними конфигурационные файлы доступны [здесь](https://github.com/nihalzp/ClickHouse-NaiveBayesClassifier-Models/tree/main/models).

Вот пример конфигурации модели наивного байесовского классификатора в ClickHouse:

```xml
<clickhouse>
    <nb_models>
        <model>
            <name>sentiment</name>
            <path>/etc/clickhouse-server/config.d/sentiment.bin</path>
            <n>2</n>
            <mode>token</mode>
            <alpha>1.0</alpha>
            <priors>
                <prior>
                    <class>0</class>
                    <value>0.6</value>
                </prior>
                <prior>
                    <class>1</class>
                    <value>0.4</value>
                </prior>
            </priors>
        </model>
    </nb_models>
</clickhouse>
```

**Параметры конфигурации**

| Параметр   | Описание                                                                                                           | Пример                                                   | По умолчанию       |
| ---------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- | ------------------ |
| **name**   | Уникальный идентификатор модели                                                                                    | `language_detection`                                     | _Обязательный_     |
| **path**   | Полный путь к бинарному файлу модели                                                                               | `/etc/clickhouse-server/config.d/language_detection.bin` | _Обязательный_     |
| **mode**   | Метод токенизации:<br/>- `byte`: байтовые последовательности<br/>- `codepoint`: символы Unicode<br/>- `token`: словесные токены | `token`                                                  | _Обязательный_     |
| **n**      | Размер n-граммы (режим `token`):<br/>- `1`=одно слово<br/>- `2`=пары слов<br/>- `3`=тройки слов                    | `2`                                                      | _Обязательный_     |
| **alpha**  | Коэффициент сглаживания Лапласа, используемый при классификации для обработки n-грамм, отсутствующих в модели     | `0.5`                                                    | `1.0`              |
| **priors** | Вероятности классов (% документов, принадлежащих классу)                                                           | 60% класс 0, 40% класс 1                                 | Равномерное распределение |

**Руководство по обучению модели**


**Формат файла**
В человекочитаемом формате для `n=1` и режима `token` модель может выглядеть следующим образом:

```text
<class_id> <n-gram> <count>
0 excellent 15
1 refund 28
```

Для `n=3` и режима `codepoint` она может выглядеть так:

```text
<class_id> <n-gram> <count>
0 exc 15
1 ref 28
```

Человекочитаемый формат не используется ClickHouse напрямую; его необходимо преобразовать в бинарный формат, описанный ниже.

**Детали бинарного формата**
Каждая n-грамма хранится в следующем виде:

1. 4-byte `class_id` (UInt, little-endian)
2. 4-byte `n-gram` bytes length (UInt, little-endian)
3. Raw `n-gram` bytes
4. 4-byte `count` (UInt, little-endian)

**Требования к предобработке**
Перед созданием модели из корпуса документов документы должны быть предобработаны для извлечения n-грамм в соответствии с указанными параметрами `mode` и `n`. Следующие шаги описывают процесс предобработки:

1. **Добавьте граничные маркеры в начало и конец каждого документа в зависимости от режима токенизации:**
   - **Byte**: `0x01` (начало), `0xFF` (конец)
   - **Codepoint**: `U+10FFFE` (начало), `U+10FFFF` (конец)
   - **Token**: `<s>` (начало), `</s>` (конец)

   _Примечание:_ `(n - 1)` токенов добавляются как в начало, так и в конец документа.

2. **Пример для `n=3` в режиме `token`:**
   - **Документ:** `"ClickHouse is fast"`
   - **После обработки:** `<s> <s> ClickHouse is fast </s> </s>`
   - **Сгенерированные триграммы:**
     - `<s> <s> ClickHouse`
     - `<s> ClickHouse is`
     - `ClickHouse is fast`
     - `is fast </s>`
     - `fast </s> </s>`

Для упрощения создания модели в режимах `byte` и `codepoint` может быть удобно сначала токенизировать документ на токены (список `byte` для режима `byte` и список `codepoint` для режима `codepoint`). Затем добавить `n - 1` начальных токенов в начало и `n - 1` конечных токенов в конец документа. Наконец, сгенерировать n-граммы и записать их в сериализованный файл.

---

<!--
The inner content of the tags below are replaced at doc framework build time with
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
