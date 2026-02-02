# NixOS に ClickHouse をインストールする \{#install-from-nix\}

> ClickHouse は Nixpkgs リポジトリで提供されており、**Linux** と **macOS** 上で Nix を使ってインストールできます。

<VerticalStepper>

## Nix を使って ClickHouse をインストールする \{#install-clickhouse-using-nix\}

Nix を使用すると、ClickHouse をシステムに永続的に追加することなくインストールできます:

```bash
# 最新の安定版をインストール
nix shell nixpkgs#clickhouse

# または LTS 版をインストール
nix shell nixpkgs#clickhouse-lts
```

これにより、現在のシェルセッションで `clickhouse` バイナリが利用可能になります。

- `nixpkgs#clickhouse` パッケージは最新の安定版を提供します。
- `nixpkgs#clickhouse-lts` パッケージは Long Term Support 版を提供します。
- どちらのパッケージも Linux と macOS で動作します。

## 永続的なインストール \{#permanent-installation\}

ClickHouse をシステムに永続的にインストールするには:

**NixOS ユーザーの場合**、`configuration.nix` に次を追加します:

```nix
environment.systemPackages = with pkgs; [
  clickhouse
];
```

その後、システムを再構築します:

```bash
sudo nixos-rebuild switch
```

**非 NixOS ユーザーの場合**、Nix プロファイル経由でインストールします:

```bash
# 最新の安定版をインストール
nix profile install nixpkgs#clickhouse

# または LTS 版をインストール
nix profile install nixpkgs#clickhouse-lts
```

## ClickHouse サーバーを起動する \{#start-clickhouse-server\}

インストール後、次のコマンドで ClickHouse サーバーを起動できます:

```bash
clickhouse-server
```

デフォルトでは、サーバーは基本的な設定で起動し、`localhost:9000` で待ち受けます。

NixOS 上で本番用途とする場合は、ClickHouse をシステムサービスとして構成することを推奨します。利用可能な設定オプションについては、[NixOS マニュアル](https://search.nixos.org/options?query=clickhouse) を参照してください。

## ClickHouse クライアントを起動する \{#start-clickhouse-client\}

ClickHouse サーバーに接続するには、新しいターミナルを開き、次を実行します:

```bash
clickhouse-client
```

</VerticalStepper>

## Nix パッケージについて \{#about-nix-package\}

Nixpkgs に含まれる ClickHouse パッケージには、次のコンポーネントが含まれます。

- `clickhouse-server` - ClickHouse データベースサーバー
- `clickhouse-client` - ClickHouse に接続するためのコマンドラインクライアント
- `clickhouse-local` - ローカルファイルに対して SQL クエリを実行するためのツール
- その他の ClickHouse ユーティリティ

Nixpkgs における ClickHouse パッケージの詳細については、次を参照してください。

- [Nixpkgs ClickHouse package](https://search.nixos.org/packages?query=clickhouse)
- [NixOS ClickHouse service options](https://search.nixos.org/options?query=clickhouse)