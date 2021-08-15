import {
    Manga,
    ChapterDetails,
    MangaStatus,
    MangaTile,
    Tag,
    Chapter,
} from "paperback-extensions-common"
import { NHLanguages } from "./NHentaiHelper";
import { Gallery, ImagePageObject, QueryResponse, TagObject } from "./NHentaiInterfaces";

const typeOfImage = (image: ImagePageObject): string => {
    let map: { [key: string]: string } = { "j": "jpg", "p": "png", "g": "gif" };
    return map[image.t];
}

const getArtist = (gallery: Gallery): string => {
    let tags: TagObject[] = gallery.tags;
    for (const tag of tags) {
        if (tag.type === "artist") {
            return tag.name;
        }
    }
    return "";
}

const getLanguage = (gallery: Gallery): string => {
    let tags: TagObject[] = gallery.tags;
    for (const tag of tags) {
        if (tag.type === "language" && tag.name !== "translated") {
            return tag.name;
        }
    }
    return "";
}

export const parseGallery = (data: Gallery): Manga => {
    let tags: Tag[] = [];
    for (const tag of data.tags) {
        if (tag.type === "tag")
            tags.push(createTag({ id: tag.id.toString(), label: tag.name }));
    }
    let artist = getArtist(data);
    return createManga({
        id: data.id.toString(),
        titles: [data.title.english, data.title.japanese, data.title.pretty],
        artist,
        author: artist,
        image: `https://t.nhentai.net/galleries/${data.media_id}/cover.${typeOfImage(data.images.cover)}`,
        rating: 0,
        status: MangaStatus.COMPLETED,
        follows: data.num_favorites,
        tags: [createTagSection({ id: "tags", label: "Tags", tags: tags })],
        hentai: true,
    })
}

export const parseChapterDetails = (data: Gallery, mangaId: string): ChapterDetails => {
    let counter: number = 0;
    return createChapterDetails({
        id: mangaId,
        mangaId: mangaId,
        longStrip: false,
        pages: data.images.pages.map(image => {
            let type = typeOfImage(image);
            counter++;
            return `https://i.nhentai.net/galleries/${data.media_id}/${counter}.${type}`;
        }),
    })
}

export const parseSearch = (data: QueryResponse): MangaTile[] => {
    const tiles: MangaTile[] = [];
    for (let gallery of data.result) {
        tiles.push(createMangaTile({
            id: gallery.id.toString(),
            image: `https://t.nhentai.net/galleries/${gallery.media_id}/cover.${typeOfImage(gallery.images.cover)}`,
            subtitleText: createIconText({
                text: NHLanguages.getName(getLanguage(gallery))
            }),
            title: createIconText({
                text: gallery.title.pretty
            })
        }))
    }
    return tiles;
}

export const parseGalleryIntoChapter = (data: Gallery, mangaId: string): Chapter => {
    return createChapter({
        id: "",
        mangaId: mangaId,
        chapNum: 1,
        name: data.title.english,
        langCode: NHLanguages.getPBCode(getLanguage(data)),
        time: new Date(data.upload_date * 1000),
    })
}