const { MODEL, sendJson, authorize, parseBody, validate } = require("./_common");

module.exports = async function handler(req, res) {
  if (!authorize(req, res)) return;
  try {
    const body = await parseBody(req);
    const invalid = validate(body);
    if (invalid) return sendJson(res, 400, { error: invalid });
    if (typeof body.image !== "string" || !body.image) {
      return sendJson(res, 400, { error: "Gambar unggahan wajib dipilih." });
    }
    if (body.image.length > 10 * 1024 * 1024) {
      return sendJson(res, 413, { error: "Gambar terlalu besar setelah diproses." });
    }

    const mime = body.mimeType === "image/png" ? "image/png" :
      body.mimeType === "image/webp" ? "image/webp" : "image/jpeg";
    const bytes = Buffer.from(body.image, "base64");
    const form = new FormData();
    form.append("model", MODEL);
    form.append("prompt", body.prompt.trim());
    form.append("size", body.size || "1024x1024");
    form.append("quality", body.quality || "medium");
    form.append("image", new Blob([bytes], { type: mime }), mime === "image/png" ? "input.png" : mime === "image/webp" ? "input.webp" : "input.jpg");

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` },
      body: form
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const err = new Error(data?.error?.message || `OpenAI API edit gagal (${response.status}).`);
      err.status = response.status === 429 ? 429 : 502;
      throw err;
    }
    const image = data?.data?.[0]?.b64_json;
    if (!image) throw new Error("OpenAI tidak mengembalikan gambar hasil edit.");
    return sendJson(res, 200, { image });
  } catch (err) {
    console.error("edit error:", err.message);
    return sendJson(res, err.status || 500, { error: err.message || "Gagal mengedit gambar." });
  }
};
