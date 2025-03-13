---
slug: /sql-reference/functions/nlp-functions
sidebar_position: 130
sidebar_label: '自然语言处理 (NLP)'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 自然语言处理 (NLP) 函数

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::warning
这是一个实验性功能，目前正在开发中，尚未准备好供一般使用。它将在未来版本中以不可预测的不向后兼容的方式更改。设置 `allow_experimental_nlp_functions = 1` 来启用它。
:::

## detectCharset {#detectcharset}

`detectCharset` 函数用于检测非UTF8编码输入字符串的字符集。

*语法*

``` sql
detectCharset('待分析的文本')
```

*参数*

- `待分析的文本` — 待分析的字符串集合（或句子）。[String](/sql-reference/data-types/string)。

*返回值*

- 包含检测到的字符集代码的 `String`

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

检测UTF8编码输入字符串的语言。该函数使用 [CLD2库](https://github.com/CLD2Owners/cld2) 进行检测，并返回2字母的ISO语言代码。

`detectLanguage` 函数在输入字符串提供超过200个字符时效果最佳。

*语法*

``` sql
detectLanguage('待分析的文本')
```

*参数*

- `待分析的文本` — 待分析的字符串集合（或句子）。[String](/sql-reference/data-types/string)。

*返回值*

- 检测到的语言的2字母ISO代码

其他可能的结果：

- `un` = 未知，无法检测任何语言。
- `other` = 检测到的语言没有2字母代码。

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

与 `detectLanguage` 函数类似，但 `detectLanguageMixed` 返回一个将2字母语言代码映射到文本中某种语言百分比的 `Map`。

*语法*

``` sql
detectLanguageMixed('待分析的文本')
```

*参数*

- `待分析的文本` — 待分析的字符串集合（或句子）。[String](/sql-reference/data-types/string)。

*返回值*

- `Map(String, Float32)`：键是2字母ISO代码，值是该语言文本所占的百分比

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

确定源代码的编程语言。计算源代码中的所有单字和双字命令。然后使用带权重的标记字典找到编程语言的最大权重并返回它。

*语法*

``` sql
detectProgrammingLanguage('源代码')
```

*参数*

- `源代码` — 待分析的源代码的字符串表示。 [String](/sql-reference/data-types/string)。

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

与 `detectLanguage` 函数类似，但 `detectLanguageUnknown` 函数处理非UTF8编码的字符串。当字符集为UTF-16或UTF-32时，请优先使用此版本。

*语法*

``` sql
detectLanguageUnknown('待分析的文本')
```

*参数*

- `待分析的文本` — 待分析的字符串集合（或句子）。[String](/sql-reference/data-types/string)。

*返回值*

- 检测到的语言的2字母ISO代码

其他可能的结果：

- `un` = 未知，无法检测任何语言。
- `other` = 检测到的语言没有2字母代码。

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

确定文本数据的情感。使用带标记的情感字典，其中每个词的情感范围从 `-12` 到 `6`。对于每个文本，它计算其词的平均情感值，并在范围 `[-1,1]` 内返回。

:::note
该函数在当前形式下有限制。目前它使用位于 `/contrib/nlp-data/tonality_ru.zst` 的嵌入情感字典，并仅适用于俄语。
:::

*语法*

``` sql
detectTonality(text)
```

*参数*

- `text` — 待分析的文本。 [String](/sql-reference/data-types/string)。

*返回值*

- `text` 中词的平均情感值。 [Float32](../data-types/float.md)。

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

对给定的单词进行词形还原。需要字典才能操作，可以[在这里](https://github.com/vpodpecan/lemmagen3/tree/master/src/lemmagen3/models)获取。

*语法*

``` sql
lemmatize('语言', word)
```

*参数*

- `语言` — 应用规则的语言。 [String](/sql-reference/data-types/string)。
- `word` — 需要进行词形还原的单词。必须为小写。 [String](/sql-reference/data-types/string)。

*示例*

查询：

``` sql
SELECT lemmatize('en', 'wolves');
```

结果：

``` text
┌─lemmatize("wolves")─┐
│              "wolf" │
└─────────────────────┘
```

*配置*

该配置指定应使用字典 `en.bin` 进行英语（`en`）单词的词形还原. `.bin` 文件可以从
[这里](https://github.com/vpodpecan/lemmagen3/tree/master/src/lemmagen3/models) 下载。

``` xml
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

``` sql
stem('语言', word)
```

*参数*

- `语言` — 应用规则的语言。使用两字母的 [ISO 639-1 代码](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)。
- `word` — 需要进行词干提取的单词。必须为小写。 [String](/sql-reference/data-types/string)。

*示例*

查询：

``` sql
SELECT arrayMap(x -> stem('en', x), ['I', 'think', 'it', 'is', 'a', 'blessing', 'in', 'disguise']) as res;
```

结果：

``` text
┌─res────────────────────────────────────────────────┐
│ ['I','think','it','is','a','bless','in','disguis'] │
└────────────────────────────────────────────────────┘
```
*支持的语言 for stem()*

:::note
stem() 函数使用 [Snowball stemming](https://snowballstem.org/) 库，请查看 Snowball 网站以获取最新语言等信息。
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
- 波特语
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

使用 `plain` 扩展类型时，我们需要提供一个指向简单文本文件的路径，其中每一行对应一个特定的同义词集。行中的单词必须用空格或制表符分隔。

使用 `wordnet` 扩展类型时，我们需要提供一个包含WordNet词库的目录的路径。词典必须包含WordNet意义索引。

*语法*

``` sql
synonyms('扩展名', word)
```

*参数*

- `扩展名` — 搜索将要执行的扩展名称。 [String](/sql-reference/data-types/string)。
- `word` — 将在扩展中搜索的单词。 [String](/sql-reference/data-types/string)。

*示例*

查询：

``` sql
SELECT synonyms('list', 'important');
```

结果：

``` text
┌─synonyms('list', 'important')────────────┐
│ ['important','big','critical','crucial'] │
└──────────────────────────────────────────┘
```

*配置*
``` xml
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
