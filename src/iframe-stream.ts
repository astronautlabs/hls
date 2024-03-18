
export interface IFrameStream {
    bandwidth: number;
    averageBandwidth?: number;
    codecs: string[] | undefined;
    resolution?: string;
    hdcpLevel?: 'NONE' | 'TYPE-0';
    videoGroup?: string;
    uri: string;
}
