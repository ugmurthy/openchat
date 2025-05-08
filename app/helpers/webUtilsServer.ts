import * as cheerio from "cheerio"
import { R, S } from "node_modules/vite/dist/node/types.d-aGj9QkWt";
//import pdf from "pdf-parse-new" // uninstalled


// following import is not working: 
//import pdfParse from "pdf-parse";
// error: ENOENT: no such file or directory, open './test/data/05-versions-space.pdf'
// Since the bug is in the index you can bypass it by importing from /lib directly. Only downside is that you loose types if you're using typescipt.
import pdfParse from 'pdf-parse/lib/pdf-parse'

//solution: https://gitlab.com/autokent/pdf-parse/-/issues/24

import {YoutubeTranscript} from "youtube-transcript"

/**
 * Extracts all headers from an HTTP request
 * 
 * @param {Request} request - The HTTP request object
 * @returns {Object} An object containing all request headers as key-value pairs
 */
export function getHeaders(request: Request|Response) {
    const headers = {};
    request.headers.forEach((value, key) => {
        headers[key] = value;
    });
    return headers;
}

/**
 * Gets the Content-Type header from an HTTP request
 * 
 * @param {Request} request - The HTTP request object
 * @returns {string|null} The content type of the request, or null if not specified
 */
export function getContentType(request:Request) {
    return request.headers.get("content-type");
}

/**
 * Checks if the request contains form data
 * 
 * @param {Request} request - The HTTP request object
 * @returns {boolean} True if the content type is application/x-www-form-urlencoded, false otherwise
 */
export function isFormData(request:Request) {
    return getContentType(request) === "application/x-www-form-urlencoded";
}

/**
 * Checks if the request contains JSON data
 * 
 * @param {Request} request - The HTTP request object
 * @returns {boolean} True if the content type is application/json, false otherwise
 */
export function isJson(request:Request) {
    return getContentType(request) === "application/json";
}

/**
 * Extracts cookies from an HTTP request
 * 
 * @param {Request} request - The HTTP request object
 * @returns {Object} An object containing all cookies as key-value pairs
 */
export function getCookies(request:Request) {
    let cookieHeader = request.headers.get("cookie");
    let cookies = {};
    if (cookieHeader) {
        cookieHeader.split(";").forEach(cookie => {
            let [name, ...rest] = cookie.split("=");
            name = name?.trim();
            if (!name) {
                cookies[name] = decodeURIComponent(rest.join("=").trim());
            }
        });
    }
    return cookies;
}

/**
 * Extracts form data from an HTTP request
 * 
 * @param {Request} request - The HTTP request object
 * @returns {Promise<Object>} A promise resolving to an object containing form data as key-value pairs
 */
export async function getFormData(request:Request) {
    // Retrieve the form data from the incoming request
    const formData = await request.formData();
    const formDataEntries = {};
    for (const [key, value] of formData.entries()) {
        formDataEntries[key] = value;
    }
    return formDataEntries;
}

/**
 * Converts URL search parameters from a request to a JSON object
 * 
 * @param {Request} request - The HTTP request object
 * @returns {Object} An object containing all search parameters as key-value pairs
 */
export function getSearchParamsAsJson(request:Request) {
    // Create a URL object from the request URL
    const url = new URL(request.url);
    
    // Get all search parameters
    const searchParams = url.searchParams;
    
    // Convert search parameters to a JSON object
    const paramsObj = {};
    searchParams.forEach((value, key) => {
        //console.log("key ",key);
        //console.log("value ",value);
        if (paramsObj[key]) {
            // If the key already exists, convert it to an array and add the new value
            if (Array.isArray(paramsObj[key])) {
                paramsObj[key].push(value);
            } else {
                paramsObj[key] = [paramsObj[key], value];
            }
        } else {
            paramsObj[key] = value;
        }
    });
    
    return paramsObj;
}

//// web processors

/**
 * Extracts HTTPS URLs from a string
 * 
 * @param {string} str - The string to extract URLs from
 * @returns {string[]} An array of URLs found in the string
 */
export function extractURLsFromString(str:string) {
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    const urls = [];

    let match;
    while ((match = urlRegex.exec(str)) !== null) {
        urls.push(match[0]);
    }

    return urls;
}

/**
 * Checks if a string is a valid URL
 * 
 * @param {string} str - The string to check
 * @returns {boolean} True if the string is a valid URL, false otherwise
 */
export function isValidURL(str:string) {
    try {
        new URL(str);
        return true;
    } catch (error) {
        return false;     
    }  
}

