import { LanguageCode } from "paperback-extensions-common"

interface Language {
    name: string,
    NHCode: string,
    PBCode: LanguageCode,
    default?: boolean
}

class NHLanguagesClass {
    Languages: Language[] = [
        // Include all langauages
        {
            name: "Include All",
            NHCode: "",
            PBCode: LanguageCode.UNKNOWN,
            default: true
        },
        {
            // English
            name: 'English',
            NHCode: 'english',
            PBCode: LanguageCode.ENGLISH
        },
        {
            // Japanese
            name: '日本語',
            NHCode: 'japanese',
            PBCode: LanguageCode.JAPANESE
        },
        {
            // Chinese (Simplified)
            name: '中文 (简化字)',
            NHCode: 'chinese',
            PBCode: LanguageCode.CHINEESE
        },


    ]

    constructor() {
        // Sorts the languages based on name
        this.Languages = this.Languages.sort((a, b) => a.name > b.name ? 1 : -1)
    }

    getNHCodeList(): string[] {
        return this.Languages.map(Language => Language.NHCode)
    }

    getName(NHCode: string): string {
        return this.Languages.filter(Language => Language.NHCode == NHCode)[0]?.name ?? 'Unknown'
    }

    getPBCode(NHCode: string): LanguageCode {
        return this.Languages.filter(Language => Language.NHCode == NHCode)[0]?.PBCode ?? LanguageCode.UNKNOWN
    }

    getDefault(): string[] {
        return this.Languages.filter(Language => Language.default).map(Language => Language.NHCode)
    }
}

export const NHLanguages = new NHLanguagesClass()
