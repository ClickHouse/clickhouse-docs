---
alias: []
description: 'XML 形式に関するドキュメント'
input_format: false
keywords: ['XML']
output_format: true
slug: /interfaces/formats/XML
title: 'XML'
doc_type: 'reference'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✗     | ✔      |       |

## 説明 \{#description\}

`XML` 形式は出力専用であり、入力のパースには使用できません。

列名が妥当な形式でない場合、要素名として単に `field` が使用されます。一般的に、XML 構造は JSON 構造に従います。
JSON と同様に、不正な UTF-8 シーケンスは置換文字 `�` に置き換えられるため、出力テキストは有効な UTF-8 シーケンスだけで構成されます。

文字列値では、文字 `<` と `&` はそれぞれ `<` および `&` としてエスケープされます。

配列は `<array><elem>Hello</elem><elem>World</elem>...</array>` のように、タプルは `<tuple><elem>Hello</elem><elem>World</elem>...</tuple>` のように出力されます。

## 使用例 \{#example-usage\}

例：

```xml
<?xml version='1.0' encoding='UTF-8' ?>
<result>
        <meta>
                <columns>
                        <column>
                                <name>SearchPhrase</name>
                                <type>String</type>
                        </column>
                        <column>
                                <name>count()</name>
                                <type>UInt64</type>
                        </column>
                </columns>
        </meta>
        <data>
                <row>
                        <SearchPhrase></SearchPhrase>
                        <field>8267016</field>
                </row>
                <row>
                        <SearchPhrase>bathroom interior design</SearchPhrase>
                        <field>2166</field>
                </row>
                <row>
                        <SearchPhrase>clickhouse</SearchPhrase>
                        <field>1655</field>
                </row>
                <row>
                        <SearchPhrase>2014 spring fashion</SearchPhrase>
                        <field>1549</field>
                </row>
                <row>
                        <SearchPhrase>freeform photos</SearchPhrase>
                        <field>1480</field>
                </row>
                <row>
                        <SearchPhrase>angelina jolie</SearchPhrase>
                        <field>1245</field>
                </row>
                <row>
                        <SearchPhrase>omsk</SearchPhrase>
                        <field>1112</field>
                </row>
                <row>
                        <SearchPhrase>photos of dog breeds</SearchPhrase>
                        <field>1091</field>
                </row>
                <row>
                        <SearchPhrase>curtain designs</SearchPhrase>
                        <field>1064</field>
                </row>
                <row>
                        <SearchPhrase>baku</SearchPhrase>
                        <field>1000</field>
                </row>
        </data>
        <rows>10</rows>
        <rows_before_limit_at_least>141137</rows_before_limit_at_least>
</result>
```

## フォーマット設定 \{#format-settings\}

## XML \{#xml\}