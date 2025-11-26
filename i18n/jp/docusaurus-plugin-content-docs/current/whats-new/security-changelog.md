---
slug: /whats-new/security-changelog
sidebar_position: 20
sidebar_label: 'セキュリティ変更履歴'
title: 'セキュリティ変更履歴'
description: 'セキュリティ関連の更新や変更点を記載した変更履歴'
doc_type: 'changelog'
keywords: ['セキュリティ', 'CVE', '脆弱性', 'セキュリティ修正', 'パッチ']
---



# セキュリティに関する変更履歴



## ClickHouse v25.1.5.5 にて修正済み、2025-01-05 {#fixed-in-clickhouse-release-2025-01-05}

### [CVE-2025-1385](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-5phv-x8x4-83x5) {#CVE-2025-1385}

library bridge 機能が有効になっている場合、clickhouse-library-bridge は localhost 上で HTTP API を公開します。これにより、clickhouse-server は指定されたパスからライブラリを動的にロードし、分離されたプロセス内で実行できます。特定のディレクトリへのファイルアップロードを許可する ClickHouse テーブルエンジンの機能と組み合わさることで、両方のテーブルエンジンにアクセスできる権限を持つ攻撃者が、誤って設定されたサーバーを悪用し、ClickHouse サーバー上で任意のコードを実行できてしまう可能性があります。

以下のオープンソース版に修正が適用されています：v24.3.18.6, v24.8.14.27, v24.11.5.34, v24.12.5.65, v25.1.5.5

ClickHouse Cloud はこの脆弱性の影響を受けません。

