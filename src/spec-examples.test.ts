import { describe, it } from "@jest/globals";
import { Parser } from "./parser";
import { RFC8216_8_10_EXT_X_DATERANGE_CARRYING_SCTE_35_TAGS, RFC8216_8_1_SIMPLE_MEDIA_PLAYLIST, RFC8216_8_2_LIVE_MEDIA_PLAYLIST_USING_HTTPS, RFC8216_8_3_PLAYLIST_WITH_ENCRYPTED_MEDIA_SEGMENTS, RFC8216_8_4_MASTER_PLAYLIST, RFC8216_8_5_MASTER_PLAYLIST_WITH_I_FRAMES, RFC8216_8_6_MASTER_PLAYLIST_WITH_ALTERNATIVE_AUDIO, RFC8216_8_7_MASTER_PLAYLIST_WITH_ALTERNATIVE_VIDEO, RFC8216_8_8_SESSION_DATA_IN_A_MASTER_PLAYLIST, RFC8216_8_9_CHARACTERISTICS_ATTRIBUTE_CONTAINING_MULTIPLE_CHARACTERISTICS } from "./fixtures";
import { MasterPlaylist, MediaPlaylist, Playlists } from "./playlist";
import { expect } from "chai";
import { MediaSegment } from "./media-segment";
import { AES128EncryptionKey } from "./encryption-key";
import { VariantStream } from "./variant-stream";
import { IFrameStream } from "./iframe-stream";
import { Media } from "./media";

const SEGMENT_DEFAULTS: MediaSegment = {
    uri: <any>undefined,
    byteRange: undefined,
    dateRange: undefined,
    discontinuity: false,
    encryption: undefined,
    mediaInitialization: undefined,
    programDateTime: undefined,
    title: undefined
};

const STREAM_DEFAULTS: VariantStream = {
    uri: <any>undefined,
    bandwidth: <any>undefined,
    codecs: undefined,
    audioGroup: undefined,
    averageBandwidth: undefined,
    closedCaptionsGroup: undefined,
    frameRate: undefined,
    hdcpLevel: undefined,
    resolution: undefined,
    subtitlesGroup: undefined,
    videoGroup: undefined
}

const IFRAME_STREAM_DEFAULTS: IFrameStream = {
    uri: <any>undefined,
    bandwidth: <any>undefined,
    codecs: undefined,
    averageBandwidth: undefined,
    hdcpLevel: undefined,
    resolution: undefined,
    videoGroup: undefined
}

const MEDIA_PLAYLIST_DEFAULTS: MediaPlaylist = {
    discontinuitySequence: 0,
    mediaSequence: 0,
    ended: false,
    iframesOnly: false,
    independentSegments: false,
    kind: 'media',
    segments: [],
    start: undefined,
    targetDuration: <any>undefined,
    type: undefined,
    version: 1
};

const MASTER_PLAYLIST_DEFAULTS: MasterPlaylist = {
    independentSegments: false,
    kind: 'master',
    media: [],
    iframeStreams: [],
    sessionData: [],
    start: undefined,
    streams: [],
    version: 1
}

const AES128_ENCRYPTION_KEY_DEFAULTS: AES128EncryptionKey = {
    method: 'AES-128',
    uri: <any>undefined,
    iv: undefined,
    keyFormat: undefined,
    keyFormatVersions: undefined
}

