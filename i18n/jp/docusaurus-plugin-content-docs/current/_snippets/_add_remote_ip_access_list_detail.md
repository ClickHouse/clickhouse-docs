
import Image from '@theme/IdealImage';
import ip_allow_list_check_list from '@site/static/images/_snippets/ip-allow-list-check-list.png';
import ip_allow_list_add_current_ip from '@site/static/images/_snippets/ip-allow-list-add-current-ip.png';

<details>
    <summary>IPアクセスリストの管理</summary>

ClickHouse Cloudサービスのリストから作業するサービスを選択し、**設定**に切り替えます。 IPアクセスリストに、あなたのClickHouse Cloudサービスに接続する必要があるリモートシステムのIPアドレスまたは範囲が含まれていない場合は、**IPを追加**することで問題を解決できます：

<Image size="md" img={ip_allow_list_check_list} alt="IPアクセスリストでサービスがあなたのIPアドレスからのトラフィックを許可しているか確認してください" border />

接続する必要がある個々のIPアドレスまたはアドレス範囲を追加します。 フォームを適宜修正し、**保存**します。

<Image size="md" img={ip_allow_list_add_current_ip} alt="ClickHouse CloudのIPアクセスリストに現在のIPアドレスを追加する" border />

</details>
```
