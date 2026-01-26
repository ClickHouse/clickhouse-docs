---
description: '机器学习函数相关文档'
sidebar_label: '机器学习'
slug: /sql-reference/functions/machine-learning-functions
title: '机器学习函数'
doc_type: 'reference'
---

# 机器学习函数 \{#machine-learning-functions\}

## evalMLMethod \{#evalmlmethod\}

使用已训练好的回归模型进行预测时，请使用 `evalMLMethod` 函数。相关内容请参阅 `linearRegression` 中的链接。

## stochasticLinearRegression \{#stochasticlinearregression\}

[stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression) 聚合函数使用线性模型和 MSE 损失函数实现随机梯度下降算法。使用 `evalMLMethod` 基于新数据进行预测。

## stochasticLogisticRegression \{#stochasticlogisticregression\}

[stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression) 聚合函数实现了用于二分类问题的随机梯度下降算法。使用 `evalMLMethod` 对新数据进行预测。

## naiveBayesClassifier \{#naivebayesclassifier\}

使用基于 n-gram 和拉普拉斯平滑的朴素贝叶斯模型对输入文本进行分类。在使用之前，必须先在 ClickHouse 中完成模型配置。

**语法**

```sql
naiveBayesClassifier(model_name, input_text);
```

**参数**

* `model_name` — 预配置模型的名称。[String](../data-types/string.md)
  模型必须在 ClickHouse 的配置文件中定义（见下文）。
* `input_text` — 要进行分类的文本。[String](../data-types/string.md)
  输入将按原样处理（保留大小写和标点）。

**返回值**

* 预测的类别 ID，为无符号整数类型。[UInt32](../data-types/int-uint.md)
  类别 ID 与模型构建时定义的类别一一对应。

**示例**

使用语言检测模型对文本进行分类：

```sql
SELECT naiveBayesClassifier('language', 'How are you?');
```

```response
┌─naiveBayesClassifier('language', 'How are you?')─┐
│ 0                                                │
└──────────────────────────────────────────────────┘
```

*结果 `0` 可能表示英语，而 `1` 可能表示法语——具体类别的含义取决于你的训练数据。*

***

### 实现细节 \{#implementation-details\}

**算法**
使用朴素贝叶斯（Naive Bayes）分类算法，并结合[拉普拉斯平滑](https://en.wikipedia.org/wiki/Additive_smoothing)，基于 n‑gram 概率来处理未见过的 n‑gram，具体方法参考[这份资料](https://web.stanford.edu/~jurafsky/slp3/4.pdf)。

**关键特性**

* 支持任意长度的 n‑gram
* 提供三种分词模式：
  * `byte`：基于原始字节操作。每个字节视为一个 token。
  * `codepoint`：基于从 UTF‑8 解码得到的 Unicode 标量值操作。每个 codepoint 视为一个 token。
  * `token`：按连续的 Unicode 空白字符拆分（正则 \s+）。Token 为非空白子串；如果标点与文本相邻，则视为同一个 token（例如，“you?” 是一个 token）。

***

### 模型配置 \{#model-configuration\}

你可以在[这里](https://github.com/nihalzp/ClickHouse-NaiveBayesClassifier-Models)找到用于创建语言检测 Naive Bayes 模型的示例源代码。

此外，可以在[这里](https://github.com/nihalzp/ClickHouse-NaiveBayesClassifier-Models/tree/main/models)获取示例模型及其对应的配置文件。

下面是在 ClickHouse 中配置 Naive Bayes 模型的示例：

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

| Parameter  | Description                                                              | Example                                                  | Default |
| ---------- | ------------------------------------------------------------------------ | -------------------------------------------------------- | ------- |
| **name**   | 唯一的模型标识符                                                                 | `language_detection`                                     | *必填*    |
| **path**   | 指向模型二进制文件的完整路径                                                           | `/etc/clickhouse-server/config.d/language_detection.bin` | *必填*    |
| **mode**   | 分词方法：<br />- `byte`：字节序列<br />- `codepoint`：Unicode 字符<br />- `token`：词元 | `token`                                                  | *必填*    |
| **n**      | N-gram 大小（`token` 模式）：<br />- `1` = 单词<br />- `2` = 词对<br />- `3` = 三词组合 | `2`                                                      | *必填*    |
| **alpha**  | 分类过程中使用的 Laplace 平滑因子，用于处理在模型中未出现的 n-gram                                | `0.5`                                                    | `1.0`   |
| **priors** | 类别先验概率（文档属于各类别的比例）                                                       | 60% 为类别 0，40% 为类别 1                                      | 均匀分布    |

**模型训练指南**

**文件格式**
在人类可读格式下，对于 `n=1` 且为 `token` 模式，模型可能如下所示：

```text
<class_id> <n-gram> <count>
0 excellent 15
1 refund 28
```

对于 `n=3` 且使用 `codepoint` 模式时，可能如下所示：

```text
<class_id> <n-gram> <count>
0 exc 15
1 ref 28
```

人类可读格式不会被 ClickHouse 直接使用，而是必须先转换为下文所述的二进制格式。

**二进制格式详情**
每个 n-gram 存储为：

1. 4 字节的 `class_id`（UInt，小端序）
2. 4 字节的 `n-gram` 字节长度（UInt，小端序）
3. 原始 `n-gram` 字节
4. 4 字节的 `count`（UInt，小端序）

**预处理要求**
在基于文档语料创建模型之前，必须先对文档进行预处理，以根据指定的 `mode` 和 `n` 提取 n-gram。以下步骤概述预处理流程：

1. **根据分词模式在每个文档的开头和结尾添加边界标记：**

   * **Byte**：`0x01`（开始），`0xFF`（结束）
   * **Codepoint**：`U+10FFFE`（开始），`U+10FFFF`（结束）
   * **Token**：`<s>`（开始），`</s>`（结束）

   *注意：* 在文档的开头和结尾处各添加 `(n - 1)` 个标记。

2. **在 `token` 模式下 `n=3` 的示例：**

   * **文档：** `"ClickHouse is fast"`
   * **处理后：** `<s> <s> ClickHouse is fast </s> </s>`
   * **生成的三元语法（trigram）：**
     * `<s> <s> ClickHouse`
     * `<s> ClickHouse is`
     * `ClickHouse is fast`
     * `is fast </s>`
     * `fast </s> </s>`

为简化 `byte` 和 `codepoint` 模式下的模型创建，可以先将文档分词为 token（在 `byte` 模式下为 `byte` 列表，在 `codepoint` 模式下为 `codepoint` 列表）。然后，在文档开头追加 `n - 1` 个起始 token，在文档结尾追加 `n - 1` 个结束 token。最后生成 n-gram，并将其写入序列化文件。

***

{/* 
  下面标签内的内容会在文档框架构建时
  被替换为由 system.functions 生成的文档。请不要修改或删除这些标签。
  参见：https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }

{/*AUTOGENERATED_END*/ }
