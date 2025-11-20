---
slug: /whats-new/security-changelog
sidebar_position: 20
sidebar_label: 'セキュリティ変更ログ'
title: 'セキュリティ変更ログ'
description: 'セキュリティに関する更新や変更内容をまとめた変更ログ'
doc_type: 'changelog'
keywords: ['security', 'CVE', 'vulnerabilities', 'security fixes', 'patches']
---



# セキュリティ変更ログ



## ClickHouse v25.1.5.5で修正、2025-01-05 {#fixed-in-clickhouse-release-2025-01-05}

### [CVE-2025-1385](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-5phv-x8x4-83x5) {#CVE-2025-1385}

library bridge機能が有効化されている場合、clickhouse-library-bridgeはlocalhost上でHTTP APIを公開します。これにより、clickhouse-serverは指定されたパスからライブラリを動的にロードし、隔離されたプロセスで実行できます。特定のディレクトリへのファイルアップロードを許可するClickHouseテーブルエンジン機能と組み合わせることで、設定が不適切なサーバーは、両方のテーブルエンジンへのアクセス権限を持つ攻撃者によって悪用され、ClickHouseサーバー上で任意のコードを実行される可能性があります。

修正は以下のオープンソースバージョンに適用されています: v24.3.18.6, v24.8.14.27, v24.11.5.34, v24.12.5.65, v25.1.5.5

ClickHouse Cloudはこの脆弱性の影響を受けません。

