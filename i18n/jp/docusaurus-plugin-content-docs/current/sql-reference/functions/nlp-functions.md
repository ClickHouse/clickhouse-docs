---
slug: '/sql-reference/functions/nlp-functions'
sidebar_position: 130
sidebar_label: 'NLP'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 自然言語処理 (NLP) 関数

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::warning
これは実験的な機能であり、現在開発中で一般使用には適していません。将来のリリースでは予測できない後方互換性のない変更が行われる可能性があります。`allow_experimental_nlp_functions = 1`を設定して有効にしてください。
:::

## detectCharset {#detectcharset}

`detectCharset` 関数は、非UTF8エンコードされた入力文字列の文字セットを検出します。

*構文*

``` sql
detectCharset('分析対象のテキスト')
```

*引数*

- `text_to_be_analyzed` — 分析対象の文字列のコレクション（または文）。 [String](/sql-reference/data-types/string)。

*戻り値*

- 検出された文字セットのコードを含む `String`

*例*

クエリ:

```sql
SELECT detectCharset('Ich bleibe für ein paar Tage.');
```

結果:

```response
┌─detectCharset('Ich bleibe für ein paar Tage.')─┐
│ WINDOWS-1252                                   │
└────────────────────────────────────────────────┘
```

## detectLanguage {#detectlanguage}

