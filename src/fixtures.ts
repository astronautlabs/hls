/** @see https://datatracker.ietf.org/doc/html/rfc8216#section-8.1 */
export const RFC8216_8_1_SIMPLE_MEDIA_PLAYLIST = `#EXTM3U
#EXT-X-TARGETDURATION:10
#EXT-X-VERSION:3
#EXTINF:9.009,
http://media.example.com/first.ts
#EXTINF:9.009,
http://media.example.com/second.ts
#EXTINF:3.003,
http://media.example.com/third.ts
#EXT-X-ENDLIST
`;

/** @see https://datatracker.ietf.org/doc/html/rfc8216#section-8.2 */
export const RFC8216_8_2_LIVE_MEDIA_PLAYLIST_USING_HTTPS = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:8
#EXT-X-MEDIA-SEQUENCE:2680

#EXTINF:7.975,
https://priv.example.com/fileSequence2680.ts
#EXTINF:7.941,
https://priv.example.com/fileSequence2681.ts
#EXTINF:7.975,
https://priv.example.com/fileSequence2682.ts
`;

/** @see https://datatracker.ietf.org/doc/html/rfc8216#section-8.3 */
export const RFC8216_8_3_PLAYLIST_WITH_ENCRYPTED_MEDIA_SEGMENTS = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-MEDIA-SEQUENCE:7794
#EXT-X-TARGETDURATION:15

#EXT-X-KEY:METHOD=AES-128,URI="https://priv.example.com/key.php?r=52"

#EXTINF:2.833,
http://media.example.com/fileSequence52-A.ts
#EXTINF:15.0,
http://media.example.com/fileSequence52-B.ts
#EXTINF:13.333,
http://media.example.com/fileSequence52-C.ts

#EXT-X-KEY:METHOD=AES-128,URI="https://priv.example.com/key.php?r=53"

#EXTINF:15.0,
http://media.example.com/fileSequence53-A.ts
`;

/** @see https://datatracker.ietf.org/doc/html/rfc8216#section-8.4 */
export const RFC8216_8_4_MASTER_PLAYLIST = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=1280000,AVERAGE-BANDWIDTH=1000000
http://example.com/low.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2560000,AVERAGE-BANDWIDTH=2000000
http://example.com/mid.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=7680000,AVERAGE-BANDWIDTH=6000000
http://example.com/hi.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=65000,CODECS="mp4a.40.5"
http://example.com/audio-only.m3u8
`;

/** @see https://datatracker.ietf.org/doc/html/rfc8216#section-8.5 */
export const RFC8216_8_5_MASTER_PLAYLIST_WITH_I_FRAMES = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=1280000
low/audio-video.m3u8
#EXT-X-I-FRAME-STREAM-INF:BANDWIDTH=86000,URI="low/iframe.m3u8"
#EXT-X-STREAM-INF:BANDWIDTH=2560000
mid/audio-video.m3u8
#EXT-X-I-FRAME-STREAM-INF:BANDWIDTH=150000,URI="mid/iframe.m3u8"
#EXT-X-STREAM-INF:BANDWIDTH=7680000
hi/audio-video.m3u8
#EXT-X-I-FRAME-STREAM-INF:BANDWIDTH=550000,URI="hi/iframe.m3u8"
#EXT-X-STREAM-INF:BANDWIDTH=65000,CODECS="mp4a.40.5"
audio-only.m3u8
`;

/** 
 * In this example, the CODECS attributes have been condensed for space.
 * 
 * @see https://datatracker.ietf.org/doc/html/rfc8216#section-8.6 
 */
export const RFC8216_8_6_MASTER_PLAYLIST_WITH_ALTERNATIVE_AUDIO = `#EXTM3U
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac",NAME="English",DEFAULT=YES,AUTOSELECT=YES,LANGUAGE="en",URI="main/english-audio.m3u8"
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac",NAME="Deutsch",DEFAULT=NO,AUTOSELECT=YES,LANGUAGE="de",URI="main/german-audio.m3u8"
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aac",NAME="Commentary",DEFAULT=NO,AUTOSELECT=NO,LANGUAGE="en",URI="commentary/audio-only.m3u8"
#EXT-X-STREAM-INF:BANDWIDTH=1280000,CODECS="...",AUDIO="aac"
low/video-only.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2560000,CODECS="...",AUDIO="aac"
mid/video-only.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=7680000,CODECS="...",AUDIO="aac"
hi/video-only.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=65000,CODECS="mp4a.40.5",AUDIO="aac"
main/english-audio.m3u8
`;

