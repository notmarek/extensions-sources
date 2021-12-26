import { API_HMAC_KEY } from "./WEBTOON";
import { createHmac } from "crypto";
import { Request } from "paperback-extensions-common";

const digestMessage = (msg: string): string => {
    return createHmac("sha1", API_HMAC_KEY).update(msg).digest("base64");
};

const getMesage = (url: string, time: string): string => {
    return url.substring(0, 255) + time;
};

const getFullUrl = (url: string): string => {
    let t: Number = new Date().getTime();
    let md: string = digestMessage(getMesage(url, String(t)));
    let delim: string = "?";
    if (url.indexOf("?") > -1) {
        delim = "&";
    }
    return url + delim + "msgpad=" + String(t) + "&" + "md=" + encodeURIComponent(md);
};

export const get = (url: string): Request => {
    return createRequestObject({
        url: getFullUrl(url),
        method: "GET",
        headers: {
            "User-Agent": "linewebtoon/2.7.11 (iPhone; iOS 15.2; Scale/3.00)",
            Referer: "https://m.webtoons.com/",
        },
    });
};

export class URLBuilder {
    parameters: Record<string, any | any[]> = {}
    pathComponents: string[] = []
    baseUrl: string
    constructor(baseUrl: string) {
        this.baseUrl = baseUrl.replace(/(^\/)?(?=.*)(\/$)?/gim, '')
    }

    addPathComponent(component: string): URLBuilder {
        this.pathComponents.push(component.replace(/(^\/)?(?=.*)(\/$)?/gim, ''))
        return this
    }

    addQueryParameter(key: string, value: any | any[]): URLBuilder {
        this.parameters[key] = value
        return this
    }

    buildUrl({addTrailingSlash, includeUndefinedParameters} = {addTrailingSlash: false, includeUndefinedParameters: false}): string {
        let finalUrl = this.baseUrl + '/'

        finalUrl += this.pathComponents.join('/')
        finalUrl += addTrailingSlash ? '/' : ''
        finalUrl += Object.values(this.parameters).length > 0 ? '?' : ''
        finalUrl += Object.entries(this.parameters).map(entry => {
            if (!entry[1] && !includeUndefinedParameters) { return undefined }

            if (Array.isArray(entry[1])) {
                return entry[1].map(value => value || includeUndefinedParameters ? `${entry[0]}[]=${value}` : undefined)
                    .filter(x => x !== undefined)
                    .join('&')
            }

            if (typeof entry[1] === 'object') {
                return Object.keys(entry[1]).map(key => entry[1][key] || includeUndefinedParameters ? `${entry[0]}[${key}]=${entry[1][key]}` : undefined)
                    .filter(x => x !== undefined)
                    .join('&')
            }

            return `${entry[0]}=${entry[1]}`
        }).filter(x => x !== undefined).join('&')

        return finalUrl
    }
}
