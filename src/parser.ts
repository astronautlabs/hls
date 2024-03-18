import { ByteRange } from './byte-range';
import { DateRange } from './date-range';
import { AES128EncryptionKey, EncryptionKey, NoEncryptionKey } from './encryption-key';
import { AlternativeMedia, ClosedCaptions, Media, MediaCommon, Subtitles } from './media';
import { MediaInitialization } from './media-initialization';
import { MediaSegment } from './media-segment';
import { MasterPlaylist, MediaPlaylist, Playlist, PlaylistCommon } from './playlist';
import { SCTE35 } from './scte35';
import { Start } from './start';
import { as } from './utils';
import { VariantStream } from './variant-stream';

export interface Tag {
    name: string;
    value: string;
}

export interface Element {
    tags: Tag[];
    uri: string;
}

export class Parser {
    parseTag(tag: string): Tag {
        tag = tag.replace(/^#/, '');

        let colon = tag.indexOf(':');
        if (colon >= 0) {
            return {
                name: tag.slice(0, colon),
                value: tag.slice(colon + 1)
            };
        } else {
            return {
                name: tag,
                value: ''
            };
        }
    }

    parseMultipleGlobalTags(lines: string[], name: string): Tag[] {
        let tags = lines.filter(x => x.startsWith(`#${name}:`));
        return tags.map(tag => this.parseTag(tag));
    }

    parseExactlyZeroOrOneGlobalTag(lines: string[], name: string): Tag | undefined {
        let tags = lines.filter(x => x.startsWith(`#${name}:`));
        if (tags.length > 1)
            throw new Error(`Invalid playlist: Multiple ${name} present`);

        return tags[0] ? this.parseTag(tags[0]) : undefined;
    }

    parseExactlyOneGlobalTag(lines: string[], name: string): Tag {
        let tags = lines.filter(x => x.startsWith(`#${name}:`));
        if (tags.length === 0)
            throw new Error(`Invalid playlist: Missing ${name}`);
        if (tags.length > 1)
            throw new Error(`Invalid playlist: Multiple ${name} present`);

        return this.parseTag(tags[0]);
    }

    parseOptionalGlobalTag(lines: string[], name: string): Tag | undefined {
        let tags = lines.filter(x => x.startsWith(`#${name}:`));
        return tags[0] ? this.parseTag(tags[0]) : undefined;
    }

    optionalGlobalTagPresent(lines: string[], name: string): boolean {
        return this.parseOptionalGlobalTag(lines, name)?.value === '';
    }

    parseAttributeList(content: string): Record<string, string> {
        let record: Record<string, string> = {};
        for (let i = 0, max = content.length; i < max; ++i) {
            let equalsChar = content.indexOf('=', i);

            if (equalsChar < 0)
                throw new Error(`Attribute is missing equals sign`);
            let tag = content.slice(i, equalsChar);

            i += tag.length + 1;

            if (content[i] === '"') {
                let closingQuote = content.indexOf('"', i + 1);
                let value = content.slice(i + 1, closingQuote);

                if (closingQuote === -1) {
                    throw new Error(`Unterminated quote`);
                }

                i = closingQuote;
                record[tag] = value;
            } else {
                let endOfValue = content.indexOf(',');
                if (endOfValue < 0)
                    endOfValue = content.length;

                i = endOfValue;
                let value = content.slice(i, endOfValue);
                record[tag] = value;
            }
        }

        return record;
    }

    private parseElements(lines: string[], globalTags: string[]): Element[] {
        let elements: Element[] = [];
        let element: Element = { tags: [], uri: <any>undefined };

        for (let line of lines) {
            if (line.startsWith('#EXT')) {
                let tag = this.parseTag(line);
                if (globalTags.includes(tag.name))
                    continue;

                element.tags.push(tag);
            } else if (line.startsWith('#')) {
                continue;
            } else {
                element.uri = line;
                elements.push(element);
                element = { tags: [], uri: <any>undefined };
            }
        }

        return elements;
    }

    private parsePlaylistCommon(lines: string[]): PlaylistCommon {
        // A Playlist file MUST NOT contain more than one EXT-X-VERSION tag.  If
        // a client encounters a Playlist with multiple EXT-X-VERSION tags, it
        // MUST fail to parse it.
        // (https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.1.2)
        const version = Number(this.parseExactlyZeroOrOneGlobalTag(lines, 'EXT-X-VERSION')?.value ?? '1');
        const independentSegments = this.optionalGlobalTagPresent(lines, 'EXT-X-INDEPENDENT-SEGMENTS');
        let start: Start | undefined = undefined;
        let startTag = this.parseOptionalGlobalTag(lines, 'EXT-X-START');
        if (startTag) {
            let attributes = this.parseAttributeList(startTag.value);
            if (!attributes['TIME-OFFSET'])
                throw new Error(`EXT-X-START requires TIME-OFFSET`);

            start = {
                timeOffset: Number(attributes['TIME-OFFSET']),
                precise: (attributes['PRECISE'] ?? 'NO') === 'YES'
            };
        }

        return as<PlaylistCommon>({
            version,
            independentSegments,
            start
        });
    }

    readonly COMMON_PLAYLIST_GLOBAL_TAGS = [
        'EXTM3U', 'EXT-X-VERSION', 'EXT-X-INDEPENDENT-SEGMENTS', 'EXT-X-START'
    ];
    readonly MASTER_PLAYLIST_GLOBAL_TAGS = ['EXT-X-MEDIA'];
    readonly MEDIA_PLAYLIST_GLOBAL_TAGS = [
        'EXT-X-TARGETDURATION', 'EXT-X-MEDIA-SEQUENCE', 'EXT-X-DISCONTINUITY-SEQUENCE', 'EXT-X-ENDLIST',
        'EXT-X-I-FRAMES-ONLY', 'EXT-X-PLAYLIST-TYPE'
    ];

    private parseOptionalNumber(numberString: string | undefined): number | undefined {
        return numberString === undefined ? undefined : Number(numberString);
    }

    private requireOneElementTag(element: Element, tagName: string, elementType: string): Tag {
        let tags = element.tags.filter(x => x.name === tagName);

        if (tags.length > 1)
            throw new Error(`${elementType} '${element.uri}' has multiple ${tagName}`);
        if (tags.length === 0)
            throw new Error(`${elementType} '${element.uri}' is missing ${tagName}`);

        return tags[0];
    }

    private requireElementTagAttribute(element: Element, tag: Tag, attrs: Record<string, string>, attributeName: string, elementType: string): string {
        if (attrs[attributeName] === undefined)
            throw new Error(`${elementType} '${element.uri}' does not specify ${attributeName} in ${tag.name}`);

        return attrs[attributeName];
    }

    private requireTagAttribute(tag: Tag, attrs: Record<string, string>, attributeName: string): string {
        if (attrs[attributeName] === undefined)
            throw new Error(`${tag.name} requires ${attributeName}`);

        return attrs[attributeName];
    }

    parse(content: string): Playlist {
        const lines = content.split(/\r?\n/).map(x => x.trim()).filter(x => x !== '');
        const playlistCommon = this.parsePlaylistCommon(lines);

        if (lines.some(line => line.startsWith('#EXT-X-STREAM-INF'))) {
            // This is a master playlist. 

            let media: Media[] = [];
            for (let mediaTag of this.parseMultipleGlobalTags(lines, 'EXT-X-MEDIA')) {
                let attrs = this.parseAttributeList(mediaTag.value);

                let type = <any>this.requireTagAttribute(mediaTag, attrs, 'TYPE');
                let groupId = this.requireTagAttribute(mediaTag, attrs, 'GROUP-ID');
                let name = this.requireTagAttribute(mediaTag, attrs, 'NAME');
                let language = attrs['LANGUAGE'];
                let associatedLanguage = attrs['ASSOC-LANGUAGE'];
                let isDefault = attrs['DEFAULT'] === 'YES';
                let autoselect = attrs['AUTOSELECT'] === 'YES';
                let forced = attrs['FORCED'] === 'YES';
                let characteristics = attrs['CHARACTERISTICS'] ? attrs['CHARACTERISTICS'].split(',') : undefined;
                let channels = attrs['CHANNELS'] ? attrs['CHANNELS'].split('/') : undefined;

                let mediaCommon = as<MediaCommon>({
                    name,
                    groupId,
                    language,
                    associatedLanguage,
                    default: isDefault,
                    autoselect,
                    characteristics,
                    channels
                });

                if (type === 'CLOSED-CAPTIONS') {
                    if (!attrs['INSTREAM-ID'])
                        throw new Error(`EXT-X-MEDIA of type CLOSED-CAPTIONS rquires INSTREAM-ID`);

                    if (attrs['URI'])
                        throw new Error(`EXT-X-MEDIA of type CLOSED-CAPTIONS cannot have URI`);

                    media.push(as<ClosedCaptions>({
                        type: 'CLOSED-CAPTIONS',
                        inStreamId: <any>attrs['INSTREAM-ID'],
                        ...mediaCommon
                    }));
                } else if (type === 'SUBTITLES') {

                    media.push(as<Subtitles>({
                        type: 'SUBTITLES',
                        uri: attrs['URI'],
                        forced,
                        ...mediaCommon
                    }));
                } else {
                    media.push(as<AlternativeMedia>({
                        type,
                        uri: attrs['URI'],
                        ...mediaCommon
                    }));
                }
            }

            let elements = this.parseElements(lines, [...this.COMMON_PLAYLIST_GLOBAL_TAGS, ...this.MASTER_PLAYLIST_GLOBAL_TAGS]);
            let streams: VariantStream[] = [];

            for (let element of elements) {
                let streamInf = this.requireOneElementTag(element, 'EXT-X-STREAM-INF', 'Variant stream');
                let streamInfAttrs = this.parseAttributeList(streamInf.value);

                if (streamInfAttrs['BANDWIDTH'] === undefined)
                    throw new Error(`Variant stream '${element.uri}' does not specify BANDWIDTH in EXT-X-STREAM-INF`);

                streams.push({
                    bandwidth: Number(this.requireElementTagAttribute(element, streamInf, streamInfAttrs, 'BANDWIDTH', 'Variant stream')),
                    averageBandwidth: this.parseOptionalNumber(streamInfAttrs['AVERAGE-BANDWIDTH']),
                    codecs: streamInfAttrs['CODECS'] ? streamInfAttrs['CODECS'].split(',') : undefined,
                    resolution: streamInfAttrs['RESOLUTION'],
                    frameRate: this.parseOptionalNumber(streamInfAttrs['FRAME-RATE']),
                    hdcpLevel: <'NONE' | 'TYPE-0' | undefined>streamInfAttrs['HDCP-LEVEL'],
                    audioGroup: streamInfAttrs['AUDIO'],
                    videoGroup: streamInfAttrs['VIDEO'],
                    subtitlesGroup: streamInfAttrs['SUBTITLES'],
                    closedCaptionsGroup: streamInfAttrs['CLOSED-CAPTIONS'],
                    uri: element.uri
                });
            }

            return as<MasterPlaylist>({
                kind: 'master',
                ...playlistCommon,
                media,
                streams
            });
        } else {
            // This is a media playlist.

            let targetDuration = Number(this.parseExactlyOneGlobalTag(lines, 'EXT-X-TARGETDURATION'));
            let mediaSequence = Number(this.parseOptionalGlobalTag(lines, 'EXT-X-MEDIA-SEQUENCE')?.value ?? '0');
            let discontinuitySequence = Number(this.parseOptionalGlobalTag(lines, 'EXT-X-DISCONTINUITY-SEQUENCE')?.value ?? '0')
            let ended = this.optionalGlobalTagPresent(lines, 'EXT-X-ENDLIST');
            let iframesOnly = this.optionalGlobalTagPresent(lines, 'EXT-X-I-FRAMES-ONLY');
            let type = <'EVENT' | 'VOD' | undefined>this.parseOptionalGlobalTag(lines, 'EXT-X-PLAYLIST-TYPE')?.value;
            let elements = this.parseElements(lines, [...this.COMMON_PLAYLIST_GLOBAL_TAGS, ...this.MEDIA_PLAYLIST_GLOBAL_TAGS]);
            let segments: MediaSegment[] = [];

            for (let element of elements) {
                let extinf = this.requireOneElementTag(element, 'EXTINF', 'Media segment');
                let duration: number;
                let title: string | undefined;

                if (extinf.value.includes(',')) {
                    let comma = extinf.value.indexOf(',');
                    duration = Number(extinf.value.slice(0, comma));
                    title = extinf.value.slice(comma + 1);
                } else {
                    duration = Number(extinf.value);
                }

                let byteRangeTag = element.tags.find(x => x.name === 'EXT-X-BYTERANGE');
                let byteRange: ByteRange | undefined;

                if (byteRangeTag) {
                    let length: number;
                    let offset: number | undefined;
                    if (byteRangeTag.value.includes('@')) {
                        let sep = extinf.value.indexOf('@');
                        length = Number(byteRangeTag.value.slice(0, sep));
                        offset = Number(byteRangeTag.value.slice(sep + 1));
                    } else {
                        length = Number(byteRangeTag.value);
                    }

                    if (offset === undefined) {
                        if (!segments.some(x => x.uri === element.uri && !!x.byteRange)) {
                            throw new Error(`First media sub-range segment of ${element.uri} requires byte offset to be specified`);
                        }
                    }

                    byteRange = { length, offset };
                }

                let dateRangeTag = element.tags.find(x => x.name === 'EXT-X-DATERANGE');
                let dateRange: DateRange | undefined;

                if (dateRangeTag) {
                    let attrs = this.parseAttributeList(dateRangeTag.value);
                    dateRange = {
                        id: this.requireElementTagAttribute(element, dateRangeTag, attrs, 'ID', 'Media segment'),
                        class: attrs['CLASS'],
                        startDate: this.requireElementTagAttribute(element, dateRangeTag, attrs, 'START-DATE', 'Media segment'),
                        endDate: attrs['END-DATE'],
                        duration: this.parseOptionalNumber(attrs['DURATION']),
                        scte35: {
                            command: attrs['SCTE35-CMD'],
                            in: attrs['SCTE35-IN'],
                            out: attrs['SCTE35-OUT'],
                        },
                        endOnNext: attrs['END-ON-NEXT'] === 'YES',
                        plannedDuration: this.parseOptionalNumber(attrs['PLANNED-DURATION']),
                        clientAttributes: Object.fromEntries(Object.entries(attrs).filter(([k, v]) => k.startsWith('X-')))
                    }
                }

                let encryptionTag = element.tags.find(x => x.name === 'EXT-X-KEY');
                let encryption: EncryptionKey | undefined;
                if (encryptionTag) {
                    let attrs = this.parseAttributeList(encryptionTag.value);
                    let method = this.requireElementTagAttribute(element, encryptionTag, attrs, 'METHOD', 'Media segment');

                    if (method === 'NONE') {
                        encryption = as<NoEncryptionKey>({ method: 'NONE' });
                    } else if (method === 'AES-128' || method === 'SAMPLE-AES') {
                        encryption = as<AES128EncryptionKey>({
                            method,
                            uri: this.requireElementTagAttribute(element, encryptionTag, attrs, 'URI', 'Media segment'),
                            iv: attrs['IV'],
                            keyFormat: <any>attrs['KEYFORMAT'],
                            keyFormatVersions: attrs['KEYFORMATVERSIONS'] ? attrs['KEYFORMATVERSIONS'].split('/').map(x => Number(x)) : undefined
                        });
                    }
                }

                let mediaInitializationTag = element.tags.find(x => x.name == 'EXT-X-MAP');
                let mediaInitialization: MediaInitialization | undefined;
                if (mediaInitializationTag) {
                    let attrs = this.parseAttributeList(mediaInitializationTag.value);
                    let byteRange: ByteRange | undefined;

                    if (attrs['BYTERANGE']) {
                        let value = attrs['BYTERANGE'];
                        let length: number;
                        let offset: number | undefined;
                        if (value.includes('@')) {
                            let sep = extinf.value.indexOf('@');
                            length = Number(value.slice(0, sep));
                            offset = Number(value.slice(sep + 1));
                        } else {
                            length = Number(value);
                        }
                        byteRange = { length, offset };
                    }

                    mediaInitialization = as<MediaInitialization>({
                        uri: this.requireElementTagAttribute(element, mediaInitializationTag, attrs, 'URI', 'Media segment'),
                        byteRange
                    });
                }

                segments.push({
                    duration,
                    title,
                    byteRange,
                    dateRange,
                    discontinuity: !!element.tags.find(x => x.name === 'EXT-X-DISCONTINUITY'),
                    encryption,
                    mediaInitialization,
                    programDateTime: element.tags.find(x => x.name === 'EXT-X-PROGRAM-DATE-TIME')?.value,
                    uri: element.uri
                });

            }

            return as<MediaPlaylist>({
                kind: 'media',
                ...playlistCommon,
                discontinuitySequence,
                mediaSequence,
                ended,
                segments,
                iframesOnly,
                type,
                targetDuration
            });
        }
    }
}
