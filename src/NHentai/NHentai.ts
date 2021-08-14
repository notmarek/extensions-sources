import {
  Source,
  Manga,
  Chapter,
  ChapterDetails,
  HomeSection,
  SearchRequest,
  PagedResults,
  SourceInfo,
  TagType,
  LanguageCode,
  RequestHeaders,
  RequestManager
} from "paperback-extensions-common"
import { parseChapterDetails, parseGallery, parseGalleryIntoChapter, parseSearch } from "./NHentaiParser"


const NHENTAI_URL = "https://nhentai.net"
const API = NHENTAI_URL + "/api"
const method = 'GET'

export const NHentaiInfo: SourceInfo = {
  version: "3.0.0",
  name: "nhentai",
  description: `Extension which pulls 18+ content from nHentai. (Literally all of it. We know why you're here)`,
  author: `NotMarek`,
  authorWebsite: `https://github.com/notmarek`,
  icon: `icon.png`,
  hentaiSource: true,
  sourceTags: [{ text: "18+", type: TagType.YELLOW }],
  websiteBaseURL: NHENTAI_URL,
}

export class NHentai extends Source {
  readonly requestManager: RequestManager = createRequestManager({
    requestsPerSecond: 3,
    requestTimeout: 3000, 
  });
  
  async getMangaDetails(mangaId: string): Promise<Manga> {
    const request = createRequestObject({
      url: `${API}/gallery/${mangaId}`,
      method,
    })
    const data = await this.requestManager.schedule(request, 1)
    let json_data = (typeof data.data == 'string') ? JSON.parse(data.data) : data.data
    return parseGallery(json_data)
  }

  async getChapters(mangaId: string): Promise<Chapter[]> {
    const request = createRequestObject({
      url: `${API}/gallery/${mangaId}`,
      method,
    })
    const data = await this.requestManager.schedule(request, 1)
    let json_data = (typeof data.data == 'string') ? JSON.parse(data.data) : data.data
    return [parseGalleryIntoChapter(json_data, mangaId)];
  }

  async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
    const request = createRequestObject({
      url: `${API}/gallery/${mangaId}`,
      method
    })
    const data = await this.requestManager.schedule(request, 1)
    let json_data = (typeof data.data == 'string') ? JSON.parse(data.data) : data.data
    return parseChapterDetails(json_data, mangaId);

  }

  async searchRequest(query: SearchRequest, metadata: any): Promise<PagedResults> {
    if (query.hStatus === false) {
      return createPagedResults({
        results: [],
        metadata: {
          page: 1
        }
      })
    }
    let page: number = metadata?.page ?? 1;
    let title: string = query.title ?? "";
    if (/^\d+$/.test(title) && title.length <= 6) {
      const request = createRequestObject({
        url: `${API}/gallery/${title}`,
        method
      })
      const data = await this.requestManager.schedule(request, 1)
      let json_data = (typeof data.data == 'string') ? JSON.parse(data.data) : data.data
      return createPagedResults({
        results: parseSearch({ result: [json_data] }),
        metadata: {
          page: page + 1
        }
      })
    } else {
      const request = createRequestObject({
        url: `${API}/galleries/search?query=${encodeURIComponent(title)}&sort=popular&page=${page}`,
        method
      })
      const data = await this.requestManager.schedule(request, 1)
      let json_data = (typeof data.data == 'string') ? JSON.parse(data.data) : data.data
      return createPagedResults({
        results: parseSearch(json_data),
        metadata: {
          page: page + 1
        }
      })
    }

  }

  async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
    const section1 = createHomeSection({ id: 'date', title: 'Recent', view_more: true });
    const section2 = createHomeSection({ id: 'popular-today', title: 'Popular Today', view_more: true });
    const section3 = createHomeSection({ id: 'popular-week', title: 'Popular Week', view_more: true });
    const section4 = createHomeSection({ id: 'popular', title: 'Popular All-time', view_more: true });
    const sections = [section1, section2, section3, section4];

    for (const section of sections) {
      sectionCallback(section);
      let request = createRequestObject({
        url: `${API}/galleries/search?query=${encodeURIComponent("\"\"")}&sort=${section.id}`,
        method
      })
      console.log(encodeURIComponent("\"\""));
      console.log(`${API}/galleries/search?query=${encodeURIComponent("\"\"")}&sort=${section.id}`);
      const data = await this.requestManager.schedule(request, 1);
      let json_data = (typeof data.data == 'string') ? JSON.parse(data.data) : data.data
      section.items = parseSearch(json_data);
      sectionCallback(section);
    }
  }

  async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
    let page: number = metadata?.page ?? 1;
    const request = createRequestObject({
      url: `${API}/galleries/search?query=${encodeURIComponent("\"\"")}&sort=${homepageSectionId}&page=${page}`,
      method
    })
    const data = await this.requestManager.schedule(request, 1)
    let json_data = (typeof data.data == 'string') ? JSON.parse(data.data) : data.data
    page++;
    return createPagedResults({
      results: parseSearch(json_data),
      metadata: {
        page: page
      }
    })
  }
}
