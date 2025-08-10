import { http, HttpResponse } from "msw";
const API = "https://jsonplaceholder.typicode.com";

export const handlers = [
    // create post
    http.post(`${API}/posts`, async ({ request }) => {
        const raw = (await request.json()) as unknown;
        const body = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
        const responseBody = { id: Date.now(), ...body };
        return HttpResponse.json(responseBody, { status: 201 });
    }),

    // update post (PUT)
    http.put(`${API}/posts/:id`, async ({ request, params }) => {
        const raw = (await request.json()) as unknown;
        const body = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
        return HttpResponse.json(
            { id: Number(params.id), ...body },
            { status: 200 }
        );
    }),

    // patch post (в т.ч. priority)
    http.patch(`${API}/posts/:id`, async ({ request, params }) => {
        const raw = (await request.json()) as unknown;
        const body = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
        return HttpResponse.json(
            { id: Number(params.id), ...body },
            { status: 200 }
        );
    }),

    // create comment
    http.post(`${API}/comments`, async ({ request }) => {
        const raw = (await request.json()) as unknown;
        const body = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
        // вернём id, будто сервер сохранил
        return HttpResponse.json({ id: Date.now(), ...body }, { status: 201 });
    }),

    // delete post
    http.delete(`${API}/posts/:id`, () => HttpResponse.json({}, { status: 200 })),

    // ✅ update user (для админки)
    http.put(`${API}/users/:id`, async ({ request, params }) => {
        const raw = (await request.json()) as unknown;
        const body = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
        return HttpResponse.json({ id: Number(params.id), ...body }, { status: 200 });
    }),
];
