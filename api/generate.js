const { MODEL, sendJson, authorize, parseBody, validate, openAIJson } = require("./_common");

module.exports = async function handler(req, res) {
  if (!authorize(req, res)) return;
  try {
    const body = await parseBody(req);
    const invalid = validate(body);
    if (invalid) return sendJson(res, 400, { error: invalid });

    const image = await openAIJson({
      model: MODEL,
      prompt: body.prompt.trim(),
      size: body.size || "1024x1024",
      quality: body.quality || "medium",
      n: 1
    });
    return sendJson(res, 200, { image });
  } catch (err) {
    console.error("generate error:", err.message);
    return sendJson(res, err.status || 500, {
      error: err.message || "Gagal membuat gambar. Coba lagi."
    });
  }
};
