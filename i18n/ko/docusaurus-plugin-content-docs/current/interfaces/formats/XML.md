---
alias: []
description: 'XML 형식에 대한 문서'
input_format: false
keywords: ['XML']
output_format: true
slug: /interfaces/formats/XML
title: 'XML'
doc_type: 'reference'
---

| 입력 | 출력 | 별칭 |
|-------|--------|-------|
| ✗     | ✔      |       |



## 설명 \{#description\}

`XML` 포맷은 파싱을 위한 용도가 아니라 출력 전용으로만 적합합니다. 

컬럼 이름이 허용 가능한 형식이 아니면 요소 이름으로 그냥 'field'가 사용됩니다. 일반적으로 XML 구조는 JSON 구조를 따릅니다.
JSON과 마찬가지로, 잘못된 UTF-8 시퀀스는 대체 문자 `�`로 변경되므로, 출력 텍스트는 유효한 UTF-8 시퀀스로 구성됩니다.

문자열 값에서는 `<`와 `&` 문자가 각각 `<`와 `&`로 이스케이프됩니다.

배열은 `<array><elem>Hello</elem><elem>World</elem>...</array>`와 같이, 튜플은 `<tuple><elem>Hello</elem><elem>World</elem>...</tuple>`와 같이 출력됩니다.



## 사용 예 \{#example-usage\}

예제:

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


## 형식 설정 \{#format-settings\}



## XML \{#xml\}