---
description: '机器学习函数文档'
sidebar_label: '机器学习'
slug: /sql-reference/functions/machine-learning-functions
title: '机器学习函数'
doc_type: 'reference'
---



# 机器学习函数



## evalMLMethod {#evalmlmethod}

使用已拟合的回归模型进行预测需要使用 `evalMLMethod` 函数。详见 `linearRegression` 中的相关链接。


## stochasticLinearRegression {#stochasticlinearregression}

[stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression) 聚合函数基于线性模型和均方误差(MSE)损失函数实现随机梯度下降方法。可使用 `evalMLMethod` 对新数据进行预测。


## stochasticLogisticRegression {#stochasticlogisticregression}

[stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression) 聚合函数实现了随机梯度下降法,用于解决二元分类问题。可使用 `evalMLMethod` 对新数据进行预测。


## naiveBayesClassifier {#naivebayesclassifier}

使用基于 n-gram 和拉普拉斯平滑的朴素贝叶斯模型对输入文本进行分类。使用前必须在 ClickHouse 中配置该模型。

**语法**

```sql
naiveBayesClassifier(model_name, input_text);
```

**参数**

- `model_name` — 预配置模型的名称。[String](../data-types/string.md)
  该模型必须在 ClickHouse 的配置文件中定义(见下文)。
- `input_text` — 待分类的文本。[String](../data-types/string.md)
  输入将按原样处理(保留大小写/标点符号)。

**返回值**

- 预测的类别 ID,为无符号整数。[UInt32](../data-types/int-uint.md)
  类别 ID 对应于模型构建时定义的类别。

**示例**

使用语言检测模型对文本进行分类:

```sql
SELECT naiveBayesClassifier('language', 'How are you?');
```

```response
┌─naiveBayesClassifier('language', 'How are you?')─┐
│ 0                                                │
└──────────────────────────────────────────────────┘
```

_结果 `0` 可能表示英语,而 `1` 可能表示法语 - 类别含义取决于训练数据。_

---

### 实现细节 {#implementation-details}

**算法**
使用朴素贝叶斯分类算法,结合[拉普拉斯平滑](https://en.wikipedia.org/wiki/Additive_smoothing)来处理未见过的 n-gram,基于 n-gram 概率,参考[此文档](https://web.stanford.edu/~jurafsky/slp3/4.pdf)。

**主要特性**

- 支持任意大小的 n-gram
- 三种分词模式:
  - `byte`: 对原始字节进行操作。每个字节是一个标记。
  - `codepoint`: 对从 UTF-8 解码的 Unicode 标量值进行操作。每个码点是一个标记。
  - `token`: 按 Unicode 空白字符序列分割(正则表达式 \s+)。标记是非空白字符的子串;如果标点符号相邻,则它是标记的一部分(例如,"you?" 是一个标记)。

---

### 模型配置 {#model-configuration}

您可以在[此处](https://github.com/nihalzp/ClickHouse-NaiveBayesClassifier-Models)找到用于创建语言检测朴素贝叶斯模型的示例源代码。

此外,示例模型及其相关配置文件可在[此处](https://github.com/nihalzp/ClickHouse-NaiveBayesClassifier-Models/tree/main/models)获取。

以下是 ClickHouse 中朴素贝叶斯模型的示例配置:

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

**配置参数**

| 参数  | 描述                                                                                                        | 示例                                                  | 默认值            |
| ---------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- | ------------------ |
| **name**   | 唯一的模型标识符                                                                                            | `language_detection`                                     | _必需_         |
| **path**   | 模型二进制文件的完整路径                                                                                          | `/etc/clickhouse-server/config.d/language_detection.bin` | _必需_         |
| **mode**   | 分词方法:<br/>- `byte`: 字节序列<br/>- `codepoint`: Unicode 字符<br/>- `token`: 词标记 | `token`                                                  | _必需_         |
| **n**      | N-gram 大小(`token` 模式):<br/>- `1`=单个词<br/>- `2`=词对<br/>- `3`=词三元组                     | `2`                                                      | _必需_         |
| **alpha**  | 分类时使用的拉普拉斯平滑因子,用于处理模型中未出现的 n-gram             | `0.5`                                                    | `1.0`              |
| **priors** | 类别概率(属于某个类别的文档百分比)                                                      | 60% 类别 0, 40% 类别 1                                 | 均等分布 |

**模型训练指南**


**文件格式**
在人类可读格式中，当 `n=1` 且模式为 `token` 时，模型可能如下所示:

```text
<class_id> <n-gram> <count>
0 excellent 15
1 refund 28
```

当 `n=3` 且模式为 `codepoint` 时，可能如下所示:

```text
<class_id> <n-gram> <count>
0 exc 15
1 ref 28
```

ClickHouse 不直接使用人类可读格式；必须将其转换为下文所述的二进制格式。

**二进制格式详情**
每个 n-gram 的存储格式为:

1. 4 字节 `class_id`（UInt，小端序）
2. 4 字节 `n-gram` 字节长度（UInt，小端序）
3. 原始 `n-gram` 字节
4. 4 字节 `count`（UInt，小端序）

**预处理要求**
在从文档语料库创建模型之前，必须对文档进行预处理，根据指定的 `mode` 和 `n` 提取 n-gram。预处理步骤如下:

1. **根据分词模式在每个文档的开头和结尾添加边界标记:**
   - **Byte**: `0x01`（开始），`0xFF`（结束）
   - **Codepoint**: `U+10FFFE`（开始），`U+10FFFF`（结束）
   - **Token**: `<s>`（开始），`</s>`（结束）

   _注意:_ 在文档的开头和结尾各添加 `(n - 1)` 个标记。

2. **`token` 模式下 `n=3` 的示例:**
   - **文档:** `"ClickHouse is fast"`
   - **处理后:** `<s> <s> ClickHouse is fast </s> </s>`
   - **生成的三元组:**
     - `<s> <s> ClickHouse`
     - `<s> ClickHouse is`
     - `ClickHouse is fast`
     - `is fast </s>`
     - `fast </s> </s>`

为简化 `byte` 和 `codepoint` 模式的模型创建，可以先将文档分词为标记（`byte` 模式为 `byte` 列表，`codepoint` 模式为 `codepoint` 列表）。然后，在文档开头附加 `n - 1` 个开始标记，在文档结尾附加 `n - 1` 个结束标记。最后，生成 n-gram 并将其写入序列化文件。

---

<!--
The inner content of the tags below are replaced at doc framework build time with
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
