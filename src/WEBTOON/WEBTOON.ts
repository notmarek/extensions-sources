import {
    PagedResults,
    Source,
    Manga,
    Chapter,
    ChapterDetails,
    HomeSection,
    SearchRequest,
    SourceInfo,
    LanguageCode,
    TagType,
    MangaStatus,
    MangaTile,
    Tag,
    RequestHeaders,
    ContentRating,
    TagSection,
    Section,
    HomeSectionType,
    MangaUpdates,
} from "paperback-extensions-common";
import { HomePage } from "./WEBTOONAPI";
import { get } from "./WEBTOONUtil";
import { ImageInterceptor } from "./interceptors/ImageInterceptor";
export const API_DOMAIN = "https://global.apis.naver.com";
export const API_HMAC_KEY =
    "gUtPzJFZch4ZyAGviiyH94P99lQ3pFdRTwpJWDlSGFfwgpr6ses5ALOxWHOIT7R1";

export const WEBTOONInfo: SourceInfo = {
    author: "NotMarek",
    description: "Extension that pulls webtoons from WEBTOON",
    icon: "icon.png",
    name: "WEBTOON",
    version: "1.0.0",
    authorWebsite: "https://notmarek.com",
    websiteBaseURL: "https://webtoons.com",
    contentRating: ContentRating.EVERYONE,
    language: LanguageCode.ENGLISH,
    sourceTags: [],
};

export class WEBTOON extends Source {
    readonly requestManager = createRequestManager({
        requestsPerSecond: 3,
        requestTimeout: 10000,
        interceptor: new ImageInterceptor(),
    });

    async getMangaDetails(mangaId: string): Promise<Manga> {
        let req = get(
            API_DOMAIN +
                "/lineWebtoon/webtoon/titleInfo.json?language=en&locale=en&platform=APP_IPHONE&serviceZone=GLOBAL&titleNo=" +
                mangaId
        );
        const data = await this.requestManager.schedule(req, 1);
        let parsedData =
            typeof data.data == "string" ? JSON.parse(data.data) : data.data;
        parsedData = parsedData.message.result.titleInfo;
        return createManga({
            id: mangaId,
            titles: [parsedData.title],
            image: "https://webtoon-phinf.pstatic.net" + parsedData.thumbnail,
            rating: parsedData.starScoreAverage,
            status: MangaStatus.ONGOING,
            langFlag: "en",
            artist: parsedData.pictureAuthorName,
            author: parsedData.writingAuthorName,
            desc: parsedData.synopsis,
            follows: parsedData.favoriteCount,
            tags: [
                createTagSection({
                    id: "Genre",
                    label: "Genre",
                    tags: [
                        createTag({
                            id: parsedData.representGenre,
                            label: parsedData.representGenre.replaceAll("_", " "),
                        }),
                    ],
                }),
            ],
            views: parsedData.readCount,
            lastUpdate: new Date(parsedData.lastEpisodeRegisterYmdt),
        });
    }

    async getSearchResults(
        searchRequest: SearchRequest
    ): Promise<PagedResults> {
        return createPagedResults({} as PagedResults);
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        let req = get(`${API_DOMAIN}/lineWebtoon/webtoon/episodeList.json?language=en&locale=en&pageSize=4000&platform=APP_IPHONE&serviceZone=GLOBAL&startIndex=0&titleNo=${mangaId}&v=3`)
        const data = await this.requestManager.schedule(req, 1);
        let d = typeof data.data == "string" ? JSON.parse(data.data) : data.data;
        d = d.message.result.episodeList.episode;
        return d.map((e: any) => {
            return createChapter({
                id: String(e.episodeSeq),
                mangaId: mangaId,
                chapNum: e.episodeNo,
                langCode: LanguageCode.ENGLISH,
                name: e.episodeTitle,
                time: new Date(e.registerYmdt),
            });
        });

    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        let req = get(`${API_DOMAIN}/lineWebtoon/webtoon/episodeInfo.json?episodeNo=${chapterId}&language=en&locale=en&platform=APP_IPHONE&serviceZone=GLOBAL&titleNo=${mangaId}&v=4`)

        const data = await this.requestManager.schedule(req, 1);
        let d = typeof data.data == "string" ? JSON.parse(data.data) : data.data;
        d = d.message.result.episodeInfo.imageInfo;
        return createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: d.map((e: any) => {
                return "https://webtoon-phinf.pstatic.net" + e.url;
            }),
            longStrip: true,
        })
    }

    override async getHomePageSections(
        sectionCallback: (section: HomeSection) => void
    ): Promise<void> {
        const req = get(
            `${API_DOMAIN}/lineWebtoon/webtoon/home_v2.json?language=en&locale=en&platform=APP_IPHONE&serviceZone=GLOBAL&weekday=${new Date()
                .toLocaleString("default", { weekday: "long" })
                .toUpperCase()}`
        );
        const data = await this.requestManager.schedule(req, 1);
        HomePage(
            sectionCallback,
            typeof data.data == "string" ? JSON.parse(data.data) : data.data
        );
    }

    override async getViewMoreItems(
        homepageSectionId: string,
        metadata: any
    ): Promise<PagedResults> {
        // let page: number = metadata?.page ?? 1;
        // const request = createRequestObject({
        //   url: `${API}/galleries/search?query=${encodeURIComponent(await language(this.stateManager) + await extraArgs(this.stateManager))}&sort=${homepageSectionId}&page=${page}`,
        //   method
        // })
        // const data = await this.requestManager.schedule(request, 1)
        // let json_data = (typeof data.data == 'string') ? JSON.parse(data.data) : data.data
        // page++;
        return createPagedResults({} as PagedResults);
    }
}
