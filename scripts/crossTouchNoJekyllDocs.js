const fs = require("fs");
const path = require("path");

try {
  fs.writeFileSync(path.join(process.env.INIT_CWD, "docs", ".nojekyll"));
} catch (e) {
  console.error(e.message);
}
