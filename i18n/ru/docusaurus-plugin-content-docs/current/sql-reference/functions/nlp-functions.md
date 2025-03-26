---
description: 'Документация по функциям обработки естественного языка (NLP)'
sidebar_label: 'NLP'
sidebar_position: 130
slug: /sql-reference/functions/nlp-functions
title: 'Функции обработки естественного языка (NLP)'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Функции обработки естественного языка (NLP)

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::warning
Это экспериментальная функция, которая в настоящее время находится в разработке и не готова к общему использованию. Она может изменяться в непредсказуемые несовместимые с предыдущими версиями способы в будущих релизах. Установите `allow_experimental_nlp_functions = 1`, чтобы включить ее.
:::

## detectCharset {#detectcharset}

Функция `detectCharset` определяет набор символов входной строки, не закодированной в UTF8.

*Синтаксис*

```sql
detectCharset('text_to_be_analyzed')
```

*Аргументы*

- `text_to_be_analyzed` — Коллекция (или предложения) строк для анализа. [String](/sql-reference/data-types/string).

*Возвращаемое значение*

- Строка (`String`), содержащая код определенного набора символов.

*Примеры*

Запрос:

```sql
SELECT detectCharset('Ich bleibe für ein paar Tage.');
```

Результат:

```response
┌─detectCharset('Ich bleibe für ein paar Tage.')─┐
│ WINDOWS-1252                                   │
└────────────────────────────────────────────────┘
```

## detectLanguage {#detectlanguage}