/**
 * Converts HTML to plain text by removing scripts, styles, and normalizing whitespace
 * 
 * @param {string} html - The HTML content to convert
 * @returns {string} Plain text extracted from the HTML
 */
export function htmlToText(html:string) {
    const $ = cheerio.load(html);
    $('script, style').remove();
    let text = $('body').text();
    // replace multiple ' ' and multiple '\n'  single ' ' and trim 
    text = text.replace(/\s+/g, ' ').replace(/\n/g, '').trim();
    return text;
}

/**
 * Fetches and extracts HTML content from a URL, handling different content types
 * 
 * @param {string} url - The URL to fetch content from
 * @returns {Promise<string|null>} A promise resolving to the HTML content or text from PDF, or null if an error occurs
 */
export async function extractHTMLFromURL(url:string) {
    if (isValidURL(url)) {
        try {
            const response = await fetch(url);
            const contentType = response.headers.get('content-type');
            let html = null;
            const oneOfPDForText = contentType?.includes('text/html') || contentType?.includes('application/pdf')
            if (!contentType && !oneOfPDForText) {
                console.log(`Error: Cannot process non HTML content-type: ${contentType}`)
                return `Error: Expecting content-type text/html but got ${contentType}`;
            } else {
                if (contentType.includes('application/pdf')) {
                    // @TODO convert pdf -> text
                    const pdfData = await response.arrayBuffer();
                    console.log("pdfData buffer size :", pdfData.byteLength);
                    let pdfText = await pdfParse(pdfData);
                    console.log("pdfText info:", pdfText.info);
                    return pdfText.text;
                    //return `Error: Expecting content-type text/html but got ${contentType}`;
                } else {
                    // we assume html / text
                    html = await response.text();
                    return html;
                }
            }
            
        } catch (error) {
            console.error('Error fetching HTML:', error);
            return "Invalid URL or unable to fetch content.";
        }
    }
}

/**
 * Extracts text content from a URL or HTML string, handling different content types including YouTube videos
 * 
 * @param {string} urlOrHtml - The URL or HTML content to extract text from
 * @returns {Promise<string|null>} A promise resolving to the extracted text content, or null if an error occurs
 */
export async function extractTextFromURLOrHTML(urlOrHtml:string) {
    // Check if the input is a URL or HTML content
    const isUrl = urlOrHtml.startsWith('http');
    if (isUrl) {
        // check if it is youtube video
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=)?([a-zA-Z0-9_-]{11})/;
        if (youtubeRegex.test(urlOrHtml)) {
            const transcript = await YoutubeTranscript.fetchTranscript(urlOrHtml);
            const text = transcript.map(entry => entry.text).join(' ');
            return text;
        }
        const html = await extractHTMLFromURL(urlOrHtml);
        if (html) {
            const textContent = htmlToText(html);
            return textContent;
        } else {
            return null;
        }
    } else {
        // Assume it's HTML content
        const textContent = htmlToText(urlOrHtml);
        return textContent;
    }
}

/**
 * Replaces all URLs in a string with their respective text content
 * @param input The input string potentially containing URLs
 * @returns A promise that resolves to the input string with URLs replaced by their content
 */
export async function replaceUrlsWithContent(input: string): Promise<string> {
    // URL regex pattern that matches common URL formats
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // Check if there are any URLs in the input
    const urls = input.match(urlRegex);
    if (!urls) {
      return input; // No URLs found, return the original string
    }
    
    // Create an array of promises to fetch text for each URL
    const fetchPromises = urls.map(async (url) => {
      const content = await extractTextFromURLOrHTML(url);
      return { url, content };
    });
    
    // Wait for all fetches to complete
    const results = await Promise.all(fetchPromises);
    
    // Replace each URL with its content
    let result = input;
    results.forEach(({ url, content }) => {
      result = result.replace(url, content);
    });
    
    return result;
  }
  /**
 * Extracts a filename from a markdown string based on a regex pattern
 * @param markdown The input string potentially containing markdown text
 * @param n length of the filename to be extracted
 * @returns A string representing the filename or null if not found
 */
  export function extractFilename(markdown:string, n:number=30):string | null {
    // Regex to match n consecutive digits, alphabets, or spaces
    const regex = new RegExp(`[a-zA-Z0-9\\s]{${n}}`, 'g');
    const matches = markdown.match(regex);
    // Return first match or null if none found
    return matches ? matches[0] : null;
  }