/**
 * This example shows three different video Renditions (Main,
 * Centerfield, and Dugout) and three different Variant Streams (low,
 * mid, and high).  In this example, clients that did not support the
 * EXT-X-MEDIA tag and the VIDEO attribute of the EXT-X-STREAM-INF tag
 * would only be able to play the video Rendition "Main".
 * 
 * Since the EXT-X-STREAM-INF tag has no AUDIO attribute, all video
 * Renditions would be required to contain the audio.
 * 
 * In this example, the CODECS attributes have been condensed for space.
 * 
 * @see https://datatracker.ietf.org/doc/html/rfc8216#section-8.7
 */
export const RFC8216_8_7_MASTER_PLAYLIST_WITH_ALTERNATIVE_VIDEO = `#EXTM3U
#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="low",NAME="Main",DEFAULT=YES,URI="low/main/audio-video.m3u8"
#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="low",NAME="Centerfield",DEFAULT=NO,URI="low/centerfield/audio-video.m3u8"
#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="low",NAME="Dugout",DEFAULT=NO,URI="low/dugout/audio-video.m3u8"

#EXT-X-STREAM-INF:BANDWIDTH=1280000,CODECS="...",VIDEO="low"
low/main/audio-video.m3u8

#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="mid",NAME="Main",DEFAULT=YES,URI="mid/main/audio-video.m3u8"
#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="mid",NAME="Centerfield",DEFAULT=NO,URI="mid/centerfield/audio-video.m3u8"
#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="mid",NAME="Dugout",DEFAULT=NO,URI="mid/dugout/audio-video.m3u8"

#EXT-X-STREAM-INF:BANDWIDTH=2560000,CODECS="...",VIDEO="mid"
mid/main/audio-video.m3u8

#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="hi",NAME="Main",DEFAULT=YES,URI="hi/main/audio-video.m3u8"
#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="hi",NAME="Centerfield",DEFAULT=NO,URI="hi/centerfield/audio-video.m3u8"
#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="hi",NAME="Dugout",DEFAULT=NO,URI="hi/dugout/audio-video.m3u8"

#EXT-X-STREAM-INF:BANDWIDTH=7680000,CODECS="...",VIDEO="hi"
hi/main/audio-video.m3u8
`;

/**
 * Note: augmented from spec to make it a valid playlist
 * @see https://datatracker.ietf.org/doc/html/rfc8216#section-8.8
 */
export const RFC8216_8_8_SESSION_DATA_IN_A_MASTER_PLAYLIST = `#EXTM3U
#EXT-X-SESSION-DATA:DATA-ID="com.example.lyrics",URI="lyrics.json"

#EXT-X-SESSION-DATA:DATA-ID="com.example.title",LANGUAGE="en",VALUE="This is an example"
#EXT-X-SESSION-DATA:DATA-ID="com.example.title",LANGUAGE="es",VALUE="Este es un ejemplo"
#EXT-X-STREAM-INF:BANDWIDTH=7680000
hi/main/audio-video.m3u8
`;
/**
 * Certain characteristics are valid in combination
 * 
 * Note: augmented from spec to make it a valid playlist
 * @see https://datatracker.ietf.org/doc/html/rfc8216#section-8.9
 */
export const RFC8216_8_9_CHARACTERISTICS_ATTRIBUTE_CONTAINING_MULTIPLE_CHARACTERISTICS = `#EXTM3U

#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="main",NAME="Spoken Dialog",DEFAULT=YES,URI="spoken-dialog.m3u8",CHARACTERISTICS="public.accessibility.transcribes-spoken-dialog,public.easy-to-read"
#EXT-X-STREAM-INF:BANDWIDTH=7680000
hi/main/audio-video.m3u8
`;
/**
 * Note: augmented from spec to make it a valid playlist
 * Note: Modified to include START-DATE attribute on the second EXT-X-DATERANGE since START-DATE is required. The 
 *       original example seems to elide this with "..."
 * @see https://datatracker.ietf.org/doc/html/rfc8216#section-8.10
 */
export const RFC8216_8_10_EXT_X_DATERANGE_CARRYING_SCTE_35_TAGS = `#EXTM3U
#EXT-X-TARGETDURATION:10
#EXT-X-DATERANGE:ID="splice-6FFFFFF0",START-DATE="2014-03-05T11:15:00Z",PLANNED-DURATION=59.993,SCTE35-OUT=0xFC002F0000000000FF000014056FFFFFF000E011622DCAFF000052636200000000000A0008029896F50000008700000000
#EXTINF:10
segment1.ts
#EXTINF:10
segment2.ts
#EXTINF:10
segment3.ts
#EXTINF:10
segment4.ts
#EXTINF:10
segment5.ts
#EXTINF:10
segment6.ts
#EXT-X-DATERANGE:ID="splice-6FFFFFF0",START-DATE="2014-03-05T11:16:00Z",DURATION=59.993,SCTE35-IN=0xFC002A0000000000FF00000F056FFFFFF000401162802E6100000000000A0008029896F50000008700000000
#EXTINF:10
segment7.ts
`;