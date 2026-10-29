const MODEL = "gpt-image-2.5-sunburst";

function sendJson(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.end(JSON.stringify(body));
}

function authorize(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendJson(res, 405, { error: "Metode tidak diizinkan." });
    return false;
  }
  if (!process.env.OPENAI_API_KEY) {
    sendJson(res, 500, { error: "OPENAI_API_KEY belum diatur pada environment backend." });
    return false;
  }
  const expected = process.env.APP_ACCESS_CODE;
  if (expected && req.headers["x-app-code"] !== expected) {
    sendJson(res, 401, { error: "Kode akses salah." });
    return false;
  }
  if (!expected) {
    sendJson(res, 500, { error: "APP_ACCESS_CODE belum diatur. Atur kode akses di environment backend." });
    return false;
  }
  return true;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => {
      data += chunk;
      if (data.length > 12 * 1024 * 1024) {
        reject(new Error("Data terlalu besar. Gunakan gambar yang lebih kecil."));
        req.destroy();
      }
    });
    req.on("end", () => {
      try { resolve(JSON.parse(data || "{}")); }
      catch { reject(new Error("Format permintaan tidak valid.")); }
    });
    req.on("error", reject);
  });
}

function validate(body) {
  if (!body || typeof body.prompt !== "string" || !body.prompt.trim()) return "Prompt wajib diisi.";
  if (body.prompt.length > 8000) return "Prompt maksimal 8000 karakter.";
  const sizes = new Set(["auto", "1024x1024", "1536x1024", "1024x1536"]);
  const qualities = new Set(["low", "medium", "high", "xhigh", "max"]);
  if (body.size && !sizes.has(body.size)) return "Ukuran gambar tidak valid.";
  if (body.quality && !qualities.has(body.quality)) return "Kualitas gambar tidak valid.";
  return null;
}

async function openAIJson(payload) {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || `OpenAI API gagal (${response.status}).`;
    const err = new Error(message);
    err.status = response.status === 429 ? 429 : 502;
    throw err;
  }
  const image = data?.data?.[0]?.b64_json;
  if (!image) throw new Error("OpenAI tidak mengembalikan data gambar.");
  return image;
}

module.exports = { MODEL, sendJson, authorize, parseBody, validate, openAIJson };
