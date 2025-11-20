---
description: '代替のバックアップ・リストア方法の詳細'
sidebar_label: '代替方法'
slug: /operations/backup/alternative_methods
title: '代替のバックアップ・リストア方法'
doc_type: 'reference'
---



# 代替バックアップ方法

ClickHouseはデータをディスクに保存しており、ディスクをバックアップする方法は多数存在します。
以下は、過去に使用されてきた代替手段であり、ユースケースに適合する可能性があります。

### ソースデータを別の場所に複製する {#duplicating-source-data-somewhere-else}

ClickHouseに取り込まれるデータは、[Apache Kafka](https://kafka.apache.org)のような永続的なキューを通じて配信されることがよくあります。この場合、ClickHouseへの書き込み中に同じデータストリームを読み取り、別の場所のコールドストレージに保存する追加のサブスクライバーセットを構成することが可能です。ほとんどの企業は、オブジェクトストアや[HDFS](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html)のような分散ファイルシステムなど、デフォルトで推奨されるコールドストレージを既に保有しています。

### ファイルシステムスナップショット {#filesystem-snapshots}

一部のローカルファイルシステムはスナップショット機能を提供していますが（例：[ZFS](https://en.wikipedia.org/wiki/ZFS)）、ライブクエリの処理には最適な選択肢ではない可能性があります。考えられる解決策は、この種のファイルシステムを使用して追加のレプリカを作成し、`SELECT`クエリに使用される[Distributed](/engines/table-engines/special/distributed)テーブルからそれらを除外することです。
このようなレプリカ上のスナップショットは、データを変更するクエリの影響を受けません。
さらに、これらのレプリカは、サーバーあたりより多くのディスクが接続された特別なハードウェア構成を持つ可能性があり、コスト効率が高くなります。

データ量が少ない場合は、リモートテーブルへのシンプルな`INSERT INTO ... SELECT ...`も有効です。

### パーツの操作 {#manipulations-with-parts}

ClickHouseでは、`ALTER TABLE ... FREEZE PARTITION ...`クエリを使用してテーブルパーティションのローカルコピーを作成できます。これは`/var/lib/clickhouse/shadow/`フォルダへのハードリンクを使用して実装されているため、通常、古いデータに対して追加のディスク容量を消費しません。作成されたファイルのコピーはClickHouseサーバーによって管理されないため、そのまま残しておくことができます。
これにより、追加の外部システムを必要としないシンプルなバックアップが得られますが、ハードウェア障害の影響を受けやすい状態は残ります。このため、別の場所にリモートコピーしてから、ローカルコピーを削除する方が望ましいです。
分散ファイルシステムやオブジェクトストアは依然として良い選択肢ですが、十分な容量を持つ通常の接続ファイルサーバーでも機能する可能性があります
（この場合、転送はネットワークファイルシステムまたは[rsync](https://en.wikipedia.org/wiki/Rsync)を介して行われます）。
データは`ALTER TABLE ... ATTACH PARTITION ...`を使用してバックアップから復元できます。

パーティション操作に関連するクエリの詳細については、[`ALTER`ドキュメント](/sql-reference/statements/alter/partition)を参照してください。

このアプローチを自動化するサードパーティツールが利用可能です：[clickhouse-backup](https://github.com/AlexAkulov/clickhouse-backup)。
