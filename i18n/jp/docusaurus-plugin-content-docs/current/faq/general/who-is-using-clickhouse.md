---
slug: /faq/general/who-is-using-clickhouse
title: '誰が ClickHouse を利用していますか？'
toc_hidden: true
toc_priority: 9
description: 'ClickHouse を利用しているユーザーについて説明します'
keywords: ['customer']
doc_type: 'reference'
---



# ClickHouseを使用しているのは誰か？ {#who-is-using-clickhouse}

オープンソース製品であるため、この質問に対する答えは単純ではありません。ClickHouseの使用を開始する際に誰かに報告する必要はなく、ソースコードやプリコンパイル済みパッケージを入手するだけで済みます。契約書への署名は不要であり、[Apache 2.0ライセンス](https://github.com/ClickHouse/ClickHouse/blob/master/LICENSE)により制約のないソフトウェア配布が認められています。

また、技術スタックはNDAの対象範囲においてグレーゾーンに位置することが多くあります。一部の企業は、オープンソースであっても使用している技術を競争上の優位性と見なし、従業員による詳細の公開を許可していません。また、PRリスクを懸念し、PR部門の承認がある場合に限り従業員が実装の詳細を共有することを許可している企業もあります。

では、誰がClickHouseを使用しているかをどのように知ることができるでしょうか？

一つの方法は**周囲に尋ねる**ことです。書面でなければ、人々は自社で使用されている技術、ユースケース、使用されているハードウェアの種類、データ量などを共有することに前向きです。私たちは世界中の[ClickHouse Meetups](https://www.youtube.com/channel/UChtmrD-dsdpspr42P_PyRAw/playlists)で定期的にユーザーと対話しており、ClickHouseを使用している1000社以上の企業についての話を聞いています。残念ながら、これは再現性がなく、潜在的なトラブルを避けるため、このような話はNDAの下で語られたものとして扱うようにしています。しかし、今後のミートアップに参加して、他のユーザーと直接話すことができます。ミートアップの告知方法は複数あり、例えば[私たちのTwitter](http://twitter.com/ClickHouseDB/)をフォローすることができます。

二つ目の方法は、ClickHouseを使用していると**公に表明している**企業を探すことです。これはより確実な方法です。なぜなら、通常、ブログ記事、講演の動画、スライド資料などの確かな証拠が存在するためです。私たちはこのような証拠へのリンクを**[Adopters](../../about-us/adopters.md)**ページに収集しています。お勤めの企業の事例や偶然見つけたリンクを自由に投稿してください(ただし、その過程でNDAに違反しないようにしてください)。

採用企業リストには、Bloomberg、Cisco、China Telecom、Tencent、Lyftなどの非常に大規模な企業の名前がありますが、最初のアプローチではさらに多くの企業が存在することがわかりました。例えば、[Forbesによる最大のIT企業リスト(2020年)](https://www.forbes.com/sites/hanktucker/2020/05/13/worlds-largest-technology-companies-2020-apple-stays-on-top-zoom-and-uber-debut/)を見ると、その半数以上が何らかの形でClickHouseを使用しています。また、2016年に最初にClickHouseをオープンソース化し、ヨーロッパ最大のIT企業の一つである[Yandex](../../about-us/history.md)について言及しないのは不公平でしょう。
