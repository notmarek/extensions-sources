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
