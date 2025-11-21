以下の表は、クラウドプロバイダおよびリージョンごとに、パブリックインターネットまたはリージョン間での送信（イグレス）データ転送料金がどのように異なるかを示しています。

**AWS**

<table style={{ textAlign: 'center' }}>
    <thead >
        <tr>
            <th>クラウドプロバイダ</th>
            <th>リージョン</th>
            <th>パブリックインターネット送信（イグレス）</th>
            <th>同一リージョン内</th>
            <th>リージョン間 <br/>(すべて Tier 1)</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>`AWS`</td>
            <td>`ap-northeast-1`</td>
            <td>`$0.1440`</td>
            <td>`$0.0000`</td>
            <td>`$0.1152`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`ap-south-1`</td>
            <td>`$0.1384`</td>
            <td>`$0.0000`</td>
            <td>`$0.1104`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`ap-southeast-1`</td>
            <td>`$0.1512`</td>
            <td>`$0.0000`</td>
            <td>`$0.1152`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`ap-southeast-2`</td>
            <td>`$0.1440`</td>
            <td>`$0.0000`</td>
            <td>`$0.1248`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`eu-central-1`</td>
            <td>`$0.1152`</td>
            <td>`$0.0000`</td>
            <td>`$0.0312`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`eu-west-1`</td>
            <td>`$0.1152`</td>
            <td>`$0.0000`</td>
            <td>`$0.0312`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`eu-west-2`</td>
            <td>`$0.1152`</td>
            <td>`$0.0000`</td>
            <td>`$0.0312`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`us-east-1`</td>
            <td>`$0.1152`</td>
            <td>`$0.0000`</td>
            <td>`$0.0312`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`us-east-2`</td>
            <td>`$0.1152`</td>
            <td>`$0.0000`</td>
            <td>`$0.0312`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`us-west-2`</td>
            <td>`$0.1152`</td>
            <td>`$0.0000`</td>
            <td>`$0.0312`</td>
        </tr>
    </tbody>
</table>

$^*$データ転送料金は、転送されたデータ 1GB あたりの米ドル（$）建て料金です

**GCP**

<table style={{ textAlign: 'center' }}>
    <thead>
    <tr>
        <th rowSpan="2">クラウドプロバイダー</th>
        <th rowSpan="2">送信元リージョン</th>
        <th rowSpan="2">パブリックインターネット送信</th>
        <th colSpan="5">宛先リージョン</th>
    </tr>
    <tr>
        <th>同一リージョン</th>
        <th>北米</th>
        <th>欧州</th>
        <th>アジア・オセアニア</th>
        <th>中東・南米・アフリカ</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>`GCP`</td>
        <td>`us-central1`</td>
        <td>`$0.1140`</td>
        <td>`$0.0000`</td>
        <td>`$0.0360` (ティア 1)</td>
        <td>`$0.0720` (ティア 2)</td>
        <td>`$0.1200` (ティア 3)</td>
        <td>`$0.1620` (ティア 4)</td>
    </tr>
    <tr>
        <td>`GCP`</td>
        <td>`us-east1`</td>
        <td>`$0.1140`</td>
        <td>`$0.0000`</td>
        <td>`$0.0360` (ティア 1)</td>
        <td>`$0.0720` (ティア 2)</td>
        <td>`$0.1200` (ティア 3)</td>
        <td>`$0.1620` (ティア 4)</td>
    </tr>
    <tr>
        <td>`GCP`</td>
        <td>`europe-west4`</td>
        <td>`$0.1140`</td>
        <td>`$0.0000`</td>
        <td>`$0.0720` (ティア 2)</td>
        <td>`$0.0360` (ティア 1)</td>
        <td>`$0.1200` (ティア 3)</td>
        <td>`$0.1620` (ティア 4)</td>
    </tr>
    <tr>
        <td>`GCP`</td>
        <td>`asia-southeast1`</td>
        <td>`$0.1440`</td>
        <td>`$0.0000`</td>
        <td>`$0.1200` (ティア 3)</td>
        <td>`$0.1200` (ティア 3)</td>
        <td>`$0.1200` (ティア 3)</td>
        <td>`$0.1620` (ティア 4)</td>
    </tr>
    </tbody>
</table>

$^*$データ転送料金は、転送データ 1GB あたりの米ドル建て料金です

**Azure**

<table style={{ textAlign: 'center' }}>
    <thead>
    <tr>
        <th rowSpan="2">クラウドプロバイダー</th>
        <th rowSpan="2">送信元リージョン</th>
        <th rowSpan="2">パブリックインターネット送信</th>
        <th colSpan="5">宛先リージョン</th>
    </tr>
    <tr>
        <th>同一リージョン</th>
        <th>北米</th>
        <th>欧州</th>
        <th>アジア、オセアニア</th>
        <th>中東、南米、アフリカ</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>`Azure`</td>
        <td>`eastus2`</td>
        <td>`$0.1020`</td>
        <td>`$0.0000`</td>
        <td>`$0.0300` (ティア 1)</td>
        <td>`$0.0660` (ティア 2)</td>
        <td>`$0.0660` (ティア 2)</td>
        <td>`$0.0660` (ティア 2)</td>
    </tr>
    <tr>
        <td>`Azure`</td>
        <td>`westus3`</td>
        <td>`$0.1020`</td>
        <td>`$0.0000`</td>
        <td>`$0.0300` (ティア 1)</td>
        <td>`$0.0660` (ティア 2)</td>
        <td>`$0.0660` (ティア 2)</td>
        <td>`$0.0660` (ティア 2)</td>
    </tr>
    <tr>
        <td>`Azure`</td>
        <td>`germanywestcentral`</td>
        <td>`$0.1020`</td>
        <td>`$0.0000`</td>
        <td>`$0.0660` (ティア 2)</td>
        <td>`$0.0300` (ティア 1)</td>
        <td>`$0.0660` (ティア 2)</td>
        <td>`$0.0660` (ティア 2)</td>
    </tr>
    </tbody>
</table>

$^*$データ転送料金は、転送されたデータ 1GB あたりの米ドル建て料金です