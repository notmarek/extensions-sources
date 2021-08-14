import {
    Manga,
    ChapterDetails,
    MangaStatus,
    MangaTile,
    Tag
} from "paperback-extensions-common"

export interface nHentaiImage {
    t: string; // type
    w: number; // width
    h: number; // height
}

const typeOfImage = (image: nHentaiImage): string => {
    let map: { [key: string]: string } = { "j": "jpg", "p": "png" };
    return map[image.t];
}

export interface nHentaiImages {
    pages: nHentaiImage[];
    cover: nHentaiImage;
    thumbnail: nHentaiImage;
}

export interface nHentaiTag {
    id: number;
    type: string;
    name: string;
    url: string;
    count: number;
}

export interface GalleryTitle {
    english: string;
    japanese: string;
    pretty: string;
}

export interface Gallery {
    id: number;
    media_id: string;
    title: GalleryTitle;
    images: nHentaiImages;
    scanlator: string;
    upload_date: number;
    tags: nHentaiTag[];
    num_pages: number;
    num_favorites: number;
}

export interface nHentaiSearch {
    result: Gallery[];
}

const getArtist = (gallery: Gallery): string => {
    let tags: nHentaiTag[] = gallery.tags;
    for (const tag of tags) {
        if (tag.type === "artist") {
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

export const parseSearch = (data: nHentaiSearch): MangaTile[] => {
    const tiles: MangaTile[] = [];
    for (let gallery of data.result) {
        tiles.push(createMangaTile({
            id: gallery.id.toString(),
            image: `https://t.nhentai.net/galleries/${gallery.media_id}/cover.${typeOfImage(gallery.images.cover)}`,
            title: createIconText({
                text: gallery.title.english
            })
        }))
    }
    return tiles;
}

