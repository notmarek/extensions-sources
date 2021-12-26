import { HomeSection, HomeSectionType } from "paperback-extensions-common";

import { STATIC_BUILDER } from "./WEBTOON";

export const HomePage = (
    sectionCallback: (section: HomeSection) => void,
    data: any
): void => {
    const today = createHomeSection({
        type: HomeSectionType.singleRowLarge,
        title: "Updated Today",
        id: "today",
    });
    sectionCallback(today);
    today.items = data.message.result.today.titleList.map((x: any) => {
        return createMangaTile({
            id: String(x.titleNo),
            title: createIconText({
                text: x.title,
            }),
            image: STATIC_BUILDER.addPathComponent(x.thumbnail).buildUrl(),
        });
    });
    sectionCallback(today);
    for (const ranking of data.message.result.ranking) {
        const section = createHomeSection({
            id: ranking.tabCode,
            title: ranking.displayName,
            view_more: false,
            type: HomeSectionType.singleRowLarge,
        });
        sectionCallback(section);
        section.items = ranking.titleList.map((x: any) => {
            return createMangaTile({
                id: String(x.titleNo),
                title: createIconText({
                    text: x.title,
                }),
                image: STATIC_BUILDER.addPathComponent(x.thumbnail).buildUrl(),
            });
        });
        sectionCallback(section);
    }
};