クレジット：[Arseniy Dugin](https://github.com/ZerLes)



## ClickHouse v24.5 で修正、2024-08-01 {#fixed-in-clickhouse-release-2024-08-01}

### [CVE-2024-6873](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-432f-r822-j66f) {#CVE-2024-6873}

ClickHouse サーバーネイティブインターフェイスに対して特別に細工されたリクエストを送信することで、認証を経ない経路から ClickHouse サーバープロセスの実行フローをリダイレクトすることが可能です。このリダイレクトは、実行時点でメモリ内の 256 バイト範囲内で利用可能な内容に限定されます。この脆弱性は当社のバグ報奨金（Bug bounty）プログラムを通じて特定されたものであり、既知のリモートコード実行（RCE）の PoC（Proof of Concept）コードは作成も悪用もされていません。

修正は以下のオープンソースバージョンに反映済みです: v23.8.15.35-lts, v24.3.4.147-lts, v24.4.2.141-stable, v24.5.1.1763, v24.6.1.4423-stable

ClickHouse Cloud は異なるバージョニング方式を使用しており、この脆弱性に対する修正は v24.2 以降を実行しているすべてのインスタンスに適用されています。

謝辞:  malacupa（独立系リサーチャ）



## ClickHouse v24.1 で修正済み、2024-01-30 {#fixed-in-clickhouse-release-24-01-30}

### [CVE-2024-22412](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-45h5-f7g3-gr8r) {#CVE-2024-22412}

クエリキャッシュを有効にした ClickHouse を使用中にユーザーロールを切り替える際、不正確なデータを取得してしまうリスクがあります。ClickHouse は、影響を受けるバージョンの ClickHouse を使用しているユーザーに対し、アプリケーションが複数のロールを動的に切り替える場合はクエリキャッシュを使用しないよう勧告しています。

以下のオープンソース版に修正が反映されています: v24.1.1.2048, v24.1.8.22-stable, v23.12.6.19-stable, v23.8.12.13-lts, v23.3.22.3-lts

ClickHouse Cloud は異なるバージョン体系を使用しており、この脆弱性に対する修正は v24.0.2.54535 で適用されています。

クレジット: Runreveal チームの Evan Johnson 氏および Alan Braithwaite 氏 - 詳細は [彼らのブログ記事](https://blog.runreveal.com/cve-2024-22412-behind-the-bug-a-classic-caching-problem-in-the-clickhouse-query-cache/) を参照してください。



## ClickHouse v23.10.5.20 で修正済み、2023-11-26 {#fixed-in-clickhouse-release-23-10-5-20-2023-11-26}

### [CVE-2023-47118](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-g22g-p6q2-x39v) {#CVE-2023-47118}

デフォルトで 9000/tcp ポートで待ち受けるネイティブインターフェイスに影響する、ヒープバッファオーバーフローの脆弱性です。攻撃者は、T64 圧縮コーデック内のバグを誘発することで、ClickHouse サーバープロセスをクラッシュさせることができます。この脆弱性は認証不要で悪用可能です。

以下のオープンソースバージョンに修正が反映されています：v23.10.2.13, v23.9.4.11, v23.8.6.16, v23.3.16.7

ClickHouse Cloud は異なるバージョン体系を使用しており、この脆弱性の修正は v23.9.2.47475 で適用されています。

謝辞：malacupa（独立系リサーチャー）

### [CVE-2023-48298](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-qw9f-qv29-8938) {#CVE-2023-48298}

FPC 圧縮コーデックにおける整数アンダーフローの脆弱性です。攻撃者はこれを利用して ClickHouse サーバープロセスをクラッシュさせることができます。この脆弱性は認証不要で悪用可能です。

以下のオープンソースバージョンに修正が反映されています：v23.10.4.25, v23.9.5.29, v23.8.7.24, v23.3.17.13.

ClickHouse Cloud は異なるバージョン体系を使用しており、この脆弱性の修正は v23.9.2.47475 で適用されています。

謝辞：malacupa（独立系リサーチャー）

### [CVE-2023-48704](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-5rmf-5g48-xv63) {#CVE-2023-48704}

デフォルトで 9000/tcp ポートで待ち受けるネイティブインターフェイスに影響する、ヒープバッファオーバーフローの脆弱性です。攻撃者は、Gorilla コーデック内のバグを誘発することで、ClickHouse サーバープロセスをクラッシュさせることができます。この脆弱性は認証不要で悪用可能です。

以下のオープンソースバージョンに修正が反映されています：v23.10.5.20, v23.9.6.20, v23.8.8.20, v23.3.18.15.

ClickHouse Cloud は異なるバージョン体系を使用しており、この脆弱性の修正は v23.9.2.47551 で適用されています。

謝辞：malacupa（独立系リサーチャー）



## ClickHouse 22.9.1.2603 で修正（2022-09-22） {#fixed-in-clickhouse-release-22-9-1-2603-2022-9-22}

### CVE-2022-44011 {#CVE-2022-44011}

ClickHouse サーバーにおいて、ヒープバッファオーバーフローの問題が発見されました。悪意のあるユーザーが ClickHouse サーバーにデータをロードできる場合、細工された不正な CapnProto オブジェクトを挿入することで ClickHouse サーバーをクラッシュさせることができます。

修正はバージョン 22.9.1.2603、22.8.2.11、22.7.4.16、22.6.6.16、22.3.12.19 に反映されています。

クレジット: Kiojj（独立研究者）

### CVE-2022-44010 {#CVE-2022-44010}

ClickHouse サーバーにおいて、ヒープバッファオーバーフローの問題が発見されました。攻撃者は、特別に細工した HTTP リクエストを HTTP エンドポイント（デフォルトではポート 8123 で待ち受け）に送信することで、ヒープベースのバッファオーバーフローを引き起こし、ClickHouse サーバーのプロセスをクラッシュさせることができます。この攻撃には認証は不要です。

修正はバージョン 22.9.1.2603、22.8.2.11、22.7.4.16、22.6.6.16、22.3.12.19 に反映されています。

クレジット: Kiojj（独立研究者）



## ClickHouse 21.10.2.15 で修正済み、2021-10-18 {#fixed-in-clickhouse-release-21-10-2-215-2021-10-18}

### CVE-2021-43304 {#cve-2021-43304}

悪意のあるクエリを解析する際、ClickHouse の LZ4 圧縮コーデックにおいてヒープバッファオーバーフローが発生します。LZ4::decompressImpl ループ内のコピー処理、とくに任意のコピー操作である `wildCopy<copy_amount>(op, ip, copy_end)` について、コピー先バッファの上限を超えないことが検証されていません。

クレジット: JFrog Security Research Team

### CVE-2021-43305 {#cve-2021-43305}

悪意のあるクエリを解析する際、ClickHouse の LZ4 圧縮コーデックにおいてヒープバッファオーバーフローが発生します。LZ4::decompressImpl ループ内のコピー処理、とくに任意のコピー操作である `wildCopy<copy_amount>(op, ip, copy_end)` について、コピー先バッファの上限を超えないことが検証されていません。この問題は CVE-2021-43304 に非常によく似ていますが、脆弱なコピー処理は別の wildCopy 呼び出し内に存在します。

クレジット: JFrog Security Research Team

### CVE-2021-42387 {#cve-2021-42387}

悪意のあるクエリを解析する際、ClickHouse の LZ4 圧縮コーデックにおいてヒープの境界外読み取りが発生します。LZ4::decompressImpl() ループの一部として、圧縮データから 16 ビット符号なしのユーザー入力値（「offset」）が読み取られます。この offset は、その後コピー処理の長さを決定するために使用されますが、コピー元の上限チェックが行われていません。

クレジット: JFrog Security Research Team

### CVE-2021-42388 {#cve-2021-42388}

悪意のあるクエリを解析する際、ClickHouse の LZ4 圧縮コーデックにおいてヒープの境界外読み取りが発生します。LZ4::decompressImpl() ループの一部として、圧縮データから 16 ビット符号なしのユーザー入力値（「offset」）が読み取られます。この offset は、その後コピー処理の長さを決定するために使用されますが、コピー元の下限チェックが行われていません。

クレジット: JFrog Security Research Team

### CVE-2021-42389 {#cve-2021-42389}

悪意のあるクエリを解析する際、ClickHouse の Delta 圧縮コーデックにおいてゼロ除算が発生します。圧縮バッファの先頭バイトは、0 でないことを確認せずに剰余演算に使用されます。

クレジット: JFrog Security Research Team

### CVE-2021-42390 {#cve-2021-42390}

悪意のあるクエリを解析する際、ClickHouse の DeltaDouble 圧縮コーデックにおいてゼロ除算が発生します。圧縮バッファの先頭バイトは、0 でないことを確認せずに剰余演算に使用されます。

クレジット: JFrog Security Research Team

### CVE-2021-42391 {#cve-2021-42391}

悪意のあるクエリを解析する際、ClickHouse の Gorilla 圧縮コーデックにおいてゼロ除算が発生します。圧縮バッファの先頭バイトは、0 でないことを確認せずに剰余演算に使用されます。

クレジット: JFrog Security Research Team



## ClickHouse 21.4.3.21 で修正済み、2021-04-12 {#fixed-in-clickhouse-release-21-4-3-21-2021-04-12}

### CVE-2021-25263 {#cve-2021-25263}

CREATE DICTIONARY 権限を持つ攻撃者は、許可されたディレクトリの外にある任意のファイルを読み取ることができます。

この問題の修正は、バージョン 20.8.18.32-lts、21.1.9.41-stable、21.2.9.41-stable、21.3.6.55-lts、21.4.3.21-stable 以降に反映されています。

謝辞: [Vyacheslav Egoshin](https://twitter.com/vegoshin)



## ClickHouse リリース 19.14.3.3 で修正済み（2019-09-10） {#fixed-in-clickhouse-release-19-14-3-3-2019-09-10}

### CVE-2019-15024 {#cve-2019-15024}

ZooKeeper への書き込みアクセス権を持ち、かつ ClickHouse が稼働しているネットワークから到達可能なカスタムサーバーを実行できる攻撃者は、ClickHouse レプリカとして動作し ZooKeeper に登録される、独自にビルドした悪意のあるサーバーを作成できます。別のレプリカがその悪意のあるレプリカからデータパーツを取得する際に、`clickhouse-server` に対してファイルシステム上の任意のパスへの書き込みを強制させることが可能です。

謝辞: Yandex Information Security Team の Eldar Zaitov

### CVE-2019-16535 {#cve-2019-16535}

復号・伸長アルゴリズムにおける OOB read、OOB write、および整数アンダーフローが存在し、ネイティブプロトコル経由で RCE または DoS を引き起こすために悪用される可能性があります。

謝辞: Yandex Information Security Team の Eldar Zaitov

### CVE-2019-16536 {#cve-2019-16536}

スタックオーバーフローにより DoS を引き起こすことができる脆弱性があり、悪意のある認証済みクライアントによってトリガーされる可能性があります。

謝辞: Yandex Information Security Team の Eldar Zaitov



## ClickHouse リリース 19.13.6.1 で修正済み（2019-09-20） {#fixed-in-clickhouse-release-19-13-6-1-2019-09-20}

### CVE-2019-18657 {#cve-2019-18657}

テーブル関数 `url` には、攻撃者がリクエスト内に任意の HTTP ヘッダーを注入できてしまう脆弱性がありました。

謝辞: [Nikita Tikhomirov](https://github.com/NSTikhomirov)



## ClickHouse リリース 18.12.13 で修正済み, 2018-09-10 {#fixed-in-clickhouse-release-18-12-13-2018-09-10}

### CVE-2018-14672 {#cve-2018-14672}

CatBoost モデルを読み込むための関数において、パストラバーサルが可能となっており、エラーメッセージを通じて任意のファイルを読み込むことができました。

クレジット: Yandex Information Security Team の Andrey Krasichkov



## ClickHouse リリース 18.10.3 で修正済み（2018-08-13） {#fixed-in-clickhouse-release-18-10-3-2018-08-13}

### CVE-2018-14671 {#cve-2018-14671}

unixODBC はファイルシステムから任意の共有オブジェクトを読み込むことを許可しており、その結果、リモートコード実行の脆弱性が生じていました。

謝辞: Yandex Information Security Team の Andrey Krasichkov 氏および Evgeny Sidorov 氏



## ClickHouse リリース 1.1.54388 にて修正済み（2018-06-28） {#fixed-in-clickhouse-release-1-1-54388-2018-06-28}

### CVE-2018-14668 {#cve-2018-14668}

"remote" テーブル関数が "user"、"password"、"default_database" フィールドに任意の文字を受け付けていたため、クロスプロトコル・リクエスト・フォージェリ（Cross Protocol Request Forgery）攻撃を行うことが可能でした。

謝辞: Yandex Information Security Team の Andrey Krasichkov



## ClickHouse リリース 1.1.54390 で修正、2018-07-06 {#fixed-in-clickhouse-release-1-1-54390-2018-07-06}

### CVE-2018-14669 {#cve-2018-14669}

ClickHouse の MySQL クライアントでは "LOAD DATA LOCAL INFILE" 機能が有効になっており、悪意のある MySQL サーバーが、接続された ClickHouse サーバー上の任意のファイルを読み取ることが可能でした。

クレジット: Yandex Information Security Team の Andrey Krasichkov 氏および Evgeny Sidorov 氏



## ClickHouse リリース 1.1.54131 で修正済み、2017-01-10 {#fixed-in-clickhouse-release-1-1-54131-2017-01-10}

### CVE-2018-14670 {#cve-2018-14670}

deb パッケージの不適切な設定により、データベースが不正に使用されるおそれがありました。

謝辞: 英国国家サイバーセキュリティセンター (NCSC)