Определяет язык входной строки, закодированной в UTF8. Функция использует [Библиотеку CLD2](https://github.com/CLD2Owners/cld2) для определения языка и возвращает 2-буквенный ISO код языка.

Функция `detectLanguage` работает лучше всего при предоставлении более 200 символов во входной строке.

*Синтаксис*

```sql
detectLanguage('text_to_be_analyzed')
```

*Аргументы*

- `text_to_be_analyzed` — Коллекция (или предложения) строк для анализа. [String](/sql-reference/data-types/string).

*Возвращаемое значение*

- 2-буквенный ISO код определенного языка.

Другие возможные результаты:

- `un` = неизвестно, язык не может быть определен.
- `other` = определенный язык не имеет 2-буквенного кода.

*Примеры*

Запрос:

```sql
SELECT detectLanguage('Je pense que je ne parviendrai jamais à parler français comme un natif. Where there's a will, there's a way.');
```

Результат:

```response
fr
```

## detectLanguageMixed {#detectlanguagemixed}

Похоже на функцию `detectLanguage`, но `detectLanguageMixed` возвращает `Map` 2-буквенных кодов языков, сопоставленных с процентом определенного языка в тексте.

*Синтаксис*

```sql
detectLanguageMixed('text_to_be_analyzed')
```

*Аргументы*

- `text_to_be_analyzed` — Коллекция (или предложения) строк для анализа. [String](/sql-reference/data-types/string).

*Возвращаемое значение*

- `Map(String, Float32)`: Ключи - 2-буквенные ISO коды, а значения - процент текста, найденного для этого языка.

*Примеры*

Запрос:

```sql
SELECT detectLanguageMixed('二兎を追う者は一兎をも得ず二兎を追う者は一兎をも得ず A vaincre sans peril, on triomphe sans gloire.');
```

Результат:

```response
┌─detectLanguageMixed()─┐
│ {'ja':0.62,'fr':0.36  │
└───────────────────────┘
```

## detectProgrammingLanguage {#detectprogramminglanguage}

Определяет язык программирования по исходному коду. Вычисляет все униграммы и биграммы команд в исходном коде. Затем, используя размеченный словарь с весами униграмм и биграмм команд для различных языков программирования, находит максимальный вес языка программирования и возвращает его.

*Синтаксис*

```sql
detectProgrammingLanguage('source_code')
```

*Аргументы*

- `source_code` — Строковое представление исходного кода для анализа. [String](/sql-reference/data-types/string).

*Возвращаемое значение*

- Язык программирования. [String](../data-types/string.md).

*Примеры*

Запрос:

```sql
SELECT detectProgrammingLanguage('#include <iostream>');
```

Результат:

```response
┌─detectProgrammingLanguage('#include <iostream>')─┐
│ C++                                              │
└──────────────────────────────────────────────────┘
```

## detectLanguageUnknown {#detectlanguageunknown}

Похоже на функцию `detectLanguage`, за исключением того, что функция `detectLanguageUnknown` работает со строками, не закодированными в UTF8. Предпочитайте эту версию, когда ваш набор символов - UTF-16 или UTF-32.

*Синтаксис*

```sql
detectLanguageUnknown('text_to_be_analyzed')
```

*Аргументы*

- `text_to_be_analyzed` — Коллекция (или предложения) строк для анализа. [String](/sql-reference/data-types/string).

*Возвращаемое значение*

- 2-буквенный ISO код определенного языка.

Другие возможные результаты:

- `un` = неизвестно, язык не может быть определен.
- `other` = определенный язык не имеет 2-буквенного кода.

*Примеры*

Запрос:

```sql
SELECT detectLanguageUnknown('Ich bleibe für ein paar Tage.');
```

Результат:

```response
┌─detectLanguageUnknown('Ich bleibe für ein paar Tage.')─┐
│ de                                                     │
└────────────────────────────────────────────────────────┘
```

## detectTonality {#detecttonality}

Определяет тональность текстовых данных. Использует размеченный словарь эмоциональной тональности, в котором каждому слову присвоена тональность от `-12` до `6`. Для каждого текста вычисляет среднее значение тональности его слов и возвращает его в диапазоне `[-1,1]`.

:::note
Эта функция ограничена в текущей форме. В настоящее время она использует встроенный эмоциональный словарь по адресу `/contrib/nlp-data/tonality_ru.zst` и работает только для русского языка.
:::

*Синтаксис*

```sql
detectTonality(text)
```

*Аргументы*

- `text` — Текст для анализа. [String](/sql-reference/data-types/string).

*Возвращаемое значение*

- Среднее значение тональности слов в `text`. [Float32](../data-types/float.md).

*Примеры*

Запрос:

```sql
SELECT detectTonality('Шарик - хороший пёс'), -- Sharik is a good dog 
       detectTonality('Шарик - пёс'), -- Sharik is a dog
       detectTonality('Шарик - плохой пёс'); -- Sharkik is a bad dog
```

Результат:

```response
┌─detectTonality('Шарик - хороший пёс')─┬─detectTonality('Шарик - пёс')─┬─detectTonality('Шарик - плохой пёс')─┐
│                               0.44445 │                             0 │                                 -0.3 │
└───────────────────────────────────────┴───────────────────────────────┴──────────────────────────────────────┘
```
## lemmatize {#lemmatize}

Выполняет лемматизацию заданного слова. Для работы необходимы словари, которые можно получить [здесь](https://github.com/vpodpecan/lemmagen3/tree/master/src/lemmagen3/models).

*Синтаксис*

```sql
lemmatize('language', word)
```

*Аргументы*

- `language` — Язык, к которому будут применяться правила. [String](/sql-reference/data-types/string).
- `word` — Слово, которое нужно лемматизировать. Должно быть написано с маленькой буквы. [String](/sql-reference/data-types/string).

*Примеры*

Запрос:

```sql
SELECT lemmatize('en', 'wolves');
```

Результат:

```text
┌─lemmatize("wolves")─┐
│              "wolf" │
└─────────────────────┘
```

*Конфигурация*

Эта конфигурация указывает на то, что словарь `en.bin` должен использоваться для лемматизации английских (`en`) слов. Файлы с расширением `.bin` можно скачать с
[здесь](https://github.com/vpodpecan/lemmagen3/tree/master/src/lemmagen3/models).

```xml
<lemmatizers>
    <lemmatizer>
        <!-- highlight-start -->
        <lang>en</lang>
        <path>en.bin</path>
        <!-- highlight-end -->
    </lemmatizer>
</lemmatizers>
```

## stem {#stem}

Выполняет стемминг заданного слова.

*Синтаксис*

```sql
stem('language', word)
```

*Аргументы*

- `language` — Язык, к которому будут применяться правила. Используйте 2-буквенный [ISO 639-1 код](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).
- `word` — слово, которое нужно стеммировать. Должно быть написано с маленькой буквы. [String](/sql-reference/data-types/string).

*Примеры*

Запрос:

```sql
SELECT arrayMap(x -> stem('en', x), ['I', 'think', 'it', 'is', 'a', 'blessing', 'in', 'disguise']) as res;
```

Результат:

```text
┌─res────────────────────────────────────────────────┐
│ ['I','think','it','is','a','bless','in','disguis'] │
└────────────────────────────────────────────────────┘
```
*Поддерживаемые языки для stem()*

:::note
Функция stem() использует библиотеку [Snowball stemming](https://snowballstem.org/), смотрите веб-сайт Snowball для обновленных языков и т.д.
:::

- Арабский
- Армянский
- Баскский
- Каталонский
- Датский
- Нидерландский
- Английский
- Финский
- Французский
- Немецкий
- Греческий
- Хинди
- Венгерский
- Индонезийский
- Ирландский
- Итальянский
- Литовский
- Непальский
- Норвежский
- Портер
- Португальский
- Румынский
- Русский
- Сербский
- Испанский
- Шведский
- Тамильский
- Турецкий
- Идиш

## synonyms {#synonyms}

Находит синонимы к заданному слову. Существуют два типа расширений синонимов: `plain` и `wordnet`.

С типом расширения `plain` необходимо предоставить путь к простому текстовому файлу, где каждая строка соответствует определенному набору синонимов. Слова в этой строке должны быть разделены пробелами или табуляцией.

С типом расширения `wordnet` необходимо предоставить путь к директории с тезаурусом WordNet. Тезаурус должен содержать индекс смыслов WordNet.

*Синтаксис*

```sql
synonyms('extension_name', word)
```

*Аргументы*

- `extension_name` — Имя расширения, в котором будет производиться поиск. [String](/sql-reference/data-types/string).
- `word` — Слово, которое будет искаться в расширении. [String](/sql-reference/data-types/string).

*Примеры*

Запрос:

```sql
SELECT synonyms('list', 'important');
```

Результат:

```text
┌─synonyms('list', 'important')────────────┐
│ ['important','big','critical','crucial'] │
└──────────────────────────────────────────┘
```

*Конфигурация*
```xml
<synonyms_extensions>
    <extension>
        <name>en</name>
        <type>plain</type>
        <path>en.txt</path>
    </extension>
    <extension>
        <name>en</name>
        <type>wordnet</type>
        <path>en/</path>
    </extension>
</synonyms_extensions>
```