謝辞: [Arseniy Dugin](https://github.com/ZerLes)


## ClickHouse v24.5で修正、2024-08-01 {#fixed-in-clickhouse-release-2024-08-01}

### [CVE-2024-6873](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-432f-r822-j66f) {#CVE-2024-6873}

特別に細工されたリクエストをClickHouseサーバーのネイティブインターフェースに送信することで、未認証の攻撃ベクトルからClickHouseサーバープロセスの実行フローをリダイレクトすることが可能です。このリダイレクトは、実行時のメモリの256バイト範囲内で利用可能なものに限定されます。この脆弱性は当社のバグバウンティプログラムを通じて特定されたものであり、既知の概念実証リモートコード実行（RCE）コードは作成されておらず、悪用もされていません。

修正は以下のオープンソースバージョンに適用されています：v23.8.15.35-lts、v24.3.4.147-lts、v24.4.2.141-stable、v24.5.1.1763、v24.6.1.4423-stable

ClickHouse Cloudは異なるバージョニングを使用しており、この脆弱性の修正はv24.2以降を実行しているすべてのインスタンスに適用されています。

謝辞：malacupa（独立研究者）


## ClickHouse v24.1で修正、2024-01-30 {#fixed-in-clickhouse-release-24-01-30}

### [CVE-2024-22412](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-45h5-f7g3-gr8r) {#CVE-2024-22412}

クエリキャッシュを有効にしたClickHouseの使用中にユーザーロールを切り替えると、不正確なデータを取得するリスクがあります。ClickHouseは、脆弱性の影響を受けるバージョンを使用しているユーザーに対し、アプリケーションが複数のロール間で動的に切り替わる場合はクエリキャッシュを使用しないよう推奨しています。

修正は以下のオープンソースバージョンに適用されています: v24.1.1.2048、v24.1.8.22-stable、v23.12.6.19-stable、v23.8.12.13-lts、v23.3.22.3-lts

ClickHouse Cloudは異なるバージョニングを使用しており、この脆弱性の修正はv24.0.2.54535で適用されました。

謝辞: RunrevealチームのEvan JohnsonおよびAlan Braithwaite氏 - 詳細は[彼らのブログ記事](https://blog.runreveal.com/cve-2024-22412-behind-the-bug-a-classic-caching-problem-in-the-clickhouse-query-cache/)をご覧ください。


## ClickHouse v23.10.5.20で修正、2023-11-26 {#fixed-in-clickhouse-release-23-10-5-20-2023-11-26}

### [CVE-2023-47118](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-g22g-p6q2-x39v) {#CVE-2023-47118}

デフォルトでポート9000/tcpで実行されるネイティブインターフェースに影響するヒープバッファオーバーフローの脆弱性。攻撃者はT64圧縮コーデックのバグをトリガーすることで、ClickHouseサーバープロセスをクラッシュさせることができます。この脆弱性は認証なしで悪用可能です。

修正は以下のオープンソースバージョンに適用されています: v23.10.2.13、v23.9.4.11、v23.8.6.16、v23.3.16.7

ClickHouse Cloudは異なるバージョニングを使用しており、この脆弱性の修正はv23.9.2.47475で適用されました。

謝辞: malacupa(独立研究者)

### [CVE-2023-48298](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-qw9f-qv29-8938) {#CVE-2023-48298}

FPC圧縮コーデックにおける整数アンダーフローの脆弱性。攻撃者はこれを利用してClickHouseサーバープロセスをクラッシュさせることができます。この脆弱性は認証なしで悪用可能です。

修正は以下のオープンソースバージョンに適用されています: v23.10.4.25、v23.9.5.29、v23.8.7.24、v23.3.17.13。

ClickHouse Cloudは異なるバージョニングを使用しており、この脆弱性の修正はv23.9.2.47475で適用されました。

謝辞: malacupa(独立研究者)

### [CVE-2023-48704](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-5rmf-5g48-xv63) {#CVE-2023-48704}

デフォルトでポート9000/tcpで実行されるネイティブインターフェースに影響するヒープバッファオーバーフローの脆弱性。攻撃者はGorillaコーデックのバグをトリガーすることで、ClickHouseサーバープロセスをクラッシュさせることができます。この脆弱性は認証なしで悪用可能です。

修正は以下のオープンソースバージョンに適用されています: v23.10.5.20、v23.9.6.20、v23.8.8.20、v23.3.18.15。

ClickHouse Cloudは異なるバージョニングを使用しており、この脆弱性の修正はv23.9.2.47551で適用されました。

謝辞: malacupa(独立研究者)


## ClickHouse 22.9.1.2603, 2022-09-22で修正 {#fixed-in-clickhouse-release-22-9-1-2603-2022-9-22}

### CVE-2022-44011 {#CVE-2022-44011}

ClickHouseサーバーにヒープバッファオーバーフローの脆弱性が発見されました。ClickHouseサーバーへのデータロード権限を持つ悪意のあるユーザーが、不正な形式のCapnProtoオブジェクトを挿入することでClickHouseサーバーをクラッシュさせることが可能でした。

修正はバージョン22.9.1.2603、22.8.2.11、22.7.4.16、22.6.6.16、22.3.12.19に適用されました

謝辞: Kiojj(独立研究者)

### CVE-2022-44010 {#CVE-2022-44010}

ClickHouseサーバーにヒープバッファオーバーフローの脆弱性が発見されました。攻撃者が特別に細工されたHTTPリクエストをHTTPエンドポイント(デフォルトではポート8123でリッスン)に送信することで、ヒープベースのバッファオーバーフローを引き起こし、ClickHouseサーバープロセスをクラッシュさせることが可能でした。この攻撃は認証を必要としません。

修正はバージョン22.9.1.2603、22.8.2.11、22.7.4.16、22.6.6.16、22.3.12.19に適用されました

謝辞: Kiojj(独立研究者)


## ClickHouse 21.10.2.15で修正、2021-10-18 {#fixed-in-clickhouse-release-21-10-2-215-2021-10-18}

### CVE-2021-43304 {#cve-2021-43304}

悪意のあるクエリを解析する際に、ClickHouseのLZ4圧縮コーデックでヒープバッファオーバーフローが発生します。LZ4::decompressImplループ内のコピー操作、特に任意のコピー操作`wildCopy<copy_amount>(op, ip, copy_end)`が宛先バッファの制限を超えないことの検証が行われていません。

クレジット: JFrog Security Research Team

### CVE-2021-43305 {#cve-2021-43305}

悪意のあるクエリを解析する際に、ClickHouseのLZ4圧縮コーデックでヒープバッファオーバーフローが発生します。LZ4::decompressImplループ内のコピー操作、特に任意のコピー操作`wildCopy<copy_amount>(op, ip, copy_end)`が宛先バッファの制限を超えないことの検証が行われていません。この問題はCVE-2021-43304と非常に類似していますが、脆弱なコピー操作は異なるwildCopy呼び出しに存在します。

クレジット: JFrog Security Research Team

### CVE-2021-42387 {#cve-2021-42387}

悪意のあるクエリを解析する際に、ClickHouseのLZ4圧縮コーデックでヒープ境界外読み取りが発生します。LZ4::decompressImpl()ループの一部として、16ビット符号なしのユーザー提供値（'offset'）が圧縮データから読み取られます。このオフセットは後にコピー操作の長さに使用されますが、コピー操作のソースの上限がチェックされていません。

クレジット: JFrog Security Research Team

### CVE-2021-42388 {#cve-2021-42388}

悪意のあるクエリを解析する際に、ClickHouseのLZ4圧縮コーデックでヒープ境界外読み取りが発生します。LZ4::decompressImpl()ループの一部として、16ビット符号なしのユーザー提供値（'offset'）が圧縮データから読み取られます。このオフセットは後にコピー操作の長さに使用されますが、コピー操作のソースの下限がチェックされていません。

クレジット: JFrog Security Research Team

### CVE-2021-42389 {#cve-2021-42389}

悪意のあるクエリを解析する際に、ClickHouseのDelta圧縮コーデックでゼロ除算が発生します。圧縮バッファの最初のバイトが、0であるかのチェックなしに剰余演算で使用されています。

クレジット: JFrog Security Research Team

### CVE-2021-42390 {#cve-2021-42390}

悪意のあるクエリを解析する際に、ClickHouseのDeltaDouble圧縮コーデックでゼロ除算が発生します。圧縮バッファの最初のバイトが、0であるかのチェックなしに剰余演算で使用されています。

クレジット: JFrog Security Research Team

### CVE-2021-42391 {#cve-2021-42391}

悪意のあるクエリを解析する際に、ClickHouseのGorilla圧縮コーデックでゼロ除算が発生します。圧縮バッファの最初のバイトが、0であるかのチェックなしに剰余演算で使用されています。

クレジット: JFrog Security Research Team


## ClickHouse 21.4.3.21で修正、2021-04-12 {#fixed-in-clickhouse-release-21-4-3-21-2021-04-12}

### CVE-2021-25263 {#cve-2021-25263}

CREATE DICTIONARY権限を持つ攻撃者が、許可されたディレクトリ外の任意のファイルを読み取ることが可能でした。

修正はバージョン20.8.18.32-lts、21.1.9.41-stable、21.2.9.41-stable、21.3.6.55-lts、21.4.3.21-stable以降に適用されています。

謝辞: [Vyacheslav Egoshin](https://twitter.com/vegoshin)


## ClickHouse リリース 19.14.3.3 で修正、2019-09-10 {#fixed-in-clickhouse-release-19-14-3-3-2019-09-10}

### CVE-2019-15024 {#cve-2019-15024}

ZooKeeperへの書き込みアクセス権を持ち、ClickHouseが稼働するネットワークからアクセス可能なカスタムサーバーを実行できる攻撃者は、ClickHouseレプリカとして動作する悪意のあるカスタムサーバーを作成し、ZooKeeperに登録することができます。別のレプリカが悪意のあるレプリカからデータパートを取得する際、clickhouse-serverにファイルシステム上の任意のパスへの書き込みを強制させることが可能です。

謝辞: Yandex Information Security Team の Eldar Zaitov 氏

### CVE-2019-16535 {#cve-2019-16535}

解凍アルゴリズムにおける範囲外読み取り、範囲外書き込み、および整数アンダーフローを利用して、ネイティブプロトコル経由でRCEまたはDoSを実現することが可能です。

謝辞: Yandex Information Security Team の Eldar Zaitov 氏

### CVE-2019-16536 {#cve-2019-16536}

悪意のある認証済みクライアントによって、DoSにつながるスタックオーバーフローを引き起こすことが可能です。

謝辞: Yandex Information Security Team の Eldar Zaitov 氏


## ClickHouseリリース19.13.6.1で修正、2019-09-20 {#fixed-in-clickhouse-release-19-13-6-1-2019-09-20}

### CVE-2019-18657 {#cve-2019-18657}

テーブル関数`url`に、攻撃者がリクエストに任意のHTTPヘッダーを注入できる脆弱性がありました。

謝辞: [Nikita Tikhomirov](https://github.com/NSTikhomirov)


## ClickHouseリリース18.12.13で修正、2018-09-10 {#fixed-in-clickhouse-release-18-12-13-2018-09-10}

### CVE-2018-14672 {#cve-2018-14672}

CatBoostモデルを読み込む関数において、パストラバーサルおよびエラーメッセージを通じた任意のファイルの読み取りが可能となる脆弱性がありました。

謝辞: Yandex Information Security TeamのAndrey Krasichkov氏


## ClickHouse リリース 18.10.3 で修正、2018-08-13 {#fixed-in-clickhouse-release-18-10-3-2018-08-13}

### CVE-2018-14671 {#cve-2018-14671}

unixODBC がファイルシステムから任意の共有オブジェクトを読み込むことを許可していたため、リモートコード実行の脆弱性につながっていました。

謝辞: Yandex Information Security Team の Andrey Krasichkov 氏および Evgeny Sidorov 氏


## ClickHouseリリース1.1.54388、2018-06-28で修正 {#fixed-in-clickhouse-release-1-1-54388-2018-06-28}

### CVE-2018-14668 {#cve-2018-14668}

`remote`テーブル関数の`user`、`password`、`default_database`フィールドに任意の記号が許可されていたため、クロスプロトコルリクエストフォージェリ攻撃を引き起こす脆弱性がありました。

謝辞: Yandex Information Security TeamのAndrey Krasichkov氏


## ClickHouseリリース1.1.54390、2018-07-06で修正 {#fixed-in-clickhouse-release-1-1-54390-2018-07-06}

### CVE-2018-14669 {#cve-2018-14669}

ClickHouse MySQLクライアントでは「LOAD DATA LOCAL INFILE」機能が有効になっており、悪意のあるMySQLデータベースが接続されたClickHouseサーバーから任意のファイルを読み取ることが可能でした。

謝辞: Yandex情報セキュリティチームのAndrey KrasichkovおよびEvgeny Sidorov


## ClickHouseリリース1.1.54131、2017-01-10で修正 {#fixed-in-clickhouse-release-1-1-54131-2017-01-10}

### CVE-2018-14670 {#cve-2018-14670}

debパッケージの不適切な設定により、データベースが不正に使用される可能性がありました。

謝辞: 英国国家サイバーセキュリティセンター(NCSC)
