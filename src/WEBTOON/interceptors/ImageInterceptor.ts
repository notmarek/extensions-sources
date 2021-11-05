import {
    Request,
    RequestInterceptor,
    Response,
} from "paperback-extensions-common";

export class ImageInterceptor implements RequestInterceptor {
    async interceptRequest(request: Request): Promise<Request> {
        request.headers = {
            ...request.headers,
            Referer: "https://m.webtoons.com/",
        };
        return request;
    }

    async interceptResponse(response: Response): Promise<Response> {
        return response;
    }
}
