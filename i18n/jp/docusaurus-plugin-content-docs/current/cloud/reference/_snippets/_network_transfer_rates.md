

以下の表は、クラウドプロバイダーおよび地域ごとして、パブリックインターネットまたは地域を超えたデータ転送料金がどのように異なるかを示しています。

**AWS**

<table style={{ textAlign: 'center' }}>
    <thead >
        <tr>
            <th>クラウドプロバイダー</th>
            <th>地域</th>
            <th>パブリックインターネットエグレス</th>
            <th>同じ地域</th>
            <th>クロスリージョン <br/>（すべてTier 1）</th>
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

$^*$データ転送料金は、転送されたデータのGBあたりの$で表されています。

**GCP**

<table style={{ textAlign: 'center' }}>
    <thead>
    <tr>
        <th rowSpan="2">クラウドプロバイダー</th>
        <th rowSpan="2">オリジン地域</th>
        <th rowSpan="2">パブリックインターネットエグレス</th>
        <th colSpan="5">デスティネーション地域</th>
    </tr>
    <tr>
        <th>同じ地域</th>
        <th>北アメリカ</th>
        <th>ヨーロッパ</th>
        <th>アジア、オセアニア</th>
        <th>中東、南アメリカ、アフリカ</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>`GCP`</td>
        <td>`us-central1`</td>
        <td>`$0.1140`</td>
        <td>`$0.0000`</td>
        <td>`$0.0360` (Tier 1)</td>
        <td>`$0.0720` (Tier 2)</td>
        <td>`$0.1200` (Tier 3)</td>
        <td>`$0.1620` (Tier 4)</td>
    </tr>
    <tr>
        <td>`GCP`</td>
        <td>`us-east1`</td>
        <td>`$0.1140`</td>
        <td>`$0.0000`</td>
        <td>`$0.0360` (Tier 1)</td>
        <td>`$0.0720` (Tier 2)</td>
        <td>`$0.1200` (Tier 3)</td>
        <td>`$0.1620` (Tier 4)</td>
    </tr>
    <tr>
        <td>`GCP`</td>
        <td>`europe-west4`</td>
        <td>`$0.1140`</td>
        <td>`$0.0000`</td>
        <td>`$0.0720` (Tier 2)</td>
        <td>`$0.0360` (Tier 1)</td>
        <td>`$0.1200` (Tier 3)</td>
        <td>`$0.1620` (Tier 4)</td>
    </tr>
    <tr>
        <td>`GCP`</td>
        <td>`asia-southeast1`</td>
        <td>`$0.1440`</td>
        <td>`$0.0000`</td>
        <td>`$0.1200` (Tier 3)</td>
        <td>`$0.1200` (Tier 3)</td>
        <td>`$0.1200` (Tier 3)</td>
        <td>`$0.1620` (Tier 4)</td>
    </tr>
    </tbody>
</table>

$^*$データ転送料金は、転送されたデータのGBあたりの$で表されています。

**Azure**

<table style={{ textAlign: 'center' }}>
    <thead>
    <tr>
        <th rowSpan="2">クラウドプロバイダー</th>
        <th rowSpan="2">オリジン地域</th>
        <th rowSpan="2">パブリックインターネットエグレス</th>
        <th colSpan="5">デスティネーション地域</th>
    </tr>
    <tr>
        <th>同じ地域</th>
        <th>北アメリカ</th>
        <th>ヨーロッパ</th>
        <th>アジア、オセアニア</th>
        <th>中東、南アメリカ、アフリカ</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>`Azure`</td>
        <td>`eastus2`</td>
        <td>`$0.1020`</td>
        <td>`$0.0000`</td>
        <td>`$0.0300` (Tier 1)</td>
        <td>`$0.0660` (Tier 2)</td>
        <td>`$0.0660` (Tier 2)</td>
        <td>`$0.0660` (Tier 2)</td>
    </tr>
    <tr>
        <td>`Azure`</td>
        <td>`westus3`</td>
        <td>`$0.1020`</td>
        <td>`$0.0000`</td>
        <td>`$0.0300` (Tier 1)</td>
        <td>`$0.0660` (Tier 2)</td>
        <td>`$0.0660` (Tier 2)</td>
        <td>`$0.0660` (Tier 2)</td>
    </tr>
    <tr>
        <td>`Azure`</td>
        <td>`germanywestcentral`</td>
        <td>`$0.1020`</td>
        <td>`$0.0000`</td>
        <td>`$0.0660` (Tier 2)</td>
        <td>`$0.0300` (Tier 1)</td>
        <td>`$0.0660` (Tier 2)</td>
        <td>`$0.0660` (Tier 2)</td>
    </tr>
    </tbody>
</table>

$^*$データ転送料金は、転送されたデータのGBあたりの$で表されています。
