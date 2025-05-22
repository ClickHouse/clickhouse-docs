---
'description': '自然语言处理 (NLP) 函数的文档'
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
这是一个实验性功能，目前正在开发中，尚未准备好供一般使用。在未来的版本中，它将以不可预测的向后不兼容的方式发生变化。请设置 `allow_experimental_nlp_functions = 1` 以启用它。
:::

## detectCharset {#detectcharset}

`detectCharset` 函数检测非 UTF8 编码输入字符串的字符集。

*语法*

```sql
detectCharset('text_to_be_analyzed')
```

*参数*

- `text_to_be_analyzed` — 需要分析的一系列字符串（或句子）。 [String](/sql-reference/data-types/string)。

*返回值*

- 一个包含检测到的字符集的代码的 `String`

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

检测 UTF8 编码输入字符串的语言。该函数使用 [CLD2 library](https://github.com/CLD2Owners/cld2) 进行检测，并返回 2 字母 ISO 语言代码。

`detectLanguage` 函数在输入字符串提供超过 200 个字符时效果最佳。

*语法*

```sql
detectLanguage('text_to_be_analyzed')
```

*参数*

- `text_to_be_analyzed` — 需要分析的一系列字符串（或句子）。 [String](/sql-reference/data-types/string)。

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

与 `detectLanguage` 函数类似，但 `detectLanguageMixed` 返回一个 2 字母语言代码的 `Map`，该代码与文本中某种语言的百分比相映射。

*语法*

```sql
detectLanguageMixed('text_to_be_analyzed')
```

*参数*

- `text_to_be_analyzed` — 需要分析的一系列字符串（或句子）。 [String](/sql-reference/data-types/string)。

*返回值*

- `Map(String, Float32)`：键是 2 字母 ISO 代码，值是该语言的文本百分比

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

从源代码中确定编程语言。计算源代码中的所有 unigram 和 bigram 命令。
然后使用带权重的标记字典查找各种编程语言的 unigram 和 bigram 命令，以找到编程语言的最大权重并返回它。

*语法*

```sql
detectProgrammingLanguage('source_code')
```

*参数*

- `source_code` — 需要分析的源代码的字符串表示。 [String](/sql-reference/data-types/string)。

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

与 `detectLanguage` 函数类似，但 `detectLanguageUnknown` 函数处理非 UTF8 编码字符串。当字符集为 UTF-16 或 UTF-32 时，优先使用此版本。

*语法*

```sql
detectLanguageUnknown('text_to_be_analyzed')
```

*参数*

- `text_to_be_analyzed` — 需要分析的一系列字符串（或句子）。 [String](/sql-reference/data-types/string)。

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

确定文本数据的情感。使用带标记的情感字典，其中每个单词的情感范围为 `-12` 到 `6`。
对于每段文本，它计算其单词的平均情感值并返回该值，范围为 `[-1,1]`。

:::note
此函数在当前版本中受限。当前它使用嵌入式情感字典 `/contrib/nlp-data/tonality_ru.zst`，仅适用于俄语。
:::

*语法*

```sql
detectTonality(text)
```

*参数*

- `text` — 需要分析的文本。 [String](/sql-reference/data-types/string)。

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

对给定单词执行词形还原。需要字典才能操作，可以在 [这里](https://github.com/vpodpecan/lemmagen3/tree/master/src/lemmagen3/models) 获取。

*语法*

```sql
lemmatize('language', word)
```

*参数*

- `language` — 将应用于的语言规则。 [String](/sql-reference/data-types/string)。
- `word` — 需要词形还原的单词。必须为小写。 [String](/sql-reference/data-types/string)。

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

此配置指定应使用字典 `en.bin` 对英语 (`en`) 单词进行词形还原。 `.bin` 文件可以从
[这里](https://github.com/vpodpecan/lemmagen3/tree/master/src/lemmagen3/models) 下载。

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

对给定单词执行词干提取。

*语法*

```sql
stem('language', word)
```

*参数*

- `language` — 将应用于的语言规则。使用两个字母的 [ISO 639-1 代码](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)。
- `word` — 需要词干提取的单词。必须为小写。 [String](/sql-reference/data-types/string)。

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
*支持的语言用于 stem()*

:::note
stem() 函数使用 [Snowball stemming](https://snowballstem.org/) 库，请访问 Snowball 网站获取最新的语言等信息。
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
- 印尼语
- 爱尔兰语
- 意大利语
- 立陶宛语
- 尼泊尔语
- 挪威语
- Porter
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

查找给定单词的同义词。有两种类型的同义词扩展：`plain` 和 `wordnet`。

使用 `plain` 扩展类型时，我们需要提供一个简单文本文件的路径，其中每一行对应某个同义词集合。此行中的单词必须用空格或制表符分隔。

使用 `wordnet` 扩展类型时，我们需要提供一个包含 WordNet 词库的目录的路径。词库必须包含 WordNet 词义索引。

*语法*

```sql
synonyms('extension_name', word)
```

*参数*

- `extension_name` — 将执行搜索的扩展名称。 [String](/sql-reference/data-types/string)。
- `word` — 将在扩展中搜索的单词。 [String](/sql-reference/data-types/string)。

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
