---
description: '機械学習関数に関するドキュメント'
sidebar_label: '機械学習'
slug: /sql-reference/functions/machine-learning-functions
title: '機械学習関数'
doc_type: 'reference'
---

# 機械学習関数 \{#machine-learning-functions\}

## evalMLMethod \{#evalmlmethod\}

学習済みの回帰モデルを用いた予測には `evalMLMethod` 関数を使用します。詳細は `linearRegression` を参照してください。

## stochasticLinearRegression \{#stochasticlinearregression\}

[stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression) 集約関数は、線形モデルと MSE 損失関数を用いる確率的勾配降下法を実装します。新しいデータに対する予測には `evalMLMethod` を使用します。

## stochasticLogisticRegression \{#stochasticlogisticregression\}

[stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression) 集約関数は、二値分類問題に対して確率的勾配降下法を実装したものです。新しいデータに対する予測には `evalMLMethod` を使用します。

## naiveBayesClassifier \{#naivebayesclassifier\}

n-gram およびラプラス平滑化を用いる Naive Bayes モデルで入力テキストを分類します。モデルは使用前に ClickHouse 上で事前に設定されている必要があります。

**構文**

```sql
naiveBayesClassifier(model_name, input_text);
```

**引数**

* `model_name` — 事前構成済みモデルの名前。[String](../data-types/string.md)\
  モデルは ClickHouse の設定ファイル内で定義されている必要があります（下記参照）。
* `input_text` — 分類対象のテキスト。[String](../data-types/string.md)\
  入力は指定されたとおりにそのまま処理されます（大文字小文字や句読点は保持されます）。

**戻り値**

* 予測されたクラス ID を表す符号なし整数。[UInt32](../data-types/int-uint.md)\
  クラス ID は、モデル構築時に定義されたカテゴリに対応します。

**例**

言語検出モデルを用いてテキストを分類します：

```sql
SELECT naiveBayesClassifier('language', 'How are you?');
```

```response
┌─naiveBayesClassifier('language', 'How are you?')─┐
│ 0                                                │
└──────────────────────────────────────────────────┘
```

*結果の `0` は英語を表し、`1` はフランス語を示す場合があります。クラスの意味は学習データに依存します。*

***

### 実装の詳細 \{#implementation-details\}

**アルゴリズム**
Naive Bayes 分類アルゴリズムを使用し、未出現の n-gram を扱うために [Laplace smoothing](https://en.wikipedia.org/wiki/Additive_smoothing) を用います。n-gram の確率は [この資料](https://web.stanford.edu/~jurafsky/slp3/4.pdf) に基づきます。

**主な特徴**

* 任意の長さの n-gram をサポート
* 3 種類のトークナイズモード:
  * `byte`: 生のバイト列を対象とします。各バイトが 1 トークンになります。
  * `codepoint`: UTF‑8 からデコードされた Unicode スカラ値を対象とします。各コードポイントが 1 トークンになります。
  * `token`: Unicode 空白文字の連続（正規表現 \s+）で分割します。トークンは非空白部分文字列であり、隣接している場合は句読点もトークンの一部になります（例: 「you?」は 1 トークン）。

***

### モデル設定 \{#model-configuration\}

言語検出用の Naive Bayes モデルを作成するためのサンプルソースコードは[こちら](https://github.com/nihalzp/ClickHouse-NaiveBayesClassifier-Models)にあります。

さらに、サンプルモデルとそれに対応する設定ファイルは[こちら](https://github.com/nihalzp/ClickHouse-NaiveBayesClassifier-Models/tree/main/models)から利用できます。

以下は、ClickHouse における Naive Bayes モデルの設定例です。

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

| Parameter  | Description                                                                                    | Example                                                  | Default |
| ---------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------- |
| **name**   | 一意のモデル識別子                                                                                      | `language_detection`                                     | *必須*    |
| **path**   | モデルバイナリへのフルパス                                                                                  | `/etc/clickhouse-server/config.d/language_detection.bin` | *必須*    |
| **mode**   | トークン化方式:<br />- `byte`: バイト列<br />- `codepoint`: Unicode 文字<br />- `token`: 単語トークン             | `token`                                                  | *必須*    |
| **n**      | N-グラムサイズ（`token` モード）:<br />- `1` = 単語 1 個<br />- `2` = 単語 2 個の組み合わせ<br />- `3` = 単語 3 個の組み合わせ | `2`                                                      | *必須*    |
| **alpha**  | 分類時にモデルに存在しない N-グラムに対処するために使用されるラプラス平滑化係数                                                      | `0.5`                                                    | `1.0`   |
| **priors** | クラスの事前確率（各クラスに属するドキュメントの割合）                                                                    | クラス 0 が 60%、クラス 1 が 40%                                  | 一様分布    |

**モデル学習ガイド**

**ファイル形式**
人間が読みやすい形式の出力では、`n=1` で `token` モードの場合、モデルは次のような形になります：

```text
<class_id> <n-gram> <count>
0 excellent 15
1 refund 28
```

`n=3` で `codepoint` モードの場合は、次のようになります。

```text
<class_id> <n-gram> <count>
0 exc 15
1 ref 28
```

人間が読める形式は ClickHouse によって直接は使用されず、後述のバイナリ形式に変換する必要があります。

**バイナリ形式の詳細**
各 n-gram は次のように格納されます:

1. 4 バイトの `class_id`（UInt, リトルエンディアン）
2. 4 バイトの `n-gram` のバイト長（UInt, リトルエンディアン）
3. 生の `n-gram` バイト列
4. 4 バイトの `count`（UInt, リトルエンディアン）

**前処理の要件**
ドキュメントコーパスからモデルを作成する前に、文書は指定された `mode` と `n` に従って n-gram を抽出できるように前処理しておく必要があります。前処理の手順は次のとおりです。

1. **トークナイズモードに基づき、各ドキュメントの先頭と末尾に境界マーカーを追加します:**

   * **Byte**: `0x01`（開始）、`0xFF`（終了）
   * **Codepoint**: `U+10FFFE`（開始）、`U+10FFFF`（終了）
   * **Token**: `<s>`（開始）、`</s>`（終了）

   *注:* ドキュメントの先頭と末尾の両方に `(n - 1)` 個のトークンを追加します。

2. **`token` モードにおける `n=3` の例:**

   * **Document:** `"ClickHouse is fast"`
   * **Processed as:** `<s> <s> ClickHouse is fast </s> </s>`
   * **Generated trigrams:**
     * `<s> <s> ClickHouse`
     * `<s> ClickHouse is`
     * `ClickHouse is fast`
     * `is fast </s>`
     * `fast </s> </s>`

`byte` モードおよび `codepoint` モードでのモデル作成を簡略化するために、まずドキュメントをトークン（`byte` モードでは `byte` のリスト、`codepoint` モードでは `codepoint` のリスト）にトークナイズすると便利な場合があります。その後、ドキュメントの先頭に `n - 1` 個の開始トークンを、末尾に `n - 1` 個の終了トークンを追加します。最後に、n-gram を生成し、それらをシリアライズされたファイルに書き込みます。

***

{/* 
  以下のタグ内のコンテンツは、ドキュメントフレームワークのビルド時に
  system.functions から生成されたドキュメントに置き換えられます。タグを変更または削除しないでください。
  詳しくは、https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md を参照してください。
  */ }

{/*AUTOGENERATED_START*/ }

{/*AUTOGENERATED_END*/ }
