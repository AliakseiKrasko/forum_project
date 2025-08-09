import { http, HttpResponse } from "msw";
const API = "https://jsonplaceholder.typicode.com";

export const handlers = [
    http.post(`${API}/posts`, async ({ request }) => {
        const body = await request.json();

        const responseBody = { id: Date.now(), ...(body && typeof body === 'object' ? body : {}) };

        return HttpResponse.json(responseBody, { status: 201 });
    }),

    http.delete(`${API}/posts/:id`, () => HttpResponse.json({}, { status: 200 })),
];