describe("Parser", () => {
    describe("parse()", () => {
        it(`parses RFC 8216 (8.1) example 'Simple Media Playlist'`, () => {
            let playlist = new Parser().parse(RFC8216_8_1_SIMPLE_MEDIA_PLAYLIST) as MediaPlaylist; 
            expect(playlist).to.eql(<MediaPlaylist>{
                ...MEDIA_PLAYLIST_DEFAULTS,
                targetDuration: 10,
                segments: [
                    { ...SEGMENT_DEFAULTS, duration: 9.009, uri: 'http://media.example.com/first.ts' },
                    { ...SEGMENT_DEFAULTS, duration: 9.009, uri: 'http://media.example.com/second.ts' },
                    { ...SEGMENT_DEFAULTS, duration: 3.003, uri: 'http://media.example.com/third.ts' }
                ],
                version: 3
            });
        });
        it(`parses RFC 8216 (8.2) example 'Live Media Playlist Using HTTPS'`, () => {
            let playlist = new Parser().parse(RFC8216_8_2_LIVE_MEDIA_PLAYLIST_USING_HTTPS);
            expect(playlist).to.eql(<MediaPlaylist>{
                ...MEDIA_PLAYLIST_DEFAULTS,
                targetDuration: 8,
                mediaSequence: 2680,
                segments: [
                    { ...SEGMENT_DEFAULTS, duration: 7.975, uri: 'https://priv.example.com/fileSequence2680.ts' },
                    { ...SEGMENT_DEFAULTS, duration: 7.941, uri: 'https://priv.example.com/fileSequence2681.ts' },
                    { ...SEGMENT_DEFAULTS, duration: 7.975, uri: 'https://priv.example.com/fileSequence2682.ts' }
                ],
                version: 3
            });
        });
        it(`parses RFC 8216 (8.3) example 'Playlist with Encrypted Media Segments'`, () => {
            let playlist = new Parser().parse(RFC8216_8_3_PLAYLIST_WITH_ENCRYPTED_MEDIA_SEGMENTS);
            expect(playlist).to.eql(<MediaPlaylist>{
                ...MEDIA_PLAYLIST_DEFAULTS,
                targetDuration: 15,
                mediaSequence: 7794,
                segments: [
                    { 
                        ...SEGMENT_DEFAULTS, 
                        duration: 2.833, 
                        uri: 'http://media.example.com/fileSequence52-A.ts',
                        encryption: {
                            ...AES128_ENCRYPTION_KEY_DEFAULTS,
                            method: 'AES-128',
                            uri: 'https://priv.example.com/key.php?r=52'
                        }
                    },
                    { ...SEGMENT_DEFAULTS, duration: 15.0, uri: 'http://media.example.com/fileSequence52-B.ts' },
                    { ...SEGMENT_DEFAULTS, duration: 13.333, uri: 'http://media.example.com/fileSequence52-C.ts' },
                    { 
                        ...SEGMENT_DEFAULTS, 
                        duration: 15.0, 
                        uri: 'http://media.example.com/fileSequence53-A.ts',
                        encryption: {
                            ...AES128_ENCRYPTION_KEY_DEFAULTS,
                            method: 'AES-128',
                            uri: 'https://priv.example.com/key.php?r=53'
                        }
                    }
                ],
                version: 3
            });
        });
        it(`parses RFC 8216 (8.4) example 'Master Playlist'`, () => {
            let playlist = new Parser().parse(RFC8216_8_4_MASTER_PLAYLIST);
            expect(playlist).to.eql(<MasterPlaylist>{
                ...MASTER_PLAYLIST_DEFAULTS,
                version: 1,
                iframeStreams: [],
                streams: [
                    { ...STREAM_DEFAULTS, bandwidth: 1280000, averageBandwidth: 1000000, uri: 'http://example.com/low.m3u8' },
                    { ...STREAM_DEFAULTS, bandwidth: 2560000, averageBandwidth: 2000000, uri: 'http://example.com/mid.m3u8' },
                    { ...STREAM_DEFAULTS, bandwidth: 7680000, averageBandwidth: 6000000, uri: 'http://example.com/hi.m3u8' },
                    { ...STREAM_DEFAULTS, bandwidth: 65000, codecs: ['mp4a.40.5'], uri: 'http://example.com/audio-only.m3u8' }
                ]
            });
        });
        it(`parses RFC 8216 (8.5) example 'Master Playlist with I-Frames'`, () => {
            let playlist = new Parser().parse(RFC8216_8_5_MASTER_PLAYLIST_WITH_I_FRAMES);
            expect(playlist).to.eql(<MasterPlaylist>{
                ...MASTER_PLAYLIST_DEFAULTS,
                version: 1,
                iframeStreams: [
                    { ...IFRAME_STREAM_DEFAULTS, bandwidth: 86000, uri: 'low/iframe.m3u8' },
                    { ...IFRAME_STREAM_DEFAULTS, bandwidth: 150000, uri: 'mid/iframe.m3u8' },
                    { ...IFRAME_STREAM_DEFAULTS, bandwidth: 550000, uri: 'hi/iframe.m3u8' },
                ],
                streams: [
                    { ...STREAM_DEFAULTS, bandwidth: 1280000, uri: 'low/audio-video.m3u8' },
                    { ...STREAM_DEFAULTS, bandwidth: 2560000, uri: 'mid/audio-video.m3u8' },
                    { ...STREAM_DEFAULTS, bandwidth: 7680000, uri: 'hi/audio-video.m3u8' },
                    { ...STREAM_DEFAULTS, bandwidth: 65000, codecs: ['mp4a.40.5'], uri: 'audio-only.m3u8' }
                ]
            });
        });
        it(`parses RFC 8216 (8.6) example 'Master Playlist with Alternative Audio'`, () => {
            let playlist = new Parser().parse(RFC8216_8_6_MASTER_PLAYLIST_WITH_ALTERNATIVE_AUDIO);
            expect(playlist).to.eql(<MasterPlaylist>{
                ...MASTER_PLAYLIST_DEFAULTS,
                version: 1,
                media: [
                    { associatedLanguage: undefined, channels: undefined, characteristics: undefined, 
                        type: 'AUDIO', groupId: 'aac', name: 'English', default: true, autoselect: true, 
                        language: 'en', uri: 'main/english-audio.m3u8' 
                    },
                    { associatedLanguage: undefined, channels: undefined, characteristics: undefined, 
                        type: 'AUDIO', groupId: 'aac', name: 'Deutsch', default: false, autoselect: true, 
                        language: 'de', uri: 'main/german-audio.m3u8' 
                    },
                    { associatedLanguage: undefined, channels: undefined, characteristics: undefined, 
                        type: 'AUDIO', groupId: 'aac', name: 'Commentary', default: false, autoselect: false, 
                        language: 'en', uri: 'commentary/audio-only.m3u8' 
                    },
                ],
                iframeStreams: [],
                streams: [
                    { ...STREAM_DEFAULTS, bandwidth: 1280000, codecs: ['...'], audioGroup: 'aac', uri: 'low/video-only.m3u8' },
                    { ...STREAM_DEFAULTS, bandwidth: 2560000, codecs: ['...'], audioGroup: 'aac', uri: 'mid/video-only.m3u8' },
                    { ...STREAM_DEFAULTS, bandwidth: 7680000, codecs: ['...'], audioGroup: 'aac', uri: 'hi/video-only.m3u8' },
                    { ...STREAM_DEFAULTS, bandwidth: 65000, audioGroup: 'aac', codecs: ['mp4a.40.5'], uri: 'main/english-audio.m3u8' }
                ]
            });
        });
        it(`parses RFC 8216 (8.7) example 'Master Playlist with Alternative Video'`, () => {
            let playlist = new Parser().parse(RFC8216_8_7_MASTER_PLAYLIST_WITH_ALTERNATIVE_VIDEO);
            expect(playlist).to.eql(<MasterPlaylist>{
                ...MASTER_PLAYLIST_DEFAULTS,
                version: 1,
                media: [
                    { associatedLanguage: undefined, channels: undefined, characteristics: undefined, 
                        type: 'VIDEO', groupId: 'low', name: 'Main', default: true, autoselect: false, 
                        language: undefined, uri: 'low/main/audio-video.m3u8' 
                    },
                    { associatedLanguage: undefined, channels: undefined, characteristics: undefined, 
                        type: 'VIDEO', groupId: 'low', name: 'Centerfield', default: false, autoselect: false, 
                        language: undefined, uri: 'low/centerfield/audio-video.m3u8' 
                    },
                    { associatedLanguage: undefined, channels: undefined, characteristics: undefined, 
                        type: 'VIDEO', groupId: 'low', name: 'Dugout', default: false, autoselect: false, 
                        language: undefined, uri: 'low/dugout/audio-video.m3u8' 
                    },

                    { associatedLanguage: undefined, channels: undefined, characteristics: undefined, 
                        type: 'VIDEO', groupId: 'mid', name: 'Main', default: true, autoselect: false, 
                        language: undefined, uri: 'mid/main/audio-video.m3u8' 
                    },
                    { associatedLanguage: undefined, channels: undefined, characteristics: undefined, 
                        type: 'VIDEO', groupId: 'mid', name: 'Centerfield', default: false, autoselect: false, 
                        language: undefined, uri: 'mid/centerfield/audio-video.m3u8' 
                    },
                    { associatedLanguage: undefined, channels: undefined, characteristics: undefined, 
                        type: 'VIDEO', groupId: 'mid', name: 'Dugout', default: false, autoselect: false, 
                        language: undefined, uri: 'mid/dugout/audio-video.m3u8' 
                    },

                    { associatedLanguage: undefined, channels: undefined, characteristics: undefined, 
                        type: 'VIDEO', groupId: 'hi', name: 'Main', default: true, autoselect: false, 
                        language: undefined, uri: 'hi/main/audio-video.m3u8' 
                    },
                    { associatedLanguage: undefined, channels: undefined, characteristics: undefined, 
                        type: 'VIDEO', groupId: 'hi', name: 'Centerfield', default: false, autoselect: false, 
                        language: undefined, uri: 'hi/centerfield/audio-video.m3u8' 
                    },
                    { associatedLanguage: undefined, channels: undefined, characteristics: undefined, 
                        type: 'VIDEO', groupId: 'hi', name: 'Dugout', default: false, autoselect: false, 
                        language: undefined, uri: 'hi/dugout/audio-video.m3u8' 
                    },
                ],
                iframeStreams: [],
                streams: [
                    { ...STREAM_DEFAULTS, bandwidth: 1280000, codecs: ['...'], videoGroup: 'low', uri: 'low/main/audio-video.m3u8' },
                    { ...STREAM_DEFAULTS, bandwidth: 2560000, codecs: ['...'], videoGroup: 'mid', uri: 'mid/main/audio-video.m3u8' },
                    { ...STREAM_DEFAULTS, bandwidth: 7680000, codecs: ['...'], videoGroup: 'hi', uri: 'hi/main/audio-video.m3u8' }                ]
            });
        });
        it(`parses RFC 8216 (8.8) example 'Session Data in a Master Playlist'`, () => {
            let playlist = new Parser().parse(RFC8216_8_8_SESSION_DATA_IN_A_MASTER_PLAYLIST);
            expect(playlist).to.eql(<MasterPlaylist>{
                ...MASTER_PLAYLIST_DEFAULTS,
                version: 1,
                sessionData: [
                    { id: 'com.example.lyrics', uri: 'lyrics.json', language: undefined, value: undefined },
                    { id: 'com.example.title', language: 'en', value: 'This is an example', uri: undefined },
                    { id: 'com.example.title', language: 'es', value: 'Este es un ejemplo', uri: undefined },
                ],
                streams: [
                    { ...STREAM_DEFAULTS, bandwidth: 7680000, uri: 'hi/main/audio-video.m3u8' },
                ]
            });
        });
        it(`parses RFC 8216 (8.9) example 'CHARACTERISTICS Attribute Containing Multiple Characteristics'`, () => {
            let playlist = new Parser().parse(RFC8216_8_9_CHARACTERISTICS_ATTRIBUTE_CONTAINING_MULTIPLE_CHARACTERISTICS);

            expect(playlist).to.eql(<MasterPlaylist>{
                ...MASTER_PLAYLIST_DEFAULTS,
                media: [
                    { 
                        associatedLanguage: undefined, channels: undefined, language: undefined,
                        type: 'AUDIO', groupId: 'main', name: 'Spoken Dialog', default: true, autoselect: false, 
                        uri: 'spoken-dialog.m3u8', 
                        characteristics: ['public.accessibility.transcribes-spoken-dialog', 'public.easy-to-read']
                    }
                ],
                streams: [
                    { ...STREAM_DEFAULTS, bandwidth: 7680000, uri: 'hi/main/audio-video.m3u8' }
                ]
            })
        });
        it(`parses RFC 8216 (8.10) example 'EXT-X-DATERANGE Carrying SCTE-35 Tags'`, () => {
            let playlist = new Parser().parse(RFC8216_8_10_EXT_X_DATERANGE_CARRYING_SCTE_35_TAGS);
            expect(playlist).to.eql(<MediaPlaylist>{
                ...MEDIA_PLAYLIST_DEFAULTS,
                targetDuration: 10,
                segments: [
                    { ...SEGMENT_DEFAULTS, 
                        duration: 10, 
                        uri: 'segment1.ts',
                        dateRange: {
                            id: 'splice-6FFFFFF0',
                            startDate: '2014-03-05T11:15:00Z',
                            plannedDuration: 59.993,
                            scte35: {
                                out: '0xFC002F0000000000FF000014056FFFFFF000E011622DCAFF000052636200000000000A0008029896F50000008700000000',
                                in: undefined,
                                command: undefined
                            },
                            class: undefined,
                            clientAttributes: {},
                            endDate: undefined,
                            endOnNext: false,
                            duration: undefined
                        }
                    },
                    { ...SEGMENT_DEFAULTS, duration: 10, uri: 'segment2.ts' },
                    { ...SEGMENT_DEFAULTS, duration: 10, uri: 'segment3.ts' },
                    { ...SEGMENT_DEFAULTS, duration: 10, uri: 'segment4.ts' },
                    { ...SEGMENT_DEFAULTS, duration: 10, uri: 'segment5.ts' },
                    { ...SEGMENT_DEFAULTS, duration: 10, uri: 'segment6.ts' },
                    { ...SEGMENT_DEFAULTS, 
                        duration: 10, 
                        uri: 'segment7.ts',
                        dateRange: {
                            id: 'splice-6FFFFFF0',
                            startDate: '2014-03-05T11:16:00Z',
                            duration: 59.993,
                            scte35: {
                                in: '0xFC002A0000000000FF00000F056FFFFFF000401162802E6100000000000A0008029896F50000008700000000',
                                out: undefined,
                                command: undefined
                            },
                            class: undefined,
                            clientAttributes: {},
                            endDate: undefined,
                            endOnNext: false,
                            plannedDuration: undefined
                        }
                    },
                ]
            })
        });
    })
})