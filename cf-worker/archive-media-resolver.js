export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // URL like /media/videos/abc.mp4 → key = 'videos/abc.mp4'
    const match = url.pathname.match(/^\/media\/(.+)$/);
    if (!match) return new Response('Not found', { status: 404 });
    const key = match[1];

    const object = await env.R2.get(key);
    if (!object) return new Response('Not found', { status: 404 });

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('cache-control', 'private, max-age=3600');
    return new Response(object.body, { headers });
  },
};
