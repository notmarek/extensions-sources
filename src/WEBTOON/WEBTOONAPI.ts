import {
    HomeSection,
    HomeSectionType,
    MangaTile,
} from "paperback-extensions-common";

export const HomePage = (
    sectionCallback: (section: HomeSection) => void,
    data: any
): void => {
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
                image: "https://webtoon-phinf.pstatic.net" + x.thumbnail,
            });
        });
        sectionCallback(section);
    }
};
