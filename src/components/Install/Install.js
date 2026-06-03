import {CardPrimary} from '@clickhouse/click-ui/bundled';
import {useState} from 'react';

const InstallSelector = (props) => {

    const [platform, setPlatformType] = useState(null)

    const handleSelectCLI = () => setPlatformType('CLI');
    const handleSelectDocker = () => setPlatformType('Docker');
    const handleSelectSource = () => setPlatformType('Source');

    const handleSelectDebian = () => setPlatformType('Debian');
    const handleSelectRedhat = () => setPlatformType('Redhat');
    const handleSelectLinuxOther = () => setPlatformType('LinuxOther');
    const handleSelectNixOS = () => setPlatformType('NixOS');


    const renderDistribution = () => {
        return <>
            <h3 className="install-group-heading">Local development</h3>
            <p className="install-group-description">
                Run ClickHouse on your own machine to build, test, and experiment.
                The ClickHouse CLI is the quickest path and the one the rest of our
                guides assume.
            </p>
            <div className="installContainer">
                <CardPrimary
                    className="install-card"
                    alignContent="center"
                    iconUrl="/docs/img/clickhouse-logo-mark.svg"
                    infoUrl="https://clickhouse.com"
                    onClick={handleSelectCLI}
                    size="sm"
                    title="Quick install"
                    isSelected={platform === 'CLI'}
                />
                <CardPrimary
                    className="install-card"
                    alignContent="center"
                    iconUrl="/docs/img/docker.svg"
                    infoUrl="https://clickhouse.com"
                    onClick={handleSelectDocker}
                    size="sm"
                    title="Docker"
                    isSelected={platform === 'Docker'}
                />
                <CardPrimary
                    className="install-card"
                    alignContent="center"
                    icon="code"
                    infoUrl="https://clickhouse.com"
                    onClick={handleSelectSource}
                    size="sm"
                    title="Source & CI builds"
                    isSelected={platform === 'Source'}
                />
            </div>
            <h3 className="install-group-heading">Production server</h3>
            <p className="install-group-description">
                Install ClickHouse Server from packages or binaries for a
                long-running deployment on your own infrastructure.
            </p>
            <div className="installContainer">
                <CardPrimary
                    className="install-card"
                    alignContent="center"
                    iconUrl="/docs/img/DebianUbuntu.svg"
                    infoUrl="https://clickhouse.com"
                    onClick={handleSelectDebian}
                    size="sm"
                    title="Debian/Ubuntu"
                    isSelected={platform === 'Debian'}
                />
                <CardPrimary
                    className="install-card"
                    alignContent="center"
                    iconUrl="/docs/img/redhat.svg"
                    infoUrl="https://clickhouse.com"
                    onClick={handleSelectRedhat}
                    size="sm"
                    title="Redhat"
                    isSelected={platform === 'Redhat'}
                />
                <CardPrimary
                    className="install-card"
                    alignContent="center"
                    iconUrl="/docs/img/nixos.svg"
                    infoUrl="https://clickhouse.com"
                    onClick={handleSelectNixOS}
                    size="sm"
                    title="NixOS"
                    isSelected={platform === 'NixOS'}
                />
                <CardPrimary
                    className="install-card"
                    alignContent="center"
                    iconUrl="/docs/img/linux.svg"
                    infoUrl="https://clickhouse.com"
                    onClick={handleSelectLinuxOther}
                    size="sm"
                    title="Other Linux"
                    isSelected={platform === 'LinuxOther'}
                />
            </div>
        </>
    }
    const renderInstallInstructions = (props) => {
        if (platform === 'CLI') {
            return props.cli
        } else if (platform === 'Debian') {
            return props.debian_prod
        } else if (platform === 'Redhat') {
            return props.rpm_prod
        } else if (platform === 'LinuxOther') {
            return props.tar_prod
        } else if (platform === 'NixOS') {
            return props.nixos
        } else if (platform === 'Docker') {
            return props.docker
        } else if (platform === 'Source') {
            return props.source
        } else {
            return null
        }
    };


    return (
        <>
        <div className="prod-or-quick-install">
            {renderDistribution()}
        </div>
        <div className="installInstructions">
            {renderInstallInstructions(props)}
        </div>
        </>
    )
}

export default InstallSelector;
