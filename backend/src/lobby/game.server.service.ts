import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import type { Lobby } from './entities/lobby.entity';
import type { FireWall, RangeConfig } from '../config/schema';
import * as os from 'node:os';
import * as net from 'node:net';

type NetError = Error & { code?: string };

@Injectable()
export class GameServerService {
    constructor(private readonly configService: ConfigService) {}

    /** This is the same way as the obpf lobby client determines the port,
     * @see https://unix.stackexchange.com/questions/55913/whats-the-easiest-way-to-find-an-unused-local-port
     *
     */
    private async getRandomPort(): Promise<number> {
        return new Promise((resolve, reject) => {
            const server = net.createServer();
            server.once('error', (err: NetError) => {
                server.close();
                reject(err);
            });

            server.once('listening', () => {
                const address = server.address();

                if (!address) {
                    reject(
                        new Error(
                            'address is not defined, even if it should be',
                        ),
                    );
                    return;
                }

                // see: https://nodejs.org/docs/latest-v20.x/api/net.html#serveraddress
                if (typeof address === 'string') {
                    reject(
                        new Error(
                            'address is a unix domain socket, which is unexpected',
                        ),
                    );
                    return;
                }

                resolve(address.port);
                server.close();
            });
            server.listen(0);
        });
    }

    // from: https://stackoverflow.com/questions/19129570/how-can-i-check-if-port-is-busy-in-nodejs
    private async isPortOpen(port: number): Promise<boolean> {
        return new Promise((resolve) => {
            const server = net.createServer();
            server.once('error', (err: NetError) => {
                server.close();
                if (err.code == 'EADDRINUSE') {
                    resolve(false);
                } else {
                    resolve(false);
                }
            });
            server.once('listening', () => {
                resolve(true);
                server.close();
            });
            server.listen(port);
        });
    }

    private randomRange(start: number, end: number): number {
        return Math.round(Math.random() * (end - start) + start);
    }

    private async getPortInRange(config: RangeConfig): Promise<number> {
        let port = this.randomRange(config.start, config.end);
        let amount = 0;
        let total = 0;

        const MAX_AMOUNT = 10;
        const MAXIMUM_TOTAL = 1000;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        while (true) {
            const isOpen = await this.isPortOpen(port);
            if (isOpen) {
                return port;
            }

            ++amount;
            ++total;

            if (total >= MAXIMUM_TOTAL) {
                throw new Error(
                    `No free port in range ${config.start.toString()} - ${config.end.toString()} could be found after ${total.toString()} attempts`,
                );
            }

            if (amount >= MAX_AMOUNT || port + 1 > config.end) {
                amount = 0;
                port = this.randomRange(config.start, config.end);
            }

            ++port;
        }
    }

    private async allowPortInFirewall(
        _port: number,
        config: FireWall,
    ): Promise<void> {
        if (config === 'none') {
            return;
        }

        throw new Error('Not Implemented');

        /*   switch (config.type) {
            case 'ufw': {
                if (os.platform() !== 'linux') {
                    return;
                }
                //TODO
                return;
            }
            
            case 'docker-ufw': {
                if (os.platform() !== 'linux') {
                    return;
                }
                //TODO
                return;
            } 

            case 'iptables': {
                if (os.platform() !== 'linux') {
                    return;
                }
                //TODO
                return;
            }
            default:
                throw new Error('unknown firewall');
        } */
    }

    async getPort(): Promise<number> {
        const portConfig = this.configService.config.config.portConfig;

        let port: number;
        switch (portConfig.mode) {
            case 'random':
                port = await this.getRandomPort();
                break;
            case 'inRange':
                port = await this.getPortInRange(portConfig.config);
                break;
            default:
                throw new Error('unknown port mode');
        }

        await this.allowPortInFirewall(port, portConfig.firewall);

        return port;
    }

    async start(_port: number, _playerCount: number): Promise<void> {
        //TODO: either use the configServer or a builtin node module
    }
}
