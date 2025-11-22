---
description: '機械学習関数に関するドキュメント'
sidebar_label: '機械学習'
slug: /sql-reference/functions/machine-learning-functions
title: '機械学習関数'
doc_type: 'reference'
---



# 機械学習関数



## evalMLMethod {#evalmlmethod}

フィット済み回帰モデルを使用した予測には`evalMLMethod`関数を使用します。詳細は`linearRegression`のリンクを参照してください。


## stochasticLinearRegression {#stochasticlinearregression}

[stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression)集約関数は、線形モデルとMSE損失関数を使用して確率的勾配降下法を実装します。新しいデータに対する予測には`evalMLMethod`を使用します。


## stochasticLogisticRegression {#stochasticlogisticregression}

[stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)集約関数は、二値分類問題に対して確率的勾配降下法を実装します。新しいデータの予測には`evalMLMethod`を使用します。


## naiveBayesClassifier {#naivebayesclassifier}

n-gramとラプラススムージングを使用したナイーブベイズモデルで入力テキストを分類します。使用前にClickHouseでモデルを設定する必要があります。

**構文**

```sql
naiveBayesClassifier(model_name, input_text);
```

**引数**

- `model_name` — 事前設定されたモデルの名前。[String](../data-types/string.md)
  モデルはClickHouseの設定ファイルで定義されている必要があります(以下を参照)。
- `input_text` — 分類するテキスト。[String](../data-types/string.md)
  入力は提供されたとおりに処理されます(大文字小文字・句読点は保持されます)。

**戻り値**

- 予測されたクラスIDを符号なし整数として返します。[UInt32](../data-types/int-uint.md)
  クラスIDはモデル構築時に定義されたカテゴリに対応します。

**例**

言語検出モデルでテキストを分類します:

```sql
SELECT naiveBayesClassifier('language', 'How are you?');
```

```response
┌─naiveBayesClassifier('language', 'How are you?')─┐
│ 0                                                │
└──────────────────────────────────────────────────┘
```

_結果`0`は英語を表し、`1`はフランス語を示す可能性があります - クラスの意味はトレーニングデータによって異なります。_

---

### 実装の詳細 {#implementation-details}

**アルゴリズム**
[ラプラススムージング](https://en.wikipedia.org/wiki/Additive_smoothing)を用いたナイーブベイズ分類アルゴリズムを使用し、[こちら](https://web.stanford.edu/~jurafsky/slp3/4.pdf)に基づくn-gram確率に基づいて未知のn-gramを処理します。

**主な機能**

- 任意のサイズのn-gramをサポート
- 3つのトークン化モード:
  - `byte`: 生のバイト列で動作します。各バイトが1つのトークンになります。
  - `codepoint`: UTF-8からデコードされたUnicodeスカラー値で動作します。各コードポイントが1つのトークンになります。
  - `token`: Unicode空白文字の連続(正規表現\s+)で分割します。トークンは空白以外の部分文字列で、隣接する句読点はトークンの一部になります(例: "you?"は1つのトークン)。

---

### モデルの設定 {#model-configuration}

言語検出用のナイーブベイズモデルを作成するためのサンプルソースコードは[こちら](https://github.com/nihalzp/ClickHouse-NaiveBayesClassifier-Models)で確認できます。

また、サンプルモデルとそれに関連する設定ファイルは[こちら](https://github.com/nihalzp/ClickHouse-NaiveBayesClassifier-Models/tree/main/models)で入手できます。

以下はClickHouseにおけるナイーブベイズモデルの設定例です:

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

**設定パラメータ**

| パラメータ  | 説明                                                                                                        | 例                                                  | デフォルト            |
| ---------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- | ------------------ |
| **name**   | 一意のモデル識別子                                                                                            | `language_detection`                                     | _必須_         |
| **path**   | モデルバイナリへの完全パス                                                                                          | `/etc/clickhouse-server/config.d/language_detection.bin` | _必須_         |
| **mode**   | トークン化方法:<br/>- `byte`: バイト列<br/>- `codepoint`: Unicode文字<br/>- `token`: 単語トークン | `token`                                                  | _必須_         |
| **n**      | N-gramのサイズ(`token`モード):<br/>- `1`=単一単語<br/>- `2`=単語ペア<br/>- `3`=単語トリプレット                     | `2`                                                      | _必須_         |
| **alpha**  | モデルに出現しないn-gramに対処するために分類時に使用されるラプラススムージング係数             | `0.5`                                                    | `1.0`              |
| **priors** | クラス確率(クラスに属する文書の割合)                                                      | 60% クラス0、40% クラス1                                 | 均等分布 |

**モデルトレーニングガイド**


**ファイル形式**
人間が読める形式では、`n=1`および`token`モードの場合、モデルは次のようになります：

```text
<class_id> <n-gram> <count>
0 excellent 15
1 refund 28
```

`n=3`および`codepoint`モードの場合、次のようになります：

```text
<class_id> <n-gram> <count>
0 exc 15
1 ref 28
```

人間が読める形式はClickHouseで直接使用されません。以下に説明するバイナリ形式に変換する必要があります。

**バイナリ形式の詳細**
各n-gramは次のように格納されます：

1. 4バイトの`class_id`（UInt、リトルエンディアン）
2. 4バイトの`n-gram`バイト長（UInt、リトルエンディアン）
3. 生の`n-gram`バイト
4. 4バイトの`count`（UInt、リトルエンディアン）

**前処理要件**
文書コーパスからモデルを作成する前に、指定された`mode`と`n`に従ってn-gramを抽出するために文書を前処理する必要があります。以下の手順で前処理の概要を説明します：

1. **トークン化モードに基づいて各文書の開始と終了に境界マーカーを追加します：**
   - **Byte**: `0x01`（開始）、`0xFF`（終了）
   - **Codepoint**: `U+10FFFE`（開始）、`U+10FFFF`（終了）
   - **Token**: `<s>`（開始）、`</s>`（終了）

   _注：_ `(n - 1)`個のトークンが文書の開始と終了の両方に追加されます。

2. **`token`モードで`n=3`の例：**
   - **文書：** `"ClickHouse is fast"`
   - **処理後：** `<s> <s> ClickHouse is fast </s> </s>`
   - **生成されたトライグラム：**
     - `<s> <s> ClickHouse`
     - `<s> ClickHouse is`
     - `ClickHouse is fast`
     - `is fast </s>`
     - `fast </s> </s>`

`byte`および`codepoint`モードでのモデル作成を簡素化するために、まず文書をトークンに分割する（`byte`モードでは`byte`のリスト、`codepoint`モードでは`codepoint`のリスト）と便利です。次に、文書の開始に`n - 1`個の開始トークンを追加し、文書の終了に`n - 1`個の終了トークンを追加します。最後に、n-gramを生成してシリアル化されたファイルに書き込みます。

---

<!--
The inner content of the tags below are replaced at doc framework build time with
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
