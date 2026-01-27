import { UrlConfig } from "./types";
import { HttpStatus } from "./http";

export const URLS: UrlConfig[] = [
  {
    name: "Google",
    url: "https://google.com",
    expectedStatus: HttpStatus.Ok,
  },
];