UTF8エンコードされた入力文字列の言語を検出します。この関数は、[CLD2ライブラリ](https://github.com/CLD2Owners/cld2)を使用して検出を行い、2文字のISO言語コードを返します。

`detectLanguage` 関数は、入力文字列に200文字以上を提供することで最良の結果を得られます。

*構文*

``` sql
detectLanguage('分析対象のテキスト')
```

*引数*

- `text_to_be_analyzed` — 分析対象の文字列のコレクション（または文）。 [String](/sql-reference/data-types/string)。

*戻り値*

- 検出された言語の2文字ISOコード

その他の可能な結果:

- `un` = 不明、言語を検出できない。
- `other` = 検出された言語に2文字コードがない。

*例*

クエリ:

```sql
SELECT detectLanguage('Je pense que je ne parviendrai jamais à parler français comme un natif. Where there\'s a will, there\'s a way.');
```

結果:

```response
fr
```

## detectLanguageMixed {#detectlanguagemixed}

`detectLanguage` 関数に似ていますが、`detectLanguageMixed` はテキスト内の特定の言語の割合にマッピングされた2文字の言語コードの `Map` を返します。

*構文*

``` sql
detectLanguageMixed('分析対象のテキスト')
```

*引数*

- `text_to_be_analyzed` — 分析対象の文字列のコレクション（または文）。 [String](/sql-reference/data-types/string)。

*戻り値*

- `Map(String, Float32)`: キーは2文字のISOコード、値はその言語のテキストに見つかった割合

*例*

クエリ:

```sql
SELECT detectLanguageMixed('二兎を追う者は一兎をも得ず二兎を追う者は一兎をも得ず A vaincre sans peril, on triomphe sans gloire.');
```

結果:

```response
┌─detectLanguageMixed()─┐
│ {'ja':0.62,'fr':0.36  │
└───────────────────────┘
```

## detectProgrammingLanguage {#detectprogramminglanguage}

ソースコードからプログラミング言語を判別します。ソースコード内のすべてのユニグラムとバイグラムのコマンドを計算し、さまざまなプログラミング言語のコマンドに対するユニグラムとバイグラムのウェイトを持つマークアップされた辞書を使用して、プログラミング言語の最大ウェイトを見つけ、それを返します。

*構文*

``` sql
detectProgrammingLanguage('ソースコード')
```

*引数*

- `source_code` — 分析対象のソースコードの文字列表現。 [String](/sql-reference/data-types/string)。

*戻り値*

- プログラミング言語。 [String](../data-types/string.md)。

*例*

クエリ:

```sql
SELECT detectProgrammingLanguage('#include <iostream>');
```

結果:

```response
┌─detectProgrammingLanguage('#include <iostream>')─┐
│ C++                                              │
└──────────────────────────────────────────────────┘
```

## detectLanguageUnknown {#detectlanguageunknown}

`detectLanguage` 関数に似ていますが、`detectLanguageUnknown` 関数は非UTF8エンコードされた文字列で動作します。文字セットがUTF-16またはUTF-32の場合は、このバージョンを使用すると良いでしょう。

*構文*

``` sql
detectLanguageUnknown('分析対象のテキスト')
```

*引数*

- `text_to_be_analyzed` — 分析対象の文字列のコレクション（または文）。 [String](/sql-reference/data-types/string)。

*戻り値*

- 検出された言語の2文字ISOコード

その他の可能な結果:

- `un` = 不明、言語を検出できない。
- `other` = 検出された言語に2文字コードがない。

*例*

クエリ:

```sql
SELECT detectLanguageUnknown('Ich bleibe für ein paar Tage.');
```

結果:

```response
┌─detectLanguageUnknown('Ich bleibe für ein paar Tage.')─┐
│ de                                                     │
└────────────────────────────────────────────────────────┘
```

## detectTonality {#detecttonality}

テキストデータの感情を判定します。各単語が `-12` から `6` の範囲でトナリティを持つマークアップされた感情辞書を使用します。各テキストについて、その単語の平均感情値を計算し、`[-1,1]` の範囲で返します。

:::note
この関数は現在の形では制限されています。現在、`/contrib/nlp-data/tonality_ru.zst` に埋め込まれた感情辞書を使用しており、ロシア語にのみ対応しています。
:::

*構文*

``` sql
detectTonality(text)
```

*引数*

- `text` — 分析対象のテキスト。 [String](/sql-reference/data-types/string)。

*戻り値*

- `text` 内の単語の平均感情値。 [Float32](../data-types/float.md)。

*例*

クエリ:

```sql
SELECT detectTonality('Шарик - хороший пёс'), -- Шарикは良い犬です 
       detectTonality('Шарик - пёс'), -- Шарикは犬です
       detectTonality('Шарик - плохой пёс'); -- Шарикは悪い犬です
```

結果:

```response
┌─detectTonality('Шарик - хороший пёс')─┬─detectTonality('Шарик - пёс')─┬─detectTonality('Шарик - плохой пёс')─┐
│                               0.44445 │                             0 │                                 -0.3 │
└───────────────────────────────────────┴───────────────────────────────┴──────────────────────────────────────┘
```

## lemmatize {#lemmatize}

与えられた単語に対してレマタイゼーションを行います。操作に必要な辞書は、[こちら](https://github.com/vpodpecan/lemmagen3/tree/master/src/lemmagen3/models)から取得できます。

*構文*

``` sql
lemmatize('language', word)
```

*引数*

- `language` — 適用されるルールの言語。 [String](/sql-reference/data-types/string)。
- `word` — レマタイゼーションを行う単語。小文字である必要があります。 [String](/sql-reference/data-types/string)。

*例*

クエリ:

``` sql
SELECT lemmatize('en', 'wolves');
```

結果:

``` text
┌─lemmatize("wolves")─┐
│              "wolf" │
└─────────────────────┘
```

*設定*

この設定は、辞書 `en.bin` を使用して英語（`en`）のレマタイゼーションを行うことを指定します。 `.bin` ファイルは [こちら](https://github.com/vpodpecan/lemmagen3/tree/master/src/lemmagen3/models) からダウンロードできます。

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

与えられた単語に対してステミングを行います。

*構文*

``` sql
stem('language', word)
```

*引数*

- `language` — 適用されるルールの言語。2文字の [ISO 639-1 コード](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) を使用します。
- `word` — ステミングが必要な単語。小文字である必要があります。 [String](/sql-reference/data-types/string)。

*例*

クエリ:

``` sql
SELECT arrayMap(x -> stem('en', x), ['I', 'think', 'it', 'is', 'a', 'blessing', 'in', 'disguise']) as res;
```

結果:

``` text
┌─res────────────────────────────────────────────────┐
│ ['I','think','it','is','a','bless','in','disguis'] │
└────────────────────────────────────────────────────┘
```

*stem()のサポート言語*

:::note
stem() 関数は [Snowball stemming](https://snowballstem.org/) ライブラリを使用しており、最新の言語情報はSnowballのウェブサイトをご覧ください。
:::

- アラビア語
- アルメニア語
- バスク語
- カタルーニャ語
- デンマーク語
- オランダ語
- 英語
- フィンランド語
- フランス語
- ドイツ語
- ギリシャ語
- ヒンディー語
- ハンガリー語
- インドネシア語
- アイルランド語
- イタリア語
- リトアニア語
- ネパール語
- ノルウェー語
- ポーター
- ポルトガル語
- ルーマニア語
- ロシア語
- セルビア語
- スペイン語
- スウェーデン語
- タミル語
- トルコ語
- ヘブライ語

## synonyms {#synonyms}

特定の単語の同義語を見つけます。同義語拡張には2種類のタイプがあり: `plain` と `wordnet` です。

`plain` 拡張タイプでは、各行が特定の同義語セットに対応する単純なテキストファイルへのパスを提供する必要があります。この行の単語は空白またはタブ文字で区切る必要があります。

`wordnet` 拡張タイプでは、WordNetシソーラスが含まれるディレクトリへのパスを提供する必要があります。シソーラスはWordNet感覚インデックスを含む必要があります。

*構文*

``` sql
synonyms('extension_name', word)
```

*引数*

- `extension_name` — 検索が行われる拡張の名前。 [String](/sql-reference/data-types/string)。
- `word` — 拡張で検索される単語。 [String](/sql-reference/data-types/string)。

*例*

クエリ:

``` sql
SELECT synonyms('list', 'important');
```

結果:

``` text
┌─synonyms('list', 'important')────────────┐
│ ['important','big','critical','crucial'] │
└──────────────────────────────────────────┘
```

*設定*
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
