---
description: '代替のバックアップおよび復元方法の詳細'
sidebar_label: '代替方法'
slug: /operations/backup/alternative_methods
title: '代替のバックアップおよび復元方法'
doc_type: 'reference'
---

# 代替バックアップ方法 \{#alternative-backup-methods\}

ClickHouse はデータをディスク上に保存しており、ディスクをバックアップする方法は多数あります。
ここでは、これまでに使われてきた代替案の一部を紹介します。これらはユースケースによっては
適合する可能性があります。

### ソースデータを別の場所に複製する \{#duplicating-source-data-somewhere-else\}

ClickHouse に取り込まれるデータは、多くの場合、[Apache Kafka](https://kafka.apache.org) のような
永続的なキューを経由して配信されます。この場合、ClickHouse に書き込まれているのと同じ
データストリームを読み取り、それをどこかのコールドストレージに保存する追加の購読者セットを
構成することが可能です。ほとんどの企業は、すでに推奨される標準的なコールドストレージを
持っており、それはオブジェクトストアや [HDFS](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html)
のような分散ファイルシステムである場合があります。

### ファイルシステムのスナップショット \{#filesystem-snapshots\}

一部のローカルファイルシステム（例: [ZFS](https://en.wikipedia.org/wiki/ZFS)）はスナップショット機能を提供しますが、
ライブクエリを処理する用途としては最適ではない場合があります。1 つの解決策としては、
この種のファイルシステムを用いた追加レプリカを作成し、それらを `SELECT` クエリに使用される
[Distributed](/engines/table-engines/special/distributed) テーブルから除外する方法があります。
このようなレプリカ上のスナップショットは、データを変更するクエリからはアクセスできません。
さらに、これらのレプリカにはサーバーごとに多くのディスクを接続するなど、特別なハードウェア構成を
持たせることができ、コスト効率がよくなる場合があります。

データ量が小さい場合には、リモートテーブルに対する単純な `INSERT INTO ... SELECT ...`
でもうまく機能することがあります。

### パーツ操作による方法 \{#manipulations-with-parts\}

ClickHouse では、`ALTER TABLE ... FREEZE PARTITION ...` クエリを使用して、
テーブルパーティションのローカルコピーを作成できます。これは `/var/lib/clickhouse/shadow/`
フォルダへのハードリンクを用いて実装されているため、通常、古いデータのために追加の
ディスク容量を消費することはありません。作成されたファイルのコピーは ClickHouse サーバーに
よって管理されないため、そのまま放置しておくこともできます。
この場合、追加の外部システムを一切必要としないシンプルなバックアップが得られますが、
それでもハードウェア障害の影響は受けます。このため、コピーを別の場所にリモートコピーしてから
ローカルコピーを削除するほうが望ましいです。
分散ファイルシステムやオブジェクトストアはこの用途でも依然として有力な選択肢ですが、
十分な容量を持つ通常のファイルサーバーでも同様に機能することがあります
（この場合、転送はネットワークファイルシステム経由、あるいは [rsync](https://en.wikipedia.org/wiki/Rsync)
などで行われます）。
バックアップからデータを復元するには、`ALTER TABLE ... ATTACH PARTITION ...` を使用できます。

パーティション操作に関連するクエリの詳細については、
[`ALTER` ドキュメント](/sql-reference/statements/alter/partition) を参照してください。

このアプローチを自動化するためのサードパーティツールとして [clickhouse-backup](https://github.com/AlexAkulov/clickhouse-backup) が利用可能です。
