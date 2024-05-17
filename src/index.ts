export class ResponseAnswer{
    private readonly method: string;
    private readonly status: number;
    private readonly body: any;
    private readonly cookies: undefined | Cookies;

    constructor(method: string, status: number, body: any, cookies = undefined){
        this.method = method;
        this.status = status;
        this.body = body;
        this.cookies = cookies;
    }

    get_status() {
        return this.status;
    }

    get_cookies() {
        return this.cookies;
    }

    get_body() {
        return this.body;
    }

    get_method() {
        return this.method
    }
}

export class Cookies{
    private cookies_list: string[] = []
    append_cookies(cookies: string[]){
        for (let cookie of cookies){
            this.cookies_list.push(cookie)
        }
    }
    append_cookie(cookie: string){
        this.cookies_list.push(cookie)
    }
    append_cookies_by_text(cookies: string){
        for (let cookie of cookies.split(";")){
            this.cookies_list.push(cookie)
        }
    }
    append_cookies_by_class(cookies: Cookies){
        this.append_cookies(cookies.get_cookies())
    }
    get_cookies_by_name(name: string){
        for (let cookie of this.cookies_list){
            if (cookie.split("=")[0] === name){
                return cookie.split("=")[1]
            }
        }
    }
    get_cookies(){
        return this.cookies_list
    }
    get_cookies_by_text(){
        let cookies_str = ""
        for (let cookie of this.cookies_list){
            cookies_str+=cookie+";"
        }
        return cookies_str
    }
}

export class Session {
    cookies: Cookies | undefined = new Cookies();
    async post(url: string, headers = undefined, payload = undefined, query = undefined, cookies= undefined) {
        if (typeof cookies === "string"){
            // @ts-ignore
            this.cookies.append_cookies_by_text(cookies)
        }
        if (typeof cookies === "object"){
            // @ts-ignore
            this.cookies.append_cookies_by_class(cookies)
        }
        const data = transform_user_data(headers, query, cookies)
        // @ts-ignore
        headers = data[0]
        const queryString = data[1]
        const res = await fetch(url + queryString, {
            method: "POST",
            credentials: "include",
            headers: headers,
            body: payload
        })
        if (res.headers.getSetCookie().length !== 0){
            // @ts-ignore
            cookies.append_cookies_by_text()
        }
        this.cookies = cookies
        return new ResponseAnswer("post", res.status, res.body, this.cookies)
    }
    async get(url: string, headers = undefined, payload = undefined, query = undefined, cookies = undefined) {
        if (typeof cookies === "string"){
            // @ts-ignore
            this.cookies.append_cookies_by_text(cookies)
        }
        if (typeof cookies === "object"){
            // @ts-ignore
            this.cookies.append_cookies_by_class(cookies)
        }
        const data = transform_user_data(headers, query, cookies)
        headers = data[0]
        const queryString = data[1]
        const res = await fetch(url + queryString, {
            method: "GET",
            credentials: "include",
            headers: headers
        })
        if (res.headers.getSetCookie().length !== 0){
            // @ts-ignore
            cookies.append_cookies_by_text()
        }
        this.cookies = cookies
        return new ResponseAnswer("get", res.status, res.body, this.cookies)
    }
    get_cookies(){
        return this.cookies;
    }
}

export async function post(url: string, headers = undefined, payload = undefined, query = undefined, cookies = undefined){
    const data = transform_user_data(headers, query, cookies)
    headers = data[0]
    const queryString = data[1]
    const res = await fetch(url + queryString, {
        method: "POST",
        credentials: "include",
        headers: headers,
        body: payload
    })
    if (res.headers.getSetCookie().length !== 0){
        // @ts-ignore
        cookies.append_cookies_by_text()
    }
    return new ResponseAnswer("post", res.status, res.body, cookies)
}

export async function get(url: string, headers = undefined, payload = undefined, query = undefined, cookies = undefined) {
    const data = transform_user_data(headers, query, cookies)
    headers = data[0]
    const queryString = data[1]
    const res = await fetch(url + queryString, {
        method: "GET",
        credentials: "include",
        headers: headers
    })
    if (res.headers.getSetCookie().length !== 0){
        // @ts-ignore
        cookies.append_cookies_by_text()
    }
    return new ResponseAnswer("get", res.status, res.body, cookies)
}

function transform_user_data(headers= undefined, query= undefined, cookies= undefined){
    if (cookies != undefined){
        if (headers == undefined) {
            // @ts-ignore
            headers = {"Cookies": cookies.get_cookies_by_text()}
        }else{
            // @ts-ignore
            headers["Cookies"] = cookies.get_cookies_by_text()
        }
    }
    let queryString = ""
    if (query != undefined) {
        queryString+="?"
        for (const [key, value] of Object.entries(query)) {
            queryString += key + "=" + value
        }
        queryString.slice(0, -1)
    }
    return [headers, query]
}


module.exports = {
    Response: ResponseAnswer,
    Cookies: Cookies,
    Session: Session,
    post: post,
    get: get
}