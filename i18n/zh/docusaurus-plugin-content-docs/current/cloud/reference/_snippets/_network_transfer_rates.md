下表展示了不同云服务商及区域在通过公共互联网或跨区域传输数据出站时的费用差异。

**AWS**

<table style={{ textAlign: 'center' }}>
    <thead >
        <tr>
            <th>Cloud Provider</th>
            <th>Region</th>
            <th>Public Internet Egress</th>
            <th>Same region</th>
            <th>Cross-region <br/>(all Tier 1)</th>
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

$^*$数据传输费用按每传输 1 GB 数据的美元单价计算

**GCP**

<table style={{ textAlign: 'center' }}>
    <thead>
    <tr>
        <th rowSpan="2">云服务商</th>
        <th rowSpan="2">源区域</th>
        <th rowSpan="2">公网出口</th>
        <th colSpan="5">目标区域</th>
    </tr>
    <tr>
        <th>同一区域</th>
        <th>北美</th>
        <th>欧洲</th>
        <th>亚洲、大洋洲</th>
        <th>中东、南美、非洲</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>`GCP`</td>
        <td>`us-central1`</td>
        <td>`$0.1140`</td>
        <td>`$0.0000`</td>
        <td>`$0.0360`（第 1 级）</td>
        <td>`$0.0720`（第 2 级）</td>
        <td>`$0.1200`（第 3 级）</td>
        <td>`$0.1620`（第 4 级）</td>
    </tr>
    <tr>
        <td>`GCP`</td>
        <td>`us-east1`</td>
        <td>`$0.1140`</td>
        <td>`$0.0000`</td>
        <td>`$0.0360`（第 1 级）</td>
        <td>`$0.0720`（第 2 级）</td>
        <td>`$0.1200`（第 3 级）</td>
        <td>`$0.1620`（第 4 级）</td>
    </tr>
    <tr>
        <td>`GCP`</td>
        <td>`europe-west4`</td>
        <td>`$0.1140`</td>
        <td>`$0.0000`</td>
        <td>`$0.0720`（第 2 级）</td>
        <td>`$0.0360`（第 1 级）</td>
        <td>`$0.1200`（第 3 级）</td>
        <td>`$0.1620`（第 4 级）</td>
    </tr>
    <tr>
        <td>`GCP`</td>
        <td>`asia-southeast1`</td>
        <td>`$0.1440`</td>
        <td>`$0.0000`</td>
        <td>`$0.1200`（第 3 级）</td>
        <td>`$0.1200`（第 3 级）</td>
        <td>`$0.1200`（第 3 级）</td>
        <td>`$0.1620`（第 4 级）</td>
    </tr>
    </tbody>
</table>

$^*$数据传输费用按每传输 1 GB 数据计费（单位：$/GB）

**Azure**

<table style={{ textAlign: 'center' }}>
    <thead>
    <tr>
        <th rowSpan="2">云服务商</th>
        <th rowSpan="2">源区域</th>
        <th rowSpan="2">公共互联网出口</th>
        <th colSpan="5">目标区域</th>
    </tr>
    <tr>
        <th>同一区域</th>
        <th>北美</th>
        <th>欧洲</th>
        <th>亚洲、大洋洲</th>
        <th>中东、南美、非洲</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>`Azure`</td>
        <td>`eastus2`</td>
        <td>`$0.1020`</td>
        <td>`$0.0000`</td>
        <td>`$0.0300`（第 1 档）</td>
        <td>`$0.0660`（第 2 档）</td>
        <td>`$0.0660`（第 2 档）</td>
        <td>`$0.0660`（第 2 档）</td>
    </tr>
    <tr>
        <td>`Azure`</td>
        <td>`westus3`</td>
        <td>`$0.1020`</td>
        <td>`$0.0000`</td>
        <td>`$0.0300`（第 1 档）</td>
        <td>`$0.0660`（第 2 档）</td>
        <td>`$0.0660`（第 2 档）</td>
        <td>`$0.0660`（第 2 档）</td>
    </tr>
    <tr>
        <td>`Azure`</td>
        <td>`germanywestcentral`</td>
        <td>`$0.1020`</td>
        <td>`$0.0000`</td>
        <td>`$0.0660`（第 2 档）</td>
        <td>`$0.0300`（第 1 档）</td>
        <td>`$0.0660`（第 2 档）</td>
        <td>`$0.0660`（第 2 档）</td>
    </tr>
    </tbody>
</table>

$^*$数据传输费用按每传输 1 GB 数据的美元单价计费