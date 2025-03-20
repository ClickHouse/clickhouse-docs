---
title: XML
slug: /interfaces/formats/XML
keywords: ['XML']
input_format: false
output_format: true
alias: []
---

| Input | Output | Alias |
|-------|--------|-------|
| ✗     | ✔      |       |

## Description {#description}

Формат `XML` подходит только для вывода, а не для разбора. 

Если имя колонки не имеет приемлемого формата, используется 'field' в качестве имени элемента. В целом, структура XML соответствует структуре JSON. 
Так же, как и для JSON, недопустимые последовательности UTF-8 заменяются символом замены `�`, так что выходной текст будет состоять из допустимых последовательностей UTF-8.

В строковых значениях символы `<` и `&` экранируются как `<` и `&`.

Массивы выводятся в формате `<array><elem>Hello</elem><elem>World</elem>...</array>`, а кортежи в формате `<tuple><elem>Hello</elem><elem>World</elem>...</tuple>`.

## Example Usage {#example-usage}

Пример:

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

## Format Settings {#format-settings}

## XML {#xml}
