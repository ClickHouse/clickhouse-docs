---
slug: /faq/general/who-is-using-clickhouse
title: ClickHouseを使用しているのは誰ですか？
toc_hidden: true
toc_priority: 9
---


# ClickHouseを使用しているのは誰ですか？ {#who-is-using-clickhouse}

オープンソース製品であるため、この質問に対する答えはそれほど簡単ではありません。ClickHouseを使用し始めたければ、誰にも告げる必要はなく、ソースコードやプリコンパイル済みパッケージを入手するだけです。署名する契約はなく、[Apache 2.0ライセンス](https://github.com/ClickHouse/ClickHouse/blob/master/LICENSE)により、制約のないソフトウェア配布が許可されています。

さらに、技術スタックはしばしばNDAの範囲外にある曖昧な領域にあります。多くの企業は、自社が使用している技術を競争上の優位性と見なし、オープンソースであっても、従業員が公に詳細を共有することを許可していません。また、一部の企業はPRリスクを懸念し、従業員が実装の詳細をPR部門の承認を得た上でのみ共有することを許可しています。

では、誰がClickHouseを使用しているかをどうやって知ることができるでしょうか？

一つの方法は、**周りに聞いてみる**ことです。文書に記されていなければ、人々は自社でどの技術が使用されているのか、使用例、使用しているハードウェア、データ量などを共有することに対して非常にオープンです。私たちは、世界中で行われる[ClickHouse Meetup](https://www.youtube.com/channel/UChtmrD-dsdpspr42P_PyRAw/playlists)でユーザーと定期的に会話を交わしており、ClickHouseを使用している1000社以上の企業についての話を耳にしています。残念ながら、それは再現可能ではなく、私たちはこうした話をNDAの下で語られたかのように扱うように努めています。しかし、将来のミートアップに参加して、他のユーザーと直接話すこともできます。ミートアップの告知方法は様々で、例えば、[私たちのTwitter](http://twitter.com/ClickHouseDB/)をフォローすることで情報を得ることができます。

第二の方法は、**公にClickHouseを使用していると言っている企業を探す**ことです。これはより重厚な証拠があることが多く、ブログ投稿、講演のビデオ録画、スライド資料などが含まれます。このような証拠へのリンクを私たちの**[Adopters](../../about-us/adopters.md)** ページに集めています。雇用主の話や出会ったリンクを自由に寄稿してください（ただし、その過程でNDAに違反しないように注意してください）。

アダプターリストには、Bloomberg、Cisco、China Telecom、Tencent、Lyftなどの非常に大きな企業の名前がある一方で、最初のアプローチを通じて、多くの他の企業が存在することがわかります。例えば、[フォーブスによる2020年の最大のIT企業のリスト](https://www.forbes.com/sites/hanktucker/2020/05/13/worlds-largest-technology-companies-2020-apple-stays-on-top-zoom-and-uber-debut/)を見ると、その半数以上が何らかの形でClickHouseを使用しています。また、最初にClickHouseをオープンソース化した[ヤンデックス](../../about-us/history.md)について言及しないのは不公平です。ヤンデックスは2016年にClickHouseを開発した企業であり、ヨーロッパで最大のIT企業の一つです。
