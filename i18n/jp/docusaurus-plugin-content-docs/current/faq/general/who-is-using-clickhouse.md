---
slug: /faq/general/who-is-using-clickhouse
title: '誰が ClickHouse を利用していますか？'
toc_hidden: true
toc_priority: 9
description: 'ClickHouse の利用ユーザーについて説明します'
keywords: ['顧客']
doc_type: 'reference'
---



# 誰が ClickHouse を使っているのか？ {#who-is-using-clickhouse}

オープンソース製品であるという性質上、この問いに対する答えはそれほど単純ではありません。ClickHouse を使い始めたいと思ったら、誰かに知らせる必要はなく、ソースコードや事前コンパイル済みパッケージを入手してくればそれで済みます。署名すべき契約もなく、[Apache License 2.0](https://github.com/ClickHouse/ClickHouse/blob/master/LICENSE) により、ソフトウェアを制限なく配布できます。

また、テクノロジースタックは、秘密保持契約（NDA）の対象範囲としてグレーゾーンになることがよくあります。一部の企業は、利用している技術がたとえオープンソースであっても競争優位性であると考え、従業員がその詳細を公開することを認めていません。別の企業は PR 上のリスクを考慮し、実装の詳細を共有する場合には PR 部門の承認がある場合に限るとしています。

では、どのようにして ClickHouse を使っている企業を知ればよいのでしょうか？

1 つの方法は、**周囲の人に聞いてみること**です。記録に残らない場であれば、自社でどのような技術を使っているか、どのようなユースケースか、どのようなハードウェアを使っているか、データ量はどの程度か、といったことを人はずっと話しやすくなります。私たちは世界各地の [ClickHouse Meetups](https://www.youtube.com/channel/UChtmrD-dsdpspr42P_PyRAw/playlists) で定期的にユーザーと話をしており、1000 社以上の企業が ClickHouse を使っているという話を聞いています。残念ながら、これは再現性のある情報ではなく、潜在的なトラブルを避けるため、そのような話は NDA のもとで聞いたものとして扱うようにしています。ただし、今後のミートアップに参加して、ご自身で他のユーザーと直接会話することは可能です。ミートアップの告知には複数の方法があり、たとえば [ClickHouse の Twitter アカウント](http://twitter.com/ClickHouseDB/) をフォローすることもできます。

2 つ目の方法は、ClickHouse を使っていると**公言している**企業を探すことです。通常はブログ記事、講演動画、スライド資料など、何らかの明確な証拠が伴うため、こちらのほうがより確実です。私たちはそのような証拠へのリンクを **[Adopters](../../about-us/adopters.md)** ページに集約しています。あなたの勤務先の事例や、たまたま見つけたリンクなども、ぜひ追加してください（ただし、その過程で NDA に違反しないよう注意してください）。

Adopters の一覧には、Bloomberg、Cisco、China Telecom、Tencent、Lyft といった非常に大きな企業の名前もありますが、最初のアプローチで分かったように、実際にははるかに多くの企業が存在します。たとえば、[the list of largest IT companies by Forbes (2020)](https://www.forbes.com/sites/hanktucker/2020/05/13/worlds-largest-technology-companies-2020-apple-stays-on-top-zoom-and-uber-debut/) を見ると、その半数以上が何らかの形で ClickHouse を利用しています。また、ClickHouse を 2016 年に最初にオープンソースとして公開し、ヨーロッパ最大級の IT 企業の 1 つでもある [Yandex](../../about-us/history.md) に触れないのは不公平でしょう。
