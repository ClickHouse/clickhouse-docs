---
description: 'Документация для функций обработки естественного языка (NLP)'
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
Это экспериментальная функция, которая в настоящее время находится в разработке и не готова к общему использованию. Она будет изменяться непредсказуемым образом с несовместимыми изменениями в будущих релизах. Установите `allow_experimental_nlp_functions = 1`, чтобы активировать её.
:::

## detectCharset {#detectcharset}

Функция `detectCharset` определяет кодировку входной строки, не закодированной в UTF8.

*Синтаксис*

```sql
detectCharset('text_to_be_analyzed')
```

*Аргументы*

- `text_to_be_analyzed` — Набор (или предложения) строк для анализа. [String](/sql-reference/data-types/string).

*Возвращаемое значение*

- `String`, содержащая код определенной кодировки

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

Определяет язык входной строки, закодированной в UTF8. Функция использует [библиотеку CLD2](https://github.com/CLD2Owners/cld2) для определения языка и возвращает 2-буквенный код языка по стандарту ISO.

Функция `detectLanguage` работает наилучшим образом при наличии более 200 символов во входной строке.

*Синтаксис*

```sql
detectLanguage('text_to_be_analyzed')
```

*Аргументы*

- `text_to_be_analyzed` — Набор (или предложения) строк для анализа. [String](/sql-reference/data-types/string).

*Возвращаемое значение*

- 2-буквенный код языка, который был определен

Другие возможные результаты:

- `un` = неизвестно, не удается определить язык.
- `other` = обнаруженный язык не имеет 2-буквенного кода.

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

Похожие на функцию `detectLanguage`, но `detectLanguageMixed` возвращает `Map` 2-буквенных языковых кодов, сопоставленных с процентом определенного языка в тексте.

*Синтаксис*

```sql
detectLanguageMixed('text_to_be_analyzed')
```

*Аргументы*

- `text_to_be_analyzed` — Набор (или предложения) строк для анализа. [String](/sql-reference/data-types/string).

*Возвращаемое значение*

- `Map(String, Float32)`: Ключи — это 2-буквенные коды по стандарту ISO, а значения — это процент текста, найденного для этого языка.

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

Определяет язык программирования из исходного кода. Вычисляет все униграммы и биграммы команд в исходном коде. Затем, используя размеченный словарь с весами униграмм и биграмм команд для различных языков программирования, находит язык с наибольшим весом и возвращает его.

*Синтаксис*

```sql
detectProgrammingLanguage('source_code')
```

*Аргументы*

- `source_code` — строковое представление исходного кода для анализа. [String](/sql-reference/data-types/string).

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

Похожая на функцию `detectLanguage`, однако функция `detectLanguageUnknown` работает с не закодированными в UTF8 строками. Предпочитайте эту версию, когда ваша кодировка — UTF-16 или UTF-32.

*Синтаксис*

```sql
detectLanguageUnknown('text_to_be_analyzed')
```

*Аргументы*

- `text_to_be_analyzed` — Набор (или предложения) строк для анализа. [String](/sql-reference/data-types/string).

*Возвращаемое значение*

- 2-буквенный код языка, который был определен

Другие возможные результаты:

- `un` = неизвестно, не удается определить язык.
- `other` = обнаруженный язык не имеет 2-буквенного кода.

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

Определяет тональность текстовых данных. Использует размеченный словарь тональности, в котором каждому слову присваивается тональность в диапазоне от `-12` до `6`. Для каждого текста вычисляется среднее значение тональности его слов и возвращается в диапазоне `[-1,1]`.

:::note
Эта функция ограничена в своей текущей форме. В настоящее время она использует встроенный эмоциональный словарь по адресу `/contrib/nlp-data/tonality_ru.zst` и работает только для русского языка.
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
SELECT detectTonality('Шарик - хороший пёс'), -- Шарик - хороший пёс 
       detectTonality('Шарик - пёс'), -- Шарик - пёс
       detectTonality('Шарик - плохой пёс'); -- Шарик - плохой пёс
```

Результат:

```response
┌─detectTonality('Шарик - хороший пёс')─┬─detectTonality('Шарик - пёс')─┬─detectTonality('Шарик - плохой пёс')─┐
│                               0.44445 │                             0 │                                 -0.3 │
└───────────────────────────────────────┴───────────────────────────────┴──────────────────────────────────────┘
```
## lemmatize {#lemmatize}

Выполняет лемматизацию заданного слова. Для работы нужны словари, которые можно получить [здесь](https://github.com/vpodpecan/lemmagen3/tree/master/src/lemmagen3/models).

*Синтаксис*

```sql
lemmatize('language', word)
```

*Аргументы*

- `language` — Язык, к правилам которого будет применяться. [String](/sql-reference/data-types/string).
- `word` — Слово, требующее лемматизации. Должно быть написано в нижнем регистре. [String](/sql-reference/data-types/string).

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

Эта конфигурация указывает, что словарь `en.bin` должен использоваться для лемматизации английских (`en`) слов. Файлы с расширением `.bin` можно скачать по адресу
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

- `language` — Язык, к правилам которого будет применяться. Используйте 2-буквенный [ISO 639-1 код](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).
- `word` — слово, которое нужно привести к корню. Должно быть написано в нижнем регистре. [String](/sql-reference/data-types/string).

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
Функция stem() использует библиотеку [Snowball stemming](https://snowballstem.org/), смотрите сайт Snowball для обновлений языков и т. д.
:::

- арабский
- армянский
- баскский
- каталанский
- датский
- нидерландский
- английский
- финский
- французский
- немецкий
- греческий
- хинди
- венгерский
- индонезийский
- ирландский
- итальянский
- литовский
- непальский
- норвежский
- Портер
- португальский
- румынский
- русский
- сербский
- испанский
- шведский
- тамильский
- турецкий
- идиш

## synonyms {#synonyms}

Находит синонимы к заданному слову. Существуют два типа расширений синонимов: `plain` и `wordnet`.

При типе расширения `plain` необходимо указать путь к простому текстовому файлу, в котором каждая строка соответствует определенному набору синонимов. Слова в этой строке должны разделяться пробелами или символами табуляции.

При типе расширения `wordnet` необходимо указать путь к каталогу с тезаурусом WordNet. Тезаурус должен содержать индекс смыслов WordNet.

*Синтаксис*

```sql
synonyms('extension_name', word)
```

*Аргументы*

- `extension_name` — Название расширения, в котором будет выполнен поиск. [String](/sql-reference/data-types/string).
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
