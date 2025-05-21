---
'description': '自然语言处理 (NLP) 函数文档'
'sidebar_label': 'NLP'
'sidebar_position': 130
'slug': '/sql-reference/functions/nlp-functions'
'title': '自然语言处理 (NLP) 函数'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 自然语言处理 (NLP) 函数

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::warning
这是一个正在开发中的实验性功能，尚未准备好供一般使用。在未来的版本中，它将以不可预测的方式发生不兼容的变化。设置 `allow_experimental_nlp_functions = 1` 来启用它。
:::

## detectCharset {#detectcharset}

`detectCharset` 函数检测非 UTF8 编码输入字符串的字符集。

*语法*

```sql
detectCharset('text_to_be_analyzed')
```

*参数*

- `text_to_be_analyzed` — 要分析的字符串集合（或句子）。 [String](/sql-reference/data-types/string)。

*返回值*

- 一个包含检测到的字符集代码的 `String`

*示例*

查询：

```sql
SELECT detectCharset('Ich bleibe für ein paar Tage.');
```

结果：

```response
┌─detectCharset('Ich bleibe für ein paar Tage.')─┐
│ WINDOWS-1252                                   │
└────────────────────────────────────────────────┘
```

## detectLanguage {#detectlanguage}

检测 UTF8 编码输入字符串的语言。该函数使用 [CLD2 库](https://github.com/CLD2Owners/cld2)进行检测，并返回 2 字母 ISO 语言代码。

当输入字符串提供超过 200 个字符时，`detectLanguage` 函数效果最佳。

*语法*

```sql
detectLanguage('text_to_be_analyzed')
```

*参数*

- `text_to_be_analyzed` — 要分析的字符串集合（或句子）。 [String](/sql-reference/data-types/string)。

*返回值*

- 检测到的语言的 2 字母 ISO 代码

其他可能的结果：

- `un` = 未知，无法检测任何语言。
- `other` = 检测到的语言没有 2 字母代码。

*示例*

查询：

```sql
SELECT detectLanguage('Je pense que je ne parviendrai jamais à parler français comme un natif. Where there's a will, there's a way.');
```

结果：

```response
fr
```

## detectLanguageMixed {#detectlanguagemixed}

与 `detectLanguage` 函数类似，但 `detectLanguageMixed` 返回一个 2 字母语言代码的 `Map`，它们映射到文本中某种语言所占的百分比。

*语法*

```sql
detectLanguageMixed('text_to_be_analyzed')
```

*参数*

- `text_to_be_analyzed` — 要分析的字符串集合（或句子）。 [String](/sql-reference/data-types/string)。

*返回值*

- `Map(String, Float32)`：键是 2 字母 ISO 代码，值是该语言在文本中所占的百分比。

*示例*

查询：

```sql
SELECT detectLanguageMixed('二兎を追う者は一兎をも得ず二兎を追う者は一兎をも得ず A vaincre sans peril, on triomphe sans gloire.');
```

结果：

```response
┌─detectLanguageMixed()─┐
│ {'ja':0.62,'fr':0.36  │
└───────────────────────┘
```

## detectProgrammingLanguage {#detectprogramminglanguage}

从源代码中确定编程语言。计算源代码中所有命令的单字和双字组合的权重。
然后使用带有权重的标记字典，查找不同编程语言的命令的单字和双字组合的最大权重，并返回它。

*语法*

```sql
detectProgrammingLanguage('source_code')
```

*参数*

- `source_code` — 要分析的源代码的字符串表示。 [String](/sql-reference/data-types/string)。

*返回值*

- 编程语言。 [String](../data-types/string.md)。

*示例*

查询：

```sql
SELECT detectProgrammingLanguage('#include <iostream>');
```

结果：

```response
┌─detectProgrammingLanguage('#include <iostream>')─┐
│ C++                                              │
└──────────────────────────────────────────────────┘
```

## detectLanguageUnknown {#detectlanguageunknown}

与 `detectLanguage` 函数类似，`detectLanguageUnknown` 函数处理非 UTF8 编码字符串。当您的字符集为 UTF-16 或 UTF-32 时，建议使用此版本。

*语法*

```sql
detectLanguageUnknown('text_to_be_analyzed')
```

*参数*

- `text_to_be_analyzed` — 要分析的字符串集合（或句子）。 [String](/sql-reference/data-types/string)。

*返回值*

- 检测到的语言的 2 字母 ISO 代码

其他可能的结果：

- `un` = 未知，无法检测任何语言。
- `other` = 检测到的语言没有 2 字母代码。

*示例*

查询：

```sql
SELECT detectLanguageUnknown('Ich bleibe für ein paar Tage.');
```

结果：

```response
┌─detectLanguageUnknown('Ich bleibe für ein paar Tage.')─┐
│ de                                                     │
└────────────────────────────────────────────────────────┘
```

## detectTonality {#detecttonality}

确定文本数据的情感。使用带标记的情感字典，其中每个单词的情感范围从 `-12` 到 `6`。
对于每个文本，它计算其单词的平均情感值，并在 `[-1,1]` 范围内返回。

:::note
此函数在当前形式上有限。当前它利用嵌入的情感字典 `/contrib/nlp-data/tonality_ru.zst`，并且仅适用于俄语。
:::

*语法*

```sql
detectTonality(text)
```

*参数*

- `text` — 要分析的文本。 [String](/sql-reference/data-types/string)。

*返回值*

- `text` 中单词的平均情感值。 [Float32](../data-types/float.md)。

*示例*

查询：

```sql
SELECT detectTonality('Шарик - хороший пёс'), -- Sharik is a good dog 
       detectTonality('Шарик - пёс'), -- Sharik is a dog
       detectTonality('Шарик - плохой пёс'); -- Sharkik is a bad dog
```

结果：

```response
┌─detectTonality('Шарик - хороший пёс')─┬─detectTonality('Шарик - пёс')─┬─detectTonality('Шарик - плохой пёс')─┐
│                               0.44445 │                             0 │                                 -0.3 │
└───────────────────────────────────────┴───────────────────────────────┴──────────────────────────────────────┘
```

## lemmatize {#lemmatize}

对给定的单词进行词形还原。需要字典来操作，可以在 [此处](https://github.com/vpodpecan/lemmagen3/tree/master/src/lemmagen3/models) 获取。

*语法*

```sql
lemmatize('language', word)
```

*参数*

- `language` — 将应用规则的语言。 [String](/sql-reference/data-types/string)。
- `word` — 需要进行词形还原的单词。必须为小写。 [String](/sql-reference/data-types/string)。

*示例*

查询：

```sql
SELECT lemmatize('en', 'wolves');
```

结果：

```text
┌─lemmatize("wolves")─┐
│              "wolf" │
└─────────────────────┘
```

*配置*

此配置指定使用字典 `en.bin` 对英语 (`en`) 单词进行词形还原。`.bin` 文件可以从 
[此处](https://github.com/vpodpecan/lemmagen3/tree/master/src/lemmagen3/models) 下载。

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

对给定的单词进行词干提取。

*语法*

```sql
stem('language', word)
```

*参数*

- `language` — 将应用规则的语言。使用两个字母的 [ISO 639-1 代码](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)。
- `word` — 需要进行词干提取的单词。必须是小写。 [String](/sql-reference/data-types/string)。

*示例*

查询：

```sql
SELECT arrayMap(x -> stem('en', x), ['I', 'think', 'it', 'is', 'a', 'blessing', 'in', 'disguise']) as res;
```

结果：

```text
┌─res────────────────────────────────────────────────┐
│ ['I','think','it','is','a','bless','in','disguis'] │
└────────────────────────────────────────────────────┘
```

*支持语言 stem()*

:::note
stem() 函数使用 [Snowball 词干提取](https://snowballstem.org/) 库，详见 Snowball 网站以获取最新的语言等信息。
:::

- 阿拉伯语
- 亚美尼亚语
- 巴斯克语
- 加泰罗尼亚语
- 丹麦语
- 荷兰语
- 英语
- 芬兰语
- 法语
- 德语
- 希腊语
- 印地语
- 匈牙利语
- 印度尼西亚语
- 爱尔兰语
- 意大利语
- 立陶宛语
- 尼泊尔语
- 挪威语
- 波特
- 葡萄牙语
- 罗马尼亚语
- 俄语
- 塞尔维亚语
- 西班牙语
- 瑞典语
- 泰米尔语
- 土耳其语
- 意第绪语

## synonyms {#synonyms}

查找给定单词的同义词。存在两种类型的同义词扩展：`plain` 和 `wordnet`。

使用 `plain` 扩展类型时，我们需要提供简单文本文件的路径，其中每一行对应于特定的同义词集。此行中的单词必须以空格或制表符分隔。

使用 `wordnet` 扩展类型时，我们需要提供包含 WordNet 词典的目录的路径。词典必须包含 WordNet 意义索引。

*语法*

```sql
synonyms('extension_name', word)
```

*参数*

- `extension_name` — 将进行搜索的扩展名称。 [String](/sql-reference/data-types/string)。
- `word` — 要在扩展中搜索的单词。 [String](/sql-reference/data-types/string)。

*示例*

查询：

```sql
SELECT synonyms('list', 'important');
```

结果：

```text
┌─synonyms('list', 'important')────────────┐
│ ['important','big','critical','crucial'] │
└──────────────────────────────────────────┘
```

*配置*
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
