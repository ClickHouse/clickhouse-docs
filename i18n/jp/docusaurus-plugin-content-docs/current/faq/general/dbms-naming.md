---
title: '「ClickHouse」とはどういう意味ですか？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/dbms-naming
description: '「ClickHouse」という名前の意味について説明します'
doc_type: 'reference'
keywords: ['ClickHouse の名前', 'クリックストリーム', 'データウェアハウス', 'データベースの命名', 'ClickHouse の歴史']
---



# 「ClickHouse」とはどういう意味ですか？ {#what-does-clickhouse-mean}

「**Click**stream」と「Data ware**House**」を組み合わせた名前です。これはもともと Yandex.Metrica におけるユースケースに由来しており、ClickHouse はインターネット全体のユーザーによるすべてのクリックの記録を保持することを意図していました。そして現在も、その役割を果たし続けています。このユースケースの詳細は、[ClickHouse history](../../about-us/history.md) ページで確認できます。

この 2 つの意味には、次のような帰結があります。

- Click**H**ouse の正しい表記は、H を大文字にすることだけです。
- 省略する必要がある場合は、**CH** を使用してください。歴史的な理由により、CK という省略形も中国ではよく使われています。これは主に、ClickHouse について中国語で行われた最初期の講演の 1 つでこの表記が使われたためです。

:::info    
ClickHouse に名前が付けられてから何年も後になって、意味を持つ 2 つの単語を組み合わせるこのアプローチが、データベースに名前を付ける最良の方法として、Carnegie Mellon University のデータベース准教授である Andy Pavlo による[研究](https://www.cs.cmu.edu/~pavlo/blog/2020/03/on-naming-a-database-management-system.html)で取り上げられました。ClickHouse は、彼の「史上最高のデータベース名」賞を Postgres と分かち合いました。
:::
