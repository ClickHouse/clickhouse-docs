import ip_allow_list_check_list from '@site/static/images/_snippets/ip-allow-list-check-list.png';
import ip_allow_list_add_current_ip from '@site/static/images/_snippets/ip-allow-list-add-current-ip.png';

<details>
    <summary>IP アクセスリストの管理</summary>

ClickHouse Cloud サービスのリストから作業するサービスを選択し、**設定**に切り替えます。IP アクセスリストに、ClickHouse Cloud サービスに接続する必要のあるリモートシステムの IP アドレスまたは範囲が含まれていない場合、**IP の追加**で問題を解決できます：

<img src={ip_allow_list_check_list} class="image" alt="サービスがトラフィックを許可しているか確認する" />

接続する必要がある個々の IP アドレス、またはアドレスの範囲を追加します。フォームを適宜修正して、**保存**します。

<img src={ip_allow_list_add_current_ip} class="image" alt="現在の IP アドレスを追加する" />

</details>
